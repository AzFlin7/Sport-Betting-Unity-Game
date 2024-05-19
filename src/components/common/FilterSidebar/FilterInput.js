import React from 'react';
import PureComponent, { pure } from '../PureComponent'
import Radium from 'radium';
import Loading from 'react-loading';
import { colors, metrics, fonts } from '../../../theme';

let styles;

class Input extends PureComponent {

  _focus() {
    this._inputNode.focus();
  }

  render() {
    const { value, containerStyle, inputStyle, placeholder, onChange, isLoading, ...rest } = this.props;
    const finalContainerStyle = Object.assign({}, styles.container, containerStyle);
    const finalInputStyle = Object.assign({}, styles.input, inputStyle);

    return (
      <div style={finalContainerStyle}>

        <input
          style={ finalInputStyle }
          ref={node => { this._inputNode = node }}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          {...rest}
        />
        {this.props.isLoading && 
          <div style={styles.loadingContainer}><Loading type='spinningBubbles' color={colors.blue} /></div>
        }
      </div>
    );
  }
}

Input.defaultProps = {
  placeholder: 'Select',
}


styles = {
  container: {
    width: '100%',
    fontFamily: 'Lato',
    position: 'relative'
  },
  loadingContainer: {
    height: 20,
    width: 20,
    display: 'flex',
    right: 35,
    top: 0,
    position: 'absolute'
  },

  label: {
    display: 'block',
    color: colors.blueLight,
    fontSize: 16,
    lineHeight: 1,
    marginBottom: 8,
  },

  inputError: {
    input: {
    width: '100%',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottom: 'none',
    // borderBottomWidth: 2,
    // borderBottomColor: colors.red,

    fontSize: 12,
    fontFamily: 'Lato',
    width: '70%',
    lineHeight: '25px',
    height: '25px',
    color: 'rgba(0, 0, 0, 0.64)',

    padding: 3,

    outline: 'none',

    boxShadow: 'rgba(0, 0.12, 0, 0) 1px 1px 1px 1px',

    ':focus': {
      borderBottomColor: colors.green,
    },

    ':disabled': {
      borderBottomColor: '#D1D1D1',
      backgroundColor: 'transparent',
    },
  },
  },

  input: {
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottom: 'none',
    // borderBottomWidth: 2,
    // borderBottomColor: colors.blue,
    fontSize: 12,
    fontFamily: 'Lato',
    lineHeight: '25px',
    height: '25px',
    width: '70%',
    color: 'rgba(0, 0, 0, 0.64)',
    padding: 3,
    outline: 'none',
    boxShadow: 'rgba(0, 0, 0, 0.12) 1px 1px 1px 1px',
    ':focus': {
      borderBottomColor: colors.green,
    },
    ':disabled': {
      borderBottomColor: '#D1D1D1',
      backgroundColor: 'transparent',
    },

  },
}


export default Radium(Input);
