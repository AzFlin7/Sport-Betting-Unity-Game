import React from 'react';
import Radium from 'radium';
import moment from 'moment';
// import Card from 'react-credit-card';
import { withAlert } from 'react-alert'
import _Geosuggest from 'react-geosuggest';
import ReactLoading from 'react-loading'
import DatePicker from 'react-datepicker'
import ReactTooltip from 'react-tooltip'
import { connect } from 'react-redux';
import { CountryDropdown } from 'react-country-region-selector';
// require('react-datepicker/dist/react-datepicker.css');

import localizations from '../Localizations'

// import './cards.css'
// import '../NewSportunity/popup.css'
import { colors } from '../../theme';
import LanguagesSelect from "../MyInfo/LanguagesSelect";
let styles;

var countries = require('i18n-iso-countries')

countries.registerLocale(require("i18n-iso-countries/langs/en.json"));
countries.registerLocale(require("i18n-iso-countries/langs/fr.json"));

const Geosuggest = Radium(_Geosuggest);
var Style = Radium.Style;

class CompleteProfilePopup extends React.Component {
  constructor() {
    super(); 
    this.alertOptions = {
      offset: 60,
      position: 'top right',
      theme: 'light',
      transition: 'fade',
    };
    this.state = {
      firstName: '',
      lastName: '',
      address: '',
      nationality: '',
      birthday: '',
      processSaveProfile: false,
      addressSuggests: []
    }
  }

  componentDidMount() {
    this.setState({
      firstName: this.props.me.firstName ? this.props.me.firstName : '',
      lastName: this.props.me.lastName ? this.props.me.lastName : '',
      address: this.props.me.address ? this.props.me.address : '',
      nationality: this.props.me.nationality ? this.props.me.nationality : '',
      birthday: this.props.me.birthday ? moment(this.props.me.birthday) : ''
    })
  }

  _handleFirstNameChange = (e) => {
    this.setState({
      firstName: e.target.value
    })
  }

  _handleLastNameChange = (e) => {
    this.setState({
      lastName: e.target.value
    })
  }

  _handleNationalityChange = (e) => {
    this.setState({
      nationality: e.target.value
    })
  }
  
  _handleAddressChange = ({label}) => {
    const splitted = label.split(', ');
    if (splitted.length < 3) {
      this.props.alert.show(localizations.popup_completeProfile_billing_address_error, {
        timeout: 2000,
        type: 'error',
      });
      return ;
    }
    const address = splitted.slice(0, splitted.length-2).join(', ') || '';
    const country = splitted[splitted.length - 1] || '';
    const city = splitted[splitted.length - 2] || '';

    this.setState({
      address: {
        address,
        country,
        city,
      }
    });
  }

  _updateBirthday = (moment) => {
    this.setState({
      birthday: moment
    })
  }

  _updateRowBirthday = (e) => {
    this.setState({
      birthday: moment(e.target.value)
    })
  }

  _getAge = (date) => {
    var today = new Date();
    var birthDate = new Date(date);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
  }

  _selectCountry = (val) => {
    this.setState({
      nationality: val
    })
  }  

  _handleSaveProfile = (user) => {
    this.setState({
      processSaveProfile: true
    }); 
    if (this.state.firstName 
        && this.state.lastName 
        && this.state.address 
        && this.state.nationality 
        && this.state.birthday 
        && this._getAge(this.state.birthday) >= 18) {
      this.props.onConfirm({
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        address: this.state.address,
        nationality: this.state.nationality.length >= 2 && this.state.nationality.length <= 3
          ? countries.getName(this.state.nationality, 'EN')
          : this.state.nationality,
        birthday: this.state.birthday.format()
      });
    }
    else if (this._getAge(this.state.birthday) < 18) {
      this.props.alert.show(localizations.popup_completeProfile_underaged, {
        timeout: 3000,
        type: 'error',
      });
      this.setState({
        processSaveProfile: false
      }); 
    }
    else if (!this.state.address) {
      this._geoSuggest.focus()
      this.props.alert.show(localizations.popup_completeProfile_billing_address_error, {
        timeout: 2000,
        type: 'error',
      });
      this.setState({
        processSaveProfile: false
      }); 
    }    
    else {
      this.props.alert.show(localizations.popup_completeProfile_please_fill_all, {
        timeout: 2000,
        type: 'error',
      });
      this.setState({
        processSaveProfile: false
      }); 
    }
  }

  render() {
   const { sportunity, onClose, me, viewer, processing } = this.props ;
    return (
      <div style={styles.pageContainer}>
        <ReactTooltip effect="solid" multiline={true}/>
        <div style={styles.container} id="popupContainer">
          <span onClick={onClose} style={styles.closeCross}>
            <i className="fa fa-times" style={styles.cancelIcon} aria-hidden="true"></i>
          </span> 
          <div style={styles.title}>
            {localizations.event_personnal_information}
          </div>
          <div style={styles.subtitle}>
            {localizations.event_book_profile_mandatory_information}
          </div>
          <div style={styles.blocInfo}>
            <div style={styles.blocLabel}>
              {localizations.info_firstName}
            </div>
            <div style={styles.infos}>
              <div style={styles.infoLine}>
                {
                  this.props.me.firstName 
                  ? this.state.firstName 
                  : <input 
                      type="text" 
                      style={styles.nameInput}
                      placeholder={localizations.info_firstName}
                      value={this.state.firstName}
                      onChange={this._handleFirstNameChange}
                    />
                }
              </div>
            </div>
          </div>
          <div style={styles.blocInfo}>
            <div style={styles.blocLabel}>
              {localizations.info_lastName}
            </div>
            <div style={styles.infos}>
              <div style={styles.infoLine}>
                 {
                  this.props.me.lastName 
                  ? this.state.lastName 
                  : <input 
                    type="text" 
                    style={styles.nameInput}
                    placeholder={localizations.info_lastName}
                    value={this.state.lastName}
                    onChange={this._handleLastNameChange}
                  />
                }
              </div>
            </div>
          </div>
          <div style={styles.blocInfo}>
            <div style={styles.blocLabel}>
              {localizations.info_birthday}
            </div>
            <div style={styles.infos}>
              <div style={styles.infoLine}>
                <Style scopeSelector=".react-datepicker__input-container" rules={{
                    "input": {background:colors.white, fontSize: 16, width: 300,},
                  }}
                />
                <Style scopeSelector=".datetime-hours" rules={{
                  ".rdtPicker": {borderRadius: '3px', width: '100px', border: '2px solid #5E9FDF'},
                  ".form-control": styles.time,
                  }}
                />
                <Style scopeSelector=".datetime-day" rules={{
                  "input": styles.date,         
                  }}
                />
                <Style scopeSelector=".react-datepicker" rules={{
                  "div": {fontSize: '1rem'},
                  ".react-datepicker__current-month": {fontSize: '1.1rem', marginBottom: 5},
                  ".react-datepicker__month": {margin: 10},
                  ".react-datepicker__day": {lineHeight: '1rem', fontSize: '1rem', margin: '0.2rem'},
                  ".react-datepicker__day-names": {width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: 5},
                  ".react-datepicker__header": {padding: '1rem', display: 'flex', flexDirection: 'column',alignItems: 'center'}
                  }}
                />
                <Style scopeSelector=".react-datepicker-popper" rules={{
                    zIndex: 2
                }}/>
                <Style scopeSelector=".react-datepicker__month-read-view--down-arrow" rules={{
                  top: 5
                }}/>
                 {
                  this.props.me.birthday 
                  ? moment(this.props.me.birthday).format('LL')
                  : <DatePicker 
                      dateFormat='DD/MM/YYYY'
                      selected={this.props.me.birthday ? this.props.me.birthday : this.state.birthday}
                      onChange={this._updateBirthday}
                      onChangeRaw={this._updateRowBirthday}
                      maxDate={moment()}
                      showYearDropdown={true}
                      showMonthDropdown={true}
                      className='register-birthday'
                      placeholderText='24/04/1990'
                      locale={localizations.getLanguage().toLowerCase()}
                      todayButton={localizations.profile_today}
                      nextMonthButtonLabel=""
                      previousMonthButtonLabel=""
                    />
                }
              </div>
            </div>
          </div>
          
          <div style={styles.blocInfo}>
            <div style={styles.blocLabel}>
              {localizations.newSportunity_profile_billing_address}
            </div>
            <div style={styles.infos}>
              <div style={styles.infoLine}>
                 {
                  (this.props.me.address && this.props.me.address.country) 
                  ? this.state.address.address+'\n'+this.state.address.city + ', '+this.state.address.country 
                  : 
                  <Geosuggest
                    ref={el=>this._geoSuggest=el}
                    style={styles.geosuggest}
                    placeholder={localizations.newSportunity_profile_billing_address}
                    location={this.props.userLocation}
                    radius={50000}
                    initialValue={this.state.address && this.state.address.address ? this.state.address.address + ', ' + this.state.address.city : this.state.address ? this.state.address : ""}
                    onSuggestSelect={suggest => !!suggest && this._handleAddressChange(suggest)}
                    onChange={value => this.setState({address: value})}
                    types={["geocode"]}
                    ignoreTab={true}
                    ignoreEnter={true}
                    onUpdateSuggests={(suggests, active) => this.setState({addressSuggests: suggests})}
                    onBlur={() => !this.state.address.address && this.state.addressSuggests.length > 0 && this._handleAddressChange(this.state.addressSuggests[0])}
                    onKeyDown={e => e.key === "tab" && !this.state.address.address && this.state.addressSuggests.length > 0 && this._handleAddressChange(this.state.addressSuggests[0])}

                  />
                }
              </div>
            </div>
          </div>
          <div style={styles.blocInfo}>
            <div style={styles.blocLabel}>
              {localizations.info_nationality}
            </div>
            <div style={styles.infos}>
              <div style={styles.infoLine}>
                <Style scopeSelector="#country-dropdown" rules={{
                    width: 300,
                    backgroundColor: colors.white,
                    fontSize: 16,
                    paddingLeft: 3,
                    fontFamily: 'Lato',
                    lineHeight: 1,
                    borderTop: 'none',
                    borderLeft: 'none',
                    borderRight: 'none',
                    borderBottomWidth: 2,
                    borderBottomColor: colors.blue,
                    paddingBottom: 3,
                  }}
                />
                <Style scopeSelector="#country-dropdown option" rules={{
                    width: 300,
                    backgroundColor: colors.white,
                    fontSize: 16,
                    paddingLeft: 3,
                    fontFamily: 'Lato',
                    lineHeight: 1,
                  }}
                />
                 {
                  (this.props.me.nationality) 
                  ? this.state.nationality
                  : <LanguagesSelect
		                  list={this.props.viewer.languages}
		                  placeholder={localizations.info_select_nationality}
		                  selectedItem={this.state.nationality}
		                  onSelectItem={this._selectCountry}
	                  />
                 }
              </div>
            </div>
          </div>
          {
            this.state.processSaveProfile ?
              <div style={styles.updateProfileProcessing}><ReactLoading type='cylon' color={colors.white}/></div>
            :
              <button
                style={styles.saveProfile}
                title={localizations.event_save_profile}
                onClick={this._handleSaveProfile}>
                {localizations.event_save_profile}
            </button>
          }
          <div style={styles.policy} data-tip={localizations.newSportunity_profile_policy_details}>
            {localizations.newSportunity_profile_policy}
            <i
              style={styles.policyIcon}
              className="fa fa-question-circle"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    )
  }
}


styles = {
  pageContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 2,

    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    width: '100vw',
    minHeight: '100vh',

    backgroundColor: colors.black,
    fontFamily: 'Lato',
    color: colors.white,
    fontSize: 16,    
  },
  container: {
    width: 524,
    maxHeight: '90vh',
    backgroundColor: colors.blue,
    borderRadius: 25,
    paddingTop: 15,
    paddingBottom: 25,
    paddingLeft: 25,
    paddingRight: 25,
    position: 'relative',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 35
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25
  },
  secondSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
    marginTop: 25
  },
  blocInfo: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 10
  },
  blocLabel: {
    width: 120,
    flexShrink: 0
  },
  infos: {
    display: 'flex',
    flexDirection: 'column'
  },
  infoLine: {
    marginBottom: 13
  },

  saveProfile: {
    backgroundColor: colors.green,
    color: colors.white,
    width: 230,
    height: 50,
    borderRadius: 100,
    borderStyle: 'none',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    fontSize: 22,
    cursor: 'pointer',
    position: 'relative',
    left: 'calc(50% - 115px)',
    ':disabled': {
      cursor: 'not-allowed',
      backgroundColor: colors.gray,
    },

  },

  buttonContainer: {
    margin: 'auto',
    display: 'flex',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10
  },
  policy: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
    fontSize: 14,
    cursor: 'pointer'
  },
  policyIcon: {
    marginLeft: 5
  },

  confirm: {
    backgroundColor: colors.green,
    color: colors.white,
    width: 230,
    height: 70,
    borderRadius: 100,
    borderStyle: 'none',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    fontSize: 22,
    cursor: 'pointer',

    ':disabled': {
      cursor: 'not-allowed',
      backgroundColor: colors.gray,
    },
  },

  closeCross: {
    cursor: 'pointer',
    width: 30,
    height: 30,
    textAlign: 'center',
    position: 'absolute',
    right: 20
  },
  cancelIcon: {
    fontSize: 25,
    lineHeight: '29px'
  },
  nameInput: {
    width: 300,
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottomWidth: 2,
    borderBottomColor: colors.blue,
    fontFamily: 'Lato',
    paddingBottom: 5,
    fontSize: 16,
    lineHeight: 1,
    paddingLeft: 3
  },

  geosuggest: {
    input: {
      width: 300,
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      borderBottomWidth: 2,
      borderBottomColor: colors.blue,
      paddingRight: 20,

      fontSize: 16,
      fontFamily: 'Lato',
      lineHeight: 1,
      paddingLeft: 3,
      paddingBottom: 5,

      outline: 'none',
      ':focus': {
        borderBottomColor: colors.green,
      },
    },

    suggests: {
      width: 300,
      position: 'fixed',
      backgroundColor: colors.white,

      boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
      border: '2px solid rgba(94,159,223,0.83)',
      padding: 20,
      zIndex: 100,
    },

    suggestItem: {
      paddingTop: 10,
      paddingBottom: 10,
      color: '#515151',
      fontSize: 18,
      fontWeight: 500,
      fontFamily: 'Helvetica Neue',
    },
    
  },

  updateProfileProcessing: {
    position: 'relative',
    left: 'calc(50% - 32px)'
  },
  
};

const dispatchToProps = (dispatch) => ({
})

const stateToProps = (state) => ({
  userCountry: state.globalReducer.userCountry,
  userLocation: state.globalReducer.userLocation
})

let ReduxContainer = connect(
  stateToProps,
  dispatchToProps
)(Radium(CompleteProfilePopup));

export default Radium(withAlert(ReduxContainer))