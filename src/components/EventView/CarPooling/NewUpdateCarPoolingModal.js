import React from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import _Geosuggest from 'react-geosuggest';
import { withAlert } from 'react-alert';
import ReactLoading from 'react-loading';

import Button from '@material-ui/core/Button';

import localizations from '../../Localizations';
import { styles, modalStyles } from './styles.js';
import { colors } from '../../../theme';

let Style = Radium.Style;
const Geosuggest = Radium(_Geosuggest);

class CarPoolingModal extends React.Component {
  constructor(props) {
    super(props);
    this.alertOptions = {
      offset: 60,
      position: 'top right',
      theme: 'light',
      transition: 'fade',
    };

    this.state = {
      isLoading: false,
      isModifying: false,
      date: null,
      hour: '',
      address: '',
      country: '',
      city: '',
      number_of_sits: 0,
    };
  }

  componentDidMount = () => {
    if (this.props.carPooling) {
      const { carPooling } = this.props;
      this.setState({
        date: moment(carPooling.starting_date),
        hour: moment(carPooling.starting_date).format('HH:mm'),
        address: carPooling.address.address,
        country: carPooling.address.country,
        city: carPooling.address.city,
        number_of_sits: carPooling.number_of_sits,
        isModifying: true,
      });
    } else if (this.props.sportunity && this.props.sportunity.beginning_date) {
      this.setState({
        date: moment(this.props.sportunity.beginning_date),
      });
    }
  };

  _handleDateChange = moment => {
    this.setState({
      date: moment,
    });
  };

  _handleStartingTimeChange = event => {
    if (event.target.value.length === 2)
      this.setState({
        hour: event.target.value + ':',
      });
    else
      this.setState({
        hour: event.target.value,
      });
  };

  _handleAddressInputChange = value => {
    this.setState({
      address: value,
      country: '',
      city: '',
    });
  };

  _handleAddressChange = ({ label }) => {
    const splitted = label.split(', ');
    const country = splitted[splitted.length - 1] || '';
    const city = splitted[splitted.length - 2] || '';

    this.setState({
      address: splitted[0],
      country,
      city,
    });
  };

  _handleSitNumberChange = event => {
    if (!isNaN(event.target.value)) {
      this.setState({
        number_of_sits: event.target.value,
      });
    }
  };

  _handleSubmit = () => {
    if (this.state.isModifying) this._handleSubmitUpdate();
    else this._handleSubmitNew();
  };

  _handleSubmitNew = () => {
    const { sportunity } = this.props;
    this.setState({ isLoading: true });

    if (
      this.state.date === null ||
      this.state.hour === '' ||
      this.state.address === '' ||
      this.state.country === '' ||
      this.state.city === '' ||
      parseInt(this.state.number_of_sits) <= 0
    ) {
      this.props.alert.show(localizations.event_carPooling_empty_fields, {
        timeout: 2000,
        type: 'error',
      });
      this.setState({ isLoading: false });
      return;
    }

    if (isNaN(this.state.number_of_sits)) {
      this.props.alert.show(localizations.event_carPooling_sitsNumber_error, {
        timeout: 2000,
        type: 'error',
      });
      this.setState({ isLoading: false });
      return;
    }

    let beginningDate = moment(this.state.date);
    beginningDate.set(
      'hour',
      this.state.hour.substr(0, this.state.hour.indexOf(':')),
    );
    beginningDate.set(
      'minute',
      this.state.hour.substr(
        this.state.hour.indexOf(':') + 1,
        this.state.hour.length,
      ),
    );
    beginningDate.set('second', 0);

    if (
      moment().isAfter(beginningDate) ||
      moment(sportunity.beginning_date).isBefore(beginningDate)
    ) {
      this.props.alert.show(localizations.event_carPooling_startingDay_error, {
        timeout: 2000,
        type: 'error',
      });
      this.setState({ isLoading: false });
      return;
    }

    let params = {
      viewer: this.props.viewer,
      sportunityIDVar: this.props.sportunity.id,
      carPoolingVar: {
        driver: this.props.viewer.me.id,
        address: {
          address: this.state.address,
          city: this.state.city,
          country: this.state.country,
        },
        starting_date: beginningDate._d.toISOString(),
        number_of_sits: parseInt(this.state.number_of_sits),
      },
    };

    this.props.newCarPooling(params);
  };

  _handleSubmitUpdate = () => {
    const { sportunity } = this.props;
    this.setState({ isLoading: true });

    if (
      this.state.date === null ||
      this.state.hour === '' ||
      this.state.address === '' ||
      this.state.country === '' ||
      this.state.city === '' ||
      parseInt(this.state.number_of_sits) <= 0
    ) {
      this.props.alert.show(localizations.event_carPooling_empty_fields, {
        timeout: 2000,
        type: 'error',
      });
      this.setState({ isLoading: false });
      return;
    }

    if (isNaN(this.state.number_of_sits)) {
      this.props.alert.show(localizations.event_carPooling_sitsNumber_error, {
        timeout: 2000,
        type: 'error',
      });
      this.setState({ isLoading: false });
      return;
    }

    let beginningDate = moment(this.state.date);
    beginningDate.set(
      'hour',
      this.state.hour.substr(0, this.state.hour.indexOf(':')),
    );
    beginningDate.set(
      'minute',
      this.state.hour.substr(
        this.state.hour.indexOf(':') + 1,
        this.state.hour.length,
      ),
    );
    beginningDate.set('second', 0);

    if (
      moment().isAfter(beginningDate) ||
      moment(sportunity.beginning_date).isBefore(beginningDate)
    ) {
      this.props.alert.show(localizations.event_carPooling_startingDay_error, {
        timeout: 2000,
        type: 'error',
      });
      this.setState({ isLoading: false });
      return;
    }

    let params = {
      viewer: this.props.viewer,
      sportunityIDVar: this.props.sportunity.id,
      carPoolingIDVar: this.props.carPooling.id,
      carPoolingVar: {
        driver: this.props.viewer.me.id,
        address: {
          address: this.state.address,
          city: this.state.city,
          country: this.state.country,
        },
        starting_date: beginningDate._d.toISOString(),
        number_of_sits: parseInt(this.state.number_of_sits),
      },
    };

    this.props.updateCarPooling(params);
  };

  render() {
    const { sportunity, viewer } = this.props;
    const { isModifying } = this.state;

    return (
      <Modal
        isOpen={this.props.isModalVisible}
        onAfterOpen={this.afterOpenModal}
        onRequestClose={this.props.closeModal}
        style={modalStyles}
        contentLabel={
          isModifying
            ? localizations.event_carPooling_modify_carPooling
            : localizations.event_carPooling_create
        }
      >
        <div style={styles.modalContent}>
          <div style={styles.modalHeader}>
            <div style={styles.modalTitle}>
              {isModifying
                ? localizations.event_carPooling_modify_carPooling
                : localizations.event_carPooling_create}
            </div>
            <div style={styles.modalClose} onClick={this.props.closeModal}>
              <i className="fa fa-times fa-2x" />
            </div>
          </div>
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
              input: styles.input,
            }}
          />
          <Style
            scopeSelector=".react-datepicker-popper"
            rules={{
              zIndex: 10,
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

          <div>
            <div style={styles.inputRow}>
              <span style={styles.inputLabel}>
                {localizations.event_carPooling_address + ': '}
              </span>
              <div style={styles.inputContainer}>
                <Geosuggest
                  style={styles.geosuggest}
                  placeholder={localizations.newSportunity_addressHolder}
                  initialValue={
                    this.state.address !== '' && this.state.city !== ''
                      ? this.state.address + ', ' + this.state.city
                      : ''
                  }
                  onSuggestSelect={this._handleAddressChange}
                  onChange={this._handleAddressInputChange}
                  location={this.props.userLocation}
                  radius={50000}
                />
              </div>
            </div>

            <div style={styles.inputRow}>
              <span style={styles.inputLabel}>
                {localizations.event_carPooling_day + ': '}
              </span>
              <div className="datetime-day" style={styles.inputContainer}>
                <DatePicker
                  dateFormat="DD/MM/YYYY"
                  todayButton={localizations.newSportunity_today}
                  selected={this.state.date}
                  onChange={this._handleDateChange}
                  minDate={moment()}
                  maxDate={moment(sportunity.beginning_date)}
                  locale={localizations.getLanguage().toLowerCase()}
                  nextMonthButtonLabel=""
                  previousMonthButtonLabel=""
                />
              </div>
            </div>

            <div style={styles.inputRow}>
              <span style={styles.inputLabel}>
                {localizations.event_carPooling_hour + ': '}
              </span>
              <div style={styles.inputContainer}>
                <input
                  type="text"
                  maxLength="5"
                  value={this.state.hour}
                  onChange={this._handleStartingTimeChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.inputRow}>
              <span style={styles.inputLabel}>
                {localizations.event_carPooling_numberOfSits + ': '}
              </span>
              <div style={styles.inputContainer}>
                <input
                  type="text"
                  maxLength="2"
                  value={
                    this.state.number_of_sits === 0
                      ? ''
                      : this.state.number_of_sits
                  }
                  onChange={this._handleSitNumberChange}
                  style={styles.input}
                />
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: 15,
            }}
          >
            {this.state.isLoading ? (
              <ReactLoading type="cylon" color={colors.blue} />
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={this._handleSubmit}
              >
                {localizations.event_carPooling_validate}
              </Button>
            )}
          </div>
        </div>
      </Modal>
    );
  }
}

const dispatchToProps = dispatch => ({});

const stateToProps = state => ({
  userLocation: state.globalReducer.userLocation,
});

export default connect(
  stateToProps,
  dispatchToProps,
)(Radium(withAlert(CarPoolingModal)));
