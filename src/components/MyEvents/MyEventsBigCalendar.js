import React from 'react'
import Radium from 'radium'
import Calendar from 'react-big-calendar'
const localizer = Calendar.momentLocalizer(moment);
import moment from 'moment'
import { Link } from "found";

import { colors } from '../../theme'
import localizations from '../Localizations'


function Event({ event }) {
  return (
    <Link to={`/event-view/${event.id}`} style={styles.link}>
      <div style={{color: event.titleColor, fontWeight: 'bold', marginBottom: 4}}>
        {event.title}
      </div>
      {event.desc1 && event.displayDesc1 &&
        <div style={{marginBottom: 3, fontWeight: 'bold'}}>
          {event.desc1}
        </div>}
      {event.displayDesc2 && event.desc2}
    </Link>
  )
}

let styles

class BigCalendar extends React.Component {
  render() {
    const { viewer } = this.props;
    const sportunities = viewer.sportunities ? viewer.sportunities.edges : [];
    let events = sportunities.map(sportunity => ({
      id: sportunity.node.id,
      title: sportunity.node.title,
      start: new Date(sportunity.node.beginning_date),
      end: new Date(sportunity.node.ending_date)
    }));

    return(
      <section style={styles.container} >
      <Calendar
        events={events}
        localizer={localizer}
        culture={localizations.getLanguage()}
        defaultView='week'
        scrollToTime={new Date(1970, 1, 1, 7)}
        defaultDate={new Date()}
        views={['month','week','day']}
        timeslots={1}
        style={{height: 650}}
        showMultiDayTimes
        components={{
          event: Event,
        }}
      />
      </section>
    )
  }
}

styles = {
  container: {
    marginLeft: 20,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '88vh',
    overflow: 'scroll'
  },
  link: {
    color: colors.white
  }
}

export default Radium(BigCalendar);