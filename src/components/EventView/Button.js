import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { colors } from '../../theme'

let styles

class Button extends Component {

  static propTypes = { 
  	text: PropTypes.string,
    onClick: PropTypes.func,
    style: PropTypes.any.isRequired,
  }

  static defaultProps = {
    onClick: () => {}, 
  };

  render() {
    return(
      <button
        onClick={this.props.onClick}
        style={this.props.style}  
      >
        {this.props.text}
      </button>
    )
  }
}

export default Button

styles = { 

}