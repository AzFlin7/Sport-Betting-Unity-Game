import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import localizations from '../Localizations';
import { withAlert } from 'react-alert';

import { colors, metrics } from '../../theme';
import { Link } from 'found';

let styles;
const propTypes = {
  viewer: PropTypes.object.isRequired,
};

class HeaderImage extends Component {
  constructor() {
    super();
    this.alertOptions = {
      offset: 60,
      position: 'top right',
      theme: 'light',
      transition: 'fade',
      type: 'success',
    };
  }

  handleClick = () => {
    this.props.alert.show(localizations.home_alreadyConnect, {
      timeout: 2000,
      type: 'error',
    });
  };

  render() {
    const { viewer } = this.props;
    return (
      <div style={styles.containerHeaderImage}>
        <div style={styles.containerFilter}>
          <p style={styles.headingText}>{localizations.aboutUs_header}</p>
          <div style={styles.row}>
            <Link style={styles.box} to="/faq/tutorial">
              <img
                src="/images/AboutUs/tutorial-01.png"
                style={styles.bgIcon}
                alt=""
              />
              <h1
                style={{
                  fontSize: 26,
                  fontWeight: metrics.border.large,
                  color: '#fdd000',
                }}
              >
                {localizations.aboutUs_aboutUs_title}
              </h1>
              <p
                style={{
                  fontSize: 20,
                  margin: 10,
                  textAlign: 'center',
                  color: colors.white,
                }}
              >
                {localizations.aboutUs_aboutUs_text}
              </p>
            </Link>
            <a style={styles.box} href="mailto://info@sportunity.ch">
              <img
                src="/images/AboutUs/contact-01.png"
                style={styles.bgIcon}
                alt=""
              />
              <h1
                style={{
                  fontSize: 26,
                  fontWeight: metrics.border.large,
                  color: '#fc5d5a',
                }}
              >
                {localizations.aboutUs_contactUs_title}
              </h1>
              <div style={styles.contactInfo}>
                <img
                  src="/images/AboutUs/swiss.png"
                  style={styles.smIcon}
                  alt=""
                />
                {localizations.contactUs_phoneNumber}
              </div>
              <div style={styles.contactInfo}>
                <img
                  src="/images/AboutUs/france.png"
                  style={styles.smIcon}
                  alt=""
                />
                {localizations.contactUs_phoneNumber_FR}
              </div>
              <div style={styles.contactInfo}>
                <img
                  src="/images/AboutUs/mail-01.png"
                  style={styles.smIcon}
                  alt=""
                />
                {localizations.contactUs_email}
              </div>
            </a>
          </div>
          <div style={styles.containerButton} key="searchButton">
            {viewer && !viewer.me ? (
              <Link to="/register" style={styles.searchButton}>
                <p style={styles.inputSearch}>
                  {localizations.home_createAccount}
                </p>
              </Link>
            ) : (
              <button style={styles.searchButton} onClick={this.handleClick}>
                <p style={styles.inputSearch}>
                  {localizations.home_createAccount}
                </p>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}

styles = {
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    margin: 20,
    fontFamily: 'lato',
  },
  bgIcon: {
    width: 100,
    margin: 10,
  },
  smIcon: {
    width: 30,
    margin: 10,
  },
  containerButton: {
    height: '60px',
    boxShadow: '0 0 6px 0 rgba(0,0,0,0.5)',
    borderRadius: '10px',
    marginTop: 10,
    justifyContent: 'flex-end',
    '@media (maxWidth: 610px)': {
      display: 'block',
      top: 320,
    },
    transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
    ':hover': {
      transform: 'scale(1.05)',
      boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    },
  },
  box: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#0005',
    borderRadius: 20,
    width: 400,
    height: 300,
    alignItems: 'center',
    textDecoration: 'none',
  },
  containerFilter: {
    height: '100%',
    backgroundSize: 'cover',
    backgroundColor: '#00000033',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '25px 80px 25px 80px',
    '@media only screen and (maxWidth : 850px)': {
      padding: '25px 25px 25px 25px',
    },
  },
  containerHeaderImage: {
    width: '100%',
    backgroundImage: 'url("/images/AboutUs/background.png")',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },
  headingText: {
    fontFamily: 'Lato',
    fontSize: '36px',
    lineHeight: '52px',
    color: colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
    '@media (maxWidth: 1280px)': {
      fontSize: '34px',
    },
    '@media (maxWidth: 978px)': {
      fontSize: '32px',
    },
    '@media (maxWidth: 768px)': {
      fontSize: '26px',
      lineHeight: '44px',
    },
    '@media (maxWidth: 425px)': {
      fontSize: '22px',
      lineHeight: '30px',
    },
  },
  inputSearch: {
    fontFamily: 'Lato',
    fontSize: '18px',
    display: 'inline',
    padding: '5px 20px',
    color: colors.white,
    '@media (maxWidth: 425px)': {
      fontSize: '16px',
    },
  },
  playButton: {
    cursor: 'pointer',
    fontSize: '15px',
    height: 70,
    width: 70,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    backgroundColor: 'rgba(25, 25, 25, 0.95)',
    color: colors.white,
    transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
    opacity: 0.9,
    marginTop: 70,
    ':hover': {
      opacity: 1,
      transform: 'scale(1.1)',
      boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    },
    '@media (maxWidth: 850px)': {
    },
  },
  playIcon: {
    marginLeft: 4,
  },
  searchButton: {
    height: '100%',
    backgroundColor: colors.blue,
    boxSizing: 'border-box',
    paddingRight: 10,
    paddingLeft: 10,
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  contactInfo: {
    fontSize: 20,
    color: colors.white,
    display: 'flex',
    alignItems: 'center',
  },
};
HeaderImage.propTypes = propTypes;

export default createFragmentContainer(Radium(withAlert(HeaderImage)), {
  viewer: graphql`
    fragment HeaderAboutUsImage_viewer on Viewer {
      id
      me {
        id
      }
    }
  `,
});
