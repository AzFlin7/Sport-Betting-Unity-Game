import * as types from '../actions/actionTypes.js';

const defaultState = {
  userPositions: [],
	fieldElement: null
};


export default function(state = defaultState, action) {
  switch (action.type) {
    case types.COMPOSITION_UPDATE_POSITION_ADD:
      console.log(action)
      return {
        ...state,
	      userPositions: [
          ...state.userPositions,
	        action.value
        ],
      };
    case types.COMPOSITION_UPDATE_POSITION_UPDATE:
      console.log(action)
      return {
        ...state,
	      userPositions: [
          ...state.userPositions.slice(0, action.index),
	        action.value,
          ...state.userPositions.slice(action.index + 1),
          ]
      };
    case types.COMPOSITION_UPDATE_POSITION_CLEAR:
      console.log(action)
      return {
        ...state,
	      userPositions: []
      };
    case types.COMPOSITION_UPDATE_POSITION_REMOVE:
      console.log(action)
      let valueReturn = state.userPositions.length > 1 ? {
		      ...state,
		      userPositions: [
			      ...state.userPositions.slice(0, action.index),
			      ...state.userPositions.slice(action.index + 1)
		      ]
	      }
	      : {
		      ...state,
		      userPositions: []
	      };
      return valueReturn
    case types.COMPOSITION_UPDATE_ELEMENT:
      console.log(action)
      return {
        ...state,
	      fieldElement: action.value,
      };
    default: return state;
  }
}
