import React from 'react'
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import { withAlert } from 'react-alert'
import ReactLoading from 'react-loading'
import moment from 'moment'
import cloneDeep from 'lodash/cloneDeep';
import {
    Grid,
    Card,
    CardHeader,
    CardContent,
    CardActions,
    Button,
    Paper,
    Tabs,
    Tab,
    AppBar,
    IconButton,
    Icon
  } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import { colors, fonts, appStyles } from '../../theme'
import UpdateFilledInformationMutation from '../Circle/CircleMembersInformation/UpdateFilledInformationMutation'
import InputText from '../common/Inputs/InputText'
import InputNumber from '../common/Inputs/InputNumber'
import InputCheckbox from '../common/Inputs/InputCheckbox'
import InputSelect from '../common/Inputs/InputSelect'
import InputDate from '../common/Inputs/InputDate'
import InputAddress from '../common/Inputs/InputAddress'
import InputPhone from '../common/Inputs/InputPhone'
import CirclePaymentReference from './CirclePaymentReference';
import FeesPaymentPopup from './Wallet/FeesPaymentPopup'
import UpdateUserSubscription from './Subscriptions/UpdateUserSubscription'

import localizations from '../Localizations'
import styles from './Styles'

const muiStyles = theme => ({
    root_tabs: {
      backgroundColor: '#FFF',
    },
    tab_header: {
      fontSize: 18,
      color: colors.blue,
      padding: 0,
    },
    cash_button: {
      width: '50%',
    },
    fortune_card_title: {
      textAlign: 'center',
      color: colors.blue,
      fontSize: 16
    },
    fortune_card_content: {
      textAlign: 'center',
    },
    wallet_fortune: {
      fontSize: 12
    },
    wallet_fortune_selected: {
      fontSize: 12, 
      color: colors.darkBlue,
      fontWeight: 'bold'
    }
  });

class CircleMemberships extends React.Component {
	constructor(props) {
        super(props)
        this.sub;
        this.state = {
            circlesWithAskedInformation: [],
            circlesWithAskedFees: [],
            editInfo: false,
            isLoading: false,
            displayTab: 0
        }
        this.alertOptions = {
            offset: 60,
            position: 'top right',
            theme: 'light',
            transition: 'fade',
        };
    }

    componentDidMount = () => {
        this.sub = UpdateUserSubscription({userId: this.props.user.id});

        this._refetch()
        if (this.props.user && this.props.user.circlesCircleMemberships && this.props.user.circlesCircleMemberships.edges && this.props.user.circlesCircleMemberships.edges.length > 0)
            this._setCircleWithAskedInformation(this.props.user.circlesCircleMemberships.edges)
    }

    componentWillUnmount() {
        this.sub && this.sub.dispose()
    }

    componentWillReceiveProps = (nextProps) => {
        if (nextProps.user && nextProps.user.circlesCircleMemberships && nextProps.user.circlesCircleMemberships.edges && nextProps.user.circlesCircleMemberships.edges.length > 0)
            this._setCircleWithAskedInformation(nextProps.user.circlesCircleMemberships.edges)
    }
    
    _setCircleWithAskedInformation = (circles) => {
        let circleAskedInformationList = [];
        let paymentModelList = [];
        
        circles.forEach(circle => {
            if (circle.node.askedInformation && circle.node.askedInformation.length > 0) {
                circleAskedInformationList.push({
                    circle: circle.node,
                    forms: []
                });

                circle.node.askedInformation.forEach(askedInfo => {
                    let formIndex = circleAskedInformationList[circleAskedInformationList.length - 1].forms.findIndex(form => form.id === askedInfo.form.id);

                    if (formIndex >= 0) {
                        circleAskedInformationList[circleAskedInformationList.length - 1].forms[formIndex].info.push(askedInfo)
                    }
                    else {
                        circleAskedInformationList[circleAskedInformationList.length - 1].forms.push({
                            id: askedInfo.form.id,
                            name: askedInfo.form.name,  
                            info: [askedInfo]
                        });
                    }
                })
            }
            if (circle.node.paymentModels && circle.node.paymentModels.length > 0) {
                paymentModelList.push(circle.node)
            }
        });
        
        this.setState({
            circlesWithAskedInformation: circleAskedInformationList,
            circlesWithAskedFees: paymentModelList,
        })
    }

   _handleUpdateValue = (circle, askedInfo, value) => {
        let newState = cloneDeep(this.state.circlesWithAskedInformation) ;
        let userId = this.props.user.id; 
        
        if (askedInfo.type === 'NUMBER' && value.length > 5)
            return ;
        if (askedInfo.type === 'PHONE_NUMBER' && value.length > 10)
            return ;

        newState.forEach((newStateCircle, i) => {
            if (newStateCircle.circle.id === circle.id) {
                let index = newStateCircle.circle.membersInformation.findIndex(memberInfo => {
                    return (memberInfo.user.id === userId && memberInfo.information === askedInfo.id) 
                })
                if (index >= 0) {
                    if (askedInfo.type === 'BOOLEAN')
                        newState[i].circle.membersInformation[index].value = value ? "true" : "false";
                    else 
                        newState[i].circle.membersInformation[index].value = value;
                }   
                else {
                    newState[i].circle.membersInformation.push({
                        information: askedInfo.id,
                        user: this.props.user,
                        value: askedInfo.type === 'BOOLEAN' ? value ? "true" : "false" : value
                    })
                }
            }
        });

        this.setState({
            circlesWithAskedInformation: newState
        })
    }

    _getRowValue = (userId, membersInfo, askedInfo) => {
        let result ; 
        membersInfo.forEach(info => {
            if (info.user.id === userId && info.information === askedInfo.id) {
                if (askedInfo.type === "BOOLEAN")
                    result = info.value === "true" ? true : false ; 
                else if (askedInfo.type === "NUMBER")
                    result = parseInt(info.value)
                else 
                    result = info.value;
            }                
        })
        
        if (typeof result === "undefined") {
            if (askedInfo.type === "BOOLEAN")
                result = false ; 
            else 
                result = ""
        }
        
        return result
    }

    _renderRowValue = (userId, membersInfo, askedInfo) => {
        let result ; 
        membersInfo.forEach(info => {
            if (info.user.id === userId && info.information === askedInfo.id && typeof info.value !== 'undefined') {
                if (askedInfo.type === "BOOLEAN")
                    result = info.value === "true" ? localizations.circle_yes : localizations.circle_no ; 
                else if (askedInfo.type === "NUMBER")
                    result = parseInt(info.value)
                else if (askedInfo.type === "DATE")
                    result = moment(new Date(info.value)).format('DD MMM YYYY')
                else 
                    result = info.value;
            }                
        })
        
        if (typeof result === "undefined") {
            if (askedInfo.type === "BOOLEAN")
                result = localizations.circle_no ; 
            else 
                result = ""
        }
        
        return result
    }

    _renderInputField = (askedInfo, circle) => {
        const { user } = this.props;

        if (this.state.editInfo) {
            switch(askedInfo.type) {
                case 'TEXT': return (
                    <InputText 
                        maxLenght={40} 
                        value={this._getRowValue(user.id, circle.membersInformation, askedInfo)}
                        onChange={(e) => this._handleUpdateValue(circle, askedInfo, e.target.value)}
                    />
                )
                case 'NUMBER': return (
                    <InputNumber 
                        max={99999} 
                        value={this._getRowValue(user.id, circle.membersInformation, askedInfo)}
                        onChange={(e) => this._handleUpdateValue(circle, askedInfo, e.target.value)}
                    />
                )
                case 'BOOLEAN': return (
                    <InputCheckbox 
                        checked={this._getRowValue(user.id, circle.membersInformation, askedInfo)}
                        onChange={(e) => this._handleUpdateValue(circle, askedInfo, e.target.checked)}
                    />
                )
                case 'ADDRESS': return (
                    <InputAddress 
                        value={this._getRowValue(user.id, circle.membersInformation, askedInfo)}
                        onChange={(e) => this._handleUpdateValue(circle, askedInfo, e ? e.label : '')}
                    />
                )
                case 'DATE': return (
                    <div style={{width: 200}}>
                        <InputDate 
                            value={this._getRowValue(user.id, circle.membersInformation, askedInfo)}
                            onChange={(e) => this._handleUpdateValue(circle, askedInfo, e._d)}
                        />
                    </div>
                )
                case 'PHONE_NUMBER': return (
                    <InputPhone 
                        value={this._getRowValue(user.id, circle.membersInformation, askedInfo)}
                        onChange={(e) => this._handleUpdateValue(circle, askedInfo, e.target.value)}
                    />
                )
                case 'CUSTOM': return (
                    <InputSelect
                        isDisabled={false}
                        list={askedInfo.answers.map(a => ({name: a}))}
                        selectedItem={{name: this._getRowValue(user.id, circle.membersInformation, askedInfo)}}
                        onSelectItem={(e) => this._handleUpdateValue(circle, askedInfo, e.name)}
                    />
                )
                default:
                    return (
                        <InputText 
                            maxLenght={40} 
                            value={this._getRowValue(user.id, circle.membersInformation, askedInfo)}
                            onChange={(e) => this._handleUpdateValue(circle, askedInfo, e.target.value)}
                        />
                    )
            }
        }
        else {
            return (
                <label style={styles.longLabel}>
                    {this._renderRowValue(user.id, circle.membersInformation, askedInfo)}
                </label>
            )
        }
    }

    _isNotMissingInfo = (circle) => {
	    let userId = this.props.user.id;

	    let isNotMissingCircle = false;
	    circle.paymentModels.forEach(paymentModel => {
		    let paymentModelAskedInformation = [];
        paymentModel.conditions.forEach(condition => {
          condition.conditions.forEach(cond => {
            paymentModelAskedInformation = paymentModelAskedInformation.concat(cond.askedInformation)
          })
        })
        let isNotMissing = true;
        paymentModelAskedInformation.forEach(askedInfo => {
          if (askedInfo.type !== 'BOOLEAN' && (!circle.membersInformation || circle.membersInformation.findIndex(memberInfo => userId === memberInfo.user.id && memberInfo.information === askedInfo.id) < 0))
            isNotMissing = false
        })
        isNotMissingCircle = isNotMissing || isNotMissingCircle;
      })
      return isNotMissingCircle
    }

    _didUserFillAll = (circle, paymentModel) => {
        let userId = this.props.user.id ;
        
        let paymentModelAskedInformation = [];
        paymentModel.conditions.forEach(condition => {
            condition.conditions.forEach(cond => {
                paymentModelAskedInformation = paymentModelAskedInformation.concat(cond.askedInformation)
            })
        })       

        let didUserFillAll = true ;
        paymentModelAskedInformation.forEach(askedInfo => {
            if (!circle.membersInformation || (askedInfo.type !== 'BOOLEAN' && circle.membersInformation.findIndex(memberInfo => userId === memberInfo.user.id && memberInfo.information === askedInfo.id) < 0))
                didUserFillAll = false
        })   

        return didUserFillAll
    }

    _getAmoutToPay = (circle, paymentModel) => {
        let userId = this.props.user.id ;
        let conditionListFilled = null;
        let numberOfValidAnswer = 0 ;  
        let userInformation = circle.membersInformation.filter(info => info.user.id === userId)

        paymentModel.conditions.forEach(condition => {
            let conditionAreValidated = true; 
            let currentNumberOfValidAnswer = 0 ; 

            condition.conditions.forEach(cond => {
                let memberInfoIndex = userInformation.findIndex(userInfo => userInfo.information === cond.askedInformation.id);

                if (cond.askedInformation.type === 'BOOLEAN' || this.isConditionFilled(cond, userInformation[memberInfoIndex])) {
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
                return {
                    cents: conditionListFilled.price.cents * (1 + circle.owner.paymentModelFees / 100),
                    currency: conditionListFilled.price.currency
                }
            }
            else {
                return conditionListFilled.price
            }
        }
        else {
            if (paymentModel.memberToPayFees) {
                return {
                    cents: paymentModel.price.cents * (1 + circle.owner.paymentModelFees / 100),
                    currency: paymentModel.price.currency
                }
            }
            else 
                return paymentModel.price
        }
    }

    _getAmoutToPayText = (circle, paymentModel) => {
        if (this._didUserFillAll(circle, paymentModel)) {
            let price = this._getAmoutToPay(circle, paymentModel);
            if  (price)
                return price.cents / 100 + ' ' + price.currency
            else    
                return "- " + this.props.user.appCurrency;
        }
        else 
            return localizations.circle_member_payment_missing_info
    }

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

    _didUserPayFeesForPaymentModel = (paymentModel) => {
        return (
            !!paymentModel.memberSubscriptions && 
            paymentModel.memberSubscriptions.length > 0 && 
            paymentModel.memberSubscriptions.findIndex(memberSubscription => memberSubscription.user.id === this.props.user.id) >= 0
        )
    }

    _isPaymentExpired = (paymentModel) => {
        return (
            !!paymentModel.memberSubscriptions && 
            paymentModel.memberSubscriptions.length > 0 && 
            paymentModel.memberSubscriptions.findIndex(memberSubscription => 
                memberSubscription.user.id === this.props.user.id &&
                moment().isAfter(memberSubscription.ending_date)
            ) >= 0
        )
    }

    _getExpirationDate = (paymentModel) => {
        return (
            moment(paymentModel.memberSubscriptions.find(memberSubscription => 
                memberSubscription.user.id === this.props.user.id
            ).ending_date).format('DD/MM/YYYY')
        )
    }

    _refetch = () => {
        this.props.relay.refetch();
    }

    render() {
        
        const { user, viewer, classes } = this.props;
        const { circlesWithAskedInformation, circlesWithAskedFees, editInfo, isLoading } = this.state ;

        if (user && !user.mangoId) {
            return (
                <section style={{ margin: 30 }}>
                    <div
                        style={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'row',
                            marginTop: 30,
                            flexGrow: 0,
                        }}
                    >
                        <div style={styles.pageHeader}>
                            {localizations.circles_myPaymentModels}
                        </div>
                    </div>
                    <section>
                        <div style={{ ...styles.completeInfoText, color: colors.red }}>
                            {localizations.info_sharedInfo_complete_profile2}
                        </div>
                    </section>
                </section>
            );
        }
      
		return(
            user.circlesCircleMemberships && user.circlesCircleMemberships.edges && user.circlesCircleMemberships.edges.length > 0 && circlesWithAskedInformation.length > 0 
            ?   <section style={styles.container}>	
                    <div style={styles.pageHeader}>
                        {localizations.circles_myPaymentModels}
                    </div>
                    
                    <Grid item xs={10} sm={10} md={10} lg={10} style={{ padding: 0 }}>
                        <Paper>
                            <AppBar color="primary" position="static">
                                <Tabs
                                    className={classes.root_tabs}
                                    value={this.state.displayTab}
                                    onChange={(e, value) => {
                                        this.setState({ displayTab: value });
                                    }}
                                    variant="fullWidth"
                                    indicatorColor="primary"
                                    textColor="primary"
                                >
                                    <Tab
                                        label={localizations.circle_member_asked_payment}
                                        className={classes.tab_header}
                                    />
                                    <Tab
                                        label={localizations.circle_member_paid_memberships}
                                        className={classes.tab_header}
                                    />
                                </Tabs>
                            </AppBar>
                        </Paper>
                        {circlesWithAskedFees
                            .filter(circle => this.state.displayTab === 0 
                                ?   circle.paymentModels.findIndex(paymentModel => !this._didUserPayFeesForPaymentModel(paymentModel)) >= 0
                                :   circle.paymentModels.findIndex(paymentModel => this._didUserPayFeesForPaymentModel(paymentModel)) >= 0
                            )
                            .map((circle, index) => (
                            <Paper key={index} zDepth={4} style={{ padding: '8px 40px 15px', margin: '20px 10px' }}>
                                <label style={styles.subHeader}>
                                    {circle.name + ' ' + localizations.circle_owner + ' ' + circle.owner.pseudo}
                                </label>
                                {circle.paymentModels
                                    .filter(paymentModel => this.state.displayTab === 0 
                                        ?   !this._didUserPayFeesForPaymentModel(paymentModel)
                                        :   this._didUserPayFeesForPaymentModel(paymentModel)
                                    )
                                    .map(paymentModel => (
                                    <div key={paymentModel.id}>
                                        <div style={styles.row} >
                                            <label style={styles.longLabel}>
                                                {paymentModel.name} : {this._getAmoutToPayText(circle, paymentModel)}
                                            </label>
                                        </div>
                                        {this._didUserPayFeesForPaymentModel(paymentModel)
                                        ?   <div style={{marginTop: 15}}>
                                                {localizations.paid}
                                                {this._isPaymentExpired(paymentModel) && 
                                                    ' - ' + localizations.circle_membership_expired + this._getExpirationDate(paymentModel)
                                                }
                                            </div>
                                        :   this._isNotMissingInfo(circle) && 
                                                <div style={{marginTop: 15}}>
                                                    {paymentModel.inAppPaymentAllowed && (
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            onClick={() => {
                                                                if (this._didUserFillAll(circle, paymentModel)) {
                                                                    this.setState({
                                                                        displayFeesPaymentPopup: true,
                                                                        feesPaymentPopupProps: {
                                                                            name: paymentModel.name,
                                                                            price: this._getAmoutToPay(circle, paymentModel),
                                                                            priceText: this._getAmoutToPayText(circle, paymentModel),
                                                                            paymentViaBankWireAllowed: paymentModel.paymentViaBankWireAllowed,
                                                                            paymentModelId: paymentModel.id,
                                                                        }
                                                                    });
                                                                }
                                                                else {
                                                                    this.props.router.push('/my-shared-info')
                                                                }
                                                            }}
                                                        >
                                                            {this._didUserFillAll(circle, paymentModel) 
                                                            ?   localizations.pay
                                                            :   localizations.circle_member_payment_go_to_form
                                                            }
                                                        </Button>
                                                    )}
                                                    {(paymentModel.paymentViaBankWireAllowed || !paymentModel.inAppPaymentAllowed) && circle.owner.bankAccount &&
                                                        <div style={styles.bankAccountContainer}>
                                                            <div style={styles.bankAccountTitleContainer}>
                                                                <div style={styles.bankAccountTitle}>
                                                                    {localizations.circle_member_payment_bankAccount}
                                                                </div>
                                                                <div style={styles.bankAccountExplanation}>
                                                                    {localizations.circle_member_payment_bankAccount_explanation}
                                                                </div>
                                                            </div>
                                                            <CirclePaymentReference
                                                                viewer={viewer}
                                                                circleId={circle.id}
                                                            />
                                                            <div style={{...styles.bankAccountDetailRow, marginTop: 5}}>{localizations.bank_ownerName + ': ' + circle.owner.bankAccount.ownerName}</div>
                                                            <div style={{...styles.bankAccountDetailRow, marginTop: 5}}>{localizations.newSportunity_add_bank_account_popup_address_line_1 + ': ' + circle.owner.bankAccount.addressLine1}</div>
                                                            {circle.owner.bankAccount.addressLine2 && <div style={{...styles.bankAccountDetailRow, marginTop: 5}}>{localizations.bank_addressLine2 + ': ' + circle.owner.bankAccount.addressLine2}</div>}
                                                            <div style={{...styles.bankAccountDetailRow, marginTop: 5}}>{localizations.bank_city + ': ' + circle.owner.bankAccount.city}</div>
                                                            <div style={{...styles.bankAccountDetailRow, marginTop: 5}}>{localizations.bank_postalCode + ': ' + circle.owner.bankAccount.postalCode}</div>
                                                            <div style={{...styles.bankAccountDetailRow, marginTop: 5}}>{localizations.bank_country + ': ' + circle.owner.bankAccount.country}</div>                                    
                                                            <div style={{...styles.bankAccountDetailRow, marginTop: 5}}>{localizations.bank_IBAN + ': ' + circle.owner.bankAccount.IBAN}</div>
                                                            <div style={{...styles.bankAccountDetailRow, marginTop: 5}}>{localizations.bank_BIC + ': ' + circle.owner.bankAccount.BIC}</div>
                                                        </div>
                                                    }
                                                </div>
                                        }
                                    </div>
                                ))}
                            </Paper>
                        ))}

                    </Grid>

                    
                    {this.state.displayFeesPaymentPopup && (
                        <FeesPaymentPopup
                            viewer={viewer}
                            onClose={() => this.setState({ displayFeesPaymentPopup: false })}
                            refetch={() => this._refetch()}
                            fromWallet={false}
                            {...this.state.feesPaymentPopupProps}
                        />
                    )}
                </section>
            :   <section style={styles.container}>	
                    <div style={styles.pageHeader}>{localizations.info_sharedInfo}</div>
                    <div style={styles.explaination}>
                        {localizations.info_membership_nothing}
                    </div>
                </section>        
		)
	}
}

export default createRefetchContainer(
    withAlert(withStyles(muiStyles)(CircleMemberships)), {
    user: graphql`
        fragment CircleMemberships_user on User {
            id,
            mangoId
            appCurrency
            circlesCircleMemberships: circlesUserIsIn (last: 100) {
                edges {
                    node {
                        id,
                        name
                        owner {
                            pseudo
                            paymentModelFees
                            bankAccount {
                                addressLine1,
                                addressLine2,
                                city,
                                postalCode,
                                country,
                                ownerName,
                                IBAN,
                                BIC
                            }
                        }
                        askedInformation {
                            id, 
                            name,
                            type,
                            answers
                            filledByOwner
                            form {
                                id
                                name
                            }
                        }
                        membersInformation {
                            id,
                            information,
                            user {
                                id,
                            }
                            value
                            document {
                                id,
                                name
                            }
                            validationStatus
                            comment
                        }
                        paymentModels {
                            id,
                            name,
                            paymentViaBankWireAllowed
                            memberToPayFees
                            inAppPaymentAllowed,
                            price {
                                cents,
                                currency
                            }
                            memberSubscriptions {
                                user {
                                    id
                                }
                                amount {
                                    cents
                                    currency
                                }
                                beginning_date
                                ending_date
                            }
                            conditions {
                                id,
                                name, 
                                price {
                                    cents,
                                    currency
                                }
                                conditions {
                                    askedInformation {
                                        id
                                        type
                                    }
                                    askedInformationComparator
                                    askedInformationComparatorValue
                                    askedInformationComparatorValueString
                                    askedInformationComparatorDate
                                }
                            }
                        }
                    }
                }
            }
        }
    `,
    viewer: graphql`
        fragment CircleMemberships_viewer on Viewer {
            id
            ...CirclePaymentReference_viewer
            ...FeesPaymentPopup_viewer
        }`
    },
    graphql`query CircleMembershipsRefetchQuery {
        viewer {
            ...CircleMemberships_viewer
            me {
                ...CircleMemberships_user
            }
        }
    }`    
)
				