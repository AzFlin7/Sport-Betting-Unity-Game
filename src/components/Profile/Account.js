import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PureComponent, { pure } from '../common/PureComponent'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as types from '../../actions/actionTypes.js';
// import 'react-select/dist/react-select.css';
import { appStyles, colors, metrics, fonts } from '../../theme';
let styles;

class Account extends PureComponent {

  _updateEmail = (e) => {
    this.props._updateEmailAction(e.target.value)
  }

  render() {

    const { email } = this.props;



    return (
      <div style={styles.container}>
        <h2 style={styles.h2}>Account</h2>

        <label style={appStyles.inputLabel}>
          Email:
          <input
            style={appStyles.input}
            type="text"
            placeholder={email}
            onChange={(e) => this._updateEmail(e)}

          />
        </label>

      </div>
    );
  }
}

Account.propTypes = {
  email: PropTypes.string.isRequired,
}

// REDUX

const _getInitialProfileDataAction = (text) => ({
  type: types.GET_INITIAL_PROFILE,
  text,
});

const _updateEmailAction = (text) => ({
  type: types.UPDATE_PROFILE_EMAIL,
  text,
});

const stateToProps = (state) => ({
  sex: state.profileReducer.sex,
})

const dispatchToProps = (dispatch) => ({
  _updateEmailAction: bindActionCreators(_updateEmailAction, dispatch),
  _getInitialProfileDataAction: bindActionCreators(_getInitialProfileDataAction, dispatch),
})

export default connect(
  stateToProps,
  dispatchToProps
)(Account);

styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '90%',
    marginBottom: 150,
  },
  h2: {
    fontSize: fonts.size.xl,
    color: colors.blue,
    fontWeight: fonts.size.xl,
    marginBottom: metrics.margin.medium,
  },
  selectContainer: {
    borderBottomWidth: metrics.border.small,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.blue,
    marginBottom: metrics.margin.large,
  },
  select: {
    border: 0,
    fontSize: fonts.size.medium,
    color: 'red',

  },
}
