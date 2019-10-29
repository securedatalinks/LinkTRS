import React, { Component } from "react";
import AppBar from "../components/AppBar";
import token from "../contracts/LinkToken";
import linkTRS from "../contracts/LinkTRS";
import contract_config from "../contract_config.json";
import RemarginLogTable from "../components/RemarginLogTable";
import { Typography, Button } from "@material-ui/core";

class ViewContractPage extends Component {

    state = {
        data: []
    }

    componentDidMount() {
        this.getNPVLogs();
    }
    requestRemargin = async() => {
        var web3 = this.props.web3;
        var tokenContract = new web3.eth.Contract(token.abi, contract_config.link_dev);
        var trsContract = new web3.eth.Contract(linkTRS.abi, contract_config.linkTRS_dev);
        var account = (await this.props.web3.eth.getAccounts())[0]
        console.log(account)
        var contractID = this.props.match.params.contractID
        console.log(contractID)
        var remargin = await trsContract.methods.requestRemargin(contractID).send({from: account})
    }

    getNPVLogs = async () => {
        var web3 = this.props.web3;
        var tokenContract = new web3.eth.Contract(token.abi, contract_config.link_dev);
        var trsContract = new web3.eth.Contract(linkTRS.abi, contract_config.linkTRS_dev);
        var account = (await this.props.web3.eth.getAccounts())[0]
        var contractID = this.props.match.params.contractID
        this.setState({account: account})
        var userDetails = trsContract.methods.getContractInfo(contractID).call(async (err, result) => {
            if (err) {
                console.log(err)
            }

            var npvs = []
            for (var i = 0; i < result[10]; i++) {

                var npv = await trsContract.methods.getContractNPV(contractID, i).call(async (err, _npv) => {
                    console.log(_npv)
                    var _npvProcessesed = {
                        "date": _npv[0],
                        "price": _npv[1],
                        "tm": _npv[2],
                        "mm": _npv[3],
                        "npv": _npv[4]
                    }
                    npvs.push(_npvProcessesed)
                })

            }

            console.log(npvs)
            this.setState({ data: npvs })
            
        })
    }   


    render() {
        return (
            <div style={{marginBottom: 0, paddingBottom: 0, height:'80vh'}}>
                <AppBar />
                <Typography> Contract {this.props.match.params.contractID} </Typography>
                <Button variant="contained" color="primary" onClick={() => {this.requestRemargin()}} style={{ margin: "5px" }}>
                                Remargin
                </Button>
                <RemarginLogTable data={this.state.data} web3={this.props.web3} />
            </div>
        )
    }
}

export default ViewContractPage;