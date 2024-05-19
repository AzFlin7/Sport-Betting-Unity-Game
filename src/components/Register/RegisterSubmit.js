import React, { Component } from 'react';
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import RegisterEmailMutation from './RegisterEmailMutation'
import { connect } from 'react-redux';
import Loading from 'react-loading';
import { withAlert } from 'react-alert'
import appStyles from '../../theme/appStyles.js';
import localizations from '../Localizations'
import {Link} from 'found'
import styles from './styles.js';
import Facebook from './Facebook';
import Google from './Google';
import { bindActionCreators } from 'redux';
import * as types from '../../actions/actionTypes';
import cloneDeep from 'lodash/cloneDeep';

let style

class Submit extends Component {

  constructor() {
    super();
    this.state = {
      isLoading: false,
      superToken: '',
    }
    this.alertOptions = {
      offset: 14,
      position: 'top right',
      theme: 'light',
      timeout: 100,
      transition: 'fade',
    };
  }

  componentDidMount() {
    if(typeof window !== 'undefined') {
      const superToken = localStorage.getItem('superToken');
      this.setState({
        superToken,
      })
    }
  }

  _changeLoadingStatus = (bool) => {
    this.setState({
      isLoading: bool,
    })
  }

  // _getAge = (date) => {
  //   var today = new Date();
  //   var birthDate = new Date(date);
  //   var age = today.getFullYear() - birthDate.getFullYear();
  //   var m = today.getMonth() - birthDate.getMonth();
  //   if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
  //       age--;
  //   }
  //   return age;
  // }

  isValidEmailAddress(address) {
    let re = /^[a-z0-9][a-z0-9-_\.]+@([a-z]|[a-z0-9]?[a-z0-9-]+[a-z0-9])\.[a-z0-9]{2,10}(?:\.[a-z]{2,10})?$/;
    return re.test(address.trim())
  }

  checkSubAccount = () => {
    let valid = false
	  if (this.props.subAccounts && this.props.subAccounts.length > 0)
    {
	    this.props.subAccounts.forEach(subAccount => valid = valid || (subAccount !== '' && subAccount !== null))
    }
    return valid
  };

  _registerEmailUser = () => {
	  this._changeLoadingStatus(true);
	  const avatarVar = null;
	  const pseudoVar = this.props.pseudo;
	  const emailVar = this.props.email && this.props.email !== '' ? this.props.email.toLowerCase() : '';
	  const password1Var = this.props.password1;
	  const password2Var = this.props.password2;
	  const descriptionVar = this.props.description;
	  const profileTypeVar = this.props.isCreatingSubAccount ? this.props.me.profileType : this.props.profileType;
	  const phoneVar = this.props.isCreatingSubAccount && this.props.email === this.props.me.email ? this.props.me.phoneNumber : this.props.phone;
	  // const birthdayVar =  this.props.formattedBirthday;
	  const addressVar = this.props.address;
	  const subAccountsPseudoListVar = this.props.subAccounts.filter(e => e !== null && e !== '' && e !== undefined);
	  const sexVar = 'MALE';


	  if (this.props.isCreatingSubAccount && this.props.email === this.props.me.email) {
		  if (emailVar === '' ||
			  pseudoVar === ''
		  ) {
			  this.props.alert.show(localizations.popup_registration_required_fields, {
				  timeout: 3000,
				  type: 'error',
			  });
			  this._changeLoadingStatus(false);
			  return;
		  }
	  }
	  else if ((this.props.isCreatingSubAccount && this.props.email !== this.props.me.email) || !this.props.isCreatingSubAccount) {
		  if (emailVar === '' || password1Var === '' || password2Var === '' ||
			  avatarVar === '' || phoneVar === 0 ||
			  sexVar === '' || pseudoVar === ''
		  ) {
			  this.props.alert.show(localizations.popup_registration_required_fields, {
				  timeout: 3000,
				  type: 'error',
			  });
			  this._changeLoadingStatus(false);
			  return;
		  }
	  }

	  if (profileTypeVar === null || profileTypeVar === '') {
		  this.props.alert.show(localizations.popup_registration_required_fields, {
			  timeout: 3000,
			  type: 'error',
		  });
		  this._changeLoadingStatus(false);
		  return;
	  }

	  if (((this.props.isCreatingSubAccount && this.props.email !== this.props.me.email) || !this.props.isCreatingSubAccount) && password1Var !== password2Var) {
		  this.props.alert.show(localizations.popup_registration_passwords_differents, {
			  timeout: 2000,
			  type: 'error',
		  });
		  this._changeLoadingStatus(false);
	  }
	  else if (((this.props.isCreatingSubAccount && this.props.email !== this.props.me.email) || !this.props.isCreatingSubAccount) && password1Var.length < 6) {
		  this.props.alert.show(localizations.popup_registration_passwords_not_long_enough, {
			  timeout: 2000,
			  type: 'error',
		  });
		  this._changeLoadingStatus(false);
	  }
	  else if (!this.isValidEmailAddress(emailVar)) {
		  this.props.alert.show(localizations.popup_registration_invalid_email, {
			  timeout: 2000,
			  type: 'error',
		  });
		  this._changeLoadingStatus(false);
	  }
	  else if (isNaN(phoneVar) || phoneVar === '' || (phoneVar && (phoneVar.length > 10 || phoneVar.length < 8 || Number(phoneVar) >= Math.pow(2,31)))) {
		  this.props.alert.show(localizations.popup_registration_invalid_phone, {
			  timeout: 2000,
			  type: 'error',
		  });
		  this._changeLoadingStatus(false);
	  }
	  else if (this.props.errorsPseudo)
    {
      this.props.alert.show(localizations.popup_registration_user_already_exists, {
        timeout: 3000,
        type: 'error',
      })
      this._changeLoadingStatus(false);
    }
    else {
      RegisterEmailMutation.commit({
          superUserTokenVar: this.state.superToken,
          pseudoVar,
          emailVar: emailVar.trim(),
          passwordVar: password1Var,
          addressVar,
          descriptionVar,
          avatarVar,
          phoneVar,
          // birthdayVar,
          sexVar,
          profileTypeVar,
          appLanguageVar: localizations.getLanguage().toUpperCase(),
          appCurrencyVar: this.props.userCurrency, 
          appCountryVar: this.props.userCountry, 
	        subAccountsPseudoListVar
        },
        {
          onFailure: error => {
            this.props.alert.show(localizations.popup_registration_user_already_exists, {
              timeout: 3000,
              type: 'error',
            });
            // let errors = JSON.parse(error.getError().source);
            this._changeLoadingStatus(false);
          },
          onSuccess: (response) => {
            this._changeLoadingStatus(false);
            this.props.trackRegister('Register-Basic')
	          if (this.props.isCreatingSubAccount && this.props.email === this.props.me.email) {
		          this.props.alert.show(localizations.popup_registration_team, {
			          timeout: 5000,
			          type: 'success',
		          });
              this._updateTutorialSteps();
            }
	          else {
		          this.props.alert.show(localizations.popup_registration_success_check_mailbox, {
			          timeout: 5000,
			          type: 'success',
		          });
		          this.props.alert.show(localizations.popup_registration_success_check_mailbox_spam, {
			          timeout: 5000,
			          type: 'success',
		          });
            }
            if (this.props.createProfileFrom || this.state.superToken) {
              setTimeout(() => {
                if (this.props.createProfileFrom) {
                  this.props.router.push(this.props.createProfileFrom)
                }
                else if (this.state.superToken) {
                  window.location = '/'
                } 
              }, 3000)
            }
            else {
              setTimeout(() => {
                this.props.router.push(`/registration-completed`)
              }, 500);
            }
	          this._changeLoadingStatus(true);
          },
        }
      );
    }
  }

  _updateTutorialSteps = () => {
    const { tutorialSteps } = this.props;
    let newTutorialSteps = cloneDeep(tutorialSteps);

    newTutorialSteps['createSubAccountStep'] = true;
    this.props._updateStepsCompleted(newTutorialSteps);
  }

  render() {
    
    const { isCreatingSubAccount, profileType } = this.props;
    const { updateToken } = this.props.route;

    const { tokenId } = this.props.params;

	  let disabled = !isCreatingSubAccount && profileType === '';

    return(
      <div style={disabled ? {...styles.submitContainer, opacity: 0.5} : styles.submitContainer}>
        <div style={styles.submitSmallPrint}>{localizations.register_diclaimer} <Link to='/term' target='_blank'>{localizations.register_diclaimerLink}</Link>
          </div>
        {
          this.state.isLoading === true &&
            <Loading type='spinningBubbles' color='#e3e3e3' />
        }
        <button disabled={disabled} onClick={this._registerEmailUser} style={appStyles.greenButton}>
          {isCreatingSubAccount
          ? localizations.info_update.toUpperCase()
          : localizations.register_join
          }
        </button>
        {!isCreatingSubAccount && !disabled && profileType === 'PERSON' &&
          <span>
            <div className="strike" style={styles.submitOr}>{localizations.register_or}</div>
            <Facebook updateToken={updateToken} toProfile={tokenId ? true : false} {...this.props}/>
            <div className="strike" style={styles.submitOr}>{localizations.register_or}</div>
            <Google updateToken={updateToken} toProfile={tokenId ? true : false} {...this.props}/>
          </span>
        }
      </div>
    )
  }
}

style = {
  alert: {
    fontFamily: 'Lato',
  },
}


// REDUX //
const _updateStepsCompleted = steps => ({
  type: types.UPDATE_STEPS_COMPLETED,
  tutorialSteps: steps,
});

const dispatchToProps = dispatch => ({
  _updateStepsCompleted: bindActionCreators(_updateStepsCompleted, dispatch)
});

const stateToProps = (state) => ({
  pseudo: state.registerReducer.pseudo,
  email: state.registerReducer.email,
  password1: state.registerReducer.password1,
  password2: state.registerReducer.password2,
  phone: state.registerReducer.phone,
  description: state.registerReducer.description,
  profileType: state.registerReducer.profileType,
  createProfileFrom: state.registerReducer.createProfileFrom,
  subAccounts: state.registerReducer.subAccounts,
  errorsPseudo: state.registerReducer.errorsPseudo,
  userCountry: state.globalReducer.userCountry,
  userCurrency: state.globalReducer.userCurrency,
  tutorialSteps: state.profileReducer.tutorialSteps,
  // formattedBirthday: state.registerReducer.formattedBirthday,
})

const ReduxContainer = connect(
  stateToProps,
  dispatchToProps
)(Submit);

export default createFragmentContainer(withAlert(ReduxContainer), {
  viewer: graphql`
    fragment RegisterSubmit_viewer on Viewer {
      id
    }
  `,
});
