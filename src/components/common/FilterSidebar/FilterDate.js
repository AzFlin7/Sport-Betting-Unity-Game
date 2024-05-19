import React from 'react';
import DatePicker from 'react-datepicker';
import Radium from 'radium';
import moment from 'moment';

import localizations from '../../Localizations';
import PureComponent from '../PureComponent';
import { colors } from '../../../theme';

let styles;
const Style = Radium.Style;

class FilterDate extends PureComponent {
  _handleRemoveSelection = () => {
    this.props.onChange()
  }

  render() {
    const {
      value,
      containerStyle,
      inputStyle,
      onChange,
      label,
      minDate,
    } = this.props;
    const finalContainerStyle = Object.assign(
      {},
      styles.container,
      containerStyle,
    );
    const finalInputStyle = Object.assign({}, styles.input, inputStyle);

    return (
      <div style={finalContainerStyle}>
        <Style
          scopeSelector=".datetime-hours"
          rules={{
            '.rdtPicker': {
              borderRadius: '3px',
              width: '100px',
              border: '2px solid #5E9FDF',
            },
            '.form-control': styles.time,
          }}
        />
        <Style
          scopeSelector=".datetime-day"
          rules={{
            input: styles.date,
          }}
        />
        <Style
          scopeSelector=".react-datepicker"
          rules={{
            div: { fontSize: '1.4rem' },
            '.react-datepicker__current-month': { fontSize: '1.5rem' },
            '.react-datepicker__month': { margin: '1rem' },
            '.react-datepicker__day': {
              width: '2rem',
              lineHeight: '2rem',
              fontSize: '1.4rem',
              margin: '0.2rem',
            },
            '.react-datepicker__day-names': {
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 5,
            },
            '.react-datepicker__header': {
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            },
          }}
        />
        <Style
          scopeSelector=".react-datepicker-popper"
          rules={{
            zIndex: 10,
          }}
        />

        <label style={styles.label}>{label}</label>
        <div style={{ flex: 5 }} className="datetime-day">
          <DatePicker
            dateFormat="DD/MM/YYYY"
            todayButton={localizations.newSportunity_today}
            selected={value ? moment(value) : null}
            onChange={onChange}
            minDate={minDate ? moment(minDate) : null}
            locale={localizations.getLanguage().toLowerCase()}
            nextMonthButtonLabel=""
            previousMonthButtonLabel=""
          />
        </div>
        {value  
        ? <span onClick={this._handleRemoveSelection} style={styles.closeCross}>
            <i className="fa fa-times" style={styles.cancelIcon} aria-hidden="true"></i>
          </span>
        : <span style={styles.closeCross}/>
        }
      </div>
    );
  }
}

styles = {
  container: {
    width: '100%',
    fontFamily: 'Lato',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 10,
    marginBottom: 10,
    paddingLeft: 10,
  },

  label: {
    display: 'block',
    color: colors.darkGray,
    fontSize: 16,
    marginRight: 8,
    flex: 1,
  },

  date: {
    backgroundColor: '#FFFFFF',
    border: '2px solid #5E9FDF',
    borderRadius: '3px',
    marginLeft: 3,

    height: 35,

    textAlign: 'center',
    fontFamily: 'Lato',
    color: colors.darkGray,
    fontSize: 14,
  },

  closeCross: {
    color: colors.gray,
    cursor: 'pointer',
    fontSize: '16px',
    flex: 1
  },

  cancelIcon: {
  },

  inputError: {
    input: {
      width: '100%',
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      borderBottomWidth: 2,
      borderBottomColor: colors.red,

      fontSize: 18,
      fontFamily: 'Lato',
      lineHeight: 1,
      color: 'rgba(0, 0, 0, 0.64)',

      paddingBottom: 3,

      outline: 'none',

      ':focus': {
        borderBottomColor: colors.green,
      },

      ':disabled': {
        borderBottomColor: '#D1D1D1',
        backgroundColor: 'transparent',
      },
    },
  },

  input: {
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottomWidth: 2,
    borderBottomColor: colors.blue,
    fontSize: 18,
    fontFamily: 'Lato',
    lineHeight: 1,
    color: 'rgba(0, 0, 0, 0.64)',
    paddingBottom: 3,
    outline: 'none',
    '@media (maxWidth: 768px)': {
      width: 180,
    },
    '@media (maxWidth: 600px)': {
      width: 240,
    },
    ':focus': {
      borderBottomColor: colors.green,
    },
    ':disabled': {
      borderBottomColor: '#D1D1D1',
      backgroundColor: 'transparent',
    },
  },
};

export default Radium(FilterDate);
