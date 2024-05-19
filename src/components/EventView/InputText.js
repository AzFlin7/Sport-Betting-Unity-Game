import React, { Component } from 'react';
import { appStyles, colors, fonts } from '../../theme';
import Radium from 'radium';

let styles;

class InputText extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    let { label, placeholder, isError, type = "text" } = this.props;

    return (
      <div style={{width: '100%'}}>
        <div style={appStyles.inputLabel}>{label}</div>
        {type === "text"
        ? <input
            style={styles.input}
            type="text"
            value={this.props.value}
            placeholder={placeholder}
            onChange={this.props.onChange}
            maxLength={this.props.maxLength}
            onClick={this.props.onClick}
            disabled={this.props.disabled}
            width="100%"
          />
        : <textarea
            style={styles.inputarea}
            value={this.props.value}
            placeholder={placeholder}
            onChange={this.props.onChange}
            maxLength={this.props.maxLength}
            onClick={this.props.onClick}
            disabled={this.props.disabled}
            width="100%"
          />
        }
      </div>
    );
  }
}

styles = {
  input: {
    borderWidth: 0,
    borderBottomWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.blue,
    height: '32px',
    lineHeight: '32px',
    fontFamily: 'Lato',
    color: 'rgba(0,0,0,0.65)',
    display: 'block',
    background: 'transparent',
    width: '100%',
    fontSize: fonts.size.xl,
    outline: 'none',
    ':disabled': {
      borderColor: colors.gray,
    },
  },
  inputarea: {
    borderWidth: 0,
    borderBottomWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.blue,
    minHeight: '200px',
    background: 'transparent',
    fontFamily: 'Lato',
    color: 'rgba(0,0,0,0.65)',
    display: 'block',
    width: '100%',
    fontSize: 16,
    outline: 'none',
    ':disabled': {
      borderColor: colors.gray,
    },
  }
};

export default Radium(InputText);
