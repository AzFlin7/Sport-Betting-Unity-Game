import React, { Component } from 'react';
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';

import Logo from './Logo.js';
import Submit from './Submit.js';
import Button from './Button.js';
import { colors } from '../../theme'
import Inputs from './Inputs'
import { Link } from 'found'
import { withAlert } from 'react-alert'

import localizations from '../Localizations'
import UpdatePasswordMutation from './ChangePasswordMutation';

let styles;

class ChangePassword extends Component {
  constructor() {
    super();
    this.state = {
      pass1: '',
      pass2: '',
      mutationFailed: false,
    }
  }

  _onChangePass1(pass) {
    this.setState({ pass1: pass });
  }

  _onChangePass2(pass) {
    this.setState({ pass2: pass });
  }

  _handleGoToAskMail() {
    this.props.router.push(`/resetpassword`);
  }

  _handleSubmit() {
    const { tokenId } = this.props.params;
    const { pass1, pass2 } = this.state;

    if (pass1 && pass2) {
      if (pass1 != pass2) {
        this.props.alert.show(localizations.popup_changePassword_pass_differents, {
          timeout: 4000,
          type: 'error',
        });
      }
      else if (pass1.length < 6) {
        this.props.alert.show(localizations.popup_changePassword_pass_not_long_enough, {
          timeout: 4000,
          type: 'error',
        });
      }
      else {
        UpdatePasswordMutation.commit({
            password: this.state.pass1,
            token: tokenId,
            viewer: this.props.viewer,
          },
          {
            onSuccess: () => {
              this.props.alert.show(localizations.popup_changePassword_update_success, {
                  timeout: 2000,
                  type: 'success',
                });
              setTimeout(() => {
                this.props.router.push(`/login`);
              }, 1000);
            },
            onFailure: (error) => {
              this.props.alert.show(error.getError().source.errors[0].message, {
                timeout: 4000,
                type: 'error',
              });
              this.setState({mutationFailed: true});
            },
          }
        );
      }
    }
    else {
      this.props.alert.show(localizations.popup_changePassword_please_fill, {
        timeout: 4000,
        type: 'error',
      });
    }
  }

  render() {
    //const { updateToken } = this.props.route;
    
    return (
      <div style={styles.container}>
        <div style={styles.signup}>{localizations.login_dontHaveAccount}<Link to='/register' style={styles.link}>{localizations.login_joinUs}</Link>
        </div>
        <div style={styles.modal}>
          <Logo />
          <Inputs 
            pass1={this.state.pass1}
            pass2={this.state.pass2}
            onChangePass1={this._onChangePass1.bind(this)} 
            onChangePass2={this._onChangePass2.bind(this)}
          />
          {this.state.mutationFailed ? <Button onSubmit={this._handleGoToAskMail.bind(this)} />: <Submit onSubmit={this._handleSubmit.bind(this)} />}
        </div>
      </div>
    );
  }
}

export default createFragmentContainer(withAlert(ChangePassword), {
  viewer: graphql`
    fragment ChangePassword_viewer on Viewer {
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
