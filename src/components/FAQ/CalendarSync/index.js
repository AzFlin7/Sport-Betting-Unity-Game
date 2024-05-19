import React, { Component } from 'react';
import {createFragmentContainer, graphql} from 'react-relay';
import { Link } from 'found'

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
                    <div style={styles.sectionIntro}>
                        {localizations.faq_calendar_sync_intro}
                    </div>
                    <div style={styles.row}>
                        <div style={styles.column}>
                            <img style={styles.image} src="/images/faq/calendar-sync/google-agenda-1.jpg"/>
                            <span style={styles.imageNote}>{localizations.faq_calendar_sync_note_image1}</span>
                        </div>
                        <div style={styles.column}>
                            <img style={styles.image} src="/images/faq/calendar-sync/google-agenda-2.jpg"/>
                            <span style={styles.imageNote}>{localizations.faq_calendar_sync_note_image2}</span>                            
                        </div>
                    </div>
                    <div style={styles.paragraph}>
                        {localizations.faq_calendar_sync_section1}
                    </div>
                    <div style={styles.secondRow}>
                        <div style={styles.column}>
                            <img style={styles.image} src="/images/faq/calendar-sync/google-agenda-3.jpg"/>
                        </div>
                        <div style={styles.biggerColumn}>
                            <img style={styles.image} src="/images/faq/calendar-sync/google-agenda-3-1.jpg"/>
                        </div>
                    </div>
                    <div style={styles.paragraph}>
                        {localizations.faq_calendar_sync_section2}
                        <img style={styles.image} src="/images/faq/calendar-sync/google-agenda-4.jpg"/>
                    </div>
                    <div style={{...styles.cautionText, ...styles.paragraph}}>
                        {localizations.faq_calendar_sync_caution}
                    </div>
                    <div style={styles.paragraph}>
                        <span>{localizations.faq_calendar_sync_section3}</span>
                        <span style={styles.redText}>{localizations.faq_calendar_sync_section3_red}</span>
                        <span style={{...styles.redText, ...styles.underlinedText}}>{localizations.faq_calendar_sync_section3_red_underlined}</span>
                        <br/>
                        <p><Link to="/faq/calendar-sync/google-calendar">{localizations.faq_calendar_sync_section3_google_link_label}</Link></p>
                        <p><Link to="/faq/calendar-sync/outlook-calendar">{localizations.faq_calendar_sync_section3_outlook_link_label}</Link></p>
                        <p><Link to="/faq/calendar-sync/apple-calendar">{localizations.faq_calendar_sync_section3_ical_link_label}</Link></p>
                        <p style={styles.importantNote}>{localizations.faq_calendar_sync_section3_note}</p>
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
      fragment CalendarSync_viewer on Viewer {
        id
        me {
          id
          pseudo          
        }
      }
    `,
  },
);


