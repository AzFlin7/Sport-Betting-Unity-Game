import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay';
import { colors } from '../../theme'

let styles

class Description extends React.Component {
  render() {
    const { venues } = this.props
    let venue = venues.edges[0].node
    return(
      <div style={styles.container}>
        <div style={styles.title}>Description</div>
        <div style={styles.subTitle}>{venue.description}</div>
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
    padding: 40,
    backgroundColor: colors.white,
    color: colors.black,
  },
  title: {
    fontSize: 32,
  },
  subTitle: {
    fontSize: 22,
    marginTop: 30,
  },
}

export default createFragmentContainer(Description, {
    venues: graphql`
      fragment Description_venues on VenueConnection {
        edges {
          node {
            description
          }
        }
      }
    `,
  },
)