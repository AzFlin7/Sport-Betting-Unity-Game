import React, {Component} from 'react';
import { createRefetchContainer, graphql, QueryRenderer, } from 'react-relay';
import Radium from 'radium';
import moment from 'moment';
import cloneDeep from 'lodash/cloneDeep';
import { Link } from 'found';
import { Button } from '@material-ui/core';
import IconTint from 'react-icon-tint';
import isSameDay from 'date-fns/is_same_day';
import isPast from 'date-fns/is_past'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withAlert } from 'react-alert';

var Style = Radium.Style;
import * as types from '../../../actions/actionTypes.js';
import PureComponent from '../PureComponent';
import { colors, fonts } from '../../../theme';
import environment from 'sportunity/src/createRelayEnvironment';
import SetStatus from './SetStatus';
import localizations from '../../Localizations';
import BookUserMutation from '../../EventView/BookUserMutation';
import CancelUserMutation from '../../EventView/CancelUserMutation';
import UpdateSportunitySubscription from './Subscriptions/UpdateSportunitySubscription';

let styles;

const statusStyle = status => {
  switch (status) {
    case 'RED':
      return styles.red;
    case 'YELLOW':
      return styles.yellow;
    case 'GREY':
      return styles.lightGreen;
    case 'BLACK':
      return styles.darkGreen;
    case 'GREEN':
      return styles.darkGreen;
    case 'PINK': 
      return styles.pink;
    default:
      return styles.lightGreen;
  }
};

const statusColor = status => {
  switch (status) {
    case 'RED':
      return styles.colorRed;
    case 'YELLOW':
      return styles.colorYellow;
    case 'GREY':
      return styles.colorLightGreen;
    case 'BLACK':
      return styles.colorDarkGreen;
    case 'GREEN':
      return styles.colorDarkGreen;
    case 'PINK':
      return styles.colorPink;
    default:
      return styles.colorLightGreen;
  }
};

const ButtonsRow = ({displayBookButton, onBookClicked, bookTitle, displayCancelButton, onCancelClicked, cancelTitle}) => (
  <div style={styles.buttonsContainer}>
    <Style 
      scopeSelector=".bookButton" rules={{
        color: colors.white,
        fontFamily: 'inherit',
        backgroundColor: colors.buttonBlue,
        fontSize: '14px',
        textTransform: "none",
        boxShadow: "none",
        marginRight: 5,
        width: 100,
        transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
        height: 36
      }}
    />
    <Style 
      scopeSelector=".bookButton:hover" rules={{
        backgroundColor: colors.buttonBlue,
        filter: 'brightness(0.9)'
      }}
    />
    <Style 
      scopeSelector=".cancelButton" rules={{
        border: '1px solid ' + colors.buttonBlue, 
        color: colors.buttonBlue,
        fontFamily: 'inherit',
        backgroundColor: colors.white,
        fontSize: '14px',
        textTransform: "none",
        padding: '0 0.7rem',
        alignItems: 'center',
        boxShadow: "none",
        marginLeft: 5,
        width: 100,
        transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
        height: 36
      }}
    />
    <Style 
      scopeSelector=".cancelButton:hover" rules={{
        backgroundColor: colors.white,
        filter: 'brightness(0.9)'
      }}
    />
    {displayBookButton && 
      <Button className="bookButton" onClick={e => {e.preventDefault() ; e.stopPropagation(); onBookClicked();}}>
        {bookTitle}
      </Button>
    }
    {displayCancelButton && 
      <Button className="cancelButton" onClick={e => {e.preventDefault() ; e.stopPropagation(); onCancelClicked();}}>
        {cancelTitle}
      </Button>
    }
  </div>
)

class Sportunity extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isHover: false,
    };
  }

  componentDidMount() {
    this.sub = UpdateSportunitySubscription({sportunityId: this.props.sportunity.id});
    typeof window !== 'undefined' && window.addEventListener("beforeunload", this.onUnload)
  }

  componentWillUnmount() {
    !!this.sub && this.sub.dispose()
    typeof window !== 'undefined' && window.removeEventListener("beforeunload", this.onUnload)
  }

  onUnload = (ev) => {
    !!this.sub && this.sub.dispose()
  }

  _truncateString = (value, length) => {
    if (value.length <= length) {
      return value;
    }
    return `${value.substring(0, length - 3)}...`;
  };

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
    let levels = cloneDeep(sport.levels);
    if (levels && levels.length > 0)
      levels = levels.sort(
        (a, b) => a.EN.skillLevel - b.EN.skillLevel,
      );

    let sports;
    if (sport.allLevelSelected) {
      sports = sport.sport.levels.map(level =>
        this._translatedLevelName(level),
      );
    } else {
      sports = sport.levels.map(level => this._translatedLevelName(level));
    }

    if (sport.allLevelSelected || sport.levels.length === 0) {
      return localizations.event_allLevelSelected;
    } else if (sports.length === 1) {
      return sports[0];
    }
    return `${sports[0]} ${localizations.find_to} ${
      sports[sports.length - 1]
    }`;
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
      case 'it':
        translatedName = levelName.IT.name || levelName.EN.name;
        break;
      case 'de':
        translatedName = levelName.DE.name || levelName.EN.name;
        break;
      default:
        translatedName = levelName.EN.name;
        break;
    }
    return translatedName;
  };

  _onHover = () => {
    if (!this.state.isHover) {
      this.setState({
        isHover: true,
      });
    }
    if (typeof this.props.onHover === 'function') {
      this.props.onHover(this.props.sportunity.id);
    }
  };

  _onLeave = () => {
    if (this.state.isHover) {
      this.setState({
        isHover: false,
      });
    }
    if (typeof this.props.onLeave === 'function') {
      this.props.onLeave(this.props.sportunity.id);
    }
  };

  getUserSpecificPrice = (user, sportunity) => {
    if (sportunity.paymentStatus) {
      const index = sportunity.paymentStatus.findIndex(
        paymentStatus =>
          paymentStatus.status !== 'Canceled' &&
          user &&
          paymentStatus &&
          paymentStatus.user &&
          user.id === paymentStatus.user.id &&
          paymentStatus.price,
      );

      if (index >= 0) return sportunity.paymentStatus[index].price;
      return sportunity.price;
    }
    return sportunity.price;
  };

  _selectEvent = event => {
    this.props.selectEvent(this.props.sportunity);
  };

  _handleUserBook = () => {
    let userIsInvited =
      this.props.sportunity &&
      this.props.sportunity.status &&
      (this.props.sportunity.status.toLowerCase() === 'invited-grey' ||
        this.props.sportunity.status.toLowerCase() ===
          'invited-black' ||
        this.props.sportunity.status.toLowerCase() ===
          'invited-yellow');

    BookUserMutation.commit({
      viewer: this.props.viewer,
      sportunity: this.props.sportunity,
      user: this.props.viewer.me,
    },
    (response, errors) => {
      if (response && !errors) {
        this.props.alert.show(
          localizations.popup_sportunityBooking_success,
          {
            timeout: 2000,
            type: 'success',
          },
        );
        this._updateTutorialSteps();
      }
      else {
        this.props.alert.show(error.getError().source.errors[0].message, {
          timeout: 4000,
          type: 'error',
        });
      }
    },
    error => {
      this.props.alert.show(error.getError().source.errors[0].message, {
        timeout: 4000,
        type: 'error',
      });
    });
  }

  _handleUserCancel = () => {
    let userwasInvited =
      this.props.sportunity &&
      this.props.sportunity.invited &&
      this.props.sportunity.invited.length > 0 &&
      !!this.props.sportunity.invited.find(
        item => item && item.user && item.user.id === this.props.viewer.me.id,
      );

    CancelUserMutation.commit({
      viewer: this.props.viewer,
      sportunity: this.props.sportunity,
      user: this.props.viewer.me,
      invited: userwasInvited
      ? {
          user: this.props.viewer.me.id,
          answer: 'NO',
        }
      : null,
    },
    {
      onSuccess: () => {
        this.props.alert.show(
          localizations.popup_sportunityCancelBooking_success,
          {
            timeout: 2000,
            type: 'success',
          },
        );
        this._updateTutorialSteps();

      },
      onFailure: error => {
        this.props.alert.show(error.getError().source.errors[0].message, {
          timeout: 4000,
          type: 'error',
        });
      },
    });
  };

  _updateTutorialSteps = () => {
    const { tutorialSteps } = this.props;
    let newTutorialSteps = cloneDeep(tutorialSteps);

    newTutorialSteps['giveAvailabilitiesStep'] = true;
    this.props._updateStepsCompleted(newTutorialSteps);
  }

  render() {
    if (!this.props.sportunity || !this.props.sportunity.title) return <div></div>
    const sportunity = SetStatus(
      this.props.sportunity,
      this.props.sportunityStatus
        ? this.props.sportunityStatus
        : this.props.sportunity.status,
      this.props.viewer.me ? this.props.viewer.me.id : null,
    );
    const sportunityPrice = this.getUserSpecificPrice(
      this.props.viewer.me,
      sportunity,
    );

    let { isSelecting } = this.props;

    const organizer = sportunity.organizers.find(organizer => organizer.isAdmin,);
    isSelecting = isSelecting && organizer.organizer.id === this.props.viewer.me.id;

    const isBooked = this.props.sportunity.status.indexOf('Booked') >= 0;
    const isAvailable = this.props.sportunity.status.indexOf('Available') >= 0;
    const isInvited = this.props.sportunity.status.indexOf('Invited') >= 0;
    const isDeclined = this.props.sportunity.status.indexOf('Declined') >= 0;
    const isSurvey = (sportunity.survey && !sportunity.survey.isSurveyTransformed && sportunity.survey.surveyDates.length > 1)
    const isActivityFromSubAccount = this.props.viewer && this.props.viewer.me && this.props.viewer.me.subAccounts && this.props.viewer.me.subAccounts.length && this.props.viewer.me.subAccounts.findIndex(subAccount => subAccount.id === organizer.organizer.id)

    const displayBookButton = !!this.props.viewer.me && this.props.viewer.me.profileType === 'PERSON' && sportunityPrice.cents === 0 && (isInvited || isAvailable || isDeclined) && !isSurvey && !isActivityFromSubAccount
    const displayCancelButton = !!this.props.viewer.me && this.props.viewer.me.profileType === 'PERSON' && !isDeclined && ((sportunityPrice.cents === 0 && (isInvited || isAvailable)) || isBooked) && !isSurvey && !isActivityFromSubAccount

    return (
      <div
        style={styles.link}
        onMouseOver={this._onHover}
        onMouseLeave={this._onLeave}
      >
        <Link to={`/event-view/${sportunity.id}`} target={this.props.target} style={styles.card}>
          <div style={statusColor(sportunity.color)} />
          <div style={styles.container}>
            <div style={styles.top}>
              <span style={statusStyle(sportunity.color)}>
                {!(
                  sportunity.survey &&
                  !sportunity.survey.isSurveyTransformed &&
                  sportunity.survey.surveyDates.length > 1
                )
                  ? sportunity.displayStatus
                  : localizations.status_survey}
              </span>
              {isSameDay(
                new Date(sportunity.beginning_date),
                new Date(sportunity.ending_date),
              ) ? (
                <time
                  style={
                    isSelecting
                      ? { ...styles.datetime, marginRight: 20 }
                      : styles.datetime
                  }
                >
                  <div style={styles.date}>
                    {moment(new Date(sportunity.beginning_date)).format(
                      isPast(new Date(sportunity.beginning_date)) ? 'DD MMM YYYY' : 'ddd DD MMM',
                    )}
                  </div>
                  <div style={styles.time}>
                    {moment(new Date(sportunity.beginning_date)).format(
                      'H:mm',
                    )}{' '}
                    - {moment(new Date(sportunity.ending_date)).format('H:mm')}
                  </div>
                </time>
              ) : (
                <time
                  style={
                    isSelecting
                      ? { ...styles.datetime, marginRight: 20 }
                      : styles.datetime
                  }
                >
                  <div style={styles.date}>
                    {`${moment(new Date(sportunity.beginning_date)).format(
                      'ddd DD MMM',
                    )} - `}
                    <div style={styles.time}>
                      {moment(new Date(sportunity.beginning_date)).format(
                        'H:mm',
                      )}
                    </div>
                  </div>
                  <div style={styles.date}>
                    {`${moment(new Date(sportunity.ending_date)).format(
                      'ddd DD MMM',
                    )} - `}
                    <div style={styles.time}>
                      {moment(new Date(sportunity.ending_date)).format('H:mm')}
                    </div>
                  </div>
                </time>
              )}
            </div>
            <div style={styles.content}>
              <div style={styles.icon}>
                {this.state.isHover && !this.props.staticDisplay
                ? <IconTint
                    width="74"
                    height="74"
                    src={sportunity.sport.sport.logo}
                    color={colors.blue}
                  />
                : <img
                    src={sportunity.sport.sport.logo}
                    style={styles.iconImage}
                    alt=""
                  />
                }
              </div>
              <div style={styles.info}>
                <div style={styles.name}>
                  {this._truncateString(sportunity.title, 38)}
                </div>
                <div style={styles.sport}>
                  <span style={styles.sportName}>
                    {this._sportNameTranslated(sportunity.sport.sport.name)}
                  </span>
                  {!sportunity.sport.allLevelSelected && (
                    <span style={styles.qualification}>
                      &nbsp;-&nbsp;
                      {this.displayLevel(sportunity.sport)}
                    </span>
                  )}
                </div>
                <div style={styles.location}>
                  <i
                    style={styles.marker}
                    className="fa fa-map-marker"
                    aria-hidden="true"
                  />
                  <div style={styles.addressContainer}>
                    {sportunity.venue && sportunity.infrastructure ? (
                      <span style={{ marginBottom: 2 }}>
                        {`${sportunity.venue.name} - ${
                          sportunity.infrastructure.name
                        }`.length > 50
                          ? `${`${sportunity.venue.name} - ${
                              sportunity.infrastructure.name
                            }`.substring(0, 50)}...`
                          : `${sportunity.venue.name} - ${
                              sportunity.infrastructure.name
                            }`}
                      </span>
                    ) : (
                      sportunity.venue && (
                        <span style={{ marginBottom: 2 }}>
                          {sportunity.venue.name.length > 50
                            ? `${sportunity.venue.name.substring(0, 50)}...`
                            : sportunity.venue.name}
                        </span>
                      )
                    )}
                    <span>
                      {sportunity.address &&
                      sportunity.address.city.length > 50
                        ? `${(
                            sportunity.address && sportunity.address.city
                          ).substring(0, 50)}...`
                        : sportunity.address && sportunity.address.city}
                    </span>
                  </div>
                </div>
                {sportunity.organizers
                  .filter(organizer => organizer.isAdmin)
                  .map((organizer, index) => (
                    <span style={styles.organizerContainer} key={index}>
                      <div
                        style={{
                          ...styles.organizerAvatar,
                          backgroundImage: organizer.organizer.avatar
                            ? `url(${organizer.organizer.avatar})`
                            : 'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")',
                        }}
                      />
                      <div style={styles.organizerPseudo}>
                        {organizer.organizer.pseudo}
                      </div>

                      {sportunity.game_information &&
                        sportunity.game_information.opponent &&
                        sportunity.game_information.opponent.organizer && (
                          <span style={styles.opponentContainer}>
                            <div
                              style={{
                                ...styles.organizerPseudo,
                                marginRight: 5,
                                color: colors.blue,
                              }}
                            >
                              {` ${localizations.against_short}`}
                            </div>
                            <div
                              style={{
                                ...styles.organizerAvatar,
                                backgroundImage: sportunity.game_information
                                  .opponent.organizer.avatar
                                  ? `url(${
                                      sportunity.game_information.opponent
                                        .organizer.avatar
                                    })`
                                  : 'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")',
                              }}
                            />
                            <div style={styles.organizerPseudo}>
                              {
                                sportunity.game_information.opponent.organizer
                                  .pseudo
                              }
                            </div>
                          </span>
                        )}
                      {sportunity.game_information &&
                        sportunity.game_information.opponent &&
                        !sportunity.game_information.opponent.organizer &&
                        sportunity.game_information.opponent
                          .organizerPseudo && (
                          <span style={styles.opponentContainer}>
                            <div
                              style={{
                                ...styles.organizerPseudo,
                                marginRight: 5,
                                color: colors.blue,
                              }}
                            >
                              {` ${localizations.against_short}`}
                            </div>
                            <div
                              style={{
                                ...styles.organizerAvatar,
                                backgroundImage:
                                  'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")',
                              }}
                            />
                            <div style={styles.organizerPseudo}>
                              {
                                sportunity.game_information.opponent
                                  .organizerPseudo
                              }
                            </div>
                          </span>
                        )}
                      {sportunity.game_information &&
                      
                        sportunity.game_information.opponent &&
                        !sportunity.game_information.opponent.organizer && 
                        !sportunity.game_information.opponent.organizerPseudo && 
                        sportunity.game_information.opponent.unknownOpponent && (
                          <span style={styles.opponentContainer}>
                            <div
                              style={{
                                ...styles.organizerPseudo,
                                marginRight: 5,
                                color: colors.blue,
                              }}
                            >
                              {` ${localizations.against_short}`}
                            </div>
                            <div
                              style={{
                                ...styles.organizerAvatar,
                                backgroundImage:
                                  'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")',
                              }}
                            />
                            <div style={styles.organizerPseudo}>
                              {
                                localizations.newSportunity_unknown_opponent_short
                              }
                            </div>
                          </span>
                        )}
                      {this.props.sportunity.status.indexOf('Organized') >=
                        0 &&
                        sportunity.game_information &&
                        sportunity.game_information.opponent &&
                        (sportunity.game_information.opponent
                          .lookingForAnOpponent ||
                          (sportunity.game_information.opponent
                            .invitedOpponents &&
                            sportunity.game_information.opponent
                              .invitedOpponents.edges &&
                            sportunity.game_information.opponent
                              .invitedOpponents.edges.length > 0)) && (
                              <span style={styles.opponentContainer}>
                            <div
                                  style={{
                                ...styles.organizerPseudo,
                                marginRight: 5,
                                color: colors.blue,
                              }}
                                >
                                  {` ${localizations.against_short}`}
                                </div>
                            <div
                                  style={{
                                ...styles.organizerAvatar,
                                backgroundImage:
                                  'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")',
                              }}
                                />
                            <div style={styles.organizerPseudo}>
                                  {localizations.newSportunity_waiting_opponent}
                                </div>
                          </span>
                        )}
                    </span>
                  ))}
              </div>
            </div>
             <div style={styles.bottom}>
              <span style={styles.participants}>
                {sportunity.participants.length} Participant
                {sportunity.participants.length > 1 ? 's' : ''}
              </span>

              {sportunity.status === 'Past' || sportunity.status === 'Cancelled' 
              ? (sportunity.score && sportunity.sportunityTypeStatus && (
                  <div style={styles.score}>
                    {
                      sportunity.sportunityType.name[
                        localizations.getLanguage().toUpperCase()
                      ]
                    }
                    <br />
                    {`${
                      sportunity.sportunityTypeStatus.name[
                        localizations.getLanguage().toUpperCase()
                      ]
                    } `}
                    {`${sportunity.score.currentTeam} - ${
                      sportunity.score.adversaryTeam
                    }`}
                  </div>
                ))
              : <span style={styles.price}>
                  {sportunityPrice.cents === 0
                  ? displayBookButton || displayCancelButton
                    ? <ButtonsRow
                        displayBookButton={displayBookButton}
                        displayCancelButton={displayCancelButton}
                        onBookClicked={this._handleUserBook}
                        onCancelClicked={this._handleUserCancel}
                        bookTitle={localizations.event_accept_invitation_short} 
                        cancelTitle={localizations.event_decline_invitation_short}
                      />
                    : localizations.event_free
                  : `${sportunityPrice.currency} ${sportunityPrice.cents / 100}`
                  }
                </span>
              }
            </div>
          </div>
        </Link>
        {isSelecting &&
          this.props.sportunity && (
            <div style={styles.selectEvent}>
              <input
                style={styles.checkbox}
                type="checkbox"
                checked={this.props.checked}
                onChange={this._selectEvent}
              />
            </div>
          )}
      </div>
    );
  }
}

styles = {
  selectEvent: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  card: {
    textDecoration: 'none',
    width: '100%',
    height: 215,
    display: 'flex',
    backgroundColor: colors.white,
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12)',
    border: '1px solid #E7E7E7',
    overflow: 'hidden',
    marginBottom: 15,
    fontFamily: 'Lato',
    '@media (maxWidth: 600px)': {
      height: 250,
    },
  },
  colorActive: {
    width: 8,
    height: '100%',
    backgroundColor: colors.green,
  },
  colorGray: {
    width: 8,
    height: '100%',
    backgroundColor: colors.gray,
  },
  colorBlack: {
    width: 8,
    height: '100%',
    backgroundColor: colors.black,
  },
  colorYellow: {
    width: 8,
    height: '100%',
    backgroundColor: colors.yellow,
  },
  colorGreen: {
    width: 8,
    height: '100%',
    backgroundColor: colors.green,
  },
  colorRed: {
    width: 8,
    height: '100%',
    backgroundColor: colors.red,
  },
  colorLightGreen: {
    width: 8,
    height: '100%',
    backgroundColor: colors.lightGreen,
  },
  colorDarkGreen: {
    width: 8,
    height: '100%',
    backgroundColor: colors.darkGreen,
  },
  colorPink: {
    width: 8,
    height: '100%',
    backgroundColor: colors.pink,
  },
  black: {
    textTranform: 'uppercase',
    fontWeight: 'bold',
    fontSize: 20,
    color: colors.black,
  },
  gray: {
    textTranform: 'uppercase',
    fontWeight: 'bold',
    fontSize: 20,
    color: colors.gray,
  },
  yellow: {
    textTranform: 'uppercase',
    fontWeight: 'bold',
    fontSize: 20,
    color: colors.yellow,
  },
  red: {
    textTranform: 'uppercase',
    fontWeight: 'bold',
    fontSize: 20,
    color: colors.red,
  },
  lightGreen: {
    textTranform: 'uppercase',
    fontWeight: 'bold',
    fontSize: 20,
    color: colors.lightGreen,
  },
  darkGreen: {
    textTranform: 'uppercase',
    fontWeight: 'bold',
    fontSize: 20,
    color: colors.darkGreen,
  },
  green: {
    textTranform: 'uppercase',
    fontWeight: 'bold',
    fontSize: 20,
    color: colors.green,
  },
  pink: {
    textTranform: 'uppercase',
    fontWeight: 'bold',
    fontSize: 20,
    color: colors.pink
  },
  color: {
    width: 8,
    height: '100%',
    backgroundColor: colors.green,
  },
  container: {
    width: '100%',
    height: '100%',
    padding: '10px 15px 5px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  top: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
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
    display: 'flex',
  },
  time: {
    color: '#939393',
  },
  content: {
    display: 'flex',
    // marginBottom: 26,
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
    color: colors.white,
    width: 74,
    height: 74,
  },
  organizerContainer: {
    marginTop: 5,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 16,
  },
  opponentContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 16,
    marginLeft: 5,
  },
  organizerPseudo: {
    fontWeight: 500,
    color: colors.black,
    fontFamily: 'Lato',
  },
  organizerAvatar: {
    width: 15,
    height: 15,
    marginRight: 5,
    borderRadius: '50%',
    backgroundColor: colors.white,
    backgroundPosition: '50% 50%',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  },
  info: {},
  name: {
    color: 'rgba(0, 0, 0, 0.65)',
    fontSize: 20,
    fontWeight: 'bold',
    display: 'block',
    marginBottom: 11,
    textDecoration: 'none',
    maxWidth: '300px',
    marginRight: 20,
  },

  sport: {
    marginBottom: 10,
  },

  sportName: {
    color: colors.blue,
    fontSize: 16,
  },

  qualification: {
    fontSize: 13,
    color: colors.black,
  },

  location: {
    fontSize: 16,
    fontWeight: 500,
    color: colors.black,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },

  addressContainer: {
    display: 'flex',
    flexDirection: 'column',
  },

  marker: {
    marginRight: 11,
    color: colors.blue,
  },

  score: {
    color: colors.blue,
    fontSize: 16,
    marginTop: 5,
    marginLeft: 15,
    textAlign: 'center',
  },

  bottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  link: {
    position: 'relative',
    width: '100%',
  },
  checkbox: {
    borderWidth: 0,
    borderBottomWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.blue,
    lineHeight: '32px',
    fontFamily: 'Lato',
    color: 'rgba(0,0,0,0.65)',
    display: 'block',
    background: 'transparent',
    fontSize: fonts.size.medium,
    outline: 'none',
    cursor: 'pointer',
    width: 18,
    height: 18,
    ':disabled': {
      backgroundColor: colors.gray,
    },
  },
  buttonsContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
};

const _updateStepsCompleted = (steps) => ({
  type: types.UPDATE_STEPS_COMPLETED,
  tutorialSteps: steps,
});

const dispatchToProps = (dispatch) => ({
  _updateStepsCompleted: bindActionCreators(_updateStepsCompleted, dispatch),
});

const stateToProps = (state) => ({
  tutorialSteps: state.profileReducer.tutorialSteps,
});

let ReduxContainer = connect(
  stateToProps,
  dispatchToProps,
)(withAlert(Radium(Sportunity)));

const SportunityTemp = createRefetchContainer(ReduxContainer, {
  viewer: graphql`
    fragment Sportunity_viewer on Viewer
      @argumentDefinitions(
        id: {type: "ID"},
        sportunityId: { type: "String" },
        userId: { type: "String" },
        shouldQueryUserStatus: { type: "Boolean!", defaultValue: false }
      ) {
      id
      me {
        id
        profileType
        subAccounts {
          id
        }
      }
      sportunity (id: $id) {
        ...Sportunity_sportunity
      }
      sportunityStatus(sportunityId: $sportunityId, userId: $userId) @include(if: $shouldQueryUserStatus)
    }
  `,
  sportunity: graphql`
    fragment Sportunity_sportunity on Sportunity {
      id
      title
      description
      beginning_date
      ending_date
      survey {
        isSurveyTransformed
        surveyDates {
          answers {
            user {
              id
              pseudo
            }
            answer
          }
        }
      }
      sportunityType {
        id
        name {
          EN
          FR
        }
      }
      sportunityTypeStatus {
        id
        name {
          EN
          FR
        }
      }
      score {
        currentTeam
        adversaryTeam
      }
      game_information {
        opponent {
          organizerPseudo
          unknownOpponent
          lookingForAnOpponent
          organizer {
            id
            pseudo
            avatar
          }
          invitedOpponents(last: 5) {
            edges {
              node {
                id
                members {
                  id
                }
              }
            }
          }
        }
      }
      address {
        address
        city
        country
        position {
          lat
          lng
        }
      }
      status
      kind
      venue {
        id
        name
      }
      infrastructure {
        id
        name
      }
      participants {
        id
      }
      price {
        currency
        cents
      }
      paymentStatus {
        status
        user {
          id
        }
        price {
          currency
          cents
        }
      }
      organizers {
        organizer {
          id
          pseudo
          avatar
        }
        isAdmin
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
          logo
          id
          name {
            EN
            FR
            DE
          }
          assistantTypes {
            id
            name {
              FR
              EN
              DE
              ES
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
            DE {
              name
              skillLevel
            }
          }
        }
        allLevelSelected
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
          DE {
            name
            skillLevel
          }
        }
      }
    }
  `,
}, graphql`
  query SportunityRefetchQuery (
    $id: ID,
    $sportunityId: String,
    $userId: String,
    $shouldQueryUserStatus: Boolean!
  ) {
    viewer {
      ...Sportunity_viewer @arguments (
        id: $id,
        sportunityId: $sportunityId,
        userId: $userId,
        shouldQueryUserStatus: $shouldQueryUserStatus
      )
    }
  }
`);

export default class extends Component {
  render() {
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query SportunityQuery(
            $id: ID,
            $sportunityId: String,
            $userId: String,
            $shouldQueryUserStatus: Boolean!
          ) {
            viewer {
              ...Sportunity_viewer @arguments(
                id: $id,
                sportunityId: $sportunityId,
                userId: $userId,
                shouldQueryUserStatus: $shouldQueryUserStatus
              )
            }
          }
        `}
        variables={{
          id: this.props.sportunity.id,
          sportunityId: this.props.sportunity.id,
          userId: this.props.userId,
          shouldQueryUserStatus: false
        }}
        render={({error, props}) => {
          if (props) {
            return <SportunityTemp query={props} viewer={props.viewer} {...this.props}/>;
          } else {
            return (
              <div></div>
            )
          }
        }}
      />
    )
  }
}
