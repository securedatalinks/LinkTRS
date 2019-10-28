import React, { Component } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { Link as RouterLink } from "react-router-dom"
import '../css/Table.css';

function createData(wireframe, accMargin, term, minMargin, notionalVal, assetVal) {
  return { wireframe, accMargin, term, minMargin, notionalVal, assetVal };
}

const rows = [
  createData('20s', '5%', 5, '10%', 100, 1000),
  createData('20s', '5%', 5, '10%', 100, 1000),
  createData('20s', '5%', 5, '10%', 100, 1000),
  createData('20s', '5%', 5, '10%', 100, 1000),
];

class CustomTable extends Component {
  state = {
    minutes: 3,
    seconds: 0
  }

  componentDidMount() {
  this.myInterval = setInterval(() => {
    const { seconds, minutes } = this.state
    if (seconds > 0) {
      this.setState(({ seconds }) => ({
        seconds: seconds - 1
      }))
    }
    if (seconds === 0) {
      if (minutes === 0) {
        clearInterval(this.myInterval)
      } else {
        this.setState(({ minutes }) => ({
          minutes: minutes - 1,
          seconds: 59
        }))
      }
    }
  }, 1000)
}

  render() {
    return (
      <div className="table-container">
        <Table className="table">
          <TableHead className="table-head">
            <TableRow>
              <TableCell>Wire Frame</TableCell>
              <TableCell align="right">Acceptance Margin</TableCell>
              <TableCell align="right">Term (days)</TableCell>
              <TableCell align="right">Min Margin</TableCell>
              <TableCell align="right">Notional Value</TableCell>
              <TableCell align="right">Asset Value (Aud)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(row => (
              <TableRow hover={true} key={row.wireframe}>
                  <TableCell component="th" scope="row" id={row.wireframe}>
                      <RouterLink to={{
                          pathname: "/oracle/" + row.wireframe,
                          state: {
                              data: row
                          }
                      }}
                          style={{
                              textDecoration: 'none',
                              color: "#000000"
                          }}>
                          {this.state.minutes }:{ this.state.seconds < 10 ? `0${ this.state.seconds }` : this.state.seconds }
                      </RouterLink>
                    </TableCell>
                <TableCell align="right">{row.accMargin}</TableCell>
                <TableCell align="right">{row.term}</TableCell>
                <TableCell align="right">{row.minMargin}</TableCell>
                <TableCell align="right">{row.notionalVal}</TableCell>
                <TableCell align="right">{row.assetVal}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
}

export default (CustomTable);
