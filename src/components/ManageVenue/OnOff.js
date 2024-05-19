import React from 'react';
import Radium from 'radium';

let styles;

class OnOff extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      checked: false,
    }
  }

  _handleChange = () => {
    const { checked, onChange } = this.props;
    if (typeof onChange === 'function') {
      onChange(!checked);
    }
  }

  render() {
    const { checked, containerStyle, trackStyle, knobStyle } = this.props;

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
      ...(checked ? styles.knobChecked : {}),
    };

    return (
      <div style={finalContainerStyle}>
        <div style={finalTrackStyle}/>
        <div tabIndex={0} style={finalKnobStyle} onClick={this._handleChange} />
      </div>
    );
  }
}


styles = {
  container: {
    position: 'relative',
    width: '34px',
    height: '14px',
    marginRight: '20px',
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
  },

  knobChecked: {
    left: 20,
  },
}


export default Radium(OnOff);
