import React from 'react';
import PureComponent, { pure } from '../PureComponent'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Button } from '@material-ui/core';
import Radium from 'radium';
import Loading from 'react-loading';

import localizations from '../../Localizations'
import InputText from "../../MyEvents/InputText";
import * as types from '../../../actions/actionTypes.js';
import { colors, metrics, fonts } from '../../../theme';
import FilterButton from '../FilterTopBar/FilterButton';
import { currentLocationFilterId } from '../../../constants';

let styles;

class TopBar extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			newFilterModalOpen: false,
			defaultFilter: null,
			selectDefault: false,
			newFilterName: '',
			createFilter: false
		}
	}

	_handleSelect = filter => event => {
		if (filter.userFilterId === currentLocationFilterId) {
			this.props.onSelectLocationFilter(filter);
		} else {
			this.props._updateSelectedFilters([filter]);
		}
	};


	_handleDelete = filter => event => {
		let { viewer } = this.props;
		let savedFilters = this.props.viewer.me.savedFilters
			.map(item => {
				if (item.id === filter.id)
					return false;
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
				}
			})
			.filter(filter => Boolean(filter));
		if (this.state.defaultFilter && this.state.defaultFilter.id === filter.id)
			this.props.updateDefaultFilter(null)

		this.props.updateSavedFilter(savedFilters)
		this.props.updateFilterSettingSelection(false)
		setTimeout(() => {
			this.props._resetFilter();
			if (viewer.me && viewer.me.profileType !== 'PERSON' && viewer.me.subAccounts && viewer.me.subAccounts.length > 0) {
				this.props._updateUserFilter(viewer.me.subAccounts.map(e => e.id).concat([viewer.me.id]))
			}
			else if (viewer.me && viewer.me.profileType === 'PERSON' && viewer.me.subAccounts && viewer.me.subAccounts.length > 0) {
				this.props._updateUserFilter([viewer.me.id])
			}
		}, 200)
	};


	componentDidMount = () => {
		const { viewer, userFilter } = this.props;

		if (viewer.me && viewer.me.defaultSavedFilter)
		  this.setState({defaultFilter: viewer.me.defaultSavedFilter})
	}

	render() {
		const { selectedFilters, viewer, defaultLocationFilter } = this.props;

		let filterList = [].concat(
			viewer.me && viewer.me.savedFilters ? viewer.me.savedFilters : [],
		);

		if (viewer.me && viewer.me.defaultSavedFilter && filterList.findIndex(item => viewer.me.defaultSavedFilter.id === item.id) < 0)
			filterList.push(viewer.me.defaultSavedFilter)

		if (defaultLocationFilter)
			filterList.unshift(defaultLocationFilter);
			
		return (

			<div style={styles.outsideContainer}>
				{this.state.createFilter === false && 
					<div style={styles.container}>
						<div style={styles.box}>
							<Button
								onClick={() => this.props.updateFilterSettingSelection(!this.props.filterSettingsEnabled)}
								style={ this.props.filterSettingsEnabled ? styles.filterSettingsButtonEnabled : styles.filterSettingsButton }
							>
								<i className="material-icons" style={{fontSize: 16, padding: 3}}>{'settings'}</i>
								{localizations.myEvents_filterSettings}
							</Button>

							{filterList.map(filter => (
								<FilterButton
									key={filter.userFilterId}
									label={filter.filterName}
									onFilterSelected={this._handleSelect(filter)}
									onFilterDeleted={this._handleDelete(filter)}
									selected={!!selectedFilters && selectedFilters.findIndex(localFilter => localFilter.id === filter.id) >= 0}
									canBeDeleted={typeof filter.canBeDeleted !== "undefined" ? filter.canBeDeleted : true}
									hideCloseIcon={filter.userFilterId === currentLocationFilterId}
								/>
							))}
						</div>
					</div>
				}
			</div>
		);
	}
}

styles = {
	outsideContainer: {
		display: 'flex',
		flex: '5 1 0',
		flexWrap: 'nowrap',
		overflowX: 'auto',
		paddingLeft: metrics.padding.medium,
		marginBottom: metrics.margin.tiny,
		fontSize: fonts.size.tiny
	},
	container: {
		display: 'flex',
		flex: 1,
		overflow: 'auto',
		marginTop: '10px'
	},
	box: {
		display: 'flex',
		flexDirection: 'row',
		flex: '0 0 auto',
		minWidth: 'min-content'
	},

	icon: {
		cursor: 'pointer',
		marginTop: 3
	},

	inputRow: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		width: '500px'
	},
	filterSettingsButton: {
		color: colors.white,
		fontFamily: 'inherit',
		backgroundColor: colors.blue,
		fontSize: '12px',
		textTransform: "none",
		height: '30px',
		minHeight: '20px',
		padding: '0 0.7rem',
		alignItems: 'center',
		boxShadow: '1px 0 4px 0 rgba(0,0,0,0.6)',
	},
	filterSettingsButtonEnabled: {
		color: colors.blue,
		borderStyle: 'solid',
		borderWidth: 1,
		borderColor: colors.blue,
		fontFamily: 'inherit',
		backgroundColor: colors.white,
		fontSize: '12px',
		textTransform: "none",
		height: '30px',
		minHeight: '20px',
		padding: '0 0.7rem',
		alignItems: 'center',
		boxShadow: '1px 0 4px 0 rgba(0,0,0,0.6)',
	}
}



const _updateFilter = (value) => {
	return {
	  type: types.UPDATE_MY_EVENT_FILTER,
	  value,
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


const _updateUserFilter = (value) => {
	return {
		type: types.UPDATE_MY_EVENT_USER_FILTER,
		value
	}
}
const dispatchToProps = (dispatch) => ({
	_updateFilter: bindActionCreators(_updateFilter, dispatch),
	_resetFilter: bindActionCreators(_resetFilter, dispatch),
	_updateUserFilter: bindActionCreators(_updateUserFilter, dispatch),
	_updateSelectedFilters: bindActionCreators(_updateSelectedFilters, dispatch)
  });
  
  const stateToProps = (state) => ({
		filter: state.myEventFilterReducer.filter,
		userFilter: state.myEventFilterReducer.userFilter,
		sportunityTypeFilter: state.myEventFilterReducer.sportunityTypeFilter,
		organizersFilter: state.myEventFilterReducer.organizersFilter,
		opponentsFilter: state.myEventFilterReducer.opponentsFilter,
		selectedFilters: state.myEventFilterReducer.selectedFilters,
		selectedClubs: state.myEventFilterReducer.selectedClubs,
		sportId: state.sportunitySearchReducer.sportId,
		sportName: state.sportunitySearchReducer.sportName,
		locationName: state.sportunitySearchReducer.locationName,
		locationLat: state.sportunitySearchReducer.locationLat,
		locationLng: state.sportunitySearchReducer.locationLng,
		distanceRange: state.sportunitySearchReducer.distanceRange,
		userCountry: state.globalReducer.userCountry,
		userLocation: state.globalReducer.userLocation,
  });
  
  const ReduxContainer = connect(
	stateToProps,
	dispatchToProps,
  )(TopBar);


export default Radium(ReduxContainer);
