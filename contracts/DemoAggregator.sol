pragma solidity 0.4.24;
import "chainlink/contracts/ChainlinkClient.sol";

contract DemoAggregator is ChainlinkClient{

    uint256 public currentAnswer;
    uint256 public updatedHeight;
    uint256 paymentAmount = 1 * LINK;
    address _oracle = 0xa0BfFBdf2c440D6c76af13c30d9B320F9d2DeA6A;

    constructor(address _link) {
        currentAnswer = 100000000; //Start price of $1.00 1.00 * 100000000 = 100000000
        updatedHeight = 0;
        //requestEthereumPrice();
        if(_link == address(0)) {
            // Useful for deploying to public networks.
            setPublicChainlinkToken();
        } else {
            // Useful if you're deploying to a local network.
            setChainlinkToken(_link);
        }
    }

    /** Functions for Chainlink Requests */
    // Creates a Chainlink request with the uint256 multiplier job and returns the requestId
    function requestEthereumPrice() public  {
        Chainlink.Request memory req = buildChainlinkRequest("5c27f27ab4a8438a99e037006ca71fb1", this, this.fulfillEthereumPrice.selector);
        bytes32 _requestId = sendChainlinkRequestTo(_oracle, req, paymentAmount);
    }

    function fulfillEthereumPrice(bytes32 _requestId, uint256 _price) public recordChainlinkFulfillment(_requestId) {
        currentAnswer = _price;
        updatedHeight = now;
    }

    //TODO Remove after testing
    function increasePrice() public {
        currentAnswer += 10000000;
    }

    function decreasePrice() public {
        currentAnswer -= 10000000;
    }
}