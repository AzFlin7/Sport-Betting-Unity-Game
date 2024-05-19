import React from 'react'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import { withAlert } from 'react-alert'
import styles from './Styles.js'
import localizations from '../Localizations'
import ReactLoading from 'react-loading'
import AddBankAccountMutation from './AddBankAccountMutation'
import { appStyles, colors } from '../../theme'

class BankAccount extends React.Component {
	constructor(props) {
		super(props)
		this.alertOptions = {
      offset: 60,
      position: 'top right',
      theme: 'light',
      transition: 'fade',
    };
		this.state = {
			editBankAccount: false,
			isBankAccountSaving: false,
			bank_address1: props.user.bankAccount ? props.user.bankAccount.addressLine1 || '' : '',
			bank_address2: props.user.bankAccount ? props.user.bankAccount.addressLine2 || '' : '',
			bank_city: props.user.bankAccount ? props.user.bankAccount.city || '' : '',
			bank_postalCode: props.user.bankAccount ? props.user.bankAccount.postalCode || '' : '',
			bank_country: props.user.bankAccount ? props.user.bankAccount.country || '' : '',
			bank_ownerName: props.user.bankAccount ? props.user.bankAccount.ownerName || '' : '',
			bank_IBAN: props.user.bankAccount ? props.user.bankAccount.IBAN || '' : '',
			bank_BIC: props.user.bankAccount ? props.user.bankAccount.BIC || '' : '',
			isBankAccountLoading: false,
		}
	}

	_setBankAccountEditMode = () => {
		if (this.props.user.bankAccount) {
			this.props.alert.show(localizations.popup_editBankAccount_edit, {
				timeout: 7000,
				type: 'success',
			});
		}
		else {
			this.setState({
				editBankAccount: true,
			})
		}
	}

	_isBankAccountInvalid = (fieldName) => {
		return this.state.isBankAccountSaving && this.state[fieldName].length === 0
	}

	_isBankAccountValid = () => {
		return (this.state.bank_address1.length 
				&& this.state.bank_city.length
				&& this.state.bank_postalCode.length
				&& this.state.bank_country.length
				&& this.state.bank_ownerName.length
				&& this.state.bank_IBAN.length)
	}

	_updateState = (name, e) => {
		this.setState({
			[name]: e.target.value,
		})
	}

	_updateDateState = (name, e) => {
		this.setState({
			[name]: e.toDate(),
		})
	}

	_resetBankAccountState = () => {
		const { props } = this
		this.setState({
			isBankAccountSaving: false,
			bank_address1: props.user.bankAccount ? props.user.bankAccount.addressLine1 : '',
			bank_address2: props.user.bankAccount ? props.user.bankAccount.addressLine2 : '',
			bank_city: props.user.bankAccount ? props.user.bankAccount.city : '',
			bank_postalCode: props.user.bankAccount ? props.user.bankAccount.postalCode : '',
			bank_country: props.user.bankAccount ? props.user.bankAccount.country : '',
			bank_ownerName: props.user.bankAccount ? props.user.bankAccount.ownerName : '',
			bank_IBAN: props.user.bankAccount ? props.user.bankAccount.IBAN : '',
			bank_BIC: props.user.bankAccount ? props.user.bankAccount.BIC : '',
			
		})
	}

	_updateBankAccount = () => {
    
      AddBankAccountMutation.commit({
		  user: this.props.user, 
        addressLine1Var: this.state.bank_address1,
        addressLine2Var:this.state.bank_address2, 
        cityVar: this.state.bank_city,
        postalCodeVar: this.state.bank_postalCode,
        countryVar: this.state.bank_country,
        ownerNameVar: this.state.bank_ownerName,
        IBANVar: this.state.bank_IBAN,
        BICVar: this.state.bank_BIC,
        viewer: this.props.viewer,
      },
      {
		  onSuccess: (response) => {
			this.props.alert.show(localizations.popup_editBankAccount_success, {
				timeout: 2000,
				type: 'success',
			});
          	this.setState({
            	process: false,
          	});
          	this.setState({
				editBankAccount: false,
				isBankAccountSaving: false,
			})
			this._resetBankAccountState()
        },
        onFailure: (error) => {
			this.setState({
				process: false,
			});
			this.props.alert.show(localizations.newSportunity_restriction_invalid, {
				timeout: 3000,
				type: 'error',
			});
          	console.log(error.getError());
        },
      }
    );    
  }

	_handleSaveBankAccount = (event) => {
		this.setState({
			isBankAccountSaving: true,
		})
		if (this._isBankAccountValid()) {
			event.preventDefault();
    	event.stopPropagation();
			this._updateBankAccount()
		} 
	}

	_handleCancelBankAccount = () => {
		this.setState({
			editBankAccount: false,
		})
		this._resetBankAccountState()
	}

	render() {
		const { editBankAccount } = this.state
		const { user, isProfileComplete } = this.props
		return(
			<section>	
				<div style={styles.rowHeader}>
					<div style={styles.pageHeader}>{localizations.payment_bankAccount}</div>
					{ (!editBankAccount && isProfileComplete) 
						&& <div style={styles.editButton} onClick={this._setBankAccountEditMode}>{localizations.payment_edit}</div> }
				</div>
				{!isProfileComplete
				?	<section>
						<div style={styles.completeInfoText}>
							{localizations.payment_bankAccount_complete_profile}
						</div>
						<div style={{...styles.completeInfoText, color: colors.red}}>
							{localizations.payment_bankAccount_complete_profile2}
						</div>
					</section>
				:
					user.bankAccount || editBankAccount ?
					<section>
						<div style={styles.row}>
							<label style={styles.label}>{localizations.bank_addressLine1}</label>
							{ editBankAccount 
										? <input type='text' 
													style={this._isBankAccountInvalid('bank_address1') ? styles.inputError : styles.input} 
													value={this.state.bank_address1} placeholder={localizations.newSportunity_add_bank_account_popup_address_line_1}
													onChange={this._updateState.bind(this, 'bank_address1')}/> 
										: <label style={styles.label}>{user.bankAccount.addressLine1}</label> }
						</div>
						<div style={styles.row}>
							<label style={styles.label}>{localizations.bank_addressLine2}</label>
							{ editBankAccount 
										? <input type='text' 
													style={styles.input} 
													value={this.state.bank_address2} placeholder={localizations.newSportunity_add_bank_account_popup_address_line_2}
													onChange={this._updateState.bind(this, 'bank_address2')}/> 
										: <label style={styles.label}>{user.bankAccount.addressLine2}</label> }
						</div>
						<div style={styles.row}>
							<label style={styles.label}>{localizations.bank_city}</label>
							{ editBankAccount 
										? <input type='text' 
													style={this._isBankAccountInvalid('bank_city') ? styles.inputError : styles.input} 
													value={this.state.bank_city} placeholder={localizations.newSportunity_add_bank_account_popup_city}
													onChange={this._updateState.bind(this, 'bank_city')}/> 
										: <label style={styles.label}>{user.bankAccount.city}</label> }
						</div>
						<div style={styles.row}>
							<label style={styles.label}>{localizations.bank_postalCode}</label>
							{ editBankAccount 
										? <input type='text' 
													style={this._isBankAccountInvalid('bank_postalCode') ? styles.inputError : styles.input} 
													value={this.state.bank_postalCode} placeholder={localizations.newSportunity_add_bank_account_popup_zip_code}
													onChange={this._updateState.bind(this, 'bank_postalCode')}/> 
										: <label style={styles.label}>{user.bankAccount.postalCode}</label> }
						</div>
						<div style={styles.row}>
							<label style={styles.label}>{localizations.bank_country}</label>
							{ editBankAccount 
										? <input type='text' 
													style={this._isBankAccountInvalid('bank_country') ? styles.inputError : styles.input} 
													value={this.state.bank_country} placeholder={localizations.newSportunity_add_bank_account_popup_country}
													onChange={this._updateState.bind(this, 'bank_country')}/> 
										: <label style={styles.label}>{user.bankAccount.country}</label> }
						</div>
						<div style={styles.row}>
							<label style={styles.label}>{localizations.bank_ownerName}</label>
							{ editBankAccount 
										? <input type='text' 
													style={this._isBankAccountInvalid('bank_ownerName') ? styles.inputError : styles.input} 
													value={this.state.bank_ownerName} placeholder={localizations.newSportunity_add_bank_account_popup_owner_name}
													onChange={this._updateState.bind(this, 'bank_ownerName')}/> 
										: <label style={styles.label}>{user.bankAccount.ownerName}</label> }
						</div>
						<div style={styles.row}>
							<label style={styles.label}>{localizations.bank_IBAN}</label>
							{ editBankAccount 
										? <input type='text' 
													style={this._isBankAccountInvalid('bank_IBAN') ? styles.inputError : styles.input} 
													value={this.state.bank_IBAN} placeholder='IBAN' 
													onChange={this._updateState.bind(this, 'bank_IBAN')}/> 
										: <label style={styles.label}>{user.bankAccount.IBAN}</label> }
						</div>
						<div style={styles.row}>
							<label style={styles.label}>{localizations.bank_BIC}</label>
							{ editBankAccount 
										? <input type='text' 
													style={styles.input} 
													value={this.state.bank_BIC} placeholder='BIC' 
													onChange={this._updateState.bind(this, 'bank_BIC')}/> 
										: <label style={styles.label}>{user.bankAccount.BIC}</label> }
						</div>
					</section>
					: <div style={styles.noDataError}>{localizations.bank_none}</div>

				}
				{ editBankAccount &&
					<div style={styles.row}>
						<label style={styles.label}></label>
						{	this.state.isBankAccountLoading ?
							<ReactLoading type='cylon' color={colors.blue} /> : 
							<section>
								<button style={appStyles.blueButton} onClick={this._handleSaveBankAccount}>{localizations.info_update}</button> 
								<button style={appStyles.grayButton} onClick={this._handleCancelBankAccount}>{localizations.info_cancel}</button>
							</section> }
					</div>
				}
			</section>
		)
	}
}

export default createFragmentContainer(withAlert(BankAccount), {
  user: graphql`
    fragment BankAccount_user on User {
              bankAccount {
                  addressLine1
                  addressLine2
                  city
                  postalCode
                  country
                  ownerName
                  IBAN
                  BIC
              }
          }
  `,
      viewer: graphql`
    fragment BankAccount_viewer on Viewer {
              me {
                  id
              }	
          }
  `,
})