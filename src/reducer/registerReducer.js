import * as types from '../actions/actionTypes.js';
import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';

const defaultState = {
  avatar: '',
  pseudo: '',
  email: '',
  password1: '',
  password2: '',
  phone: '',
  description: '',
  birthday: '',
  formattedBirthday: '',
  profileType: '',
  createProfileFrom: null,
  subAccounts: [],
  errorsPseudo: false,
  errorEmail: false,
  subAccountCreation: false
};

/**
 * Reducer for handling Profile actions
 */
export default function(state = defaultState, action) {
  switch (action.type) {
    case types.UPDATE_REGISTER_RESET:
      return {
        ...defaultState,
      }
    case types.UPDATE_REGISTER_AVATAR:
      return {
        ...state,
        avatar: action.url,
      };
    case types.UPDATE_REGISTER_PSEUDO:
      return {
        ...state,
        pseudo: action.text,
      };

    case types.UPDATE_REGISTER_EMAIL:
      return {
        ...state,
        email: action.text,
      };
    case types.UPDATE_REGISTER_PASSWORD1:
      return {
        ...state,
        password1: action.text,
      };
    case types.UPDATE_REGISTER_PASSWORD2:
      return {
        ...state,
        password2: action.text,
      };

    case types.UPDATE_REGISTER_PHONE:
      return {
        ...state,
        phone: action.num,
      };

    case types.UPDATE_REGISTER_DESCRIPTION:
      return {
        ...state,
        description: action.text,
      };

    case types.UPDATE_REGISTER_BIRTHDAY:
      return {
        ...state,
        birthday: action.date,
        formattedBirthday: action.formattedDate,
      };

    case types.UPDATE_REGISTER_PROFILETYPE: 
      return {
        ...state,
        profileType: action.text
      };

    case types.UPDATE_REGISTER_FROM: 
      return {
        ...state, 
        createProfileFrom: action.text
      };
    case types.UPDATE_REGISTER_SUBACCOUNT_CREATION: 
      return {
        ...state,
        subAccountCreation: action.value
      };
    case types.ADD_REGISTER_SUBACCOUNTS:
      return merge(
        {},
        state,
        {
          subAccounts: [
            ...state.subAccounts,
            action.subAccount
          ]
        }
      );
    case types.UPDATE_REGISTER_SUBACCOUNTS:
	    const { subAccount, index } = action;
	    let newState = cloneDeep(state);
	    newState.subAccounts[index] = subAccount;
	    return newState;
	  case types.UPDATE_REGISTER_ERRORS_PSEUDO:
		  return {
			  ...state,
			  errorsPseudo: action.bool,
      };
    case types.UPDATE_REGISTER_ERRORS_EMAIL: 
      return {
        ...state,
        errorEmail: action.bool
      }

    default: return state;
  }
}
