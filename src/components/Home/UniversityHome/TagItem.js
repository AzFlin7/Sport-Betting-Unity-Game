import React, { Component } from 'react';

import colors from '../../../theme/colors';

import Radium from 'radium'
import localizations from "../../Localizations";

let styles ;
class TagItem extends Component {

  _handleClick = (event) => {
    if (this.props.onClickGoTo) 
      this.prosp.router.push(this.props.link)
  }

  render() {
    const {icon, title, descr, image, id} = this.props;

    let container = (id % 2 === 1) ? {...styles.container, flexDirection: 'row-reverse'} : {...styles.container, backgroundColor: '#f6f6fe'} ;
    let titleContainer =  styles.titleContainer ;

    return (
      <div style={container}>
        <div style={styles.textContainer}>
          <div style={titleContainer}>
            <img src={icon} style={styles.icon}/>
            <p style={styles.title}>
              {title}
            </p>
          </div>
          <ul style={{textAlign: 'center'}}>
            {descr && descr.map((text, index) =>
              <li key={index} style={styles.text}>{text}</li>
            )}
          </ul>
          { this.props.link &&
            <div style={styles.seeMoreButton} onClick={this._handleClick}>
              {localizations.home_seeMore}
            </div>
          }
        </div>
        <img src={image} style={styles.image}/>
      </div>);
  }
}

styles = {
  container: {
    display: 'flex',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingBottom: 40,
    '@media (max-width: 425px)': {
      flexDirection: 'column'
    }
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 10,
    margin: 10,
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    textAlign: 'center',
    '@media (max-width: 830px)': {
      flexDirection: 'column'
    },
  },
  icon: {
    width: 100,
    height: 100,
    margin: -10,
    '@media (max-width: 425px)': {
      width: 75,
      height: 75,
    }
  },
  title: {
    fontFamily: 'Lato',
    fontSize: '26px',
    fontWeight: 'bold',
    color: colors.darkGray,
    '@media (max-width: 600px)': {
      fontSize: '18px',
    },
  },
  text: {
    fontFamily: 'Lato',
    fontSize: '18px',
    marginBottom: 10,
    '@media (max-width: 600px)': {
      fontSize: '14px',
    },
  },
  image: {
    width: '50%',
    '@media (minWidth: 768px)': {
    //  width: 384,
    }
  },
  seeMoreButton: {
    border: '1px solid #000',
    width: '50%',
    alignSelf: 'center',
    color: colors.blue,
    padding: 10,
    marginTop: 20,
    textAlign: 'center',
    fontFamily: 'Lato',
    fontSize: '18px',
    cursor: 'pointer',
    '@media (max-width: 600px)': {
      fontSize: '14px',
    },
  },
};

export default Radium(TagItem);