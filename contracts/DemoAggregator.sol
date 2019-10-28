
contract DemoAggregator {

    uint256 public currentAnswer;
    uint256 public updatedHeight;

    constructor() {
        currentAnswer = 100000000; //Start price of $1.00 1.00 * 100000000 = 100000000
        updatedHeight = 1;
    }

    function increasePrice() public {
        //Increase price by 10%
        currentAnswer += 10000000;
        updatedHeight++;
    }

    function decreasePrice() public {
        //Decrease price by 10%
        currentAnswer -= 10000000;
        updatedHeight++;
    }
}