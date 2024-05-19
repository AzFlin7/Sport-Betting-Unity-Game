import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import {Link} from 'found'

import Header from '../common/Header/Header';
import Footer from '../common/Footer/Footer';
import localizations from '../Localizations';
import { colors } from '../../theme';

import Radium from 'radium';

let styles;

class Contact extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      language: localizations.getLanguage(),
    };
  }

  _setLanguage = language => {
    this.setState({ language });
  };

  render() {
    const { viewer } = this.props;
    return (
      <div>
        <div style={styles.bodyContainer}>
          <div style={styles.header}>{localizations.contactUs_header}</div>
          <p style={{ marginBottom: 20 }}>
            {localizations.contactUs_intro_text} :
          </p>
          <p style={{ fontWeight: 'bold', marginBottom: 20 }}>
            {localizations.contactUs_email_text} :{' '}
            <Link to={localizations.contactUs_email}>
              {localizations.contactUs_email}
            </Link>
          </p>
          <p style={{ marginBottom: 20 }}>
            <span style={{ fontWeight: 'bold' }}>
              {localizations.contactUs_phoneNumber_text} :{' '}
            </span>{' '}
            {localizations.contactUs_phoneNumber}
          </p>
          <p style={{ fontWeight: 'bold', marginBottom: 5 }}>
            {localizations.contactUs_address_text} :
          </p>
          <p>{localizations.contactUs_address_line_1}</p>
          <p>{localizations.contactUs_address_line_2}</p>
          <p>{localizations.contactUs_address_line_3}</p>
          <p>{localizations.contactUs_address_line_4}</p>
        </div>
      </div>
    );
  }
}

styles = {
  bodyContainer: {
    width: 1000,
    fontFamily: 'Lato',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.4)',
    fontSize: 16,
    margin: 'auto',
    marginTop: 20,
    marginBottom: 20,
    padding: 40,
    color: colors.black,
    '@media (max-width: 960px)': {
      width: 'calc(100% - 15px)',
      padding: 20,
    },
  },
  header: {
    width: '100%',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 10,
    '@media (max-width: 960px)': {
      width: 'calc(100% - 15px)',
      marginBottom: 10,
    },
  },
  sectionHeader1: {
    width: '100%',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
    marginTop: 30,
  },
  sectionHeader2: {
    width: '100%',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'left',
    marginTop: 30,
    marginLeft: 20,
  },
  content: {
    fontSize: 16,
    lineHeight: '28px',
    marginTop: 22,
  },
  list: {
    listStyle: 'circle outside',
  },
  bold: {
    fontWeight: 'bold',
  },
  questionList: {
    marginBottom: 40,
  },
  question: {
    listStyleType: 'circle',
  },
};

export default createFragmentContainer(Radium(Contact), {
  viewer: graphql`
    fragment Contact_viewer on Viewer {
      id
    }
  `,
});
