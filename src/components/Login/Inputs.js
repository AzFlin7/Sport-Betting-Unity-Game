import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as types from '../../actions/actionTypes.js';
import { appStyles, colors } from '../../theme';
import { Link } from 'found';
import localizations from '../Localizations'

let styles;

class Inputs extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    const { pseudo, password, _updatePseudoAction, _updatePasswordAction } = this.props;

    const _updatePseudo = (e) => {
      _updatePseudoAction(e.target.value);
    }

    const _updatePassword = (e) => {
      _updatePasswordAction(e.target.value);
    }
 
  return(
    <div style={styles.container}>
      <div style={styles.labelContainer}>
        <label style={styles.inputLabel}>{localizations.login_username}:</label>
      </div>
      <input
            style={appStyles.input}
            type="text"
            value={pseudo}
            onChange={_updatePseudo}
            placeholder={localizations.login_username_holder}
            tabIndex="1"
          />
      <div style={styles.labelContainer}>
        <label style={styles.inputLabel}>{localizations.login_password}:</label>
        <Link to='/resetpassword' style={styles.rightLabel}>{localizations.login_forgotPassword}</Link>
      </div>
      <input
          style={appStyles.input}
          type="password"
          value={password}
          onChange={_updatePassword}
          placeholder={localizations.login_password_holder}
          tabIndex="2"
        />
    </div>
    )
  }
}

const _updatePseudoAction = (text) => ({
  type: types.UPDATE_LOGIN_PSEUDO,
  text,
})

const _updatePasswordAction = (text) => ({
  type: types.UPDATE_LOGIN_PASSWORD,
  text,
})

const stateToProps = (state) => ({
  pseudo: state.loginReducer.pseudo,
  password: state.loginReducer.password,

})

const dispatchToProps = (dispatch) => ({
  _updatePseudoAction: bindActionCreators(_updatePseudoAction, dispatch),
  _updatePasswordAction: bindActionCreators(_updatePasswordAction, dispatch),
})

export default connect(
  stateToProps,
  dispatchToProps
)(Inputs);

// STYLES //

styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  labelContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 5,
    marginBottom: 10,
    width: '100%'
  },
  inputLabel: {
    color: colors.blueLight,
    fontSize: '16px',
    fontFamily: 'Lato',
    flex: '2 0 0',
    marginBottom: 12,
  },
  rightLabel: {
    display: 'flex',
    flex: '1 0 0',
    justifyContent: 'flex-end',
    textTransform: 'none',
    textDecoration: 'none',
    color: colors.gray,
    fontSize: 14,
    width: '100%'
  },
}
