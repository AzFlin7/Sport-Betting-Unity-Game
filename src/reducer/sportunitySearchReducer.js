import * as types from '../actions/actionTypes.js';
import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';

const defaultState = {
  sportId: '',
  sportName: '',
  locationName: '',
  locationLat: '',
  locationLng: '',
  distanceRange: '',
  isFreeOnly: false,
  dateFrom: '',
  dateTo: '',
  hourFrom: '',
  hourTo: '',
  sexRestriction: '',
  ageRestriction: {
    from: 0,
    to: 100
  }
};

export default function(state = defaultState, action) {
  switch (action.type) {

    case types.UPDATE_SPORTUNITY_SEARCH_SPORT:
      return {
        ...state,
        sportId: action.sportId,
        sportName: action.sportName,
      };
		case types.UPDATE_SPORTUNITY_SEARCH_SPORT_NAME:
      return {
        ...state,
        sportName: action.sportName,
      };
    case types.UPDATE_SPORTUNITY_SEARCH_LOCATION:
      return {
        ...state,
        locationName: action.locationName,
        locationLat: action.locationLat,
        locationLng: action.locationLng,
      };
    case types.UPDATE_SPORTUNITY_SEARCH_DISTANCE_RANGE:
      return {
        ...state,
        distanceRange: action.distanceRange
      };
    case types.UPDATE_SPORTUNITY_SEARCH_FREE_ONLY:
      return {
        ...state,
        isFreeOnly: action.isFreeOnly,
      };

    case types.UPDATE_SPORTUNITY_SEARCH_DATE_FROM:
      return {
        ...state,
        dateFrom: action.dateFrom,
      };
    case types.UPDATE_SPORTUNITY_SEARCH_DATE_TO:
      return {
        ...state,
        dateTo: action.dateTo,
      };
    case types.UPDATE_SPORTUNITY_SEARCH_HOUR_FROM:
      return {
        ...state,
        hourFrom: action.hourFrom,
      };
    case types.UPDATE_SPORTUNITY_SEARCH_HOUR_TO:
      return {
        ...state,
        hourTo: action.hourTo,
      };
    case types.UPDATE_SPORTUNITY_SEARCH_SEX_RESTRICTION:
      return {
        ...state, 
        sexRestriction: action.sexRestriction
      }
    case types.UPDATE_SPORTUNITY_SEARCH_AGE_RESTRICTION:
      return {
        ...state, 
        ageRestriction: action.ageRestriction
      }

    default: return state;
  }
}

