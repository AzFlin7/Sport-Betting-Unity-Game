import React, { Component } from 'react';
import Scroll from 'react-scroll'
let scroller = Scroll.scroller;

import colors from '../../../theme/colors';

import Radium from 'radium'
import localizations from "../../Localizations";

let styles ;
class TagItem extends Component {

  _handleClick = (event) => {
    let link = this.props.onClickGoTo.split('#');
    if (link.length > 1){
      scroller.scrollTo(link[1], {
        duration: 1500,
        delay: 100,
        smooth: true,
        offset: -50,
      })
    }
  };

  render() {
    const { image, Title, descr1, descr2, descr3, color } = this.props ;
    let containerStyle = {
      ...styles.container
    };

    let separator = {...styles.separator, backgroundColor: color};
    let headingText = {...styles.headingText, color: color};
    let seeMoreButton = {...styles.seeMoreButton, border: '1px solid' + color};
    let linkTo = (this.props.onClickGoTo) ? this.props.onClickGoTo.split('#')[0] : null;

    return  (
      <div style={containerStyle}>
        <img style={styles.tagItemImage} src={image} onClick={this._handleClick}/>
        <h3 style={headingText}>{Title}</h3>
        <p style={styles.tagItemText}>
          {descr1}
        </p>
        <i style={separator}/>
        <p style={styles.tagItemText}>
          {descr2}
        </p>
        <i style={separator}/>
        <p style={styles.tagItemText}>
          {descr3}
        </p>
        {this.props.onClickGoTo 
        ? linkTo !== '' ?
            <a href={linkTo} style={{...seeMoreButton, ':hover': {color: colors.white, backgroundColor: color}} } onClick={this._handleClick}>
              {localizations.home_seeMore}
            </a>
            :
            <div style={{...seeMoreButton, ':hover': {color: colors.white, backgroundColor: color}} } onClick={this._handleClick}>
              {localizations.home_seeMore}
            </div>
        : <div style={{height: 38, marginTop: 20}}/>
        }
      </div>
    );
  }
}

styles = {
  container: {
    // height: '312px',
    width: '229px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
    margin: '10px',
    '@media (max-width: 600px)': {
      width: '190px',
      margin: '10px 10px',
    },
    '@media (max-width: 480px)': {
      width: '290px',
      margin: '10px auto',
    }
  },
  seeMoreButton: {
    width: '75%',
    padding: 10,
    marginTop: 20,
    textAlign: 'center',
    fontFamily: 'Lato',
    fontSize: '16px',
    cursor: 'pointer',
    borderRadius: 5, 
    color: colors.darkGray,
    textDecoration: 'none',
    transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
    '@media (max-width: 600px)': {
      fontSize: '14px',
    },
  },
  separator: {
    height: 1,
    width: '10%',
    marginTop: 10,
  },
  tagItemImage: {
    width: '100px',
    height: '100px',
    marginBottom: 10,
    fontFamily: 'FontAwesome',
    fontSize: '50px',
    textAlign: 'center',
    lineHeight: '50px',
    color: '#fff',
    // color: '#FFFFFF',
  },
  headingText: {
    // width: '160px',
    fontFamily: 'Lato',
    fontSize: '18px',
    fontWeight: '600',
    textAlign: 'center',
    color: 'rgba(0,0,0,0.65)',
    marginBottom: 10,
    '@media (max-width: 600px)': {
      fontSize: '16px',
    },
  },
  tagItemText: {
    // width: '229px',
    // height: '150px',
    textAlign: 'center',
    fontFamily: 'Lato',
    fontSize: '16px',
    // textAlign: 'center',
    lineHeight: '20px',
    color: 'rgba(0,0,0,0.44)',
    alignSelf: 'flex-end',
    marginTop: '10px',
    width: '100%',
    '@media (max-width: 600px)': {
      fontSize: '14px',
      lineHeight: '20px',
    },
    '@media (max-width: 480px)': {
      marginBottom: '20',
      fontSize: '14px',
      lineHeight: '20px',
    },
  },
};

export default Radium(TagItem);