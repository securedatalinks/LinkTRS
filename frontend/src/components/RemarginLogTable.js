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

class RemarginLogTable extends Component {
 render() { 
    return (
      <Paper className="accountstable-container">
        <Table className="accountstable" aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell align="right">Date</StyledTableCell>
              <StyledTableCell align="right">Price</StyledTableCell>
              <StyledTableCell align="right">Takers Margin Account</StyledTableCell>
              <StyledTableCell align="right">Makers Margin Account</StyledTableCell>
              <StyledTableCell align="right">Change in NPV</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.props.data.map((row, i)=> (
              <StyledTableRow key={i}>
                <StyledTableCell align="right">{row.date}</StyledTableCell>
                <StyledTableCell align="right">{row.price}</StyledTableCell>
                <StyledTableCell align="right">{row.tm}</StyledTableCell>
                <StyledTableCell align="right">{row.mm}</StyledTableCell>
                <StyledTableCell align="right">{row.npv}</StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    );
  }
}
export default RemarginLogTable; 