import React, { Component } from 'react';
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import { connect } from 'react-redux';
import ReactPixel from 'react-facebook-pixel'
import { Link, withRouter } from 'found'
import { withAlert } from 'react-alert'
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import Loading from 'react-loading';
import Radium from 'radium';
import platform from 'platform';

import LoadingPage from '../common/Loading/Loading'
import Logo from './Logo.js';
import Submit from './Submit.js';
import Facebook from './Facebook.js';
import Google from './Google.js';
import ButtonAskValidationMail from './ButtonAskValidationMail';
import { colors } from '../../theme'
import Inputs from './Inputs'
import Footer from '../common/Footer/LoginFooter'

import localizations from '../Localizations'
import MailValidationMutation from './MailValidationMutation';
import RequestNewValidationMailMutation from './RequestNewValidationMailMutation';
import constants from "../../../constants";
import ConfirmationModal from '../common/ConfirmationModal';

import * as types from '../../actions/actionTypes.js';
let styles;

const propTypes = {
  viewer: PropTypes.object.isRequired,
  relay: PropTypes.object.isRequired,
};

class Login extends Component {
  constructor() {
    super();
    this.state = {
      language: localizations.getLanguage(),
      askingNewValidationMail: false,
      displayAndroidOpenApp: false,
      isLoading: false,
      isSignin: true,
      autoLogin: false
    }
  }

  _setLanguage = (language) => {
    this.setState({ language: language })
  }

  componentDidMount() {
    
    if (this.props.params.tokenId && this.props.location.pathname.indexOf('mailvalidation') >= 0) {
      this.setState({isSignin: false})
      MailValidationMutation.commit({
          token: this.props.params.tokenId,
          viewer: this.props.viewer,
        },
        {
          onSuccess: () => {
            this.props.alert.show(localizations.popup_mailValidation_success, {
                timeout: 2000,
                type: 'success',
            });
            if (platform.os.family === "iOS" && platform.name.indexOf("Firefox") < 0) {
              if (typeof window !== 'undefined') 
                window.location.href = "sportunity://login/"+this.props.params.tokenId;
            }
            else if (platform.os.family === "Android" && platform.name.indexOf("Firefox") < 0) {
              this.setState({displayAndroidOpenApp: true})   
            }
            else {
              this.autoLogin(this.props.params.tokenId)
            }
            
          },
          onFailure: (error) => {
            this.props.alert.show(error.getError().source.errors[0].message, {
              timeout: 4000,
              type: 'error',
            });
          },
        }
      );
    } 
    else if (this.props.params.token) {
      this.props._resetMyCirclesFilter()
      this.props._resetMyEventsFilter()
      const { updateToken, updateSuperToken } = this.props.route;
      if (this.props.location.pathname.indexOf('login-switch') >= 0) {
        this.setState({isLoading: true, isSignin: false})
        updateSuperToken(this.props.params.token);
        updateToken(this.props.params.token, false)
        setTimeout(() => this.props.router.push(`/logged-in`), 500)
      }
      else if (this.props.location.pathname.indexOf('login-superuser') >= 0) {
        this.setState({isLoading: true, isSignin: false})
        updateToken(this.props.params.token, false)
        setTimeout(() => this.props.router.push(`/logged-in`), 1500)
      }
      else if (this.props.location.pathname.indexOf('notification-preferences') >= 0) {
        updateToken(this.props.params.token, false)
        setTimeout(() => this.props.router.push(`/notification-preferences`), 1500)
      }
      else {
        this.setState({isLoading: true, isSignin: false})
        updateToken(this.props.params.token, true)
        setTimeout(() => this.props.router.push(`/logged-in`), 1500)
      }
    }
    else {
      this.setState({isSignin: false})
      this.props._resetLoginAction()
    }
  }

  autoLogin = (token) => {
    this.props.route.updateToken(token, true);
    this.setState({isLoading: true})
    this.props.alert.show(localizations.popup_login_success, {
      timeout: 4000,
      type: 'success',
    });
    this.props._updateIsProfilFromLogin(true);
    setTimeout(() => {
      let registerFromStorage = localStorage.getItem('registerFrom');
      if (registerFromStorage) {
        localStorage.removeItem('registerFrom')
        this.props.router.push(registerFromStorage)
      }
      else {
        this.setState({autoLogin: true}, () => 
          this.props.relay.refetch()
        );
      }
    }, 1500);
  }

  componentWillReceiveProps = nextProps => {
    if (this.state.autoLogin && nextProps.viewer.me) {
      this.props.router.push('/profile-view/' + nextProps.viewer.me.id)
      this.setState({autoLogin: false})
    }
    else if (!this.props.viewer.me && nextProps.viewer.me) {
      this.props.router.push('/logged-in')
    }
  }

  _trackLogin = (event) => {
    ReactPixel.trackCustom( event )
  }

  _onAskingForNewValidationMail = () => {
    this.setState({
      askingNewValidationMail: true
    })
  }


  _onAskNewValidationMail() {
    const isEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    RequestNewValidationMailMutation.commit({
          pseudo: !isEmail.test(this.props.pseudo) ? this.props.pseudo : null, 
          email: isEmail.test(this.props.pseudo) ? this.props.pseudo : null,
          viewer: this.props.viewer,
      },
      {
        onSuccess: () => {
          this.props.alert.show(localizations.popup_mailValidation_ask_new_email, {
              timeout: 2000,
              type: 'success',
            });

        },
        onFailure: (error) => {
          this.props.alert.show(error.getError().source.errors[0].message, {
            timeout: 4000,
            type: 'error',
          });
        },
      }
    );
  }

  _onChangePseudo(pseudo) {
    this.setState({ pseudo: pseudo });
  }

  openAndroidApp = () => {
    document.location="sportunity://login/"+this.props.params.tokenId
  }

  render() {
    const { updateToken } = this.props.route;

    const { tokenId } = this.props.params;

    if (this.state.isSignin) {
      return (<LoadingPage/>)
    }

    return (
      <div style={styles.container}>
        {this.state.displayAndroidOpenApp && 
          <ConfirmationModal
            isOpen={true}
            title={localizations.android_open_appTitle}
            message={localizations.android_open_appText}
            confirmLabel={localizations.android_open_appConfirm}
            cancelLabel={localizations.android_open_appCancel}
            canCloseModal={true}
            onConfirm= {this.openAndroidApp}
            onCancel={() => {}}
          />
        }
        
        <div style={styles.signup}>
          <Footer onUpdateLanguage={this._setLanguage} viewer={this.props.viewer}/>
          {localizations.login_dontHaveAccount} <Link to='/register' style={styles.link}>{localizations.login_joinUs}</Link>
        </div>
        <div style={{display:'flex', flexDirection: 'column', maxWidth: "100%"}}>
          <div style={styles.download_icons}>
            <span style={styles.download_icons_text}>
              {localizations.home_download_app_text}
            </span>
            <div style={{display: 'flex', justifyContent:'center',flexDirection:'row', marginTop: 7}}>
              <div style={{width:'50%'}}>
                <a target="_blank" href={constants.appLinkAppStore}>
                  <img style={{width:"75%"}} src="/images/icon_appstore.png"/>
                </a>
              </div>
              <div style={{width:'50%'}}>
                <a target="_blank" href={constants.appLinkPlayStore}>
                  <img style={{width:"75%"}} src="/images/icon_playstore.png"/>
                </a>
              </div>
            </div>
          </div>
          
          <div style={styles.modal}>
            <Logo title={this.state.askingNewValidationMail  ? localizations.login_title_new_validation_mail : localizations.login_title}/>
            <Inputs {...this.props}  {...this.state}/>
            {
              this.state.askingNewValidationMail
              ? <ButtonAskValidationMail onSubmit={this._onAskNewValidationMail.bind(this)}  {...this.props}  {...this.state}/>
              :
                !this.props.isEmailValidated &&
                  <div style={styles.email_not_validated_error}>
                    <span>{localizations.login_email_is_not_validated}</span>
                    <span style={styles.ask_new_mail_link} onClick={this._onAskingForNewValidationMail}>{localizations.login_email_is_not_validated_link_text}</span>
                    <span>{localizations.login_email_is_not_validated_2}</span>
                  </div>
            }
            
            {
              !this.state.askingNewValidationMail &&
              (
                this.state.isLoading === true 
                ? <div style={{display: 'flex',flexDirection: 'column',alignItems: 'center',justifyContent: 'center'}}>
                    <Loading type='cylon' color={colors.blue} />
                  </div>
                : <Submit 
                    updateToken={updateToken} 
                    toProfile={tokenId ? true : false}  
                    {...this.props}  
                    {...this.state}
                    trackLogin={this._trackLogin}
                    updateIsLoading={value => this.setState({isLoading: value})}
                  />
              )                  
            }
            {this.state.isLoading !== true &&
              <div>
                <div className='strike' style={styles.separator}>{localizations.login_or}</div>
                <Facebook
                  updateToken={updateToken} 
                  toProfile={tokenId ? true : false} 
                  language={this.state.language}
                  trackLogin={this._trackLogin}
                  {...this.props}  
                />
                <div className='strike' style={styles.separator}>{localizations.login_or}</div>
                <Google 
                  updateToken={updateToken} 
                  toProfile={tokenId ? true : false} 
                  language={this.state.language}
                  trackLogin={this._trackLogin}
                  {...this.props}  
                />
              </div>
            }
          </div>
        </div>
      </div>
    );
  }
}

Login.propTypes = propTypes;


const _resetLoginAction = () => ({
  type: types.UPDATE_LOGIN_RESET,
})

const _setLanguageAction = (language) => ({
  type: types.GLOBAL_SET_LANGUAGE,
  language: language,
})

const _updateIsProfilFromLogin = (value) => ({
  type: types.UPDATE_IS_PROFILE_FROM_LOGIN,
  value,
})
const _resetMyCirclesFilter = () => {
  return {
    type: types.UPDATE_MY_CIRCLE_RESET_FILTER,
  }
}
const _resetMyEventsFilter = () => ({
  type: types.UPDATE_MY_EVENT_RESET_FILTER,
})

const dispatchToProps = (dispatch) => ({
  _resetLoginAction: bindActionCreators(_resetLoginAction, dispatch),
  _setLanguageAction: bindActionCreators(_setLanguageAction, dispatch),
  _updateIsProfilFromLogin: bindActionCreators(_updateIsProfilFromLogin, dispatch),
  _resetMyCirclesFilter: bindActionCreators(_resetMyCirclesFilter, dispatch),
  _resetMyEventsFilter: bindActionCreators(_resetMyEventsFilter, dispatch)
})

const stateToProps = (state) => ({
  pseudo: state.loginReducer.pseudo,
  isEmailValidated: state.loginReducer.isEmailValidated,
  language: state.globalReducer.language,
})
const LoginRedux = connect(
  stateToProps,
  dispatchToProps,
)(withAlert(Radium(Login)));

export default createRefetchContainer(withRouter(Radium(LoginRedux)), {
  viewer: graphql`
    fragment Login_viewer on Viewer {
      id
      me {
        id
      }
    }
  `},
  graphql`
    query LoginRefetchQuery {
      viewer {
        ...Login_viewer
      }
    }
  `
);



styles = {
  separator: {
    marginTop: 10,
    marginBottom: 10,
    width: '300px',
    marginLeft: 'auto',
    marginRight: 'auto',
    fontFamily: 'Lato',
    fontSize: '14px',
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: '17px',
    color: 'rgba(65,65,65,0.65)',
    '@media (max-width: 375px)': {
      width: '250px'
    }
  },
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    paddingTop: 80,
    paddingBottom: 63,


    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    width: '100%',
    minHeight: '100vh',

    backgroundColor: colors.black,
    fontFamily: 'Lato',

    backgroundImage: 'url(/images/background-signup.jpg)',

  },

  download_icons:{
    display: 'none',
    '@media (max-width: 480px)': {
      display: 'block',
      textAlign: 'center',
      paddingTop: 7,
      paddingBottom: 7,
      marginBottom: 20,
      marginTop: 20
    },
  },
  download_icons_text: {
    fontSize: 14,
    color: colors.white,
    fontFamily: 'Lato',
  },
  modal: {
    position: 'relative',
    margin: 'auto',
    width: 480,
    display: 'flex',
    flexDirection: 'column',
    padding: 30,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.8)',
    '@media (max-width: 480px)': {
      width: '100%'
    },
  },
  signup: {
    position: 'absolute',
    right: 40,
    top: 30,
    color: colors.gray,
    fontFamily: 'Lato',
    fontSize: 18,
    textAlign: 'right',
    lineHeight: '28px',
  },
  link: {
    color: colors.gray,
    fontFamily: 'Lato',
    fontSize: 18,
    textTransform: 'none',
  },
  email_not_validated_error: {
    color: colors.red,
    fontSize: 16,
    fontFamily: 'Lato',
    marginBottom: 20
  },
  ask_new_mail_link: {
    textDecoration: 'underline',
    cursor: 'pointer'
  }
}
