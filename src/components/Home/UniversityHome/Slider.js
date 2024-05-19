import React, { Component } from 'react';
import Radium from 'radium'

import localizations from "../../Localizations";
import Slide from '../common/Slide';

let styles ;

class Slider extends Component {

  constructor(props) {
    super(props);
    this.state = {
      currentSlide0: 0,
      currentSlide1: 0,
      currentSlide2: 0,
      currentSlide3: 0,
      displaySliders: false,
    }
  }

  componentDidMount() {
    this.setState({displaySliders: true})
  }

  render() {
    let items0 = [
      {video: '/images/universityhome/1.1.mp4'},
      {video: '/images/universityhome/1.2.mp4'},
      {video: '/images/universityhome/1.3.mp4'},
    ]
    let items1 = [
      {image: '/images/universityhome/2.1.png'},
      {image: '/images/universityhome/2.2.png'},
      {image: '/images/universityhome/2.3.png'},
      {image: '/images/universityhome/2.4.png'},
      {image: '/images/universityhome/2.5.png'}
    ]
    let items2 = [
      {video: '/images/universityhome/3.1.mp4'},
      {video: '/images/universityhome/3.2.mp4'},
      {video: '/images/universityhome/3.3.mp4'},
    ]
    let items3 = [
      {video: '/images/clubshomevideos/5.1.mp4'},
      {video: '/images/clubshomevideos/5.3.mp4'},
      {video: '/images/clubshomevideos/5.4.mp4'},
    ]

    return  (
      <div style={styles.slideContainer}>
        {this.state.displaySliders && 
          <Slide
            reversed={true}
            title={localizations.homeUniversities_slide_member_title}
            descr={localizations.homeUniversities_slide_member_desc}
            highlightenRow={this.state.currentSlide0}
            videos={items0}
            router={this.props.router}
            justToNextSlide={() => this.setState({currentSlide0: this.state.currentSlide0 < items0.length - 1 ? this.state.currentSlide0 + 1 : 0 })}
            justToSlide={i => this.setState({currentSlide0: i})}
            {...this.state}
          />
        }
        {this.state.displaySliders && 
          <Slide
            title={localizations.homeUniversities_slide_season_title}
            descr={localizations.homeUniversities_slide_season_desc}
            highlightenRow={this.state.currentSlide1}
            videos={items1}
            images={true}
            router={this.props.router}
            justToNextSlide={() => this.setState({currentSlide1: this.state.currentSlide1 < items1.length - 1 ? this.state.currentSlide1 + 1 : 0 })}
            justToSlide={i => this.setState({currentSlide1: i})}
            landscapeVideos={true}
            {...this.state}
          />
        }
        {this.state.displaySliders && 
          <Slide
            reversed={true}
            title={localizations.homeUniversities_slide_group_title}
            descr={localizations.homeUniversities_slide_group_desc}
            highlightenRow={this.state.currentSlide2}
            videos={items2}
            router={this.props.router}
            justToNextSlide={() => this.setState({currentSlide2: this.state.currentSlide2 < items2.length - 1 ? this.state.currentSlide2 + 1 : 0 })}
            justToSlide={i => this.setState({currentSlide2: i})}
            landscapeVideos={true}
            {...this.state}
          />
        }
        {/*this.state.displaySliders && 
          <Slide
            title={localizations.homeUniversities_slide_administrative_form_title}
            descr={localizations.homeUniversities_slide_administrative_form_desc}
            highlightenRow={this.state.currentSlide3}
            videos={items3}
            router={this.props.router}
            justToNextSlide={() => this.setState({currentSlide3: this.state.currentSlide3 < items3.length - 1 ? this.state.currentSlide3 + 1 : 0 })}
            justToSlide={i => this.setState({currentSlide3: i})}
            landscapeVideos={true}
            {...this.state}
          /> 
        */}
      </div>
    );
  }
}

styles = {
  slideContainer: {
    backgroundColor: '#f6f6fe',
  },
};

export default Radium(Slider);