import React, { Component } from 'react';
import TagItem from './common/TagItem';
import localizations from '../Localizations'

import Radium from 'radium';
let styles ;

const items = [
  {
    header: localizations.home_section1Title,
    icon: 'fa fa-search',
    text: localizations.home_section1Desc,
  },
  {
    header: localizations.home_section2Title,
    icon: 'fa fa-calendar',
    text: localizations.home_section2Desc,
  },
  {
    header: localizations.home_section3Title,
    icon: 'fa fa-thumbs-o-up',
    text: localizations.home_section3Desc,
  },
];

class TagBox extends Component {
  constructor(props) {
    super(props)
    this.state = {
      displayTags: false
    }
  }

  componentDidMount() {
    this.setState({displayTags: true})
  }

  render() {
    
    return (
    <div style={styles.mainContainer}>
      {this.props.children}
      {this.state.displayTags && 
        <div style={styles.container} >
          <TagItem key={1}
                  Title={localizations.home_particuliers_title}
                  descr1={localizations.home_particuliers_desc1}
                  descr2={localizations.home_particuliers_desc2}
                  descr3={localizations.home_particuliers_desc3}
                  onClickGoTo='#individual'
                  image='/images/individual.png'
                  router={this.props.router}
                  color={'#1b82c5'}/>
          <TagItem key={2}
                  Title={localizations.home_club_title}
                  descr1={localizations.home_club_desc1}
                  descr2={localizations.home_club_desc2}
                  descr3={localizations.home_club_desc3}
                  onClickGoTo='/clubs'
                  image='/images/club.png'
                  router={this.props.router}
                  color={'#504596'}/>
          <TagItem key={3}
                  Title={localizations.home_enterprise_title}
                  descr1={localizations.home_enterprise_desc1}
                  descr2={localizations.home_enterprise_desc2}
                  descr3={localizations.home_enterprise_desc3}
                  onClickGoTo='/companies'
                  image='/images/buisness.png'
                  router={this.props.router}
                  color={'#e9591b'}/>
          <TagItem key={4}
                  Title={localizations.home_venues_title}
                  descr1={localizations.home_venues_desc1}
                  descr2={localizations.home_venues_desc2}
                  descr3={localizations.home_venues_desc3}
                  onClickGoTo='/venues'
                  image='/images/venue.png'
                  router={this.props.router}
                  color={'#2fac67'}/>
          <TagItem key={5}
                  Title={localizations.home_cities_title}
                  descr1={localizations.home_cities_desc1}
                  descr2={localizations.home_cities_desc2}
                  descr3={localizations.home_cities_desc3}
                  onClickGoTo='/universities'
                  image='/images/city.png'
                  router={this.props.router}
                  color={'#ce2e83'}/>
        </div>
      }
    </div>
    );
  }
}

styles = {
  mainContainer: {
    backgroundColor: '#f6f6fe',
    padding: '2%',
  },
  container: {
    // height: '320px',
    height: 'auto',
    display: 'flex',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    '@media (max-width: 768px)': {
      padding: '2% 10%',
    },
    '@media (max-width: 480px)': {
      padding: '2% auto',
      display: 'block',
      height: 'auto'
    }
  },
};


export default Radium(TagBox);