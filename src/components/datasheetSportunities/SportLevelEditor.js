import React, { PureComponent } from 'react';
import ReactSelect from 'react-select';
import localizations from '../Localizations';

const TAB_KEY = 9;
const ENTER_KEY = 13;

export class SportLevelEditor extends PureComponent {
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
    const LANG = localizations.getLanguage().toUpperCase();
    let options = [];
    this.props.list.map(i => {
      if (
        i &&
        i.node &&
        i.node.levels &&
        i.node.levels.length &&
        i.node.id &&
        this.props.cell &&
        this.props.cell.value &&
        this.props.cell.value.sport &&
        this.props.cell.value.sport.id &&
        i.node.id === this.props.cell.value.sport.id
      ) {
        options = i.node.levels.map(j => ({
          label: j[LANG] && j[LANG].name ? j[LANG].name : j.EN.name,
          value: j,
        }));
        options = options.sort(compare);
      }
    });
    return (
      <ReactSelect
        autoFocus
        openOnFocus
        defaultMenuIsOpen
        value={this.props.value}
        onChange={this.handleChange}
        onInputKeyDown={this.handleKeyDown}
        options={options}
      />
    );
  }
}

// for sorting
function compare(a, b) {
  if (a.value.EN.skillLevel < b.value.EN.skillLevel) return -1;
  if (a.value.EN.skillLevel > b.value.EN.skillLevel) return 1;
  return 0;
}
