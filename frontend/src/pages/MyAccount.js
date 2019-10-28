import React, { Component } from "react";
import AppBar from "../components/AppBar";
import AccountTable from "../components/AccountTable"

class MyAccount extends Component {

    state = {
        data: null,
    }


    render() {
        return (
            <div style={{marginBottom: 0, paddingBottom: 0}}>
                <AppBar/>
                <AccountTable/>
            </div>
        )
    }
}

export default MyAccount;