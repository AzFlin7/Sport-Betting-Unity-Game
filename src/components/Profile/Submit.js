import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PureComponent, { pure } from '../common/PureComponent'
import {withRouter} from 'found';
import ProfileUpdateMutation from './ProfileUpdateMutation'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as types from '../../actions/actionTypes.js';
import Loading from 'react-loading';
import { withAlert } from 'react-alert'
import localizations from '../Localizations'
import { colors, fonts, metrics } from '../../theme';
let styles;

class Submit extends PureComponent {

  constructor() {
    super();
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

  _changeLoadingStatus = (bool) => {
    this.setState({
      isLoading: bool,
    });
  }

  _createSportRequest = (sports) => {
    let sportsVar = sports.map(sport => {
      return {
        sport: sport.sport.id,
        levels: sport.levels.map(level=> level.id),
        positions: sport.positions.map(position => position.value),
        certificates: sport.certificates.map(certificate => ({certificate: certificate.value})),        
        assistantType: sport.assistantType.map(assistantType => assistantType.value)
      }
    })
    return sportsVar
  }

  _updateUserProfile = () => {
    this._changeLoadingStatus(true);
    const viewer = this.props.viewer;
    const userIDVar = this.props.viewer.me.id;
    const usernameVar = this.props.username;
    const firstNameVar = this.props.firstName;
    const lastNameVar = this.props.lastName;

    const descriptionVar = this.props.description;
    let sexVar = this.props.sex;
    if (this.props.sex === ''){
      sexVar = this.props.user.sex
    }
    const birthdayVar = this.props.formattedBirthday;
    let languagesVar = this.props.languageIds;
    if(this.props.languageIds.length === 0){
      languagesVar = this.props.user.languages;
    }
    const sportsVar = this._createSportRequest(this.props.sports)
    //const addressVar = this.props.formattedAddress;
    const emailVar = this.props.email;
    const avatarVar = this.props.avatar;

    const publicAddress = this.props.publicAddress;
    const hideMyAgeVar = this.props.hideMyAge;
    let city, country;

    if (publicAddress) {
        if (!publicAddress.city) {
        let splitted = publicAddress.split(', ');
        city = splitted[0];
        country = splitted[1];
      }
      else {
        city = publicAddress.city;
        country = publicAddress.country;
      }
    }
    if (publicAddress && (!city || !country)) {
      this.props.alert.show(localizations.popup_editProfile_invalid_address_format, {
        timeout: 2000,
        type: 'error',
      });
      return ;
    }
    let re = /.{4,}/
    if (!re.test(usernameVar)) {
	    this.props.alert.show(localizations.popup_editProfile_failed, {
		    timeout: 2000,
		    type: 'error',
	    });
	    this._changeLoadingStatus(false);
	    return;
    }


    ProfileUpdateMutation.commit({
        viewer,
        user: this.props.viewer.me,
        userIDVar,
        firstNameVar,
        lastNameVar,
        usernameVar,
        descriptionVar,
        sexVar,
        birthdayVar,
        hideMyAgeVar,
        languagesVar,
        // addressVar,
        emailVar,
        sportsVar,
        //addressVar,
        // avatarVar,
        publicAddressVar: publicAddress ? {address: "", city, country} : null,
        file: this.props.avatarFile
      },
      {
        onFailure: error => {
          this.props.alert.show(localizations.popup_editProfile_failed, {
            timeout: 2000,
            type: 'error',
          });
          let errors = JSON.parse(error.getError().source);
          console.log(errors);
          this._changeLoadingStatus(false);
        },
        onSuccess: (response) => {

          this.props.alert.show(localizations.popup_editProfile_success, {
            timeout: 900,
            type: 'success',
          });

          setTimeout(() => {
            this._changeLoadingStatus(false);    
            let path = '/profile-view/' + userIDVar;
            this.props.router.push({
                pathname : path,
            })
          }, 1000);
        },
      }
    );
  }

  render() {
    return(
      <div style={styles.container}>
        {
          this.state.isLoading === true &&
            <Loading type='spinningBubbles' color='#e3e3e3' />
        }
        <button onClick={this._updateUserProfile} style={styles.submitButton}>{localizations.profile_submit}</button>
      </div>
    )
  }
}

Submit.propTypes = ({
  // firstName: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  sex: PropTypes.string.isRequired,
  formattedBirthday: PropTypes.string,
  languageIds: PropTypes.array.isRequired,
  // formattedAddress: PropTypes.oneOfType([
  //     PropTypes.string.isRequired,
  //     PropTypes.object.isRequired,
  //   ]),
  email: PropTypes.string.isRequired,
  hideMyAge: PropTypes.bool.isRequired
})

// REDUX //

const _resetProfileFormsAction = () => ({
  type: types.RESET_PROFILE_FORMS,
})

const stateToProps = (state) => ({
  firstName: state.profileReducer.firstName,
  lastName: state.profileReducer.lastName,

  username: state.profileReducer.username,
  description: state.profileReducer.description,
  sex: state.profileReducer.sex,
  formattedBirthday: state.profileReducer.formattedBirthday,
  languageIds: state.profileReducer.languageIds,
  // formattedAddress: state.profileReducer.formattedAddress,
  email: state.profileReducer.email,
  avatar: state.profileReducer.avatar,
  publicAddress: state.profileReducer.publicAddress,
  hideMyAge: state.profileReducer.hideMyAge
});

const dispatchToProps = (dispatch) => ({
  _resetProfileFormsAction: bindActionCreators(_resetProfileFormsAction, dispatch),
});

export default connect(
  stateToProps,
  dispatchToProps
)(withRouter(withAlert(Submit)));

styles = {
  container: {
    width: '80%',
  },
  submitButton: {
    backgroundColor: colors.green,
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    borderRadius: 50,
    // fontFamily: 'Lato',
    fontSize: fonts.size.medium,
    color: colors.white,
    padding: metrics.padding.medium,
    marginTop: 30,
    cursor: 'pointer',
    width: '100%',
    outline: 'none',

  },
}
