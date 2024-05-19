import React, { Component } from 'react';
import {createFragmentContainer, graphql} from 'react-relay';
import debounce from 'lodash.debounce'
import Header from '../common/Header/Header.js'

import HeaderImage from './HeaderImage';
import VenuePlace from './VenuePlace';
import TagBox from './TagBox';
import VideoArea from './VideoArea';

let styles;

class Venues extends Component {
  constructor(props){
		super(props)
		this.state = {
			sportFilter: '',
			locationFilter: '',
		}
		this._onDebounceSportFilterChange = debounce(this._onDebounceSportFilterChange, 400);
		this._onDebounceLocationFilterChange = debounce(this._onDebounceLocationFilterChange, 400);
	}

	_onDebounceSportFilterChange = (e) => {
		this.setState({ sportFilter: e.target.value })
	}

	_onDebounceLocationFilterChange = (e) => {
		this.setState({ locationFilter: e.target.value })
	}

	_onSportFilterChange = (e) => {
    e.persist();
    this._onDebounceSportFilterChange(e);
  }

	_onLocationFilterChange = (e) => {
    e.persist();
    this._onDebounceLocationFilterChange(e);
  }

  render() {

    const { viewer } = this.props

    
    return (
      <div style={styles.container}>
        <HeaderImage onSportFilterChange={this._onSportFilterChange}  onLocationFilterChange={this._onLocationFilterChange} />
        <TagBox />
        <VenuePlace venues={viewer.venues} {...this.state} />
        <VideoArea />
      </div>
    );
  }
}

export default createFragmentContainer(Venues, {
  viewer: graphql`
    fragment Venues_viewer on Viewer {
      id,
      venues(last:100) {
        ...VenuePlace_venues
      }
    }
  `,
});

styles = {
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
}
