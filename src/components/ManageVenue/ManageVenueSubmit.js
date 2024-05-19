import React from 'react'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import {Link} from 'found'
import ToggleDisplay from 'react-toggle-display'
import ReactLoading from 'react-loading'

import { colors } from '../../theme'
import NewSlotMutation from './Mutations/NewSlotMutation.js'
import UpdateSlotMutation from './Mutations/UpdateSlotMutation.js';

import { withAlert } from 'react-alert'
import localizations from '../Localizations'

let styles 

class Submit extends React.Component {
	constructor(props) {
		super(props);
		this.alertOptions = {
			offset: 60,
			position: 'top right',
			theme: 'light',
			transition: 'fade',
		};

		this.state = {
			displayFillAccount: false,
			isLoading: false,
		}
	}

	_handleClick = () => {
		if(this.props.onClick()) {

			if (this.props.cents > 0) {
				if (!this.props.viewer.me || !this.props.viewer.me.isProfileComplete || !this.props.viewer.me.bankAccount || !this.props.viewer.me.bankAccount.id) {
					this.setState({displayFillAccount: true})
					return ;
				}
			}

			const venueIDVar = this.props.venueId
			const infrastructureIDVar = this.props.facilityId

			let fromVar = new Date(this.props.start)
			fromVar.setHours(this.props.from.split(':')[0])
			fromVar.setMinutes(this.props.from.split(':')[1])
			let endVar = new Date(this.props.start)
			endVar.setHours(this.props.to.split(':')[0])
			endVar.setMinutes(this.props.to.split(':')[1])

			const priceVar = { cents: parseInt(this.props.cents) * 100, currency: this.props.viewer.me.appCurrency }
			
			const viewer = this.props.viewer
			
			const usersVar = this.props.authorizedUsers.length > 0 
				? this.props.authorizedUsers.map(el => el.id)
				: [] ;

			const circlesVar = this.props.authorizedCircles.length > 0
				? this.props.authorizedCircles.map(el => el.id)
				: [];

			const flexibleVar = false;

			if (this.props.selectedSlot && this.props.selectedSlot.id) {
				this.setState({isLoading: true})
				UpdateSlotMutation.commit({
						viewer,
						venueIDVar,
						infrastructureIDVar,
						slotIDVar: this.props.selectedSlot.id,
						fromVar,
						endVar,
						priceVar,
						usersVar,
						circlesVar,
						flexibleVar,
						updateSlotSerieVar: this.props.updateSerie
					},
					{
						onFailure: error => {
							console.log(error);
							//this._changeLoadingStatus(false);
						},
						onSuccess: (response) => {
							// console.log(response);
							//this._changeLoadingStatus(false);
							//this.props.alert.show('Update successful!', {
							//	timeout: 2000,
							//	type: 'success',
							//});
							this.setState({isLoading: false})
							this.props.onClose()
							//this.props.alert.show('Save Success!', {
							//	timeout: 4000,
							//	type: 'success',
							//});
							
						},
					}
				)
			}
			else {
				this.setState({isLoading: true})
				NewSlotMutation.commit({
						viewer,
						venueIDVar,
						infrastructureIDVar,
						fromVar,
						endVar,
						priceVar,
						usersVar,
						circlesVar,
						flexibleVar,
						repetitionNumberVar: this.props.isRepeated ? this.props.repetitionNumber : 0,
					},
					{
						onFailure: error => {
							console.log(error);
						},
						onSuccess: (response) => {
							this.setState({isLoading: false})
							this.props.onClose()
						},
					}
				)
			}
		}
	}

	formatText = (text) => {
		return text.charAt(0).toUpperCase() + text.slice(1);
	}


	render() {
		return(
			<section>
				<ToggleDisplay show={this.props.errors.length > 0}>
					<label style={styles.error}>{this.formatText(this.props.errors.join(', '))}</label>
				</ToggleDisplay>
				{this.state.displayFillAccount && 
					<div style={styles.fillAccount}>
						<label style={styles.error}>
							{localizations.manageVenue_account_not_filled}
						</label>
						<div>
							<Link to="/my-info" style={styles.fillAccountLink}>
								{localizations.manageVenue_goToAccount}
							</Link>
						</div>
					</div>
				}
				{this.state.isLoading
				?	<div style={{display: 'flex', justifyContent: 'center'}}><ReactLoading type='cylon' color={colors.blue} /> </div>
				:	<button style={styles.submitButton} onClick={this._handleClick}>
						{localizations.manageVenue_validate}
					</button>
				}
			</section>
		)
	}
}

styles = {
  submitButton: {
    width: '100%',
	height: '50px',
	backgroundColor: colors.green,
	boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
	borderRadius: '3px',
    display: 'inline-block',
    fontFamily: 'Lato',
    fontSize: '22px',
    textAlign: 'center',
    color: colors.white,
    borderWidth: 0,
    marginTop: 10,
    marginBottom: 10,
    cursor: 'pointer',
		lineHeight: '45px',
    
  },
  error: {
    fontFamily: 'Lato',
    fontSize: 14,
    color: colors.error,
  },
  fillAccount: {
	width: 350
  },
  fillAccountLink: {
	color: colors.error,
	fontSize: 14,
	fontFamily: 'Lato',
	lineHeight: '24px'
  }
}

export default createFragmentContainer(withAlert(Submit), {
  viewer: graphql`
    fragment ManageVenueSubmit_viewer on Viewer {
      me {
          id 
          isProfileComplete
          bankAccount {
              id
          }
          appCurrency
      }
    }
  `,
});
