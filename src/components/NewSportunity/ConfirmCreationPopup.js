import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium';
import dateformat from 'dateformat'
import ReactLoading from 'react-loading'
import ReactTooltip from 'react-tooltip'
import localizations from '../Localizations'

// import './popup.css'
import { colors } from '../../theme';
import moment from "moment";
let styles;

const getPriceString = (cents, currency) => cents === 0
  ? localizations.event_free
  : `${cents} ${currency}`;

const calculateMinMaxRevenue = (price, participantRange, organizerParticipation, fees, userCurrency) => {
  if (participantRange.from === participantRange.to) {
    return `${(Math.round((participantRange.from * price * (1 - fees) + organizerParticipation) * 100) / 100).toFixed(2)} ${userCurrency}.`;
  }

  return (
    <span>
      {localizations.newSportunity_min_revenue} {(Math.round((participantRange.from * price * (1 - fees) + organizerParticipation) * 100 ) /100).toFixed(2) + ' ' + userCurrency} 
      <br/>
      {localizations.newSportunity_max_revenue} {(Math.round((participantRange.to * price * (1 - fees) + organizerParticipation) * 100) / 100).toFixed(2) + ' ' + userCurrency} 
    </span>
  );
}

const calculateCost = (sportunity, currency) => {
  let totalCost = 0 ; 
  let pendingCost = 0 ;
  sportunity.organizers.forEach(organizer => {
    totalCost = totalCost + organizer.price.cents;
  });
  sportunity.circlesOfPendingOrganizers.forEach(pendingOrg => {
    pendingCost = pendingCost + pendingOrg.price.cents ;
  })

  if (totalCost > 0 && pendingCost > 0)
    return `${(Math.round((totalCost) * 100) / 100).toFixed(2)} ${currency} (max: ${(Math.round((pendingCost + totalCost) * 100) / 100).toFixed(2)} ${currency})`
  else if (pendingCost > 0)
    return `max: ${(Math.round((pendingCost + totalCost) * 100) / 100).toFixed(2)} ${currency}`
  else 
    return `${(Math.round((totalCost) * 100) / 100).toFixed(2)} ${currency}`;
}


class ConfirmCreationPopup extends PureComponent {
  constructor() {
    super()
    this.state = {
      isFree: true,
      amountIsQueried: false,
      totalCost: 0,
    }
  }

  componentDidMount() {
    const {sportunity, me} = this.props ;
    if (sportunity.price.cents > 0)
      this.setState({
        isFree: false
      })
    else {
      sportunity.invited_circles_and_prices.forEach(circle => {
        if (circle.price && circle.price.cents > 0)
          this.setState({
            isFree: false
          })
      })
    }
    if ((sportunity.organizers && sportunity.organizers.length > 0) || (sportunity.circlesOfPendingOrganizers && sportunity.circlesOfPendingOrganizers.length > 0)) {
      let totalCost = 0 ;

      if (sportunity.organizers && sportunity.organizers.length > 0)
        sportunity.organizers.forEach(organizer => {
          totalCost = totalCost + organizer.price.cents;
        });

      if (sportunity.circlesOfPendingOrganizers && sportunity.circlesOfPendingOrganizers.length > 0)
        sportunity.circlesOfPendingOrganizers.forEach(organizer => {
          totalCost = totalCost + organizer.price.cents
        })

      if (totalCost > 0) {
        this.setState({
          totalCost
        })
      }
    }
    if (this.props.me && this.props.me.isProfileComplete) {
      this.props.queryAmount()
      this.setState({
        amountIsQueried: true
      })
    }
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.me && nextProps.me.isProfileComplete && !this.state.amountIsQueried) {
      this.props.queryAmount()
      this.setState({
        amountIsQueried: true
      })
    }
  }

  missingInfo = () => {
    const {sportunity, me} = this.props ;

    if (sportunity.price.cents > 0 && (!me.bankAccount || !me.bankAccount.IBAN || !me.isProfileComplete))
      return true;

    if (sportunity.organizerParticipation > 0 && (!me.paymentMethods || me.paymentMethods.length == 0))
      return true;

    return false;
  }

  getSportToolTipContent = (sportunity) => {

    let result = sportunity.levelFrom && sportunity.levelTo ? `${localizations.newSportunity_levels}: ${localizations.newSportunity_from} ${sportunity.levelFrom.name}, ${localizations.newSportunity_to} ${sportunity.levelTo.name}` : localizations.newSportunity_all_levels;
    result += sportunity.positions.length > 0 ? `<br/>${localizations.newSportunity_positions}: ${sportunity.positions.map((position, index) => {if (index > 0) return ' '+position.name; else return position.name})}` : '';
    result += sportunity.certificates.length > 0 ? `<br/>${localizations.newSportunity_certificates}: ${sportunity.certificates.map((certificate, index) => {if (index > 0) return ' '+certificate.name; else return certificate.name})}` : ''

    return result
  }

  render() {
    const { 
      viewer,
      sportunity,
      onConfirm,
      onConfirmTemplate,
      onClose, 
      onOpenProfilePopup, 
      onAddBankAccount, 
      bankAcccountJustAdded, 
      cardJustAdded, 
      selectedCard, 
      onChangeSelectedCard, 
      onAddCard, 
      onAddCardToPaySecondaryOrganizers,
      onChangeSelectedCardToPaySecondaryOrganizers,
      selectedCardToPaySecondaryOrganizers,
      paySecondaryOrganizersWithWallet,
      isModifying,
      processing, 
      router,
      me,
      fromTemplate,
      updateSaveTemplate,
      saveTemplate
    } = this.props;

    return (
      <div style = {styles.mainContainer}>
          <h2 style={styles.title}>
            {localizations.newSportunity_autoParticipateUnswitchACircleModalTitle}
          </h2>
          <div style = {styles.subHeading}>
            {localizations.newSportunity_name}
          </div>
          <div style = {styles.subInformation}>
            {this.props.sportunity.title}
          </div>
          <div style = {styles.subHeading}>
            {localizations.newSportunity_description}
          </div>
          <div style = {styles.subInformation}>
            {this.props.sportunity.description}
          </div>
          <h2 style={styles.title}>
            {localizations.newSportunity_sport}
          </h2>
          <div style = {styles.subHeading}>
            {localizations.newSportunity_sport}
          </div>
          <div style = {styles.subInformation}>
            {this.props.sportunity.sport.name}
          </div>
          <div style = {styles.subHeading}>
            {localizations.newSportunity_level_range}
          </div>
          <div style = {styles.subInformation}>
            {this.props.sportunity.levelFrom && this.props.sportunity.levelFrom.name} - {this.props.sportunity.levelTo && this.props.sportunity.levelTo.name}
          </div>
          <div style = {styles.subHeading}>
            {localizations.newSportunity_sportunityType}
          </div>
          <div style = {styles.subInformation}>
            {this.props.sportunity.sportunityType && this.props.sportunity.sportunityType.name}
          </div>
          <h2 style={styles.title}>
            {localizations.newSportunity_location}
          </h2>
          <div style = {styles.subHeading}>
            {localizations.newSportunity_address}
          </div>
          <div style = {styles.subInformation}>
            {this.props.sportunity.address.address},{this.props.sportunity.address.city},{this.props.sportunity.address.country},
          </div>
          <div style = {styles.subHeading}>
            {localizations.newSportunity_venue}
          </div>
          <div style = {styles.subInformation}>
          {this.props.sportunity.venue && this.props.sportunity.venue.name}
            {this.props.sportunity.venue && this.props.sportunity.venue.address && this.props.sportunity.venue.address.address}
          </div>
          <h2 style={styles.title}>
            {localizations.newSportunity_schedule}
          </h2>
          <div style = {styles.subHeading}>
            {localizations.newSportunity_date}
          </div>
          <div style = {styles.subInformation}>
            {dateformat(sportunity.beginningDate, 'dd/mm/yyyy')} <br/>{localizations.newSportunity_to} {dateformat(moment(sportunity.endingDate).add(parseInt(sportunity.repeat), 'week'), 'dd/mm/yyyy')}          </div>
          <div style = {styles.subHeading}>
            {localizations.newSportunity_hour}
          </div>
          <div style = {styles.subInformation}>
            {dateformat(sportunity.beginningDate, 'HH:MM')} <br/>{localizations.newSportunity_to} {dateformat(moment(sportunity.endingDate).add(parseInt(sportunity.repeat), 'week'), 'HH:MM')}          </div>
          <h2 style={styles.title}>
            {localizations.Participants}
          </h2>
          <div style = {styles.subHeading}>
            {localizations.newSportunity_confirmation_popup_number}
          </div>
          <div style = {styles.subInformation}>
            {this.props.sportunity.participantRange.from} - {this.props.sportunity.participantRange.to}
          </div>
          <div style = {styles.subHeading}>
            {localizations.newSportunity_privacy}
          </div>
          <div style = {styles.subInformation}>
            {this.props.sportunity.private ? localizations.newSportunity_private : localizations.newSportunity_public}
          </div>
          <div style = {styles.subHeading}>
            {localizations.Participants}
          </div>
          <div style = {styles.subInformation}>
            {this.props.sportunity.invited && this.props.sportunity.invited.length > 1 
            ? `${this.props.sportunity.invited.length} ${localizations.newSportunity_invitedMembers}` 
            : this.props.sportunity.invited && this.props.sportunity.invited.length === 1 
              ? `${this.props.sportunity.invited.length} ${localizations.newSportunity_invitedMember}`
              : `0 ${localizations.newSportunity_invitedMember}`
            }
          </div>
          <h2 style={styles.title}>
            {localizations.newSportunity_confirmation_popup_price}
          </h2>
          <div style = {styles.subHeading}>
            {localizations.newSportunity_price}
          </div>
          <div style = {styles.subInformation}>
            {this.props.sportunity.price.cents} ({this.props.sportunity.price.currency}) 
          </div>
          {/* <div style = {styles.subHeading}>
            Min Revenue
          </div>
          <div style = {styles.subInformation}>
            {!this.props.sportunity.private}
          </div>
          <div style = {styles.subHeading}>
            Max Revenue
          </div>
          <div style = {styles.subInformation}>
            {this.props.sportunity.invited} members invited
          </div> */}
           <h2 style={styles.title}>
            {localizations.event_secondary_organizer}
          </h2>
           <div style = {styles.miniHeading}>
            {localizations.event_secondary_organizer}
          </div>
          <div style = {styles.miniHeading}>
            {localizations.newSportunity_organizerRole}
          </div>
          <div style = {styles.miniHeading}>
            {localizations.newSportunity_confirmation_popup_costs}
          </div>
          {this.props.sportunity.organizers.map((organizer) => (
            <div>
              <div style = {styles.miniInformation}>
                {organizer.organizer.pseudo}
              </div>
              <div style = {styles.miniInformation}>
                {organizer.secondaryOrganizerType ? organizer.secondaryOrganizerType.name[localizations.getLanguage().toUpperCase()] : organizer.customSecondaryOrganizerType}
              </div>
              <div style = {styles.miniInformation}>
                {organizer.price.cents}
              </div>
            </div>
            ))}
          <div style={styles.buttonContainer}>
            {
              processing &&
                <ReactLoading type='cylon' color={colors.white}/>
              /*:
                <button
                  style={styles.submit}
                  onClick={() => 
                    this.state.isFree && this.state.totalCost === 0
                    ? onConfirm() // Free & no cost
                    : !this.state.isFree && !me.isProfileComplete
                      ? onOpenProfilePopup() // Not free & profile is not completed
                      : !this.state.isFree && me.isProfileComplete && (!me.bankAccount || !me.bankAccount.IBAN)
                        ? onAddBankAccount() // Not free & profile completed but no bank account
                        : this.state.totalCost > 0
                          ? me.isProfileComplete
                            ? paySecondaryOrganizersWithWallet
                              ? viewer.amountOnWallet && (viewer.amountOnWallet.amountOnWallet.cents - viewer.amountOnWallet.lockedAmount.cents) < this.state.totalCost
                                ? router.push({pathname : '/my-walletre'}) // Cost > 0 and payment with wallet (which needs to be funded)
                                : onConfirm() // Cost > 0 and payment with wallet
                              : selectedCardToPaySecondaryOrganizers === ""
                                ? onAddCardToPaySecondaryOrganizers() // Cost > 0 and payment with new card
                                : onConfirm() // Cost > 0 and payment with existing card
                            : onOpenProfilePopup()
                          : onConfirm() // Not free & cost === 0
                  }>
                  {this.state.isFree && this.state.totalCost === 0
                  ? localizations.newSportunity_confirmation_popup_validate // Free & no cost 
                  : !this.state.isFree && !me.isProfileComplete
                    ? localizations.newSportunity_confirmation_popup_validate // Not free & profile is not completed
                    : !this.state.isFree && me.isProfileComplete && (!me.bankAccount || !me.bankAccount.IBAN)
                      ? localizations.newSportunity_confirmation_popup_add_bank_account // Not free & profile completed but no bank account
                      : this.state.totalCost > 0
                        ? me.isProfileComplete
                          ? paySecondaryOrganizersWithWallet 
                            ? viewer.amountOnWallet && (viewer.amountOnWallet.amountOnWallet.cents - viewer.amountOnWallet.lockedAmount.cents) < this.state.totalCost
                              ? localizations.event_payment_make_bankWire // Cost > 0 and payment with wallet (which needs to be funded)
                              : localizations.newSportunity_confirmation_popup_validate // Cost > 0 and payment with wallet
                            : selectedCardToPaySecondaryOrganizers === ""
                              ? localizations.event_add_a_card // Cost > 0 and payment with new card
                              : localizations.newSportunity_confirmation_popup_validate // Cost > 0 and payment with existing card
                          : localizations.newSportunity_confirmation_popup_validate 
                        : localizations.newSportunity_confirmation_popup_validate // Not free & cost === 0
                  }
                </button>
            */}
          </div>
          <div style={styles.policy} data-tip={localizations.newSportunity_confirmation_popup_cancellation_policy_details}>
            {localizations.newSportunity_confirmation_popup_cancellation_policy}
            <i
              style={styles.policyIcon}
              className="fa fa-question-circle"
              aria-hidden="true"
            />
          </div>
      </div>
          
    )
  }
};


styles = {
  mainContainer : {
    padding: 20,
  },

  subHeading : {
    display : 'inline-block',
    width : '30%',
    fontSize: 16,
    margin: 10,
  },

  subInformation : {
    display : 'inline-block',
    width : '60%',
    fontSize: 16,
    margin: 10,
  },
  miniHeading : {
    display : 'inline-block',
    width : '30%',
    fontSize: 16,
    margin: 10,
  },
  miniInformation : {
    display : 'inline-block',
    width : '30%',
    fontSize: 16,
    margin: 10,
  },

  pageContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 100,

    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    width: '100vw',
    minHeight: '100vh',

    backgroundColor: colors.black,
    fontFamily: 'Lato',
    color: colors.white,
    fontSize: 16,
  },
  container: {
    width: 524,
    // height: 720,
    maxHeight: '90vh',
    backgroundColor: colors.blue,
    borderRadius: 25,
    paddingTop: 15,
    paddingBottom: 25,
    paddingLeft: 25,
    paddingRight: 25,
    position: 'relative',
    overflowY: 'auto',
  },
  title: {
    fontSize: 22,
    marginBottom: 10,
    marginTop: 20,
  },
  sportunityTitle: {
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 25
  },
  blocInfo: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 15
  },
  blocLabel: {
    width: 140,
    flexShrink: 0
  },
  infos: {
    display: 'flex',
    flexDirection: 'column'
  },
  infoLine: {
    marginBottom: 13
  },
  sportDetailsIcon: {
    marginLeft: 5,
    fontSize: 14,
    cursor: 'pointer'
  },

  calendarIcon: {
    fontSize: 18,
    marginRight: 11,
    lineHeight: "32px",
    float: 'left'
  },
  markerIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  sportIcon: {
    borderRadius: '50%',
    width: 20,
    height: 20,
    filter: 'invert(1)',
     backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'inline-block',
    marginRight: 11
  },

  cardLine:{
    display: 'flex',
    alignItems: 'center'
  },
  cardIcon: {
    width: 40,
    marginRight: 15
  },

  cardSelect: {
    width: 300,
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottomWidth: 2,
    borderBottomColor: colors.blue,
    fontFamily: 'Lato',
    paddingBottom: 5,
    fontSize: 16,
    lineHeight: 1,
    paddingLeft: 3
  },

  addBankAccountButton: {
    cursor: 'pointer',
    paddingBottom: 2,
    textDecoration: 'underline',
    textAlign: 'center'
  },
  addCardButton: {
    cursor: 'pointer',
    paddingBottom: 2,
    textDecoration: 'underline',
    textAlign: 'center'
  },
  buttonContainer: {
     paddingTop : 50,
    margin: 'auto',
    display: 'flex',
    justifyContent: 'center'
  },

  submit: {
    backgroundColor: colors.green,
    color: colors.white,
    width: 230,
    height: 70,
    borderRadius: 100,
    borderStyle: 'none',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    fontSize: 22,
    cursor: 'pointer',

    ':disabled': {
      cursor: 'not-allowed',
      backgroundColor: colors.gray,
    },
  },
  policy: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
    fontSize: 14,
    cursor: 'pointer'
  },
  policyIcon: {
    marginLeft: 5,
  },

  closeCross: {
    cursor: 'pointer',
    width: 30,
    height: 30,
    textAlign: 'center',
    position: 'absolute',
    right: 20
  },
  cancelIcon: {
    fontSize: 25,
    lineHeight: '29px'
  },
  checkBox: {
    cursor: 'pointer',
    height: 14,
    width: 14,
    marginRight: 10,
  }
};

const dispatchToProps = (dispatch) => ({
})
  
const stateToProps = (state) => ({
    userCurrency: state.globalReducer.userCurrency,
})

let ReduxContainer = connect(
    stateToProps,
    dispatchToProps
)(Radium(ConfirmCreationPopup));

export default ReduxContainer
