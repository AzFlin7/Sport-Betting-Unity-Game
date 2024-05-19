import React, { Component } from 'react';
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import Logo from './Logo.js';
import Submit from './Submit.js';
import { colors } from '../../theme'
import Inputs from './Inputs'
import {Link} from 'found'
import { withAlert } from 'react-alert'

import localizations from '../Localizations'
import ChangePasswordMutation from './ResetPasswordMutation';

let styles;

class ResetPassword extends Component {
  constructor() {
    super();
    this.state = {
      email: '',
    }

    this.alertOptions = {
      offset: 14,
      position: 'top right',
      theme: 'light',
      transition: 'fade',
      timeout: 2000,
    };
  }

  _onChangeEmail(email) {
    this.setState({ email });
  }

  _onSubmit() {
    
    if (this.state.email) {
        ChangePasswordMutation.commit({
            email: this.state.email,
            viewer: this.props.viewer,
          },
          {
            onSuccess: () => {
              this.props.alert.show(localizations.popup_resetPassword_success, {
                  timeout: 2000,
                  type: 'success',
                });
              
            },
            onFailure: (error) => {
              this.props.alert.show(error.getError().source.errors[0].message, {
                timeout: 2000,
                type: 'error',
              });
            },
          }
        );
    }
    else {
      this.props.alert.show(localizations.popup_resetPassword_required_fields, {
        timeout: 2000,
        type: 'error',
      });      
    }
  }

  render() {
    return (
      <div style={styles.container}>
        
        <div style={styles.signup}>
          {localizations.login_dontHaveAccount} <Link to='/register' style={styles.link}>{localizations.login_joinUs}</Link>
        </div>
        <div style={styles.modal}>
          <Logo text={localizations.passwordReset}/>
          <Inputs 
            email={this.state.email}
            onChangeEmail={this._onChangeEmail.bind(this)} 
          />
          <Submit text={localizations.sendMeEmail} onSubmit={this._onSubmit.bind(this)} />
        </div>
      </div>
    );
  }
}

export default createFragmentContainer(withAlert(ResetPassword), {
  viewer: graphql`
    fragment ResetPassword_viewer on Viewer {
      id
    }
  `,
});

styles = {
  separator: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    marginTop: 10,
    marginBottom: 10,
  },
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    paddingTop: 63,
    paddingBottom: 63,


    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    width: '100vw',
    minHeight: '100vh',

    backgroundColor: colors.black,
    fontFamily: 'Lato',

    backgroundImage: 'url(/images/background-signup.jpg',

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
  },
  signup: {
    position: 'absolute',
    right: 40,
    top: 30,
    color: colors.gray,
    fontFamily: 'Lato',
    fontSize: 18,
  },
  link: {
    color: colors.gray,
    fontFamily: 'Lato',
    fontSize: 18,
    textTransform: 'none',
  },
}
