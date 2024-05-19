import React, {Component} from 'react';
import Radium from 'radium';
import {Link} from 'found'

import { colors } from '../../../theme'

let styles;

const Circle = ({ name, image = "../../img/profile.png", onClick, unreadNotif, style={}, tintColor = null }) => (
  <div
    style={{
      ...styles.icon,
      ...style,
      backgroundImage: 'url(' + image +')'
    }}
    onClick={onClick}
  >
	  { unreadNotif ?
		  <span style={styles.marked}>{unreadNotif}</span> : null
	  }
    {!!tintColor && (image === "https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png" || image === "../../img/profile.png") && 
      <div style={{
        ...style,
        ...styles.tint,
        backgroundColor: tintColor
      }}></div>
    }
  </div>
)


styles = {
  icon: {
    borderRadius: '50%',
    backgroundPosition: '50% 50%',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    position: 'relative'
  },
  tint: {
    position: 'absolute',
    borderRadius: '50%',
    opacity: '0.4',
    margin: 0,
    top: 0,
    right: 0
  },
	marked: {
		backgroundColor: '#E64131',
		width: 17,
		height: 17,
		position: 'absolute',
		top: -10,
		right: -4,
		borderRadius: '50%',
		color: colors.white,
		textAlign: 'center',
		paddingTop: 3,
    fontWeight: 'bold',
    fontSize: 10
	},
}


export default Radium(Circle);
