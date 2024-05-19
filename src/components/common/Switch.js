import React from 'react';
import Radium from 'radium';
import { colors } from '../../theme';

let styles;

class Switch extends React.PureComponent {

  _handleChange = () => {
    const { checked, onChange, disabled } = this.props;
    if (typeof onChange === 'function' && !disabled) {
      onChange(!checked);
    }
  }

  render() {
    const { checked, containerStyle, trackStyle, knobStyle, disabled } = this.props;

    const finalContainerStyle = {
      ...styles.container,
      ...containerStyle,
    };

    const finalTrackStyle = {
      ...styles.track,
      ...trackStyle,
    };

    const finalKnobStyle = {
      ...styles.knob,
      ...knobStyle,
      ...(checked ? disabled ? styles.knobCheckedDisabled : styles.knobChecked : {}),
    };

    return (
      <div style={finalContainerStyle} onClick={this._handleChange} >
        <div style={finalTrackStyle}/>
        <div tabIndex={0} style={finalKnobStyle} />
      </div>
    );
  }
}


styles = {
  container: {
    position: 'relative',
    width: '34px',
    height: '14px',
    cursor: 'pointer'
  },

  track: {
    width: 34,
    height: 14,
    borderRadius: '7px',
    backgroundColor: '#C5C4C4',
    opacity: '0.5',
  },

  knob: {
    position: 'absolute',
    left: 0,
    top: -3,
    width: 20,
    height: 20,
    borderRadius: '50%',
    backgroundColor: '#F1F1F1',
    boxShadow: '0 0 1px 0 rgba(0,0,0,0.12), 0 1px 1px 0 rgba(0,0,0,0.24)',
    transition: 'left 300ms',
    ':active': {
      outline: 'none'
    },
    ':focus': {
      outline: 'none'
    },
  },

  knobChecked: {
    left: 20,
    backgroundColor: colors.blue
  },
  knobCheckedDisabled: {
    left: 20,
    backgroundColor: '#F1F1F1'
  },
}


export default Radium(Switch);
