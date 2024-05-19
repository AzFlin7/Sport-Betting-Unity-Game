import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import Radium from 'radium';

import * as types from '../../actions/actionTypes.js';
import localizations from '../Localizations'
import {appStyles, colors} from '../../theme';
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import ToggleDisplay from 'react-toggle-display';

let styles;


class Inputs extends Component {
  constructor() {
    super();
    this.state = {
      isSubAccountWithDifferentEmail: true,
	    badPseudo: null,
	    badSubAccountPseudo: [],
      lastPseudo: null,
      checkEmail: false
    }
  }

	// componentWillReceiveProps = (nextProps) => {
  //   console.log("pokaz", this.state)
  //   console.log("t", nextProps)
  //   if (this.state.checkEmail) {
  //     this.setState({checkEmail: false})
  //   }
  //   else if (this.state.lastPseudo !== null) {
  //     if (this.state.lastPseudo === -1)
  //       this.setState({
  //         badPseudo: nextProps.viewer.userExists
  //       });
  //     else {
  //       let subAccountPseudo = this.state.badSubAccountPseudo;
  //       if (subAccountPseudo === [])
  //         this.props.subAccounts.forEach(subAccount => {
  //           subAccountPseudo.push(null)
  //         });
  //       subAccountPseudo[this.state.lastPseudo] = nextProps.viewer.userExists
	//       this.setState({
  //         badSubAccountPseudo: subAccountPseudo
  //       })
  //     }
  //   }

  componentWillReceiveProps = nextProps => {
    if (!this.props.isCreatingSubAccount && nextProps.isCreatingSubAccount) {
      this.props._updateEmailAction(this.props.me.email)
      this.setState({isSubAccountWithDifferentEmail: false})
    }
  };

  render () {
    const {
      pseudo,
      email,
      password1, 
      password2,
      phone,
      description,
      profileType,
      isCreatingSubAccount,
      me,
      subAccounts,
      _updatePseudoAction,
      _updateEmailAction,
      _updatePassword1Action,
      _updatePassword2Action,
      _updatePhoneAction,
      _updateDescriptionAction,
      _updateProfileTypeAction,
      _updateSubAccountsAction,
      _addSubAccountsAction,
      _updateErrorsPseudoAction,
      _updateErrorsEmailAction,
    } = this.props

    const _updatePseudo = (e) => {
      this.setState({
	      lastPseudo: -1
      });
      this.props.relay.refetch(fragmentVariables => ({
        ...fragmentVariables,
        query: true,
        pseudo: e.target.value,
      }),
      null,
      () => {
        if (this.props.viewer.userExists)
          _updateErrorsPseudoAction(true)
        else 
          _updateErrorsPseudoAction(false)
      });

      _updatePseudoAction(e.target.value);
      //setTimeout(() => checkError(), 200)
    }

    const _updateEmail = (e) => {
      if (!isCreatingSubAccount) {
        this.setState({checkEmail: true})

        this.props.relay.refetch(fragmentVariables => ({
          ...fragmentVariables,
          query: true,
          email: e.target.value,
        }),
        null,
        () => {
          if (this.props.viewer.userExists)
            _updateErrorsEmailAction(true)
          else 
            _updateErrorsEmailAction(false)
        });
      }
      _updateEmailAction(e.target.value);
    }
    const _updatePassword1 = (e) => {
      _updatePassword1Action(e.target.value);
    }
    
    const _updatePassword2 = (e) => {
      _updatePassword2Action(e.target.value);
    }

    const _updatePhone = (e) => {
      _updatePhoneAction(e.target.value);
    }

    const _updateDescription = (e) => {
      _updateDescriptionAction(e.target.value);
    }

    const _updateProfileType = (e) => {
      _updateProfileTypeAction(e.target.value);
    }
    
    const _updateIsSubAccountWithDifferentEmail = (e) => {
      this.setState({
        isSubAccountWithDifferentEmail: e.target.checked
      })
      if (!e.target.checked) {
        _updateEmailAction(me.email)
        _updatePassword1Action('');
        _updatePassword2Action('');
        _updatePhoneAction('');
      }
      else {
        _updateEmailAction("")
      }
    }

    const changeSubAccount = (subAccount, index) => {
	    this.setState({
		    lastPseudo: index
	    });
	    this.props.relay.refetch(fragmentVariables => ({
        ...fragmentVariables,
		    query: true,
		    pseudo: subAccount,
	    }));
      _updateSubAccountsAction(subAccount, index);
	    setTimeout(() => checkError(), 200)
    }

    const checkError = () => {
      let error = this.state.badPseudo;
      this.state.badSubAccountPseudo.forEach(subAccount => {
        error = error || (subAccount !== null && subAccount === true)
      })
      _updateErrorsPseudoAction(error)
    }

    const addSubAccounts = () => {
      _addSubAccountsAction();
    }

    let disabled = !isCreatingSubAccount && profileType === '';
    let stylesInputLabel = disabled ? {...appStyles.inputLabel, opacity: 0.5} : appStyles.inputLabel;
    let stylesInput = disabled ? {...appStyles.input, opacity: 0.5} : appStyles.input;

    return(
      <div style={styles.container}>

	      {!isCreatingSubAccount &&
	      <label style={appStyles.selectLabel}>
		      {localizations.register_profileType}:
		      <select
			      style={appStyles.selectInput}
			      onChange={_updateProfileType}
			      value={profileType}
			      required={true}
		      >
			      <option value=''>{localizations.register_user_type_none}</option>
			      <option value="PERSON">{localizations.register_user_type_person}</option>
			      <option value="BUSINESS">{localizations.register_user_type_business}</option>
			      <option value="ORGANIZATION">{localizations.register_user_type_organization}</option>
			      <option value="SOLETRADER">{localizations.register_user_type_soletrader}</option>
		      </select>
	      </label>
	      }
        <label style={stylesInputLabel}>
          {isCreatingSubAccount
            ? me && me.profileType === 'ORGANIZATION'
              ? localizations.register_pseudo_teams
              : me && me.profileType === 'BUSINESS'
                ? localizations.register_pseudo_employee
                : localizations.register_pseudo
            : profileType === 'ORGANIZATION'
              ? localizations.register_pseudo_organization
              : profileType === 'BUSINESS'
                ? localizations.register_pseudo_business
                : localizations.register_pseudo
          }:
          <input
            style={this.props.errorsPseudo ? {...stylesInput, borderColor: colors.red} : stylesInput}
            type="text"
            value={pseudo}
            disabled={disabled}
            onChange={_updatePseudo}
            placeholder={((me && me.profileType === 'ORGANIZATION') || profileType === 'ORGANIZATION')
              ? isCreatingSubAccount
                ? localizations.register_pseudo_placeholder_team
                : localizations.register_pseudo_placeholder_club
              : ((me && me.profileType === 'BUSINESS') || profileType === 'BUSINESS')
                ? localizations.register_pseudo_placeholder_business
                : isCreatingSubAccount
                  ? localizations.register_pseudo_placeholder_child
                  : localizations.register_pseudo_placeholder}
          />
	        <ToggleDisplay show={this.props.errorsPseudo}>
		        <label style={styles.error}>{localizations.registration_user_already_exists}</label>
	        </ToggleDisplay>
        </label>
        <label style={stylesInputLabel}>
          {isCreatingSubAccount && me && me.profileType === 'ORGANIZATION' ? localizations.register_email_organization : localizations.register_email}:
          <input
            style={this.props.errorEmail ? {...stylesInput, borderColor: colors.red} : stylesInput}
            type="text"
            value={email}
            onChange={_updateEmail}
            disabled={!this.state.isSubAccountWithDifferentEmail || disabled}
            placeholder={isCreatingSubAccount && me && me.profileType === 'ORGANIZATION' ? localizations.register_email_organization : localizations.register_email_placeholder}
          />
        </label>
        <ToggleDisplay show={this.props.errorEmail}>
          <label style={styles.error}>{localizations.registration_email_already_exists}</label>
        </ToggleDisplay>
        {isCreatingSubAccount && me && me.email && 
          <label style={styles.row}>
            {me && me.profileType === 'ORGANIZATION' ? localizations.register_suAccount_use_same_email_organization : localizations.register_suAccount_use_same_email}:
            <input
              style={styles.input}
              type="checkbox"
              value={this.state.isSubAccountWithDifferentEmail}
              onChange={_updateIsSubAccountWithDifferentEmail}
            />
          </label>
        }
        {this.state.isSubAccountWithDifferentEmail &&
          <span>
            <label style={stylesInputLabel}>
              {localizations.register_password}:
              <input
                style={stylesInput}
                type="password"
                disabled={disabled}
                value={password1}
                onChange={_updatePassword1}
                placeholder={localizations.login_password_holder}
              />
            </label>
            <label style={stylesInputLabel}>
              {localizations.register_passwordRepeat}:
              <input
                style={stylesInput}
                type="password"
                disabled={disabled}
                value={password2}
                onChange={_updatePassword2}
                placeholder={localizations.login_password_holder}
              />
            </label>
            <label style={stylesInputLabel}>
              {localizations.register_phone}:
              <input
                style={stylesInput}
                type="number"
                disabled={disabled}
                placeholder="0794563718"
                value={phone}
                onChange={_updatePhone}
                onscroll={e => e.preventDefault()}
              />
            </label>
          </span>
        }
        {!isCreatingSubAccount &&
          <span>
           <label style={stylesInputLabel}>
              <div style={{...styles.row, justifyContent: 'flex-start', cursor: 'pointer' }} onClick={() => addSubAccounts()}>
                <i
	                className='fa fa-plus-circle fa-2x'
	                style={{marginRight: 10}}
                />
                {profileType === 'ORGANIZATION'
                  ? localizations.register_subAccounts_organization + ':'
                  : profileType === 'BUSINESS'
                    ? localizations.register_subAccounts_business + ':'
                    : localizations.register_subAccounts + ':'
                }
              </div>
	            {subAccounts && subAccounts.map((subAccount, index) => (
	              <div>
                  <input
                    style={this.state.badSubAccountPseudo[index] ? {...stylesInput, borderColor: colors.red} : stylesInput}
                    type="text"
                    value={subAccount}
                    disabled={disabled}
                    onChange={(e) => changeSubAccount(e.target.value, index)}
                    placeholder={profileType === 'ORGANIZATION'
                      ? localizations['register_subAccounts_organization_placeholder_' + (index % 3 + 1)]
                      : profileType === 'BUSINESS'
                        ? localizations['register_subAccounts_business_placeholder_' + (index % 3 + 1)]
                        : localizations['register_subAccounts_placeholder_' + (index % 3 + 1)]}
                  />
                  <ToggleDisplay show={this.state.badSubAccountPseudo[index] === true}>
                    <label style={styles.error}>{localizations.registration_user_already_exists}</label>
                  </ToggleDisplay>
                </div>
              ))}
            </label>
          </span>
        }
        { false &&
        <label style={appStyles.textareaLabel}>
          {localizations.register_description}:
          <textarea
            style={appStyles.textareaInput}
            type="number"
            value={description}
            onChange={_updateDescription}
          />
        </label>
        }
      </div>
    )
  }
}
// REDUX //

const _updatePseudoAction = (text) => ({
  type: types.UPDATE_REGISTER_PSEUDO,
  text,
})

const _updateEmailAction = (text) => ({
  type: types.UPDATE_REGISTER_EMAIL,
  text,
})
const _updatePassword1Action = (text) => ({
  type: types.UPDATE_REGISTER_PASSWORD1,
  text,
})
const _updatePassword2Action = (text) => ({
  type: types.UPDATE_REGISTER_PASSWORD2,
  text,
})
const _updatePhoneAction = (num) => ({
  type: types.UPDATE_REGISTER_PHONE,
  num,
})
const _updateDescriptionAction = (text) => ({
  type: types.UPDATE_REGISTER_DESCRIPTION,
  text,
})
const _updateErrorsPseudoAction = (bool) => ({
  type: types.UPDATE_REGISTER_ERRORS_PSEUDO,
  bool,
})
const _updateErrorsEmailAction = bool => ({
  type: types.UPDATE_REGISTER_ERRORS_EMAIL, 
  bool
})

const _updateProfileTypeAction = (text) => ({
  type: types.UPDATE_REGISTER_PROFILETYPE,
  text
})

const _updateSubAccountsAction = (subAccount, index) => ({
  type: types.UPDATE_REGISTER_SUBACCOUNTS,
  subAccount,
  index
})

const _addSubAccountsAction = (subAccount) => ({
  type: types.ADD_REGISTER_SUBACCOUNTS,
  subAccount,
})

const stateToProps = (state) => ({
  pseudo: state.registerReducer.pseudo,
  email: state.registerReducer.email,
  password1: state.registerReducer.password1,
  password2: state.registerReducer.password2,
  phone: state.registerReducer.phone,
  description: state.registerReducer.description,
  profileType: state.registerReducer.profileType,
  subAccounts: state.registerReducer.subAccounts,
  errorsPseudo: state.registerReducer.errorsPseudo,
  errorEmail: state.registerReducer.errorEmail
})

const dispatchToProps = (dispatch) => ({
  _updatePseudoAction: bindActionCreators(_updatePseudoAction, dispatch),
  _updateEmailAction: bindActionCreators(_updateEmailAction, dispatch),
  _updatePassword1Action: bindActionCreators(_updatePassword1Action, dispatch),
  _updatePassword2Action: bindActionCreators(_updatePassword2Action, dispatch),
  _updatePhoneAction: bindActionCreators(_updatePhoneAction, dispatch),
  _updateDescriptionAction: bindActionCreators(_updateDescriptionAction, dispatch),
  _updateProfileTypeAction: bindActionCreators(_updateProfileTypeAction, dispatch),
  _updateSubAccountsAction: bindActionCreators(_updateSubAccountsAction, dispatch),
  _addSubAccountsAction: bindActionCreators(_addSubAccountsAction, dispatch),
  _updateErrorsPseudoAction: bindActionCreators(_updateErrorsPseudoAction, dispatch),
  _updateErrorsEmailAction: bindActionCreators(_updateErrorsEmailAction, dispatch)
})

const ReduxContainer = connect(
  stateToProps,
  dispatchToProps
)(Radium(Inputs));

export default createRefetchContainer(Radium(ReduxContainer), {
//OK
    viewer: graphql`
        fragment Inputs_viewer on Viewer @argumentDefinitions (
          pseudo: {type: "String", defaultValue: null},
          email: {type: "String"},
          query: {type: "Boolean!", defaultValue: false}
          ){
            id
            userExists(pseudo: $pseudo, email: $email, registration: true) @include(if: $query)
        }
    `
},
graphql`
query InputsRefetchQuery(
    $pseudo: String,
    $email: String,
    $query: Boolean!
) {
viewer {
    ...Inputs_viewer
    @arguments(
      pseudo: $pseudo,
      email: $email,
      query: $query
    )
}
}
`,
)

// STYLES //

styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: colors.blueLight,
    fontSize: '14px',
    lineHeight: 1,
    fontFamily: 'Lato',
    marginBottom: 20
  },
  input: {
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.blue,
    height: '32px',
    width: '18px',
    lineHeight: '32px',
    fontFamily: 'Lato',
    color: 'rgba(0,0,0,0.65)',
    outline: 'none',
  },
	error: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		alignSelf: 'center',
		color: colors.error,
		fontSize: 18,
    marginBottom: 10,
    fontFamily: 'Lato'
	},
};