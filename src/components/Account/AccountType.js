import React, { Component } from 'react';

class ContactInfo extends Component {
  render () {
    return (
      <div>
        <h3>Account <span>(private)</span></h3>
        <p>Email</p>
        <input type="email" placeholder="johndoe@gmail.com" />
      </div>
    );
  }
}

export default ContactInfo;

