import { combineReducers } from 'redux';
import registerReducer from './registerReducer';
import loginReducer from './loginReducer';
import profileReducer from './profileReducer';
import sportunitySearchReducer from './sportunitySearchReducer';
import myEventFilterReducer from './myEventFilterReducer';
import myCircleFilterReducer from './myCircleFilterReducer';
import venueReducer from './venueReducer';
import facilityReducer from './facilityReducer';
import globalReducer from './globalReducer';
import tutorialReducer from './tutorialReducer';
import compositionReducer from "./compositionReducer";
import createInfraReducer from './createInfraReducer'


export default combineReducers({
  registerReducer,
  loginReducer,
  profileReducer,
  sportunitySearchReducer,
  myEventFilterReducer,
  myCircleFilterReducer,
  venueReducer,
  facilityReducer,
  globalReducer,
  tutorialReducer,
  compositionReducer,
	createInfraReducer
});
