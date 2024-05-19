import React from 'react';
import Youtube from 'react-youtube';
import Radium from 'radium';
import styles from './styles';

const Style = Radium.Style;

const FaqVideo = ({ autoplay, start, videoId }) => {
  const options = {
    height: '230',
    width: '460',
    playerVars: {
      autoplay: autoplay || 0,
      cc_load_policy: 1,
      controls: 1,
      start: start || 0,
    },
  };

  return (
    <div id="video-container" style={styles.videoContainer}>
      <Style scopeSelector="#video-container iframe" rules={styles.iframe} />
      <Youtube videoId={videoId} opts={options} />
    </div>
  );
};

export default FaqVideo;
