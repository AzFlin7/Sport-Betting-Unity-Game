import React, { Component } from 'react';
import { appStyles, colors, fonts } from '../../../theme'
import Radium from 'radium';

let styles 

class InputPhone extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    let { label, placeholder, isError, isDisabled } = this.props
    
    return(
      <div>
        <div style={appStyles.inputLabel}>{label}</div>
        <input
            style={styles.input}
            type='number'
            value={this.props.value}
            placeholder={placeholder}
            onChange={this.props.onChange}
            maxLength={this.props.maxLength}
            onClick={this.props.onClick}
            disabled={this.props.disabled}
            width='100%'/>
      </div>
    )
  }
}

styles = {
  input: {
    borderWidth: 0,
    borderBottomWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.blue,
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
      borderColor: colors.gray,
    },
  },
}

export default Radium(InputPhone)