import React, { Fragment } from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import Radium, { StyleRoot } from 'radium';
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import { withAlert } from 'react-alert'
import Modal from 'react-modal'
import Select from 'react-select'
import get from 'lodash/get'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {GoogleMap, Marker, withScriptjs, withGoogleMap} from 'react-google-maps'

import localizations from '../Localizations'
import { colors, fonts, metrics } from '../../theme'

import ProfileSports from './ProfileSports';
import Feedbacks from './Feedbacks';
import ClubsStats from './ClubsStats';

import BlockMutation from './BlockMutation'
import ReportMutation from './ReportMutation'
import InputEditMode from './InputEditMode';
import UpdateUserDescriptionMutation from './UpdateUserDescriptionMutation';
import UpdateUserSportsMutation from './UpdateUserSportsMutation';
import UpdateUserLanguagesMutation from './UpdateUserLanguagesMutation';
import StatsSummary from './StatsSummary';
import ProfileGroups from './ProfileGroups';
import Languages from '../Profile/Languages';
import Birthday from '../Profile/Birthday';
import UpdateUserBirthdayMutation from './UpdateUserBirthdayMutation';
import UpdateUserGenderMutation from './UpdateUserGenderMutation';
import cloneDeep from 'lodash/cloneDeep';
import * as types from '../../actions/actionTypes';


const isolanguages = require('@cospired/i18n-iso-languages')
isolanguages.registerLocale(require("@cospired/i18n-iso-languages/langs/en.json"))
isolanguages.registerLocale(require("@cospired/i18n-iso-languages/langs/fr.json"))
isolanguages.registerLocale(require("@cospired/i18n-iso-languages/langs/de.json"))

let styles, modalStyles

const Map = withScriptjs(withGoogleMap((props) =>
  <GoogleMap
    defaultZoom={10}
    defaultCenter={props.position}
    options={{ 
      scrollwheel: false, 
      navigationControl: false, 
      mapTypeControl: false, 
      scaleControl: false, 
      // draggable: false
    }}
  >
    {props.isMarkerShown && <Marker position={props.position} />}
  </GoogleMap>
))


const capitalize = s => s[0].toUpperCase() + s.substr(1);

const listLanguages = (langs) => {
  if (!Array.isArray(langs) || langs.length === 0) {
    return '';
  }

  if (langs.length === 1) {
    return capitalize(langs[0]);
  }

  if (langs.length === 2) {
    return langs.map(capitalize).join(' '+localizations.profile_and+' ');
  }
  return langs.slice(0, langs.length-1).map(capitalize).join(', ')+' '+localizations.profile_and+' '+capitalize(langs[langs.length-1]);

};

class Content extends PureComponent {
  constructor(props) {
    super(props)
    this.alertOptions = {
      offset: 60,
      position: 'top right',
      theme: 'light',
      transition: 'fade',
    };
    this.state = {
      blockModalIsOpen: false,
      reportModalIsOpen: false,
      reportMessage: '',
      loadMoreQueryIsLoading: false,
      pageSize: 10,
      itemCount: 2,
    }
  }

  _reportMessageChanged = (e) => {
    this.setState({
      reportMessage: e.target.value,
    })
  }

  _reportUser = () => {
    const viewer = this.props.viewer
    const userIDVar = this.props.user.id
    const reasonVar = this.state.reportMessage

    ReportMutation.commit({
        viewer,
        userIDVar,
        reasonVar,
      },
      {
        onFailure: error => {
          let errors = JSON.parse(error.getError().source);
          console.log(errors);
        },
        onSuccess: () => {
          this.props.alert.show(localizations.popup_profileView_report_user_success, {
            timeout: 2000,
            type: 'success',
          });
          this.setState({
            reportModalIsOpen: false,
            reportMessage: '',
          })
        },
      }
    );
  }

  _blockUser = () => {
    const blackListVar = this.props.me.blackList.map(bl => bl.id)
    blackListVar.push(this.props.user.id)

    const viewer = this.props.viewer
    const meId = this.props.me.id

    BlockMutation.commit({
        viewer,
        meId,
        blackListVar,
      },
      {
        onFailure: error => {
          let errors = JSON.parse(error.getError().source);
          console.log(errors);
        },
        onSuccess: () => {
          this.props.alert.show(localizations.popup_profileView_block_user_success, {
            timeout: 2000,
            type: 'success',
          });
          this.setState({
            blockModalIsOpen: false,
          })
        },
      }
    );
  }

  _handleReport = () => {
    this.setState({
      reportModalIsOpen: true,
      reportMessage: '',
    })
  }

  _handleBlock = () => {
    this.setState({
      blockModalIsOpen: true,
    })
  }

  _closeBlockModal = () => {
    this.setState({
      blockModalIsOpen: false,
    })
  }

  _closeReportModal = () => {
    this.setState({
      reportModalIsOpen: false,
      reportMessage: '',
    })
  }

  _getAge = (birthday) => {
    var today = new Date();
    var birthDate = new Date(birthday);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  _updateDescription = () => {
    const userID = this.props.user.id;
    const { description } = this.state;

    if (description.length === 0) {
      this.props.alert.show(localizations.popup_profileView_cant_be_empty, {
        timeout: 2000,
        type: 'error',
      });

      return false;
    }

    UpdateUserDescriptionMutation.commit({
      userID,
      user: {
        description,
      },
    },
    {
      onSuccess: (isPublicProfileComplete) => {
        this.props.alert.show(localizations.popup_updateVenue_success, {
          timeout: 2000,
          type: 'success',
        });
        if (isPublicProfileComplete) {
          this._updateTutorialSteps();
        }
        this.setState({ edit: false });
      },
      onFailure: error => {
        let errors = JSON.parse(error.getError().source);
        console.log(errors);
      },
    });
  }

  _updateBirthday = () => {
    const userID = this.props.user.id;
    const { birthday, hideMyAge } = this.state;

    console.log({ birthday, hideMyAge });

    if (birthday.length === 0) {
      this.props.alert.show(localizations.popup_profileView_cant_be_empty, {
        timeout: 2000,
        type: 'error',
      });

      return false;
    }

    UpdateUserBirthdayMutation.commit({
      userID,
      user: {
        birthday,
        hideMyAge: hideMyAge || false,
      },
    },
    {
      onSuccess: (isPublicProfileComplete) => {
        this.props.alert.show(localizations.popup_updateVenue_success, {
          timeout: 2000,
          type: 'success',
        });
        if (isPublicProfileComplete) {
          this._updateTutorialSteps();
        }
        this.setState({ edit: false });
      },
      onFailure: error => {
        let errors = JSON.parse(error.getError().source);
        console.log(errors);
      },
    });
  }

  _updateGender = () => {
    const userID = this.props.user.id;
    const { sex } = this.state;

    console.log({ sex });

    if (!get(sex, 'label')) {
      this.props.alert.show(localizations.popup_profileView_cant_be_empty, {
        timeout: 2000,
        type: 'error',
      });

      return false;
    }

    UpdateUserGenderMutation.commit({
      userID,
      user: {
        sex: sex.value,
      },
    },
    {
      onSuccess: (isPublicProfileComplete) => {
        this.props.alert.show(localizations.popup_updateVenue_success, {
          timeout: 2000,
          type: 'success',
        });
        if (isPublicProfileComplete) {
          this._updateTutorialSteps();
        }
        this.setState({ edit: false });
      },
      onFailure: error => {
        let errors = JSON.parse(error.getError().source);
        console.log(errors);
      },
    });
  }

  _updateLanguages = () => {
    const userID = this.props.user.id;
    const { languages } = this.state;

    if (languages.length === 0) {
      this.props.alert.show(localizations.popup_profileView_cant_be_empty, {
        timeout: 2000,
        type: 'error',
      });

      return false;
    }

    UpdateUserLanguagesMutation.commit({
      userID,
      user: {
        languages: languages.map(language => language.id),
      },
    },
    {
      onSuccess: (isPublicProfileComplete) => {
        this.props.alert.show(localizations.popup_updateVenue_success, {
          timeout: 2000,
          type: 'success',
        });
        if (isPublicProfileComplete) {
          this._updateTutorialSteps();
        }
        this.setState({ edit: false });
      },
      onFailure: error => {
        let errors = JSON.parse(error.getError().source);
        console.log(errors);
      },
    });
  }

  _handleAddSport = (sport) => {
    const { user } = this.props;

    if (user.sports && user.sports.length > 0 && user.sports.findIndex(sp => sp.sport.id === sport.sport.id) >= 0) {
      this.props.alert.show(localizations.popup_updateSport_already, {
        timeout: 2000,
        type: 'error',
      });
      return ;
    }

    UpdateUserSportsMutation.commit({
      userID: user.id,
      user: {
        sports: this._createSportRequest([...this._getFormattedSports(user.sports), sport]),
      },
    },
    {
      onSuccess: (isPublicProfileComplete) => {
        this.props.alert.show(localizations.popup_updateVenue_success, {
          timeout: 2000,
          type: 'success',
        });
        if (isPublicProfileComplete) {
          this._updateTutorialSteps();
        }
        console.log('sport updated');
      },
      onFailure: error => {
        let errors = JSON.parse(error.getError().source);
        console.log(errors);
      },
    });
  }

  _handleDeleteSport = (sportId) => {
    const { user } = this.props;
    let sports = cloneDeep(this._getFormattedSports(user.sports));
    let index = sports.findIndex(sport => sport.sport.id === sportId)
    if (index < 0) return ;
    sports.splice(index, 1)

    UpdateUserSportsMutation.commit({
      userID: user.id,
      user: {
        sports: this._createSportRequest(sports),
      },
    },
    {
      onSuccess: (isPublicProfileComplete) => {
        this.props.alert.show(localizations.popup_updateVenue_success, {
          timeout: 2000,
          type: 'success',
        });
      },
      onFailure: error => {
        let errors = JSON.parse(error.getError().source);
        console.log(errors);
      },
    });
  }

  _createSportRequest = (sports) => {
    return sports.map(sport => {
      return {
        sport: sport.sport.id,
        levels: sport.levels.map(level=> level.id),
        positions: sport.positions.map(position => position.value),
        certificates: sport.certificates.map(certificate => ({certificate: certificate.value})),        
        assistantType: sport.assistantType.map(assistantType => assistantType.value)
      }
    })
  }

  _getFormattedSports = (sports) => {
    return sports.map(sport => {
      const sportPositions = sport.positions || [];
      const sportAssistantType = sport.assistantType || [];
      const sportCertificates = sport.certificates || [];
      return {
        sport: {
          id: sport.sport.id,
          logo: sport.sport.logo,
          name: sport.sport.name[localizations.getLanguage().toUpperCase()],
        },
        levels: sport.levels.map(level => ({
          id: level.id,
          name: level[localizations.getLanguage().toUpperCase()].name,
        })),
        levelFrom: sport.levels.length && {
          value: sport.levels[0].id,
          name: sport.levels[0][localizations.getLanguage().toUpperCase()].name,
        },
        levelTo: sport.levels.length && {
          value: sport.levels[sport.levels.length - 1].id,
          name: sport.levels[sport.levels.length - 1][localizations.getLanguage().toUpperCase()].name,
        },
        positions: sportPositions.map(position => ({
          value: position.id,
          name: position[localizations.getLanguage().toUpperCase()],
        })),
        certificates: sportCertificates.map(certificate => ({value: certificate.certificate.id, name: certificate.certificate.name[localizations.getLanguage().toUpperCase()]})),
        assistantType: sportAssistantType.map(assistantType => ({
          value: assistantType.id, 
          name: assistantType.name[localizations.getLanguage().toUpperCase()]
        }))
      }
    });
  }

  _updateTutorialSteps = () => {
    const { tutorialSteps } = this.props;
    let newTutorialSteps = cloneDeep(tutorialSteps);

    newTutorialSteps['fulfilProfileStep'] = true;
    this.props._updateStepsCompleted(newTutorialSteps);
  }

  render() {
    const { user, me, isSelfProfile, viewer } = this.props;
    const sexOptions = [
      { value: '', label: '' },
      { value: 'MALE', label: localizations.profile_sex_male },
      { value: 'FEMALE', label: localizations.profile_sex_female },
      { value: 'OTHER', label: localizations.profile_sex_other },
    ];

    const toShowBirthday = user.profileType !== 'ORGANIZATION' && user.birthday && (isSelfProfile ? true : !user.hideMyAge);
    const toShowLanguages = user.languages.length > 0;
    const toShowGender = user.profileType !== 'ORGANIZATION' && user.sex;
    const toShowAdvancedInfo = toShowBirthday || toShowGender || toShowLanguages;

    return(
      <div style={styles.content}>
        <div style={styles.sections}>
          <h2 style={styles.title}>
            {localizations.profileView_description}
            {isSelfProfile && this.state.edit !== 'description' &&
              <i
                style={styles.pencil}
                className="fa fa-pencil"
                aria-hidden="true"
                onClick={() => { this.setState({ edit: 'description', description: user.description }) }}
              />
            }
          </h2>
          <div style={styles.description}>
            {this.state.edit === 'description'
            ? <InputEditMode
                value={this.state.description}
                onChange={(e) => { this.setState({ description: e.target.value }); }}
                maxLength={200}
                onConfirm={this._updateDescription}
                onCancel={() => { this.setState({ edit: false }); }}
                type="textArea"
              />
            : <p style={styles.descriptionLine}>
                {user.description
                ? user.description
                : isSelfProfile ? localizations.profileView_no_description_you : `${user.pseudo} ${localizations.profileView_no_description}.`}
              </p>
            }
          </div>
        </div>
        <div style={styles.sections}>
          <ProfileSports
            viewer={viewer}
            user={user}
            sports={user.sports}
            onAddSport={this._handleAddSport}
            isSelfProfile={isSelfProfile}
            onDeleteSport={this._handleDeleteSport}
          />
        </div>

        {toShowAdvancedInfo &&
        <div style={styles.sections}>
          <h2 style={styles.title}>
            {localizations.info_advancedInformation}
          </h2>
          {toShowBirthday && (
            <div style={{ display: 'flex', marginTop: 40, marginLeft: 40, alignItems: 'center' }}>
              <div style={{display: 'flex', alignItems: 'center'}}>
                <span style={styles.subtitle}>{localizations.profile_age + ': '}</span>
                {this.state.edit === 'birthday'
                ? <span style={{ marginLeft: 40, marginTop: 10 }}>
                    <InputEditMode
                      onConfirm={this._updateBirthday}
                      onCancel={() => { this.setState({ edit: false }); }}
                      renderInput={(styles) => (
                        <Birthday
                          user={viewer.me}
                          style={styles}
                          onChange={(date, formattedDate) => { this.setState({ birthday: formattedDate }) }}
                          onChangeHideAge={(hideMyAge) => { this.setState({ hideMyAge }); }}
                        />
                      )}
                    />
                  </span>
                : <span style={{ marginTop: 2, marginLeft: 10, fontSize: 18 }}>
                    {this._getAge(user.birthday) + ' ' + localizations.profile_yearsOld}
                  </span>
                }
              </div>
              <Fragment>
                {isSelfProfile && this.state.edit !== 'birthday' &&
                  <i
                    style={styles.pencil}
                    className="fa fa-pencil"
                    aria-hidden="true"
                    onClick={() => { this.setState({ edit: 'birthday', birthday: user.birthday }) }}
                  />
                }
              </Fragment>
            </div>
          )}
          {toShowGender &&
            <div style={{ display: 'flex', marginTop: 40, marginLeft: 40, marginBottom: 40, alignItems: 'center' }}>
              <div style={{display: 'flex', alignItems: 'center'}}>
                <span style={styles.subtitle}>
                  {localizations.profile_gender + ': '}
                </span>
                {this.state.edit === 'sex'
                ? <div style={styles.languageInputContainer}>
                    <InputEditMode
                      onConfirm={this._updateGender}
                      onCancel={() => { this.setState({ edit: false }); }}
                      renderInput={(styles) => (
                        <Select
                          placeholder={localizations.profile_gender}
                          styles={selectStyles}
                          options={sexOptions}
                          onChange={(value) => { console.log(value); this.setState({ sex: value }); }}
                          value={this.state.sex}
                          isClearable={false}
                        />
                      )}
                    />
                  </div>
                : <span style={{ marginTop: 2, marginLeft: 10, fontSize: 18 }}>
                    {sexOptions.find(sexOption => user.sex === sexOption.value ).label}
                  </span>
                }
              </div>
              <Fragment>
                {isSelfProfile && this.state.edit !== 'sex' &&
                  <i
                    style={styles.pencil}
                    className="fa fa-pencil"
                    aria-hidden="true"
                    onClick={() => { this.setState({ edit: 'sex', sex: user.sex }) }}
                  />
                }
              </Fragment>
            </div>
          }
          {toShowLanguages &&
            <div style={{ display: 'flex', marginLeft: 40, marginBottom: 40, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{...styles.subtitle, width: this.state.edit === 'languages' ? 210 : 'auto' }}>{localizations.profileView_language}:</span>
                {this.state.edit === 'languages'
                ? <div style={styles.languageInputContainer}>
                    <InputEditMode
                      onConfirm={this._updateLanguages}
                      onCancel={() => { this.setState({ edit: false }); }}
                      renderInput={(styles) =>
                        <Languages
                          languages={viewer.languages}
                          meLanguages={this.state.languages}
                          hideTitle={true}
                          styles={selectStyles}
                          onChange={(languages) => {
                            this.setState({
                              languages,
                            });
                          }}
                        />
                      }
                    />
                  </div>
                : <p style={styles.languages}>
                    {isSelfProfile
                    ? `${localizations.profileView_speak} ${listLanguages(user.languages.map(l => isolanguages.getName(l.code, localizations.getLanguage())))}.`
                    : `${user.pseudo} ${localizations.profileView_speaks} ${listLanguages(user.languages.map(l => isolanguages.getName(l.code, localizations.getLanguage())))}.`
                    }
                  </p>
                }
              </div>
              <Fragment>
                {isSelfProfile && this.state.edit !== 'languages' &&
                  <i
                    style={styles.pencil}
                    className="fa fa-pencil"
                    aria-hidden="true"
                    onClick={() => { this.setState({ languages: user.languages }, () => { this.setState({ edit: 'languages' }) }) }}
                  />
                }
              </Fragment>
            </div>
          }
        </div>
        }
        <div style={styles.sections}>
          <StatsSummary 
            user={user} 
            language={localizations.getLanguage()}
          />
        </div>

        <ProfileGroups viewer={viewer} user={user} circles={user.circles} />

       {/* <ClubsStats /> */}
        
        {user.publicAddress && 
          <div style={styles.map} >
            <Map
              position={user.publicAddress.position}
              isMarkerShown
              googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyAC6hY0V4cGyw2_-trCRU3VIPicoZenjjU&v=3.exp&libraries=geometry,drawing,places"
              loadingElement={<div style={{ height: `100%` }} />}
              containerElement={<div style={{ height: `250px` }} />}
              mapElement={<div style={{ height: `100%` }} />}
            />
          </div>
        }

        <Feedbacks user={user} {...this.props}/>
        {!isSelfProfile && me && me.id &&
        <div style={styles.blockRow}>
          <a style={styles.blockLink} onClick={this._handleReport}>{localizations.profileView_report} </a>
          -
          <a style={styles.blockLink} onClick={this._handleBlock}> {localizations.profileView_block}</a>
        </div>
        }
        <Modal
          isOpen={this.state.blockModalIsOpen}
          onRequestClose={this._closeBlockModal}
          style={modalStyles}
          contentLabel="Block User"
        >
          <div style={styles.modalContent}>
            {localizations.profileView_block_confirmation}
            <div style={styles.modalButtonRow}>
              <button style={styles.submitButton}
                      onClick={this._blockUser}>{localizations.profileView_report_confirmation_yes}</button>&nbsp;&nbsp;&nbsp;&nbsp;
              <button style={styles.cancelButton}
                      onClick={this._closeBlockModal}>{localizations.profileView_report_confirmation_cancel}</button>
            </div>
          </div>

        </Modal>
        <Modal
          isOpen={this.state.reportModalIsOpen}
          onRequestClose={this._closeReportModal}
          style={modalStyles}
          contentLabel="Report User"
        >
          <div style={styles.modalContent}>
            {localizations.profileView_report_reasons_prompt}
            <textarea 
              style={styles.reportInput}
              onChange={this._reportMessageChanged}
              value={this.state.reportMessage}
              >
            </textarea>
            <div style={styles.modalButtonRow}>
              <button
                style={styles.submitButton}
                onClick={this._reportUser}
              >
                {localizations.profileView_report_confirmation_yes}
              </button>&nbsp;&nbsp;&nbsp;&nbsp;
              <button 
                style={styles.cancelButton}
                onClick={this._closeReportModal}
              >
                {localizations.profileView_report_confirmation_cancel}
              </button>
            </div>
          </div>

        </Modal>
      </div>
    )
  }
}

const selectStyles = {
  container: (styles) => ({
    ...styles,
    minWidth: 150,
  }),
  control: (styles) => ({
    ...styles,
    borderWidth: 0,
    borderRadius: 0,
    borderBottomWidth: 2,
    borderColor: colors.blue,
  }),
  indicatorSeparator: (styles) => ({
    ...styles,
    width: 0,
  }),
}

styles = {

  blueButton: {
    backgroundColor: colors.blue,
    color: colors.white,
    padding: '7px',
    marginRight: 5,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    minWidth: 180,
    height: 40,
    fontFamily: 'Lato',
    cursor: 'pointer',
    border: 0,
    borderRadius: 5,
    transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
    ':hover': {
      filter: 'brightness(0.9)'
    },
    ':disabled': {
      backgroundColor: colors.lightGray,
      color: colors.darkGray
    },
    ':active': {
      outline: 'none'
    },
    '@media (max-width: 900px)': {
      width: '100%'
    },
    bottomBorder: 'black solid 5px'

  },
          sections: {
            borderBottom: '1px solid ' + colors.lightGray
          },
  modifyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  modifyProfileButton: {
    backgroundColor: colors.green,
    color: colors.white,
    width: 180,
    height: 57,
    borderRadius: 100,
    borderStyle: 'none',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    fontSize: 22,
    cursor: 'pointer',
    marginTop: 15
  },
  sport_no_data: {
    fontFamily: 'Lato',
    fontSize: 16,
  },
  reportInput: {
    minHeight: '100px',
    borderTop: '1px solid rgba(0,0,0,0.2)',
    borderRight: '1px solid rgba(0,0,0,0.2)',
    borderLeft: '1px solid rgba(0,0,0,0.2)',
    borderColor: 'transparent',
    background: 'rgba(255,255,255,.5)',
    borderBottom: '2px solid '+colors.blue,
    fontSize: fonts.size.medium,
    outline: 'none',
    resize: 'none',
    fontFamily: 'Lato',
    marginTop: 15,
    color: colors.black,
  },
  modalButtonRow: {
    display:'flex',
    alignSelf: 'center',
    marginTop: 30,
  },
  pencil: {
    fontSize: 20,
    color: colors.black,
    marginLeft: 10,
    cursor: 'pointer'
  },
  block: {
    backgroundColor: colors.error,
    color: colors.white,
    width: 220,
    height: 57,
    borderRadius: 100,
    borderStyle: 'none',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    fontSize: 22,
    cursor: 'pointer',
    ':disabled': {
      cursor: 'not-allowed',
    },
    margin: 'auto',
  },
  content: {
    flexGrow: '1',
    // padding: '40px',
    fontFamily: 'Lato',
    color: 'rgba(0,0,0,0.65)',
    '@media (max-width: 483px)': {
    //  padding: '40px 20px'
    }
  },

  title: {
    fontSize: 32,
    fontWeight: 500,
    paddingLeft: 40,
    paddingTop: 20,
    bottomBorder: 'black solid 5px',
    display: 'flex',
    alignItems: 'center'
  },


  description: {
    paddingLeft: 40,
    paddingTop: 20,
    fontSize: 18,
    lineHeight: 1.2,
    marginBottom: 'solid black 35px',
    wordBreak: 'break-word',
  },
  descriptionLine: {
    wordBreak: 'break-word',
    marginBottom: 15,
  },

  languages: {
    fontSize: 18,
    lineHeight: 1,
    marginLeft: 10,
  },
  blockRow: {
    width: '100%',
    textAlign: 'Right',
    fontSize: 16,
  },
  blockLink: {
    fontSize: 16,
    color: colors.black,
    textDecoration: 'none',
    cursor: 'pointer',
  },
  chatButtonContainer: {
    margin: '35px auto',
    textAlign: 'center'
  },
  chatButton: {
    textDecoration: 'none',
    backgroundColor: colors.green,
    color: colors.white,
    borderRadius: 100,
    borderStyle: 'none',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    fontSize: 22,
    cursor: 'pointer',
    padding: '10px 25px',
    maxWidth: 350,
    margin: 'auto'
  },
  chatBox: {
    marginBottom: 35
  },
  submitButton: {
    width: 80,
    backgroundColor: colors.blue,
    color: colors.white,
    fontSize: fonts.size.small,
    borderRadius: metrics.radius.tiny,
    outline: 'none',
    border: 'none',
    padding: '10px',
    cursor: 'pointer',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
  },
  cancelButton: {
    width: 80,
    backgroundColor: colors.gray,
    color: colors.white,
    fontSize: fonts.size.small,
    borderRadius: metrics.radius.tiny,
    outline: 'none',
    border: 'none',
    padding: '10px',
    cursor: 'pointer',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
  },
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    '@media (max-width: 480px)': {
      width: '300px',
    },
    fontFamily: 'Lato',
    fontSize: 16,
    color: colors.black,
    margin: 20,
  },
  modalHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-center',
    justifyContent: 'flex-center',
  },
  modalTitle: {
    fontFamily: 'Lato',
    fontSize:30,
    fontWeight: fonts.weight.medium,
    color: colors.blue,
    marginBottom: 20,
    flex: '2 0 0',
  },
  modalClose: {
    justifyContent: 'flex-center',
    paddingTop: 10,
    color: colors.gray,
    cursor: 'pointer',
  },
  errorFeedback: {
    fontFamily: 'Lato',
    color: colors.red,
    fontSize: 16,
  },
  map: {
    backgroundColor: colors.green,
    width: '100%',
    height: 250,
    '@media (max-width: 480px)': {
      width: '100%',
    },
    paddingBottom: 40,
  },
  padding: {
    paddingLeft: 40,
    paddingTop: 20,
    paddingBottom: 10,
  },
  languageInputContainer: {
    width: '80%',
    marginLeft: 10,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  }
}

modalStyles = {
  overlay : {
    position          : 'fixed',
    top               : 0,
    left              : 0,
    right             : 0,
    bottom            : 0,
    backgroundColor   : 'rgba(255, 255, 255, 0.75)',
  },
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    border                     : '1px solid #ccc',
    background                 : '#fff',
    overflow                   : 'auto',
    WebkitOverflowScrolling    : 'touch',
    borderRadius               : '4px',
    outline                    : 'none',
    padding                    : '20px',
  },
}

const _updateStepsCompleted = (steps) => ({
  type: types.UPDATE_STEPS_COMPLETED,
  tutorialSteps: steps,
});

const dispatchToProps = (dispatch) => ({
  _updateStepsCompleted: bindActionCreators(_updateStepsCompleted, dispatch),
});

const stateToProps = (state) => ({
  tutorialSteps: state.profileReducer.tutorialSteps,
});

const ReduxContainer = connect(
  stateToProps,
  dispatchToProps,
)(Content);

export default createFragmentContainer(Radium(withAlert(ReduxContainer)), {
//OK
//first: 2
  user: graphql`
    fragment Content_user on User {
      ...StatsSummary_user
      id
      profileType
      sex,
      birthday,
      hideMyAge
      avatar
      pseudo
      publicAddress {
        position {
          lat, 
          lng
        }
      }
      description
      languages {
        id
        code
        name
      }
      ...ProfileGroups_user
      sports{
        ...ProfileSports_sports,
        sport {
          id
          type
          logo
          name {
            EN
            DE
            FR
          }
        }
        levels {
          id
          EN {
            name
          }
          DE {
            name
          }
          FR {
            name
          }
        }
        positions {
          id
          EN
          DE
          FR
        }
        certificates {
          certificate {
            id
            name {
              EN,
              FR,
              DE
            }
          }
        }
        assistantType {
          id,
          name {
            EN,
            DE,
            FR
          }
        }
      }
      isPublicProfileComplete
      ...Feedbacks_user
    }
  `,
  me: graphql`
    fragment Content_me on User {
      id
      blackList {
        id
      }
    }
  `,
  viewer: graphql`
    fragment Content_viewer on Viewer {
      id
      ...ProfileSports_viewer
      languages {
        ...Languages_languages
      }
      me {
        id,
        avatar
        birthday
        hideMyAge
        languages {
          id
          code
          name
          ...Languages_languages
        }
      }
    }
  `,
});

