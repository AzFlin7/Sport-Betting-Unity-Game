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
const Geosuggest = Radium(_Geosuggest);

import styles from './Styles.js'
import { appStyles, colors } from '../../theme'
import UpdateNaturalBasicMutation from './UpdateNaturalBasicMutation'
import UpdateNaturalAdvancedMutation from './UpdateNaturalAdvancedMutation'
import { CountryDropdown } from 'react-country-region-selector';
import localizations from '../Localizations'
import LanguagesSelect from "./LanguagesSelect";
// import registerStyle from '../../theme/register.css'

var Style = Radium.Style;

var countries = require('i18n-iso-countries')

countries.registerLocale(require("i18n-iso-countries/langs/en.json"));
countries.registerLocale(require("i18n-iso-countries/langs/fr.json"));


// require('react-datepicker/dist/react-datepicker.css');

const incomeRanges = [
	{ value: 1, text: 'less than 18K €'},
	{ value: 2, text: 'between 18 and 30K€'},
	{ value: 3, text: 'between 30 and 50K€'},
	{ value: 4, text: 'between 50 and 80K€'},
	{ value: 5, text: 'between 80 and 120K€'},
	{ value: 6, text: 'more than 120K€'},
]

class InfoNatural extends React.Component {
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
			isAdvancedSaving: false,
			email: props.user.email || '',
			firstName: props.user.firstName || '',
			lastName: props.user.lastName || '',
			birthday: props.user.birthday || '',
			nationality: props.user.nationality || '',
			occupation: props.user.occupation || '',
			incomeRange: props.user.incomeRange || '',
			addressContent: '',
			address: props.user.address 
				?	{
						address: props.user.address.address,
						city: props.user.address.city,
						country: props.user.address.country,
					}
				: {}
		}
	}

	_incomeText = (value) => {
		const selected = incomeRanges.filter(income => income.value === value)
		if (selected.length > 0) {
			return selected[0].text
		} 
		else {
			return ''
		}
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
			email: props.user.email || '',
			firstName: props.user.firstName || '',
			lastName: props.user.lastName || '',
			birthday: props.user.birthday || '',
			nationality: props.user.nationality || '',
		})
	}

	_resetAdvancedState = () => {
		const { props } = this
		this.setState({
			isAdvancedSaving: false,
			occupation: props.user.occupation || '',
			incomeRange: props.user.incomeRange || '',
			address: props.user.address 
				? 
					{
						address: props.user.address.address,
						city: props.user.address.city,
						country: props.user.address.country,
					}
				: {}
		})
	}

	_setBasicEditMode = () => {
		this.setState({
			editBasic: true,
		})
		this._resetBasicState()
	}

	_setAdvancedEditMode = () => {
		this.setState({
			editAdvanced: true,
		})
		this._resetAdvancedState()
	}

	_handleSaveBasic = () => {
		this._updateBasic()
	}

	_handleCancelBasic = () => {
		this.setState({
			editBasic: false,
		})
		this._resetBasicState()
	}

	_isAdvancedValid = () => {
		return (this.state.address.address.length
				&& this.state.address.city.length
				&& this.state.address.country.length)
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

	_handleAddressChange = (value) => {
		if (value) {
			const {label} = value; 
			if (label) {
				const splitted = label.split(', ');
				if (splitted.length < 3) {
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

	_selectCountry = (val) => {
		this.setState({
		nationality: val
		})
	}

	_updateDateState = (name, e) => {
		this.setState({
			[name]: e.toDate(),
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
	
	isValidEmailAddress(address) {
		let re = /^[a-z0-9][a-z0-9-_\.]+@([a-z]|[a-z0-9]?[a-z0-9-]+[a-z0-9])\.[a-z0-9]{2,10}(?:\.[a-z]{2,10})?$/;
		return re.test(address)
  	}

	_updateBasic = () => {
    	this._changeBasicLoadingStatus(true);
		const user = this.props.user; 
    	const userIDVar = this.props.user.id;
		const emailVar = this.state.email;
    
    	const firstNameVar = this.state.firstName;
    	const lastNameVar = this.state.lastName;
		const birthdayVar = this.state.birthday;

		if ((user.email && !emailVar) || (!this.isValidEmailAddress(emailVar))
				|| (user.firstName && !firstNameVar)
		 		|| (user.lastName && !lastNameVar)
				|| (user.birthday && !birthdayVar)) {
			this.props.alert.show(localizations.popup_editMyInfo_required_fields, {
        		timeout: 3000,
        		type: 'error',
			});
			this._changeBasicLoadingStatus(false);
			return ;
		}


		if (this._getAge(birthdayVar) < 18) {
			this.props.alert.show(localizations.popup_editMyInfo_underaged, {
				timeout: 3000,
				type: 'error',
			});
			this._changeBasicLoadingStatus(false);
			return ;
		} 
		
		const nationalityVar = this.state.nationality.length >= 2 && this.state.nationality.length <= 3
		?	countries.getName(this.state.nationality, 'EN')
		:	this.state.nationality;

		const viewer = this.props.viewer;
    
		UpdateNaturalBasicMutation.commit({
			viewer,
			user: this.props.user,
			userIDVar,
			emailVar,
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
				console.log(errors);
				this._changeBasicLoadingStatus(false);
			},
        	onSuccess: (response) => {
				console.log(response);
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
		});
	}

	_updateAdvanced = () => {
    	this._changeAdvancedLoadingStatus(true);
    	const userIDVar = this.props.user.id;
		const occupationVar = this.state.occupation;
    	const incomeRangeVar = this.state.incomeRange;
		const addressVar = {
			address: this.state.address.address,
			city: this.state.address.city,
			country: this.state.address.country,
		}
		const viewer = this.props.viewer;
    
		UpdateNaturalAdvancedMutation.commit({
			viewer,
			userIDVar,
			user: this.props.user, 
			occupationVar,
			incomeRangeVar,
        	addressVar
      	},
		{
			onFailure: error => {
				this.props.alert.show(localizations.popup_editMyInfo_update_falied, {
					timeout: 2000,
					type: 'error',
				});
				let errors = JSON.parse(error.getError().source);
				console.log(errors);
				this._changeAdvancedLoadingStatus(false);
			},
			onSuccess: (response) => {
				console.log(response);
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
		});
	}

	render() {
		const { editBasic, editAdvanced } = this.state
		const { user } = this.props
		return(
			<section style={styles.container}>	
				<div style={styles.rowHeader}>
					<div style={styles.header}>
						{localizations.info_basicInfo}
					</div>
					{!editAdvanced && !editBasic && 
						<div 
							style={styles.editButton} 
							onClick={this._setBasicEditMode}
						>
							{localizations.info_edit}
						</div> 
					}
				</div>

				<div style={styles.row}>
					<label style={styles.label}>{localizations.info_email}</label>
					{editBasic 
					?	<input 
							type='email' 
							style={styles.input} 
							value={this.state.email} 
							placeholder='email' 
							onChange={this._updateState.bind(this, 'email')}
						/> 
					: 	<label style={styles.label}>{user.email}</label> 
					}
				</div>

				<div style={styles.row}>
					<label style={styles.label}>{localizations.info_firstName}</label>
					{editBasic 
					?	<input 
							type='text' 
							style={styles.input} 
							value={this.state.firstName} 
							placeholder={localizations.info_firstName}
							onChange={this._updateState.bind(this, 'firstName')} 
						/> 
					:	<label style={styles.label}>{user.firstName}</label> 
					}
				</div>

				<div style={styles.row}>
					<label style={styles.label}>{localizations.info_lastName}</label>
					{editBasic 
					?	<input 
							type='text' 
							style={styles.input} 
							value={this.state.lastName} 
							placeholder={localizations.info_lastName}
							onChange={this._updateState.bind(this, 'lastName')} 
						/> 
					:	<label style={styles.label}>{user.lastName}</label> 
					}
				</div>

				<div style={styles.row}>
					<label style={styles.label}>{localizations.info_birthday}</label>
					{editBasic 
					?	<DatePicker
							dateFormat='DD/MM/YYYY'
							selected={this.state.birthday && moment(this.state.birthday)}
							todayButton={localizations.profile_today}
							maxDate={moment()}
							showYearDropdown={true}
							showMonthDropdown={true}
							onChange={this._updateDateState.bind(this, 'birthday')}
							className='register-birthday'
							locale={localizations.getLanguage().toLowerCase()}
							nextMonthButtonLabel=""
							previousMonthButtonLabel=""
						/> 
					:	<label style={styles.label}>{user.birthday && moment(user.birthday).format('LL')}</label> 
					}
				</div>
				<div style={styles.row}>
					<label style={styles.label}>{localizations.info_nationality}</label>
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
					{editBasic 
					?	<LanguagesSelect
							list={this.props.viewer.languages}
							placeholder={localizations.info_select_nationality}
							selectedItem={this.state.nationality}
							onSelectItem={this._selectCountry}
						/> 
					:	<label style={styles.label}>{user.nationality}</label> 
					}
				</div>

				{editBasic && (
					<div style={styles.row}>
						<label style={styles.label}></label>
						{this.state.isBasicLoading 
						?	<ReactLoading type='cylon' color={colors.blue} /> 
						:	<section>
								<button style={appStyles.blueButton} onClick={this._handleSaveBasic}>{localizations.info_update}</button> 
								<button style={appStyles.grayButton} onClick={this._handleCancelBasic}>{localizations.info_cancel}</button>
							</section> 
						}
					</div> 
				)}

				<div style={styles.rowHeader}>
					<div style={styles.header}>{localizations.info_advancedInformation}</div>
					{(!editAdvanced && !editBasic) && 
						<div style={styles.editButton} onClick={this._setAdvancedEditMode}>{localizations.info_edit}</div> 
					}
				</div>

				<div style={styles.row}>
					<label style={styles.label}>{localizations.info_address}</label>
					{editAdvanced 
					? 	<Geosuggest
							style={styles.geosuggest}
							placeholder={localizations.newSportunity_profile_billing_address}
							initialValue={user.address ? user.address.address+', '+user.address.city + ', ' + user.address.country : ""}
							onSuggestSelect={this._handleAddressChange}
							onBlur={this._handleAddressChange}		
							onChange={this._handleAddressContentChange}
							location={this.props.userLocation}
							radius={50000}		
						/>
					:	<label style={styles.inputLabel}>
							{user.address && 
								user.address.address + ', ' + user.address.city + ', ' + user.address.country
							}
						</label> 
					}
				</div>
				<div style={styles.row}>
					<label style={styles.label}>{localizations.info_occupation}</label>
					{ editAdvanced 
					?	<input 
							type='text' 
							style={styles.input} 
							value={this.state.occupation} 
							placeholder='occupation' 
							onChange={this._updateState.bind(this, 'occupation')}
						/> 
					:	<label style={styles.label}>{user.occupation}</label> 
					}
				</div>

				<div style={styles.row}>
					<label style={styles.label}>{localizations.info_incomeRange}</label>
					{editAdvanced 
					?	<select 
							style={styles.input} 
							value={this.state.incomeRange}
							onChange={this._updateState.bind(this, 'incomeRange')}
						>
							<option value={null}></option>
							{incomeRanges.map(income => 
								<option key={income.value} value={income.value}>{income.text}</option> 
							)}
						</select> 
					: 	<label style={styles.label}>{this._incomeText(user.incomeRange)}</label> 
					}
				</div>

				{(this.state.isAdvancedSaving && !this._isAdvancedValid()) && 
					<div style={styles.row}>
						<label style={styles.label}></label>
						<label style={styles.error}>{localizations.info_fill_all}</label>
					</div>
				}
				{editAdvanced && 
					<div style={styles.row}>
						<label style={styles.label}></label>
						{this.state.isAdvancedLoading 
						?	<ReactLoading type='cylon' color={colors.blue} /> 
						:	<section>
								<button style={appStyles.blueButton} onClick={this._handleSaveAdvanced}>{localizations.info_update}</button> 
								<button style={appStyles.grayButton} onClick={this._handleCancelAdvanced}>{localizations.info_cancel}</button>	
							</section>
						}
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
)(Radium(InfoNatural));

export default createFragmentContainer(withAlert(ReduxContainer), {
	user: graphql`
		fragment InfoNatural_user on User {
			id
			profileType
			email
			firstName
			lastName
			birthday
			nationality
			occupation
			incomeRange
			address {
				address
				city
				country
				zip
			}
		}
	`,
	viewer: graphql`
		fragment InfoNatural_viewer on Viewer {
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