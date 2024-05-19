import * as types from '../actions/actionTypes.js';

const defaultState = {
  venueId: '',
	venue: {},
  facilities: [],
  facilityName: '',
	facilityId: '',
  photo: '',
  sports:[],
  slots:[],
  authorizedManagers:[],
	nextSlotId: 0,
  nextSportId: 0,
  nextAuthorizedManagersId: 0,
};

export default function(state = defaultState, action) {
  switch (action.type) {
    case types.FACILITY_SET_VENUE_ID:
      return {
        ...state,
        venueId: action.venueId,
      };
		case types.FACILITY_SET_VENUE:
      return {
        ...state,
        venue: action.venue,
      };
    case types.FACILITY_SET_FACILITIES:
			return {
        ...state,
        facilites: action.facilities,
      };
    case types.FACILITY_SET_PHOTO:
			return {
        ...state,
        photo: action.photo,
      };
		case types.FACILITY_SET_FACILITY_ID:
      return {
        ...state,
        facilityId: action.facilityId,
      };
		case types.FACILITY_UPDATE_FACILITY_NAME:
      return {
        ...state,
        facilityName: action.facilityName,
      };
    case types.FACILITY_ADD_SPORT:
      console.log('FACILITY_ADD_SPORT');
      return {
        ...state,
        sports: [...state.sports, { ...action.sport, id: state.nextSportId++ }],
      };
    case types.FACILITY_ADD_SLOT:
      return { 
        ...state,
        slots: [...state.slots, { ...action.slot, id: state.nextSlotId++ }],
      };
    case types.FACILITY_ADD_AUTHORIZED_MANAGERS:
      console.log('FACILITY_ADD_AUTHORIZED_MANAGERS');
      return {
        ...state,
        authorizedManagers: [...state.authorizedManagers, { ...action.authorizedManager, id: state.nextAuthorizedManagersId++ }],
      };
		case types.FACILITY_DELETE_SPORT:
		  console.log('FACILITY_DELETE_SPORT');
			return {
        ...state,
        sports: state.sports.filter((s) => s.node.id !== action.sportId),
      };
    case types.FACILITY_DELETE_SLOT:
			console.log('FACILITY_DELETE_SLOT')
      console.log(action.slotId)
      return {
        ...state,
        slots: state.slots.filter((s) => s.id !== action.slotId),
			};
    case types.FACILITY_DELETE_AUTHORIZED_MANAGERS:
      console.log('FACILITY_DELETE_AUTHORIZED_MANAGERS', state.authorizedManagers.filter((s) => s.user !== action.authorizedManager.user && s.circle !== action.authorizedManager.circle), state.authorizedManagers);
      return {
        ...state,
        authorizedManagers: state.authorizedManagers.filter((s) => s.user !== action.authorizedManager.user || s.circle !== action.authorizedManager.circle),
      };
    case types.FACILITY_ADD_FACILITY:
      return {
        ...state,
        facilities: [...state.facilities, action.facility],
      };
		case types.FACILITY_RESET_FACILITY:
			return {
				...state,
				facilityName: '',
				facilityId: '',
				sports:[],
				slots:[],
        photo: '',
        authorizedManagers:[]
			}
		case types.FACILITY_SET_FACILITY:
			return {
				...state,
				facilityName: action.facilityName,
				facilityId: action.facilityId,
				sports:action.sports,
				slots:action.slots,
        photo: action.photo,
        authorizedManagers: action.authorizedManagers,
			}
    default: return state;
  }
}
