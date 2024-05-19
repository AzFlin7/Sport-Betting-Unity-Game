import React, { Component } from 'react';
import colors from '../../theme/colors';

import Radium from 'radium';

let styles ;
class TagItem extends Component {
  render() {
    return (
      <div style={styles.container} >   
        <span style={styles.tagItemIconContainer} >
          <i style={styles.tagItemIcon} className="fa fa-globe" aria-hidden="true"></i>
        </span>

        <h3 style={styles.headingText} >Lorem ipsum</h3>
        <p style={styles.tagItemText} >
            Lorem ipsum dolor sit, 
            consectetur adipiscing ,
            idunt ut labore et dolo
            aliqua. Ut enim ad min
        </p>
      </div>
    );
  }
}

styles = {
  container: {
    height: '312px',
    width: '229px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
    '@media (max-width: 600px)': {
      width: '94%',
      margin: '3% auto',
      height: 'auto',
    }
  },
  tagItemIcon: {
    width: '43px',
    height: '50px',
    fontFamily: 'FontAwesome',
    fontSize: '50px',
    textAlign: 'center',
    lineHeight: '50px',
    color: '#fff',
    // color: '#FFFFFF',
  },
  tagItemIconContainer : {
    width: '100px',
    height: '100px',
    backgroundColor: colors.blue,
    borderRadius: '100%',
    textAlign: 'center',
    paddingTop: '25px',
  },
  headingText: {
    width: '160px',
    height: '34px',
    fontFamily: 'Lato',
    fontSize: '28px',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: '34px',
    color: 'rgba(0,0,0,0.65)',
  },
  tagItemText: {
    width: '229px',
    height: '138px',
    fontFamily: 'Lato',
    fontSize: '19px',
    // textAlign: 'center',
    lineHeight: '23px',
    color: 'rgba(0,0,0,0.44)',
    alignSelf: 'center',
    '@media (max-width: 600px)': {
      width: '94%',
      marginBottom: '3%',
      height: 'auto',
      display: 'block',
      textAlign: 'center',
    }
  },
}

export default Radium(TagItem);