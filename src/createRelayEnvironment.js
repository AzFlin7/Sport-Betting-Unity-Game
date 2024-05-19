import "isomorphic-fetch"

import RelayServerSSR from 'react-relay-network-modern-ssr/lib/server'
import RelayClientSSR from 'react-relay-network-modern-ssr/lib/client'

// import { Environment, Network, RecordSource, Store } from 'relay-runtime';
import Environment from 'relay-runtime/lib/RelayModernEnvironment'
import Network from 'relay-runtime/lib/RelayNetwork'
import RecordSource from 'relay-runtime/lib/RelayInMemoryRecordSource'
import Store from 'relay-runtime/lib/RelayMarkSweepStore'
import RelayQueryResponseCache from 'relay-runtime/lib/RelayQueryResponseCache';

import { backendUrlGraphql } from '../constants.json';
import NetworkLayer from './NetworkLayer'

const oneMinute = 60 * 1000;
const cache = new RelayQueryResponseCache({ size: 250, ttl: oneMinute });

let token ;
let subscriptionClient;
let id = 0;

export function initNetworkLayer(initToken) {
  subscriptionClient = new NetworkLayer(backendUrlGraphql, 
    initToken 
      ? {headers: {initToken}}
      : {}
  )
  if (initToken) 
    subscriptionClient.setToken(initToken)

  token = initToken
  cache.clear();
}

export function logout() {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem('token');
    localStorage.removeItem('superToken');
    localStorage.removeItem('userToken');
    initNetworkLayer()
  }
}

export function updateToken(token, login = false) {
  if (typeof localStorage !== "undefined") 
    localStorage.setItem('token', token);

  initNetworkLayer(token)
  if (login) {
    updateSuperToken(token)
    updateUserToken(token)
  }
}

export function updateSuperToken(token) {
  if (typeof localStorage !== "undefined") 
    localStorage.setItem('superToken', token);
}

export function updateUserToken(token) {
  if (typeof localStorage !== "undefined") 
    localStorage.setItem('userToken', token);
}

function fetchQuery(operation, variables, cacheConfig, uploadables = null) {
  const queryID = operation.text;
  const isMutation = operation.operationKind === 'mutation';
  const isQuery = operation.operationKind === 'query';
  const forceFetch = cacheConfig && cacheConfig.force;

  // Try to get data from cache on queries
  const fromCache = cache.get(queryID, variables);
  if (isQuery && fromCache !== null && !forceFetch && !uploadables) {
    return fromCache;
  }

  const request = {
    method: 'POST',
    headers: {
      token: token || ''  
    },
  };

  if (uploadables) {
      if (!window.FormData) {
          throw new Error('Uploading files without `FormData` not supported.');
      }

      const formData = new FormData();
      formData.append('query', operation.text);
      formData.append('variables', JSON.stringify(variables));

      Object.keys(uploadables).forEach(key => {
          if (Object.prototype.hasOwnProperty.call(uploadables, key)) {
              formData.append(key, uploadables[key]);
          }
      });
      request.body = formData;
  } 
  else {
      request.headers['Content-Type'] = 'application/json';
      request.body = JSON.stringify({
        query: operation.text,
        variables,
      })
  }

  // Otherwise, fetch data from server
  return fetch(backendUrlGraphql, request)
    .then(response => response.json())
    .then(json => {
        // console.log("operation", operation);
        // console.log("variables", variables);
        // console.log("result", json);
      // Update cache on queries
      if (isQuery && json) {
        cache.set(queryID, variables, json);
      }
      // Clear cache on mutations
      if (isMutation) {
        cache.clear();
      }

      return json;
    });
}

const setupSubscription = (config, variables, cacheConfig, observer) => {
  const query = config.text

  const onNext = (result) => {
    observer.onNext(result)
  }

  const onError = (error) => {
    observer.onError(error)
  }

  const onCompleted = () => {
    observer.onCompleted()
  }
  let client = {
    dispose: () => {}
  }
  if (subscriptionClient)
     client = subscriptionClient.sendSubscription(id, {query, variables, onNext, onError, onCompleted});
  id++
  return client; 
  //client.dispose()
}

const isServer = typeof window === 'undefined'

const relaySSRMiddleware = isServer
  ? new RelayServerSSR()
  : new RelayClientSSR({lookup: false})
  

const environment = new Environment({
  network: Network.create(fetchQuery, setupSubscription),
  store: new Store(new RecordSource()),
});

environment.relaySSRMiddleware = relaySSRMiddleware
environment.cache = cache;

export default environment;
