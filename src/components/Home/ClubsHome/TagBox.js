import React, { Component } from 'react';
import Radium from 'radium';

import TagItem from './TagItem';
import localizations from '../../Localizations'

let styles 

class TagBox extends Component {
  render() {
    let items = [
      {
        icon: '/images/loupe.png',
        title: localizations.homeClubs_slide_event_mobile_title,
        desc: localizations.homeClubs_slide_event_mobile_desc,
        image: '/images/page_club/activite_club.png',
        goTo: null,
      }
    ];
    
    return (
      <div style={styles.container} >
        {items.map((item, index) =>
          <TagItem
            key={index}
            icon={item.icon}
            title={item.title}
            descr={item.desc}
            image={item.image}
            link={item.goTo}
            id={index}
            router={this.props.router}
            {...this.state}
          />
        )}
      </div>
    );
  }
}


styles = {
  container: {
    // height: '320px',
    height: 'auto',
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
    '@media (max-width: 768px)': {
      margin: '2% 0px',
    },
    '@media (max-width: 480px)': {
      margin: '2% auto',
      display: 'block',
      height: 'auto'
    }
  },
};


export default Radium(TagBox);