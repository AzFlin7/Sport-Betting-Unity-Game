import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import Radium from 'radium';

import ToggleDisplay from 'react-toggle-display'
import format from 'date-fns/format'
import dateformat from 'dateformat'
import Switch from '../common/Switch';
import { colors, fonts } from '../../theme';
import DateTime from 'react-datetime';

import DatePicker from 'react-datepicker'
import moment from 'moment'
import localizations from '../Localizations'

let styles;
var Style = Radium.Style;
// require('react-datetime/css/react-datetime.css');

class AddTimeDropdown extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      isScheduleError: false,
      scheduleErrorMessage: '',
      repeated: true,
      severalDays: false,
      scheduleId: this.props.scheduleId,
      beginningTime: this.props.beginningDate && dateformat(this.props.beginningDate, 'HH:MM'),
      endingTime: this.props.endingDate && dateformat(this.props.endingDate, 'HH:MM') ,
      // date: this.props.beginningDate ? dateformat(this.props.beginningDate, 'yyyy-mm-dd') : dateformat(new Date(), 'yyyy-mm-dd'),
      // date: '',
      date: this.props.beginningDate ? moment(this.props.beginningDate) : moment(),
      ending_date: this.props.endingDate ? moment(this.props.endingDate) : moment(),
      repeat: this.props.repeat || 0
    }
  }

  componentDidMount() {
    if (this.props.repeat && this.props.repeat > 0) {
      this.setState({repeated: true});
    }
    !!this.props.onRef && this.props.onRef(this);
  }

  componentWillUnmount() {
    !!this.props.onRef && this.props.onRef(undefined);
  }

  _isValidHour = (hour) => {
    var time = /\d\d:\d\d/;
    if (!time.test(hour)) return false;

    if (hour.substr(0, hour.indexOf(':')) >= 24 || hour.substr(0, hour.indexOf(':')) < 0)
      return false;
    if (hour.substr(hour.indexOf(':')+1, hour.length) >= 60 || hour.substr(hour.indexOf(':')+1, hour.length) < 0)
      return false;

    return true;
  }

  _handleScheduleSubmit = (event, jumpToNext = true) => {
    !!event && event.preventDefault();
    !!event && event.stopPropagation();

    this.setState({
      isScheduleError: false,
      scheduleErrorMessage: '',
    })

    const { beginningTime, endingTime, date, ending_date, repeat, scheduleId, severalDays } = this.state;
        
    if (!beginningTime || !endingTime) {
      this.setState({
        isScheduleError: true,
        scheduleErrorMessage: localizations.newSportunity_schedule_field_error,
      })
      return ;
    }

    if (!this._isValidHour(beginningTime)) {
      this.setState({
        isScheduleError: true,
        scheduleErrorMessage: localizations.newSportunity_schedule_beginning_hour_error,
      })
      return ;
    }
    if (!this._isValidHour(endingTime)) {
      this.setState({
        isScheduleError: true,
        scheduleErrorMessage: localizations.newSportunity_schedule_ending_hour_error,
      })
      return ;
    }

    let beginningDate = moment(date);
    beginningDate.set('hour', beginningTime.substr(0, beginningTime.indexOf(':')));
    beginningDate.set('minute', beginningTime.substr(beginningTime.indexOf(':')+1, beginningTime.length))
    beginningDate.set('second', 0);

    let endingDate = moment(severalDays ? ending_date : date);
    endingDate.set('hour', endingTime.substr(0, endingTime.indexOf(':'))); 
    endingDate.set('minute', endingTime.substr(endingTime.indexOf(':')+1, endingTime.length))
    endingDate.set('second', 0);

		if (endingDate <= beginningDate) {
      this.setState({
        isScheduleError: true,
        scheduleErrorMessage: localizations.newSportunity_schedule_hour_error,
      })
    }
    else if (beginningDate <= moment()) {
      this.setState({
        isScheduleError: true,
        scheduleErrorMessage: localizations.newSportunity_schedule_past,
      })
    }
    else {
      this.props.onSubmit({
        beginningDate: beginningDate._d,
        endingDate: endingDate._d,
				scheduleId: scheduleId,
        repeat: repeat ? repeat : 0
      });
      jumpToNext && setTimeout(() => this.props.handleNext(3), 100) ;
    }
  }

  _handleRepeatSwitch = checked => {
    this.setState({ repeated: checked });
  }

  _handleBeginningTimeChange = event => {
    if (event.target.value.length === 2)
      this.setState({
        beginningTime: event.target.value+':'
      })
    else
      this.setState({
        beginningTime: event.target.value
      })
  }

  _handleBlurBeginningTime = event => {
    if (this.state.beginningTime.length === 1) {
      this.setState({
        beginningTime: '0' + this.state.beginningTime + ':00'
      })
    }
    else if (this.state.beginningTime.length === 3 && this.state.beginningTime[this.state.beginningTime.length - 1] === ':') {
      this.setState({
        beginningTime: this.state.beginningTime + '00'
      })
    }
    setTimeout(() => {
      if (this._isValidHour(this.state.beginningTime) && !this.state.endingTime) {
        let endingTime = Number(this.state.beginningTime.substr(0, this.state.beginningTime.indexOf(':'))) +1 ;
        if (endingTime >= 24) endingTime = '00';
        if (endingTime.toString().length === 1) endingTime = '0'+endingTime;
        endingTime = endingTime+':'+ this.state.beginningTime.substr(this.state.beginningTime.indexOf(':')+1, this.state.beginningTime.length)
        this.setState({
          endingTime
        })
      }
    }, 50)
  }

  _handleEndingTimeChange = event => {
    if (event.target.value.length === 2)
      this.setState({
        endingTime: event.target.value+':'
      })
    else
      this.setState({
        endingTime: event.target.value
      })
  }

  _handleDateChange = moment => {
    this.setState({
      date: moment,
    })
  }

  _handleEndingDateChange = moment => {
    this.setState({
      ending_date: moment,
    })
  }

  _handleRepeatChange = event => {
    this.setState({
      repeat: event.target.value,
    })
  }

  _handleKeyDown = (event, field) => {
    if (event.keyCode === 8 && field === 'beginning_time') {
      if (this.state.beginningTime.length === 3) {
        let text = this.state.beginningTime; 
        text = text.slice(0,1) 
        this.setState({
          beginningTime: text
        })
        event.preventDefault();
        event.stopPropagation();
      }
    }
    else if (event.keyCode === 8 && field === 'ending_time') {
      if (this.state.endingTime.length === 3) {
        let text = this.state.endingTime; 
        text = text.slice(0,1) 
        this.setState({
          endingTime: text
        })
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }
 
  render() {
    const {
      style,
      isModifying
    } = this.props;
    const finalStyle = { ...styles.container, ...style };

    return (
      <div>
        <div style={finalStyle} onKeyPress={e => e.key === 'Enter' && this._handleScheduleSubmit(e)}>
          <div style={styles.content}>
            <h1  style={styles.addTime}>{localizations.newSportunity_addTime}</h1>
            <div>
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
                ".react-datepicker__current-month": {fontSize: '1.5rem'},
                ".react-datepicker__month": {margin: '1rem'},
                ".react-datepicker__day": {width: '2rem', lineHeight: '2rem', fontSize: '1.4rem', margin: '0.2rem'},
                ".react-datepicker__day-names": {width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: 5},
                ".react-datepicker__header": {padding: '1rem', display: 'flex', flexDirection: 'column',alignItems: 'center'}
                }}
              />
              <Style scopeSelector=".react-datepicker-popper" rules={{
                zIndex: 2
              }}/>
            </div>
            {!this.state.severalDays && 
              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>{localizations.newSportunity_from}</label>
                  <input 
                    type="text" 
                    maxLength="5"
                    value={this.state.beginningTime}
                    onChange={this._handleBeginningTimeChange}
                    style={{width: 80, textAlign:'center', backgroundColor: '#E2E2E2', border: 'none',height: '26px',borderRadius: '3px',}}
                    onBlur={this._handleBlurBeginningTime}
                    onKeyDown={e => this._handleKeyDown(e, 'beginning_time')}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>{localizations.newSportunity_to}</label>
                  <input 
                    type="text" 
                    maxLength="5"
                    value={this.state.endingTime}
                    onChange={this._handleEndingTimeChange}
                    style={{width: 80, textAlign:'center', backgroundColor: '#E2E2E2', border: 'none',height: '26px',borderRadius: '3px',}}
                    onKeyDown={e => this._handleKeyDown(e, 'ending_time')}
                  />
                </div>
              </div>
            }
            {!this.props.severalDaysDisabled && 
              <div style={styles.repeatRow}>
                <label style={styles.label}>{localizations.newSportunity_few_days}</label>
                <Switch
                  checked={this.state.severalDays}
                  onChange={checked => this.setState({severalDays: checked})}
                />
              </div>
            }
            <div style={styles.row}>
              {this.state.severalDays 
              ? <div>
                  <div style={styles.row}>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>{localizations.newSportunity_beginning_date}</label>
                      <div className="datetime-day">
                        <DatePicker
                          dateFormat="DD/MM/YYYY"
                          todayButton={localizations.newSportunity_today}
                          selected={this.state.date}
                          onChange={this._handleDateChange}
                          minDate={moment()}
                          locale={localizations.getLanguage().toLowerCase()}
                          popperPlacement="top-end"
                          nextMonthButtonLabel=""
                          previousMonthButtonLabel=""
                        />
                      </div>
                    </div>
                  </div>
                  <div style={styles.row}>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>{localizations.newSportunity_to}</label>
                      <input 
                        type="text" 
                        maxLength="5"
                        value={this.state.beginningTime}
                        onChange={this._handleBeginningTimeChange}
                        style={{width: 80, textAlign:'center', backgroundColor: '#E2E2E2', border: 'none',height: '26px',borderRadius: '3px',}}
                        onBlur={this._handleBlurBeginningTime}
                        onKeyDown={e => this._handleKeyDown(e, 'beginning_time')}
                      />
                    </div>
                  </div>
                  <div style={styles.row}>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>{localizations.newSportunity_ending_date}</label>
                      <div className="datetime-day">
                        <DatePicker
                          dateFormat="DD/MM/YYYY"
                          todayButton={localizations.newSportunity_today}
                          selected={this.state.ending_date}
                          onChange={this._handleEndingDateChange}
                          minDate={this.state.date}
                          locale={localizations.getLanguage().toLowerCase()}
                          popperPlacement="top-end"
                          nextMonthButtonLabel=""
                          previousMonthButtonLabel=""
                        />
                      </div>
                    </div>
                  </div>
                  <div style={styles.row}>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>{localizations.newSportunity_to}</label>
                      <input 
                        type="text" 
                        maxLength="5"
                        value={this.state.endingTime}
                        onChange={this._handleEndingTimeChange}
                        style={{width: 80, textAlign:'center', backgroundColor: '#E2E2E2', border: 'none',height: '26px',borderRadius: '3px',}}
                        onKeyDown={e => this._handleKeyDown(e, 'ending_time')}
                      />
                    </div>
                  </div>
                </div>
              : 
                <div style={styles.inputGroup}>
                  <label style={styles.label}>{localizations.newSportunity_date}</label>
                  <div className="datetime-day">
                    <DatePicker
                      dateFormat="DD/MM/YYYY"
                      todayButton={localizations.newSportunity_today}
                      selected={this.state.date}
                      onChange={this._handleDateChange}
                      minDate={moment()}
                      locale={localizations.getLanguage().toLowerCase()}
                      nextMonthButtonLabel=""
                      previousMonthButtonLabel=""
                    />
                  </div>

                </div>
              }
            </div>
            <div>
                <div style={this.props.repeatDisabled || isModifying ? {display: 'none'} : styles.repeatRow}>
                  <div style = {{display:'none'}}>
                    <label style={styles.label}>{localizations.newSportunity_repeat}</label>
                    <Switch
                      checked={true}
                      onChange={this._handleRepeatSwitch}
                      />
                  </div>
                </div>

                {this.state.repeated && !this.props.repeatDisabled && !isModifying
                ? <div style={styles.repeatRow}>
                    <label style={styles.label}>{localizations.newSportunity_repetitions}</label>
                    <span style={styles.repeat}>
                      <input
                        style={styles.repeatInput}
                        type="number"
                        min="1"
                        max="52"
                        name="repeat"
                        value={this.state.repeat}
                        onChange={this._handleRepeatChange}
                      />
                      {localizations.formatString(localizations.newSportunity_repeatTimes, 52)}

                    </span>
                  </div>
                : ""
                }
                {this.state.repeated && this.state.repeat > 0 && isModifying && 
                  <div style={{...styles.row, marginBottom: 10}}>
                    <label style={styles.label}>
                      {localizations.newSportunity_repetitions}
                    </label>
                    <span style={styles.note}>
                      {this.state.repeat}
                    </span>
                  </div>
                }
                {this.state.repeated && this.state.repeat > 0 &&
                  <div style={{...styles.row, marginBottom: 10}}>
                    <label style={styles.label}>
                      {localizations.newSportunity_schedule_last_date}
                    </label>
                    <span style={styles.note}>
                      {format(new Date(new Date(this.state.date).getTime()+this.state.repeat*7*24*3600*1000), 'DD/MM/YYYY')}
                    </span>
                  </div>
                }
            </div>
            <ToggleDisplay show={this.state.isScheduleError}>
              <label style={styles.error}>{this.state.scheduleErrorMessage}</label>
            </ToggleDisplay>
            {this.props.showButton && 
              <button onClick={this._handleScheduleSubmit} style={styles.add}>
                {localizations.newSportunity_save_schedule}
              </button>
            }
          </div>
        </div>
        <div style={{margin: '0 70px'}}>
          <hr style = {styles.hr}></hr> 
          {this.props.renderStepAction(3, () => this._handleScheduleSubmit(), () => this.props.handlePrev(3))}
        </div>
      </div>
    );
  }
}

styles = {
  container: {
    margin: '26px 70px', 
    display: 'flex',
    flexDirection: 'row', 
    justifyContent: 'space-between',
    overflow: 'visible',
    width: 340,
  },
  hr : {
    marginLeft : -70,
    marginRight : -70,
  },
  tip: {
    position: 'absolute',
    top: -50,
    left: 50,

    width: 0,
    height: 0,
    borderLeft: '12px solid transparent',
    borderRight: '12px solid transparent',
    borderBottom: '12px solid rgba(94,159,223,0.83)',
    zIndex: 101,
  },
  addTime:{
    color: 'rgb(78, 78, 78)',
    fontFamily: 'Lato',
    fontSize: '20px',
    margin: '20px 0px 10px',
  },

  innerTip: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeft: '10px solid transparent',
    borderRight: '10px solid transparent',
    borderBottom: '10px solid red',
    zIndex: 102,
  },

  content: {
    position: 'relative',
  },

  row: {
    display: 'flex',
    alignItems: 'center',
    // justifyContent: 'space-between',
    marginBottom: 20,
  },

  repeat: {
    fontSize: '16px',
  },

  repeatRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 20,
  },

  inputGroup: {
    display: 'flex',
    alignItems: 'center',
  },  

  label: {
    fontFamily: 'Lato',
    fontSize: '18px',
    //textAlign: 'right',
    lineHeight: 1,
    color: '#646464',
    display: 'block',
    marginRight: 20,
    marginLeft: 20,
    flex: 1
  },

  time: {
    width: '91px',
    height: '35px',
    backgroundColor: '#E2E2E2',
   // border: '2px solid #5E9FDF',
    borderRadius: '3px',

    textAlign: 'center',
    fontFamily: fonts.size.xl,
    color: 'rgba(146,146,146,0.87)',
  },

  date: {
    backgroundColor: '#E2E2E2',
    border: '0px solid #5E9FDF',
    borderRadius: '3px',
    marginLeft: 3,

    height: 35,

    textAlign: 'center',
    fontFamily: fonts.size.xl,
    color: 'rgba(146,146,146,0.87)',
  },

  note: {
    fontSize: 14, 
    fontFamily: 'Lato',
    marginLeft: 10,
    color: '#646464'
  },

  repeatInput: {
    backgroundColor: '#E2E2E2',
    border: '0px solid #5E9FDF',
    borderRadius: '3px',
    marginLeft: 3,

    height: 35,

    textAlign: 'center',
    fontFamily: fonts.size.xl,
    color: 'rgba(146,146,146,0.87)',
    width: 50,
    marginRight: 2
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

  error: {
    color:colors.error,
    fontSize: '16px',
  },
  
}


export default Radium(AddTimeDropdown);
