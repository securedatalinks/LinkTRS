import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import MainPage from "./pages/MainPage";
import NotFoundPage from "./pages/404";
import CreateContractPage from "./pages/CreateContractPage";
import './App.css';
import MyAccount from './pages/MyAccount';
import Typography from '@material-ui/core/Typography';
import { PulseLoader } from 'react-spinners';

import getWeb3 from './utils/getWeb3'
import ViewContractPage from './pages/ViewContractPage';

class App extends Component {
  state = {
    web3: null,
    loadError: false, loading: true,
    showWelcomeMessage: false
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      this.setState({ loading :false, web3: web3 })
    } catch (error) {
      // Catch any errors for any of the above operations.
      // alert(
      //   `Failed to load web3, accounts, or contract. Check console for details.`,
      // );
      this.setState({ loadError: true, loading: false })
      console.error(error);
    }
  }

  render() {
    if (this.state.loading === true) {
      return (
        <PulseLoader
          sizeUnit={"px"}
          size={5}
          color={'#2A2B2A'}
          loading={this.state.showLoader}
        />
      )
    } else if (this.state.loadError) {
      return (
        <div>
          <Typography variant="h5" style={{ paddingTop: "5px", color: "#2A2B2A" }}> Sorry, there was an error loading in the contracts </Typography>
          <Typography variant="h5" style={{ paddingTop: "5px", color: "#2A2B2A" }}> Please make sure you have metamask configured and are connected to the Ropsten test network</Typography>
        </div>

      )
    } else {
      return (
        <div className="App" style={{ backgroundColor: "inherit", margin: 0, padding: 0}}>
            <Switch>
              <Route exact path="/" render={(props) => {
                return (<MainPage {...props}/>)
              }} />
              <Route exact path="/create" render={(props) => {
                return (<CreateContractPage {...props} web3={this.state.web3}/>)
              }} />
              <Route exact path="/myaccount" render={(props) => {
                return (<MyAccount {...props} web3={this.state.web3}/>)
              }} />
              <Route exact path="/contract/:contractID" render={(props) => {
                return (<ViewContractPage {...props} web3={this.state.web3}/>)
              }} />
              <Route render={(props) => {
                return (<NotFoundPage {...props} />)
              }} />

            </Switch>
          </div>
      );
    }
  }
}

export default App;
