import React, { Component } from "react";
import AppBar from "../components/AppBar";
import AccountTable from "../components/AccountTable"
import token from "../contracts/LinkToken";
import contract_config from "../contract_config.json";
import { Button, Typography } from "@material-ui/core";

class MyAccount extends Component {

    state = {
        data: null,
        accountBalance: 0
    }

    componentDidMount() {
        this.getAllowedTokens();
    }

    topUpTokens = async() => {
        var web3 = this.props.web3;
        var contract = new web3.eth.Contract(token.abi, contract_config.link_dev);
        var account = (await this.props.web3.eth.getAccounts())[0]

        // call create contract function
        contract.methods.approve(contract_config.linkTRS_dev, this.props.web3.utils.toWei("30")).send({ from: account })
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

    getAllowedTokens = async() => {
        var web3 = this.props.web3;
        var contract = new web3.eth.Contract(token.abi, contract_config.link_dev);
        var account = (await this.props.web3.eth.getAccounts())[0]

        // call create contract function
        contract.methods.allowance(account, contract_config.linkTRS_dev).call((err, result) => {
            if(err) {
                console.log(err)
            }
            console.log(result)
            this.setState({accountBalance: this.props.web3.utils.fromWei(result)})
        })
    }


    render() {
        return (
            <div style={{marginBottom: 0, paddingBottom: '30px'}}>
                <AppBar/>
                <Typography> Account Balance: {this.state.accountBalance} DAI </Typography>
                <Button variant="contained" color="primary" onClick={this.topUpTokens} style={{ margin: "5px" }}>
                    Top Up Account
                </Button>
            </div>
        )
    }
}

export default MyAccount;