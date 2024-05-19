import * as types from '../actions/actionTypes.js';

const defaultState = {
  sportunityID: null,
  nextToSportunity: false
};

/**
 * Reducer for handling Small Tutorial actions
 */
export default function(state = defaultState, action) {
  switch (action.type) {

    case types.UPDATE_SPORTUNITY_ID:
      return {
        ...state,
	      sportunityID: action.value,
      };

    case types.UPDATE_NEXT_TO_SPORTUNITY:
      return {
        ...state,
	      nextToSportunity: action.value
      }

    default: return state;
  }
}
