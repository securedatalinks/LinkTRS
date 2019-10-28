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

function createData(position, mm, tm, npv){
  return { position, mm, tm, npv };
}

const rows = [
  createData('Maker', 25, 25, 0),
  createData('Maker', 25, 25, 0),
  createData('Taker', 25, 25, 0),
  createData('Maker', 25, 25, 0),
  createData('Taker', 25, 25, 0),
];

class AccountTable extends Component {
 render() { 
    return (
      <Paper className="accountstable-container">
        <Table className="accountstable" aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Position</StyledTableCell>
              <StyledTableCell align="right">Taker Margin</StyledTableCell>
              <StyledTableCell align="right">Maker Margin</StyledTableCell>
              <StyledTableCell align="right">NPV</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(row => (
              <StyledTableRow key={row.position}>
                <StyledTableCell component="th" scope="row">
                  {row.position}
                </StyledTableCell>
                <StyledTableCell align="right">{row.mm}</StyledTableCell>
                <StyledTableCell align="right">{row.tm}</StyledTableCell>
                <StyledTableCell align="right">{row.npv}</StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    );
  }
}
export default AccountTable; 