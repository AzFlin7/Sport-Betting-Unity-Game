import React, { Component } from 'react';
import { createRefetchContainer, graphql } from 'react-relay/compat';
import Radium from 'radium';
import { Link } from 'found';
import cloneDeep from 'lodash/cloneDeep';
import { withAlert } from 'react-alert';
import { Button } from '@material-ui/core';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import UnsubscribeFromCircleMutation from './mutation/UnsubscribeFromCircle';
import CircleMutation from '../Circle/AddCircleMemberMutation';
import * as types from '../../actions/actionTypes.js';
import { colors } from '../../theme';
import localizations from '../Localizations';

var Style = Radium.Style;

let styles;

class CircleItem extends Component {
  constructor() {
    super();
    this.state = {
      isLoading: false,
    };
  }
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

  _updateTutorialSteps = circle => {
    const { tutorialSteps } = this.props;
    let newTutorialSteps = cloneDeep(tutorialSteps);

    if (circle && circle.mode === 'PUBLIC')
      newTutorialSteps['joinAPublicCircleStep'] = true;
    else if (circle && circle.mode === 'PRIVATE')
      newTutorialSteps['joinAPrivateCircleStep'] = true;

    this.props._updateStepsCompleted(newTutorialSteps);
  };

  _handleSubscribe = () => {
    this.setState({ isLoading: true });
    CircleMutation.commit(
      {
        viewer: this.props.viewer,
        idVar: this.props.circle.id,
        newUserIdVar: this.props.viewer.me.id,
        circle: this.props.circle,
      },
      {
        onFailure: error => {
          this.props.alert.show(localizations.circles_unsubscribe_error, {
            timeout: 2000,
            type: 'error',
          });
          this.setState({ isLoading: false });
        },
        onSuccess: response => {
          this.props.alert.show(this.props.circle.shouldValidateNewUser ? localizations.circle_subscribe_pending_success : localizations.circle_subscribe_success, {
            timeout: 2000,
            type: 'success',
          });
          this.setState({ isLoading: false });
          this._updateTutorialSteps(this.props.circle);

          if (typeof this.props.handleRefetch !== 'undefined')
            this.props.handleRefetch();
        },
      },
    );
  };

  _haneleUnSubscribe = () => {
    this.setState({ isLoading: true });
    const params = {
      circleIdVar: this.props.circle.id,
      userIdVar: this.props.viewer.me.id,
      viewer: this.props.viewer,
    };

    UnsubscribeFromCircleMutation.commit(params, {
      onFailure: error => {
        this.props.alert.show(localizations.circles_unsubscribe_error, {
          timeout: 2000,
          type: 'error',
        });
        this.setState({ isLoading: false });
      },
      onSuccess: response => {
        this.props.alert.show(
          `${localizations.circles_unsubscribe_success} ${
            this.props.circle.name
          }`,
          {
            timeout: 2000,
            type: 'success',
          },
        );

        this.setState({ isLoading: false });
        if (typeof this.props.handleRefetch !== 'undefined')
          this.props.handleRefetch();
      },
    });
  };

  render() {
    const {
      circle,
      onCircleClicked,
      viewer: { me },
    } = this.props;
    const { isLoading } = this.state;

    let listType = {
      adults: localizations.circles_member_type_0,
      children: localizations.circles_member_type_1,
      teams: localizations.circles_member_type_2,
      clubs: localizations.circles_member_type_3,
      companies: localizations.circles_member_type_4,
    };

    const circleIsMine = circle && me && circle.owner.id === me.id;

    let displayJoinButton =
      !isLoading &&
      me &&
      !circleIsMine &&
      !circle.isCurrentUserAMember &&
      circle.type !== 'CHILDREN' &&
      circle.waitingMembers && 
      circle.waitingMembers.findIndex(waiting => waiting.id === me.id) < 0 && 
      circle.refusedMembers && 
      circle.refusedMembers.findIndex(refused => refused.id === me.id) < 0 && 
      (!circle.termsOfUses || circle.termsOfUses.length === 0) &&
      ((circle.type === 'ADULTS' && me.profileType === 'PERSON') ||
        ((circle.type === 'TEAMS' || circle.type === 'CLUBS') &&
          me.profileType === 'ORGANIZATION') ||
        (circle.type === 'COMPANIES' &&
          (me.profileType === 'BUSINESS' || me.profileType === 'SOLETRADER')));

    let displayLeaveButton = circle.isCurrentUserAMember && !isLoading;

    let displayPendingButton = 
      !isLoading && 
      me && 
      circle && 
      circle.waitingMembers && 
      circle.waitingMembers.findIndex(waiting => waiting.id === me.id) >= 0;

    return (
      <div style={{...styles.button, width: this.props.fullWidth ? '100%' : 600}}>
        <Link
          to={this.props.link}
          target={this.props.target}
          style={styles.buttonLink}
          onClick={() => {
            if (this.props.openCircle) {
              this.props.openCircle();
            }
          }}
        >
          <div style={styles.buttonIconWrapper}>
            <div style={styles.buttonIcon}>
              <img src="/images/Group.svg" style={{ height: '60px' }} />
              <div style={styles.numberContainer}>
                <span style={styles.number}>
                  {circle && circle.memberCount}
                </span>
              </div>
              {circle.type && (
                <div style={styles.buttonIconText}>
                  {listType[circle.type.toLowerCase()]}
                </div>
              )}
            </div>
          </div>
          <div style={styles.circleDetails}>
            <div style={styles.leftSide}>
              <div style={styles.top}>
                <div style={styles.buttonText}>{circle.name}</div>
                {circle.address && (
                  <div style={styles.params}>
                    <span style={{ color: colors.darkGray }}>
                      {circle.address ? circle.address.city : null}
                    </span>
                  </div>
                )}
                {circle.sport && circle.sport.sport && (
                  <div style={styles.sports}>
                    <img
                      src={
                        circle.sport
                          ? circle.sport.sport.logo
                          : '/images/information.png'
                      }
                      style={styles.sportImage}
                    />
                    <span style={styles.sportParams}>
                      {circle.sport
                        ? this._sportNameTranslated(circle.sport.sport.name)
                        : null}
                    </span>
                  </div>
                )}
                {circle.sport && circle.sport.levels && (
                  <div style={styles.qualification}>
                    <span>
                      {circle.sport ? this.displayLevel(circle.sport) : null}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div style={styles.rightSide}>
              {circle.owner && (
                <div style={styles.buttonPseudo}>
                  <div
                    style={{
                      ...styles.icon,
                      backgroundImage: circle.owner.avatar
                        ? 'url(' + circle.owner.avatar + ')'
                        : 'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")',
                    }}
                  />
                  {circle.owner.pseudo}
                </div>
              )}

              <Style
                scopeSelector=".joinButton"
                rules={{
                  color: colors.white,
                  fontFamily: 'inherit',
                  backgroundColor: colors.buttonBlue,
                  fontSize: '14px',
                  textTransform: 'none',
                  boxShadow: 'none',
                  marginRight: 5,
                  width: 100,
                  transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
                  height: 36,
                }}
              />
              <Style
                scopeSelector=".joinButton:hover"
                rules={{
                  backgroundColor: colors.buttonBlue,
                  filter: 'brightness(0.9)',
                }}
              />
              <Style
                scopeSelector=".leaveButton"
                rules={{
                  border: '1px solid ' + colors.buttonBlue,
                  color: colors.buttonBlue,
                  fontFamily: 'inherit',
                  backgroundColor: colors.white,
                  fontSize: '14px',
                  textTransform: 'none',
                  padding: '0 0.7rem',
                  alignItems: 'center',
                  boxShadow: 'none',
                  marginLeft: 5,
                  width: 100,
                  transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
                  height: 36,
                }}
              />
              <Style
                scopeSelector=".leaveButton:hover"
                rules={{
                  backgroundColor: colors.white,
                  filter: 'brightness(0.9)',
                }}
              />
              <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'}}>
                {displayJoinButton && !this.props.showStatistics && (
                  <Button
                    className="joinButton"
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      this._handleSubscribe();
                    }}
                  >
                    {localizations.circle_subscribe_short}
                  </Button>
                )}
                {displayPendingButton && !this.props.showStatistics && (
                  <Button
                  className="leaveButton"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  {localizations.circle_subscription_pending}
                </Button>
                )}
                {displayLeaveButton && !this.props.showStatistics && (
                  <Button
                    className="leaveButton"
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      this._haneleUnSubscribe();
                    }}
                  >
                    {localizations.circles_unsubscribeShort}
                  </Button>
                )}

                {this.props.showRemoveButton && 
                  <div 
                    style={{padding: 5, marginLeft: 25}}
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      this.props.handleOnremove()
                    }}>
                    <i className="fa fa-times" style={styles.iconRemove} />
                  </div>
                }
              </div>

              {this.props.showStatistics 
              ? <p style={styles.showStatistics}>
                  {localizations.profile_statistics_showStat}
                </p>
              : <div style={styles.circleScopeParams}>
                  {circle && circle.mode === 'PRIVATE'
                    ? localizations.circles_private
                    : localizations.circles_public}
                  {circle &&
                    circle.isCircleUsableByMembers &&
                    ' - ' + localizations.circles_shared}
                </div>
              }
              
              {/* {circle && circle.isCircleUsableByMembers &&
                  <div style={styles.params}>{localizations.circles_shared}</div>
                } */}
            </div>
          </div>
        </Link>
      </div>
    );
  }
}

styles = {
  params: {
    fontSize: 14,
    lineHeight: '20px',
  },
  circleScopeParams: {
    fontSize: '13px',
    lineHeight: '20px',
  },
  button: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  joinButton: {
    backgroundColor: colors.blue,
    boxSizing: 'border-box',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    cursor: 'pointer',
    height: '40px',
    width: '90px',
    fontSize: '13px',
    color: colors.white,
  },
  leaveButton: {
    backgroundColor: colors.white,
    boxSizing: 'border-box',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    cursor: 'pointer',
    height: '40px',
    width: '90px',
    fontSize: '13px',
    color: colors.blue,
    border: '1px solid ' + colors.blue,
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

  qualification: {
    fontSize: '12px',
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
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  unsubScribeIcon: {
    color: colors.redGoogle,
    cursor: 'pointer',
    position: 'absolute',
    fontSize: 12,
    top: 5,
    right: 10,
    lineHeight: '12px',
    padding: '3px',
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
    color: colors.black,
    textDecoration: 'none',
    cursor: 'pointer',
    flex: 8,
    display: 'flex',
    flexDirection: 'row',
  },
  numberContainer: {
    position: 'absolute',
    top: '11px',
    left: '18px',
    width: 24,
    textAlign: 'center',
  },
  number: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.darkGray,
  },
  rightSide: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: 16,
    lineHeight: '20px',
    justifyContent: 'space-between',
    textAlign: 'right',
    flex: 2,
  },
  icon: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    marginRight: 7,
    backgroundPosition: '50% 50%',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
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
  iconRemove: {
    color: colors.black,
    cursor: 'pointer',
    fontSize: '17px',
  },
};

const _updateStepsCompleted = steps => ({
  type: types.UPDATE_STEPS_COMPLETED,
  tutorialSteps: steps,
});

const stateToProps = state => ({
  tutorialSteps: state.profileReducer.tutorialSteps,
});

const dispatchToProps = dispatch => ({
  _updateStepsCompleted: bindActionCreators(_updateStepsCompleted, dispatch),
});

const ReduxContainer = connect(
  stateToProps,
  dispatchToProps,
)(Radium(CircleItem));

export default createRefetchContainer(withAlert(Radium(ReduxContainer)), {
  //OK
  circle: graphql`
    fragment MyCirclesCircleItem_circle on Circle {
      id
      name
      mode
      type
      isCircleUpdatableByMembers
      isCircleUsableByMembers
      isCurrentUserAMember
      shouldValidateNewUser
      memberCount
      waitingMembers {
        id
      }
      refusedMembers {
        id
      }
      owner {
        id
        pseudo
        avatar
      }
      address {
        address
        city
        country
      }
      termsOfUses {
        id
      }
      sport {
        sport {
          id
          logo
          name {
            FR
            EN
            ES
            DE
          }
        }
        levels {
          FR {
            name
            description
          }
          EN {
            name
            description
          }
          ES {
            name
            description
          }
          DE {
            name
            description
          }
        }
      }
    }
  `,
});
