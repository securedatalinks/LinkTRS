pragma solidity 0.4.24;

import "chainlink/contracts/interfaces/AggregatorInterface.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract LinkTRS is Ownable {
    
    //Struct for a user account
    struct account {
        address owner;
        bytes32[] contracts;
        uint256 deposited; //total LINK deposited
        uint256 inContracts; //total LINK locked up in contracts

    }

    //Struct for a contract
    struct trsContract {
        bytes32 id;
        address takerAddress;
        address makerAddress;
        int256 originalPrice;
        uint256 expiryDate;
        uint16 interest;
    }

    event ContractCreated(bytes32 contractID);

    AggregatorInterface internal reference;
    mapping(address => account) users;
    mapping (bytes32 => trsContract) contracts;
    uint256 contractCounter;

    constructor(address _linkToken, address _aggregator) public {
        reference = AggregatorInterface(_aggregator);
    }

    /**
    * Gets the latest price from the reference data contract
    */
    function getLatestPrice() public view returns (int256) {
        return reference.currentAnswer();
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

    function createContract(uint256 length, uint16 interest) public {
        int256 price = getLatestPrice();
        bytes32 contractID = keccak256(contractCounter);
        uint256 expiryDate = now + length * 1 days;
        trsContract memory _contract = trsContract(contractID, address(0), msg.sender, price, expiryDate, interest);
        contracts[contractID] = _contract;
        emit ContractCreated(contractID);
    }

}