import React, { Component } from "react";
import CreateContractForm from "../components/CreateContractForm";

class CreateContractPage extends Component {

    render() {
        return (
            <div>
                <CreateContractForm history={this.props.history}/>
            </div>
        )
    }
}

export default CreateContractPage;
