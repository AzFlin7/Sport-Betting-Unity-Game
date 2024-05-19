import React, { PureComponent } from 'react';
import SelectAsync from 'react-select/lib/Async';

const TAB_KEY = 9;
const ENTER_KEY = 13;

export class AddressEditor extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      address: this.props.value,
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.loadOptions = this.loadOptions.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  handleInputChange(address) {
    this.setState({ address });
  }

  loadOptions(_, callback) {
    const coder = new google.maps.Geocoder();
    coder.geocode({ address: this.state.address }, (results, status) => {
      if (results && results.length > 0) {
        const options = results.map(i => ({
          label: i.formatted_address,
          value: i.address_components,
        }));
        callback(options);
      }
    });
  }

  handleChange(opt) {
    const { onCommit, onRevert } = this.props;
    if (!opt) {
      return onRevert();
    }
    const { e } = this.state;
    let address, country, city, zip;
    opt.value.map(i => {
      if (i.types.indexOf('postal_code') > -1) {
        zip = i.long_name;
      }
      if (i.types.indexOf('locality') > -1) {
        city = i.long_name;
      }
      if (i.types.indexOf('country') > -1) {
        country = i.long_name;
      }
    });
    address = opt.label;
    onCommit({ address, country, city, zip }, e);
  }

  handleKeyDown(e) {
    // record last key pressed so we can handle enter
    if (e.which === ENTER_KEY || e.which === TAB_KEY) {
      e.persist();
      this.setState({ e });
    } else {
      this.setState({ e: null });
    }
  }

  render() {
    return (
      <SelectAsync
        autoFocus
        openOnFocus
        defaultMenuIsOpen
        loadOptions={this.loadOptions}
        onChange={this.handleChange}
        onInputChange={this.handleInputChange}
      />
    );
  }
}
