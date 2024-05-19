import React, { Component } from 'react';
import {
  createRefetchContainer,
  graphql,
  QueryRenderer,
} from 'react-relay/compat';
import { withAlert } from 'react-alert';
import { connect } from 'react-redux';
import FilterButton from '../../common/FilterTopBar/FilterButton';
import Radium from 'radium';
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
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';

import styles from '../Styles.js';
import localizations from '../../Localizations';
import { colors } from '../../../theme';
import Transactions from './Transactions';
import Fees from './Fees';
import PaymentPopup from './PaymentPopup';
import Loading from '../../common/Loading/Loading';
import environment from '../../../createRelayEnvironment';
import UpdateUserSubscription from './Subscriptions/UpdateUserWalletSubscription'

class Wallet extends React.Component {
  constructor(props) {
    super(props);
    this.alertOptions = {
      offset: 60,
      position: 'top right',
      theme: 'light',
      transition: 'fade',
    };
    this.sub;
    this.state = {
      displayPaymentPopup: false,
      paidTab: 1,
      filter: {
        transactionStatus: '',
        users: [],
      },
      isLoading: false,
      amountToAddVisible: false,
      instructionsVisible: false,
      amount: {
        cents: 0,
        currency: 'CHF',
      },
      paymentPopupProps: {},
      selectedWallet: null,
      selectedWalletIndex: 0
    };
    this._refetch = this._refetch.bind(this);
  }

  componentDidMount = () => {
    if (this.props.location && this.props.location.pathname.indexOf('cashin-confirmation') >= 0) {
      this.props.alert.show(localizations.paymentsuccesful, { timeout: 5000, type: 'success' });
      this.props.router.push("/my-wallet")
    }

    if (this.props.location && this.props.location.pathname.indexOf('payment-confirmation') >= 0) {
      this.setState({paidTab: 0})
      this.props.alert.show(localizations.paymentsuccesful, { timeout: 5000, type: 'success' });
      this.props.router.push("/my-wallet")
    }

    if (this.props.viewer.me) 
      this.sub = UpdateUserSubscription({userId: this.props.viewer.me.id, _refetch: () => this.transactionRef && this.transactionRef._refetch()});

    this._refetch();
    if (this.props.userCurrency)
      this.setState({
        amount: {
          cents: 0,
          currency: this.props.userCurrency,
        },
      });
    // prepare filter
    const filter = { users: [] };
    if (this.props.viewer.me && this.props.viewer.me.id) {
      filter.users.push(this.props.viewer.me.id);
    }
    if (
      this.props.viewer.me.subAccounts &&
      this.props.viewer.me.subAccounts.length
    ) {
      this.props.viewer.me.subAccounts.map(i => {
        filter.users.push(i.id);
      });
    }
    this.setState({ filter: { ...this.state.filter, ...filter } });
  };

  componentWillUnmount() {
    this.sub && this.sub.dispose()
  }

  _refetch() {
    this.props.relay.refetch(fragmentVariables => ({
      ...fragmentVariables,
      queryAmountOnWallet: true,
    }),
    null,
    () => {
      if (!this.state.selectedWallet && this.props.viewer.amountOnWallet && this.props.viewer.amountOnWallet.amountOnWallets && this.props.viewer.amountOnWallet.amountOnWallets.length > 0) {
        let wallets = cloneDeep(this.props.viewer.amountOnWallet.amountOnWallets);
        wallets = wallets.sort((a, b) => a.cents - b.cents > 0); 
        this.setState({
          selectedWallet: wallets[0],
          selectedWalletIndex: 0
        })
      }
    },
    {force: true});
    
    this.transactionRef && this.transactionRef._refetch();
  }

  componentWillReceiveProps = nextProps => {
    if (nextProps.viewer.bankwireToWallet && !this.state.instructionsVisible) {
      this.setState({
        isLoading: false,
        instructionsVisible: true,
      });
    }
    if (this.state.selectedWallet && this.props.viewer.amountOnWallet && nextProps.viewer.amountOnWallet && !isEqual(this.props.viewer.amountOnWallet, nextProps.viewer.amountOnWallet)) {
      let wallets = cloneDeep(nextProps.viewer.amountOnWallet.amountOnWallets);
      let wallet = wallets.find(w => w.currency === this.state.selectedWallet.currency)
      this.setState({
        selectedWallet: wallet,
        selectedWalletIndex: wallets.findIndex(w => w.currency === this.state.selectedWallet.currency)
      })
    }
  };

  _handleShowAddAmount = () => {
    this.setState({
      amountToAddVisible: true,
    });
  };

  _updateAmount = event => {
    this.setState({
      amount: {
        cents: event.target.value,
        currency: this.props.userCurrency,
      },
    });
  };

  _handleQueryNewBankWire = () => {
    if (this.state.amount.cents > 0) {
      this.props.relay.refetch(fragmentVariables => ({
        ...fragmentVariables,
        queryBankWire: true,
        amount: this.state.amount,
      }));
      this.setState({
        isLoading: true,
      });
    } 
    else {
      this.props.alert.show(localizations.info_wallet_add_by_bankwire_wrong_amount, {timeout: 2000, type: 'info'});
    }
  };

  _handleUsersFilterChange = id => {
    const filter = JSON.parse(JSON.stringify(this.state.filter));
    if (filter.users.includes(id)) {
      filter.users = filter.users.filter(i => i !== id);
    } else {
      filter.users.push(id);
    }
    this.setState({ filter });
  };

  render() {
    const { viewer, classes } = this.props;
    const { me } = viewer;
    const { paidTab, filter } = this.state;
    if (me && !me.mangoId) {
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
              {localizations.info_wallet_title}
            </div>
          </div>
          <section>
            <div style={styles.completeInfoText}>
              {localizations.payment_wallet_complete_profile}
            </div>
            <div style={{ ...styles.completeInfoText, color: colors.red }}>
              {localizations.payment_wallet_complete_profile2}
            </div>
          </section>
        </section>
      );
    }

    return (
      <div style={{ marginBottom: 50 }}>
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            marginTop: 30,
            marginLeft: 30,
            flexGrow: 0,
          }}
        >
          <div style={styles.pageHeader}>
            {localizations.info_wallet_title}
          </div>
        </div>
        <Grid container spacing={40} justify="center" alignItems="center">
          <Grid item xs={10} sm={10} md={10} lg={10}>
            <div>
              <div
                style={{
                  display: 'flex',
                  overflowX: 'auto',
                  whiteSpace: 'nowrap',
                }}
              >
                <FilterButton
                  label={viewer.me.pseudo}
                  onFilterSelected={() => {
                    this._handleUsersFilterChange(viewer.me.id);
                  }}
                  selected={filter.users.includes(viewer.me.id)}
                  canBeDeleted={false}
                  hideCloseIcon
                />
                {viewer.me.subAccounts.map(i => (
                  <FilterButton
                    label={i.pseudo}
                    onFilterSelected={() => {
                      this._handleUsersFilterChange(i.id);
                    }}
                    selected={filter.users.includes(i.id)}
                    canBeDeleted={false}
                    hideCloseIcon
                  />
                ))}
              </div>
            </div>
          </Grid>
          <Grid item xs={10} sm={10} md={10} lg={6}>
            <Card>
              <CardHeader
                classes={{ title: classes.fortune_card_title }}
                title={localizations.info_wallet_amount}
                avatar={
                  viewer.amountOnWallet && viewer.amountOnWallet.amountOnWallets && viewer.amountOnWallet.amountOnWallets.length > 1 && 
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                      {viewer.amountOnWallet.amountOnWallets.map((amountOnWallet, index) => (
                        <IconButton 
                          classes={{ label: this.state.selectedWalletIndex === index ? classes.wallet_fortune_selected : classes.wallet_fortune }}
                          onClick={() => this.setState({selectedWallet: amountOnWallet, selectedWalletIndex: index})}
                        >
                          {amountOnWallet.cents / 100 + ' ' + amountOnWallet.currency}
                        </IconButton>
                      ))}
                    </div>
                  }
                action={
                  <IconButton onClick={this._refetch}>
                    <i className="fa fa-refresh" />
                  </IconButton>
                }
              />
              <CardContent className={classes.fortune_card_content}>
                {this.state.selectedWallet
                  ? `${this.state.selectedWallet.cents / 100} ${
                      this.state.selectedWallet.currency
                    }`
                  : localizations.info_wallet_nothing}
              </CardContent>
              <CardActions>
                <Button
                  variant="outlined"
                  className={classes.cash_button}
                  onClick={() => {
                    this.setState({
                      displayPaymentPopup: true,
                      paymentPopupProps: {
                        title: localizations.cash_in,
                        buttonText: localizations.send,
                        text: localizations.cashInPaymentText,
                        type: 'cashIn',
                      },
                    });
                  }}
                >
                  <img src="/images/cash_in.png" />
                  <span>{localizations.cash_in}</span>
                </Button>
                <Button
                  variant="outlined"
                  className={classes.cash_button}
                  onClick={() => {
                    if (me && me.bankAccount && me.bankAccount.id) {
                      this.setState({
                        displayPaymentPopup: true,
                        paymentPopupProps: {
                          title: localizations.cash_out,
                          buttonText: localizations.send,
                          text: localizations.cashOutPaymentText,
                          type: 'cashOut',
                        },
                      });
                    }
                    else {
                      this.props.alert.show(localizations.cashOutMissingIBAN, {timeout: 2000, type: 'info'});
                    }
                  }}
                >
                  <img src="/images/cash_out.png" />
                  <span>{localizations.cash_out}</span>
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={10} sm={10} md={10} lg={10} style={{ padding: 0 }}>
            <Paper>
              <AppBar color="primary" position="static">
                <Tabs
                  className={classes.root_tabs}
                  value={paidTab}
                  onChange={(e, value) => {
                    this.setState({ paidTab: value });
                  }}
                  variant="fullWidth"
                  indicatorColor="primary"
                  textColor="primary"
                >
                  <Tab
                    label={localizations.wallet_to_be_paid}
                    className={classes.tab_header}
                  />
                  <Tab
                    label={localizations.wallet_movement}
                    className={classes.tab_header}
                  />
                </Tabs>
              </AppBar>
            </Paper>
          </Grid>
          <Grid item xs={10} sm={10} md={10} lg={10} style={{ padding: 0 }}>
            {paidTab === 0 && (
              <Fees
                viewer={viewer}
                users={filter.users}
                noDataMessage={localizations.wallet_no_membership_fees}
              />
            )}
            {paidTab === 1 && (
              <Transactions
                viewer={viewer}
                users={filter.users}
                noDataMessage={localizations.wallet_no_movement}
                onRef={ref => {this.transactionRef = ref}}
              />
            )}
          </Grid>
        </Grid>
        {this.state.displayPaymentPopup && (
          <PaymentPopup
            viewer={viewer}
            onClose={() => this.setState({ displayPaymentPopup: false })}
            selectedWallet={this.state.selectedWallet}
            changeSelectedWallet={wallet => this.setState({selectedWallet: wallet})}
            refetch={() => this._refetch()}
            router={this.props.router}
            {...this.state.paymentPopupProps}
          />
        )}
      </div>
    );
  }
}

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

const dispatchToProps = dispatch => ({});

const stateToProps = state => ({
  userCurrency: state.globalReducer.userCurrency,
  language: state.globalReducer.language,
});

const ReduxContainer = connect(
  stateToProps,
  dispatchToProps,
)(Radium(withStyles(muiStyles)(Wallet)));

const WalletTemp = createRefetchContainer(
  withAlert(ReduxContainer),
  {
    viewer: graphql`
      fragment Wallet_viewer on Viewer
        @argumentDefinitions(
          amount: {
            type: "PriceInput!"
            defaultValue: { cents: 0, currency: CHF }
          }
          queryBankWire: { type: "Boolean!", defaultValue: false }
          queryAmountOnWallet: { type: "Boolean!", defaultValue: false }
        ) {
        ...Transactions_viewer
        ...Fees_viewer
        ...PaymentPopup_viewer
        id
        me {
          id
          pseudo
          subAccounts {
            id
            pseudo
          }
          isProfileComplete
          mangoId
          bankAccount {
            id
          }
        }
        amountOnWallet @include(if: $queryAmountOnWallet) {
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
        bankwireToWallet(amount: $amount) @include(if: $queryBankWire) {
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
    query WalletRefetchQuery(
      $amount: PriceInput!
      $queryBankWire: Boolean!
      $queryAmountOnWallet: Boolean!
    ) {
      viewer {
        ...Wallet_viewer
          @arguments(
            amount: $amount
            queryBankWire: $queryBankWire
            queryAmountOnWallet: $queryAmountOnWallet
          )
      }
    }
  `,
);

export default class extends Component {
  render() {
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query WalletQuery {
            viewer {
              ...Wallet_viewer
            }
          }
        `}
        render={({ error, props }) => {
          if (props && !error) {
            return (
              <WalletTemp
                viewer={props.viewer}
                query={props}
                {...this.props}
              />
            );
          }
          return <Loading />;
        }}
      />
    );
  }
}
