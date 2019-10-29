import React, { Component } from "react";
import CreateContractForm from "../components/CreateContractForm/CreateContractForm";

class CreateContractPage extends Component {

    render() {
        return (
            <div>
                <CreateContractForm history={this.props.history} web3={this.props.web3}/>
            </div>
        )
    }
}

export default CreateContractPage;
