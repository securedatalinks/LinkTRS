import React, { Component } from "react";
import AppBar from "../components/AppBar";
import AccountTable from "../components/AccountTable"
import token from "../contracts/LinkToken";
import linkTRS from "../contracts/LinkTRS";
import contract_config from "../contract_config.json";
import { Button, Typography } from "@material-ui/core";
import MyAccountDisplay from "../components/MyAccountDisplay";

class MyAccount extends Component {

    state = {
        data: [],
        accountBalance: 0,
        account: null,
        daiInContracts: 0,
    }

    componentDidMount() {
        this.getAllowedTokens();
        this.getContracts();
    }

    getPosition = (address, data) => {
        if (data[0] == address) {
            return "Taker"
        } else {
            return "Maker"
        }
    }

    getCounterparty = (address, data) => {
        if (data[0] == address) {
            return data[1]
        } else {
            return data[0]
        }
    }
    getContracts = async () => {
        var web3 = this.props.web3;
        var tokenContract = new web3.eth.Contract(token.abi, contract_config.link_dev);
        var trsContract = new web3.eth.Contract(linkTRS.abi, contract_config.linkTRS_dev);
        var account = (await this.props.web3.eth.getAccounts())[0]
        this.setState({account: account})
        var userDetails = trsContract.methods.getUserDetails(account).call(async (err, result) => {
            if (err) {
                console.log(err)
            }

            console.log(result[0])
            this.setState({daiInContracts: result[1]})
            var contractAddresses = []
            var contractsData = []
            for (var i = 0; i < result[0]; i++) {

                var contractAddress = await trsContract.methods.getUserContract(i).call(async (err, _contract) => {
                    console.log(_contract)
                    // return await trsContract.methods.getContractInfo(_contract).call((err, contractData) => {
                    //     console.log(contractData)
                    //     var thisData = {
                    //         position: this.getPosition(account, contractData),
                    //         takerAddress: contractData[0],
                    //         makerAddress: contractData[1],
                    //         startDate: contractData[3],
                    //         expiryDate: contractData[4],
                    //         interestRate: contractData[5],
                    //         mm: contractData[7],
                    //         tm: contractData[8]
                    //     }
                    //     //contracts.push(thisData)
                    //     return thisData
                    // })
                })

                contractAddresses.push(contractAddress)
            }

            for (var i = 0; i < contractAddresses.length; i++) {
                var contractData = await trsContract.methods.getContractInfo(contractAddresses[i]).call((err, contractData) => {
                    console.log(contractData)
                })
                var thisData = {
                    position: this.getPosition(account, contractData),
                    counterpartyAddress: this.getCounterparty(account, contractData),
                    startDate: contractData[3],
                    expiryDate: contractData[4],
                    interestRate: contractData[5],
                    mm: contractData[7],
                    tm: contractData[8]
                }

                contractsData.push(thisData)
            }
            console.log(contractsData)
            this.setState({ data: contractsData })
            
        })
    }   

    topUpTokens = async (amountToTopup) => {
        var web3 = this.props.web3;
        var contract = new web3.eth.Contract(token.abi, contract_config.link_dev);
        var account = (await this.props.web3.eth.getAccounts())[0]

        // call create contract function
        contract.methods.approve(contract_config.linkTRS_dev, this.props.web3.utils.toWei(amountToTopup)).send({ from: account })
            .on('transactionHash', (hash) => {
                //Set Status as pending and wait for this transaction to be processed
                console.log(hash);
                web3.eth.getTransaction(hash, (err, result) => {
                    if (err) {
                        console.log(err)
                    }
                    console.log(result)
                })
            });
    }

    getAllowedTokens = async () => {
        var web3 = this.props.web3;
        var contract = new web3.eth.Contract(token.abi, contract_config.link_dev);
        var account = (await this.props.web3.eth.getAccounts())[0]

        // call create contract function
        contract.methods.allowance(account, contract_config.linkTRS_dev).call((err, result) => {
            if (err) {
                console.log(err)
            }
            console.log(result)
            this.setState({ accountBalance: this.props.web3.utils.fromWei(result) })
        })
    }

    render() {
        return (
            <div style={{marginBottom: 0, paddingBottom: 0, height:'80vh'}}>
                <AppBar />
                <MyAccountDisplay account={this.state.account} openContracts={this.state.data.length} 
                    deposited={this.props.web3.utils.fromWei(this.state.daiInContracts.toString())} daiBalance={this.state.accountBalance}
                topUpTokens={this.topUpTokens} />
                <AccountTable data={this.state.data} web3={this.props.web3} />
            </div>
        )
    }
}

export default MyAccount;