import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay';
import { colors, fonts } from '../../theme'

let styles

class Title extends React.Component {
  render() {
    const { venues } = this.props
    let venue = venues.edges[0].node
    return(
      <div style={styles.container}>
        <div style={styles.image}></div>
        <div style={styles.text}>
          <div style={styles.title}>{ venue.name }</div>
          <div style={styles.subTitle}>
            <i
                style={styles.marker}
                className="fa fa-map-marker"
                aria-hidden="true"
              />
          {venue.address.address}, {venue.address.city}, {venue.address.country} </div>
          <div style={styles.subTitle}>15 upcoming events </div>
        </div>
      </div>
    )
  }
}

styles = {
  container: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    width: '1000px',
    height: '205px',
    
    paddingTop: 47,
    paddingLeft: 42,
    backgroundColor: colors.blue,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    color: colors.white,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: '100%',
    backgroundColor: colors.white,
  },
  text: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexDirection: 'column',
    marginLeft: '50px',
    fontWeight: fonts.weight.xl,
  },
  title: {
    fontSize: 36,
  },
  subTitle: {
    fontSize: 22,
    marginTop: 15,
  },
  marker: {
    color: colors.white,
    marginRight: 18,
  },
}

export default createFragmentContainer(Title, {
    venues: graphql`
      fragment Title_venues on VenueConnection {
        edges {
          node {
            name
            address {
              address
              city
              country
            }
          }
        }
      }
    `,
  },
)