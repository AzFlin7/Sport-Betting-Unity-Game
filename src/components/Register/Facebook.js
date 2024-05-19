require('babel-polyfill');
let regeneratorRuntime =  require("regenerator-runtime");

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { colors, fonts } from '../../theme'
import { FacebookProvider, Login } from 'react-facebook'
import { withAlert } from 'react-alert'
import ReactLoading from 'react-loading'
import localizations from '../Localizations'
import * as types from '../../actions/actionTypes';

import { backendUrl } from '../../../constants.json'

let styles;

class Facebook extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
    }
    this.alertOptions = {
      offset: 14,
      position: 'top right',
      theme: 'light',
      timeout: 100,
      transition: 'fade',
    };
  }

  _onFacebookResponse = (data) => {
    this._loginFacebook(data.tokenDetail.accessToken)
  }

  _changeLoadingStatus = (bool) => {
    this.setState({
      isLoading: bool,
    })
  }

  _loginFacebook = async (facebookToken) => {
    this._changeLoadingStatus(true);

    let response;

    try {
      response = await fetch(backendUrl+'/auth/facebook', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: facebookToken,
        }),
      })
      .then((response) => response.json())
    } catch (err) {
      this._changeLoadingStatus(false);
      this.props.alert.show(localizations.popup_registration_error, {
        timeout: 4000,
        type: 'error',
      });
      response = null;
    }

    if (response && response.success) {
      let token = response.token;
      this.props.updateToken(token);
      this._changeLoadingStatus(false);
      this.props._updateIsProfilFromLogin(true)
      this.props.alert.show(localizations.popup_registration_success, {
        timeout: 4000,
        type: 'success',
      });
      setTimeout(() => {
        this.props.trackRegister('Register-Basic')
        this.props.router.push(`/logged-in`)
      }, 1000);

    } else {

      let error = response.msg;
      this.props.alert.show(error, {
        timeout: 4000,
        type: 'error',
      });
      console.log(error);
      this._changeLoadingStatus(false);
    }
  }

  render () {

    return(
      <div style={styles.container}>
        {
          this.state.isLoading  &&
            <ReactLoading type='cylon' color={colors.blue} />
        }
        <FacebookProvider appId='1759806787601548' version="v2.11">
          <Login scope="email" onCompleted={this._onFacebookResponse}> 
            {({ loading, handleClick, error, data }) => (
              <span onClick={handleClick} style={styles.button}>{localizations.register_joinFacebook}</span>
            )}
          </Login>
        </FacebookProvider>
          <span style={styles.note}><i className="fa fa-lock" aria-hidden="true"></i> {localizations.register_facebookNote}</span>

      </div>

    )
  }
}


const _updateIsProfilFromLogin = (value) => ({
  type: types.UPDATE_IS_PROFILE_FROM_LOGIN,
  value,
})

const dispatchToProps = (dispatch) => ({
  _updateIsProfilFromLogin: bindActionCreators(_updateIsProfilFromLogin, dispatch),
})

const stateToProps = (state) => ({
})

export default connect(
  stateToProps,
  dispatchToProps
)(withAlert(Facebook));

// STYLES //

styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: colors.blueFacebook,
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    borderRadius: '100px',
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
    backgroundImage: 'url(/images/facebook.png)',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'left 27px center',
    paddingTop: 22,
    paddingBottom:22,
    paddingLeft: 60,
    paddingRight: 25
  },
  note: {
    fontSize: 12,
    marginTop: 6,
    fontFamily: 'Lato',
  },
}
