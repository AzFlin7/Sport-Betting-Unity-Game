import React, { Component } from 'react';
import {createRefetchContainer, graphql} from 'react-relay';
import { Link } from 'found'
import Radium from 'radium'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as types from '../../actions/actionTypes.js';
import Header from '../common/Header/Header.js'
import Footer from '../common/Footer/Footer'
import styles from './styles.js'
import NewFacility from './NewFacility'
import EditFacility from './EditFacility'
import EditVenue from '../Venue/EditVenue'
import NewFacilityMutation from './Mutations/NewFacilityMutation.js'
import UpdateFacilityMutation from './Mutations/UpdateFacilityMutation.js'
import DeleteFacilityMutation from './Mutations/DeleteFacilityMutation.js'
import localizations from '../Localizations'

class Facility extends Component {
  constructor(props) {
    super(props)
    this.state = {
      language: localizations.getLanguage(),
    }
  }

  _setLanguage = (language) => {
    this.setState({ language: language })
  }

  _addSport = (sport) => {
    this.props._addSportAction(sport)
  }

  _nameChanged = (newName) => {
    this.props._updateFacilityNameAction(newName)
  }

	_deleteSport = (sportId) => {
		this.props._deleteSportAction(sportId)
	}

  _addAuthorizedManager = (authorizedManager) => {
    this.props._addAuthorizedManagersAction(authorizedManager);
  };

  _deleteAuthorizedManager = (authorizedManager) => {
    this.props._deleteAuthorizedManagersAction(authorizedManager);
  };

	componentDidMount = () => {
    if (this.props.selectedVenueId) {
      this.props.relay.refetch(fragmentVariables => ({
        ...fragmentVariables,
        venueId: this.props.selectedVenueId
      }))
    }
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.viewer.venue) {
      this.props._setVenueIdAction(nextProps.viewer.venue.id)
      this.props._setVenueAction(nextProps.viewer.venue)
      this.props._setFacilitiesAction(nextProps.viewer.venue.infrastructures)
    }
  }

  render() {
    const { viewer } = this.props
    const venue = viewer.venue || null

    return (
        <div>
          { venue &&
            <section>
              <div style={styles.headerContainer}>
                <div style={styles.pageHeader}>
                  {venue.name}
                  <EditVenue 
                    language={this.props.language}
                    venue={venue} 
                    viewer={viewer}
                    />
                </div>
              </div>
              <div style={styles.bodyContainer}>
                <div style={styles.itemHeader}>{localizations.manageVenue_facilities}</div>
                
                {venue.infrastructures.map(infra => 
                  <EditFacility
                    key={infra.id}
                    infrastructure={infra}
                    viewer={viewer}
                    onAddSport={this._addSport}
                    onDeleteSport={this._deleteSport}
                    onAddManager={this._addAuthorizedManager}
                    onDeleteManager={this._deleteAuthorizedManager}
                    onNameChanged={this._nameChanged}
                    onAddFacility={this.props._addFacility}>{infra.name}</EditFacility>
                )}
                <NewFacility 
                  viewer={viewer}
                  onAddSport={this._addSport}
                  onDeleteSport={this._deleteSport}
                  onAddManager={this._addAuthorizedManager}
                  onDeleteManager={this._deleteAuthorizedManager}
                  onNameChanged={this._nameChanged}
                  onAddFacility={this.props._addFacility}
                  language={this.props.language}/>
              </div> 
            </section>
          }
				</div>
    );
  }
}

const _setVenueIdAction = (venueId) => ({
  type: types.FACILITY_SET_VENUE_ID,
  venueId: venueId,
})

const _setVenueAction = (venue) => ({
  type: types.FACILITY_SET_VENUE,
  venue: venue,
})

const _setPhotoAction = (photo) => ({
	type: types.FACILITY_SET_PHOTO,
  photo: photo,
})

const _setFacilitiesAction = (facilities) => {
	return {
  type: types.FACILITY_SET_FACILITIES,
  facilities: facilities,
}}

const _updateFacilityNameAction = (facilityName) => ({
  type: types.FACILITY_UPDATE_FACILITY_NAME,
  facilityName: facilityName,
})

const _addSportAction = (sport) => ({
  type: types.FACILITY_ADD_SPORT,
  sport: sport,
})

const _deleteSportAction = (sportId) => ({
  type: types.FACILITY_DELETE_SPORT,
  sportId: sportId,
})

const _addAuthorizedManagersAction = (authorizedManager) => ({
  type: types.FACILITY_ADD_AUTHORIZED_MANAGERS,
  authorizedManager: authorizedManager,
})

const _deleteAuthorizedManagersAction = (authorizedManager) => ({
  type: types.FACILITY_DELETE_AUTHORIZED_MANAGERS,
  authorizedManager: authorizedManager,
})

const _addFacilityAction = (facility) => ({
  type: types.FACILITY_ADD_FACILITY,
  facility: facility,
})

const stateToProps = (state) => ({
  venueId: state.facilityReducer.venueId,
  facilities: state.facilityReducer.facilities,
  facilityName: state.facilityReducer.facilityName,
  sports: state.facilityReducer.sports,
  photo: state.facilityReducer.photo,
});

const dispatchToProps = (dispatch) => ({
  _setPhotoAction: bindActionCreators(_setPhotoAction, dispatch),
  _setVenueIdAction: bindActionCreators(_setVenueIdAction, dispatch),
  _setVenueAction: bindActionCreators(_setVenueAction, dispatch),
  _setFacilitiesAction: bindActionCreators(_setFacilitiesAction, dispatch),
  _updateFacilityNameAction: bindActionCreators(_updateFacilityNameAction, dispatch),
  _addSportAction: bindActionCreators(_addSportAction, dispatch),
  _deleteSportAction: bindActionCreators(_deleteSportAction, dispatch),
  _addAuthorizedManagersAction: bindActionCreators(_addAuthorizedManagersAction, dispatch),
  _deleteAuthorizedManagersAction: bindActionCreators(_deleteAuthorizedManagersAction, dispatch),
  _addFacilityAction: bindActionCreators(_addFacilityAction, dispatch),
});

const ReduxContainer = connect(
  stateToProps,
  dispatchToProps
)(Radium(Facility));

export default createRefetchContainer(
  Radium(ReduxContainer),
  graphql`
    fragment Facility_viewer on Viewer
    @argumentDefinitions(
      venueId: {type: "ID", defaultValue: null}
    ) {
      ...NewFacility_viewer
      ...EditFacility_viewer
      ...EditVenue_viewer
      id,
      me {
        id
        avatar
      }
      venue(id: $venueId) {
        ...EditVenue_venue
        ...EditFacility_venue
        ...NewFacility_venue
        id
        name,
        infrastructures {
          id
          name
          logo
          sport {
            id
            logo
            name {
              EN
              FR
            }
          }
          authorized_managers {
            user {
              id
              pseudo
            }
            circle {
              id
              name
            }
          }
        }
        price {
          currency
          cents
        }
      }
    }
  `,
  graphql`
    query FacilityRefetchQuery($venueId: ID) {
      viewer {
        ...Facility_viewer @arguments(venueId: $venueId)
      }
    }
  `
);
