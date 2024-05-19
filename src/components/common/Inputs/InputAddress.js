import React, { Component } from 'react';
import { appStyles, colors, fonts, metrics } from '../../../theme'
import Radium from 'radium';
import Geosuggest from 'react-geosuggest';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

let styles 

class InputAddress extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    let { label, placeholder, isError, isDisabled } = this.props
    
    return(
      <div style={styles.container}>
        <Geosuggest
            ref="geosuggest"
            style={styles.addressStyles}
            onSuggestSelect={this.props.onChange}
            initialValue={this.props.value}
            placeholder={''}
            location={this.props.userLocation}
            radius={50000}
          />
      </div>
    )
  }
}

styles = {
  container: {
    position: 'relative',
    flex: 1,
    marginRight: 50
  },
  addressStyles: {
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
  }  
}

const dispatchToProps = (dispatch) => ({
})
  
const stateToProps = (state) => ({
  userLocation: state.globalReducer.userLocation,
})

let ReduxContainer = connect(
    stateToProps,
    dispatchToProps
)(Radium(InputAddress));

export default Radium(ReduxContainer)