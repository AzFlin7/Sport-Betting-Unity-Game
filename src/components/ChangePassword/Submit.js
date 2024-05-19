import React, { Component } from 'react';
import Loading from 'react-loading';
import { colors, fonts } from '../../theme'

let styles;

export default class Submit extends Component {

  constructor() {
    super();
    this.state = {
      isLoading: false,
    }
  }

  _handleSubmitClick = () => {
    this.props.onSubmit();
  }

  render() {
    return(
      <div style={styles.container}>
        {
          this.state.isLoading === true &&
            <Loading type='spinningBubbles' color='#e3e3e3' />
        }
        <button onClick={this._handleSubmitClick} style={styles.button}>CONFIRM</button>
      </div>
    )
  }
}

// STYLES //

styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    height: 70,
    backgroundColor: '#32C760',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    borderRadius: '100px',
    width: '300px',
		display: 'inline-block',
    fontFamily: 'Lato',
    fontWeight: fonts.weight.medium,
    fontSize: '16px',
    textAlign: 'center',
    color: colors.white,
    borderWidth: 0,
    marginTop: 5,
    marginBottom: 5,
    cursor: 'pointer',
		lineHeight: '27px',
  },
}
