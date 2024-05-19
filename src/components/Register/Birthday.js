import React from 'react';
import Radium from 'radium';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment';
import DatePicker from 'react-datepicker'

import * as types from '../../actions/actionTypes.js';
import { appStyles } from '../../theme'
import localizations from '../Localizations'

// import registerStyle from '../../theme/register.css'
// require('react-datepicker/dist/react-datepicker.css');

var Style = Radium.Style;
let styles;

const Birthday = (props) => {

  const { birthday, _updateBirthdayAction } = props;

  const _updateBirthday = (moment) => {
    let formattedDate = moment.format();
    _updateBirthdayAction(moment, formattedDate);
  }

 
  return(
    <div style={styles.container}>
      <Style scopeSelector=".react-datepicker" rules={{
        "div": {fontSize: '1.2rem'},
        ".react-datepicker__current-month": {fontSize: '1.1rem'},
        ".react-datepicker__day": {width: '2rem', lineHeight: '2rem'}
        }}
      />
      <label style={appStyles.inputLabel}>
        {localizations.register_birthday}:
      </label>
      <div>
        <DatePicker
          dateFormat='DD/MM/YYYY'
          todayButton={'Today'}
          selected={birthday}
          onChange={_updateBirthday}
          maxDate={moment()}
          showYearDropdown={true}
          showMonthDropdown={true}
          className='register-birthday'
          placeholderText='24/04/1990'
          nextMonthButtonLabel=""
          previousMonthButtonLabel=""
        />
      </div>

    </div>
  )
}

// REDUX //

const _updateBirthdayAction = (date, formattedDate) => ({
  type: types.UPDATE_REGISTER_BIRTHDAY,
  date,
  formattedDate,
});

const stateToProps = (state) => ({
  birthday: state.registerReducer.birthday,
  formattedBirthday: state.registerReducer.formattedBirthday,
})

const dispatchToProps = (dispatch) => ({
  _updateBirthdayAction: bindActionCreators(_updateBirthdayAction, dispatch),
})

export default connect(
  stateToProps,
  dispatchToProps
)(Birthday);

// STYLES //

styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: 16,
  },

}
