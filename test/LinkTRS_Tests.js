'use strict'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const h = require('chainlink-test-helpers')

contract('LinkTRS', accounts => {
  const LinkToken = artifacts.require('LinkToken.sol')
  const LinkTRS = artifacts.require('LinkTRS.sol')
  const DemoAggregator = artifacts.require("DemoAggregator.sol")
  const acc1 = accounts[0]
  const acc2 = accounts[1]


  // Represents 1 LINK for testnet requests
  const payment = web3.utils.toWei('1')

  let link, aggregator, linkTRS

  beforeEach(async () => {
    link = await LinkToken.new()
    aggregator = await DemoAggregator.new()
    linkTRS = await LinkTRS.new(link.address, aggregator.address, { from: acc1 })
  })

  describe('#createContract', () => {

    context('with LINK', () => {
      beforeEach(async () => {
        //await link.transfer(cc.address, web3.utils.toWei('1', 'ether'))
      })
      it('succeeds when all parameters are passed in', async () => {
        await linkTRS.createContract(
          5,
          1500,
          { from: acc1 },
        )
        assert.equal(true, true)
      })
    })
  })
})
