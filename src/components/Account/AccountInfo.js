import React, { Component } from 'react';

import AccountType from './AccountType';
import ContactInfo from './ContactInfo';



class AccountInfo extends Component {
  render () {
    return (
      <div>
        <AccountType />
        <ContactInfo />
      </div>
    );
  }
}


export default AccountInfo;

