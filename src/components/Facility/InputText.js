import React, { Component } from 'react';
import { appStyles } from '../../theme'

class InputText extends Component {
  render() {
    let { label, placeholder, children } = this.props
    return(
      <div>
        <div style={appStyles.inputLabel}>{label}</div>
        <input
            style={appStyles.input}
            type='"text'
            placeholder={placeholder}
            value={children} />
      </div>
    )
  }
}

export default InputText