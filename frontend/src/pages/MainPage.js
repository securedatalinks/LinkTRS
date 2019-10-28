import React, { Component } from "react";
import AppBar from "../components/AppBar";
import Table from "../components/Table"
import Grid from '@material-ui/core/Grid'

class MainPage extends Component {

    render() {
        return (
            <div style={{marginBottom: 0, paddingBottom: 0}}>
                <AppBar/>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Table/>
                  </Grid>
                </Grid>
            </div>
        )
    }
}

export default MainPage;
