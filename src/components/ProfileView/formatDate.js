import isSameDay from 'date-fns/is_same_day';
import isSameHour from 'date-fns/is_same_hour';
import isSameMinute from 'date-fns/is_same_minute';
import format from 'date-fns/format';
import moment from 'moment'

export const formatDate = (b, e) => {
  if (isSameDay(b, e)) {
    const date = moment(b).format('ddd DD MMM YY');
    const time = isSameHour(b, e) && isSameMinute(b, e)
      ? format(b, 'H:mm')
      : `${format(b, 'H:mm')} - ${format(e, 'H:mm')}`

    return `${date}, ${time}`;
  }

  return `${moment(b).format('ddd DD MMM YY, H:mm')} - ${moment(e).format('ddd DD MMM YY, H:mm')}`;
}

export const formatDateLong = (b, e) => {
  if (isSameDay(b, e)) {
    const date = moment(b).format('dddd DD MMMM YYYY');
    const time = isSameHour(b, e) && isSameMinute(b, e)
      ? format(b, 'H:mm')
      : `${format(b, 'H:mm')} - ${format(e, 'H:mm')}`

    return `${date}, ${time}`;
  }

  return `${moment(b).format('dddd DD MMMM YYYY, H:mm')} - ${moment(e).format('dddd DD MMMM YYYY, H:mm')}`;
}

export const formatWeekDays = (d) => {
  return moment(d).format('ddd');
}

export const formatDateMonth = (b, e) => {
  if (isSameDay(b, e)) {
    return moment(b).format('DD MMM');
  }
  return `${moment(b).format('DD MMM')} - ${moment(e).format('DD MMM')}`;
}

export const formatTime = (b, e) => {
  return `${moment(b).format('H:mm')} - ${moment(e).format('H:mm')}`;
}