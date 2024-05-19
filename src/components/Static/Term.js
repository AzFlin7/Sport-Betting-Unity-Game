import React, { Component } from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import Radium from 'radium';

import Header from '../common/Header/Header';
import Footer from '../common/Footer/Footer';
import localizations from '../Localizations';
import { colors } from '../../theme';

let styles;

class Term extends Component {
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
          <div style={styles.header}>{localizations.term_header}</div>
          <div style={styles.sectionHeader1}>
            {localizations.term_lastUpdate}
          </div>
          <div style={styles.content}>{localizations.term_content1}</div>
          <div style={styles.content}>{localizations.term_content2}</div>
          <div style={styles.content}>{localizations.term_content3}</div>

          <div style={styles.sectionHeader1}>
            {localizations.term_point1Title}
          </div>
          <div style={styles.content}>{localizations.term_point1Content1}</div>
          <div style={styles.content}>{localizations.term_point1Content2}</div>

          <div style={styles.sectionHeader1}>
            {localizations.term_point2Title}
          </div>
          <div style={styles.content}>{localizations.term_point2Content}</div>

          <div style={styles.sectionHeader1}>
            {localizations.term_point3Title}
          </div>
          <div style={styles.content}>{localizations.term_point3Content1}</div>
          <div style={styles.content}>{localizations.term_point3Content2}</div>
          <div style={styles.content}>
            <ul style={styles.list}>
              <li>{localizations.term_point3Content3a}</li>
              <li>{localizations.term_point3Content3b}</li>
              <li>{localizations.term_point3Content3c}</li>
              <li>{localizations.term_point3Content3d}</li>
            </ul>
          </div>
          <div style={styles.content}>{localizations.term_point3Content4}</div>
          <div style={styles.content}>{localizations.term_point3Content5}</div>

          <div style={styles.content}>{localizations.term_point3Content6}</div>
          <div style={styles.content}>
            <ul style={styles.list}>
              <li>{localizations.term_point3Content6a}</li>
              <li>{localizations.term_point3Content6b}</li>
              <li>{localizations.term_point3Content6c}</li>
              <li>{localizations.term_point3Content6d}</li>
              <li>{localizations.term_point3Content6e}</li>
            </ul>
          </div>

          <div style={styles.sectionHeader1}>
            {localizations.term_point4Title}
          </div>
          <div style={styles.content}>{localizations.term_point4Content1}</div>
          <div style={styles.content}>{localizations.term_point4Content2}</div>

          <div style={styles.sectionHeader1}>
            {localizations.term_point5Title}
          </div>
          <div style={styles.sectionHeader2}>
            {localizations.term_point5Sub1Title}
          </div>
          <div style={styles.content}>
            {localizations.term_point5Sub1Content}
          </div>
          <div style={styles.sectionHeader2}>
            {localizations.term_point5Sub2Title}
          </div>
          <div style={styles.content}>
            {localizations.term_point5Sub2Content}
          </div>
          <div style={styles.sectionHeader2}>
            {localizations.term_point5Sub3Title}
          </div>
          <div style={styles.content}>
            {localizations.term_point5Sub3Content1}
          </div>
          <div style={styles.content}>
            <a href={localizations.term_point5Sub3Content2}>
              {localizations.term_point5Sub3Content2}
            </a>
          </div>

          <div style={styles.sectionHeader1}>
            {localizations.term_point6Title}
          </div>
          <div style={styles.content}>{localizations.term_point6Content1}</div>
          <div style={styles.content}>{localizations.term_point6Content2}</div>
          <div style={styles.content}>{localizations.term_point6Content3}</div>

          <div style={styles.sectionHeader1}>
            {localizations.term_point7Title}
          </div>
          <div style={styles.content}>{localizations.term_point7Content1}</div>
          <div style={styles.contentItalic}>
            {localizations.term_point7Content2a}
            <br />
            {localizations.term_point7Content2b}
            <br />
            {localizations.term_point7Content2c}
            <br />
            {localizations.term_point7Content2d}
          </div>
          <div style={styles.content}>{localizations.term_point7Content3}</div>

          <div style={styles.sectionHeader1}>
            {localizations.term_point8Title}
          </div>
          <div style={styles.content}>{localizations.term_point8Content1}</div>
          <div style={styles.content}>{localizations.term_point8Content2}</div>

          <div style={styles.sectionHeader1}>
            {localizations.term_point9Title}
          </div>
          <div style={styles.content}>{localizations.term_point9Content}</div>

          <div style={styles.sectionHeader1}>
            {localizations.term_point10Title}
          </div>
          <div style={styles.content}>
            {localizations.term_point10Content1}
          </div>
          <div style={styles.content}>
            {localizations.term_point10Content2}
          </div>
          <div style={styles.content}>
            <ul style={styles.list}>
              <li>{localizations.term_point10Content3a}</li>
              <li>{localizations.term_point10Content3b}</li>
              <li>{localizations.term_point10Content3c}</li>
              <li>{localizations.term_point10Content3d}</li>
              <li>{localizations.term_point10Content3e}</li>
              <li>{localizations.term_point10Content3f}</li>
              <li>{localizations.term_point10Content3g}</li>
              <li>{localizations.term_point10Content3h}</li>
              <li>{localizations.term_point10Content3i}</li>
            </ul>
          </div>
          <div style={styles.content}>
            {localizations.term_point10Content4}
          </div>

          <div style={styles.sectionHeader1}>
            {localizations.term_point11Title}
          </div>
          <div style={styles.content}>
            {localizations.term_point11Content1}
          </div>
          <div style={styles.content}>
            {localizations.term_point11Content2}
          </div>

          <div style={styles.sectionHeader1}>
            {localizations.term_point12Title}
          </div>
          <div style={styles.content}>
            {localizations.term_point12Content1}
          </div>
          <div style={styles.content}>
            <ul style={styles.list}>
              <li>{localizations.term_point12Content2a}</li>
              <li>{localizations.term_point12Content2b}</li>
              <li>{localizations.term_point12Content2c}</li>
              <li>{localizations.term_point12Content2d}</li>
              <li>{localizations.term_point12Content2e}</li>
              <li>{localizations.term_point12Content2f}</li>
              <li>{localizations.term_point12Content2g}</li>
              <li>{localizations.term_point12Content2h}</li>
              <li>{localizations.term_point12Content2i}</li>
            </ul>
          </div>

          <div style={styles.sectionHeader1}>
            {localizations.term_point13Title}
          </div>
          <div style={styles.content}>
            {localizations.term_point13Content1}
          </div>
          <div style={styles.content}>
            <ul style={styles.list}>
              <li>{localizations.term_point13Content2a}</li>
              <li>{localizations.term_point13Content2b}</li>
            </ul>
          </div>
          <div style={styles.content}>
            {localizations.term_point13Content3}
          </div>
          <div style={styles.content}>
            {localizations.term_point13Content4}
          </div>
          <div style={styles.content}>
            {localizations.term_point13Content5}
          </div>
          <div style={styles.content}>
            <ul style={styles.list}>
              <li>{localizations.term_point13Content6a}</li>
              <li>{localizations.term_point13Content6b}</li>
              <li>{localizations.term_point13Content6c}</li>
              <li>{localizations.term_point13Content6d}</li>
              <li>{localizations.term_point13Content6e}</li>
              <li>{localizations.term_point13Content6f}</li>
              <li>{localizations.term_point13Content6g}</li>
            </ul>
          </div>
          <div style={styles.content}>
            {localizations.term_point13Content7}
          </div>

          <div style={styles.sectionHeader1}>
            {localizations.term_point14Title}
          </div>
          <div style={styles.content}>{localizations.term_point14Content}</div>

          <div style={styles.sectionHeader1}>
            {localizations.term_point15Title}
          </div>
          <div style={styles.content}>{localizations.term_point15Content}</div>

          <div style={styles.sectionHeader1}>
            {localizations.term_point16Title}
          </div>
          <div style={styles.contentBold}>
            {localizations.term_point16Content1}
          </div>
          <div style={styles.contentBold}>
            {localizations.term_point16Content2}
          </div>

          <div style={styles.sectionHeader1}>
            {localizations.term_point17Title}
          </div>
          <div style={styles.contentBold}>
            {localizations.term_point17Content1}
          </div>
          <div style={styles.contentBold}>
            {localizations.term_point17Content2}
          </div>
          <div style={styles.contentBold}>
            {localizations.term_point17Content3}
          </div>

          <div style={styles.sectionHeader1}>
            {localizations.term_point18Title}
          </div>
          <div style={styles.content}>{localizations.term_point18Content}</div>

          <div style={styles.sectionHeader1}>
            {localizations.term_point19Title}
          </div>
          <div style={styles.content}>{localizations.term_point19Content}</div>

          <div style={styles.sectionHeader1}>
            {localizations.term_point20Title}
          </div>
          <div style={styles.content}>{localizations.term_point20Content}</div>

          <div style={styles.sectionHeader1}>
            {localizations.term_point21Title}
          </div>
          <div style={styles.content}>{localizations.term_point21Content}</div>

          <div style={styles.sectionHeader1}>
            {localizations.term_point22Title}
          </div>
          <div style={styles.content}>{localizations.term_point22Content}</div>

          <div style={styles.sectionHeader1}>
            {localizations.term_point23Title}
          </div>
          <div style={styles.content}>{localizations.term_point23Content}</div>

          <div style={styles.sectionHeader1}>
            {localizations.term_point24Title}
          </div>
          <div style={styles.content}>{localizations.term_point24Content}</div>
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
    margin: '20px auto',
    padding: 40,
    color: colors.black,
    '@media (maxWidth: 960px)': {
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
  },
  content: {
    fontSize: 16,
    lineHeight: '28px',
    marginTop: 22,
  },
  contentBold: {
    fontSize: 16,
    lineHeight: '28px',
    marginTop: 22,
    fontWeight: 'bold',
  },
  contentItalic: {
    fontSize: 16,
    lineHeight: '28px',
    marginTop: 22,
    fontStyle: 'italic',
  },
  list: {
    listStyle: 'circle outside',
    paddingLeft: 30,
  },
  bold: {
    fontWeight: 'bold',
  },
};

export default createFragmentContainer(Radium(Term), {
  viewer: graphql`
    fragment Term_viewer on Viewer {
      id
    }
  `,
});
