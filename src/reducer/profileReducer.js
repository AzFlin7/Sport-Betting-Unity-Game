import * as types from '../actions/actionTypes.js';

const defaultState = {
  avatar: '',
  firstName: '',
  lastName: '',
  username: '',
  description: '',
  sex: '',
  languageIds: [],
  sports: [],
  birthday: '',
  formattedBirthday: '',
  formattedAddress: '',
  email: '',
  hideMyAge: true,
  stepsCompleted: [false, false, false, false],
  tutorialSteps: {
    createFormStep: false,
    setupMembersSubscriptionStep: false,
    fulfilProfileStep: false,
    addOfficialDocumentsStep: false,
    createSubAccountStep: false,
    shareAccessStep: false,
    createCircleStep: false,
    organizeStep: false,
    setupStatisticsStep: false,
    joinAPrivateCircleStep: false,
    joinAPublicCircleStep: false,
    giveAvailabilitiesStep: false,
    bookSportunityStep: false
  },
  stepsPercentage: 0,
  nextStepToDo: '',
};

/**
 * Reducer for handling Profile actions
 */
export default function(state = defaultState, action) {
  // console.log(state)

  switch (action.type) {
    case types.UPDATE_PROFILE_AVATAR:
      return {
        ...state,
        avatar: action.text,
      };

    case types.UPDATE_PROFILE_FIRST_NAME:
      return {
        ...state,
        firstName: action.text,
      };
    case types.UPDATE_PROFILE_LAST_NAME:
      return {
        ...state,
        lastName: action.text,
      };
    case types.UPDATE_PROFILE_USERNAME:
      return {
        ...state,
        username: action.text,
      };
    case types.UPDATE_PROFILE_DESCRIPTION:
      return {
        ...state,
        description: action.text,
      };
    case types.UPDATE_PROFILE_SEX:
      return {
        ...state,
        sex: action.text,
      };
    case types.UPDATE_PROFILE_BIRTHDAY:
      return {
        ...state,
        birthday: action.date,
        formattedBirthday: action.formattedDate,
      };
    case types.UPDATE_PROFILE_LANGUAGES:
      return {
        ...state,
        languageIds: action.languageIds,
      };
    case types.UPDATE_PROFILE_ADDRESS:
      return {
        ...state,
        formattedAddress: action.item,
      };
    case types.UPDATE_PROFILE_PUBLIC_ADDRESS:
      return {
        ...state,
        publicAddress: action.item,
      };
    case types.UPDATE_PROFILE_EMAIL:
      return {
        ...state,
        email: action.text,
      };
    case types.UPDATE_PROFILE_HIDE_MY_AGE:
      return {
        ...state,
        hideMyAge: action.value
      }
    case types.GET_INITIAL_PROFILE:
      return {
        ...state,
        firstName: action.firstName,
        description: action.description,
        sex: action.sex,
      };
    case types.RESET_PROFILE_FORMS:
      return {
        ...state,
        //firstName: '',
        //description: '',
        //sex: '',
      };
    case types.UPDATE_STEPS_COMPLETED: {
      return {
        ...state,
        tutorialSteps: action.tutorialSteps
      };
    }
    case types.UPDATE_STEPS_PERCENTAGE: {
      return {
        ...state,
        stepsPercentage: action.stepsPercentage ? action.stepsPercentage : 0
      };
    }
    case types.UPDATE_NEXT_STEP_TO_DO: {
      return {
        ...state,
        nextStepToDo: action.nextStepToDo
      };
    }
    default: return state;
  }
}
