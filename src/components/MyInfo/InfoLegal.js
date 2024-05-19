import React from 'react'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium'
import moment from 'moment'
import { connect } from 'react-redux';
import { withAlert } from 'react-alert'
import ReactLoading from 'react-loading'
import DatePicker from 'react-datepicker'
import _Geosuggest from 'react-geosuggest';
import { CountryDropdown } from 'react-country-region-selector';
const Geosuggest = Radium(_Geosuggest);

var Style = Radium.Style;

var countries = require('i18n-iso-countries')

countries.registerLocale(require("i18n-iso-countries/langs/en.json"));
countries.registerLocale(require("i18n-iso-countries/langs/fr.json"));


import UpdateLegalBasicMutation from './UpdateLegalBasicMutation'
import UpdateLegalAdvancedMutation from './UpdateLegalAdvancedMutation'
import styles from './Styles.js'
import localizations from '../Localizations'
import { appStyles, colors } from '../../theme'
import LanguagesSelect from "./LanguagesSelect";

class InfoLegal extends React.Component {
	constructor(props) {
		super(props)
		this.alertOptions = {
      offset: 60,
      position: 'top right',
      theme: 'light',
      transition: 'fade',
    };
	this.state = {
		editBasic: false,
		editAdvanced: false,
		isBasicLoading: false,
		isAdvancedLoading: false,
		isBasicSaving: false,
		isAdvancedSaving: false,
		business_name: props.user.business ? props.user.business.businessName || '' : '',
		business_email: props.user.business ? props.user.business.businessEmail || '' : '',
		firstName: props.user.firstName || '',
		lastName: props.user.lastName || '',
		birthday: props.user.birthday || '',
		nationality: props.user.nationality || '',
		shouldDeclareVAT: props.user.shouldDeclareVAT,
		business_hq_addressContent: '',
		business_hq_address: props.user.business && props.user.business.headquarterAddress 
			? 
				{
					address: props.user.business.headquarterAddress.address,
					city: props.user.business.headquarterAddress.city,
					country: props.user.business.headquarterAddress.country,
				}
			: {},
		email: props.user.email || '',
		addressContent: '',
		address: props.user.address 
			?
				{
					address:  props.user.address.address,
					city: props.user.address.city,
					country:  props.user.address.country,
				}
			: {}
		}
	}

	_isBasicInvalid = (fieldName) => {
		return this.state.isBasicSaving && this.state[fieldName].length === 0
	}

	_isAdvancedInvalid = (fieldName) => {
		return this.state.isAdvancedSaving && this.state[fieldName].length === 0
	}

	_changeBasicLoadingStatus = (bool) => {
    this.setState({
      isBasicLoading: bool,
    });
  }

	_changeAdvancedLoadingStatus = (bool) => {
		this.setState({
      isAdvancedLoading: bool,
    });
	}

	_resetBasicState = () => {
		const { props } = this
		this.setState({
			isBasicSaving: false,
			business_name: props.user.business ? props.user.business.businessName || '' : '',
			business_email: props.user.business ? props.user.business.businessEmail || '' : '',
			firstName: props.user.firstName || '',
			lastName: props.user.lastName || '',
			birthday: props.user.birthday,
			nationality: props.user.nationality || '',
		})
	}

	_resetAdvancedState = () => {
		const { props } = this
		this.setState({
			isAdvancedSaving: false,
			business_hq_address: props.user.business && props.user.business.headquarterAddress 
				? 
					{
						address: props.user.business.headquarterAddress.address,
						city: props.user.business.headquarterAddress.city,
						country: props.user.business.headquarterAddress.country,
					}
					: {},
			email: props.user.email || '',
			address: props.user.address 
				?
					{
						address:  props.user.address.address,
						city: props.user.address.city,
						country:  props.user.address.country,
					}
				: {}
		})
	}

	_setBasicEditMode = () => {
		this._resetBasicState()
		this.setState({
			editBasic: true,
		})
	}

	_setAdvancedEditMode = () => {
		this._resetAdvancedState()
		this.setState({
			editAdvanced: true,
		})
	}

	_isBasicValid = () => {
		return (this.state.business_name.length 
				&& this.state.business_email.length
				&& this.state.firstName.length
				&& this.state.lastName.length
				&& this.state.birthday 
				&& this.state.nationality.length
				&& this.isValidEmailAddress(this.state.business_email))
	}

	_isAdvancedValid = () => {
		return (this.state.business_hq_address
				&& this.state.business_hq_address.address
				&& this.state.business_hq_address.address.length
				&& this.state.business_hq_address.city.length
				&& this.state.business_hq_address.country.length
				&& this.state.email.length
				&& this.state.address.address.length
				&& this.state.address.city.length
				&& this.state.address.country.length
			  && this.isValidEmailAddress(this.state.email))
	}

	isValidEmailAddress(address) {
    let re = /^[a-z0-9][a-z0-9-_\.]+@([a-z]|[a-z0-9]?[a-z0-9-]+[a-z0-9])\.[a-z0-9]{2,10}(?:\.[a-z]{2,10})?$/;
    return re.test(address)
  }

	_handleSaveBasic = () => {
		this.setState({
			isBasicSaving: true,
		})
		if (this._isBasicValid()) {
			this._updateBasic()
		} 
	}

	_handleCancelBasic = () => {
		this.setState({
			editBasic: false,
		})
		this._resetBasicState()
	}

	_handleSaveAdvanced = () => {
		this.setState({
			isAdvancedSaving: true,
		})
		if (this._isAdvancedValid()) {
			this._updateAdvanced()
		} 
	}

	_handleCancelAdvanced = () => {
		this.setState({
			editAdvanced: false,
		})
		this._resetAdvancedState()
	}

	_updateState = (name, e) => {
		this.setState({
			[name]: e.target.value,
		})
	}

	_updateShouldDeclareVAT = (e) => {
		this.setState({
			shouldDeclareVAT: e.target.checked,
		})
	}

	_updateDateState = (e) => {
		this.setState({
			birthday: e.toDate(),
		})
	}

	_selectCountry = (val) => {
		this.setState({
		  nationality: val
		})
	}

	_handleHQAddressChange = (value) => {
		if (value) {
			const {label} = value; 
			if (label) {
				const splitted = label.split(', ');
				if (splitted.length < 3) {
					this.props.alert.show(localizations.popup_editMyInfo_headquarter_address_error, {
						timeout: 2000,
						type: 'error',
					});
					this.setState({
						business_hq_address: {
							address: '',
							country: '',
							city: '',
						}
					});
					return ;
				}
				const address = splitted.slice(0, splitted.length-2).join(', ') || '';
				const country = splitted[splitted.length - 1] || '';
				const city = splitted[splitted.length - 2] || '';

				this.setState({
					business_hq_address: {
						address,
						country,
						city,
					}
				});
			}
			else if (this.state.business_hq_addressContent !== '') {
				const splitted = this.state.business_hq_addressContent.split(', ');
				if (splitted.length < 3) {
					this.props.alert.show(localizations.popup_editMyInfo_headquarter_address_error, {
						timeout: 2000,
						type: 'error',
					});
					this.setState({
						business_hq_address: {
							address: '',
							country: '',
							city: '',
						}
					});
					return ;
				}
				const address = splitted.slice(0, splitted.length-2).join(', ') || '';
				const country = splitted[splitted.length - 1] || '';
				const city = splitted[splitted.length - 2] || '';

				this.setState({
					business_hq_address: {
						address,
						country,
						city,
					}
				});
			}
		}
		else {
			this.setState({
				business_hq_address: {
					address: '',
					country: '',
					city: '',
				}
			});
		}
	}
	
	_handleHQAddressContentChange = (label) => {
		this.setState({business_hq_addressContent: label})
	}

	_handleAddressChange = (value) => {
		if (value) {
			const {label} = value;
			let splitted
			if (label) {
					splitted = label.split(', ');
				
				if (!label || splitted.length < 3) {
					this.props.alert.show(localizations.popup_editMyInfo_billing_address_error, {
						timeout: 2000,
						type: 'error',
					});
					this.setState({
						address: {
							address: '',
							country: '',
							city: '',
						}
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
			else if (this.state.addressContent !== '') {
				const splitted = this.state.addressContent.split(', ');
				if (splitted.length < 3) {
					this.props.alert.show(localizations.popup_editMyInfo_headquarter_address_error, {
						timeout: 2000,
						type: 'error',
					});
					this.setState({
						address: {
							address: '',
							country: '',
							city: '',
						}
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
		}
		else {
			this.setState({
				address: {
					address: '',
					country: '',
					city: '',
				}
			});
		}
	}
	
	_handleAddressContentChange = (label) => {
		this.setState({addressContent: label})
	}

	_updateBasic = () => {
    this._changeBasicLoadingStatus(true);
    const userIDVar = this.props.user.id;
		const viewer = this.props.viewer;
		const businessVar = {
			businessName: this.state.business_name,
			businessEmail: this.state.business_email,
		}
		const firstNameVar = this.state.firstName;
    const lastNameVar = this.state.lastName;
		const birthdayVar = this.state.birthday;
		const nationalityVar = this.state.nationality.length >= 2 && this.state.nationality.length <= 3
			? countries.getName(this.state.nationality, 'EN')
			: this.state.nationality;
		
	UpdateLegalBasicMutation.commit({
				viewer,
				user: this.props.user, 
        userIDVar,
				businessVar,
				firstNameVar,
        lastNameVar,
				birthdayVar,
				nationalityVar,
      },
      {
        onFailure: error => {
			this.props.alert.show(localizations.popup_editMyInfo_update_falied, {
				timeout: 2000,
				type: 'error',
			});
			let errors = JSON.parse(error.getError().source);
			this._changeBasicLoadingStatus(false);
        },
        onSuccess: (response) => {
          	this._changeBasicLoadingStatus(false);
          	this.props.alert.show(localizations.popup_editMyInfo_update_sucess, {
            	timeout: 2000,
            	type: 'success',
			});
			this.setState({
				editBasic: false,
			})
			this._resetBasicState()
        },
      }
    );
  }

	_updateAdvanced = () => {
    this._changeAdvancedLoadingStatus(true);
    const userIDVar = this.props.user.id;
		const viewer = this.props.viewer;
		const emailVar = this.state.email;
		const addressVar = {
			address: this.state.address.address,
			city: this.state.address.city,
			country: this.state.address.country,
		}
		const businessVar = {
			businessName: this.props.user.business.businessName,
			businessEmail: this.props.user.business.businessEmail,
			headquarterAddress: {
				address: this.state.business_hq_address.address,
				city: this.state.business_hq_address.city,
				country: this.state.business_hq_address.country,
			},
		}
		const shouldDeclareVATVar = this.state.shouldDeclareVAT;

	UpdateLegalAdvancedMutation.commit({
				viewer,
				user: this.props.user, 
        userIDVar,
				emailVar,
				addressVar,
        businessVar,
				shouldDeclareVATVar
      },
      {
        onFailure: error => {
          this.props.alert.show(localizations.popup_editMyInfo_update_falied, {
            timeout: 2000,
            type: 'error',
		  });
          let errors = JSON.parse(error.getError().source);
          this._changeAdvancedLoadingStatus(false);
        },
        onSuccess: (response) => {
			this._changeAdvancedLoadingStatus(false);
			this.props.alert.show(localizations.popup_editMyInfo_update_sucess, {
				timeout: 2000,
				type: 'success',
			});
			this.setState({
				editAdvanced: false,
			})
			this._resetAdvancedState()
        },
      }
    );
  }

	render() {
		const { editBasic, editAdvanced } = this.state
		const user = this.props.user
		return(
			<section style={styles.container}>	
				<div style={styles.rowHeader}>
					<div style={styles.header}>{localizations.info_basicInfo}</div>
					{ (!editAdvanced && !editBasic) && <div style={styles.editButton} onClick={this._setBasicEditMode}>{localizations.info_edit}</div> }
				</div>
				
				<div style={styles.row}>
					<label style={styles.label}>{localizations.info_firstName}</label>
					{ editBasic 
								? <input type='text' 
											style={this._isBasicInvalid('firstName') ? styles.inputError : styles.input} 
											value={this.state.firstName} 
											onChange={this._updateState.bind(this, 'firstName')}/> 
								: <label style={styles.label}>{user.firstName}</label> }
				</div>
				<div style={styles.row}>
					<label style={styles.label}>{localizations.info_lastName}</label>
					{ editBasic 
								? <input type='text' 
											style={this._isBasicInvalid('lastName') ? styles.inputError : styles.input} 
											value={this.state.lastName} 
											onChange={this._updateState.bind(this, 'lastName')}/> 
								: <label style={styles.label}>{user.lastName}</label> }
				</div>
				<div style={styles.row}>
					<label style={styles.subHeader}>{localizations.info_representativeInfo}</label>
				</div>
				<div style={styles.row}>
					<label style={styles.label}>{localizations.info_businessName}</label>
					{ editBasic 
								? <input type='text' 
											style={this._isBasicInvalid('business_name') ? styles.inputError : styles.input} 
											value={this.state.business_name} 
											onChange={this._updateState.bind(this, 'business_name')}/> 
								: <label style={styles.label}>{user.business && user.business.businessName}</label> }
				</div>
				<div style={styles.row}>
					<label style={styles.label}>{localizations.info_genericBusinessEmail}</label>
					{ editBasic 
								? <input type='email' 
											style={this._isBasicInvalid('business_email') ? styles.inputError : styles.input} 
											value={this.state.business_email} 
											onChange={this._updateState.bind(this, 'business_email')}/>
								: <label style={styles.label}>{user.business && user.business.businessEmail}</label> }
				</div>
				<div style={styles.row}>
					<label style={styles.label}>{localizations.info_business_birthday}</label>
					{ editBasic 
								?	<DatePicker
										selected={this.state.birthday && moment(this.state.birthday)}
										todayButton={'Today'}
										maxDate={moment()}
										showYearDropdown={true}
										showMonthDropdown={true}
										onChange={this._updateDateState}
										className='register-birthday'
										todayButton={localizations.profile_today}
										locale={localizations.getLanguage().toLowerCase()}
										nextMonthButtonLabel=""
										previousMonthButtonLabel=""
                  					/> 
								: <label style={styles.label}>{user.birthday && moment(user.birthday).format('LL')}</label> }
				</div>
				<Style scopeSelector=".datetime-hours" rules={{
					".rdtPicker": {borderRadius: '3px', width: '100px', border: '2px solid #5E9FDF'},
					".form-control": styles.time,
					}}
				/>
				<Style scopeSelector=".datetime-day" rules={{
					"input": styles.date,         
					}}
				/>
				<Style scopeSelector=".react-datepicker__input-container" rules={{
					"input": {fontSize: 16}
				}}
				/>
				<Style scopeSelector=".react-datepicker" rules={{
					"div": {fontSize: '1.4rem'},
					".react-datepicker__current-month": {fontSize: '1.5rem', marginBottom: 5},
					".react-datepicker__month": {margin: '1rem'},
					".react-datepicker__day": {width: '2rem', lineHeight: '2rem', fontSize: '1.4rem', margin: '0.2rem'},
					".react-datepicker__day-names": {width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: 5},
					".react-datepicker__header": {padding: '1rem', display: 'flex', flexDirection: 'column',alignItems: 'center'}
					}}
				/>
				<Style scopeSelector="#country-dropdown" rules={{
						width: 300,
						backgroundColor: colors.white,
						fontSize: 16,
						fontFamily: 'Lato',
						lineHeight: 1,
						borderTop: 'none',
						borderLeft: 'none',
						borderRight: 'none',
						borderBottomWidth: 2,
						borderBottomColor: colors.blue,
						paddingBottom: 3,
						color: 'rgba(0,0,0,0.65)',
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
				<div style={styles.row}>
					<label style={styles.label}>{localizations.info_nationality}</label>
					{ editBasic 
					?	<LanguagesSelect
							list={this.props.viewer.languages}
							placeholder={localizations.info_select_nationality}
							selectedItem={this.state.nationality}
							onSelectItem={this._selectCountry}
						/>
						: 	<label style={styles.label}>{user.nationality}</label>
					}
				</div>
				{/*<div style={styles.row}>
					<label style={styles.label}>{localizations.info_residence}</label>
					<label style={styles.label}>{user.address && user.address.country}</label>
				</div>*/}
				{ (this.state.isBasicSaving && !this._isBasicValid())
						&& 
						<div style={styles.row}>
							<label style={styles.label}></label>
							<label style={styles.error}>{localizations.info_fill_all}</label>
						</div>
					}
				{ editBasic &&
					<div style={styles.row}>
						<label style={styles.label}></label>
						{	this.state.isBasicLoading ?
							<ReactLoading type='cylon' color={colors.blue} /> : 
							<section>
								<button style={appStyles.blueButton} onClick={this._handleSaveBasic}>{localizations.info_update}</button> 
								<button style={appStyles.grayButton} onClick={this._handleCancelBasic}>{localizations.info_cancel}</button>
							</section> }
					</div>
				}

				<div style={styles.rowHeader}>
					<div style={styles.header}>{localizations.info_advancedInformation}</div>
					{ (!editAdvanced && !editBasic) && <div style={styles.editButton} onClick={this._setAdvancedEditMode}>{localizations.info_edit}</div> }
				</div>

				<div style={styles.row}>
					<label style={styles.label}>{localizations.info_shouldDeclareVAT}</label>
					{ editAdvanced 
						? <input 
								type="checkbox" 
								checked={this.state.shouldDeclareVAT}
								onChange={this._updateShouldDeclareVAT}
								/>
						: <label style={styles.label}>{user.shouldDeclareVAT ? localizations.info_shouldDeclareVAT_yes : localizations.info_shouldDeclareVAT_no}</label>						
					}
				</div>

				<div style={styles.row}>
					<label style={styles.label}>{localizations.info_hqAddress}</label>
					{ editAdvanced 
							? <Geosuggest
									style={styles.geosuggest}
									initialValue={user.business.headquarterAddress ? user.business.headquarterAddress.address+', '+user.business.headquarterAddress.city+', '+user.business.headquarterAddress.country : ""}
									onSuggestSelect={this._handleHQAddressChange}
									onBlur={this._handleHQAddressChange}
									location={this.props.userLocation}
                  radius={50000}
								/>
							: <label style={styles.inputLabel}>
									{
										user.business && user.business.headquarterAddress && 
											user.business.headquarterAddress.address + ', ' + user.business.headquarterAddress.city + ', ' + user.business.headquarterAddress.country
									}
								</label> 
				}
				</div>
				<div style={styles.row}>
					<label style={styles.subHeader}>{localizations.info_representativeInfo}</label>
				</div>
				<div style={styles.row}>
					<label style={styles.label}>{localizations.info_email}</label>
					{ editAdvanced 
								? <input type='text' 
											style={this._isAdvancedInvalid('email') ? styles.inputError : styles.input} 
											value={this.state.email} 
											onChange={this._updateState.bind(this, 'email')}/> 
								: <label style={styles.inputLabel}>{user.email}</label> }
				</div>
				<div style={styles.row}>
					<label style={styles.label}>{localizations.info_address}</label>
						{ editAdvanced 
							? <Geosuggest
									style={styles.geosuggest}
									placeholder={localizations.newSportunity_profile_billing_address}
									initialValue={user.address ? user.address.address+', '+user.address.city + ', ' + user.address.country : ""}
									onSuggestSelect={this._handleAddressChange}
									onBlur={this._handleAddressChange}		
									location={this.props.userLocation}
                  radius={50000}		
								/>
							: <label style={styles.inputLabel}>
									{
										user.address && 
											user.address.address + ', ' + user.address.city + ', ' + user.address.country
									}
								</label> 
						}
				</div>
				{ (this.state.isAdvancedSaving && !this._isAdvancedValid())
						&& 
						<div style={styles.row}>
							<label style={styles.label}></label>
							<label style={styles.error}>{localizations.info_fill_all}</label>
						</div>
					}
				
				{ editAdvanced && 
					<div style={styles.row}>
						<label style={styles.label}></label>
						{	this.state.isBasicLoading ?
							<ReactLoading type='cylon' color={colors.blue} /> : 
							<section>
								<button style={appStyles.blueButton} onClick={this._handleSaveAdvanced}>{localizations.info_update}</button>
								<button style={appStyles.grayButton} onClick={this._handleCancelAdvanced}>{localizations.info_cancel}</button>
							</section> }
					</div>
				}
			</section>
		)
	}
}

const dispatchToProps = (dispatch) => ({
})

const stateToProps = (state) => ({
	userCountry: state.globalReducer.userCountry,
	userLocation: state.globalReducer.userLocation,
	language: state.globalReducer.language,
})

let ReduxContainer = connect(
  stateToProps,
  dispatchToProps
)(Radium(InfoLegal));

export default createFragmentContainer(withAlert(ReduxContainer), {
  user: graphql`
    fragment InfoLegal_user on User {
              id
              appCountry
              profileType
              email
              firstName
              lastName
              birthday
              nationality
              occupation
              incomeRange
              shouldDeclareVAT
              address {
                  address
                  city
                  country
                  zip
              }
              business {
                  businessName
                  businessEmail
                  VATNumber
                  headquarterAddress {
                      address
                      city
                      country
                      zip
                  }
              }
          }
  `,
	viewer: graphql`
    	fragment InfoLegal_viewer on Viewer {
      		languages {
        		id
        		name
        		code
      		}
			me {
				id
			}	
		}
  	`,
})