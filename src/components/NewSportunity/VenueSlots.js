import React from 'react'
import Radium from 'radium'
import { colors, fonts } from '../../theme'
import format from 'date-fns/format'
import isEqual from 'lodash/isEqual';

import localizations from '../Localizations'
var Style = Radium.Style;

let styles;

const Item = ({ beginningDate, endingDate, repeat, scheduleId }) => {
    return (
      <div style={styles.item}>
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
      </div>
    );
  }

class VenueSlots extends React.Component {
  state = {
  }

  render() {
        const { slot, repeat} = this.props;

		return (
        <div style={styles.container} >
            <Item 
                beginningDate={slot.from}
                endingDate={slot.end}
                repeat={repeat} 
                scheduleId={0}
            />
            {/*<Input
                label={localizations.newSportunity_venueSlots}
                value={slot && slot.from && slot.end 
                    ? format(slot.from, 'DD/MM/YYYY') + '  ' + format(slot.from, 'H:mm') + ' - ' + format(slot.end, 'H:mm')
                    : ''}
                disabled={true}
            />*/}
        </div>
    );
  }
}

var spinKeyframes = Radium.keyframes({
    '0%': { transform: 'rotate(0deg)' },
    '100%' :{ transform: 'rotate(360deg)' },
}, 'spin');

styles = {
    container: {
        position: 'relative',
        fontFamily: 'Lato',
        marginBottom: 27,
        width: '100%'
    },
    dropdown: {
        position: 'absolute',
        top: 70,
        left: 0,

        width: '100%',
        maxHeight: 300,

        backgroundColor: colors.white,

        boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
        border: '2px solid rgba(94,159,223,0.83)',
        padding: 20,

        overflowY: 'scroll',
        overflowX: 'hidden',

        zIndex: 100
    },

    list: {},

    listItem: {
        paddingTop: 10,
        paddingBottom: 10,
        color: '#515151',
        fontSize: 20,
        fontWeight: 500,
        fontFamily: 'Lato',
        borderBottomWidth: 1,
        borderColor: colors.blue,
        borderStyle: 'solid',
        cursor: 'pointer',
        display: 'flex'
    },
    slotDate: {
        marginRight: 10,
        color: colors.blue
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

        borderLeft: '8px solid transparent',
        borderRight: '8px solid transparent',
        borderTop: `8px solid ${colors.blue}`,
    },

    closeCross: {
        position: 'absolute',
        right: 0,
        top: 30,
        width: 0, 
        height: 0,
        color: colors.gray,
        marginRight: '15px',
        cursor: 'pointer',
        fontSize: '16px',
    },
    spinnerItem: {
        borderLeft: '6px solid #f3f3f3',
        borderRight: '6px solid #f3f3f3',
        borderBottom: '6px solid #f3f3f3',
        borderTop: '6px solid #3498db',
        borderRadius: '50%',
        width: '20px',
        height: '20px',
        marginRight: '20px',
        animation: 'x 1.5s ease 0s infinite',
        animationName: spinKeyframes,
    },

    item: {
        position: 'relative',
        fontFamily: 'Lato',
        fontSize: fonts.size.xl,
        color: 'rgba(0,0,0,0.64)',
    },
    
    icon: {
        color: colors.white,
        fontSize: 12,
    },
    
    time: {
        fontSize: '18px',
        fontWeight: 500,
        lineHeight: 1.2,
        color: colors.black,
        marginLeft: 10,
    },
    
    repeat: {
        lineHeight: 1.2,
    },
    
    starting: {
        fontSize: '20px',
        marginBottom: 16,
        marginTop: 8,
        color: '#5E9FDF',
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
};

export default Radium(VenueSlots);