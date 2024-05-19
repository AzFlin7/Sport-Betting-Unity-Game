import React, { Component } from 'react';
import Radium from 'radium'

import localizations from "../Localizations";
import Slide from './common/Slide';

let styles ;

class Slider extends Component {

  constructor(props) {
    super(props);
    this.state = {
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

    let items1 = [
      {video: '/images/homevideos/1.1.mp4'},
      {video: '/images/homevideos/1.2.mp4'},
      {video: '/images/homevideos/1.3.mp4'}
    ]
    let items2 = [
      {video: '/images/homevideos/2.1.mp4'},
      {video: '/images/homevideos/2.2.mp4'},
      {video: '/images/homevideos/2.3.mp4'}
    ]
    let items3 = [
      {video: '/images/homevideos/3.1.mp4'},
      {video: '/images/homevideos/3.2.mp4'},
      {video: '/images/homevideos/3.3.mp4'},
      {video: '/images/homevideos/3.4.mp4'}
    ]

    let item1 = items1[this.state.currentSlide1]
    let item2 = items2[this.state.currentSlide2]
    let item3 = items3[this.state.currentSlide3]

    return  (
      <div style={styles.slideContainer}>
        {this.state.displaySliders && 
          <Slide
            title={localizations.home_slide_explorer_title}
            descr={localizations.home_slide_explorer_desc}
            highlightenRow={this.state.currentSlide1}
            videos={items1}
            router={this.props.router}
            justToNextSlide={() => this.setState({currentSlide1: this.state.currentSlide1 < items1.length - 1 ? this.state.currentSlide1 + 1 : 0 })}
            justToSlide={i => this.setState({currentSlide1: i})}
            {...this.state}
          />
        }
        {this.state.displaySliders && 
          <Slide
            reversed={true}
            title={localizations.home_slide_circle_title}
            descr={localizations.home_slide_circle_desc}
            highlightenRow={this.state.currentSlide2}
            videos={items2}
            router={this.props.router}
            justToNextSlide={() => this.setState({currentSlide2: this.state.currentSlide2 < items2.length - 1 ? this.state.currentSlide2 + 1 : 0 })}
            justToSlide={i => this.setState({currentSlide2: i})}
            {...this.state}
          />
        }
        {this.state.displaySliders && 
          <Slide
            title={localizations.home_slide_organise_title}
            descr={localizations.home_slide_organise_desc}
            highlightenRow={this.state.currentSlide3}
            videos={items3}
            router={this.props.router}
            justToNextSlide={() => this.setState({currentSlide3: this.state.currentSlide3 < items3.length - 1 ? this.state.currentSlide3 + 1 : 0 })}
            justToSlide={i => this.setState({currentSlide3: i})}
            {...this.state}
          /> 
        }
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