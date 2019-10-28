import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import MainPage from "./pages/MainPage";
import NotFoundPage from "./pages/404";
import CreateContractPage from "./pages/CreateContractPage";
import './App.css';

class App extends Component {

  render() {
    return (
      <div className="App" style={{ backgroundColor: "inherit", margin: 0, padding: 0}}>
          <Switch>
            <Route exact path="/" render={(props) => {
              return (<MainPage {...props}/>)
            }} />
            <Route exact path="/create" render={(props) => {
              return (<CreateContractPage {...props} />)
            }} />
            <Route exact path="/myaccount" render={(props) => {
              return (<MyAccount {...props} />)
            }} />
            <Route render={(props) => {
              return (<NotFoundPage {...props} />)
            }} />
          </Switch>
        </div>
    );
  }
}

export default App;
