import React, { Component } from 'react';
// import { createFragmentContainer, graphql } from 'react-relay/compat';
import Radium from 'radium';

import { colors } from '../../../theme';

import FaqVideo from '../../FAQ/UserTutorial/FaqVideo';
import contents, { sourceContents, videoContents, sectionContents } from './contents';

import { Link } from 'found'
import isExternal from 'is-url-external';

let styles;

class SinglePost extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videoStartTime: 0,
      videoAutoPlay: 0,
    };
  }

  _renderSectionContents() {
    return sectionContents.map(({ title, section }, index) => (
      <div key={ index }>
        <h2 style={styles.contentTitle}>{ `${ index + 1 }. ${ title() }` }</h2>
        <div style={styles.contentParagraph}>{ section() }</div>
      </div>
    ))
  }

  _renderVideoContents() {
    return videoContents.map(({ section, video }, index) => (
      <div key={`blog-section-video-${index}`}>
        <div style={styles.contentParagraph}>{ section() }</div>
        <div style={styles.videoContainer}>
          <FaqVideo
            videoId={video}
            start={this.state.videoStartTime}
            autoplay={this.state.videoAutoPlay}
          />
        </div>
      </div>
    ))
  }

  _renderSourceContents() {
    return sourceContents.map(({ source, url}, index) => {
      return isExternal(url()) &&
        <div key={`blog-section-source-${index}`} style={styles.source}>
          <a target="_blank" href={ url() }>
            { source() }
          </a>
        </div>
    })
  }

  render() {
    return (
      <div style={styles.container}>
        <div style={styles.contentTop}>
          <div style={styles.title}>
            <h1>{ contents.title() }</h1>
          </div>
          <div style={styles.contentParagraph}>{ contents.section() }</div>
        </div>
        <div style={styles.content}>
          <div style={styles.body}>
            { this._renderSectionContents() }
            { this._renderVideoContents() }
            <p style={styles.contentParagraph}>Sources :</p>
            {typeof window !== 'undefined' && this._renderSourceContents() }
            <Link style={styles.button} to="/blog">
              Retour
            </Link>
          </div>
        </div>

      </div>
    );
  }
}

styles = {
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 20,
  },
  content: {
    width: 1000,
    margin: '35px auto',
    display: 'flex',
    flexDirection: 'column',
    '@media (maxWidth: 960px)': {
      width: '94%',
    },
  },
  contentTop:{
    width: 1000,
    margin: '35px auto',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Lato',
    color: colors.black,
    '@media (maxWidth: 960px)': {
      width: '94%',
    },
  },
  title: {
    fontSize: 30,
    color: colors.blue,
    fontFamily: 'Lato',
    marginBottom: 30,
    fontWeight: '500',
  },
  body: {
    borderRadius: 5,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.4)',
    fontSize: 16,
    fontFamily: 'Lato',
    color: colors.black,
    padding: '30px 40px',
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: '500',
    paddingBottom: 15,
    borderBottom: `1px solid ${colors.blue}`,
  },
  contentParagraph: {
    marginTop: 35,
    marginBottom: 35,
    fontSize: 16,
    lineHeight: '20px',
  },
  source: {
    marginTop: 15,
    marginBottom: 15,
    fontSize: 16,
    lineHeight: '20px',
  },
  videoContainer: {
    height: 500,
    '@media (maxWidth: 960px)': {
      height: 410,
    },
    '@media (maxWidth: 680px)': {
      height: 300,
    },
    '@media (maxWidth: 480px)': {
      height: 200,
    },
    '@media (maxWidth: 360px)': {
      height: 150,
    },
  },
  button:{
    width: '9%',
    padding: 10,
    textAlign: 'center',
    fontFamily: 'Lato',
    fontSize: 16,
    cursor: 'pointer',
    borderRadius: 5,
    color: 'rgb(102, 102, 102)',
    textDecoration: 'none',
    transition: 'all 0.3s cubic-bezier(0.22, 0.61, 0.36, 1) 0s',
    border: '1px solid rgb(27, 130, 197)',
    marginTop: 45,
  },
};

export default SinglePost