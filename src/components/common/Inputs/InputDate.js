import React, { Component } from 'react';
import DatePicker from 'react-datepicker'
import Radium from 'radium'
import moment from 'moment'

import { appStyles, fonts } from '../../../theme'
import localizations from '../../Localizations'

let styles ;
var Style = Radium.Style;

class InputDate extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    let { label, placeholder, isDisabled } = this.props
    const inputStyle = isDisabled ? appStyles.inputDisabled : appStyles.input ;
    
    return(
      <div style={styles.container}>
        <Style scopeSelector=".datetime-hours" rules={{
            ".rdtPicker": {borderRadius: '3px', width: '100px', border: '2px solid #5E9FDF'},
            ".form-control": styles.time,
            }}
        />
        <Style scopeSelector=".datetime-day" rules={{
            "input": styles.date,         
            }}
        />
        <Style scopeSelector=".react-datepicker-popper" rules={{
          zIndex: 413,
          width: 275
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

        <div style={appStyles.inputLabel}>{label}</div>
        
        <div className="datetime-day">
            <DatePicker
                dateFormat="DD/MM/YYYY"
                todayButton={localizations.newSportunity_today}
                selected={this.props.value && moment(this.props.value)}
                onChange={this.props.onChange}
                locale={localizations.getLanguage().toLowerCase()}
                popperPlacement="bottom-end" 
                nextMonthButtonLabel=""
                previousMonthButtonLabel=""
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
            />
        </div>
      </div>
    )
  }
}

export default InputDate ;

styles = {
    container: {
        position: 'relative'
    },
    time: {
        width: '91px',
        height: '35px',
        backgroundColor: '#FFFFFF',
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        borderBottom: '2px solid #5E9FDF',
        marginBottom: 20,
        textAlign: 'center',
        fontFamily: fonts.size.xl,
        color: 'rgba(146,146,146,0.87)',
        width: '100%'
      },
    
      date: {
        backgroundColor: '#FFFFFF',
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        borderBottom: '2px solid #5E9FDF',
        marginLeft: 3,
        marginBottom: 20,
        width: '100%',
    
        height: 35,
    
        textAlign: 'center',
        fontFamily: fonts.size.xl,
        color: 'rgba(146,146,146,0.87)',
      },
}