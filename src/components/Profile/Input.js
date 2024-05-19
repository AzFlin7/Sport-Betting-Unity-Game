import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import Radium from 'radium';
import { colors } from '../../theme';

let styles;

class Input extends PureComponent {

  _focus() {
    this._inputNode.focus();
  }

  render() {
    const { label, value, containerStyle, placeholder, onChange, isError, ...rest } = this.props;
    const validLabel = typeof label === 'string' && !!label.trim().length;
    const finalContainerStyle = Object.assign({}, styles.container, containerStyle);
    return (
      <div style={finalContainerStyle}>
        {
          validLabel &&
            <label style={styles.label}>{label}</label>
        }
        <input
          style={ isError ? styles.inputError : styles.input }
          ref={node => { this._inputNode = node }}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          {...rest}
        />
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
  },

  label: {
    display: 'block',
    color: colors.blueLight,
    fontSize: 14,
    lineHeight: 1,
    marginBottom: 2,
  },

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
    marginBottom: 20,
    outline: 'none',

    ':focus': {
      borderBottomColor: colors.green,
    },

    ':disabled': {
      borderBottomColor: '#D1D1D1',
      backgroundColor: 'transparent',
    },
  },

  inputError: {
    width: '100%',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottomWidth: 2,
    borderBottomColor: colors.error,
    paddingRight: 20,

    fontSize: 20,
    fontFamily: 'Lato',
    lineHeight: 1,
    color: 'rgba(0, 0, 0, 0.64)',

    paddingBottom: 8,
    marginBottom: 20,
    outline: 'none',

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
