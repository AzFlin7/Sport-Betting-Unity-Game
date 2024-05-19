import React, { Component } from 'react';
import TagItem from './TagItem';
import localizations from '../../Localizations'

import Radium from 'radium';
let styles ;


class TagBox extends Component {
  render() {

    let items = [
      {
        icon: '/images/loupe.png',
        title: localizations.homeVenue_slide_gestion_title,
        desc: localizations.homeVenue_slide_gestion_desc,
        image: 'images/venues/crenaux.png',
        goTo: null,
      },
      {
        icon: '/images/cercles.png',
        title: localizations.homeVenue_security_title,
        desc: localizations.homeVenue_security_desc,
        image: 'images/venues/app_lock.png',
        goTo: null,
      },
      {
        icon: '/images/organise.png',
        title: localizations.homeVenue_money_title,
        desc: localizations.homeVenue_money_desc,
        image: '/images/venues/screen_crowdfounding.png',
        goTo: null,
      },
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