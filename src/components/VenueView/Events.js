import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay';
import { colors } from '../../theme'
import EventCard from './EventCard'
let styles

class Events extends React.Component {
  render() {
    return(
      <div style={styles.container}>
        <div style={styles.title}>Upcoming Events</div>
        <div style={styles.events}>
          <EventCard />
          <EventCard />
          <EventCard />
          <EventCard />
          <EventCard />
          <EventCard />
          <EventCard />
          <EventCard />
        </div>
      </div>
    )
  }
}

styles = {
  container: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexDirection: 'column',
    width: '1000px',
    height: '205px',
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 40,
    paddingTop: 20,
    backgroundColor: colors.white,
    color: colors.black,
  },
  title: {
    fontSize: 32,
    marginBottom: 30,
  },
  subTitle: {
    fontSize: 22,
    marginTop: 30,
  },
  events: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
}

export default createFragmentContainer(Events, {
  venues: graphql`
    fragment Events_venues on VenueConnection {
      edges {
        node {
          description
        }
      }
    }
  `,
},
)