pragma solidity 0.4.24;

import "chainlink/contracts/interfaces/AggregatorInterface.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
// import "openzeppelin-solidity/contracts/Math/SafeMath.sol";
import "chainlink/contracts/ChainlinkClient.sol";

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

contract LinkTRS is Ownable, ChainlinkClient {
    address _oracle = 0xa0BfFBdf2c440D6c76af13c30d9B320F9d2DeA6A;
    uint256 paymentAmount = 1 * LINK;

    //Struct for a user account
    struct account {
        address owner;
        //bytes32[] contracts;
        mapping(uint256 => bytes32) contracts;
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
        uint256 offerExpiryDate;
        uint256 amountOfLink;
        bool active;
        npvCalcs[] npvs;
    }

    event ContractCreated(bytes32 contractID);
    event Liquidate(bytes32 _contractID, address partyToLiquidate);
    event Deposit(bytes32 _contractID, uint amount);
    event PriceFufilled(bytes32 _contractID, uint price);

    AggregatorInterface internal aggregatorContract;
    mapping(address => account) users;
    mapping (bytes32 => trsContract) contracts;
    mapping (bytes32 => bool) validContracts;
    mapping (bytes32 => bytes32) requestToContract;
    uint256 public contractCounter;
    IERC20 token;

    constructor(address tokenAddress, address _aggregator, address _link) public {
        aggregatorContract = AggregatorInterface(_aggregator);
        token = IERC20(tokenAddress);
        // Set the address for the LINK token for the network.
        if(_link == address(0)) {
            // Useful for deploying to public networks.
            setPublicChainlinkToken();
        } else {
            // Useful if you're deploying to a local network.
            setChainlinkToken(_link);
        }
    }

    /**
    * Gets the latest price from the reference data contract
    */
    function getLatestPrice() public view returns (uint256) {
        return abs(aggregatorContract.currentAnswer());
    }

    /**
    * Gets the last updated block height from the reference data contract
    */
    function getLatestUpdateHeight() public view returns (uint256) {
        return aggregatorContract.updatedHeight();
    }

    /**
    * Allows users to deposit LINK to the contract
    */
    function onTokenTransfer(address from, uint256 amount, bytes data) public returns (bool success) {
        users[from].deposited += amount;
    }

    function createContract(uint256 timeToLive, uint256 length, uint16 interest, uint16 requiredMargin,
        uint256 amountOfLink, uint256 marginToProvide) public returns (bytes32) {

        //Pull required info
        uint256 price = getLatestPrice(); //price (x 10^9)
        bytes32 contractID = keccak256(contractCounter);
        uint256 offerExpiryDate = now + timeToLive * 1 minutes;
        uint256 expiryDate = offerExpiryDate + length * 1 days;
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
        contracts[contractID].offerExpiryDate = offerExpiryDate;
        contracts[contractID].npvs.push(npvEntry);
        contracts[contractID].amountOfLink = amountOfLink;
        contracts[contractID].active = false;
        validContracts[contractID] = true;
        contractCounter++;

        //Update user info
        // users[msg.sender].contracts.push(contractID);
        // users[msg.sender].numContracts++;
        users[msg.sender].contracts[users[msg.sender].numContracts] = contractID;
        users[msg.sender].numContracts++;

        //Deposit into makers margin account. Mul by 10000000000 to convert to tokens amount (10^18)
        uint tokensToDeposit = SafeMath.mul(SafeMath.div(SafeMath.mul(SafeMath.mul(amountOfLink, price), requiredMargin), 100000), 10000000000);
        //Check they are depositing more than the margin
        require(marginToProvide >= tokensToDeposit, "You have not provided enough tokens as margin");
        deposit(marginToProvide, contractID);

        emit ContractCreated(contractID);
        return contractID;
    }

    function joinContract(bytes32 _contractID, uint256 tokensToDeposit) public returns(bool) {
        require(validContracts[_contractID], "Please use a valid contract ID");
        require(now <= contracts[_contractID].offerExpiryDate, "You can only accept a currently valid offer");
        //Require the user to transfer the required margin
        require(token.allowance(msg.sender, address(this)) >= tokensToDeposit, "You have not provided access to enough tokens");
        //Deposit into makers margin account. Mul by 10000000000 to convert to tokens amount (10^18)
        contracts[_contractID].takerAddress = msg.sender;
        contracts[_contractID].active = true;
        deposit(tokensToDeposit, _contractID);
        return true;
    }

    function getUserContract(uint i) public view returns(bytes32) {
        return users[msg.sender].contracts[i];
    }

    function getContractByIndex(uint index) public view returns (address, address, uint256, uint256, uint256, 
    uint16, uint256, uint256, uint256, uint256, uint256) {
        return getContractInfo(keccak256(index));
    }

    function getContractID(uint index) public view returns (bytes32) {
        return keccak256(index);
    }

    function getContractInfo(bytes32 _contractID) public view returns (address, address, uint256, uint256, uint256, 
    uint16, uint256, uint256, uint256, uint256, uint256) {
        require(validContracts[_contractID], "Please use a valid contract ID");
        trsContract memory _contract = contracts[_contractID];
        return (_contract.takerAddress, _contract.makerAddress, _contract.originalPrice, _contract.startDate,
             _contract.expiryDate, _contract.interest, _contract.amountOfLink, _contract.takersMargin, _contract.makersMargin,
             _contract.requiredMargin, _contract.numNPV);
    }

    function isActive(bytes32 _contractID) public view returns (bool) {
        require(validContracts[_contractID], "Please use a valid contract ID");
        return(contracts[_contractID].active);
    }

    function getContractExpiryTime(bytes32 _contractID) public view returns (uint256) {
        require(validContracts[_contractID], "Please use a valid contract ID");
        return contracts[_contractID].offerExpiryDate;
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

        trsContract memory _contract = contracts[_contractId];
        npvCalcs memory lastNPV = contracts[_contractId].npvs[contracts[_contractId].numNPV - 1];

        int256 priceChange = (int256)(price - lastNPV.price);
        uint256 timeChange = SafeMath.mul(SafeMath.sub(now, lastNPV.date), 100); //for testing pretend a year has past
        //uint timeChange = 3153600000; //seconds * 100
        //Interest is represented as percent x 1000 (i.e 5.5% = 5500)
        uint256 interestPercent = SafeMath.div(SafeMath.mul(SafeMath.div(timeChange, 31536000),
            _contract.interest), 1); //31536000 = seconds in a year
        //At this point, price diff is (price diff) * 10^7 and interest is % * 10^2. Want percent as a decimal * 10^7 (i.e % in 10^)
        //eg (5.5% should be 0.05500 * 10^7 = 5500 * 10^2)
        //emit TestEmit(interestPercent, absPriceChange);
        uint256 npv = SafeMath.mul(SafeMath.sub(abs(priceChange),interestPercent),
            _contract.originalValue);
        //this is to account for the fact that the price is increased this much before being written on chain
        uint256 scaledNpv = SafeMath.div(npv, 100000000); //remove excess from interest being x1000

        //emit npvUpdated(_contractId);

        //TODO Calc amount of tokens to transfer
        return makeNPVTransfers(_contractId, priceChange, npv, scaledNpv, price);
    }

    function makeNPVTransfers(bytes32 _contractId, int256 priceChange, uint256 npv, uint256 scaledNpv, uint256 price) internal returns (bool) {
        trsContract memory _contract = contracts[_contractId];
        //npv is excess to pay in $x.xx * 10^8.
        uint amountOfTokens = SafeMath.mul(SafeMath.div(SafeMath.div(SafeMath.mul(npv,1000),price), 1000), 10000000000);
        uint minRequiredMargin = SafeMath.mul(SafeMath.div(SafeMath.mul(SafeMath.mul(_contract.amountOfLink,
            _contract.npvs[_contract.numNPV - 1].price), _contract.requiredMargin), 100000), 10000000000);
        if(priceChange > 0) {
            //Price has gone up, transfer from maker margin to taker margin
            if (_contract.makersMargin < amountOfTokens) {
                return liquidate(_contractId, true);
            }
            //TODO Move tokens between margin accounts
            contracts[_contractId].takersMargin = SafeMath.add(_contract.takersMargin, amountOfTokens);
            contracts[_contractId].makersMargin = SafeMath.sub(_contract.makersMargin, amountOfTokens);
            if (contracts[_contractId].makersMargin < minRequiredMargin) {
                contracts[_contractId].active = false;
            }
        } else {
            //Price has gone down, transfer from taker margin to maker margin
            if (_contract.takersMargin < amountOfTokens) {
                return liquidate(_contractId, false);
            }
            //TODO move tokens between margin accounts
            contracts[_contractId].takersMargin = SafeMath.sub(_contract.takersMargin, amountOfTokens);
            contracts[_contractId].makersMargin = SafeMath.add(_contract.makersMargin, amountOfTokens);
            if (contracts[_contractId].takersMargin < minRequiredMargin) {
                contracts[_contractId].active = false;
            }
        }

        // //TODO incoperate margin changes here
        npvCalcs memory thisCalc = npvCalcs(now, price, contracts[_contractId].takersMargin, contracts[_contractId].makersMargin, scaledNpv);
        contracts[_contractId].npvs.push(thisCalc);
        contracts[_contractId].numNPV++;
    }

    /**
    * Function for recalculating contract terms and the margin accounts for a set contract
    */
    function remargin(bytes32 _contractId) public returns(bool) {
        require(validContracts[_contractId], "You can only remargin a valid contract");
        require(contracts[_contractId].active, "You can only remargin a active contract");
        calcNPV(_contractId);
        return true;
    }

    /**
    * Function for liquidating a contract
    */
    function liquidate(bytes32 _contractId, bool maker) public returns(bool) {
        //TODO
        if (maker) {
            //Liquidate the maker
            contracts[_contractId].takersMargin = SafeMath.add(contracts[_contractId].takersMargin,
                contracts[_contractId].makersMargin);
            contracts[_contractId].makersMargin = 0;
            emit Liquidate(_contractId, contracts[_contractId].makerAddress);
        } else {
            //Liquidate the taker
            contracts[_contractId].makersMargin = SafeMath.add(contracts[_contractId].makersMargin,
                contracts[_contractId].takersMargin);
            contracts[_contractId].takersMargin = 0;
            emit Liquidate(_contractId, contracts[_contractId].takerAddress);
        }
        contracts[_contractId].active = false;
        return true;
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
        //emit AttemptTransfer(msg.sender, address(this), value);
        require(token.transferFrom(msg.sender, address(this), value), "Token transfer must succeed");
        trsContract memory _contract = contracts[_contractID];
        if (msg.sender == _contract.takerAddress) {
            contracts[_contractID].takersMargin = SafeMath.add(contracts[_contractID].takersMargin, value);
        } else {
            contracts[_contractID].makersMargin = SafeMath.add(contracts[_contractID].makersMargin, value);
        }
        users[msg.sender].deposited = SafeMath.add(users[msg.sender].deposited, value);
        emit Deposit(_contractID, value);
        return true;
    }

    function withdraw(uint value, bytes32 _contractID) public returns(bool) {
        require(validContracts[_contractID], "Please use a valid contract ID");
        trsContract memory _contract = contracts[_contractID];
        uint minRequiredMargin = SafeMath.mul(SafeMath.div(SafeMath.mul(SafeMath.mul(_contract.amountOfLink,
            _contract.npvs[_contract.numNPV - 1].price), _contract.requiredMargin), 100000), 10000000000);

        if (msg.sender == _contract.takerAddress) {
            require(contracts[_contractID].takersMargin >= value, "You can only withdraw an amount you have deposited");
            require(contracts[_contractID].takersMargin - value >= minRequiredMargin, "You cannot withdraw below the margin");
            //TODO two party vote to withdraw
            require(token.transfer(msg.sender, value), "Token transfer must succeed");
            //Decrement amount
            users[msg.sender].deposited = SafeMath.sub(users[msg.sender].deposited, value);
            contracts[_contractID].takersMargin = SafeMath.sub(contracts[_contractID].takersMargin, value);
        } else if (msg.sender == _contract.makerAddress) {
            require(contracts[_contractID].makersMargin >= value, "You can only withdraw an amount you have deposited");
            require(contracts[_contractID].makersMargin - value >= minRequiredMargin, "You cannot withdraw below the margin");
            //TODO two party vote to withdraw
            require(token.transfer(msg.sender, value), "Token transfer must succeed");
            //Decrement amount
            users[msg.sender].deposited = SafeMath.sub(users[msg.sender].deposited, value);
            contracts[_contractID].makersMargin = SafeMath.sub(contracts[_contractID].makersMargin, value);
        }
    }

    function getUserDetails(address _user) public returns(uint256, uint256) {
        account user = users[_user];
        return (user.numContracts, user.deposited);
    }

}