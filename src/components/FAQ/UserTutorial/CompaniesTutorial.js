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
    }

    const { viewer } = this.props

    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.title}>
            <h1>{localizations.faq_companies_tutorial_title}</h1>
          </div>
          <div style={styles.body}>
            <div style={styles.paragraph}>
              {localizations.faq_companies_tutorial_subtitle}
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
            <FaqVideo
              videoId={videoIds.companies_tutorial}
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
    fragment CompaniesTutorial_viewer on Viewer {
      id
      me {
        id
        pseudo
      }
    }
  `,
});