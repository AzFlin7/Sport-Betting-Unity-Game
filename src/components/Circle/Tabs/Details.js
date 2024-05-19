import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import cloneDeep from 'lodash/cloneDeep';
import Radium from 'radium';
import {
  GoogleMap,
  Marker,
  withScriptjs,
  withGoogleMap,
} from 'react-google-maps';

import localizations from '../../Localizations';
import { colors, fonts } from '../../../theme';
import { Card, CardContent } from '@material-ui/core';
import SportunityCodeBox from '../../common/SportunityCodeBox';

let styles;

const Map = withScriptjs(
  withGoogleMap(props => (
    <GoogleMap
      defaultZoom={15}
      defaultCenter={props.position}
      options={{
        scrollwheel: false,
        navigationControl: false,
        mapTypeControl: false,
        scaleControl: false,
        //draggable: false,
      }}
    >
      {props.isMarkerShown && <Marker position={props.position} />}
    </GoogleMap>
  )),
);

class DetailsTab extends React.Component {
  constructor(props) {
    super(props);
  }

  _sportNameTranslated = sportName => {
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
  };

  displayLevel = sport => {
    let newSport = cloneDeep(sport);
    if (sport.levels && sport.levels.length > 0)
      newSport.levels = newSport.levels.sort((a, b) => {
        return a.EN.skillLevel - b.EN.skillLevel;
      });

    let sports;
    if (sport.allLevelSelected) {
      sports = sport.sport.levels.map(level =>
        this._translatedLevelName(level),
      );
    } else {
      sports = newSport.levels.map(level => this._translatedLevelName(level));
    }

    if (!newSport.levels || newSport.levels.length === 0)
      return localizations.event_allLevelSelected;
    else if (sports.length === 1) {
      return sports[0];
    } else {
      return (
        sports[0] +
        ' ' +
        localizations.find_to +
        ' ' +
        sports[sports.length - 1]
      );
    }
  };

  _translatedLevelName = levelName => {
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
  };

  render() {
    const { circle, isCurrentUserTheOwner, isCurrentUserCoOwner } = this.props;

    let listType = {
      adults: localizations.circles_member_type_0,
      children: localizations.circles_member_type_1,
      teams: localizations.circles_member_type_2,
      clubs: localizations.circles_member_type_3,
      companies: localizations.circles_member_type_4,
    };

    return (
      <div style={styles.container}>
        <section style={styles.section}>
          <div style={styles.mainDescription}>
            <div>
              <div style={styles.row}>
                <div style={styles.title}>
                  {localizations.circle_title_description}
                </div>
              </div>
              <div style={styles.description}>
                {circle.description
                  ? circle.description.split('\n').map((descLine, descIndex) => <p key={descIndex}>{descLine}</p>)
                  : isCurrentUserTheOwner || isCurrentUserCoOwner
                  ? localizations.circle_owner_complete_description
                  : localizations.circle_uncomplete_description}
              </div>
            </div>
            {circle.publicShortCode && (
              <div style={{ marginRight: '20%', marginLeft: '20%' }}>
                <SportunityCodeBox code={circle.publicShortCode} title={localizations.circle_code}/>
              </div>
            )}

            {/* <Card style={styles.sportunityCode}>
                            <CardContent>
                                <h1 style={styles.h1}>Sportunity <br />
                                code</h1>
                                <h1 style={styles.circleCode}>4 6 5 7</h1>
                            </CardContent>
                        </Card> */}
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.row}>
            <div style={styles.title}>
              {localizations.circle_title_description_advanced}
            </div>
          </div>
          <div style={styles.description}>
            <div style={styles.info}>
              <span style={styles.infoTitle}>
                {localizations.circles_member_type + ' : '}
              </span>
              {listType[circle.type.toLowerCase()]}
              <div style={styles.infoExplanation}>
                {localizations.circles_member_type_explanation.replace(
                  '{0}',
                  listType[circle.type.toLowerCase()],
                )}
              </div>
            </div>
            {circle.mode === 'PUBLIC' ? (
              <div style={styles.info}>
                <span style={styles.infoTitle}>
                  {localizations.circle_public + ' : '}
                </span>
                {localizations.circle_public_explaination2}
              </div>
            ) : (
              <div style={styles.info}>
                <span style={styles.infoTitle}>
                  {localizations.circle_publicFalse + ' : '}
                </span>
                {localizations.circle_publicFalse_explaination2}
              </div>
            )}
            {circle.isCircleUsableByMembers ? (
              <div style={styles.info}>
                <span style={styles.infoTitle}>
                  {localizations.circle_usable_by_members + ' : '}
                </span>
                {localizations.circle_usable_by_membersExplanation2}
              </div>
            ) : (
              <div style={styles.info}>
                <span style={styles.infoTitle}>
                  {localizations.circle_usable_by_membersFalse + ' : '}
                </span>
                {localizations.circle_usable_by_membersFalseExplanation2}
              </div>
            )}
          </div>
        </section>

        <div style={styles.bottomBorder} />
        {circle.sport && circle.sport.sport && (
          <section style={styles.section}>
            {/* <div style={styles.title}>
                            {localizations.circle_title_sports}
                        </div> */}

            <div style={styles.sportRow}>
              <img
                src={
                  circle.sport && circle.sport.sport
                    ? circle.sport.sport.logo
                    : '/images/profile.png'
                }
                style={styles.sportImage}
              />
              <div style={styles.sport}>
                <span style={styles.sportName}>
                  {circle.sport && circle.sport.sport
                    ? this._sportNameTranslated(circle.sport.sport.name)
                    : 'No Sports Found'}
                </span>
                <span style={styles.qualification}>
                  {circle.sport
                    ? this.displayLevel(circle.sport)
                    : isCurrentUserTheOwner || isCurrentUserCoOwner
                    ? localizations.circle_owner_complete_sport
                    : localizations.circle_uncomplete_sport}
                </span>
              </div>
            </div>
          </section>
        )}
        {/* <section style={styles.section}>
                        <div style={styles.title}>
                            {localizations.circle_title_sports}
                        </div>
                        <div style={styles.description}>
                            {(isCurrentUserTheOwner || isCurrentUserCoOwner) ? localizations.circle_owner_complete_sport : localizations.circle_uncomplete_sport}
                        </div>
                    </section> */}
        <div style={styles.addressDiv}>
          <i
            className="fa fa-map-marker fa-4x"
            style={{ marginTop: '40px' }}
            aria-hidden="true"
          />

          {circle.address ? (
            <section style={styles.section}>
              {/* <div style={styles.title}>
                                {localizations.circle_place}
                            </div> */}
              <div style={styles.addressLine}>{circle.address.address}</div>
              <div style={styles.addressLine}>{circle.address.city}</div>
              <div style={styles.addressLine}>{circle.address.country}</div>
            </section>
          ) : (
            <section style={styles.section}>
              {/* <div style={styles.title}>
                                {localizations.circle_place}
                            </div> */}
              <div style={styles.description}>
                {isCurrentUserTheOwner || isCurrentUserCoOwner
                  ? localizations.circle_owner_complete_address
                  : localizations.circle_uncomplete_address}
              </div>
            </section>
          )}
        </div>

        {circle.address && (
          <div style={styles.map}>
            <Map
              position={{
                lat: circle.address.position.lat,
                lng: circle.address.position.lng,
              }}
              isMarkerShown
              googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyAC6hY0V4cGyw2_-trCRU3VIPicoZenjjU&v=3.exp&libraries=geometry,drawing,places"
              loadingElement={<div style={{ height: `100%` }} />}
              containerElement={<div style={{ height: `400px` }} />}
              mapElement={<div style={{ height: `100%` }} />}
            />
          </div>
        )}
      </div>
    );
  }
}

styles = {
  container: {},
  section: {
    marginTop: '40px',
    marginLeft: '20px',
  },
  mainDescription: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  addressDiv: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: '40px',
  },

  sportunityCode: {
    minWidth: '140px',

    backgroundColor: colors.blue,
    borderRadius: '5px',
    height: '100px',
    width: '140px',
    fontSize: '20px',
    textAlign: 'center',
    fontWeight: 'bold',
    boxShadow: '4px 4px 4px rgba(0,0,0,0.12)',
  },

  h1: {
    paddingTop: '5px',
    color: colors.white,
    fontFamily: 'Lato',
  },

  circleCode: {
    fontFamily: 'Lato',
    fontSize: '20px',
    marginTop: '8px',
    fontWeight: 'bold',
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Lato',
    color: colors.darkGray,
  },
  editButton: {
    fontSize: 18,
    color: colors.darkGray,
    fontFamily: 'Lato',
    cursor: 'pointer',
  },
  editIcon: {
    fontSize: 18,
    color: colors.darkBlue,
    marginRight: 10,
  },
  sportRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  sportImage: {
    color: colors.white,
    width: 100,
    height: 100,
  },
  sport: {
    marginLeft: 15,
    marginBottom: 10,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    fontFamily: 'Lato',
  },
  sportName: {
    fontSize: 25,
    fontWeight: 'bold',
    color: colors.gray,
    marginBottom: 14,
  },
  qualification: {
    color: colors.blue,
    fontSize: 20,
  },
  description: {
    color: colors.darkGray,
    fontSize: 16,
    fontFamily: 'Lato',
    marginTop: '10px',
    wordBreak: 'break-word',
  },
  addressLine: {
    color: colors.darkGray,
    fontSize: 16,
    fontFamily: 'Lato',
    margin: 10,
  },
  map: {
    width: '100%',
    height: 400,
    marginTop: 25,
    '@media (max-width: 480px)': {
      width: '100%',
    },
  },
  info: {
    marginBottom: 15,
  },
  infoTitle: {
    fontWeight: 'bold',
  },
  infoExplanation: {
    fontStyle: 'italic',
    marginTop: 5,
  },
  bottomBorder: {
    marginTop: '10px',
    borderBottom: '1px solid ' + colors.lightGray,
    height: '1px',
  },
};

export default createFragmentContainer(Radium(DetailsTab), {
  circle: graphql`
    fragment Details_circle on Circle {
      id
      description
      type
      mode
      isCircleUsableByMembers
      publicShortCode
      address {
        address
        city
        country
        position {
          lat
          lng
        }
      }
      sport {
        sport {
          id
          logo
          name {
            EN
            FR
          }
        }
        levels {
          id
          EN {
            name
            skillLevel
          }
          FR {
            name
            skillLevel
          }
        }
      }
    }
  `,
});
