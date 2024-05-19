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
    const { value, containerStyle, inputStyle, placeholder, onChange, ...rest } = this.props;
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
    borderBottomWidth: 2,
    borderBottomColor: colors.red,

    fontSize: 18,
    fontFamily: 'Lato',
    lineHeight: 1,
    color: 'rgba(0, 0, 0, 0.64)',

    paddingBottom: 3,

    outline: 'none',

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
    borderBottomWidth: 2,
    borderBottomColor: colors.blue,
    fontSize: 18,
    fontFamily: 'Lato',
    lineHeight: 1,
    color: 'rgba(0, 0, 0, 0.64)',
    paddingBottom: 6,
    outline: 'none',
    width: '100%',
    '@media (max-width: 768px)': {
      width: 180,
    },
    '@media (max-width: 600px)': {
      width: 240,
    },
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
