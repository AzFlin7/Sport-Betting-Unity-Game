import React from 'react';
import Radium from 'radium';
import { colors } from '../../../theme';

let styles;

class Input extends React.Component {

  _focus() {
    this._inputNode.focus();
  }

  render() {
    const { label, value, containerStyle, placeholder, onChange, onKeyPress, readOnly, onClick, error, ...rest } = this.props;
    const validLabel = typeof label === 'string' && !!label.trim().length;
    const finalContainerStyle = Object.assign({}, styles.container, containerStyle);

    return (
      <div style={finalContainerStyle}>
        {
          validLabel &&
            <label style={styles.label}>{label}</label>
        }
        {
          this.props.type === "textarea" 
          ? 
            <textarea
              style={ error ? styles.inputError : readOnly ? styles.readOnlyInput : styles.input }
              ref={node => { this._inputNode = node }}
              value={value}
              placeholder={placeholder}
              onChange={onChange}
              onKeyPress={onKeyPress}
              readOnly={readOnly}
              rows="4"
              {...rest}
            />
          :
            <input
              style={ error ? styles.inputError : readOnly ? styles.readOnlyInput : styles.input }
              ref={node => { this._inputNode = node }}
              value={value}
              placeholder={placeholder}
              onChange={onChange}
              onKeyPress={onKeyPress}
              onClick={onClick}
              readOnly={readOnly}
              {...rest}
            />
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
  },

  label: {
    display: 'block',
    color: colors.blueLight,
    fontSize: 16,
    lineHeight: 1,
    marginBottom: 8,
  },

  inputError: {
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

    cursor: 'pointer',

    ':focus': {
      borderBottomColor: colors.green,
    },

    ':disabled': {
      borderBottomColor: '#D1D1D1',
      backgroundColor: 'transparent',
    },
  },

  readOnlyInput: {
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

    cursor: 'pointer',

    ':focus': {
      borderBottomColor: colors.green,
    },

    ':disabled': {
      borderBottomColor: '#D1D1D1',
      backgroundColor: 'transparent',
    },
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
