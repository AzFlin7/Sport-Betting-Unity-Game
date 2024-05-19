import React, { Component } from 'react';
import { appStyles } from '../../theme'

class InputText extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    let { label, placeholder, isError } = this.props
    const inputStyle = isError ? appStyles.inputError : appStyles.input
    return(
      <div>
        <div style={appStyles.inputLabel}>{label}</div>
        <input
            style={inputStyle}
            type='"text'
            value={this.props.value}
            placeholder={placeholder}
            onChange={this.props.onChange}
            width='100%'/>
      </div>
    )
  }
}

export default InputText