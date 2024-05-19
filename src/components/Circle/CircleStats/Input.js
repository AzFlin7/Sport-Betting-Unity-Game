import React from 'react';
import Radium from 'radium';
import { colors } from '../../../theme/index';

let styles;

class Input extends React.Component {

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
    fontFamily: 'Lato',
  },

  input: {
    width: 220,
    cursor: 'pointer',
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
