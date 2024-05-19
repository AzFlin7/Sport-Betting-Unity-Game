import React, { Component } from 'react';
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import moment from 'moment';
import { withRouter } from 'found';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { forceUpdate } from '../common/PureComponent';
import Loading from '../common/Loading/Loading.js'
import * as types from '../../actions/actionTypes.js';
import localizations from '../Localizations';

class LoggedIn extends Component {
  constructor() {
    super();
  }

  componentDidMount = () => {
    const { me } = this.props.viewer;
    this.props._resetAction();
    if (me && me.appCountry) {
      this.props.updateUserCountry(me.appCountry);
      if (me.appCurrency)
        this.props.updateUserCurrency(me.appCurrency);
    }
    if (me) {
      this.props._setLanguageAction(me.appLanguage.toLowerCase())
      localizations.setLanguage(me.appLanguage.toLowerCase());
      moment.locale(me.appLanguage.toLowerCase());
      forceUpdate({ lang: me.appLanguage.toLowerCase() });
      this.props.onUpdateLanguage(me.appLanguage.toLowerCase());
      
    }
        
    let registerFromStorage = localStorage.getItem('registerFrom');
    if (registerFromStorage) {
      localStorage.removeItem('registerFrom')
      this.props.router.push(registerFromStorage)
    }
    else if (this.props.loggedInFromPage) {
      this.props._loggedFromPage('');
      this.props.router.push(this.props.loggedInFromPage)
    }
    else {//if (me.sex && me.publicAddress && me.sports && me.sports.length > 0 ) {
      this.props._updateIsProfilFromLogin(false)
      this.props.router.push(`/my-events`)
    }
  }
  render = () => {
    return <Loading />
  }
}

// REDUX
const _updateIsProfilFromLogin = (value) => ({
  type: types.UPDATE_IS_PROFILE_FROM_LOGIN,
  value,
})

const _loggedFromPage = (value) => ({
  type: types.LOGGED_IN_FROM_PAGE,
  value,
})

const _resetAction = () => ({
  type: types.UPDATE_MY_EVENT_RESET_FILTER,
})

const updateUserCountry = value => ({
  type: types.GLOBAL_SET_USER_COUNTRY,
  value,
});
const updateUserCurrency = value => ({
  type: types.GLOBAL_SET_USER_CURRENCY,
  value,
});
const _setLanguageAction = (language) => ({
  type: types.GLOBAL_SET_LANGUAGE,
  language: language,
})

const dispatchToProps = (dispatch) => ({
  _updateIsProfilFromLogin: bindActionCreators(_updateIsProfilFromLogin, dispatch),
  _loggedFromPage: bindActionCreators(_loggedFromPage, dispatch),
  _resetAction: bindActionCreators(_resetAction, dispatch),
  updateUserCountry: bindActionCreators(updateUserCountry, dispatch),
  updateUserCurrency: bindActionCreators(updateUserCurrency, dispatch),
  _setLanguageAction: bindActionCreators(_setLanguageAction, dispatch),
})

const stateToProps = (state) => ({
  loggedInFromPage: state.loginReducer.loggedInFromPage,
})

let ReduxContainer = connect(
  stateToProps,
  dispatchToProps
)(LoggedIn);

export default createFragmentContainer(withRouter(ReduxContainer), {
  viewer: graphql`
    fragment LoggedIn_viewer on Viewer @argumentDefinitions(
        filter: { type: "Filter" }){
      id
      me {
        id
        homePagePreference
        sex
        appLanguage
        appCountry
        appCurrency
        publicAddress {
          city
          country
        }
        sports {
          sport {
            id
          }
        }
      }
      ...StepperModal_viewer
    }
  `,
});