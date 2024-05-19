import React, { Component } from 'react'
import {Link} from 'found'
import { colors } from '../../theme'

import Radium from 'radium'

let styles

class VenueItem extends Component {
  render() {
    return(
        <div style={styles.button} onClick={this.props.onClick}>
            <div style={styles.buttonText}>{this.props.children}</div>
            <div style={styles.buttonIcon}><i className="fa fa-chevron-right fa-align-right" /></div>
        </div>
    )
  }
}

styles =  {
  button: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-center',
	  alignItems: 'center',
    width: 500,
    minHeight: 70,
    backgroundColor: colors.white,
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12)',
    border: '1px solid #E7E7E7',
    borderRadius: 4,
    fontFamily: 'Lato',
    fontSize: 28,
    lineHeight: '42px',
    cursor: 'pointer',
    paddingLeft: 20,
    paddingRight:20,
    paddingTop: 14,
    paddingBottom: 14,
    marginTop: '20px',
		color: colors.black,
    '@media (max-width: 730px)': {
      width: '300px',
      fontSize: '20px',
    },
	},
	buttonText: {
		flex: '2 0 0',
		textDecoration: 'none',
	},
	buttonIcon: {
		color: colors.blue,
	},
	buttonLink: {
		color: colors.black,
		textDecoration: 'none',
	},
}

export default Radium(VenueItem)