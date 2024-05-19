import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PureComponent, { pure } from '../common/PureComponent'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as types from '../../actions/actionTypes.js';
import Select from 'react-select'
import localizations from '../Localizations'
// import 'react-select/dist/react-select.css';
import { appStyles, colors, metrics, fonts } from '../../theme';
let styles;

class Inputs extends PureComponent {

  // _updateName = (e) => {
  //   this.props._updateFirstNameAction(e.target.value)
  // }

  _updateUsername = (e) => {
    this.props._updateUsernameAction(e.target.value)
  }

  _updateDescription = (e) => {
    this.props._updateDescriptionAction(e.target.value.substr(0,3000))
  }

  _updateFirstname = (e) => {
    this.props._updateFirstnameAction(e.target.value)
  }

  _updateLastname = (e) => {
    this.props._updateLastnameAction(e.target.value)
  }

  _updateSex = (obj) => {
    const text = obj.value;
    this.props._updateSexAction(text)
  }

  componentDidMount = () => {
    this.props._updateUsernameAction(this.props.user.pseudo)
    this.props._updateFirstnameAction(this.props.user.firstName)
    this.props._updateLastnameAction(this.props.user.lastName)
    this.props._updateDescriptionAction(this.props.user.description)
    this.props._updateSexAction(this.props.user.sex)
    this.props._updateAvatarAction(this.props.user.avatar)
  }

  render() {
    const { sex } = this.props;

    const sexOptions = [
      { value: '', label: '' },
      { value: 'MALE', label: localizations.profile_sex_male },
      { value: 'FEMALE', label: localizations.profile_sex_female },
      { value: 'OTHER', label: localizations.profile_sex_other },
    ];

    return (
      <div style={styles.container}>

        <label style={appStyles.inputLabel}>
          {localizations.profile_pseudo}:
          <input
            value={this.props.username}
            placeholder={localizations.profile_pseudo}
            style={appStyles.input}
            type='text'
            onChange={(e) => this._updateUsername(e)}

          />
        </label>

        <label style={appStyles.textareaLabel}>
          {localizations.profile_description}:
          <textarea
            value={this.props.description}
            placeholder={localizations.profile_description_placeholder}
            style={styles.textareaInput}
            type='text'
            onChange={(e) => this._updateDescription(e)}
          />
        </label>
	      { this.props.user.profileType === 'PERSON' &&
		      <label style={appStyles.textareaLabel}>
			      {localizations.profile_gender}:
			      <div style={styles.selectContainer}>
				      <Select
					      placeholder={localizations.profile_gender}
					      style={styles.select}
					      options={sexOptions}
					      onChange={this._updateSex}
					      value={sex}
					      clearable={false}
				      />
			      </div>
		      </label>
	      }

      </div>
    );
  }
}

Inputs.propTypes = {
  user: PropTypes.object.isRequired,
}

// REDUX

const _getInitialProfileDataAction = (text) => ({
  type: types.GET_INITIAL_PROFILE,
  text,
});

// const _updateFirstNameAction = (text) => ({
//   type: types.UPDATE_PROFILE_NAME,
//   text,
// });

const _updateUsernameAction = (text) => ({
  type: types.UPDATE_PROFILE_USERNAME,
  text,
});

const _updateFirstnameAction = (text) => ({
  type: types.UPDATE_PROFILE_FIRST_NAME,
  text,
});

const _updateLastnameAction = (text) => ({
  type: types.UPDATE_PROFILE_LAST_NAME,
  text,
});

const _updateDescriptionAction = (text) => ({
  type: types.UPDATE_PROFILE_DESCRIPTION,
  text,
});

const _updateSexAction = (text) => ({
  type: types.UPDATE_PROFILE_SEX,
  text,
});

const _updateAvatarAction = (text) => ({
  type: types.UPDATE_PROFILE_AVATAR,
  text,
});

const stateToProps = (state) => ({
  firstName: state.profileReducer.firstName,
  lastName: state.profileReducer.lastName,
  username: state.profileReducer.username,
  description: state.profileReducer.description,
  sex: state.profileReducer.sex,
  languageIds: state.profileReducer.languageIds,
  sports: state.profileReducer.sports,
  birthday: state.profileReducer.birthday,
  formattedBirthday: state.profileReducer.formattedBirthday,
  formattedAddress: state.profileReducer.formattedAddress,
  email: state.profileReducer.email,
})

const dispatchToProps = (dispatch) => ({
  // _updateFirstNameAction: bindActionCreators(_updateFirstNameAction, dispatch),
  _updateAvatarAction: bindActionCreators(_updateAvatarAction, dispatch),
  _updateUsernameAction: bindActionCreators(_updateUsernameAction, dispatch),
  _updateFirstnameAction: bindActionCreators(_updateFirstnameAction, dispatch),
  _updateLastnameAction: bindActionCreators(_updateLastnameAction, dispatch),
  _updateDescriptionAction: bindActionCreators(_updateDescriptionAction, dispatch),
  _updateSexAction: bindActionCreators(_updateSexAction, dispatch),
  _getInitialProfileDataAction: bindActionCreators(_getInitialProfileDataAction, dispatch),
})

export default connect(
  stateToProps,
  dispatchToProps
)(Inputs);

styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '90%',
  },
  selectContainer: {
    borderBottomWidth: metrics.border.small,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.blue,
    marginBottom: metrics.margin.large,
  },
  select: {
    border: 0,
    fontSize: fonts.size.medium,
    color: 'red',

  },
  textareaInput: {
    minHeight: '100px',
    border: '1px solid rgba(0,0,0,0.2)',
    borderColor: 'transparent',
    background: 'rgba(255,255,255,.5)',
    marginTop: '20px',
    marginBottom: '20px',
    borderBottom: '2px solid '+colors.blue,
    fontSize: 13,
    outline: 'none',
    resize: 'none'
  },
}

// <label style={appStyles.inputLabel}>
//   Name:
//   <input
//     placeholder={this.props.user.firstName}
//     style={appStyles.input}
//     type="text"
//     onChange={(e) => this._updateName(e)}
//
//   />
// </label>


// <label style={appStyles.inputLabel}>
//   Name:
//   <input
//     placeholder={this.props.user.firstName}
//     style={appStyles.input}
//     type="text"
//     onChange={(e) => this._updateName(e)}
//
//   />
// </label>
