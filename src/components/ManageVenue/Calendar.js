import React from 'react'
import RCCalendar from 'rc-calendar'
import moment from 'moment'

let styles

class Calendar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: moment(),
      displayCal: false
    }
  }

  componentDidMount() {
    setTimeout(() => this.setState({displayCal: true}), 100);
  }

  _dateRender = (current) => {
    const selectedValue = this.state.value;
    if (selectedValue && current.year() === selectedValue.year() &&
      current.week() === selectedValue.week()) {
      return (<div className="rc-calendar-selected-day">
        <div className="rc-calendar-date">
          {current.date()}
        </div>
      </div>);
    }
    return (
      <div className="rc-calendar-date">
        {current.date()}
      </div>);
  }

  _onSelect = (value) => {
    this.setState({
      value: value,
    })
    this.props.onChange(value.toDate())
  }

  render() {
    return ( 
      <div style={styles.container}>
        {this.state.displayCal &&
          <RCCalendar style={styles.calendar}
            showToday={false}
            showDateInput={false}
            onSelect={this._onSelect}
            dateRender={this._dateRender}
            className='week-calendar'/>
        }
      </div>)
  }
}

styles = {
  container: {
    backgroundColor: '#FF9999',
    width: '100px',
  },
  calendar: {
    width: '200px',
  },
}

export default Calendar
