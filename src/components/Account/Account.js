import React, { Component } from 'react';
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';

import AccountInfo from './AccountInfo';
import Payment from './Payment';

let styles;

class Account extends  Component {
  render () {
    return (
      <div style={styles.container} >
        <h2 style={styles.heading} >Account</h2>
        <div style={styles.subContainer} >
          <AccountInfo />
          <Payment />
        </div>
      </div>
    );
  }
}

export default createFragmentContainer(Account, {
  viewer: graphql`
    fragment Account_viewer on Viewer {
      id
    }
  `,
});

styles = {
  container: {
    width: '100%',
    height: '762px',
    backgroundColor: 'rgba(241, 233, 233, 0.380392)',
    border: '1px solid #979797',
    display: 'flex', 
  },
  heading: {
    width: '126px',
    marginTop: '3%',
    marginLeft: '3%',
    height: '41px',
    fontFamily: 'Lato',
    fontSize: '34px',
    fontWeight: 'bold',
    lineHeight: '41px',
    color: '#5E9FDF',
  },
  subContainer: {
      marginTop: '6%',
  },
}

