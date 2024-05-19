import React from 'react'
import Radium from 'radium'
import { colors, fonts } from '../../theme'
import format from 'date-fns/format'
import localizations from '../Localizations'
import {Link} from 'found'
import ReactTooltip from 'react-tooltip'

import AddTimeDropdown from './AddTimeDropdown'
import CustomTab from '../common/CustomTab';
import AddSchedule from "./AddSchedule";

let styles;

class Schedule extends React.Component {
  state = {
    dropdownOpen: true,
    isEdit: false,
      index: null,
      poll_is_active:false
  }

  componentDidMount() {
    window.addEventListener('click', this._onClickOutside);
    this.props.onRef && this.props.onRef(this)
  }
  
  componentWillUnmount() {
    window.removeEventListener('click', this._onClickOutside);
    this.props.onRef && this.props.onRef(undefined)
  }

  _onClickOutside = (event) => {
    const { dropdownOpen } = this.state;
    if (dropdownOpen) {
      if (!this._containerNode.contains(event.target) && event.target.className.search('react-datepicker') < 0) {
        this._closeDropdown();
      }
    }
  }

  _openDropdown = () => this.setState({ dropdownOpen: true });

  _closeDropdown = () => this.setState({ dropdownOpen: false });

  _handleSubmit = (...args) => {
    this.props.onSubmit(...args);
    this.setState({ dropdownOpen: false, isEdit: false });
  }

  _handleItemDelete = (scheduleId) => {
		this.props.onDelete(scheduleId);
  }

  _handleAddClick = (event) => {
    event.preventDefault();
    this.setState({index: null, isEdit: false, dropdownOpen: false})
    setTimeout(() => {
      this._openDropdown();
      this.props.onAdd();
    }, 200)
  }

	_handleEditClick = (scheduleId, index) => {
		// event.preventDefault();
    this.setState({
      isEdit: true,
      index,
      dropdownOpen: false
    })
		this.props.onEdit(scheduleId)
		setTimeout(() => this._openDropdown(), 200)
	}

  poll_is_active = () => {
    if (!this.state.poll_is_active)
    {
      this.props.onChangeSurvey();
    }
    this.setState({
      poll_is_active: true,
    })
  }

  poll_is_inactive = () => {
    if (this.state.poll_is_active)
    {
      this.props.onChangeSurvey();
    }
    this.setState({
      poll_is_active: false,
    })
  }

  singleDateRender = () => {
    const { scheduleId, beginningDate, endingDate, repeat } = this.props;
    
    return (
      <div style={styles.tabContainer}>
        <AddTimeDropdown
          onRef={ref => (this.singleDateRef = ref)}
          beginningDate={beginningDate}
          endingDate={endingDate}
          scheduleId={scheduleId}
          repeat={repeat}
          onSubmit={this._handleSubmit}
          isModifying={this.props.isModifying}
          repeatDisabled={true}
          severalDaysDisabled={false}
          udpateField={this.props.udpateField}
          onRef={(node) => {this.AddTimeDropdown = node}} 
          renderStepAction={this.props.renderStepAction}
          handleNext={this.props.handleNext}
          handlePrev={this.props.handlePrev}
        />
      </div>
    )
  }


  weeklyReceiptionRender = () => {
    const { scheduleId, beginningDate, endingDate, repeat } = this.props;
    
    return( 
      <div style={styles.tabContainer}>
        <AddTimeDropdown
          onRef={ref => (this.weeklyRef = ref)}
          beginningDate={beginningDate}
          endingDate={endingDate}
          scheduleId={scheduleId}
          repeat={repeat}
          onSubmit={this._handleSubmit}
          isModifying={this.props.isModifying}
          repeatDisabled={false}
          severalDaysDisabled={false}
          udpateField={this.props.udpateField}
          onRef={(node) => {this.AddTimeDropdown = node}} 
          renderStepAction={this.props.renderStepAction}
          handleNext={this.props.handleNext}
          handlePrev={this.props.handlePrev}
        />
      </div>
    )
  }

  pollRender = () => {
    const { scheduleId, beginningDate, endingDate, repeat, schedules, error, errorMessage, isSurvey, isSurveyTransformed } = this.props;
    const { localBeginningDate, localEndingDate } = this.state;
    let sortedSchedules = schedules.sort((a, b) => {return a.beginningDate - b.beginningDate})
    
    return (
      <div>
        <div style={styles.tabContainer}>
          <AddSchedule
            onRef={ref => (this.pollRef = ref)}
            beginningDate={beginningDate}
            endingDate={endingDate}
            scheduleId={scheduleId}
            onSubmit={this._handleSubmit}
            isModifying={this.props.isModifying}
            isEdit={this.state.isEdit}
            disabled={isSurveyTransformed}
            isSurvey={isSurvey}
            isSurveyTransformed={isSurveyTransformed}
            index={this.state.index}
            udpateField={this.props.udpateField}
            onRef={(node) => {this.AddTimeDropdown = node}} 
            renderStepAction={this.props.renderStepAction}
            handleNext={this.props.handleNext}
            handlePrev={this.props.handlePrev}
            sortedSchedules={sortedSchedules}
            _handleItemDelete={this._handleItemDelete}
            _handleEditClick={this._handleEditClick}

          />
        </div>
      </div>
    )
  }

  changeTab = e  => {
    if (e === "three") {
      this.props.onChangeSurvey(true)
      this.props.onChangeRepeat(0)
    }
    else if (e === "two") {
      this.props.onChangeSurvey(false)
      this.props.onChangeRepeat(1);
    }
    else {
      this.props.onChangeSurvey(false)
      this.props.onChangeRepeat(0);
    }
  }

  render() {
    const { scheduleId, beginningDate, endingDate, repeat, schedules, error, errorMessage, isSurvey, isSurveyTransformed, isModifying } = this.props;
    const { localBeginningDate, localEndingDate } = this.state;

		return (
      <div style={styles.container} ref={node => { this._containerNode = node; }}>
        <CustomTab 
          tab1={isModifying 
            ? !isSurvey && !repeat
              ? this.singleDateRender()
              : null
            : this.singleDateRender()
          }
          tab2={isModifying
            ? repeat && !isSurvey
              ? this.weeklyReceiptionRender()
              : null
            : this.weeklyReceiptionRender()
          }
          tab3={isModifying
            ? isSurvey && !repeat
              ? this.pollRender()
              : null
            : this.pollRender()
          }
          tab1Level={localizations.newSportunity_schedule_singleDate}
          tab2Level={localizations.newSportunity_schedule_weeklyRepetition}
          tab3Level={localizations.newSportunity_schedule_poll}
          onChange={this.changeTab}
          value={isSurvey ? "three" : repeat ? "two" : "one"}
        />
        {!!errorMessage && <div style={styles.errMsgStyle}> {errorMessage} </div>}
      </div>
    );
  }
}

Schedule.defaultProps = {
  items: [],
};


styles = {
  container: {
    position: 'relative',
    fontFamily: 'Lato',
    marginBottom: 27,
  },
  tabContainer: {
    
  },
  list: {
    width : '50%',
    marginLeft:'50%',
    marginBottom: 1.8,
    marginTop:'60px',
  },
  add: {
    border: 'none',
    backgroundColor: colors.blue,
    color: colors.white,

    fontSize: 18,
    fontWeight: 500,
    lineHeight: 1,

    padding: '8.5px 13px 7.5px',

    cursor: 'pointer',

    borderRadius: 3,
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
  },

	label: {
		fontFamily: 'Lato',
		fontSize: '22px',
		//textAlign: 'right',
		lineHeight: 1,
		color: '#316394',
		display: 'block',
    marginRight: 20,
    // marginLeft: 20,
		flex: 1
	},

  addError: {
    border: 'none',
    backgroundColor: colors.red,
    color: colors.white,

    fontSize: 18,
    fontWeight: 500,
    lineHeight: 1,

    padding: '8.5px 13px 7.5px',

    cursor: 'pointer',

    borderRadius: 3,
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
  },
  repeat: {
    lineHeight: 1.2,
  },

  errMsgStyle: {
		color: colors.red,
		fontSize: 15,
	},
};


export default Radium(Schedule);
