import React, { Component } from 'react'
import Radium from 'radium'
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import PropTypes from 'prop-types'
import { withAlert } from 'react-alert'
import Circle from './Circle'
import localizations from '../Localizations'
import moment from 'moment'

import { colors } from '../../theme'
import { zindex } from '../../theme/metrics'

import VoteForManOfTheGameMutation from './VoteForManOfTheGameMutation'

const setStateTrigged = (key) => (instance, value) => function() {
  instance.setState({
    [key]: value,
  })
}

const hover = setStateTrigged('hover')

const MakeSelectableList = (compare) => (WrappedComponent) => {
  return class SelectableList extends React.Component {
    state = {
      selected: null,
      _lastPropSelected: null,
      hover: false,
      opened: false,
      isClosing: false,
    }

    componentWillReceiveProps(nextProps) {
      if (nextProps.selected && !compare(this.state._lastPropSelected, nextProps.selected)) {
        this.setState({
          selected: nextProps.selected,
          _lastPropSelected: nextProps.selected,
        })
      }
    }

    select = (selected, ...rest) => {
      this.setState({ selected })
      return (
          this.props.onSelect &&
          this.props.onSelect(...[selected, ...rest])
        ) || true;
    }

    isSelected = (item) => compare(item, this.state.selected)

    toggleOpen = () => this.setState({
      opened: !this.state.opened,
    })

    modalClose = () => this.setState({
        isClosing: true,
      }, () => {
        setTimeout(() => {
          this.setState({
            opened: false,
            isClosing: false,
          })
        }, 1000)
      });

    render() {
      const newProps = {
        select: this.select,
        toggleOpen: this.toggleOpen,
        isSelected: this.isSelected,
        modalClose: this.modalClose,
      }
      return (
        <div
          onMouseEnter={hover(this, true)}
          onMouseLeave={hover(this, false)}
        >
          <WrappedComponent
            {...this.props}
            {...this.state}
            {...newProps}
          />
        </div>
      )
    }

  }
}

const voteThreshold = (sportunity) => moment(sportunity.ending_date).add(12, 'hours')

const isTimeToVoteQuizManOfTheGame = (sportunity) => moment().isBefore(voteThreshold(sportunity))
const isTimeToShowManOfTheGame = (sportunity) => moment().isAfter(voteThreshold(sportunity))
const voted = (user, votes = []) => first((votes || []).filter((item) => item.voter.id === (user || {}).id).map((vote) => vote.votedFor))

const aggregateVotes = (votes) =>
  votes.reduce(
    (mem, vote) => ({
      ...mem,
      [vote.votedFor.id]: {
        total: ((mem[vote.votedFor.id] || {}).total || 0)+1,
        user: vote.votedFor
      }}),
    {}
  )
const sortVotes = (aggregated) =>
  Object.keys(aggregated)
    .sort((ka,kb) => aggregated[ka].total<aggregated[kb].total)
    .map((key) => aggregated[key])

const first = (collection) => collection && collection[0]
const hasVoteBeWinner = (mostVoted) => mostVoted && mostVoted.total>0 && mostVoted.user

const maximums = (maximum) => (vote) => vote.total>0 && vote.total === maximum
const selectUser = (item) => item.user

const getWinner = (votes = []) => {
  const sortedVotes = sortVotes(aggregateVotes(votes))
  const maxVote = (first(sortedVotes) || {}).total
  return sortedVotes.filter(maximums(maxVote)).map(selectUser)
}

const isSameUser = (userA, userB) => userA && userB && userA.id === userB.id

const isAdmin = (organizer) => organizer.isAdmin
const mainOrganizer = (sportunity) =>
  ((sportunity.organizers || []).find(isAdmin) || {}).organizer

const alertOptions = {
  offset: 60,
  position: 'top right',
  theme: 'light',
  transition: 'fade',
};

class VoteForManOfTheGame extends Component {

  componentDidMount() {
    const { sportunity } = this.props
    this.props.relay.refetch(fragmentVariables => ({
      ...fragmentVariables,
      userId: (mainOrganizer(sportunity) || {}).id,
    }))
  }

  voteForManOfTheGame = (participant) => {
    const { viewer, sportunity } = this.props;
    const params = {
      viewer,
      sportunity,
      voterForId: participant.id,
    }
    VoteForManOfTheGameMutation.commit(params,{
          onSuccess: (response) => {
            this.props.alert.show(localizations.event_VoteForManOfTheGame_success, {
                timeout: 3000,
                type: 'success',
            });
          },
          onFailure: (error) => {
            this.props.alert.show(localizations.event_VoteForManOfTheGame_failed, {
              timeout: 3000,
              type: 'error',
            });
          },
        }
    );
    this.props.modalClose()
    return true;
  }

  select = (participant) => {
    this.props.select(participant)
  }

  confirmVote = () => {
    this.voteForManOfTheGame(this.props.selected)
  }

  render() {
    const {
      toggleOpen,
      opened,
      selected,
      isClosing,
      sportunity,
      viewer,
      viewer: { statisticPreferences },
      isParticipant,
      isOrganized,
    } = this.props

    if (!sportunity ||
      !sportunity.sportunityType ||
      !sportunity.sportunityType.isScoreRelevant) {
      return null;
    }

    const user = viewer.me

    const participants = sportunity.participants
    const canVote =
      sportunity.canUserVoteForManOfTheGame === true &&
      isTimeToVoteQuizManOfTheGame(sportunity)

    const winners = !canVote && statisticPreferences &&
      (!statisticPreferences.private || isParticipant || isOrganized) &&
      !sportunity.canUserVoteForManOfTheGame &&
      sportunity.manOfTheGameVotes &&
      sportunity.manOfTheGameVotes.length > 0 &&
      isTimeToShowManOfTheGame(sportunity) &&
      getWinner(sportunity.manOfTheGameVotes)

    const currentVoted = winners? null : voted(user, sportunity.manOfTheGameVotes) || selected

    const isSelectedTheSameUser = isSameUser(user, selected)

    return (
      <div style={styles.container}>
        {(canVote || winners) && this.props.header && this.props.header}
        {canVote && (
          <div
            style={!currentVoted? styles.mainCircleContainerNoSelect : styles.mainCircleContainer}
            onClick={!currentVoted && toggleOpen}
          >
            <div style={styles.selectButtonContainer}>
              <div style={currentVoted? styles.bgItemSelected : styles.bgItem} />
              <Circle
                name={(currentVoted && currentVoted.pseudo) || localizations.event_VoteForManOfTheGame_short}
                image={(currentVoted && currentVoted.avatar)}
                style={styles.circle}
                iconStyle={currentVoted && styles.circleWinner}
                caption={currentVoted && localizations.event_VoteForManOfTheGame_selected}
                captionStyle={styles.circleCaption}
              />
              {!currentVoted && <i style={styles.starIcon} className="fa fa-trophy" aria-hidden="true"></i>}
            </div>
            <div style={styles.limitDateText}>
              {localizations.event_VoteForManOfTheGame_LimitDate + " : "}
              <br/> 
              {voteThreshold(sportunity).format('DD MMM YYYY HH:mm')}
            </div>
          </div>
        )}
        {winners && winners.map((winner, index) =>
          <div style={styles.mainCircleContainerNoSelect} key={`winners-${index}`}>
            <Circle
              name={winner.pseudo || localizations.event_VoteForManOfTheGame}
              image={winner.avatar}
              style={styles.circle}
              iconStyle={styles.circleWinner}
              link={ `/profile-view/${winner.id}`}
              caption={
                winners.length>1?
                  localizations.event_VoteForManOfTheGame_winners :
                  localizations.event_VoteForManOfTheGame_winner
              }
              captionStyle={styles.circleCaption}
            />
          </div>
        )}
        {opened && (
          <div style={styles.modal}>
            <div style={styles.modalBg} onClick={toggleOpen} />
            <div style={styles.modalContent}>
              <div style={styles.selectedContainer}>
                <h2 style={styles.h2}>{localizations.event_VoteForManOfTheGame}</h2>
                <Circle
                  name={(selected && selected.pseudo) || '' }
                  image={(selected && selected.avatar)}
                  style={styles.modalVotedIcon}
                  nameStyle={styles.participantIconName}
                />
              </div>
              <ul style={selected? styles.selectedList : styles.listContainer}>
                {participants.map((partipant, index) => (
                  <li key={`participants-key-${index}`}
                    onClick={() => { this.select(partipant, index) }}
                    style={styles.participantContainer}
                  >
                    <Circle
                      key={partipant.id+'-'+index}
                      name={partipant.pseudo || ''}
                      image={partipant.avatar}
                      style={styles.participantIcon}
                      nameStyle={styles.participantIconNameVertical}
                    />
                  </li>
                ))}
              </ul>
              {selected && (
                <div style={styles.windowConfirmation} >
                  {isSelectedTheSameUser && (
                    <div style={styles.modalText}>
                      {localizations.event_VoteForManOfTheGame_HimSelf}
                    </div>

                  )}
                  {!isSelectedTheSameUser && (
                    <div style={styles.modalText}>
                      {localizations.event_VoteForManOfTheGame_Confirmation}
                      {selected.pseudo}
                    </div>
                  )}
                  <div style={styles.actions}>
                    <button style={styles.cancelSubmit} onClick={() => this.select(null)}>{localizations.event_VoteForManOfTheGame_no.toUpperCase()}</button>
                    {!isSelectedTheSameUser && (
                      <button style={styles.submit} onClick={this.confirmVote}>{localizations.event_VoteForManOfTheGame_yes.toUpperCase()}</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }
}

VoteForManOfTheGame.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }),
  sportunity: PropTypes.shape({
    id: PropTypes.string.isRequired,
    participants: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      pseudo: PropTypes.string.isRequired,
      avatar: PropTypes.string.isRequired,
    })),
  }),
  isParticipant: PropTypes.bool,
  isOrganized: PropTypes.bool,
}

const commonCross = {
  position: 'absolute',
  left: 'auto',
  top: 17,
  height: 53,
  width: 8,
  backgroundColor: colors.bloodOrange,
}

const baseSubmit = {
  backgroundColor: colors.green,
  color: colors.white,
  width: 120,
  height: 32,
  borderRadius: 100,
  borderStyle: 'none',
  boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
  fontSize: 16,
  cursor: 'pointer',
}

const pulseKeyframes = Radium.keyframes({
  from: {
    outline: '10px solid',
    outlineColor: 'rgba(200, 130, 55, 1)',
    outlineOffset: -30,
    marginLeft: 0,
    top: 0,
    width: 80,
    height: 80,
    backgroundColor: colors.red,
  },
  to: {
    outline: '20px solid',
    outlineColor: 'rgba(241, 167, 70, 0)',
    outlineOffset: -10,
    marginLeft: -1,
    top: -2,
    width: 84,
    height: 84,
    backgroundColor: colors.bloodOrange,
  },
}, 'pulse');

const modalFadeIn = Radium.keyframes({
  from: { opacity: 0, },
  to: { opacity: 1, },
}, 'modalFadeIn')

const modalFadeOut = Radium.keyframes({
  from: { opacity: 1, },
  to: { opacity: 0, },
}, 'modalFadeOut')

const iconAppear = Radium.keyframes({
  from: { opacity: 0, paddingTop: 30 },
  to: { opacity: 1, paddingTop: 0 },
}, 'iconAppear')

const zindexBase = zindex('VoteForManOfTheGame')

const bgItemBase = {
  position: 'absolute',
  left: 'auto',
  top: 3,
  zIndex: zindexBase + 1,
  width: 80,
  height: 80,
  borderRadius: '50%',
}

const mainCircleBase = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  position: 'relative',
}

const modalBase = {
  flexDirection: 'column',
  dsiplay: 'flex',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100%',
  heigh: '100%',
  background: 'rgba(0,0,0,0.85)',
  zIndex: zindexBase + 10000,
}

const styles = {
  container: {
    zIndex: zindexBase,
  },
  circle: {
    position: 'relative',
    zIndex: zindexBase + 2,

    textShadow: '1px 1px 2px #427388',
    maxWidth: 142,
  },
  circleWinner: {
    border: `2px solid ${colors.bloodOrange}`,
  },
  circleCaption: {
    fontSize: 12,
  },
  modalVotedIcon: {
    position: 'relative',
    textShadow: `1px 1px 2px ${colors.white}`,
  },
  mainCircleContainerNoSelect: {
    ...mainCircleBase,

    cursor: 'pointer',
  },
  mainCircleContainer: {
    ...mainCircleBase,
  },
  selectButtonContainer: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
  },
  starIcon: {
    fontSize: 45,
    position: 'absolute',
    left: 'auto',
    top: 17,
    zIndex: zindexBase + 3,
    color: colors.bloodOrange,
  },
  bgItemSelected: {
    ...bgItemBase,
  },
  bgItem: {
    ...bgItemBase,
    boxShadow: '0 3px 0 rgba(0,0,0,0.2)',
  },
  limitDateText: {
    textAlign: 'center',
    paddingBottom: 8,
    fontSize: 14,
    color: 'rgba(0,0,0,0.65)',
  },
  modal: {
    ...modalBase,
    animation: 'x 1s normal forwards ease-in',
    animationName: modalFadeIn,
  },
  modalBg: {
    position: 'absolute',
    zIndex: zindexBase + 10001,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
  },
  modalContent: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'flex-start',
    maxWidth: 920,
    paddingTop: 50,
    paddingLeft: 30,
    overflowY: 'auto',
    maxHeight: '100vh',
    zIndex: zindexBase + 10002,
  },
  selectedContainer: {
    paddingRight: 66,
  },
  participantContainer: {
    animation: 'x 2s',
    animationName: iconAppear,
  },
  participantIcon: {
    flexDirection: 'row',
    borderRadius: 15,
    border: `2px solid ${colors.gray}`,
    borderRadius: 15,
    padding: 20,
    cursor: 'pointer',
    ':hover': {
      backgroundColor: 'rgba(100, 100, 100, 0.5)',
    }
  },
  participantIconName: {
    color: colors.white,
  },
  h2: {
    fontSize: 17,
    fontWeight: 500,
    textDecoration: 'none',
    textTransition: 'none',
    width: '100%',
    textAlign: 'center',
    wordWrap: 'break-word',
    color: colors.white,
    paddingBottom: 20,
  },
  participantIconNameVertical: {
    color: colors.white,
    marginLeft: 15,
  },
  selectedList: {
    marginLeft: -500,
    opacity: 0.1,
    transition: 'all 1s ease-in-out',
  },
  listContainer: {
    marginLeft: 0,
    opacity: 1,
    transition: 'all 1s ease-in-out',
  },
  windowConfirmation: {
    marginLeft: 240,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    animation: 'x 1s',
    animationName: iconAppear,
  },
  modalText: {
    padding: 20,
    fontSize: 30,
    color: colors.white,
  },
  submit: {
    ...baseSubmit,
  },
  cancelSubmit: {
    ...baseSubmit,
    backgroundColor: colors.blue,
  },
  actions: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 30,
  }
}

const compareAccount = (a, b) => a && b && a.id === b.id

const selectableList = MakeSelectableList(compareAccount)(Radium(VoteForManOfTheGame))

export default  createRefetchContainer(withAlert(selectableList), {
//OK
  viewer: graphql`
    fragment VoteForManOfTheGame_viewer on Viewer @argumentDefinitions(
      userId: {type: "String", defaultValue: null}
      ){
      me {
          id
      }
      statisticPreferences (userID: $userId) {
          private,
      }
    }
  `,
  sportunity: graphql`
    fragment VoteForManOfTheGame_sportunity on Sportunity {
      id
      ending_date
      participants {
          id,
          pseudo,
          avatar
      }
      canUserVoteForManOfTheGame
      manOfTheGameVotes {
          voter {
              id
          }
          votedFor {
              id
              pseudo,
              avatar
          }
          date
      }
      organizers {
          organizer {
              id
          }
          isAdmin
      }
      sportunityType {
        isScoreRelevant
      }
    }
  `,
},
graphql`
query VoteForManOfTheGameRefetchQuery(
  $userId: String
) {
  viewer {
    ...VoteForManOfTheGame_viewer
      @arguments(
        userId: $userId
      )
  }
}
`,
);
