import React, { Component } from 'react';
import TagItem from './TagItem';

import Radium from 'radium';
let styles ;

class TagBox extends Component {
  render() {
    return (
      <div style={styles.container} >
        <TagItem />
        <TagItem />
        <TagItem />
      </div>
    );
  }
}

styles = {
  container: {
    margin: '50px auto',
    width: '62%',
    height: '320px',
    display: 'flex',
    justifyContent: 'center',
    '@media (max-width: 600px)': {
      width: '94%',
      margin: '3% auto',
      height: 'auto',
      display: 'inline-block',
    }
  },
}

export default Radium(TagBox);