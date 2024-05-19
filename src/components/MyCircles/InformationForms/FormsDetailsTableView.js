import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import VisibilityIcon from '@material-ui/icons/Visibility';
import Paper from '@material-ui/core/Paper';
import localizations from '../../Localizations'
import { colors } from '../../../theme';
import { Button } from '@material-ui/core';

let styles;

function FormsDetailsTableView(props) {
  const { form, circle, user } = props;
  let askedInformationList = form && form.askedInformation ? form.askedInformation : [];
  return (
    <Paper style={styles.root}>
      <Table style={styles.table}>
        <TableHead>
          <TableRow >
            <TableCell style={styles.headerText} align="right">{localizations.circles_information_form_details_pseudo}</TableCell>
            <TableCell style={styles.headerText} align="right">{localizations.circles_information_form_details_date}</TableCell>
            { askedInformationList.map(field => {
                return <TableCell style={styles.headerText} align="right">
                  {field.name}
                </TableCell>
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {form && circle && circle.members && circle.members.length > 0 &&
            circle.members.map(member => {
              return <TableRow key={member.id}>
                <TableCell style={styles.bodyText} align="right">
                  {member.pseudo}
                </TableCell>
                <TableCell style={styles.bodyText} align="right">
                  {
                    askedInformationList.map(askedInfo =>
                      findFillingDate(askedInfo, member, circle.membersInformation)
                    ).find(fillInfo => fillInfo)
                    || <div style={styles.notFulfilledInfoCell}>{localizations.circles_information_form_details_not_available}</div>
                  }
                </TableCell>
                { askedInformationList.map(askedInfo => {
                  return <TableCell style={styles.bodyText} align="right">
                    {
                      findFulfilledInformation(askedInfo, member, circle.membersInformation, props)
                      || <div style={styles.notFulfilledInfoCell}>{localizations.circles_information_form_details_not_filled}</div>
                    }
                  </TableCell>
                })}
              </TableRow>
            })
          }
        </TableBody>
      </Table>
      <table id="table-to-xls" style={{ display: 'none' }}>
        <tr>
          <td>{localizations.circles_information_form_details_pseudo}</td>
          <td>{localizations.circles_information_form_details_date}</td>
          { askedInformationList.map((field, index) => (
            <td key={index}>
              {field.name}
            </td>
          ))}
        </tr>
        {form && circle && circle.members && circle.members.length > 0 &&
            circle.members.map(member => (
              <tr key={member.id}>
                <td>
                  {member.pseudo}
                </td>
                <td>
                  {askedInformationList.map(askedInfo =>
                      findFillingDate(askedInfo, member, circle.membersInformation)
                    ).find(fillInfo => fillInfo)
                    || localizations.circles_information_form_details_not_available
                  }
                </td>
                {askedInformationList.map(askedInfo => (
                  <td>
                    {findFulfilledInformation(askedInfo, member, circle.membersInformation, props)
                      || localizations.circles_information_form_details_not_filled
                    }
                  </td>
                ))}
              </tr>
            ))
          }
      </table>
    </Paper>
  );
}

function findFulfilledInformation(askedInfo, member, membersInformation, props) {
  let information = membersInformation.find(memberInfo => askedInfo.id === memberInfo.information && memberInfo.user.id === member.id);
  return information 
  ? askedInfo.type === 'DATE' 
    ? new Date(information.value).toLocaleDateString('fr-FR') 
    : askedInfo.type === 'DOCUMENT'
      ? information.document 
        ? <DocumentItem
            document={information.document}
            information={information}
            {...props}
          />
        : ""
      : information.value
  : ""
}

class DocumentItem extends React.Component {

  constructor() {
    super();
    this.state = {
      isOpen: false
    }
  }
  render() {
    const {document, props, information} = this.props
    const {isOpen} = this.state; 
    
    return (
      <div>
        <span 
          style={{
            textDecoration: isOpen ? 'none' : 'underline', 
            cursor: 'pointer',
            color: information.validationStatus === "VALIDATED" ? colors.green : information.validationStatus === "PENDING" ? colors.black : colors.redGoogle
          }} 
          onClick={() => this.setState({isOpen: !this.state.isOpen})}
        >
          {document.name}
        </span>
        {isOpen && 
          <div style={{display: "flex", flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end'}}>
            <a href={document.link} target="_blank">
              <VisibilityIcon variant="contained" color="primary" fontSize="small" />
            </a>
            {information.validationStatus === "PENDING" && 
              <span 
                style={{color: colors.green, cursor: 'pointer'}}
                onClick={() => {
                  this.props.validateDocument(document, information.id);
                  this.setState({isOpen: false});
                }}
                  
              >
                <i className="fa fa-check fa-2x" />
              </span>
            }
            {information.validationStatus === "PENDING" && 
              <span 
                style={{color: colors.redGoogle, cursor: 'pointer'}}
                onClick={() => {
                  this.props.refuseDocument(document, information.id)
                }}
              >
                <i className="fa fa-times fa-2x" />
              </span>
            }
          </div>
        }
      </div>
    )
  }
}

function findFillingDate(askedInfo, member, membersInformation) {
  let information = membersInformation.find(memberInfo => askedInfo.id === memberInfo.information && memberInfo.user.id === member.id);
  return information ? new Date (information.fillingDate).toLocaleDateString('fr-FR') : ""
}

styles = {
  root: {
    width: '100%',
    //marginTop: 15,
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
},
  notFulfilledInfoCell: {
    color: colors.gray
  }
};

FormsDetailsTableView.propTypes = {
  form: PropTypes.array.isRequired
};

export default Radium(FormsDetailsTableView);
