import React from 'react';
import PureComponent from '../../common/PureComponent';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as types from '../../../actions/actionTypes';
import localizations from '../../Localizations';

class LoginFooter extends PureComponent {
  componentWillMount() {
    super.componentWillMount();

    fetch('https://ipapi.co/json')
      .then(res => res.json())
      .then(json => {
        if (!this.props.user) {
          this.props._updateUserCountry(json.country);
          this.props._updateUserCurrency(
            this.getCountryCurrency(json.country),
          );
        }
      });
  }

  getCountryCurrency = countryCode => {
    if (countryCode === 'CH') return 'CHF';
    else return 'EUR';
  };

  _changeLanguage = e => {
    localizations.setLanguage(e.target.value);
    this.setState({});
    this.props.onUpdateLanguage(e.target.value);
  };

  render() {
    return (
      <div>
        <select
          onChange={this._changeLanguage}
          value={localizations.getLanguage()}
        >
          <option value="en">english</option>
          <option value="fr">français</option>
        </select>
      </div>
    );
  }
}

const _updateUserCountry = value => ({
  type: types.GLOBAL_SET_USER_COUNTRY,
  value,
});
const _updateUserCurrency = value => ({
  type: types.GLOBAL_SET_USER_CURRENCY,
  value,
});

const dispatchToProps = dispatch => ({
  _updateUserCountry: bindActionCreators(_updateUserCountry, dispatch),
  _updateUserCurrency: bindActionCreators(_updateUserCurrency, dispatch),
});

const stateToProps = state => ({
  userCountry: state.globalReducer.userCountry,
  userCurrency: state.globalReducer.userCurrency,
  userLocation: state.globalReducer.userLocation,
});

const ReduxContainer = connect(
  stateToProps,
  dispatchToProps,
)(LoginFooter);

export default ReduxContainer;
