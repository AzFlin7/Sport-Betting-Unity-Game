import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay';

import Header from '../common/Header/Header.js'
import Title from './Title'
import Description from './Description'
import Events from './Events'

let styles

class VenueView extends React.Component {
  render() {
    const { viewer } = this.props

    return (
        <div>
					<div style={styles.container}>
					</div>
					<div style={styles.bodyContainer}>
            <Title venues={viewer.venues} />
            <Description venues={viewer.venues} />
            <Events venues={viewer.venues} />
          </div> 
				</div> 
    );
  }
}

styles = {
  bodyContainer: {
    display: 'flex',
    maxWidth: '1400px',
    margin: 'auto', 
    flexDirection: 'column',
		marginTop: 25,
		alignItems: 'center',
		justifyContent: 'center',
    fontFamily : 'Lato',
    borderRadius: '5px',
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
    backgroundImage: 'url(/images/background-signup.jpg',
  },
}

export default createFragmentContainer(VenueView, {
  viewer: graphql`
    fragment VenueView_viewer on Viewer {
      id
      me {
        id
        numberOfUnreadNotifications
        notifications(last: 5) {
          edges {
            node {
              id
              text
              link
              created
            }
          }
        }
      }
      venues(first:1) {
        ...Title_venues
        ...Description_venues
        ...Events_venues
      }
    }
  `,
})
