import React, { Component } from 'react';
import {createFragmentContainer, graphql} from 'react-relay';

import Header from '../../common/Header/Header.js'
import Footer from '../../common/Footer/Footer'
import Loading from '../../common/Loading/Loading'
import localizations from '../../Localizations'

import Radium from 'radium';
import styles from './styles';


class CalendarSync extends Component {
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
                {localizations.faq_calendar_sync_title}
            </div>
            <div style={styles.body}>
                <div style={styles.sectionTitle}>
                    {localizations.faq_calendar_sync_subtitle}
                </div>
                <div style={styles.sectionContent}>
                    <div style={styles.paragraph}>
                        <div style={styles.sectionSubTitle}>
                            {localizations.faq_calendar_sync_google_section_title}
                        </div>
                        <span>{localizations.faq_calendar_sync_google_section_text1}</span>
                        <a target="_blank" href="https://calendar.google.com">https://calendar.google.com</a>
                        <span>{localizations.faq_calendar_sync_google_section_text2}</span>
                        <img style={styles.image} src="/images/faq/calendar-sync/google-agenda-5.jpg"/>
                    </div>
                </div>
            </div>
        </div>
      </div>
      
    );
  }
}

export default createFragmentContainer(Radium(CalendarSync), {
    viewer: graphql`
      fragment GoogleCalendarSync_viewer on Viewer {
        id
        me {
          id
          pseudo          
        }
      }
    `,
  },
);