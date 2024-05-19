import React, { Component } from 'react';
import {createFragmentContainer, graphql} from 'react-relay';

import Header from '../../common/Header/Header.js'
import Footer from '../../common/Footer/Footer'
import Loading from '../../common/Loading/Loading'
import localizations from '../../Localizations'

import Radium from 'radium';
import styles from './styles';


class OrganizeSportActivities extends Component {
  constructor(props) {
    super(props)
    this.state = {
      language: localizations.getLanguage(),
    }
  }

  _setLanguage = (language) => {
    this.setState({ language: language })
  }

  render() {
    const { viewer } = this.props

    return (
      <div style={styles.container}>
        <div style={styles.content}>
            <div style={styles.title}>
                {localizations.faq_organize_sport_activities_tutorial_title}
            </div>
            <div style={styles.body}>
                <div style={styles.sectionTitle}>
                    {localizations.faq_organize_sport_activities_tutorial_subtitle}
                </div>
                <div style={styles.sectionContent}>
                    <div style={styles.paragraph}>
                        <span>{localizations.faq_organize_sport_activities_tutorial_section1_text}</span>
                        <span style={styles.rowNoteTop}>{localizations.faq_organize_sport_activities_tutorial_section1_note}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

    );
  }
}


export default createFragmentContainer(Radium(OrganizeSportActivities), {
  viewer: graphql`
    fragment OrganizeSportActivities_viewer on Viewer {
      id
      me {
        id
        pseudo
      }
    }
  `,
});
