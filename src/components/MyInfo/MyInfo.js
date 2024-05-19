import React, { Component } from 'react';
import {
  createRefetchContainer,
  graphql,
  QueryRenderer,
} from 'react-relay';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ReactLoading from 'react-loading';
import { withAlert } from 'react-alert';

import Loading from '../common/Loading/Loading';
import LeftSide from './LeftSide';
import Info from './MyInfoInfo';
import Payment from './Payment';
import BankAccount from './BankAccount';
import Password from './Password';
import Notification from './Notification';
import MyStatisticPreferences from './MyStatisticPreferences';
import MyUserPreferences from './MyUserPreferences';
import AccessRights from './AccessRights';
import Wallet from './Wallet/index';
import CirclesInformation from './CirclesInformation';
import CircleMemberships from './CircleMemberships';
import localizations from '../Localizations';
import SynchronizeCalendar from './SynchronizeCalendar';

import { colors, fonts, metrics } from '../../theme'

import environment from '../../createRelayEnvironment';
import * as types from '../../actions/actionTypes';

import Radium from 'radium';

let styles;

class MyInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      loadingSection: false, 
      activeSection: 'my-info',
      language: localizations.getLanguage(),
      mobileVersion: false,
      hideMenu: false
    };
  }

  _setLanguage = language => {
    this.setState({ language: language });
  };

  _changeSection = name => {
    if (name !== this.state.activeSection) {
      this.setState({loadingSection: true, activeSection: name});
      setTimeout(() => this.setState({ loadingSection: false }), 1500);
      if (name === 'notification') 
        this.props.router.push('/preferences')
      else if (name === 'wallet')
        this.props.router.push('/my-wallet')
      else if (name === 'circle_forms')
        this.props.router.push('/my-shared-info') 
      else if (name === 'circle_fees')
        this.props.router.push('/my-membership-fees')
      else if (name === 'share-access')
        this.props.router.push('/share-access')
      else if (name === 'statistics')
        this.props.router.push('/statistics')
      else if (name === 'password') 
        this.props.router.push('/my-password')
      else if (name === 'sync-calendar')
        this.props.router.push('/sync-calendar')
      else
        this.props.router.push('/my-info')

      this.setState({hideMenu: name === 'circle_fees' || name === 'circle_forms'})
    }
  };

  componentDidMount = () => {
    if (this.props.location.pathname.indexOf('notification-preferences') >= 0) {
      let splitted = this.props.location.pathname.split('/');
      if (splitted[2]) {
        this.props.route.updateToken(splitted[2]);
        this.setState({ mobileVersion: true });
        setTimeout(() => {
          this.props.relay.refetch(
            {},
            null,
            () => {
              this.setState({ loading: false });
              this._changeSection('notification');
            },
            { force: true },
          );
        }, 4000);
      } 
      else {
        // this.props._loggedFromPage('/preferences')
        // this.props.router.push(`/login`);
        this.setState({ mobileVersion: true });
        setTimeout(() => {
          this.setState({ loading: false });
          this._changeSection('notification');
        }, 4000);
      }
    } 
    else {
      if (!this.props.viewer.me) {
        this.props._loggedFromPage('/preferences');
        this.props.router.push(`/login`);
      } 
      else if (this.props.location.pathname === '/preferences')
        this._changeSection('notification');
      else if (this.props.location.pathname === '/my-wallet')
        this._changeSection('wallet');
      else if (this.props.location.pathname === '/my-shared-info')
        this._changeSection('circle_forms');
      else if (this.props.location.pathname.indexOf('/my-membership-fees') >= 0) {
        if (this.props.location.pathname.indexOf('payment-confirmation') >= 0) {
          this._changeSection('circle_fees');
          this.props.alert.show(localizations.paymentsuccesful, { timeout: 5000, type: 'success' });
          this.props.router.push("/my-membership-fees")
          this.setState({hideMenu: true})
        }
        else {
          this._changeSection('circle_fees');
        }
      }
      else if (this.props.location.pathname === '/share-access')
        this._changeSection('share-access');
      else if (this.props.location.pathname === '/statistics')
        this._changeSection('statistics');

      setTimeout(() => this.setState({ loading: false }), 1500);
    }
  }

  componentWillReceiveProps = nextProps => {
    if (this.props.location.pathname !== nextProps.location.pathname) {
      if (nextProps.location.pathname === '/preferences')
        this.setState({activeSection: 'notification'});
      else if (nextProps.location.pathname === '/my-wallet')
        this.setState({activeSection: 'wallet'});
      else if (nextProps.location.pathname === '/my-shared-info')
        this.setState({activeSection: 'circle_forms'});
      else if (nextProps.location.pathname === '/my-membership-fees')
        this.setState({activeSection: 'circle_fees'});
      else if (nextProps.location.pathname === '/share-access')
        this.setState({activeSection: 'share-access'});
      else if (nextProps.location.pathname === '/statistics')
        this.setState({activeSection: 'statistics'});
      else if (nextProps.location.pathname === '/my-password') 
        this.setState({activeSection: 'password'})
      else if (nextProps.location.pathname === '/sync-calendar')
        this.setState({activeSection: 'sync-calendar'})
      else
        this.setState({activeSection: 'my-info'});

      this.setState({hideMenu: nextProps.location.pathname === '/my-shared-info' || nextProps.location.pathname === '/my-membership-fees'})
    }
  }

  _isProfileComplete = () => {
    if (this.props.viewer && this.props.viewer.me)
      return this.props.viewer.me.isProfileComplete;
  };

  _currentSection = () => {
    const { viewer } = this.props;
    const defProps = { viewer, user: viewer.me };
    const isProfileComplete = this._isProfileComplete();

    switch (this.state.activeSection) {
      case 'payment':
        return (
          <Payment 
            {...this.state} 
            {...defProps} 
          />
        );
      case 'bank':
        return (
          <BankAccount 
            {...this.state} 
            {...defProps} 
          />
        );
      case 'password':
        return (
          <Password 
            {...this.state} 
            {...defProps} 
          />
        );
      case 'notification':
        return (
          <Notification
            {...this.state}
            {...defProps}
            language={this.state.language}
          />
        );
      case 'statistics':
        return (
          <MyStatisticPreferences
            {...this.state}
            {...defProps}
            language={this.state.language}
          />
        );
      case 'user-preferences':
        return (
          <MyUserPreferences
            {...this.state}
            {...defProps}
            language={this.state.language}
          />
        );
      case 'share-access':
        return (
          <AccessRights
            {...this.state}
            {...defProps}
            language={this.state.language}
            router={this.props.router}
          />
        );
      case 'wallet':
        return (
          <Wallet 
            {...this.state} 
            {...defProps} 
            router={this.props.router}
          />
        );
      case 'circle_forms':
        return (
          <CirclesInformation 
            {...this.state} 
            {...defProps} 
            router={this.props.router}
          />
        );
      case 'circle_fees': 
        return (
          <CircleMemberships 
            {...this.state} 
            {...defProps} 
            router={this.props.router}
          />
        ); 
      case 'sync-calendar':
        return (
          <SynchronizeCalendar 
            {...this.state} 
            {...defProps} 
          />
        );
      case 'my-info':
      default:
        return (
          <Info
            {...this.state}
            {...defProps}
            isProfileComplete={isProfileComplete}
            language={this.props.language}
          />
        );
    }
  };

  render() {
    const { viewer } = this.props;
    const isProfileComplete = this._isProfileComplete();
    if (this.state.loading) {
      return <Loading />;
    }
    return (
      <div>
        <div style={styles.container} />
        <div style={{...styles.wrapper, margin: this.state.mobileVersion ? '35px 0px' : '35px'}}>
          {!this.state.mobileVersion && !this.state.hideMenu
          ? <div style={styles.leftSide}>
              <LeftSide
                activeSection={this.state.activeSection}
                onChangeSection={this._changeSection}
                isProfileComplete={isProfileComplete}
                viewer={viewer}
                {...this.state}
              />
            </div>
          : null
          }
          {this.state.loadingSection
          ? <div style={styles.loadingContainer}><ReactLoading type="cylon" color={colors.blue} /></div>
          : <div style={{...styles.rightSide, paddingLeft: this.state.mobileVersion ? 0 : 60}}>
              {this._currentSection()}
            </div>
          }
        </div>
      </div>
    );
  }
}

styles = {
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  wrapper: {
    width: 1000,
    display: 'flex',
    flexDirection: 'row',
    fontFamily: 'Lato',
    '@media (max-width: 960px)': {
      width: '100%',
    },
    '@media (max-width: 480px)': {
      display: 'block',
    },
  },
  leftSide: {
    width: 200,
    display: 'flex',
    flexDirection: 'column',
    fontSize: 16,
  },
  rightSide: {
    paddingRight: 10,
    paddingTop: 10,
    flex: 1,
    //width: 800,
    '@media (max-width: 960px)': {
      width: '100%',
      paddingRight: 30,
    },
    '@media (max-width: 480px)': {
      paddingLeft: 10,
      paddingRight: 10,
    },
  },
  loadingContainer: {
    width: '100%',
    height: '100%',
    marginTop: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};

const _loggedFromPage = value => ({
  type: types.LOGGED_IN_FROM_PAGE,
  value,
});

const dispatchToProps = dispatch => ({
  _loggedFromPage: bindActionCreators(_loggedFromPage, dispatch),
});

const stateToProps = state => ({
  language: state.globalReducer.language,
});

let ReduxContainer = connect(
  stateToProps,
  dispatchToProps,
)(Radium(MyInfo));

const MyInfoTemp = createRefetchContainer(
  Radium(withAlert(ReduxContainer)),
  {
    viewer: graphql`
      fragment MyInfo_viewer on Viewer {
        ...MyInfoInfo_viewer
        ...Payment_viewer
        ...BankAccount_viewer
        ...MyStatisticPreferences_viewer
        ...AccessRights_viewer
        ...Wallet_viewer
        ...Notification_viewer
        ...Password_viewer
        ...CirclesInformation_viewer
        ...CircleMemberships_viewer
        ...MyUserPreferences_viewer
        ...SynchronizeCalendar_viewer
        me {
          firstName
          lastName
          isSubAccount
          isProfileComplete
          address {
            address
            city
            country
          }
          ...MyInfoInfo_user
          ...BankAccount_user
          ...Payment_user
          ...Notification_user
          ...Password_user
          ...MyStatisticPreferences_user
          ...MyUserPreferences_user
          ...AccessRights_user
          ...CirclesInformation_user
          ...CircleMemberships_user
          profileType
        }
      }
    `,
  },
  graphql`
    query MyInfoRefetchQuery {
      viewer {
        ...MyInfo_viewer
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
          query MyInfoQuery {
            viewer {
              ...MyInfo_viewer
            }
          }
        `}
        render={({ error, props }) => {
          if (props) {
            return (
              <MyInfoTemp
                viewer={props.viewer}
                query={props}
                {...this.props}
              />
            );
          } else {
            return <Loading />;
          }
        }}
      />
    );
  }
}
