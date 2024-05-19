import React from 'react';
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium';
import {formatDate} from './formatDate';
import ReactLoading from 'react-loading'
import ReactTooltip from 'react-tooltip'
import localizations from '../Localizations'

// import '../NewSportunity/popup.css'
import { colors } from '../../theme';
let styles;

class ConfirmBookingPopup extends React.Component {
  constructor() {
    super();
    this.state = {
      amountIsQueried: false
    }
  }

  componentDidMount = () => {
    if (this.props.me && this.props.me.isProfileComplete) {
      this.props.relay.refetch(fragmentVariables => ({
        ...fragmentVariables, 
        queryAmount: true
      }))
      this.setState({
        amountIsQueried: true
      })
    }
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.me && nextProps.me.isProfileComplete && !this.state.amountIsQueried) {
      this.props.relay.refetch(fragmentVariables => ({
        ...fragmentVariables,
        queryAmount: true
      }))
      this.setState({
        amountIsQueried: true
      })
    }
  }

  getPriceString = (cents, currency) => cents === 0
    ? localizations.event_free
    : `${cents / 100} ${currency}`;

  getSportNameTranslated = (sportName) => {
    let name = sportName.EN
    switch(localizations.getLanguage().toLowerCase()) {
      case 'en':
        name = sportName.EN
        break
      case 'fr':
        name = sportName.FR || sportName.EN
        break
      default:
        name = sportName.EN
        break
    }
    return name
  }

  render() {
    const { 
      viewer, 
      sportunity, 
      onConfirm, 
      onClose, 
      onAddACard, 
      onOpenProfilePopup, 
      onChangeSelectedCard, 
      cardJustAdded, 
      selectedCard, 
      paymentWithWallet,
      me, 
      router, 
      processing, 
      shouldGoToJoinWaitingList } = this.props;

    const selectedWallet = paymentWithWallet && this.props.selectedWallet && viewer.amountOnWallet.amountOnWallets.find(w => "wallet_" + w.currency === this.props.selectedWallet)

    return (
      <div style={styles.pageContainer}>
        <ReactTooltip effect="solid" multiline={true}/>
        <div style={styles.container} id="popupContainer">
          <span onClick={onClose} style={styles.closeCross}>
            <i className="fa fa-times" style={styles.cancelIcon} aria-hidden="true"></i>
          </span> 
          <div style={styles.title}>
            {shouldGoToJoinWaitingList ? localizations.event_join_waiting_list : localizations.event_book}
          </div>
          <div style={styles.sportunityTitle}>{sportunity.title}</div>
          <div style={styles.blocInfo}>
            <div style={styles.blocLabel}>
              {localizations.event_details}
            </div>
            <div style={styles.infos}>
              <div style={styles.infoLine}>
                <div style={{ ...styles.sportIcon, backgroundImage: `url(${sportunity.sport.sport.logo})` }} />
                <span>{this.getSportNameTranslated(sportunity.sport.sport.name)}</span>
              </div>
              <div style={styles.infoLine}>
                <i
                  style={styles.markerIcon}
                  className="fa fa-map-marker"
                  aria-hidden="true"
                />
                {sportunity.address && sportunity.address.address+', '+sportunity.address.city}
              </div>
              <div style={styles.infoLine}>
                <time style={styles.datetime}>
                  <i
                    style={styles.calendarIcon}
                    className="fa fa-calendar"
                    aria-hidden="true"
                  />
                  {formatDate(sportunity.beginning_date, sportunity.ending_date)}
                </time>
              </div>
            </div>
          </div>
          <div style={styles.blocInfo}>
            <div style={styles.blocLabel}>
              {localizations.event_price}
            </div>
            <div style={styles.infos}>
              <div style={styles.infoLine}>
                <div>{this.getPriceString(sportunity.price.cents, sportunity.price.currency)}</div>
              </div>
            </div>
          </div>
          {sportunity.price.cents > 0 
          ? <div style={styles.blocInfo}>
              <div style={styles.blocLabel}>
                {me.profileType === 'PERSON' ? localizations.event_personnal_information : localizations.event_business_information}
              </div>
              <div style={styles.infos}>
                <div style={styles.infoLine}>
                  {me.isProfileComplete
                  ? localizations.event_my_profile_is_complete
                  : <div style={styles.addACardButton} onClick={onOpenProfilePopup}>{localizations.event_complete_my_profile}</div>
                  }
                </div>
              </div>
            </div>
          : ""
          }
          {sportunity.price.cents > 0 &&  me.isProfileComplete
          ? <div style={styles.blocInfo}>
              <div style={styles.blocLabel}>
                {localizations.event_payment}
              </div>
              <div style={styles.infos}>
                <div style={styles.infoLine}>
                  <span style={styles.cardLine}>
                    <select 
                      style={styles.cardSelect} 
                      onChange={onChangeSelectedCard} 
                      value={paymentWithWallet 
                      ? this.props.selectedWallet 
                      : selectedCard 
                        ? selectedCard.id
                        : "addACard"}
                    >
                      {me.paymentMethods.map((paymentMethod, index) => (
                          <option key={index} value={paymentMethod.id}>
                            {localizations.event_payment_card + paymentMethod.cardMask + ' (' + paymentMethod.currency + ')'}
                          </option>
                        ))
                      }
                      {!cardJustAdded && 
                        <option value={"addACard"}>
                          {localizations.event_add_a_card}
                        </option>
                      }
                      {viewer.amountOnWallet && viewer.amountOnWallet.amountOnWallets &&
                        viewer.amountOnWallet.amountOnWallets.map((wallet, index) => (
                          <option value={"wallet_" + wallet.currency}>
                            {localizations.event_payment_wallet + 
                              ' (' + 
                              localizations.event_payment_wallet_available +
                              wallet.cents / 100 +
                              ' ' +
                              wallet.currency + 
                              ')'
                            }
                          </option>
                        ))
                      }
                    </select>
                  </span>
                </div>
              </div>
            </div>
          : ""
          }
          <div style={styles.buttonContainer}>
            {sportunity.price.cents > 0 && ((selectedCard && selectedCard.currency !== sportunity.price.currency) || (selectedWallet && selectedWallet.currency !== sportunity.price.currency))
            ? <span style={styles.errorMessage}>
                {selectedWallet
                ? localizations.event_wallet_wrong_currency.replace('{0}', sportunity.price.currency)
                : localizations.event_add_a_card_wrong_currency.replace('{0}', sportunity.price.currency)
                }
              </span>
            : processing 
              ? <ReactLoading type='cylon' color={colors.white}/>
              : <button
                  style={styles.book}
                  onClick={() => {
                    sportunity.price.cents === 0 
                    ? onConfirm()
                    : (paymentWithWallet && selectedWallet && selectedWallet.cents >= sportunity.price.cents) 
                      || (!paymentWithWallet && me.paymentMethods.length > 0 && me.isProfileComplete && selectedCard !== "") 
                      ? onConfirm()
                      : !(me.isProfileComplete) 
                        ? onOpenProfilePopup()
                        : paymentWithWallet && selectedWallet && selectedWallet.cents < sportunity.price.cents
                          ? router.push({pathname : '/my-wallet'})
                          : onAddACard()
                  }}
                >
                  {paymentWithWallet && selectedWallet && selectedWallet.cents < sportunity.price.cents
                  ? localizations.event_payment_make_bankWire
                  : selectedCard === ""
                    ? sportunity.price.cents === 0 || paymentWithWallet
                      ? localizations.event_book
                      : localizations.event_add_a_card
                    : shouldGoToJoinWaitingList 
                      ? localizations.event_join_waiting_list 
                      : localizations.event_book
                  }
                </button>
            }
          </div>
          <div style={styles.policy} data-tip={localizations.event_confirmation_popup_cancellation_policy_details}>
            {localizations.event_cancellation_policy}
            <i
              style={styles.policyIcon}
              className="fa fa-question-circle"
              aria-hidden="true"
            />
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
    paddingLeft: 20,
    paddingRight: 25,
    position: 'relative',
    overflowY: 'auto',
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10
  },
  sportunityTitle: {
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 25
  },
  blocInfo: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 25
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
    marginRight: 11
  },

  cardLine:{
    display: 'flex',
    alignItems: 'center',
    marginBottom: 8
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

  addACardButton: {
    cursor: 'pointer',
    width: 300,
    textAlign: 'center',
    textDecoration: 'underline'
  },

   buttonContainer: {
    margin: 'auto',
    display: 'flex',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10
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

  errorMessage: {
    color: colors.red,
    marginBottom: 30
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
    marginLeft: 5
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
  }
  
};

export default createRefetchContainer(Radium(ConfirmBookingPopup), {
// OK
  viewer: graphql`
    fragment ConfirmBookingPopup_viewer on Viewer @argumentDefinitions (
      amount: {type: "Int", defaultValue: null}
      queryAmount: {type: "Boolean!", defaultValue: false}
      ){
        id
      amountOnWallet @include(if:$queryAmount) {
        amountOnWallet {
            cents,
            currency
        }
        amountOnWallets {
          cents,
          currency
        }
        lockedAmount {
            cents,
            currency
        }
      }
    }
  `,
  sportunity: graphql`
    fragment ConfirmBookingPopup_sportunity on Sportunity {
      title,
      address {
        address,
        city
      },
      participants {
        id
      },
      participantRange {
        from,
        to,
      },
      beginning_date,
      ending_date,
      price {
        cents, 
        currency
      },
      sport {
        sport {
          logo
          name {
            EN
            DE
            FR
          }
        }
      }
    }
  `,
},
graphql`
query ConfirmBookingPopupRefetchQuery(
  $amount: Int
  $queryAmount: Boolean!
) {
viewer {
    ...ConfirmBookingPopup_viewer
    @arguments(
      amount: $amount
      queryAmount: $queryAmount
    )
}
}
`,
);
