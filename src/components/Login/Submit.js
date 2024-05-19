/*require('babel-polyfill');
let regeneratorRuntime =  require("regenerator-runtime");*/

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as types from '../../actions/actionTypes.js';
import Loading from 'react-loading';
import { withAlert } from 'react-alert';
import { colors, fonts } from '../../theme'
import localizations from '../Localizations'

import { backendUrl } from '../../../constants.json';

let styles;

class Submit extends Component {

  constructor() {
    super();
    this.state = {
      isLoading: false,
    }
  }

  _changeLoadingStatus = (bool) => {
    this.props.updateIsLoading(bool)
  }

  componentDidMount() {
    window.addEventListener('keydown', this._handleKeyPress);
  }
  
  componentWillUnmount() {
    window.removeEventListener('keydown', this._handleKeyPress);
  }

  _handleKeyPress = (event) => {
    if (event.key === 'Enter' && event.target.tagName === 'INPUT')  {
      this._loginEmailUser();
    }
  }

  _loginEmailUser = async () => {

    this._changeLoadingStatus(true);
    const pseudoVar = this.props.pseudo.trim();
    const passwordVar = this.props.password;
    const toProfile = this.props.toProfile;
    let response;

    if(this.props.pseudo === '' || this.props.password === '') {
      this.props.alert.show(localizations.popup_login_fields_required, {
        timeout: 2000,
        type: 'info',
      });
      this._changeLoadingStatus(false);
      return ;
    }

    try {
      response = await fetch(backendUrl+'/auth', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pseudo: pseudoVar,
          password: passwordVar,
        }),
      })
      .then((response) => response.json())
    } catch (err) {
      this._changeLoadingStatus(false);
      this.props.alert.show(localizations.popup_login_failed, {
        timeout: 2000,
        type: 'error',
      });
      response = null;
    }

    if (response && response.success) {
      let token = response.token;
      this.props.updateToken(token, true);

      this._changeLoadingStatus(false);
      this.props.alert.show(localizations.popup_login_success, {
        timeout: 1000,
        type: 'success',
      });
      this.props._updateIsProfilFromLogin(true);
      setTimeout(() => {
        this.props.router.push('/logged-in')
        // TODO this.props.trackLogin('Login-Basic')
      }, 2000);

    } else {
      if (response.msg === 'Your email is not validated') {
        this.props._updateIsEmailValidatedAction(false);
      }

      let error = response.msg;
      this.props.alert.show(error, {
        timeout: 2000,
        type: 'error',
      });
      console.log(error);
      this._changeLoadingStatus(false);

    }
  }

  render() {
    return(
      <div style={styles.container}>
        {this.props.isLoading === true &&
          <Loading type='cylon' color={colors.blue} />
        }
        <button onClick={this._loginEmailUser} style={styles.button}>
        {localizations.login_connect}
        </button>
      </div>
    )
  }
}

// REDUX //
const _updateIsProfilFromLogin = (value) => ({
  type: types.UPDATE_IS_PROFILE_FROM_LOGIN,
  value,
})

const _updateIsEmailValidatedAction = (text) => ({
  type: types.UPDATE_ISEMAILVALIDATED,
  text,
})

const stateToProps = (state) => ({
  pseudo: state.loginReducer.pseudo,
  password: state.loginReducer.password,
  isEmailValidated: state.loginReducer.isEmailValidated,
})

const dispatchToProps = (dispatch) => ({
  _updateIsEmailValidatedAction: bindActionCreators(_updateIsEmailValidatedAction, dispatch),
  _updateIsProfilFromLogin: bindActionCreators(_updateIsProfilFromLogin, dispatch),
})

export default connect(
  stateToProps,
  dispatchToProps
)(withAlert(Submit));


// STYLES //

styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    height: 70,
    backgroundColor: '#32C760',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    borderRadius: '100px',
    width: '300px',
		display: 'inline-block',
    fontFamily: 'Lato',
    fontWeight: fonts.weight.medium,
    fontSize: '16px',
    textAlign: 'center',
    color: colors.white,
    borderWidth: 0,
    marginTop: 5,
    marginBottom: 5,
    cursor: 'pointer',
		lineHeight: '27px',
  },
}
