import React from 'react';
import Radium from 'radium';
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import {
  GoogleMap,
  Marker,
  withScriptjs,
  withGoogleMap,
} from 'react-google-maps'
import {formatDateLong} from './formatDate';
import { colors } from '../../theme';

let styles;

const Map = withScriptjs(withGoogleMap((props) =>
  <GoogleMap
    defaultZoom={15}
    defaultCenter={props.position}
    options={{ 
      scrollwheel: false, 
      navigationControl: false, 
      mapTypeControl: false, 
      scaleControl: false, 
    //  draggable: false
    }} 
  >
    {props.isMarkerShown && <Marker position={props.position} />}
  </GoogleMap>
))

const TimeAndLocation = ({ sportunity, language }) => {
  return <article style={styles.container}>
    <div style={styles.info}>
      <div style={styles.location}>
        <i
          style={styles.markerIcon}
          className="fa fa-map-marker"
          aria-hidden="true"
        />
        <div style={styles.addressContainer}>
          {sportunity.venue && <span style={{marginBottom: 10}}>{sportunity.venue.name + ' - ' + sportunity.infrastructure.name}</span>}
          <span>
            {sportunity.address && (
              sportunity.address.address === sportunity.address.city
              ? sportunity.address.city
              : sportunity.address.address+', '+sportunity.address.city
            )}
            </span>
        </div>
      </div>
      <time style={styles.datetime}>
        <i
          style={styles.calendarIcon}
          className="fa fa-calendar"
          aria-hidden="true"
        />
        {formatDateLong(sportunity.beginning_date, sportunity.ending_date)}
      </time>
    </div>
    <div style={styles.map} >
      <Map
        position={{lat: sportunity.address.position.lat , lng: sportunity.address.position.lng }}
        isMarkerShown
        googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyAC6hY0V4cGyw2_-trCRU3VIPicoZenjjU&v=3.exp&libraries=geometry,drawing,places"
        loadingElement={<div style={{ height: `100%` }} />}
        containerElement={<div style={{ height: `250px` }} />}
        mapElement={<div style={{ height: `100%` }} />}
      />
    </div>
  </article>
}


styles = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'column',
    fontFamily: 'Lato',
    '@media (max-width: 480px)': {
      display: 'block',
    }
  },

  place: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 30,
  },

  addressContainer: {
    display: 'flex',
    flexDirection: 'column'
  },

  photo: {
    width: 65,
    height: 65,
    borderRadius: '50%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    marginRight: 10,
  },

  name: {
    color: colors.blue,
    fontSize: 26,
    fontWeight: 500,
    marginBottom: 6,
  },

  additional: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'rgba(0,0,0,0.65)',
  },
  info: {
    display: 'none'
  },
  location: {
    display: 'flex',
    alignItems: 'center',

    color: 'rgba(0,0,0,0.65)',
    fontSize: 20,
    fontWeight: 500,

    marginLeft: 25,
    marginBottom: 23,
  },

  markerIcon: {
    color: colors.blue,
    fontSize: 24,
    marginRight: 35,
  },

  datetime: {
    display: 'flex',
    alignItems: 'center',

    color: 'rgba(0,0,0,0.65)',
    fontSize: 20,
    fontWeight: 500,

    marginLeft: 25,
    marginBottom: 23,
  },

  calendarIcon: {
    color: colors.blue,
    fontSize: 18,
    marginRight: 31,
  },

  map: {
    backgroundColor: colors.green,
    width: '100%',
    height: 250,
    '@media (max-width: 480px)': {
      width: '100%',
    }
  },
};



export default createFragmentContainer(Radium(TimeAndLocation), {
  sportunity: graphql`
    fragment TimeAndLocation_sportunity on Sportunity {
      address {
        address
        city
                  position {
          lat
          lng
        }
      },
      beginning_date,
      ending_date
      venue {
        id
        name
      }
      infrastructure {
        id
        name
      }
      slot {
        id
        from
        end
      }
    }
  `,
  });
