import React from 'react'; 
import Radium from 'radium';
import cloneDeep from 'lodash/cloneDeep';
import { Link } from 'found';
import { colors } from '../../../theme/';
import localizations from '../../Localizations';

var Style = Radium.Style;

let styles; 

const BigUserCard = ({user, showStatistics, link}) => {
    const displayLevel = sport => {
        let newSport = cloneDeep(sport);
        if (sport.levels && sport.levels.length > 0)
            newSport.levels = newSport.levels.sort((a, b) => {
                return a.EN.skillLevel - b.EN.skillLevel;
            });
    
        let sports;
        
        if (sport.allLevelSelected) {
            sports = sport.sport.levels.map(level =>
                _translatedLevelName(level),
            );
        } 
        else {
            sports = newSport.levels.map(level => _translatedLevelName(level));
        }
    
        if (!newSport.levels || newSport.levels.length === 0)
            return localizations.event_allLevelSelected;
        else if (sports.length === 1) 
            return sports[0];
        else {
            return (
                sports[0] + ' ' + localizations.find_to + ' ' +sports[sports.length - 1]
          );
        }
    }
    
    const _sportNameTranslated = sportName => {
        let name = sportName.EN;
        switch (localizations.getLanguage().toLowerCase()) {
            case 'en':
                name = sportName.EN;
                break;
            case 'fr':
                name = sportName.FR || sportName.EN;
                break;
            default:
                name = sportName.EN;
                break;
            }
            return name;
    }
    
    const _translatedLevelName = levelName => {
        let translatedName = levelName.EN.name;
        switch (localizations.getLanguage().toLowerCase()) {
            case 'en':
                translatedName = levelName.EN.name;
                break;
            case 'fr':
                translatedName = levelName.FR.name || levelName.EN.name;
                break;
            default:
                translatedName = levelName.EN.name;
                break;
        }
        return translatedName;
    }

    return (
        <div style={styles.button}>
            <Link
                to={link}
                style={styles.buttonLink}
            >
                <div style={styles.buttonIconWrapper}>
                    <div
                        style={{
                            ...styles.icon,
                            backgroundImage: user.avatar
                            ? 'url(' + user.avatar + ')'
                            : 'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")',
                        }}
                    />
                </div>
                <div style={styles.circleDetails}>
                    <div style={styles.leftSide}>
                        <div style={styles.top}>
                            <div style={styles.buttonText}>
                                {user.pseudo}
                            </div>

                            {user.publicAddress && 
                                <div style={styles.params}>
                                    <span style={{ color: colors.darkGray }}>
                                        {user.publicAddress.address ? user.publicAddress.address.city : null}
                                    </span>
                                </div>
                            }
                            {user.sports && user.sports.length > 0 && user.sports.filter((s, i) => i === 0).map((sport, index) => 
                                <div style={styles.sports}>
                                    <img
                                        src={
                                            sport
                                            ? sport.sport.logo
                                            : '/images/information.png'
                                        }
                                        style={styles.sportImage}
                                    />
                                    <span style={styles.sportParams}>
                                    {sport
                                        ? _sportNameTranslated(sport.sport.name)
                                        : null}
                                    </span>
                                </div>
                            )}
                            {user.sports && user.sports.length > 0 && user.sports.filter((s, i) => i === 0).map((sport, index) => 
                                sport && sport.levels && 
                                    <div style={styles.qualification}>
                                        {sport ? displayLevel(sport) : null}
                                    </div>
                            )}
                        </div>
                    </div>
                    <div style={styles.rightSide}>
                        {showStatistics &&
                            <p style={styles.showStatistics}>
                                {localizations.profile_statistics_showStat}
                            </p>
                        }
                    </div>
                </div>
            </Link>
        </div>
    );
}

styles = {
  params: {
    fontSize: 14,
    lineHeight: '20px',
  },
  button: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 130, 
    width: 600,
    maxWidth: '100%',
    // height: 70,
    backgroundColor: colors.white,
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12)',
    border: '1px solid #E7E7E7',
    borderRadius: 4,
    fontFamily: 'Lato',
    fontSize: 28,
    lineHeight: '42px',
    paddingLeft: 20,
    //paddingRight:20,
    paddingTop: 5,
    paddingBottom: 0,
    paddingRight: 20,
    marginTop: '8px',
    color: colors.black,
    position: 'relative',
    '@media (minWidth: 1024px)': {
      minWidth: 600,
    },
    '@media (maxWidth: 1024px)': {
      width: 'auto',
    },
  },
  sports: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: '8px',
    justifyContent: 'center',
  },

  sportParams: {
    fontSize: 14,
    lineHeight: '15px',
    marginLeft: '5px',
  },

  leftSide: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginLeft: 10,
    flex: 6,
  },
  circleDetails: {
    display: 'flex',
    flexDirection: 'row',
    //alignItems: 'center',
    justifyContent: 'space-between',
    flex: 8,
  },
  top: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: '3px',
  },

  buttonText: {
    textDecoration: 'none',
    color: colors.blue,
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: '30px',
  },
  buttonPseudo: {
    textDecoration: 'none',
    color: colors.darkGray,
    fontSize: 13,
    lineHeight: '15px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  buttonIconWrapper: {
    //paddingTop: 20,
    color: colors.blue,
    position: 'relative',
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    minWidth: '80px',
    borderRight: '0.25px solid ' + colors.lightGray,
  },
  buttonIcon: {
    color: colors.blue,
    position: 'relative',
  },
  buttonIconText: {
    color: colors.darkGray,
    fontSize: '18px',
    textAlign: 'center',
    minWidth: '20%',
  },
  buttonLink: {
    height: '100%',
    color: colors.black,
    textDecoration: 'none',
    cursor: 'pointer',
    flex: 8,
    display: 'flex',
    flexDirection: 'row',
  },
  rightSide: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: 16,
    lineHeight: '20px',
    justifyContent: 'flex-end',
    textAlign: 'right',
    flex: 2,
  },
  icon: {
    width: 60 ,
    height: 60,
    borderRadius: '50%',
    marginRight: 7,
    backgroundPosition: '50% 50%',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  },
  qualification: {
    fontSize: '12px',
  },
  sportImage: {
    color: colors.white,
    width: 18,
    height: 18,
  },
  showStatistics: {
    color: colors.blue,
    paddingBottom: 10,
    fontFamily: 'lato',
    fontSize: 17,
  },
};

export default Radium(BigUserCard)