import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PureComponent, { pure } from '../common/PureComponent'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as types from '../../actions/actionTypes.js';
import Geosuggest from 'react-geosuggest';
import { withAlert } from 'react-alert'
import { metrics, colors, fonts, appStyles } from '../../theme';
import localizations from '../Localizations'
let addressStylesBefore;
let addressStylesAfter;
let styles;

class Address extends PureComponent {
  constructor() {
    super();

    this.state = {
      isAddressChosen: false,
    }
    this.alertOptions = {
      offset: 14,
      position: 'top right',
      theme: 'light',
      timeout: 100,
      transition: 'fade',
    };
  }

  _addAddress = (details) => {
    const completeAddress = {
      address: details.label,
      country: '',
      city: '',
      zip: '',
    }

    details.gmaps.address_components.find((item) => {
      this.setState({
        isAddressChosen: false,
      })
      if (item.types[0] === 'country'){
        completeAddress.country = item.long_name;
      } else if (item.types[0] === 'postal_code') {
        completeAddress.zip = item.long_name;
      } else if (item.types[0] === 'locality' || item.types[1] === 'locality') {
        completeAddress.city = item.long_name;
      }
    })

    if (completeAddress.country === ''){
      this.props.alert.show(localizations.popup_editProfile_address_country_needed, {
        timeout: 2000,
        type: 'error',
      });
      return false;
    } else if (completeAddress.city === ''){
      this.props.alert.show(localizations.popup_editProfile_address_city_needed, {
        timeout: 2000,
        type: 'error',
      });
      return false;
    } else {
      this.props._addAddressAction(completeAddress);
      this.setState({
        isAddressChosen: true,
      })
    }
  }

  _openSuggestions = () => {
    this.setState({
      isAddressChosen: false,
    })
  }

  render () {
    const { address } = this.props;
    return(
      <div style={styles.container}>
        <label style={appStyles.inputLabel}>
          Address:
            {
              !this.state.isAddressChosen ?
                <Geosuggest
                  ref="geosuggest"
                  style={addressStylesBefore}
                  placeholder={address ? address.address : 'Enter address'}
                  onSuggestSelect={this._addAddress}
                  onFocus={this._clearSearch}
                  onChange={this._openSuggestions}
                  location={this.props.userLocation}
                  radius={50000}
                />
              :
                <Geosuggest
                  ref="geosuggest"
                  style={addressStylesAfter}
                  placeholder={address.address}
                  onSuggestSelect={this._addAddress}
                  onFocus={this._clearSearch}
                  onChange={this._openSuggestions}
                  location={this.props.userLocation}
                  radius={50000}
                />
            }

        </label>
      </div>
    )
  }
}

Address.propTypes = ({
  address: PropTypes.object,
  formattedAddress: PropTypes.oneOfType([
      PropTypes.string.isRequired,
      PropTypes.object.isRequired,
    ]),
})

const _addAddressAction = (item) => {
  return {
    type: types.UPDATE_PROFILE_ADDRESS,
    item,
  };
}
const stateToProps = (state) => ({
  formattedAddress: state.profileReducer.formattedAddress,
  userLocation: state.globalReducer.userLocation, 
});

const dispatchToProps = (dispatch) => ({
  _addAddressAction: bindActionCreators(_addAddressAction, dispatch),
});

const ReduxContainer = connect(
  stateToProps,
  dispatchToProps
)(Address);

export default createFragmentContainer(withAlert(ReduxContainer), {
  address: graphql`
    fragment Address_address on AddressModel {
      address,
      country,
      city,
      zip
    }
  `,
});

styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '90%',
  },
}

addressStylesBefore = {
  'input': {
    width: '100%',
    borderWidth: 0,
    borderBottomWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.blue,
    height: '32px',
    lineHeight: '32px',
    fontFamily: 'Lato',
    display: 'block',
    background: 'transparent',
    marginBottom: '20px',
    fontSize: fonts.size.medium,
    outline: 'none',
  },
  'suggests': {
    width: '100%',
  },
  'suggestItem': {
    marginHorizontal: metrics.margin.medium,
    padding: metrics.padding.medium,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.blue,
    color: colors.blue,
  },
}

addressStylesAfter = {
  'input': {
    width: '100%',
    borderWidth: 0,
    borderBottomWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.blue,
    height: '32px',
    lineHeight: '32px',
    fontFamily: 'Lato',
    display: 'block',
    background: 'transparent',
    marginBottom: '20px',
    fontSize: fonts.size.medium,
    outline: 'none',
  },
  'suggests': {
    width: '100%',
    display: 'none',
  },
  'suggestItem': {
    marginHorizontal: metrics.margin.medium,
    padding: metrics.padding.medium,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.blue,
    color: colors.blue,
  },
}
