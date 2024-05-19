import React, { Component } from 'react';
import { appStyles, colors } from '../../theme';

let styles;

class Inputs extends Component {

  _handleChangePass1 = event => {
    this.props.onChangePass1(event.target.value);
  }

  _handleChangePass2 = event => {
    this.props.onChangePass2(event.target.value);
  }
  
  render() {
    const { pass1, pass2 } = this.props;
    
    return(
      <div style={styles.container}>
        <div style={styles.labelContainer}>
          <label style={styles.inputLabel}>Password :</label>
        </div>
        <input
              style={appStyles.input}
              type="password"
              value={pass1}
              onChange={this._handleChangePass1}
              placeholder='6+ characters'
            />
        <div style={styles.labelContainer}>
          <label style={styles.inputLabel}>Please repeat the password :</label>
        </div>
        <input
              style={appStyles.input}
              type="password"
              value={pass2}
              onChange={this._handleChangePass2}
              placeholder='6+ characters'
            />
      </div>
    )
  }
}

export default Inputs ;

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
  },
  separator: {
    marginTop: '10px',
    marginBottom: '10px',
  },
}
