import React, { Component } from 'react';
import { appStyles } from '../../../theme'

class InputNumber extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    let { label, placeholder, isDisabled } = this.props
    const inputStyle = isDisabled ? appStyles.inputDisabled : appStyles.input ;
    return(
      <div>
        <div style={appStyles.inputLabel}>{label}</div>
        <input
            style={inputStyle}
            type='number'
            value={this.props.value}
            placeholder={placeholder}
            onChange={this.props.onChange}
            maxLength={this.props.maxLength}
            readOnly={isDisabled}
            width='100%'/>
      </div>
    )
  }
}

export default InputNumber