pragma solidity 0.4.24;

import "chainlink/contracts/interfaces/AggregatorInterface.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/Math/SafeMath.sol";

/**
 * @dev Interface of the ERC20 standard as defined in the EIP. Does not include
 * the optional functions; to access them see {ERC20Detailed}.
 */
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract LinkTRS is Ownable {
    
    //Struct for a user account
    struct account {
        address owner;
        bytes32[] contracts;
        uint256 numContracts;
        uint256 deposited; //total cDAI deposited
    }

    struct npvCalcs {
        uint256 date;
        uint256 price;
        uint256 takersMargin;
        uint256 makersMargin;
        uint256 npv; //change in npv
    }

    //Struct for a contract
    struct trsContract {
        bytes32 id;
        address takerAddress;
        address makerAddress;
        uint256 originalPrice;
        uint256 expiryDate;
        uint256 startDate;
        uint16 interest;
        uint16 requiredMargin;
        uint256 originalValue;
        uint256 takersMargin;
        uint256 makersMargin;
        uint32 numNPV;
        npvCalcs[] npvs;
    }

    event ContractCreated(bytes32 contractID);
    event Liquidate(bytes32 _contractID);
    event npvUpdated(bytes32 contractID);
    event priceChangeEvent(int priceChange);
    event AttemptTransfer(address from, address to, uint value);
    event TestEmit(uint interest, uint priceDiff);
    event amountToPay(uint tokens);

    AggregatorInterface internal reference;
    mapping(address => account) users;
    mapping (bytes32 => trsContract) contracts;
    mapping (bytes32 => bool) validContracts;
    uint256 contractCounter;
    IERC20 token;

    constructor(address tokenAddress, address _aggregator) public {
        reference = AggregatorInterface(_aggregator);
        token = IERC20(tokenAddress);
    }

    /**
    * Gets the latest price from the reference data contract
    */
    function getLatestPrice() public view returns (uint256) {
        return abs(reference.currentAnswer());
    }

    /**
    * Gets the last updated block height from the reference data contract
    */
    function getLatestUpdateHeight() public view returns (uint256) {
        return reference.updatedHeight();
    }

    /**
    * Allows users to deposit LINK to the contract
    */
    function onTokenTransfer(address from, uint256 amount, bytes data) public returns (bool success) {
        users[from].deposited += amount;
    }

    function createContract(uint256 length, uint16 interest, uint16 requiredMargin, uint256 amountOfLink) public returns (bytes32) {
        //Pull required info
        uint256 price = getLatestPrice(); //price (x 10^9)
        //uint256 scaledPrice = SafeMath.div(price, 1000000); //this converts it to price ($ x 1000) eg $1.24 = 1240
        bytes32 contractID = keccak256(contractCounter);
        uint256 expiryDate = now + length * 1 days;
        //uint256 value = SafeMath.mul(amountOfLink, scaledPrice);
        uint256 value = SafeMath.mul(amountOfLink, price);
        //Create initial npv entry
        npvCalcs memory npvEntry = npvCalcs(now, price, 0, 0, 0);

        //Create contract
        contracts[contractID].id = contractID;
        contracts[contractID].takerAddress = address(0);
        contracts[contractID].makerAddress = msg.sender;
        contracts[contractID].originalPrice = price;
        contracts[contractID].expiryDate = expiryDate;
        contracts[contractID].startDate = now;
        contracts[contractID].interest = interest;
        contracts[contractID].requiredMargin = requiredMargin;
        contracts[contractID].takersMargin = 0;
        contracts[contractID].makersMargin = 0;
        contracts[contractID].originalValue = value;
        contracts[contractID].numNPV = 1;
        contracts[contractID].npvs.push(npvEntry);
        validContracts[contractID] = true;
        contractCounter++;

        //Update user info
        users[msg.sender].contracts.push(contractID);
        users[msg.sender].numContracts++;

        emit ContractCreated(contractID);
        return contractID;
    }

    function getUserContract(uint i) public view returns(bytes32) {
        return users[msg.sender].contracts[i];
    }

    function getContractInfo(bytes32 _contractID) public view returns (address, address, uint256, uint256, uint256, 
    uint16, uint256, uint256, uint256) {
        require(validContracts[_contractID], "Please use a valid contract ID");
        trsContract memory _contract = contracts[_contractID];
        return (_contract.takerAddress, _contract.makerAddress, _contract.originalPrice, _contract.startDate,
             _contract.expiryDate, _contract.interest, _contract.originalValue, _contract.takersMargin, _contract.makersMargin);
    }

    function getContractNPV(bytes32 _contractID, uint i) public view returns (uint256, uint256, uint256, uint256, uint256) {
        npvCalcs memory thisNPV = contracts[_contractID].npvs[i];
        return (thisNPV.date, thisNPV.price, thisNPV.takersMargin, thisNPV.makersMargin, thisNPV.npv);
    }

    /**
    * Function for calculating the NPV at a given point in time for a specific contract.
    * @dev requires the starting state for the NVP array to be intilized (when contract is created)
    */
    function calcNPV(bytes32 _contractId) internal returns (bool) {
        //Calc npv
        uint256 price = getLatestPrice(); //price * 10^9
        //uint256 scaledPrice = SafeMath.div(price, 1000000); //this converts it to price ($ x 1000) eg $1.24 = 1240

        trsContract memory _contract = contracts[_contractId];

        npvCalcs memory lastNPV = contracts[_contractId].npvs[contracts[_contractId].numNPV - 1];
        int256 priceChange = (int256)(price - lastNPV.price);
        emit priceChangeEvent(priceChange);
        uint256 absPriceChange = abs(priceChange);
        //uint256 timeChange = SafeMath.div(SafeMath.sub(now + 31536000, lastNPV.date), 86400); //for testing pretend a year has past
        //Interest is represented as percent x 1000 (i.e 5.5% = 5500)
        uint256 interestPercent = SafeMath.div(SafeMath.mul(SafeMath.div(36500, 365), _contract.interest), 1);

        //At this point, price diff is (price diff) * 10^7 and interest is % * 10^2. Want percent as a decimal * 10^7 (i.e % in 10^)
        //eg (5.5% should be 0.05500 * 10^7 = 5500 * 10^2)
        emit TestEmit(interestPercent, absPriceChange);
        uint256 npv = SafeMath.mul(SafeMath.sub(absPriceChange,interestPercent),
            _contract.originalValue);
        //this is to account for the fact that the price is increased this much before being written on chain
        uint256 scaledNpv = SafeMath.div(npv, 100000000); //remove excess from interest being x1000
        
        // //TODO incoperate margin changes here
        npvCalcs memory thisCalc = npvCalcs(now, price, lastNPV.takersMargin, lastNPV.makersMargin, scaledNpv);
        contracts[_contractId].npvs.push(thisCalc);
        contracts[_contractId].numNPV++;

        emit npvUpdated(_contractId);

        //TODO Calc amount of tokens to transfer
        //npv is excess to pay in $x.xx * 10^8.
        uint amountOfTokens = SafeMath.mul(SafeMath.div(SafeMath.div(SafeMath.mul(npv,1000),price), 1000), 10000000000);
        //Now to convert to tokens (which are in 10^18), we need to multiply by 10^11 (since we are currently working in 10^9)
        emit amountToPay(amountOfTokens);

        if(priceChange > 0) {
            //Price has gone up, transfer from maker margin to taker margin
            if (_contract.makersMargin < amountOfTokens) {
                liquidate(_contractId);
            }
        } else {
            //Price has gone down, transfer from taker margin to maker margin
            if (_contract.takersMargin < amountOfTokens) {
                liquidate(_contractId);
            }
           //return npvCalcs(now, price, lastNPV.takersMargin, lastNPV.makersMargin, npv);
        }
    }

    /**
    * Function for recalculating contract terms and the margin accounts for a set contract
    */
    function remargin(bytes32 _contractId) public returns(bool) {
        require(validContracts[_contractId], "You can only remargin a valid contract");
        calcNPV(_contractId);
        return true;
    }

    /**
    * Function for liquidating a contract
    */
    function liquidate(bytes32 _contractId) public {
        emit Liquidate(_contractId);
        return;
    }

    function abs(int256 num) public returns (uint256) {
        if (num < 0) {
            return (uint256)(-num);
        } else {
            return (uint256)(num);
        }
    }

    /**
    * Allows a user to deposit tokens onto the platform
    */
    function deposit(uint value, bytes32 _contractID) public returns (bool) {
        require(validContracts[_contractID], "Please use a valid contract ID");
        emit AttemptTransfer(msg.sender, address(this), value);
        require(token.transferFrom(msg.sender, address(this), value), "Token transfer must succeed");
        trsContract memory _contract = contracts[_contractID];
        if (msg.sender == _contract.takerAddress) {
            contracts[_contractID].takersMargin = SafeMath.add(contracts[_contractID].takersMargin, value);
        } else {
            contracts[_contractID].makersMargin = SafeMath.add(contracts[_contractID].makersMargin, value);
        }
        users[msg.sender].deposited = SafeMath.add(users[msg.sender].deposited, value);
        return true;
    }

    function withdraw(uint value, bytes32 _contractID) public returns(bool) {
        require(validContracts[_contractID], "Please use a valid contract ID");
        trsContract memory _contract = contracts[_contractID];
        if (msg.sender == _contract.takerAddress) {
            require(contracts[_contractID].takersMargin >= value, "You can only withdraw an amount you have deposited");
        } else {
            require(contracts[_contractID].makersMargin >= value, "You can only withdraw an amount you have deposited");
        }
        //TODO two party vote to withdraw
        require(token.transfer(msg.sender, value), "Token transfer must succeed");
    }

}