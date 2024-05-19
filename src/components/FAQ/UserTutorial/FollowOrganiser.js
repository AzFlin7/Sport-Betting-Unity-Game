import React, { Component } from 'react';
import {createFragmentContainer, graphql} from 'react-relay';

import Header from '../../common/Header/Header.js'
import Footer from '../../common/Footer/Footer'
import Loading from '../../common/Loading/Loading'
import localizations from '../../Localizations'

import Radium from 'radium';
import styles from './styles';


class FollowOrganiser extends Component {
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
                {localizations.faq_tutorial_follow_organiser_title}
            </div>
            <div style={styles.body}>
                <div style={styles.sectionTitle}>
                    {localizations.faq_tutorial_follow_organiser_subtitle}
                </div>
                <div style={styles.sectionContent}>
                    <div style={styles.paragraph}>
                        <span>{localizations.faq_tutorial_follow_organiser_section1_text}</span>
                        <span style={styles.rowNoteTop}>{localizations.faq_tutorial_follow_organiser_section1_note}</span>
                        <div style={styles.row}>
                            <div style={styles.column}>
                                <img style={styles.image} src="/images/faq/user-tutorial/follow-organiser-1.png"/>
                            </div>
                            <div style={styles.column}>
                                <img style={styles.image} src="/images/faq/user-tutorial/follow-organiser-2.png"/>
                            </div>
                            <div style={styles.column}>
                                <img style={styles.image} src="/images/faq/user-tutorial/follow-organiser-3.png"/>
                            </div>

                        </div>
                    </div>
                </div>
                <div style={styles.sectionContent}>
                    <div style={styles.paragraph}>
                        <span>{localizations.faq_tutorial_follow_organiser_section2_text}</span>
                      <div style={styles.row}>
                          <div style={styles.column}>
                        <img style={styles.image} src="/images/faq/user-tutorial/follow-organiser-4.png"/>
                          </div>
                      </div>
                        <span style={styles.rowNote}>{localizations.faq_tutorial_follow_organiser_section2_note}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

    );
  }
}

export default createFragmentContainer(Radium(FollowOrganiser), {
  viewer: graphql`
    fragment FollowOrganiser_viewer on Viewer {
      id
      me {
        id
        pseudo
      }
    }
  `,
});