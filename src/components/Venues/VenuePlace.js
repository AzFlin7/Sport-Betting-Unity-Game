import React, { Component } from 'react';
import {createFragmentContainer, graphql} from 'react-relay';
import VenuePlaceItem from './VenuePlaceItem';

import Radium from 'radium';

let styles ;

class VenuePlace extends Component {
  render () {
    const { venues, sportFilter, locationFilter } = this.props;
		let filtered = venues.edges
										.filter((item) => 
                      !sportFilter ? true :
                      (item.node.infrastructures.sport != null && 
                        item.node.infrastructures.sport.name.EN.toLowerCase()
                        .indexOf(sportFilter.toLowerCase()) >= 0))
										.filter((item) => 
											!locationFilter ? true : (item.node.name !== null && item.node.name.toLowerCase().indexOf(locationFilter.toLowerCase()) >= 0))
    
    

    return (
      <div style={styles.container} >
        <h3 style={styles.heading}>Venues on the application</h3>
        <div style={styles.itemContainer} >
          {filtered.map(edge => {
            return(<VenuePlaceItem key={edge.node.id} venue={edge.node} />)
          })} 
        </div>
      </div>
    );
  }
}

styles = {
  container: {
    width: '65%',
    height: '538px',
    position: 'relative',
    margin: '0 auto',
    '@media (max-width: 480px)': {
      width: '94%',
    }
  },
  heading: {
    width: '100%',
    height: '35px',
    fontFamily: 'Lato',
    fontSize: '29px',
    lineHeight: '35px',
    color: 'rgba(0,0,0,0.65)',
    '@media (max-width: 320px)': {
      height: '60px',
    },
  },
  itemContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
}

export default createFragmentContainer(Radium(VenuePlace), {
  venues: graphql`
    fragment VenuePlace_venues on VenueConnection {
      edges {
        node {
          id
          name
          logo
          address {
            country
            city
          }
          feedbacks {
            count
          }
          infrastructures {
            sport {
              name {
                EN
              }
            }
          }
        }
      }
    }
    `,
  },
);
