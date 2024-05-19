import React, { Component } from 'react';
import PropTypes from 'prop-types';

function getDisplayName(WrappedComponent) {
  return `Geolocated(${WrappedComponent.displayName ||
    WrappedComponent.name ||
    'Component'})`;
}

const geolocated = ({
  positionOptions = {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: Infinity,
  },
  userDecisionTimeout = null,
  watchPosition = false,
  geolocationProvider = typeof navigator !== 'undefined' &&
    navigator.geolocation,
} = {}) => WrappedComponent => {
  let result = class Geolocated extends Component {
    constructor(props) {
      super(props);
      this.state = {
        coords: null,
        isGeolocationAvailable: Boolean(geolocationProvider),
        isGeolocationEnabled: true,
        positionError: null,
      };

      this.isCurrentlyMounted = false;
    }

    cancelUserDecisionTimeout = () => {
      if (this.userDecisionTimeoutId) {
        clearTimeout(this.userDecisionTimeoutId);
      }
    }

    onPositionError = (positionError) => {
      this.cancelUserDecisionTimeout();
      if (this.isCurrentlyMounted) {
        this.setState({
          coords: null,
          isGeolocationAvailable: this.state.isGeolocationAvailable,
          isGeolocationEnabled: false,
          positionError,
        });
      }
      if (this.props.onError) {
        this.props.onError(positionError);
      }
    }

    onPositionSuccess = (position) => {
      this.cancelUserDecisionTimeout();
      if (this.isCurrentlyMounted) {
        this.setState({
          coords: position.coords,
          isGeolocationAvailable: this.state.isGeolocationAvailable,
          isGeolocationEnabled: true,
          positionError: null,
        });
      }
      if (this.props.onSuccess) {
        this.props.onSuccess(position);
      }
    }

    getLocation = ({ onSuccess, onError }) => {
      if (
        !geolocationProvider ||
        !geolocationProvider.getCurrentPosition ||
        !geolocationProvider.watchPosition
      ) {
        throw new Error('The provided geolocation provider is invalid');
      }

      const funcPosition = (watchPosition
        ? geolocationProvider.watchPosition
        : geolocationProvider.getCurrentPosition
      ).bind(geolocationProvider);

      if (userDecisionTimeout) {
        this.userDecisionTimeoutId = setTimeout(() => {
          this.onPositionError();
          onError();
        }, userDecisionTimeout);
      }

      this.watchId = funcPosition(
        (position) => {
          this.onPositionSuccess(position);
          onSuccess(position.coords);
        },
        this.onPositionError,
        positionOptions,
      );
    }

    componentDidMount() {
      this.isCurrentlyMounted = true;
    }

    componentWillUnmount() {
      this.isCurrentlyMounted = false;
      this.cancelUserDecisionTimeout();
      if (watchPosition) {
        geolocationProvider.clearWatch(this.watchId);
      }
    }

    render() {
      return <WrappedComponent {...this.state} {...this.props} getLocation={this.getLocation} />;
    }
  };
  result.displayName = getDisplayName(WrappedComponent);
  result.propTypes = {
    onError: PropTypes.func,
    onSuccess: PropTypes.func,
  };
  return result;
};

export default geolocated;

export const geoPropTypes = {
  coords: PropTypes.shape({
    latitude: PropTypes.number,
    longitude: PropTypes.number,
    altitude: PropTypes.number,
    accuracy: PropTypes.number,
    altitudeAccuracy: PropTypes.number,
    heading: PropTypes.number,
    speed: PropTypes.number,
  }),
  isGeolocationAvailable: PropTypes.bool,
  isGeolocationEnabled: PropTypes.bool,
  positionError: PropTypes.shape({
    code: PropTypes.oneOf([1, 2, 3]),
    message: PropTypes.string,
  }),
  watchPosition: PropTypes.bool,
};
