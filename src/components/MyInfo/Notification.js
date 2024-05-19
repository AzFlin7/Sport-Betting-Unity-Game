import React from 'react'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';

import ReactLoading from 'react-loading'
import styles from './Styles'
import localizations from '../Localizations'
import UpdateNotificationMutation from './UpdateNotificationMutation'
import { withAlert } from 'react-alert'
import {  colors, appStyles } from '../../theme'
import Radium from 'radium'
var Style = Radium.Style;

class Notification extends React.Component {
	constructor() {
		super();
		this.state = {
			notification_preferences: null,
			email_preferences: null,
			isSaveProcessing: false,
			isChanged: false,
		}
	}
	componentDidMount() {
		if (this.props.user) {
			let notification_preferences = this.props.user.notification_preferences ;
			let email_preferences = this.props.user.email_preferences ;
			
			delete notification_preferences.__dataID__ ;
			delete email_preferences.__dataID__ ;
			this.setState({
				notification_preferences: notification_preferences,
				email_preferences: email_preferences,
				isSaveProcessing: false,
				isChanged: false,
			})
		}
	}

	componentWillReceiveProps = nextProps => {
		if (!this.props.user && !!nextProps.user) {
			let notification_preferences = nextProps.user.notification_preferences ;
			let email_preferences = nextProps.user.email_preferences ;
			
			delete notification_preferences.__dataID__ ;
			delete email_preferences.__dataID__ ;
			this.setState({
				notification_preferences: notification_preferences,
				email_preferences: email_preferences,
				isSaveProcessing: false,
				isChanged: false,
			})
		}
	}

	componentWillMount() {
		if (this.props.user && this.props.user.appLanguage && this.props.user.appLanguage.toLowerCase() !== localizations.getLanguage()) {
			if (this.props.user.appLanguage.toLowerCase() === 'fr')
				localizations.setLanguage(this.props.user.appLanguage.toLowerCase()); 
			else 
				localizations.setLanguage('en') 
		}
	}

	_updateNotificationCheckBox = (field, e) => {
		let {notification_preferences} = this.state ;
		notification_preferences[field] = !this.state.notification_preferences[field];
		this.setState({
			notification_preferences,
			isChange: true,
		})
	}

	_updateEmailCheckBox = (field, e) => {
		let {email_preferences} = this.state ;
		email_preferences[field] = !this.state.email_preferences[field];
		this.setState({
			email_preferences,
			isChange: true,
		})
	}

	_handleSave = () => {
		this.setState({
			isSaveProcessing: true,
		})

		const {notification_preferences, email_preferences} = this.state

		UpdateNotificationMutation.commit({
				viewer: this.props.viewer,
				userIDVar: this.props.user.id,
				notification_preferencesVar: notification_preferences,
				email_preferencesVar: email_preferences
			},{
				onSuccess: (res) => {
					this.props.alert.show(localizations.popup_editMyInfo_update_sucess, {
						timeout: 2000,
						type: 'success',
					})
					this.setState({
						isSaveProcessing: false,
						isChanged: false,
					})
				
				},
				onFailure: (error) => {
					this.props.alert.show(localizations.popup_editMyInfo_update_falied, {
						timeout: 5000,
						type: 'error',
					})
					this.setState({
						isSaveProcessing: false,
					})
				},
			}
    	)
	}

	_renderPref = (prefName, index) => {

		return (
			<tr key={index} style={styles.tableRow}>
				<td style={styles.tableLabel}>
					{localizations['info_notif_pref_'+prefName]}
				</td>
				<td style={styles.tableCol}>
					{typeof this.state.notification_preferences[prefName] !== 'undefined' &&
						<input 
							style={styles.checkbox}
							type='checkbox' 
							checked={this.state.notification_preferences[prefName]}
							onChange={this._updateNotificationCheckBox.bind(this, prefName)}
						/>
					}
				</td>
				<td style={styles.tableCol}>
					{typeof this.state.email_preferences[prefName] !== 'undefined' && 
						<input 
							style={styles.checkbox}
							type='checkbox' 
							checked={this.state.email_preferences[prefName]}
							onChange={this._updateEmailCheckBox.bind(this, prefName)}
						/>
					}
				</td>
			</tr>
		)
	}

	_getPreferencesArray = () => {
		let preferencesArray = [];

		const {notification_preferences, email_preferences} = this.state ;

		if (!!notification_preferences && !!email_preferences) {
			Object.keys(notification_preferences).forEach(item => {
				if (!preferencesArray.includes(item))
					preferencesArray.push(item)
			})
			Object.keys(email_preferences).forEach(item => {
				if (!preferencesArray.includes(item))
					preferencesArray.push(item)
			})
		}

		return preferencesArray;
	}

	render() {
		let preferencesArray = this._getPreferencesArray();
		
		return(
			<section>	
				<Style 
					scopeSelector=".react-alerts" 
					rules={{
						right: '0px!important'
					}}
				/>
				<div style={styles.pageHeader}>{localizations.info_notification}</div>
				<table>
					<thead>
						<tr style={styles.tableHeader}>
							<th>
								{localizations.info_notif_pref_table_title}
							</th>
							<th>
								{localizations.info_notif_pref_table_notification}
							</th>
							<th>
								{localizations.info_notif_pref_table_email}
							</th>
						</tr>
					</thead>
					<tbody>

						{preferencesArray && preferencesArray.length > 0 &&
							preferencesArray.map((item, index) => 
								this._renderPref(item, index)
							)
						}

					</tbody>

				</table>
				
				<div style={styles.row}>
					{	this.state.isSaveProcessing ?
							<ReactLoading type='cylon' color={colors.blue} /> : 
							<section>
								<button 
										style={styles.blueButton} 
										onClick={this._handleSave}>{localizations.info_update}</button> 
							</section> }
				</div>
			</section>
		)
	}
}


export default createFragmentContainer(withAlert(Radium(Notification)), {
  user: graphql`
    fragment Notification_user on User {
              id
              appLanguage
              notification_preferences {
                  sportunityBooked
                  sportunityBookerCancel
                  sportunityNewInvited
                  sportunityNewFollower
                  sportunityModifiedParticipant					
                  sportunityCancelParticipant
                  paymentConfirmationOnDDay
                  sportunityNewMainOrganizer
                  sportunityBookedOrganizer
                  sportunityBookerCancelOrganizer
                  sportunityCancelMainOrganizer
                  sportunityModifiedMainOrganizer					
                  paymentReceivedMainOrganizer
                  sportunityCompleteStatistics
                  sportunityVoteForManOfTheGame
              }
              email_preferences {
                  sportunityBooked
                  sportunityBookerCancel
                  sportunityNewInvited
                  sportunityNewFollower
                  sportunityModifiedParticipant					
                  sportunityCancelParticipant
                  chatUnReadMessage
                  paymentConfirmationOnDDay
                  sportunityNewMainOrganizer
                  sportunityBookedOrganizer
                  sportunityBookerCancelOrganizer
                  sportunityCancelMainOrganizer
                  sportunityModifiedMainOrganizer					
                  paymentReceivedMainOrganizer
              }
          }
  `,
	viewer: graphql`
		fragment Notification_viewer on Viewer {
			id
			me {
				id
			}	
		}
  	`,
})


