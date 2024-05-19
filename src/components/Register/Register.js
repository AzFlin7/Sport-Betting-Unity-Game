import React, { Component } from 'react';
import {Link} from 'found'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium'
import ReactPixel from 'react-facebook-pixel'

import Logo from './Logo.js';
import Inputs from './Inputs.js';
import Birthday from './Birthday.js';
import Submit from './RegisterSubmit.js';
import styles from './styles.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import localizations from '../Localizations'
import Footer from '../common/Footer/LoginFooter'
import * as types from '../../actions/actionTypes.js';

class Register extends Component {
  constructor(props) {
    super(props)
    this.state = {
      language: localizations.getLanguage(),
      isCreatingSubAccount: false,
      afterRegistration: false
    }
  }

  _setLanguage = (language) => {
    this.setState({ language: language })
  }
  
  componentDidMount = () => {
    if (this.props.createProfileFrom) {
      const temp = this.props.createProfileFrom;
      const temp2 = this.props.subAccountCreation;
      
      this.props._resetAction();
      
      if (temp.split('/')[0] === 'profileType')
        this.props._updateProfileTypeAction(temp.split('/')[1]);

      this.props._updateRegisterFromAction(temp)
      this.props._updateSubAccountCreation(temp2)
    }
    else {
      this.props._resetAction()
    }

    if(typeof window !== 'undefined') {
      const superToken = localStorage.getItem('superToken');
      if (superToken)
        this.setState({
          isCreatingSubAccount: true,
        })
    }    
  }

  componentWillReceiveProps = nextProps => {
    if (this.props.location.pathname.indexOf('registration-completed') < 0 && nextProps.location.pathname.indexOf('registration-completed') >= 0) {
      this.setState({afterRegistration: true})
    }
    if (this.props.location.pathname.indexOf('registration-completed') >= 0 && nextProps.location.pathname.indexOf('registration-completed') < 0) {
      this.props._resetAction()
      this.setState({afterRegistration: false})
    }  
  }

  _trackRegister = (event) => {
    ReactPixel.trackCustom( event )
  }

  render() {

    const { viewer } = this.props;

    return (
      <div style={styles.container}>
        <div style={styles.signin}>
          <Footer onUpdateLanguage={this._setLanguage} viewer={viewer} user={viewer.me}/>
          {localizations.register_already} 
          <Link to={`/login`} style={styles.signinLink}>{localizations.register_signin}</Link>
          
        </div>
        <div style={styles.modalContainer}>
          <Logo 
            {...this.state} 
            me={viewer.me}
          />

          {this.state.afterRegistration
          ? <div style={styles.h2}>
              {localizations.register_header_thankyou_message[0]}<span style={styles.email}>{this.props.email.toLowerCase()}</span>{localizations.register_header_thankyou_message[1]}
            </div>
          : <Inputs 
              {...this.state} 
              me={viewer.me}
              viewer={viewer}
            />
          }
          {!this.state.afterRegistration &&
            <Submit 
              trackRegister={this._trackRegister} 
              viewer={viewer} 
              {...this.props} 
              {...this.state} 
              me={viewer.me}
            />
          }
        </div>
        
      </div>
    );
  }
}


const _resetAction = () => ({
  type: types.UPDATE_REGISTER_RESET,
})

const _updateRegisterFromAction = (text) => ({
  type: types.UPDATE_REGISTER_FROM,
  text
})

const _updateProfileTypeAction = (text) => ({
  type: types.UPDATE_REGISTER_PROFILETYPE,
  text
})

const _updateSubAccountCreation = (value) => ({
  type: types.UPDATE_REGISTER_SUBACCOUNT_CREATION, 
  value
})

const stateToProps = state => ({
  createProfileFrom: state.registerReducer.createProfileFrom,
  subAccountCreation: state.registerReducer.subAccountCreation, 
  profileType: state.registerReducer.profileType,
  email: state.registerReducer.email,
})

const dispatchToProps = (dispatch) => ({
  _resetAction: bindActionCreators(_resetAction, dispatch),
  _updateProfileTypeAction: bindActionCreators(_updateProfileTypeAction, dispatch),
  _updateRegisterFromAction: bindActionCreators(_updateRegisterFromAction, dispatch),
  _updateSubAccountCreation: bindActionCreators(_updateSubAccountCreation, dispatch)
})

const Redux = connect(
  stateToProps,
  dispatchToProps
)(Radium(Register));

export default createFragmentContainer(Radium(Redux), {
  viewer: graphql`
    fragment Register_viewer on Viewer {
      id
      ...RegisterSubmit_viewer
      ...Inputs_viewer
      me {
        id
        email
        profileType
        phoneNumber
        numberOfUnreadNotifications
        notifications(last: 5) {
          edges {
            node {
              id
              text
              link
              created
            }
          }
        }
      }
    }
  `,
});
