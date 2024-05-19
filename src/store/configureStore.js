import { createHistoryEnhancer } from 'farce';
import createMatchEnhancer from 'found/lib/createMatchEnhancer';
import foundReducer from 'found/lib/foundReducer';
import Matcher from 'found/lib/Matcher';
import { combineReducers, compose, createStore } from 'redux';


import registerReducer from '../reducer/registerReducer';
import loginReducer from '../reducer/loginReducer';
import profileReducer from '../reducer/profileReducer';
import sportunitySearchReducer from '../reducer/sportunitySearchReducer';
import myEventFilterReducer from '../reducer/myEventFilterReducer';
import myCircleFilterReducer from '../reducer/myCircleFilterReducer';
import venueReducer from '../reducer/venueReducer';
import facilityReducer from '../reducer/facilityReducer';
import globalReducer from '../reducer/globalReducer';
import tutorialReducer from '../reducer/tutorialReducer';
import compositionReducer from "../reducer/compositionReducer";
import createInfraReducer from '../reducer/createInfraReducer'

import reducer from '../reducer';
import { routeConfig, historyMiddlewares } from '../router';

export default function configureStore(historyProtocol, preloadedState) {
  return createStore(
    combineReducers({
      found: foundReducer,
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
    }),
    preloadedState,
    compose(
      createHistoryEnhancer({
        protocol: historyProtocol,
        middlewares: historyMiddlewares,
      }),
      createMatchEnhancer(new Matcher(routeConfig)),
    ),
  );
}
