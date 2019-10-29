import React, {Component} from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import "../css/AccountsTable.css";

const StyledTableCell = withStyles(theme => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const StyledTableRow = withStyles(theme => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.default,
    },
  },
}))(TableRow);

function createData(position, takerAddress, makerAddress, startDate, expiryDate, interestRate, mm, tm){
  return { position, takerAddress, makerAddress, startDate, expiryDate, interestRate, mm, tm };
}

const rows = [
  createData('Maker', "0x0", "0x0", "DATE", "DATE", "5%", 25, 25, 0),
  createData('Maker', "0x0", "0x0", "DATE", "DATE", "5%", 25, 25, 0),
  createData('Maker', "0x0", "0x0", "DATE", "DATE", "5%", 25, 25, 0),
];

class AccountTable extends Component {
 render() { 
    return (
      <Paper className="accountstable-container">
        <Table className="accountstable" aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell align="right">Position</StyledTableCell>
              <StyledTableCell align="right">Counterparty Address</StyledTableCell>
              <StyledTableCell align="right">Start Date</StyledTableCell>
              <StyledTableCell align="right">Expiry Date</StyledTableCell>
              <StyledTableCell align="right">Interest Rate</StyledTableCell>
              <StyledTableCell align="right">Taker Margin Balance (DAI)</StyledTableCell>
              <StyledTableCell align="right">Maker Margin Balance (DAI)</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.props.data.map((row, i)=> (
              <StyledTableRow key={i}>
                <StyledTableCell component="th" scope="row">
                  {row.position}
                </StyledTableCell>
                <StyledTableCell align="right">{row.counterpartyAddress}</StyledTableCell>
                <StyledTableCell align="right">{row.startDate}</StyledTableCell>
                <StyledTableCell align="right">{row.expiryDate}</StyledTableCell>
                <StyledTableCell align="right">{row.interestRate}</StyledTableCell>
                <StyledTableCell align="right">{this.props.web3.utils.fromWei(row.mm)}</StyledTableCell>
                <StyledTableCell align="right">{this.props.web3.utils.fromWei(row.tm)}</StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    );
  }
}
export default AccountTable; 