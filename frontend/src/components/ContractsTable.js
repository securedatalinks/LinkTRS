import React, { Component } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { PulseLoader } from 'react-spinners';
import { Link as RouterLink } from "react-router-dom"
import '../css/Table.css';

const testListings = [{
  id: 0,
  originalPrice: 10000,
  startDate: 1572335448,
  expiryDate: 1572375448,
  interestRate: 1000,
  originalValue: 500000,
}, {
  id: 1,
  originalPrice: 10000,
  startDate: 1572335477,
  expiryDate: 1572337477,
  interestRate: 1000,
  originalValue: 500000,
}]

class ContractsTable extends Component {
  state = {
    times: [],
    loadError: false, loading: true,
  }

  componentDidMount = async () => {
      //if (this.props.data.length !== 0) {
          this.setState({loading: false})
          //recalculate the time to live based on the oracles timestamp
          this.calculateTimeToLive()
          this.myInterval = setInterval(() => {
            var newTimes = []
            const { times } = this.state
            for (var i = 0; i < testListings.length; i++) {
            //for (var i = 0; i < this.props.data.length; i++) {
              if (times[i].seconds > 0) {
                newTimes.push({
                  minutes: times[i].minutes,
                  seconds: times[i].seconds - 1
                })
              }
              if (times[i].seconds === 0) {
                if (times[i].minutes === 0) {
                  clearInterval(this.myInterval)
                } else {
                  newTimes.push({
                    minutes: times[i].minutes - 1,
                    seconds: 59
                  })
                }
              }
            }
            this.setState({ times: newTimes })

          }, 1000)
        //}
}

calculateTimeToLive = async () => {
  var times = []
  for (var i = 0; i < testListings.length; i++) {
  //for (var i = 0; i < this.props.data.length; i++) {
    var current = Math.round((new Date()).getTime() / 1000);
    var ttl = testListings[i].startDate - current
    //var ttl = this.props.data[i].startDate - current
    var minutes = Math.floor(ttl/60)
    var seconds = ttl - (minutes * 60)
    var time = {
      minutes: minutes,
      seconds: seconds
    }
    times.push(time)
  }

  await this.setState({ times: times })
}

calculateTerm = (startDate, expiryDate) => {
  var diff = expiryDate - startDate;
  return Math.floor((diff/60*60*24))//convert to days
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
          <div className="table-container">
            <Table className="table">
              <TableHead className="table-head">
                <TableRow>
                  <TableCell>Wire Frame</TableCell>
                  <TableCell align="right">Term (days)</TableCell>
                  <TableCell align="right">Min Margin</TableCell>
                  <TableCell align="right">Original Price</TableCell>
                  <TableCell align="right">Original Value (Aud)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {testListings.map(row => (
                  <TableRow hover={true} key={row.id}>
                      <TableCell component="th" scope="row" id={row.id}>
                          <RouterLink to={{
                              pathname: "/contract/" + row.id,
                              state: {
                                  data: row
                              }
                          }}
                              style={{
                                  textDecoration: 'none',
                                  color: "#000000"
                              }}>
                              Make Contract Offer {this.state.times[row.id].minutes}:{ this.state.times[row.id].seconds < 10 ? `0${ this.state.times[row.id].seconds }` : this.state.times[row.id].seconds }
                          </RouterLink>
                        </TableCell>
                    <TableCell align="right">{Math.floor((row.expiryDate - row.startDate)/(60*60*24))}</TableCell>
                    <TableCell align="right">{row.minMargin}</TableCell>
                    <TableCell align="right">{row.originalPrice}</TableCell>
                    <TableCell align="right">{row.originalValue}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      }
  }
}

export default (ContractsTable);
