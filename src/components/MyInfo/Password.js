import React from 'react'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import { withAlert } from 'react-alert'
import localizations from '../Localizations'
import ReactLoading from 'react-loading'
import styles from './Styles'

import { colors, appStyles } from '../../theme'
import ChangePasswordMutation from './UpdatePasswordMutation'

class Password extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			editMode: false,
			oldPassword: '',
			newPassword: '',
			confirmPassword: '',
			isSaving: false,
			isSaveProcessing: false,
		}
		this.alertOptions = {
      offset: 60,
      position: 'top right',
      theme: 'light',
      transition: 'fade',
    };
	}

	_updateState = (name, e) => {
		this.setState({
			[name]: e.target.value,
		})
	}

	_handleEdit = () => {
		this.setState({
			editMode: true,
		})
	}

	_isConfirmValid = () => {
		return (this.state.newPassword === this.state.confirmPassword)
	}

	_isDataInvalid = (fieldName) => {
		return this.state.isSaving && this.state[fieldName].length === 0
	}

	_changePassword = () => {
      ChangePasswordMutation.commit({
				viewer: this.props.viewer,
        oldPasswordVar: this.state.oldPassword,
				newPasswordVar: this.state.newPassword,
      },{
        onSuccess: (res) => {
          this.props.alert.show(localizations.popup_editMyInfo_password_changed, {
						timeout: 2000,
						type: 'success',
					});
          this.setState({
            editMode: false,
          })
          
        },
        onFailure: (error) => {
			this.props.alert.show(error.getError().source.errors[0].message, {
            	timeout: 5000,
            	type: 'error',
			});
        },
      }
    )
	}

	_handleSave = () => {
		this.setState({
			isSaving: true,
		})
		if(this._isDataComplete()) {
			this._changePassword()
		}
	}

	_isDataComplete = () => {
		if (!this.state.oldPassword) {
			this.props.alert.show(localizations.popup_registration_required_fields, {
				timeout: 3000,
				type: 'error',
			});
			return false; 
		}
		if (!this.state.newPassword || !this.state.confirmPassword) {
			this.props.alert.show(localizations.popup_registration_required_fields, {
				timeout: 3000,
				type: 'error',
			});
			return false;
		}
		if (this.state.newPassword !== this.state.confirmPassword) {
			this.props.alert.show(localizations.popup_registration_passwords_differents, {
				timeout: 2000,
        		type: 'error',
			});
			return false;
		}
		if (this.state.newPassword.length < 6) {
			this.props.alert.show(localizations.popup_changePassword_pass_not_long_enough, {
				timeout: 2000,
				type: 'error',
			});
			return false;
		}

		return true; 
	}

	_handleCancel = () => {
		this.setState({
			editMode: false,
		})
	}

	render() {
		const { editMode } = this.state
		return(
			<section>	
				<div style={styles.rowHeader}>
					<div style={styles.pageHeader}>{localizations.info_password}</div>
				</div>
				{editMode 
				? 	<section>
						<div style={styles.row}>
							<div style={styles.notePassword}>
								{localizations.password_explanation1}
							</div>
						</div>
						<div style={styles.row}>
							<span style={styles.notePassword}>
								{localizations.password_explanation2}
							</span>
						</div>
						<div style={styles.row}>
							<span style={styles.notePassword}>
								{localizations.password_explanation3}
							</span>
						</div>
						<div style={styles.row}>
							<span style={styles.notePassword}>
								&nbsp;
							</span>
						</div>
						<div style={styles.row}>
							<label style={styles.label}>{localizations.password_old}</label>
							<input type='password' 
									style={this._isDataInvalid('oldPassword') ? styles.inputError : styles.input} 
									value={this.state.oldPassword} placeholder={localizations.password_old}
									onChange={this._updateState.bind(this, 'oldPassword')} /> 
						</div>
						<div style={styles.row}>
							<label style={styles.label}>{localizations.password_new}</label>
							<input type='password' 
									style={this._isDataInvalid('newPassword') ? styles.inputError : styles.input} 
									value={this.state.newPassword} placeholder={localizations.password_new}
									onChange={this._updateState.bind(this, 'newPassword')} /> 
						</div>
						<div style={styles.row}>
							<label style={styles.label}>{localizations.password_new_2}</label>
							<input type='password' 
									style={this._isDataInvalid('confirmPassword') || !this._isConfirmValid() ? styles.inputError : styles.input} 
									value={this.state.confirmPassword} placeholder={localizations.password_new_2}
									onChange={this._updateState.bind(this, 'confirmPassword')} /> 
						</div>
						<div style={styles.row}>
							<label style={styles.label}></label>
							{this.state.isSaveProcessing 
							?	<ReactLoading type='cylon' color={colors.blue} /> 
							:	<section>
									<button style={appStyles.blueButton} onClick={this._handleSave}>{localizations.info_update}</button> 
									<button style={appStyles.grayButton} onClick={this._handleCancel}>{localizations.info_cancel}</button>
								</section> 
							}
						</div>
					</section>
				: 	<div style={styles.row}>
						<div style={styles.oneThird}>{localizations.info_password}</div>
						<div style={styles.oneThird}>*******************</div>
						<div style={styles.oneThird}>
							<div style={styles.editButton} onClick={this._handleEdit}>
								{localizations.password_edit}
							</div>
						</div>
					</div>
				}
			</section>
		)
	}
}


export default createFragmentContainer(withAlert(Password), {
  	user: graphql`
    	fragment Password_user on User {
              id
          }
  	`,
      viewer: graphql`
    	fragment Password_viewer on Viewer {
			id
			me {
				id
			}	
		}
  	`,
})