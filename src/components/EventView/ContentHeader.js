import React from 'react';
import Radium from 'radium';

import { colors } from '../../theme';
import localizations from '../Localizations';
import Slider from './Slider';
import ReactTooltip from 'react-tooltip';
import { withRouter } from 'found';

let styles;

const Button = props => (
  <button
    onClick={props.onClick}
    style={{ ...styles.button, backgroundColor: props.color }}
  >
    <ReactTooltip effect="solid" multiline={true} place='right'/>  
    {props.icon && <i style={styles.icon} className={props.icon} />}

    {props.text}

    {props.dataTip && (
      <span style={{ marginLeft: 15 }} data-tip={props.dataTip}>
        <i className={props.dataTipIcon} aria-hidden="true" />
      </span>
    )}
  </button>
);

class ContentHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isMenuVisible: false,
      isLoading: true
    };
  }

  componentDidMount() {
    window.addEventListener('click', this._handleClickOutside);
    setTimeout(() => this.setState({isLoading: false}), 500) // Don't delete this, React doesn't refresh the color
  }

  componentWillUnmount() {
    window.removeEventListener('click', this._handleClickOutside);
  }

  _handleClickOutside = event => {
    if (this._containerNode && !this._containerNode.contains(event.target)) {
      this.setState({
        isMenuVisible: false,
      });
    }
  };

  getButtonsList = () => {
    if (this.state.isLoading) return []
    const {
      sportunity,
      status,
      showBook,
      showJoinWaitingList,
      enableBook,
      viewer,
      isActive,
      isPast,
      isSecondaryOrganizer,
      isPotentialSecondaryOrganizer,
      isAdmin,
      isAuthorizedAdmin,
      isPotentialOpponent,
      isLogin,
      isCancelled,
      userIsInvited,
      userDeclined,
      userIsOnWaitingList,
      userIsParticipant,
      organizers,
      isLoading,
      user,
      isSurvey,
    } = this.props;
    let buttonsList = [];

    let { calendar } = this.props.user || {};
    let isAlreadyAdded = false;

    if (
      calendar &&
      calendar.sportunities &&
      calendar.sportunities.edges &&
      calendar.sportunities.edges.length > 0
    ) {
      calendar.sportunities.edges.forEach(sportunity => {
        if (sportunity.node.id === this.props.sportunity.id)
          isAlreadyAdded = true;
      });
    }

    if (isAuthorizedAdmin) {
      // See As Admin
      buttonsList.push({
        key: 'seeAsAdmin',
        text: localizations.event_see_as_organizer,
        onClick: this.props.onSeeAsAdmin,
        color: colors.green,
        disabled: isLoading,
        icon: 'fa fa-eye',
        priority: 0,
      });
    } 
    else if (isAdmin) {
      if (!isPast && !isCancelled) {
        // Modify event
        buttonsList.push({
          key: 'modify',
          text: localizations.event_modify,
          onClick: this.props.onAdminModify,
          color: colors.green,
          disabled: !isActive || isLoading,
          priority: 0,
        });

        // Cancel event
        buttonsList.push({
          key: 'adminCancel',
          text: localizations.event_cancel,
          onClick: this.props.onAdminCancel,
          color: colors.redGoogle,
          disabled: !isActive || isLoading,
          priority: 0,
        });

        if (isSecondaryOrganizer && !isSurvey) {
          // Cancel co-organization
          buttonsList.push({
            key: 'adminCancel',
            text: localizations.event_pendingSecondaryOrganizerCancelationButton,
            onClick: this.props.onSecondaryOrganizerCancel,
            color: colors.redGoogle,
            disabled: !isActive || isLoading,
            priority: 2,
          });
        }

        if (userIsParticipant && !isPast && !isCancelled) {
          // Participant cancels
          buttonsList.push({
            key: 'cancel',
            text: localizations.event_cancel + ' (participation)',
            onClick: this.props.onCancel,
            color: colors.redGoogle,
            disabled: isLoading,
            icon: 'fa fa-times',
            priority: 2,
            dataTip:
              localizations.event_confirmation_popup_cancellation_policy_details,
            dataTipIcon: 'fa fa-question-circle',
          });
        }

        if (!isSurvey) {
          // Add to calendar
          buttonsList.push({
            key: 'addToCalendar',
            text: isAlreadyAdded
              ? localizations.event_remove_from_calendar
              : localizations.event_add_to_calendar,
            color: colors.darkGray,
            onClick: isAlreadyAdded
              ? this.props.removeFromMyCalendar
              : this.props.addToMyCalendar,
            disabled: isLoading,
            icon: 'fa fa-calendar-alt',
            priority: 2,
          });
        }

        // Admin books
        if (!userIsParticipant && !isSurvey && user.profileType === 'PERSON') {
          buttonsList.push({
            key: 'adminBook',
            text: localizations.event_organizer_book,
            onClick: this.props.onBook,
            color: colors.green,
            disabled: isLoading,
            priority: 1,
          });
        }
      }

      // Admin re-organize
      buttonsList.push({
        key: 'adminReOrganize',
        text: localizations.event_organize_again,
        onClick: this.props.onAdminReOrganize,
        color: colors.green,
        disabled: isLoading,
        icon: 'fa fa-share',
        priority: 1,
      });

      if (isCancelled) {
        buttonsList.push({
          key: 'adminDelete',
          text: localizations.event_delete,
          onClick: this.props.onAdminDelete,
          color: colors.redGoogle,
          disabled: isLoading,
          priority: 1,
        });
      }

      if (!isCancelled && user && user.areStatisticsActivated && !isSurvey) {
        // Complete statistics
        buttonsList.push({
          key: 'adminCompleteStats',
          text: localizations.event_fill_statistics,
          color: colors.green,
          onClick: this.props.onAdminDisplayStatForm,
          disabled: isLoading,
          icon: 'fa fa-line-chart',
          priority: 1,
        });
      }
    } 
    else if (isSecondaryOrganizer) {
      if (!isPast && !isCancelled && !isSurvey) {
        // Cancel co-organization
        buttonsList.push({
          key: 'adminCancel',
          text: localizations.event_pendingSecondaryOrganizerCancelationButton,
          onClick: this.props.onSecondaryOrganizerCancel,
          color: colors.redGoogle,
          disabled: !isActive || isLoading,
          priority: 0,
        });

        if (userIsInvited && !isPast && !isCancelled && !isSurvey) {
          // Invited books
          buttonsList.push({
            key: 'acceptInvitation',
            text: localizations.event_accept_invitation + ' (invitation)',
            onClick: this.props.onBook,
            color: colors.green,
            disabled: isLoading,
            icon: 'fa fa-check',
            priority: 2,
            dataTip:
              localizations.event_confirmation_popup_cancellation_policy_details,
            dataTipIcon: 'fa fa-question-circle',
          });
  
          // Invited refuses
          if (!userDeclined) {
            buttonsList.push({
              key: 'refuseInvitation',
              text: localizations.event_decline_invitation + ' (invitation)',
              onClick: this.props.onDeclineInvitation,
              color: colors.redGoogle,
              disabled: isLoading,
              icon: 'fa fa-times',
              priority: 2,
            });
          }
        }

        if (userIsParticipant && !isPast && !isCancelled) {
          // Participant cancels
          buttonsList.push({
            key: 'cancel',
            text: localizations.event_cancel + ' (participation)',
            onClick: this.props.onCancel,
            color: colors.redGoogle,
            disabled: isLoading,
            icon: 'fa fa-times',
            priority: 2,
            dataTip:
              localizations.event_confirmation_popup_cancellation_policy_details,
            dataTipIcon: 'fa fa-question-circle',
          });
        }

        // Add to calendar
        buttonsList.push({
          key: 'addToCalendar',
          text: isAlreadyAdded
            ? localizations.event_remove_from_calendar
            : localizations.event_add_to_calendar,
          color: colors.darkGray,
          onClick: isAlreadyAdded
            ? this.props.removeFromMyCalendar
            : this.props.addToMyCalendar,
          disabled: isLoading,
          icon: 'fa fa-calendar-alt',
          priority: 2,
        });
      }
    } 
    else if (isPotentialSecondaryOrganizer) {
      let askedRoles = [];
      sportunity.pendingOrganizers.forEach(pendingOrganizer => {
        if (
          pendingOrganizer.circles.edges.findIndex(
            edge =>
              edge.node.members.findIndex(member => member.id === user.id) >=
              0,
          ) >= 0
        ) {
          askedRoles.push({
            id: pendingOrganizer.id,
            name: pendingOrganizer.secondaryOrganizerType
              ? pendingOrganizer.secondaryOrganizerType.name[
                  localizations.getLanguage().toUpperCase()
                ]
              : pendingOrganizer.customSecondaryOrganizerType,
          });
        }
      });

      if (askedRoles.length > 0) {
        // Accept
        buttonsList.push({
          key: 'adminBook',
          text: localizations.event_pendingSecondaryOrganizerValidationButton,
          onClick: this.props.onSecondaryOrganizerSelectRole,
          color: colors.green,
          disabled: isLoading,
          priority: 0,
        });

        // Refuse
        buttonsList.push({
          key: 'adminCancel',
          text: localizations.event_pendingSecondaryOrganizerRefuseButton,
          onClick: this.props.onSecondaryOrganizerRefuseRole,
          color: colors.redGoogle,
          disabled: !isActive || isLoading,
          priority: 0,
        });
      }

      if (userIsInvited && !isPast && !isCancelled && !isSurvey) {
        // Invited books
        buttonsList.push({
          key: 'acceptInvitation',
          text: localizations.event_accept_invitation + ' (invitation)',
          onClick: this.props.onBook,
          color: colors.green,
          disabled: isLoading,
          icon: 'fa fa-check',
          priority: 2,
          dataTip:
            localizations.event_confirmation_popup_cancellation_policy_details,
          dataTipIcon: 'fa fa-question-circle',
        });

        // Invited refuses
        if (!userDeclined) {
          buttonsList.push({
            key: 'refuseInvitation',
            text: localizations.event_decline_invitation + ' (invitation)',
            onClick: this.props.onDeclineInvitation,
            color: colors.redGoogle,
            disabled: isLoading,
            icon: 'fa fa-times',
            priority: 2,
          });
        }
      }

      if (userIsParticipant && !isPast && !isCancelled) {
        // Participant cancels
        buttonsList.push({
          key: 'cancel',
          text: localizations.event_cancel + ' (participation)',
          onClick: this.props.onCancel,
          color: colors.redGoogle,
          disabled: isLoading,
          icon: 'fa fa-times',
          priority: 2,
          dataTip:
            localizations.event_confirmation_popup_cancellation_policy_details,
          dataTipIcon: 'fa fa-question-circle',
        });
      }
    } 
    else if (isPotentialOpponent) {
      if (!isPast && !isCancelled && !isSurvey) {
        // Opponent books
        buttonsList.push({
          key: 'opponentBook',
          text: localizations.event_organizer_book,
          onClick: this.props.onOpponentBook,
          color: colors.green,
          disabled: isLoading,
          priority: 0,
        });
      }
    } 
    else if (userIsParticipant) {
      if (!isPast && !isCancelled) {
        // Participant cancels
        buttonsList.push({
          key: 'cancel',
          text: localizations.event_cancel,
          onClick: this.props.onCancel,
          color: colors.redGoogle,
          disabled: isLoading,
          icon: 'fa fa-times',
          priority: 0,
          dataTip:
            localizations.event_confirmation_popup_cancellation_policy_details,
          dataTipIcon: 'fa fa-question-circle',
        });

        if (!isSurvey) {
          // Add to calendar
          buttonsList.push({
            key: 'addToCalendar',
            text: isAlreadyAdded
              ? localizations.event_remove_from_calendar
              : localizations.event_add_to_calendar,
            color: colors.darkGray,
            onClick: isAlreadyAdded
              ? this.props.removeFromMyCalendar
              : this.props.addToMyCalendar,
            disabled: isLoading,
            icon: 'fa fa-calendar-alt',
            priority: 2,
          });
        }
      }
    } 
    else if (userIsOnWaitingList) {
      if (!isPast && !isCancelled && !isSurvey) {
        // Add to calendar
        buttonsList.push({
          key: 'addToCalendar',
          text: isAlreadyAdded
            ? localizations.event_remove_from_calendar
            : localizations.event_add_to_calendar,
          color: colors.darkGray,
          onClick: isAlreadyAdded
            ? this.props.removeFromMyCalendar
            : this.props.addToMyCalendar,
          disabled: isLoading,
          icon: 'fa fa-calendar-alt',
          priority: 2,
        });
      }
    } 
    else if (userIsInvited) {
      if (!isPast && !isCancelled && !isSurvey) {
        // Invited books
        buttonsList.push({
          key: 'acceptInvitation',
          text: localizations.event_accept_invitation,
          onClick: this.props.onBook,
          color: colors.green,
          disabled: isLoading,
          icon: 'fa fa-check',
          priority: 0,
          dataTip:
            localizations.event_confirmation_popup_cancellation_policy_details,
          dataTipIcon: 'fa fa-question-circle',
        });

        // Invited refuses
        if (!userDeclined) {
          buttonsList.push({
            key: 'refuseInvitation',
            text: localizations.event_decline_invitation,
            onClick: this.props.onDeclineInvitation,
            color: colors.redGoogle,
            disabled: isLoading,
            icon: 'fa fa-times',
            priority: 0,
          });
        }

        // Add to calendar
        buttonsList.push({
          key: 'addToCalendar',
          text: isAlreadyAdded
            ? localizations.event_remove_from_calendar
            : localizations.event_add_to_calendar,
          color: colors.darkGray,
          onClick: isAlreadyAdded
            ? this.props.removeFromMyCalendar
            : this.props.addToMyCalendar,
          disabled: isLoading,
          icon: 'fa fa-calendar-alt',
          priority: 2,
        });
      }
    } 
    else {
      if (!isPast && !isCancelled && !isSurvey) {
        // User books
        buttonsList.push({
          key: 'book',
          text: localizations.event_book,
          onClick: this.props.onBook,
          color: colors.green,
          disabled: !isLogin || !isActive || isLoading,
          priority: 0,
        });
      }
    }

    buttonsList = buttonsList.sort((a, b) =>
      a.priority > b.priority ? 1 : a.priority < b.priority ? -1 : 0,
    );
    if (buttonsList.filter(a => a.priority === 0).length === 0) {
      let index = 0; 
      buttonsList = buttonsList.map(button => {
        if (button.priority === 1 && index < 2) {
          index++;
          return {
            ...button,
            priority: 0
          };
        }
        return button
      })
    }
    
    return buttonsList;
  };

  render() {
    const {
      isSecondaryOrganizer,
      isPotentialSecondaryOrganizer,
      isAdmin,
    } = this.props;

    let { notInCircle } = this.state;

    let buttonList = this.getButtonsList();

    return (
      <div
        style={
          !isAdmin && (isSecondaryOrganizer || isPotentialSecondaryOrganizer)
            ? { ...styles.container, height: 'auto' }
            : { ...styles.container }
        }
      >
        {buttonList && buttonList.length > 0 && (
          <div style={{ ...styles.buttonsContainer, top: 25 }}>
            {buttonList
              .filter(a => a.priority === 0)
              .map(button => (
                <Button {...button} />
              ))}
            {buttonList.filter(a => a.priority > 0).length > 0 && (
              <div
                style={styles.menuContainer}
                ref={node => {
                  this._containerNode = node;
                }}
              >
                <button
                  key={'menu'}
                  style={styles.grayButton}
                  onClick={() =>
                    this.setState({ isMenuVisible: !this.state.isMenuVisible })
                  }
                >
                  <i className="fa fa-ellipsis-h" />
                </button>

                {this.state.isMenuVisible && (
                  <div style={styles.plusMenuContainer}>
                    {buttonList
                      .filter(a => a.priority > 0)
                      .map(button => (
                        <button
                          key={button.key}
                          onClick={() => {
                            this.setState({ isMenuVisible: false });
                            button.onClick();
                          }}
                          disabled={button.disabled}
                          style={styles.plusMenuItem}
                        >
                          {button.text}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

styles = {
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    '@media (max-width: 900px)': {
      width: '100%',
      margin: '10px 0px',
    },
  },
  menuContainer: {
    position: 'relative',
    '@media (max-width: 900px)': {
      width: '100%',
      margin: '10px 0px',
    },
  },
  buttonsContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    '@media (max-width: 900px)': {
      width: '100%',
      position: 'relative',
      bottom: 'auto',
      top: 'auto',
      right: 'auto',
      flexDirection: 'column',
    },
  },
  greenButton: {
    color: colors.white,
    padding: '7px',
    marginRight: 5,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    minWidth: 180,
    height: 40,
    fontFamily: 'Lato',
    cursor: 'pointer',
    border: 0,
    borderRadius: 5,
    transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
    ':hover': {
      filter: 'brightness(0.9)',
    },
    ':disabled': {
      backgroundColor: colors.lightGray,
      color: colors.darkGray,
    },
    ':active': {
      outline: 'none',
    },
    '@media (max-width: 900px)': {
      width: '100%',
    },
  },
  button: {
    color: colors.white,
    padding: '7px',
    marginRight: 5,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    minWidth: 180,
    height: 40,
    fontFamily: 'Lato',
    cursor: 'pointer',
    border: 0,
    borderRadius: 5,
    transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
    ':hover': {
      filter: 'brightness(0.9)',
    },
    ':disabled': {
      backgroundColor: colors.lightGray,
      color: colors.darkGray,
    },
    ':active': {
      outline: 'none',
    },
    '@media (max-width: 900px)': {
      width: '100%',
    },
  },
  redButton: {
    backgroundColor: colors.redGoogle,
    color: colors.white,
    padding: '7px',
    marginRight: 5,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    minWidth: 180,
    height: 40,
    fontFamily: 'Lato',
    cursor: 'pointer',
    border: 0,
    transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
    borderRadius: 5,
    ':hover': {
      filter: 'brightness(0.9)',
    },
    ':disabled': {
      backgroundColor: colors.lightGray,
      color: colors.darkGray,
    },
    ':active': {
      outline: 'none',
    },
    '@media (max-width: 900px)': {
      width: '100%',
      marginTop: 10,
    },
  },
  grayButton: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: colors.darkGray,
    fontSize: 20,
    padding: '7px',
    cursor: 'pointer',
    height: 40,
    width: 40,
    border: 0,
    transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
    '@media (max-width: 900px)': {
      width: '100%',
    },
    ':hover': {},
    ':active': {
      outline: 'none',
    },
  },
  icon: {
    fontSize: 24,
    marginRight: 7,
  },
  plusMenuContainer: {
    position: 'absolute',
    zIndex: 200,
    color: colors.darkGray,
    width: 180,
    left: 40,
    top: 0,
    '@media (max-width: 900px)': {
      right: 20,
      top: 30,
    },
  },
  plusMenuItem: {
    width: '100%',
    backgroundColor: colors.lightGray,
    color: colors.darkGray,
    border: 'none',
    fontSize: 16,
    fontFamily: 'Lato',
    padding: '5px 10px',
    cursor: 'pointer',
    transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
    ':hover': {
      filter: 'brightness(0.9)',
    },
    ':active': {
      outline: 'none',
    },
  },
  separator: {
    borderTop: '1px solid rgba(0,0,0,0.25)',
    borderBottom: '0px solid rgba(0,0,0,0.25)',
    borderLeft: '0px solid rgba(0,0,0,0.25)',
    borderRight: '0px solid rgba(0,0,0,0.25)',
    margin: 0,
  },
  joinCommunityContainer: {
    margin: '10px 0px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    '@media (max-width: 900px)': {
      width: '100%',
    },
  },
  communityDesc: {
    backgroundColor: colors.lightGray,
    padding: '7px 15px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    minWidth: 180,
    minHeight: 40,
    fontFamily: 'Lato',
    border: 0,
    '@media (max-width: 900px)': {
      width: '100%',
    },
  },
  orangeButton: {
    backgroundColor: colors.bloodOrange,
    color: colors.white,
    padding: '7px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    height: 40,
    fontFamily: 'Lato',
    cursor: 'pointer',
    border: 0,
    width: '100%',
    marginTop: 3,
    transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
    ':hover': {
      filter: 'brightness(0.9)',
    },
    ':active': {
      outline: 'none',
    },
  },
  buttonIcon: {
    color: colors.blue,
    position: 'relative',
    display: 'flex',
    flex: 1,
    marginRight: 5,
  },
  circleIcon: {
    width: 35,
    height: 25,
  },
  buttonLink: {
    color: colors.black,
    textDecoration: 'none',
    cursor: 'pointer',
    flex: 7,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  numberContainer: {
    position: 'absolute',
    top: '2px',
    left: '11px',
    width: 24,
    textAlign: 'center',
  },
  number: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  buttonText: {
    textDecoration: 'none',
    color: colors.blue,
    fontSize: 18,
  },
  buttonPseudo: {
    textDecoration: 'none',
    color: colors.darkGray,
    fontSize: 16,
    lineHeight: '30px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  circleDetails: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 8,
  },
  top: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  bottom: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: 14,
    color: colors.darkGray,
    marginLeft: 10,
    //color: colors.blue
  },
  avatar: {
    width: 25,
    height: 25,
    borderRadius: '50%',
    marginRight: 7,
    backgroundPosition: '50% 50%',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  },
};

export default withRouter(Radium(ContentHeader));
