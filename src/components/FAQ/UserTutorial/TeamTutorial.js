import React, { Component } from 'react';
import {createFragmentContainer, graphql} from 'react-relay';
import { Link } from 'found'

import Header from '../../common/Header/Header.js';
import Footer from '../../common/Footer/Footer';
import Loading from '../../common/Loading/Loading';
import localizations from '../../Localizations';
import FaqVideo from './FaqVideo';
import videoIds from './video_ids';

import Radium from 'radium';
import styles from './styles';

const learnMoreLinks = () =>  [
  { link: '/faq/clubs/use-statistics', title: localizations.faq_team_tutorial_manage_statistics_title },
  { link: '/faq/clubs/manage-a-club', title: localizations.faq_team_tutorial_create_club_account_title },
  { link: '/faq/clubs/share-with-teammates', title: localizations.faq_team_tutorial_share_with_teammates_title },
]

class TeamTutorial extends Component {
  constructor(props) {
    super(props)
    this.state = {
      language: localizations.getLanguage(),
      videoStartTime: 0,
      videoAutoPlay: 0
    }

    this.handleLinkClick = this.handleLinkClick.bind(this)
  }

  _setLanguage = (language) => {
    this.setState({ language: language })
  }

  handleLinkClick(e, startTime) {
    e.preventDefault();
    this.setState({videoStartTime: startTime, videoAutoPlay:1})

  }

  render() {
    const videoLinksAndTimes = {
      sportunityConnection: [localizations.faq_team_tutorial_links_sportunityConnection, 11],
      userCircle: [localizations.faq_team_tutorial_links_userCircle, 20],
      createMatches: [localizations.faq_team_tutorial_links_createMatches, 97],
      modifyEvent: [localizations.faq_team_tutorial_links_modifyEvent, 193],
      searchForReinforcementPrivate: [localizations.faq_team_tutorial_links_searchForReinforcementPrivate, 203],
      searchForReinforcementPublic: [localizations.faq_team_tutorial_links_searchForReinforcementPublic, 215],
      howTeammatesSeeYourEvents: [localizations.faq_team_tutorial_links_howTeammatesSeeYourEvents, 230],
      synchronizeCalendar: [localizations.faq_team_tutorial_links_synchronizeCalendar, 246],
    }

    const { viewer } = this.props

    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.title}>
            <h1>{localizations.faq_teams_title}</h1>
          </div>
          <div style={styles.body}>
            <h2 style={styles.sectionTitle}>{localizations.faq_team_tutorial_how_to_title}</h2>
            <div style={styles.paragraph}>
              {localizations.faq_team_tutorial_how_to_body}
              <ul style={styles.linkList}>
                {Object
                  .keys(videoLinksAndTimes)
                  .map((link) => {
                    return (
                      <li key={link} style={styles.linkListItem}>
                        <a
                          href="javascript:void(0)"
                          style={styles.link}
                          onClick={(e, start) => this.handleLinkClick(e, videoLinksAndTimes[link][1])} >{videoLinksAndTimes[link][0]}
                        </a>
                      </li>
                  )})}
              </ul>
            </div>
            <div style={styles.paragraph}>
              {localizations.faq_team_tutorial_how_to_learn_more}
              <ul style={styles.linkList}>
                {learnMoreLinks().map(({title, link}) => (
                  <li key={link} style={styles.linkListItem}>
                    <Link
                      to={link}
                      style={styles.link}
                    >
                      {title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <FaqVideo
              videoId={videoIds.team_tutorial}
              start={this.state.videoStartTime}
              autoplay={this.state.videoAutoPlay}
            />
          </div>
        </div>
      </div>

    );
  }
}


export default createFragmentContainer(Radium(TeamTutorial), {
  viewer: graphql`
    fragment TeamTutorial_viewer on Viewer {
      id
      me {
        id
        pseudo
      }
    }
  `,
});
