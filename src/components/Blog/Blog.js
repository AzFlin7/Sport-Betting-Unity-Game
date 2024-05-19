import React, { Component } from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import Radium from 'radium';
import Header from '../common/Header/Header';
import Footer from '../common/Footer/Footer';
import localizations from '../Localizations';
import { colors } from '../../theme';
import FaqVideo from '../FAQ/UserTutorial/FaqVideo';
import contents from './contents';

import { Link } from 'found'

let styles;

class Blog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      language: localizations.getLanguage(),
      videoStartTime: 0,
      videoAutoPlay: 0,
    };
  }

  _setLanguage = language => {
    this.setState({ language });
  };

  render() {
    const { viewer } = this.props;
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.title}>
            <h1>{localizations.blog_title}</h1>
          </div>
          <div style={styles.content}>
            {contents.map(({ title, content, content_button, url, video }, index) => (
              <div style={styles.body} key={`blog-content-${index}`}>
                <div style={styles.contentTitle}>{title()}</div>
                <div style={styles.contentParagraph}>{content()}</div>
                <div style={styles.videoContainer}>
                  <FaqVideo
                    videoId={video}
                    start={this.state.videoStartTime}
                    autoplay={this.state.videoAutoPlay}
                  />
                  { 
                    url
                    ? <Link style={styles.button} to={ `/blog/${url}` }>
                        { content_button() }
                      </Link>
                    : null
                  }
                </div>
              </div>
            ))}
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
    padding: '30px 40px 115px',
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: '500',
    paddingBottom: 15,
    borderBottom: `1px solid ${colors.blue}`,
  },
  contentParagraph: {
    marginTop: 35,
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
    width: '75%',
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
  },
};

export default createFragmentContainer(Radium(Blog), {
  viewer: graphql`
    fragment Blog_viewer on Viewer {
      id
      me {
        id
        pseudo
      }
    }
  `,
});
