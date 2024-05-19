import React, { PureComponent } from 'react';
import ReactSelect from 'react-select';

const TAB_KEY = 9;
const ENTER_KEY = 13;

export class OrganizerEditor extends PureComponent {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.state = {};
  }

  handleChange(opt) {
    const { onCommit, onRevert } = this.props;
    if (!opt) {
      return onRevert();
    }
    const { e } = this.state;
    onCommit(opt.value, e);
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
    const options = this.props.accounts.map(i => ({
      label: i.pseudo,
      value: i.id,
    }));
    return (
      <ReactSelect
        autoFocus
        openOnFocus
        defaultMenuIsOpen
        value={this.props.value}
        onChange={this.handleChange}
        onInputKeyDown={this.handleKeyDown}
        options={options}
        components={{ Control: () => null }}
      />
    );
  }
}
