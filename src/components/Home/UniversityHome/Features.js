import React, { Component } from 'react';
import FeaturesItem from '../common/FeaturesItem';
import localizations from '../../Localizations'

import Radium from 'radium';
let styles ;



class Features extends Component {
  render() {

    return (
      <div style={styles.container} >
        <FeaturesItem key={1}
                      Title={localizations.homeUniversities_feature_stat_title}
                      descr={localizations.homeUniversities_feature_stat_desc}
                      router={this.props.router}
                      image='/images/statistic-01.png'/>
        <FeaturesItem key={2}
                      Title={localizations.homeUniversities_feature_calendar_title}
                      descr={localizations.homeUniversities_feature_calendar_desc}
                      router={this.props.router}
                      image='/images/calendar-01.png'/>
        <FeaturesItem key={3}
                      Title={localizations.homeUniversities_feature_carPooling_title}
                      descr={localizations.homeUniversities_feature_carPooling_desc}
                      router={this.props.router}
                      image='/images/car-01.png'/>
        <FeaturesItem key={4}
                      Title={localizations.homeUniversities_feature_chat_title}
                      descr={localizations.homeUniversities_feature_chat_desc}
                      router={this.props.router}
                      image='/images/chat-01.png'/>
        <FeaturesItem key={5}
                      Title={localizations.homeUniversities_feature_multi_title}
                      descr={localizations.homeUniversities_feature_multi_desc}
                      router={this.props.router}
                      image='/images/multi-equipe-01.png'/>
        <FeaturesItem key={6}
                      Title={localizations.homeUniversities_feature_notification_title}
                      descr={localizations.homeUniversities_feature_notification_desc}
                      router={this.props.router}
                      image='/images/notif.png'/>
      </div>
    );
  }
}


styles = {
  container: {
    margin: '2%',
    // height: '320px',
    height: 'auto',
    display: 'flex',
    justifyContent: 'space-evenly',
    flexWrap: 'wrap',
    '@media (max-width: 768px)': {
      margin: '2% 15px',
    },
    '@media (max-width: 480px)': {
      margin: '2% auto',
      display: 'block',
      height: 'auto'
    }
  },
};


export default Radium(Features);