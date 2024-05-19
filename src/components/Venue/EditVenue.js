import React, { Component } from 'react'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import { connect } from 'react-redux';
import { colors, fonts } from '../../theme'
import VenueModal from './VenueModal'
import * as types from '../../actions/actionTypes.js';
import { bindActionCreators } from 'redux';
import localizations from '../Localizations'

let styles

class EditVenue extends Component {

  constructor(props) {
    super(props)
    this.state = {
      modalIsOpen: false,
    }
  }
 
  _openModal = () => {
    this.setState({ modalIsOpen: true });
  }
 
  _closeModal = () => {
    this.setState({ modalIsOpen: false });
  }

  render() {
    
     return (
       <div>
          <div onClick={this._openModal} style={styles.pageSubHeader}>
            {localizations.manageVenue_edit_delete}
          </div>

          <VenueModal 
              modalIsOpen={this.state.modalIsOpen} 
              venue={this.props.venue}
              closeModal={this._closeModal}
              onSave={this._closeModal}
              onDelete={this._closeModal} 
              viewer={this.props.viewer}/>
      </div>
    );
  }
}

styles = {
  pageSubHeader: {
		height: 41,
		fontFamily: 'Lato',
		fontSize: 20,
		fontWeight: fonts.weight.small,
		color: colors.gray,
		display: 'flex',
    marginBottom: 0,
    marginLeft: 30,
    cursor: 'pointer',
    alignItems: 'center'
  },
}

const stateToProps = (state) => ({
  id: state.venueReducer.id,
  name: state.venueReducer.name,
  address: state.venueReducer.address,
  city: state.venueReducer.city,
  country: state.venueReducer.country,
});



const _updateFormAction = (venue) => {
  return {
     type: types.VENUE_UPDATE_FORM,
     id: venue.id,
     name: venue.name,
     address: venue.address.address,
     city: venue.address.city,
     country: venue.address.country,
  }
}

const dispatchToProps = (dispatch) => ({
  _updateFormAction: bindActionCreators(_updateFormAction, dispatch),
});

const ReduxContainer = connect(
  stateToProps,
  dispatchToProps
)(EditVenue);

export default createFragmentContainer(ReduxContainer, {
  viewer: graphql`
    fragment EditVenue_viewer on Viewer {
      me {
        venues(last:100) {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    }
  `,
  venue: graphql`
    fragment EditVenue_venue on Venue {
      id
      name
      address {
        address
        country
        city
        zip
      }
    }
  `,
})