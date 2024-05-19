import * as types from '../actions/actionTypes.js';

const defaultState = {
  pseudo: '',
  password: '',
  isEmailValidated: true,
  isProfileFromLogin: false,
  loggedInFromPage: ''
};

/**
 * Reducer for handling Profile actions
 */
export default function(state = defaultState, action) {
  switch (action.type) {

    case types.UPDATE_LOGIN_PSEUDO:
      return {
        ...state,
        pseudo: action.text,
      };

    case types.UPDATE_LOGIN_PASSWORD:
      return {
        ...state,
        password: action.text,
      };
    
    case types.UPDATE_ISEMAILVALIDATED:
      return {
        ...state,
        isEmailValidated: action.text,
      }

    case types.UPDATE_IS_PROFILE_FROM_LOGIN:
      return {
        ...state,
        isProfileFromLogin: action.value,
      }
    
    case types.LOGGED_IN_FROM_PAGE:
      return {
        ...state,
        loggedInFromPage: action.value
      }

    case types.UPDATE_LOGIN_RESET:
      return {
        ...defaultState,
        loggedInFromPage: state.loggedInFromPage // KEEPING THIS 
      }

    default: return state;
  }
}
