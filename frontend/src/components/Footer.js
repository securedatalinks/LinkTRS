import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Logo from "../img/logo.png";
import '../css/Footer.css';

class CustomFooter extends Component {

  render() {
    return (
      <div>

          <div className="footer">
              <div style={{width:'60%', height:'100%'}}>
                <Grid container spacing={4}>
                  <Grid item xs={3}>
                    <img alt={"Chainlink TRS"} src={Logo} className="logo" />
                  </Grid>
                  <Grid item xs={3}>
                    <p>Technical Support:<br/><a href="/">support@reputation.link</a></p>
                    <p>Press Inquiries:<br/><a href="/">press@reputation.link</a></p>
                  </Grid>
                  <Grid item xs={3}>
                    <p><a href="/">Twitter</a><br /><a href="/">Medium</a><br /><a href="/">Website</a></p>
                  </Grid>
                  <Grid item xs={3}>
                    <p><a href="/">Terms of Use</a><br /><a href="/">Privacy Policy</a></p>
                  </Grid>
                </Grid>
              </div>
            </div>

      </div>
    );
  }
}

export default (CustomFooter);
