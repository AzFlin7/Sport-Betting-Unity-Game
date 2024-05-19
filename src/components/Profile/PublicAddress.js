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
let styles;
import localizations from '../Localizations'

class PublicAddress extends Component {
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

  componentDidMount = () => {
    this.props._addPublicAddressAction(this.props.publicAddress)
  }

  onChange = (details) => {
    const completeAddress = {
      address: '',
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
      } else if (item.types[0] === 'locality' || item.types[1] === 'locality') {
        completeAddress.city = item.long_name;
      }
    });

    this.props._addPublicAddressAction(completeAddress);
  }

  render () {
    const { publicAddress } = this.props;
    return(
      <div style={styles.container}>
        <label style={appStyles.inputLabel}>
          {localizations.profile_public_address}
            <Geosuggest
              ref="geosuggest"
              style={styles.addressStyle}
              placeholder={publicAddress ? publicAddress.city+', '+publicAddress.country : 'Enter your public address here'}
              onSuggestSelect={this.onChange}
              types={['(cities)']}
              location={this.props.userLocation}
              radius={50000}
            />

        </label>
      </div>
    )
  }
}

PublicAddress.propTypes = ({
  publicAddress: PropTypes.object
})

const _addPublicAddressAction = (item) => {
  return {
    type: types.UPDATE_PROFILE_PUBLIC_ADDRESS,
    item,
  };
}
const stateToProps = (state) => ({
  // publicAddress: state.profileReducer.publicAddress,
  userCountry: state.globalReducer.userCountry,
  userLocation: state.globalReducer.userLocation
});

const dispatchToProps = (dispatch) => ({
  _addPublicAddressAction: bindActionCreators(_addPublicAddressAction, dispatch),
});

const ReduxContainer = connect(
  stateToProps,
  dispatchToProps
)(PublicAddress);

export default createFragmentContainer(withAlert(ReduxContainer), {
  publicAddress: graphql`
    fragment PublicAddress_publicAddress on AddressModel {
      country,
      city,
    }
  `,
});

styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '90%',
    position: 'relative'
  },
  addressStyle: {
    input: {
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
    suggests: {
      width: '100%',
      position: 'absolute',
      top: 50,
      backgroundColor: colors.white,

      boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
      border: '2px solid rgba(94,159,223,0.83)',
      zIndex: 100,
    },
    suggestItem: {
      marginHorizontal: metrics.margin.medium,
      padding: metrics.padding.medium,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: colors.blue,
      color: colors.blue,
    },
}

}
