import React, { Component } from "react";
import TextField from '@material-ui/core/TextField';
import { FormControl, Paper, Button, Typography } from '@material-ui/core';
import LinearProgress from '@material-ui/core/LinearProgress';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

const progressPerStep = 33.333; //Define how much as a % each step changes the users progess

class CreateContractForm extends Component {

    state = {
        //TODO add in all required submissions users will need to make
        wireframe: 0,
        accMargin: "",
        term: "",
        minMargin: "",
        name: "",
        website: "",
        contactEmail: "",
        location: "",
        oracleContractAddress: "",
        description: "",
        node_hosting: "None",
        eth_node_hosting: "None",
        step: 1,
        totalSteps: 4,
        progress: 33.333,
        errors: {
            errorsObj: {},
            hasError: false
        },
    };


    render() {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
                <Paper style={{ margin: "20px", padding: '50px', backgroundColor: "#ffffff", width: "50vw" }}>
                    <LinearProgress variant="determinate" value={this.state.progress} />
                    <Typography variant="h3" color="primary" style={{ margin: '10px' }}> Register </Typography>
                    <FormControl>
                        <form>

                        </form>

                    </FormControl>
                </Paper>
            </div>
        )
    }
}

export default (CreateContractForm)
