import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import Radium from 'radium';
import { connect } from 'react-redux';
import _Geosuggest from 'react-geosuggest';
import localizations from '../Localizations'

import { colors } from '../../theme';


let styles;

const Geosuggest = Radium(_Geosuggest);


class Address extends PureComponent {

  render() {
    const { address, onChange, error } = this.props;
    return (
      <div style={styles.container}>
        <label style={styles.label}>{localizations.newSportunity_address}</label>
        <Geosuggest
          style={error ? styles.geosuggestError : styles.geosuggest}
          placeholder={localizations.newSportunity_addressHolder}
          initialValue={address}
          onSuggestSelect={onChange}
          location={this.props.userLocation}
          radius={50000}
        />
      </div>
    );
  }
}

const dispatchToProps = (dispatch) => ({
})

const stateToProps = (state) => ({
  userCountry: state.globalReducer.userCountry,
  userLocation: state.globalReducer.userLocation
})

export default connect(
  stateToProps,
  dispatchToProps
)(Radium(Address));

styles = {
  container: {
    position: 'relative',
  },

  label: {
    display: 'block',
    color: colors.blueLight,
    fontSize: 16,
    lineHeight: 1,
    marginBottom: 8,
  },

  triangle: {
    position: 'absolute',
    right: 0,
    top: 35,
    width: 0,
    height: 0,

    transition: 'border 100ms',
    transitionOrigin: 'left',

    color: colors.blue,

    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderTop: `8px solid ${colors.blue}`,
  },

  geosuggest: {
    input: {
      width: '100%',
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      borderBottomWidth: 2,
      borderBottomColor: colors.blue,
      paddingRight: 20,

      fontSize: 20,
      fontFamily: 'Lato',
      lineHeight: 1,
      color: 'rgba(0, 0, 0, 0.64)',

      paddingBottom: 8,

      outline: 'none',
      ':focus': {
        borderBottomColor: colors.green,
      },
    },

    suggests: {
      width: '100%',
      position: 'absolute',
      top: 50,
      backgroundColor: colors.white,

      boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
      border: '2px solid rgba(94,159,223,0.83)',
      padding: 20,
      zIndex: 100,
    },

    suggestItem: {
      paddingTop: 10,
      paddingBottom: 10,
      color: '#515151',
      fontSize: 18,
      fontWeight: 500,
      fontFamily: 'Helvetica Neue',

      ':hover': {
        backgroundColor: '#e9e9e9',
      },
    },
  },

  geosuggestError: {
    input: {
      width: '100%',
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      borderBottomWidth: 2,
      borderBottomColor: colors.red,
      paddingRight: 20,

      fontSize: 20,
      fontFamily: 'Lato',
      lineHeight: 1,
      color: 'rgba(0, 0, 0, 0.64)',

      paddingBottom: 8,

      outline: 'none',
      ':focus': {
        borderBottomColor: colors.green,
      },
    },

    suggests: {
      width: '100%',
      position: 'absolute',
      top: 50,
      backgroundColor: colors.white,

      boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
      border: '2px solid rgba(94,159,223,0.83)',
      padding: 20,
      zIndex: 100,
    },

    suggestItem: {
      paddingTop: 10,
      paddingBottom: 10,
      color: '#515151',
      fontSize: 18,
      fontWeight: 500,
      fontFamily: 'Helvetica Neue',

      ':hover': {
        backgroundColor: '#e9e9e9',
      },
    },
  },
};
