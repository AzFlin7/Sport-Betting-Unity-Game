import React from 'react';
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium';
// import Card from 'react-credit-card';
import { withAlert } from 'react-alert'
import _Geosuggest from 'react-geosuggest';
import ReactLoading from 'react-loading'
import localizations from '../Localizations'

// import './cards.css'
// import '../NewSportunity/popup.css'
import { colors } from '../../theme';
let styles;

const Geosuggest = Radium(_Geosuggest);

import UpdateUserProfileMutation from './UpdateUserProfileMutation';


class AddACardPopup extends React.Component {
  constructor() {
    super(); 
    this.alertOptions = {
      offset: 60,
      position: 'top right',
      theme: 'light',
      transition: 'fade',
    };
    this.state = {
      cardNumber: '',
      cardExpires: '',
      cardCVC: '',
      focused: '',
      isProfileComplete: true,
      processSaveProfile: false,
    }
  }

  componentDidMount() {
    this.props.relay.refetch(fragmentVariables => ({
      ...fragmentVariables,
      queryCardRegistration: true,
      cardRegistrationCurrency: this.props.price.currency
    }))
    setTimeout(() => {
      if (!this.props.viewer.cardRegistration)
        this.props.alert.show(localizations.popup_addACard_error_occured, {
          timeout: 4000,
          type: 'error',
        });
    }, 1000)
  }

  getPriceString = (cents, currency) => cents === 0
    ? localizations.event_free
    : `${cents / 100} ${currency}`;

  _handleCardNumberChange = (e) => {
    if (e.target.value && e.target.value.length <= 16)
      this.setState({
        cardNumber: e.target.value
      })
    else if (!e.target.value) 
      this.setState({
        cardNumber: ''
      })
  }

  _handleCardExpiresChange = (e) => {
    if (e.target.value && e.target.value.length <= 4)
      this.setState({
        cardExpires: e.target.value
      })
    else if (!e.target.value) 
      this.setState({
        cardExpires: ''
      })
  }

  _handleCardCVCChange = (e) => {
    if (e.target.value && e.target.value.length <= 3)
      this.setState({
        cardCVC: e.target.value
      })
    else if (!e.target.value) 
      this.setState({
        cardCVC: ''
      })
  }

  _handleCardNumberFocus = (e) => {
    this.setState({
      focused: 'number'
    })
  }

  _handleCardExpiresFocus = (e) => {
    this.setState({
      focused: 'expiry'
    })
  }

  _handleCardCVCFocus = (e) => {
    this.setState({
      focused: 'cvc'
    })
  }  

  render() {
   const { price, onConfirm, onClose, me, viewer, processing } = this.props ;
    return (
      <div style={styles.pageContainer}>
        <div style={styles.container} id="popupContainer">
          <span onClick={onClose} style={styles.closeCross}>
            <i className="fa fa-times" style={styles.cancelIcon} aria-hidden="true"></i>
          </span> 
          <div style={styles.title}>
            {localizations.event_add_a_card}
          </div>
          <div style={styles.subtitle}>
            {localizations.event_payment_information}
          </div>
          <div style={styles.blocInfo}>
            <div style={styles.blocLabel}>
              {localizations.event_price}
            </div>
            <div style={styles.infos}>
              <div style={styles.infoLine}>
                {this.getPriceString(price.cents, price.currency)}
              </div>
            </div>
          </div>
          <div style={styles.blocInfo}>
            <div style={styles.blocLabel}>
              {localizations.event_supported_cards}
            </div>
            <div style={styles.infos}>
              <div style={styles.infoLine}>
                {localizations.event_supported_cards_list}
              </div>
              <div>
                <img style={styles.cardsIcon} src="/images/accepted_cards.png"/>
              </div>
            </div>
          </div>
          <div style={styles.cardBloc}>
            {/* <Card 
              number={this.state.cardNumber}
              expiry={this.state.cardExpires}
              cvc={this.state.cardCVC}
              focused={this.state.focused}
              name=" "
            /> */}
          </div>
          <div style={styles.cardForm}> 
            <div style={styles.formFirstLine}>
              <input 
                type="number" 
                value={this.state.cardNumber} 
                placeholder={localizations.card_number}
                onChange={this._handleCardNumberChange}
                onFocus={this._handleCardNumberFocus}
                style={styles.formCardNumber}
              />
            </div>
            <div style={styles.formSecondLine}>
              <input 
                type="text" 
                value={this.state.cardExpires} 
                placeholder={localizations.card_expiry}
                onChange={this._handleCardExpiresChange}
                onFocus={this._handleCardExpiresFocus}
                style={styles.formExpires}
              />
              <input 
                type="number" 
                value={this.state.cardCVC} 
                placeholder={localizations.card_CVC}
                onChange={this._handleCardCVCChange}
                onFocus={this._handleCardCVCFocus}
                style={styles.formCVC}
              />
            </div>
          </div>
          <div style={styles.buttonContainer}>
            {
              processing ? <ReactLoading type='cylon' color={colors.white}/>
              :              
                <button
                  style={styles.confirm}
                  title={localizations.card_add}
                  onClick={() => onConfirm(this.props.viewer.cardRegistration, {cardNumber: this.state.cardNumber, cardExpirationDate: this.state.cardExpires, cardCvx: this.state.cardCVC, cardType: "CB_VISA_MASTERCARD"})}>
                    {localizations.card_add}
                </button>
            }
          </div>
        </div>
      </div>
    )
  }
}


styles = {
  pageContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 200,

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
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 35
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25
  },
  blocInfo: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 10
  },
  blocLabel: {
    width: 120,
    flexShrink: 0
  },
  infos: {
    display: 'flex',
    flexDirection: 'column'
  },
  infoLine: {
    marginBottom: 13
  },

  cardsIcon: {
    width: '65%',
    minWidth: 170
  },  
  cardBloc: {
    marginTop: 15,
  },
  cardForm: {
    marginTop: 15,
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  formFirstLine: {
    display: 'block',
    marginTop: 5,
    textAlign: 'center'
  },
  formCardNumber: {
    width: 230
  },
  formSecondLine: {
    textAlign: 'center'
  },
  formExpires: {
    width: 130
  },
  formCVC: {
    width: 100
  },

  saveProfile: {
    backgroundColor: colors.green,
    color: colors.white,
    width: 230,
    height: 50,
    borderRadius: 100,
    borderStyle: 'none',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    fontSize: 22,
    cursor: 'pointer',
    position: 'relative',
    left: 'calc(50% - 115px)',
    ':disabled': {
      cursor: 'not-allowed',
      backgroundColor: colors.gray,
    },

  },

  buttonContainer: {
    margin: 'auto',
    display: 'flex',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10
  },

  confirm: {
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
  nameInput: {
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

  geosuggest: {
    input: {
      width: 300,
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      borderBottomWidth: 2,
      borderBottomColor: colors.blue,
      paddingRight: 20,

      fontSize: 16,
      fontFamily: 'Lato',
      lineHeight: 1,
      paddingLeft: 3,
      paddingBottom: 5,

      outline: 'none',
      ':focus': {
        borderBottomColor: colors.green,
      },
    },

    suggests: {
      width: 300,
      position: 'absolute',
      backgroundColor: colors.white,

      boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
      border: '2px solid rgba(94,159,223,0.83)',
      padding: 20,
      zIndex: 100,
    },

    suggestItem: {
      paddingTop: 10,
      paddingBottom: 10,
      color: '#515151',
      fontSize: 18,
      fontWeight: 500,
      fontFamily: 'Helvetica Neue',
    },
    
  },

  updateProfileProcessing: {
    position: 'relative',
    left: 'calc(50% - 32px)'
  },
  
};

export default createRefetchContainer(Radium(withAlert(AddACardPopup)), {
  viewer: graphql`
    fragment AddACard_viewer on Viewer @argumentDefinitions (
      queryCardRegistration: {type: "Boolean!", defaultValue: false},
      cardRegistrationCurrency: {type: "Currency"}
    ){
      me {
        id
        lastName
      }
      cardRegistration (currency: $cardRegistrationCurrency) @include(if: $queryCardRegistration) {
        cardRegistrationId, 
        preregistrationData,
        accessKey,
        cardRegistrationURL
      }
    }
  `,
},
  graphql`
    query AddACardRefetchQuery(
      $queryCardRegistration: Boolean!,
      $cardRegistrationCurrency: Currency
    ) {
      viewer {
        ...AddACard_viewer @arguments(
          queryCardRegistration: $queryCardRegistration,
          cardRegistrationCurrency: $cardRegistrationCurrency
        )
      }
    }
  `,
);
