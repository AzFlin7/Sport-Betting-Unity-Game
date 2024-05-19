import React from 'react'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import {Link} from 'found'
import ToggleDisplay from 'react-toggle-display'
import ReactLoading from 'react-loading'

import { colors } from '../../../theme'

import { withAlert } from 'react-alert'
import localizations from '../../Localizations'

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

			const venueIDVar = this.props.selectedVenue
			const infrastructureIDVar = this.props.selectedFacility

			let fromVar = new Date(this.props.start)
			fromVar.setHours(this.props.from.split(':')[0])
			fromVar.setMinutes(this.props.from.split(':')[1])
			let endVar = new Date(this.props.start)
			endVar.setHours(this.props.to.split(':')[0])
			endVar.setMinutes(this.props.to.split(':')[1])

			const priceVar = { cents: parseInt(this.props.cents) * 100, currency: 'CHF'}
			
			const viewer = this.props.viewer
			
			const usersVar = this.props.authorizedUsers.length > 0 
				? this.props.authorizedUsers.map(el => el.id)
				: [] ;

			const circlesVar = this.props.authorizedCircles.length > 0
				? this.props.authorizedCircles.map(el => el.id)
				: [];

			const flexibleVar = false;

			let slot = {
        venue: this.props.selectedVenue,
        infrastructure: this.props.selectedFacility,
        id: null,
        from: fromVar,
        end: endVar,
        price: priceVar,
				serie_information: {
					remainingSlots: this.props.repetitionNumber
				}
      }
      this.props.selectSlot(slot)
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
    fragment Submit_viewer on Viewer {
      me {
          id 
          isProfileComplete
          bankAccount {
						id
						addressLine1,
						addressLine2,
						city,
						postalCode,
						country,
						ownerName,
						IBAN,
						BIC
          }
      }
    }
  `,
});
