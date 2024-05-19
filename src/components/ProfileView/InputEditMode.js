import React from 'react';
import { colors } from '../../theme';
import InputAddress from '../common/Inputs/InputAddress'
// Let this take a render prop for input field. For example if we have date.
const InputEditMode = ({
  value,
  onChange,
  maxLength,
  onConfirm,
  onCancel,
  type = 'input',
  renderInput,
}) => {
  if (typeof renderInput === 'function') {
    return (
      <div style={styles.container}>
        {renderInput(styles.input)}
        <div style={{ display: 'flex' }}>
          <i className="fa fa-check" onClick={onConfirm} style={{...styles.icon, backgroundColor: colors.green}} />
          <i className="fa fa-times" onClick={onCancel} style={{...styles.icon, backgroundColor: colors.red}} />
        </div>
      </div>
    );
  }
  
  return (
    <div style={styles.container}>
      {type === 'textArea' 
      ? <textarea
          style={{...styles.input, ...styles.textarea}}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
        />
      : type === 'address' 
        ? <InputAddress
            value={value}
            onChange={onChange}
          />
        : <input
            style={styles.input}
            type="text"
            value={value}
            onChange={onChange}
            maxLength={maxLength}
          />
      }
      <div>
        <i className="fa fa-check" onClick={onConfirm} style={{...styles.icon, backgroundColor: colors.green}} />
        <i className="fa fa-times" onClick={onCancel} style={{...styles.icon, backgroundColor: colors.red}} />
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    marginBottom: 5,
    alignItems: 'flex-end',
  },
  input: {
    border: 'none',
    borderColor: 'transparent',
    background: colors.white,
    borderBottom: '2px solid '+ colors.blue,
    fontSize: 18,
    outline: 'none',
    lineHeight: 1.2,
    fontFamily: 'lato',
  },
  textarea: {
    minWidth: '80%',
    fontFamily: 'lato',
  },
  icon: {
    color: colors.white,
    cursor: 'pointer',
    fontSize: '0.7em',
    padding: '0.3em',
    marginLeft: 5,
  },
};

export default InputEditMode;
