import React, { Component } from 'react';

import Radium from 'radium'

import localizations from "../../Localizations";
import colors from "../../../theme/colors";

let styles ;

class Slide extends Component {

  imageTimer;
  changeImageInterval = 4000;

  constructor(props) {
    super(props);
    
    this.videoElements = [];
    this.state = {
      isLoadingVideo: false,
      isInViewport: false
    }
  }

  componentDidMount() {
    window.addEventListener('scroll', e => this._manageViewport());
    this._manageViewport()
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this._manageViewport);
  }

  isInViewport(offset = 300) {
    if (!this.slideContainer) return false;
    const top = this.slideContainer.getBoundingClientRect().top;
    return (top + offset) >= 0 && (top) <= window.innerHeight;
  }

  _manageViewport = () => {
    this.setState({isInViewport: this.isInViewport()})
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.isInViewport !== this.state.isInViewport) {
      if (typeof this.videoElements[this.props.highlightenRow] !== 'undefined') {
        if (this.state.isInViewport) {
          this.videoElements[this.props.highlightenRow].play()
        }
        else {
          this.videoElements[this.props.highlightenRow].pause()
        }
      }
      else {
        if (this.state.isInViewport) {
          clearTimeout(this.imageTimer);
          this.imageTimer = setTimeout(() => 
            this.props.justToNextSlide(), 
            this.changeImageInterval
          );
        }
        else {
          clearTimeout(this.imageTimer);
        }
      }
    }
  }

  jumpToVideo = i => {
    if (typeof this.videoElements[this.props.highlightenRow] !== 'undefined') {
      this.videoElements[this.props.highlightenRow].pause()
      this.videoElements[this.props.highlightenRow].currentTime = 0;
      
      if (i === this.props.highlightenRow)
        this.videoElements[this.props.highlightenRow].play()
    }

    setTimeout(() => this.props.justToSlide(i), 300)
  }

  _handleVideoEnds = () => {
    this.videoElements[this.props.highlightenRow].pause()
    this.videoElements[this.props.highlightenRow].currentTime = 0;

    setTimeout(() => this.props.justToNextSlide(), 300)
  }

  _handleClick = () => {
    if (this.props.link)
      this.props.router.push(this.props.link)
  };

  componentWillReceiveProps = nextProps => {
    if (this.props.highlightenRow !== nextProps.highlightenRow) {
      setTimeout(() => {
        if (typeof this.videoElements[nextProps.highlightenRow] !== 'undefined') 
          this.videoElements[nextProps.highlightenRow].play()
        else {
          clearTimeout(this.imageTimer);
          this.imageTimer = setTimeout(() => 
            this.props.justToNextSlide(), 
            this.changeImageInterval
          );
        }          
      }, 300)
    }
  }

  render() {
    const {icon, title, descr, image, images, id, video, highlightenRow, videos, reversed, columned, landscapeVideos} = this.props;

    return (
      reversed
      ? <div ref={el => this.slideContainer = el} style={{...styles.container, justifyContent: landscapeVideos ? 'flex-end' : 'space-evenly'}}>
          {videos.map((vid, index) => (
            vid.video 
            ? <video 
                ref={el => this.videoElements[index] = el} 
                playsInline 
                muted 
                style={{...styles.leftvideo, left: landscapeVideos ? '2%' : '5%', zIndex: index === highlightenRow ? 2 : 1}} 
                key={vid.video} 
                onEnded={this._handleVideoEnds} 
                
              >
                <source src={vid.video} type="video/mp4"/>
              </video>
            : <img 
                src={vid.image} 
                key={index} 
                style={{...styles.leftImage, zIndex: index === highlightenRow ? 2 : 1}}
              />
          ))}
          <div style={{...styles.rightTextContainer, paddingLeft: landscapeVideos ? 10 : images ? '50%': 500, width: landscapeVideos ? '40%' : '100%'}}>
            <div style={styles.titleContainer}>
              {!!icon && <img src={icon} style={styles.icon}/>}
              <p style={styles.title}>
                {title}
              </p>
            </div>
            <ul style={{textAlign: 'center'}}>
              {descr && descr.map((text, index) =>
                <li 
                  key={index} 
                  style={highlightenRow === index ? {...styles.text, color: colors.blue, fontWeight: 'bold'} : styles.text}
                  onClick={() => this.jumpToVideo(index)}
                >
                  {text}
                </li>
              )}
            </ul>
          </div>
        </div>
      : columned
        ? <div ref={el => this.slideContainer = el} style={styles.columnContainer}>
            <div style={styles.topTextContainer}>
              <div style={styles.titleContainer}>
                {!!icon && <img src={icon} style={styles.icon}/>}
                <p style={styles.title}>
                  {title}
                </p>
              </div>
              <ul style={{textAlign: 'center'}}>
                {descr && descr.map((text, index) =>
                  <li 
                    key={index} 
                    style={highlightenRow === index ? {...styles.text, color: colors.blue, fontWeight: 'bold'} : styles.text}
                    onClick={() => this.jumpToVideo(index)}
                  >
                    {text}
                  </li>
                )}
              </ul>
            </div>
            {videos.map((vid, index) => (
              vid.video 
              ? <video 
                  ref={el => this.videoElements[index] = el} 
                  playsInline 
                  muted 
                  style={{...styles.bottomVideo, zIndex: index === highlightenRow ? 2 : 1}} 
                  key={vid.video} 
                  onEnded={this._handleVideoEnds} 
                  
                >
                  <source src={vid.video} type="video/mp4"/>
                </video>
              : <img 
                  src={vid.image} 
                  key={index} 
                  style={{...styles.image, zIndex: index === highlightenRow ? 2 : 1}}
                />
            ))}
          </div>
        : <div ref={el => this.slideContainer = el} style={{...styles.container, justifyContent: landscapeVideos ? 'flex-start' : 'space-evenly'}}>
            <div style={{...styles.leftTextContainer, paddingRight: landscapeVideos ? 10 : images ? '50%': 500, width: landscapeVideos ? '40%' : '100%'}}>
              <div style={styles.titleContainer}>
                {!!icon && <img src={icon} style={styles.icon}/>}
                <p style={styles.title}>
                  {title}
                </p>
              </div>
              <ul style={{textAlign: 'center'}}>
                {descr && descr.map((text, index) =>
                  <li 
                    key={index} 
                    style={highlightenRow === index ? {...styles.text, color: colors.blue, fontWeight: 'bold'} : styles.text}
                    onClick={() => this.jumpToVideo(index)}
                  >
                    {text}
                  </li>
                )}
              </ul>
            </div>
            {videos.map((vid, index) => (
              vid.video 
              ? <video 
                  ref={el => this.videoElements[index] = el} 
                  playsInline 
                  muted 
                  style={{...styles.rightVideo, right: landscapeVideos ? '2%' : '5%', zIndex: index === highlightenRow ? 2 : 1}} 
                  key={vid.video} 
                  onEnded={this._handleVideoEnds} 
                  
                >
                  <source src={vid.video} type="video/mp4"/>
                </video>
              : <img 
                  src={vid.image}
                  key={index} 
                  style={{...styles.rightImage, zIndex: index === highlightenRow ? 2 : 1}}
                />
            ))}
          </div>
    )
  }
}

styles = {
  container: {
    display: 'flex',
    width: '100%',
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '25px 10px',
    height: 650,
    '@media (max-width: 800px)': {
      flexDirection: 'column',
      height: 'auto',
      paddingTop: 0,
      marginBottom: 25
    },
    '@media (max-width: 500px)': {
      height: 'auto',
    }
  },
  columnContainer: {
    display: 'flex',
    width: '100%',
    position: 'relative',
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    padding: '25px 10px',
    '@media (max-width: 800px)': {
      flexDirection: 'column',
      paddingTop: 0,
      marginBottom: 25
    },
  },
  rightTextContainer: {
    paddingRight: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    margin: 10,
    '@media (max-width: 800px)': {
      paddingLeft: 10,
      marginBottom: 500,
      width: 'auto'
    },
    '@media (max-width: 500px)': {
      marginBottom: 400
    }
  },
  leftTextContainer: {
    paddingLeft: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    margin: 10,
    '@media (max-width: 800px)': {
      paddingRight: 10,
      marginBottom: 500,
      width: 'auto'
    },
    '@media (max-width: 500px)': {
      marginBottom: 400
    }
  },
  topTextContainer: {
    paddingRight: 10, 
    paddingLeft: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 500,
    margin: 10,
    '@media (max-width: 900px)': {
      paddingBottom: '55%',
    },
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    textAlign: 'center',
    '@media (max-width: 830px)': {
      flexDirection: 'column'
    },
  },
  icon: {
    width: 100,
    height: 100,
    margin: -10,
    '@media (max-width: 425px)': {
      width: 75,
      height: 75,
    }
  },
  title: {
    fontFamily: 'Lato',
    fontSize: '28px',
    fontWeight: 'bold',
    color: colors.darkGray,
    '@media (max-width: 600px)': {
      fontSize: '18px',
    },
  },
  text: {
    cursor: 'pointer',
    fontFamily: 'Lato',
    fontSize: '18px',
    marginBottom: 10,
    color: colors.darkGray,
    '@media (max-width: 600px)': {
      fontSize: '14px',
    },
  },
  image: {
    maxWidth: '50%',
    maxHeight: '95%',
    position: 'absolute', 
    '@media (max-width: 800px)': {
      marginLeft: -30,
    },
  },
  leftImage: {
    maxWidth: '50%',
    maxHeight: '95%',
    position: 'absolute', 
    left: '2%',
    '@media (max-width: 1000px)': {
      maxWidth: '50%'
    },
    '@media (max-width: 800px)': {
      marginLeft: -30,
      left: 'auto',
      maxHeight: '70%',
      maxWidth: '100%',
      bottom: '2%'
    },
  },
  rightImage: {
    maxWidth: '50%',
    maxHeight: '95%',
    position: 'absolute', 
    right: '2%',
    '@media (max-width: 1000px)': {
      maxWidth: '50%'
    },
    '@media (max-width: 800px)': {
      marginLeft: -30,
      right: 'auto',
      maxHeight: '70%',
      maxWidth: '100%',
      bottom: '2%'
    },
  },
  leftvideo: {
    maxHeight: '600px',
    maxWidth: '55%',
    width: 'auto',
    position: 'absolute', 
    '@media (max-width: 800px)': {
      height: '500px',
      maxWidth: '55%',
      left: 'auto',
      bottom: '2%',
      maxWidth: '80%'
    },
    '@media (max-width: 500px)': {
      height: '400px',
      left: 'auto',
      bottom: '5%'
    },
    '@media (max-width: 500px)': {
      height: '350px',
      left: 'auto',
      bottom: '5%'
    }
  },
  rightVideo: {
    height: '600px',
    maxWidth: '55%',
    width: 'auto',
    position: 'absolute', 
    '@media (max-width: 800px)': {
      height: '500px',
      right: 'auto',
      bottom: '2%',
      maxWidth: '80%'
    },
    '@media (max-width: 500px)': {
      height: '400px',
      right: 'auto',
      bottom: '5%'
    },
    '@media (max-width: 500px)': {
      height: '350px',
      right: 'auto',
      bottom: '5%'
    }
  },
  bottomVideo: {
    height: 'auto',
    width: '90%',
    maxWidth: 800,
    position: 'absolute', 
    bottom: '4%', 
  },
  seeMoreButton: {
    border: '1px solid #000',
    width: '50%',
    alignSelf: 'center',
    color: colors.blue,
    padding: 10,
    marginTop: 20,
    textAlign: 'center',
    fontFamily: 'Lato',
    fontSize: '18px',
    cursor: 'pointer',
    '@media (max-width: 600px)': {
      fontSize: '14px',
    },
  },
};

export default Radium(Slide);