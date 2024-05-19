import React, { Component } from 'react'
import { appStyles, colors } from '../../theme'

let styles;

class Inputs extends Component {

  _handleChangeEmail = event => {
    this.props.onChangeEmail(event.target.value);
  }
  
  render() {
    const { email } = this.props;
    
    return(
      <div style={styles.container}>
        <div style={styles.labelContainer}>
          <label style={styles.inputLabel}>Email :</label>
        </div>
        <input
              style={appStyles.input}
              type="text"
              value={email}
              onChange={this._handleChangeEmail}
              placeholder='johndoe@gmail.com'
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
