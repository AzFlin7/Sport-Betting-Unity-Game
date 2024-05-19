import React, { PureComponent } from 'react';

const TAB_KEY = 9;
const ENTER_KEY = 13;

export class DescriptionEditor extends PureComponent {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this._input.focus();
  }

  handleChange(e) {
    if (e.which === ENTER_KEY) {
      e.preventDefault();
    } else {
      this.props.onChange(e.target.value);
    }
  }

  render() {
    const { value, onKeyDown } = this.props;
    return (
      <textarea
        rows={4}
        ref={input => {
          this._input = input;
        }}
        className="data-editor"
        value={value}
        onChange={this.handleChange}
        onKeyDown={onKeyDown}
        style={{ minWidth: this.props.width }}
      />
    );
  }
}
