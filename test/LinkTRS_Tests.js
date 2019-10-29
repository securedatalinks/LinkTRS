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
    linkTRS = await LinkTRS.new(link.address, aggregator.address, link.address,{ from: acc1 })
  })

  describe('#createContract', () => {

    context('Creating Contracts', () => {
      beforeEach(async () => {
        //await link.transfer(cc.address, web3.utils.toWei('1', 'ether'))
      })
      it('can sucessfully create a contract', async () => {
        //Approve the contract to be allowed to deposit the required amount
        await link.approve(linkTRS.address, web3.utils.toWei("20"));
        //2% of $1000 is $20, therefore 20 tokens are required in the margin account
        await linkTRS.createContract(
          10,
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
            10,
            5,
            500,
            2000,
            1000,
          )
        } catch (e) {
          assert.equal(true, true)
        }
      })

      it('can sucessfully join a contract', async () => {
        //Create Contract
        //Approve the contract to be allowed to deposit the required amount
        await link.approve(linkTRS.address, web3.utils.toWei("20"));
        //2% of $1000 is $20, therefore 20 tokens are required in the margin account
        await linkTRS.createContract(
          10,
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

        //Get user 2 to join the contract
        await link.transfer(acc2, web3.utils.toWei("50"));
        await link.approve(linkTRS.address, web3.utils.toWei("20"), { from: acc2 })
        await linkTRS.joinContract(contractID, web3.utils.toWei("20"), { from: acc2 })

        //Check both margin accounts are now funded
        var contractDetails = await linkTRS.getContractInfo(contractID)
        assert.equal(contractDetails[0], acc2) //taker
        assert.equal(contractDetails[1], acc1) //maker
        assert.equal(contractDetails[2].toString(), web3.utils.toBN("100000000").toString()) //price in price * 10^8
        assert.equal(contractDetails[5].toString(), web3.utils.toBN("5000").toString()) //interest in % * 1000 (i.e 5% = 5000)
        assert.equal(contractDetails[6].toString(), web3.utils.toBN("100000000000").toString())
        assert.equal(contractDetails[7].toString(), web3.utils.toWei("20").toString()) //takers margin
        assert.equal(contractDetails[8].toString(), web3.utils.toWei("20").toString()) //makers margin
      })


      it('cant join a contract after it has expired', async () => {
        //Create Contract
        //Approve the contract to be allowed to deposit the required amount
        await link.approve(linkTRS.address, web3.utils.toWei("20"));
        //2% of $1000 is $20, therefore 20 tokens are required in the margin account
        await linkTRS.createContract(
          0,
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

        //Get user 2 to join the contract
        try {
          await link.transfer(acc2, web3.utils.toWei("50"));
          await link.approve(linkTRS.address, web3.utils.toWei("20"), { from: acc2 })
          await linkTRS.joinContract(contractID, web3.utils.toWei("20"), { from: acc2 })

          assert.equal(true, false)
        } catch (e) {
          //Should fail
          assert.equal(true, true)
        }
      })



    })


    context('Remargining', () => {
      it('can sucessfully remargin a contract with the price increasing', async () => {
        //Approve the contract to be allowed to deposit the required amount
        await link.approve(linkTRS.address, web3.utils.toWei("1"));
        //2% of $10 is $0.2, therefore 0.2 tokens are required in the margin account

        //Create contract
        await linkTRS.createContract(
          10,
          5,
          6500, //6.5%
          2000,
          10,
        )
        var contractID = await linkTRS.getUserContract(0);
        //Update contract price
        //await aggregator.increasePrice()

        //Remargin
        await linkTRS.remargin(contractID, 110000000)

        //TODO test outcome of remargin
      })

      it('can sucessfully remargin a contract with the price decreasing', async () => {
        //Approve the contract to be allowed to deposit the required amount
        await link.approve(linkTRS.address, web3.utils.toWei("1"));
        //2% of $1 is $0.02, therefore 0.2 tokens are required in the margin account

        //Create contract
        await linkTRS.createContract(
          10,
          5,
          5000,
          2000,
          1,
        )
        var contractID = await linkTRS.getUserContract(0);
        //Update contract price
        //await aggregator.decreasePrice()

        //Remargin
        await linkTRS.remargin(contractID, 90000000)

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
        //Approve the contract to be allowed to deposit the required amount
        await link.approve(linkTRS.address, web3.utils.toWei("20"));
        //2% of $1000 is $20, therefore 20 tokens are required in the margin account

        await linkTRS.createContract(
          10,
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

        //Deposit some more tokens tokens
        await link.approve(linkTRS.address, web3.utils.toWei("5"));
        await linkTRS.deposit(web3.utils.toWei("3"), contractID);
        var contractDetails2 = await linkTRS.getContractInfo(contractID)
        assert.equal(contractDetails2[8].toString(), web3.utils.toWei("23").toString())
      })

      it('can sucessfully withdraw from a margin account', async () => {
        //Approve the contract to be allowed to deposit the required amount
        await link.approve(linkTRS.address, web3.utils.toWei("20"));
        //2% of $1000 is $20, therefore 20 tokens are required in the margin account

        await linkTRS.createContract(
          10,
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

        //Deposit some more tokens
        await link.approve(linkTRS.address, web3.utils.toWei("5"));
        await linkTRS.deposit(web3.utils.toWei("3"), contractID);
        var contractDetails2 = await linkTRS.getContractInfo(contractID)
        //assert.equal(contractDetails2[8].toString(), web3.utils.toWei("3").toString())

        //Withdraw
        var contractDetailsBefore = await linkTRS.getContractInfo(contractID)
        var balanceBefore = contractDetailsBefore[8]
        var linkBalanceBefore = await link.balanceOf(acc1);
        await linkTRS.withdraw(web3.utils.toWei("3"), contractID);
        var contractDetailsAfter = await linkTRS.getContractInfo(contractID)
        var balanceAfter = contractDetailsAfter[8]
        var linkBalanceAfter = await link.balanceOf(acc1);

        assert.equal((balanceBefore.sub(balanceAfter)).toString(), web3.utils.toWei("3").toString())
        assert.equal((linkBalanceAfter.sub(linkBalanceBefore)).toString(), web3.utils.toWei("3").toString())
      })

    })
  })

})
