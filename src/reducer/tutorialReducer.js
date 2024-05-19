import * as types from '../actions/actionTypes.js';

const defaultState = {
  shownTutorial: [],
  currentlyDisplayedTutorial: null
};

/**
 * Reducer for handling Small Tutorial actions
 */
export default function(state = defaultState, action) {
  switch (action.type) {

    case types.UPDATE_SHOWN_TUTORIAL:
      return {
        ...state,
        shownTutorial: action.value,
      };

    case types.UPDATE_CURRENT_TUTORIAL: 
      return {
        ...state,
        currentlyDisplayedTutorial: action.value
      }

    default: return state;
  }
}
