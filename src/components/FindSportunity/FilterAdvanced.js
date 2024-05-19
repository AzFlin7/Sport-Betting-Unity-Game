import React from 'react';
import PureComponent from '../common/PureComponent';
import Radium from 'radium';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import InputRange from 'react-input-range';
import Select from 'react-select';

import Dropdown from './Dropdown';

import * as types from '../../actions/actionTypes';
import { fonts, colors } from '../../theme';

import localizations from '../Localizations';

let styles;

class FilterAdvanced extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isDropdownOpen: false,
      ageRange: {
        min: 0,
        max: 100,
      },
      sex: '',
    };
  }

  componentDidMount() {
    window.addEventListener('click', this._handleClickOutside);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this._handleClickOutside);
  }

  _handleClickOutside = event => {
    if (!this._containerNode.contains(event.target)) {
      this.setState({ isDropdownOpen: false });
    }
  };

  _openDropdown = () => {
    this.setState({
      isDropdownOpen: true,
    });
  };

  _closeDropdown = () => {
    this.setState({
      isDropdownOpen: false,
    });
  };

  _handleRestrictionsSubmit = () => {
    this.props._updateSexRestriction(this.state.sex);
    this.props._updateAgeRestriction({
      from: this.state.ageRange.min,
      to: this.state.ageRange.max,
    });
    this._closeDropdown();
  };

  render() {
    const sexOptions = [
      { value: null, label: localizations.newSportunity_sex_restriction_none },
      {
        value: 'MALE',
        label: localizations.newSportunity_sex_restriction_male,
      },
      {
        value: 'FEMALE',
        label: localizations.newSportunity_sex_restriction_female,
      },
      {
        value: 'NONE',
        label: localizations.newSportunity_sex_restriction_mixed,
      },
    ];
    return (
      <div
        style={styles.container}
        ref={node => {
          this._containerNode = node;
        }}
      >
        <label style={styles.dropDownLabel} onClick={this._openDropdown}>
          {localizations.find_advanced_filter}
        </label>
        <span style={styles.dropDownIcon} onClick={this._openDropdown}>
          <i className="fa fa-cog fa-2x" />
        </span>
        {this.state.isDropdownOpen && (
          <Dropdown style={styles.dropdown} open={this.state.isDropdownOpen}>
            <div style={styles.dropdownContent}>
              <div style={styles.column}>
                <div style={styles.row}>
                  <span style={styles.label}>
                    {localizations.newSportunity_sex_restriction} :
                  </span>
                  <div style={styles.select}>
                    <Select
                      placeholder={
                        localizations.newSportunity_sex_restriction_none
                      }
                      options={sexOptions}
                      onChange={event =>
                        this.setState({ sex: event.value, sexOption: event })
                      }
                      value={this.state.sexOption}
                      clearable={false}
                    />
                  </div>
                </div>
                <div style={styles.row}>
                  <span style={styles.label}>
                    {localizations.newSportunity_age_restriction} :
                  </span>
                  <span style={{ marginLeft: 10, width: '100%', flex: 1 }}>
                    <InputRange
                      minValue={0}
                      maxValue={100}
                      value={this.state.ageRange}
                      onChange={value => this.setState({ ageRange: value })}
                    />
                  </span>
                </div>
                <button
                  onClick={this._handleRestrictionsSubmit}
                  style={styles.submit}
                >
                  {localizations.newSportunity_save_schedule}
                </button>
              </div>
            </div>
          </Dropdown>
        )}
      </div>
    );
  }
}

styles = {
  label: {
    color: colors.blue,
    fontSize: '18px',
    fontWeight: fonts.weight.medium,
    marginRight: 10,
  },
  smallLabel: {
    color: colors.gray,
    fontSize: 14,
    margin: '0 5px',
  },
  dropDownIcon: {
    color: colors.blue,
    cursor: 'pointer',
  },
  dropDownLabel: {
    color: colors.blue,
    fontSize: '18px',
    fontWeight: fonts.weight.medium,
    marginRight: 10,
    cursor: 'pointer',
  },
  dropdown: {
    position: 'absolute',
    overflow: 'hidden',
    width: '100%',
    top: '50px',
  },
  dropdownContent: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  column: {
    width: '100%',
  },

  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: 55,
    position: 'relative',
    paddingLeft: 10,
    '@media (maxWidth: 420px)': {
      display: 'block',
    },
  },
  row: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  select: {
    border: 0,
    fontSize: '18px',
    flex: 1,
    marginLeft: 10,
    marginBottom: 15,
  },
  submit: {
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
};

const _updateSexRestriction = sexRestriction => ({
  type: types.UPDATE_SPORTUNITY_SEARCH_SEX_RESTRICTION,
  sexRestriction,
});
const _updateAgeRestriction = ageRestriction => ({
  type: types.UPDATE_SPORTUNITY_SEARCH_AGE_RESTRICTION,
  ageRestriction,
});

const dispatchToProps = dispatch => ({
  // binding functions
  _updateSexRestriction: bindActionCreators(_updateSexRestriction, dispatch),
  _updateAgeRestriction: bindActionCreators(_updateAgeRestriction, dispatch),
});

const stateToProps = ({ sportunitySearchReducer }) => ({
  // props to get
  sexRestriction: sportunitySearchReducer.sexRestriction,
  ageRestriction: sportunitySearchReducer.ageRestriction,
});

const ReduxContainer = connect(
  stateToProps,
  dispatchToProps,
)(FilterAdvanced);

export default Radium(ReduxContainer);
