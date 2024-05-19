import React from 'react';
import Radium from 'radium';

import { colors } from '../../theme';


let styles;



const EventCard = () => (
  <article style={styles.card}>
    <div style={styles.color} />
    <div style={styles.container}>
      <div style={styles.top}>
        <span style={styles.paid}>FREE</span>
        <time style={styles.datetime}>
          <div style={styles.date}>15 Mars</div>
          <div style={styles.time}>10:00 - 11:00</div>
        </time>
      </div>
      <div style={styles.content}>
        <div style={styles.icon} />
        <div style={styles.info}>
          <h1 style={styles.name}>Fun Basket</h1>
          <div style={styles.sport}>
            <span style={styles.sportName}>Basketball</span>&nbsp;-&nbsp;
            <span style={styles.qualification}>BEGINNER</span>
          </div>
          <div style={styles.location}>
            <i
              style={styles.marker}
              className="fa fa-map-marker"
              aria-hidden="true"
            />
            Olympique de la Pontaise
          </div>
        </div>
      </div>
      <div style={styles.bottom}>
        <span style={styles.participants}>15 participants</span>
        <span style={styles.price}>10 CHF</span>
      </div>
    </div>
  </article>
);


styles = {
  card: {
    width: '440px',
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

  container: {
    width: '100%',
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

    backgroundColor: colors.blue,
  },

  info: {

  },

  name: {
    color: 'rgba(0, 0, 0, 0.65)',
    fontSize: 20,
    fontWeight: 'bold',

    marginBottom: 11,
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
