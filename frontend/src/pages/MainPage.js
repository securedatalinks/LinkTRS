import React, { Component } from "react";
import AppBar from "../components/AppBar";
import ContractsTable from "../components/ContractsTable"
import Grid from '@material-ui/core/Grid'
import linkTRS from "../contracts/LinkTRS";
import contract_config from "../contract_config.json";

const test = {
  id: 0,
  originalPrice: 10000,
  startDate: 1572333037,
  expiryDate: 1572433037,
  interestRate: 1000,
  originalValue: 500000,
}

class MainPage extends Component {
    state = {
        data: [],
    }

    componentDidMount = async () => {
      //get contracts data
      //this.getContracts();
      var listings = [];
      listings.push(test)
      await this.setState({ data: listings })
      console.log(this.state.data)
    }

    getContracts= async() => {
        var web3 = this.props.web3;
        var contract = new web3.eth.Contract(linkTRS.abi, contract_config.linkTRS_dev);
        var listings = [];

        await contract.methods.contractCounter().call().then((contractCounter) => {
            console.log(contractCounter)
            for (var i = 0; i < contractCounter; i++) {
              contract.methods.getContractByIndex(i).call((err, res) => {
                var thisData = {
                    id: i,
                    originalPrice: res[2],
                    startDate: res[3],
                    expiryDate: res[4],
                    interestRate: res[5],
                    originalValue: res[6],
                }
                listings.push(thisData)
              });
            }
        })
        console.log(listings)
        this.setState({data: listings})
    }

    render() {
        return (
            <div style={{marginBottom: 0, paddingBottom: 0, height:'80vh'}}>
                <AppBar/>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <ContractsTable data={this.state.data} web3={this.props.web3} />
                  </Grid>
                </Grid>
            </div>
        )
    }
}

export default MainPage;
