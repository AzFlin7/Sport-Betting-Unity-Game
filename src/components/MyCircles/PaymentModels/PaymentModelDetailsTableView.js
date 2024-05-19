import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import moment from 'moment';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import localizations from '../../Localizations'
import { colors } from '../../../theme';

let styles;

class FormsDetailsTableView extends React.Component {

    isConditionFilled = (condition, answer) => {
        switch(condition.askedInformation.type) {
            case 'NUMBER': {
                switch(condition.askedInformationComparator)  {
                    case '≤': {
                        return (parseInt(answer.value) <= condition.askedInformationComparatorValue)
                    }
                    case '<': {
                        return (parseInt(answer.value) < condition.askedInformationComparatorValue)
                    }
                    case '=': {
                        return (parseInt(answer.value) === condition.askedInformationComparatorValue)
                    }
                    case '>': {
                        return (parseInt(answer.value) > condition.askedInformationComparatorValue)
                    }
                    case '≥': {
                        return (parseInt(answer.value) >= condition.askedInformationComparatorValue)
                    }
                }
            }
            case 'BOOLEAN': {
                if ((condition.askedInformationComparatorValue === 1 && answer.value === 'true') || (condition.askedInformationComparatorValue === 0 && answer.value === 'false'))
                    return true ; 
                else 
                    return false
            }
            case 'DATE': {
                switch(condition.askedInformationComparator)  {
                    case '≤': {
                        if (moment(answer.value).isBefore(condition.askedInformationComparatorDate))
                            return true; 
                        else 
                            return false;
                    }
                    case '≥': {
                        if (moment(answer.value).isAfter(condition.askedInformationComparatorDate))
                            return true; 
                        else 
                            return false;
                    }
                }
            }
            case 'CUSTOM': {
                if (condition.askedInformationComparatorValueString === answer.value)
                    return true ; 
                else 
                    return false
            }
            default: return false;
        }
    }

    _didUserFillAll = (user, circle, paymentModel) => {
        let paymentModelAskedInformation = [];
        paymentModel.conditions.forEach(condition => {
            condition.conditions.forEach(cond => {
                paymentModelAskedInformation = paymentModelAskedInformation.concat(cond.askedInformation)
            })
        })       

        let didUserFillAll = true ;
        paymentModelAskedInformation.forEach(askedInfo => {
            if (!circle.membersInformation || (askedInfo.type !== 'BOOLEAN' && circle.membersInformation.findIndex(memberInfo => user.id === memberInfo.user.id && memberInfo.information === askedInfo.id) < 0))
                didUserFillAll = false
        })   

        return didUserFillAll
    }

    getAmountToPay = (user, circle, paymentModel) => {
        let result = '-'; 
        if (!!this.getPaidAmount(user, paymentModel))
            return result ;
        else 
            result = paymentModel.price.cents / 100 + ' ' + paymentModel.price.currency
        

        let conditionListFilled = null;
        let numberOfValidAnswer = 0 ;  
        let userInformation = circle.membersInformation.filter(info => info.user.id === user.id)

        if (userInformation.length === 0)
            return result

        paymentModel.conditions.forEach(condition => {
            let conditionAreValidated = true; 
            let currentNumberOfValidAnswer = 0 ; 

            condition.conditions.forEach(cond => {
                let memberInfoIndex = userInformation.findIndex(userInfo => userInfo.information === cond.askedInformation.id);
                
                if (memberInfoIndex >= 0 && (cond.askedInformation.type === 'BOOLEAN' || this.isConditionFilled(cond, userInformation[memberInfoIndex]))) {
                    currentNumberOfValidAnswer++ ;
                }
                else 
                    conditionAreValidated = false;
            })
            
            if (conditionAreValidated && currentNumberOfValidAnswer > numberOfValidAnswer) {
                numberOfValidAnswer = currentNumberOfValidAnswer;
                conditionListFilled = condition
            }
        })

        if  (conditionListFilled) {
            if (paymentModel.memberToPayFees) {
                result = (conditionListFilled.price.cents * (1 + circle.owner.paymentModelFees / 100)) / 100 + ' ' + conditionListFilled.price.currency
            }
            else {
                result = conditionListFilled.price.cents / 100 + ' ' + conditionListFilled.price.currency
            }
        }
        else {
            if (paymentModel.memberToPayFees) {
                result = (paymentModel.price.cents * (1 + circle.owner.paymentModelFees / 100)) / 100 + ' ' + paymentModel.price.currency
            }
            else 
                result = paymentModel.price.cents / 100 + ' ' + paymentModel.price.currency
        }

        return result
    }

    getPaidAmount = (user, paymentModel) => {
        let result ; 
        if (paymentModel.memberSubscriptions && paymentModel.memberSubscriptions.length > 0) {
            let payment = paymentModel.memberSubscriptions.find(sub => sub.user.id === user.id);

            if (payment) {
                if (payment.amount) {
                    result = payment.amount.cents / 100 + ' ' + payment.amount.currency
                }
                else {
                    result = paymentModel.price.cents / 100 + ' ' + paymentModel.price.currency
                }
            }
        }

        return result
    }

    getDateOfPayment = (user, paymentModel) => {
        let result = '-'; 
        if (paymentModel.memberSubscriptions && paymentModel.memberSubscriptions.length > 0) {
            let payment = paymentModel.memberSubscriptions.find(sub => sub.user.id === user.id);

            if (payment) {
                if (payment.payment_date) {
                    result = moment(new Date(payment.payment_date)).format('DD MMM YYYY') ;
                }
                else {
                    result = localizations.circles_information_payment_date_not_set ; 
                }
            }
        }

        return result
    }

    render() {
        const { paymentModel, circle, user } = this.props;
        
        return (
            <Paper style={styles.root}>
                <Table style={styles.table}>
                    <TableHead>
                    <TableRow >
                        <TableCell style={styles.headerText} align="right">Pseudo</TableCell>
                        <TableCell style={styles.headerText} align="right">{localizations.circles_information_payment_form_completed}</TableCell>
                        <TableCell style={styles.headerText} align="right">{localizations.circles_information_payment_date}</TableCell>
                        <TableCell style={styles.headerText} align="right">{localizations.circles_information_payment_amount}</TableCell>
                        <TableCell style={styles.headerText} align="right">{localizations.circles_information_payment_amount_to_pay}</TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    {paymentModel && circle && circle.members && circle.members.length > 0 &&
                        circle.members.map(member => (
                            <TableRow key={member.id}>
                                <TableCell style={styles.bodyText} align="right">
                                    {member.pseudo}
                                </TableCell>
                                <TableCell style={styles.bodyText} align="right">
                                    {this._didUserFillAll(member, circle, paymentModel) ? localizations.circle_yes : localizations.circle_no}
                                </TableCell>
                                <TableCell style={styles.bodyText} align="right">
                                    {this.getDateOfPayment(member, paymentModel)}
                                </TableCell>
                                <TableCell style={styles.bodyText} align="right">
                                    {this.getPaidAmount(member, paymentModel) || '-'}
                                </TableCell>
                                <TableCell style={styles.bodyText} align="right">
                                    {this.getAmountToPay(member, circle, paymentModel)}
                                </TableCell>
                            </TableRow>
                        ))
                    }
                    </TableBody>
                </Table>
                <table id="table-to-xls" style={{ display: 'none' }}>
                    <tr>
                        <td>{localizations.circles_information_form_details_pseudo}</td>
                        <td>{localizations.circles_information_payment_form_completed}</td>
                        <td>{localizations.circles_information_payment_date}</td>
                        <td>{localizations.circles_information_payment_amount}</td>
                        <td>{localizations.circles_information_payment_amount_to_pay}</td>
                    </tr>
                    {paymentModel && circle && circle.members && circle.members.length > 0 &&
                        circle.members.map(member => (
                            <tr key={member.id}>
                                <td>
                                    {member.pseudo}
                                </td>
                                <td>
                                    {this._didUserFillAll(member, circle, paymentModel) ? localizations.circle_yes : localizations.circle_no}
                                </td>
                                <td>
                                    {this.getDateOfPayment(member, paymentModel)}
                                </td>
                                <td>
                                    {this.getPaidAmount(member, paymentModel) || '-'}
                                </td>
                                <td>
                                    {this.getAmountToPay(member, circle, paymentModel)}
                                </td>
                            </tr>
                        ))
                    }
                </table>
            </Paper>
        );
    }
}

function findFulfilledInformation(askedInfo, member, membersInformation) {
  let information = membersInformation.find(memberInfo => askedInfo.id === memberInfo.information && memberInfo.user.id === member.id);
  return information ?
    askedInfo.type === 'DATE' ? new Date(information.value).toLocaleDateString('fr-FR') : information.value
    : ""
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
