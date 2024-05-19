import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import Radium from 'radium';
import dateFormat from 'dateformat'
import { colors } from '../../theme';
import { Link } from 'found'
let styles;

const statusStyle = (status) => {
switch(status.toLowerCase()) {
    case 'passed':
        return styles.passed
    case 'organized':
        return styles.organized
    default:
        return styles.active
  }
}

const statusColor = (status) => {
  switch(status.toLowerCase()) {
    case 'passed':
        return styles.colorPassed
    case 'organized':
        return styles.colorOrganized
    default:
        return styles.colorActive
  }
}

const EventCard = pure(({ sportunity }) => (
  <article style={styles.card}>
    <div style={statusColor(sportunity.status)} />
    <div style={styles.container}>
      <div style={styles.top}>
        <span style={statusStyle(sportunity.status)}>{sportunity.status}</span>
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
            />{sportunity.address && sportunity.address.address}
          </div>
        </div>
      </div>
      <div style={styles.bottom}>
        <span style={styles.participants}>{sportunity.participants.length} Participant{sportunity.participants.length > 1 ? 's' : ''}</span>
        <span style={styles.price}>
					{
						sportunity.price.cents === 0 ? 'FREE' :
							sportunity.price.currency + ' '+ sportunity.price.cents
					}</span>
      </div>
    </div>
  </article>
));


styles = {
  card: {
    width: '48%',
    height: 215,
    display: 'flex',
    backgroundColor: colors.white,
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12)',
    border: '1px solid #E7E7E7',
    overflow: 'hidden',
    marginBottom: '3%',
    fontFamily: 'Lato',
		marginLeft: '1%',
		marginRight: '1%',
  },
  colorActive: {
    width: 8,
    height: '100%',
    backgroundColor: colors.green,
  },
  colorPassed: {
    width: 8,
    height: '100%',
    backgroundColor: colors.gray,
  },
  colorOrganized: {
    width: 8,
    height: '100%',
    backgroundColor: colors.blue,
  },
  active: {
    textTranform: 'uppercase',
    fontWeight: 'bold',
    fontSize: 20,
    color: colors.green,
  },
  organized: {
    textTranform: 'uppercase',
    fontWeight: 'bold',
    fontSize: 20,
    color: colors.blue,
  },
  passed: {
    textTranform: 'uppercase',
    fontWeight: 'bold',
    fontSize: 20,
    color: colors.gray,
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
		width:'100%',
	},
	paid: {
    textTranform: 'uppercase',
    fontWeight: 'bold',
    fontSize: 20,
    color: colors.green,
  },
  datetime: {
    fontSize: 15,
		marginRight: 0,
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
    //backgroundColor: colors.blue,

  },
  iconImage: {
		color:colors.white,
		width: 74,
    height: 74,
		filter : 'hue-rotate(180deg)',
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
    color: colors.black,
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
