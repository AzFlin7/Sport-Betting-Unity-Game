import React, { Component } from 'react';
import colors from '../../theme/colors';
import { Link } from 'found'
import Radium from 'radium';
let styles;

class PopularItem extends Component {
  render () {
    let { venue } = this.props
    return (
      <Link style={styles.container} to={`/venue-view/${venue.id}`}>
        <div style={styles.imageContainer} >
            <img src={ venue.logo } />
        </div>
        <div style={styles.infoContainer} >
          <span style={styles.heading} >{venue.name}</span>
          <span style={styles.location} >
            <i style={styles.icon} className="fa fa-map-marker" aria-hidden="true"></i>
            { venue.address.city }, { venue.address.country }
          </span>
          <span style={styles.event} >
            <i style={styles.icon} className="fa fa-calendar-o" aria-hidden="true"></i>
            35 upcoming events
          </span>
        </div>
        <div style={styles.likesContainer} >
          <i style={styles.icon} className="fa fa-heart" aria-hidden="true"></i>
          <span style={styles.likesCount}> { venue.feedbacks.count } </span>
        </div>
      </Link>
    );
  }
}

styles = {
  container: {
    // width: '48%',
    width: '100%',
    // marginRight: '16px',
    marginTop: '23px',
    height: '213px',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12)',
    border: '1px solid #E7E7E7',
    display: 'flex',
    flexDirection: 'row',
    position: 'relative',
    textDecoration: 'none',
  },
  imageContainer: {
    width: '100px',
    height: '80px',
    border: '1px solid #ddd',
    borderRadius: '50%',
    // marginTop: '16%',
    marginTop: '56px',
    marginLeft: '5%',
    backgroundColor: colors.blue,
    '@media (max-width: 400px)': {
      width: '70px',
      height: '50px',
    },
  },
  image: {
    width: '100%',
    height: 'auto',
    // image missing
  },
  infoContainer: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    alignSelf: 'center',
    marginLeft: '4%',
  },
  heading: {
    //width: '110%',
    height: '24px',
    fontFamily: 'Lato',
    fontSize: '20px',
    fontWeight: 'bold',
    lineHeight: '24px',
    color: 'rgba(0,0,0,0.65)',
  },
  location: {
    //width: '100%',
    // marginLeft: '2%',
    marginTop: '5%',
    height: '19px',
    fontFamily: 'Lato',
    fontSize: '16px',
    fontWeight: '500',
    lineHeight: '19px',
    color: 'rgba(0,0,0,0.65)',
    '@media (max-width: 630px)': {
      marginTop: '15%',
    },
  },
  event: {
    width: '100%',
    marginTop: '5%',
    fontFamily: 'Lato',
    fontSize: '16px',
    lineHeight: '19px',
    fontWeight: '500',
    opacity: '0.8',
  },
  likesContainer: {
      alignSelf: 'flex-end',
      marginRight: '4%',
      marginBottom: '4%',
      fontFamily: 'Lato',
      fontSize: '11px',
      display: 'flex',
      flexDirection: 'row',
      lineHeight: '10px',
  },
  likesCount: {
    alignSelf: 'center',
    opacity: '0.7',
  },
  icon: {
      fontSize: '16px',
      color: colors.blue,
      marginRight: '10%',
  },
};

export default Radium(PopularItem);

