import React, {Component} from 'react';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import isPast from 'date-fns/is_past'
import { withAlert } from 'react-alert'

import { colors, metrics, fonts } from '../../theme';
import FilterSidebar from '../common/FilterSidebar';
import Menu from '../common/FilterSidebar/Menu';
import MenuItem from '../common/FilterSidebar/MenuItem';
import FilterItem from "../common/FilterSidebar/FilterItem";
import SidebarButton from '../common/FilterSidebar/SidebarButton';
import * as types from '../../actions/actionTypes.js';
import localizations from '../Localizations'
import InputText from "./InputText";
import NewFilterModal from "./NewFilterModal";
import InputCheckbox from "../common/Inputs/InputCheckbox";
import SportSelect from '../common/FilterSidebar/FilterSport';
import SportLevels from '../common/FilterSidebar/FilterLevels';
import FilterPlace from '../common/FilterSidebar/FilterPlace';
import FilterDate from '../common/FilterSidebar/FilterDate';

let styles

class Sidebar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      eventStatusOpen: true,
      sportunityTypesOpen: true,
      userOpen: true,
	    organizerOpen: true,
      usedFilters: [],
	    createFilter: false,
	    newFilterName: '',
	    selectDefault: false,
      defaultFilter: null,
      seeMore: false,
	    newFilterModalOpen: false,
      levels: [],
      filterSettingsEnabled: false,
      alertDateFrom: false,
      alertDateTo: false,
    }
  }

  componentDidMount = () => {
    const {viewer, userFilter} = this.props ;
    if (viewer.me && viewer.me.defaultSavedFilter)
      this.setState({defaultFilter: viewer.me.defaultSavedFilter})
    else if (viewer.me && viewer.me.profileType === 'ORGANIZATION') {
      this.props._updateFilter(['Organized', 'Booked', 'Invited'])
    }
    else if (viewer.me && viewer.me.profileType !== 'PERSON' && viewer.me.subAccounts && viewer.me.subAccounts.length > 0 && userFilter.length === 0) {
      this.props._updateUserFilter(viewer.me.subAccounts.map(e => e.id).concat([viewer.me.id]))
    } 
    else if (viewer.me && viewer.me.profileType === 'PERSON' && viewer.me.subAccounts && viewer.me.subAccounts.length > 0 && userFilter.length === 0) {
      this.props._updateUserFilter([viewer.me.id])
    }
    if (viewer.me) {
      this._subAccountClicked(viewer.me.id, false)
    }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.filterSettingsEnabled) { //My filters settings enabled
      if (nextProps.selectedFilters.length === 0) { //Add new filter
        if (
            (this.props.selectedFilters.length === 0 && !this.props.filterSettingsEnabled)  || //clicked add filter case
            (this.props.selectedFilters.length !== 0) //unselect a filter while modifying case
        ) {
          this.setState({
            newFilterName: ''
          })
        }
      } else { //Modify selected filter
        if (
            (this.props.selectedFilters.length === 0) ||  //select a filter while adding - switch to modify mode
            (this.props.selectedFilters.length > 0 && (this.props.selectedFilters[0].id !== nextProps.selectedFilters[0].id)) || //select another filter while modifying one
            (!this.props.filterSettingsEnabled) //enable settings while a filter selected
        ) {
          this.setState({
            newFilterName: nextProps.selectedFilters[0].filterName
          });
        }
      }
    }

    if (!isEqual(this.props.sportFilter, nextProps.sportFilter)) {
      if (nextProps.sportFilter && nextProps.sportFilter.level && nextProps.sportFilter.level.length > 0) {
        this.setState({
          levelFrom: {
            name: nextProps.sportFilter.level[0][localizations.getLanguage().toUpperCase()].name,
            value: nextProps.sportFilter.level[0].id
          },
          levelTo: {
            name: nextProps.sportFilter.level[nextProps.sportFilter.level.length - 1][localizations.getLanguage().toUpperCase()].name,
            value: nextProps.sportFilter.level[nextProps.sportFilter.level.length - 1].id
          },
        })
      }
      else {
        this.setState({
          levelFrom: null,
          levelTo: null,
        });
      }
    }
  }

  _filterClicked = (filter) => {
    this.props._updateSelectedFilters([filter])
  }

  _menuItemClicked = (status) => {
    if (!this.props.viewer || !this.props.viewer.me) {
      this.props.alert.show(localizations.popup_filterSettings_login, {
				timeout: 3000,
				type: 'info',
			});
      
      return ;
    }
    let newFilter = cloneDeep(this.props.filter) ;

    if (newFilter.indexOf(status) >= 0)
      newFilter = newFilter.filter(item => item !== status);
    else
      newFilter.push(status);
	  if (newFilter.length === 0)
		  return ;

    this.props._updateFilter(newFilter)
	  this.props._updateSelectedFilters([])
  }

  _subAccountClicked = (userId, clearSelectedFilter = true) => {
    let newUserFilter = cloneDeep(this.props.userFilter) ; 
    
    if (newUserFilter.indexOf(userId) >= 0)
      newUserFilter = newUserFilter.filter(item => item !== userId);
    else
      newUserFilter.push(userId);

    if (newUserFilter.length === 0)
      return ;

    this.props._updateUserFilter(newUserFilter)

    if (clearSelectedFilter)
	    this.props._updateSelectedFilters([])
  }

  _allSubAccountClicked = () => {
    if (this.props.userFilter.length === this.props.viewer.me.subAccounts.length + 1) {
      this.props._updateUserFilter([this.props.viewer.me.id]);
    }
    else {
      this.props._updateUserFilter(this.props.viewer.me.subAccounts.map(subAccount => subAccount.id).concat(this.props.viewer.me.id));
    }
  }

  _organizerClicked = (userId) => {
    let newOrganizerFilter = cloneDeep(this.props.organizersFilter) ;

    if (userId) {
	    if (newOrganizerFilter.indexOf(userId) >= 0)
		    newOrganizerFilter = newOrganizerFilter.filter(item => item !== userId);
	    else
		    newOrganizerFilter.push(userId);
    }
    else
	    newOrganizerFilter = [];

    this.props._updateOrganizersFilter(newOrganizerFilter)
	  this.props._updateSelectedFilters([])
  }

  _opponentClicked = (userId, selectAll=false) => {
    let newOpponentsFilter = cloneDeep(this.props.opponentsFilter) ;
    
    if (userId) {
      if (newOpponentsFilter.indexOf(userId) >= 0)
        newOpponentsFilter = newOpponentsFilter.filter(item => item !== userId);
      else
        newOpponentsFilter.push(userId);
    }
    else if (selectAll) {
      newOpponentsFilter = this.props.viewer.myOpponents.edges.map(edge => edge.node.id);
    }
    else
      newOpponentsFilter = [];

    this.props._updateOpponentsFilter(newOpponentsFilter)
    this.props._updateSelectedFilters([])
  }

  _sportunityTypeClicked = (sportunityTypeId) => {
    let newSportunityTypeFilter = cloneDeep(this.props.sportunityTypeFilter) ;
    
    if (sportunityTypeId) {
      if (newSportunityTypeFilter.indexOf(sportunityTypeId) >= 0)
        newSportunityTypeFilter = newSportunityTypeFilter.filter(item => item !== sportunityTypeId);
      else
        newSportunityTypeFilter.push(sportunityTypeId);
    }
    else 
      newSportunityTypeFilter = []

    if (newSportunityTypeFilter.length === 0)
      this.props._updateSportunityTypeFilter([])

    this.props._updateSportunityTypeFilter(newSportunityTypeFilter)
	  this.props._updateSelectedFilters([])
  }

  _handleCreate = () => {
  	let {viewer} = this.props;
	  let savedFilters = this.props.viewer.me.savedFilters
		  .map(item => ({
			  userFilterId: item.id,
        filterName: item.filterName,
        statuses: item.statuses,
        subAccounts: item.subAccounts.map(user => user.id),
        users: item.users.map(user => user.id),
        sportunityTypes: item.sportunityTypes.map(user => user.id),
        sport: item.sport
          ? item.sport.map(
            sport => {
              if (sport.levels && sport.levels.length > 0) {
                return { sportID: sport.sport.id, level: sport.levels.map(levelItem => levelItem.id) }
              } else
                return {sportID: sport.sport.id}
            }
          )
          : null,
        location: {
          lat: item.location.lat,
          lng: item.location.lng,
          radius: item.location.radius,
        },
        page: item.page
		  }))
    savedFilters.push({
		  filterName: this.state.newFilterName,
      statuses: this.props.filter,
      subAccounts: this.props.userFilter,
      users: this.props.organizersFilter,
      sportunityTypes: this.props.sportunityTypeFilter,
      sport: this.props.sportFilter ?
        (this.props.sportFilter.level && this.props.sportFilter.level.length>0 ? {
            sportID: this.props.sportFilter.sportID,
            level: this.props.sportFilter.level.map(levelItem => levelItem.id)
          } : {
            sportID: this.props.sportFilter.sportID,
          }
        ) : null,
      location: this.props.locationFilter ? {
        lat: this.props.locationFilter.location.lat,
        lng: this.props.locationFilter.location.lng,
        radius: this.props.locationFilter.location.radius,
      } : null,
      page: 'ORGANIZED'
	  });
    this.props.updateSavedFilter(savedFilters)
	  setTimeout(() => {
	  	this.setState({
			  newFilterName: '',
			  createFilter: false
	  	});
		  //this.props._resetFilter();
		  if (viewer.me && viewer.me.profileType !== 'PERSON' && viewer.me.subAccounts && viewer.me.subAccounts.length > 0) {
			  this.props._updateUserFilter(viewer.me.subAccounts.map(e => e.id).concat([viewer.me.id]))
		  }
		  else if (viewer.me && viewer.me.profileType === 'PERSON' && viewer.me.subAccounts && viewer.me.subAccounts.length > 0) {
			  this.props._updateUserFilter([viewer.me.id])
		  }
	  }, 200)
  }

  _handleModify = filter => {
    let savedFilters = this.props.viewer.me.savedFilters
      .map(item => {
        if (item.id === filter.id)
          return {
            userFilterId: item.id,
            filterName: this.state.newFilterName,
            statuses: item.statuses,
            subAccounts: item.subAccounts.map(user => user.id),
            users: item.users.map(user => user.id),
            sportunityTypes: item.sportunityTypes.map(user => user.id),
            sport: item.sport.map(
              sport => {
                if (sport.levels && sport.levels.length > 0)
                  return { sportID: sport.sport.id, level: sport.levels.map(levelItem => levelItem.id) }
                else
                  return {sportID: sport.sport.id}
              }
            ),
            location: {
              lat: item.location.lat,
              lng: item.location.lng,
              radius: item.location.radius,
            },
            page: item.page
          };
        else return {
          userFilterId: item.id,
          filterName: item.filterName,
          statuses: item.statuses,
          subAccounts: item.subAccounts.map(user => user.id),
          users: item.users.map(user => user.id),
          sportunityTypes: item.sportunityTypes.map(user => user.id),
          sport: item.sport
            ? item.sport.map(
              sport => {
                if (sport.levels && sport.levels.length > 0)
                  return { sportID: sport.sport.id, level: sport.levels.map(levelItem => levelItem.id) }
                else
                  return {sportID: sport.sport.id}
              }
            )
            : null,
          location: {
            lat: item.location.lat,
            lng: item.location.lng,
            radius: item.location.radius,
          },
          page: item.page
        }
      })

    this.props.updateSavedFilter(savedFilters)

  }
  
  _handleClubSelected = (club) => {
    let clubIndex = this.props.selectedClubs ? this.props.selectedClubs.findIndex(selectedClub => selectedClub.id === club.id) : -1
    let selectedClubs = this.props.selectedClubs ? cloneDeep(this.props.selectedClubs) : [];

    if (clubIndex < 0) {
        selectedClubs.push(club);
        let term = '';
        if (selectedClubs.length > 0)
            term = selectedClubs.length + ' ' + localizations.fint_my_sport_club_selected;
        if (selectedClubs.length > 1)
            term = selectedClubs.length + ' ' + localizations.fint_my_sport_club_selecteds;
        this.setState({
            selectedClubs,
            term
        });
        this.props._updateAddSelectedClubsAction(club);
    }
    else {
        selectedClubs.splice(clubIndex, 1)
        let term = '';
        if (selectedClubs.length > 0)
            term = selectedClubs.length + ' ' + localizations.fint_my_sport_club_selected;
        if (selectedClubs.length > 1)
            term = selectedClubs.length + ' ' + localizations.fint_my_sport_club_selecteds;
        this.setState({
            selectedClubs,
            term
        });
        this.props._updateRemoveSelectedClubsAction(club);
    }
  }


  _locationSelected = (suggest, distanceRange = 100) => {
    if (!this.props.distanceRange) {
      this.setState({
        distanceRange: distanceRange,
      });
    }
    if (suggest) {
      this.props._updateLocationFilter({
          location: {
            lat: suggest.location.lat,
            lng: suggest.location.lng,
            radius: distanceRange
          },
          label: suggest.description
      });
      this.setState({
        selectedLocation: suggest.location,
        locationName: suggest.description
      });
    } else {
      this.setState({
        selectedLocation: null,
        locationName: ''
      });
      this.props._updateLocationFilter();
    }
  };

  _handleRemoveLocation = () => {
    this.setState({
      selectedLocation: null,
      distanceRange: '',
      locationName: ''
    });
    this.props._updateLocationFilter()
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
      this.props._updateSportFilter({sportID: suggestion.value, sportName: suggestion.name});
      if (this.props.viewer.me) {
        this.props._updateSelectedFilters([])
      }

      this.setState({
        selectedSportId: suggestion.value,
        levels: suggestion.levels
      });
    } else {

      this._handleRemoveSport();
    }
  };

  _distanceRangeBlur = () => {
    this.props._updateDistanceRange(this.state.distanceRange);
    //this.props.onDistanceRangeChange(this.state.distanceRange);
  };

  _distanceRangeChanged = e => {
    this.setState({
      distanceRange: e.target.value,
    });
    if (this.state.selectedLocation) {
      this.props._updateLocationFilter({
        location: {
          lat: this.state.selectedLocation.lat,
          lng: this.state.selectedLocation.lng,
          radius: e.target.value
        },
        label: this.state.locationName
      })
    }
  };

  _updateLevelRange = (levelFrom, levelTo) => {
    const { levels } = this.state;
    if (levelFrom && levelTo) {
      const fromIndex = levels.findIndex(e => e.id == levelFrom.value);
      const toIndex = levels.findIndex(e => e.id == levelTo.value);
      const selectedLevels = levels.slice(fromIndex, toIndex + 1);
      this.props._updateSportLevelsFilter(selectedLevels);
    }
    if (!levelFrom && !levelTo) {
      this.props._updateSportLevelsFilter([]);
    }
    if (this.props.viewer.me) {
      this.props._updateSelectedFilters([])
    }
  };

  _clearLevelRange = () => {
    this.props._updateSportLevelsFilter();
    if (this.props.viewer.me) {
      this.props._updateSelectedFilters([])
    }

    this.setState({
      levelFrom: null,
      levelTo: null,
    });
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
    this.props._updateSportFilter();
    if (this.props.viewer.me) {
      this.props._updateSelectedFilters([])
    }

    this.setState({
      value: '',
      selectedSportId: '',
      levelFrom: null,
      levelTo: null,
    });
    this._clearLevelRange();
  };

  _dateFromChanged = e => {
    if (e && e._d) {
      this.props._updateDateFrom(e._d);
      if (new Date(e._d) > new Date('01/01/2000')) this._setDateAlert();

      if (this.props.filter.indexOf('Past') < 0 && isPast(e._d))
        this._menuItemClicked("Past")
    }
    else {
      this.props._updateDateFrom();
      this.props._updateDateTo();
    }
  };

  _dateToChanged = e => {
    if (e && e._d) {
      this.props._updateDateTo(e._d);
      if (new Date(e._d) > new Date('01/01/2000')) {
        this._setDateAlert();
      }
      if (!this.props.dateFromFilter) {
        if (this.props.filter.indexOf('Past') < 0 && isPast(e._d))
          this._menuItemClicked("Past")

        if (isPast(e._d)) {
          this.props._updateDateFrom(new Date(e._d));
        }
        else {
          this.props._updateDateFrom(new Date());
        }
      }
    }
    else {
      this.props._updateDateFrom();
      this.props._updateDateTo();
    }
  };

  _setDateAlert = () => {
    let alertDateFrom = !!(this.props.dateFromFilter && this.props.dateToFilter);
    let alertDateTo = !!(this.props.dateFromFilter && this.props.dateToFilter);

    if (
      this.props.dateFromFilter &&
      this.props.dateToFilter &&
      this.props.dateFromFilter > this.props.dateToFilter
    ) {
      alertDateFrom = true;
      alertDateTo = true;
    } else if (this.props.dateFrom && this.props.dateToFilter) {
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

  changeDefaultFilter = () => {
    if (this.state.selectDefault && this.state.defaultFilter) {
	    this.props.updateDefaultFilter(this.state.defaultFilter.id);
      this.setState({selectDefault: false});
    }
    else
	    this.setState({selectDefault: true});
  }

  _cancelFilterSettingsSelection = () => {
    this.props.updateFilterSettingSelection(!this.props.filterSettingsEnabled)
    this.setState({ createFilter: false, newFilterName: '' })
  }

  render() {
    const {
      filter,
      viewer,
      userFilter,
      sportunityTypeFilter,
      sportFilter,
      locationFilter,
      selectedFilters,
      organizersFilter,
      opponentsFilter,
    } = this.props

    let filterList = [].concat(
      viewer.me && viewer.me.savedFilters ? viewer.me.savedFilters : [],
    );
    if (filterList.length === 0 && viewer.me && viewer.me.defaultSavedFilter && filterList.findIndex(item => viewer.me.defaultSavedFilter.id === item.id) < 0)
      filterList.push(viewer.me.defaultSavedFilter)

    const {circlesUserIsIn} = this.props.user || [];
    const { levels } = this.state;
    
    return(
      <aside style={styles.sidebar}>
	      <NewFilterModal
		      open={this.state.newFilterModalOpen}
		      onClose={() => this.setState({newFilterModalOpen: false})}
		      onCancel={() => {this.setState({createFilter: false}); localStorage.setItem('tutoFilterDone', true)}}
		      onConfirm={() => {this.setState({createFilter: true}); localStorage.setItem('tutoFilterDone', true)}}
	      />
        <FilterSidebar title={localizations.myEvents_filterBy}>
          {this.props.filterSettingsEnabled &&
            <Menu title={
                    (selectedFilters && selectedFilters.length > 0)
                      ? localizations.myEvents_modifyFilter_title
                      : localizations.myEvents_addFilter_title
                  }
            >
              <div style={styles.inputRow}>
                <InputText
                  placeholder={localizations.myEvents_savedFilter_name}
                  value={this.state.newFilterName}
                  onChange={(e) => this.setState({ newFilterName: e.target.value })}
                />
                <i
                  className='fa fa-check'
                  style={{
                    backgroundColor: colors.green,
                    color: colors.white,
                    cursor: 'pointer',
                    fontSize: '0.7em',
                    padding: '0.3em'
                  }}
                  onClick={
                      (selectedFilters && selectedFilters.length > 0)
                        ? () => this._handleModify(selectedFilters[0])
                        : this._handleCreate
                  }
                />
                <i
                  className='fa fa-times'
                  style={{
                    backgroundColor: colors.red,
                    color: colors.white,
                    cursor: 'pointer',
                    fontSize: '0.7em',
                    padding: '0.3em'
                  }}
                  onClick={this._cancelFilterSettingsSelection}
                />
              </div>
            </Menu>
          }
          <Menu
            title={localizations.myEvents_title}
            filterMax={viewer.me && viewer.me.profileType !== 'ORGANIZATION' ? 9 : 7}
            filterLength={filter.length}
            listIsOpen={!!viewer.me}
          >
            <MenuItem 
              key={"Available"} 
              label={localizations.myEvents_avaiable}
              selected={filter.indexOf("Available") >= 0}
              onChange={() => this._menuItemClicked("Available")}
            />
            <MenuItem 
              key={"Organized"} 
              label={localizations.myEvents_organized}
              selected={filter.indexOf("Organized") >= 0}
              onChange={() => this._menuItemClicked("Organized")}
            />
            <MenuItem 
              key={"Booked"} 
              label={localizations.myEvents_booked} 
              selected={filter.indexOf("Booked") >= 0}
              onChange={() => this._menuItemClicked("Booked")}
            />
            <MenuItem 
              key={"Invited"} 
              label={localizations.myEvents_invited}
              selected={filter.indexOf("Invited") >= 0} 
              onChange={() => this._menuItemClicked("Invited")}
            />
            <MenuItem 
              key={"Survey"} 
              label={localizations.myEvents_survey}
              selected={filter.indexOf("Survey") >= 0}
              onChange={() => this._menuItemClicked("Survey")}
            />
            <MenuItem 
              key={"CoOrganizer"} 
              label={localizations.myEvents_coOrganizer}
              selected={filter.indexOf("CoOrganizer") >= 0}
              onChange={() => this._menuItemClicked("CoOrganizer")}
            />
            <MenuItem 
              key={"AskedCoOrganizer"} 
              label={localizations.myEvents_askedCoOrganizer}
              selected={filter.indexOf("AskedCoOrganizer") >= 0}
              onChange={() => this._menuItemClicked("AskedCoOrganizer")}
            />
            <MenuItem 
              key={"Declined"} 
              label={localizations.myEvents_declined}
              selected={filter.indexOf("Declined") >= 0}
              onChange={() => this._menuItemClicked("Declined")}
            />
            <MenuItem 
              key={"Past"} 
              label={localizations.myEvents_passeds} 
              selected={filter.indexOf("Past") >= 0}
              onChange={() => this._menuItemClicked("Past")}
            />
            <MenuItem 
              key={"Cancelled"} 
              label={localizations.myEvents_cancelled}
              selected={filter.indexOf("Cancelled") >= 0}
              onChange={() => this._menuItemClicked("Cancelled")}
            />
          </Menu>


          <Menu title={localizations.find_city}>
            <FilterPlace
              label={localizations.find_city}
              distanceLabel={localizations.find_distance}
              locationName={locationFilter ? locationFilter.label : ''}
              _handleRemoveLocation={this._handleRemoveLocation}
              placeholder={localizations.find_cityHolder}
              distanceRange={locationFilter ? locationFilter.location.radius : ''}
              _distanceRangeChanged={this._distanceRangeChanged}
              _distanceRangeBlur={this._distanceRangeBlur}
              userLocation={this.props.userLocation}
              radius={50000}
              _handleLocationChange={this._handleLocationChange}
              _locationSelected={this._locationSelected}
              hideRange={false}
              locationInputFocus={this.props.locationInputFocus}
            />
          </Menu>

          <Menu title={localizations.find_sport}>
            <SportSelect
              style={styles.select}
              label={localizations.find_sport}
              onChange={this._selectSport}
              required
              placeholder={localizations.find_sportHolder}
              value={this.props.value}
              _updateSportNameAction={this.props._updateSportNameAction}
              sportName={sportFilter ? sportFilter.sportName[localizations.getLanguage().toUpperCase()] : ''}
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
              onClear={this._clearLevelRange}
              disabled={levels.length === 0}
            />
          </Menu>

          <Menu title={localizations.find_date}>
            <FilterDate
              label={localizations.find_from}
              onChange={this._dateFromChanged}
              value={this.props.dateFromFilter}
              inputStyle={
                this.state.alertDateFrom
                  ? styles.inputDateAlert
                  : styles.inputDate
              }
            />

            <FilterDate
              label={localizations.find_to}
              onChange={this._dateToChanged}
              value={this.props.dateToFilter}
              inputStyle={
                this.state.alertDateTo
                  ? styles.inputDateAlert
                  : styles.inputDate
              }
              minDate={this.props.dateFromFilter ? this.props.dateFromFilter : null}
            />
          </Menu>

          {viewer.me && viewer.me.subAccounts && viewer.me.subAccounts.length > 0 &&
            <Menu
              title={viewer.me && viewer.me.profileType !== 'PERSON' ? localizations.myEvents_myClubs : localizations.myEvents_myChildren}
              filterMax={viewer.me.subAccounts.length + 1}
              filterLength={userFilter.length}
            >
              <MenuItem
                label={localizations.myEvents_selectAll}
                selected={userFilter.length === viewer.me.subAccounts.length + 1}
                onChange={() => this._allSubAccountClicked()}
              />
              <MenuItem
                label={viewer.me && viewer.me.profileType === 'PERSON' ? localizations.myEvents_me : localizations.myEvents_myTeam}
                selected={userFilter.indexOf(viewer.me.id) >= 0}
                onChange={() => this._subAccountClicked(viewer.me.id)}
              />
              {viewer.me.subAccounts.map(subAccount => (
                <MenuItem
                  key={subAccount.id}
                  label={subAccount.pseudo}
                  selected={userFilter.indexOf(subAccount.id) >= 0}
                  onChange={() => this._subAccountClicked(subAccount.id)}
                />
              ))}
            </Menu>
          }

          {viewer.me && viewer.sportunitiesOrganizers && viewer.sportunitiesOrganizers.edges && (viewer.sportunitiesOrganizers.edges.length > 1 || (viewer.sportunitiesOrganizers.edges.length === 1 && viewer.sportunitiesOrganizers.edges[0].node.id !== viewer.me.id)) && 
            <Menu
              title={localizations.myEvents_organizer}
              filterMax={viewer.sportunitiesOrganizers.count}
              filterLength={organizersFilter.length === 0 ? viewer.sportunitiesOrganizers.count : organizersFilter.length}
            >
              <MenuItem
                label={localizations.myEvents_selectAll}
                selected={organizersFilter.length === 0}
                onChange={() => this._organizerClicked()}
              />
              {viewer.sportunitiesOrganizers.edges.map(node => node.node)
                .map(organizer => (
                  <MenuItem
                    key={organizer.id}
                    label={organizer.pseudo}
                    selected={organizersFilter.indexOf(organizer.id) >= 0}
                    onChange={() => this._organizerClicked(organizer.id)}
                  />
                ))}
              {viewer.sportunitiesOrganizers.count > 5 &&
                <div
                  style={{fontSize: 16, textAlign: 'right', padding: '5px 10px', cursor: 'pointer'}}
                  onClick={() => {
                    this.props.onSeeMore(!this.state.seeMore);
                    this.setState({seeMore: !this.state.seeMore})
                  }}>
                  {!this.state.seeMore ? 'See More' : 'See Less'}
                </div>
              }
            </Menu>
          }

          {viewer.me && viewer.me.canQuerySportunityTypeFilter &&
            <Menu
              title={localizations.myEvents_type}
              filterMax={viewer.sportunityTypes && viewer.sportunityTypes.length}
              filterLength={sportunityTypeFilter.length}
            >
              <MenuItem
                label={localizations.myEvents_all_masculin}
                selected={sportunityTypeFilter.length === 0}
                onChange={() => this._sportunityTypeClicked()}
              />
              {viewer.sportunityTypes && viewer.sportunityTypes.map(sportunityType => (
                <MenuItem
                  key={sportunityType.id}
                  label={sportunityType.name[localizations.getLanguage().toUpperCase()]}
                  selected={sportunityTypeFilter.indexOf(sportunityType.id) >= 0}
                  onChange={() => this._sportunityTypeClicked(sportunityType.id)}
                />
              ))}
            </Menu>
          }

          {viewer.myOpponents && viewer.myOpponents.edges && viewer.myOpponents.edges.length > 0 &&
            <Menu
              title={localizations.myEvents_opponent}
              filterMax={viewer.myOpponents.count}
              filterLength={opponentsFilter.length}
              scroll={true}
            >
              <MenuItem
                label={localizations.myEvents_selectAll}
                selected={opponentsFilter.length === viewer.myOpponents.count}
                onChange={() => this._opponentClicked(null, opponentsFilter.length !== viewer.myOpponents.count)}
              />
              {viewer.myOpponents.edges.map(edge => edge.node)
                .map(opponent => (
                  <MenuItem
                    key={opponent.id}
                    label={opponent.pseudo}
                    selected={opponentsFilter.indexOf(opponent.id) >= 0}
                    onChange={() => this._opponentClicked(opponent.id)}
                  />
                ))}
            </Menu>
          }

          {circlesUserIsIn && circlesUserIsIn.edges.length > 0 &&
            <Menu
              title={localizations.find_my_sport_clubs}
              filterMax={circlesUserIsIn.edges.length}
              filterLength={this.props.selectedClubs ? this.props.selectedClubs.length : 0}
              scroll={true}
            >
            {circlesUserIsIn.edges.map(node => node.node)
                .map(circle => (
                  <MenuItem
                    key={circle.id}
                    label={
                      <div style={styles.nameContainer}>
                        <div>
                            {circle.name}
                        </div>
                        {circle.owner && circle.owner.pseudo &&
                            <div style={styles.ownerContainer}>
                                <div style={{...styles.icon, backgroundImage: circle.owner.avatar ? 'url('+ circle.owner.avatar +')' : 'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")'}} />
                                {circle.owner.pseudo}
                            </div>
                        }
                      </div>} 
                    selected={this.props.selectedClubs ? this.props.selectedClubs.findIndex(selectedCircle => selectedCircle.id === circle.id) >= 0 : false}
                    onChange={() => this._handleClubSelected(circle)}
                  />
                ))}
            </Menu>
          }

        </FilterSidebar>
      </aside>
    )
  }
}

styles = {
  filterBox: {
    border: '1px solid ' + colors.blue,
    margin: 10,
    width: 'calc(100% - 20px)',
  },
	localFilterContainer: {
	  border: '3px solid ' + colors.blue
  },
	inputRow: {
    display: 'flex',
    fontSize: fonts.size.medium,
    justifyContent: 'space-around',
    alignItems: 'center',
    margin: 5
  },
  triangle: {
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
  triangleOpen: {
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
  sidebar: {
    paddinfRight: 20,
    width: 250,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    fontFamily: 'Lato',
    margin: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.blue,
  },
  blockTitle: {
    fontSize: fonts.size.xl,
    width: '100%',
    fontWeight: 'bold',
    padding: 10,
    color: colors.white,
    backgroundColor: colors.blue
  },
  titleContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    padding: '10px 5px',
    width: '100%',
    justifyContent: 'space-between',
    border: '1px solid ' + colors.blue,
    cursor: 'pointer'
  },
  menu_container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginBottom: 5
  },
};

const _updateFilter = (value) => {
  return {
    type: types.UPDATE_MY_EVENT_FILTER,
    value,
  }
}

const _updateUserFilter = (value) => {
  return {
    type: types.UPDATE_MY_EVENT_USER_FILTER, 
    value
  }
}

const _updateSportunityTypeFilter = value => {
  return {
    type: types.UPDATE_MY_EVENT_SPORTUNITY_TYPE_FILTER,
    value
  }
}

const _updateSportFilter = value => {
  return {
    type: types.UPDATE_MY_EVENT_SPORT_FILTER,
    value
  }
}

const _updateSportLevelsFilter = value => {
  return {
    type: types.UPDATE_MY_EVENT_SPORT_LEVELS_FILTER,
    value
  }
}

const _updateDateFrom = dateFromFilter => ({
  type: types.UPDATE_MY_EVENT_DATE_FROM_FILTER,
  dateFromFilter: dateFromFilter,
});

const _updateDateTo = dateToFilter => ({
  type: types.UPDATE_MY_EVENT_DATE_TO_FILTER,
  dateToFilter: dateToFilter,
});

const _updateLocationFilter = value => {
  return {
    type: types.UPDATE_MY_EVENT_LOCATION_FILTER,
    value
  }
}

const _updateOrganizersFilter = value => {
  return {
    type: types.UPDATE_MY_EVENT_ORGANIZERS_FILTER,
    value
  }
}

const _updateOpponentsFilter = value => {
  return {
    type: types.UPDATE_MY_EVENT_OPPONENTS_FILTER,
    value
  }
}

const _updateSelectedFilters = value => {
  return {
    type: types.UPDATE_MY_EVENT_SELECTED_FILTERS,
    value
  }
}

const _resetFilter = () => {
	return {
	  type: types.UPDATE_MY_EVENT_RESET_FILTER,
  }
}

const _updateAddSelectedClubsAction = (selectedClub) => {
  return {
    type: types.UPDATE_MY_EVENT_SELECTED_CLUBS_ADD,
    selectedClub: selectedClub
  }
}

const _updateRemoveSelectedClubsAction = (unselectedClub) => {
  return {
    type: types.UPDATE_MY_EVENT_SELECTED_CLUBS_REMOVE,
    unselectedClub: unselectedClub
  }
}

const _updateClearSelectedClubsAction = () => {
  return {
    type: types.UPDATE_MY_EVENT_SELECTED_CLUBS_CLEAR
  }
}

const _updateDistanceRange = distanceRange => ({
  type: types.UPDATE_SPORTUNITY_SEARCH_DISTANCE_RANGE,
  distanceRange: distanceRange,
});

const _updateSportNameAction = name => ({
  type: types.UPDATE_SPORTUNITY_SEARCH_SPORT_NAME,
  sportName: name,
});

const dispatchToProps = (dispatch) => ({
  _updateSportNameAction: bindActionCreators(_updateSportNameAction, dispatch),
  _updateDistanceRange: bindActionCreators(_updateDistanceRange, dispatch),
  _updateFilter: bindActionCreators(_updateFilter, dispatch),
  _resetFilter: bindActionCreators(_resetFilter, dispatch),
  _updateUserFilter: bindActionCreators(_updateUserFilter, dispatch),
  _updateSportunityTypeFilter: bindActionCreators(_updateSportunityTypeFilter, dispatch),
  _updateSportFilter: bindActionCreators(_updateSportFilter, dispatch),
  _updateSportLevelsFilter: bindActionCreators(_updateSportLevelsFilter, dispatch),
  _updateDateFrom: bindActionCreators(_updateDateFrom, dispatch),
  _updateDateTo: bindActionCreators(_updateDateTo, dispatch),
  _updateLocationFilter: bindActionCreators(_updateLocationFilter, dispatch),
  _updateOrganizersFilter: bindActionCreators(_updateOrganizersFilter, dispatch),
  _updateOpponentsFilter: bindActionCreators(_updateOpponentsFilter, dispatch),
  _updateSelectedFilters: bindActionCreators(_updateSelectedFilters, dispatch),
  _updateAddSelectedClubsAction: bindActionCreators(_updateAddSelectedClubsAction, dispatch),
  _updateRemoveSelectedClubsAction: bindActionCreators(_updateRemoveSelectedClubsAction, dispatch),
  _updateClearSelectedClubsAction: bindActionCreators(_updateClearSelectedClubsAction, dispatch),
});

const stateToProps = (state) => ({
  filter: state.myEventFilterReducer.filter,
  userFilter: state.myEventFilterReducer.userFilter,
  sportunityTypeFilter: state.myEventFilterReducer.sportunityTypeFilter,
  sportFilter: state.myEventFilterReducer.sportFilter,
  locationFilter: state.myEventFilterReducer.locationFilter,
  organizersFilter: state.myEventFilterReducer.organizersFilter,
  opponentsFilter: state.myEventFilterReducer.opponentsFilter,
  selectedFilters: state.myEventFilterReducer.selectedFilters,
  selectedClubs: state.myEventFilterReducer.selectedClubs,
  dateFromFilter: state.myEventFilterReducer.dateFromFilter,
  dateToFilter: state.myEventFilterReducer.dateToFilter,
  userCountry: state.globalReducer.userCountry,
  userLocation: state.globalReducer.userLocation,
});

const ReduxContainer = connect(
  stateToProps,
  dispatchToProps,
)(withAlert(Sidebar));

export default ReduxContainer;
