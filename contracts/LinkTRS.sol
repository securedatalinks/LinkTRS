pragma solidity 0.4.24;

import "chainlink/contracts/interfaces/AggregatorInterface.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/Math/SafeMath.sol";

contract LinkTRS is Ownable {
    
    //Struct for a user account
    struct account {
        address owner;
        bytes32[] contracts;
        uint256 numContracts;
        uint256 deposited; //total DAI deposited
        uint256 inContracts; //total DAI locked up in contracts
    }

    struct npvCalcs {
        uint256 date;
        uint256 price;
        uint256 takerMargin;
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
    event npvUpdated(bytes32 contractID);
    event priceChangeEvent(int priceChange);

    AggregatorInterface internal reference;
    mapping(address => account) users;
    mapping (bytes32 => trsContract) contracts;
    mapping (bytes32 => bool) validContracts;
    uint256 contractCounter;

    constructor(address _linkToken, address _aggregator) public {
        reference = AggregatorInterface(_aggregator);
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
        uint256 price = getLatestPrice();
        uint256 scaledPrice = SafeMath.div(price, 1000000); //this converts it to price ($ x 1000) eg $1.24 = 1240
        bytes32 contractID = keccak256(contractCounter);
        uint256 expiryDate = now + length * 1 days;
        //uint256 value = SafeMath.div(SafeMath.mul(amountOfLink, price), 1000000);
        uint256 value = SafeMath.mul(amountOfLink, scaledPrice);
        //Create initial npv entry
        npvCalcs memory npvEntry = npvCalcs(now, scaledPrice, 0, 0, 0);

        //Create contract
        contracts[contractID].id = contractID;
        contracts[contractID].takerAddress = address(0);
        contracts[contractID].makerAddress = msg.sender;
        contracts[contractID].originalPrice = scaledPrice;
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

    function getContractInfo(bytes32 _contractID) public view returns (address, address, uint256, uint256, uint256, uint16, uint256) {
        require(validContracts[_contractID], "Please use a valid contract ID");
        trsContract memory _contract = contracts[_contractID];
        return (_contract.takerAddress, _contract.makerAddress, _contract.originalPrice, _contract.startDate,
             _contract.expiryDate, _contract.interest, _contract.originalValue);
    }

    function getContractNPV(bytes32 _contractID, uint i) public view returns (uint256, uint256, uint256, uint256, uint256) {
        npvCalcs memory thisNPV = contracts[_contractID].npvs[i];
        return (thisNPV.date, thisNPV.price, thisNPV.takerMargin, thisNPV.makersMargin, thisNPV.npv);
    }

    /**
    * Function for calculating the NPV at a given point in time for a specific contract.
    * @dev requires the starting state for the NVP array to be intilized (when contract is created)
    */
    function calcNPV(bytes32 _contractId) internal returns (bool) {
        //Calc npv
        uint256 price = getLatestPrice();
        uint256 scaledPrice = SafeMath.div(price, 1000000); //this converts it to price ($ x 1000) eg $1.24 = 1240

        trsContract memory _contract = contracts[_contractId];

        npvCalcs memory lastNPV = contracts[_contractId].npvs[contracts[_contractId].numNPV - 1];
        int256 priceChange = (int256)(scaledPrice - lastNPV.price);
        emit priceChangeEvent(priceChange);
        uint256 absPriceChange = abs(priceChange);
        uint256 timeChange = SafeMath.div(SafeMath.sub(now + 31536000, lastNPV.date), 86400); //for testing pretend a year has past
        uint256 npv = SafeMath.mul(SafeMath.sub(absPriceChange,SafeMath.div(SafeMath.mul(SafeMath.div(365, 365), _contract.interest), 1000)),
            _contract.originalValue);
        //this is to account for the fact that the price is increased this much before being written on chain
        uint256 scaledNpv = SafeMath.div(npv, 100); //This is to account for interest percent being represented as a whole number
        //uint256 scaledNpv = SafeMath.div(npv, 1000); //remove excess from interest being x1000
        //this is to account for the fact that the price is increased this much before being written on chain
        
        // //TODO incoperate margin changes here
        npvCalcs memory thisCalc = npvCalcs(now, scaledPrice, lastNPV.takerMargin, lastNPV.makersMargin, scaledNpv);
        contracts[_contractId].npvs.push(thisCalc);
        contracts[_contractId].numNPV++;

        emit npvUpdated(_contractId);

        // if(priceChange > 0) {
        //     //Price has gone up, transfer from maker margin to taker margin
             
        // } else {
        //     //Price has gone down, transfer from taker margin to maker margin
        //    //return npvCalcs(now, price, lastNPV.takerMargin, lastNPV.makersMargin, npv);
        // }
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
        return;
    }

    function abs(int256 num) public returns (uint256) {
        if (num < 0) {
            return (uint256)(-num);
        } else {
            return (uint256)(num);
        }
    }

}