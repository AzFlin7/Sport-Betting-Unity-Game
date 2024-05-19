import React from 'react'
import Radium, { StyleRoot } from 'radium';

import PureComponent, { pure } from '../common/PureComponent'
import { colors, fonts, metrics } from '../../theme'
import localizations from '../Localizations'

let styles

const Sport = pure((sport) => {
  const levelFrom = sport.sport.levels[0]
  const levelTo = sport.sport.levels[sport.sport.levels.length - 1]

  return (
    <div style={styles.sportItem} key="profileSportItem">
      <div style={{ display: 'flex' }}>
        <img src={sport.sport.sport.logo} alt={sport.sport.sport.name[localizations.getLanguage()]} style={styles.image} />
        <div style={styles.infoContainer}>
          <h4 style={styles.name}>
            {sport.sport.sport.name[localizations.getLanguage().toUpperCase()]}
          </h4>
          {levelFrom && levelTo && 
            <p style={styles.level}>
              <span style={{ color: colors.blue }}>
                {levelFrom[localizations.getLanguage().toUpperCase()].name}
              </span>
              {(levelTo && levelTo.id !== levelFrom.id) && 
                ' ' + localizations.find_to + ' '
              }
              {(levelTo && levelTo.id !== levelFrom.id) &&
                <span style={{ color: colors.blue }}>
                  {levelTo[localizations.getLanguage().toUpperCase()].name}
                </span>
              }
            </p>
          }
          {sport.sport.positions && sport.sport.positions.length > 0 &&
            <p style={styles.certificate}>
              {localizations.event_positions + ': ' + sport.sport.positions.map(position => position[localizations.getLanguage().toUpperCase()]).join(', ')}
            </p>
          }
          {sport.sport.certificates && sport.sport.certificates.length > 0 &&
            <p style={styles.certificate}>
              {localizations.event_certificates + ': ' + sport.sport.certificates.map(certificate => certificate.certificate.name[localizations.getLanguage().toUpperCase()]).join(', ')}
            </p>
          }
          {sport.sport.assistantType && sport.sport.assistantType.length > 0 && 
            <p style={styles.certificate}>
              {localizations.profile_assistants + ': ' + sport.sport.assistantType.map(assistantType => assistantType.name[localizations.getLanguage().toUpperCase()]).join(', ')}
            </p>
          }
        </div>
      </div>
      <div style={{alignSelf: 'start', cursor: 'pointer'}} onClick={() => sport.onDeleteSport(sport.sport.sport.id)}>
        <i style={{color: colors.redGoogle, fontSize: 18}} className="fa fa-times" />
      </div>
    </div>
  );
})

styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginBottom: metrics.margin.large,
    color: colors.black,
  },
  h2: {
    fontSize: fonts.size.large,
    fontWeight: fonts.size.xl,
    marginBottom: metrics.margin.medium,
    marginLeft: 5,
  },
  image: {
    height: 70,
    marginRight: 20,
    objectFit: 'contain',
  },
  sportItem: {
    textDecoration: 'none',
    width: '49%',
    marginRight: '1%',
    height: 105,
    backgroundColor: colors.white,
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12)',
    border: '1px solid #E7E7E7',
    overflow: 'hidden',
    marginBottom: 15,
    fontFamily: 'Lato',
    padding: 10,
    minWidth: 280,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    '@media (max-width: 500px)': {
      minWidth: '100%',
      width: '100%',
    },
  },
  infoContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingBottom: 5,
  },
  nameLevel: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
  },
  name: {
    fontSize: fonts.size.medium,
    marginRight: metrics.margin.small,
  },
  level: {
    fontSize: fonts.size.small,
  },
  certificate: {
    fontSize: fonts.size.small,
  },
}

export default Radium(Sport);
