import React, { Component } from 'react';
import PureComponent, { pure } from '../common/PureComponent';
import PropTypes from 'prop-types';
import Radium from 'radium';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import moment from 'moment';
import { createRefetchContainer, graphql, QueryRenderer } from 'react-relay';
import { Link } from 'found';
import ToggleDisplay from 'react-toggle-display';
import { withAlert } from 'react-alert';
import ReactTooltip from 'react-tooltip';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';

import mangoPay from 'mangopay-cardregistration-js-kit';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';

import AppHeader from '../common/Header/Header.js';
import Loading from '../common/Loading/Loading.js';
import environment from 'sportunity/src/createRelayEnvironment';

import Input from './Input';
import Select from './Select';
import Switch from '../common/Switch';

import Price from './Price';
import Participants from './Participants';
import SportLevels from './SportLevels';
import Address from './Address';
import Invited from './Invited';
import Organizers from './Organizers';
import Schedule from './Schedule';
import Details from './Details';
import VenueSlots from './VenueSlots';
import Privacy from './Privacy';
import NotificationToInvitees from './NotificationToInvitees';
import VenueOrAddress from './VenueOrAddress';
import Opponent from './Opponent';

import ConfirmCreationPopup from './ConfirmCreationPopup';
import AddBankAccountPopup from './AddBankAccountPopup';
import AddACardPopup from './AddACardPopup';
import CompleteBusinessProfilePopup from '../EventView/CompleteBusinessProfilePopup';
import CompletePersonProfilePopup from '../EventView/CompletePersonProfilePopup';

import NewSportunityMutation from './NewSportunityMutation';
import UpdateSportunityMutation from './UpdateSportunityMutation';
import NewSportunityTemplateMutation from './NewSportunityTemplateMutation';
import UpdateSportunityTemplateMutation from './UpdateSportunityTemplateMutation';
import RemoveSportunityTemplateMutation from './RemoveSportunityTemplateMutation';
import AddBankAccountMutation from '../MyInfo/AddBankAccountMutation';
import RegisterCardDataMutation from '../EventView/RegisterCardDataMutation';
import UpdateUserProfileMutation from '../EventView/UpdateUserProfileMutation';
import CircleMutation from '../Circle/UpdateCircleMutation';

import { confirmModal } from '../common/ConfirmationModal';
import { colors } from '../../theme';
import Footer from '../common/Footer/Footer';
import localizations from '../Localizations';

import { mangoPayUrl, mangoPayClientId } from '../../../constants.json';

import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import CircleList from './CircleList';
import ParticipantList from './ParticipantList';
import SearchModal from '../common/SearchModal';
import GroupList from './GroupList';
import PersonList from './PersonList';
import DetailsList from './DetailsList';

import PrivatePrice from './PrivatePrice';
import SportSelect from '../common/Inputs/SportSelect';
import SelectTemplate from './SelectTemplate';
import * as types from '../../actions/actionTypes';
import { AdministratorPermissions } from './AdministratorPermissions';

mangoPay.cardRegistration.baseURL = mangoPayUrl;
mangoPay.cardRegistration.clientId = mangoPayClientId;

let styles;

const isEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const Subtitle = pure(({ children, withoutMargin }) => (
  <h2 style={withoutMargin ? styles.subtitleWithoutMargin : styles.subtitle}>
    {children}
  </h2>
));
const Column = pure(
  Radium(({ children }) => <div style={styles.column}>{children}</div>),
);

let nextScheduleId = 1;

let initialState = {
  fields: {
    title: '',
    description: '',
    participantRange: {
      from: 0,
      to: 0,
    },
    price: {
      cents: 0,
      currency: 'CHF',
    },
    venue: {
      id: '',
      name: '',
      price: {
        cents: 0,
        currency: 'CHF',
      },
      address: {
        address: '',
      },
    },
    infrastructure: {
      id: '',
      name: '',
    },
    slot: {
      id: '',
      from: '',
      end: '',
      price: {
        cents: 0,
        currency: 'CHF',
      },
    },
    schedules: [],
    isSurveyTransformed: false,
    beginningDate: '',
    endingDate: '',
    repeat: 0,
    scheduleId: 0,
    sport: null,
    levelFrom: null,
    levelTo: null,
    positions: [],
    certificates: [],
    organizers: [],
    circlesOfPendingOrganizers: [],
    private: true,
    autoSwitchPrivacy: false,
    autoSwitchPrivacyXDaysBefore: 15,
    invited: null,
    invited_circles: null,
    invited_circles_and_prices: [],
    notificationType: 'Now',
    notificationAutoXDaysBefore: 15,
    hideParticipantList: false,
    sportunityType: null,
    opponent: null,
    isOpenMatch: false,
    unknownOpponent: false,
    circleOfOpponents: null,

    address: {
      address: '',
      city: '',
      country: '',
    },
    organizerParticipates: false,
    organizerParticipation: 0,

    ageRestriction: {
      from: 0,
      to: 100,
    },
    sexRestriction: 'NONE',
  },

  saveEventsType: false,
  allSportsLoaded: false,
  sportSearch: '',

  confirmPopupOpen: false,
  addBankAccountOpen: false,
  addCardPopupOpen: false,
  displayCompletePersonProfilePopup: false,
  displayCompleteBusinessProfilePopup: false,
  bankAcccountJustAdded: '',
  submitClicked: false,
  cardJustAdded: false,
  selectedCard: '',
  selectedCardToPaySecondaryOrganizers: '',
  paySecondaryOrganizersWithWallet: false,
  loading: false,
  process: false,
  language: localizations.getLanguage(),
  errors: [],
  isModifying: false,
  isSurvey: false,
  isReorganizing: false,
  isModifyingASerie: false,
  isParticipant: false,
  selectedTemplate: null,
  fromTemplate: false,
  saveTemplate: true,
  finished: false,
  selectedTab: 1,
  circleList: [],
  position: null,
};

class NewSportunity extends Component {
  static contextTypes = {
    relay: PropTypes.shape({
      variables: PropTypes.object,
    }),
  };

  constructor(props) {
    super(props);
    this.alertOptions = {
      offset: 60,
      position: 'top right',
      theme: 'light',
      transition: 'fade',
    };
    this.state = initialState;

    this.handleChangeTabButtonPress = this.handleChangeTabButtonPress.bind(
      this,
    );
  }

  _setLanguage = language => {
    this.setState({ language: language });
  };

  _validate(step = 0) {
    const { fields } = this.state;
    const errors = [];

    if (!fields.title && step === 0) {
      errors.push({
        element: 'Name',
        message: localizations.newSportunity_noTitleProvided,
      });
    }

    if (!fields.description && step === 0) {
      errors.push({
        element: 'Description',
        message: localizations.newSportunity_noDescriptionProvided,
      });
    }

    if (!fields.sport && step === 1) {
      errors.push({
        element: 'Sport',
        message: localizations.newSportunity_noSportProvided,
      });
    }

    if (!fields.address.address && step === 2) {
      errors.push({
        element: 'Address',
        message: localizations.newSportunity_noAddressProvided,
      });
    }

    if ((!fields.beginningDate || !fields.endingDate) && step === 3) {
      errors.push({
        element: 'Date',
        message: localizations.newSportunity_noDateProvided,
      });
    }

    if (
      fields.beginningDate &&
      fields.endingDate &&
      fields.endingDate < fields.beginningDate &&
      step === 3
    ) {
      errors.push({
        element: 'Date',
        message: localizations.newSportunity_invalidHourRange,
      });
    }

    if (!fields.price && step === 5) {
      errors.push({
        element: 'Price',
        message: localizations.newSportunity_noPriceProvided,
      });
    }

    if (
      (!fields.participantRange.from || !fields.participantRange.to) &&
      step === 4
    ) {
      errors.push({
        element: 'ParticipantRange',
        message: localizations.newSportunity_noNumberOfParticipantsProvided,
      });
    } else if (
      fields.participantRange.from > fields.participantRange.to &&
      step === 4
    ) {
      errors.push({
        element: 'ParticipantRange',
        message: localizations.newSportunity_invalidNumberOfParticipants,
      });
    }

    if (
      fields.private &&
      fields.autoSwitchPrivacy &&
      new Date(
        new Date(fields.beginningDate) -
          fields.autoSwitchPrivacyXDaysBefore * 24 * 3600 * 1000,
      ) < new Date() &&
      step === 4
    ) {
      errors.push({
        element: 'Privacy',
        message: localizations.newSportunity_autoSwitchPrivacyXDaysError,
      });
    }

    if (
      !this.state.isModifying &&
      fields.notificationType === 'Automatically' &&
      new Date(
        new Date(fields.beginningDate) -
          fields.notificationAutoXDaysBefore * 24 * 3600 * 1000,
      ) < new Date() &&
      step === 4
    ) {
      errors.push({
        element: 'NotificationToInvitees',
        message:
          localizations.newSportunity_notificationPreferenceAutomaticallyNumberOfDaysError,
      });
    }

    const sportunityTypesList = fields.sport
      ? this.state.fields.sport.sportunityTypes.map(p => ({
          name: this._translatedName(p.name),
          value: p.id,
          isScoreRelevant: p.isScoreRelevant,
        }))
      : [];

    if (
      step === 2 &&
      fields.sportunityType &&
      sportunityTypesList.findIndex(
        type =>
          type.value === fields.sportunityType.value && type.isScoreRelevant,
      ) >= 0 &&
      !fields.unknownOpponent &&
      !fields.isOpenMatch &&
      !fields.opponent &&
      !fields.circleOfOpponents
    ) {
      errors.push({
        element: 'Opponent',
        message: localizations.newSportunity_opponent_error,
      });
    }

    if (
      (fields.organizers && fields.organizers.length > 0) ||
      (fields.circlesOfPendingOrganizers &&
        fields.circlesOfPendingOrganizers.length > 0)
    ) {
      let missingOrganizerType = false;
      if (fields.organizers && fields.organizers.length > 0) {
        fields.organizers.forEach(organizer => {
          if (
            !organizer.secondaryOrganizerType &&
            !organizer.customSecondaryOrganizerType
          )
            missingOrganizerType = true;
        });
      }
      if (
        fields.circlesOfPendingOrganizers &&
        fields.circlesOfPendingOrganizers.length > 0
      ) {
        fields.circlesOfPendingOrganizers.forEach(organizer => {
          if (
            !organizer.secondaryOrganizerType &&
            !organizer.customSecondaryOrganizerType
          )
            missingOrganizerType = true;
        });
      }
      if (missingOrganizerType) {
        errors.push({
          element: 'Organizers',
          message: localizations.newSportunity_schedule_field_error,
        });
      }
    }

    return errors;
  }

  _updateCircleList = () => {
    let circlesCurrentUserIsInConst =
      this.props.viewer &&
      this.props.viewer.me &&
      this.props.viewer.me.circlesUserIsIn &&
      this.props.viewer.me.circlesUserIsIn.edges &&
      this.props.viewer.me.circlesUserIsIn.edges.length > 0
        ? this.props.viewer.me.circlesUserIsIn.edges
            .map(edge => {
              if (edge.node.isCircleUsableByMembers) return edge;
              else return false;
            })
            .filter(i => Boolean(i))
        : [];

    let circlesList =
      this.props.viewer.me &&
      this.props.viewer.me.circles &&
      this.props.viewer.me.circles.edges
        ? this.props.viewer.me.circles.edges.filter(
            edge => edge.node.type === 'TEAMS' || edge.node.type === 'CLUBS',
          )
        : [];
    let circlesCurrentUserIsIn = circlesCurrentUserIsInConst.filter(
      edge => edge.node.type === 'TEAMS' || edge.node.type === 'CLUBS',
    );
    let circlesFromClub =
      this.props.viewer.me &&
      this.props.viewer.me.circlesFromClub &&
      this.props.viewer.me.circlesFromClub.edges
        ? this.props.viewer.me.circlesFromClub.edges.filter(
            edge => edge.node.type === 'TEAMS' || edge.node.type === 'CLUBS',
          )
        : [];

    let circleListInner = [];

    if (circlesList && circlesList.length > 0)
      circlesList.forEach(edge => circleListInner.push(edge.node));

    if (circlesFromClub && circlesFromClub.length > 0)
      circlesFromClub.forEach(edge => circleListInner.push(edge.node));

    if (circlesCurrentUserIsIn && circlesCurrentUserIsIn.length > 0)
      circlesCurrentUserIsIn.forEach(edge => circleListInner.push(edge.node));

    // this.setState({circleList: circleListInner});
  };

  _handleSubmit = event => {
    event.preventDefault();
    if (
      this.state.confirmPopupOpen ||
      this.state.addBankAccountOpen ||
      this.state.addCardPopupOpen ||
      this.state.displayCompletePersonProfilePopup ||
      this.state.displayCompleteBusinessProfilePopup
    )
      return;

    this.setState({
      submitClicked: true,
    });

    const errors = this.state.errors;
    if (errors.length > 0) {
      this.setState({
        errors: errors.map(error => error.element),
      });
      this.props.alert.show(errors[0].message, {
        timeout: 3000,
        type: 'info',
      });
    } else {
      if (
        !this.state.isModifying &&
        !this.state.fields.private &&
        (this.state.fields.invited_circles_and_prices.length === 0 ||
          this.state.fields.invited_circles_and_prices.findIndex(
            item => item.circle.memberCount > 0,
          ) < 0) &&
        (!this.state.fields.invited || this.state.fields.invited.length === 0)
      ) {
        confirmModal({
          title: localizations.newSportunityAlertNoCommunityTitle,
          message: localizations.newSportunityAlertNoCommunityText,
          confirmLabel: localizations.newSportunityAlertNoCommunityYes,
          cancelLabel: localizations.newSportunityAlertNoCommunityNo,
          canCloseModal: true,
          onConfirm: () => {
            this.setState({
              selectedCard:
                this.props.viewer.me.paymentMethods.length > 0
                  ? this.props.viewer.me.paymentMethods[
                      this.props.viewer.me.paymentMethods.length - 1
                    ]
                  : '',
              selectedCardToPaySecondaryOrganizers:
                this.props.viewer.me.paymentMethods.length > 0
                  ? this.props.viewer.me.paymentMethods[
                      this.props.viewer.me.paymentMethods.length - 1
                    ]
                  : '',
              confirmPopupOpen: true,
            });
          },
          onCancel: () => {},
        });
      } else {
        this.setState({
          selectedCard:
            this.props.viewer.me.paymentMethods.length > 0
              ? this.props.viewer.me.paymentMethods[
                  this.props.viewer.me.paymentMethods.length - 1
                ]
              : '',
          selectedCardToPaySecondaryOrganizers:
            this.props.viewer.me.paymentMethods.length > 0
              ? this.props.viewer.me.paymentMethods[
                  this.props.viewer.me.paymentMethods.length - 1
                ]
              : '',
          confirmPopupOpen: true,
        });
      }
    }
  };

  _confirmCreation = () => {
    if (this.state.process) return;

    if (!this.props.viewer.me) {
      this.props.alert.show(localizations.newSportunity_login_needed, {
        timeout: 2000,
        type: 'info',
      });
      return ;
    }

    this.setState({
      process: true,
    });

    let levelsList = this.state.fields.sport
      ? cloneDeep(this.state.fields.sport.levels)
          .sort((a, b) => {
            return a.EN.skillLevel - b.EN.skillLevel;
          })
          .map(l => ({ name: this._translatedLevelName(l), value: l.id }))
      : [];

    let allLevelSelected = true;
    let levels = null;

    if (this.state.fields.levelFrom && this.state.fields.levelTo) {
      let fromIndex = levelsList.findIndex(
        e => e.value == this.state.fields.levelFrom.value,
      );
      let toIndex = levelsList.findIndex(
        e => e.value == this.state.fields.levelTo.value,
      );

      levels = levelsList.map((level, index) => {
        if (fromIndex >= 0 && index < fromIndex) return false;
        if (toIndex >= 0 && index > toIndex) return false;
        return level.value;
      });
      levels = levels.filter(i => Boolean(i));
      if (levels.length > 0 && levels.length < levelsList.length)
        allLevelSelected = false;
    }

    if (allLevelSelected) {
      levels = levelsList.map(level => level.value);
    }

    let certificates =
      this.state.fields.certificates !== null
        ? this.state.fields.certificates.map(certificate => certificate.value)
        : null;

    let positions =
      this.state.fields.positions !== null
        ? this.state.fields.positions.map(position => position.value)
        : null;

    let price_for_circle = [];
    price_for_circle = this.state.fields.invited_circles_and_prices.map(
      item => {
        return {
          circle: item.circle.id,
          price: {
            cents: item.price.cents * 100,
            currency: item.price.currency,
          },
          participantByDefault: item.participantByDefault,
          excludedParticipantByDefault:
            item.participantByDefault && item.excludedParticipantByDefault
              ? {
                  excludedMembers: item.excludedParticipantByDefault.excludedMembers.map(
                    user => user.id,
                  ),
                }
              : null,
        };
      },
    );

    let totalCost = 0;
    let organizers = [];
    if (
      this.state.fields.organizers &&
      this.state.fields.organizers.length > 0
    ) {
      this.state.fields.organizers.forEach(organizer => {
        organizers.push({
          organizer: organizer.organizer.id,
          isAdmin: Boolean(organizer.isAdmin),
          role: 'COACH',
          price: {
            cents: organizer.price.cents * 100,
            currency: organizer.price.currency,
          },
          secondaryOrganizerType: organizer.secondaryOrganizerType
            ? organizer.secondaryOrganizerType.id
            : null,
          customSecondaryOrganizerType: organizer.customSecondaryOrganizerType,
          permissions: organizer.permissions,
        });
        totalCost = totalCost + organizer.price.cents;
      });
    }
    // in case of editing an event, copy the isAdmin from props;;
    let isAdminFromProp = false;
    if (
      this.props &&
      this.props.viewer &&
      this.props.viewer.sportunity &&
      this.props.viewer.sportunity.organizers &&
      this.props.viewer.sportunity.organizers.length
    ) {
      isAdminFromProp = this.props.viewer.sportunity.organizers.find(
        i => i.isAdmin,
      );
    }
    if (
      isAdminFromProp &&
      isAdminFromProp.organizer &&
      isAdminFromProp.organizer.id
    ) {
      organizers.push({
        ...isAdminFromProp,
        organizer: isAdminFromProp.organizer.id,
        secondaryOrganizerType: isAdminFromProp.secondaryOrganizerType
          ? isAdminFromProp.secondaryOrganizerType.id
          : null,
      });
    } else {
      organizers.push({
        organizer: this.props.viewer.me.id,
        isAdmin: true,
        role: 'COACH',
        price:
          this.state.fields.organizerParticipates &&
          this.state.fields.organizerParticipation > 0
            ? {
                cents: -100 * this.state.fields.organizerParticipation,
                currency: this.props.userCurrency,
              }
            : {
                cents: 0,
                currency: this.props.userCurrency,
              },
      });
    }
    let pendingOrganizers = [];

    if (this.state.fields.circlesOfPendingOrganizers) {
      this.state.fields.circlesOfPendingOrganizers.forEach(item => {
        pendingOrganizers.push({
          id: item.id ? item.id : null,
          circles: item.circles.map(circle => circle.id),
          isAdmin: false,
          role: 'COACH',
          price: {
            cents: item.price.cents * 100,
            currency: item.price.currency,
          },
          secondaryOrganizerType: item.secondaryOrganizerType,
          customSecondaryOrganizerType: item.customSecondaryOrganizerType,
          permissions: item.permissions,
        });
        totalCost = totalCost + item.price.cents;
      });
    }

    if (this.state.isModifying) {
      UpdateSportunityMutation.commit(
        {
          sportunity: {
            id: this.props.routeParams.sportunityId,
            title: this.state.fields.title,
            description: this.state.fields.description,
            participantRange: this.state.fields.participantRange,
            price: {
              cents: this.state.fields.price.cents * 100,
              currency: this.state.fields.price.currency,
            },
            mode: 'RANDOM',
            kind: this.state.fields.private ? 'PRIVATE' : 'PUBLIC',
            privacy_switch_preference: this.state.fields.private
              ? {
                  privacy_switch_type: this.state.fields.autoSwitchPrivacy
                    ? 'Automatically'
                    : 'Manually',
                  switch_privacy_x_days_before: this.state.fields
                    .autoSwitchPrivacyXDaysBefore,
                }
              : null,
            beginningDate: this.state.isSurvey
              ? this.state.fields.schedules[0].beginningDate
              : this.state.fields.beginningDate,
            endingDate: this.state.isSurvey
              ? this.state.fields.schedules[
                  this.state.fields.schedules.length - 1
                ].endingDate
              : this.state.fields.endingDate,
            survey_dates: this.state.isSurvey
              ? this.state.fields.schedules.map(schedule => ({
                  beginning_date: schedule.beginningDate,
                  ending_date: schedule.endingDate,
                }))
              : null,
            repeat: this.state.fields.repeat,
            participants:
              !this.state.isParticipant &&
              this.state.fields.organizerParticipates
                ? this.props.viewer.me.id
                : null,
            paymentMethodId:
              this.state.fields.organizerParticipates &&
              this.state.fields.organizerParticipation > 0
                ? this.state.selectedCard.id
                : null,
            sport: {
              sport: this.state.fields.sport.value,
              levels,
              certificates,
              positions,
              allLevelSelected,
            },
            organizers,
            pendingOrganizers,
            secondaryOrganizersPaymentMethod:
              totalCost > 0 && !this.state.paySecondaryOrganizersWithWallet
                ? this.state.selectedCardToPaySecondaryOrganizers.id
                : null,
            secondaryOrganizersPaymentByWallet:
              totalCost > 0 && this.state.paySecondaryOrganizersWithWallet
                ? this.state.paySecondaryOrganizersWithWallet
                : false,
            invited:
              this.state.fields.invited &&
              this.state.fields.invited.map(invitedUser => {
                if (invitedUser.id)
                  return { user: invitedUser.id, answer: 'WAITING' };
                else return { pseudo: invitedUser.pseudo, answer: 'WAITING' };
              }),
            invited_circles:
              this.state.fields.invited_circles &&
              this.state.fields.invited_circles.map(circle => circle.id),
            price_for_circle: price_for_circle,
            notification_preference: {
              notification_type: this.state.fields.notificationType,
              send_notification_x_days_before: this.state.fields
                .notificationAutoXDaysBefore,
            },

            address: this.state.fields.address,
            venue:
              this.state.fields.venue && this.state.fields.venue.id
                ? this.state.fields.venue.id
                : null,
            infrastructure:
              this.state.fields.infrastructure &&
              this.state.fields.infrastructure.id
                ? this.state.fields.infrastructure.id
                : null,
            slot:
              this.state.fields.slot && this.state.fields.slot.id
                ? this.state.fields.slot.id
                : null,
            sexRestriction: this.state.fields.sexRestriction,
            ageRestriction: this.state.fields.ageRestriction,
            hide_participant_list: this.state.fields.hideParticipantList,
            sportunityType: this.state.fields.sportunityType
              ? this.state.fields.sportunityType.value
              : null,
            game_information: {
              opponent: {
                organizer:
                  this.state.fields.opponent && this.state.fields.opponent.id
                    ? this.state.fields.opponent.id
                    : null,
                organizerEmail:
                  this.state.fields.opponent &&
                  this.state.fields.opponent.email &&
                  isEmail.test(this.state.fields.opponent.email) &&
                  !this.state.fields.opponent.id
                    ? this.state.fields.opponent.email
                    : null,
                organizerPseudo:
                  this.state.fields.opponent &&
                  this.state.fields.opponent.pseudo &&
                  !isEmail.test(this.state.fields.opponent.pseudo) &&
                  !this.state.fields.opponent.id
                    ? this.state.fields.opponent.pseudo
                    : null,
                lookingForAnOpponent: this.state.fields.isOpenMatch,
                unknownOpponent: this.state.fields.unknownOpponent,
                invitedOpponents: this.state.fields.circleOfOpponents
                  ? [this.state.fields.circleOfOpponents.id]
                  : null,
              },
            },
          },
          modifyRepeatedSportunities: this.state.isModifyingASerie,
          notify_people: this.state.notifyPeople,
          viewer: this.props.viewer,
        },
        {
          onSuccess: () => {
            this.props.alert.show(
              this.state.isModifyingASerie
                ? localizations.popup_newSportunity_update_serie_success
                : localizations.popup_newSportunity_update_success,
              {
                timeout: 3500,
                type: 'success',
              },
            );
            // this.setState({
            //   process: false,
            // });
            if (this.state.saveTemplate && !this.state.isModifying) {
              this._confirmCreationTemplate();
            }
            setTimeout(() => {
              let path = '/event-view/' + this.props.routeParams.sportunityId;
              this.props.router.push({
                pathname: path,
              });
            }, 2000);
          },
          onFailure: error => {
            this.setState({
              process: false,
            });
            console.log(error.getError());
          },
        },
      );
    } else {
      let viewer = this.props.viewer;
      let sportunity = {
        title: this.state.fields.title,
        description: this.state.fields.description,
        participantRange: this.state.fields.participantRange,
        price: {
          cents: this.state.fields.price.cents * 100,
          currency: this.state.fields.price.currency,
        },
        mode: 'RANDOM',
        kind: this.state.fields.private ? 'PRIVATE' : 'PUBLIC',
        privacy_switch_preference: this.state.fields.private
          ? {
              privacy_switch_type: this.state.fields.autoSwitchPrivacy
                ? 'Automatically'
                : 'Manually',
              switch_privacy_x_days_before: this.state.fields
                .autoSwitchPrivacyXDaysBefore,
            }
          : null,
        beginningDate: !this.state.isSurvey
          ? this.state.fields.beginningDate.toISOString()
          : this.state.fields.schedules[0].beginningDate,
        endingDate: !this.state.isSurvey
          ? this.state.fields.endingDate.toISOString()
          : this.state.fields.schedules[this.state.fields.schedules.length - 1]
              .endingDate,
        survey_dates: this.state.isSurvey
          ? this.state.fields.schedules.map(schedule => ({
              beginning_date: schedule.beginningDate,
              ending_date: schedule.endingDate,
            }))
          : null,
        repeat: this.state.fields.repeat,
        participants: this.state.fields.organizerParticipates
          ? this.props.viewer.me.id
          : null,
        paymentMethodId:
          this.state.fields.organizerParticipates &&
          this.state.fields.organizerParticipation > 0
            ? this.state.selectedCard.id
            : null,
        sport: {
          sport: this.state.fields.sport.value,
          levels,
          certificates,
          positions,
          allLevelSelected,
        },
        organizers,
        pendingOrganizers,
        secondaryOrganizersPaymentMethod:
          totalCost > 0 && !this.state.paySecondaryOrganizersWithWallet
            ? this.state.selectedCardToPaySecondaryOrganizers.id
            : null,
        secondaryOrganizersPaymentByWallet:
          totalCost > 0 && this.state.paySecondaryOrganizersWithWallet
            ? this.state.paySecondaryOrganizersWithWallet
            : false,
        invited:
          this.state.fields.invited &&
          this.state.fields.invited.map(invitedUser => {
            if (invitedUser.id)
              return { user: invitedUser.id, answer: 'WAITING' };
            else return { pseudo: invitedUser.pseudo, answer: 'WAITING' };
          }),
        invited_circles:
          this.state.fields.invited_circles &&
          this.state.fields.invited_circles.map(circle => circle.id),
        price_for_circle: price_for_circle,
        notification_preference: {
          notification_type: this.state.fields.notificationType,
          send_notification_x_days_before: this.state.fields
            .notificationAutoXDaysBefore,
        },
        address: this.state.fields.address,
        venue:
          this.state.fields.venue && this.state.fields.venue.id
            ? this.state.fields.venue.id
            : null,
        infrastructure:
          this.state.fields.infrastructure &&
          this.state.fields.infrastructure.id
            ? this.state.fields.infrastructure.id
            : null,
        slot:
          this.state.fields.slot && this.state.fields.slot.id
            ? this.state.fields.slot.id
            : null,
        sexRestriction: this.state.fields.sexRestriction,
        ageRestriction: this.state.fields.ageRestriction,
        hide_participant_list: this.state.fields.hideParticipantList,
        sportunityType: this.state.fields.sportunityType
          ? this.state.fields.sportunityType.value
          : null,
        game_information: {
          opponent: {
            organizer:
              this.state.fields.opponent && this.state.fields.opponent.id
                ? this.state.fields.opponent.id
                : null,
            organizerEmail:
              this.state.fields.opponent &&
              this.state.fields.opponent.email &&
              isEmail.test(this.state.fields.opponent.email) &&
              !this.state.fields.opponent.id
                ? this.state.fields.opponent.email
                : null,
            organizerPseudo:
              this.state.fields.opponent &&
              this.state.fields.opponent.pseudo &&
              !isEmail.test(this.state.fields.opponent.pseudo) &&
              !this.state.fields.opponent.id
                ? this.state.fields.opponent.pseudo
                : null,
            lookingForAnOpponent: this.state.fields.isOpenMatch,
            unknownOpponent: this.state.fields.unknownOpponent,
            invitedOpponents: this.state.fields.circleOfOpponents
              ? [this.state.fields.circleOfOpponents.id]
              : null,
          },
        },
      };
      NewSportunityMutation.commit(
        {
          viewer: this.props.viewer,
          sportunity: sportunity,
          viewerID: this.props.viewer.id,
        },
        {
          onSuccess: () => {
            this.props.alert.show(
              this.state.fields.repeat && this.state.fields.repeat > 0
                ? localizations.popup_newSportunity_created_serie_success
                : localizations.popup_newSportunity_created_success,
              {
                timeout: 2000,
                type: 'success',
              },
            );
            this.state.fields.repeat &&
              this.state.fields.repeat > 0 &&
              this.props.alert.show(
                localizations.popup_newSportunity_created_serie_succes_refresh,
                {
                  timeout: 4000,
                  type: 'error',
                },
              );
            // this.setState({
            //   process: false
            // })
            if (this.state.saveTemplate && !this.state.isModifying) {
              this._confirmCreationTemplate();
            }
            setTimeout(() => {
              let path = '/my-events';
              this.props.router.push({
                pathname: path,
              });
            }, 2000);
            this._updateTutorialSteps();
          },
          onFailure: error => {
            this.setState({
              process: false,
            });
            console.log(error.getError());
          },
        },
      );
    }
  };

  _updateTutorialSteps = () => {
    const { tutorialSteps } = this.props;
    let newTutorialSteps = cloneDeep(tutorialSteps);

    newTutorialSteps['organizeStep'] = true;
    this.props._updateStepsCompleted(newTutorialSteps);
  };

  _confirmCreationTemplate = () => {
    this.setState({
      process: true,
    });

    let levelsList = this.state.fields.sport
      ? cloneDeep(this.state.fields.sport.levels)
          .sort((a, b) => {
            return a.EN.skillLevel - b.EN.skillLevel;
          })
          .map(l => ({ name: this._translatedLevelName(l), value: l.id }))
      : [];

    let allLevelSelected = true;
    let levels = null;

    if (this.state.fields.levelFrom && this.state.fields.levelTo) {
      let fromIndex = levelsList.findIndex(
        e => e.value == this.state.fields.levelFrom.value,
      );
      let toIndex = levelsList.findIndex(
        e => e.value == this.state.fields.levelTo.value,
      );

      levels = levelsList.map((level, index) => {
        if (fromIndex >= 0 && index < fromIndex) return false;
        if (toIndex >= 0 && index > toIndex) return false;
        return level.value;
      });
      levels = levels.filter(i => Boolean(i));
      if (levels.length > 0 && levels.length < levelsList.length)
        allLevelSelected = false;
    }

    if (allLevelSelected) {
      levels = levelsList.map(level => level.value);
    }

    let certificates =
      this.state.fields.certificates !== null
        ? this.state.fields.certificates.map(certificate => certificate.value)
        : null;

    let positions =
      this.state.fields.positions !== null
        ? this.state.fields.positions.map(position => position.value)
        : null;

    let price_for_circle = [];
    price_for_circle = this.state.fields.invited_circles_and_prices.map(
      item => {
        return {
          circle: item.circle.id,
          price: {
            cents: item.price.cents * 100,
            currency: item.price.currency,
          },
          participantByDefault: item.participantByDefault,
          excludedParticipantByDefault:
            item.participantByDefault &&
            item.excludedParticipantByDefault &&
            item.excludedParticipantByDefault.excludedMembers
              ? {
                  excludedMembers: item.excludedParticipantByDefault.excludedMembers.map(
                    user => user.id,
                  ),
                }
              : null,
        };
      },
    );

    let organizers = [
      {
        organizer: this.props.viewer.me.id,
        isAdmin: true,
        role: 'COACH',
        price:
          this.state.fields.organizerParticipates &&
          this.state.fields.organizerParticipation > 0
            ? {
                cents: -100 * this.state.fields.organizerParticipation,
                currency: this.props.userCurrency,
              }
            : {
                cents: 0,
                currency: this.props.userCurrency,
              },
      },
    ];
    let totalCost = 0;
    if (
      this.state.fields.organizers &&
      this.state.fields.organizers.length > 0
    ) {
      this.state.fields.organizers.forEach(organizer => {
        organizers.push({
          organizer: organizer.organizer.id,
          isAdmin: false,
          role: 'COACH',
          price: {
            cents: organizer.price.cents * 100,
            currency: organizer.price.currency,
          },
          secondaryOrganizerType: organizer.secondaryOrganizerType ? organizer.secondaryOrganizerType.id : null,
          customSecondaryOrganizerType: organizer.customSecondaryOrganizerType,
          permissions: organizer.permissions,
        });
        totalCost = totalCost + organizer.price.cents;
      });
    }
    let pendingOrganizers = [];

    if (this.state.fields.circlesOfPendingOrganizers) {
      this.state.fields.circlesOfPendingOrganizers.forEach(item => {
        pendingOrganizers.push({
          id: item.id ? item.id : null,
          circles: item.circles.map(circle => circle.id),
          isAdmin: false,
          role: 'COACH',
          price: {
            cents: item.price.cents * 100,
            currency: item.price.currency,
          },
          secondaryOrganizerType: item.secondaryOrganizerType,
          customSecondaryOrganizerType: item.customSecondaryOrganizerType,
          permissions: item.permissions,
        });
        totalCost = totalCost + item.price.cents;
      });
    }

    if (this.state.fromTemplate) {
      UpdateSportunityTemplateMutation.commit(
        {
          sportunity: {
            id: this.state.selectedTemplate.value.id,
            title: this.state.fields.title,
            description: this.state.fields.description,
            participantRange: this.state.fields.participantRange,
            price: {
              cents: this.state.fields.price.cents * 100,
              currency: this.state.fields.price.currency,
            },
            mode: 'RANDOM',
            kind: this.state.fields.private ? 'PRIVATE' : 'PUBLIC',
            privacy_switch_preference: this.state.fields.private
              ? {
                  privacy_switch_type: this.state.fields.autoSwitchPrivacy
                    ? 'Automatically'
                    : 'Manually',
                  switch_privacy_x_days_before: this.state.fields
                    .autoSwitchPrivacyXDaysBefore,
                }
              : null,
            repeat: this.state.fields.repeat,
            participants:
              !this.state.isParticipant &&
              this.state.fields.organizerParticipates
                ? this.props.viewer.me.id
                : null,
            paymentMethodId:
              this.state.fields.organizerParticipates &&
              this.state.fields.organizerParticipation > 0
                ? this.state.selectedCard.id
                : null,
            sport: {
              sport: this.state.fields.sport.value,
              levels,
              certificates,
              positions,
              allLevelSelected,
            },
            organizers,
            pendingOrganizers,
            address: this.state.fields.address,
            secondaryOrganizersPaymentMethod:
              totalCost > 0 && !this.state.paySecondaryOrganizersWithWallet
                ? this.state.selectedCardToPaySecondaryOrganizers.id
                : null,
            secondaryOrganizersPaymentByWallet:
              totalCost > 0 && this.state.paySecondaryOrganizersWithWallet
                ? this.state.paySecondaryOrganizersWithWallet
                : false,
            invited:
              this.state.fields.invited &&
              this.state.fields.invited.map(invitedUser => {
                if (invitedUser.id)
                  return { user: invitedUser.id, answer: 'WAITING' };
                else return { pseudo: invitedUser.pseudo, answer: 'WAITING' };
              }),
            invited_circles:
              this.state.fields.invited_circles &&
              this.state.fields.invited_circles.map(circle => circle.id),
            price_for_circle: price_for_circle,
            notification_preference: {
              notification_type: this.state.fields.notificationType,
              send_notification_x_days_before: this.state.fields
                .notificationAutoXDaysBefore,
            },
            sexRestriction: this.state.fields.sexRestriction,
            ageRestriction: this.state.fields.ageRestriction,
            hide_participant_list: this.state.fields.hideParticipantList,
            sportunityType: this.state.fields.sportunityType
              ? this.state.fields.sportunityType.value
              : null,
            game_information: {
              opponent: {
                organizer:
                  this.state.fields.opponent && this.state.fields.opponent.id
                    ? this.state.fields.opponent.id
                    : null,
                organizerEmail:
                  this.state.fields.opponent &&
                  this.state.fields.opponent.email &&
                  isEmail.test(this.state.fields.opponent.email) &&
                  !this.state.fields.opponent.id
                    ? this.state.fields.opponent.email
                    : null,
                organizerPseudo:
                  this.state.fields.opponent &&
                  this.state.fields.opponent.pseudo &&
                  !isEmail.test(this.state.fields.opponent.pseudo) &&
                  !this.state.fields.opponent.id
                    ? this.state.fields.opponent.pseudo
                    : null,
                lookingForAnOpponent: this.state.fields.isOpenMatch,
                unknownOpponent: this.state.fields.unknownOpponent,
                invitedOpponents: this.state.fields.circleOfOpponents
                  ? [this.state.fields.circleOfOpponents.id]
                  : null,
              },
            },
          },
          modifyRepeatedSportunities: this.state.isModifyingASerie,
          viewer: this.props.viewer,
        },
        {
          onSuccess: () => {
            this.props.alert.show(
              localizations.popup_newSportunity_update_template_success,
              {
                timeout: 3500,
                type: 'success',
              },
            );
            //this._confirmCreation()
          },
          onFailure: error => {
            this.setState({
              process: false,
            });
            console.log(error.getError());
          },
        },
      );
    } else {
      let viewer = this.props.viewer;
      let sportunity = {
        title: this.state.fields.title,
        description: this.state.fields.description,
        participantRange: this.state.fields.participantRange,
        price: {
          cents: this.state.fields.price.cents * 100,
          currency: this.state.fields.price.currency,
        },
        mode: 'RANDOM',
        kind: this.state.fields.private ? 'PRIVATE' : 'PUBLIC',
        privacy_switch_preference: this.state.fields.private
          ? {
              privacy_switch_type: this.state.fields.autoSwitchPrivacy
                ? 'Automatically'
                : 'Manually',
              switch_privacy_x_days_before: this.state.fields
                .autoSwitchPrivacyXDaysBefore,
            }
          : null,
        repeat: this.state.fields.repeat,
        participants: this.state.fields.organizerParticipates
          ? this.props.viewer.me.id
          : null,
        paymentMethodId:
          this.state.fields.organizerParticipates &&
          this.state.fields.organizerParticipation > 0
            ? this.state.selectedCard.id
            : null,
        sport: {
          sport: this.state.fields.sport.value,
          levels,
          certificates,
          positions,
          allLevelSelected,
        },
        organizers,
        pendingOrganizers,
        address: this.state.fields.address,
        secondaryOrganizersPaymentMethod:
          totalCost > 0 && !this.state.paySecondaryOrganizersWithWallet
            ? this.state.selectedCardToPaySecondaryOrganizers.id
            : null,
        secondaryOrganizersPaymentByWallet:
          totalCost > 0 && this.state.paySecondaryOrganizersWithWallet
            ? this.state.paySecondaryOrganizersWithWallet
            : false,
        invited:
          this.state.fields.invited &&
          this.state.fields.invited.map(invitedUser => {
            if (invitedUser.id)
              return { user: invitedUser.id, answer: 'WAITING' };
            else return { pseudo: invitedUser.pseudo, answer: 'WAITING' };
          }),
        invited_circles:
          this.state.fields.invited_circles &&
          this.state.fields.invited_circles.map(circle => circle.id),
        price_for_circle: price_for_circle,
        notification_preference: {
          notification_type: this.state.fields.notificationType,
          send_notification_x_days_before: this.state.fields
            .notificationAutoXDaysBefore,
        },
        sexRestriction: this.state.fields.sexRestriction,
        ageRestriction: this.state.fields.ageRestriction,
        hide_participant_list: this.state.fields.hideParticipantList,
        sportunityType: this.state.fields.sportunityType
          ? this.state.fields.sportunityType.value
          : null,
        game_information: {
          opponent: {
            organizer:
              this.state.fields.opponent && this.state.fields.opponent.id
                ? this.state.fields.opponent.id
                : null,
            organizerEmail:
              this.state.fields.opponent &&
              this.state.fields.opponent.email &&
              isEmail.test(this.state.fields.opponent.email) &&
              !this.state.fields.opponent.id
                ? this.state.fields.opponent.email
                : null,
            organizerPseudo:
              this.state.fields.opponent &&
              this.state.fields.opponent.pseudo &&
              !isEmail.test(this.state.fields.opponent.pseudo) &&
              !this.state.fields.opponent.id
                ? this.state.fields.opponent.pseudo
                : null,
            lookingForAnOpponent: this.state.fields.isOpenMatch,
            unknownOpponent: this.state.fields.unknownOpponent,
            invitedOpponents: this.state.fields.circleOfOpponents
              ? [this.state.fields.circleOfOpponents.id]
              : null,
          },
        },
      };
      NewSportunityTemplateMutation.commit(
        {
          viewer: this.props.viewer,
          sportunity: sportunity,
          viewerID: this.props.viewer.id,
        },
        {
          onSuccess: () => {
            this.props.alert.show(
              localizations.popup_newSportunity_created_template_success,
              {
                timeout: 2000,
                type: 'success',
              },
            );
            /*this.setState({
              process: false
            });*/
            //this._confirmCreation()
          },
          onFailure: error => {
            this.setState({
              process: false,
            });
            console.log(error.getError());
          },
        },
      );
    }
  };

  _updateField(name, value) {
    // if (name == "title") {
    //   setTimeout(() => {
    //     this.textInputDescription.focus();
    //   }, 10);
    // }

    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        [name]: value,
      },
      errors: [],
    }));
  }

  _updateFieldFinal(name, value) {
    return this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        [name]: value,
      },
      errors: [],
    }));
  }

  _updatePriceField(name, value) {
    return this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        [name]: value,
        organizerParticipates: false,
      },
      errors: [],
    }));
  }

  _addFieldToList(name, value) {
    let newValue = this.state.fields[name];
    let index = -1;
    if (value && newValue.length > 0) {
      index = newValue.findIndex(e => e.value == value.value);
      if (index >= 0) newValue.splice(index, 1);
    }
    if (value && index < 0) newValue.push(value);
    if (value == null) newValue = [];

    return this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        [name]: newValue,
      },
      errors: [],
    }));
  }

  _handleLoadAllSports() {
    this.props.relay.refetch(
      {
        ...this.context.relay.variables,
        sportsNb: 1000,
        filterName: { name: '', language: 'EN' },
      },
      null,
      () => this.setState({ allSportsLoaded: true }),
    );
  }

  _updateSportFilter(value) {
    this.setState({
      sportSearch: value,
    });

    let tempo = value;
    setTimeout(() => {
      if (tempo.length > 0 && tempo === this.state.sportSearch) {
        if (!this.state.allSportsLoaded && value.length >= 1) {
          this.props.relay.refetch({
            ...this.context.relay.variables,
            filterName: {
              name: value,
              language: localizations.getLanguage().toUpperCase(),
            },
            sportsNb: 5,
          });
        }
      }
      if (value.length === 0) {
        this.props.relay.refetch({
          ...this.context.relay.variables,
          filterName: {
            name: '',
            language: localizations.getLanguage().toUpperCase(),
          },
        });
      }
    }, 350);
  }

  _updateSportField(value) {
    if (value) {
      setTimeout(() => {
        this.textInputSports1.focus();
      }, 10);
    } 
    
    if (!value)
      this.props.relay.refetch({
        ...this.context.relay.variables,
        filterName: {
          name: '',
          language: localizations.getLanguage().toUpperCase(),
        },
      });

    if (value && this.state.fields.invited_circles && this.state.fields.invited_circles.length > 0) {
      let circleList = this.state.fields.invited_circles;
      circleList = circleList.sort((a, b) => {
        if (a.sport && a.sport.sport && a.sport.sport.id === value.id)
          return -1;
        else if (b.sport && b.sport.sport && b.sport.sport.id === value.id)
          return 1;
        else return 0;
      });

      this.setState(prevState => ({
        ...prevState,
        fields: {
          ...prevState.fields,
          invited_circles: circleList,
        },
      }));
      if (
        this.state.fields.invited_circles_and_prices &&
        this.state.fields.invited_circles_and_prices.length > 0
      ) {
        let circleList = this.state.fields.invited_circles_and_prices;

        circleList = circleList.sort((a, b) => {
          if (
            a.circle.sport &&
            a.circle.sport.sport &&
            a.circle.sport.sport.id === value.id
          )
            return -1;
          else if (
            b.circle.sport &&
            b.circle.sport.sport &&
            b.circle.sport.sport.id === value.id
          )
            return 1;
          else return 0;
        });

        this.setState(prevState => ({
          ...prevState,
          fields: {
            ...prevState.fields,
            invited_circles_and_prices: circleList,
          },
        }));
      }
    }

    let circleList = [];
    if (
      value &&
      ((this.props.viewer.me &&
        this.props.viewer.me.circles &&
        this.props.viewer.me.circles.edges &&
        this.props.viewer.me.circles.edges.length > 0) ||
        (this.props.viewer.me &&
          this.props.viewer.me.circlesUserIsIn &&
          this.props.viewer.me.circlesUserIsIn.edges &&
          this.props.viewer.me.circlesUserIsIn.edges.length > 0))
    ) {
      if (
        this.props.viewer.me &&
        this.props.viewer.me.circles &&
        this.props.viewer.me.circles.edges &&
        this.props.viewer.me.circles.edges.length > 0
      )
        this.props.viewer.me.circles.edges.forEach(
          edge =>
            circleList.findIndex(circle => circle.node.id === edge.node.id) <
              0 && circleList.push(edge),
        );

      if (
        this.props.viewer.me &&
        this.props.viewer.me.circlesUserIsIn &&
        this.props.viewer.me.circlesUserIsIn.edges &&
        this.props.viewer.me.circlesUserIsIn.edges.length > 0
      )
        this.props.viewer.me.circlesUserIsIn.edges.forEach(
          edge =>
            circleList.findIndex(circle => circle.node.id === edge.node.id) <
              0 && circleList.push(edge),
        );

      circleList = circleList
        .filter(
          edge => edge.node.type === 'TEAMS' || edge.node.type === 'CLUBS',
        )
        .map(edge => edge.node)
        .filter(
          circle =>
            circle.sport &&
            circle.sport.sport &&
            circle.sport.sport.id === value.id,
        );
    }

    return this.setState(prevState => ({
      ...prevState,
      errors: [],
      position: null,
      fields: {
        ...prevState.fields,
        sport: value ? value : '',
        levelFrom: null,
        levelTo: null,
        positions: [],
        certificates: [],
        venue: {
          id: '',
          name: '',
          price: {
            cents: 0,
            currency: this.props.userCurrency,
          },
          address: {
            address: '',
          },
        },
        infrastructure: {
          id: '',
          name: '',
        },
        slot: {
          id: '',
          from: '',
          end: '',
          price: {
            cents: 0,
            currency: this.props.userCurrency,
          },
        },
        sportunityType: null,
        opponent: null,
      },
      sportSearch: value ? value : '',
      circleList: circleList,
    }));
  }

  _updateSportunityTypeField(value) {
    const sportunityTypesList = this.state.fields.sport
      ? this.state.fields.sport.sportunityTypes.map(p => ({
          name: this._translatedName(p.name),
          value: p.id,
          isScoreRelevant: p.isScoreRelevant,
        }))
      : [];
    let selectedType = sportunityTypesList.find(
      item => value && item.value === value.value,
    );
    if (selectedType && selectedType.isScoreRelevant) {
      let currentMemberCount = -1;
      if (
        this.props.viewer &&
        this.props.viewer.me &&
        (this.props.viewer.me.circles || this.props.viewer.me.circlesFromClub)
      ) {
        if (
          this.props.viewer.me.circles &&
          this.props.viewer.me.circles.edges &&
          this.props.viewer.me.circles.edges.length > 0
        ) {
          this.props.viewer.me.circles.edges
            .filter(
              edge => edge.node.type === 'TEAMS' || edge.node.type === 'CLUBS',
            )
            .forEach(edge => {
              if (edge.node.memberCount > currentMemberCount) {
                currentMemberCount = edge.node.memberCount;
                this._updateCircleOpponentField(edge.node);
              }
            });
        }
        if (
          this.props.viewer.me.circlesFromClub &&
          this.props.viewer.me.circlesFromClub.edges &&
          this.props.viewer.me.circlesFromClub.edges.length > 0
        ) {
          this.props.viewer.me.circlesFromClub.edges
            .filter(
              edge => edge.node.type === 'TEAMS' || edge.node.type === 'CLUBS',
            )
            .forEach(edge => {
              if (edge.node.memberCount > currentMemberCount) {
                currentMemberCount = edge.node.memberCount;
                this._updateCircleOpponentField(edge.node);
              }
            });
        }
      }
    } else {
      this._updateCircleOpponentField(null);
    }

    return this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        sportunityType: value,
        opponent: null,
      },
    }));
  }

  _changeTemplate = (value, item) => {
    this.setState(prevState => ({
      ...prevState,
      fromTemplate: true,
      isLoadingCircles: true,
      fields: {
        ...prevState.fields,
        title: value.title,
        description: value.description,
        participantRange: {
          from: value.participantRange.from,
          to: value.participantRange.to,
        },
        price: {
          cents: value.price ? value.price.cents / 100 : 0,
          currency: value.price
            ? value.price.currency
            : this.props.userCurrency,
        },
        organizers: value.organizers
          .map(organizer => {
            if (organizer.isAdmin) return false;
            else
              return {
                organizer: organizer.organizer,
                price: {
                  cents: value.price ? organizer.price.cents / 100 : 0,
                  currency: value.price
                    ? organizer.price.currency
                    : this.props.userCurrency,
                },
                secondaryOrganizerType: organizer.secondaryOrganizerType
                  ? organizer.secondaryOrganizerType
                  : null,
                customSecondaryOrganizerType:
                  organizer.customSecondaryOrganizerType,
                permissions: organizer.permissions,
              };
          })
          .filter(i => Boolean(i)),
        circlesOfPendingOrganizers:
          value.pendingOrganizers && value.pendingOrganizers.length > 0
            ? value.pendingOrganizers.map(org => ({
                id: org.id,
                circles: org.circles.edges.map(edge => edge.node),
                price: {
                  cents: org.price.cents / 100,
                  currency: org.price.currency,
                },
                secondaryOrganizerType: org.secondaryOrganizerType
                  ? org.secondaryOrganizerType
                  : null,
                customSecondaryOrganizerType: org.customSecondaryOrganizerType,
                permissions: org.permissions,
              }))
            : [],
        private: value.kind === 'PRIVATE',
        autoSwitchPrivacy:
          value.privacy_switch_preference &&
          value.privacy_switch_preference.privacy_switch_type ===
            'Automatically',
        autoSwitchPrivacyXDaysBefore:
          value.privacy_switch_preference &&
          value.privacy_switch_preference.privacy_switch_type ===
            'Automatically'
            ? value.privacy_switch_preference.switch_privacy_x_days_before
            : 15,
        sport: {
          bold: {
            from: 0,
            to: 0,
          },
          name:
            value.sport.sport.name[localizations.getLanguage().toUpperCase()],
          logo: value.sport.sport.logo,
          value: value.sport.sport.id,
          id: value.sport.sport.id,
          levels: value.sport.sport.levels,
          certificates: value.sport.sport.certificates,
          positions: value.sport.sport.positions,
          sportunityTypes: value.sport.sport.sportunityTypes,
        },
        levelFrom:
          value.sport.levels.length > 0
            ? {
                name:
                  value.sport.levels[0][
                    localizations.getLanguage().toUpperCase()
                  ].name,
                value: value.sport.levels[0].id,
              }
            : null,
        levelTo:
          value.sport.levels.length > 0
            ? {
                name:
                  value.sport.levels[value.sport.levels.length - 1][
                    localizations.getLanguage().toUpperCase()
                  ].name,
                value: value.sport.levels[value.sport.levels.length - 1].id,
              }
            : null,
        positions: value.sport.positions
          ? value.sport.positions.map(position => {
              return {
                name: position[localizations.getLanguage().toUpperCase()],
                value: position.id,
              };
            })
          : [],
        certificates: value.sport.certificates
          ? value.sport.certificates.map(certificate => {
              return {
                name:
                  certificate.name[localizations.getLanguage().toUpperCase()],
                value: certificate.id,
              };
            })
          : [],
        sportunityType: value.sportunityType
          ? {
              name:
                value.sportunityType.name[
                  localizations.getLanguage().toUpperCase()
                ],
              value: value.sportunityType.id,
            }
          : null,
        opponent:
          value.game_information &&
          value.game_information.opponent &&
          value.game_information.opponent.organizer
            ? value.game_information.opponent.organizer
            : value.game_information.opponent.organizerPseudo
            ? { pseudo: value.game_information.opponent.organizerPseudo }
            : null,
        isOpenMatch: value.game_information.opponent.lookingForAnOpponent,
        unknownOpponent: value.game_information.opponent.unknownOpponent,
        circleOfOpponents:
          value.game_information && 
          !value.game_information.opponent && 
          !value.game_information.opponent.organizer && 
          value.game_information.opponent.invitedOpponents &&
          value.game_information.opponent.invitedOpponents.edges &&
          value.game_information.opponent.invitedOpponents.edges.length > 0
            ? value.game_information.opponent.invitedOpponents.edges[0].node
            : null,
        address: value.address
          ? {
              address: value.address.address,
              country: value.address.country,
              city: value.address.city,
            }
          : null,
        invited: (value.invited.length > 0 ? value.invited : [])
          .filter(invited => {
            let isInACircle = false;
            if (
              value.invited_circles &&
              value.invited_circles.edges &&
              value.invited_circles.edges.length > 0
            ) {
              value.invited_circles.edges.forEach(edge => {
                if (edge.node.members && edge.node.members.length > 0) {
                  if (
                    edge.node.members.findIndex(
                      member => member.id === invited.user.id,
                    ) >= 0
                  )
                    isInACircle = true;
                }
              });
            }

            return !isInACircle;
          })
          .map(invited => ({
            pseudo: invited.user.pseudo,
            avatar: invited.user.avatar,
          })),
        invited_circles:
          value.invited_circles &&
          value.invited_circles.edges &&
          value.invited_circles.edges.length > 0
            ? value.invited_circles.edges.map(edge => edge.node)
            : [],
        invited_circles_and_prices:
          value.price_for_circle &&
          value.invited_circles &&
          value.invited_circles.edges &&
          value.invited_circles.edges.length > 0
            ? value.invited_circles.edges.map(edge => {
                let circlePriceIndex = value.price_for_circle.findIndex(
                  item => item.circle.id === edge.node.id,
                );

                if (circlePriceIndex >= 0)
                  return {
                    circle: edge.node,
                    price: {
                      cents:
                        value.price_for_circle[circlePriceIndex].price.cents /
                        100,
                      currency:
                        value.price_for_circle[circlePriceIndex].price
                          .currency,
                    },
                    participantByDefault:
                      value.price_for_circle[circlePriceIndex]
                        .participantByDefault,
                    excludedParticipantByDefault:
                      value.price_for_circle[circlePriceIndex]
                        .participantByDefault &&
                      value.price_for_circle[circlePriceIndex]
                        .excludedParticipantByDefault
                        ? {
                            excludedMembers: value.price_for_circle[
                              circlePriceIndex
                            ].excludedParticipantByDefault.excludedMembers.map(
                              user => ({
                                id: user.id,
                              }),
                            ),
                          }
                        : null,
                  };
                else
                  return {
                    circle: edge.node,
                    price: {
                      cents: value.price.cents / 100,
                      currency: value.price.currency,
                    },
                  };
              })
            : [],
        notificationType:
          value.notification_preference &&
          value.notification_preference.notification_type
            ? value.notification_preference.notification_type
            : 'Now',
        notificationAutoXDaysBefore:
          value.notification_preference &&
          value.notification_preference.send_notification_x_days_before
            ? value.notification_preference.send_notification_x_days_before
            : 15,
        organizerParticipation: value.organizers[0].price
          ? (-1 * value.organizers[0].price.cents) / 100
          : 0,
        sexRestriction: value.sexRestriction,
        ageRestriction: {
          from: value.ageRestriction.from,
          to: value.ageRestriction.to,
        },
        hideParticipantList: value.hide_participant_list,
      },
      selectedTemplate: item,
    }));

    this.props.relay.refetch(fragmentVariables => ({
      ...fragmentVariables,
      queryDetails: true,
      filterName: {
        name: value.sport.sport.name[localizations.getLanguage().toUpperCase()],
        language: localizations.getLanguage().toUpperCase(),
      },
      sportsNb: 10,
    }),
    null,
    () => {
      let circleList = [];
      if (
        value &&
        ((this.props.viewer.me &&
          this.props.viewer.me.circles &&
          this.props.viewer.me.circles.edges &&
          this.props.viewer.me.circles.edges.length > 0) ||
          (this.props.viewer.me &&
            this.props.viewer.me.circlesUserIsIn &&
            this.props.viewer.me.circlesUserIsIn.edges &&
            this.props.viewer.me.circlesUserIsIn.edges.length > 0))
      ) {
        if (
          this.props.viewer.me &&
          this.props.viewer.me.circles &&
          this.props.viewer.me.circles.edges &&
          this.props.viewer.me.circles.edges.length > 0
        )
          this.props.viewer.me.circles.edges.forEach(
            edge =>
              circleList.findIndex(circle => circle.node.id === edge.node.id) <
                0 && circleList.push(edge),
          );

        if (
          this.props.viewer.me &&
          this.props.viewer.me.circlesUserIsIn &&
          this.props.viewer.me.circlesUserIsIn.edges &&
          this.props.viewer.me.circlesUserIsIn.edges.length > 0
        )
          this.props.viewer.me.circlesUserIsIn.edges.forEach(
            edge =>
              circleList.findIndex(circle => circle.node.id === edge.node.id) <
                0 && circleList.push(edge),
          );

        circleList = circleList
          .filter(
            edge => edge.node.type === 'TEAMS' || edge.node.type === 'CLUBS',
          )
          .map(edge => edge.node)
          .filter(
            circle =>
              circle.sport &&
              circle.sport.sport &&
              circle.sport.sport.id === value.sport.sport.id,
          );
      }
        this.setState({circleList: circleList, isLoadingCircles: false})
    })
    
    if (value.address) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({"address": value.address}, (results, status) => {

        if (status == google.maps.GeocoderStatus.OK) {
          var latitude = results[0].geometry.location.lat();
          var longitude = results[0].geometry.location.lng();
          this.setState({position: {lat: latitude, lng: longitude}})
        } 
      })
    }
  };

  _updateOpponentField(value) {
    return this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        opponent: value,
        isOpenMatch: false,
        unknownOpponent: false,
        circleOfOpponents: null,
        title: value
          ? this.state.fields.sportunityType.name +
            ' ' +
            localizations.against +
            ' ' +
            value.pseudo
          : '',
      },
    }));
  }

  _updateCircleOpponentField(value) {
    return this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        opponent: null,
        isOpenMatch: false,
        unknownOpponent: false,
        circleOfOpponents: value,
      },
    }));
  }

  _updateVenueField(value) {
    return this.setState(prevState => ({
      ...prevState,
      errors: [],
      fields: {
        ...prevState.fields,
        infrastructure: value.infrastructure,
        venue: value.venue,
        slot: {
          id: '',
          from: '',
          end: '',
          price: {
            cents: 0,
            currency: this.props.userCurrency,
          },
        },
      },
    }));
  }

  _updateVenueSlotField(value) {
    return this.setState(prevState => ({
      ...prevState,
      errors: [],
      fields: {
        ...prevState.fields,
        slot: value,
        beginningDate: new Date(value.from),
        endingDate: new Date(value.end),
      },
    }));
  }

  _updateTextField(name, event) {
    if (!!event && !!event.target) this._updateField(name, event.target.value);
  }

  _updateTextFieldFinal(name, event) {
    //return this._updateFieldFinal(name, event.target.value);
  }

  _handlePrivateChange = e => {
    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        private: !this.state.fields.private,
        price: {
          cents: 0,
          currency: this.props.userCurrency,
        },
      },
    }));
  };

  _handleAutoSwitchPrivacyChange = e => {
    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        autoSwitchPrivacy: !this.state.fields.autoSwitchPrivacy,
      },
    }));
  };

  _handleOpenMatchSwitch = e => {
    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        isOpenMatch: !this.state.fields.isOpenMatch,
        opponent: null,
        unknownOpponent: false,
        circleOfOpponents: null,
      },
    }));
  };

  _handleUnknownOpponentSwitch = e => {
    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        isOpenMatch: false,
        opponent: null,
        unknownOpponent: !this.state.fields.unknownOpponent,
        circleOfOpponents: null,
      },
    }));
  };

  _handleRemoveInvitedItem = (index, event) => {
    let newList = this.state.fields.invited;
    // event.preventDefault();
    // event.stopPropagation();

    newList.splice(index, 1);

    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        invited: newList,
      },
    }));
  };

  _handleRemoveInvitedCircle = (index, event) => {
    let newList = cloneDeep(this.state.fields.invited_circles);

    newList.splice(index, 1);
    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        invited_circles: newList,
      },
    }));
  };

  _handleRemoveInvitedCircleAndPrice = (item, event) => {
    event.preventDefault();
    event.stopPropagation();

    let newList = cloneDeep(this.state.fields.invited_circles_and_prices);
    let index = newList.findIndex(el => el.circle.id === item.id);

    newList.splice(index, 1);
    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        invited_circles_and_prices: newList,
      },
    }));
    this._handleRemoveInvitedCircle(index, event);
  };

  _handleAddInvitedItem = (name, avatar, id) => {
    if (
      this.state.fields.invited &&
      this.state.fields.invited.indexOf({ pseudo: name }) > 0
    )
      return;
    if (
      this.props.viewer.me &&
      name.toLowerCase() === this.props.viewer.me.pseudo.toLowerCase()
    ) {
      this.props.alert.show(localizations.newSportunity_invitation_error, {
        timeout: 2000,
        type: 'error',
      });
      return;
    }
    let newList = cloneDeep(this.state.fields.invited) || [];

    newList.push({ id, pseudo: name, avatar });
    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        invited: newList,
      },
    }));
  };

  _handleAddInvitedCircle = circle => {
    let newList = this.state.fields.invited_circles
      ? cloneDeep(this.state.fields.invited_circles)
      : [];

    newList.push(circle);
    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        invited_circles: newList,
      },
    }));
  };

  _updateInvitedCircles = circles => {
    let newList = circles.map(circle => ({
      circle,
      price:
        this.state.fields.invited_circles_and_prices &&
        this.state.fields.invited_circles_and_prices.length > 0 &&
        this.state.fields.invited_circles_and_prices.findIndex(
          invitedCircle => invitedCircle.circle.id === circle.id,
        ) >= 0
          ? this.state.fields.invited_circles_and_prices.find(
              invitedCircle => invitedCircle.circle.id === circle.id,
            ).price
          : this.state.fields.price,
      participantByDefault:
        this.state.fields.invited_circles_and_prices &&
        this.state.fields.invited_circles_and_prices.length > 0 &&
        this.state.fields.invited_circles_and_prices.findIndex(
          invitedCircle => invitedCircle.circle.id === circle.id,
        ) >= 0
          ? this.state.fields.invited_circles_and_prices.find(
              invitedCircle => invitedCircle.circle.id === circle.id,
            ).participantByDefault
          : false,
    }));

    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        invited_circles: circles,
        invited_circles_and_prices: newList,
      },
    }));
  };

  _updateInvitees = users => {
    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        invited: users,
      },
    }));
  };

  _deleteInvitee = user => {
    let invitees = cloneDeep(this.state.fields.invited);
    let index = invitees.findIndex(invitee => invitee.id === user.id);

    if (index >= 0) {
      invitees.splice(index, 1);
      this.setState(prevState => ({
        ...prevState,
        fields: {
          ...prevState.fields,
          invited: invitees,
        },
      }));
    }
  }

  onConfirmInviteNew = user => {
    let newInvited = this.state.fields.invited || [];
    newInvited.push(user);
    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        invited: newInvited,
      },
    }));
  };

  _handleAddInvitedCircleAndPrice = circle => {
    let newList = this.state.fields.invited_circles_and_prices
      ? cloneDeep(this.state.fields.invited_circles_and_prices)
      : [];

    newList.push({
      circle,
      price: this.state.fields.price,
      participantByDefault: false,
    });
    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        invited_circles_and_prices: newList,
      },
    }));
    this._handleAddInvitedCircle(circle);
  };

  _handleChangeInvitedCirclePrice = (circle, event) => {
    let newList = this.state.fields.invited_circles_and_prices
      ? cloneDeep(this.state.fields.invited_circles_and_prices)
      : [];

    let index = newList.findIndex(
      itemInList => itemInList.circle.id === circle.id,
    );

    newList[index].price = {
      cents: event.target.value,
      currency: this.state.fields.price.currency,
    };

    newList[index].participantByDefault =
      newList[index].price.cents !== 0
        ? false
        : newList[index].participantByDefault;
    newList[index].excludedParticipantByDefault =
      newList[index].price.cents !== 0
        ? false
        : newList[index].excludedParticipantByDefault;

    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        invited_circles_and_prices: newList,
      },
    }));
  };

  _handleChangeCircleAutoParticipate = (circle, checked) => {
    let newList =
      cloneDeep(this.state.fields.invited_circles_and_prices) || [];

    let index = newList.findIndex(
      itemInList => itemInList.circle.id === circle.id,
    );

    newList[index].participantByDefault = checked;
    let excludedMembers = [];
    let statusList = [];

    circle.memberStatus.forEach(status => {
      if (
        circle.members.findIndex(member => member.id === status.member.id) >= 0
      ) {
        let index = statusList.findIndex(
          tmpStatus => tmpStatus.member.id === status.member.id,
        );
        if (index < 0) {
          statusList.push(status);
        } else if (statusList[index].starting_date < status.starting_date)
          statusList[index] = status;
      }
    });
    statusList.forEach(member => {
      if (member.status && member.status !== 'ACTIVE') {
        excludedMembers.push(member.member);
      }
    });
    newList[index].excludedParticipantByDefault = { excludedMembers };

    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        invited_circles_and_prices: newList,
      },
    }));
  };

  _handleChangeUserAutoParticipate = (circle, user) => {
    let newList =
      cloneDeep(this.state.fields.invited_circles_and_prices) || [];

    let index = newList.findIndex(
      itemInList => itemInList.circle.id === circle.id,
    );

    if (index >= 0) {
      let newExcludedList = [];
      if (newList[index].participantByDefault) {
        let isInExcluded = false;
        if (newList[index].excludedParticipantByDefault)
          newList[index].excludedParticipantByDefault.excludedMembers.forEach(
            member => {
              if (member.id !== user.id) newExcludedList.push(member);
              else isInExcluded = true;
            },
          );
        if (!isInExcluded) newExcludedList.push(user);
      } 
      else {
        newList[index].participantByDefault = true;
        circle.members.forEach(member => {
          if (member.id !== user.id) newExcludedList.push(member);
        });
      }
      /*newList[index].participantByDefault =
        newExcludedList.length !== circle.members.length;*/
      newList[index].excludedParticipantByDefault = {
        excludedMembers: newExcludedList,
      };
      
      if (newExcludedList.length === circle.members.length) {
        newList[index].excludedParticipantByDefault = {
          excludedMembers: [],
        };
        newList[index].participantByDefault = false
      }
    }


    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        invited_circles_and_prices: newList,
      },
    }));
  };

  _handleDateAdd = () => {
    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        scheduleId: nextScheduleId++,
        beginningDate: null,
        endingDate: null,
        repeat: null,
      },
    }));
  };

  _handleAgeRestrictionChange = ageRestriction => {
    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        ageRestriction,
      },
    }));
  };

  _handleSexRestrictionChange = sexRestriction => {
    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        sexRestriction,
      },
    }));
  };

  _handleDateChange = ({ beginningDate, endingDate, repeat, scheduleId }) => {
    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        schedules: [
          ...prevState.fields.schedules.filter(
            s => s.scheduleId.toString() !== scheduleId.toString(),
          ),
          {
            scheduleId: scheduleId /*|| nextScheduleId++*/,
            beginningDate: beginningDate,
            endingDate: endingDate,
            repeat: repeat,
          },
        ],
        beginningDate,
        endingDate,
        repeat,
      },
    }));
  };

  _handleDateEdit = scheduleId => {
    const schedule = this.state.fields.schedules.filter(
      s => s.scheduleId.toString() === scheduleId.toString(),
    );

    if (schedule.length) {
      this.setState(prevState => ({
        ...prevState,
        fields: {
          ...prevState.fields,
          scheduleId: schedule[0].scheduleId,
          beginningDate: schedule[0].beginningDate,
          endingDate: schedule[0].endingDate,
        },
      }));
    }
  };

  _handleDateDelete = id => {
    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        schedules: prevState.fields.schedules.filter(
          s => s.scheduleId.toString() !== id.toString(),
        ),
      },
    }));
  };

  _handleAddressChange = label => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({"address": label}, (results, status) => {

      if (status == google.maps.GeocoderStatus.OK) {
        var latitude = results[0].geometry.location.lat();
        var longitude = results[0].geometry.location.lng();
        this.setState({position: {lat: latitude, lng: longitude}})
      } 
    })
    const splitted = label.split(', ');
    const country = splitted[splitted.length - 1] || '';
    const city = splitted[splitted.length - 2] || '';

    this._updateField('address', {
      address: splitted[0],
      country,
      city,
    });

    if (this.state.fields.slot.id !== '' && !this.state.isSurvey) {
      this.setState(prevState => ({
        ...prevState,
        fields: {
          ...prevState.fields,
          schedules: [],
          beginningDate: '',
          endingDate: '',
          repeat: 0,
        },
      }));
    }

    this._updateField('venue', {
      id: '',
      name: '',
      price: {
        cents: 0,
        currency: this.props.userCurrency,
      },
      address: {
        address: '',
      },
    });

    this._updateField('infrastructure', {
      id: '',
      name: '',
    });

    this._updateField('slot', {
      id: '',
      from: '',
      end: '',
      price: {
        cents: 0,
        currency: this.props.userCurrency,
      },
    });
  };

  _handleSlotChange = slot => {
    this._updateField('venue', {
      id: slot.venue.id,
      name: slot.venue.name,
      address: {
        address: slot.venue.address.address + ', ' + slot.venue.address.city,
      },
      price: {
        cents: 0,
        currency: this.props.userCurrency,
      },
    });

    this._updateField('infrastructure', {
      id: slot.infrastructure.id,
      name: slot.infrastructure.name,
    });

    this._updateField('slot', {
      id: slot.id,
      from: slot.from,
      end: slot.end,
      price: {
        cents: slot.price.cents,
        currency: slot.price.currency,
      },
    });

    this._updateField('address', {
      address: slot.venue.address.address,
      city: slot.venue.address.city,
      country: slot.venue.address.country,
    });

    if (slot.serie_information && slot.serie_information.remainingSlots > 1) {
      this._handleDateChange({
        beginningDate: moment(slot.from)._d,
        endingDate: moment(slot.end)._d,
        repeat: slot.serie_information.remainingSlots,
        scheduleId: 0,
      });
    } else {
      this._handleDateChange({
        beginningDate: moment(slot.from)._d,
        endingDate: moment(slot.end)._d,
        repeat: 0,
        scheduleId: 0,
      });
    }
  };

  _handleInfrastructureChange = infrastructure => {
    this._updateField('venue', {
      id: infrastructure.venue.id,
      name: infrastructure.venue.name,
      address: {
        address:
          infrastructure.venue.address.address +
          ', ' +
          infrastructure.venue.address.city,
      },
      price: {
        cents: 0,
        currency: this.props.userCurrency,
      },
    });

    this._updateField('infrastructure', {
      id: infrastructure.id,
      name: infrastructure.name,
    });

    this._updateField('address', {
      address: infrastructure.venue.address.address,
      city: infrastructure.venue.address.city,
      country: infrastructure.venue.address.country,
    });

    this._updateField('slot', {
      id: '',
      from: '',
      end: '',
      price: {
        cents: 0,
        currency: this.props.userCurrency,
      },
    });

    if (!this.state.isSurvey)
      this.setState(prevState => ({
        ...prevState,
        fields: {
          ...prevState.fields,
          schedules: [],
          beginningDate: '',
          endingDate: '',
          repeat: 0,
        },
      }));

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({"address": infrastructure.venue.address.address + ', ' + infrastructure.venue.address.city}, (results, status) => {

      if (status == google.maps.GeocoderStatus.OK) {
        var latitude = results[0].geometry.location.lat();
        var longitude = results[0].geometry.location.lng();
        this.setState({position: {lat: latitude, lng: longitude}})
      } 
    })
  };

  _handleAddOrganizer = (assistant, sport) => {
    let newList = this.state.fields.organizers
      ? cloneDeep(this.state.fields.organizers)
      : [];
    let index = newList.findIndex(item => item.organizer === assistant.id);
    if (index >= 0) {
      this.props.alert.show(
        localizations.newSportunity_organizerAlreadyInList,
        {
          timeout: 4000,
          type: 'info',
          onClose: () => console.log('--Close notif--'),
        },
      );
      return;
    }
    if (this.props.viewer.me && this.props.viewer.me.id === assistant.id) {
      this.props.alert.show(localizations.newSportunity_organizerCanAddSelf, {
        timeout: 4000,
        type: 'info',
        onClose: () => console.log('--Close notif--'),
      });
      return;
    }

    let secondaryOrganizerType;
    if (sport) {
      let userSport;
      assistant.sports.forEach(item => {
        if (item.sport.id === sport.id) userSport = item;
      });

      if (sport.assistantTypes && sport.assistantTypes.length > 0) {
        if (
          userSport &&
          userSport.assistantType &&
          userSport.assistantType.length > 0
        ) {
          secondaryOrganizerType = userSport.assistantType[0].id;
        }
      }
    }

    newList.push({
      organizer: assistant,
      price: {
        cents: 0,
        currency: this.props.userCurrency,
      },
      secondaryOrganizerType,
      customSecondaryOrganizerType: null,
      permissions: AdministratorPermissions,
    });

    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        organizers: newList,
      },
    }));
  };

  _handleRemoveOrganizer = assistantId => {
    let newList = cloneDeep(this.state.fields.organizers);
    let index = newList.findIndex(item => item.organizer.id === assistantId);

    newList.splice(index, 1);

    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        organizers: newList,
      },
    }));
  };

  _handleUpdateOrganizerPrice = (assistant, price) => {
    let newList = cloneDeep(this.state.fields.organizers);
    let index = newList.findIndex(
      item => item.organizer.id === assistant.organizer.id,
    );
    newList[index].price = {
      cents: price,
      currency: this.props.userCurrency,
    };
    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        organizers: newList,
      },
    }));
  };

  _handleUpdateOrganizerRole = (assistant, role) => {
    let newList = cloneDeep(this.state.fields.organizers);
    let index = newList.findIndex(
      item => item.organizer.id === assistant.organizer.id,
    );

    newList[index].secondaryOrganizerType = role;
    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        organizers: newList,
      },
    }));
  };

  _handleUpdateOrganizerCustomRole = (assistant, role) => {
    let newList = cloneDeep(this.state.fields.organizers);
    let index = newList.findIndex(
      item => item.organizer.id === assistant.organizer.id,
    );
    newList[index].customSecondaryOrganizerType = role;
    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        organizers: newList,
      },
    }));
  };

  _handleAddCirclesOfPendingOrganizers = circles => {
    let newList = this.state.fields.circlesOfPendingOrganizers
      ? cloneDeep(this.state.fields.circlesOfPendingOrganizers)
      : [];

    newList.push({
      circles,
      price: {
        cents: 0,
        currency: this.props.userCurrency,
      },
      secondaryOrganizerType: null,
      customSecondaryOrganizerType: null,
      permissions: AdministratorPermissions,
    });

    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        circlesOfPendingOrganizers: newList,
      },
    }));
  };

  _handleRemoveCirclesOfPendingOrganizers = index => {
    let newList = cloneDeep(this.state.fields.circlesOfPendingOrganizers);

    newList.splice(index, 1);

    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        circlesOfPendingOrganizers: newList,
      },
    }));
  };

  _handleUpdateCirclesOfPendingOrganizersPrice = (index, price) => {
    let newList = cloneDeep(this.state.fields.circlesOfPendingOrganizers);

    newList[index].price = {
      cents: price,
      currency: this.props.userCurrency,
    };
    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        circlesOfPendingOrganizers: newList,
      },
    }));
  };

  _handleUpdateCirclesOfPendingOrganizersRole = (index, role) => {
    let newList = cloneDeep(this.state.fields.circlesOfPendingOrganizers);

    newList[index].secondaryOrganizerType = role;
    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        circlesOfPendingOrganizers: newList,
      },
    }));
  };

  _handleUpdateCirclesOfPendingOrganizersCustomRole = (index, role) => {
    let newList = cloneDeep(this.state.fields.circlesOfPendingOrganizers);

    newList[index].customSecondaryOrganizerType = role;
    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        circlesOfPendingOrganizers: newList,
      },
    }));
  };

  _hideConfirmationCreationPopup = () => {
    this.setState({ confirmPopupOpen: false });
  };

  _handleShowCompleteProfile = () => {
    if (this.props.viewer.me.profileType === 'PERSON') {
      this.setState({
        confirmPopupOpen: false,
        displayCompletePersonProfilePopup: true,
      });
    } else {
      this.setState({
        confirmPopupOpen: false,
        displayCompleteBusinessProfilePopup: true,
      });
    }
  };

  _showAddBankAccount = () => {
    this.setState({
      addBankAccountOpen: true,
      confirmPopupOpen: false,
    });
  };

  _showAddACardPopup = () => {
    this.setState({
      addCardPopupOpen: true,
      confirmPopupOpen: false,
    });
  };

  _showAddACardToPaySecondaryOrganizersPopup = () => {
    this.setState({
      addACardToPaySecondaryOrganizers: true,
      confirmPopupOpen: false,
    });
  };

  _handleHideAddCard = () => {
    this.setState({
      addCardPopupOpen: false,
      confirmPopupOpen: true,
    });
  };

  _handleHideAddCardToPaySecondaryOrganizers = () => {
    this.setState({
      addACardToPaySecondaryOrganizers: false,
      confirmPopupOpen: true,
    });
  };

  _hideAddBankAccount = () => {
    this.setState({
      addBankAccountOpen: false,
      confirmPopupOpen: true,
    });
  };

  _handleHideCompleteProfilePopup = () => {
    this.setState({
      displayCompletePersonProfilePopup: false,
      confirmPopupOpen: true,
    });
  };

  _handleHideCompleteBusinessProfilePopup = () => {
    this.setState({
      displayCompleteBusinessProfilePopup: false,
      confirmPopupOpen: true,
    });
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
            localizations.popup_newSportunity_profile_update_success,
            {
              timeout: 2000,
              type: 'success',
            },
          );
          if (
            this.state.fields.price.cents > 0 &&
            !this.props.viewer.me.bankAccount
          )
            this.setState({
              addBankAccountOpen: true,
              displayCompletePersonProfilePopup: false,
              process: false,
            });
          else
            this.setState({
              confirmPopupOpen: true,
              displayCompletePersonProfilePopup: false,
              process: false,
            });
        },
        onFailure: error => {
          this.setState({
            process: false,
          });
          this.props.alert.show(
            localizations.popup_newSportunity_profile_update_error,
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
            localizations.popup_newSportunity_profile_update_success,
            {
              timeout: 2000,
              type: 'success',
            },
          );
          if (
            this.state.fields.price.cents > 0 &&
            !this.props.viewer.me.bankAccount
          )
            this.setState({
              addBankAccountOpen: true,
              displayCompleteBusinessProfilePopup: false,
              process: false,
            });
          else
            this.setState({
              confirmPopupOpen: true,
              displayCompleteBusinessProfilePopup: false,
              process: false,
            });
        },
        onFailure: error => {
          this.setState({
            process: false,
          });
          this.props.alert.show(
            localizations.popup_newSportunity_profile_update_error,
            {
              timeout: 4000,
              type: 'error',
            },
          );
        },
      },
    );
  };

  /**
   *  Edited by: Vishal Deep
   *  Purpose : Revamp/Organize
   */

  handleChangeTabButtonPress(key) {
    this.setState({ tabKey: key });
  }

  verifyBankAccount = bankAccount => {
    if (
      !bankAccount.addressLine1 ||
      !bankAccount.city ||
      !bankAccount.country ||
      !bankAccount.postalCode ||
      !bankAccount.ownerName ||
      !bankAccount.IBAN
    ) {
      this.props.alert.show(
        localizations.popup_newSportunity_required_fields,
        {
          timeout: 3000,
          type: 'info',
        },
      );
      return false;
    } else return true;
  };

  _confirmAddBankAccount = bankAccount => {
    if (!this.verifyBankAccount(bankAccount)) return;
    this.setState({
      process: true,
    });

    AddBankAccountMutation.commit(
      {
        addressLine1Var: bankAccount.addressLine1,
        addressLine2Var: bankAccount.addressLine2,
        cityVar: bankAccount.city,
        postalCodeVar: bankAccount.postalCode,
        countryVar: bankAccount.country,
        ownerNameVar: bankAccount.ownerName,
        IBANVar: bankAccount.IBAN,
        BICVar: bankAccount.BIC,
        viewer: this.props.viewer,
      },
      {
        onSuccess: response => {
          this.props.alert.show(
            localizations.popup_newSportunity_update_success,
            {
              timeout: 2000,
              type: 'success',
            },
          );
          this.setState({
            process: false,
          });
          this._hideAddBankAccount();
          this.onConfirmLastStep();
        },
        onFailure: errors => {
          this.setState({
            process: false,
          });
          let errorField = '';
          for (var error in JSON.parse(errors[0].message)) {
            errorField = error;
          }
          console.log('ERR', errorField);
          this.props.alert.show(
            localizations.popup_newSportunity_invalid_field + errorField,
            {
              timeout: 2000,
              type: 'error',
            },
          );
        },
      },
    );
  };

  isValidCard(card) {
    return (
      card.cardNumber &&
      card.cardExpirationDate &&
      card.cardCvx &&
      card.cardType
    );
  }

  _handleConfirmAddACard = (cardRegistration, card) => {
    if (!this.isValidCard(card)) {
      this.props.alert.show(localizations.popup_addACard_invalid_card, {
        timeout: 2000,
        type: 'error',
      });
      return;
    }

    this.setState({
      process: true,
    });

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
        that.setState({
          process: false,
        });
        if (res.ResultCode === '105202')
          that.props.alert.show(localizations.popup_addACard_error_105202, {
            timeout: 4000,
            type: 'error',
          });
        else if (res.ResultCode === '105203')
          that.props.alert.show(localizations.popup_addACard_error_105203, {
            timeout: 4000,
            type: 'error',
          });
        else if (res.ResultCode === '105204')
          that.props.alert.show(localizations.popup_addACard_error_105204, {
            timeout: 4000,
            type: 'error',
          });
        else
          that.props.alert.show(res.ResultMessage, {
            timeout: 4000,
            type: 'error',
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
            selectedCardToPaySecondaryOrganizers:
              res.registerCardData.viewer.me.paymentMethods.length > 0
                ? res.registerCardData.viewer.me.paymentMethods[
                    res.registerCardData.viewer.me.paymentMethods.length - 1
                  ]
                : '',
            me: res.registerCardData.viewer.me,
            confirmPopupOpen: true,
            addCardPopupOpen: false,
            addACardToPaySecondaryOrganizers: false,
            cardJustAdded: true,
            process: false,
          });
        },
        onFailure: error => {
          this.setState({
            process: false,
          });
          this.props.alert.show(localizations.popup_addACard_error, {
            timeout: 5000,
            type: 'error',
          });
        },
      },
    );
  }

  _handleChangeSelectedCard = e => {
    this.props.viewer.me.paymentMethods.find(paymentMethod => {
      if (paymentMethod.cardMask == e.target.value) {
        this.setState({
          selectedCard: paymentMethod,
        });
        return true;
      }
      return false;
    });
  };

  _handleChangeSelectedCardToPaySecondaryOrganizer = e => {
    if (e === 'wallet' || e.target.value === 'wallet') {
      this.setState({
        paySecondaryOrganizersWithWallet: true,
        selectedCardToPaySecondaryOrganizers: '',
      });
    } else if (e === 'addACard' || e.target.value === 'addACard') {
      this.setState({
        paySecondaryOrganizersWithWallet: false,
        selectedCardToPaySecondaryOrganizers: '',
      });
    } else {
      this.props.viewer.me.paymentMethods.find(paymentMethod => {
        if (paymentMethod.cardMask == e.target.value) {
          this.setState({
            selectedCardToPaySecondaryOrganizers: paymentMethod,
            paySecondaryOrganizersWithWallet: false,
          });
          return true;
        }
        return false;
      });
    }
  };

  componentDidMount = () => {
    this.props.relay.refetch({
      ...this.context.relay.variables,
      querySuperMe: false,
      queryDetails: false,
      queryLanguage: localizations.getLanguage().toUpperCase(),
    });

    if (this.props.routeParams.sportunityId) {
      let isAdmin = false;
      this.props.viewer.sportunity.organizers.forEach(organizer => {
        if (
          this.props.viewer.me &&
          organizer.organizer.id == this.props.viewer.me.id
        )
          isAdmin = true;
      });

      if (!isAdmin) {
        let path = '/event-view/' + this.props.viewer.sportunity.id;
        this.props.router.push({
          pathname: path,
        });
      } 
      else {
        let route = this.props.route.path;
        let isReorganizing = false;
        if (route.indexOf('event-reorganize') >= 0) isReorganizing = true;
        let sportunity = this.props.viewer.sportunity;

        this.props.relay.refetch({
          ...this.context.relay.variables,
          filterName: {
            name:
              sportunity.sport.sport.name[
                localizations.getLanguage().toUpperCase()
              ],
            language: localizations.getLanguage().toUpperCase(),
          },
          sportsNb: 10,
        });
        this.setState(initialState);
        if (this.props.userCurrency && this.props.userCurrency !== 'CHF') {
          this.setState(prevState => ({
            ...prevState,
            fields: {
              ...prevState.fields,
              /*price: {
                cents: 0,
                currency: this.props.userCurrency,
              },*/
              venue: {
                id: '',
                name: '',
                price: {
                  cents: 0,
                  currency: this.props.userCurrency,
                },
                address: {
                  address: '',
                },
              },
              slot: {
                id: '',
                from: '',
                end: '',
                price: {
                  cents: 0,
                  currency: this.props.userCurrency,
                },
              },
            },
          }));
        }

        this.setState(prevState => ({
          ...prevState,
          isModifying: !isReorganizing,
          isReorganizing: isReorganizing,
          fields: {
            ...prevState.fields,
            title: sportunity.title,
            description: sportunity.description,
            participantRange: {
              from: sportunity.participantRange.from,
              to: sportunity.participantRange.to,
            },
            price: {
              cents: sportunity.price.cents / 100,
              currency: sportunity.price.currency,
            },
            organizers: sportunity.organizers
              .map(organizer => {
                if (organizer.isAdmin) return false;
                else
                  return {
                    organizer: organizer.organizer,
                    price: {
                      cents: organizer.price.cents / 100,
                      currency: organizer.price.currency,
                    },
                    secondaryOrganizerType: organizer.secondaryOrganizerType
                      ? organizer.secondaryOrganizerType
                      : null,
                    customSecondaryOrganizerType:
                      organizer.customSecondaryOrganizerType,
                    permissions: organizer.permissions,
                  };
              })
              .filter(i => Boolean(i)),
            circlesOfPendingOrganizers:
              sportunity.pendingOrganizers &&
              sportunity.pendingOrganizers.length > 0
                ? sportunity.pendingOrganizers.map(org => ({
                    id: org.id,
                    circles: org.circles.edges.map(edge => edge.node),
                    price: {
                      cents: org.price.cents / 100,
                      currency: org.price.currency,
                    },
                    secondaryOrganizerType: org.secondaryOrganizerType
                      ? org.secondaryOrganizerType.id
                      : null,
                    customSecondaryOrganizerType:
                      org.customSecondaryOrganizerType,
                    permissions: org.permissions,
                  }))
                : [],
            private: sportunity.kind === 'PRIVATE',
            autoSwitchPrivacy:
              sportunity.privacy_switch_preference &&
              sportunity.privacy_switch_preference.privacy_switch_type ===
                'Automatically',
            autoSwitchPrivacyXDaysBefore:
              sportunity.privacy_switch_preference &&
              sportunity.privacy_switch_preference.privacy_switch_type ===
                'Automatically'
                ? sportunity.privacy_switch_preference
                    .switch_privacy_x_days_before
                : 15,
            venue: sportunity.venue,
            infrastructure: sportunity.infrastructure,
            slot: sportunity.slot,
            sport: {
              bold: {
                from: 0,
                to: 0,
              },
              name:
                sportunity.sport.sport.name[
                  localizations.getLanguage().toUpperCase()
                ],
              logo: sportunity.sport.sport.logo,
              value: sportunity.sport.sport.id,
              id: sportunity.sport.sport.id,
              levels: sportunity.sport.sport.levels,
              certificates: sportunity.sport.sport.certificates,
              positions: sportunity.sport.sport.positions,
              sportunityTypes: sportunity.sport.sport.sportunityTypes,
              assistantTypes: sportunity.sport.sport.assistantTypes,
            },
            levelFrom:
              sportunity.sport.levels.length > 0
                ? {
                    name:
                      sportunity.sport.levels[0][
                        localizations.getLanguage().toUpperCase()
                      ].name,
                    value: sportunity.sport.levels[0].id,
                  }
                : null,
            levelTo:
              sportunity.sport.levels.length > 0
                ? {
                    name:
                      sportunity.sport.levels[
                        sportunity.sport.levels.length - 1
                      ][localizations.getLanguage().toUpperCase()].name,
                    value:
                      sportunity.sport.levels[
                        sportunity.sport.levels.length - 1
                      ].id,
                  }
                : null,
            positions: sportunity.sport.positions
              ? sportunity.sport.positions.map(position => {
                  return {
                    name: position[localizations.getLanguage().toUpperCase()],
                    value: position.id,
                  };
                })
              : [],
            certificates: sportunity.sport.certificates
              ? sportunity.sport.certificates.map(certificate => {
                  return {
                    name:
                      certificate.name[
                        localizations.getLanguage().toUpperCase()
                      ],
                    value: certificate.id,
                  };
                })
              : [],
            sportunityType: sportunity.sportunityType
              ? {
                  name:
                    sportunity.sportunityType.name[
                      localizations.getLanguage().toUpperCase()
                    ],
                  value: sportunity.sportunityType.id,
                }
              : null,
            opponent:
              sportunity.game_information &&
              sportunity.game_information.opponent &&
              sportunity.game_information.opponent.organizer
                ? sportunity.game_information.opponent.organizer
                : sportunity.game_information.opponent.organizerPseudo
                ? {
                    pseudo:
                      sportunity.game_information.opponent.organizerPseudo,
                  }
                : null,
            isOpenMatch:
              sportunity.game_information.opponent.lookingForAnOpponent,
            unknownOpponent:
              sportunity.game_information.opponent.unknownOpponent,
            circleOfOpponents:
              sportunity.game_information.opponent.invitedOpponents &&
              sportunity.game_information.opponent.invitedOpponents.edges &&
              sportunity.game_information.opponent.invitedOpponents.edges
                .length > 0
                ? sportunity.game_information.opponent.invitedOpponents
                    .edges[0].node
                : null,
            address: {
              address: sportunity.address.address,
              country: sportunity.address.country,
              city: sportunity.address.city,
            },
            invited: (sportunity.invited.length > 0 ? sportunity.invited : [])
              .filter(invited => {
                let isInACircle = false;
                if (
                  sportunity.invited_circles &&
                  sportunity.invited_circles.edges &&
                  sportunity.invited_circles.edges.length > 0
                ) {
                  sportunity.invited_circles.edges.forEach(edge => {
                    if (edge.node.members && edge.node.members.length > 0) {
                      if (
                        edge.node.members.findIndex(
                          member => member.id === invited.user.id,
                        ) >= 0
                      )
                        isInACircle = true;
                    }
                  });
                }

                return !isInACircle;
              })
              .map(invited => ({
                id: invited.user.id,
                pseudo: invited.user.pseudo,
                avatar: invited.user.avatar,
              })),
            invited_circles:
              sportunity.invited_circles &&
              sportunity.invited_circles.edges &&
              sportunity.invited_circles.edges.length > 0
                ? sportunity.invited_circles.edges.map(edge => edge.node)
                : [],
            invited_circles_and_prices:
              sportunity.price_for_circle &&
              sportunity.invited_circles &&
              sportunity.invited_circles.edges &&
              sportunity.invited_circles.edges.length > 0
                ? sportunity.invited_circles.edges.map(edge => {
                    let circlePriceIndex = sportunity.price_for_circle.findIndex(
                      item => item.circle.id === edge.node.id,
                    );

                    if (circlePriceIndex >= 0)
                      return {
                        circle: edge.node,
                        price: {
                          cents:
                            sportunity.price_for_circle[circlePriceIndex].price
                              .cents / 100,
                          currency:
                            sportunity.price_for_circle[circlePriceIndex].price
                              .currency,
                        },
                        participantByDefault:
                          sportunity.price_for_circle[circlePriceIndex]
                            .participantByDefault,
                        excludedParticipantByDefault: sportunity
                          .price_for_circle[circlePriceIndex]
                          .participantByDefault
                          ? {
                              excludedMembers: sportunity.price_for_circle[
                                circlePriceIndex
                              ].excludedParticipantByDefault.excludedMembers.map(
                                user => ({
                                  id: user.id,
                                }),
                              ),
                            }
                          : null,
                      };
                    else
                      return {
                        circle: edge.node,
                        price: {
                          cents: sportunity.price.cents / 100,
                          currency: sportunity.price.currency,
                        },
                      };
                  })
                : [],
            notificationType:
              sportunity.notification_preference &&
              sportunity.notification_preference.notification_type
                ? sportunity.notification_preference.notification_type
                : 'Now',
            notificationAutoXDaysBefore:
              sportunity.notification_preference &&
              sportunity.notification_preference
                .send_notification_x_days_before
                ? sportunity.notification_preference
                    .send_notification_x_days_before
                : 15,
            organizerParticipates: sportunity.participants.find(
              participant => {
                return participant.id == this.props.viewer.me.id;
              },
            ),
            organizerParticipation: sportunity.organizers[0].price
              ? (-1 * sportunity.organizers[0].price.cents) / 100
              : 0,
            sexRestriction: sportunity.sexRestriction,
            ageRestriction: {
              from: sportunity.ageRestriction.from,
              to: sportunity.ageRestriction.to,
            },
            hideParticipantList: sportunity.hide_participant_list,
          },
          isParticipant: !!sportunity.participants.find(participant => {
            return participant.id == this.props.viewer.me.id;
          }),
          notifyPeople: false,
        }));

        if (sportunity.address) {
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({"address": sportunity.address.address + ', ' + sportunity.address.city}, (results, status) => {
    
            if (status == google.maps.GeocoderStatus.OK) {
              var latitude = results[0].geometry.location.lat();
              var longitude = results[0].geometry.location.lng();
              this.setState({position: {lat: latitude, lng: longitude}})
            } 
          })
        }

        if (!isReorganizing) {
          if (
            sportunity.survey &&
            sportunity.survey.surveyDates &&
            sportunity.survey.surveyDates.length > 0
          ) {
            this.setState({ isSurvey: true });
            this.setState({
              isSurveyTransformed: sportunity.survey.isSurveyTransformed,
            });
            sportunity.survey.surveyDates.forEach((date, index) => {
              this._handleDateChange({
                beginningDate: date.beginning_date,
                endingDate: date.ending_date,
                repeat:
                  route.indexOf('serie-edit') >= 0
                    ? sportunity.number_of_occurences -
                      sportunity.is_repeated_occurence_number -
                      1
                    : 0,
                scheduleId: nextScheduleId++,
              });
            });
          } else
            this._handleDateChange({
              beginningDate: sportunity.beginning_date,
              endingDate: sportunity.ending_date,
              repeat:
                route.indexOf('serie-edit') >= 0
                  ? sportunity.number_of_occurences -
                    sportunity.is_repeated_occurence_number -
                    1
                  : 0,
              scheduleId: 0,
            });
        }
        if (route.indexOf('serie-edit') >= 0)
          this.setState({ isModifyingASerie: true });
      }

      this.props.relay.refetch(fragmentVariables => ({
        ...fragmentVariables,
        queryDetails: true,
        querySuperMe: true,
        superToken: localStorage.getItem('superToken'),
      }));
    } 
    else {
      this.setState(initialState);
      if (this.props.userCurrency && this.props.userCurrency !== 'CHF') {
        this.setState(prevState => ({
          ...prevState,
          position: null,
          fields: {
            ...prevState.fields,
            price: {
              cents: 0,
              currency: this.props.userCurrency,
            },
            venue: {
              id: '',
              name: '',
              price: {
                cents: 0,
                currency: this.props.userCurrency,
              },
              address: {
                address: '',
              },
            },
            slot: {
              id: '',
              from: '',
              end: '',
              price: {
                cents: 0,
                currency: this.props.userCurrency,
              },
            },
          },
        }));
      }

      this.props.relay.refetch(
        fragmentVariables => ({
          ...fragmentVariables,
          queryDetails: true,
          querySuperMe: true,
          superToken: localStorage.getItem('superToken'),
        }),
        null,
        () => {
          if (
            (this.props.viewer.me &&
              this.props.viewer.me.circles &&
              this.props.viewer.me.circles.edges &&
              this.props.viewer.me.circles.edges.length > 0) ||
            (this.props.viewer.me &&
              this.props.viewer.me.circlesUserIsIn &&
              this.props.viewer.me.circlesUserIsIn.edges &&
              this.props.viewer.me.circlesUserIsIn.edges.length > 0)
          ) {
            let circleList = [];

            if (
              this.props.viewer.me &&
              this.props.viewer.me.circles &&
              this.props.viewer.me.circles.edges &&
              this.props.viewer.me.circles.edges.length > 0
            )
              this.props.viewer.me.circles.edges.forEach(
                edge =>
                  circleList.findIndex(
                    circle => circle.node.id === edge.node.id,
                  ) < 0 && circleList.push(edge),
              );

            if (
              this.props.viewer.me &&
              this.props.viewer.me.circlesUserIsIn &&
              this.props.viewer.me.circlesUserIsIn.edges &&
              this.props.viewer.me.circlesUserIsIn.edges.length > 0
            )
              this.props.viewer.me.circlesUserIsIn.edges.forEach(
                edge =>
                  circleList.findIndex(
                    circle => circle.node.id === edge.node.id,
                  ) < 0 && circleList.push(edge),
              );

            this.setState({ circleList: circleList.map(edge => edge.node) });

            circleList
              .filter(
                c => c.node.type === 'CHILDREN' || c.node.type === 'ADULTS',
              )
              .sort((a, b) => {
                if (a.node.memberCount < b.node.memberCount) return 1;
                if (a.node.memberCount > b.node.memberCount) return -1;
                else return 0;
              })
              .filter((e, i) => i <= 2)
              .forEach(item => {
                setTimeout(
                  () => this._handleAddInvitedCircleAndPrice(item.node),
                  50,
                );
              });
          }
        },
      );
    }

    setTimeout(() => this.setState({ loading: false }), 1500);
  };

  toggleSurvey = value => {
    if (value !== this.state.isSurvey) {
      let newList =
        cloneDeep(this.state.fields.invited_circles_and_prices) || [];
      newList.forEach((item, index) => {
        newList[index].participantByDefault = false;
      });
      this.setState(prevState => ({
        ...prevState,
        fields: {
          ...prevState.fields,
          schedules: [],
          beginningDate: null,
          endingDate: null,
          repeat: null,
          invited_circles_and_prices: newList,
        },
        isSurvey: !prevState.isSurvey,
      }));
    }
  };

  componentWillReceiveProps = nextProps => {
    if ('/new-sportunity' == this.props.location.pathname && this.props.routeParams.sportunityId) {
      this.props.relay.refetch({
        ...this.context.relay.variables,
        sportunityId: null,
      });

      this.setState(initialState);

      setTimeout(() => this.setState({ loading: false }), 1500);
    }

    if (this.props.viewer.me && !isEqual(this.props.viewer.me, nextProps.viewer.me) && this.state.fields.invited_circles_and_prices && this.state.fields.invited_circles_and_prices.length > 0) {
      this.state.fields.invited_circles_and_prices.forEach((invitedCircle, index) => {
        let newIndex = nextProps.viewer.me.circles.edges.findIndex(
          circle => circle.node.id === invitedCircle.circle.id,
        );

        if (newIndex >= 0) {
          let newList = cloneDeep(this.state.fields.invited_circles_and_prices) || [];

          newList[index].circle = nextProps.viewer.me.circles.edges[newIndex].node;

          this.setState(prevState => ({
            ...prevState,
            fields: {
              ...prevState.fields,
              invited_circles_and_prices: newList,
            },
          }));
        }
      });
    }

    if (this.props.userCurrency !== nextProps.userCurrency && !this.props.routeParams.sportunityId) {
      let newList = cloneDeep(this.state.fields.invited_circles_and_prices) || [];

      this.state.fields.invited_circles_and_prices.forEach((invitedCircle, index) => {
        newList[index].price = {
          cents: newList[index].price.cents,
          currency: nextProps.userCurrency,
        };
      });

      this.setState(prevState => ({
        ...prevState,
        fields: {
          ...prevState.fields,
          invited_circles_and_prices: newList,
        },
      }));

      this.setState(prevState => ({
        ...prevState,
        position: null,
        fields: {
          ...prevState.fields,
          price: {
            cents: this.state.fields.price.cents,
            currency: nextProps.userCurrency,
          },
          venue: {
            id: '',
            name: '',
            price: {
              cents: 0,
              currency: nextProps.userCurrency,
            },
            address: {
              address: '',
            },
          },
          slot: {
            id: '',
            from: '',
            end: '',
            price: {
              cents: 0,
              currency: nextProps.userCurrency,
            },
          },
        },
      }));
    }
  };

  _translatedName = name => {
    let translatedName = name.EN;
    switch (localizations.getLanguage().toLowerCase()) {
      case 'en':
        translatedName = name.EN;
        break;
      case 'fr':
        translatedName = name.FR || name.EN;
        break;
      case 'it':
        translatedName = name.IT || name.EN;
        break;
      case 'de':
        translatedName = name.DE || name.EN;
        break;
      default:
        translatedName = name.EN;
        break;
    }
    return translatedName;
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

  removeTemplate = value => {
    if (
      this.state.selectedTemplate &&
      value.id === this.state.selectedTemplate.value.id
    )
      this.removeSelection();
    RemoveSportunityTemplateMutation.commit(
      {
        viewer: this.props.viewer,
        sportunity: value,
      },
      {
        onSuccess: () => {
          this.props.alert.show(
            this.state.isModifyingASerie
              ? localizations.popup_newSportunity_update_serie_success
              : localizations.popup_newSportunity_update_success,
            {
              timeout: 3500,
              type: 'success',
            },
          );
          this.setState({
            process: false,
          });
        },
        onFailure: error => {
          this.setState({
            process: false,
          });
          console.log(error.getError());
        },
      },
    );
  };

  onEdit = item => {
    this.setState({
      fromTemplate: true,
    });
    this._changeTemplate(item.value, item);
  };

  removeSelection = () => {
    this.setState({
      fromTemplate: false,
      selectedTemplate: null,
    });
  };

  _priceValueChange = e => {
    let value = e.target.value;
    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        price: {
          ...prevState.fields.price,
          cents: value,
        },
      },
    }));
    setTimeout(() => {
      this.privatePriceInput.focus();
    }, 10);
  };

  _priceValueChangeByCommunity = (circle, i, e) => {
    this._handleChangeInvitedCirclePrice(circle, e);
    setTimeout(() => {
      this['privatePriceInput' + i].focus();
    }, 10);
  };

  onConfirmLastStep = () => {
    const { me } = this.props.viewer;
    const sportunity = this.state.fields;

    let isFree = true;

    if (sportunity.price.cents > 0) isFree = false;
    else {
      sportunity.invited_circles_and_prices.forEach(circle => {
        if (circle.price && circle.price.cents > 0) isFree = false;
      });
    }

    let totalCost = 0;
    if (
      (sportunity.organizers && sportunity.organizers.length > 0) ||
      (sportunity.circlesOfPendingOrganizers &&
        sportunity.circlesOfPendingOrganizers.length > 0)
    ) {
      if (sportunity.organizers && sportunity.organizers.length > 0)
        sportunity.organizers.forEach(organizer => {
          totalCost = totalCost + organizer.price.cents;
        });

      if (
        sportunity.circlesOfPendingOrganizers &&
        sportunity.circlesOfPendingOrganizers.length > 0
      )
        sportunity.circlesOfPendingOrganizers.forEach(organizer => {
          totalCost = totalCost + organizer.price.cents;
        });
    }

    if (isFree && totalCost === 0) this._confirmCreation();
    // Free & no cost
    else if (!isFree && !me.isProfileComplete)
      this._handleShowCompleteProfile();
    // Not free & profile is not completed
    else if (
      !isFree &&
      me.isProfileComplete &&
      (!me.bankAccount || !me.bankAccount.IBAN)
    )
      this._showAddBankAccount();
    // Not free & profile completed but no bank account
    else if (totalCost > 0) {
      if (me.isProfileComplete) {
        if (this.state.paySecondaryOrganizersWithWallet) {
          if (
            viewer.amountOnWallet &&
            viewer.amountOnWallet.amountOnWallet.cents -
              viewer.amountOnWallet.lockedAmount.cents <
              this.state.totalCost
          )
            router.push({ pathname: '/my-walletre' });
          // Cost > 0 and payment with wallet (which needs to be funded)
          else this._confirmCreation(); // Cost > 0 and payment with wallet
        } else if (this.state.selectedCardToPaySecondaryOrganizers === '')
          this._showAddACardToPaySecondaryOrganizersPopup();
        // Cost > 0 and payment with new card
        else this._confirmCreation(); // Cost > 0 and payment with existing card
      } else {
        this._handleShowCompleteProfile();
      }
    } else {
      this._confirmCreation(); // Not free & cost === 0
    }
  };

  handleNext = step => {
    setTimeout(() => {
      this.setState({ errors: [] }, () => {
        const { selectedTab, errors } = this.state;
        let customErrors = this._validate(step);
        if (this.state.errors.length > 0 || customErrors.length > 0) {
          this.setState({
            finished: selectedTab >= 8,
            errors: [...errors, ...customErrors],
          });
        } else {
          this.setState({
            selectedTab: selectedTab + 1,
            finished: selectedTab >= 8,
            errors: [...errors, ...customErrors],
          });
        }
      });
    }, 25); // wait for descrpition field to be updated
  };

  handlePrev = () => {
    const { selectedTab } = this.state;
    if (selectedTab > 1) {
      this.setState({ selectedTab: selectedTab - 1 });
    }
  };

  activateTabPressed = value => {
    this.setState({ errors: [] }, () => {
      const { selectedTab, errors } = this.state;
      let step = selectedTab - 1;
      if (value > step && step === 3 && typeof this.Schedule !== 'undefined') {
        if (!this.state.isSurvey && !this.state.fields.repeat && typeof this.Schedule.AddTimeDropdown !== 'undefined') { // single
          this.Schedule.AddTimeDropdown._handleScheduleSubmit(null, true)
        }
        else if (this.state.fields.repeat && !this.state.isSurvey && typeof this.Schedule.AddTimeDropdown !== 'undefined')  { // weekly
          this.Schedule.AddTimeDropdown._handleScheduleSubmit(null, true)
        }
        else if (!this.state.fields.repeat && this.state.isSurvey && typeof this.Schedule.AddSchedule !== 'undefined') { // poll
          this.Schedule.AddSchedule._handleScheduleSubmit(null, true)
        }
        return ;
      }

      if (value - 1 > step) {
        let tabHasError = -1;
        let customErrors;
        for (var i = step; i < value - 1; i++) {
          customErrors = this._validate(i);

          if (this.state.errors.length > 0 || customErrors.length > 0) {
            tabHasError = i;
            break;
          }
        }

        if (tabHasError >= 0) {
          this.setState({
            errors: [...customErrors],
            selectedTab: tabHasError + 1,
          });
        } 
        else {
          this.setState({
            selectedTab: value,
          });
        }
      } 
      else {
        this.setState({
          selectedTab: value,
        });
      }
    });
  };

  renderStepActions(step, handleNext, handlePrev) {    
    return (
      <div style={{ margin: '12px 0' }}>
        {step > 0 && (
          <Button
            color="secondary"
            variant="contained"
            disableTouchRipple={true}
            disableFocusRipple={true}
            onClick={() =>
              typeof handlePrev !== 'undefined'
                ? handlePrev(step)
                : this.handlePrev(step)
            }
            style={{ marginRight: 12 }}
          >
            {localizations.newSportunity_back}
          </Button>
        )}
        <Button
          color="primary"
          variant="contained"
          disableTouchRipple={true}
          disableFocusRipple={true}
          onClick={() =>
            typeof handleNext !== 'undefined'
              ? handleNext(step)
              : this.handleNext(step)
          }
        >
          {step === 7
            ? this.state.isModifying
              ? this.state.isModifyingASerie
                ? localizations.newSportunity_modify_serie
                : localizations.newSportunity_modify
              : this.state.fields.repeat > 0
              ? localizations.newSportunity_create_serie
              : localizations.newSportunity_create
            : localizations.newSportunity_next}
        </Button>
      </div>
    );
  }

  showErrorMessge = elm => {
    let error = this.state.errors.find(a => a.element === elm);
    if (error) {
      return error.message;
    } else {
      return '';
    }
  };

  _handleUpdateOrganizerPermissions = (assistant, permissions) => {
    let newList = cloneDeep(this.state.fields.organizers);
    let index = newList.findIndex(
      item => item.organizer.id === assistant.organizer.id,
    );
    newList[index].permissions = permissions;
    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        organizers: newList,
      },
    }));
  };

  _handleUpdateCirclesOfPendingOrganizersPermissions = (
    index,
    permissions,
  ) => {
    let newList = cloneDeep(this.state.fields.circlesOfPendingOrganizers);
    newList[index].permissions = permissions;
    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        circlesOfPendingOrganizers: newList,
      },
    }));
  };

  render() {
    if (this.state.loading) {
      return <Loading />;
    }
    const { viewer } = this.props;

    const errors = this.state.errors;

    const templateList =
      viewer.me && viewer.me.sportunityTemplates
        ? viewer.me.sportunityTemplates.map(template => ({
            name: template.title,
            value: template,
          }))
        : [];

    const levelsList = this.state.fields.sport
      ? this.state.fields.sport.levels
          .map(l => ({
            name: this._translatedLevelName(l),
            value: l.id,
            skillLevel:
              l[localizations.getLanguage().toUpperCase()].skillLevel,
            description:
              l[localizations.getLanguage().toUpperCase()].description,
          }))
          .sort((a, b) => {
            return a.skillLevel - b.skillLevel;
          })
      : [];

    const certificatesList = this.state.fields.sport
      ? this.state.fields.sport.certificates.map(c => ({
          name: this._translatedName(c.name),
          value: c.id,
        }))
      : [];

    const positionsList = this.state.fields.sport
      ? this.state.fields.sport.positions.map(p => ({
          name: this._translatedName(p),
          value: p.id,
        }))
      : [];

    const sportunityTypesList = this.state.fields.sport
      ? this.state.fields.sport.sportunityTypes.map(p => ({
          name: this._translatedName(p.name),
          value: p.id,
          isScoreRelevant: p.isScoreRelevant,
        }))
      : [];

    const { finished, selectedTab } = this.state;

    const circlesCurrentUserIsIn =
      viewer &&
      viewer.me &&
      viewer.me.circlesUserIsIn &&
      viewer.me.circlesUserIsIn.edges &&
      viewer.me.circlesUserIsIn.edges.length > 0
        ? viewer.me.circlesUserIsIn.edges
            .map(edge => {
              if (edge.node.isCircleUsableByMembers) return edge;
              else return false;
            })
            .filter(i => Boolean(i))
        : [];

    return (
      <div>
        <div
          style={styles.container}
          onSubmit={e => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {viewer.me && this.state.displayCompletePersonProfilePopup && (
            <CompletePersonProfilePopup
              sportunity={this.state.fields}
              onConfirm={this._handleConfirmProfileUpdate}
              onClose={this._handleHideCompleteProfilePopup}
              viewer={this.props.viewer}
              me={this.props.viewer.me}
              processing={this.state.process}
            />
          )}
          {viewer.me && this.state.displayCompleteBusinessProfilePopup && (
            <CompleteBusinessProfilePopup
              sportunity={this.state.fields}
              onConfirm={this._handleConfirmBusinessProfileUpdate}
              onClose={this._handleHideCompleteBusinessProfilePopup}
              viewer={this.props.viewer}
              me={this.props.viewer.me}
              processing={this.state.process}
            />
          )}
          {this.state.addBankAccountOpen && (
            <AddBankAccountPopup
              viewer={this.props.viewer}
              me={this.props.viewer.me}
              onClose={this._hideAddBankAccount}
              onConfirm={this._confirmAddBankAccount}
              processing={this.state.process}
            />
          )}
          {this.state.addCardPopupOpen && (
            <AddACardPopup
              price={this.state.fields.price}
              onConfirm={this._handleConfirmAddACard}
              onClose={this._handleHideAddCard}
              viewer={this.props.viewer}
              me={this.props.viewer.me}
              processing={this.state.process}
              price={{
                cents: sportunity.organizerParticipation,
                currency: this.props.userCurrency,
              }}
            />
          )}
          {this.state.addACardToPaySecondaryOrganizers && (
            <AddACardPopup
              price={this.state.fields.price}
              onConfirm={this._handleConfirmAddACard}
              onClose={this._handleHideAddCardToPaySecondaryOrganizers}
              viewer={this.props.viewer}
              me={this.props.viewer.me}
              processing={this.state.process}
              price={
                this.state.fields.organizers &&
                this.state.fields.organizers.length > 0
                  ? {
                      cents: this.state.fields.organizers
                        .map(a => a.price.cents)
                        .reduce((a, b) => {
                          return a + b;
                        }),
                      currency: this.props.userCurrency,
                    }
                  : { cents: 0, currency: this.props.userCurrency }
              }
            />
          )}
          <div style={styles.modal}>
            <header style={styles.header}>
              <h1 style={styles.title}>
                {/* this.state.isModifying
                  ?
                  localizations.updateSportunity_header
                  :
                  localizations.newSportunity_header */}
              </h1>
            </header>
            <ToggleDisplay show={!viewer.me}>
              <label style={{ ...styles.error, marginBottom: 25 }}>
                <span>
                  {localizations.newSportunity_login_needed}
                  {localizations.newSportunity_login_needed_1}
                  <Link style={{ color: colors.error }} to="/login">
                    {localizations.newSportunity_login_link_text}
                  </Link>
                  {localizations.newSportunity_login_needed_2}
                </span>
              </label>
            </ToggleDisplay>

            <div style={{ width: '100%', margin: 'auto' }}>
              <div
                style={{
                  width: '20%',
                  display: 'inline-block',
                  overflow: 'hidden',
                  marginRight: '0%',
                  verticalAlign: 'top',
                }}
              >
                <MenuList
                  style={{
                    display: 'flex',
                    width: '218px!important',
                    flexDirection: 'column',
                  }}
                >
                  <MenuItem
                    style={
                      this.state.selectedTab == 1
                        ? { ...styles.menuStyles }
                        : { ...styles.inactiveMenuStyles }
                    }
                    onClick={this.activateTabPressed.bind(this, 1)}
                    value="1"
                  >
                    {
                      localizations.newSportunity_autoParticipateUnswitchACircleModalTitle
                    }
                  </MenuItem>
                  <MenuItem
                    style={
                      this.state.selectedTab == 2
                        ? { ...styles.menuStyles }
                        : { ...styles.inactiveMenuStyles }
                    }
                    onClick={this.activateTabPressed.bind(this, 2)}
                    value="2"
                  >
                    {localizations.newSportunity_sport}
                  </MenuItem>
                  <MenuItem
                    style={
                      this.state.selectedTab == 3
                        ? { ...styles.menuStyles }
                        : { ...styles.inactiveMenuStyles }
                    }
                    onClick={this.activateTabPressed.bind(this, 3)}
                    value="3"
                  >
                    {localizations.newSportunity_location}
                  </MenuItem>
                  <MenuItem
                    style={
                      this.state.selectedTab == 4
                        ? { ...styles.menuStyles }
                        : { ...styles.inactiveMenuStyles }
                    }
                    onClick={this.activateTabPressed.bind(this, 4)}
                    value="4"
                  >
                    {localizations.newSportunity_schedule}
                  </MenuItem>
                  <MenuItem
                    style={
                      this.state.selectedTab == 5
                        ? { ...styles.menuStyles }
                        : { ...styles.inactiveMenuStyles }
                    }
                    onClick={this.activateTabPressed.bind(this, 5)}
                    value="5"
                  >
                    Participants
                  </MenuItem>
                  <MenuItem
                    style={
                      this.state.selectedTab == 6
                        ? { ...styles.menuStyles }
                        : { ...styles.inactiveMenuStyles }
                    }
                    onClick={this.activateTabPressed.bind(this, 6)}
                    value="6"
                  >
                    {localizations.newSportunity_confirmation_popup_price}
                  </MenuItem>
                  <MenuItem
                    style={
                      this.state.selectedTab == 7
                        ? { ...styles.menuStyles }
                        : { ...styles.inactiveMenuStyles }
                    }
                    onClick={this.activateTabPressed.bind(this, 7)}
                    value="7"
                  >
                    {localizations.event_secondary_organizer}
                  </MenuItem>
                  <MenuItem
                    style={
                      this.state.selectedTab == 8
                        ? { ...styles.menuStyles }
                        : { ...styles.inactiveMenuStyles }
                    }
                    onClick={this.activateTabPressed.bind(this, 8)}
                    value="8"
                  >
                    Validation
                  </MenuItem>
                </MenuList>
              </div>

              <div
                style={{
                  width: '80%',
                  display: 'inline-block',
                  verticalAlign: 'top',
                  marginTop: 9,
                }}
              >
                {this.state.selectedTab === 1 && (
                  <Paper zDepth={4} style={{ padding: '8px 70px 1px' }}>
                    <div>
                      <div
                        style={{
                          display: 'inline-block',
                          width: '50%',
                          verticalAlign: 'top',
                        }}
                      >
                        <h1 style={styles.title}>
                          {
                            localizations.newSportunity_autoParticipateUnswitchACircleModalTitle
                          }
                        </h1>
                        <h3 style={styles.subtitle}>
                          {localizations.newSportunity_step.replace(
                            '{0}',
                            this.state.selectedTab,
                          )}
                        </h3>
                      </div>
                      <div
                        style={{
                          display: 'inline-block',
                          width: '50%',
                          verticalAlign: 'top',
                        }}
                      >
                        <SelectTemplate
                          style={styles.select}
                          label={localizations.newSportunity_useSavedActivity}
                          list={templateList}
                          values={this.state.selectedTemplate}
                          placeholder={
                            templateList === []
                              ? localizations.newSportunity_activityName
                              : localizations.newSportunity_activityName
                          }
                          onChange={item =>
                            item
                              ? this._changeTemplate(item.value, item)
                              : this.removeSelection()
                          }
                          onEdit={this.onEdit}
                          disabled={templateList === []}
                          onRemove={this.removeTemplate}
                        />
                      </div>
                      <hr
                        style={{
                          marginBottom: 25,
                          marginLeft: -70,
                          marginRight: -70,
                        }}
                      />
                      <div
                        style={{
                          display: 'inline-block',
                          width: '50%',
                          verticalAlign: 'top',
                        }}
                      >
                        <Input
                          containerStyle={styles.input}
                          label={localizations.newSportunity_title}
                          placeholder={localizations.newSportunity_activityName}
                          onChange={e => this._updateTextField('title', e)}
                          onBlur={this._updateTextFieldFinal.bind(this, 'title')}
                          value={this.state.fields.title}
                          error={this.state.errors.some(() => 'Name')}
                          errorMessage={this.showErrorMessge('Name')}
                          maxLength="31"
                          onRef={node => {this.textInputTitle = node;}}
                          reference={this.textInputTitle}
                        />
                        <Input
                          containerStyle={styles.input}
                          label={localizations.newSportunity_description}
                          placeholder={localizations.newSportunity_descriptionHolder}
                          onChange={this._updateTextField.bind(this, 'description')}
                          onBlur={this._updateTextFieldFinal.bind(this, 'description')}
                          value={this.state.fields.description}
                          errorMessage={this.showErrorMessge('Description')}
                          error={this.state.errors.some(() => 'Description')}
                          type="textarea"
                          onRef={node => {this.textInputDescription = node;}}
                          reference={this.textInputDescription}
                        />
                      </div>
                      <hr style={styles.hr} />
                      {this.renderStepActions(0)}
                    </div>
                  </Paper>
                )}
                {this.state.selectedTab === 2 && (
                  <div>
                    <Paper zDepth={4} style={{ padding: '8px 70px 1px' }}>
                      <h1 style={styles.title}>
                        {localizations.newSportunity_sport}
                      </h1>
                      <h3 style={styles.subtitle}>
                        {localizations.newSportunity_step.replace(
                          '{0}',
                          this.state.selectedTab,
                        )}
                      </h3>
                      <hr
                        style={{
                          marginBottom: 25,
                          marginLeft: -70,
                          marginRight: -70,
                        }}
                      />
                      <div style={{ width: '40%' }}>
                        <SportSelect
                          viewer={viewer}
                          label={localizations.newSportunity_sport}
                          onChange={this._updateSportField.bind(this)}
                          error={this.state.errors.some(() => 'Sport')}
                          errorMessage={this.showErrorMessge('Sport')}
                          value={
                            this.state.fields.sport
                              ? this.state.fields.sport.name
                              : this.state.sportSearch
                          }
                        />
                        <SportLevels
                          style={styles.select}
                          label={localizations.newSportunity_level}
                          list={levelsList}
                          from={this.state.fields.levelFrom}
                          to={this.state.fields.levelTo}
                          placeholder={
                            !this.state.fields.sport
                              ? localizations.newSportunity_levelHolderBefore
                              : localizations.newSportunity_levelHolder
                          }
                          onFromChange={this._updateField.bind(this, 'levelFrom')}
                          onToChange={this._updateField.bind(this, 'levelTo')}
                          disabled={!this.state.fields.sport}
                        />
                        {certificatesList.length > 0 && (
                          <Select
                            style={styles.select}
                            label={localizations.newSportunity_certificate}
                            list={certificatesList}
                            values={this.state.fields.certificates}
                            placeholder={
                              !this.state.fields.sport
                                ? localizations.newSportunity_certificateHolderBefore
                                : localizations.newSportunity_certificateHolder
                            }
                            onChange={this._addFieldToList.bind(this, 'certificates')}
                            disabled={!this.state.fields.sport}
                          />
                        )}
                        {viewer &&
                          viewer.me &&
                          sportunityTypesList &&
                          sportunityTypesList.length > 0 && (
                            <Select
                              style={styles.select}
                              label={localizations.newSportunity_sportunityType}
                              list={sportunityTypesList}
                              values={this.state.fields.sportunityType}
                              placeholder={
                                !this.state.fields.sport
                                  ? localizations.newSportunity_sportunityTypeHolderBefore
                                  : localizations.newSportunity_sportunityTypeHolder
                              }
                              onChange={this._updateSportunityTypeField.bind(this)}
                              disabled={!this.state.fields.sport}
                              singleChoice={true}
                            />
                          )}
                      </div>
                      {viewer &&
                        viewer.me &&
                        this.state.fields.sportunityType &&
                        sportunityTypesList.findIndex(
                          type =>
                            type.value ===
                              this.state.fields.sportunityType.value &&
                            type.isScoreRelevant,
                        ) >= 0 && (
                          <Opponent
                            viewer={viewer}
                            sport={this.state.fields.sport}
                            isLoggedIn={viewer.me ? true : false}
                            selectedOpponent={this.state.fields.opponent}
                            isOpenMatch={this.state.fields.isOpenMatch}
                            unknownOpponent={this.state.fields.unknownOpponent}
                            circleOfOpponents={this.state.fields.circleOfOpponents}
                            onChange={this._updateOpponentField.bind(this)}
                            openMatchSwitch={this._handleOpenMatchSwitch}
                            unknownOppponentSwitch={this._handleUnknownOpponentSwitch}
                            onChangeCircle={this._updateCircleOpponentField.bind(this)}
                            error={this.state.errors.some(() => 'Opponent')}
                            errorMessage={this.showErrorMessge('Opponent')}
                            stepAction={this.renderStepActions(1)}
                            circlesList={
                              this.props.viewer.me &&
                              this.props.viewer.me.circles &&
                              this.props.viewer.me.circles.edges
                                ? this.props.viewer.me.circles.edges.filter(
                                    edge =>
                                      edge.node.type === 'TEAMS' ||
                                      edge.node.type === 'CLUBS',
                                  )
                                : []
                            }
                            circlesCurrentUserIsIn={circlesCurrentUserIsIn.filter(
                              edge =>
                                edge.node.type === 'TEAMS' ||
                                edge.node.type === 'CLUBS',
                            )}
                          />
                        )}
                      {(!this.state.fields.sportunityType ||
                        (this.state.fields.sportunityType &&
                          sportunityTypesList.findIndex(
                            type =>
                              type.value ===
                                this.state.fields.sportunityType.value &&
                              !type.isScoreRelevant,
                          ) >= 0)) &&
                        this.renderStepActions(1)}
                    </Paper>
                    {viewer &&
                      viewer.me &&
                      this.state.fields.sportunityType &&
                      sportunityTypesList.findIndex(
                        type =>
                          type.value ===
                            this.state.fields.sportunityType.value &&
                          type.isScoreRelevant,
                      ) >= 0 && (
                        <CircleList
                          isLoggedIn={viewer.me ? true : false}
                          sport={this.state.fields.sport}
                          unknownOpponent={this.state.fields.unknownOpponent}
                          circleOfOpponents={this.state.fields.circleOfOpponents}
                          selectedOpponent={this.state.fields.opponent}
                          viewer={viewer}
                          isOpenMatch={this.state.fields.isOpenMatch}
                          circleList={this.state.circleList}
                          label={localizations.myOpponentPropose}
                          value={this.state.fields.circleOfOpponents}
                          error={this.state.errors.some(() => 'Address')}
                          renderStepActions={this.renderStepActions(1)}
                          onChangeCircle={this._updateCircleOpponentField.bind(this)}
                          onChange={this._updateOpponentField.bind(this)}
                          isLoadingCircles={this.state.isLoadingCircles}
                        />
                      )}
                  </div>
                )}
                {this.state.selectedTab === 3 && (
                  <Paper zDepth={4} style={{ padding: '8px 70px 1px' }}>
                    <div>
                      <h1 style={styles.title}>
                        {localizations.newSportunity_location}
                      </h1>
                      <h3 style={styles.subtitle}>
                        {localizations.newSportunity_step.replace(
                          '{0}',
                          this.state.selectedTab,
                        )}
                      </h3>
                      <hr
                        style={{
                          marginBottom: 25,
                          marginLeft: -70,
                          marginRight: -70,
                        }}
                      />
                      <VenueOrAddress
                        error={this.state.errors.some(() => 'Address')}
                        errorMessage={this.showErrorMessge('Address')}
                        viewer={viewer}
                        sport={this.state.fields.sport}
                        onChangeAddress={this._handleAddressChange}
                        onChangeSlot={this._handleSlotChange}
                        onChangeInfrastructure={this._handleInfrastructureChange}
                        address={
                          this.state.fields.address.address
                            ? this.state.fields.address.address +
                              ', ' +
                              this.state.fields.address.city +
                              ', ' +
                              this.state.fields.address.country
                            : this.state.fields.venue &&
                              this.state.fields.venue.address &&
                              this.state.fields.venue.address.address
                            ? this.state.fields.venue.address.address
                            : ''
                        }
                        venue={this.state.fields.venue}
                        infrastructure={this.state.fields.infrastructure}
                        slot={this.state.fields.slot}
                        isLoggedIn={viewer.me ? true : false}
                        isModifying={this.state.isModifying}
                        sportunityId={this.props.routeParams.sportunityId}
                      />
                      <hr style={styles.hr} />
                      {this.renderStepActions(2)}
                    </div>
                  </Paper>
                )}
                {this.state.selectedTab === 4 && (
                  <Paper zDepth={4} style={{ padding: '8px 70px 1px' }}>
                    <div>
                      <h1 style={styles.title}>
                        {localizations.newSportunity_schedule}
                      </h1>
                      <h3 style={styles.subtitle}>
                        {localizations.newSportunity_step.replace(
                          '{0}',
                          this.state.selectedTab,
                        )}
                      </h3>
                      <hr
                        style={{
                          marginBottom: 25,
                          marginLeft: -70,
                          marginRight: -70,
                        }}
                      />
                      {this.state.fields.slot && this.state.fields.slot.from && this.state.fields.slot.end 
                      ? <VenueSlots
                          slot={this.state.fields.slot}
                          error={this.state.errors.some(() => 'Slot')}
                          errorMessage={this.showErrorMessge('Slot')}
                          repeat={this.state.fields.repeat}
                        />
                      : <Schedule
                          isModifying={this.state.isModifying}
                          onSubmit={this._handleDateChange}
                          onDelete={this._handleDateDelete}
                          onEdit={this._handleDateEdit}
                          onAdd={this._handleDateAdd}
                          udpateField={this._updateField}
                          beginningDate={this.state.fields.beginningDate}
                          endingDate={this.state.fields.endingDate}
                          repeat={this.state.fields.repeat}
                          onChangeRepeat={this._updateField.bind(this, 'repeat')}
                          scheduleId={this.state.fields.scheduleId}
                          schedules={this.state.fields.schedules}
                          error={this.state.errors.some(() => 'Date')}
                          errorMessage={this.showErrorMessge('Date')}
                          isModifying={this.state.isModifying}
                          isSurvey={this.state.isSurvey}
                          onChangeSurvey={this.toggleSurvey}
                          isSurveyTransformed={this.state.isSurveyTransformed}
                          onRef={node => {this.Schedule = node;}}
                          renderStepAction={this.renderStepActions}
                          handleNext={this.handleNext}
                          handlePrev={this.handlePrev}
                        />
                      }
                    </div>
                  </Paper>
                )}
                {this.state.selectedTab === 5 && (
                  <div>
                    <Paper zDepth={4} style={{ padding: '8px 70px 1px' }}>
                      <div>
                        <h1 style={styles.title}>Participants</h1>
                        <h3 style={styles.subtitle}>
                          {localizations.newSportunity_step.replace(
                            '{0}',
                            this.state.selectedTab,
                          )}
                        </h3>
                        <hr
                          style={{
                            marginBottom: 25,
                            marginLeft: -70,
                            marginRight: -70,
                          }}
                        />

                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                          <Participants
                            viewer={viewer}
                            isLoggedIn={viewer.me ? true : false}
                            value={this.state.fields.participantRange}
                            hideParticipantList={this.state.fields.hideParticipantList}
                            organizerParticipates={this.state.fields.organizerParticipates}
                            price={this.state.fields.price}
                            isModifying={this.state.isModifying}
                            onChange={this._updateField.bind(this, 'participantRange')}
                            onSwitchHideParticipantList={this._updateField.bind( this, 'hideParticipantList')}
                            onSwitchOrganizerIsParticipant={this._updateField.bind(this, 'organizerParticipates')}
                            error={this.state.errors.some(() => 'ParticipantRange')}
                            errorMessage={this.showErrorMessge('ParticipantRange')}
                            {...this.state}
                          />
                          <Privacy
                            privateChecked={this.state.fields.private}
                            me={this.props.viewer.me}
                            superMe={this.props.viewer.superMe}
                            autoSwitchPrivacyChecked={this.state.fields.autoSwitchPrivacy}
                            autoSwitchPrivacyXDaysBefore={this.state.fields.autoSwitchPrivacyXDaysBefore}
                            _handlePrivateChange={this._handlePrivateChange}
                            _handleAutoSwitchPrivacyChange={this._handleAutoSwitchPrivacyChange}
                            _handleAutoSwitchPrivacyXDaysBeforeChange={this._updateField.bind(this, 'autoSwitchPrivacyXDaysBefore',)}
                            error={this.state.errors.some(() => 'Privacy')}
                            errorMessage={this.showErrorMessge('Privacy')}
                          />
                        </div>
                      </div>
                    </Paper>

                    <Paper
                      zDepth={4}
                      style={{ padding: '8px 70px 1px', marginTop: 25 }}
                    >
                      <div>
                        <h1 style={styles.title}>
                          {viewer.me &&
                          viewer.me.profileType === 'ORGANIZATION'
                            ? localizations.newSportunity_invitedList_modal_groupsClubs
                            : localizations.newSportunity_invitedList_modal_groups}
                        </h1>
                        <hr
                          style={{
                            marginBottom: 25,
                            marginLeft: -70,
                            marginRight: -70,
                          }}
                        />

                        <SearchModal
                          isModal={false}
                          isOpen={this.state.displaySearchModal}
                          viewer={this.props.viewer}
                          onClose={this.onCloseModal}
                          onValide={this._updateInvitedCircles}
                          tabs={['Groups', 'PublicGroups']}
                          openOnTab={'Groups'}
                          publicGroupsSport={this.state.fields.sport}
                          allowToSeeCircleDetails={false}
                          types={['ADULTS', 'CHILDREN']}
                          circleTypes={[
                            'MY_CIRCLES',
                            'CIRCLES_I_AM_IN',
                            'CHILDREN_CIRCLES',
                          ]}
                          userType={'PERSON'}
                          queryCirclesOnOpen={true}
                          noNeedToValidate={true}
                          defaultCircleList={this.state.fields.invited_circles}
                          seeAs={this.state.isModifying && this.props.viewer.sportunity.organizers.find(o => o.isAdmin) ? this.props.viewer.sportunity.organizers.find(o => o.isAdmin).organizer.id : null}
                          around={this.state.position}
                        />
                      </div>
                    </Paper>
                    <Paper
                      zDepth={4}
                      style={{ padding: '8px 70px 1px', marginTop: 25 }}
                    >
                      <div>
                        <h1 style={styles.title}>
                          {viewer.me &&
                          viewer.me.profileType === 'ORGANIZATION'
                            ? localizations.newSportunity_invitedList_modal_personClubs
                            : localizations.newSportunity_invitedList_modal_person}
                        </h1>
                        <hr
                          style={{
                            marginBottom: 25,
                            marginLeft: -70,
                            marginRight: -70,
                          }}
                        />
                        <SearchModal
                          isModal={false}
                          isOpen={this.state.displaySearchModal}
                          viewer={this.props.viewer}
                          onClose={this.onCloseModal}
                          onValide={this._updateInvitees}
                          onInvite={this.onConfirmInviteNew}
                          checkedUsers={this.state.fields.invited}
                          tabs={['People', 'Invite']}
                          openOnTab={'People'}
                          allowToSeeCircleDetails={true}
                          types={['ADULTS', 'CHILDREN']}
                          circleTypes={[
                            'MY_CIRCLES',
                            'CIRCLES_I_AM_IN',
                            'CHILDREN_CIRCLES',
                          ]}
                          userType={'PERSON'}
                          queryCirclesOnOpen={true}
                          noNeedToValidate={true}
                        />
                      </div>
                    </Paper>
                    <Paper
                      zDepth={4}
                      style={{ padding: '8px 70px 1px', marginTop: 25 }}
                    >
                      <div>
                        <h1 style={styles.title}>
                          {viewer.me &&
                          viewer.me.profileType === 'ORGANIZATION'
                            ? localizations.newSportunity_invitedList_modal_detailsClubs
                            : localizations.newSportunity_invitedList_modal_details}
                        </h1>
                        <hr
                          style={{
                            marginBottom: 0,
                            marginLeft: -70,
                            marginRight: -70,
                          }}
                        />
                        <DetailsList
                          viewer={this.props.viewer}
                          invitedCircles={this.state.fields.invited_circles_and_prices}
                          list={this.state.fields.invited}
                          updateInvitedCircles={this._updateInvitedCircles}
                          onChangeCirclePrice={this._handleChangeInvitedCirclePrice}
                          onChangeCircleAutoParticipate={this._handleChangeCircleAutoParticipate}
                          onChangeUserAutoParticipate={this._handleChangeUserAutoParticipate}
                          onRemoveInvitee={this._deleteInvitee}
                          isModifying={this.state.isModifying}
                          isSurvey={this.state.isSurvey}
                          fields={this.state.fields}
                          _handleNotificationTypeChange={this._updateTextField.bind(this, 'notificationType')}
                          _handleNotificationAutoXDaysBeforeChange={this._updateField.bind(this, 'notificationAutoXDaysBefore')}
                        />
                        {this.renderStepActions(4)}
                      </div>
                    </Paper>
                  </div>
                )}
                {this.state.selectedTab === 6 && (
                  <Paper zDepth={4} style={{ padding: '8px 70px 1px' }}>
                    <div>
                      <h1 style={styles.title}>
                        {localizations.newSportunity_confirmation_popup_price}
                      </h1>
                      <h3 style={styles.subtitle}>
                        {localizations.newSportunity_step.replace(
                          '{0}',
                          this.state.selectedTab,
                        )}
                      </h3>
                      <hr
                        style={{
                          marginBottom: 25,
                          marginLeft: -70,
                          marginRight: -70,
                        }}
                      />
                      {this.state.fields.private && (
                        <PrivatePrice
                          price={this.state.fields.price.cents}
                          fees={
                            this.props.viewer.me
                              ? this.props.viewer.me.fees / 100
                              : 0.2
                          }
                          participantRange={this.state.fields.participantRange}
                          organizerParticipation={
                            this.state.fields.organizerParticipation
                          }
                          currency={this.state.fields.price.currency}
                          priceList={
                            this.state.fields.invited_circles_and_prices
                          }
                          priceValueChange={this._priceValueChange}
                          priceValueChangeByCommunity={
                            this._priceValueChangeByCommunity
                          }
                          onRef={node => {
                            this.privatePriceInput = node;
                          }}
                          onRefC={(i, node) => {
                            this['privatePriceInput' + i] = node;
                          }}
                        />
                      )}
                      {!this.state.fields.private && (
                        <div>
                          <Price
                            price={this.state.fields.price}
                            fees={this.props.viewer.me ? this.props.viewer.me.fees / 100 : 0.2}
                            venue={this.state.fields.venue}
                            currency={this.state.fields.price.currency}
                            onPriceChange={this._updatePriceField.bind(this, 'price')}
                            onVenueChange={this._updateField.bind(this, 'venue')}
                            participantRange={this.state.fields.participantRange}
                            organizerParticipation={this.state.fields.organizerParticipation}
                            disabled={!this.state.fields.participantRange.to}
                            isModifying={this.state.isModifying}
                            placeholder={!this.state.fields.participantRange.from ? localizations.newSportunity_priceHolderBefore : localizations.newSportunity_priceHolder}
                          />
                          <PrivatePrice
                            price={this.state.fields.price.cents}
                            fees={this.props.viewer.me ? this.props.viewer.me.fees / 100 : 0.2}
                            participantRange={this.state.fields.participantRange}
                            organizerParticipation={this.state.fields.organizerParticipation}
                            currency={this.state.fields.price.currency}
                            priceList={this.state.fields.invited_circles_and_prices}
                            priceValueChange={this._priceValueChange}
                            priceValueChangeByCommunity={this._priceValueChangeByCommunity}
                            onRef={node => {this.privatePriceInput = node;}}
                            onRefC={(i, node) => {this['privatePriceInput' + i] = node;}}
                          />
                        </div>
                      )}
                      {!this.props.routeParams.sportunityId && 
                        <div style={styles.changeCurrency}>
                          {localizations.newSportunity_changeCurrency}
                          <select 
                            style={styles.currencySelect} 
                            onChange={e => this.props._updateUserCurrency(e.target.value)}
                            value={this.props.userCurrency}
                          >
                            <option key={'CHF'} value={'CHF'}>
                              CHF
                            </option>
                            <option key={'EUR'} value={'EUR'}>
                              EUR
                            </option>
                          </select>
                        </div>
                      }

                      <hr style={styles.hr} />
                      {this.renderStepActions(5)}
                    </div>
                  </Paper>
                )}
                {this.state.selectedTab === 7 && (
                  <Paper zDepth={4} style={{ padding: '8px 70px 1px' }}>
                    <div>
                      <h1 style={styles.title}>
                        {localizations.event_secondary_organizer}
                      </h1>
                      <h3 style={styles.subtitle}>
                        {localizations.newSportunity_step.replace(
                          '{0}',
                          this.state.selectedTab,
                        )}
                      </h3>
                      <hr
                        style={{
                          marginBottom: 25,
                          marginLeft: -70,
                          marginRight: -70,
                        }}
                      />
                      <Organizers
                        isLoggedIn={viewer.me ? true : false}
                        buttonLabel={localizations.newSportunity_addOrganizers}
                        sport={this.state.fields.sport}
                        viewer={viewer}
                        user={viewer.me}
                        organizers={this.state.fields.organizers}
                        circlesOfPendingOrganizers={
                          this.state.fields.circlesOfPendingOrganizers
                        }
                        addOrganizer={this._handleAddOrganizer}
                        addCirclesOfPendingOrganizers={
                          this._handleAddCirclesOfPendingOrganizers
                        }
                        removeOrganizer={this._handleRemoveOrganizer}
                        removeCirclesOfPendingOrganizers={
                          this._handleRemoveCirclesOfPendingOrganizers
                        }
                        updateOrganizerPrice={this._handleUpdateOrganizerPrice}
                        updateCirclesOfPendingOrganizersPrice={
                          this._handleUpdateCirclesOfPendingOrganizersPrice
                        }
                        updateOrganizerRole={this._handleUpdateOrganizerRole}
                        updateCirclesOfPendingOrganizersRole={
                          this._handleUpdateCirclesOfPendingOrganizersRole
                        }
                        updateOrganizerCustomRole={
                          this._handleUpdateOrganizerCustomRole
                        }
                        updateCirclesOfPendingOrganizersCustomRole={
                          this
                            ._handleUpdateCirclesOfPendingOrganizersCustomRole
                        }
                        updateOrganizerPermissions={
                          this._handleUpdateOrganizerPermissions
                        }
                        updatePendingOrganizerPermissions={
                          this
                            ._handleUpdateCirclesOfPendingOrganizersPermissions
                        }
                        isModifying={this.state.isModifying}
                        error={this.state.errors.some(() => 'Organizers')}
                        errorMessage={this.showErrorMessge('Organizers')}
                      />
                      {this.state.isModifying && (
                        <div style={styles.input}>
                          <label style={styles.label}>
                            {localizations.newSportunity_notify_people}
                          </label>
                          <Switch
                            checked={this.state.notifyPeople}
                            onChange={checked =>
                              this.setState({ notifyPeople: checked })
                            }
                          />
                        </div>
                      )}
                      <hr style={styles.hr} />
                      {this.renderStepActions(6)}
                    </div>
                  </Paper>
                )}
                {this.state.selectedTab === 8 && (
                  <Paper zDepth={4} style={{ padding: '8px 70px 1px' }}>
                    <div>
                      <h1 style={styles.title}>Validation</h1>
                      <h3 style={styles.subtitle}>
                        {localizations.newSportunity_step.replace(
                          '{0}',
                          this.state.selectedTab,
                        )}
                      </h3>
                      <hr
                        style={{
                          marginBottom: 25,
                          marginLeft: -70,
                          marginRight: -70,
                        }}
                      />
                      {
                        <ConfirmCreationPopup
                          sportunity={this.state.fields}
                          viewer={this.props.viewer}
                          me={this.props.viewer.me}
                          onClose={this._hideConfirmationCreationPopup}
                          onOpenProfilePopup={this._handleShowCompleteProfile}
                          onAddBankAccount={this._showAddBankAccount}
                          bankAcccountJustAdded={
                            this.state.bankAcccountJustAdded
                          }
                          onAddCard={this._showAddACardPopup}
                          cardJustAdded={this.state.cardJustAdded}
                          onChangeSelectedCard={this._handleChangeSelectedCard}
                          selectedCard={this.state.selectedCard}
                          onAddCardToPaySecondaryOrganizers={
                            this._showAddACardToPaySecondaryOrganizersPopup
                          }
                          onChangeSelectedCardToPaySecondaryOrganizers={
                            this
                              ._handleChangeSelectedCardToPaySecondaryOrganizer
                          }
                          selectedCardToPaySecondaryOrganizers={
                            this.state.selectedCardToPaySecondaryOrganizers
                          }
                          paySecondaryOrganizersWithWallet={
                            this.state.paySecondaryOrganizersWithWallet
                          }
                          onConfirm={this._confirmCreation}
                          onConfirmTemplate={this._confirmCreationTemplate}
                          processing={this.state.process}
                          router={this.props.router}
                          isModifying={this.state.isModifying}
                          fromTemplate={this.state.fromTemplate}
                          saveTemplate={this.state.saveTemplate}
                          updateSaveTemplate={() =>
                            this.setState({
                              saveTemplate: !this.state.saveTemplate,
                            })
                          }
                          queryAmount={() => {
                            this.props.relay.refetch({
                              ...this.context.relay.variables,
                              queryAmount: true,
                            });
                          }}
                        />
                      }
                      <hr style={styles.hr} />
                      {this.renderStepActions(7, () =>
                        this.onConfirmLastStep(),
                      )}
                    </div>
                  </Paper>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const stateToProps = state => ({
  userCurrency: state.globalReducer.userCurrency,
  language: state.globalReducer.language,
  tutorialSteps: state.profileReducer.tutorialSteps,
});

const _updateUserCurrency = value => ({
  type: types.GLOBAL_SET_USER_CURRENCY,
  value,
});

const _updateStepsCompleted = steps => ({
  type: types.UPDATE_STEPS_COMPLETED,
  tutorialSteps: steps,
});

const dispatchToProps = dispatch => ({
  _updateStepsCompleted: bindActionCreators(_updateStepsCompleted, dispatch),
  _updateUserCurrency: bindActionCreators(_updateUserCurrency, dispatch),
});

let ReduxContainer = connect(
  stateToProps,
  dispatchToProps,
)(Radium(NewSportunity));

const NewSportunityTemp = createRefetchContainer(
  withAlert(ReduxContainer),
  {
    // OK
    viewer: graphql`
      fragment NewSportunity_viewer on Viewer
        @argumentDefinitions(
          sportsNb: { type: "Int", defaultValue: 10 }
          filterName: { type: "SportFilter" }
          sportunityId: { type: "ID", defaultValue: null }
          superToken: { type: "String", defaultValue: null }
          querySuperMe: { type: "Boolean!", defaultValue: false }
          queryDetails: { type: "Boolean!", defaultValue: false }
          queryLanguage: { type: "SupportedLanguage", defaultValue: "EN" }
          queryAmount: { type: "Boolean", defaultValue: false }
        ) {
        languages {
          id
          name
          code
        }
        ...AddACardPopup_viewer
        ...VenueOrAddress_viewer
        ...Opponent_viewer
        ...Invited_viewer
        ...Organizers_viewer
        ...SportSelect_viewer
        ...DetailsList_viewer
        ...GroupList_viewer
        ...PersonList_viewer
        ...CircleList_viewer
        ...SearchModal_viewer
        id
        superMe(superToken: $superToken) @include(if: $querySuperMe) {
          id
          profileType
        }
        amountOnWallet @include(if: $queryAmount) {
          amountOnWallet {
            cents
            currency
          }
          lockedAmount {
            cents
            currency
          }
        }
        me {
          ...Organizers_user
          id
          pseudo
          firstName
          lastName
          nationality
          sportunityTemplates {
            id
            title
            description
            kind
            privacy_switch_preference {
              privacy_switch_type
              switch_privacy_x_days_before
            }
            invited {
              user {
                id
                pseudo
                avatar
              }
              answer
            }
            invited_circles(last: 10) {
              edges {
                node {
                  id
                  name
                  members {
                    id
                  }
                  memberStatus {
                    starting_date
                    member {
                      id
                      pseudo
                    }
                    status
                  }
                  owner {
                    id
                    pseudo
                    avatar
                  }
                  type
                  memberCount
                }
              }
            }
            price_for_circle {
              circle {
                id
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
            notification_preference {
              notification_type
              send_notification_x_days_before
            }
            participantRange {
              from
              to
            }
            hide_participant_list
            price {
              currency
              cents
            }
            is_repeated_occurence_number
            number_of_occurences
            sport {
              sport {
                id
                name {
                  EN
                  DE
                  FR
                }
                logo
                type
                sportunityTypes {
                  id
                  isScoreRelevant
                  name {
                    FR
                    EN
                  }
                }
                positions {
                  id
                  EN
                  FR
                  DE
                }
                certificates {
                  id
                  name {
                    EN
                    FR
                    DE
                  }
                }
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
                assistantTypes {
                  id
                  name {
                    EN
                    FR
                    DE
                    ES
                  }
                }
              }
              positions {
                id
                EN
                FR
                DE
              }
              certificates {
                id
                name {
                  EN
                  FR
                  DE
                }
              }
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
            }
            ageRestriction {
              from
              to
            }
            sexRestriction
            address {
              address
              country
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
              }
              isAdmin
              role
              price {
                cents
                currency
              }
              secondaryOrganizerType {
                id
                name {
                  FR
                  EN
                }
              }
              customSecondaryOrganizerType
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
                    name
                    memberCount
                    type
                    members {
                      id
                    }
                    owner {
                      id
                      pseudo
                    }
                  }
                }
              }
              isAdmin
              role
              price {
                cents
                currency
              }
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
            sportunityType {
              id
              isScoreRelevant
              name {
                FR
                EN
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
                invitedOpponents(last: 5) {
                  edges {
                    node {
                      id
                      name
                      memberCount
                    }
                  }
                }
                unknownOpponent
              }
            }
          }
          address {
            address
            city
            country
          }
          fees
          paymentMethods {
            id
            cardMask
            currency
          }
          circles(last: 20) {
            edges {
              node {
                id
                name
                memberCount
                type
                owner {
                  id
                  pseudo
                }
                memberStatus {
                  starting_date
                  member {
                    id
                    pseudo
                  }
                  status
                }
                circlePreferences {
                  isChildrenCircle
                }
                members {
                  id
                  pseudo
                }
                sport {
                  sport {
                    id
                    name {
                      FR
                    }
                  }
                }
              }
            }
          }
          circlesUserIsIn(last: 20) {
            edges {
              node {
                id
                isCircleUsableByMembers
                name
                type
                memberStatus {
                  starting_date
                  member {
                    id
                    pseudo
                  }
                  status
                }
                owner {
                  id
                  pseudo
                  avatar
                }
                members {
                  id
                  pseudo
                }
                memberCount
                sport {
                  sport {
                    id
                    name {
                      FR
                    }
                  }
                }
              }
            }
          }
          circlesFromClub(last: 20)  {
            edges {
              node {
                id
                name
                type
                memberStatus {
                  starting_date
                  member {
                    id
                    pseudo
                  }
                  status
                }
                owner {
                  id
                  pseudo
                  avatar
                }
                memberCount
                members {
                  id
                  pseudo
                }
                sport {
                  sport {
                    id
                    name {
                      FR
                    }
                  }
                }
              }
            }
          }
          bankAccount {
            id
            addressLine1
            addressLine2
            city
            postalCode
            country
            ownerName
            IBAN
            BIC
          }
          profileType
          isProfileComplete
          shouldDeclareVAT
          nationality
          birthday
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
          areStatisticsActivated
        }
        sports(
          first: $sportsNb
          filter: $filterName
          language: $queryLanguage
        ) @include(if: $queryDetails) {
          edges {
            node {
              id
              name {
                EN
                FR
                DE
              }
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
              positions {
                id
                EN
                FR
                DE
              }
              certificates {
                id
                name {
                  EN
                  FR
                  DE
                }
              }
              type
              sportunityTypes {
                id
                isScoreRelevant
                name {
                  FR
                  EN
                }
              }
            }
          }
        }
        sportunity(id: $sportunityId) {
          id
          title
          description
          kind
          privacy_switch_preference {
            privacy_switch_type
            switch_privacy_x_days_before
          }
          participants {
            id
            avatar
            pseudo
          }
          waiting {
            id
            pseudo
            avatar
          }
          invited {
            user {
              id
              pseudo
              avatar
            }
            answer
          }
          survey {
            isSurveyTransformed
            surveyDates {
              beginning_date
              ending_date
            }
          }
          invited_circles(last: 10) {
            edges {
              node {
                id
                name
                memberStatus {
                  starting_date
                  member {
                    id
                    pseudo
                  }
                  status
                }
                members {
                  id
                }
                owner {
                  id
                  pseudo
                  avatar
                }
                type
                memberCount
              }
            }
          }
          price_for_circle {
            circle {
              id
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
          notification_preference {
            notification_type
            send_notification_x_days_before
          }
          participantRange {
            from
            to
          }
          hide_participant_list
          beginning_date
          ending_date
          price {
            currency
            cents
          }
          is_repeated_occurence_number
          number_of_occurences
          sport {
            sport {
              id
              name {
                EN
                DE
                FR
              }
              logo
              positions {
                id
                EN
                FR
                DE
              }
              certificates {
                id
                name {
                  EN
                  FR
                  DE
                }
              }
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
              type
              sportunityTypes {
                id
                isScoreRelevant
                name {
                  FR
                  EN
                }
              }
              assistantTypes {
                id
                name {
                  EN
                  FR
                  DE
                  ES
                }
              }
            }
            positions {
              id
              EN
              FR
              DE
            }
            certificates {
              id
              name {
                EN
                FR
                DE
              }
            }
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
          }
          ageRestriction {
            from
            to
          }
          sexRestriction
          address {
            address
            country
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
            }
            isAdmin
            role
            price {
              cents
              currency
            }
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
                  name
                  memberCount
                  type
                  members {
                    id
                  }
                  owner {
                    id
                    pseudo
                  }
                }
              }
            }
            isAdmin
            role
            price {
              cents
              currency
            }
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
          venue {
            id
            name
            address {
              address
              city
              country
            }
          }
          infrastructure {
            id
            name
          }
          slot {
            id
            from
            end
            price {
              cents
              currency
            }
          }
          sportunityType {
            id
            isScoreRelevant
            name {
              FR
              EN
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
              invitedOpponents(last: 5) {
                edges {
                  node {
                    id
                    name
                    memberCount
                  }
                }
              }
              unknownOpponent
            }
          }
          status
        }
      }
    `,
  },
  graphql`
    query NewSportunityRefetchQuery(
      $sportsNb: Int
      $filterName: SportFilter
      $sportunityId: ID
      $superToken: String
      $querySuperMe: Boolean!
      $queryDetails: Boolean!
      $queryLanguage: SupportedLanguage
    ) {
      viewer {
        ...NewSportunity_viewer
          @arguments(
            sportsNb: $sportsNb
            filterName: $filterName
            sportunityId: $sportunityId
            superToken: $superToken
            querySuperMe: $querySuperMe
            queryDetails: $queryDetails
            queryLanguage: $queryLanguage
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
          query NewSportunityQuery(
            $sportsNb: Int
            $filterName: SportFilter
            $sportunityId: ID
            $superToken: String
            $querySuperMe: Boolean!
            $queryDetails: Boolean!
            $queryLanguage: SupportedLanguage
          ) {
            viewer {
              ...NewSportunity_viewer
                @arguments(
                  sportsNb: $sportsNb
                  filterName: $filterName
                  sportunityId: $sportunityId
                  superToken: $superToken
                  querySuperMe: $querySuperMe
                  queryDetails: $queryDetails
                  queryLanguage: $queryLanguage
                )
            }
          }
        `}
        variables={{
          querySuperMe: false, 
          queryDetails: false
        }}
        render={({error, props}) => {
          if (props) {
            return <NewSportunityTemp query={props} viewer={props.viewer} {...this.props}/>;
          } else {
            return (
              <div>
                <Loading />
              </div>
            )
          }
        }}
      />
    )
  }
}


styles = {
  paperStyle: {
    padding: '8px 70px 1px',
    marginTop: '20px',
  },
  hr: {
    marginLeft: -70,
    marginRight: -70,
  },
  container: {
    paddingTop: 40,
    paddingBottom: 63,

    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    width: '100%',

    fontFamily: 'Lato',
    backgroundColor: '#F3F3F3',
  },

  modal: {
    position: 'relative',
    width: 1084,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 5,
    boxShadow: 'box-shadow: 0 0 4px 0 rgba(0,0,0,0.4)',
    backgroundColor: '#F3F3F3',
    overlay: { zIndex: 10 },
    '@media (max-width: 1204px)': {
      width: '94%',
    },
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  cancel: {
    position: 'absolute',
    top: 40,
    right: 40,
    fontSize: 24,
    lineHeight: 1,
    color: colors.gray,
    backgroundColor: 'transparent',
    border: 'none',

    cursor: 'pointer',
  },

  cancelIcon: {
    marginLeft: 15,
  },

  changeCurrency: {
    display: 'flex',
    alignItems: 'center',
    fontFamily: 'Lato',
    fontSize: 16,
    fontWeight: 500,
    lineHeight: '23px',
    color: '#515151',
    marginTop: 15
  },
  currencySelect: {
    width: 100,
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottomWidth: 2,
    borderBottomColor: colors.blue,
    fontFamily: 'Lato',
    paddingBottom: 5,
    marginLeft: 40,
    fontSize: 16,
    lineHeight: 1,
    paddingLeft: 3
  },

  title: {
    marginBottom: 10,
    color: '#4E4E4E',
    fontFamily: 'Lato',

    fontSize: 24,
    fontWeight: 'bold',
  },

  menuItemSelected: {
    backgroundColor: '#5EA1D9',
  },
  subtitle: {
    marginBottom: 5,
    color: '#646464',
    fontSize: 15,
  },

  subtitleWithoutMargin: {
    color: colors.blue,
    fontSize: 28,
    lineHeight: 1,
    fontWeight: 500,
  },

  content: {
    display: 'flex',
    marginBottom: 25,
    '@media (max-width: 600px)': {
      display: 'block',
      width: '94%',
      margin: '0 auto',
    },
  },

  next_tab_button: {
    color: colors.white,
    backgroundColor: colors.blueLight,
    lineHeight: '0px',
    borderRadius: '0px',
  },

  previous_tab_button: {
    color: colors.blueLight,
    backgroundColor: colors.white,
    lineHeight: '0px',
    borderRadius: '0px',
    marginRight: '20px',
  },

  label: {
    display: 'block',
    color: colors.blueLight,
    fontSize: 16,
    lineHeight: 1,
    marginBottom: 8,
  },

  footer: {
    display: 'flex',
    '@media (max-width: 600px)': {
      flexDirection: 'column',
      width: '94%',
      margin: '0 auto',
    },
  },

  column: {
    paddingRight: 119,
    width: '50%',
    '@media (max-width: 600px)': {
      paddingRight: 0,
      width: '100%',
    },
    '@media (max-width: 480px)': {
      paddingRight: 0,
      width: '100%',
    },
  },

  input: {
    marginBottom: 25,
  },

  select: {
    marginBottom: 4,
    /* overflow : 'scroll',
    height: 200, */
  },

  checkbox: {
    alignSelf: 'center',
    marginBottom: 20,
  },

  sportToolTipIcon: {
    marginLeft: 15,
    fontSize: 22,
    cursor: 'pointer',
  },

  submit: {
    lineHeight: '0px',
    borderRadius: '0px',
  },

  error: {
    /* display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center', */
    display: 'block',
    color: colors.error,
    fontSize: 18,
    marginBottom: 10,
  },
  inactiveMenuStyles: {
    fontFamily: 'Lato',
    fontSize: 15,
  },
  menuStyles: {
    borderLeft: '5px solid #5EA1D9',
    backgroundColor: '#FFFFFF',
    boxShadow: 'box-shadow: inset -7px 0 9px -7px rgba(0,0,0,0.4)',
    fontFamily: 'Lato',
    fontSize: 15,
  },
  section: {
    //   backgroundColor: colors.lightGray,
    padding: '10px 15px 10px 0px',
    marginBottom: 10,
    borderRadius: 5,
  },
  sectionTitle: {
    fontFamily: 'Lato',
    fontSize: '18px',
    marginBottom: 15,
    paddingBottom: 5,
    borderBottom: '1px solid ' + colors.darkGray,
    color: colors.darkGray,
  },
};
