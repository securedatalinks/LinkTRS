import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Footer from "./components/Footer";
import * as serviceWorker from './serviceWorker';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { BrowserRouter } from "react-router-dom";
import CssBaseline from '@material-ui/core/CssBaseline'

// A function that routes the user to the right place
// after login
const onRedirectCallback = appState => {
  window.history.replaceState(
    {},
    document.title,
    appState && appState.targetUrl
      ? appState.targetUrl
      : window.location.pathname
  );
};

/** Define Color Theme Here */
const theme = createMuiTheme({
  palette: {
    background: {
      default: '#e6e3e3'
    },
    primary: {
      main: '#e6e3e3',
    },
    secondary: {
      main: '#000000',
    },
  },
  status: {
    danger: 'orange',
  },
  typography: {
    fontFamily: '"Work Sans", serif',
  },
});

ReactDOM.render(
  <BrowserRouter>
    <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <App />
        <Footer />
      </MuiThemeProvider>
  </BrowserRouter >,
  document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
