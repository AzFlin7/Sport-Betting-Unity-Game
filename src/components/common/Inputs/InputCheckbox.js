import React, { Component } from 'react';
import { appStyles, colors, fonts } from '../../../theme'
import Radium from 'radium';

let styles 

class InputCheckbox extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    let { label, placeholder, isDisabled } = this.props
    return(
      <input
          style={styles.checkbox}
          type='checkbox'
          checked={this.props.checked}
          onChange={this.props.onChange}
          readOnly={isDisabled}
        />
    )
  }
}

styles = {
    checkbox: {
      borderWidth: 0,
      borderBottomWidth: 2,
      borderStyle: 'solid',
      borderColor: colors.blue,
      lineHeight: '32px',
      fontFamily: 'Lato',
      color: 'rgba(0,0,0,0.65)',
      display: 'block',
      background: 'transparent',
      fontSize: fonts.size.medium,
      outline: 'none',
      cursor: 'pointer',
      width: 18, 
      height: 18, 
      ':disabled': {
        backgroundColor: colors.gray,
      },
    },
  }

export default Radium(InputCheckbox)