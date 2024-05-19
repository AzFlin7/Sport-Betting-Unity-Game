import React from 'react';
import PureComponent from '../common/PureComponent';
import Radium from 'radium';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Modal from 'react-modal';
import { withAlert } from 'react-alert';
import DatePicker from 'react-datepicker';
import moment from 'moment';

import * as types from '../../actions/actionTypes';
import { fonts, colors } from '../../theme';

import FilterAdvanced from './FilterAdvanced';

import SportSelect from '../common/FilterSidebar/FilterSport';
import SportLevels from '../common/FilterSidebar/FilterLevels';

import localizations from '../Localizations';
import FilterSidebar from '../common/FilterSidebar';
import Menu from '../common/FilterSidebar/Menu';
import FilterItem from '../common/FilterSidebar/FilterItem';
import SidebarButton from '../common/FilterSidebar/SidebarButton';
import FilterPlace from '../common/FilterSidebar/FilterPlace';
import InputText from './InputText';
import NewFilterModal from './NewFilterModal';

let styles;
let inputStyles;
let modalStyles;
const Style = Radium.Style;

const FilterDate = props => {
  const { value, containerStyle, onChange, label, minDate } = props;
  const finalContainerStyle = Object.assign(
    {},
    inputStyles.container,
    containerStyle,
  );

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
          '.form-control': inputStyles.time,
        }}
      />
      <Style
        scopeSelector=".datetime-day"
        rules={{
          input: inputStyles.date,
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
          '.react-datepicker__navigation': {
            textIndent: '-999px !important',
            lineHeight: '0 !important',
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            right: '0',
            backgroundColor: 'transparent',
          },
        }}
      />
      <Style
        scopeSelector=".react-datepicker-popper"
        rules={{
          zIndex: 2,
        }}
      />

      <label style={inputStyles.label}>{label}</label>
      <div style={{ flex: 5 }} className="datetime-day">
        <DatePicker
          dateFormat="DD/MM/YYYY"
          todayButton={localizations.newSportunity_today}
          selected={value ? moment(value) : null}
          onChange={onChange}
          minDate={moment(minDate)}
          locale={localizations.getLanguage().toLowerCase()}
          popperPlacement="top-end"
          nextMonthButtonLabel=""
          previousMonthButtonLabel=""
        />
      </div>
    </div>
  );
};

class FilterOpen extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      clubOpen: true,
      sportOpen: true,
      dateOpen: true,
      locationOpen: true,
      suggestions: [],
      selectedSportId: '',
      value: this.props.sportName,
      alertDateFrom: false,
      alertDateTo: false,
      alertHourFrom: false,
      alertHourTo: false,
      levelFrom: '',
      levelTo: '',
      filterName: '',
      selectedLocation: null,
      filterListIsOpen: false,
      selectedFilter: null,
      saveFilterModalIsOpen: false,
      modalText: '',
      modalOnConfirm: null,
      distanceRange: '',
      createFilter: false,
      newFilterModalOpen: false,
      loadingAllSports: false
    };
    this.alertOptions = {
      offset: 60,
      position: 'top right',
      theme: 'light',
      transition: 'fade',
    };
  }

  componentDidMount() {
    window.addEventListener('click', this._handleClickOutside);
    if (this.props.distanceRange) {
      this.setState({
        distanceRange: this.props.distanceRange,
      });
    }
  }

  componentWillReceiveProps = nextProps => {
    if (
      this.props.distanceRange !== nextProps.distanceRange &&
      nextProps.distanceRange !== this.state.distanceRange
    )
      this.setState({
        distanceRange: nextProps.distanceRange,
      });
    if (
      this.props.locationLat !== nextProps.locationLat ||
      this.props.locationLng !== nextProps.locationLng
    ) {
      this.setState({
        selectedLocation: {
          lat: nextProps.locationLat,
          lng: nextProps.locationLng,
          radius: this.props.distanceRange,
        },
      });
    }
  };

  componentWillUnmount() {
    window.removeEventListener('click', this._handleClickOutside);
  }

  _handleClickOutside = event => {
    if (this._containerNode && !this._containerNode.contains(event.target)) {
      this.setState({ filterListIsOpen: false });
    }
  };

  _locationSelected = suggest => {
    if (!this.props.distanceRange) {
      this.setState({
        distanceRange: 100,
      });
      this.props._updateDistanceRange(100);
      this.props.onDistanceRangeChange(100);
    }
    this.props._updateLocationAction(
      suggest.label,
      suggest.location.lat,
      suggest.location.lng,
    );
    this.props.onLocationChange(suggest.location.lat, suggest.location.lng);
    this.setState({
      selectedLocation: suggest.location,
    });
  };

  _handleRemoveLocation = () => {
    this.props._updateLocationAction('', null, null);
    this.props._updateDistanceRange('');
    this.setState({
      selectedLocation: null,
      distanceRange: '',
    });
    // this.props.onLocationChange(null, null)
  };

  _handleLocationChange = value => {
    if (!value) {
      this.setState({
        selectedLocation: null,
      });
    }
  };

  _onChange = (event, { newValue }) => {
    this.setState({
      value: newValue,
    });
  };

  _selectSport = suggestion => {
    if (suggestion) {
      this.props._updateSportAction(suggestion.value, suggestion.name);
      this.props.setLevels(suggestion.levels);
      this.setState({
        selectedSportId: suggestion.value,
      });
    } else {
      // this.props._updateSportAction('', '')
      // this.props.setLevels([])
      this.setState({
        selectedSportId: '',
      });
      this._handleRemoveSport();
    }
  };
  _handleLoadAllSports = () => {
    this.setState({loadingAllSports: true})
    this.props.relay.refetch(fragmentVariables => ({
        ...fragmentVariables, 
        sportsNb: 1000,
        filterName: { name: '', language: 'EN' },
      }),
      null,
      () => this.setState({
        allSportsLoaded: true,
        loadingAllSports: false
      })
    );
    
  };

  _updateSportFilter = value => {
    if (this.props.variables.sportsNb < 1000 && value.length >= 2) {
      this.props.relay.refetch(fragmentVariables => ({
        ...fragmentVariables, 
        filterName: {
          name: value,
          language: localizations.getLanguage().toUpperCase(),
        },
        sportsNb: 5,
      }));
    }
  };

  _setOpen = e => {
    e.preventDefault();
    this.setState({ isOpen: !this.state.isOpen });
  };

  _isFreeChanged = e => {
    this.props._updateIsFreeOnly(e.target.checked);
  };

  _distanceRangeBlur = () => {
    this.props._updateDistanceRange(this.state.distanceRange);
    this.props.onDistanceRangeChange(this.state.distanceRange);
  };

  _distanceRangeChanged = e => {
    this.setState({
      distanceRange: e.target.value,
    });
  };

  _setDateAlert = () => {
    let alertDateFrom = !!(this.props.dateFrom && this.props.dateTo);
    let alertDateTo = !!(this.props.dateFrom && this.props.dateTo);

    if (
      this.props.dateFrom &&
      this.props.dateTo &&
      this.props.dateFrom > this.props.dateTo
    ) {
      alertDateFrom = true;
      alertDateTo = true;
    } else if (this.props.dateFrom && this.props.dateTo) {
      alertDateFrom = false;
      alertDateTo = false;
    }

    if (this.state.alertDateFrom !== alertDateFrom) {
      this.setState({
        alertDateFrom,
      });
    }

    if (this.state.alertDateTo !== alertDateTo) {
      this.setState({
        alertDateTo,
      });
    }
  };

  _setHourAlert = () => {
    let alertHourFrom = !this.props.hourFrom && this.props.hourTo;
    let alertHourTo = this.props.hourFrom && !this.props.hourTo;

    if (
      this.props.hourFrom &&
      this.props.hourTo &&
      this.props.hourFrom > this.props.hourTo
    ) {
      alertHourFrom = true;
      alertHourTo = true;
    }

    if (this.state.alertHourFrom !== alertHourFrom) {
      this.setState({
        alertHourFrom,
      });
    }

    if (this.state.alertHourTo !== alertHourTo) {
      this.setState({
        alertHourTo,
      });
    }
  };

  _dateFromChanged = e => {
    this.props._updateDateFrom(e._d);
    if (new Date(e._d) > new Date('01/01/2000')) this._setDateAlert();
  };

  _dateToChanged = e => {
    this.props._updateDateTo(e._d);
    if (new Date(e._d) > new Date('01/01/2000')) {
      this._setDateAlert();
    }
  };

  _hourFromChanged = e => {
    this.props._updateHourFrom(e.target.value);
    // this.setState({ dateFrom: e.target.value }) //set state value to the input value
  };

  _hourToChanged = e => {
    this.props._updateHourTo(e.target.value);
    // this.setState({ dateFrom: e.target.value }) //set state value to the input value
  };

  _updateLevelRange = (levelFrom, levelTo) => {
    const { levels } = this.props;
    if (!levelFrom || !levelTo) {
      this.props.setSelectedLevels([]);
    } else {
      const fromIndex = levels.findIndex(e => e.id == levelFrom.value);
      const toIndex = levels.findIndex(e => e.id == levelTo.value);
      const selectedLevels = levels.slice(fromIndex, toIndex + 1);
      this.props.setSelectedLevels(selectedLevels);
    }
  };

  _setLevelFrom = value => {
    this.setState({
      levelFrom: value,
    });
    this._updateLevelRange(value, this.state.levelTo);
  };

  _setLevelTo = value => {
    this.setState({
      levelTo: value,
    });
    this._updateLevelRange(this.state.levelFrom, value);
  };

  _handleRemoveSport = () => {
    this.props.setLevels([]);
    this.props._updateSportAction('', '');
    this.setState({
      value: '',
      levelFrom: null,
      levelTo: null,
    });
    this._setLevelFrom();
    this._setLevelTo();
  };

  componentDidUpdate() {
    this._setDateAlert();
    this._setHourAlert();
  }

  _handleApplyFilter = item => {
    this.setState({
      selectedFilter: item,
      filterListIsOpen: false,
      filterName: item.filterName,
    });

    // Setting the sport
    this.props._updateSportAction(
      item.sport[0].sport.id,
      item.sport[0].sport.name[localizations.getLanguage().toUpperCase()],
    );
    this.props.setLevels(item.sport[0].sport.levels);
    this.setState({ selectedSportId: item.sport[0].sport.id });

    // Setting the levels
    if (item.sport[0].levels && item.sport[0].levels.length > 0) {
      const selectedLevels = item.sport[0].levels;
      selectedLevels.sort(
        (a, b) =>
          a[localizations.getLanguage().toUpperCase()].skillLevel -
          b[localizations.getLanguage().toUpperCase()].skillLevel,
      );

      this._updateLevelRange(
        {
          bold: { from: 0, to: 0 },
          description:
            selectedLevels[0][localizations.getLanguage().toUpperCase()]
              .description,
          name:
            selectedLevels[0][localizations.getLanguage().toUpperCase()].name,
          skillLevel:
            selectedLevels[0][localizations.getLanguage().toUpperCase()]
              .skillLevel,
          value: selectedLevels[0].id,
        },
        {
          bold: { from: 0, to: 0 },
          description:
            selectedLevels[selectedLevels.length - 1][
              localizations.getLanguage().toUpperCase()
            ].description,
          name:
            selectedLevels[selectedLevels.length - 1][
              localizations.getLanguage().toUpperCase()
            ].name,
          skillLevel:
            selectedLevels[selectedLevels.length - 1][
              localizations.getLanguage().toUpperCase()
            ].skillLevel,
          value: selectedLevels[selectedLevels.length - 1].id,
        },
      );
      this.setState({
        levelFrom: {
          bold: { from: 0, to: 0 },
          description:
            selectedLevels[0][localizations.getLanguage().toUpperCase()]
              .description,
          name:
            selectedLevels[0][localizations.getLanguage().toUpperCase()].name,
          skillLevel:
            selectedLevels[0][localizations.getLanguage().toUpperCase()]
              .skillLevel,
          value: selectedLevels[0].id,
        },
        levelTo: {
          bold: { from: 0, to: 0 },
          description:
            selectedLevels[selectedLevels.length - 1][
              localizations.getLanguage().toUpperCase()
            ].description,
          name:
            selectedLevels[selectedLevels.length - 1][
              localizations.getLanguage().toUpperCase()
            ].name,
          skillLevel:
            selectedLevels[selectedLevels.length - 1][
              localizations.getLanguage().toUpperCase()
            ].skillLevel,
          value: selectedLevels[selectedLevels.length - 1].id,
        },
      });
    }

    // Setting the dates
    this.props._updateDateFrom(
      item.dates && item.dates.from ? item.dates.from : '',
    );
    this.props._updateDateTo(item.dates && item.dates.to ? item.dates.to : '');

    // Setting the place
    if (item.location && item.location.lat && item.location.lng) {
      const geocoder = new google.maps.Geocoder();
      let city;
      geocoder.geocode(
        { latLng: new google.maps.LatLng(item.location) },
        (results, status) => {
          if (status === 'OK') {
            for (let a = 0; a < results.length; a++) {
              let resultIdFound = false;
              for (let n = 0; n < results[a].types.length; n++) {
                if (results[a].types[n] === 'locality') {
                  resultIdFound = true;
                }
              }
              if (resultIdFound) {
                for (
                  let i = 0;
                  i < results[a].address_components.length;
                  i++
                ) {
                  for (
                    let b = 0;
                    b < results[a].address_components[i].types.length;
                    b++
                  ) {
                    if (
                      results[a].address_components[i].types[b] == 'locality'
                    ) {
                      city = results[a].address_components[i].long_name;
                      break;
                    }
                  }
                }
              }
            }
          }

          if (item.location.radius) {
            this.setState({
              distanceRange: item.location.radius,
            });
            this._distanceRangeBlur(item.location.radius);
          } else {
            this.setState({
              distanceRange: 100,
            });
            this._distanceRangeBlur(100);
          }

          if (city) {
            this._locationSelected({
              location: item.location,
              label: city,
            });
          } else {
            this._locationSelected({
              location: item.location,
              label: 'Suisse',
            });
          }
        },
      );
    } else {
      this._handleRemoveLocation();
    }

    // Setting the price
    this.props._updateIsFreeOnly(
      item.price && item.price.from === 0 && item.price.to === 0,
    );
  };

  _openFilterList = () => {
    this.setState({
      filterListIsOpen: !this.state.filterListIsOpen,
    });
  };

  _handleFilterNameChange = event => {
    this.setState({
      filterName: event.target.value,
    });
  };

  _handleSaveFilter = () => {
    if (!this.props.viewer.me) {
      this.props.alert.show(
        localizations.popup_findSportunity_filter_login_needed,
        {
          timeout: 3000,
          type: 'info',
          ...this.alertOptions,
        },
      );
      return;
    }
    if (!this.state.filterName) {
      this.props.alert.show(
        localizations.popup_findSportunity_filter_name_needed,
        {
          timeout: 3000,
          type: 'info',
          ...this.alertOptions,
        },
      );
      return;
    }
    if (!this.state.selectedSportId) {
      this.props.alert.show(
        localizations.popup_findSportunity_filter_sport_needed,
        {
          timeout: 3000,
          type: 'info',
          ...this.alertOptions,
        },
      );
      return;
    }
    if (this.state.alertDateFrom || this.state.alertDateTo) {
      this.props.alert.show(
        localizations.popup_findSportunity_filter_date_needed,
        {
          timeout: 3000,
          type: 'info',
          ...this.alertOptions,
        },
      );
      return;
    }

    if (this.props.user) {
      let filterExists = false;
      const savedFilters = this.props.user.savedFilters.forEach(filter => {
        if (filter.filterName === this.state.filterName) {
          filterExists = true;
        }
      });
      if (filterExists)
        this.setState({
          saveFilterModalIsOpen: true,
          modalText: `${localizations.find_confirm_modify_filter} ${
            this.state.filterName
          } ?`,
          modalOnConfirm: () => this._handleConfirmModifyFilter(),
          createFilter: false,
        });
      else this._handleCreateNewFilter();
    }
  };

  _handleConfirmModifyFilter = () => {
    const data = {
      filterName: this.state.filterName,
      sport: {
        sportID: this.state.selectedSportId,
        level:
          this.props.selectedLevels && this.props.selectedLevels.length > 0
            ? this.props.selectedLevels.map(level => level.id)
            : null,
      },
      location: this.state.selectedLocation
        ? {
            lat: this.state.selectedLocation.lat,
            lng: this.state.selectedLocation.lng,
            radius: this.props.distanceRange,
          }
        : null,
      price: this.props.isFreeOnly ? { from: 0, to: 0 } : null,
      dates:
        this.props.dateFrom && this.props.dateTo
          ? { from: this.props.dateFrom, to: this.props.dateTo }
          : null,
      page: 'FIND',
    };

    const savedFilters = this.props.user.savedFilters.map(filter => {
      if (filter.filterName === this.state.filterName) {
        return data;
      }
      return {
        filterName: filter.filterName,
        dates: filter.dates
          ? {
              from: filter.dates.from,
              to: filter.dates.to,
            }
          : null,
        sport:
          filter.sport[0] && filter.sport[0].sport
            ? {
                sportID: filter.sport[0].sport.id,
                level: filter.sport[0].levels.map(level => level.id),
              }
            : null,
        price: filter.price
          ? {
              from: filter.price.from,
              to: filter.price.to,
            }
          : null,
        location: {
          lng: filter.location.lng,
          lat: filter.location.lat,
          radius: filter.location.radius,
        },
        page: filter.page,
      };
    });

    this.props.onSaveFilters(savedFilters);
    this.closeModal();
  };

  _handleCreateNewFilter = () => {
    const savedFilters = this.props.user.savedFilters.map(filter => ({
      filterName: filter.filterName,
      dates: filter.dates
        ? {
            from: filter.dates.from,
            to: filter.dates.to,
          }
        : null,
      sport:
        filter.sport && filter.sport.length > 0
          ? {
              sportID: filter.sport[0].sport.id,
              level: filter.sport[0].levels
                ? filter.sport[0].levels.map(level => level.id)
                : [],
            }
          : null,
      price: filter.price
        ? {
            from: filter.price.from,
            to: filter.price.to,
          }
        : null,
      location: {
        lng: filter.location.lng,
        lat: filter.location.lat,
        radius: filter.location.radius,
      },
      page: filter.page,
    }));

    savedFilters.push({
      filterName: this.state.filterName,
      sport: {
        sportID: this.state.selectedSportId,
        level:
          this.props.selectedLevels && this.props.selectedLevels.length > 0
            ? this.props.selectedLevels.map(level => level.id)
            : null,
      },
      location: this.state.selectedLocation
        ? {
            lat: this.state.selectedLocation.lat,
            lng: this.state.selectedLocation.lng,
            radius: this.props.distanceRange,
          }
        : null,
      price: this.props.isFreeOnly ? { from: 0, to: 0 } : null,
      page: 'FIND',
      dates:
        this.props.dateFrom && this.props.dateTo
          ? { from: this.props.dateFrom, to: this.props.dateTo }
          : null,
    });

    this.props.onSaveFilters(savedFilters);
    this.closeModal();
  };

  onRemoveFilter = item => {
    this.setState({
      saveFilterModalIsOpen: true,
      modalText: `${localizations.find_confirm_delete_filter} ${
        item.filterName
      } ?`,
      modalOnConfirm: () => this._handleConfirmDeleteFilter(item),
    });
  };

  _handleConfirmDeleteFilter = item => {
    const savedFilters = this.props.user.savedFilters
      .map(filter => {
        if (filter.filterName === item.filterName) return false;
        return {
          filterName: filter.filterName,
          dates: filter.dates
            ? {
                from: filter.dates.from,
                to: filter.dates.to,
              }
            : null,
          sport:
            filter.sport && filter.sport[0]
              ? {
                  sportID: filter.sport[0].sport.id,
                  level:
                    filter.sport[0].levels &&
                    filter.sport[0].levels.map(level => level.id),
                }
              : null,
          price: filter.price
            ? {
                from: filter.price.from,
                to: filter.price.to,
              }
            : null,
          location: {
            lng: filter.location.lng,
            lat: filter.location.lat,
            radius: filter.location.radius,
          },
          page: filter.page,
        };
      })
      .filter(filter => Boolean(filter));

    this.props.onSaveFilters(savedFilters);

    this.setState({
      selectedFilter: null,
      filterListIsOpen: false,
      filterName: '',
    });

    this.closeModal();
  };

  closeModal = () => {
    this.setState({
      saveFilterModalIsOpen: false,
      modalText: '',
      modalOnConfirm: null,
    });
  };

  _translatedName = name => {
    let translatedName = name.EN;
    switch (localizations.getLanguage().toLowerCase()) {
      case 'en':
        translatedName = name.EN;
        break;
      case 'fr':
        translatedName = name.FR || name.EN;
        break;
      case 'it':
        translatedName = name.IT || name.EN;
        break;
      case 'de':
        translatedName = name.DE || name.EN;
        break;
      default:
        translatedName = name.EN;
        break;
    }
    return translatedName;
  };

  _translatedLevelName = levelName => {
    let translatedName = levelName.EN.name;
    switch (localizations.getLanguage().toLowerCase()) {
      case 'en':
        translatedName = levelName.EN.name;
        break;
      case 'fr':
        translatedName = levelName.FR.name || levelName.EN.name;
        break;
      case 'it':
        translatedName = levelName.IT.name || levelName.EN.name;
        break;
      case 'de':
        translatedName = levelName.DE.name || levelName.EN.name;
        break;
      default:
        translatedName = levelName.EN.name;
        break;
    }
    return translatedName;
  };

  render() {
    const { levels } = this.props;
    const sportsList = this.props.viewer.sports.edges.map(({ node }) => ({
      ...node,
      name: this._translatedName(node.name),
      value: node.id,
    }));
    
    const savedFilters = this.props.user
      ? this.props.user.savedFilters.filter(filter => filter.page === 'FIND')
      : [];

    return (
      <section style={{ width: '100%' }}>
        <Modal
          isOpen={this.state.saveFilterModalIsOpen}
          onRequestClose={this.closeModal}
          style={modalStyles}
          contentLabel={localizations.circle_editDelete}
        >
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>{this.state.modalText}</div>
              <div style={styles.modalClose} onClick={this.closeModal}>
                <i className="fa fa-times fa-2x" />
              </div>
            </div>
            <button
              onClick={this.state.modalOnConfirm}
              style={styles.editButton}
            >
              {localizations.info_update}
            </button>
            <button onClick={this.closeModal} style={styles.deleteButton}>
              {localizations.info_cancel}
            </button>
          </div>
        </Modal>

        <NewFilterModal
          open={this.state.newFilterModalOpen}
          onClose={() => this.setState({ newFilterModalOpen: false })}
          onCancel={() => this.setState({ createFilter: false })}
          onConfirm={() => this.setState({ createFilter: true })}
        />
        {this.props.user && (
          <FilterSidebar title={localizations.myEvents_savedFilter_title}>
            {savedFilters &&
              savedFilters.length > 0 && (
                <Menu title={localizations.myEvents_savedFilter_myFilters}>
                  {savedFilters.map((filter, index) => (
                    <FilterItem
                      key={`filter${index}`}
                      label={filter.filterName}
                      selected={
                        this.state.selectedFilter &&
                        this.state.selectedFilter.id === filter.id
                      }
                      defaultFilter={
                        this.state.defaultFilter &&
                        this.state.defaultFilter.id === filter.id
                      }
                      onChange={() => this._handleApplyFilter(filter)}
                      onDelete={() => this.onRemoveFilter(filter)}
                    />
                  ))}
                </Menu>
              )}
            {!this.state.selectDefault &&
              (this.state.createFilter ? (
                <div style={styles.inputRow}>
                  <InputText
                    placeholder={localizations.myEvents_savedFilter_name}
                    value={this.state.newFilterName}
                    onChange={this._handleFilterNameChange}
                  />
                  <i
                    className="fa fa-check"
                    style={{
                      backgroundColor: colors.green,
                      color: colors.white,
                      cursor: 'pointer',
                      fontSize: '0.7em',
                      padding: '0.3em',
                    }}
                    onClick={this._handleSaveFilter}
                  />
                  <i
                    className="fa fa-times"
                    style={{
                      backgroundColor: colors.red,
                      color: colors.white,
                      cursor: 'pointer',
                      fontSize: '0.7em',
                      padding: '0.3em',
                    }}
                    onClick={() =>
                      this.setState({ createFilter: false, filterName: '' })
                    }
                  />
                </div>
              ) : (
                <SidebarButton
                  onClick={() => {
                    this.state.createFilter !== true &&
                      this.setState({ newFilterModalOpen: true });
                  }}
                  label={localizations.myEvents_savedFilter_create}
                  iconFa="fa-plus-circle"
                  color={colors.green}
                  textColor={colors.white}
                />
              ))}
          </FilterSidebar>
        )}

        <FilterSidebar title={localizations.myEvents_filterBy}>
          <Menu title={localizations.find_city}>
            <FilterPlace
              label={localizations.find_city}
              distanceLabel={localizations.find_distance}
              locationName={this.props.locationName}
              _handleRemoveLocation={this._handleRemoveLocation}
              placeholder={localizations.find_cityHolder}
              distanceRange={this.state.distanceRange}
              _distanceRangeChanged={this._distanceRangeChanged}
              _distanceRangeBlur={this._distanceRangeBlur}
              userLocation={this.props.userLocation}
              radius={50000}
              _handleLocationChange={this._handleLocationChange}
              _locationSelected={this._locationSelected}
              hideRange={false}
            />
          </Menu>

          <Menu title={localizations.find_sport}>
            <SportSelect
              style={styles.select}
              label={localizations.find_sport}
              onChange={this._selectSport}
              onSearching={this._updateSportFilter}
              list={sportsList}
              required
              placeholder={localizations.find_sportHolder}
              onLoadAllClick={this._handleLoadAllSports}
              allSportLoaded={this.state.allSportsLoaded}
              loadingAllSports={this.state.loadingAllSports}
              value={this.props.value}
              _updateSportNameAction={this.props._updateSportNameAction}
              sportName={this.props.sportName}
            />
            <SportLevels
              label={localizations.find_levels}
              list={levels}
              from={this.state.levelFrom}
              to={this.state.levelTo}
              placeholder={
                !this.props.sportId
                  ? localizations.newSportunity_levelHolderBefore
                  : localizations.find_selection_no_choice
              }
              onFromChange={this._setLevelFrom}
              onToChange={this._setLevelTo}
              disabled={levels.length === 0}
            />
          </Menu>

          <Menu title={localizations.find_date}>
            <FilterDate
              label={localizations.find_from}
              onChange={this._dateFromChanged}
              value={this.props.dateFrom}
              inputStyle={
                this.state.alertDateFrom
                  ? styles.inputDateAlert
                  : styles.inputDate
              }
              minDate={new Date()}
            />

            <FilterDate
              label={localizations.find_to}
              onChange={this._dateToChanged}
              value={this.props.dateTo}
              inputStyle={
                this.state.alertDateTo
                  ? styles.inputDateAlert
                  : styles.inputDate
              }
              minDate={this.props.dateFrom ? this.props.dateFrom : new Date()}
            />
          </Menu>

          <div style={styles.row}>
            <div style={styles.freeLabel}>
              {localizations.find_free}
              <input
                style={styles.checkBox}
                type="checkbox"
                onChange={this._isFreeChanged}
                checked={this.props.isFreeOnly}
              />
            </div>
          </div>

          <FilterAdvanced />
        </FilterSidebar>
      </section>
    );
  }
}

styles = {
  filterBox: {
    border: `1px solid ${colors.blue}`,
    margin: 10,
    width: 'calc(100% - 20px)',
  },
  titleContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    padding: '10px 5px',
    width: '100%',
    justifyContent: 'space-between',
    border: `1px solid ${colors.blue}`,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.blue,
  },
  inputRow: {
    display: 'flex',
    fontSize: fonts.size.medium,
    justifyContent: 'space-around',
    alignItems: 'center',
    margin: 5,
  },
  menu_container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginBottom: 5,
  },
  localFilterContainer: {
    padding: 10,
    border: `3px solid ${colors.blue}`,
  },
  triangleFilter: {
    width: 0,
    height: 0,

    transition: 'border 100ms',
    transitionOrigin: 'left',

    color: colors.blue,

    cursor: 'pointer',

    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderTop: `8px solid ${colors.blue}`,
  },
  triangleFilterOpen: {
    width: 0,
    height: 0,

    transition: 'border 100ms',
    transitionOrigin: 'left',

    color: colors.blue,

    cursor: 'pointer',

    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderBottom: `8px solid ${colors.blue}`,
  },
  sportContainer: {
    position: 'relative',
    width: 280,
    '@media (maxWidth: 768px)': {
      width: '180px',
    },
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    width: '840px',
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,0.1)',
    alignContent: 'flex-end',
    alignItems: 'center',
    height: 55,
    '@media (maxWidth: 768px)': {
      width: '100%',
    },
  },
  logo: {
    width: 30,
    height: 30,
  },
  row: {
    display: 'flex',
    padding: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    position: 'relative',
    marginLeft: 10,
    marginTop: 10,
    '@media (maxWidth: 420px)': {
      display: 'block',
    },
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    height: 55,
    '@media (maxWidth: 420px)': {
      display: 'block',
    },
  },
  columnLeft: {
    flex: '1 0 0',
    width: '420px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  addSportButton: {
    marginLeft: 70,
    marginTop: 10,
    width: 92,
    height: 28,
    backgroundColor: '#5E9FDF',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    borderRadius: 3,
    border: 'none',
    color: colors.white,
    cursor: 'pointer',
  },
  columnRight: {
    flex: '1 0 0',
    width: '420px',
    display: 'flex',
    flexDirection: 'row',
    paddingLeft: 30,
    borderLeftWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,0.1)',
    height: '100%',
    alignItems: 'center',
  },
  container: {
    fontFamily: 'Lato',
    margin: '20px 30px 0px 30px',
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,0.1)',
    // width: 840,
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'row',
    // '@media (maxWidth: 768px)': {
    //   width: 'calc(100% - 60px)',
    // },
    '@media (maxWidth: 768px)': {
      width: 'calc(100% - 40px)',
      margin: '20px 20px 0px',
      display: 'block',
    },
  },
  saveAndLoadContainer: {
    fontFamily: 'Lato',
    margin: '10px 30px',
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,0.1)',
    // width: 840,
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'row',
    '@media (maxWidth: 768px)': {
      width: 'calc(100% - 60px)',
    },
    '@media (maxWidth: 600px)': {
      width: 'calc(100% - 40px)',
      margin: '20px 20px 0px',
      display: 'block',
    },
  },
  dropdown: {
    position: 'absolute',
    top: 40,
    left: 0,

    width: '100%',
    maxHeight: 300,

    backgroundColor: colors.white,

    boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
    border: '2px solid rgba(94,159,223,0.83)',
    padding: 20,

    overflowY: 'scroll',
    overflowX: 'hidden',

    zIndex: 100,
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
  },
  closeCross: {
    position: 'absolute',
    right: 15,
    top: 4,
    width: 0,
    height: 0,
    color: colors.gray,
    marginRight: '15px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  removeCross: {
    float: 'right',
    width: 0,
    color: colors.gray,
    marginRight: '15px',
    cursor: 'pointer',
    fontSize: '16px',
  },

  cancelIcon: {
    marginRight: 15,
  },

  savedFilterWrapper: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
    '@media (maxWidth: 750px)': {
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
  },

  saveIconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    cursor: 'pointer',
  },

  saveText: {
    color: colors.blue,
    fontSize: '18px',
    fontWeight: fonts.weight.medium,
    marginRight: 8,
  },

  saveIcon: {
    marginLeft: 8,
    fontSize: 25,
    color: colors.bloodOrange,
  },

  loadIconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-arount',
    flex: 1,
    width: '100%',
    position: 'relative',
    '@media (maxWidth: 750px)': {
      maxWidth: 385,
    },
  },

  loadInput: {
    borderWidth: 0,
    borderBottomWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.blue,
    height: '30px',
    lineHeight: '36px',
    fontFamily: 'Lato',
    display: 'block',
    background: 'transparent',
    fontSize: fonts.size.medium,
    outline: 'none',
    marginLeft: 10,
    cursor: 'pointer',
  },

  triangle: {
    position: 'absolute',
    right: 10,
    width: 0,
    height: 0,

    transition: 'border 100ms',
    transitionOrigin: 'left',

    color: colors.blue,

    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderTop: `8px solid ${colors.blue}`,
    cursor: 'pointer',
  },

  loadText: {
    color: colors.blue,
    fontSize: '18px',
    fontWeight: fonts.weight.medium,
  },

  wrapperTopLeft: {
    width: '400px',
    verticalAlign: 'top',
    marginBottom: 15,
    '@media (maxWidth: 400px)': {
      width: '240px',
    },
  },
  wrapperTopRight: {
    width: '400px',
    verticalAlign: 'top',
    '@media (maxWidth: 768px)': {
      width: '300',
    },
  },

  wrapperMiddleLeft: {
    width: '400px',
    verticalAlign: 'top',
    marginBottom: 15,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    '@media (maxWidth: 420px)': {
      display: 'block',
      width: '100%',
      textAlign: 'center',
    },
  },
  wrapperMiddleRight: {
    width: '400px',
    verticalAlign: 'top',
    marginBottom: 15,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  wrapperBottomLeft: {
    display: 'flex',
    flexDirection: 'row',
    // width: '320px',
    // marginRight: '80px',
    verticalAlign: 'top',
    marginBottom: 10,
    position: 'relative',
    alignItems: 'center',
    flex: 1,
    '@media (maxWidth: 420px)': {
      display: 'block',
      width: '240px',
    },
  },
  wrapperBottomRight: {
    display: 'flex',
    flexDirection: 'row',
    // width: '400px',
    verticalAlign: 'top',
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
    flex: 1,
  },
  label: {
    color: colors.blue,
    fontSize: '18px',
    fontWeight: fonts.weight.medium,
    width: 70,
    marginRight: 10,
  },
  bigLabel: {
    color: colors.blue,
    fontSize: '18px',
    fontWeight: fonts.weight.medium,
    marginRight: 10,
  },
  labelKm: {
    color: colors.blue,
    fontSize: '18px',
    fontWeight: fonts.weight.medium,
    marginRight: 10,
  },
  freeLabel: {
    color: colors.blue,
    fontSize: '18px',
    fontWeight: fonts.weight.medium,
    width: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  smallLabel: {
    color: colors.gray,
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    width: 280,
    borderWidth: 0,
    borderBottomWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.blue,
    height: '30px',
    lineHeight: '36px',
    fontFamily: 'Lato',
    display: 'block',
    background: 'transparent',
    fontSize: fonts.size.medium,
    outline: 'none',
    marginLeft: 0,
    marginRight: 0,
  },
  inputDate: {
    backgroundColor: '#FFFFFF',
    border: '2px solid #5E9FDF',
    borderRadius: '3px',
    marginLeft: 3,
    height: 35,
    textAlign: 'center',
    fontFamily: fonts.size.xl,
    color: 'rgba(146,146,146,0.87)',
    fontSize: 16,
    width: 140,
  },
  inputDateAlert: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.error,
    borderRadius: '3px',
    marginLeft: 3,
    height: 35,
    textAlign: 'center',
    fontFamily: fonts.size.xl,
    color: 'rgba(146,146,146,0.87)',
    fontSize: 16,
    width: 140,
  },
  inputHour: {
    backgroundColor: '#FFFFFF',
    border: '2px solid #5E9FDF',
    borderRadius: '3px',
    marginLeft: 3,
    height: 35,
    textAlign: 'center',
    fontFamily: fonts.size.xl,
    color: 'rgba(146,146,146,0.87)',
    fontSize: 16,
  },
  inputHourAlert: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.error,
    borderRadius: '3px',
    marginLeft: 3,
    height: 35,
    textAlign: 'center',
    fontFamily: fonts.size.xl,
    color: 'rgba(146,146,146,0.87)',
    fontSize: 16,
  },
  distanceRangeContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  distanceRange: {
    width: 50,
    backgroundColor: '#FFFFFF',
    border: '2px solid #5E9FDF',
    borderRadius: '3px',
    marginLeft: 3,
    marginRight: 5,
    height: 35,
    textAlign: 'center',
    fontFamily: fonts.size.xl,
    color: 'rgba(146,146,146,0.87)',
    fontSize: 16,
  },
  button: {
    width: '155px',
    height: '45px',
    backgroundColor: '#5E9FDF',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    borderRadius: '100px',
    border: 'none',
    // marginLeft: 120,
    marginRight: 30,
    fontSize: 16,
    fontWeight: fonts.weight.medium,
    color: colors.white,
    paddingTop: 12,
    paddingBottom: 14,
    textAlign: 'center',
    position: 'relative',
    top: 'px',
    cursor: 'pointer',
    '@media (maxWidth: 420px)': {
      marginLeft: 30,
    },
  },
  checkBox: {
    width: 18,
    height: 18,
    border: '2px solid #5E9FDF',
    display: 'block',
    cursor: 'pointer',
  },
  span: {
    height: '100%',
    width: '37%',
    boxSizing: 'border-box',
    padding: 18,
    borderRight: '1px #ccc solid',
    display: 'inline-flex',
    icon: {
      fontSize: '30px',
      color: '#ccc',
    },
    iconSearch: {
      fontSize: '30px',
      color: '#fff',
      marginLeft: '25%',
    },
    input: {
      /* shall toggle, from <p> to <input> */
      width: 280,
      border: 'none',
      fontFamily: 'Lato',
      fontSize: fonts.size.medium,
      display: 'inline',
      outline: 'none',
      borderWidth: 0,
      borderBottomWidth: 2,
      borderStyle: 'solid',
      borderColor: colors.blue,
      background: 'transparent',
    },
    inputSearch: {
      marginLeft: '15%',
      fontFamily: 'Lato',
      fontSize: fonts.size.medium,
      display: 'inline',
      color: colors.white,
      height: '32px',
      lineHeight: '32px',
      outline: 'none',
    },
  },
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    width: 400,
  },
  modalHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-center',
    justifyContent: 'flex-center',
  },
  modalTitle: {
    fontFamily: 'Lato',
    fontSize: 24,
    fontWeight: fonts.weight.medium,
    color: colors.blue,
    marginBottom: 20,
    flex: '2 0 0',
  },
  modalClose: {
    justifyContent: 'flex-center',
    paddingTop: 10,
    color: colors.gray,
    cursor: 'pointer',
  },
  editButton: {
    width: '400px',
    height: '50px',
    backgroundColor: colors.green,
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    borderRadius: '3px',
    display: 'inline-block',
    fontFamily: 'Lato',
    fontSize: '22px',
    textAlign: 'center',
    color: colors.white,
    borderWidth: 0,
    marginTop: 10,
    marginBottom: 10,
    cursor: 'pointer',
    lineHeight: '27px',
  },
  deleteButton: {
    width: '400px',
    height: '50px',
    backgroundColor: colors.redGoogle,
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    borderRadius: '3px',
    display: 'inline-block',
    fontFamily: 'Lato',
    fontSize: '22px',
    textAlign: 'center',
    color: colors.white,
    borderWidth: 0,
    marginTop: 10,
    marginBottom: 10,
    cursor: 'pointer',
    lineHeight: '27px',
  },
  blockTitle: {
    fontSize: fonts.size.xl,
    width: '100%',
    fontWeight: 'bold',
    padding: 10,
    color: colors.white,
    backgroundColor: colors.blue,
  },
  ownerContainer: {
    textDecoration: 'none',
    color: colors.darkGray,
    fontSize: 16,
    lineHeight: '30px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  icon: {
    width: 25,
    height: 25,
    borderRadius: '50%',
    marginRight: 7,
    backgroundPosition: '50% 50%',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  },
};

modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    border: '1px solid #ccc',
    background: '#fff',
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
    borderRadius: '4px',
    outline: 'none',
    padding: '20px',
  },
};

inputStyles = {
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

const _updateLocationAction = (name, lat, lng) => ({
  type: types.UPDATE_SPORTUNITY_SEARCH_LOCATION,
  locationName: name,
  locationLat: lat,
  locationLng: lng,
});

const _updateSportAction = (id, name) => ({
  type: types.UPDATE_SPORTUNITY_SEARCH_SPORT,
  sportId: id,
  sportName: name,
});

const _updateIsFreeOnly = isFreeOnly => ({
  type: types.UPDATE_SPORTUNITY_SEARCH_FREE_ONLY,
  isFreeOnly: isFreeOnly,
});

const _updateDistanceRange = distanceRange => ({
  type: types.UPDATE_SPORTUNITY_SEARCH_DISTANCE_RANGE,
  distanceRange: distanceRange,
});

const _updateDateFrom = dateFrom => ({
  type: types.UPDATE_SPORTUNITY_SEARCH_DATE_FROM,
  dateFrom: dateFrom,
});

const _updateDateTo = dateTo => ({
  type: types.UPDATE_SPORTUNITY_SEARCH_DATE_TO,
  dateTo: dateTo,
});

const _updateHourFrom = hourFrom => ({
  type: types.UPDATE_SPORTUNITY_SEARCH_HOUR_FROM,
  hourFrom: hourFrom,
});

const _updateHourTo = hourTo => ({
  type: types.UPDATE_SPORTUNITY_SEARCH_HOUR_TO,
  hourTo: hourTo,
});

const _updateSportNameAction = name => ({
  type: types.UPDATE_SPORTUNITY_SEARCH_SPORT_NAME,
  sportName: name,
});

const dispatchToProps = dispatch => ({
  _updateSportAction: bindActionCreators(_updateSportAction, dispatch),
  _updateLocationAction: bindActionCreators(_updateLocationAction, dispatch),
  _updateIsFreeOnly: bindActionCreators(_updateIsFreeOnly, dispatch),
  _updateDistanceRange: bindActionCreators(_updateDistanceRange, dispatch),
  _updateDateFrom: bindActionCreators(_updateDateFrom, dispatch),
  _updateDateTo: bindActionCreators(_updateDateTo, dispatch),
  _updateHourFrom: bindActionCreators(_updateHourFrom, dispatch),
  _updateHourTo: bindActionCreators(_updateHourTo, dispatch),
  _updateSportNameAction: bindActionCreators(_updateSportNameAction, dispatch),
});

const ReduxContainer = connect(
  ({ sportunitySearchReducer, globalReducer }) => ({
    sportId: sportunitySearchReducer.sportId,
    sportName: sportunitySearchReducer.sportName,
    locationName: sportunitySearchReducer.locationName,
    locationLat: sportunitySearchReducer.locationLat,
    locationLng: sportunitySearchReducer.locationLng,
    distanceRange: sportunitySearchReducer.distanceRange,
    isFreeOnly: sportunitySearchReducer.isFreeOnly,
    dateFrom: sportunitySearchReducer.dateFrom,
    dateTo: sportunitySearchReducer.dateTo,
    hourFrom: sportunitySearchReducer.hourFrom,
    hourTo: sportunitySearchReducer.hourTo,
    selectedClubs: sportunitySearchReducer.selectedClubs,
    userCountry: globalReducer.userCountry,
    userLocation: globalReducer.userLocation,
  }),
  dispatchToProps,
)(FilterOpen);

export default withAlert(Radium(ReduxContainer));
