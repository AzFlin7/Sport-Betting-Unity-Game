import * as types from '../actions/actionTypes.js';

import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';

const defaultState = {
  filter: ['Organized', 'Booked', 'Invited', 'CoOrganizer', 'AskedCoOrganizer', 'Cancelled'],
  userFilter: [],
  sportunityTypeFilter: [],
  organizersFilter: [],
  opponentsFilter: [],
  selectedFilters: [],
  selectedClubs: [],
  sportFilter: null,
  locationFilter: null,
  hasFilterChanged: false,
  dateFromFilter: null,
  dateToFilter: null
};

export default function(state = defaultState, action) {
  switch (action.type) {
    case types.UPDATE_MY_EVENT_FILTER:
      return {
        ...state,
        filter: action.value
      }
    
    case types.UPDATE_MY_EVENT_RESET_FILTER:
      return {
        ...defaultState,
      };

    case types.UPDATE_MY_EVENT_USER_FILTER: 
      return {
        ...state,
        userFilter: action.value
      }
    
    case types.UPDATE_MY_EVENT_SPORTUNITY_TYPE_FILTER: 
      return {
        ...state,
        sportunityTypeFilter: action.value
      }

    case types.UPDATE_MY_EVENT_SPORT_FILTER:
      return {
        ...state,
        sportFilter: action.value
      }

    case types.UPDATE_MY_EVENT_SPORT_LEVELS_FILTER: {
      if (action.value && action.value.length > 0)
        return {
          ...state,
          sportFilter: { ...state.sportFilter, level: action.value }
        }
      else if (state.sportFilter) {
        let {level, ...newSportFilter} = state.sportFilter
        return {
          ...state,
          sportFilter: { ...newSportFilter }
        }
      }
    }

    case types.UPDATE_MY_EVENT_DATE_FROM_FILTER: {
      return {
        ...state,
        dateFromFilter: action.dateFromFilter
      }
    }

    case types.UPDATE_MY_EVENT_DATE_TO_FILTER: {
      return {
        ...state,
        dateToFilter: action.dateToFilter
      }
    }

    case types.UPDATE_MY_EVENT_LOCATION_FILTER:
      return {
        ...state,
        locationFilter: action.value,
      }

    case types.UPDATE_MY_EVENT_ORGANIZERS_FILTER:
      return {
        ...state,
	      organizersFilter: action.value
      }

    case types.UPDATE_MY_EVENT_OPPONENTS_FILTER:
      return {
        ...state, 
        opponentsFilter: action.value
      }

    case types.UPDATE_MY_EVENT_FILTER_HAS_CHANGED: 
      return {
        ...state,
        hasFilterChanged: action.value
      }

    case types.UPDATE_MY_EVENT_SELECTED_FILTERS:
      return {
        ...state,
        selectedFilters: action.value
      }

    case types.UPDATE_MY_EVENT_SELECTED_CLUBS_ADD: {
      return merge(
        {}, 
        state, 
        {
          selectedClubs: [
            ...state.selectedClubs, 
            action.selectedClub
          ] 
        }
      );
    }
    case types.UPDATE_MY_EVENT_SELECTED_CLUBS_REMOVE: {
      const { unselectedClub } = action;
      let newState = cloneDeep(state);
      let optionIndex = newState.selectedClubs && newState.selectedClubs.findIndex(selectedClub => unselectedClub.id === selectedClub.id) ;    
      newState.selectedClubs.splice(optionIndex, 1);
      return newState
    }
    case types.UPDATE_MY_EVENT_SELECTED_CLUBS_CLEAR: {
      let newState = cloneDeep(state);
      newState.selectedClubs = [];
      return newState;
    }

    default: return state;
  }
}


