import React, { Component } from "react";
import AppBar from "../components/AppBar";
import ContractsTable from "../components/ContractsTable"
import Grid from '@material-ui/core/Grid'

class MainPage extends Component {

    render() {
        return (
            <div style={{marginBottom: 0, paddingBottom: 0, height:'80vh'}}>
                <AppBar/>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <ContractsTable/>
                  </Grid>
                </Grid>
            </div>
        )
    }
}

export default MainPage;
