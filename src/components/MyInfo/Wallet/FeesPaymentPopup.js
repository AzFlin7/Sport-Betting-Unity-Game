import React from 'react';
import { createRefetchContainer, graphql } from 'react-relay/compat';
import Radium from 'radium';
import ReactLoading from 'react-loading';
import ReactTooltip from 'react-tooltip';
import { withAlert } from 'react-alert';
import mangoPay from 'mangopay-cardregistration-js-kit';

import constants from 'sportunity/constants.json'
import localizations from '../../Localizations';
import { colors } from '../../../theme';
import RegisterCardDataMutation from '../../EventView/RegisterCardDataMutation';
import AddACard from '../../EventView/AddACard'
import MemberPaysMemberShipFeesMutation from './MemberPaysMemberShipFeesMutation';

import {
  mangoPayUrl,
  mangoPayClientId,
} from '../../../../constants';

mangoPay.cardRegistration.baseURL = mangoPayUrl;
mangoPay.cardRegistration.clientId = mangoPayClientId;

let styles;

class FeesPaymentPopup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      processing: false,
      selectedPaymentMethods: null,
      selectedWallet: null,
      displayAddACardPopup: false,
      isAddCardProcessing: false,
      cardJustAdded: false
    };
  }

  componentDidMount() {
    const { amountOnWallet } = this.props.viewer;
    const { bankAccount, paymentMethods } = this.props.viewer.me;
    const { paymentViaBankWireAllowed, price } = this.props;
    
    // set default payment method
    if (amountOnWallet.amountOnWallets && amountOnWallet.amountOnWallets.length > 0 && amountOnWallet.amountOnWallets.find(w => w.currency === price.currency)) {
      this.setState({ selectedPaymentMethods: 'wallet_' +  amountOnWallet.amountOnWallets.find(w => w.currency === price.currency).currency});
    } 
    else if (paymentMethods && paymentMethods[0] && paymentMethods[0].id) {
      this.setState({ selectedPaymentMethods: paymentMethods[0].id });
    }
    else {
      this.setState({ selectedPaymentMethods: 'add_a_card'})
    }
  }

  isValidCard(card) {
    return (
      card.cardNumber &&
      card.cardNumber.length === 16 &&
      card.cardExpirationDate &&
      card.cardExpirationDate.length === 4 &&
      card.cardCvx &&
      card.cardCvx.length === 3 &&
      card.cardType
    );
  }

  _handleConfirmAddACard = (cardRegistration, card) => {
    if (!cardRegistration) {
      this.props.alert.show(localizations.popup_addACard_card_removed_error, {
        timeout: 2000,
        type: 'error',
      });

      return;
    }

    if (!this.isValidCard(card)) {
      this.props.alert.show(localizations.popup_addACard_invalid_card, {
        timeout: 2000,
        type: 'error',
      });
      return;
    }

    this.setState({ isAddCardProcessing: true });

    let that = this;
    if (card)
      mangoPay.cardRegistration.init({
        Id: cardRegistration.cardRegistrationId,
        cardRegistrationURL: cardRegistration.cardRegistrationURL,
        accessKey: cardRegistration.accessKey,
        preregistrationData: cardRegistration.preregistrationData,
      });
    mangoPay.cardRegistration.registerCard(
      card,
      function(res) {
        that.updateCard(cardRegistration, res.RegistrationData);
      },
      function(res) {
        // Handle error, see res.ResultCode and res.ResultMessage
        that.props.alert.show(res.ResultMessage, {
          timeout: 4000,
          type: 'error',
        });
        that.setState({
          isAddCardProcessing: false,
        });
      },
    );
  };

  updateCard(cardRegistration, registrationData) {
    RegisterCardDataMutation.commit(
      {
        viewer: this.props.viewer,
        cardRegistration: cardRegistration,
        registrationData: registrationData,
      },
      {
        onSuccess: res => {
          this.props.alert.show(localizations.popup_addACard_success, {
            timeout: 2000,
            type: 'success',
          });
          console.log("res", res)
          this.setState({
            selectedPaymentMethods:
              res.registerCardData.viewer.me.paymentMethods.length > 0
                ? res.registerCardData.viewer.me.paymentMethods[
                    res.registerCardData.viewer.me.paymentMethods.length - 1
                  ].id
                : '',
            displayAddACardPopup: false,
            cardJustAdded: true,
            isAddCardProcessing: false,
          });
        },
        onFailure: error => {
          this.props.alert.show(localizations.popup_addACard_error, {
            timeout: 5000,
            type: 'error',
          });
          this.setState({
            isAddCardProcessing: false,
          });
        },
      },
    );
  }

  onConfirmClick = () => {
    const { selectedPaymentMethods } = this.state;
    const { viewer, paymentModelId, price } = this.props;
    const { me, amountOnWallet } = viewer;

    if (selectedPaymentMethods.indexOf('wallet_') >= 0 && 
      amountOnWallet.amountOnWallets.find(w => "wallet_" + w.currency === selectedPaymentMethods) &&
      amountOnWallet.amountOnWallets.find(w => "wallet_" + w.currency === selectedPaymentMethods).cents < price.cents) {
        this.props.alert.show(localizations.wallet_not_enough, {
          timeout: 2000,
          type: 'error',
        });
        return;
      }

    if (selectedPaymentMethods === 'add_a_card') {
      this.setState({displayAddACardPopup: true})
    }
    else {
      MemberPaysMemberShipFeesMutation.commit(
        {
          userId: me.id,
          paymentModelId,
          paymentMethodId:
            selectedPaymentMethods.indexOf('wallet') < 0 ? selectedPaymentMethods : null,
          paymentWithWallet: selectedPaymentMethods.indexOf('wallet') >= 0,
          amount: price,
          confirmationPage: this.props.fromWallet
            ? constants.appUrl + '/my-wallet/payment-confirmation'
            : constants.appUrl + '/my-membership-fees/payment-confirmation'
        },
        (response, errors) => {
          if (response && !errors) {
            if (response.memberSubscribes && response.memberSubscribes.secure3DURL) {
              window.location.href = response.memberSubscribes.secure3DURL;
            }
            else {
              this.props.alert.show(localizations.paymentsuccesful, { timeout: 5000, type: 'success' });
              this.props.refetch();
              this.props.onClose();
            }
          } 
          else {
            this.props.alert.show(localizations.event_VoteForManOfTheGame_failed, {
              timeout: 2000,
              type: 'error',
            });
          }
        },
        error => {
          this.props.alert.show(localizations.event_VoteForManOfTheGame_failed, {
            timeout: 2000,
            type: 'error',
          });
        },
      );
    }
  }

  render() {
    const { processing, selectedPaymentMethods, cardJustAdded } = this.state;
    const {
      viewer,
      onClose,
      name,
      price,
      priceText,
      paymentViaBankWireAllowed,
      paymentModelId,
      viewer: { amountOnWallet }
    } = this.props;

    const paymentItems = [];
    if (amountOnWallet && amountOnWallet.amountOnWallets && amountOnWallet.amountOnWallets.length > 0) {//} amountOnWallet.amountOnWallet.cents >= price.cents) {
      amountOnWallet.amountOnWallets.forEach(wallet => {
        paymentItems.push(
          <option key="wallet" value={"wallet_" + wallet.currency}>
            {localizations.event_payment_wallet + 
              ' (' + 
              localizations.event_payment_wallet_available +
              wallet.cents / 100 +
              ' ' +
              wallet.currency + 
              ')'
            }
          </option>
        );
      });
    }

    if (viewer.me && viewer.me.paymentMethods && viewer.me.paymentMethods.length) {
      viewer.me.paymentMethods.map(i => {
        paymentItems.push(<option key={i.id} value={i.id}>{i.cardMask + ' (' + i.currency + ')'}</option>);
      });
    }
    if (!cardJustAdded)
      paymentItems.push(<option key="add_a_card" value={"add_a_card"}>{localizations.event_add_a_card}</option>);
    
    if (viewer.me && this.state.displayAddACardPopup) {
      return (
        <AddACard
          price={price}
          onConfirm={this._handleConfirmAddACard}
          onClose={() => this.setState({displayAddACardPopup: false})}
          viewer={viewer}
          me={viewer.me}
          processing={this.state.isAddCardProcessing}
        />
      )
    }

    return (
      <div style={styles.pageContainer}>
        <ReactTooltip effect="solid" multiline={true} />
        <div style={styles.container} id="popupContainer">
          <span onClick={onClose} style={styles.closeCross}>
            <i
              className="fa fa-times"
              style={styles.cancelIcon}
              aria-hidden="true"
            />
          </span>
          <div style={styles.sportunityTitle}>{name}</div>
          <div style={styles.blocInfo}>
            <div style={styles.blocLabel}>{localizations.event_price}</div>
            <div style={styles.infos}>
              <div style={styles.infoLine}>
                <div>
                  <p>{priceText}</p>
                </div>
              </div>
            </div>
          </div>

          {paymentItems.length > 0 && (
            <div style={styles.blocInfo}>
              <div style={styles.blocLabel}>{localizations.event_payment}</div>
              <div style={styles.infos}>
                <div style={styles.infoLine}>
                  <div>
                    <select
                      style={styles.cardSelect} 
                      value={selectedPaymentMethods}
                      onChange={e => {
                        this.setState({
                          selectedPaymentMethods: e.target.value,
                        });
                      }}
                    >
                      {paymentItems}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={styles.buttonContainer}>
            {(selectedPaymentMethods && 
            ((viewer.me.paymentMethods.find(paymentMethod => paymentMethod.id === selectedPaymentMethods) && 
            viewer.me.paymentMethods.find(paymentMethod => paymentMethod.id === selectedPaymentMethods).currency !== price.currency) ||
            (selectedPaymentMethods.indexOf('wallet_') >= 0 && amountOnWallet.amountOnWallets.find(w => "wallet_" + w.currency === selectedPaymentMethods) && 
            amountOnWallet.amountOnWallets.find(w => "wallet_" + w.currency === selectedPaymentMethods).currency !== price.currency
            )))
            ? <span style={styles.errorMessage}>
                {selectedPaymentMethods.indexOf('wallet_') >= 0
                ? localizations.fees_wallet_wrong_currency.replace('{0}', price.currency)
                : localizations.fees_add_a_card_wrong_currency.replace('{0}', price.currency)
                }
              </span>
            : processing 
              ? <ReactLoading type="cylon" color={colors.white} />
              : <button style={styles.book} onClick={this.onConfirmClick}>
                  {selectedPaymentMethods === 'add_a_card' 
                  ? localizations.event_add_a_card
                  : localizations.pay
                  }
                </button>
            }
          </div>
        </div>
      </div>
    );
  }
}

styles = {
  pageContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 99,

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
    paddingLeft: 20,
    paddingRight: 25,
    position: 'relative',
    overflowY: 'auto',
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
  },
  sportunityTitle: {
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 25,
  },
  blocInfo: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 25,
  },
  blocLabel: {
    width: 120,
    flexShrink: 0,
  },
  infos: {
    display: 'flex',
    flexDirection: 'column',
  },
  infoLine: {
    marginBottom: 13,
  },

  errorMessage: {
    color: colors.red,
    marginBottom: 40
  },

  calendarIcon: {
    fontSize: 18,
    marginRight: 11,
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
    marginRight: 11,
  },

  cardLine: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    width: 40,
    marginRight: 15,
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
    paddingLeft: 3,
  },

  addACardButton: {
    cursor: 'pointer',
    width: 300,
    textAlign: 'center',
    textDecoration: 'underline',
  },

  buttonContainer: {
    margin: 'auto',
    display: 'flex',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
  },

  book: {
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
    cursor: 'pointer',
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
    right: 20,
  },
  cancelIcon: {
    fontSize: 25,
    lineHeight: '29px',
  },
};

export default createRefetchContainer(
  Radium(withAlert(FeesPaymentPopup)),
  {
    viewer: graphql`
      fragment FeesPaymentPopup_viewer on Viewer {
        id
        ...AddACard_viewer
        me {
          id
          mangoId
          bankAccount {
            id
            addressLine1
            addressLine2
            city
            postalCode
            country
            ownerName
            IBAN
            BIC
          }
          paymentMethods {
            id
            cardMask
            cardType
            expirationDate
            currency
          }
        }
        amountOnWallet  {
          amountOnWallet {
            cents
            currency
          }
          amountOnWallets {
            cents
            currency
          }
          lockedAmount {
            cents
            currency
          }
        }
      }
    `,
  },
  graphql`
    query FeesPaymentPopupRefetchQuery{
      viewer {
        ...FeesPaymentPopup_viewer
      }
    }
  `,
);
