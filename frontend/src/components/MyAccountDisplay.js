import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import "../css/AccountsTable.css";
import { Button, Typography } from "@material-ui/core";
import { AutoComplete } from 'material-ui';
import TextField from '@material-ui/core/TextField';


class MyAccountDisplay extends Component {

    state = {
        amount: ""
    }

    onAmountChange = (event) => {
        this.setState({amount: event.target.value})
    }

    render() {
        return (
            <div>
                <Paper style={{
                    width: '50%', marginLeft: 'auto', marginRight: 'auto', marginTop: '30px', marginBottom: '30px',
                    paddingBottom: '10px', paddingTop: '10px',
                }}>
                    <div style={{ flexDirection: 'column', display: 'flex', alignItems: 'flex-start', marginLeft: '10px', marginBottom: '15px'}}>
                        <Typography> Account: {this.props.account} </Typography>
                    </div>
                    <div style={{ flexDirection: 'column', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography> Open Contracts: {this.props.openContracts} </Typography>
                        <Typography> DAI in Contracts: {this.props.deposited} </Typography>
                        <Typography> DAI available: {this.props.daiBalance} </Typography>
                        <div class="row" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                id="amount"
                                label="Amount to Top Up"
                                name="amount"
                                autoFocus
                                onChange={this.onAmountChange}
                                value={this.state.amount}
                                style={this.textFieldStyle}
                            />
                            <Button variant="contained" color="primary" onClick={() => {
                                this.props.topUpTokens(this.state.amount)}} style={{ margin: "5px" }}>
                                Top Up Account
                                </Button>
                        </div>
                    </div>
                </Paper>
            </div>
        );
    }
}
export default MyAccountDisplay; 