import React, { PureComponent as ReactPureComponent } from 'react';
import { EventEmitter } from 'fbemitter';

const pureEmitter = new EventEmitter();
const FORCE_UPDATE_MSG = 'forceUpdate';

export const forceUpdate = arg => pureEmitter.emit(FORCE_UPDATE_MSG, arg);

export default class PureComponent extends ReactPureComponent {
  componentWillMount() {
    this._subscription = pureEmitter.addListener(
      FORCE_UPDATE_MSG,
      this._forceUpdate,
    );
  }

  componentWillUnmount() {
    if (this._subscription) {
      try {
        this._subscription.remove();
      } catch (e) {
        // error removing listener
      }
    }
  }

  _forceUpdate = pureProps => this.setState({ pureProps });
}

export const pure = Component =>
  class extends PureComponent {
    render() {
      return <Component {...this.props} />;
    }
  };
