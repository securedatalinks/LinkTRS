import React, { Component } from "react";
import TextField from '@material-ui/core/TextField';
import { FormControl, Paper, Button, Typography } from '@material-ui/core';
import LinearProgress from '@material-ui/core/LinearProgress';
import AppBar from "../../components/AppBar";
import InputAdornment from '@material-ui/core/InputAdornment';
import { validateForm } from './validator';
import linkTRS from "../../contracts/LinkTRS";
import contract_config from "../../contract_config.json";

const progressPerStep = 33.333; //Define how much as a % each step changes the users progess

class CreateContractForm extends Component {

    state = {
        //TODO add in all required submissions users will need to make
        wireframe: "",
        accMargin: "",
        term: "",
        minMargin: "",
        totalLink: "",
        assetVal: "",
        interestPercent: "",
        step: 1,
        totalSteps: 4,
        progress: 33.333,
        errors: {
            errorsObj: {},
            hasError: false
        },
    };

    componentDidMount = async () => {
    }

    onwireframeChange = (event) => {
        this.setState({ wireframe: event.target.value })
    }

    onInterestChange = (event) => {
        this.setState({ interestPercent: event.target.value })
    }

    onAccMarginChange = (event) => {
        this.setState({ accMargin: event.target.value })
    }

    onTermChange = (event) => {
        this.setState({ term: event.target.value })
    }

    onminMarginChange = (event) => {
        this.setState({ minMargin: event.target.value })
    }

    onLinkChange = (event) => {
        //get eth conversion
        this.setState({ totalLink: event.target.value })
    }

    onAssetlValChange = (event) => {
        //get eth val
        this.setState({ assetVal: event.target.value })
    }


    pageForward = () => {
        const { wireframe, accMargin, term, minMargin, notionalVal, assetVal, interestPercent, totalLink } = this.state
        const { errors } = this.state

        var currentStep = this.state.step
        var currentProgress = this.state.progress
        let err = validateForm('all', {
            wireframe, accMargin, term, minMargin, notionalVal, assetVal, interestPercent, totalLink
        })

        this.setState({
            errors: err
        })



        if (!err.hasError) {
            this.setState({
                errors: err,
                btn: true
            })
            this.setState({ step: currentStep + 1, progress: currentProgress + progressPerStep })
        }
    }

    pageBackward = () => {
        var currentStep = this.state.step
        var currentProgress = this.state.progress
        this.setState({ step: currentStep - 1, progress: currentProgress - progressPerStep })
    }

    completeForm = async () => {
        //Construct the data from current state
        // var data = {
        //     "wireframe" : this.state.wireframe,
        //     "accMargin" : this.state.accMargin,
        //     "term": this.state.term,
        //     "minMargin": this.state.minMargin,
        //     "notionalVal": this.state.notionalVal,
        //     "assetVal": this.state.assetVal,
        // }
        /*registerOracle(data, this.props.token, () => {
            alert("Oracle Sucessfully Registered")
            this.props.history.push("/")
        }, (error) => {
            alert("Failure: " + error)
        })*/

        var web3 = this.props.web3;
        var contract = new web3.eth.Contract(linkTRS.abi, contract_config.linkTRS_dev);
        var account = (await this.props.web3.eth.getAccounts())[0]
        
        //Get all fields in correct format
        var multipliedInterest = this.state.interestPercent * 1000
        var multipliedMinMargin = this.state.minMargin * 1000
        alert(multipliedInterest)
        alert(multipliedMinMargin)
        // call create contract function //todo add in ability to set contract expiry time
        contract.methods.createContract(10, this.state.term, multipliedInterest, multipliedMinMargin, this.state.totalLink).send({ from: account })
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

    getButtons = () => {
        if (this.state.step === 1) {
            return (
                <Button variant="contained" color="primary" onClick={this.pageForward} style={{ margin: "5px" }}>
                    Next
                </Button>
            )
        } else {
            return (
                <div>
                    <Button variant="contained" color="primary" onClick={this.pageBackward} style={{ margin: "5px" }}>
                        Back
                    </Button>
                    <Button variant="contained" color="primary" onClick={this.completeForm} style={{ margin: "5px" }}>
                        Submit
                    </Button>
                </div>
            )
        }
    }

    displayForm = () => {
        //Return what will be displayed on first form
        const { errors } = this.state
        const { errorsObj } = errors
        if (this.state.step === 1) {
            return (
                <div>
                    <Typography variant="h4"> Contract Details </Typography>
                    {/* <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="wireframe"
                        label="Wire Frame (minutes for acceptance validity)"
                        name="wireframe"
                        error={errorsObj && errorsObj['wireframe'] ? true : false}
                        autoFocus
                        onChange={this.onwireframeChange}
                        value={this.state.wireframe}
                        style={this.textFieldStyle}
                    /> */}
                    {/* <TextField
                        variant="outlined"
                        margin="normal"
                        type="number"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        placeholder="%"
                        required
                        fullWidth
                        id="accMargin"
                        label="Acceptance Margin"
                        name="accMargin"
                        error={errorsObj && errorsObj['accMargin'] ? true : false}
                        autoFocus
                        onChange={this.onAccMarginChange}
                        value={this.state.accMargin}
                        style={this.textFieldStyle}
                    /> */}
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="term"
                        label="Term of Agreement (Days)"
                        name="term"
                        error={errorsObj && errorsObj['term'] ? true : false}
                        autoFocus
                        onChange={this.onTermChange}
                        value={this.state.term}
                        style={this.textFieldStyle}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        type="number"
                        required
                        fullWidth
                        id="minMargin"
                        label="Minimum Margin Required"
                        name="minMargin"
                        placeholder="%"
                        error={errorsObj && errorsObj['minMargin'] ? true : false}
                        autoFocus
                        onChange={this.onminMarginChange}
                        value={this.state.minMargin}
                        style={this.textFieldStyle}
                    />
                                        <TextField
                        variant="outlined"
                        margin="normal"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        type="number"
                        required
                        fullWidth
                        id="interestPercent"
                        label="Interest Percentage"
                        name="interestPercent"
                        placeholder="%"
                        error={errorsObj && errorsObj['interestPercent'] ? true : false}
                        autoFocus
                        onChange={this.onInterestChange}
                        value={this.state.interestPercent}
                        style={this.textFieldStyle}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="totalLink"
                        label="LINK covered by contract"
                        name="totalLink"
                        error={errorsObj && errorsObj['totalLink'] ? true : false}
                        autoFocus
                        onChange={this.onLinkChange}
                        value={this.state.totalLink}
                        style={this.textFieldStyle}
                    />
                    {/* <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="assetVal"
                        label="Total Asset Value"
                        name="assetVal"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        error={errorsObj && errorsObj['assetVal'] ? true : false}
                        autoFocus
                        onChange={this.onAssetlValChange}
                        value={this.state.assetVal}
                        style={this.textFieldStyle}
                    /> */}
                </div>
            )
        } else {
            return (
                <div style={{textAlign: "left"}}>
                    <Typography variant="h6"> Review </Typography>
                    <Typography variant="h5"> Contract Details </Typography>
                    {/* <Typography variant="subtitle1"> Wire Frame: {this.state.wireframe} </Typography> */}
                    {/* <Typography variant="subtitle1"> Acceptance Margin: {this.state.accMargin} </Typography> */}
                    <Typography variant="subtitle1"> Term of Contract: {this.state.term} Days </Typography>
                    <Typography variant="subtitle1"> Required Margin: {this.state.minMargin} % </Typography>
                    <Typography variant="subtitle1"> Interest: {this.state.interestPercent} % </Typography>
                    <Typography variant="subtitle1"> Total LINK: {this.state.totalLink} LINK </Typography>
                </div>
            )
        }
    }


    render() {
        return (
          <div>
            <AppBar/>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
                <Paper style={{ margin: "20px", padding: '50px', backgroundColor: "#ffffff", width: "50vw" }}>
                    <LinearProgress variant="determinate" value={this.state.progress} />
                    <Typography variant="h3" color="primary" style={{ margin: '10px' }}> List Contract </Typography>
                    <FormControl>
                        <form>
                          {this.displayForm()}
                        </form>
                        {this.getButtons()}
                    </FormControl>
                </Paper>
            </div>
          </div>
        )
    }
}

export default (CreateContractForm)
