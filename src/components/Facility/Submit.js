import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Loading from 'react-loading';
import { withAlert } from 'react-alert'
import Radium from 'radium'
import { withRouter } from 'found'

import NewFacilityMutation from './Mutations/NewFacilityMutation.js'
import UpdateFacilityMutation from './Mutations/UpdateFacilityMutation.js'
import * as types from '../../actions/actionTypes.js';
import { colors } from '../../theme';
import localizations from '../Localizations'

let styles;

class Submit extends Component {

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

  _addNewFacility = () => {
		if (this.props.validateInput()) {
			this._changeLoadingStatus(true);
			const viewer = this.props.viewer
			const venueIDVar = this.props.venueId
			
			const facilityIdVar = this.props.facilityId
			const facilityNameVar = this.props.facilityName
			
			const sportsVar = this.props.sports.map(function(sport){
				return  sport.node.id
			})

			const authorizedManagersVar = [];
			const tmpAuthorizedManagers = this.props.authorizedManagers.map(manager => ({
				user: manager.user && manager.user.id ? manager.user.id : manager.user,
				circle: manager.circle && manager.circle.id ? manager.circle.id : manager.circle,
        authorization_level: manager.authorization_level
			}));

			tmpAuthorizedManagers.forEach(manager => {
				if (authorizedManagersVar.findIndex(managerVar => managerVar.user === manager.user
					&& managerVar.circle === manager.circle) < 0)
					authorizedManagersVar.push(manager);
			})

			const photoVar = this.props.photo

			if (facilityIdVar) {
				UpdateFacilityMutation.commit({
						viewer,
						venueIDVar,
						facilityIdVar,
						facilityNameVar,
						sportsVar,
						photoVar,
            authorizedManagersVar
					},
					{
						onFailure: error => {
							this.props.alert.show(localizations.popup_facility_update_failed, {
								timeout: 2000,
								type: 'error',
							});
							let errors = JSON.parse(error.getError().source);
							console.log(errors);
							this._changeLoadingStatus(false);
						},
						onSuccess: (response) => {
							this.props.alert.show(localizations.popup_facility_update_success, {
								timeout: 2000,
								type: 'success',
							});
							
							setTimeout(() => {
								this._changeLoadingStatus(false);this.props.onClose()}, 1000);
							
						},
					}
				);
			}
			else {
				NewFacilityMutation.commit({
						viewer,
						venueIDVar,
						facilityNameVar,
						sportsVar,
						photoVar,
            authorizedManagersVar
					},
					{
						onFailure: error => {
							this.props.alert.show(localizations.popup_facility_update_failed, {
								timeout: 2000,
								type: 'error',
							});
							let errors = JSON.parse(error.getError().source);
							this._changeLoadingStatus(false);
						},
						onSuccess: (response) => {
							this.props.alert.show(localizations.popup_facility_update_success, {
								timeout: 2000,
								type: 'success',
							});
							if (this.props.nextToSportunity) {
								let sportunityId = this.props.sportunityID;
								this.props._updateSportunityIdAction(null);
								this.props._updateNextToSportunityAction(false);
								this.props.router.push(sportunityId ? ('/event-edit/' + sportunityId) : '/new-sportunity')
							}
							else
								setTimeout(() => {
									this._changeLoadingStatus(false);
									this.props.onClose()
								}, 1000);
						},
					}
				);
			}
		}
  }

  render() {
		return(
      <div style={styles.container}>
        {
          this.state.isLoading === true &&
            <Loading type='spinningBubbles' color='#e3e3e3' />
        }
        <button onClick={this._addNewFacility} style={styles.submitButton}>
					{this.props.facilityId ? localizations.manageVenue_facility_save : localizations.manageVenue_facility_create }</button>
      </div>
    )
  }
}

// REDUX //

const _resetVenueFormAction = () => ({
  type: types.VENUE_RESET_FORM,
})

const _updateSportunityIdAction = (value) => ({
	type: types.UPDATE_SPORTUNITY_ID,
	value,
})

const _updateNextToSportunityAction = (value) => ({
	type: types.UPDATE_NEXT_TO_SPORTUNITY,
	value,
})

const stateToProps = (state) => ({
  venueId: state.facilityReducer.venueId,
	venue: state.facilityReducer.venue,
	facilityId: state.facilityReducer.facilityId,
  facilities: state.facilityReducer.facilities,
  facilityName: state.facilityReducer.facilityName,
  sports: state.facilityReducer.sports,
	photo: state.facilityReducer.photo,
  authorizedManagers: state.facilityReducer.authorizedManagers,
	sportunityID: state.createInfraReducer.sportunityID,
	nextToSportunity: state.createInfraReducer.nextToSportunity,
});

const dispatchToProps = (dispatch) => ({
  _resetVenueFormAction: bindActionCreators(_resetVenueFormAction, dispatch),
	_updateSportunityIdAction: bindActionCreators(_updateSportunityIdAction, dispatch),
	_updateNextToSportunityAction: bindActionCreators(_updateNextToSportunityAction, dispatch),
});

export default Radium(connect(
  stateToProps,
  dispatchToProps
)(withAlert(Radium(withRouter(Submit)))));

styles = {
  container: {
    width: '100%',
  },
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
		lineHeight: '27px',
  },
}
