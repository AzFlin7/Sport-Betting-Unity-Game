import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import cloneDeep from 'lodash/cloneDeep';
import Loading from 'react-loading';

import * as types from '../../actions/actionTypes.js';

import localizations from '../Localizations'
import InputText from "../MyEvents/InputText";
import { colors, metrics, fonts } from '../../theme';

import SportSelect from '../common/FilterSidebar/FilterSport';
import FilterDate from '../common/FilterSidebar/FilterDate';

import FilterSidebar from '../common/FilterSidebar'
import Menu from '../common/FilterSidebar/Menu';
import MenuItem from '../common/FilterSidebar/MenuItem';
import FilterItem from "../common/FilterSidebar/FilterItem";
import SidebarButton from '../common/FilterSidebar/SidebarButton'; 
import FilterPlace from '../common/FilterSidebar/FilterPlace';
import FilterInput from '../common/FilterSidebar/FilterInput'

import NewFilterModal from "./NewFilterModal";

let styles

class Sidebar extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      eventStatusOpen: true,
      typesOpen: true,
      userOpen: true,
	    sportOpen: true,
	    locationOpen: true,
      usedFilters: [],
	    createFilter: false,
	    newFilterName: '',
	    selectDefault: false,
      defaultFilter: null,
      seeMore: false,
      isLoadingSports: false,
	    newFilterModalOpen: false,
    }
  }

  componentDidMount = () => {
    const {viewer, userFilter} = this.props ;
    if (viewer.me && viewer.me.defaultSavedCircleFilter)
      this.setState({defaultFilter: viewer.me.defaultSavedCircleFilter})
    // if (viewer.me && viewer.me.profileType !== 'PERSON' && viewer.me.subAccounts && viewer.me.subAccounts.length > 0 && userFilter.length === 0) {
    //   this.props._updateUserFilter(viewer.me.subAccounts.map(e => e.id).concat([viewer.me.id]))
    // } 
    // else if (viewer.me && viewer.me.profileType === 'PERSON' && viewer.me.subAccounts && viewer.me.subAccounts.length > 0 && userFilter.length === 0) {
    //   this.props._updateUserFilter([viewer.me.id])
    // }
  }

  _filterClicked = (filter) => {
    this.props._updateSelectedFilters([filter])
  }

  _menuItemClicked = (status) => {
    let newFilter = cloneDeep(this.props.filter) ;

    if (newFilter.indexOf(status) >= 0)
      newFilter = newFilter.filter(item => item !== status);
    else
      newFilter.push(status);

    this.props._updateFilter(newFilter)
	  this.props._updateSelectedFilters([])
  }

  _sportClicked = (sportId) => {
    let newSportFilter = cloneDeep(this.props.sportFilter) ;

    if (newSportFilter.indexOf(sportId) >= 0)
	    newSportFilter = newSportFilter.filter(item => item !== sportId);
    else
	    newSportFilter.push(sportId);

    this.props._updateSportFilter(newSportFilter)
	  this.props._updateSelectedFilters([])
  }

  _subAccountClicked = (userId) => {
    let newUserFilter = cloneDeep(this.props.userFilter) ; 
    
    if (newUserFilter.indexOf(userId) >= 0)
      newUserFilter = newUserFilter.filter(item => item !== userId);
    else
      newUserFilter.push(userId);

    /*if (newUserFilter.length === 0)
      return ;*/

    this.props._updateUserFilter(newUserFilter)
	  this.props._updateSelectedFilters([])
  }

  _typeClicked = (type) => {
    let newTypeFilter = cloneDeep(this.props.typeFilter) ;
    
    if (type) {
      if (newTypeFilter.indexOf(type) >= 0)
        newTypeFilter = newTypeFilter.filter(item => item !== type);
      else
        newTypeFilter.push(type);
    }
    else 
      newTypeFilter = []
    if (newTypeFilter.length === 0)
      this.props._updateTypeFilter([])

    this.props._updateTypeFilter(newTypeFilter)
	  this.props._updateSelectedFilters([])
  }

  _handleCreate = () => {
	  let savedFilters = this.props.viewer.me.savedCircleFilters
		  .map(item => ({
			  userCircleFilterId: item.id,
        filterName: item.filterName,
			  memberTypes: item.memberTypes,
        sport: item.sport.map(sport => ({sportID: sport.sport.id})),
        owners: item.owners.map(user => user.id),
			  circleType: item.circleType,
			  location: {
				  lat: item.location.lat,
				  lng: item.location.lng,
				  radius: 100,
			  }
		  }))
    savedFilters.push({
		  filterName: this.state.newFilterName,
	    memberTypes: this.props.filter,
      sport: this.props.sportFilter.map(sport => ({sportID: sport})),
	    owners: this.props.userFilter,
	    circleType: this.props.typeFilter,
	    location: this.props.locationFilter ? {
		    lat: this.props.locationFilter.location.lat,
		    lng: this.props.locationFilter.location.lng,
		    radius: 100,
	    } : null,
	  })
    this.props.updateSavedFilter(savedFilters)
    setTimeout(() => {
	  	this.setState({
			  newFilterName: '',
			  createFilter: false
	  	});
		  this.props._resetFilter();
	  }, 200)
  }


	_handleDelete = (filter) => {
		let savedFilters = this.props.viewer.me.savedCircleFilters
			.map(item => {
				if (item.id === filter.id)
					return false;
				else return {
					userCircleFilterId: item.id,
					filterName: item.filterName,
					memberTypes: item.memberTypes,
					sport: item.sport.map(sport => ({sportID: sport.sport.id})),
					owners: item.owners.map(user => user.id),
					circleType: item.circleType,
					location: {
						lat: item.location.lat,
						lng: item.location.lng,
						radius: 100,
					}
				}
			})
			.filter(filter => Boolean(filter));
		if (this.state.defaultFilter && this.state.defaultFilter.id === filter.id)
		  this.props.updateDefaultFilter(null)
		this.props.updateSavedFilter(savedFilters)
	};

  changeDefaultFilter = () => {
    if (this.state.selectDefault && this.state.defaultFilter) {
	    this.props.updateDefaultFilter(this.state.defaultFilter.id);
      this.setState({selectDefault: false});
    }
    else
	    this.setState({selectDefault: true});
  }

  _handleRemoveLocation = () => {
		this.props._updateLocationFilter()
	}

  render() {
    const { filter, viewer, userFilter, typeFilter, selectedFilters, sportFilter, locationFilter } = this.props

    let filterList = [].concat(
      viewer.me && viewer.me.savedCircleFilters ? viewer.me.savedCircleFilters : [],
    );
    if (viewer.me && viewer.me.defaultSavedCircleFilter && filterList.findIndex(item => viewer.me.defaultSavedCircleFilter.id === item.id) < 0)
      filterList.push(viewer.me.defaultSavedCircleFilter)

    return(
      <aside style={styles.sidebar}>
          {/* <NewFilterModal
            open={this.state.newFilterModalOpen}
            onClose={() => this.setState({newFilterModalOpen: false})}
            onCancel={() => this.setState({createFilter: false})}
            onConfirm={() => this.setState({createFilter: true})}
          /> 
        {viewer.me && 
          <FilterSidebar title={localizations.myEvents_savedFilter_title}>
            {filterList && filterList.length > 0 && 
              <Menu
                title={localizations.myEvents_savedFilter_myFilters}
              >
                {filterList.map((filter, index) => (
                  <FilterItem 
                    key={'filter'+index} 
                    label={filter.filterName}
                    selected={selectedFilters.findIndex(localFilter => localFilter.id === filter.id) >= 0}
                    selectDefault={this.state.selectDefault}
                    onChangeDefault={() => this.setState({
                    defaultFilter: !this.state.defaultFilter || this.state.defaultFilter.id !== filter.id
                      ? filter
                      : null
                    })}
                    defaultFilter={this.state.defaultFilter && this.state.defaultFilter.id === filter.id}
                    onChange={() => this._filterClicked(filter)}
                    onDelete={() => this._handleDelete(filter)}
                  />
                ))}
              </Menu>
            }
            {!this.state.selectDefault && (this.state.createFilter 
            ? <div style={styles.inputRow}>
                <InputText
                  placeholder={localizations.myEvents_savedFilter_name}
                  value={this.state.newFilterName}
                  onChange={(e) => this.setState({newFilterName: e.target.value})}
                />
                <i
                  className='fa fa-check'
                  style={{backgroundColor: colors.green, color: colors.white, cursor: 'pointer', fontSize: '0.7em', padding: '0.3em'}}
                  onClick={this._handleCreate}
                />
                <i
                  className='fa fa-times'
                  style={{backgroundColor: colors.red, color: colors.white, cursor: 'pointer', fontSize: '0.7em', padding: '0.3em'}}
                  onClick={() => this.setState({createFilter: false, newFilterName: ''})}
                />
              </div>
            : <SidebarButton
                onClick={() => {this.state.createFilter !== true && this.setState({newFilterModalOpen: true})}}
                label={localizations.myEvents_savedFilter_create}
                iconFa='fa-plus-circle'
                color={colors.green}
                textColor={colors.white}
              />
            )}
            {filterList && filterList.length > 0 && 
              <SidebarButton
                onClick={this.changeDefaultFilter}
                label={this.state.selectDefault ? localizations.filter_valid : localizations.myEvents_savedFilter_editDefault}
                iconFa='fa-check'
                color={this.state.selectDefault ? colors.green : colors.lightGray}
                textColor={this.state.selectDefault ? colors.white : colors.darkGray}
              />
            }
          </FilterSidebar>
        } */}

       

        <FilterSidebar title={localizations.myEvents_filterBy}>
          <Menu title={localizations.circles_name_or_owner} >
            <FilterInput
              placeholder={localizations.circles_name}
              ref={node => { this._inputNode = node }}
              disabled={false}
              onChange={this.props._handleSearchChange}
              value={this.props.nameCompletion}
              containerStyle={{ textAlign: 'center', margin: '10px 0 10px' }}
              isLoading={this.props.isQueryingText}
            />
          </Menu>
          <Menu title={localizations.circles_code} >
            <FilterInput
              placeholder={localizations.circles_code_placeholder}
              ref={node => { this._inputCodeNode = node }}
              disabled={false}
              onChange={this.props._handleSearchByCodeChange}
              value={this.props.codeInput}
              containerStyle={{ textAlign: 'center', margin: '10px 0 10px' }}
              isLoading={this.props.isQueryingCode}
            />
          </Menu>
          {viewer.me && 
            <Menu
              title={localizations.myEvents_type}
              filterMax={4}
              filterLength={typeFilter.length}
            >
              <MenuItem
                label={localizations.circle_myCircles}
                selected={typeFilter.indexOf("MY_CIRCLES") >= 0}
                onChange={() => this._typeClicked("MY_CIRCLES")}
              />
              <MenuItem
                label={localizations.circle_circlesIAmIn}
                selected={typeFilter.indexOf("CIRCLES_I_AM_IN") >= 0}
                onChange={() => this._typeClicked("CIRCLES_I_AM_IN")}
              />
              {/*viewer.me && viewer.me.subAccounts && viewer.me.subAccounts.length > 0 &&
                <MenuItem
                  label={viewer.me && viewer.me.profileType === 'PERSON' ? localizations.circle_childrenCircles : localizations.circle_teamsCircles}
                  selected={typeFilter.indexOf("CHILDREN_CIRCLES") >= 0}
                  onChange={() => this._typeClicked("CHILDREN_CIRCLES")}
                />
              */}
              {viewer.me && viewer.me.isSubAccount && viewer.me.profileType === 'ORGANIZATION' && 
                <MenuItem
                  label={localizations.circle_circlesFromClub}
                  selected={typeFilter.indexOf("OTHER_TEAMS_CIRCLES") >= 0}
                  onChange={() => this._typeClicked("OTHER_TEAMS_CIRCLES")}
                />
              }
              <MenuItem
                label={localizations.circle_publicCircles}
                selected={typeFilter.indexOf("PUBLIC_CIRCLES") >= 0}
                onChange={() => this._typeClicked("PUBLIC_CIRCLES")}
              />
            </Menu>
          }

          {viewer.me && viewer.me.subAccounts && viewer.me.subAccounts.length > 0 &&
            <Menu
              title={viewer.me && viewer.me.profileType !== 'PERSON' ? localizations.myEvents_myClubs : localizations.myEvents_myChildren}
              filterMax={viewer.me.subAccounts.length}
              filterLength={userFilter.length}
            >
              {viewer.me.subAccounts.map((subAccount, index) => (
                <MenuItem
                  key={index}
                  label={subAccount.pseudo}
                  selected={userFilter.indexOf(subAccount.id) >= 0}
                  onChange={() => this._subAccountClicked(subAccount.id)}
                />
              ))}
            </Menu>
          }

          {typeFilter.indexOf("OTHER_TEAMS_CIRCLES") >= 0 && viewer.me && viewer.me.profileType === 'ORGANIZATION' && viewer.me.masterAccount && viewer.me.masterAccount.subAccounts && viewer.me.masterAccount.subAccounts.length > 1 &&
            <Menu
              title={localizations.circle_circlesFromClub}
              filterMax={viewer.me.masterAccount.subAccounts.length}
              filterLength={userFilter.length}
            >
              {viewer.me.masterAccount.subAccounts.filter(sub => sub.id !== viewer.me.id).map(subAccount => (
                <MenuItem
                  key={subAccount.id}
                  label={subAccount.pseudo}
                  selected={userFilter.indexOf(subAccount.id) >= 0}
                  onChange={() => this._subAccountClicked(subAccount.id)}
                />
              ))}
            </Menu>
          }

          <Menu
            title={localizations.find_city}
          >
            <FilterPlace
              label={localizations.find_city}
              distanceLabel={localizations.find_distance}
              locationName={locationFilter ? locationFilter.label : ""}
              _handleRemoveLocation={this._handleRemoveLocation}
              placeholder={localizations.find_cityHolder}
              userLocation={this.props.userLocation}
              radius={50000}
              _locationSelected={this.props._updateLocationFilter}
              hideRange={true}
							locationInputFocus={this.props.locationInputFocus}
            />
          </Menu>

          <Menu
            title={localizations.circles_member_type}
            filterMax={5}
            filterLength={filter.length}
          >
            <MenuItem 
              key={"ADULTS"} 
              label={localizations.circle_adult}
              selected={filter.indexOf("ADULTS") >= 0}
              onChange={() => this._menuItemClicked("ADULTS")}
            />
            <MenuItem 
              key={"CHILDREN"}  
              label={localizations.circle_child} 
              selected={filter.indexOf("CHILDREN") >= 0}
              onChange={() => this._menuItemClicked("CHILDREN")}
            />
            <MenuItem 
              key={"TEAMS"} 
              label={localizations.circle_teams}
              selected={filter.indexOf("TEAMS") >= 0} 
              onChange={() => this._menuItemClicked("TEAMS")}
            />
            <MenuItem 
              key={"CLUBS"} 
              label={localizations.circle_club}
              selected={filter.indexOf("CLUBS") >= 0}
              onChange={() => this._menuItemClicked("CLUBS")}
            />
            <MenuItem 
              key={"COMPANIES"} 
              label={localizations.circle_companies} 
              selected={filter.indexOf("COMPANIES") >= 0}
              onChange={() => this._menuItemClicked("COMPANIES")}
            />
          </Menu>


          {viewer.myCirclesSports && viewer.myCirclesSports.count > 0 &&
            <Menu
              title={localizations.find_sport}
              filterMax={viewer.myCirclesSports.count}
              filterLength={sportFilter.length}
              scroll={true}
            >
              {viewer.myCirclesSports.edges.map(sport => (
                <MenuItem
                  key={sport.node.id}
                  label={sport.node.name[localizations.getLanguage().toUpperCase()]}
                  selected={sportFilter.indexOf(sport.node.id) >= 0}
                  onChange={() => this._sportClicked(sport.node.id)}
                />
              ))}
              {this.state.isLoadingSports && 
                <div style={styles.loadingContainer}>
                  <Loading height='32' type='cylon' color={colors.blue} />
                </div>
              }
              {!this.state.seeMore && viewer.myCirclesSports.count > 10 &&
                <div
                  style={styles.viewMore}
                  onClick={() => {
                    this.setState({seeMore: !this.state.seeMore, isLoadingSports: true})
                    this.props.onSeeMore(!this.state.seeMore, () => {this.setState({isLoadingSports: false})});
                  }}>
                  {localizations.find_loadSport}
                </div>
	            }
            </Menu>
          }
        </FilterSidebar>
      </aside>
    )
  }
}


styles = {
  viewMore: {
    fontSize: 16, 
    fontFamily: 'Lato',
    textAlign: 'right', 
    padding: '5px 20px', 
    cursor: 'pointer',
    color: colors.blue
  },
	inputRow: {
    display: 'flex',
    fontSize: fonts.size.medium,
    justifyContent: 'space-around',
    alignItems: 'center',
    margin: 5
  },
  sidebar: {
    paddinfRight: 20,
    width: 250,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    fontFamily: 'Lato',
    // old code: margin: metrics.margin.medium,
    margin: '0px' // Vikas B overriding the margin top to mix it with top
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center' 
  }
};

const _updateFilter = (value) => {
  return {
    type: types.UPDATE_MY_CIRCLE_FILTER,
    value,
  }
}

const _updateSportFilter = (value) => {
  return {
    type: types.UPDATE_MY_CIRCLE_SPORT_FILTER,
    value
  }
}

const _updateLocationFilter = value => {
  return {
    type: types.UPDATE_MY_CIRCLE_LOCATION_FILTER,
    value
  }
}

const _updateTypeFilter = value => {
  return {
    type: types.UPDATE_MY_CIRCLE_TYPE_FILTER,
    value
  }
}

const _updateUserFilter = value => {
  return {
    type: types.UPDATE_MY_CIRCLE_USER_FILTER,
    value
  }
}

const _updateSelectedFilters = value => {
  return {
    type: types.UPDATE_MY_CIRCLE_SELECTED_FILTERS,
    value
  }
}

const _resetFilter = () => {
	return {
	  type: types.UPDATE_MY_CIRCLE_RESET_FILTER,
  }
}


const dispatchToProps = (dispatch) => ({
  _updateFilter: bindActionCreators(_updateFilter, dispatch),
  _resetFilter: bindActionCreators(_resetFilter, dispatch),
	_updateSportFilter: bindActionCreators(_updateSportFilter, dispatch),
	_updateLocationFilter: bindActionCreators(_updateLocationFilter, dispatch),
	_updateTypeFilter: bindActionCreators(_updateTypeFilter, dispatch),
	_updateUserFilter: bindActionCreators(_updateUserFilter, dispatch),
  _updateSelectedFilters: bindActionCreators(_updateSelectedFilters, dispatch)
});

const stateToProps = (state) => ({
  filter: state.myCircleFilterReducer.filter,
	sportFilter: state.myCircleFilterReducer.sportFilter,
	locationFilter: state.myCircleFilterReducer.locationFilter,
	typeFilter: state.myCircleFilterReducer.typeFilter,
	userFilter: state.myCircleFilterReducer.userFilter,
  selectedFilters: state.myCircleFilterReducer.selectedFilters,
  userLocation: state.globalReducer.userLocation
});

const ReduxContainer = connect(
  stateToProps,
  dispatchToProps,
)(Sidebar);

export default ReduxContainer;
