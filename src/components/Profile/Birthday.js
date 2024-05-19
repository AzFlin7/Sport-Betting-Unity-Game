import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import Radium from 'radium'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as types from '../../actions/actionTypes.js';
import moment from 'moment';
import DatePicker from 'react-datepicker'
import { appStyles, metrics, colors } from '../../theme';
// require('react-datepicker/dist/react-datepicker.css');
let styles;
var Style = Radium.Style;
import localizations from '../Localizations'
import Switch from '../common/Switch';

class Birthday extends PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount = () => {
    if (this.props.user && this.props.user.birthday) {
      let formattedDate = moment(this.props.user.birthday).format();
      this.props._updateBirthdayAction(this.props.user.birthday, formattedDate);
    }
    if (this.props.user) {
      this.props._updateHideMyAgeAction(this.props.user.hideMyAge);
    }
  }

  _updateBirthday = (date) => {
    const { onChange } = this.props;
    let formattedDate = moment(date).format();
    this.props._updateBirthdayAction(date, formattedDate);
    if (typeof onChange === 'function') {
      onChange(date, formattedDate);
    }
  }

  render = () => {
    return (
      <div style={styles.container}>
        <Style scopeSelector=".register-birthday" rules={{fontSize: 20, marginBottom: 0}}/>
        <Style scopeSelector=".react-datepicker-popper" rules={{zIndex: 2}}/>
        <Style scopeSelector=".datetime-hours" rules={{
            ".rdtPicker": {borderRadius: '3px', width: '100px', border: '2px solid #5E9FDF'},
            ".form-control": styles.time,
            }}
          />
          <Style scopeSelector=".datetime-day" rules={{
            "input": styles.date,
            }}
          />
          <Style scopeSelector=".react-datepicker" rules={{
            "div": {fontSize: '1.4rem'},
            ".react-datepicker__current-month": {fontSize: '1.5rem', marginBottom: 5},
            ".react-datepicker__month": {margin: '1rem'},
            ".react-datepicker__day": {width: '2rem', lineHeight: '2rem', fontSize: '1.4rem', margin: '0.2rem'},
            ".react-datepicker__day-names": {width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: 5},
            ".react-datepicker__header": {padding: '1rem', display: 'flex', flexDirection: 'column',alignItems: 'center'},
            }}
          />
        <label style={appStyles.inputLabel}>
          {!this.props.onChange && localizations.info_birthday}
          <DatePicker
            dateFormat='DD/MM/YYYY'
            selected={this.props.birthday ? moment(this.props.birthday) : ""}
            locale={localizations.getLanguage().toLowerCase()}
            todayButton={localizations.profile_today}
            maxDate={moment()}
            showYearDropdown={true}
            showMonthDropdown={true}
            onChange={this._updateBirthday}
            className='register-birthday'
            style={appStyles.input}
            nextMonthButtonLabel=""
            previousMonthButtonLabel=""
          />
        </label>
          <div style={styles.hideMyAge}>
            <label style={styles.hideMyAgeLabel}>
              {localizations.profile_hideMyAge}
            </label>
            <Switch
              checked={this.props.hideMyAge}
              onChange={e => {
                this.props._updateHideMyAgeAction(e);
                this.props.onChangeHideAge && this.props.onChangeHideAge(e);
              }}
            />
          </div>
      </div>
    )
  }
}

// REDUX //

const _updateBirthdayAction = (date, formattedDate) => ({
  type: types.UPDATE_PROFILE_BIRTHDAY,
  date,
  formattedDate,
});

const _updateHideMyAgeAction = (value) => ({
  type: types.UPDATE_PROFILE_HIDE_MY_AGE,
  value
})

const stateToProps = (state) => ({
  birthday: state.profileReducer.birthday,
  formattedBirthday: state.profileReducer.formattedBirthday,
  hideMyAge: state.profileReducer.hideMyAge
})

const dispatchToProps = (dispatch) => ({
  _updateBirthdayAction: bindActionCreators(_updateBirthdayAction, dispatch),
  _updateHideMyAgeAction: bindActionCreators(_updateHideMyAgeAction, dispatch)
})

export default connect(
  stateToProps,
  dispatchToProps
)(Birthday);

// STYLES //

styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    marginBottom: metrics.margin.medium,
  },
  hideMyAge: {
    marginBottom: 15,
    marginTop: 10,
    display: 'flex',
    flexDirection: 'row',
    color: colors.gray,
    fontSize: 15,
    lineHeight: 1,
    fontFamily: 'Lato',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 10,
    marginRight: 10,
  },
  hideMyAgeLabel: {
    width: 90,
  },
  checkbox: {
    width: 18,
    height: 18,
    border: '2px solid rgb(94, 159, 223)',
    display: 'block',
  }
}
