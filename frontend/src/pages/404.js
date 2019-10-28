import React, { Component } from "react";
import AppBar from "../components/AppBar";
import { Typography } from "@material-ui/core";

class NotFoundPage extends Component {


    render() {
        return (
            <div style={{ marginBottom: 0, paddingBottom: 0 }}>
                <AppBar auth0Client={this.props.auth0Client} history={this.props.history} />
                <div style={{textAlign: 'center'}}>
                    <Typography variant="h1" style={{ marginTop: '20px' }}> 404 Error </Typography>
                    <Typography variant="body1"> The page you were looking for couldn't be found. </Typography>
                </div>
            </div>
        )
    }
}

export default NotFoundPage;
