import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';

import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import localizations from '../Localizations';
import { colors } from '../../theme';

const styles = {
  root: {
    width: '100%',
    marginTop: 20,
    overflowX: 'auto',
  },
  table: {
    minWidth: 700,
  },
  tableHeading: {
    fontFamily: 'lato',
    fontSize: 20,
    color: colors.black,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableCellText: {
    fontFamily: 'lato',
    fontSize: 18,
    color: colors.gray,
    textAlign: 'center',
  },
  teamCellContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  teamImageContainer: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  teamImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  temName: {
    fontSize: 18,
    marginLeft: 10,
    fontFamily: 'lato',
    color: colors.blue,
    fontWeight: 'bold',
  },
};

const TeamCell = ({ stat }) => (
  <div style={styles.teamCellContainer}>
    <div style={styles.teamImageContainer}>
      <img src={stat.avatar} alt={stat.pseudo} style={styles.teamImage} />
    </div>
    <h2 style={styles.temName}>{stat.name}</h2>
  </div>
);

const TeamStatsTable = ({ classes, stats }) => {
  return (
    <Paper className={classes.root}>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell style={{...styles.tableHeading, textAlign: 'left'}}>Children</TableCell>
            <TableCell style={styles.tableHeading}>{localizations.profile_statistics_club_team_member}</TableCell>
            <TableCell style={styles.tableHeading}>{localizations.profile_statistics_club_team_event}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stats.map(stat => (
            <TableRow>
              <TableCell component="th" scope="row">
                <TeamCell stat={stat} />
              </TableCell>
              <TableCell style={styles.tableCellText}>{stat.membersCount}</TableCell>
              <TableCell style={styles.tableCellText}>{stat.eventsCount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

TeamStatsTable.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default Radium(withStyles(styles)(TeamStatsTable));
