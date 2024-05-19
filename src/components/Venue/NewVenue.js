import React, { Component } from 'react'
import VenueModal from './VenueModal'
import { colors } from '../../theme'

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as types from '../../actions/actionTypes.js';
import localizations from '../Localizations'

import Radium from 'radium'
let styles

class NewVenue extends Component {

  constructor(props) {
    super(props)
    this.state = {
      modalIsOpen: false,
    }
  }
 
  _openModal = () => {
		this.props._updateNameAction('')
		this.props._updateAddressAction('')
		this.props._updateCityAction('')
		this.props._updateCountryAction('')
    this.setState({ modalIsOpen: true });
  }

  _closeModal = () => {
    this.setState({ modalIsOpen: false });
  }

  _onSave = () => {
    alert('Save')
    this._closeModal()
  }

  _onDelete = () => {
    alert('Deleted')
    this.closeModal()
  }

  render() {
		return (
      <div>
        <div onClick={this._openModal} style={styles.button}>
          <div style={styles.buttonText}>{localizations.manageVenue_create}</div>
          <div style={styles.buttonIcon}>
            <i className="fa fa-plus fa-align-right" />
          </div>
        </div>
        <VenueModal 
          venue={null}
          modalIsOpen={this.state.modalIsOpen} 
          closeModal={this._closeModal}
          onSave={this._onSave}
          onDelete={this._onDelete} 
          viewer={this.props.viewer}/>
      </div>
    );
  }
}

const _updateNameAction = (value) => {
  return {
     type: types.VENUE_UPDATE_NAME,
     name: value,
  }
}

const _updateAddressAction = (value) => {
  return {
     type: types.VENUE_UPDATE_ADDRESS,
     address: value,
  }
}

const _updateCityAction = (value) => {
  return {
     type: types.VENUE_UPDATE_CITY,
     city: value,
  }
}

const _updateCountryAction = (value) => {
  return {
     type: types.VENUE_UPDATE_COUNTRY,
     country: value,
  }
}

const _updateFormAction = (venue) => {
  
  return {
     type: types.VENUE_UPDATE_FORM,
     id: venue ? venue.id : '',
     name: venue ? venue.name : '',
     address: venue ? venue.address.address : '',
     city: venue ? venue.address.city : '',
     country: venue ? venue.address.country : '',
  }
}


const dispatchToProps = (dispatch) => ({
  _updateNameAction: bindActionCreators(_updateNameAction, dispatch),
  _updateAddressAction: bindActionCreators(_updateAddressAction, dispatch),
  _updateCityAction: bindActionCreators(_updateCityAction, dispatch),
  _updateCountryAction: bindActionCreators(_updateCountryAction, dispatch),
  _updateFormAction: bindActionCreators(_updateFormAction, dispatch),
});

const stateToProps = (state) => ({
  id: state.venueReducer.id,
  name: state.venueReducer.name,
  address: state.venueReducer.address,
  city: state.venueReducer.city,
  country: state.venueReducer.country,
});

const ReduxContainer = connect(
  stateToProps,
	dispatchToProps,
)(Radium(NewVenue));

export default Radium(ReduxContainer)

styles =  {
  button: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-center',
    alignItems: 'flex-center',
    width: 500,
    height: 70,
    backgroundColor: colors.white,
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12)',
    border: '1px solid #E7E7E7',
    borderRadius: 4,
    fontFamily: 'Lato',
    fontSize: 28,
    lineHeight: '42px',
    cursor: 'pointer',
    paddingLeft: 20,
    paddingRight:20,
    paddingTop: 14,
    marginTop: '20px',
		color: colors.blue,
    '@media (max-width: 730px)': {
      width: '300px',
      fontSize: '20px',
    }

	},
	buttonText: {
		flex: '2 0 0',
		textDecoration: 'none',
	},
	buttonIcon: {
		color: colors.blue,
	},
}
