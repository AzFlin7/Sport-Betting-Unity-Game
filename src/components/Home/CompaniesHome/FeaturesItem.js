import React, { Component } from 'react';

import colors from '../../theme/colors';

import Radium from 'radium'
import localizations from "../Localizations";
import Features from "./Features";

let styles ;
class FeaturesItem extends Component {

  _handleClick = (event) => {
    if (this.props.onClickGoTo)
      this.props.router.push(this.props.onClickGoTo)
  }

  render() {
    const { image, Title, descr } = this.props ;
    let containerStyle = {
      ...styles.container
    };

    let headingText = {...styles.headingText};

    return  (
      <div style={containerStyle} onClick={this._handleClick}>
        <img style={styles.tagItemImage} src={image}/>
        <div style={styles.textContainer}>
          <h3 style={headingText}>{Title}</h3>
          <p style={styles.tagItemText}>
            {descr}
          </p>
        </div>
      </div>
    );
  }
}

styles = {
  container: {
    // height: '312px',
    width: '28%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '10px 30px',
    '@media (max-width: 920px)': {
      width: '45%',
    },
    '@media (max-width: 768px)': {
      margin: '0px 10px',
      width: '95%',
    },
    '@media (max-width: 480px)': {
      margin: '0 auto',
    }
  },
  textContainer: {
  },
  tagItemImage: {
    width: '100px',
    height: '100px',
    // color: '#FFFFFF',
  },
  headingText: {
    // width: '160px',
    fontFamily: 'Lato',
    fontSize: '20px',
    fontWeight: '600',
    textAlign: 'center',
    color: colors.darkGray,
    marginBottom: 8,
    '@media (max-width: 600px)': {
      fontSize: '18px',
    },
  },
  tagItemText: {
    // width: '229px',
    // height: '150px',
    textAlign: 'center',
    fontFamily: 'Lato',
    fontSize: '18px',
    // textAlign: 'center',
    lineHeight: 1.55,
    color: 'rgba(0,0,0,0.44)',
    alignSelf: 'flex-end',
    marginTop: '20px',
    width: '100%',
    '@media (max-width: 600px)': {
      fontSize: '16px',
      lineHeight: '20px',
    },
    '@media (max-width: 480px)': {
      fontSize: '16px',
      lineHeight: '20px',
    },
  },
};

export default Radium(FeaturesItem);