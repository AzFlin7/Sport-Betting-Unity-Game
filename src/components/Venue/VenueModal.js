import Modal from 'react-modal'
import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { colors, fonts, metrics, appStyles } from '../../theme'
import InputText from './InputText'
import Submit from './Submit'
import * as types from '../../actions/actionTypes.js';
import Geosuggest from 'react-geosuggest'
import localizations from '../Localizations'

import Radium from 'radium'

let modalStyles
let styles
let inputStyles

class VenueModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isNameError: false,
			isNameDuplicateError: false,
      isAddressError: false,
      isCityError: false,
      isCountryError: false,
    }
  }

  _setErrorStatus = (field, value) => {
    this.setState({
      [field]: value,
    })
  }

  _updateName = (e) => {
    this.props._updateNameAction(e.target.value)
  }

  _updateAddress = (e) => {
    this.props._updateAddressAction(e.target.value)
  }

  _updateCity = (e) => {
    this.props._updateCityAction(e.target.value)
  }

  _updateCountry = (e) => {
    this.props._updateCountryAction(e.target.value)
  }

  componentDidMount = () => {
    this.props._updateFormAction(this.props.venue)
  }

  _locationSelected = (details) => {
    const completeAddress = {
      address: details && details.label.indexOf(',') >= 0 ? details.label.split(',')[0] : details ? details.label : '' ,
      country: '',
      city: '',
      zip: '',
    }

    details && details.gmaps.address_components.find((item) => {
      this.setState({
        isAddressChosen: false,
      })
      if (item.types[0] === 'country'){
        completeAddress.country = item.long_name;
      } else if (item.types[0] === 'locality' || item.types[1] === 'locality') {
        completeAddress.city = item.long_name;
      }
    })
    
    this.props._updateCountryAction(completeAddress.country)
    this.props._updateCityAction(completeAddress.city)
    this.props._updateAddressAction(completeAddress.address)
  }

  render() {
    const { viewer } = this.props
    return(
      <Modal
        isOpen={this.props.modalIsOpen}
        onAfterOpen={this.afterOpenModal}
        onRequestClose={this.closeModal}
        style={modalStyles}
        contentLabel="Edit venue"
      >
        <div style={styles.modalContent}>
          <div style={styles.modalHeader}>
            <div style={styles.modalTitle}>{this.props.venue ? localizations.manageVenue_edit : localizations.manageVenue_create}</div>
            <div style={styles.modalClose} onClick={this.props.closeModal}>
              <i className="fa fa-times fa-2x" />
            </div>
          </div>
          <InputText 
              isError={this.state.isNameError}
              label={localizations.manageVenue_name}
              value={this.props.name}
              placeholder={localizations.manageVenue_venueName}
              onChange={this._updateName} />
          <div style={appStyles.inputLabel}>{localizations.manageVenue_address}</div>
          <Geosuggest 
              style={inputStyles(this.state.isAddressError)} 
              placeholder={localizations.manageVenue_address}
              onSuggestSelect={this._locationSelected}
              initialValue={this.props.address ? this.props.address + ', ' + this.props.city + ', ' + this.props.country : ''}
              location={this.props.userLocation}
              radius={50000}
            />
          {/*<InputText  
              isError={this.state.isCityError}
              label='City'
              value={this.props.city}
              placeholder='City'
              onChange={this._updateCity}/>
          <InputText 
              isError={this.state.isCountryError}
              label='Country'
              value={this.props.country}
              placeholder='Country'
              onChange={this._updateCountry}/>*/}
          <Submit  viewer={viewer}
                    user={viewer.me}
                    setErrorStatus={this._setErrorStatus}
                    onClose={this.props.closeModal} 
                    displayDelete={this.props.venue && false}
                   toVenue={this.props.toVenue}
                    />
          
        </div>
        
      </Modal>
    )

  }
}

modalStyles = {
  overlay : {
    position          : 'fixed',
    top               : 0,
    left              : 0,
    right             : 0,
    bottom            : 0,
    backgroundColor   : 'rgba(255, 255, 255, 0.75)',
  },
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    border                     : '1px solid #ccc',
    background                 : '#fff',
    overflow                   : 'visible',
    WebkitOverflowScrolling    : 'touch',
    borderRadius               : '4px',
    outline                    : 'none',
    padding                    : '20px',
  },
}

styles = {
  modalContent: {
		display: 'flex',
		flexDirection: 'column',
    justifyContent: 'flex-start',
    '@media (max-width: 480px)': {
      width: '300px',
    }
	},
	modalHeader: {
		display: 'flex',
		flexDirection: 'row',
    alignItems: 'flex-center',
		justifyContent: 'flex-center',
	},
	modalTitle: {
		fontFamily: 'Lato',
		fontSize:30,
		fontWeight: fonts.weight.medium,
		color: colors.blue,
		marginBottom: 20,
		flex: '2 0 0',
	},
	modalClose: {
		justifyContent: 'flex-center',
		paddingTop: 10,
		color: colors.gray,
		cursor: 'pointer',
	},
  greenButton: {
		width: '400px',
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
    '@media (max-width: 320px)': {
      width: '300px',
    }
  },
	redButton: {
		width: '400px',
		height: '50px',
		backgroundColor: colors.redGoogle,
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
    '@media (max-width: 320px)': {
      width: '300px',
    }
  },

}

inputStyles = (isError) => {
  return {
    'input': isError ? appStyles.inputError : appStyles.input,
    'suggests': {
      width: 400,
      position: 'absolute'
    },
    'suggests--hidden': {
      width: '0',
      display: 'none',
    },
    'suggestItem': {
      marginHorizontal: metrics.margin.medium,
      padding: metrics.padding.medium,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: colors.blue,
      color: colors.blue,
      fontFamily: 'Lato',
      fontSize: fonts.size.small,
      cursor: 'pointer',
      backgroundColor: colors.white,
    },
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
  userCountry: state.globalReducer.userCountry,
  userLocation: state.globalReducer.userLocation
});

const ReduxContainer = connect(
  stateToProps,
	dispatchToProps,
)(Radium(VenueModal));

export default Radium(ReduxContainer)