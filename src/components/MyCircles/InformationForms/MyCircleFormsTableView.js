import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import localizations from '../../Localizations'
import { colors } from '../../../theme';
import { Button } from '@material-ui/core';

let styles;

function MyCircleFormsTableView(props) {
  const { forms, user } = props;
  function getFormMemberCount(form) {
    let formMemberCount = 0;
    if (form.circles && form.circles.edges && form.circles.edges.length > 0) {
      form.circles.edges.forEach(edge => formMemberCount += edge.node.members.length)
    }
    return formMemberCount;
  }
  return (
    <Paper style={styles.root}>
      <Table style={styles.table}>
        <TableHead>
          <TableRow >
            <TableCell style={styles.headerText}>{localizations.circles_information_form_name}</TableCell>
            <TableCell style={styles.headerText} align="right">{localizations.circles_information_form_groups_applied_to}</TableCell>
            <TableCell style={styles.headerText} align="right">{localizations.circles_information_form_number_fulfill}</TableCell>
            <TableCell style={styles.headerText} align="right">{localizations.circles_information_form_number_waiting_answer}</TableCell>
            <TableCell style={styles.headerText} align="right">{localizations.circles_information_form_contact_again}</TableCell>
            <TableCell style={styles.headerText} align="right">{localizations.circles_information_form_modification}</TableCell>
            <TableCell style={styles.headerText} align="right">{localizations.circles_information_form_delete}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {forms.map(form => {
            let memberCount = getFormMemberCount(form);
            let answeredFormCount = props.getAnsweredFormCount(form);
            return (
              <TableRow key={form.id} style={{cursor: 'pointer'}} >
                <TableCell style={styles.bodyText} component="th" scope="row" onClick={() => props.viewForm(form.id)} >{form.name}</TableCell>
                <TableCell style={styles.bodyText} align="right" onClick={() => props.viewForm(form.id)}>
                  {form.circles && form.circles.edges && form.circles.edges.length > 0
                    ?   form.circles.edges.map(edge => (
                      edge.node.owner.id === user.id ? edge.node.name : edge.node.name + ' (' + edge.node.owner.pseudo + ')'
                    )).join(', ')
                    :   '-'
                  }
                </TableCell>
                <TableCell style={styles.bodyText} align="right" onClick={() => props.viewForm(form.id)}>{answeredFormCount}</TableCell>
                <TableCell style={styles.bodyText} align="right" onClick={() => props.viewForm(form.id)}>{memberCount-answeredFormCount}</TableCell>
                <TableCell style={styles.bodyText} align="right">
                    <Button style={styles.altButton} onClick={() => props.relaunchMembers(form)}>
                      <i key={"relaunch"+form.id} className="fa fa-envelope-o" style={styles.iconCheck}></i>
                    </Button>
                </TableCell>
                <TableCell style={styles.bodyText} align="right">
                  <div style={styles.icon} onClick={() => props.editForm(form)}>
                    <i key={"edit"+form.id} className="fa fa-pencil" style={styles.iconEdit}></i>
                  </div>
                </TableCell>
                <TableCell style={styles.bodyText} align="right">
                  <div style={styles.icon} onClick={() => props.removeForm(form)}>
                    <i key={"delete"+form.id} className="fa fa-times" style={styles.iconRemove}></i>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
}

styles = {
  root: {
    width: '100%',
    marginTop: 15,
    overflowX: 'auto',
  },
  table: {
    minWidth: 700,
  },
  icon: {
    fontSize: 24,
    cursor: 'pointer',
    textAlign: 'end',
    marginLeft: 10
  },
  iconRemove: {
    color: '#A6A6A6',
    ':hover': {
      color: colors.redGoogle
    }
  },
  iconEdit: {
    color: colors.blueLight,
    ':hover': {
      color: colors.blue
    }
  },
  iconCheck: {
    fontSize: 15,
    color: colors.white
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 16
  },
  bodyText: {
    fontSize: 14
  },
  altButton: {
    fontSize: 13,
    backgroundColor: colors.blue,
    color: colors.white,
    textTransform: 'none',
}
};

MyCircleFormsTableView.propTypes = {
  forms: PropTypes.array.isRequired
};

export default Radium(MyCircleFormsTableView);
