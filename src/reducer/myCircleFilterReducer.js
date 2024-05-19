import * as types from '../actions/actionTypes.js';

const defaultState = {
  filter: ['ADULTS'],
  sportFilter: [],
  locationFilter: null,
	typeFilter: [],
  userFilter: [],
  selectedFilters: [],
  nameCompletion: '',
  codeInput: null,
};

export default function(state = defaultState, action) {
  switch (action.type) {
    case types.UPDATE_MY_CIRCLE_FILTER:
      return {
        ...state,
        filter: action.value
      }
    
    case types.UPDATE_MY_CIRCLE_RESET_FILTER:
      return {
        ...defaultState,
      };

    case types.UPDATE_MY_CIRCLE_NAME_COMPLETION: {
      return {
        ...state, 
        nameCompletion: action.value
      }
    }

    case types.UPDATE_MY_CIRCLE_SEARCH_CODE: {
      return {
        ...state, 
        codeInput: action.value
      }
    }

    case types.UPDATE_MY_CIRCLE_SPORT_FILTER:
      return {
        ...state,
        sportFilter: action.value
      }
    
    case types.UPDATE_MY_CIRCLE_LOCATION_FILTER:
      return {
        ...state,
	      locationFilter: action.value
      }


	  case types.UPDATE_MY_CIRCLE_TYPE_FILTER:
		  return {
			  ...state,
			  typeFilter: action.value
		  }

	  case types.UPDATE_MY_CIRCLE_USER_FILTER:
		  return {
			  ...state,
			  userFilter: action.value
		  }

    case types.UPDATE_MY_CIRCLE_SELECTED_FILTERS:
      return {
        ...state,
        selectedFilters: action.value
      }

    default: return state;
  }
}


