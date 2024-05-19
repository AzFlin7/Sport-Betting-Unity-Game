import React from 'react';
import Radium from 'radium';
import { colors, fonts, metrics } from '../../theme';
import Button from '@material-ui/core/Button';

import localizations from '../../components/Localizations';
import CircleItem from '../../components/MyCircles/MyCirclesCircleItem';
import PseudoInfoForTable from '../common/PseudoInfoForTable';
import SearchModal from '../common/SearchModal';
import Modal from 'react-modal';

import Paginate from '../common/Paginate';
import ReactLoading from 'react-loading';

let modalStyles;
let groupDataArr = [];
let invitesDataArr = [];
let groups,
  groupsList,
  summonedInvites,
  summonedInvitesList,
  participants,
  participantsList,
  waiting,
  waitingList,
  sportName,
  sportLogo;

class MemberTab extends React.Component {
  constructor(props) {
    super(props);
    this.dragables = [];
    this.state = {
      displaySearchModal: false,
      removeMemberModalOpen: false,
      memberToRemove: null,
      removeMemberLoading: false,
    };
  }

  _handleOnRemove = id => {
    this.setState({
      removeMemberModalOpen: true,
      memberToRemove: id,
      removeMemberLoading: false,
    });
  };

  _closeRemoveMemberModal = () => {
    this.setState({
      removeMemberModalOpen: false,
      memberToRemove: null,
      removeMemberLoading: false,
    });
  };

  _confirmRemoveMember = () => {
    this.setState({ removeMemberLoading: true });
    this._closeRemoveMemberModal();
  };

  displayAddGroup = () => {
    this.setState({
      displaySearchModal: true,
      searchModalFor: 'Groups',
    });
  };

  displayAddParticipants = () => {
    this.setState({
      displaySearchModal: true,
      searchModalFor: 'Participants',
    });
  };

  displayAddInvitees = () => {
    this.setState({
      displaySearchModal: true,
      searchModalFor: 'Invitees',
    });
  };

  onCloseModal = () => {
    this.setState({
      displaySearchModal: false,
    });
  };

  onConfirmAdd = values => {
    if (this.state.searchModalFor === 'Participants') {
      let users = values.map(value => ({ participantId: value.id }));
      this.props.handleOrganizerAddParticipants(users);
    } 
    else if (this.state.searchModalFor === 'Invitees') {
      let users = values.map(value => ({ invitedId: value.id }));
      this.props.handleOrganizerAddInviteds(users);
    } 
    else if (this.state.searchModalFor === 'Groups') {
      let circles = values.map(value => value.id);
      this.props.handleOrganizerAddInvitedCircles(circles);
    }

    this.onCloseModal();
  };

  onConfirmAddWithPrice = (values, prices) => {
    if (this.state.searchModalFor === 'Groups') {
      let circles = values.map(value => value.id);

      this.props.handleOrganizerAddInvitedCirclesWithPrice(circles, prices);
    }
    else {
      this.onConfirmAdd(values)
    }

    this.onCloseModal();
  }

  onConfirmInviteNew = values => {
    this.props.handleOrganizerAddInviteds(values);
    this.onCloseModal();
  };

  getUserSpecificPrice = user => {
    if (
      this.props.isSecondaryOrganizer ||
      this.props.isAdmin ||
      this.props.isAuthorizedAdmin
    ) {
      const sportunity = this.props.status;
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

        if (index >= 0) {
          if (sportunity.paymentStatus[index].price.cents === 0)
            return localizations.event_free.toLowerCase();
          else
            return (
              sportunity.paymentStatus[index].price.cents / 100 +
              ' ' +
              sportunity.paymentStatus[index].price.currency
            );
        }
      }

      if (
        sportunity.price_for_circle &&
        sportunity.price_for_circle.length > 0
      ) {
        let currentCircleUserIsIn = null;

        sportunity.price_for_circle.forEach(price_for_circle => {
          if (
            price_for_circle.circle &&
            price_for_circle.circle.members &&
            price_for_circle.circle.members.length > 0 &&
            price_for_circle.circle.members.findIndex(
              member => member.id === user.id,
            ) >= 0
          ) {
            if (
              currentCircleUserIsIn &&
              currentCircleUserIsIn.price &&
              currentCircleUserIsIn.price.cents > price_for_circle.price.cents
            ) {
              currentCircleUserIsIn = price_for_circle;
            } else {
              currentCircleUserIsIn = price_for_circle;
            }
          }
        });

        if (!!currentCircleUserIsIn) {
          if (currentCircleUserIsIn.price.cents === 0)
            return localizations.event_free.toLowerCase();
          else
            return (
              currentCircleUserIsIn.price.cents / 100 +
              ' ' +
              currentCircleUserIsIn.price.currency
            );
        }
      }

      if (sportunity.price.cents === 0)
        return localizations.event_free.toLowerCase();
      else
        return sportunity.price.cents / 100 + ' ' + sportunity.price.currency;
    } else return '';
  };

  render() {
    const props = this.props;
    const { viewer, sportunity } = props;

    groups = this.props.invited_circles || [];
    groupsList = groups.edges ? groups.edges.length : 0;

    participants = this.props.status.participants || [];
    participantsList = participants.length || 0;

    waiting = this.props.status.waiting || [];
    waitingList = waiting.length || 0;

    let cancelingList =
    this.props.status.canceling && this.props.status.canceling.length > 0
    ? this.props.status.canceling
    .filter(canceling => canceling.status !== 'REFUSED_BY_ORGANIZER')
    .map(canceling => canceling.canceling_user)
    .filter(canceling => participants.findIndex(participant => participant.id === canceling.id) < 0)
    : [];
    
    summonedInvites =
      this.props.status.invited && this.props.status.invited.length > 0
        ? this.props.status.invited
            .filter(invited => invited.answer !== 'NO')
            .filter(invited => cancelingList.findIndex(canceling => canceling.id === invited.user.id) < 0)
        : [];
    summonedInvitesList = summonedInvites.length;
    
    let refusedInvites =
      this.props.status.invited && this.props.status.invited.length > 0
        ? this.props.status.invited
            .filter(invited => invited.answer === 'NO')
            .filter(invited => cancelingList.findIndex(canceling => canceling.id === invited.user.id) < 0)
            .filter(invited => participants.findIndex(participant => participant.id === invited.user.id) < 0)
        : [];
    let refusedInvitesList = refusedInvites.length;

    sportName = this.props.status.sport.sport.name.DE;
    sportLogo = this.props.status.sport.sport.logo;

    for (let i = 0; i < summonedInvitesList; i++) {
      let inviteData = [];
      inviteData.idVal = summonedInvites[i].user.id;
      inviteData.nameVal = summonedInvites[i].user.pseudo;
      inviteData.imageVal = summonedInvites[i].user.avatar;
      invitesDataArr.push(inviteData);
    }
  
    return (
      <div>
        {this.state.displaySearchModal && (
          <SearchModal
            isOpen={this.state.displaySearchModal}
            viewer={this.props.viewer}
            onClose={this.onCloseModal}
            onValide={this.onConfirmAdd}
            onValideWithPrice={this.onConfirmAddWithPrice}
            onInvite={this.onConfirmInviteNew}
            tabs={
              this.state.searchModalFor === 'Groups'
              ? ['Groups', 'PublicGroups']
              : this.state.searchModalFor === 'Participants'
                ? ['People', 'Groups']
                : ['People', 'Groups', 'Invite']
            }
            openOnTab={this.state.searchModalFor === 'Groups' ? 'Groups' : 'People'}
            allowToSeeCircleDetails={this.state.searchModalFor !== 'Groups'}
            types={['ADULTS', 'CHILDREN']}
            circleTypes={['MY_CIRCLES', 'CIRCLES_I_AM_IN', 'CHILDREN_CIRCLES']}
            userType="PERSON"
            queryCirclesOnOpen={true}
            displayPriceField={true}
            currency={this.props.status.price.currency}
            defaultCircleList={this.state.searchModalFor === 'Groups' && !!groups && !!groups.edges && groups.edges.map(edge => edge.node)}
            defaultPriceList={this.state.searchModalFor === 'Groups' && this.props.status.price_for_circle}
            seeAs={this.props.isAdmin && this.props.organizers.find(o => o.isAdmin) ? this.props.organizers.find(o => o.isAdmin).organizer.id : this.props.me.id}
            around={this.props.sportunity.address.position}
          />
        )}
        <div id="groups">
          <Paginate
            data={groups.edges}
            dataKey="circles"
            paginateStyle={styles.paginateRow}
            displayContent={
              (((this.props.isAdmin || this.props.userIsInvited || this.props.userWasInvited || this.props.userIsParticipant || this.props.userIsOnWaitingList || this.props.isSecondaryOrganizer)
              && sportunity.hide_participant_list) || (!sportunity.hide_participant_list))
            }
          >
            <InvitedGroupsComponent
              displayContent={
                (((this.props.isAdmin || this.props.userIsInvited || this.props.userWasInvited || this.props.userIsParticipant || this.props.userIsOnWaitingList || this.props.isSecondaryOrganizer)
                && sportunity.hide_participant_list) || (!sportunity.hide_participant_list))
              }
              viewer={viewer}
              displayAddGroup={this.displayAddGroup}
              isAdmin={this.props.isAdmin}
              isActive={this.props.isActive}
              removeCircle={circle => this.props.handleOrganizerRemoveInvitedCircle(circle)}
            />
          </Paginate>
        </div>
        <div id="invites">
          <Paginate
            data={summonedInvites}
            dataKey="summonedInvites"
            paginateStyle={styles.paginateRow}
            displayContent={
              (((this.props.isAdmin || this.props.userIsInvited || this.props.userWasInvited || this.props.userIsParticipant || this.props.userIsOnWaitingList || this.props.isSecondaryOrganizer)
              && sportunity.hide_participant_list) || (!sportunity.hide_participant_list))
            }
          >
            <InvitedListComponent
              displayContent={
                (((this.props.isAdmin || this.props.userIsInvited || this.props.userWasInvited || this.props.userIsParticipant || this.props.userIsOnWaitingList || this.props.isSecondaryOrganizer)
                && sportunity.hide_participant_list) || (!sportunity.hide_participant_list))
              }
              displayAddInvitees={this.displayAddInvitees}
              getUserSpecificPrice={this.getUserSpecificPrice}
              handleOnremove={this.props.actionParticipant}
              isAdmin={this.props.isAdmin}
              isActive={this.props.isActive}
            />
          </Paginate>
        </div>
        {refusedInvites.length > 0 && (
          <div id="refused">
            <Paginate
              data={refusedInvites}
              dataKey="refusedInvites"
              paginateStyle={styles.paginateRow}
              displayContent={
                (((this.props.isAdmin || this.props.userIsInvited || this.props.userWasInvited || this.props.userIsParticipant || this.props.userIsOnWaitingList || this.props.isSecondaryOrganizer)
                && sportunity.hide_participant_list) || (!sportunity.hide_participant_list))
              }
            >
              <UserListComponent
                displayContent={
                  (((this.props.isAdmin || this.props.userIsInvited || this.props.userWasInvited || this.props.userIsParticipant || this.props.userIsOnWaitingList || this.props.isSecondaryOrganizer)
                  && sportunity.hide_participant_list) || (!sportunity.hide_participant_list))
                }
                data={refusedInvites.map(r => r.user)}
                isAdmin={this.props.isAdmin}
                isActive={false}
                title={
                  refusedInvites.length > 1
                  ? localizations.event_numNotAvailableInviteds.replace('{0}',refusedInvites.length)
                  : localizations.event_numNotAvailableInvited.replace('{0}',refusedInvites.length)
                }
              />
            </Paginate>
          </div>
        )}
        <div id="participants" style={{ marginBottom: '20px' }}>
          <Paginate
            data={participants}
            dataKey="participants"
            paginateStyle={styles.paginateRow}
            displayContent={
              (((this.props.isAdmin || this.props.userIsInvited || this.props.userWasInvited || this.props.userIsParticipant || this.props.userIsOnWaitingList || this.props.isSecondaryOrganizer)
              && sportunity.hide_participant_list) || (!sportunity.hide_participant_list))
            }
          >
            <ParticipantsListComponent
              displayContent={
                (((this.props.isAdmin || this.props.userIsInvited || this.props.userWasInvited || this.props.userIsParticipant || this.props.userIsOnWaitingList || this.props.isSecondaryOrganizer)
                && sportunity.hide_participant_list) || (!sportunity.hide_participant_list))
              }
              displayAddParticipants={this.displayAddParticipants}
              getUserSpecificPrice={this.getUserSpecificPrice}
              isAdmin={this.props.isAdmin}
              isActive={this.props.isActive}
              handleOnremove={this.props.actionParticipant}
              sportunity={this.props.sportunity}
            />
          </Paginate>
        </div>
        {waitingList > 0 && (
          <div id="waiting" style={{ marginBottom: '20px' }}>
            <Paginate
              data={waiting}
              dataKey="waiting"
              paginateStyle={styles.paginateRow}
              displayContent={
                (((this.props.isAdmin || this.props.userIsInvited || this.props.userWasInvited || this.props.userIsParticipant || this.props.userIsOnWaitingList || this.props.isSecondaryOrganizer)
                && sportunity.hide_participant_list) || (!sportunity.hide_participant_list))
              }
            >
              <WaitingListComponent
                displayContent={
                  (((this.props.isAdmin || this.props.userIsInvited || this.props.userWasInvited || this.props.userIsParticipant || this.props.userIsOnWaitingList || this.props.isSecondaryOrganizer)
                  && sportunity.hide_participant_list) || (!sportunity.hide_participant_list))
                }
                displayAddParticipants={this.displayAddParticipants}
                getUserSpecificPrice={this.getUserSpecificPrice}
                isAdmin={this.props.isAdmin}
                isActive={this.props.isActive}
                handleOnremove={this.props.actionParticipant}
                sportunity={this.props.sportunity}
              />
            </Paginate>
          </div>
        )}
        <div id="canceling" style={{ marginBottom: '20px' }}>
          <Paginate
            data={cancelingList}
            dataKey="canceling"
            paginateStyle={styles.paginateRow}
            displayContent={
              (((this.props.isAdmin || this.props.userIsInvited || this.props.userWasInvited || this.props.userIsParticipant || this.props.userIsOnWaitingList || this.props.isSecondaryOrganizer)
              && sportunity.hide_participant_list) || (!sportunity.hide_participant_list))
            }
          >
            <UserListComponent
              displayContent={
                (((this.props.isAdmin || this.props.userIsInvited || this.props.userWasInvited || this.props.userIsParticipant || this.props.userIsOnWaitingList || this.props.isSecondaryOrganizer)
                && sportunity.hide_participant_list) || (!sportunity.hide_participant_list))
              }
              data={cancelingList}
              getUserSpecificPrice={this.getUserSpecificPrice}
              isAdmin={this.props.isAdmin}
              isActive={false}
              title={
                cancelingList.length > 1
                ? localizations.event_numCancelings.replace('{0}', cancelingList.length)
                : localizations.event_numCanceling.replace('{0}', cancelingList.length)
              }
            />
          </Paginate>
        </div>
      </div>
    );
  }
}

let styles = {
  sameRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  col: {
    verticalAlign: 'middle',
  },

  priceCol: {
    verticalAlign: 'middle',
    textAlign: 'right',
    paddingRight: '5%',
  },
  removeCol: {
    verticalAlign: 'middle',
    textAlign: 'right',
    paddingRight: '5%',
  },

  rowHeader: {
    backgroundColor: colors.white,
    // boxShadow: '0 0 4px 0 rgba(0,0,0,0.12)',
    // border: '1px solid #E7E7E7',
    overflow: 'hidden',
    fontFamily: 'Lato',
    margin: '1px 0',
    padding: 15,
    textDecoration: 'none',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '40px',
  },

  tableStyle: {
    marginTop: 15,
    padding: 0,
    marginLeft: '5%',
    marginRight: '5%',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12)',
    width: '90%',
  },

  row: {
    backgroundColor: colors.white,
    // boxShadow: '0 0 4px 0 rgba(0,0,0,0.12)',
    border: '1px solid #E7E7E7',
    overflow: 'hidden',
    fontFamily: 'Lato',
    margin: '1px 0',
    padding: 15,
    textDecoration: 'none',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '40px',
  },

  h2: {
    fontSize: '22px',
    fontWeight: '500',
    color: '#5E9FDF',
    margin: '20px 2% 15px',
  },
  cardStyle: {
    width: '47%',
    marginTop: '17px',
    marginBottom: '17px',
  },

  firstCol: {
    marginLeft: '2%',
    padding: '15px',
  },
  //  media: {
  //   height: '100px',
  //   maxWidth: '35%',
  //   minWidth: '35%',
  //   marginTop: '-120px',
  //   verticalAlign: 'top'
  // },
  // tileType: {
  //   padding: '16px',
  //   fontSize: '14px',
  //   color: 'rgba(0, 0, 0, 0.87)',
  //   textAlign: 'right',
  //   marginRight: '310px',
  //   marginBottom: '-10px',
  // },
  mediaInvite: {
    verticalAlign: 'top',
    width: '100px',
    marginTop: '-70px',
    marginLeft: '10px',
    borderRadius: '50%',
    marginBottom: '-10px',
    maxWidth: '10%',
    minWidth: '10%',
    marginBottom: '10px',
  },

  tile: {
    textAlign: 'right',
  },

  tileInvite: {
    padding: '16px',
    fontWeight: '500',
    boxSizing: 'border-box',
    position: 'relative',
    whiteSpace: 'nowrap',
    marginLeft: '110px',
  },

  iconClose: {
    verticalAlign: 'top',
    maxWidth: '6%',
    minWidth: '6%',
    /* width: 100px; */
    marginTop: '-70px',
    marginLeft: '800px',
    borderRadius: '50%',
  },
  iconMore: {
    verticalAlign: 'top',
    maxWidth: '6%',
    minWidth: '6%',
    /* width: 100px; */
    marginTop: '-60px',
    marginLeft: '730px',
    borderRadius: '50%',
  },

  buttonGroup: {
    background: '#5E9FDF',
    fontSize: '20px',
    fontFamily: 'Lato',
    color: 'white',
    textTransform: 'none',
    marginRight: '2%',
    marginTop: '10px',
    marginBottom: '10px',
  },

  buttonInvites: {
    background: '#5E9FDF',
    fontSize: '20px',
    fontFamily: 'Lato',
    color: 'white',
    textTransform: 'none',
    marginRight: '2%',
    marginTop: '10px',
    marginBottom: '10px',
  },

  buttonParticipant: {
    background: '#5E9FDF',
    fontSize: '22px',
    marginLeft: '637px',
    marginTop: '-40px',
    color: 'white',
    marginBottom: '10px',
  },

  groupItemWrapper: {
    marginLeft: '10px',
  },

  cardHeaderCss: {
    color: 'rgba(0, 0, 0, 0.87)',
    display: 'block',
    fontSize: '15px',
    marginLeft: '138px',
  },

  groupIconCss: {
    verticalAlign: 'top',
    maxWidth: '35%',
    minWidth: '35%',
    width: '100%',
    height: '100px',
    marginTop: '-30px',
  },

  ownerNameCss: {
    padding: '16px',
    fontSize: '14px',
    color: 'rgba(0, 0, 0, 0.87)',
    textAlign: 'right',
    marginTop: '-100px',
  },

  ownerImageCss: {
    verticalAlign: 'top',
    maxWidth: '10%',
    minWidth: '10%',
    width: '100%',
    height: '30px',
    marginTop: '-40px',
    borderRadius: '50%',
    marginLeft: '300px',
  },

  sportNameCss: {
    padding: '16px',
    fontSize: '14px',
    color: 'rgba(0, 0, 0, 0.87)',
    textAlign: 'left',
    marginLeft: '170px',
  },

  sportLogoCss: {
    verticalAlign: 'top',
    maxWidth: '8%',
    minWidth: '8%',
    width: '100%',
    height: '30px',
    marginTop: '-40px',
    marginLeft: '150px',
  },

  typeCss: {
    padding: '16px',
    fontSize: '14px',
    color: 'rgba(0, 0, 0, 0.87)',
    textAlign: 'left',
    /* margin-right: 310px; */
    marginBottom: '-60px',
    marginLeft: '30px',
    marginTop: '-20px',
  },

  modeCss: {
    padding: '16px',
    fontSize: '14px',
    color: 'rgba(0, 0, 0, 0.87)',
    textAlign: 'right',
  },
  iconRemove: {
    color: colors.black,
    cursor: 'pointer',
    fontSize: '17px',
  },
  paginateRow: {
    marginLeft: '5%',
    marginRight: '5%',
    border: '1px solid rgb(231, 231, 231)',
  },
};

const InvitedGroupsComponent = props => (
  <table style={styles.tableStyle}>
    <thead>
      <tr style={{ height: '0px' }}>
        <td style={{ width: '100%' }} />
      </tr>
    </thead>
    <tr>
      <td style={styles.col}>
        <div style={{ ...styles.sameRow }}>
          <h2 style={styles.h2}>
            {' '}
            {localizations.circles_groups} ({groupsList}){' '}
          </h2>
          {props.isAdmin && props.isActive && (
            <Button
              onClick={props.displayAddGroup}
              color="primary"
              style={styles.buttonGroup}
            >
              {localizations.newSportunity_invitedList_modal_groups}
            </Button>
          )}
        </div>
      </td>
    </tr>
    {props.displayContent && props.circles.map(circle => (
      <tr style={styles.row}>
        <td style={styles.row}>
          <CircleItem
            key={circle.node.id}
            circle={circle.node}
            viewer={props.viewer}
            link={`/circle/${circle.node.id}`}
            //openCircle={() => this.setState({tutorial3aIsVisible: false})}
            circleIsMine={true}
            fullWidth={true}
            showRemoveButton={props.isAdmin}
            handleOnremove={() => props.removeCircle(circle.node)}
          >
            {circle.node.owner
              ? circle.node.name +
                ' ' +
                localizations.find_my_sport_clubs_of +
                ' ' +
                circle.node.owner.pseudo
              : circle.node.name}
          </CircleItem>
        </td>
      </tr>
    ))}
  </table>
);

const InvitedListComponent = props => (
  <table style={styles.tableStyle}>
    <thead>
      <tr style={{ height: '0px' }}>
        <td style={{ width: '40%' }} />
        <td style={{ width: '50%' }} />
        <td style={{ width: '10%' }} />
      </tr>
    </thead>
    <tr>
      <td colSpan="3" style={styles.col}>
        <div style={styles.sameRow}>
          <h2 style={styles.h2}>
            {localizations.newSportunity_invitation_organization} (
            {summonedInvitesList}){' '}
          </h2>
          {props.isAdmin && props.isActive && (
            <Button
              onClick={props.displayAddInvitees}
              color="primary"
              style={styles.buttonInvites}
            >
              {localizations.newSportunity_invitedList_modal_person}
            </Button>
          )}
        </div>
      </td>
    </tr>
    {props.displayContent && props.summonedInvites.map(member => (
      <tr style={styles.row}>
        <td style={styles.firstCol}>
          <PseudoInfoForTable member={member.user} />
        </td>
        <td style={styles.priceCol}>
          {typeof props.getUserSpecificPrice === 'function'
            ? props.getUserSpecificPrice(member.user)
            : ''}
        </td>
        {props.isAdmin ? (
            <td style={styles.removeCol}>
              <div onClick={() => props.handleOnremove(member.user)}>
                <i className="fa fa-times" style={styles.iconRemove} />
              </div>
            </td>
          ) : (
            <td />
          )}
      </tr>
    ))}
  </table>
);

const ParticipantsListComponent = props => (
  <table style={styles.tableStyle}>
    <thead>
      <tr style={{ height: '0px' }}>
        <td style={{ width: '40%' }} />
        <td style={{ width: '50%' }} />
        <td style={{ width: '10%' }} />
      </tr>
    </thead>

    <tr>
      <td colSpan="3" style={styles.col}>
        <div style={styles.sameRow}>
          <h2 style={styles.h2}>
            {' '}
            {localizations.myStatPrefs_participants} ({participantsList}){' '}
          </h2>
          {props.isAdmin &&
            !props.isCancelled &&
            !props.isPast && 
            !(
              props.sportunity.survey &&
              !props.sportunity.survey.isSurveyTransformed &&
              props.sportunity.survey.surveyDates.length > 1
            ) && (
              <Button
                onClick={props.displayAddParticipants}
                color="primary"
                style={styles.buttonInvites}
              >
                {localizations.event_addParticipant}
              </Button>
            )}
        </div>
      </td>
    </tr>
    {props.displayContent && props.participants.map(member => {
      return (
        <tr style={styles.row}>
          <td style={styles.firstCol}>
            <PseudoInfoForTable member={member} />
          </td>
          <td style={styles.priceCol}>
            {typeof props.getUserSpecificPrice === 'function'
              ? props.getUserSpecificPrice(member)
              : ''}
          </td>
          {props.isAdmin ? (
            <td style={styles.removeCol}>
              <div onClick={() => props.handleOnremove(member)}>
                <i className="fa fa-times" style={styles.iconRemove} />
              </div>
            </td>
          ) : (
            <td />
          )}
        </tr>
      );
    })}
  </table>
);

const UserListComponent = props => (
  <table style={styles.tableStyle}>
    <thead>
      <tr style={{ height: '0px' }}>
        <td style={{ width: '40%' }} />
        <td style={{ width: '50%' }} />
        <td style={{ width: '10%' }} />
      </tr>
    </thead>
    <tr>
      <td colSpan="3" style={styles.col}>
        <div style={styles.sameRow}>
          <h2 style={styles.h2}>{props.title}</h2>
        </div>
      </td>
    </tr>
    {props.displayContent && props.data.map(member => (
      <tr style={styles.row}>
        <td style={styles.firstCol}>
          <PseudoInfoForTable member={member} />
        </td>
        <td style={styles.priceCol}>
          {typeof props.getUserSpecificPrice === 'function'
            ? props.getUserSpecificPrice(member)
            : ''}
        </td>
      </tr>
    ))}
  </table>
);

const WaitingListComponent = props => (
  <table style={styles.tableStyle}>
    <thead>
      <tr style={{ height: '0px' }}>
        <td style={{ width: '40%' }} />
        <td style={{ width: '50%' }} />
        <td style={{ width: '10%' }} />
      </tr>
    </thead>

    <tr>
      <td colSpan="3" style={styles.col}>
        <div style={styles.sameRow}>
          <h2 style={styles.h2}>
            {' '}
            {localizations.myStatPref_waiting} ({waitingList}){' '}
          </h2>
        </div>
      </td>
    </tr>
    {props.displayContent && props.waiting.map(member => {
      return (
        <tr style={styles.row}>
          <td style={styles.firstCol}>
            <PseudoInfoForTable member={member} />
          </td>
          <td style={styles.priceCol}>
            {typeof props.getUserSpecificPrice === 'function'
              ? props.getUserSpecificPrice(member)
              : ''}
          </td>
          {props.isAdmin ? (
            <td style={styles.removeCol}>
              <div onClick={() => props.handleOnremove(member)}>
                <i className="fa fa-times" style={styles.iconRemove} />
              </div>
            </td>
          ) : (
            <td />
          )}
        </tr>
      );
    })}
  </table>
);

modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    border: '1px solid #ccc',
    background: '#fff',
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
    borderRadius: '4px',
    outline: 'none',
    padding: '20px',
  },
  modalContent: {
    justifyContent: 'flex-start',
    width: 300,
    padding: 10,
    '@media (max-width: 768px)': {
      width: 'auto',
    },
  },
  modalHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-center',
    justifyContent: 'flex-center',
  },
  modalText: {
    fontSize: 18,
    justifyContent: 'center',
    width: '100%',
    fontFamily: 'Lato',
  },
  modalExplanation: {
    fontSize: 16,
    color: colors.gray,
    justifyContent: 'center',
    width: '100%',
    fontFamily: 'Lato',
    fontStyle: 'italic',
    marginTop: 10,
    textAlign: 'justify',
  },
  modalButtonContainer: {
    fontSize: 18,
    justifyContent: 'center',
    width: '100%',
    fontFamily: 'Lato',
    marginTop: 30,
  },
  submitButton: {
    width: 80,
    backgroundColor: colors.blue,
    color: colors.white,
    fontSize: fonts.size.small,
    borderRadius: metrics.radius.tiny,
    outline: 'none',
    border: 'none',
    padding: '10px',
    cursor: 'pointer',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    margin: 10,
  },
  cancelButton: {
    width: 80,
    backgroundColor: colors.gray,
    color: colors.white,
    fontSize: fonts.size.small,
    borderRadius: metrics.radius.tiny,
    outline: 'none',
    border: 'none',
    padding: '10px',
    cursor: 'pointer',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    margin: 10,
  },
};

export default Radium(MemberTab);
