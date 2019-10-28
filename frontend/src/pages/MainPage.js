import React, { Component } from "react";
import AppBar from "../components/AppBar";

class MainPage extends Component {

    state = {
        data: null,
    }


    render() {
        return (
            <div style={{marginBottom: 0, paddingBottom: 0}}>
                <AppBar/>
            </div>
        )
    }
}

export default MainPage;
