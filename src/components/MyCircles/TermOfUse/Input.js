import React from 'react';
import PureComponent, { pure } from '../../common/PureComponent'
import Radium, {Style} from 'radium';
import { colors } from '../../../theme';

let styles;

class Input extends PureComponent {

  _focus() {
    this._inputNode.focus();
  }

  render() {
    const { label, value, containerStyle, placeholder, onChange, onKeyPress, readOnly, error, disabled, rowed, ...rest } = this.props;
    const validLabel = typeof label === 'string' && !!label.trim().length;
    const finalContainerStyle = Object.assign({}, rowed ? styles.rowedContainer : styles.container, containerStyle);

    return (
      <div style={finalContainerStyle}>
        {
          validLabel &&
            <label style={disabled ? styles.disabledLabel : styles.label}>{label}</label>
        }
        {disabled || !value || value === '' ? <Style scopeSelector='.inputClass::-webkit-input-placeholder' rules={{
              color: '#BBB'
          }} /> : null }
        {
          this.props.type === "textarea"
          ?
            <textarea
              className={disabled || !value || value === '' ? 'inputClass' : null}
              style={ error ? styles.inputError : readOnly ? styles.readOnlyInput : styles.input }
              ref={node => { this._inputNode = node }}
              value={value}
              placeholder={placeholder}
              onChange={onChange}
              onKeyPress={onKeyPress}
              readOnly={readOnly}
              rows="4"
              disabled={disabled}
              {...rest}
            />
          :
            <input
              className={disabled ? 'inputClass' : null}
              style={ error ? styles.inputError : readOnly ? styles.readOnlyInput : styles.input }
              ref={node => { this._inputNode = node }}
              value={value}
              placeholder={placeholder}
              onChange={onChange}
              onKeyPress={onKeyPress}
              readOnly={readOnly}
              disabled={disabled}
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

  rowedContainer: {
    width: '100%',
    fontFamily: 'Lato',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },

  label: {
    display: 'block',
    color: colors.blue,
    fontSize: 16,
    lineHeight: 1,
    marginBottom: 8,
    flex: 1
  },
  disabledLabel: {
    display: 'block',
    color: '#D1D1D1',
    fontSize: 16,
    lineHeight: 1,
    marginBottom: 8,
    flex: 1
  },

  inputError: {
    width: '100%',
    flex: 1,
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
    flex: 1,
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
    flex: 1,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopColor: colors.gray,
    borderLeftColor: colors.gray,
    borderRightColor: colors.gray,
    borderBottomWidth: 2,
    borderBottomColor: colors.blue,
    padding: '8px 8px',

    fontSize: 20,
    fontFamily: 'Lato',
    lineHeight: 1,
    color: 'rgba(0, 0, 0, 0.64)',

    outline: 'none',

    background: 'transparent',

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
