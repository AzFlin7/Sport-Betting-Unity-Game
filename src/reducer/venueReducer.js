import * as types from '../actions/actionTypes.js';

const defaultState = {
  id: '',
  name: '',
  address: '',
  city: '',
  country: '',
};

export default function(state = defaultState, action) {
  switch (action.type) {
    case types.VENUE_UPDATE_NAME:
    
      return {
        ...state,
        name: action.name,
      };
    case types.VENUE_UPDATE_ADDRESS:
      return {
        ...state,
        address: action.address,
      };
    case types.VENUE_UPDATE_CITY:
      return {
        ...state,
        city: action.city,
      };
    case types.VENUE_UPDATE_COUNTRY:
      return {
        ...state,
        country: action.country,
      };
    case types.VENUE_RESET_FORM:
      return {
        ...state,
        id: '',
        name: '',
        address: '',
        city: '',
        country: '',
      };
    case types.VENUE_UPDATE_FORM:
    return {
        ...state,
        id: action.id,
        name: action.name,
        address: action.address,
        city: action.city,
        country: action.country,  
      }

    default: return state;
  }
}
