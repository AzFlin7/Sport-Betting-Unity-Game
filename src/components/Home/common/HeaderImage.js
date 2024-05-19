import React, { Component } from 'react';
import Radium from 'radium'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay';
import YoutubeVideo from 'react-youtube'

import { colors } from '../../../theme';
var Style = Radium.Style;
let styles;

class HeaderImage extends Component {
  constructor() {
    super()
    this.state = {
      isLoaded: false
    }
  }
  componentDidMount() {
    setTimeout(() => this.setState({isLoaded: true}), 100); 
  }
  render() {
    const { viewer, videoId, title, subTitle, registerText, onClick, backgroundImage } = this.props;

    return (
      <div style={{...styles.container, backgroundImage}}>
        <div style={styles.containerFilter}>
          <p style={styles.headingTextMaj}>
            {title}
          </p>
          <p style={styles.headingTextMin}>
            {subTitle}
          </p>
          <Style
            //scopeSelector=".videoWrapper iframe"
            rules={{
              ".videoWrapper iframe": {
                height: 350,
                width: 575
              },
              mediaQueries: {
                '(max-width: 600px)': {
                  ".videoWrapper iframe": {
                    height: 304,
                    width: 500,
                  },
                },
                '(max-width: 450px)': {
                  ".videoWrapper iframe": {
                    height: 205,
                    width: 340,
                  },
                },
                '(max-width: 300px)': {
                  ".videoWrapper iframe": {
                    height: 120,
                    width: 200,
                  }
                }
              }
            }}
          />
          {this.state.isLoaded && !!videoId && 
            <div className="videoWrapper" style={styles.videoWrapper}>
              <YoutubeVideo
                videoId={videoId}
                opts={{
                    playerVars: {fs: 1, autoplay: 0, cc_load_policy: 0, controls: 1, rel: 0, showinfo: 0, modestbranding: 1, autohide: 1}
                  }}
              />
            </div>
          }
        </div>
      </div>
    );
  }
}


styles = {
  containerButton: {
    height: '60px',
    boxShadow: '0 0 6px 0 rgba(0,0,0,0.5)',
    borderRadius: '10px',
    // zIndex: '1',
    marginTop: 100,
    position: 'absolute',
    top: '270px',
    justifyContent: 'flex-end',
    '@media (max-width: 610px)': {
      display: 'block',
      top: 320
    },
    transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
    ':hover': {
      transform:'scale(1.05)',
      boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)'
    },
  },
  videoWrapper: {
    height: 350,
    width: 575,
    '@media (max-width: 600px)': {
      height: 304,
      width: 500,
    },
    '@media (max-width: 450px)': {
      height: 205,
      width: 340,
    },
    '@media (max-width: 300px)': {
      height: 120,
      width: 200,
    }
  },
  containerFilter: {
    height: '100%',
    backgroundSize: 'cover',
    backgroundColor: '#00000033',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '25px 80px 150px 80px',
    '@media only screen and (max-width: 850px)': {
      padding: '25px 25px 150px 25px',
    },
  },
  container: {
    width: '100%',
    height: 600,
    backgroundPosition: 'center -250px',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    '@media (max-width: 1530px)': {
      backgroundPosition: 'center',
    },
  },
  headingTextMaj: {
    fontFamily: 'Lato',
    fontSize: '36px',
    lineHeight: '52px',
    color: colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
    '@media (max-width: 1280px)': {
      fontSize: '34px',
    },
    '@media (max-width: 978px)': {
      fontSize: '32px',
    },
    '@media (max-width: 768px)': {
      fontSize: '26px',
      lineHeight: '44px',
    },
    '@media (max-width: 425px)': {
      fontSize: '22px',
      lineHeight: '30px',
    },
  },
  headingTextMin: {
    fontFamily: 'Lato',
    fontSize: '28px',
    lineHeight: '40px',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 10, 
    '@media (max-width: 1280px)': {
      fontSize: '24px',
    },
    '@media (max-width: 978px)': {
      fontSize: '22px',
    },
    '@media (max-width: 768px)': {
      fontSize: '18px',
      lineHeight: '36px',
    },
    '@media (max-width: 425px)': {
      fontSize: '14px',
      lineHeight: '30px',
    },
  },
  inputSearch: {
    fontFamily: 'Lato',
    fontSize: '18px',
    display: 'inline',
    padding: '5px 20px',
    color: colors.white,
    '@media (max-width: 425px)': {
      fontSize: '16px',
    }
  },
  playButton: {
    cursor: 'pointer',
    fontSize: '15px',
    height: 70,
    width: 70,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    backgroundColor: 'rgba(25, 25, 25, 0.95)',
    color: colors.white,
    transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
    opacity: 0.9,
    marginTop: 70,
    ':hover': {
      opacity: 1,
      transform:'scale(1.1)',
      boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)'
    },
  },
  playIcon: {
    marginLeft: 4
  },
  searchButton: {
    height: '100%',
    backgroundColor: colors.blue,
    boxSizing: 'border-box',
    paddingRight: 10,
    paddingLeft: 10,
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    cursor: 'pointer'
  },
};

export default createFragmentContainer(Radium(HeaderImage), {
  viewer: graphql`
    fragment HeaderImage_viewer on Viewer {
      me {
        id
      }
    }
  `,
});
