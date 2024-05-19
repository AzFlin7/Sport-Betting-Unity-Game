import React from 'react'
import Radium from 'radium'
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import { colors, fonts, metrics } from '../../theme'
import Modal from 'react-modal'

import Circle from './Circle'
import localizations from '../Localizations'
import VoteForManOfTheGame from './VoteForManOfTheGame'
import AddUserModal from './EventViewAddUserModal';
import InputUserAutocompleted from '../common/Inputs/InputUserAutocompleted'
import Draggable from "react-draggable";
import Button from "./Button";
import {Link} from "found";
import * as types from "../../actions/actionTypes";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import SearchModal from '../common/SearchModal';

let styles, modalStyles;

const Title = ({ children, onClick }) => <h2 onClick={onClick} style={styles.title}>{children}</h2>;

class Sidebar extends React.Component {
  constructor() {
    super();
    this.dragables = []
    this.state = {
      invitedPending: [],
      invitedNo: [],
      canceling: [],
      waitingList: [],
      refused: [],
      openedLists: [1, 2, 3],
      isCircleDetailsModalVisible: false,
      circlesDetails: [],
      displayAddUserModalIndex: 0,
      displaySearchModal: false,
      circlesList: [],
    }
  }

  componentDidMount = () => {
    const { isAdmin, sportunity, userIsInvited, userWasInvited, userIsParticipant, userIsOnWaitingList, isSecondaryOrganizer } = this.props ;
    if ((isAdmin || userIsInvited || userWasInvited || userIsParticipant || userIsOnWaitingList || isSecondaryOrganizer) && sportunity.invited && sportunity.invited.length > 0) {
      let invitedPending = sportunity.invited.filter(invited => invited.answer === "WAITING" && !this.isParticipant(sportunity, invited.user.id) && !this.isCancelling(invited.user.id));
      let invitedNo = sportunity.invited.filter(invited => invited.answer === "NO" && !this.isParticipant(sportunity, invited.user.id) && !this.isCancelling(invited.user.id))
      this.setState({invitedPending, invitedNo})
    }
    if ((sportunity.waiting && sportunity.waiting.length > 0) || (sportunity.willing && sportunity.willing.length > 0)) {
      let waitingList = [];
      sportunity.waiting.forEach(waiting => waitingList.push(waiting))
      sportunity.willing.forEach(willing => waitingList.push(willing))
      this.setState({waitingList})
    }
    if ((isAdmin || userIsInvited || userWasInvited || userIsParticipant || userIsOnWaitingList || isSecondaryOrganizer) && sportunity.canceling && sportunity.canceling.length > 0) {
      let canceling = [];
      sportunity.canceling.forEach(cancelled => {
        if (cancelled.status !== "REFUSED_BY_ORGANIZER" &&
          !this.isParticipant(sportunity, cancelled.canceling_user.id) &&
          canceling.findIndex(cancel => cancel.canceling_user.id === cancelled.canceling_user.id) < 0)
        canceling.push(cancelled)
      })
      let refused = sportunity.canceling.filter(cancelled => cancelled.status === "REFUSED_BY_ORGANIZER");
      this.setState({canceling, refused})
    }
  }

  componentWillReceiveProps = (nextProps) => {
    const { isAdmin, sportunity, userIsInvited, userWasInvited, userIsParticipant, userIsOnWaitingList, isSecondaryOrganizer } = nextProps ;
    if ((isAdmin || userIsInvited || userWasInvited || userIsParticipant || userIsOnWaitingList || isSecondaryOrganizer) && sportunity.invited && sportunity.invited.length > 0) {
      let invitedPending = sportunity.invited.filter(invited => invited.answer === "WAITING" && !this.isParticipant(sportunity, invited.user.id) && !this.isCancelling(invited.user.id));
      let invitedNo = sportunity.invited.filter(invited => invited.answer === "NO" && !this.isParticipant(sportunity, invited.user.id) && !this.isCancelling(invited.user.id))
      this.setState({invitedPending, invitedNo})
    }
    if (sportunity.waiting || sportunity.willing) {
      let waitingList = [];
      sportunity.waiting.forEach(waiting => waitingList.push(waiting))
      sportunity.willing.forEach(willing => waitingList.push(willing))
      this.setState({waitingList})
    }
    if ((isAdmin || userIsInvited || userWasInvited || userIsParticipant || userIsOnWaitingList || isSecondaryOrganizer) && sportunity.canceling && sportunity.canceling.length > 0) {
      let canceling = [];
      sportunity.canceling.forEach(cancelled => {
        if (cancelled.status !== "REFUSED_BY_ORGANIZER" &&
          !this.isParticipant(sportunity, cancelled.canceling_user.id) &&
          canceling.findIndex(cancel => cancel.canceling_user.id === cancelled.canceling_user.id) < 0)
        canceling.push(cancelled)
      })
      let refused = sportunity.canceling.filter(cancelled => cancelled.status === "REFUSED_BY_ORGANIZER");
      this.setState({canceling, refused})
    }
  }

  isParticipant = (sportunity, userId) => {
    let isParticipant = false ;

    if (sportunity.participants && sportunity.participants.length > 0)
      isParticipant = (sportunity.participants.findIndex(participant => participant.id === userId) >= 0)

    return isParticipant;
  }

  isOrganized = (user, sportunity) =>
    !!sportunity.organizers.find((item) => item && item.organizer && item.organizer.id === user.id)

  isCancelling = (userId) => {
    const { sportunity } = this.props ;
    let isCancelling = false ;

    if (sportunity.canceling && sportunity.canceling.length > 0)
      isCancelling = (sportunity.canceling.findIndex(cancelled => cancelled.canceling_user.id === userId) >= 0)

    return isCancelling;
  }

  toggleOpenList = (listIndex) => {
    let openedLists = this.state.openedLists;
    let openedListIndex = openedLists.findIndex(openedList => openedList === listIndex);
    if (openedListIndex >= 0) {
      openedLists.splice(openedListIndex, 1);
    }
    else {
      openedLists.push(listIndex)
    }
    this.setState({openedLists})
  }

  _shouldDisplayCircleDetails = (invitedCircles, participants) => {
    let result = false ;

    if (invitedCircles && invitedCircles.edges && invitedCircles.edges.length > 0) {
      invitedCircles.edges.forEach(circle => {
        if (circle.node.askedInformation && circle.node.askedInformation.length > 0) {
          participants.forEach(participant => {
            if (circle.node.members.findIndex(member => member.id === participant.id) >= 0)
              result = true;
          })
        }
      })
    }

    return result;
  }

  showCircleDetailsModal = () => {
    let invitedCircles = this.props.invited_circles.edges.map(circle => circle.node);
    let participants = this.props.sportunity.participants;

    let circlesDetails = [];

    invitedCircles.forEach(circle => {
      let columns = [];
      circle.askedInformation.map(askedInfo => {
          columns.push(askedInfo);
      });

      let rows = [];
      circle.members.map(member => {
        if (participants.findIndex(participant => participant.id === member.id) >= 0) {
          let answers = [];
          circle.askedInformation.map(askedInfo => {
              let answer ;
              circle.membersInformation.map(info => {
                  if (info.user.id === member.id && askedInfo.id === info.information) {
                      if (askedInfo.type === 'NUMBER')
                          answer = parseInt(info.value);
                      else if (askedInfo.type === 'BOOLEAN')
                          answer = info.value === 'false' ? false : true ;
                      else
                          answer = info.value;
                  }
              })
              answers.push({askedInfo, answer})
          })
          rows.push({user: member, answers})
        }
      })
      if (rows.length > 0) {
        circlesDetails.push({
          circle,
          rows,
          columns
        })
      }
    })


    this.setState({circlesDetails, isCircleDetailsModalVisible: true})

  }

  showAddUserModal = index => {
    this.props.relay.refetch(fragmentVariables => ({
      ...fragmentVariables,
      queryCircles: true
    }),
    null,
    () => {
      setTimeout(() => {
        this.setState({
          displayAddUserModalIndex: index
        })
      }, 50);
    })
  }

  showSearchModal = index => {
    this.props.relay.refetch(fragmentVariables => ({
      ...fragmentVariables,
      queryCircles: true
    }),
    null,
    () => {
      setTimeout(() => {
        this.setState({
          displaySearchModal: true,
          displayAddUserModalIndex: index
        })
      }, 50);
    })
  }

  getIgnoredUserList = (index) => {
    if (index === 3) {
      return this.props.sportunity.participants
    }
    else if (index === 6) {
      return this.props.sportunity.invited.map(invited => invited.user)
    }
  }

  onConfirmAddUser = values => {
    let users = values.map(value => (value.participantId ? {participantId: value.participantId} : {participantEmail: value.participantEmail, participantPseudo: value.participantPseudo}))

    if (this.state.displayAddUserModalIndex === 3) {
      this.props.handleOrganizerAddParticipants(users);
    }
    else if (this.state.displayAddUserModalIndex === 6) {
      this.props.handleOrganizerAddInviteds(users);
    }
  }

  onStart = (item) => {
    this.setState({prevPosition: item.getBoundingClientRect()});
  }

  onStop = (position, item) => {
    this.setState({prevPosition: null});
	  if (position.getBoundingClientRect().x < this.props.fieldElement.getBoundingClientRect().x
		  || position.getBoundingClientRect().x > (this.props.fieldElement.getBoundingClientRect().x + this.props.fieldElement.getBoundingClientRect().width)
		  || position.getBoundingClientRect().y < this.props.fieldElement.getBoundingClientRect().y
		  || position.getBoundingClientRect().y > (this.props.fieldElement.getBoundingClientRect().y + this.props.fieldElement.getBoundingClientRect().height))
	  	return;
    let index = this.props.userPositions.findIndex((user) => user.user.id === item.id)
    if (index < 0)
    this.props._updateUserPositionAdd({
	    user: item,
	    position: {
		    x: parseInt(position.getBoundingClientRect().x - this.props.fieldElement.getBoundingClientRect().x),
		    y: parseInt(position.getBoundingClientRect().y - this.props.fieldElement.getBoundingClientRect().y),
	    }}
	    );
    else
	    this.props._updateUserPositionUpdate({
		    user: item,
		    position: {
			    x: parseInt(position.getBoundingClientRect().x - this.props.fieldElement.getBoundingClientRect().x),
			    y: parseInt(position.getBoundingClientRect().y - this.props.fieldElement.getBoundingClientRect().y),
		    }}, index
	    );
  }

  renderList = (index, title, users) => {
    let isOpened = this.state.openedLists.findIndex(openedList => openedList === index) >= 0;
    const {status, price} = this.props ;
    return (
      <div style={styles.circleContainer}>
        {index !== 1 && <hr style={styles.hr}/>}
        <Title onClick={() => this.toggleOpenList(index)}>
          <div style={{flex: 1}}>{title}</div>
          <span style={isOpened ? styles.openedIcon : styles.closedIcon} />
        </Title>

        { index !== 2 && index !== 3 && isOpened && users && users.map((item, key) =>
            <Circle
              key={item.id+'-'+index}
              name={ item.pseudo || '' }
              link={ `/profile-view/${item.id}`}
              image={item.avatar}
              isAdmin={index === 3 && this.props.isAdmin && status !== 'Cancelled' && (status !== 'Past' || (status === 'Past' && price && price.cents === 0))}
              actionParticipant={() => {index === 3 && this.props.actionParticipant(item)}}
            />
          )
        }
        { index === 3 && isOpened && this.props.content && this.props.content.addComposition && users && users.map((item, key) =>
          <Draggable
	          key={'Sidebar' + item.id}
            position={{x: 0, y: 0}}
	          onStart={() => this.onStart(this[item.id])}
            onStop={() => {this.onStop(this[item.id], item)}}
          >
            <div ref={a => this[item.id] = a}>
              <Circle
                name={ item.pseudo || '' }
                image={item.avatar}
                isAdmin={index === 3 && this.props.isAdmin && status !== 'Cancelled' && (status !== 'Past' || (status === 'Past' && price && price.cents === 0))}
                actionParticipant={() => {index === 3 && this.props.actionParticipant(item)}}
              />
            </div>
          </Draggable>
          )
        }
        { index === 3 && isOpened && !(this.props.content && this.props.content.addComposition) && users && users.map((item, key) =>
            <div ref={a => this[item.id] = a} key={key}>
              <Circle
                name={ item.pseudo || '' }
                image={item.avatar}
                isAdmin={index === 3 && this.props.isAdmin && status !== 'Cancelled' && (status !== 'Past' || (status === 'Past' && price && price.cents === 0))}
                actionParticipant={() => {index === 3 && this.props.actionParticipant(item)}}
                link={ `/profile-view/${item.id}`}
              />
            </div>
          )
        }
        { index === 2 && isOpened && users && users.map((item, key) =>
            <Circle
              key={item.organizer.id+'-'+index}
              name={ item.organizer.pseudo || '' }
              link={ `/profile-view/${item.organizer.id}`}
              image={item.organizer.avatar}
              isAdmin={index === 3 && this.props.isAdmin && this.props.isActive}
              actionParticipant={() => {index === 3 && this.props.actionParticipant(item)}}
              secondaryOrganizerType={item.secondaryOrganizerType && item.secondaryOrganizerType.name[localizations.getLanguage().toUpperCase()] || item.customSecondaryOrganizerType}
            />
          )
        }
        {(index === 3 || index === 6) && isOpened && this.props.isAdmin && this.props.isActive &&
        (!this.props.sportunity.survey || (this.props.sportunity.survey && !this.props.sportunity.survey.surveyDates) ||
          (this.props.sportunity.survey && this.props.sportunity.survey.surveyDates && this.props.sportunity.survey.surveyDates.length <= 1)) &&
          <div style={styles.addParticipantButton} onClick={() => this.showSearchModal(index)}>
            <i className="fa fa-plus-circle fa-2x" />
            <div style={styles.name}>{index === 3 ? localizations.event_addParticipant : localizations.event_addInvited}</div>
          </div>
        }
        {index === 3 && isOpened && this.props.isAdmin && this.props.isActive && this._shouldDisplayCircleDetails(this.props.invited_circles, users) &&
          <div style={styles.displayDetailsButton} onClick={this.showCircleDetailsModal}>
            {localizations.event_show_details}
          </div>
        }
      </div>
    )
  }

  render() {
    const { sportunity, status, isAdmin, actionParticipant, viewer, user, isPotentialOpponent, userIsInvited, userWasInvited, userIsParticipant, userIsOnWaitingList, isSecondaryOrganizer } = this.props ;
    const { invitedPending, invitedNo, canceling, refused, waitingList } = this.state;

    const mainOrganizer = sportunity.organizers.map(organizer => {
      if (organizer.isAdmin)
        return organizer
      else return false
    }).filter(i => Boolean(i))
    const secondaryOrganizers = sportunity.organizers.map(organizer => {
      if (!organizer.isAdmin)
        return organizer
      else return false
    }).filter(i => Boolean(i))

    let circlesList= [];
    if (user && user.circles) {
      const { circles, circlesUserIsIn } = user;
      circles.edges.forEach(node => circlesList.push(node.node));
      if (circlesUserIsIn)
        circlesUserIsIn.edges.forEach(node => {
          if (circlesList.findIndex(circle => circle.id === node.node.id) < 0 && node.node.isCircleUsableByMembers)
            circlesList.push(node.node)
        });
    }

    return (
      <aside style={styles.sidebar}>
        {
          this.state.displaySearchModal &&
          <SearchModal
            isOpen={this.state.displaySearchModal}
            viewer={this.props.viewer}
            circleList={ circlesList && circlesList.filter(c => c.type === 'CHILDREN' || c.type === 'ADULTS') || []}
            userCircles={user.circles && user.circles.edges && user.circles.edges.map(edge => edge.node) || []}
            circlesFromClub={this.props.user.circlesFromClub && this.props.user.circlesFromClub.edges.filter(el => el.node.memberCount > 0 && (el.node.type === 'CHILDREN' || el.node.type === 'ADULTS')).map(edge => edge.node) || []}
            onClose={this.onCloseModal}
            onValide = {(values) => this.onConfirmAddUser(values)}
          />
        }
        {/*this.state.displayAddUserModalIndex !== 0 &&
          <AddUserModal
            isOpen={this.state.displayAddUserModalIndex !== 0}
            viewer={this.props.viewer}
            canCloseModal={true}
            title={this.state.displayAddUserModalIndex === 3 ? localizations.event_addParticipant : localizations.event_addInvited}
            message={this.state.displayAddUserModalIndex === 3 && sportunity.price && sportunity.price.cents > 0 ? localizations.event_addParticipant_explanation : ''}
            cancelLabel={ localizations.info_cancel}
            confirmLabel={ localizations.info_update}
            circleList={ circlesList && circlesList.filter(c => c.type === 'CHILDREN' || c.type === 'ADULTS') || []}
            userCircles={user.circles && user.circles.edges && user.circles.edges.map(edge => edge.node) || []}
            circlesFromClub={this.props.user.circlesFromClub && this.props.user.circlesFromClub.edges.filter(el => el.node.memberCount > 0 && (el.node.type === 'CHILDREN' || el.node.type === 'ADULTS')).map(edge => edge.node) || []}
            onCancel={() => {this.setState({displayAddUserModalIndex: 0})}}
            onConfirm={(values) => this.onConfirmAddUser(values)}
            ignoredUserList={() => this.getIgnoredUserList(this.state.displayAddUserModalIndex)}
            user={user}
          />
        */ }

        {this.renderList(
          1,
          mainOrganizer.length > 1 ? localizations.event_organizers : localizations.event_organizer,
          mainOrganizer.map(organizer => organizer.organizer)
          )
        }

        {secondaryOrganizers.length > 0 &&
          this.renderList(
          2,
          secondaryOrganizers.length > 1 ? localizations.event_secondary_organizers : localizations.event_secondary_organizer,
          secondaryOrganizers
        )}

        {(isAdmin || !sportunity.hide_participant_list) && (isAdmin || sportunity.participants.length > 0) && user && !isPotentialOpponent && (
          <div style={styles.circleContainer}>
            <div style={styles.circleContainer}>
              <VoteForManOfTheGame
                sportunity={sportunity}
                viewer={viewer}
                isParticipant={this.isParticipant(sportunity, user.id)}
                isOrganized={this.isOrganized(user, sportunity)}
                header={(
                  <div>
                    <hr style={styles.hr}/>
                    <Title>
                      <div style={{flex: 1}}>{localizations.event_VoteForManOfTheGame}</div>
                    </Title>
                  </div>
                )}
              />
            </div>
            {this.renderList(
              3,
              localizations.formatString(sportunity.participants.length <= 1
                ? localizations.event_numParticipant
                : localizations.event_numParticipants, sportunity.participants.length),
              sportunity.participants
            )}
          </div>
        )}

        {(((isAdmin || userIsInvited || userWasInvited || userIsParticipant || userIsOnWaitingList || isSecondaryOrganizer) && sportunity.hide_participant_list) || (!sportunity.hide_participant_list)) && user && !isPotentialOpponent && waitingList.length > 0 &&
          this.renderList(
            4,
            localizations.formatString(waitingList.length <= 1
              ? localizations.event_numWaitingList
              : localizations.event_numWaitingList, waitingList.length),
            waitingList
          )
        }

        {(isAdmin || userIsInvited || userWasInvited || userIsParticipant || userIsOnWaitingList || isSecondaryOrganizer) && sportunity.invited && invitedNo.length > 0 &&
          this.renderList(
            5,
            localizations.formatString(invitedNo.length <= 1
              ? localizations.event_numNotAvailableInvited
              : localizations.event_numNotAvailableInviteds, invitedNo.length),
            invitedNo.map(invited => invited.user)
          )
        }

        {(isAdmin || userIsInvited || userWasInvited || userIsParticipant || userIsOnWaitingList || isSecondaryOrganizer) &&
          this.renderList(
            6,
            localizations.formatString(invitedPending.length <= 1
              ? localizations.event_numInvited
              : localizations.event_numInviteds, invitedPending.length),
            invitedPending.map(invited => invited.user)
          )
        }

        {(isAdmin || userIsInvited || userWasInvited || userIsParticipant || userIsOnWaitingList || isSecondaryOrganizer) && sportunity.canceling && canceling.length > 0 &&
          this.renderList(
            7,
            localizations.formatString(canceling.length <= 1
              ? localizations.event_numCanceling
              : localizations.event_numCancelings, canceling.length),
            canceling.map(canceling => canceling.canceling_user)
          )
        }

        {(isAdmin || userIsInvited || userWasInvited || userIsParticipant || userIsOnWaitingList || isSecondaryOrganizer) && sportunity.canceling && refused.length > 0 &&
          this.renderList(
            8,
            localizations.formatString(refused.length <= 1
              ? localizations.event_numRefused
              : localizations.event_numRefuseds, refused.length),
            refused.map(canceling => canceling.canceling_user)
          )
        }

        <Modal
            isOpen={this.state.isCircleDetailsModalVisible}
            onAfterOpen={this.afterOpenModal}
            onRequestClose={() => {this.setState({isCircleDetailsModalVisible: false})}}
            style={modalStyles}
            contentLabel={localizations.circle_details}
        >
          <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                  <div style={styles.modalTitle}>
                      {localizations.circle_details}
                  </div>
                  <div style={styles.modalClose} onClick={() => {this.setState({isCircleDetailsModalVisible: false})}}>
                      <i className="fa fa-times fa-2x" />
                  </div>
              </div>

              {this.state.circlesDetails.map(circleDetails => (
                <div style={styles.memberList}>
                  <div style={styles.circleName}>{circleDetails.circle.name}</div>
                  <table style={styles.memberTable}>
                      <thead>
                          <tr>
                              <td style={styles.firstRowText}>Pseudo</td>
                              {circleDetails.columns.map(info =>
                                  <td key={info.id} style={styles.firstRowText}>
                                      {info.name}
                                  </td>
                              )}
                          </tr>
                      </thead>
                      <tbody>
                          { circleDetails.rows.map((row, rowIndex) => (
                              <tr key={rowIndex}>
                                  <td style={styles.firstCol}>
                                      <div style={styles.firstColContent}>
                                          <span
                                              style={{...styles.iconImage, backgroundImage: row.user.avatar ? 'url('+ row.user.avatar +')' : 'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")'}}
                                          />
                                          {row.user.pseudo}
                                      </div>
                                  </td>
                                  {row.answers.map((info, colIndex) => (
                                      <td key={colIndex} style={styles.cellContent}>
                                          {info.askedInfo.type === "BOOLEAN"
                                              ? info.answer ? localizations.circle_yes : info.answer === false ? localizations.circle_no : ''
                                              : info.answer
                                          }
                                      </td>
                                  ))}
                              </tr>
                          ))}
                      </tbody>
                  </table>
                </div>
              ))}
          </div>
      </Modal>

      </aside>
    )
  }

  onCloseModal = () => {
    this.setState({
      displaySearchModal: false
    })
  }
}

styles = {
	itemContainer: {
		position: 'relative',
		display: 'flex',
		justifyContent: 'center',
		flexDirection: 'column',
		alignItems: 'center'
	},
	circle: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		marginBottom: 25,
		textDecoration: 'none',
		width: '100%'
	},

	icon: {
		width: 80,
		height: 80,
		flexShrink: 0,
		borderRadius: '50%',
		marginBottom: 7,
		backgroundPosition: '50% 50%',
		backgroundSize: 'cover',
		backgroundRepeat: 'no-repeat',
	},

	itemName: {
		color: colors.black,
		fontSize: 17,
		fontWeight: 500,
		textDecoration: 'none',
		textTransition: 'none',
		width: '100%',
		textAlign: 'center',
		wordWrap: 'break-word'
	},
	organizerType: {
		color: colors.black,
		fontSize: 17,
		fontWeight: 500,
		fontStyle: 'italic',
		textDecoration: 'none',
		textTransition: 'none',
		width: '100%',
		textAlign: 'center',
		wordWrap: 'break-word',
		marginTop: 2
	},
	close: {
		backgroundColor: colors.white,
		color: colors.red,
		width: 20,
		height: 20,
		borderStyle: 'none',
		borderRadius: '50%',
		padding: 0,
		cursor: 'pointer',
		position: 'absolute',
		top: -5,
		right: 42,
	},
	closeIcon: {
		fontSize: '24px',
	},
  sidebar: {
    padding: 18,
    width: 200,
    boxShadow: 'inset 1px 0 0 0 rgba(217,217,217,0.5)',
    flexShrink: 0,
    display: 'none',
    flexDirection: 'column',
    alignItems: 'center',
    fontFamily: 'Lato',
    '@media (max-width: 600px)': {
      width: '100%',
    }
  },

  title: {
    color: 'rgba(0,0,0,0.65)',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    cursor: 'pointer',
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 7px'
  },

  circleContainer: {
    width: '100%'
  },

  hr: {
    borderTop: '1px solid rgba(0,0,0,0.25)',
    borderBottom: '0px solid rgba(0,0,0,0.25)',
    borderLeft: '0px solid rgba(0,0,0,0.25)',
    borderRight: '0px solid rgba(0,0,0,0.25)',
    width: 70,
    marginBottom: 15
  },

  openedIcon: {
    width: 0,
    height: 0,
    transition: 'border 100ms',
    color: 'rgba(0,0,0,0.65)',
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderTop: '8px solid rgba(0,0,0,0.65)',
    cursor: 'pointer',
  },

  closedIcon: {
    width: 0,
    height: 0,
    transition: 'border 100ms',
    color: 'rgba(0,0,0,0.65)',
    borderLeft: '8px solid rgba(0,0,0,0.65)',
    borderBottom: '8px solid transparent',
    borderTop: '8px solid transparent',
    cursor: 'pointer',
  },

  add: {
    width: '130px',
    height: '26px',
    backgroundColor: '#5E9FDF',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    borderRadius: '97px',
    borderStyle: 'none',

    cursor: 'pointer',

    color: colors.white,
  },

  addParticipantButton: {
    marginBottom: 7,
    fontSize: 36,
    color: colors.bloodOrange,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer'
  },

  name: {
    color: colors.black,
    fontSize: 15,
    fontWeight: 500,
    textDecoration: 'none',
    textTransition: 'none',
    width: '100%',
    textAlign: 'center',
    wordWrap: 'break-word',
    marginTop: 7
  },

  displayDetailsButton: {
    color: colors.blue,
    fontSize: 15,
    fontFamily: 'Lato',
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
    cursor: 'pointer',
    fontWeight: 'bold'
  },

  modalContent: {
		display: 'flex',
		flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingBottom: 10
	},
	modalHeader: {
		display: 'flex',
		flexDirection: 'row',
    alignItems: 'flex-center',
		justifyContent: 'space-between',
	},
	modalTitle: {
		fontFamily: 'Lato',
		fontSize:24,
		fontWeight: fonts.weight.medium,
		color: colors.blue,
		marginBottom: 20,
		flex: '2 0 0',
	},
	modalClose: {
		justifyContent: 'flex-center',
		paddingTop: 10,
		color: colors.gray,
		cursor: 'pointer',
  },
  circleName: {
    marginBottom: 10,
    fontSize: 16,
    fontFamily: 'Lato',
    color: 'rgba(0,0,0,0.65)',
    fontWeight: 'bold'
  },
  memberList: {
		display: 'flex',
		flexDirection: 'column',
		width: '100%',
    maxHeight: 300,
    padding: 5,
    backgroundColor: 'whitesmoke',
    margin: '25px 10px',
    overflow: 'scroll'
  },
  memberTable: {
    boxShadow: '0 0 14px 0 rgba(0,0,0,0.12)',
    fontSize: 18,
    lineHeight: '24px',
    color: 'rgba(0,0,0,0.65)',
    fontFamily: 'Lato',
    margin: 'auto',
  },
  firstCol: {
    padding: '5px 10px',
    border: '1px solid '+colors.gray
  },
  firstColContent: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  firstRowText: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 10,
    minWidth: 120,
    textAlign: 'center',
    border: '1px solid '+colors.gray
  },
  iconImage: {
    color:colors.white,
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: '50%',
    backgroundPosition: '50% 50%',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    display: 'inline-block'
  },
  cellContent: {
    border: '1px solid '+colors.gray,
    padding: 7,
    verticalAlign: 'middle'
  },
};

modalStyles = {
  overlay : {
    position          : 'fixed',
    top               : 0,
    left              : 0,
    right             : 0,
    bottom            : 0,
    backgroundColor   : 'rgba(255, 255, 255, 0.75)',
    width             : '100%'
  },
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    border                     : '1px solid #ccc',
    background                 : '#fff',
    overflow                   : 'auto',
    WebkitOverflowScrolling    : 'touch',
    borderRadius               : '4px',
    outline                    : 'none',
    padding                    : '20px',
    width                      : '90%',
    height                     : '90%'
  },
}

const _updateUserPositionAdd = (value) => {
	return {
		type: types.COMPOSITION_UPDATE_POSITION_ADD,
		value
	}
}

const _updateFieldElement = (value) => {
	return {
		type: types.COMPOSITION_UPDATE_ELEMENT,
		value
	}
}

const _updateUserPositionUpdate = (value, index) => {
	return {
		type: types.COMPOSITION_UPDATE_POSITION_UPDATE,
		value,
		index
	}
}

const stateToProps = (state) => ({
	userPositions: state.compositionReducer.userPositions,
	fieldElement: state.compositionReducer.fieldElement,
})

const dispatchToProps = (dispatch) => ({
	_updateUserPositionUpdate: bindActionCreators(_updateUserPositionUpdate,dispatch),
	_updateUserPositionAdd: bindActionCreators(_updateUserPositionAdd,dispatch),
	_updateFieldElement: bindActionCreators(_updateFieldElement,dispatch)
})

const ReduxContainer = connect(
	stateToProps,
	dispatchToProps,
)(Radium(Sidebar))

export default createRefetchContainer(Radium(ReduxContainer), {
//OK
  viewer: graphql`
    fragment EventViewSidebar_viewer on Viewer {
      id
      ...VoteForManOfTheGame_viewer
      ...EventViewAddUserModal_viewer
    }
  `,
  user: graphql`
    fragment EventViewSidebar_user on User @argumentDefinitions(
      queryCircles: {type: "Boolean!", defaultValue: false}
      ){
      id,
      profileType
      circles (last: 30) @include (if: $queryCircles) {
        edges {
          node {
            id,
            name
            type
            memberCount
            owner {
              id
              pseudo
              avatar
              firstName
              lastName
            }
            members {
              id
              pseudo
              avatar
              firstName
              lastName
            }
          }
        }
      }
      circlesUserIsIn (last: 30) @include (if: $queryCircles) {
        edges {
          node {
            id,
            name
            type
            isCircleUsableByMembers
            owner {
              id
              pseudo
              avatar
              firstName
              lastName
            }
            memberCount
            members {
              id
              pseudo
              avatar
              firstName
              lastName
            }
          }
        }
      }
      circlesFromClub(last: 100) @include (if: $queryCircles){
        edges {
          node {
            id
            name,
            type
            owner {
              id
              pseudo
              avatar
              firstName
              lastName
            }
            memberCount
            members {
              id
              pseudo
              avatar
              firstName
              lastName
            }
          }
        }
      }
    }
  `,
  sportunity: graphql`
    fragment EventViewSidebar_sportunity on Sportunity {
      id
      survey {
        isSurveyTransformed
        surveyDates {
          beginning_date
          ending_date
        }
      }
      beginning_date
      ending_date
      organizers {
        organizer {
          id,
          pseudo
          avatar,
        }
        isAdmin
        secondaryOrganizerType {
          id
          name {
            FR,
            EN,
            ES,
            DE
          }
        }
        customSecondaryOrganizerType
      },
      price {
        cents,
        currency
      }
      hide_participant_list
      participants {
        id,
        pseudo
        avatar
      }
              waiting {
        id,
        pseudo
        avatar
      }
      willing {
        id,
        pseudo
        avatar
      }
      invited {
        answer
        user {
          id,
          pseudo,
          avatar
        }
      }
      canceling {
        canceling_user {
          id,
          pseudo,
          avatar
        }
        status
      }
      sportunityType {
        isScoreRelevant
      }
      manOfTheGameVotes {
        voter {
          id
          pseudo
        }
        votedFor {
          id
          pseudo
          avatar
        }
      }
      ...VoteForManOfTheGame_sportunity
    }
  `,
  },
  graphql`
    query EventViewSidebarRefetchQuery(
      $queryCircles: Boolean!
    ) {
      viewer {
        ...EventViewSidebar_viewer
        me {
          ...EventViewSidebar_user
          @arguments(
            queryCircles: $queryCircles
          )
        }
      }
    }
  `,
  );
