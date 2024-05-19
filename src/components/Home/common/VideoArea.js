import React, { Component } from 'react';
import Radium from 'radium';
import Youtube from 'react-youtube';
var Style = Radium.Style;

let styles ;
class VideoArea extends Component {
  render() {
    return (
      <div style={styles.container} id="video-container">
        <div>
          <Style scopeSelector="#video-container iframe" rules={{
            maxWidth: '100%'
            }}
          />
        </div>
        <Youtube
          videoId="bf7lyFsFalQ"
          opts={{playerVars:{rel:"0",showinfo:"0"}}}
          
        />
      </div>
    );
  }
}

styles =  {
  container: {
    height: '450px',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    marginTop: '2%',
    marginLeft: 'auto',
    marginRight: 'auto',
    '@media (max-width: 768px)': {
      maxWidth: '94%',
    },
  },
};

export default Radium(VideoArea);