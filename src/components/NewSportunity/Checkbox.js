import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import { fonts, colors } from '../../theme';


let styles;

export default class Checkbox extends PureComponent {

  state = {
    id: null,
  }

  componentWillMount() {
    super.componentWillMount()
    this.setState({
      id: Math.random().toString(36),
    })
  }

  render() {
    const { label, checked, style, onChange } = this.props;
    return (
      <div style={{ ...styles.container, ...style }}>
        <input style={styles.input} id={this.state.id} type="checkbox" checked={checked} onChange={onChange} />
          <label style={styles.checkbox} htmlFor={this.state.id}>
            {
              checked &&
                <i style={styles.check} className="fa fa-check" aria-hidden="true" />
            }
          </label>
        <label style={styles.label} htmlFor={this.state.id}>{label}</label>
      </div>
    );
  }

}



styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    fontSize: fonts.size.xl,
  },

  input: {
    display: 'none',
  },

  checkboxWrapper: {
    position: 'relative',
    flexShrink: 0,
    width: 18,
    height: 18,
  },

  checkbox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 10,

    width: 18,
    height: 18,
    borderStyle: 'solid',
    borderWidth: '2px',
    borderColor: colors.blue,
  },

  check: {
    left: '50%',
    top: '50%',

    // transform: 'translate(-50%, -50%)',

    color: colors.blue,
    fontSize: 12,
    lineHeight: 1,
  },

  label: {
    fontWeight: 500,
    fontFamily: 'Lato',
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.64)',
  },
};
