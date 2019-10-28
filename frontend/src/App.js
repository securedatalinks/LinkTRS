import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import MainPage from "./pages/MainPage";
import NotFoundPage from "./pages/404";
import './App.css';
import MyAccount from './pages/MyAccount';

class App extends Component {

  render() {
    return (
      <div className="App" style={{ backgroundColor: "inherit", margin: 0, padding: 0}}>
          <Switch>
            <Route exact path="/" render={(props) => {
              return (<MainPage {...props}/>)
            }} />
            <Route render={(props) => {
              return (<NotFoundPage {...props} />)
            }} />
             <Route exact path="/" render={(props) => {
              return (<MyAccount {...props}/>)
            }} />
          </Switch>
        </div>
    );
  }
}

export default App;
