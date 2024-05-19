import React, { PureComponent } from 'react';
import ReactSelect from 'react-select';
import localizations from '../Localizations';

const TAB_KEY = 9;
const ENTER_KEY = 13;

export class StatusEditor extends PureComponent {
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
    const { cell } = this.props;
    let eventStatus = cell.value;
    if (cell.preSaveStatus) {
      eventStatus = cell.preSaveStatus;
    }
    let options = [];
    if (!cell.sportunityID) {
      // no id means this is new
      options = list.new;
    } else if (eventStatus.indexOf('Organized') > -1) {
      options = list.organized;
    } else if (eventStatus.indexOf('Cancelled') > -1) {
      options = list.cancelled;
    }
    return (
      <ReactSelect
        autoFocus
        openOnFocus
        defaultMenuIsOpen
        options={options}
        components={{ Control: () => null }}
        onChange={this.handleChange}
        onInputKeyDown={this.handleKeyDown}
      />
    );
  }
}

const list = {
  new: [{ label: localizations.status_organized, value: 'Organized' }],
  organized: [
    { label: localizations.status_organized, value: 'Organized' },
    { label: localizations.status_cancelled, value: 'Cancelled' },
    { label: localizations.status_deleted, value: 'Deleted' },
  ],
  cancelled: [{ label: localizations.status_deleted, value: 'Deleted' }],
};
