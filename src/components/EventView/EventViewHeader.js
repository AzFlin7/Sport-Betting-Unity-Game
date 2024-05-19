import React from 'react';
import Radium from 'radium';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { withAlert } from 'react-alert';
import isSameDay from 'date-fns/is_same_day';
import isPast from 'date-fns/is_past';

import { colors } from '../../theme';
import {
  formatDate,
  formatDateMonth,
  formatWeekDays,
  formatTime,
  formatYear,
} from './formatDate';
import ContentHeader from './ContentHeader';
import localizations from '../Localizations';
import ReactTooltip from 'react-tooltip';
import AddToCalendar from './AddToCalendar';
import RelaunchInvited from './RelaunchInvited';
import Price from './Price';
import Sharing from './Sharing';
import { appUrl } from '../../../constants';
import InputText from './InputText';
import SportLevels from './SportLevels';
import UpdateCalendarMutation from '../ProfileView/UpdateCalendarMutation';

let styles;

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.alertOptions = {
      offset: 60,
      position: 'top right',
      theme: 'light',
      transition: 'fade',
    };
    this.state = {
      editItem: null,
      editItemName: '',
      levelFrom: null,
      levelTo: null,
    };
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

  _sportMinLevelTranslated = levels => {
    const minLevel = levels[0];
    let name = minLevel.EN.name;

    switch (localizations.getLanguage().toLowerCase()) {
      case 'en':
        name = minLevel.EN.name;
        break;
      case 'fr':
        name = minLevel.FR.name || minLevel.EN.name;
        break;
      default:
        name = minLevel.EN.name;
        break;
    }
    return name;
  };

  _sportMaxLevelTranslated = levels => {
    const maxLevel = levels[levels.length - 1];
    let name = maxLevel.EN.name;

    switch (localizations.getLanguage().toLowerCase()) {
      case 'en':
        name = maxLevel.EN.name;
        break;
      case 'fr':
        name = maxLevel.FR.name || maxLevel.EN.name;
        break;
      default:
        name = maxLevel.EN.name;
        break;
    }
    return name;
  };

  _editTitle = newTitle => {
    this.setState({
      editItem: 'title',
      editItemName: newTitle,
    });
  };

  _editLevel = sport => {
    let levels = [];
    if (sport.levels && sport.levels.length > 0) {
      levels = sport.levels;
    } else {
      levels = sport.sport.levels;
    }

    let minLevel = {
      value: levels[0].id,
      name: levels[0][localizations.getLanguage().toUpperCase()].name,
      skillLevel:
        levels[0][localizations.getLanguage().toUpperCase()].skillLevel,
      description:
        levels[0][localizations.getLanguage().toUpperCase()].description,
    };

    let maxLevel = {
      value: levels[levels.length - 1].id,
      name:
        levels[levels.length - 1][localizations.getLanguage().toUpperCase()]
          .name,
      skillLevel:
        levels[levels.length - 1][localizations.getLanguage().toUpperCase()]
          .skillLevel,
      description:
        levels[levels.length - 1][localizations.getLanguage().toUpperCase()]
          .description,
    };

    this.setState({
      editItem: 'level',
      levelFrom: minLevel,
      levelTo: maxLevel,
    });
  };

  _updateEditName = e => {
    this.setState({
      editItemName: e.target.value,
    });
  };

  _validationEditTitle = newTitle => {
    if (this.state.editItemName === '') {
      this.props.alert.show(localizations.event_view_info_error, {
        timeout: 2000,
        type: 'error',
      });
      return;
    }
    this.props.onTitleUpdate(newTitle);
    this._cancelEdit();
  };

  _cancelEdit = () => {
    this.setState({
      editItem: null,
      editItemName: '',
    });
  };

  _setLevelFrom = value => {
    this.setState({
      levelFrom: value,
    });
  };

  _setLevelTo = value => {
    this.setState({
      levelTo: value,
    });
  };

  _submitEditLevels = (newLevelFrom, newLevelTo) => {
    let { sport } = this.props.sportunity;
    let newLevels = this._getLevelsRange(newLevelFrom, newLevelTo).map(
      level => level.id,
    );
    let allLevelSelected = false;
    if (newLevels.length === sport.levels.length) {
      allLevelSelected = true;
    }
    let sportVar = {
      id: sport.sport.id,
      levels: newLevels,
    };

    this.props.onLevelsUpdate(sportVar);
    this._cancelEdit();
  };

  _getLevelsRange = (levelFrom, levelTo) => {
    let { levels } = this.props.sportunity.sport.sport;
    levels = levels.sort((a, b) => {
      if (
        a[localizations.getLanguage().toUpperCase()].skillLevel >
        b[localizations.getLanguage().toUpperCase()].skillLevel
      )
        return 1;
      else return -1;
    });

    if (!levelFrom || !levelTo) {
      return [];
    } else {
      let fromIndex = levels.findIndex(e => e.id == levelFrom.value);
      let toIndex = levels.findIndex(e => e.id == levelTo.value);
      let selectedLevels = levels.slice(fromIndex, toIndex + 1);
      return selectedLevels;
      //this.props.setSelectedLevels(selectedLevels)
    }
  };

  addToMyCalendar = () => {
    if (!this.props.user) {
      this.props.alert.show(localizations.event_login_needed_calendar, {
        timeout: 3000,
        type: 'error',
      });
      return;
    }
    let calendar = this.props.user.calendar
      ? {
          sportunities:
            this.props.user.calendar.sportunities &&
            this.props.user.calendar.sportunities.edges &&
            this.props.user.calendar.sportunities.edges.length > 0
              ? this.props.user.calendar.sportunities.edges.map(
                  sportunity => sportunity.node.id,
                )
              : [],
          users:
            this.props.user.calendar.users &&
            this.props.user.calendar.users.length > 0
              ? this.props.user.calendar.users.map(user => user.id)
              : [],
        }
      : {
          sportunities: [],
          users: [],
        };

    calendar.sportunities.push(this.props.sportunity.id);

    UpdateCalendarMutation.commit(
      {
        user: this.props.user,
        userIDVar: this.props.user.id,
        calendarVar: calendar,
      },
      {
        onFailure: error => {
          console.log(error);
          this.props.alert.show(localizations.event_update_calendar_error, {
            timeout: 3000,
            type: 'error',
          });
        },
        onSuccess: () => {
          this.props.alert.show(localizations.event_update_calendar_success, {
            timeout: 3000,
            type: 'success',
          });
          this.setState({
            isAlreadyAdded: true,
          });
        },
      },
    );
  };

  removeFromMyCalendar = () => {
    if (!this.props.user) {
      this.props.alert.show(localizations.event_login_needed_calendar, {
        timeout: 3000,
        type: 'error',
      });
      return;
    }

    let calendar = this.props.user.calendar
      ? {
          sportunities:
            this.props.user.calendar.sportunities &&
            this.props.user.calendar.sportunities.edges &&
            this.props.user.calendar.sportunities.edges.length > 0
              ? this.props.user.calendar.sportunities.edges.map(
                  sportunity => sportunity.node.id,
                )
              : [],
          users:
            this.props.user.calendar.users &&
            this.props.user.calendar.users.length > 0
              ? this.props.user.calendar.users.map(user => user.id)
              : [],
        }
      : {
          sportunities: [],
          users: [],
        };

    let sportunityIndex = calendar.sportunities.findIndex(sportunity => {
      return sportunity === this.props.sportunity.id;
    });

    calendar.sportunities.splice(sportunityIndex, 1);

    UpdateCalendarMutation.commit(
      {
        user: this.props.user,
        userIDVar: this.props.user.id,
        calendarVar: calendar,
      },
      {
        onFailure: error => {
          console.log(error);
          this.props.alert.show(localizations.event_update_calendar_error, {
            timeout: 3000,
            type: 'error',
          });
        },
        onSuccess: () => {
          this.props.alert.show(localizations.event_update_calendar_success, {
            timeout: 3000,
            type: 'success',
          });
          this.setState({
            isAlreadyAdded: false,
          });
        },
      },
    );
  };

  render() {
    const {
      viewer,
      sportunity,
      user,
      showBook,
      showJoinWaitingList,
      enableBook,
      onBook,
      onCancel,
      onOpponentBook,
      isLogin,
      onAdminModify,
      onAdminReOrganize,
      onAdminDisplayStatForm,
      isAuthorizedAdmin,
      isPotentialOpponent,
      onSeeAsAdmin,
      isFillingStatForm,
      isActive,
      isAdmin,
      isSecondaryOrganizer,
      isPotentialSecondaryOrganizer,
      isLoading,
      pathname,
      title,
      description,
    } = this.props;
    const levelOptions = sportunity.sport
      ? sportunity.sport.sport.levels
          .map(level => ({
            value: level.id,
            name: level[localizations.getLanguage().toUpperCase()].name,
            skillLevel:
              level[localizations.getLanguage().toUpperCase()].skillLevel,
            description:
              level[localizations.getLanguage().toUpperCase()].description,
          }))
          .sort((a, b) => {
            return a.skillLevel - b.skillLevel;
          })
      : [];

    return (
      <header style={styles.header}>
        <div style={styles.row}>
          <div style={styles.left}>
            <div style={styles.sportCol}>
              <div
                style={{
                  ...styles.userpic,
                  backgroundImage: `url(${sportunity.sport.sport.logo})`,
                }}
              />
              <div style={styles.privateOrPublic}>
                {localizations['event_kind_' + sportunity.kind.toLowerCase()]}
              </div>
            </div>

            <div style={styles.userInfo}>
              {this.state.editItem === 'title' ? (
                <div style={styles.row}>
                  <div style={styles.editTitle}>
                    <InputText
                      maxLength={'25'}
                      value={this.state.editItemName}
                      onChange={this._updateEditName}
                    />
                  </div>
                  <div
                    style={styles.validateEditionIcon}
                    onClick={() =>
                      this._validationEditTitle(this.state.editItemName)
                    }
                  >
                    <i className="fa fa-check" aria-hidden="true" />
                  </div>
                  <div
                    style={styles.removeIcon}
                    onClick={() => this._cancelEdit()}
                  >
                    <i className="fa fa-times" aria-hidden="true" />
                  </div>
                </div>
              ) : (
                <h1 style={styles.title}>
                  {sportunity.title}
                  {isAdmin && isActive && (
                    <span
                      onClick={() => this._editTitle(sportunity.title)}
                      style={{ display: 'flex' }}
                    >
                      <i
                        style={styles.pencil}
                        className="fa fa-pencil"
                        aria-hidden="true"
                      />
                    </span>
                  )}
                </h1>
              )}
              {this.state.editItem === 'level' ? (
                <div style={styles.row}>
                  <div style={styles.editTitle}>
                    <SportLevels
                      style={styles.select}
                      label={localizations.profile_level}
                      list={levelOptions}
                      from={this.state.levelFrom}
                      to={this.state.levelTo}
                      placeholder={
                        !sportunity.sport
                          ? localizations.profile_beforeSport
                          : localizations.newSportunity_levelHolder
                      }
                      onFromChange={this._setLevelFrom}
                      onToChange={this._setLevelTo}
                      disabled={!sportunity.sport}
                    />
                  </div>
                  <div
                    style={styles.validateEditionIcon}
                    onClick={() =>
                      this._submitEditLevels(
                        this.state.levelFrom,
                        this.state.levelTo,
                      )
                    }
                  >
                    <i className="fa fa-check" aria-hidden="true" />
                  </div>
                  <div
                    style={styles.removeIcon}
                    onClick={() => this._cancelEdit()}
                  >
                    <i className="fa fa-times" aria-hidden="true" />
                  </div>
                </div>
              ) : (
                <div style={styles.sportInfo}>
                  {sportunity.sport.levels.length ? (
                    <div style={styles.sportInfoNameLevels}>
                      <p style={styles.sportName}>
                        {this._sportNameTranslated(
                          sportunity.sport.sport.name,
                        )}
                      </p>
                      -
                      <span style={styles.sportLevel}>
                        {this._sportMinLevelTranslated(
                          sportunity.sport.levels,
                        )}
                      </span>
                      to
                      <span style={styles.sportLevel}>
                        {this._sportMaxLevelTranslated(
                          sportunity.sport.levels,
                        )}
                      </span>
                    </div>
                  ) : (
                    <div style={styles.sportInfoNameLevels}>
                      <p style={styles.sportName}>
                        {this._sportNameTranslated(
                          sportunity.sport.sport.name,
                        )}
                      </p>
                    </div>
                  )}
                  {isAdmin && isActive && (
                    <span
                      onClick={() => this._editLevel(sportunity.sport)}
                      style={{ display: 'flex' }}
                    >
                      <i
                        style={styles.pencil}
                        className="fa fa-pencil"
                        aria-hidden="true"
                      />
                    </span>
                  )}
                </div>
              )}
              <div style={styles.address}>
                <i
                  style={styles.marker}
                  className="fa fa-map-marker"
                  aria-hidden="true"
                />
                {sportunity.address &&
                  (sportunity.address.address === sportunity.address.city
                    ? sportunity.address.city
                    : sportunity.address.address +
                      ', ' +
                      sportunity.address.city)}
              </div>

              <div style={styles.participants}>
                {localizations.formatString(
                  sportunity.participants.length <= 1
                    ? localizations.event_numParticipant
                    : localizations.event_numParticipants,
                  sportunity.participants.length,
                )}
                .&nbsp;(
                {localizations.formatString(
                  localizations.event_min,
                  sportunity.participantRange.from,
                )}
                &nbsp;-{' '}
                {localizations.formatString(
                  localizations.event_max,
                  sportunity.participantRange.to,
                )}
                )
              </div>
              <div style={styles.sportActions}>
                <ContentHeader
                  {...this.props}
                  addToMyCalendar={this.addToMyCalendar}
                  removeFromMyCalendar={this.removeFromMyCalendar}
                />
              </div>
            </div>
          </div>

          <div style={styles.info}>
            <div style={styles.datetime}>
              {isSameDay(
                sportunity.beginning_date,
                sportunity.ending_date,
              ) && (
                <span style={styles.day}>
                  {formatWeekDays(sportunity.beginning_date)}
                </span>
              )}
              <span style={styles.dayBold}>
                {formatDateMonth(
                  sportunity.beginning_date,
                  sportunity.ending_date,
                )}
                {isPast(sportunity.beginning_date) && (
                  <span style={styles.day}>
                    {'  ' + formatYear(sportunity.beginning_date)}
                  </span>
                )}
              </span>
              <span style={styles.time}>
                {formatTime(sportunity.beginning_date, sportunity.ending_date)}
              </span>
            </div>
            <Price sportunity={sportunity} viewer={viewer} header={true} />
          </div>
        </div>

        {/* <div style={styles.menuRow}>
      <AddToCalendar
        user={user}
        sportunity={sportunity}
      />
      {isAdmin && sportunity.invited && sportunity.invited.length > 0 &&
        <RelaunchInvited
          sportunity={sportunity}
          viewer={viewer}
        />
      }
    </div> */}
      </header>
    );
  }
}

Header.defaultProps = {
  title: 'Basketball for fun',
  address: 'Gen�ve, Switzerland',
  participants: 50,
};

styles = {
  error: {
    fontFamily: 'Lato',
    color: colors.red,
    fontSize: 16,
    marginTop: 10,
    width: 180,
  },
  header: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.white,
    color: colors.black,
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.4)',
    padding: '47px 42px 25px',
    '@media (max-width: 600px)': {
      padding: '47px 30px 25px',
    },
    '@media (max-width: 750px)': {
      display: 'block',
    },
  },
  menuRow: {
    marginTop: 15,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    fontSize: 16,
    fontFamily: 'Lato',
    color: colors.lightGray,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    '@media (max-width: 750px)': {
      flexDirection: 'column',
    },
  },

  left: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    '@media (max-width: 580px)': {
      flexDirection: 'column',
      alignItems: 'center',
    },
  },

  sportCol: {
    display: 'flex',
    flexDirection: 'column',
    marginRight: 54,
    alignItems: 'center',
    '@media (max-width: 580px)': {
      margin: '0 auto 10px auto',
    },
  },

  sportName: {
    fontSize: 20,
    fontFamily: 'Lato',
    color: colors.black,
    fontWeight: 'bold',
    marginRight: 5,
  },
  sportLevel: {
    fontSize: 20,
    margin: '0 5px',
    color: colors.blue,
  },
  pencil: {
    fontSize: 20,
    color: colors.black,
    marginLeft: 10,
    cursor: 'pointer',
  },
  removeIcon: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    color: colors.redGoogle,
    cursor: 'pointer',
    flex: 1,
  },
  validateEditionIcon: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    color: colors.green,
    cursor: 'pointer',
  },
  userpic: {
    borderRadius: '50%',
    width: 120,
    height: 120,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },

  userInfo: {
    color: colors.white,
    fontFamily: 'Lato',
    fontSize: 22,
    fontWeight: 500,
  },

  title: {
    fontSize: 28,
    marginBottom: 13,
    maxWidth: 500,
    color: colors.blue,
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
  },
  editTitle: {
    display: 'flex',
    marginBottom: 13
  },

  address: {
    marginBottom: 15,
    marginTop: 15,
    color: colors.black,
    fontSize: '20px',
  },

  marker: {
    color: colors.blue,
    marginRight: 10,
    fontSize: 30,
  },

  participants: {
    display: 'flex',
    alignItems: 'center',
    color: colors.black,
    fontSize: '20px',
    marginBottom: '15px',
    '@media (max-width: 580px)': {
      display: 'block',
      textAlign: 'center',
    },
  },

  participantsMarker: {
    color: colors.white,
    fontSize: 16,
    marginRight: 14,
  },

  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.green,
    fontFamily: 'Lato',
  },
  privateOrPublic: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    fontFamily: 'Lato',
    '@media (max-width: 580px)': {
      display: 'block',
      textAlign: 'center',
      marginBottom: '15px',
    },
  },

  info: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  datetime: {
    color: colors.black,
    fontFamily: 'Lato',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  day: {
    fontSize: 22,
  },
  dayBold: {
    fontSize: 37,
    fontWeight: 'bold',
    borderBottom: '1px solid',
    borderBottomColor: colors.lightGray,
    paddingBottom: 10,
    marginBottom: 10,
    color: colors.gray,
  },
  time: {
    fontSize: 22,
  },
  dateMarker: {
    color: colors.white,
    fontSize: 16,
    marginRight: 12,
  },

  book: {
    backgroundColor: colors.green,
    color: colors.white,
    width: 180,
    // height: 57,
    borderRadius: 100,
    borderStyle: 'none',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    fontSize: 22,
    cursor: 'pointer',
    padding: '13px 5px',
    ':disabled': {
      cursor: 'not-allowed',
      backgroundColor: colors.gray,
    },
  },
  statButton: {
    backgroundColor: colors.green,
    color: colors.white,
    width: 180,
    borderRadius: 100,
    borderStyle: 'none',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    fontSize: 22,
    cursor: 'pointer',
    padding: '13px 5px',
    marginTop: 10,
  },
  cancel: {
    backgroundColor: colors.red,
    color: colors.white,
    width: 180,
    height: 57,
    borderRadius: 100,
    borderStyle: 'none',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    fontSize: 22,
    cursor: 'pointer',

    ':disabled': {
      cursor: 'not-allowed',
      backgroundColor: colors.gray,
    },
  },
  policy: {
    cursor: 'pointer',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 15,
    fontFamily: 'Lato',
  },
  sportInfoNameLevels: {
    display: 'flex',
    alignItems: 'center',
    color: colors.black,
  },
  sportInfo: {
    display: 'flex',
    alignItems: 'center',
  },
};

export default createFragmentContainer(withAlert(Radium(Header)), {
  viewer: graphql`
    fragment EventViewHeader_viewer on Viewer {
      id

      ...RelaunchInvited_viewer
      ...Price_viewer
    }
  `,
  user: graphql`
    fragment EventViewHeader_user on User {
      id
      calendar {
        sportunities(last: 100) {
          edges {
            node {
              id
            }
          }
        }
        users {
          id
        }
      }
      areStatisticsActivated
      profileType
    }
  `,
  sportunity: graphql`
    fragment EventViewHeader_sportunity on Sportunity {
      ...Price_sportunity
      id
      title
      address {
        address
        city
      }
      participants {
        id
      }
      invited {
        user {
          id
          pseudo
          avatar
        }
      }
      invited_circles(last: 10) {
        edges {
          node {
            id
            name
            mode
            type
            memberCount
            members {
              id
            }
            owner {
              id
              pseudo
              avatar
            }
          }
        }
      }
      price {
        cents
        currency
      }
      participantRange {
        from
        to
      }
      kind
      beginning_date
      ending_date
      survey {
        isSurveyTransformed
        surveyDates {
          beginning_date
          ending_date
          answers {
            user {
              id
              pseudo
              avatar
            }
            answer
          }
        }
      }
      pendingOrganizers {
        id
        circles(last: 20) {
          edges {
            node {
              members {
                id
              }
            }
          }
        }
        role
        secondaryOrganizerType {
          id
          name {
            FR
            EN
            DE
            ES
          }
        }
        customSecondaryOrganizerType
      }
      sport {
        sport {
          id
          logo
          levels {
            id
            EN {
              name
              skillLevel
              description
            }
            FR {
              name
              skillLevel
              description
            }
            DE {
              name
              skillLevel
              description
            }
          }
          name {
            EN
            FR
            DE
          }
        }
        allLevelSelected
        levels {
          id
          EN {
            name
            skillLevel
            description
          }
          FR {
            name
            skillLevel
            description
          }
          DE {
            name
            skillLevel
            description
          }
        }
        certificates {
          name {
            EN
            FR
            DE
          }
        }
        positions {
          EN
          FR
          DE
        }
      }
    }
  `,
});
