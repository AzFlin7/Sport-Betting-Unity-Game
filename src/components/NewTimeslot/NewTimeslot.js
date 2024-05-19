import React, { Component } from 'react';
import PureComponent, { pure } from '../common/PureComponent';
import PropTypes from 'prop-types';

import Radium, { Style } from 'radium';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import moment from 'moment';
import { createRefetchContainer, graphql, QueryRenderer } from 'react-relay';
import { Link } from 'found';
import ToggleDisplay from 'react-toggle-display';
import { withAlert } from 'react-alert';
import ReactTooltip from 'react-tooltip';
import _ from 'lodash';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';

import mangoPay from 'mangopay-cardregistration-js-kit';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';

import AppHeader from '../common/Header/Header.js';
import Loading from '../common/Loading/Loading.js';
import environment from 'sportunity/src/createRelayEnvironment';

import Input from '../NewSportunity/Input';
import Select from '../NewSportunity/Select';
import Switch from '../common/Switch';

import Price from '../NewSportunity/Price';
import Participants from '../NewSportunity/Participants';
import SportLevels from '../NewSportunity/SportLevels';
import Address from '../NewSportunity/Address';
import Invited from '../NewSportunity/Invited';
import Organizers from '../NewSportunity/Organizers';
import Schedule from '../NewSportunity/Schedule';
import Details from '../NewSportunity/Details';
import VenueSlots from '../NewSportunity/VenueSlots';
import Privacy from '../NewSportunity/Privacy';
import NotificationToInvitees from '../NewSportunity/NotificationToInvitees';
import VenueOrAddress from '../NewSportunity/VenueOrAddress';
import Opponent from '../NewSportunity/Opponent';

import ConfirmCreationPopup from '../NewSportunity/ConfirmCreationPopup';
import AddBankAccountPopup from '../NewSportunity/AddBankAccountPopup';
import AddACardPopup from '../NewSportunity/AddACardPopup';
import CompleteBusinessProfilePopup from '../EventView/CompleteBusinessProfilePopup';
import CompletePersonProfilePopup from '../EventView/CompletePersonProfilePopup';



import NewTimeslotMutation from './NewTimeslotMutation';

import NewSportunityMutation from '../NewSportunity/NewSportunityMutation';
import UpdateSportunityMutation from '../NewSportunity/UpdateSportunityMutation';
import NewSportunityTemplateMutation from '../NewSportunity/NewSportunityTemplateMutation';
import UpdateSportunityTemplateMutation from '../NewSportunity/UpdateSportunityTemplateMutation';
import RemoveSportunityTemplateMutation from '../NewSportunity/RemoveSportunityTemplateMutation';
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
import CircleList from '../NewSportunity/CircleList';
import ParticipantList from '../NewSportunity/ParticipantList';
import SearchModal from '../common/SearchModal/SearchModalTimeslot';
import GroupList from '../NewSportunity/GroupList';
import PersonList from '../NewSportunity/PersonList';
import DetailsListTimeSlot from './DetailsListTimeSlot';

import PrivatePrice from '../NewSportunity/PrivatePrice';
import SportSelect from '../common/Inputs/SportSelect';
import SelectTemplate from './SelectTemplate';
import * as types from '../../actions/actionTypes';
import { AdministratorPermissions } from '../NewSportunity/AdministratorPermissions';

import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { DateRange } from 'material-ui-icons';
import DatePicker from 'react-datepicker';
import DateRangeIcon from '@material-ui/icons/DateRange';

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
  all: false,
  venue1: false,
  venue2: false,
  venue3: false,
  showContainer2: false,
  allfields: false,
  field1: false,
  field2: false,
  field3: false,
  field4: false,
  MONDAY: false,
  TUESDAY: false,
  WEDNESDAY: false,
  THURSDAY: false,
  FRIDAY: false,
  SATURDAY: false,
  SUNDAY: false,
  showaddtimeslotbutton: false,

  dates: [],
  weekDays: [],
  selectedVenues: [],
  selectedFields: [],
  timeSlotType: null,
  hour: null,
  min: null,
  beginningTime: '',
  endingTime: '',
  date: moment(),
  ending_date: moment().add('days', 7),
  slotCards: [],
  usersSlotIsFor: [],
};

class NewTimeSlot extends Component {
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
  handleChange = name => event => {
    console.log('name', name);
    this.setState({
      ...this.state,
      [name]: event.target.checked,
      showContainer2: true,
    });
  };

  handleVenueChange = node => event => {
    const isChecked = event.target.checked;
    const value = event.target.value;
    if (isChecked) {
      if (value == 'all') {
        let venues = [];
        this.props.viewer.venues.edges.map(function (venue) {
          venues.push({ id: venue.node.id, name: venue.node.name });
        });
        this.setState({ selectedVenues: venues, showContainer2: true });
      } else {
        this.setState(prevState => ({
          selectedVenues: [...prevState.selectedVenues, { id: node.id, name: node.name }],
          showContainer2: true,
        }));
      }
    } else {
      if (value == 'all') {
        this.setState({ selectedVenues: [], showContainer2: false });
      } else {
        let showContainer = false;
        const newAddedVenues = this.state.selectedVenues.filter(
          venue => venue.id !== node.id,
        );
        if (newAddedVenues.length > 0) {
          showContainer = true;
        }
        this.setState({
          selectedVenues: newAddedVenues,
          showContainer2: showContainer,
        });
      }
    }
  };

  handleFeildsChange = field => event => {
    const isChecked = event.target.checked;
    const value = event.target.value;

    if (isChecked) {
      if (value == 'allfields') {
        let fields = [];
        this._filterFiels().map(function (field) {
          fields.push({ id: field.id, name: field.name });
        });
        this.setState({ selectedFields: fields });
      } else {
        this.setState(prevState => ({
          selectedFields: [...prevState.selectedFields, { id: field.id, name: field.name }],
        }));
      }
    } else {
      if (value == 'allfields') {
        this.setState({ selectedFields: [] });
      } else {
        const newAddedFields = this.state.selectedFields.filter(
          venue => venue.id !== field.id,
        );
        this.setState({ selectedFields: newAddedFields });
      }
    }
  };

  _hanldeTimeSlotType = (value, item) => {
    this.setState({
      timeSlotType: item,
    });
  };

  _handleTimeSlotInputChange = (name, e) => {
    if (!!event && !!event.target)
      this.setState({
        [name]: e.target.value,
      });
  };

  handledaysChange = name => event => {
    let weekDays = [...this.state.weekDays];
    if (event.target.checked) {
      if (!weekDays.includes(name)) {
        weekDays = [...weekDays, name];
      }
    } else {
      const index = weekDays.indexOf(name);
      if (index > -1) {
        weekDays.splice(index, 1);
      }
    }
    this.setState({ ...this.state, [name]: event.target.checked, weekDays });
  };

  _removeTimeSlot = index => {
    const currentSlots = this.state.slotCards;
    currentSlots.splice(index, 1);
    this.setState({
      slotCards: currentSlots,
    });
  };

  addHoursToCurrentTime = (hours) => {
    let dateStr = new Date().toLocaleDateString(),
      timeStr = hours,
      date = moment(dateStr),
      time = moment(timeStr, 'HH:mm');

    date.set({
      hour: time.get('hour'),
      minute: time.get('minute'),
      second: time.get('second')
    });
    return moment(date).format("YYYY-DD-MM HH:mm");
  }

  showtimeslotcards = () => {
    const slotCards = [
      ...this.state.slotCards,
      {
        weekDays: this.state.weekDays,
        beginningHour: this.state.beginningTime,
        endingHour: this.state.endingTime,
        beginningDate: new Date(this.state.date).toISOString().slice(0, 10),
        endingDate: new Date(this.state.ending_date).toISOString().slice(0, 10),
        slots: this.calculateSlots(),
      },
    ];

    if (this.state.weekDays.length > 0) {
      this.setState({ slotCards, addtimeslotclicked: true });
    } else {
      this.setState({ addtimeslotclicked: false });
    }
  };



  _handleChangeInvitedCircleNotificationPreference = (circle, event) => {
    const value=event.target.value;
    let newList = this.state.fields.invited_circles_and_prices
      ? cloneDeep(this.state.fields.invited_circles_and_prices)
      : [];

    let index = newList.findIndex(
      itemInList => itemInList.circle.id === circle.circle.id,
    );

    newList[index].notification_preference = {
      notification_type: event.target.value,
    };


    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        notificationType:value,
        invited_circles_and_prices: newList,
      },
    }));
  };


  _handleChangeInvitedCirclemultiBooking = (circle, event) => {
    let newList = this.state.fields.invited_circles_and_prices
      ? cloneDeep(this.state.fields.invited_circles_and_prices)
      : [];

    let index = newList.findIndex(
      itemInList => itemInList.circle.id === circle.circle.id,
    );

    newList[index].multiBookingLimit = event.target.value;


    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        invited_circles_and_prices: newList,
      },
    }));
  };


  _handleChangeInvitedCircleVisibility = (circle, event) => {
    let newList = this.state.fields.invited_circles_and_prices
      ? cloneDeep(this.state.fields.invited_circles_and_prices)
      : [];

    let index = newList.findIndex(
      itemInList => itemInList.circle.id === circle.circle.id,
    );

    newList[index].daysOfVisibility = event.target.value;


    this.setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        invited_circles_and_prices: newList,
      },
    }));
  };




  _handleKeyDown = (event, field) => {
    if (event.keyCode === 8 && field === 'beginning_time') {
      if (this.state.beginningTime.length === 3) {
        let text = this.state.beginningTime;
        text = text.slice(0, 1);
        this.setState({
          beginningTime: text,
        });
        event.preventDefault();
        event.stopPropagation();
      }
    } else if (event.keyCode === 8 && field === 'ending_time') {
      if (this.state.endingTime.length === 3) {
        let text = this.state.endingTime;
        text = text.slice(0, 1);
        this.setState({
          endingTime: text,
        });
        event.preventDefault();
        event.stopPropagation();
      }
    }
  };
  _handleBlurBeginningTime = event => {
    if (this.state.beginningTime.length === 1) {
      this.setState({
        beginningTime: '0' + this.state.beginningTime + ':00',
      });
    } else if (
      this.state.beginningTime.length === 3 &&
      this.state.beginningTime[this.state.beginningTime.length - 1] === ':'
    ) {
      this.setState({
        beginningTime: this.state.beginningTime + '00',
      });
    }
    setTimeout(() => {
      if (
        this._isValidHour(this.state.beginningTime) &&
        !this.state.endingTime
      ) {
        let endingTime =
          Number(
            this.state.beginningTime.substr(
              0,
              this.state.beginningTime.indexOf(':'),
            ),
          ) + 1;
        if (endingTime >= 24) endingTime = '00';
        if (endingTime.toString().length === 1) endingTime = '0' + endingTime;
        endingTime =
          endingTime +
          ':' +
          this.state.beginningTime.substr(
            this.state.beginningTime.indexOf(':') + 1,
            this.state.beginningTime.length,
          );
        this.setState({
          endingTime,
        });
      }
    }, 50);
  };
  _handleBeginningTimeChange = event => {
    if (event.target.value.length === 2)
      this.setState({
        beginningTime: event.target.value + ':',
      });
    else
      this.setState({
        beginningTime: event.target.value,
      });
  };

  _handleEndingTimeChange = event => {
    if (event.target.value.length === 2)
      this.setState({
        endingTime: event.target.value+':'
      })
    else
      this.setState({
        endingTime: event.target.value
      })
  }

  
  _setLanguage = language => {
    this.setState({ language: language });
  };

  _validate(step = 0) {
    const { fields } = this.state;
    const errors = [];

    if (this.state.selectedVenues.length==0 && step === 0) {
      errors.push({
        element: 'Venue',
        message: localizations.timeslot_noVenueProvided,
      });
    }

    if (this.state.selectedFields.length==0 && step === 0) {
      errors.push({
        element: 'Fields',
        message: localizations.timeslot_noFieldProvided,
      });
    }

    if (!this.state.timeSlotType && step === 1) {
      errors.push({
        element: 'SlotType',
        message: localizations.timeslot_noslotTypeProvided,
      });
    }

    if ((!this.state.min)  && step === 1) {
      errors.push({
        element: 'HourMin',
        message: localizations.timeslot_noTimeDurationProvided,
      });
    }


    if ((!this.state.beginningTime || !this.state.endingTime) && step === 2) {
      errors.push({
        element: 'Hours',
        message: localizations.timeslot_noHoursProvided,
      });
    }

    
    if ((!this.state.date || !this.state.ending_date) && step === 2) {
      errors.push({
        element: 'Date',
        message: localizations.timeslot_noDateProvided,
      });
    }

    if ((this.state.weekDays.length==0)  && step === 2) {
      errors.push({
        element: 'WeekDays',
        message: localizations.timeslot_noWeekDaysProvided,
      });
    }

    if (this.state.slotCards.length==0  && errors.length==0 && step === 2) {
      errors.push({
        element: 'SlotCards',
        message: localizations.timeslot_noTimeSlotAdded,
      });
    }





    
    if (
      this.state.date &&
      this.state.ending_date &&
      fields.ending_date < fields.date &&
      step === 2
    ) {
      errors.push({
        element: 'Date',
        message: localizations.newSportunity_invalidHourRange,
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
          onCancel: () => { },
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
      return;
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
          secondaryOrganizerType: organizer.secondaryOrganizerType
            ? organizer.secondaryOrganizerType.id
            : null,
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

    if (
      value &&
      this.state.fields.invited_circles &&
      this.state.fields.invited_circles.length > 0
    ) {
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

    this.props.relay.refetch(
      fragmentVariables => ({
        ...fragmentVariables,
        queryDetails: true,
        filterName: {
          name:
            value.sport.sport.name[localizations.getLanguage().toUpperCase()],
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
        this.setState({ circleList: circleList, isLoadingCircles: false });
      },
    );

    if (value.address) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: value.address }, (results, status) => {
        if (status == google.maps.GeocoderStatus.OK) {
          var latitude = results[0].geometry.location.lat();
          var longitude = results[0].geometry.location.lng();
          this.setState({ position: { lat: latitude, lng: longitude } });
        }
      });
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
    console.log('_updateTextField', name, event);
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
  };

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
      } else {
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
        newList[index].participantByDefault = false;
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

  _handleDateChange = moment => {
    console.log('moment', moment);
    this.setState({
      date: moment,
    });
  };

  _handleEndingDateChange = moment => {
    this.setState({
      ending_date: moment,
    });
  };

  calculateSlots = () => {
    let availableTimeSlots = 0;
    const { weekDays, date, ending_date } = this.state;
    let beginning_date = date;

    const days = [
      'SUNDAY',
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THIRSDAY',
      'FRIDAY',
      'SATURDAY',
    ];

    for (
      var i = 0;
      i <=
      this.dateDiffInDays(new Date(beginning_date), new Date(ending_date));
      i++
    ) {
      let date = new Date(
        new Date(beginning_date).getTime() + i * 24 * 3600 * 1000,
      );
      if (weekDays.indexOf(days[date.getDay()]) >= 0) {
        availableTimeSlots = availableTimeSlots + 1;
      }
    }

    return availableTimeSlots;
  };

  dateDiffInDays = (a, b) => {
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
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
    geocoder.geocode({ address: label }, (results, status) => {
      if (status == google.maps.GeocoderStatus.OK) {
        var latitude = results[0].geometry.location.lat();
        var longitude = results[0].geometry.location.lng();
        this.setState({ position: { lat: latitude, lng: longitude } });
      }
    });
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

  _isValidHour = hour => {
    var time = /\d\d:\d\d/;
    if (!time.test(hour)) return false;

    if (
      hour.substr(0, hour.indexOf(':')) >= 24 ||
      hour.substr(0, hour.indexOf(':')) < 0
    )
      return false;
    if (
      hour.substr(hour.indexOf(':') + 1, hour.length) >= 60 ||
      hour.substr(hour.indexOf(':') + 1, hour.length) < 0
    )
      return false;

    return true;
  };

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
      function (res) {
        that.updateCard(cardRegistration, res.RegistrationData);
      },
      function (res) {
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
      } else {
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
          geocoder.geocode(
            {
              address:
                sportunity.address.address + ', ' + sportunity.address.city,
            },
            (results, status) => {
              if (status == google.maps.GeocoderStatus.OK) {
                var latitude = results[0].geometry.location.lat();
                var longitude = results[0].geometry.location.lng();
                this.setState({ position: { lat: latitude, lng: longitude } });
              }
            },
          );
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
    } else {
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
    if (
      '/new-sportunity' == this.props.location.pathname &&
      this.props.routeParams.sportunityId
    ) {
      this.props.relay.refetch({
        ...this.context.relay.variables,
        sportunityId: null,
      });

      this.setState(initialState);

      setTimeout(() => this.setState({ loading: false }), 1500);
    }

    if (
      this.props.viewer.me &&
      !isEqual(this.props.viewer.me, nextProps.viewer.me) &&
      this.state.fields.invited_circles_and_prices &&
      this.state.fields.invited_circles_and_prices.length > 0
    ) {
      this.state.fields.invited_circles_and_prices.forEach(
        (invitedCircle, index) => {
          let newIndex = nextProps.viewer.me.circles.edges.findIndex(
            circle => circle.node.id === invitedCircle.circle.id,
          );

          if (newIndex >= 0) {
            let newList =
              cloneDeep(this.state.fields.invited_circles_and_prices) || [];

            newList[index].circle =
              nextProps.viewer.me.circles.edges[newIndex].node;

            this.setState(prevState => ({
              ...prevState,
              fields: {
                ...prevState.fields,
                invited_circles_and_prices: newList,
              },
            }));
          }
        },
      );
    }

    if (
      this.props.userCurrency !== nextProps.userCurrency &&
      !this.props.routeParams.sportunityId
    ) {
      let newList =
        cloneDeep(this.state.fields.invited_circles_and_prices) || [];

      this.state.fields.invited_circles_and_prices.forEach(
        (invitedCircle, index) => {
          newList[index].price = {
            cents: newList[index].price.cents,
            currency: nextProps.userCurrency,
          };
        },
      );

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

    const { fields, slotCards, selectedVenues, selectedFields } = this.state;

    let finalSlot = [];
    let usersSlotIsFor = [];

    let venueIDs = [];
    let infrastructureIds = [];

    selectedVenues.map(function (venue) {
      venueIDs.push(venue.id);
    })

    selectedFields.map(function (fields) {
      infrastructureIds.push(fields.id);
    })


    slotCards.map((slots) => {
      finalSlot.push({
        beginning_date: slots.beginningDate,
        ending_date: slots.endingDate,
        beginning_hour: this.addHoursToCurrentTime(slots.beginningHour),
        ending_hour: this.addHoursToCurrentTime(slots.endingHour),
        weeklyDays: slots.weekDays
      })
    });

    fields.invited_circles_and_prices.map((circles) => {
      usersSlotIsFor.push({
        userId: circles.circle.owner.id,
        daysOfVisibility: circles.daysOfVisibility,
        notification_preference: circles.notification_preference,
        multiBookingLimit: parseInt(circles.multiBookingLimit),
      })
    });


    const timeslotPayload = {
      venueIds: venueIDs,
      infrastructureIds: infrastructureIds,
      price: fields.price,
      privacy: fields.private ? "PRIVATE" : "PUBLIC",
      privacy_switch_preference: {
        privacy_switch_type: fields.autoSwitchPrivacy ? "Automatically" : "Manually"
      },
      repetition: finalSlot,
      usersSlotIsFor: usersSlotIsFor,
    }

    console.log("final state", timeslotPayload);
    NewTimeslotMutation.commit(
      {
        viewer: this.props.viewer,
        timeslot: timeslotPayload,
        viewerID: this.props.viewer.id,
      },
      {
        onSuccess: () => {
          this.props.alert.show(
            this.state.fields.repeat && this.state.fields.repeat > 0
              ? localizations.popup_newSportunity_created_serie_success
              : localizations.popup_timeslot_created_success,
            {
              timeout: 2000,
              type: 'success',
            },
          );

          setTimeout(() => {
            let path = '/manage-venue';
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

  };

  handleNext = step => {
    console.log('handleNext steps', step);
    setTimeout(() => {
      this.setState({ errors: [] }, () => {
        const { selectedTab, errors } = this.state;
        let customErrors = this._validate(step);
        console.log("customErrors",customErrors);
        if (this.state.errors.length > 0 || customErrors.length > 0) {
          this.setState({
            finished: selectedTab >= 5,
            errors: [...errors, ...customErrors],
          });
        } else {
          this.setState({
            selectedTab: selectedTab + 1,
            finished: selectedTab >= 5,
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
        if (
          !this.state.isSurvey &&
          !this.state.fields.repeat &&
          typeof this.Schedule.AddTimeDropdown !== 'undefined'
        ) {
          // single
          this.Schedule.AddTimeDropdown._handleScheduleSubmit(null, true);
        } else if (
          this.state.fields.repeat &&
          !this.state.isSurvey &&
          typeof this.Schedule.AddTimeDropdown !== 'undefined'
        ) {
          // weekly
          this.Schedule.AddTimeDropdown._handleScheduleSubmit(null, true);
        } else if (
          !this.state.fields.repeat &&
          this.state.isSurvey &&
          typeof this.Schedule.AddSchedule !== 'undefined'
        ) {
          // poll
          this.Schedule.AddSchedule._handleScheduleSubmit(null, true);
        }
        return;
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
        } else {
          this.setState({
            selectedTab: value,
          });
        }
      } else {
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
          {step === 5
            ? this.state.isModifying
              ? this.state.isModifyingASerie
                ? localizations.newSportunity_modify_serie
                : localizations.newSportunity_modify
              : this.state.fields.repeat > 0
                ? localizations.newSportunity_create_serie
                : localizations.newTimeslot_create
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

  _filterFiels = () => {
    const { viewer } = this.props;
    const { selectedVenues } = this.state;
    let infrastructures = [];
    viewer.me.venues.edges.map(function (venue) {
      let match = selectedVenues.find(a => a.id === venue.node.id);

      if (match) {
        infrastructures.push(...venue.node.infrastructures);
      }
    });
    return infrastructures;
  };

  render() {
    //console.log('render props', this.props.viewer);
    console.log('stat data', this.state);
    const {
      addtimeslotclicked,
      weekDays,
      all,
      venue1,
      venue2,
      venue3,
      allfields,
      field1,
      field2,
      field3,
      field4,
      MONDAY,
      TUESDAY,
      WEDNESDAY,
      THURSDAY,
      FRIDAY,
      SATURDAY,
      SUNDAY,
    } = this.state;
    if (this.state.loading) {
      return <Loading />;
    }
    const { viewer } = this.props;

    const errors = this.state.errors;

    const templateList = ['Single Dates', 'Weekly Repetition'];

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
                    {localizations.newSportunity_Venueandfieldselection}
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
                    {localizations.newSportunity_timeSlotSetup}
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
                    {localizations.newSportunity_distribution}
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
                    {localizations.newSportunity_access}
                  </MenuItem>
                  <MenuItem
                    style={
                      this.state.selectedTab == 5
                        ? { ...styles.menuStyles }
                        : { ...styles.inactiveMenuStyles }
                    }
                    onClick={this.activateTabPressed.bind(this, 5)}
                    value="6"
                  >
                    {localizations.newSportunity_price}
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
                          display: 'flex',
                          width: '100%',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <h1 style={styles.title}>
                          {localizations.newSportunity_Venueandfieldselection}
                        </h1>
                        <h3 style={styles.subtitle}>
                          {localizations.newSportunity_timeSlot_step.replace(
                            '{0}',
                            this.state.selectedTab,
                          )}
                        </h3>
                      </div>
                      {/* <div
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
                      </div> */}
                      <hr
                        style={{
                          marginBottom: 25,
                          marginLeft: -70,
                          marginRight: -70,
                        }}
                      />
                      <div
                        style={{
                          display: 'flex',
                          width: '100%',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                        <div style={styles.checkBoxContainer}>
                          <div style={styles.checkBoxHeader}>Venues</div>
                          <div style={styles.checkBoxContent}>
                            <FormGroup>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    onChange={this.handleVenueChange('all')}
                                    value="all"
                                  />
                                }
                                label="All"
                              />
                              {viewer.me.venues.edges.map((venue, index) => (
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={
                                        this.state.selectedVenues.findIndex(
                                          item => item.name == venue.node.name,
                                        ) >= 0
                                      }
                                      onChange={this.handleVenueChange(
                                        venue.node,
                                      )}
                                      value={venue.node.name}
                                    />
                                  }
                                  label={venue.node.name}
                                />
                              ))}
                            </FormGroup>                            
                          </div>                          
                        </div>
                        {this.state.errors.some(() => 'Venue')?<div style={styles.errMsgStyle}> {this.showErrorMessge('Venue')} </div>:null}
                        </div>
                        {this.state.showContainer2 ? (
                          <div>
                          <div style={styles.checkBoxContainer}>
                            <div style={styles.checkBoxHeader}>Fields</div>
                            <div style={styles.checkBoxContent}>
                              <FormGroup>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      onChange={this.handleFeildsChange(
                                        'allfields',
                                      )}
                                      value="allfields"
                                    />
                                  }
                                  label="All"
                                />

                                {this._filterFiels().map((field, index) => (
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={
                                          this.state.selectedFields.findIndex(
                                            item => item.id === field.id,
                                          ) >= 0
                                        }

                                        onChange={this.handleFeildsChange(
                                          field,
                                        )}
                                        value={field.name}
                                      />
                                    }
                                    label={field.name}
                                  />
                                ))}
                              </FormGroup>
                            </div>
                          </div>
                          {this.state.errors.some(() => 'Fields')?<div style={styles.errMsgStyle}> {this.showErrorMessge('Fields')} </div>:null}

                          </div>
                        ) : null}
                      </div>
                      <hr style={styles.hr} />
                      {this.renderStepActions(0)}
                    </div>
                  </Paper>
                )}
                {this.state.selectedTab === 2 && (
                  <div>
                    <Paper zDepth={4} style={{ padding: '8px 70px 1px' }}>
                      <div
                        style={{
                          display: 'flex',
                          width: '100%',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <h1 style={styles.title}>
                          {localizations.newSportunity_timeSlotSetup}
                          <span style={styles.helperText}>
                            {
                              localizations.newSportunity_timeSlotSetupHelpertext
                            }
                          </span>
                        </h1>
                        <h3 style={styles.subtitle}>
                          {localizations.newSportunity_timeSlot_step.replace(
                            '{0}',
                            this.state.selectedTab,
                          )}
                        </h3>
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
                        <SelectTemplate
                          style={styles.select}
                          label=""
                          list={templateList}
                          values={this.state.timeSlotType}
                          placeholder={
                            templateList === []
                              ? localizations.newSportunity_selectPlaceholder
                              : localizations.newSportunity_selectPlaceholder
                          }
                          onChange={item =>
                            this._hanldeTimeSlotType(item.value, item)
                          }
                          onEdit={this.onEdit}
                          disabled={templateList === []}
                          onRemove={this.removeTemplate}
                        />
                        {this.state.errors.some(() => 'SlotType')?<div style={styles.errMsgStyle}> {this.showErrorMessge('SlotType')} </div>:null}
                        <div style={styles.timeformat}>
                          <span>Duration of Timeslot:</span>
                          <div style={styles.timeformatinput}>
                            <Input
                              label="h"
                              disabled={false}
                              onChange={this._handleTimeSlotInputChange.bind(
                                this,
                                'hour',
                              )}
                              placeholder=""
                              required={true}
                              value={this.state.hour}
                              className="timeformatinput"
                            />
                            <Input
                              label="min"
                              disabled={false}
                              onChange={this._handleTimeSlotInputChange.bind(
                                this,
                                'min',
                              )}
                              placeholder=""
                              required={true}
                              value={this.state.min}
                              className="timeformatinput"
                            />
                          </div>
                        </div>
                        {this.state.errors.some(() => 'HourMin')?<div style={styles.errMsgStyle}> {this.showErrorMessge('HourMin')} </div>:null}

                      </div>
                      <hr style={styles.hr} />

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
                          circleOfOpponents={
                            this.state.fields.circleOfOpponents
                          }
                          selectedOpponent={this.state.fields.opponent}
                          viewer={viewer}
                          isOpenMatch={this.state.fields.isOpenMatch}
                          circleList={this.state.circleList}
                          label={localizations.myOpponentPropose}
                          value={this.state.fields.circleOfOpponents}
                          error={this.state.errors.some(() => 'Address')}
                          renderStepActions={this.renderStepActions(1)}
                          onChangeCircle={this._updateCircleOpponentField.bind(
                            this,
                          )}
                          onChange={this._updateOpponentField.bind(this)}
                          isLoadingCircles={this.state.isLoadingCircles}
                        />
                      )}
                  </div>
                )}
                {this.state.selectedTab === 3 && (
                  <Paper zDepth={4} style={{ padding: '8px 70px 1px' }}>
                    <div
                      style={{
                        display: 'flex',
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <h1 style={styles.title}>
                        {localizations.newSportunity_distribution}
                        <span style={styles.helperText}>
                          {localizations.newSportunity_distributionHelpertText}
                        </span>
                      </h1>
                      <h3 style={styles.subtitle}>
                        {localizations.newSportunity_timeSlot_step.replace(
                          '{0}',
                          this.state.selectedTab,
                        )}
                      </h3>
                    </div>
                    <hr
                      style={{
                        marginBottom: 25,
                        marginLeft: -70,
                        marginRight: -70,
                      }}
                    />
                    {addtimeslotclicked ? (
                      <React.Fragment>
                        
                          <div style={[styles.row, styles.showtimeslot]}>
                          {this.state.slotCards.map((item, index) => (
                            <div style={styles.card}>
                              <div style={styles.cardleft}>{index + 1}</div>
                              <div style={styles.cardright}>
                                <div style={styles.cardrightContent}>
                                  <p style={styles.weekdays}>{item.weekDays.map(day=>{

                                    return <span style={{display:'inline-flex'}}>{day},</span>
                                  })}</p>
                                  <p
                                    style={styles.cardmetatext1}
                                  >{`${item.beginningHour}  ${item.endingHour}`}</p>
                                  <p style={styles.cardmetatext2}>
                                    {`Period From ${item.beginningDate} to ${item.endingDate}`}{' '}
                                  </p>
                                </div>
                                <div style={styles.cardrightcontentside}>
                                  <p>{item.slots}</p>
                                  <p>Timeslot</p>
                                </div>
                              </div>
                              <span
                                style={styles.crosscard}
                                onClick={e => this._removeTimeSlot(index)}
                              >
                                X
                              </span>
                            </div>
                            ))}
                          </div>
                        

                        <hr
                          style={{
                            marginBottom: 25,
                            marginLeft: -70,
                            marginRight: -70,
                          }}
                        />
                      </React.Fragment>
                    ) : null}

                    <div style={styles.row}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>
                          {localizations.newSportunity_beginningHours}:
                        </label>
                        <input
                          type="text"
                          maxLength="5"
                          disabled={this.props.disabled}
                          value={this.state.beginningTime}
                          onChange={this._handleBeginningTimeChange}
                          style={{
                            width: 80,
                            marginRight: '25px',
                            textAlign: 'center',
                            backgroundColor: '#F2F2F2',
                            border: 'none',
                            height: '26px',
                            borderRadius: '3px',
                          }}
                          onBlur={this._handleBlurBeginningTime}
                          onKeyDown={e =>
                            this._handleKeyDown(e, 'beginning_time')
                          }
                        />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>
                          {localizations.newSportunity_endingHours}:
                        </label>
                        <input
                          type="text"
                          maxLength="5"
                          disabled={this.props.disabled}
                          value={this.state.endingTime}
                          onChange={this._handleEndingTimeChange}
                          style={{
                            width: 80,
                            textAlign: 'center',
                            backgroundColor: '#F2F2F2',
                            border: 'none',
                            height: '26px',
                            borderRadius: '3px',
                          }}
                          onKeyDown={e =>
                            this._handleKeyDown(e, 'ending_time')
                          }
                        />
                      </div>
                    </div>
                    {this.state.errors.some(() => 'Hours')?<div style={styles.errMsgStyle}> {this.showErrorMessge('Hours')} </div>:null}
                    <div style={styles.row}>
                      <Style
                        scopeSelector=".react-datepicker__input-container"
                        rules={{
                          input: {
                            background: '#eee',
                            border: '1px solid #eee',
                            height: '30px',
                            borderRadius: '2px',
                            width: '80px',
                          },
                        }}
                      />
                      <Style
                        scopeSelector=".datetime-day"
                        rules={{
                          display: 'flex',
                          alignItems: 'center',
                          marginRight: '3px',
                        }}
                      />
                      <Style
                        scopeSelector=".react-datepicker-popper"
                        rules={{
                          zIndex:'9'
                        }}
                      />
                      
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>
                          {localizations.newSportunity_beginningdate}
                        </label>
                        <div className="datetime-day">
                          <DatePicker
                            dateFormat="DD/MM/YYYY"
                            todayButton={localizations.newSportunity_today}
                            selected={this.state.date}
                            onChange={this._handleDateChange}
                            minDate={moment()}
                            locale={localizations.getLanguage().toLowerCase()}
                            popperPlacement="top-end"
                            nextMonthButtonLabel=""
                            previousMonthButtonLabel=""
                          />
                          <DateRangeIcon className={styles.datepickerIcon} />
                        </div>
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>
                          {localizations.newSportunity_endingdate}
                        </label>
                        <div className="datetime-day">
                          <DatePicker
                            dateFormat="DD/MM/YYYY"
                            todayButton={localizations.newSportunity_today}
                            selected={this.state.ending_date}
                            onChange={this._handleEndingDateChange}
                            minDate={this.state.date}
                            locale={localizations.getLanguage().toLowerCase()}
                            popperPlacement="top-end"
                            nextMonthButtonLabel=""
                            previousMonthButtonLabel=""
                          />
                          <DateRangeIcon className={styles.datepickerIcon} />
                        </div>
                      </div>
                    </div>
                    {this.state.errors.some(() => 'Date')?<div style={styles.errMsgStyle}> {this.showErrorMessge('Date')} </div>:null}
                    <div style={[styles.row, styles.selectDays]}>
                      <Style
                        scopeSelector=".daysCheckboxContent"
                        rules={{
                          flexWrap: 'wrap',
                          label: {
                            background: '#ccc',
                            border: '1px solid #ccc',
                            borderRadius: '100% ',
                            width: '45px',
                            height: '45px',
                          },
                          svg: {
                            fill: 'transparent',
                          },
                        }}
                      />
                      <Style
                        scopeSelector=".active"
                        rules={{
                          'span:nth-child(2)': {
                            color: '#5EA1D9 !important',
                          },
                        }}
                      />

                      <Style
                        scopeSelector=".lbtxt"
                        rules={{
                          position: 'relative',
                          margin: '20px 45px 20px 0',
                          cursor: 'pointer',
                          span: {
                            'nth-child(2)': {
                              position: 'absolute',
                            },
                          },
                          'span:nth-child(2)': {
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50% , -50%)',
                            color: '#fff',
                            fontWeight: 'bold',
                            fontSize: '20px',
                          },
                        }}
                      />
                      <label>Select the days</label>
                      <div
                        style={styles.dayscheckBoxContent}
                        className="daysCheckboxContent"
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={MONDAY}
                              onChange={this.handledaysChange('MONDAY')}
                              value="MONDAY"
                            />
                          }
                          label="M"
                          className={MONDAY ? 'active lbtxt' : 'lbtxt'}
                          style={styles.checklabel}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={TUESDAY}
                              onChange={this.handledaysChange('TUESDAY')}
                              value="TUESDAY"
                            />
                          }
                          label="T"
                          className={TUESDAY ? 'active lbtxt' : 'lbtxt'}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={WEDNESDAY}
                              onChange={this.handledaysChange('WEDNESDAY')}
                              value="WEDNESDAY"
                            />
                          }
                          label="W"
                          className={WEDNESDAY ? 'active lbtxt' : 'lbtxt'}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={THURSDAY}
                              onChange={this.handledaysChange('THURSDAY')}
                              value="THURSDAY"
                            />
                          }
                          label="T"
                          className={THURSDAY ? 'active lbtxt' : 'lbtxt'}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={FRIDAY}
                              onChange={this.handledaysChange('FRIDAY')}
                              value="FRIDAY"
                            />
                          }
                          label="F"
                          className={FRIDAY ? 'active lbtxt' : 'lbtxt'}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={SATURDAY}
                              onChange={this.handledaysChange('SATURDAY')}
                              value="SATURDAY"
                            />
                          }
                          label="S"
                          className={SATURDAY ? 'active lbtxt' : 'lbtxt'}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={SUNDAY}
                              onChange={this.handledaysChange('SUNDAY')}
                              value="SUNDAY"
                            />
                          }
                          label="S"
                          className={SUNDAY ? 'active lbtxt' : 'lbtxt'}
                        />
                      </div>
                      {this.state.errors.some(() => 'WeekDays')?<div style={styles.errMsgStyle}> {this.showErrorMessge('WeekDays')} </div>:null}
                    </div>
                    {weekDays.length > 0 ? (
                      <div style={[styles.row, styles.addtimeslot]}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={this.showtimeslotcards}
                        >
                          Add this timeslot
                        </Button>
                        {this.state.errors.some(() => 'SlotCards')?<div style={styles.errMsgStyle}> {this.showErrorMessge('SlotCards')} </div>:null}
                      </div>
                    ) : null}
                    <hr style={styles.hr} />
                    {this.renderStepActions(2)}
                  </Paper>
                )}
                {this.state.selectedTab === 4 && (
                  <div>
                    <Paper zDepth={4} style={{ padding: '8px 70px 1px' }}>
                      <div
                        style={{
                          display: 'flex',
                          width: '100%',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <h1 style={styles.title}>
                          Access
                          <span style={styles.helperText}>
                            Manage who can book an access to your timeslot
                          </span>
                        </h1>
                        <h3 style={styles.subtitle}>
                          {localizations.newSportunity_timeSlot_step.replace(
                            '{0}',
                            this.state.selectedTab,
                          )}
                        </h3>
                      </div>
                      <hr
                        style={{
                          marginBottom: 25,
                          marginLeft: -70,
                          marginRight: -70,
                        }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <Privacy
                          privateChecked={this.state.fields.private}
                          me={this.props.viewer.me}
                          superMe={this.props.viewer.superMe}
                          autoSwitchPrivacyChecked={
                            this.state.fields.autoSwitchPrivacy
                          }
                          autoSwitchPrivacyXDaysBefore={
                            this.state.fields.autoSwitchPrivacyXDaysBefore
                          }
                          _handlePrivateChange={this._handlePrivateChange}
                          _handleAutoSwitchPrivacyChange={
                            this._handleAutoSwitchPrivacyChange
                          }
                          _handleAutoSwitchPrivacyXDaysBeforeChange={this._updateField.bind(
                            this,
                            'autoSwitchPrivacyXDaysBefore',
                          )}
                          error={this.state.errors.some(() => 'Privacy')}
                          errorMessage={this.showErrorMessge('Privacy')}
                          helperText="Anyone can see and book an access to your timeslot"
                        />
                      </div>
                    </Paper>

                    <Paper
                      zDepth={4}
                      style={{ padding: '8px 70px 1px', marginTop: 25 }}
                    >
                      <div>
                        <h1 style={styles.title}>
                          {localizations.newSportunity_invitedList_accessGroup}
                          <span style={styles.helperText}>
                            {
                              localizations.newSportunity_invitedList_accessGroupHelperttext
                            }
                          </span>
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
                            'MY_CIRCLES', 'CIRCLES_I_AM_IN', 'CHILDREN_CIRCLES', 'PUBLIC_CIRCLES'
                          ]}
                          userType={null}
                          queryCirclesOnOpen={true}
                          noNeedToValidate={true}
                          defaultCircleList={this.state.fields.invited_circles}
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
                          {localizations.newSportunity_accessPerson}
                          <span style={styles.helperText}>
                            {
                              localizations.newSportunity_accessPersonhelpertext
                            }
                          </span>
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
                          {localizations.newSportunity_accessDetails}
                        </h1>
                        <hr
                          style={{
                            marginBottom: 0,
                            marginLeft: -70,
                            marginRight: -70,
                          }}
                        />
                        <DetailsListTimeSlot
                          timeslot={true}
                          viewer={this.props.viewer}
                          invitedCircles={
                            this.state.fields.invited_circles_and_prices
                          }
                          list={this.state.fields.invited}
                          updateInvitedCircles={this._updateInvitedCircles}
                          onChangeCirclePrice={
                            this._handleChangeInvitedCirclePrice
                          }
                          onChangeCircleAutoParticipate={
                            this._handleChangeCircleAutoParticipate
                          }
                          onChangeUserAutoParticipate={
                            this._handleChangeUserAutoParticipate
                          }
                          onRemoveInvitee={this._deleteInvitee}
                          isModifying={this.state.isModifying}
                          isSurvey={this.state.isSurvey}
                          fields={this.state.fields}
                          _handleNotificationTypeChange={this._updateTextField.bind(
                            this,
                            'notificationType',
                          )}
                          _handleNotificationAutoXDaysBeforeChange={this._updateField.bind(
                            this,
                            'notificationAutoXDaysBefore',
                          )}
                          _handleChangeInvitedCircleVisibility={this._handleChangeInvitedCircleVisibility}
                          _handleChangeInvitedCirclemultiBooking={this._handleChangeInvitedCirclemultiBooking}
                          _handleChangeInvitedCircleNotificationPreference={this._handleChangeInvitedCircleNotificationPreference}

                        />
                        {this.renderStepActions(4)}
                      </div>
                    </Paper>
                  </div>
                )}
                {this.state.selectedTab === 5 && (
                  <div>
                    <Paper zDepth={4} style={{ padding: '8px 70px 1px' }}>
                      <div>
                        <h1 style={styles.title}>
                          {localizations.newSportunity_confirmation_popup_price}
                        </h1>
                        <h3 style={styles.subtitle}>
                          {localizations.newSportunity_timeSlot_step.replace(
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
                              onRef={node => { this.privatePriceInput = node; }}
                              onRefC={(i, node) => { this['privatePriceInput' + i] = node; }}
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
                        {this.renderStepActions(5, () =>
                          this.onConfirmLastStep(),
                        )}
                      </div>
                    </Paper>
                  </div>
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
)(Radium(NewTimeSlot));

const NewTimeSlotTemp = createRefetchContainer(
  withAlert(ReduxContainer),
  {
    // OK
    viewer: graphql`
      fragment NewTimeslot_viewer on Viewer
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
        ...DetailsListTimeSlot_viewer
        ...GroupList_viewer
        ...PersonList_viewer
        ...CircleList_viewer
        ...SearchModalTimeslot_viewer
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
          venues(last: 100) {
            edges {
              node {
                name
                id
                infrastructures {
                  id
                  name
                }
              }
            }
          }

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
          circlesFromClub(last: 20) {
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
    query NewTimeslotRefetchQuery(
      $sportsNb: Int
      $filterName: SportFilter
      $sportunityId: ID
      $superToken: String
      $querySuperMe: Boolean!
      $queryDetails: Boolean!
      $queryLanguage: SupportedLanguage
    ) {
      viewer {
        ...NewTimeslot_viewer
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
          query NewTimeslotQuery(
            $sportsNb: Int
            $filterName: SportFilter
            $sportunityId: ID
            $superToken: String
            $querySuperMe: Boolean!
            $queryDetails: Boolean!
            $queryLanguage: SupportedLanguage
          ) {
            viewer {
              ...NewTimeslot_viewer
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
          queryDetails: false,
        }}
        render={({ error, props }) => {
          if (props) {
            return (
              <NewTimeSlotTemp
                query={props}
                viewer={props.viewer}
                {...this.props}
              />
            );
          } else {
            return (
              <div>
                <Loading />
              </div>
            );
          }
        }}
      />
    );
  }
}

styles = {
  errMsgStyle: {
    color: colors.red,
    fontSize: 15,
  },
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
    marginTop: 15,
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
    paddingLeft: 3,
  },

  title: {
    marginBottom: 10,
    color: '#4E4E4E',
    fontFamily: 'Lato',
    margin: '10px 0',
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
    margin: '0',
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
  checkBoxContainer: {
    width: '190px',
    display: 'inline-flex',
    flexDirection: 'column',
    border: '1px solid #ccc',
    marginBottom: '25px',
    marginRight: '25px',
  },
  checkBoxHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    backgroundColor: '#5d9edf',
    fontSize: '15px',
    padding: '10px',
  },
  checkBoxContent: {
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '212px',
    overflow: 'auto',
  },
  helperText: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 'normal',
    marginTop: '5px',
  },
  timeformat: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    margin: '50px 0 20px',
  },
  timeformatinput: {
    marginLeft: '10px',
    display: 'flex',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    flexWrap:'wrap',

    marginBottom: 20,
  },
  inputGroup: {
    display: 'flex',
    alignItems: 'center',
  },
  label: {
    fontFamily: 'Lato',
    fontSize: '18px',
    //textAlign: 'right',
    lineHeight: 1,
    color: '#646464',
    display: 'block',
    marginRight: 20,

    flex: 1,
    width: '155px',
  },
  time: {
    width: '91px',
    height: '35px',
    backgroundColor: '#F2F2F2',
    //  border: '2px solid #5E9FDF',
    borderRadius: '3px',
    textAlign: 'center',

    color: 'rgba(146,146,146,0.87)',
  },
  datepickerIcon: {
    color: '#ccc',
  },
  selectDays: {
    alignItems: 'flex-start',
    flexDirection: 'column',
    marginTop: '30px',
  },
  dayscheckBoxContent: {
    display: 'flex',
    flexDirection: 'row',
  },
  checklabel: {
    ':before': {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(0% , -50%)',
    },
  },
  addtimeslot: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  showtimeslot: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap:'wrap'
  },
  cardrow:{
    flexWrap: 'wrap'
  },
  card: {
    display: 'inline-flex',
    width: '250px',
    position: 'relative',
    boxShadow:
      '0px 1px 3px 0px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)',
    marginRight: '20px',
    minHeight: '80px',
    marginBottom: '20px'
  },
  cardleft: {   
    fontSize: '20px',
    width: '50px',
    borderRight: '1px solid #ccc',
    alignItems: 'center',
    justifyContent: 'center',
    display:'inline-flex'
  },
  cardright: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    flex: '1',
    padding: '10px',
    width: 'calc(100% - 50px)',    
  },
  cardrightContent: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexDirection: 'column',
  },
  cardrightcontentside: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems:'center'

  },
  
  cardTitle: {
    color: '#5ea1d9',
    fontSize: '18px',
    marginBottom: '20px',
  },
  weekdays:{
wordBreak:'break-word',
fontSize:'12px',
minHeight: '50px'
  },
  cardmetatext1: {
    fontSize: '12px',
    color: '#ccc',
    marginBottom: '5px',
  },
  cardmetatext2: {
    color: '#000',
    fontSize: '12px',
    marginBottom: '5px',
  },
  crosscard: {
    position: 'absolute',
    right: '-12px',
    background: 'transparent',
    width: '25px',
    height: '25px',
    border: '1px solid #5ea1d9',
    borderRadius: '100%',
    top: '-10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#5ea1d9',
    cursor:'pointer'
  },
};
