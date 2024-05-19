import React from 'react';
import { createRefetchContainer, graphql } from 'react-relay/compat';
import Radium from 'radium';
import ReactLoading from 'react-loading';
import ReactTooltip from 'react-tooltip';
import { withAlert } from 'react-alert';

import localizations from '../../Localizations';
import { colors } from '../../../theme';
import requireCashOutMutation from './RequireCashOutMutation';
import requireCashInMutation from './RequireCashInMutation';
import constants from "../../../../constants.json";

let styles;

class PaymentPopup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      processing: false,
      payAmount: '',
      selectedPaymentMethods: null,
    };
    this.onConfirmClick = this.onConfirmClick.bind(this);
  }

  componentDidMount() {
    const { bankAccount, paymentMethods } = this.props.viewer.me;
    // set default payment method
    if (bankAccount && bankAccount.id) {
      this.setState({ selectedPaymentMethods: bankAccount.id });
    } 
    else if (paymentMethods && paymentMethods[0] && paymentMethods[0].id && this.props.type === 'cashIn') {
      this.setState({ selectedPaymentMethods: paymentMethods[0].id });
    }
  }

  onConfirmClick() {
    const { selectedPaymentMethods, payAmount } = this.state;
    const { viewer, type, selectedWallet } = this.props;
    const { me } = viewer;
    const { bankAccount, paymentMethods } = this.props.viewer.me;
    this.setState({processing: true})
    //
    let currency = 'CHF';
    if (selectedWallet && selectedWallet.currency) {
      currency = selectedWallet.currency;
    }
    let cents = 0;
    if (selectedWallet && selectedWallet.cents) {
      cents = selectedWallet.cents;
    }
    //
    // cash in bank
    if (type === 'cashIn' && bankAccount && selectedPaymentMethods === bankAccount.id) {
      this.setState({ processing: true });

      this.props.relay.refetch(fragmentVariables => ({
          ...fragmentVariables,
          queryBankWireToWallet: true,
          amount: { cents: payAmount * 100, currency },
        }),
        null,
        () => {
          this.setState({ processing: false });
        },
        { force: true },
      );
    }
    // cash in credit card
    else if (type === 'cashIn' && (bankAccount && selectedPaymentMethods !== bankAccount.id) || !bankAccount) {
      requireCashInMutation.commit(
        {
          userId: me.id,
          amount: {
            cents: payAmount * 100,
            currency,
          },
          paymentMethodId: selectedPaymentMethods,
          confirmationPage: constants.appUrl + '/cashin-confirmation'
        },
        (response, errors) => {
          this.setState({ processing: false });
          if (response && !errors) {
            if (response && response.requireCashIn && response.requireCashIn.secure3DURL) {
              window.location.href = response.requireCashIn.secure3DURL;
            }
            else {
              this.props.alert.show(localizations.paymentsuccesful, { timeout: 5000, type: 'success' });
              this.props.refetch();
              this.props.onClose();
            }
          } 
          else {
            this.props.alert.show('error', {
              timeout: 2000,
              type: 'error',
            });
          }
        },
        error => {
          this.setState({ loading: false });
          this.props.alert.show('error', {
            timeout: 2000,
            type: 'error',
          });
        },
      );
    }
    // cash out bank
    else if (type === 'cashOut' && bankAccount && selectedPaymentMethods === bankAccount.id) {
      if (payAmount * 100 > cents) {
        this.props.alert.show(
          'Cash out amount needs to be more that available amount',
          {
            timeout: 2000,
            type: 'error',
          },
        );
        return;
      }
      requireCashOutMutation.commit(
        {
          userId: me.id,
          amount: {
            cents: payAmount * 100,
            currency,
          },
        },
        (response, errors) => {
          this.setState({ processing: false });
          if (response && response.requireCashOut) {
            this.props.alert.show(localizations.BankwireSent, {
              timeout: 5000,
              type: 'success',
            });
            setTimeout(() => this.props.refetch(), 5000);
            this.props.onClose();
          } else {
            this.props.alert.show('error', {
              timeout: 2000,
              type: 'error',
            });
          }
        },
        error => {
          this.props.alert.show('error', {
            timeout: 2000,
            type: 'error',
          });
        },
      );
    }
  }

  render() {
    const { processing } = this.state;
    const { viewer, onClose, title, buttonText, text, type } = this.props;
    //
    const { payAmount, selectedPaymentMethods } = this.state;
    //
    const paymentItems = [];
    if (viewer.me && viewer.me.bankAccount && viewer.me.bankAccount.IBAN) {
      paymentItems.push(
        <option value={viewer.me.bankAccount.id}>
          {'IBAN : ' + viewer.me.bankAccount.IBAN}
        </option>,
      );
    }
    if (
      viewer.me &&
      viewer.me.paymentMethods &&
      viewer.me.paymentMethods.length &&
      type === 'cashIn'
    ) {
      viewer.me.paymentMethods.map(i => {
        paymentItems.push(<option value={i.id}>{i.cardMask + ' (' + i.currency + ')'}</option>);
      });
    }
    //
    let amountOnWallet = this.props.selectedWallet
    //
    if (viewer.bankwireToWallet && viewer.bankwireToWallet.wireReference) {
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
            <div style={styles.sportunityTitle}>{title}</div>

            <div style={styles.blocInfo}>
              <div style={styles.infos}>
                <div style={styles.infoLine}>
                  {localizations.info_wallet_bankwire_delay_explaination}
                </div>
              </div>
            </div>
            <div style={styles.blocInfo}>
              <div style={styles.blocLabel}>
                {localizations.info_wallet_wire_reference}
              </div>
              <div style={styles.infos}>
                <div style={styles.infoLine}>
                  <div>{viewer.bankwireToWallet.wireReference}</div>
                </div>
              </div>
            </div>
            <div style={styles.blocInfo}>
              <div style={styles.blocLabel}>
                {localizations.info_wallet_bankAccount_type}
              </div>
              <div style={styles.infos}>
                <div style={styles.infoLine}>
                  <div>IBAN</div>
                </div>
              </div>
            </div>
            <div style={styles.blocInfo}>
              <div style={styles.blocLabel}>
                {localizations.info_wallet_ownerName}
              </div>
              <div style={styles.infos}>
                <div style={styles.infoLine}>
                  <div>MANGOPAY</div>
                </div>
              </div>
            </div>
            <div style={styles.blocInfo}>
              <div style={styles.blocLabel}>
                {localizations.info_wallet_ownerAddress}
              </div>
              <div style={styles.infos}>
                <div style={styles.infoLine}>
                  <div>1 Mango Street 75010, Paris, FR</div>
                </div>
              </div>
            </div>
            <div style={styles.blocInfo}>
              <div style={styles.blocLabel}>
                {localizations.info_wallet_IBAN}
              </div>
              <div style={styles.infos}>
                <div style={styles.infoLine}>
                  <div>FR7618829754160173622224251</div>
                </div>
              </div>
            </div>
            <div style={styles.blocInfo}>
              <div style={styles.blocLabel}>
                {localizations.info_wallet_BIC}
              </div>
              <div style={styles.infos}>
                <div style={styles.infoLine}>
                  <div>CMBRFR2BCME</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
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
          <div style={styles.sportunityTitle}>{title}</div>
          <div style={styles.blocInfo}>
            <div style={styles.infos}>
              <div style={styles.infoLine}>
                {`${text} ${amountOnWallet.cents / 100} ${
                  amountOnWallet.currency
                }`}
              </div>
            </div>
          </div>
          <div style={styles.blocInfo}>
            <div style={styles.blocLabel}>{localizations.event_price}</div>
            <div style={styles.infos}>
              <div style={styles.infoLine}>
                <div>
                  <input
                    type="text"
                    value={payAmount}
                    onChange={e => {
                      if (
                        parseInt(e.target.value) ||
                        e.target.value === '' ||
                        e.target.value == 0
                      ) {
                        this.setState({ payAmount: e.target.value });
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {paymentItems.length && (
            <div style={styles.blocInfo}>
              <div style={styles.blocLabel}>{localizations.event_payment}</div>
              <div style={styles.infos}>
                <div style={styles.infoLine}>
                  <div>
                    <select
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

          {type === "cashIn" && viewer.amountOnWallet && viewer.amountOnWallet.amountOnWallets && viewer.amountOnWallet.amountOnWallets.length > 1 && (
            <div style={styles.blocInfo}>
              <div style={styles.blocLabel}>{localizations.newSportunity_changeCurrency}</div>
              <div style={styles.infos}>
                <div style={styles.infoLine}>
                  <div>
                    <select
                      value={viewer.amountOnWallet.amountOnWallets.findIndex(w => w.currency === amountOnWallet.currency)}
                      onChange={e => this.props.changeSelectedWallet(viewer.amountOnWallet.amountOnWallets[e.target.value])}
                    >
                      {viewer.amountOnWallet.amountOnWallets.map((wallet, index) => (
                        <option id={index} value={index}>
                          {wallet.currency}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={styles.buttonContainer}>
            {selectedPaymentMethods && viewer.me.paymentMethods.find(paymentMethod => paymentMethod.id === selectedPaymentMethods) && viewer.me.paymentMethods.find(paymentMethod => paymentMethod.id === selectedPaymentMethods).currency !== amountOnWallet.currency
            ? <span style={styles.errorMessage}>
                {localizations.cash_in_wrong_currency}
              </span>
            : processing 
            ? <ReactLoading type="cylon" color={colors.white} />
            : <button style={styles.book} onClick={this.onConfirmClick}>
                {buttonText}
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

  errorMessage: {
    color: colors.red,
    marginBottom: 30
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
  Radium(withAlert(PaymentPopup)),
  {
    viewer: graphql`
      fragment PaymentPopup_viewer on Viewer
        @argumentDefinitions(
          queryAmount: { type: "Boolean!", defaultValue: true }
          queryBankWireToWallet: { type: "Boolean!", defaultValue: false }
          amount: { type: "PriceInput!", defaultValue: "null" }
        ) {
        id
        me {
          id
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
        amountOnWallet @include(if: $queryAmount) {
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
        bankwireToWallet(amount: $amount)
          @include(if: $queryBankWireToWallet) {
          wireReference
          bankAccountType
          ownerName
          ownerAddress
          IBAN
          BIC
        }
      }
    `,
  },
  graphql`
    query PaymentPopupRefetchQuery(
      $queryAmount: Boolean!
      $queryBankWireToWallet: Boolean!
      $amount: PriceInput!
    ) {
      viewer {
        ...PaymentPopup_viewer
          @arguments(
            amount: $amount
            queryAmount: $queryAmount
            queryBankWireToWallet: $queryBankWireToWallet
          )
      }
    }
  `,
);
