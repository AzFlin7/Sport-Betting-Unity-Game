import React, { Component } from 'react';

class ContactInfo extends Component {
  render () {
    return (
      <div>

        <h3>Contact Information <span>(private)</span></h3>
        {/* these <p>'s toggle to <input> */}
        <div>
          <span>Phone</span>
          <p>0102030405</p>  
        </div>

        <div>
          <span>Address</span>
          <p>03 Florida Radial Suite 203</p>  
        </div>

        <div>
          <span>City</span>
          <p>Paris</p>  
        </div>

        <div>
          <span>Country</span>
          <p>France</p>  
        </div>

      </div>
    );
  }
}

export default ContactInfo;

