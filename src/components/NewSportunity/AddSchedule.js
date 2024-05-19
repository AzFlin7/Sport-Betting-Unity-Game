import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import Radium from 'radium';
import ReactTooltip from 'react-tooltip';
import {Link} from 'found';

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

let nextScheduleId = 0;

const Item = ({ beginningDate, endingDate, repeat, scheduleId, onDelete, onEdit, isSurvey, isSurveyTransformed, isEdit, index }) => {
  return (
    <li style={styles.item} onClick={isSurvey ? null : onEdit.bind(this, scheduleId)} >
	    {!isSurveyTransformed &&
		    <div style={styles.close} value={scheduleId} onClick={onDelete.bind(this, scheduleId)}>
			    <i className="fa fa-times" value={scheduleId} style={styles.icon} aria-hidden="true"/>
		    </div>
	    }
      {format(beginningDate, 'DD/MM/YYYY') !== format(endingDate, 'DD/MM/YYYY') 

      ? <div style={styles.editWrapper}>
          <div style={styles.starting}  value={scheduleId}>
            {format(beginningDate, 'DD/MM/YYYY')}
            <time style={styles.time} value={scheduleId} >
              {format(beginningDate, 'H:mm')}
            </time>
          </div>
          <div style={styles.starting}  value={scheduleId}>
            {format(endingDate, 'DD/MM/YYYY')}
            <time style={styles.time} value={scheduleId} >
              {format(endingDate, 'H:mm')}
            </time>
          </div>
          {repeat > 0 && <span style={styles.meetingLabel}>{localizations.newSportunity_schedule_first_date}</span>}
        </div>

      : <div style={styles.editWrapper}>
          <div style={styles.starting}  value={scheduleId}>
            {format(beginningDate, 'DD/MM/YYYY')}
          </div>
          <time style={styles.time} value={scheduleId} >
            {format(beginningDate, 'H:mm')} - {format(endingDate, 'H:mm')}
          </time>
          {repeat > 0 && <span style={styles.meetingLabel}>{localizations.newSportunity_schedule_first_date}</span>}
        </div>
      }

      {repeat > 0 &&
        <div style={styles.editWrapper}>
          <div style={styles.starting}  value={scheduleId}>{format(new Date(new Date(beginningDate).getTime()+repeat*7*24*3600*1000), 'DD/MM/YYYY')}</div>
          <time style={styles.time} value={scheduleId} >
            {format(beginningDate, 'H:mm')} - {format(endingDate, 'H:mm')}
          </time>
          <span style={styles.meetingLabel}>{localizations.newSportunity_schedule_last_date}</span>
        </div>      
      }
      {
        repeat > 0 && 
          <div style={styles.iterationNumberLabel}>{localizations.newSportunity_schedule_total_number_of_iteration}: {repeat}</div>
      }
    </li>
  );
}

class AddSchedule extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
	    dates: [],
      isScheduleError: false,
      scheduleErrorMessage: '',
      repeated: false,
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
    !!this.props.onRef && this.props.onRef(this);
    if (this.props.repeat && this.props.repeat > 0) {
      this.setState({repeated: true});
    }
  }

  componentWillUnmount() {
    !!this.props.onRef && this.props.onRef(undefined);
  }

  resetState = () => {
    this.setState({
      dates: [],
      isScheduleError: false,
      scheduleErrorMessage: '',
      repeated: false,
      severalDays: false,
      scheduleId: this.props.scheduleId,
      beginningTime: '',
      endingTime: '' ,
      // date: this.props.beginningDate ? dateformat(this.props.beginningDate, 'yyyy-mm-dd') : dateformat(new Date(), 'yyyy-mm-dd'),
      // date: '',
      date: this.props.beginningDate ? moment(this.props.beginningDate) : moment(),
      ending_date: this.props.endingDate ? moment(this.props.endingDate) : moment(),
    })
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

	_handleEditScheduleSubmit = (event) => {
		event.preventDefault();
		event.stopPropagation();

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
		}
	}

  _handleScheduleSubmit = (event, goNext = false) => {
    !!event && event.preventDefault();
    !!event && event.stopPropagation();

    this.setState({
      isScheduleError: false,
      scheduleErrorMessage: '',
    })
    
    let { beginningTime, endingTime, dates, ending_date, repeat, scheduleId, severalDays } = this.state;

	  let haveError = false;
    if (!beginningTime || !endingTime) {
      this.setState({
        isScheduleError: true,
        scheduleErrorMessage: localizations.newSportunity_schedule_field_error,
      })
	    haveError = this;
      return ;
    }

    if (!this._isValidHour(beginningTime)) {
      this.setState({
        isScheduleError: true,
        scheduleErrorMessage: localizations.newSportunity_schedule_beginning_hour_error,
      })
	    haveError = this;
      return ;
    }
    if (!this._isValidHour(endingTime)) {
      this.setState({
        isScheduleError: true,
        scheduleErrorMessage: localizations.newSportunity_schedule_ending_hour_error,
      })
	    haveError = this;
      return ;
    }
    let storedDates = dates.sort((a, b) => {return a - b})
	  storedDates.forEach(date => {
		  let beginningDate = moment(date);
		  beginningDate.set('hour', beginningTime.substr(0, beginningTime.indexOf(':')));
		  beginningDate.set('minute', beginningTime.substr(beginningTime.indexOf(':') + 1, beginningTime.length))
		  beginningDate.set('second', 0);

		  let endingDate = moment(severalDays ? ending_date : date);
		  endingDate.set('hour', endingTime.substr(0, endingTime.indexOf(':')));
		  endingDate.set('minute', endingTime.substr(endingTime.indexOf(':') + 1, endingTime.length))
		  endingDate.set('second', 0);

		  if (endingDate <= beginningDate) {
			  this.setState({
				  isScheduleError: true,
				  scheduleErrorMessage: localizations.newSportunity_schedule_hour_error,
			  })
			  haveError = this;
		  }
		  else if (beginningDate <= moment()) {
			  this.setState({
				  isScheduleError: true,
				  scheduleErrorMessage: localizations.newSportunity_schedule_past,
			  })
			  haveError = this;
		  }
		  else if (!haveError) {
			  this.props.onSubmit({
				  beginningDate: beginningDate._d,
				  endingDate: endingDate._d,
				  scheduleId: this.props.isEdit ? scheduleId : nextScheduleId++,
				  repeat: repeat ? repeat : 0
        });
        goNext && setTimeout(() => this.props.handleNext(3), 100) ;
      }
      this.resetState()
	  })
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
    }, 50) ;
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

  _handleDateChange = newMoment => {
	  let {dates} = this.state;
	  let exist = dates.findIndex(date => date.format('DD/MM/YYYY') === newMoment.format('DD/MM/YYYY')) >= 0;
	  if (exist)
		  dates = dates.filter(date => date.format('DD/MM/YYYY') !== newMoment.format('DD/MM/YYYY'));
	  else
      dates.push(newMoment);
      
	  this.setState({
		  date: exist ? dates.length > 0 ? dates[0] : moment() : newMoment,
		  dates
	  })
  }

	_handleEditDateChange = moment => {
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
        index,
        isSurvey,
        isSurveyTransformed,
        scheduleId
    } = this.props;
    let finalStyle = { ...styles.container, ...style };

    if (this.props.isEdit)
    	finalStyle = {...finalStyle, top: 50 + (78 * (index + 1))}

    return (
      <div>
        <div style={finalStyle} onKeyPress={e => e.key === 'Enter' && (this.props.isEdit ? this._handleEditScheduleSubmit(e) : this._handleScheduleSubmit(e))}>
          <div style={styles.content}>
            <h1  style={styles.addTime}>
              {localizations.newSportunity_addTime}
              <div style={styles.label}>
                <ReactTooltip effect="solid" multiline={true} />
                <Link target='_blank' to='/faq/tutorial/how-to-do-a-participants-survey'>
                  <i
                    data-tip={localizations.newSportunity_survey_tooltip}
                    style={styles.sportToolTipIcon}
                    className="fa fa-question-circle"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </h1>
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
              <Style scopeSelector=".react-datepicker__day--highlighted-custom-1" rules={{
                backgroundColor: colors.blue + "!important",
                borderRadius: "0.3rem",
                color: colors.white + "!important"
              }}/>
              <Style scopeSelector=".react-datepicker__day--keyboard-selected" rules={{
                backgroundColor: "transparent",
                color: colors.black
              }}/>
            </div>
            {!this.state.severalDays &&
              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>{localizations.newSportunity_from}</label>
                  <input
                    type="text"
                    maxLength="5"
                    disabled={this.props.disabled}
                    value={this.state.beginningTime}
                    onChange={this._handleBeginningTimeChange}
                    style={{width: 80, textAlign:'center', backgroundColor: '#F2F2F2', border: 'none',height: '26px',borderRadius: '3px',}}
                    onBlur={this._handleBlurBeginningTime}
                    onKeyDown={e => this._handleKeyDown(e, 'beginning_time')}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>{localizations.newSportunity_to}</label>
                  <input
                    type="text"
                    maxLength="5"
                    disabled={this.props.disabled}
                    value={this.state.endingTime}
                    onChange={this._handleEndingTimeChange}
                    style={{width: 80, textAlign:'center', backgroundColor: '#F2F2F2', border: 'none',height: '26px',borderRadius: '3px',}}
                    onKeyDown={e => this._handleKeyDown(e, 'ending_time')}
                  />
                </div>
              </div>
            }
            <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>{localizations.newSportunity_date}</label>
                  <div className="datetime-day">
                    <DatePicker
                      dateFormat="DD/MM/YYYY"
                      disabled={this.props.disabled}
                      highlightDates={[{
                        "react-datepicker__day--highlighted-custom-1": this.state.dates
                      }]}
                      shouldCloseOnSelect={false}
                      todayButton={localizations.newSportunity_today}
                      onChange={this.props.isEdit ? this._handleEditScheduleSubmit : this._handleDateChange}
                      minDate={moment()}
                      locale={localizations.getLanguage().toLowerCase()}
                      nextMonthButtonLabel=""
                      previousMonthButtonLabel=""
                      placeholderText={this.state.dates.length > 0 ? this.state.dates.length + " date" + (this.state.dates.length > 1 ? "s" : "") : ""}
                    />
                  </div>
                </div>
            </div>
            <ToggleDisplay show={this.state.isScheduleError}>
              <label style={styles.error}>{this.state.scheduleErrorMessage}</label>
            </ToggleDisplay>
            <button onClick={this.props.isEdit ? this._handleEditScheduleSubmit : this._handleScheduleSubmit} disabled={this.props.disabled} style={styles.add}>
              {this.props.isEdit ? localizations.newSportunity_save_schedule : localizations.newSportunity_add_date['0'] + this.state.dates.length + localizations.newSportunity_add_date['1']}
            </button>
          </div>
          { <ul style={styles.list}>
            { this.props.sortedSchedules.map((schedule, index) =>
              <Item
                key={index}
                beginningDate={schedule.beginningDate}
                endingDate={schedule.endingDate}
                repeat={schedule.repeat}
                onDelete={this.props._handleItemDelete}
                onEdit={this.props._handleEditClick}
                scheduleId={schedule.scheduleId}
                index={index}
                isSurvey={isSurvey}
                isSurveyTransformed={isSurveyTransformed}
                isEdit={this.state.dropdownOpen && this.state.isEdit && schedule.scheduleId === scheduleId}
              />
            )}
          </ul> 
          }
        </div>
        <div style={{margin: '0 70px'}}>
          <hr style = {styles.hr}></hr> 
          {this.props.renderStepAction(3, () => this.props.handleNext(3), () => this.props.handlePrev(3))}
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
  },
  hr : {
    marginLeft : -70,
    marginRight : -70,
  }, 
  sportToolTipIcon: {
		marginLeft: 15,
		fontSize: 22,
		cursor: 'pointer',
    textDecoration: 'none',
    color: colors.blue
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
    display: 'flex',
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
    justifyContent: 'space-between',
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
    backgroundColor: '#F2F2F2',
  //  border: '2px solid #5E9FDF',
    borderRadius: '3px',

    textAlign: 'center',
    fontFamily: fonts.size.xl,
    color: 'rgba(146,146,146,0.87)',
  },

  date: {
    backgroundColor: '#F2F2F2',
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
    color: '#316394'
  },

  repeatInput: {
    backgroundColor: '#F2F2F2',
   // border: '2px solid #5E9FDF',
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

  item: {
    position: 'relative',
    fontFamily: 'Lato',
    fontSize: fonts.size.xl,
    color: 'rgba(0,0,0,0.64)',
    width: 250
  },
  close: {
    position: 'absolute',
    top: '50%',
    right: 0,
  
    transform: 'translateY(-50%)',
  
    width: 20,
    height: 20,
  
    cursor: 'pointer',
  
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  
    borderRadius: '50%',
  
    backgroundColor: '#5E9FDF',
    boxShadow: '0 0 2px 0 rgba(0,0,0,0.12), 0 1px 2px 0 rgba(0,0,0,0.24)',
  },
  edit: {
    position: 'absolute',
    top: '50%',
    right: 30,
  
    transform: 'translateY(-50%)',
  
    width: 20,
    height: 20,
  
    cursor: 'pointer',
  
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  
    borderRadius: '50%',
  
    backgroundColor: '#5E9FDF',
    boxShadow: '0 0 2px 0 rgba(0,0,0,0.12), 0 1px 2px 0 rgba(0,0,0,0.24)',
  },
  icon: {
    color: colors.white,
    fontSize: 12,
  },
  editWrapper : {
    cursor: 'pointer',
    borderBottom: '1px solid '+colors.blue,
    marginBottom:15
  },
  meetingLabel: {
    fontSize: 18,
    float: 'right'
  },
  iterationNumberLabel: {
    fontSize: 18
  },
  starting: {
    fontSize: '20px',
    marginBottom: 16,
    marginTop: 8,
    color: '#5E9FDF',
  },
  time: {
    fontSize: '18px',
    fontWeight: 500,
    lineHeight: 1.2,
    color: colors.black,
    marginLeft: 10,
  },
}


export default Radium(AddSchedule);
