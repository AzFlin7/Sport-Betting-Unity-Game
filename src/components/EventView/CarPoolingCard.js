import React from 'react';
import { colors } from '../../theme';
import { styles } from './CarPooling/styles';
import localizations from '../Localizations';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import isSameDay from 'date-fns/is_same_day';
import moment from 'moment'
import { formatDateMonth, formatTime, formatWeekDays } from './formatDate';

const timeStyles = {
  info: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  datetime: {
    color: colors.black,
    fontFamily: 'Lato',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  day: {
    fontSize: 22,
  },
  dayBold: {
    fontSize: 37,
    fontWeight: 'bold',
    borderBottom: '1px solid',
    borderBottomColor: colors.lightGray,
    paddingBottom: 10,
    marginBottom: 10,
    color: colors.gray,
  },
  time: {
    fontSize: 22,
  },
};

const CarPoolingCard = ({
  carPooling,
  index,
  userIsDriver,
  userIsPassenger,
  bookCarPooling,
  updateCarPooling,
  cancelCarPooling,
  cancelCarPoolingBook,
  viewOnly,
}) => (
  <Grid container spacing={16}>
    <Grid item xs={8}>
      {index >= 1 && (
        <div
          style={{
            borderBottom: `1px solid ${colors.lightGray}`,
            margin: '25px 20px',
          }}
        />
      )}

      {/* driver */}
      <div style={styles.informationContainer}>
        <p style={{ ...styles.label, ...styles.labelDriver }}>
          {localizations.event_carPooling_driver}
        </p>
      </div>
      <div style={styles.informationContainer}>
        <span style={styles.driverContainer}>
          <div
            style={{
              ...styles.icon,
              backgroundImage: carPooling.driver && carPooling.driver.avatar
                ? `url(${carPooling.driver.avatar})`
                : 'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")',
            }}
          />
          {carPooling.driver.pseudo}
        </span>
      </div>

      {/* departure place */}
      <div style={styles.informationContainer}>
        <span style={styles.label}>
          {`${localizations.event_carPooling_place}: `}
        </span>
        {carPooling.address && (
          <span style={styles.information}>
            {`${carPooling.address.address}, ${carPooling.address.city}`}
          </span>
        )}
      </div>

      {/* remaining sits */}
      <div style={styles.informationContainer}>
        <span style={styles.label}>
          {`${localizations.event_carPooling_sitsNumber}: `}
        </span>
        <span style={styles.information}>
          {carPooling.passengers
            ? carPooling.number_of_sits - carPooling.passengers.length
            : carPooling.number_of_sits}
        </span>
      </div>

      {/* passengers */}
      <div style={styles.informationContainer}>
        <span style={styles.label}>
          {`${localizations.event_carPooling_passengers}: `}
        </span>
        {carPooling.passengers && carPooling.passengers.length > 0 ? (
          carPooling.passengers.map(passenger => (
            <span key={passenger.id} style={styles.driverContainer}>
              <div
                style={{
                  ...styles.icon,
                  backgroundImage: passenger.avatar
                    ? `url(${passenger.avatar})`
                    : 'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")',
                }}
              />
              {passenger.pseudo}
            </span>
          ))
        ) : (
          <span style={styles.information}>
            {localizations.event_carPooling_none}
          </span>
        )}
      </div>
    </Grid>
    <Grid item xs={4}>
      <div style={timeStyles.info}>
        <div style={timeStyles.datetime}>
          <span style={timeStyles.dayBold}>
            {moment(carPooling.starting_date).format('ddd DD MMM')}
          </span>
          <span style={timeStyles.time}>
            {moment(carPooling.starting_date).format('H:mm')}
          </span>
        </div>
      </div>
    </Grid>
    {/* buttons */}

    {!userIsDriver &&
      !userIsPassenger &&
      carPooling.number_of_sits > carPooling.passengers.length && (
        <Grid item xs={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => !viewOnly && bookCarPooling(carPooling)}
          >
            {localizations.event_carPooling_book}
          </Button>
        </Grid>
      )}

    {userIsDriver === carPooling.id && (
      <Grid item xs={3}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => !viewOnly && updateCarPooling(carPooling)}
        >
          {localizations.event_carPooling_modify}
        </Button>
      </Grid>
    )}

    {userIsDriver === carPooling.id && (
      <Grid item xs={3}>
        <Button
          variant="outlined"
          onClick={() => !viewOnly && cancelCarPooling(carPooling)}
        >
          {localizations.event_carPooling_cancel}
        </Button>
      </Grid>
    )}
    {userIsPassenger === carPooling.id && (
      <Grid item xs={3}>
        <Button
          variant="outlined"
          onClick={() => !viewOnly && cancelCarPoolingBook(carPooling)}
        >
          {localizations.event_carPooling_cancel}
        </Button>
      </Grid>
    )}
  </Grid>
);

export default CarPoolingCard;
