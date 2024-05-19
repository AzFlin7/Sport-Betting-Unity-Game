import React, { Component } from 'react';
import { appStyles, colors, fonts } from '../../../theme'
import Radium, {Style} from 'radium';

let styles 

class InputText extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    let { label, placeholder, isError, isDisabled, readOnly } = this.props
    
    return(
      <div>
        {this.props.disabled ? <Style scopeSelector='.inputTextClass::-webkit-input-placeholder' rules={{
              color: '#BBB'
          }} /> : null }
        <div style={this.props.disabled ? styles.disabledLabel : appStyles.inputLabel}>{label}</div>
        <input
            className={this.props.disabled ? 'inputTextClass' : null}
            style={readOnly ? styles.readOnlyInput : styles.input}
            type='text'
            value={this.props.value}
            placeholder={placeholder}
            onChange={this.props.onChange}
            maxLength={this.props.maxLength}
            onClick={this.props.onClick}
            disabled={this.props.disabled}
            readOnly={readOnly}
            width='100%'
            {...this.props}
        />
      </div>
    )
  }
}

styles = {
  input: {
    borderWidth: 0,
    borderBottomWidth: 2,
    borderStyle: 'solid',
    borderBottomColor: colors.blue,
    height: '32px',
    lineHeight: '32px',
    fontFamily: 'Lato',
    color: 'rgba(0,0,0,0.65)',
    display: 'block',
    background: 'transparent',
    width: '100%',
    fontSize: fonts.size.medium,
    outline: 'none',
    ':disabled': {
      borderBottomColor: '#D1D1D1',
    },
  },
  readOnlyInput: {
    borderWidth: 0,
    borderBottomWidth: 2,
    borderStyle: 'solid',
    borderBottomColor: colors.blue,
    height: '32px',
    lineHeight: '32px',
    fontFamily: 'Lato',
    color: 'rgba(0,0,0,0.65)',
    display: 'block',
    background: 'transparent',
    width: '100%',
    fontSize: fonts.size.medium,
    outline: 'none',
    cursor: 'pointer',
    ':disabled': {
      borderBottomColor: '#D1D1D1',
      cursor: 'auto',
    },
  },
  disabledLabel: {
    display: 'block',
    color: '#D1D1D1',
    fontSize: 16,
    lineHeight: 1,
    flex: 1,
    fontFamily: 'Lato',
    cursor: 'auto'
  },
}

export default Radium(InputText)