import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import reducer from '../reducer';

function configureStore(initialState) {
  let enhancer;

  if (process.env.NODE_ENV !== 'production') {
    enhancer = compose(
      applyMiddleware(thunk),
      // typeof window.devToolsExtension === 'function' ? window.devToolsExtension() : f => f
    );
  } else {
    enhancer = applyMiddleware(thunk);
  }

  return createStore(reducer, initialState, enhancer);
}

const store = configureStore();

export default store;
