'use strict'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const h = require('chainlink-test-helpers')

contract('TestDAI', accounts => {
    const TestDAI = artifacts.require('TestDAI.sol')
    const acc1 = accounts[0]
    const acc2 = accounts[1]

    let testDAI

    beforeEach(async () => {
        testDAI = await TestDAI.new()
    })

    describe('#mint', () => {

        context('Can MINT', () => {
            it('can sucessfully create a contract', async () => {
                var balance = testDAI.balanceOf(acc1)
                await testDAI.mint(acc1, web3.utils.toWei("10"))

                var balanceAfter = await testDAI.balanceOf(acc1)
                assert.equal(balanceAfter, web3.utils.toWei("10"))
            })
        })
    })
})
