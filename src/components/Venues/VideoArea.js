import React, { Component } from 'react';
import Radium from 'radium';
let styles ;

class VideoArea extends Component {
  render() {
    return (
      <div style={styles.container} >
        {/* load video tag */}
        <i style={styles.icon} className="fa fa-play-circle" aria-hidden="true"></i>
      </div>
    );
  }
}

styles =  {
  container: {
    width: '65%',
    margin: '2% auto 80px auto',
    height: '470px',
    backgroundColor: '#E9E9E9',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    '@media (max-width: 600px)': {
      width: '96%',
      marginLeft: '2%',
    },
  },
  icon: {
    textAlign: 'center',
    fontSize: '56px',
    fontFamily: 'Fontawesome',
    color: 'rgba(0,0,0,0.65)',
    lineHeight: '56px',
    alignSelf: 'center',
  },
};

export default Radium(VideoArea);