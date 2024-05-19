import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';

import Header from '../common/Header/Header';
import Footer from '../common/Footer/Footer';
import localizations from '../Localizations';
import { colors } from '../../theme';

import Radium from 'radium';

let styles;

class Privacy extends React.Component {
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
          <div style={styles.header}>{localizations.privacy_header}</div>
          <div style={styles.sectionHeader1}>
            {localizations.privacy_lastUpdate}
          </div>
          <div style={styles.sectionHeader1}>
            {localizations.privacy_aboutUsTitle}
          </div>
          <div style={styles.content}>
            {localizations.privacy_aboutUsContent}
          </div>
          <div style={styles.sectionHeader1}>
            {localizations.privacy_collectionTitle}
          </div>
          <div style={styles.sectionHeader2}>
            {localizations.privacy_informationTitle}
          </div>
          <div style={styles.content}>
            {localizations.privacy_informationContent}
          </div>
          <div style={styles.content}>
            <ul style={styles.list}>
              <li>
                <span style={styles.bold}>
                  {localizations.privacy_infoOption1Title}
                </span>
                {localizations.privacy_infoOption1Text}
              </li>
              <li>
                <span style={styles.bold}>
                  {localizations.privacy_infoOption2Title}
                </span>
                {localizations.privacy_infoOption2Text}
              </li>
              <li>
                <span style={styles.bold}>
                  {localizations.privacy_infoOption3Title}
                </span>
                {localizations.privacy_infoOption3Text}
              </li>
              <li>
                <span style={styles.bold}>
                  {localizations.privacy_infoOption4Title}
                </span>
                {localizations.privacy_infoOption4Text}
              </li>
              <li>
                <span style={styles.bold}>
                  {localizations.privacy_infoOption5Title}
                </span>
                {localizations.privacy_infoOption5Text}
              </li>
            </ul>
          </div>

          <div style={styles.sectionHeader2}>
            {localizations.privacy_collectTitle}
          </div>
          <div style={styles.content}>
            {localizations.privacy_collectContent}
          </div>
          <div style={styles.content}>
            <ul style={styles.list}>
              <li>
                <span style={styles.bold}>
                  {localizations.privacy_collectList1Title}
                </span>
                {localizations.privacy_collectList1Text}
              </li>
              <li>
                <span style={styles.bold}>
                  {localizations.privacy_collectList2Title}
                </span>
                {localizations.privacy_collectList2Text}
              </li>
              <li>
                <span style={styles.bold}>
                  {localizations.privacy_collectList3Title}
                </span>
                {localizations.privacy_collectList3Text}
              </li>
              <li>
                <span style={styles.bold}>
                  {localizations.privacy_collectList4Title}
                </span>
                {localizations.privacy_collectList4Text}
              </li>
            </ul>
          </div>

          <div style={styles.sectionHeader2}>
            {localizations.privacy_InfoOtherSourceTitle}
          </div>
          <div style={styles.content}>
            {localizations.privacy_InfoOtherSourceContent}
          </div>

          <div style={styles.sectionHeader1}>
            {localizations.privacy_useInfoTitle}
          </div>
          <div style={styles.content}>
            {localizations.privacy_useInfoContent}
          </div>
          <div style={styles.content}>
            <ul style={styles.list}>
              <li>{localizations.privacy_useInfoList1}</li>
              <li>{localizations.privacy_useInfoList2}</li>
              <li>{localizations.privacy_useInfoList3}</li>
              <li>{localizations.privacy_useInfoList4}</li>
              <li>{localizations.privacy_useInfoList5}</li>
              <li>{localizations.privacy_useInfoList6}</li>
              <li>{localizations.privacy_useInfoList7}</li>
              <li>{localizations.privacy_useInfoList8}</li>
              <li>{localizations.privacy_useInfoList9}</li>
              <li>{localizations.privacy_useInfoList10}</li>
              <li>{localizations.privacy_useInfoList11}</li>
              <li>{localizations.privacy_useInfoList12}</li>
            </ul>
          </div>

          <div style={styles.sectionHeader1}>
            {localizations.privacy_sharingTitle}
          </div>
          <div style={styles.content}>
            {localizations.privacy_sharingContent}
          </div>
          <div style={styles.content}>
            <ul style={styles.list}>
              <li>{localizations.privacy_sharingList1}</li>
              <li>{localizations.privacy_sharingList2}</li>
              <li>{localizations.privacy_sharingList3}</li>
              <li>{localizations.privacy_sharingList4}</li>
              <li>{localizations.privacy_sharingList5}</li>
              <li>{localizations.privacy_sharingList6}</li>
              <li>{localizations.privacy_sharingList7}</li>
            </ul>
          </div>
          <div style={styles.content}>
            {localizations.privacy_sharingFooter}
          </div>

          <div style={styles.sectionHeader1}>
            {localizations.privacy_socialTitle}
          </div>
          <div style={styles.content}>
            {localizations.privacy_socialContent}
          </div>
          <div style={styles.sectionHeader1}>
            {localizations.privacy_advertTitle}
          </div>
          <div style={styles.content}>
            {localizations.privacy_advertContent}
          </div>

          <div style={styles.sectionHeader1}>
            {localizations.privacy_choiceTitle}
          </div>
          <div style={styles.sectionHeader2}>
            {localizations.privacy_accountInfoTitle}
          </div>
          <div style={styles.content}>
            {localizations.privacy_accountInfoContent}
          </div>
          <div style={styles.sectionHeader2}>
            {localizations.privacy_locationTitle}
          </div>
          <div style={styles.content}>
            {localizations.privacy_locationContent}
          </div>
          <div style={styles.sectionHeader2}>
            {localizations.privacy_cookiesWebTitle}
          </div>
          <div style={styles.content}>
            {localizations.privacy_cookiesWebContent}
          </div>

          <div style={styles.sectionHeader1}>
            {localizations.privacy_promoTitle}
          </div>
          <div style={styles.content}>
            {localizations.privacy_promoContent}
          </div>
          <div style={styles.sectionHeader2}>
            {localizations.privacy_pushTitle}
          </div>
          <div style={styles.content}>{localizations.privacy_pushContent}</div>

          <div style={styles.sectionHeader1}>
            {localizations.privacy_transferTitle}
          </div>
          <div style={styles.content}>
            {localizations.privacy_transferContent}
          </div>
          <div style={styles.sectionHeader1}>
            {localizations.privacy_cookiesTitle}
          </div>
          <div style={styles.content}>
            {localizations.privacy_cookiesContent}
          </div>
          <div style={styles.sectionHeader1}>
            {localizations.privacy_securityTitle}
          </div>
          <div style={styles.content}>
            {localizations.privacy_securityContent}
          </div>
          <div style={styles.sectionHeader1}>
            {localizations.privacy_personalTitle}
          </div>
          <div style={styles.content}>
            {localizations.privacy_personalContent}
          </div>
          <div style={styles.sectionHeader1}>
            {localizations.privacy_accuracyTitle}
          </div>
          <div style={styles.content}>
            {localizations.privacy_accuracyContent}
          </div>
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
};

export default createFragmentContainer(Radium(Privacy), {
  viewer: graphql`
    fragment Privacy_viewer on Viewer {
      id
    }
  `,
});
