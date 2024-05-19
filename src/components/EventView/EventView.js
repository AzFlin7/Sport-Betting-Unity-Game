import React, {Component} from 'react';
import Radium from 'radium';
import { withAlert } from 'react-alert';
import { createRefetchContainer, graphql, QueryRenderer } from 'react-relay/compat';
import Helmet from 'react-helmet';
import platform from 'platform';
import ConfirmationModal, { confirmModal } from '../common/ConfirmationModal';
import { displayChooseAccountModal } from '../common/SwitchAccountOnPrivate';
import moment from 'moment-timezone';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import AppHeader from '../common/Header/Header';
import Footer from '../common/Footer/Footer';
import Wrapper from './Wrapper';
import Slider from './Slider';
import Header from './EventViewHeader';
import Sidebar from './EventViewSidebar';
import Content from './EventViewContent';
import Sharing from './Sharing';
import ConfirmBookingPopup from './ConfirmBookingPopup';
import AddACard from './AddACard';
import CompletePersonProfilePopup from './CompletePersonProfilePopup';
import CompleteBusinessProfilePopup from './CompleteBusinessProfilePopup';
import SetStatus from '../common/Sportunity/SetStatus';
import StatsFilling from './StatsFilling';

import BookUserMutation from './BookUserMutation';
import CancelUserMutation from './CancelUserMutation';
import CancelSportunityMutation from './CancelSportunityMutation';
import DeleteSportunityMutation from './mutations/DeleteSportunityMutation'
import RegisterCardDataMutation from './RegisterCardDataMutation';
import UpdateUserProfileMutation from './UpdateUserProfileMutation';
import CancelParticipantSportunityMutation from './CancelParticipantSportunityMutation';
import RefuseInvitationMutation from './RefuseInvitationMutation';
import NewOpponentSportunityMutation from './NewOpponentSportunityMutation';
import OrganizerAddParticipantMutation from './mutations/OrganizerAddParticipant';
import OrganizerAddInvitedCirclesMutation from './mutations/OrganizerAddInvitedCircles';
import OrganizerAddInvitedMutation from './mutations/OrganizerAddInvited';
import SecondaryOrganizerPickRoleMutation from './mutations/SecondaryOrganizerPickRole';
import SecondaryOrganizerRefuseRoleMutation from './mutations/SecondaryOrganizerRefuseRole';
import SecondaryOrganizerCancelRoleMutation from './mutations/SecondaryOrganizerCancelRole';
import UpdateSportunityTitleMutation from './UpdateSportunityTitleMutation';
import UpdateSportunityDescriptionMutation from './UpdateSportunityDescriptionMutation';
import UpdateSportunityLevelsMutation from './UpdateSportunityLevelsMutation';
import OrganizerAddOrRemoveInvitedCircleMutation from './mutations/OrganizerAddOrRemoveInvitedCircleMutation'
import UpdateSportunitySubscription from '../common/Sportunity/Subscriptions/UpdateSportunitySubscription'

import mangoPay from 'mangopay-cardregistration-js-kit';
import localizations from '../Localizations';
import Loading from '../common/Loading/Loading.js';
import environment from 'sportunity/src/createRelayEnvironment'; 

import {
  appUrl,
  mangoPayUrl,
  mangoPayClientId,
} from '../../../constants.json';
import * as types from '../../actions/actionTypes.js';
import cloneDeep from 'lodash/cloneDeep';

mangoPay.cardRegistration.baseURL = mangoPayUrl;
mangoPay.cardRegistration.clientId = mangoPayClientId;

let styles;

let MetaImage = ({ images }) => (
  <meta property="og:image" content={images[0]} />
);

class EventView extends React.Component {
  constructor() {
    super();
    this.sub ;
    this.alertOptions = {
      offset: 60,
      position: 'top right',
      theme: 'light',
      transition: 'fade',
    };

    this.state = {
      displayConfirmationPopup: false,
      displayAddACardPopup: false,
      displayCompletePersonProfilePopup: false,
      displayCompleteBusinessProfilePopup: false,
      displayPrivateSportunityPopup: false,
      isQueryingForPrivateSportunity: false,
      selectedCard: '',
      paymentWithWallet: false,
      selectedWallet: '', 
      cardJustAdded: false,
      me: '',
      process: false,
      language: localizations.getLanguage(),
      isAdmin: false,
      isSecondaryOrganizer: false,
      isPotentialSecondaryOrganizer: false,
      isPotentialSecondaryOrganizerSelectedRole: null,
      isAuthorizedAdmin: false,
      mainOrganizer: null,
      isPotentialOpponent: false,
      isActive: true,
      isPast: false,
      shouldGoToJoinWaitingList: false,
      loading: false,
      isLoading: false,
      displayStatFilling: false,
      displayAndroidOpenApp: false,
      isOpponentSportunityCreated: false,
    };
  }

  _setLanguage = language => {
    this.setState({ language });
  };

  componentDidMount() {
    if (platform.name.indexOf('Firefox') < 0) {
      if (platform.os.family === 'iOS') {
        if (typeof window !== 'undefined')
          window.location.href =
            'sportunity://sportunity/' + this.props.viewer.sportunity.id;
      } else if (platform.os.family === 'Android') {
        this.setState({ displayAndroidOpenApp: true });
      }
    }

    if (this.props.location && this.props.location.pathname.indexOf('confirmation') >= 0) {
      this.props.alert.show(localizations.popup_sportunityBooking_success, { timeout: 5000, type: 'success' });
      this.props.router.push("/event-view/" + this.props.viewer.sportunity.id)
    }

    this.sub = UpdateSportunitySubscription({sportunityId: this.props.viewer.sportunity.id});

    setTimeout(() => {
      if (!this.state.displayAndroidOpenApp) this.checkPrivacy(this.props);
    }, 150);
  }

  componentWillUnmount() {
    !!this.sub && this.sub.dispose()
  }

  componentWillReceiveProps = nextProps => {
    setTimeout(() => {
      if (!this.state.displayAndroidOpenApp) this.checkPrivacy(nextProps);
    }, 150);
  };

  checkPrivacy = props => {
    if (props.viewer && props.viewer.sportunity) {
      const {
        viewer: { sportunity, me },
      } = props;
      const isAdmin =
        me &&
        !!sportunity.organizers.find(
          item =>
            (item &&
              item.organizer &&
              item.organizer.id === me.id &&
              item.isAdmin) ||
            (item.permissions &&
              item.permissions.detailsAccess &&
              item.permissions.detailsAccess.edit &&
              item.organizer.id === me.id),
        );
      this.setState({ isAdmin });

      if (
        props.viewer &&
        props.viewer.sportunity &&
        !this.state.displayPrivateSportunityPopup
      ) {
        if (!me && sportunity.kind === 'PRIVATE') {
          this.setState({ displayPrivateSportunityPopup: true });

          confirmModal({
            title: localizations.event_alert_event_is_private_title,
            message: localizations.event_alert_event_is_private_message,
            confirmLabel: localizations.event_alert_event_is_private_ok,
            canCloseModal: false,
            onConfirm: () => {
              this.props.router.push({
                pathname: '/my-events',
              });
            },
          });
        } else if (
          sportunity &&
          me &&
          !this.state.isQueryingForPrivateSportunity
        ) {
          const isOrganized = !!sportunity.organizers.find(
            item => item && item.organizer && item.organizer.id === me.id,
          );
          const isSecondaryOrganizer = !!sportunity.organizers.find(
            item =>
              item &&
              !item.isAdmin &&
              item.organizer &&
              item.organizer.id === me.id,
          );
          const isPotentialSecondaryOrganizer =
            props.viewer.sportunity.status.indexOf('Asked-CoOrganization') >=
            0;
          let isParticipant = !!sportunity.participants.find(
            item => item && item.id === me.id,
          );
          let isInvited = !!sportunity.invited.find(
            item => item && item.user && item.user.id === me.id,
          );

          let isPotentialOpponent =
            me.profileType === 'ORGANIZATION' &&
            !isOrganized &&
            sportunity.game_information &&
            sportunity.game_information.opponent &&
            (sportunity.game_information.opponent.lookingForAnOpponent ||
              (sportunity.game_information.opponent.invitedOpponents &&
                sportunity.game_information.opponent.invitedOpponents.edges &&
                sportunity.game_information.opponent.invitedOpponents.edges
                  .length > 0 &&
                !!sportunity.game_information.opponent.invitedOpponents.edges[0].node.members.find(
                  member => member.id === me.id,
                ))) &&
            !sportunity.game_information.opponent.organizer &&
            !sportunity.game_information.opponent.organizerPseudo;

          this.setState({
            isPotentialOpponent,
            isSecondaryOrganizer,
            isPotentialSecondaryOrganizer,
          });

          if (
            !isOrganized &&
            !isParticipant &&
            !isInvited &&
            !isSecondaryOrganizer &&
            !isPotentialOpponent &&
            !this.state.isOpponentSportunityCreated &&
            !isPotentialSecondaryOrganizer
          ) {
            this.props.relay.refetch(
              fragmentVariables => ({
                ...fragmentVariables,
                superToken: localStorage.getItem('superToken'),
                userToken: localStorage.getItem('userToken'),
                queryAuthorizedAccounts: true,
                querySuperMe: true,
              }),
              null,
              () => {
                this.waitForDataSuperMe();
              },
            );
            this.setState({ isQueryingForPrivateSportunity: true });
          }
        }
      }

      this.setState({
        me: props.viewer.me,
      });
      props.viewer.sportunity.organizers.forEach(organizer => {
        if (
          props.viewer.me &&
          organizer.isAdmin &&
          organizer.organizer.id == props.viewer.me.id
        ) {
          this.setState({
            isAdmin: true,
          });
        } else if (
          props.viewer.me &&
          !organizer.isAdmin &&
          organizer.organizer.id === props.viewer.me.id
        ) {
          this.setState({
            isSecondaryOrganizer: true,
          });
        }
      });
      if (
        props.viewer.sportunity.status == 'Past' ||
        props.viewer.sportunity.status == 'Cancelled'
      )
        this.setState({
          isActive: false,
        });
      if (props.viewer.sportunity.status == 'Past')
        this.setState({
          isPast: true,
        });

      if (
        props.viewer.sportunity.status.indexOf('Asked-CoOrganization') >= 0
      ) {
        this.setState({
          isPotentialSecondaryOrganizer: true,
          isSecondaryOrganizer: false,
        });
      }

      let status = SetStatus(
        props.viewer.sportunity,
        props.viewer.sportunity.status,
        props.viewer.me ? props.viewer.me.id : null,
      ).displayStatus;
      this.setState({
        shouldGoToJoinWaitingList:
          status === 'WAITING LIST' ||
          (props.viewer.sportunity.participants &&
            props.viewer.sportunity.participants.length ===
              props.viewer.sportunity.participantRange.to),
      });
    }
  };

  waitForDataSuperMe = () => {
    if (
      this.props.viewer &&
      this.props.viewer.superMe &&
      this.props.viewer.superMe.id &&
      this.props.viewer.authorizedAccounts &&
      this.props.viewer.authorizedAccounts.id
    ) {
      let accounts = [];

      if (
        this.props.viewer.superMe.subAccounts &&
        this.props.viewer.superMe.subAccounts.length > 0
      )
        this.props.viewer.superMe.subAccounts.forEach(subAccount => {
          accounts.push(subAccount);
        });

      if (
        this.props.viewer.authorizedAccounts.accounts &&
        this.props.viewer.authorizedAccounts.accounts.length > 0
      )
        this.props.viewer.authorizedAccounts.accounts.forEach(account => {
          if (accounts.findIndex(item => item.id === account.id) < 0)
            accounts.push(account);
        });

      if (
        accounts.findIndex(item => item.id === this.props.viewer.superMe.id) <
        0
      )
        accounts.push({
          id: this.props.viewer.superMe.id,
          pseudo: this.props.viewer.superMe.pseudo,
          avatar: this.props.viewer.superMe.avatar,
          token: localStorage.getItem('superToken'),
        });

      /*if (accounts.findIndex(item => item.id === this.props.viewer.authorizedAccounts.id) < 0)
        accounts.push({
          id: this.props.viewer.authorizedAccounts.id,
          pseudo: this.props.viewer.authorizedAccounts.pseudo,
          avatar: this.props.viewer.authorizedAccounts.avatar,
          token:  localStorage.getItem('userToken')
        })*/

      if (accounts.length > 1) {
        let mainOrganizer;
        this.props.viewer.sportunity.organizers.forEach(organizer => {
          if (organizer.isAdmin) mainOrganizer = organizer.organizer;
        });

        let organizerAccountIndex = accounts.findIndex(
          account => account.id === mainOrganizer.id,
        );

        if (organizerAccountIndex >= 0) {
          this.setState({
            isAuthorizedAdmin: true,
            mainOrganizer: accounts[organizerAccountIndex],
          });
        } else if (this.props.viewer.sportunity.kind === 'PRIVATE') {
          accounts = accounts.filter(
            account =>
              this.props.viewer.sportunity.participants.findIndex(
                participant => participant.id === account.id,
              ) >= 0 ||
              this.props.viewer.sportunity.waiting.findIndex(
                waiting => waiting.id === account.id,
              ) >= 0 ||
              this.props.viewer.sportunity.invited.findIndex(
                invited => invited.user.id === account.id,
              ) >= 0 ||
              this.props.viewer.sportunity.organizers.findIndex(
                organizer => organizer.organizer.id === account.id,
              ) >= 0,
          );

          if (accounts.length > 0) {
            displayChooseAccountModal({
              title: localizations.event_alert_event_is_private_title,
              message:
                localizations.event_alert_event_is_private_message_switch,
              cancelLabel:
                localizations.event_alert_event_is_private_message_switch_close,
              accounts,
              canCloseModal: false,
              onClose: () => {
                this.props.router.push({
                  pathname: '/my-events',
                });
              },
            });
          } else {
            this.setState({
              displayPrivateSportunityPopup: true,
            });
            confirmModal({
              title: localizations.event_alert_event_is_private_title,
              message: localizations.event_alert_event_is_private_message,
              confirmLabel: localizations.event_alert_event_is_private_ok,
              canCloseModal: false,
              onConfirm: () => {
                this.props.router.push({
                  pathname: '/my-events',
                });
              },
            });
          }
        }
      } else if (this.props.viewer.sportunity.kind === 'PRIVATE') {
        this.setState({
          displayPrivateSportunityPopup: true,
        });
        confirmModal({
          title: localizations.event_alert_event_is_private_title,
          message: localizations.event_alert_event_is_private_message,
          confirmLabel: localizations.event_alert_event_is_private_ok,
          canCloseModal: false,
          onConfirm: () => {
            this.props.router.push({
              pathname: '/my-events',
            });
          },
        });
      }
    } else {
      setTimeout(() => this.waitForDataSuperMe(), 100);
    }
  };

  _handleShowConfirmationPopup = () => {
    if (this.props.viewer.me !== null) {
      // LOGGED IN
      this.setState({
        selectedCard:
          this.props.viewer.me.paymentMethods.length > 0
            ? this.props.viewer.me.paymentMethods[
                this.props.viewer.me.paymentMethods.length - 1
              ]
            : '',
        displayConfirmationPopup: true,
      });
    } else {
      this.props.alert.show(localizations.event_login_needed, {
        timeout: 3000,
        type: 'info',
      });
      setTimeout(() => {
        this.props._loggedFromPage(
          '/event-view/' + this.props.viewer.sportunity.id,
        );
        localStorage.setItem(
          'registerFrom',
          '/event-view/' + this.props.viewer.sportunity.id,
        );
        this.props.router.push({
          pathname: '/register',
        });
      }, 2000);
    }
  };

  _handleHideConfirmationPopup = () => {
    this.setState({
      displayConfirmationPopup: false,
    });
  };

  _handleAddANewCard = () => {
    this.setState({
      displayConfirmationPopup: false,
      displayAddACardPopup: true,
    });
  };

  _handleShowCompleteProfile = () => {
    if (this.props.viewer.me.profileType === 'PERSON') {
      this.setState({
        displayConfirmationPopup: false,
        displayCompletePersonProfilePopup: true,
      });
    } else {
      this.setState({
        displayConfirmationPopup: false,
        displayCompleteBusinessProfilePopup: true,
      });
    }
  };

  _handleConfirmProfileUpdate = data => {
    UpdateUserProfileMutation.commit(
      {
        viewer: this.props.viewer,
        userIDVar: this.props.viewer.me.id,
        lastNameVar: data.lastName,
        firstNameVar: data.firstName,
        addressVar: data.address,
        nationalityVar: data.nationality,
        birthdayVar: data.birthday,
      },
      {
        onSuccess: response => {
          this.props.alert.show(
            localizations.popup_completeProfile_update_success,
            {
              timeout: 2000,
              type: 'success',
            },
          );
          this.setState({
            displayConfirmationPopup: true,
            displayCompletePersonProfilePopup: false,
          });
        },
        onFailure: error => {
          this.setState({
            processSaveProfile: false,
          });
          this.props.alert.show(
            localizations.popup_completeProfile_update_failed,
            {
              timeout: 4000,
              type: 'error',
            },
          );
        },
      },
    );
  };

  _handleConfirmBusinessProfileUpdate = data => {
    UpdateUserProfileMutation.commit(
      {
        viewer: this.props.viewer,
        userIDVar: this.props.viewer.me.id,
        lastNameVar: data.lastName,
        firstNameVar: data.firstName,
        addressVar: data.address,
        nationalityVar: data.nationality,
        businessNameVar: data.businessName,
        businessEmailVar: data.businessEmail,
        VATNumberVar: data.VATNumber,
        headquarterAddressVar: data.headquarterAddress,
        shouldDeclareVATVar: data.shouldDeclareVAT,
        birthdayVar: data.birthday,
      },
      {
        onSuccess: response => {
          this.props.alert.show(
            localizations.popup_completeProfile_update_success,
            {
              timeout: 2000,
              type: 'success',
            },
          );
          if (
            this.props.viewer.sportunity.price.cents > 0 &&
            this.props.viewer.me.paymentMethods.length === 0
          )
            this.setState({
              displayAddACardPopup: true,
              displayCompleteBusinessProfilePopup: false,
            });
          else
            this.setState({
              displayConfirmationPopup: true,
              displayCompleteBusinessProfilePopup: false,
            });
        },
        onFailure: error => {
          this.setState({
            processSaveProfile: false,
          });
          this.props.alert.show(
            localizations.popup_completeProfile_update_failed,
            {
              timeout: 4000,
              type: 'error',
            },
          );
        },
      },
    );
  };

  _handleConfirmOpponentCreation = () => {
    confirmModal({
      title: localizations.event_newOpponentSportunityValidation,
      message: localizations.event_newOpponentSportunity,
      confirmLabel: localizations.event_alert_confirm_cancel_yes,
      cancelLabel: localizations.event_alert_confirm_cancel_no,
      canCloseModal: true,
      onConfirm: () => {
        this.createOpponentSportunity();
      },
      onCancel: () => {},
    });
  };

  createOpponentSportunity() {
    this.setState({
      process: true,
      isLoading: true,
    });

    const {
      viewer,
      viewer: { me, sportunity },
    } = this.props;
    let params = { viewer, sportunity, user: me };

    NewOpponentSportunityMutation.commit(params, {
      onFailure: error => {
        this.setState({
          process: false,
          isLoading: false,
        });

        this.props.alert.show(
          localizations.event_newOpponentSportunityFailed,
          {
            timeout: 2000,
            type: 'error',
          },
        );
        let errors = JSON.parse(error.getError().source);
        console.log(errors.errors[0].message);
      },
      onSuccess: () => {
        this.setState({
          process: false,
          isLoading: false,
          isOpponentSportunityCreated: true,
        });

        this.props.alert.show(
          localizations.event_newOpponentSportunitySuccess,
          {
            timeout: 2000,
            type: 'success',
          },
        );
        this.props.router.push({
          pathname: '/my-events/',
        });
      },
    });
  }

  _handleSecondaryOrganizerSelectRole = () => {
    const _handleChangeSelectedRole = selectedRole =>
      this.setState({
        isPotentialSecondaryOrganizerSelectedRole: selectedRole,
      });

    let askedRoles = [];
    let user = this.props.viewer.me;
    let language = localizations.getLanguage();

    this.props.viewer.sportunity.pendingOrganizers.forEach(
      pendingOrganizer => {
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
              ? pendingOrganizer.price
                ? pendingOrganizer.secondaryOrganizerType.name[
                    language.toUpperCase()
                  ] +
                  ' (' +
                  localizations.event_secondaryOrganizer_Price +
                  ': ' +
                  pendingOrganizer.price.currency +
                  ' ' +
                  pendingOrganizer.price.cents / 100 +
                  ')'
                : pendingOrganizer.secondaryOrganizerType.name[
                    language.toUpperCase()
                  ]
              : pendingOrganizer.price
              ? pendingOrganizer.customSecondaryOrganizerType +
                ' (' +
                localizations.event_secondaryOrganizer_Price +
                ': ' +
                pendingOrganizer.price.currency +
                ' ' +
                pendingOrganizer.price.cents / 100 +
                ')'
              : pendingOrganizer.customSecondaryOrganizerType,
          });
        }
      },
    );

    this.setState({
      isPotentialSecondaryOrganizerSelectedRole: askedRoles[0],
    });

    let message = (
      <div>
        {localizations.event_pendingSecondaryOrganizerValidationMessage}
        <select
          style={styles.select}
          onChange={_handleChangeSelectedRole}
          value={
            this.state.isPotentialSecondaryOrganizerSelectedRole
              ? this.state.isPotentialSecondaryOrganizerSelectedRole.id
              : askedRoles[0].id
          }
        >
          {askedRoles.map(role => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>
    );

    confirmModal({
      title: localizations.event_pendingSecondaryOrganizerValidationTitle,
      message,
      confirmLabel: localizations.event_alert_confirm_cancel_yes,
      cancelLabel: localizations.event_alert_confirm_cancel_no,
      canCloseModal: true,
      onConfirm: () => {
        this.secondaryOrganizerSelectRole();
      },
      onCancel: () => {},
    });
  };

  _handleSecondaryOrganizerRefuseRole = () => {
    const _handleChangeSelectedRole = selectedRole =>
      this.setState({
        isPotentialSecondaryOrganizerSelectedRole: selectedRole,
      });

    let askedRoles = [];
    let user = this.props.viewer.me;
    let language = localizations.getLanguage();

    this.props.viewer.sportunity.pendingOrganizers.forEach(
      pendingOrganizer => {
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
              ? pendingOrganizer.price
                ? pendingOrganizer.secondaryOrganizerType.name[
                    language.toUpperCase()
                  ] +
                  ' (' +
                  localizations.event_secondaryOrganizer_Price +
                  ': ' +
                  pendingOrganizer.price.currency +
                  ' ' +
                  pendingOrganizer.price.cents / 100 +
                  ')'
                : pendingOrganizer.secondaryOrganizerType.name[
                    language.toUpperCase()
                  ]
              : pendingOrganizer.price
              ? pendingOrganizer.customSecondaryOrganizerType +
                ' (' +
                localizations.event_secondaryOrganizer_Price +
                ': ' +
                pendingOrganizer.price.currency +
                ' ' +
                pendingOrganizer.price.cents / 100 +
                ')'
              : pendingOrganizer.customSecondaryOrganizerType,
          });
        }
      },
    );

    this.setState({
      isPotentialSecondaryOrganizerSelectedRole: askedRoles[0],
    });

    let message = (
      <div>
        {localizations.event_pendingSecondaryOrganizerRefuseMessage}
        <select
          style={styles.select}
          onChange={_handleChangeSelectedRole}
          value={
            this.state.isPotentialSecondaryOrganizerSelectedRole
              ? this.state.isPotentialSecondaryOrganizerSelectedRole.id
              : askedRoles[0].id
          }
        >
          {askedRoles.map(role => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>
    );

    confirmModal({
      title: localizations.event_pendingSecondaryOrganizerRefuseTitle,
      message,
      confirmLabel: localizations.event_alert_confirm_cancel_yes,
      cancelLabel: localizations.event_alert_confirm_cancel_no,
      canCloseModal: true,
      onConfirm: () => {
        this.secondaryOrganizerRefuseRole();
      },
      onCancel: () => {},
    });
  };

  secondaryOrganizerSelectRole = () => {
    if (!this.state.isPotentialSecondaryOrganizerSelectedRole) return;

    this.setState({
      process: true,
      isLoading: true,
    });

    let params = {
      viewer: this.props.viewer,
      sportunity: this.props.viewer.sportunity,
      pendingOrganizerIDVar: this.state
        .isPotentialSecondaryOrganizerSelectedRole.id,
    };

    SecondaryOrganizerPickRoleMutation.commit(params, {
      onFailure: error => {
        this.setState({
          process: false,
          isLoading: false,
        });

        this.props.alert.show(localizations.event_fill_statistics_failed, {
          timeout: 2000,
          type: 'error',
        });
        let errors = JSON.parse(error.getError().source);
        console.log(errors.errors[0].message);
      },
      onSuccess: () => {
        this.setState({
          process: false,
          isLoading: false,
        });

        this.props.alert.show(localizations.event_fill_statistics_success, {
          timeout: 2000,
          type: 'success',
        });
      },
    });
  };

  secondaryOrganizerRefuseRole = () => {
    if (!this.state.isPotentialSecondaryOrganizerSelectedRole) return;

    this.setState({
      process: true,
      isLoading: true,
    });

    let params = {
      viewer: this.props.viewer,
      sportunity: this.props.viewer.sportunity,
      pendingOrganizerIDVar: this.state
        .isPotentialSecondaryOrganizerSelectedRole.id,
    };

    SecondaryOrganizerRefuseRoleMutation.commit(params, {
      onFailure: error => {
        this.setState({
          process: false,
          isLoading: false,
        });

        this.props.alert.show(localizations.event_fill_statistics_failed, {
          timeout: 2000,
          type: 'error',
        });
        let errors = JSON.parse(error.getError().source);
        console.log(errors.errors[0].message);
      },
      onSuccess: () => {
        this.setState({
          process: false,
          isLoading: false,
        });

        this.props.alert.show(localizations.event_fill_statistics_success, {
          timeout: 2000,
          type: 'success',
        });
      },
    });
  };

  _handleSecondaryOrganizerCancel = () => {
    let language = localizations.getLanguage();
    let currentUserOrganizer = this.props.viewer.sportunity.organizers.find(
      organizer => organizer.organizer.id === this.props.viewer.me.id,
    );

    let role = currentUserOrganizer.secondaryOrganizerType
      ? currentUserOrganizer.price
        ? currentUserOrganizer.secondaryOrganizerType.name[
            language.toUpperCase()
          ].toLowerCase() +
          ' (' +
          localizations.event_secondaryOrganizer_Price.toLowerCase() +
          ': ' +
          currentUserOrganizer.price.currency +
          ' ' +
          currentUserOrganizer.price.cents / 100 +
          ')'
        : currentUserOrganizer.secondaryOrganizerType.name[
            language.toUpperCase()
          ].toLowerCase()
      : currentUserOrganizer.price
      ? currentUserOrganizer.customSecondaryOrganizerType.toLowerCase() +
        ' (' +
        localizations.event_secondaryOrganizer_Price.toLowerCase() +
        ': ' +
        currentUserOrganizer.price.currency +
        ' ' +
        currentUserOrganizer.price.cents / 100 +
        ')'
      : currentUserOrganizer.customSecondaryOrganizerType.toLowerCase();

    this.props.relay.refetch(
      fragmentVariables => ({
        ...fragmentVariables,
        queryIsCoOrganizerOnSerie: true,
      }),
      null,
      () => {
        setTimeout(() => {
          if (this.props.viewer.IsCoOrganizerOnSerie) {
            confirmModal({
              title:
                localizations.event_pendingSecondaryOrganizerCancelationTitle,
              message: localizations.event_pendingSecondaryOrganizerCancelationMessageSerie.replace(
                '-role-',
                role,
              ),
              confirmLabel:
                localizations.event_alert_update_serie_or_occurence_no,
              cancelLabel:
                localizations.event_alert_update_serie_or_occurence_yes,
              canCloseModal: true,
              onConfirm: () => {
                this.secondaryOrganizerCancel(false);
              },
              onCancel: () => {
                this.secondaryOrganizerCancel(true);
              },
            });
          } else {
            confirmModal({
              title:
                localizations.event_pendingSecondaryOrganizerCancelationTitle,
              message: localizations.event_pendingSecondaryOrganizerCancelationMessage.replace(
                '-role-',
                role,
              ),
              confirmLabel: localizations.event_alert_confirm_cancel_yes,
              cancelLabel: localizations.event_alert_confirm_cancel_no,
              canCloseModal: true,
              onConfirm: () => {
                this.secondaryOrganizerCancel(false);
              },
              onCancel: () => {},
            });
          }
        }, 50);
      },
    );
  };

  secondaryOrganizerCancel = cancelSerie => {
    this.setState({
      process: true,
      isLoading: true,
    });

    let params = {
      viewer: this.props.viewer,
      sportunity: this.props.viewer.sportunity,
      cancelSerieVar: cancelSerie,
    };

    SecondaryOrganizerCancelRoleMutation.commit(params, {
      onFailure: error => {
        this.setState({
          process: false,
          isLoading: false,
        });

        this.props.alert.show(localizations.event_fill_statistics_failed, {
          timeout: 2000,
          type: 'error',
        });
        let errors = JSON.parse(error.getError().source);
        console.log(errors.errors[0].message);
      },
      onSuccess: () => {
        this.setState({
          process: false,
          isLoading: false,
          isSecondaryOrganizer: false,
        });

        this.props.alert.show(localizations.event_fill_statistics_success, {
          timeout: 2000,
          type: 'success',
        });
      },
    });
  };

  _handleOrganizerAddParticipants = (users, circleToPutUsersIn) => {
    this.setState({
      process: true,
      isLoading: true,
    });

    let params = {
      viewer: this.props.viewer,
      sportunity: this.props.viewer.sportunity,
      participantsVar: users,
      putParticipantsInCircleVar: circleToPutUsersIn,
    };

    OrganizerAddParticipantMutation.commit(params, {
      onFailure: error => {
        this.setState({
          process: false,
          isLoading: false,
        });

        this.props.alert.show(
          localizations.event_addParticipantOrInvited_failed,
          {
            timeout: 2000,
            type: 'error',
          },
        );
        let errors = JSON.parse(error.getError().source);
        console.log(errors.errors[0].message);
      },
      onSuccess: () => {
        this.setState({
          process: false,
          isLoading: false,
        });

        this.props.alert.show(
          localizations.event_addParticipantOrInvited_success,
          {
            timeout: 2000,
            type: 'success',
          },
        );
      },
    });
  };

  _handleOrganizerAddInviteds = (users, circleToPutUsersIn) => {
    this.setState({
      process: true,
      isLoading: true,
    });

    let params = {
      viewer: this.props.viewer,
      sportunity: this.props.viewer.sportunity,
      invitedsVar: users,
      putInvitedsInCircleVar: circleToPutUsersIn,
    };

    OrganizerAddInvitedMutation.commit(params, {
      onFailure: error => {
        this.setState({
          process: false,
          isLoading: false,
        });

        this.props.alert.show(
          localizations.event_addParticipantOrInvited_failed,
          {
            timeout: 2000,
            type: 'error',
          },
        );
        let errors = JSON.parse(error.getError().source);
        console.log(errors.errors[0].message);
      },
      onSuccess: () => {
        this.setState({
          process: false,
          isLoading: false,
        });

        this.props.alert.show(
          localizations.event_addParticipantOrInvited_success,
          {
            timeout: 2000,
            type: 'success',
          },
        );
      },
    });
  };

  _handleOrganizerAddInvitedCircles = circles => {
    this.setState({
      process: true,
      isLoading: true,
    });

    let params = {
      viewer: this.props.viewer,
      sportunity: this.props.viewer.sportunity,
      invitedCirclesVar: circles,
    };

    OrganizerAddInvitedCirclesMutation.commit(params, {
      onFailure: error => {
        this.setState({
          process: false,
          isLoading: false,
        });

        this.props.alert.show(
          localizations.event_addParticipantOrInvited_failed,
          {
            timeout: 2000,
            type: 'error',
          },
        );
        let errors = JSON.parse(error.getError().source);
        console.log(errors.errors[0].message);
      },
      onSuccess: () => {
        this.props.relay.refetch();
        this.setState({
          process: false,
          isLoading: false,
        });

        this.props.alert.show(
          localizations.event_addParticipantOrInvited_success,
          {
            timeout: 2000,
            type: 'success',
          },
        );
      },
    });
  };

  _handleOrganizerRemoveInvitedCircleConfirm = circle => {
    confirmModal({
      title: localizations.event_remove_circle_popup_title,
      message: localizations.event_remove_circle_popup_message.replace('{0}', circle.name),
      confirmLabel: localizations.circle_yes,
      cancelLabel: localizations.circle_no,
      canCloseModal: true,
      onConfirm: () => {this._handleOrganizerRemoveInvitedCircle(circle)},
      onCancel: () => {},
    });
  }

  _handleOrganizerRemoveInvitedCircle = circle => {
    this.setState({
      process: true,
      isLoading: true,
    });

    let updateInvitedCirclesVar = this.props.viewer.sportunity.invited_circles.edges.map(edge => edge.node.id) ;
    let invitedCirclesIndex = updateInvitedCirclesVar.findIndex(u => u === circle.id);

    if (invitedCirclesIndex >= 0) {
      updateInvitedCirclesVar.splice(invitedCirclesIndex, 1)
    }

    let updatePriceForCircleVar = this.props.viewer.sportunity.price_for_circle.map(price_for_circle => ({
      circle: price_for_circle.circle.id,
      price: price_for_circle.price,
      participantByDefault: price_for_circle.participantByDefault, 
      excludedParticipantByDefault: price_for_circle.excludedParticipantByDefault
    })) ; 
    let priceForCircleIndex = updatePriceForCircleVar.findIndex(u => u.circle === circle.id)
    
    if (priceForCircleIndex >= 0) {
      updatePriceForCircleVar.splice(priceForCircleIndex, 1)
    }

    let params = {
      viewer: this.props.viewer,
      sportunity: this.props.viewer.sportunity,
      updateInvitedCirclesVar: updateInvitedCirclesVar,
      updatePriceForCircleVar: updatePriceForCircleVar
    };

    OrganizerAddOrRemoveInvitedCircleMutation.commit(params, {
      onFailure: error => {
        this.setState({
          process: false,
          isLoading: false,
        });

        this.props.alert.show(
          localizations.event_addParticipantOrInvited_failed,
          {
            timeout: 2000,
            type: 'error',
          },
        );
        console.log(error);
      },
      onSuccess: () => {
        this.props.relay.refetch();
        this.setState({
          process: false,
          isLoading: false,
        });

        this.props.alert.show(
          localizations.event_addParticipantOrInvited_success,
          {
            timeout: 2000,
            type: 'success',
          },
        );
      },
    });
  }

  _handleOrganizerAddInvitedCirclesWithPrice = (circles, prices) => {
    
    this.setState({
      process: true,
      isLoading: true,
    });

    let updateInvitedCirclesVar = 
      cloneDeep(this.props.viewer.sportunity.invited_circles).edges
      .map(edge => edge.node.id)
      .filter(invited_circle_id => circles.findIndex(c => c === invited_circle_id) >= 0) ;

    let updatePriceForCircleVar = cloneDeep(this.props.viewer.sportunity.price_for_circle)
      .map(price_for_circle => ({
        circle: price_for_circle.circle.id,
        price: price_for_circle.price,
        participantByDefault: price_for_circle.participantByDefault, 
        excludedParticipantByDefault: price_for_circle.excludedParticipantByDefault
      }))
      .filter(price_for_circle => circles.findIndex(c => c === price_for_circle.circle) >= 0) ;

    for (var i = 0 ; i < circles.length ; i++) {
      let circle = circles[i];
      let invitedCirclesIndex = updateInvitedCirclesVar.findIndex(u => u === circle);

      if (invitedCirclesIndex < 0) {
        updateInvitedCirclesVar.push(circle);
      }

      let updatePriceForCircleIndex = updatePriceForCircleVar.findIndex(u => u.circle === circle);
      let priceForCircleIndex = prices.findIndex(u => u.circle.id === circle)

      if (updatePriceForCircleIndex >= 0) {
        updatePriceForCircleVar[updatePriceForCircleIndex] = {
          circle: circle,
          price: priceForCircleIndex >= 0
            ? prices[priceForCircleIndex].price
            : {cents: 0, currency: this.props.viewer.sportunity.price.currency},
          participantByDefault: updatePriceForCircleVar[updatePriceForCircleIndex].participantByDefault
        }
      }
      else {
        updatePriceForCircleVar.push({
          circle: circle,
          price: priceForCircleIndex >= 0
            ? prices[priceForCircleIndex].price
            : {cents: 0, currency: this.props.viewer.sportunity.price.currency},
          participantByDefault: false
        })
      }
    }
    let params = {
      viewer: this.props.viewer,
      sportunity: this.props.viewer.sportunity,
      updateInvitedCirclesVar: updateInvitedCirclesVar,
      updatePriceForCircleVar: updatePriceForCircleVar
    };

    OrganizerAddOrRemoveInvitedCircleMutation.commit(params, {
      onFailure: error => {
        this.setState({
          process: false,
          isLoading: false,
        });

        this.props.alert.show(
          localizations.event_addParticipantOrInvited_failed,
          {
            timeout: 2000,
            type: 'error',
          },
        );
        console.log(error);
      },
      onSuccess: () => {
        this.props.relay.refetch();
        this.setState({
          process: false,
          isLoading: false,
        });

        this.props.alert.show(
          localizations.event_addParticipantOrInvited_success,
          {
            timeout: 2000,
            type: 'success',
          },
        );
      },
    });
  }

  refetchAfterSubscribeOrUnsubscribe = () => {
    this.props.relay.refetch();
  };

  _handleChangeSelectedCard = e => {
    if (e.target.value.indexOf('wallet') >= 0) {
      this.setState({
        selectedCard: '',
        selectedWallet: e.target.value, 
        paymentWithWallet: true,
      });
      return true;
    }
    if (e.target.value === 'addACard') {
      this.setState({
        selectedCard: '',
        selectedWallet: '',
        paymentWithWallet: false,
      });
    }
    this.props.viewer.me.paymentMethods.find(paymentMethod => {
      if (paymentMethod.id === e.target.value) {
        this.setState({
          selectedCard: paymentMethod,
          selectedWallet: '',
          paymentWithWallet: false,
        });
        return true;
      }
      return false;
    });
  };

  isValidCard(card) {
    return (
      card.cardNumber &&
      card.cardNumber.length === 16 &&
      card.cardExpirationDate &&
      card.cardExpirationDate.length === 4 &&
      card.cardCvx &&
      card.cardCvx.length === 3 &&
      card.cardType
    );
  }

  _handleConfirmAddACard = (cardRegistration, card) => {
    if (!cardRegistration) {
      this.props.alert.show(localizations.popup_addACard_card_removed_error, {
        timeout: 2000,
        type: 'error',
      });

      return;
    }

    if (!this.isValidCard(card)) {
      this.props.alert.show(localizations.popup_addACard_invalid_card, {
        timeout: 2000,
        type: 'error',
      });
      return;
    }

    this.setState({ process: true });

    let that = this;
    if (card)
      mangoPay.cardRegistration.init({
        Id: cardRegistration.cardRegistrationId,
        cardRegistrationURL: cardRegistration.cardRegistrationURL,
        accessKey: cardRegistration.accessKey,
        preregistrationData: cardRegistration.preregistrationData,
      });
    mangoPay.cardRegistration.registerCard(
      card,
      function(res) {
        that.updateCard(cardRegistration, res.RegistrationData);
      },
      function(res) {
        // Handle error, see res.ResultCode and res.ResultMessage
        that.props.alert.show(res.ResultMessage, {
          timeout: 4000,
          type: 'error',
        });
        that.setState({
          process: false,
        });
      },
    );
  };

  updateCard(cardRegistration, registrationData) {
    RegisterCardDataMutation.commit(
      {
        viewer: this.props.viewer,
        cardRegistration: cardRegistration,
        registrationData: registrationData,
      },
      {
        onSuccess: res => {
          this.props.alert.show(localizations.popup_addACard_success, {
            timeout: 2000,
            type: 'success',
          });
          this.setState({
            selectedCard:
              res.registerCardData.viewer.me.paymentMethods.length > 0
                ? res.registerCardData.viewer.me.paymentMethods[
                    res.registerCardData.viewer.me.paymentMethods.length - 1
                  ]
                : '',
            me: res.registerCardData.viewer.me,
            displayConfirmationPopup: true,
            displayAddACardPopup: false,
            cardJustAdded: true,
            process: false,
          });
        },
        onFailure: error => {
          this.props.alert.show(localizations.popup_addACard_error, {
            timeout: 5000,
            type: 'error',
          });
          this.setState({
            process: false,
          });
        },
      },
    );
  }

  _handleHideACard = () => {
    this.setState({
      displayConfirmationPopup: true,
      displayAddACardPopup: false,
    });
  };

  _handleHideCompleteProfilePopup = () => {
    this.setState({
      displayConfirmationPopup: true,
      displayCompletePersonProfilePopup: false,
    });
  };

  _handleHideCompleteBusinessProfilePopup = () => {
    this.setState({
      displayConfirmationPopup: true,
      displayCompleteBusinessProfilePopup: false,
    });
  };

  _handleUserBook = () => {
    this.setState({
      process: true,
      isLoading: true,
    });
    let userIsInvited =
      this.props.viewer.sportunity &&
      this.props.viewer.sportunity.status &&
      (this.props.viewer.sportunity.status.toLowerCase() === 'invited-grey' ||
        this.props.viewer.sportunity.status.toLowerCase() ===
          'invited-black' ||
        this.props.viewer.sportunity.status.toLowerCase() ===
          'invited-yellow');

    BookUserMutation.commit(
      {
        viewer: this.props.viewer,
        sportunity: this.props.viewer.sportunity,
        user: this.props.viewer.me,
        paymentMethod:
          this.props.viewer.sportunity.price.cents > 0 &&
          !this.state.paymentWithWallet
            ? this.state.selectedCard.id
            : null,
        paymentByWallet: this.state.paymentWithWallet,
        confirmationPage: appUrl + '/event-view/' + this.props.viewer.sportunity.id + '/booking-confirmation'
      },
      (response, errors) => {
        if (response && !errors) {
          if (response && response.userBooksEvent && response.userBooksEvent.secure3DURL) {
            window.location.href = response.userBooksEvent.secure3DURL;
          }
          else {
            this.props.alert.show(
              localizations.popup_sportunityBooking_success,
              {
                timeout: 2000,
                type: 'success',
              },
            );
            this.setState({
              displayConfirmationPopup: false,
              process: false,
            });
            setTimeout(() => {
              this.setState({ isLoading: false });
            }, 1000);
            this._updateTutorialSteps();
          }
        }
        else {
          this.props.alert.show(errors[0].message, {
            timeout: 4000,
            type: 'error',
          });
          this.setState({
            process: false,
            isLoading: false,
          });
        }
      },
      error => {
        this.props.alert.show(error.errors[0].message, {
          timeout: 4000,
          type: 'error',
        });
        this.setState({
          process: false,
          isLoading: false,
        });
      },
    );
  };

  _updateTutorialSteps = () => {
    const { tutorialSteps } = this.props;
    let newTutorialSteps = cloneDeep(tutorialSteps);

    newTutorialSteps['giveAvailabilitiesStep'] = true;
    this.props._updateStepsCompleted(newTutorialSteps);
  };

  _handleDeclineInvitation = () => {
    const {
      viewer,
      viewer: { sportunity },
    } = this.props;

    RefuseInvitationMutation.commit(
      {
        viewer,
        sportunity,
        userId: this.props.viewer.me.id,
      },
      {
        onFailure: error => {
          this.props.alert.show(error.getError().source.errors[0].message, {
            timeout: 4000,
            type: 'error',
          });
          console.log(error);
        },
        onSuccess: () => {
          this.props.alert.show(localizations.event_refuse_invitation, {
            timeout: 2000,
            type: 'success',
          });
        },
      },
    );
  };

  _handleUserCancel = () => {
    this.setState({
      process: true,
      isLoading: true,
    });

    let userwasInvited =
      this.props.viewer.sportunity &&
      this.props.viewer.sportunity.invited &&
      this.props.viewer.sportunity.invited.length > 0 &&
      !!this.props.viewer.sportunity.invited.find(
        item => item && item.user && item.user.id === this.props.viewer.me.id,
      );

    CancelUserMutation.commit(
      {
        viewer: this.props.viewer,
        sportunity: this.props.viewer.sportunity,
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
          this.setState({
            displayConfirmationPopup: false,
            process: false,
          });
          setTimeout(() => {
            this.setState({ isLoading: false });
          }, 1000);
        },
        onFailure: error => {
          this.props.alert.show(error.getError().source.errors[0].message, {
            timeout: 4000,
            type: 'error',
          });
          this.setState({
            process: false,
            isLoading: false,
          });
        },
      },
    );
  };

  _handleAdminModify = () => {
    let path = '/event-edit/' + this.props.viewer.sportunity.id;
    if (
      this.props.viewer.sportunity.number_of_occurences -
        this.props.viewer.sportunity.is_repeated_occurence_number >
      1
    ) {
      confirmModal({
        title: localizations.event_alert_update_serie_or_occurence_title,
        message: localizations.formatString(
          localizations.event_alert_update_serie_or_occurence_message,
          this.props.viewer.sportunity.number_of_occurences -
            this.props.viewer.sportunity.is_repeated_occurence_number,
        ),
        confirmLabel: localizations.event_alert_update_serie_or_occurence_yes,
        cancelLabel: localizations.event_alert_update_serie_or_occurence_no,
        canCloseModal: true,
        onConfirm: () => {
          this._handleAdminModifySerie();
        },
        onCancel: () => {
          this.props.router.push({
            pathname: '/event-edit/' + this.props.viewer.sportunity.id,
          });
        },
      });
    } else {
      this.props.router.push({
        pathname: '/event-edit/' + this.props.viewer.sportunity.id,
      });
    }
  };

  _handleAdminModifySerie = () => {
    let path = '/event-edit/' + this.props.viewer.sportunity.id;
    if (
      this.props.viewer.sportunity.number_of_occurences -
        this.props.viewer.sportunity.is_repeated_occurence_number >
      1
    ) {
      confirmModal({
        title: localizations.event_alert_update_serie_title,
        message: localizations.formatString(
          localizations.event_alert_update_serie_message,
          this.props.viewer.sportunity.number_of_occurences -
            this.props.viewer.sportunity.is_repeated_occurence_number,
        ),
        confirmLabel: localizations.event_alert_update_serie_yes,
        cancelLabel: localizations.event_alert_update_serie_no,
        canCloseModal: true,
        onConfirm: () => {
          this.props.router.push({
            pathname: '/serie-edit/' + this.props.viewer.sportunity.id,
          });
        },
        onCancel: () => {},
      });
    } else {
      this.props.router.push({
        pathname: '/event-edit/' + this.props.viewer.sportunity.id,
      });
    }
  };

  _handleAdminReOrganize = () => {
    let path = '/event-reorganize/' + this.props.viewer.sportunity.id;
    this.props.router.push({
      pathname: path,
    });
  };

  _handleSeeAsAdmin = () => {
    this.props._loggedFromPage(
      '/event-view/' + this.props.viewer.sportunity.id,
    );
    localStorage.setItem('userId', this.state.mainOrganizer.id);
    setTimeout(() => {
      this.props.router.push({
        pathname: '/login-superuser/' + this.state.mainOrganizer.token,
      });
    }, 100);
  };

  cancelSportunity = cancelTheSerie => {
    CancelSportunityMutation.commit(
      {
        viewer: this.props.viewer,
        sportunity: this.props.viewer.sportunity,
        user: this.props.viewer.me,
        modifyRepeatedSportunities: cancelTheSerie,
      },
      {
        onSuccess: () => {
          this.props.relay.refetch();
          this.props.alert.show(
            localizations.popup_sportunityCancelEvent_success,
            {
              timeout: 2000,
              type: 'success',
            },
          );
          this.setState({
            process: false,
            isActive: false,
          });
          setTimeout(() => {
            this.setState({ isLoading: false });
          }, 1000);
        },
        onFailure: error => {
          this.props.alert.show(error.getError().source.errors[0].message, {
            timeout: 4000,
            type: 'error',
          });
          this.setState({
            process: false,
            isLoading: false,
          });
        },
      },
    );
  };

  deleteSportunity = () => {
    DeleteSportunityMutation.commit(
      {
        viewer: this.props.viewer,
        sportunity: this.props.viewer.sportunity,
        user: this.props.viewer.me
      },
      {
        onSuccess: () => {
          this.props.relay.refetch();
          this.props.alert.show(
            localizations.popup_sportunityDeleteEvent_success,
            {
              timeout: 2000,
              type: 'success',
            },
          );
          this.setState({
            process: false,
            isActive: false,
          });
          setTimeout(() => {
            this.setState({ isLoading: false });
            this.props.router.push({
              pathname: '/my-events',
            });
          }, 1000);
        },
        onFailure: error => {
          this.props.alert.show(error.getError().source.errors[0].message, {
            timeout: 4000,
            type: 'error',
          });
          this.setState({
            process: false,
            isLoading: false,
          });
        },
      },
    );
  }

  _handleShowConfirmationParticipantPopup = participant => {
    confirmModal({
      title: localizations.event_cancelation_popup_participant_title,
      message: localizations.formatString(
        localizations.event_cancelation_popup_participant_message,
        participant.pseudo,
      ),
      confirmLabel: localizations.event_cancelation_popup_participant_yes,
      cancelLabel: localizations.event_cancelation_popup_participant_no,
      canCloseModal: true,
      onConfirm: () => {
        this._cancelParticipation(participant);
      },
      onCancel: () => {},
    });
  };

  _cancelParticipation = participant => {
    CancelParticipantSportunityMutation.commit(
      {
        sportunityID: this.props.viewer.sportunity.id,
        viewer: this.props.viewer,
        sportunity: this.props.viewer.sportunity,
        user: participant.id,
      },
      {
        onFailure: error => {
          this.props.alert.show(error.getError(), {
            timeout: 2000,
            type: 'error',
          });
        },
        onSuccess: () => {
          this.props.alert.show(
            localizations.event_cancelation_popup_participation_success,
            {
              timeout: 2000,
              type: 'success',
            },
          );
        },
      },
    );
  };

  confirmAdminCancel = cancelTheSerie => {
    confirmModal({
      title: localizations.event_alert_confirm_cancel_title,
      message: cancelTheSerie
        ? localizations.formatString(
            localizations.event_alert_confirm_cancel_serie_message,
            this.props.viewer.sportunity.number_of_occurences -
              this.props.viewer.sportunity.is_repeated_occurence_number,
          )
        : localizations.event_alert_confirm_cancel_sportunity_message,
      confirmLabel: localizations.event_alert_confirm_cancel_yes,
      cancelLabel: localizations.event_alert_confirm_cancel_no,
      canCloseModal: true,
      onConfirm: () => {
        this.cancelSportunity(cancelTheSerie);
      },
      onCancel: () => {},
    });
  };

  confirmAdminDelete = () => {
    confirmModal({
      title: localizations.event_alert_confirm_delete_title,
      message: localizations.event_alert_confirm_delete_sportunity_message,
      confirmLabel: localizations.event_alert_confirm_cancel_yes,
      cancelLabel: localizations.event_alert_confirm_cancel_no,
      canCloseModal: true,
      onConfirm: () => {
        this.deleteSportunity();
      },
      onCancel: () => {},
    });
  }

  _handleAdminCancel = () => {
    this.setState({
      process: true,
      isLoading: true,
    });
    if (
      this.props.viewer.sportunity.number_of_occurences - this.props.viewer.sportunity.is_repeated_occurence_number > 1
    ) {
      confirmModal({
        title: localizations.event_alert_cancel_serie_or_occurence_title,
        message: localizations.formatString(
          localizations.event_alert_cancel_serie_or_occurence_message,
          this.props.viewer.sportunity.number_of_occurences -
            this.props.viewer.sportunity.is_repeated_occurence_number,
        ),
        confirmLabel: localizations.event_alert_cancel_serie_or_occurence_yes,
        cancelLabel: localizations.event_alert_cancel_serie_or_occurence_no,
        canCloseModal: true,
        onConfirm: () => {
          this.confirmAdminCancel(true);
        },
        onCancel: () => {
          this.confirmAdminCancel(false);
        },
      });
    } else this.confirmAdminCancel(false);

    this.setState({
      process: false,
      isLoading: false,
    });
  };

  _handleAdminDelete = () => {
    this.setState({
      process: true,
      isLoading: true,
    });
    this.confirmAdminDelete();
  }

  _handleToggleStatisticForm = () => {
    this.setState({
      displayStatFilling: !this.state.displayStatFilling,
    });
  };

  openAndroidApp = () => {
    document.location =
      'sportunity://sportunity/' + this.props.viewer.sportunity.id;
  };

  renderMetaImage = images => {
    return images.map(image => <meta property="og:image" content={image} />);
  };

  renderMetaTags = sportunity => {
    //moment.tz.setDefault("Europe/Zurich");
    return (
      <Helmet>
        <title>{'Sportunity - ' + sportunity.title}</title>
        <meta name="robots" content="noindex" />
        <meta name="description" content={localizations.meta_description} />
        <meta property="fb:app_id" content="1759806787601548" />
        <meta property="og:type" content="article" />
        <meta
          property="og:title"
          content={'Sportunity - ' + sportunity.title}
        />
        <meta
          property="og:description"
          content={
            sportunity.title +
            '\n' +
            'Date: ' +
            moment
              .tz(sportunity.beginning_date, 'Europe/Zurich')
              .format('DD/MM/YYYY, H:mm') +
            '\n' +
            'Lieu: ' +
            sportunity.address.city
          }
        />
        <meta
          property="og:url"
          content={appUrl + this.props.location.pathname}
        />
        {sportunity.images && sportunity.images.length > 0 ? (
          this.renderMetaImage(sportunity.images)
        ) : (
          <meta property="og:image" content={sportunity.sport.sport.logo} />
        )}
        <meta property="og:image:width" content="250" />
        <meta property="og:image:height" content="250" />
      </Helmet>
    );
  };

  _handleUpdateSportunityTitle = newTitle => {
    this.setState({
      process: true,
      isLoading: true,
    });
    UpdateSportunityTitleMutation.commit(
      {
        sportunity: this.props.viewer.sportunity,
        title: newTitle,
      },
      {
        onSuccess: () => {
          this.props.alert.show(localizations.popup_update_title_success, {
            timeout: 2000,
            type: 'success',
          });
          this.setState({
            process: false,
            isLoading: false,
          });
          setTimeout(() => {
            this.setState({ isLoading: false });
          }, 1000);
        },
        onFailure: error => {
          this.props.alert.show(localizations.popup_update_title_failed, {
            timeout: 4000,
            type: 'error',
          });
          this.setState({
            process: false,
            isLoading: false,
          });
        },
      },
    );
  };

  _handleUpdateSportunityDescription = newDescription => {
    this.setState({
      process: true,
      isLoading: true,
    });
    UpdateSportunityDescriptionMutation.commit(
      {
        sportunity: this.props.viewer.sportunity,
        description: newDescription,
      },
      {
        onSuccess: () => {
          this.props.alert.show(
            localizations.popup_update_description_success,
            {
              timeout: 2000,
              type: 'success',
            },
          );
          this.setState({
            process: false,
            isLoading: false,
          });
          setTimeout(() => {
            this.setState({ isLoading: false });
          }, 1000);
        },
        onFailure: error => {
          this.props.alert.show(
            localizations.popup_update_description_failed,
            {
              timeout: 4000,
              type: 'error',
            },
          );
          this.setState({
            process: false,
            isLoading: false,
          });
        },
      },
    );
  };

  _handleUpdateSportunityLevels = sportVar => {
    this.setState({
      process: true,
      isLoading: true,
    });
    UpdateSportunityLevelsMutation.commit(
      {
        sportunity: this.props.viewer.sportunity,
        sport: sportVar,
      },
      {
        onSuccess: () => {
          this.props.alert.show(localizations.popup_update_levels_success, {
            timeout: 2000,
            type: 'success',
          });
          this.setState({
            process: false,
            isLoading: false,
          });
          setTimeout(() => {
            this.setState({ isLoading: false });
          }, 1000);
        },
        onFailure: error => {
          this.props.alert.show(localizations.popup_update_levels_failed, {
            timeout: 4000,
            type: 'error',
          });
          this.setState({
            process: false,
            isLoading: false,
          });
        },
      },
    );
  };

  render() {
    const { viewer } = this.props;
    const { isPotentialOpponent, isPotentialSecondaryOrganizer } = this.state;
    let userIsParticipant =
      viewer &&
      viewer.me &&
      viewer.sportunity.participants.findIndex(
        p => p.id === viewer.me.id,
      ) >= 0;

    let userIsOnWaitingList =
      viewer &&
      viewer.me &&
      viewer.sportunity.waiting.findIndex(
        p => p.id === viewer.me.id,
      ) >= 0;

    let userWasInvited =
      viewer &&
      viewer.sportunity &&
      viewer.sportunity.invited &&
      viewer.sportunity.invited.length > 0 &&
      viewer.me &&
      !!viewer.sportunity.invited.find(
        item => item && item.user && item.user.id === viewer.me.id,
      );

    let userIsInvited =
      ( viewer &&
        viewer.sportunity &&
        viewer.sportunity.status &&
        (viewer.sportunity.status.toLowerCase() === 'invited-grey' ||
          viewer.sportunity.status.toLowerCase() === 'invited-black' ||
          viewer.sportunity.status.toLowerCase() === 'invited-yellow')
      ) ||
      ( viewer && 
        viewer.sportunity && 
        viewer.sportunity.status && 
        viewer.sportunity.status.toLowerCase().indexOf('Booked') < 0 &&
        userWasInvited
      );

    let userDeclined = 
      viewer &&
      viewer.sportunity &&
      viewer.sportunity.status &&
      viewer.sportunity.status.indexOf('Declined') >= 0;

    let shouldShowBook =
      !userIsParticipant &&
      !userIsOnWaitingList &&
      !this.state.isSecondaryOrganizer &&
      !isPotentialSecondaryOrganizer;

    let shouldShowChat =
      userIsParticipant ||
      userIsOnWaitingList ||
      this.state.isAdmin ||
      this.state.isSecondaryOrganizer;

    const shouldEnableBook = viewer && viewer.me ? true : false;

    const isCancelled =
      viewer &&
      viewer.sportunity &&
      viewer.sportunity.status.toLowerCase() === 'cancelled';

    let status =
      viewer &&
      viewer.sportunity &&
      SetStatus(
        viewer.sportunity,
        viewer.sportunity.status,
        viewer.me ? viewer.me.id : null,
      );

    if (!viewer) {
      return (
        <div>
          <Loading />
        </div>
      );
    }

    if (
      this.state.displayPrivateSportunityPopup ||
      (viewer && !viewer.sportunity)
    ) {
      return (
        <div>
          {viewer &&
            viewer.sportunity &&
            this.renderMetaTags(viewer.sportunity)}
          {this.state.loading && <Loading />}
        </div>
      );
    }

    return (
      <div>
        {this.renderMetaTags(viewer.sportunity)}
        {this.state.loading && <Loading />}
        {this.state.displayAndroidOpenApp && (
          <ConfirmationModal
            isOpen={true}
            title={localizations.android_open_appTitle}
            message={localizations.android_open_appText}
            confirmLabel={localizations.android_open_appConfirm}
            cancelLabel={localizations.android_open_appCancel}
            canCloseModal={true}
            onConfirm={this.openAndroidApp}
            onCancel={() => this.checkPrivacy(this.props)}
          />
        )}
        {this.state.displayConfirmationPopup ? (
          <ConfirmBookingPopup
            viewer={viewer}
            sportunity={viewer.sportunity}
            shouldGoToJoinWaitingList={this.state.shouldGoToJoinWaitingList}
            onConfirm={this._handleUserBook}
            onClose={this._handleHideConfirmationPopup}
            onAddACard={this._handleAddANewCard}
            onOpenProfilePopup={this._handleShowCompleteProfile}
            cardJustAdded={this.state.cardJustAdded}
            onChangeSelectedCard={this._handleChangeSelectedCard}
            selectedCard={this.state.selectedCard}
            paymentWithWallet={this.state.paymentWithWallet}
            selectedWallet={this.state.selectedWallet}
            me={viewer.me}
            router={this.props.router}
            processing={this.state.process}
          />
        ) : null}
        {viewer.me && this.state.displayCompletePersonProfilePopup && (
          <CompletePersonProfilePopup
            sportunity={viewer.sportunity}
            onConfirm={this._handleConfirmProfileUpdate}
            onClose={this._handleHideCompleteProfilePopup}
            viewer={viewer}
            me={this.state.me}
            processing={this.state.process}
          />
        )}
        {viewer.me && this.state.displayCompleteBusinessProfilePopup && (
          <CompleteBusinessProfilePopup
            sportunity={viewer.sportunity}
            onConfirm={this._handleConfirmBusinessProfileUpdate}
            onClose={this._handleHideCompleteBusinessProfilePopup}
            viewer={viewer}
            me={this.state.me}
            processing={this.state.process}
          />
        )}
        {viewer.me && this.state.displayAddACardPopup && (
          <AddACard
            price={viewer.sportunity.price}
            onConfirm={this._handleConfirmAddACard}
            onClose={this._handleHideACard}
            viewer={viewer}
            me={this.state.me}
            processing={this.state.process}
          />
        )}
        <section style={styles.pageContainer}>
          <div style={styles.sideContainer} />
          <Wrapper style={styles.wrapper}>
            {viewer.sportunity.images && viewer.sportunity.images.length > 0 && (
              <div style={{ width: '100%' }}>
                <Slider images={viewer.sportunity.images} />
              </div>
            )}
            <Header
              viewer={viewer}
              style={styles.wrapper}
              sportunity={viewer.sportunity}
              showBook={shouldShowBook}
              enableBook={shouldEnableBook}
              showJoinWaitingList={this.state.shouldGoToJoinWaitingList}
              onBook={this._handleShowConfirmationPopup}
              onCancel={this._handleUserCancel}
              onTitleUpdate={this._handleUpdateSportunityTitle}
              onLevelsUpdate={this._handleUpdateSportunityLevels}
              onAdminModify={this._handleAdminModify}
              onAdminCancel={this._handleAdminCancel}
              onAdminDelete={this._handleAdminDelete}
              onAdminReOrganize={this._handleAdminReOrganize}
              onAdminDisplayStatForm={this._handleToggleStatisticForm}
              isFillingStatForm={this.state.displayStatFilling}
              isAdmin={this.state.isAdmin}
              isSecondaryOrganizer={this.state.isSecondaryOrganizer}
              isPotentialSecondaryOrganizer={isPotentialSecondaryOrganizer}
              userIsParticipant={userIsParticipant}
              isAuthorizedAdmin={this.state.isAuthorizedAdmin}
              isPotentialOpponent={isPotentialOpponent}
              userIsInvited={userIsInvited}
              userDeclined={userDeclined}
              onSeeAsAdmin={this._handleSeeAsAdmin}
              onOpponentBook={this._handleConfirmOpponentCreation}
              onDeclineInvitation={this._handleDeclineInvitation}
              onSecondaryOrganizerCancel={this._handleSecondaryOrganizerCancel}
              onSecondaryOrganizerSelectRole={this._handleSecondaryOrganizerSelectRole}
              onSecondaryOrganizerRefuseRole={this._handleSecondaryOrganizerRefuseRole}
              isPast={this.state.isPast}
              isActive={this.state.isActive}
              isCancelled={isCancelled}
              isLogin={viewer.me !== null}
              isLoading={this.state.isLoading}
              user={viewer.me}
              pathname={this.props.location.pathname}
              title={viewer.sportunity.title}
              description={viewer.sportunity.description}
              location={this.props.location}
              isSurvey={
                viewer.sportunity.survey &&
                viewer.sportunity.survey.surveyDates &&
                viewer.sportunity.survey.surveyDates.length > 1
              }
              {...this.state}
            />
            {this.state.displayStatFilling && this.state.isAdmin ? (
              <StatsFilling
                onLeave={this._handleToggleStatisticForm}
                viewer={viewer}
                sportunityID={
                  this.props.viewer.sportunity &&
                  this.props.viewer.sportunity.id
                }
                language={this.state.language}
                isPast={this.state.isPast}
                sportunity={this.props.viewer.sportunity}
              />
            ) : (
              <div style={styles.container}>
                <Content
                  onRef={a => (this.content = a)}
                  sportunity={this.props.viewer.sportunity}
                  chat={this.props.viewer.chat}
                  status={status}
                  showBook={shouldShowBook}
                  enableBook={shouldEnableBook}
                  showJoinWaitingList={this.state.shouldGoToJoinWaitingList}
                  onBook={this._handleShowConfirmationPopup}
                  onCancel={this._handleUserCancel}
                  onDeclineInvitation={this._handleDeclineInvitation}
                  onAdminModify={this._handleAdminModify}
                  onAdminCancel={this._handleAdminCancel}
                  onAdminReOrganize={this._handleAdminReOrganize}
                  onAdminDisplayStatForm={this._handleToggleStatisticForm}
                  userIsParticipant={userIsParticipant}
                  userIsOnWaitingList={userIsOnWaitingList}
                  isPotentialOpponent={isPotentialOpponent}
                  isPotentialSecondaryOrganizer={isPotentialSecondaryOrganizer}
                  viewer={viewer}
                  me={viewer.me}
                  user={viewer.me}
                  isAdmin={this.state.isAdmin}
                  isSecondaryOrganizer={this.state.isSecondaryOrganizer}
                  isAuthorizedAdmin={this.state.isAuthorizedAdmin}
                  onSeeAsAdmin={this._handleSeeAsAdmin}
                  onOpponentBook={this._handleConfirmOpponentCreation}
                  onSecondaryOrganizerSelectRole={this._handleSecondaryOrganizerSelectRole}
                  onSecondaryOrganizerRefuseRole={this._handleSecondaryOrganizerRefuseRole}
                  onSecondaryOrganizerCancel={this._handleSecondaryOrganizerCancel}
                  isPast={this.state.isPast}
                  isActive={this.state.isActive}
                  isCancelled={isCancelled}
                  userIsInvited={userIsInvited}
                  isLogin={viewer.me !== null}
                  shouldShowChat={shouldShowChat}
                  organizers={this.props.viewer.sportunity.organizers}
                  isLoading={this.state.isLoading}
                  invited_circles={this.props.viewer.sportunity.invited_circles}
                  actionParticipant={this._handleShowConfirmationParticipantPopup}
                  onConfirm={this._confirmationUser}
                  userWasInvited={userWasInvited}
                  handleOrganizerAddParticipants={this._handleOrganizerAddParticipants}
                  handleOrganizerAddInviteds={this._handleOrganizerAddInviteds}
                  handleOrganizerAddInvitedCircles={this._handleOrganizerAddInvitedCircles}
                  handleOrganizerRemoveInvitedCircle={this._handleOrganizerRemoveInvitedCircleConfirm}
                  handleOrganizerAddInvitedCirclesWithPrice={this._handleOrganizerAddInvitedCirclesWithPrice}
                  onDescriptionUpdate={this._handleUpdateSportunityDescription}
                  refetchAfterSubscribeOrUnsubscribe={this.refetchAfterSubscribeOrUnsubscribe}
                  {...this.state}
                />
                <Sidebar
                  viewer={this.props.viewer}
                  user={this.props.viewer.me}
                  status={status ? status.status : null}
                  price={this.props.viewer.sportunity.price.cents}
                  sportunity={this.props.viewer.sportunity}
                  invited_circles={this.props.viewer.sportunity.invited_circles}
                  actionParticipant={this._handleShowConfirmationParticipantPopup}
                  onConfirm={this._confirmationUser}
                  isAdmin={this.state.isAdmin}
                  isSecondaryOrganizer={this.state.isSecondaryOrganizer}
                  isPotentialOpponent={isPotentialOpponent}
                  userIsInvited={userIsInvited}
                  userWasInvited={userWasInvited}
                  userIsParticipant={userIsParticipant}
                  userIsOnWaitingList={userIsOnWaitingList}
                  isActive={this.state.isActive}
                  handleOrganizerAddParticipants={this._handleOrganizerAddParticipants}
                  handleOrganizerAddInviteds={this._handleOrganizerAddInviteds}
                  handleOrganizerAddInvitedCircles={this._handleOrganizerAddInvitedCircles}
                  content={this.content}
                  {...this.state}
                />
              </div>
            )}
          </Wrapper>
          <div style={styles.sideContainer}>
            <Sharing
              sharedUrl={appUrl + this.props.match.location.pathname}
              title={'Sportunity: ' + viewer.sportunity.title}
              description={viewer.sportunity.description}
              {...this.state}
            />
          </div>
        </section>
      </div>
    );
  }
}

styles = {
  pageContainer: {
    display: 'flex',
    width: '100%',
    flexDirection: 'row',
  },
  sideContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '25px',
    padding: 10,
    flex: 1,
    '@media (max-width: 700px)': {
      paddingLeft: 0,
      paddingRight: 0,
    },
    '@media (max-width: 615px)': {
      position: 'absolute',
    },
  },
  container: {
    display: 'flex',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.4)',
    '@media (max-width: 600px)': {
      display: 'block',
    },
  },
  wrapper: {
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.4)',
  },
  select: {
    marginTop: 15,
    fontSize: 16,
    minWidth: '50%',
    height: 28,
  },
};

const _loggedFromPage = value => ({
  type: types.LOGGED_IN_FROM_PAGE,
  value,
});

const _updateStepsCompleted = steps => ({
  type: types.UPDATE_STEPS_COMPLETED,
  tutorialSteps: steps,
});

const dispatchToProps = dispatch => ({
  _loggedFromPage: bindActionCreators(_loggedFromPage, dispatch),
  _updateStepsCompleted: bindActionCreators(_updateStepsCompleted, dispatch),
});

const stateToProps = state => ({
  tutorialSteps: state.profileReducer.tutorialSteps,
});

let ReduxContainer = connect(
  stateToProps,
  dispatchToProps,
)(Radium(EventView));

const EventViewTemp = createRefetchContainer(
  Radium(withAlert(ReduxContainer)),
  {
    viewer: graphql`
      fragment EventView_viewer on Viewer
        @argumentDefinitions(
          sportunityId: { type: "ID", defaultValue: null }
          chatSportunityId: { type: "String", defaultValue: null }
          isCoOrganizerOnSerieSportunityId: {
            type: "String!"
            defaultValue: "_"
          }
          userToken: { type: "String", defaultValue: null }
          queryAuthorizedAccounts: { type: "Boolean!", defaultValue: false }
          superToken: { type: "String", defaultValue: null }
          querySuperMe: { type: "Boolean!", defaultValue: false }
          queryIsCoOrganizerOnSerie: { type: "Boolean!", defaultValue: false }
        ) {
        id
        languages {
          id
          name
          code
        }
        IsCoOrganizerOnSerie(sportunityId: $isCoOrganizerOnSerieSportunityId)
          @include(if: $queryIsCoOrganizerOnSerie)
        authorizedAccounts(userToken: $userToken)
          @include(if: $queryAuthorizedAccounts) {
          id
          avatar
          pseudo
          accounts {
            id
            avatar
            token
            pseudo
          }
        }
        superMe(superToken: $superToken) @include(if: $querySuperMe) {
          id
          pseudo
          avatar
          subAccounts {
            id
            avatar
            pseudo
            token
          }
        }
        me {
          id
          appCountry
          paymentMethods {
            id
            cardMask
            currency
          }
          lastName
          firstName
          address {
            address
            city
            country
          }
          profileType
          isProfileComplete
          birthday
          nationality
          shouldDeclareVAT
          business {
            businessName
            businessEmail
            headquarterAddress {
              address
              city
              country
            }
            VATNumber
          }
          ...EventViewContent_user
          ...EventViewHeader_user
          ...EventViewSidebar_user
        }
        ...EventViewHeader_viewer
        ...AddACard_viewer
        ...StatsFilling_viewer
        ...EventViewSidebar_viewer
        sportunity(id: $sportunityId) {
          id
          title
          description
          kind
          images
          number_of_occurences
          is_repeated_occurence_number
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
          participantRange {
            from
            to
          }
          participants {
            id
            avatar
            pseudo
            firstName
            lastName
            circlesUserIsIn(last: 100) {
              edges {
                node {
                  name
                }
              }
            }
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
          price_for_circle {
            circle {
              id
              members {
                id
              }
            }
            price {
              cents
              currency
            }
            participantByDefault
            excludedParticipantByDefault {
              excludedMembers {
                id
                pseudo
              }
            }
          }
          invited_circles(last: 10) {
            edges {
              node {
                ...MyCirclesCircleItem_circle
                id
                name
                mode
                type
                members {
                  id
                  pseudo
                  avatar
                }
                owner {
                  id
                  pseudo
                  avatar
                }
                askedInformation {
                  id
                  name
                }
                membersInformation {
                  information
                  user {
                    id
                  }
                  value
                  document {
                    id,
                    name
                  }
                  validationStatus
                  comment
                }
              }
            }
          }
          hide_participant_list
          invited {
            user {
              id
              pseudo
              avatar
              firstName
              lastName
              circlesUserIsIn(last: 100) {
                edges {
                  node {
                    name
                  }
                }
              }
            }
            answer
          }
          waiting {
            id
            pseudo
            avatar
          }
          canceling {
            status
            canceling_user {
              id
              pseudo
              avatar
              firstName
              lastName
              circlesUserIsIn(last: 100) {
                edges {
                  node {
                    name
                  }
                }
              }
            }
          }
          price {
            currency
            cents
          }
          address {
            address
            city
            position {
              lat
              lng
            }
          }
          organizers {
            organizer {
              id
              pseudo
              avatar
              feedbacks {
                feedbacksList(last: 100) {
                  edges {
                    node {
                      author {
                        id
                      }
                    }
                  }
                }
              }
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
            price {
              cents
              currency
            }
            permissions {
              chatAccess {
                view
                edit
              }
              memberAccess {
                view
                edit
              }
              carPoolingAccess {
                view
                edit
              }
              imageAccess {
                view
                edit
              }
              detailsAccess {
                view
                edit
              }
              compositionAccess {
                view
                edit
              }
            }
          }
          pendingOrganizers {
            id
            circles(last: 20) {
              edges {
                node {
                  id
                  members {
                    id
                  }
                  name
                  memberCount
                }
              }
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
            price {
              cents
              currency
            }
          }
          status
          cancel_date
          sport {
            sport {
              id
              logo
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
          game_information {
            opponent {
              organizer {
                id
                pseudo
                avatar
              }
              organizerPseudo
              lookingForAnOpponent
              unknownOpponent
              invitedOpponents(last: 5) {
                edges {
                  node {
                    id
                    name
                    memberCount
                    members {
                      id
                    }
                  }
                }
              }
            }
          }
          ...EventViewHeader_sportunity
          ...EventViewContent_sportunity
          ...EventViewSidebar_sportunity
          ...ConfirmBookingPopup_sportunity
          ...StatsFilling_sportunity
        }
        chat(sportunityId: $chatSportunityId) {
          ...EventViewContent_chat
        }
        ...ConfirmBookingPopup_viewer
        ...EventViewContent_viewer
      }
    `,
  },
  graphql`
    query EventViewRefetchQuery(
      $sportunityId: ID
      $chatSportunityId: String
      $isCoOrganizerOnSerieSportunityId: String!
      $userToken: String
      $queryAuthorizedAccounts: Boolean!
      $superToken: String
      $querySuperMe: Boolean!
      $queryIsCoOrganizerOnSerie: Boolean!
    ) {
      viewer {
        ...EventView_viewer
          @arguments(
            sportunityId: $sportunityId
            chatSportunityId: $chatSportunityId
            isCoOrganizerOnSerieSportunityId: $isCoOrganizerOnSerieSportunityId
            userToken: $userToken
            queryAuthorizedAccounts: $queryAuthorizedAccounts
            superToken: $superToken
            querySuperMe: $querySuperMe
            queryIsCoOrganizerOnSerie: $queryIsCoOrganizerOnSerie
          )
      }
    }
  `,
);


export default class extends Component {
  render() {
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query EventViewQuery (
            $sportunityId: ID
          ) {
            viewer {
              ...EventView_viewer 
            }
          }
        `}
        variables={{
          sportunityId: this.props.params.sportunityId,
        }}
        render={({error, props}) => {
            return (
              <EventViewTemp 
                viewer={!!props && props.viewer} 
                query={props} 
                {...this.props} 
              />
            );
        }}
      />
    )
  }
}