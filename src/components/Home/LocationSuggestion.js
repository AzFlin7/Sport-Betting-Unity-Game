import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as types from '../../actions/actionTypes.js'
import { colors, fonts, metrics } from '../../theme'
import Radium from 'radium';
import Geosuggest from 'react-geosuggest'
import localizations from '../Localizations'

let styles;
let locationStyles;

class LocationSuggestion extends React.Component {
  constructor(props) {
    super(props)
  }

  _locationSelected = (suggest) => {
    this.props._updateLocationAction(suggest.label, suggest.location.lat, suggest.location.lng)
  }

	_handleChange = (e) => {
		this.props._updateLocationAction(e, null, null)
	}

  render() {
    console.log(this.props);
    return(
      <span style={styles.span} >
        <i style={styles.span.iconMap} className="fa fa-map-marker" aria-hidden="true"></i>
        <Geosuggest
          style={locationStyles}
          placeholder={localizations.home_yourLocationHolder}
          onSuggestSelect={this._locationSelected}
          onChange={this._handleChange}
          initialValue={this.props.locationName}
          location={this.props.userLocation}
          radius={50000}
        />
      </span>
    )
  }
}


locationStyles = {
  input: {
    width: '100%',
    borderWidth: 0,
    //height: '32px',
    //lineHeight: '32px',
    fontFamily: 'Lato',
    display: 'block',
    background: 'transparent',
    marginBottom: '20px',
    // fontSize: fonts.size.medium,
    outline: 'none',
    paddingLeft: 15,
    fontSize: 20,
    lineHeight: '30px',
  },
  'suggests': {
    width: '100%',
    position: 'relative',
    zIndex: 1000
  },
  'suggestItem': {
    marginHorizontal: metrics.margin.medium,
    padding: metrics.padding.medium,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.blue,
    color: colors.blue,
    fontFamily: 'Lato',
    fontSize: fonts.size.medium,
    cursor: 'pointer',
    backgroundColor: colors.white,
  },
};


styles = {
  span: {
    height: '100%',
    width: '37%',
    boxSizing: 'border-box',
    paddingTop: 19,
    paddingLeft: 16,
    //padding: '2%',
    borderRight: '1px #ccc solid',
    display: 'inline-flex',
    '@media (max-width: 850px)': {
      display: 'flex',
      borderRight: 'none',
      backgroundColor: '#FFFFFF',
      boxShadow: '0 0 6px 0 rgba(0,0,0,0.5)',
      borderRadius: '100px',
      width: '100%',
      marginBottom: 5,
    },

    iconMap: {
      // fontSize: '30px',
      color: '#ccc',
      // marginLeft: 30,
      fontSize: '30px',
      lineHeight: '34px',
    },
    iconSearch: {
      fontSize: '30px',
      color: '#fff',
      marginLeft: '25%',
    },
    input: { /* shall toggle, from <p> to <input> */
      marginLeft: '6%',
      width: '100%',
      fontFamily: 'Lato',
      fontSize: '24px',
      color: '#ccc',
      display: 'inline',
    },
    inputSearch: {
      marginLeft: '15%',
      fontFamily: 'Lato',
      fontSize: '24px',
      display: 'inline',
      color: colors.white,
    },
  },
};


const _updateLocationAction = (name, lat, lng) => {
  return {
    type: types.UPDATE_SPORTUNITY_SEARCH_LOCATION,
    locationName: name,
    locationLat: lat,
    locationLng: lng,
  };
}

const stateToProps = (state) => ({
  locationName: state.sportunitySearchReducer.locationName,
  locationLat: state.sportunitySearchReducer.locationLat,
  locationLng: state.sportunitySearchReducer.locationLng,
  userCountry: state.globalReducer.userCountry,
  userLocation: state.globalReducer.userLocation
});

const dispatchToProps = (dispatch) => ({
  _updateLocationAction: bindActionCreators(_updateLocationAction, dispatch),
});

const ReduxContainer = connect(
  stateToProps,
  dispatchToProps
)(Radium(LocationSuggestion));


export default ReduxContainer