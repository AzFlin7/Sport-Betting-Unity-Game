import * as types from '../actions/actionTypes.js';

const defaultState = {
  language: 'en',
  isWebSiteOpened: false,
  userCountry: 'CH',
  userCurrency: 'CHF',
  userLocation: null,
  userCity: null
};


export default function(state = defaultState, action) {
  switch (action.type) {
    case types.GLOBAL_SET_LANGUAGE:
      return {
        ...state,
        language: action.language,
      };
    case types.GLOBAL_SET_SITE_OPENED:
      return {
        ...state,
        isWebSiteOpened: action.value,
      };
    case types.GLOBAL_SET_USER_COUNTRY: 
      return {
        ...state,
        userCountry: action.value
      }
    case types.GLOBAL_SET_USER_CURRENCY: 
      return {
        ...state, 
        userCurrency: action.value
      }
    case types.GLOBAL_SET_USER_LOCATION: 
      return {
        ...state,
        userLocation: action.value
      }
    case types.GLOBAL_SET_USER_CITY: 
      return {
        ...state,
        userCity: action.value
      }
    default: return state;
  }
}
