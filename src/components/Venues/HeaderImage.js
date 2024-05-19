import React, { Component } from 'react';
import HeaderImageNavigator from './HeaderImageNavigator';

import colors from '../../theme/colors';

import Radium from 'radium';
let styles ;

class HeaderImage extends Component {
  render() {
    return (
      <div style={styles.container}>
        <p style={styles.headingText}>
          Bring more people, <br/>
          Manage all your facilities <br/>
          in a glinch of an eye.  
        </p>
        <HeaderImageNavigator {...this.props }/>
      </div>
    );
  }
}


styles = {
  container: {
    width: '100%',
    height: '410px',
    opacity: 0.9,
    backgroundImage: 'url("/images/background-landingvenues.jpg")',
    backgroundSize: '100%',
    backgroundRepeat: 'round',
    backgroundColor: '#000000',
    position: 'relative',
  },
  headingText: {
    width: '36%',
    fontFamily: 'Lato',
    fontSize: '44px',
    lineHeight: '52px',
    color: colors.white,
    position: 'absolute',
    top: '15px',
    left: '19%',
    '@media (max-width: 1024px)': {
      fontSize: '40px',
    lineHeight: '48px',
    },
    '@media (max-width: 960px)': {
      width: '94%',
      left: '3%',
    },
    '@media (max-width: 320px)': {
      width: '94%',
      left: '3%',
      fontSize: '32px',
      lineHeight: '42px',
    }
 },
}

export default Radium(HeaderImage);
