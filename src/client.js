import { BrowserProtocol } from 'farce';
import createConnectedRouter from 'found/lib/createConnectedRouter';
import getStoreRenderArgs from 'found/lib/getStoreRenderArgs';
import AlertTemplate from './components/common/Alert';
// import resolver from 'found/lib/resolver';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Resolver } from 'found-relay';
import { Provider as AlertProvider } from 'react-alert';
import configureStore from './store/configureStore';
import createRelayEnvironment, {initNetworkLayer} from './createRelayEnvironment';
import { render } from './router';
import App from './components/App'

const store = configureStore(
  new BrowserProtocol(),
  window.__PRELOADED_STATE__, // eslint-disable-line no-underscore-dangle
);
const matchContext = { store };
const ConnectedRouter = createConnectedRouter({ render });

(async () => {
  const resolver = new Resolver(
    createRelayEnvironment,
  );
  initNetworkLayer(localStorage.getItem('token'))
  const initialRenderArgs = await getStoreRenderArgs({
    store,
    matchContext,
    resolver,
  });
  const renderMethod = module.hot ? ReactDOM.render : ReactDOM.hydrate;
  renderMethod(
    <Provider store={store}>
      <AlertProvider template={AlertTemplate} >
        <App>
          <ConnectedRouter
            matchContext={matchContext}
            resolver={resolver}
            initialRenderArgs={initialRenderArgs}
          />
        </App>
      </AlertProvider>
    </Provider>,
    document.getElementById('root'),
  );
})();
