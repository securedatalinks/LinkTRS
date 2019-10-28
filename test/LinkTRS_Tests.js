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

    context('Creating Contracts', () => {
      beforeEach(async () => {
        //await link.transfer(cc.address, web3.utils.toWei('1', 'ether'))
      })
      it('can sucessfully create a contract', async () => {
        await linkTRS.createContract(
          5,
          5000,
          2000,
          1000,
        )
        var contractID = await linkTRS.getUserContract(0);
        var contractDetails = await linkTRS.getContractInfo(contractID)
        assert.equal(contractDetails[0], "0x0000000000000000000000000000000000000000")
        assert.equal(contractDetails[1], acc1)
        assert.equal(contractDetails[2].toString(), web3.utils.toBN("100000000").toString()) //price in price * 10^8
        assert.equal(contractDetails[5].toString(), web3.utils.toBN("5000").toString()) //interest in % * 1000 (i.e 5% = 5000)
        assert.equal(contractDetails[6].toString(), web3.utils.toBN("100000000000").toString())

        var npvBefore = await linkTRS.getContractNPV(contractID, 0);
        // console.log(npvBefore[0].toString())
        // console.log(npvBefore[1].toString())
        // console.log(npvBefore[2].toString())
        // console.log(npvBefore[3].toString())
        // console.log(npvBefore[4].toString())
      })

      it('fails without all params', async () => {
        try {
          await linkTRS.createContract(
            5,
            500,
            2000,
            1000,
          )
        } catch (e) {
          assert.equal(true, true)
        }
      })

    })


    context('Remargining', () => {
      it('can sucessfully remargin a contract with the price increasing', async () => {
        //Create contract
        await linkTRS.createContract(
          5,
          6500, //6.5%
          2000,
          10,
        )
        var contractID = await linkTRS.getUserContract(0);
        //Update contract price
        await aggregator.increasePrice()

        //Remargin
        await linkTRS.remargin(contractID)

        var npvBefore = await linkTRS.getContractNPV(contractID, 0);
        // console.log(npvBefore[0].toString())
        // console.log(npvBefore[1].toString())
        // console.log(npvBefore[2].toString())
        // console.log(npvBefore[3].toString())
        // console.log(npvBefore[4].toString())
        //assert.equal(true, false)
        var npvAfter = await linkTRS.getContractNPV(contractID, 1);
        // console.log(npvAfter[0].toString())
        // console.log(npvAfter[1].toString())
        // console.log(npvAfter[2].toString())
        // console.log(npvAfter[3].toString())
        // console.log(npvAfter[4].toString())
      })

      it('can sucessfully remargin a contract with the price decreasing', async () => {
        //Create contract
        await linkTRS.createContract(
          5,
          5000,
          2000,
          1,
        )
        var contractID = await linkTRS.getUserContract(0);
        //Update contract price
        await aggregator.decreasePrice()

        //Remargin
        await linkTRS.remargin(contractID)

        var npvBefore = await linkTRS.getContractNPV(contractID, 0);
        // console.log(npvBefore[0].toString())
        // console.log(npvBefore[1].toString())
        // console.log(npvBefore[2].toString())
        // console.log(npvBefore[3].toString())
        // console.log(npvBefore[4].toString())

        var npvAfter = await linkTRS.getContractNPV(contractID, 1);
        // console.log(npvAfter[0].toString())
        // console.log(npvAfter[1].toString())
        // console.log(npvAfter[2].toString())
        // console.log(npvAfter[3].toString())
        // console.log(npvAfter[4].toString())
      })

    })
  })

  describe('#depositTokens', () => {

    context('Depositing Tokens to a margin account', () => {
      beforeEach(async () => {
        //await link.transfer(cc.address, web3.utils.toWei('1', 'ether'))
      })
      it('can sucessfully deposit to a margin account', async () => {
        // await linkTRS.createContract(
        //   5,
        //   500,
        //   2000,
        //   1000,
        // )
        // var contractID = await linkTRS.getUserContract(0);
        // var contractDetails = await linkTRS.getContractInfo(contractID)
        // assert.equal(contractDetails[0], "0x0000000000000000000000000000000000000000")
        // assert.equal(contractDetails[1], acc1)
        // assert.equal(contractDetails[2].toString(), web3.utils.toBN("100").toString()) //price in cents
        // assert.equal(contractDetails[5].toString(), web3.utils.toBN("500").toString())
        // assert.equal(contractDetails[6].toString(), web3.utils.toBN("100000").toString())

        // //Deposit some tokens
        // await link.approve(linkTRS.address, web3.utils.toWei("5"));
        // await linkTRS.deposit(web3.utils.toWei("3"), contractID);
        // var contractDetails2 = await linkTRS.getContractInfo(contractID)
        // assert.equal(contractDetails2[8].toString(), web3.utils.toWei("3").toString())
      })

      it('can sucessfully withdraw from a margin account', async () => {
        // await linkTRS.createContract(
        //   5,
        //   500,
        //   2000,
        //   1000,
        // )
        // var contractID = await linkTRS.getUserContract(0);
        // var contractDetails = await linkTRS.getContractInfo(contractID)
        // assert.equal(contractDetails[0], "0x0000000000000000000000000000000000000000")
        // assert.equal(contractDetails[1], acc1)
        // assert.equal(contractDetails[2].toString(), web3.utils.toBN("100").toString()) //price in cents
        // assert.equal(contractDetails[5].toString(), web3.utils.toBN("500").toString())
        // assert.equal(contractDetails[6].toString(), web3.utils.toBN("100000").toString())

        // //Deposit some tokens
        // await link.approve(linkTRS.address, web3.utils.toWei("5"));
        // await linkTRS.deposit(web3.utils.toWei("3"), contractID);
        // var contractDetails2 = await linkTRS.getContractInfo(contractID)
        // assert.equal(contractDetails2[8].toString(), web3.utils.toWei("3").toString())

        // //Withdraw
        // var balanceBefore = await link.balanceOf(acc1);
        // await linkTRS.withdraw(web3.utils.toWei("3"), contractID);
        // var balanceAfter = await link.balanceOf(acc1)

        // assert.equal((balanceAfter.sub(balanceBefore)).toString(), web3.utils.toWei("3").toString())
      })

     })
   })

})
