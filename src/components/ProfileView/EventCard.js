import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import Radium from 'radium';
import dateFormat from 'dateformat'
import { colors } from '../../theme';
import {Link} from 'found'
let styles;

const EventCard = pure(({ sportunity }) => (
  <article style={styles.card}>
    <div style={styles.color} />
    <div style={styles.container}>
      <div style={styles.top}>
        <span style={styles.paid}>{sportunity.kind}</span>
        <time style={styles.datetime}>
          <div style={styles.date}>{dateFormat(new Date(sportunity.beginning_date), 'd mmm')}</div>
          <div style={styles.time}>
            {dateFormat(new Date(sportunity.beginning_date), 'HH:MM')} - {dateFormat(new Date(sportunity.ending_date), 'HH:MM')}
          </div>
        </time>
      </div>
      <div style={styles.content}>
        <div style={styles.icon} >
          <img src={sportunity.sport.sport.logo} style={styles.iconImage}/>
        </div>
        <div style={styles.info}>
          <Link style={styles.name} to={`/event-view/${sportunity.id}`}>{sportunity.title}</Link>
          <div style={styles.sport}>
            <span style={styles.sportName}>{sportunity.sport.sport.name.EN}</span>&nbsp;-&nbsp;
            <span style={styles.qualification}>{sportunity.sport.sport.levels[0].EN.name}</span>
          </div>
          <div style={styles.location}>
            <i
              style={styles.marker}
              className="fa fa-map-marker"
              aria-hidden="true"
            />{sportunity.venue !== null && sportunity.venue.name}
          </div>
        </div>
      </div>
      <div style={styles.bottom}>
        <span style={styles.participants}>{sportunity.participants.length} Participant{sportunity.participants.length > 1 ? 's' : ''}</span>
        <span style={styles.price}>{sportunity.price.currency} {sportunity.price.cents}</span>
      </div>
    </div>
  </article>
));


styles = {
  card: {
    width: 340,
    height: 215,
    display: 'flex',
    backgroundColor: colors.white,
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12)',
    border: '1px solid #E7E7E7',

    overflow: 'hidden',

    marginBottom: 40,

    fontFamily: 'Lato',
  },

  color: {
    width: 8,
    height: '100%',
    backgroundColor: colors.green,
  },

  icon: {
    width: 74,
    height: 74,
    marginRight: 15,
    borderRadius: '50%',
    backgroundColor: colors.white,
	},
	iconHover: {
    width: 74,
    height: 74,
    marginRight: 15,
    borderRadius: '50%',
    backgroundColor: colors.blue,
	},
  iconImage: {
		color:colors.white,
		width: 74,
    height: 74,
	},

  container: {
    width: 332,
    height: '100%',
    padding: '10px 15px',

    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },

  top: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  paid: {
    textTranform: 'uppercase',
    fontWeight: 'bold',
    fontSize: 20,
    color: colors.green,
  },

  datetime: {
    fontSize: 15,
  },

  date: {
    fontWeight: 'bold',
    lineHeight: 1.2,
    color: '#5e5e5e',
  },

  time: {
    color: '#939393',
  },

  content: {
    display: 'flex',
    marginBottom: 26,
  },

  icon: {
    width: 74,
    height: 74,
    marginRight: 15,
    borderRadius: '50%',
    backggroundPosition: 'center',
    backgroundSize: 'cover',
  },

  info: {

  },

  name: {
    color: 'rgba(0, 0, 0, 0.65)',
    fontSize: 20,
    fontWeight: 'bold',
    display: 'block',
    marginBottom: 11,
    textDecoration: 'none',
  },

  sport: {
    marginBottom: 10,
  },

  sportName: {
    color: colors.blue,
    fontSize: 16,
  },

  qualification: {
    fontSize: 12,
  },

  location: {
    fontSize: 16,
    fontWeight: 500,
  },

  marker: {
    marginRight: 8,
    color: colors.blue,
  },

  bottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },

  participants: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'rgba(0, 0, 0, 0.65)',
  },

  price: {
    fontSize: 26,
    color: colors.green,
  },
};


export default Radium(EventCard);
