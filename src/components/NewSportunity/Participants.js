import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import Radium from 'radium';
import ToggleDisplay from 'react-toggle-display'
import Switch from '../common/Switch';

import Input from './Input';
import Dropdown from './Dropdown';
import localizations from '../Localizations';

import { colors } from '../../theme';

let styles;

class Participants extends PureComponent {
  state = {
    dropdownOpen: false,
    exactly: false,
    inValidPax: true,
    minNotReached: false,
    value: {from: 0, to: 0}
  }

  componentDidMount() {
    window.addEventListener('click', this._onClickOutside);
    if (this.props.value) {
      this.setState({value: this.props.value})
    }
  }

  componentWillUnmount() {
    window.removeEventListener('click', this._onClickOutside);
  }

  _onClickOutside = (event) => {
    const { dropdownOpen } = this.state;
    if (dropdownOpen) {
      if (!this._containerNode.contains(event.target)) {
        this._closeDropdown();
      }
    }
  }

  _openDropdown = () => {
    this.refs._inputNode._focus();
    this.setState({ dropdownOpen: true });
  }

  _closeDropdown = () => {
    this.setState({ inValidPax: this.props.value.to >= this.props.value.from}) ;
    if (!this.props.value.to && !this.props.value.from) 
      this.props.onChange({from: 1, to: 1})
    
    this.setState({ dropdownOpen: false });
    this.refs._inputNode._onBlur();
  }

  _toggleDropdown = () => {
    if (this.state.dropdownOpen) {
      this._closeDropdown();
    }
    else {
      this._openDropdown();
    }
  }

  _handleHideParticipantChange = checked => {
    const { onSwitchHideParticipantList } = this.props;

    if (typeof onSwitchHideParticipantList === 'function') {
      onSwitchHideParticipantList(checked);
    }
  } 

  _handleOrganizerIsParticipantChange = checked => {
    const { onSwitchOrganizerIsParticipant } = this.props;

    if (typeof onSwitchOrganizerIsParticipant === 'function') {
      onSwitchOrganizerIsParticipant(checked);
    }
  }

  _handleChange = (field, event) => {
    const { value, onChange } = this.props;
    const { exactly } = this.state;

    const newValue = {
      ...value,
      [field]: Number(event.target.value),
    };

    const newState = {
      ...this.state.value,
      [field]: Number(event.target.value),
    };
    this.setState({value: newState})

    if (exactly) { newValue.from = newValue.to = Number(event.target.value); }
    if (typeof onChange === 'function') {
      onChange(newValue);
    }
  }


  render() {
    const { viewer, isLoggedIn, value, required, error, errorMessage, hideParticipantList, organizerParticipates } = this.props;

    const triangleStyle = this.state.dropdownOpen ? styles.triangleOpen : styles.triangle ;
    const finalTriangleStyle = {
      ...triangleStyle,
      borderBottomColor: this.state.dropdownOpen ? colors.green : colors.blue,
    }

    return (
      <div style={styles.container} ref={node => { this._containerNode = node }}>
        <div style = {styles.title}>
        {localizations.newSportunity_participants}
        </div>
        <ToggleDisplay show={!this.state.inValidPax || this.state.minNotReached}>
          <label style={styles.error}>{this.state.minNotReached ? localizations.newSportunity_participant_shouldnot_be_null : localizations.newSportunity_participantInvalid}</label>
        </ToggleDisplay>
          <div style={styles.dropdownContent} onKeyPress={e => e.key === 'Enter' && this._closeDropdown()}>
            <div style={styles.column}>
              {
                !this.state.exactly &&
                  <div style={{ ...styles.inputGroup, marginBottom: 20 }}>
                    <div style={styles.label}>
                      {localizations.newSportunity_min}
                    </div>
                    <Input
                      containerStyle={{display: 'inline-block', width: 'auto'}}
                      type="number"
                      value={this.state.value.from > 0 ? this.state.value.from : ''}
                      onChange={this._handleChange.bind(this, 'from')}
                      onBlur={this._handleChange.bind(this, 'from')}
                    />
                  </div>
              }
              <div style={styles.inputGroup}>
                <div style={styles.label}>
                  { this.state.exactly ? localizations.newSportunity_exact : localizations.newSportunity_max}
                </div>
                <Input
                  containerStyle={{display: 'inline-block', width: 'auto'}}
                  type="number"
                  value={this.state.value.to > 0 ? this.state.value.to : ''}
                  onChange={this._handleChange.bind(this, 'to')}
                  onBlur={this._handleChange.bind(this, 'to')}
                />
              </div>
            </div>
          </div>
          <div style={styles.hideParticipant}>
            {localizations.newSportunity_hide_participant_list}
            <Switch
              containerStyle={styles.switch}
              checked={hideParticipantList}
              onChange={this._handleHideParticipantChange}
            />
          </div>
          {isLoggedIn && viewer.me && viewer.me.profileType === 'PERSON' && this.props.price.cents === 0 && 
            <div style={styles.hideParticipant}>
              {localizations.newSportunity_participate}
              <Switch
                containerStyle={styles.switch}
                checked={organizerParticipates}
                onChange={this._handleOrganizerIsParticipantChange}
              />
            </div>
          }
          {!!errorMessage && <div style={styles.errMsgStyle}> {errorMessage} </div>}
        {/* </Dropdown> */}
      </div>
    );
  }
}

styles = {
  container: {
    position: 'relative',
    width: '100%',
    marginBottom: 50,
    fontFamily: 'Lato',
  },
  errMsgStyle: {
		color: colors.red,
		fontSize: 15,
	},

  triangle: {
    position: 'absolute',
    right: 0,
    top: 35,
    width: 0,
    height: 0,

    transition: 'border 100ms',
    transitionOrigin: 'left',

    color: colors.blue,

    cursor: 'pointer',

    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderTop: `8px solid ${colors.blue}`,
  },

  triangleOpen: {
    position: 'absolute',
    right: 0,
    top: 35,
    width: 0,
    height: 0,

    transition: 'border 100ms',
    transitionOrigin: 'left',

    color: colors.blue,

    cursor: 'pointer',

    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderBottom: `8px solid ${colors.blue}`,
  },

  dropdown: {
    position: 'absolute',
    top: 70,
    width: '100%',
    overflow: 'hidden',
  },

  dropdownContent: {
    display: 'flex',
    justifyContent: 'space-between',
  },

  column: {
  },

  inputGroup: {
     marginTop :15,
    display: 'inline-block',
    width : 150
  },

  label: {
   display: 'inline-block',
   width : 40,
    fontFamily: 'Lato',
    fontSize: 16,
    lineHeight: '23px',
    color: '#515151',
    '@media (max-width: 768px)': {
      marginRight: 10,
    }
  },

  exactly: {
    display: 'flex',
    alignItems: 'center',

    fontFamily: 'Lato',
    fontSize: 16,
    fontWeight: 500,
    lineHeight: '23px',
    color: '#515151',
  },
  hideParticipant: {
    display: 'flex',
    alignItems: 'center',

    fontFamily: 'Lato',
    fontSize: 16,
    fontWeight: 500,
    lineHeight: '23px',
    color: '#515151',
    marginTop: 15
  },
  error: {
    color: colors.red,
    fontSize: 14,
    marginTop: 15,
  },
  switch: {
    marginLeft: 10,
  },
  title : {
     fontSize : 18,
     fontFamily: 'Lato',
  }
}
export default Radium(Participants);
