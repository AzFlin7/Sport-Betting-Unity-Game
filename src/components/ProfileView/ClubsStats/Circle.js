import React, {Component} from 'react';
import PureComponent, { pure } from '../../common/PureComponent'
import Radium from 'radium';

import { colors } from '../../../theme'

let styles;

class Circle extends PureComponent {
  render() {
    const {
      name,
      image
    } = this.props;

      return (
        <div style={styles.circle}>
          <div style={{...styles.icon, backgroundImage: image ? 'url('+ image +')' : 'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")'}} />
          <div style={styles.name}>{name}</div>
      </div>
    );
  }
}

styles = {
  circle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    textDecoration: 'none',
    width: '100%'
  },
  icon: {
    minWidth: 40,
    minHeight: 40,
    borderRadius: '50%',
    marginBottom: 7,
    backgroundPosition: '50% 50%',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  },
  name: {
    color: colors.black,
    fontSize: 17,
    fontWeight: 500,
    textDecoration: 'none',
    textTransition: 'none',
    width: '100%',
    textAlign: 'center',
    wordWrap: 'break-word',
    fontWeight: 'bold'
  },
}


export default Radium(Circle);
