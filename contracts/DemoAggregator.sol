
contract DemoAggregator {

    int256 public currentAnswer;
    uint256 public updatedHeight;

    constructor() {
        currentAnswer = 0;
        updatedHeight = 0;
    }
}