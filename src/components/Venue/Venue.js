import React, { Component } from 'react';
import {createFragmentContainer, graphql} from 'react-relay';
import { connect } from 'react-redux';
import Header from '../common/Header/Header.js'
import Footer from '../common/Footer/Footer'
import NewVenue from './NewVenue'
import VenueItem from './VenueItem'
import { fonts, colors } from '../../theme'
import localizations from '../Localizations'

import Radium from 'radium'

let styles

class Venue extends Component {
  constructor(props) {
    super(props)
    this.state = {
      language: localizations.getLanguage(),
    }
  }

	componentWillReceiveProps = nextProps => {
		if (this.props.viewer.me && this.props.viewer.me.venues && this.props.viewer.me.venues.edges && (nextProps.viewer.me.venues.edges.length > this.props.viewer.me.venues.edges.length) ) {
			let newVenue = nextProps.viewer.me.venues.edges.find(nextEdge => this.props.viewer.me.venues.edges.findIndex(edge => edge.node.id === nextEdge.node.id) < 0)
			setTimeout(() => this.props.selectVenue(newVenue.node.id), 250)
		}
	}

  _setLanguage = (language) => {
    this.setState({ language: language })
  }

  render() {
      
    const { viewer } = this.props ;
    const venues = viewer.me.venues.edges ;
    return (
        <div>
					<div style={styles.bodyContainer}>
            {venues.map(venue => 
              <VenueItem key={venue.node.id} item={venue.node} onClick={() => this.props.selectVenue(venue.node.id)}>
                {venue.node.name}
              </VenueItem>
              )
            }
            <NewVenue
              language={localizations.getLanguage()} 
              viewer={viewer}
            />
          </div> 
				</div> 
    );
  }
}

styles = {
  pageHeader: {
		height: 41,
		fontFamily: 'Lato',
		fontSize: 34,
		fontWeight: fonts.weight.large,
		color: colors.blue,
		display: 'flex',
    maxWidth: 1400,
		margin: '30px auto', 
    flexDirection: 'row',
		paddingLeft: 70,
		alignItems: 'left',
		justifyContent: 'left',
    '@media (max-width: 768px)': {
      maxWidth: '94%',
      paddingLeft: '0px',
    }
	},
  bodyContainer: {
    display: 'flex',
    maxWidth: 1400,
    margin: '30px auto 50px', 
    flexDirection: 'column',
		paddingLeft: 70,
		alignItems: 'center',
		justifyContent: 'center',
    '@media (max-width: 768px)': {
      maxWidth: '100%',
      paddingLeft: '0px',
    }
  },
   container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
    backgroundImage: 'url(/images/background-signup.jpg',
  },
}

const stateToProps = (state) => ({
  id: state.venueReducer.id,
  name: state.venueReducer.name,
  address: state.venueReducer.address,
  city: state.venueReducer.city,
  country: state.venueReducer.country,
});

const ReduxContainer = connect(
  stateToProps,
)(Radium(Venue));

export default createFragmentContainer(Radium(ReduxContainer), {
  viewer: graphql`
    fragment Venue_viewer on Viewer {
      id,
      me {
        venues (last: 100) {
          edges {
            node {
              id
              name
            }
          }            
        }
      }
    }
  `,
})

