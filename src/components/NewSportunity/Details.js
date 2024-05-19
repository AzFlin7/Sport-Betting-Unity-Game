import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import Radium from 'radium';
import ToggleDisplay from 'react-toggle-display'
import Select from 'react-select'

import Input from './Input';
import Dropdown from './Dropdown';
import localizations from '../Localizations'

import { colors, fonts } from '../../theme';

let styles;

class Details extends PureComponent {
  state = {
    dropdownOpen: false,
    ageFrom: 0,
    ageTo: 100,
    sex: 'NONE',
    error: '',
  }

  componentDidMount() {
    window.addEventListener('click', this._onClickOutside);
    this.setState({
        ageFrom: this.props.ageRestriction.from,
        ageTo: this.props.ageRestriction.to,
        sex: this.props.sexRestriction
    })
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
    this.refs._inputNode._onBlur();
    this.setState({ dropdownOpen: false });
  }

  _toggleDropdown = () => {
    if (this.state.dropdownOpen) {
      this._closeDropdown();
    }
    else {
      this._openDropdown();
    }
  }

  _handleRestrictionsSubmit = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (isNaN(this.state.ageFrom) || this.state.ageFrom === ''
        || isNaN(this.state.ageTo) || this.state.ageTo === ''
        || parseInt(this.state.ageFrom) > parseInt(this.state.ageTo)) {
        this.setState({
            error: localizations.newSportunity_restriction_invalid
        })
        return;
    }

    this.props.onSexRestrictionChange(this.state.sex);
    this.props.onAgeRestrictionChange({from: this.state.ageFrom, to: this.state.ageTo});
    this._closeDropdown()
    this.setState({error: ''});
  }

  render() {
    const triangleStyle = this.state.dropdownOpen ? styles.triangleOpen : styles.triangle ;
    const finalTriangleStyle = {
        ...triangleStyle,
        borderBottomColor: this.state.dropdownOpen ? colors.green : colors.blue
    }

    const sexOptions = [
      { value: 'MALE', label: localizations.newSportunity_sex_restriction_male },
      { value: 'FEMALE', label: localizations.newSportunity_sex_restriction_female },
      { value: 'NONE', label: localizations.newSportunity_sex_restriction_none },
    ];

    const label = [this.props.ageRestriction.from === 0 && this.props.ageRestriction.to === 100
                    ? localizations.newSportunity_age_all
                    : [ localizations.newSportunity_from,
                        this.props.ageRestriction.from,
                        localizations.newSportunity_to,
                        this.props.ageRestriction.to,
                        localizations.newSportunity_age_restriction_years
                        ].join(" ")
                , sexOptions.find(sexOption => this.props.sexRestriction === sexOption.value).label
                ].join(" ; ") ;

    return (
      <div style={styles.container} ref={node => { this._containerNode = node }}>
        <Input
          label={localizations.newSportunity_restrictions}
          ref="_inputNode"
          value={label}
          onFocus={this._openDropdown}
          error={this.state.error}
          readOnly
        />
        <ToggleDisplay show={this.state.error ? true : false}>
          <label style={styles.error}>{this.state.error}</label>
        </ToggleDisplay>
        <span style={finalTriangleStyle} onClick={this._toggleDropdown}/>
        <Dropdown style={styles.dropdown} open={this.state.dropdownOpen} onKeyPress={e => e.key === 'Enter' && this._handleRestrictionsSubmit(e)}>
          <div style={styles.dropdownContent}>
            <div style={styles.column}>
                <div style={styles.row}>
                    <span style={styles.label}>{localizations.newSportunity_sex_restriction} :</span>
                    <div style={styles.select}>
                        <Select
                            placeholder={localizations.newSportunity_sex_restriction_none}
                            options={sexOptions}
                            onChange={(event) => this.setState({sex: event.value})}
                            value={this.state.sex}
                            clearable={false}
                        />
                    </div>
                </div>
                <div style={styles.row}>
                    <span style={styles.label}>{localizations.newSportunity_age_restriction} :</span>
                    <label style={styles.label}>{localizations.newSportunity_from}</label>
                    <input
                        type="number"
                        maxLength="3"
                        value={this.state.ageFrom}
                        onChange={event => this.setState({ageFrom: event.target.value})}
                        style={styles.inputAge}
                    />
                    <label style={styles.label}>{localizations.newSportunity_to}</label>
                    <input
                        type="number"
                        maxLength="3"
                        value={this.state.ageTo}
                        onChange={event => this.setState({ageTo: event.target.value})}
                        style={styles.inputAge}
                    />
                    <span style={styles.label}>{localizations.newSportunity_age_restriction_years}</span>
                </div>
                <button onClick={this._handleRestrictionsSubmit} style={styles.add}>
                    {localizations.newSportunity_save_schedule}
                </button>
            </div>
          </div>
        </Dropdown>
      </div>
    );
  }
}

styles = {
  container: {
    position: 'relative',
    width: '100%',
    marginBottom: 25,
    marginTop: 25,
    fontFamily: 'Lato',
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
    top: 80,
    width: '100%',
    overflow: 'hidden',
  },

  dropdownContent: {
    display: 'flex',
    justifyContent: 'space-between',
  },

  column: {
      width: '100%',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  inputGroup: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  inputAge: {
    width: '80px',
    textAlign: 'center',
    '@media (maxWidth: 320px), (minWidth: 650px) and (maxWidth: 900px)': {
      width: '50px',
    },
  },

  label: {
    fontFamily: 'Lato',
    fontSize: '18px',
    textAlign: 'right',
    lineHeight: 1,
    color: '#316394',
    display: 'block',
    // marginRight: 20,
  },

  error: {
    color: colors.red,
    fontSize: 14,
    marginTop: 15,
  },
  select: {
    border: 0,
    fontSize: '18px',
    flex: 1,
    marginLeft: 10
  },
  add: {
    marginTop: 12,
    width: '100%',
    height: 32,

    backgroundColor: colors.green,
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    borderRadius: '3px',
    borderStyle: 'none',

    color: colors.white,
    fontSize: '16px',

    cursor: 'pointer',
  },
}
export default Radium(Details);
