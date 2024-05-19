import React, {Component} from 'react'
import PureComponent, { pure } from '../common/PureComponent'
import Radium from 'radium'
import {createRefetchContainer, graphql, QueryRenderer} from 'react-relay';
import { connect } from 'react-redux'
import ReactLoading from 'react-loading';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import get from 'lodash/get';
import { bindActionCreators } from 'redux';
import ReactTooltip from 'react-tooltip'
import PropTypes from 'prop-types'

import environment from 'sportunity/src/createRelayEnvironment';
import Loading from '../common/Loading/Loading.js'
import Sidebar from './Sidebar'
import Events from './MyEventsEvents'
import GMap from './Map'
import * as types from '../../actions/actionTypes.js';
import localizations from '../Localizations'
import { metrics, colors, fonts } from '../../theme';
import SaveFilterMutation from "./SaveFilterMutation";
import { withAlert } from 'react-alert'
import SetDefaultFilterMutation from "./SetDefaultFilterMutation";
import InputCheckbox from "../common/Inputs/InputCheckbox";
import ActionSelect from "./ActionSelect";
import CancelEventMutation from "./Mutation/CancelEventMutation";
import {confirmModal} from "./ConfirmationModal";
import {removeOrganizerModal} from "./RemoveSecondaryOrganizerModal";
import RemoveSecondaryOrganizerMutation from "./Mutation/RemoveSecondaryOrganizerMutation";
import Organizer from "./MyEventsOrganizer";
import AddOrganizerModal from "./AddOrganizerModal";
import FindOrganizerModal from "./MyEventsFindOrganizerModal";
import {addOrganizerModal} from "./AddSecondaryOrganizerModal";
import TopBar from '../common/ActivityTopBar/TopBar';
import AddSecondaryOrganizerMutation from "./Mutation/AddSecondaryOrganizerMutation";
import AddSecondaryOrganizerModal from "./AddSecondaryOrganizerModal";
import BigCalendar from './MyEventsBigCalendar';
import { currentLocationFilterId } from '../../constants';
import LocationFilterModal from '../common/LocationFilterModal';
import GeolocationHOC from '../common/GeolocationHOC';

let styles;
const viewModes= {
	map: 1,
	eventsOnly: 2,
	calendar: 3
}

class MyEvents extends PureComponent {
	static contextTypes = {
		relay: PropTypes.shape({
		  variables: PropTypes.object,
		}),
	}

	changeFilterTime;
	doneChangingFilterInterval = 1000;

	constructor(props) {
		super(props)
		this.state = {
			highlightedId: null,
			loading: true,
			queryIsLoading: false,
			loadMoreQueryIsLoading: false,
			language: localizations.getLanguage(),
			isSelecting: false,
			sportunitySelected: [],
			allEventSelected: false,
			pageSize: 50,
			itemCount: 5,
			passedFirst: {
				pageSize: 50,
				itemCount: 5,
			},
			levels: [],
			selectedLevels: [],
			locationLat: null,
			locationLng: null,
			distanceRange: null,
			viewMode: 1,
			filterSettingsEnabled: false,
			displayStepperModal: false,
			showAskLocationModal: false,
			locationInputFocus: false
		}
	}

	componentDidMount = () => {
		document.title = 'Booked, Organized and past sportunities'
		this.setState({
			loading: false
		})
		
		if (this.props.viewer && this.props.viewer.me && !this.props.viewer.me.basicSavedFiltersCreated) {
			this._createDefaultFilters();
		}
		else if (!this.props.hasFilterChanged && this.props.viewer && this.props.viewer.me && this.props.viewer.me.defaultSavedFilter) {
			this.props._updateSelectedFilters([this.props.viewer.me.defaultSavedFilter])
		}
		else if (this.props.viewer && this.props.viewer.me && this.props.viewer.me.savedFilters && this.props.viewer.me.savedFilters.length > 0 && !this.props.viewer.me.defaultSavedFilter) {
			let defaultFilter = this.props.viewer.me.savedFilters.find(filter => filter.filterName === localizations.myEvents_defaultFilters_all) || this.props.viewer.me.savedFilters[0];
			if (defaultFilter) {
				this.updateDefaultFilter(defaultFilter.id, () => {
					this.props._updateSelectedFilters([defaultFilter])
				})
			}
		}
		else if (this.props.viewer.me) {
			this._setFilter(this.props);
		}
		if (!this.props.viewer.me) {
			this._createLocationFilter(() => 
				this.handleSelectLocationFilter()
			)
		}
	}

	componentWillReceiveProps = (nextProps) => {
		if (!this.props.locationFilter && nextProps.locationFilter && this.state.locationInputFocus) {
			this.setState({locationInputFocus: false})
		}
		if (!isEqual(this.props.selectedFilters, nextProps.selectedFilters) && nextProps.selectedFilters.length > 0) {
			let statusFilter = [];
			let userFilter = [];
			let sportunityTypeFilter = [];
			let sportFilter = null;
			let organizersFilter = [];
			let opponentsFilter = [];

			nextProps.selectedFilters.forEach((filter, index) => {
				if (filter.statuses !== null && filter.statuses !== undefined)
					filter.statuses.forEach((status) => {
						if (statusFilter.indexOf(status) < 0)
							statusFilter.push(status)
					})
				if (filter.subAccounts !== null && filter.subAccounts !== undefined)
					filter.subAccounts.forEach((user) => {
						if (userFilter.indexOf(user.id) < 0)
							userFilter.push(user.id)
					})
				if (filter.users !== null && filter.users !== undefined)
					filter.users.forEach((user) => {
						if (organizersFilter.indexOf(user.id) < 0)
							organizersFilter.push(user.id)
					})
				if (filter.sportunityTypes !== null && filter.sportunityTypes !== undefined)
					filter.sportunityTypes.forEach(type => {
						if (sportunityTypeFilter.indexOf(type.id) < 0)
							sportunityTypeFilter.push(type.id)
					})
				if (filter.sport !== null && filter.sport !== undefined && filter.sport.length>0) {
					sportFilter = {sportID: filter.sport[0].sport.id, sportName: filter.sport[0].sport.name}
					if (filter.sport[0].levels && filter.sport[0].levels.length > 0) {
						sportFilter = { ...sportFilter, level: filter.sport[0].levels}
					}
				}
				if (!!filter.dates && filter.dates.from && filter.dates.to) {
					this.props._updateDateFrom(filter.dates.from)
					this.props._updateDateTo(filter.dates.to)
				}
				else {
					this.props._updateDateFrom()
					this.props._updateDateTo()
				}
				if (filter.location && filter.location.lat) {
					if (filter.userFilterId === currentLocationFilterId) {
						this.props._updateLocationFilter({
							location: {
								lat: filter.location.lat,
								lng: filter.location.lng,
								radius: filter.location.radius
							}, label: 'Current Location'
						});
					} else {
					let geocoder = new google.maps.Geocoder();
					geocoder.geocode({'latLng': new google.maps.LatLng(filter.location)},(results, status) => {
						if (status === 'OK') {
							let city
							for (var a=0 ; a<results.length; a++) {
								let resultIdFound = false;
								for (var n=0; n<results[a].types.length ; n++) {
									if (results[a].types[n] === "locality") {
										resultIdFound = true ;
									}
								}
								if (resultIdFound) {
									for (var i=0; i<results[a].address_components.length; i++) {
										for (var b=0;b<results[a].address_components[i].types.length;b++) {
											if (results[a].address_components[i].types[b] == "locality") {
												city = results[a].address_components[i].long_name;
												break;
											}
										}
									}
								}
							}
							if (city) {
								this.props._updateLocationFilter({
									location: {
										lat: filter.location.lat,
										lng: filter.location.lng,
										radius: filter.location.radius
									}, label: city
								});
							}
						}
					})
					}
				} else {
					this.props._updateLocationFilter();
				}

			})
			this.props._updateFilter(statusFilter);
			this.props._updateUserFilter(userFilter);
			this.props._updateOrganizersFilter(organizersFilter);
			this.props._updateOpponentsFilter(opponentsFilter);
			this.props._updateSportunityTypeFilter(sportunityTypeFilter);
			this.props._updateSportFilter(sportFilter);


			setTimeout(() => {
				if (!this.context.relay.variables.query
					&& isEqual(this.props.filter, nextProps.filter) 
					&& isEqual(this.props.userFilter, nextProps.userFilter)
					&& isEqual(this.props.sportunityTypeFilter, nextProps.sportunityTypeFilter) 
					&& isEqual(this.props.sportFilter, nextProps.sportFilter)
					&& isEqual(this.props.locationFilter, nextProps.locationFilter)
					&& isEqual(this.props.organizersFilter, nextProps.organizersFilter)
					&& isEqual(this.props.opponentsFilter, nextProps.opponentsFilter)
					&& isEqual(this.props.dateFromFilter, nextProps.dateFromFilter)
					&& isEqual(this.props.dateToFilter, nextProps.dateToFilter)
				) {
					this._setFilter(nextProps)
				}
			}, 200)
		}
		else if (
			((nextProps.selectedFilters && 
				nextProps.selectedFilters[0] && 
				nextProps.selectedFilters[0].statuses && 
				nextProps.selectedFilters[0].statuses.indexOf('Available') >= 0) ||
			(nextProps.selectedFilters.length === 0 && nextProps.filter.indexOf('Available') >= 0)
			) && 
			!nextProps.locationFilter
		) {
			if (!this.state.showAskLocationModal)
				this.setState({showAskLocationModal: true})
				
			return;
		}
		else if (!isEqual(this.props.filter, nextProps.filter) 
			|| !isEqual(this.props.userFilter, nextProps.userFilter)
			|| !isEqual(this.props.sportunityTypeFilter, nextProps.sportunityTypeFilter) 
			|| !isEqual(this.props.sportFilter, nextProps.sportFilter)
			|| !isEqual(this.props.locationFilter, nextProps.locationFilter)
			|| !isEqual(this.props.organizersFilter, nextProps.organizersFilter)
			|| !isEqual(this.props.opponentsFilter, nextProps.opponentsFilter)
			|| !isEqual(this.props.selectedClubs, nextProps.selectedClubs)
			|| !isEqual(this.props.dateFromFilter, nextProps.dateFromFilter)
			|| !isEqual(this.props.dateToFilter, nextProps.dateToFilter)) {
			if (!this.props.userFilter && nextProps.userFilter.length === 1 && nextProps.userFilter[0] === this.props.viewer.me.id)
			{}
			else
				this._setFilter(nextProps)
		}
	}

	componentDidUpdate = (prevProps) => {
		if ((!prevProps.coords && this.props.coords) || prevProps.isGeolocationEnabled !== this.props.isGeolocationEnabled) {
			if (this.props.coords) {
				setTimeout(this.applyLocationFilter, 100);
			}
		}
	}

	_createLocationFilter = (callback) => {
		const { coords, isGeolocationAvailable, isGeolocationEnabled, positionError } = this.props;
		let location = {};

		if (isGeolocationAvailable && coords) {
			location = {
				lat: coords.latitude,
				lng: coords.longitude,
				radius: 100
			};
			localStorage.setItem('sportunity_user_location', JSON.stringify(location));
		} else {
			location = {
				lat: 48,
				lng: 2.35,
				radius: 100
			};
		}

		const defaultLocationFilter = {
			userFilterId: currentLocationFilterId,
			filterName: localizations.myEvents_defaultFilters_aroundMe,
			location,
			statuses: ['Available'],
		};

		this.setState({ defaultLocationFilter }, () => typeof callback !== 'undefined' && callback());
		
		return defaultLocationFilter;
	}

	_createDefaultFilters = () => {
		let savedFilters = [];
		/*if (this.props.viewer.me.savedFilters && this.props.viewer.me.savedFilters.length > 0) {
			this.props.viewer.me.savedFilters
				.forEach(item => savedFilters.push({
					userFilterId: item.id,
					filterName: item.filterName,
					statuses: item.statuses,
					subAccounts: item.subAccounts.map(user => user.id),
					users: item.users.map(user => user.id),
					sportunityTypes: item.sportunityTypes.map(user => user.id),
					sport: item.sport.map(sportItem =>
						(sportItem.sport.level && sportItem.sport.level.length>0 ? {
							sportID: sport.sport.sportID,
							level: sportItem.sport.level.map(levelItem => levelItem.id)
						} : {
							sportID: sport.sport.sportID,
						}
					)),
					location: {
						lat: item.location.lat,
						lng: item.location.lng,
						radius: item.location.radius,
					},
					page: item.page
				}))
		}*/

		if (this.props.viewer.me.profileType === 'PERSON') {
			savedFilters.push({
				filterName: localizations.myEvents_defaultFilters_all,
				statuses: ["Organized","Booked","Invited","CoOrganizer","AskedCoOrganizer", "Survey", "Declined", "Cancelled"],
				subAccounts: [],
				users: [],
				sportunityTypes: [],
				sport: null,
				location: null,
				page: 'ORGANIZED',
				canBeDeleted: false
			});
			savedFilters.push({
				filterName: localizations.myEvents_defaultFilters_aroundMe, 
				statuses: ["Available"],
				subAccounts: [],
				users: [],
				sportunityTypes: [],
				sport: null,
				location: null,
				page: 'ORGANIZED',
				canBeDeleted: false
			});
			if (this.props.viewer.me.subAccounts && this.props.viewer.me.subAccounts.length > 0) {
				savedFilters.push({
					filterName: localizations.myEvents_defaultFilters_children,
					statuses: ["Invited", "Booked"],
					subAccounts: this.props.viewer.me.subAccounts.map(sub => sub.id),
					users: [],
					sportunityTypes: [],
					sport: null,
					location: null,
					page: 'ORGANIZED',
					canBeDeleted: false
				});
			}
		}
		else if (this.props.viewer.me.profileType === 'ORGANIZATION') {
			let sportunityTypeMatch = this.props.viewer.sportunityTypes.find(type => type.name.EN === "Match")
			let sportunityTypeTraining = this.props.viewer.sportunityTypes.find(type => type.name.EN === "Training")
			savedFilters.push({
				filterName: localizations.myEvents_defaultFilters_all,
				statuses: ["Organized","Booked","Invited","CoOrganizer","AskedCoOrganizer", "Survey", "Declined", "Cancelled"],
				subAccounts: [],
				users: [],
				sportunityTypes: [],
				sport: null,
				location: null,
				page: 'ORGANIZED',
				canBeDeleted: false
			});
			savedFilters.push({
				filterName: localizations.myEvents_defaultFilters_aroundMe, 
				statuses: ["Available"],
				subAccounts: [],
				users: [],
				sportunityTypes: [],
				sport: null,
				location: null,
				page: 'ORGANIZED',
				canBeDeleted: false
			});
			if (this.props.viewer.me.subAccounts && this.props.viewer.me.subAccounts.length > 0) {
				savedFilters.push({
					filterName: localizations.myEvents_defaultFilters_teams,
					statuses: ["Organized"],
					subAccounts: this.props.viewer.me.subAccounts.map(sub => sub.id),
					users: [],
					sportunityTypes: [],
					sport: null,
					location: null,
					page: 'ORGANIZED',
					canBeDeleted: false
				});
			}
		}
		else if (this.props.viewer.me.profileType === 'BUSINESS' || this.props.viewer.me.profileType === 'SOLETRADER') {
			savedFilters.push({
				filterName: localizations.myEvents_defaultFilters_all,
				statuses: ["Organized","Booked","Invited","CoOrganizer","AskedCoOrganizer", "Survey", "Declined", "Cancelled"],
				subAccounts: [],
				users: [],
				sportunityTypes: [],
				sport: null,
				location: null,
				page: 'ORGANIZED',
				canBeDeleted: false
			});
			savedFilters.push({
				filterName: localizations.myEvents_defaultFilters_aroundMe, 
				statuses: ["Available"],
				subAccounts: [],
				users: [],
				sportunityTypes: [],
				sport: null,
				location: null,
				page: 'ORGANIZED',
				canBeDeleted: false
			});
			if (this.props.viewer.me.subAccounts && this.props.viewer.me.subAccounts.length > 0) {
				savedFilters.push({
					filterName: localizations.myEvents_defaultFilters_subAccounts,
					statuses: ["Organized"],
					subAccounts: this.props.viewer.me.subAccounts.map(sub => sub.id),
					users: [],
					sportunityTypes: [],
					sport: null,
					location: null,
					page: 'ORGANIZED',
					canBeDeleted: false
				});
			}
		}

		if (savedFilters.length > 0) {
			this.updateSavedFilter(savedFilters, true, (props) => {
				if (props.viewer.me.savedFilters.length > 0) {
					let defaultFilter = props.viewer.me.savedFilters.find(filter => filter.filterName === localizations.myEvents_defaultFilters_all)
					if (defaultFilter) {
						this.updateDefaultFilter(defaultFilter.id, () => {
							this.props._updateSelectedFilters([defaultFilter])
						})
					}
				}
			});
		}
	}

	_loadMoreQueryIsLoaded = () => {
		if (this.context.relay.variables.first === this.state.itemCount) {
			this.setState({
				loadMoreQueryIsLoading: false,
			})
		} else {
			setTimeout(this._loadMoreQueryIsLoaded, 200)
		}
	}

	_loadMore = () => {
		const nextCount = this.state.itemCount + this.state.pageSize

		const refetchVariables = fragmentVariables => ({
			...this.context.relay.variables,
			first: nextCount
		});

		this.props.relay.refetch(
			refetchVariables,
			null,
			this._loadMoreQueryIsLoaded,
			{force: false}
		);

		this.setState({
			itemCount: nextCount,
			loadMoreQueryIsLoading: true,
		})
  }

	_setLanguage = (language) => {
		this.setState({ language: language })
	}

	_onEventHoverHandler = (id) => {
		this.setState({
			highlightedId: id,
		})
	}

	_onEventLeaveHandler = () => {
		this.setState({
			highlightedId: null,
		})
	}

	_setFilter = (props) => {
		this.setState({queryIsLoading: true})
		clearTimeout(this.changeFilterTime);
		this.changeFilterTime = setTimeout(() => this._handleRefetch(props), this.doneChangingFilterInterval);
	}

	_handleRefetch = props => {
		this.props._updateHasChangedFilter(true);

		let users = props.organizersFilter;
		if (props.selectedClubs && props.selectedClubs.length > 0)  {
			props.selectedClubs.forEach(selectedClub => users.push(selectedClub.owner.id))
		}

		let newFilter = {
			statuses: props.filter,
			subAccounts: props.userFilter,
			sportunityTypes: props.sportunityTypeFilter,
			sport: props.sportFilter ?
				(props.sportFilter.level && props.sportFilter.level.length>0 ? {
					sportID: props.sportFilter.sportID,
					level: props.sportFilter.level.map(levelItem => levelItem.id)
				} : {
					sportID: props.sportFilter.sportID,
				}
			) : null,
			location: props.locationFilter ? {
				lat: props.locationFilter.location.lat,
				lng: props.locationFilter.location.lng,
				radius: props.locationFilter.location.radius,
			} : null,
			users: users,
			opponents: props.opponentsFilter,
		}

		if (props.dateFromFilter && props.dateToFilter) {
			newFilter.dates = {
				from: new Date(props.dateFromFilter).toDateString(), 
				to: new Date(props.dateToFilter).toDateString()
			} 
		}

		const refetchVariables = fragmentVariables => ({
			...fragmentVariables,
			filter: newFilter,
			filterOrganizer: {
				statuses: props.filter,
				subAccounts: props.userFilter,
				sportunityTypes: props.sportunityTypeFilter,
			},
			orderBy: props.filter && (props.filter.length === 1 && 
					(props.filter[0] === 'Past' || props.filter[0] === 'Cancelled') || 
					(props.filter.length === 2 && (props.filter.indexOf('Past') >= 0 && props.filter.indexOf('Cancelled') >= 0)))
				? 'BEGINNING_DATE_DESC' 
				: 'BEGINNING_DATE_ASC' ,
			first: 5,
			query: true
		});

		this.props.relay.refetch(
			refetchVariables,
			null,
			() => {
				setTimeout(() => {// Needed to wait for Relay to re-fetch data in this.props.viewer
					this.setState({
						queryIsLoading: false,
						loading: false
					})
					this.props.relay.refetch({
						...this.context.relay.variables,
						queryMain: true
					}, 
					null,
					() => {
						this.setState({
							queryIsLoading: false,
							loading: false
						})
						this._loadMore()
					})
			}, 50);
			},
			{force: false}
		);
	}

	updateSavedFilter = (data, basicSavedFiltersCreated = false, callback) => {
		SaveFilterMutation.commit(
				basicSavedFiltersCreated 
				?	{
						viewer: this.props.viewer,
						user: this.props.viewer.me,
						userIDVar: this.props.viewer.me.id,
						savedFiltersVar: data,
						basicSavedFiltersCreatedVar: basicSavedFiltersCreated
					}
				:	{
						viewer: this.props.viewer,
						user: this.props.viewer.me,
						userIDVar: this.props.viewer.me.id,
						savedFiltersVar: data,
					}
				,
			{
				onSuccess: () => {
					if (typeof callback !== "undefined")
						setTimeout(() => callback(this.props), 150);
					else 
						this.props.alert.show(localizations.popup_findSportunity_filter_success, {
							timeout: 3000,
							type: 'success',
						});
				},
				onFailure: (error) => {
					console.log(error.getError());
					this.props.alert.show(error.getError(), {
						timeout: 3000,
						type: 'error',
					});
				},
			}
		)
		this.setState({
			filterSettingsEnabled: false
		})
	}

	updateDefaultFilter = (data, callback) => {
		SetDefaultFilterMutation.commit({
				viewer: this.props.viewer,
				user: this.props.viewer.me,
				filterIDVar: data
			},
			{
				onSuccess: () => {
					if (typeof callback !== 'undefined') {
						callback();
					}
					else {
						this.props.alert.show(localizations.popup_findSportunity_filter_success, {
							timeout: 3000,
							type: 'success',
						});
					}
				},
				onFailure: (error) => {
					console.log(error.getError());
					this.props.alert.show(error.getError(), {
						timeout: 3000,
						type: 'error',
					});
				},
			}
		)
	}

	_handleSeeMore = (newStatus) => {
		if (newStatus)
			this.props.relay.refetch({
				...this.context.relay.variables,
				organizersNumber: this.props.viewer.sportunitiesOrganizers.count
			})
		else
			this.props.relay.refetch({
				...this.context.relay.variables,
				organizersNumber: 5
			})
	};

	_handleSwitchSelecting = () => {
		this.setState({isSelecting: !this.state.isSelecting})
	}

	_handleSwitchViewMode = (viewMode) => {
		this.setState({viewMode: viewMode})
	}

	_handleSelectEvent = (event) => {
		let tsportunitySelected = cloneDeep(this.state.sportunitySelected)

		let index = tsportunitySelected.findIndex(sportunity => sportunity.id === event.id);
		
		if (index < 0)
			tsportunitySelected.push(event)
		else
			tsportunitySelected.splice(index, 1)

		let sportunitiesList = this.props.viewer.sportunities.edges.filter(sportunity => sportunity.node.organizers.find(organizer => organizer.isAdmin).organizer.id === this.props.viewer.me.id)
		let allEventSelected = true;
		sportunitiesList.forEach(sportunity => {
			if (tsportunitySelected.findIndex(selected => selected.id === sportunity.node.id) < 0)
				allEventSelected = false;
		})

		this.setState({
			sportunitySelected: tsportunitySelected,
			allEventSelected 
		})
	}

	_handleSelectAllEvent = () => {
		
		let sportunitySelected = []

		if (!this.state.allEventSelected)
			this.props.viewer.sportunities.edges.forEach(sportunity => {
				if (sportunity.node.organizers.find(organizer => organizer.isAdmin).organizer.id === this.props.viewer.me.id)
					sportunitySelected.push(sportunity.node)
			})
		this.setState({
			sportunitySelected,
			allEventSelected: !this.state.allEventSelected,
		})
	}

	cancelEvents = () => {
		let {sportunitySelected} = this.state
		confirmModal({
			title: localizations.selectingEvent_confirmModal_title,
			nbSelected: sportunitySelected ? sportunitySelected.length : 0,
			confirmLabel: localizations.selectingEvent_valid,
			cancelLabel: localizations.selectingEvent_cancel,
			canCloseModal: true,
			onConfirm: () => {
				CancelEventMutation.commit({
						viewer: this.props.viewer,
						sportunityIDsVar: sportunitySelected ? sportunitySelected.map(sportunity => sportunity.id) : []
					},
					{
						onSuccess: () => {
							this.props.alert.show(localizations.popup_newSportunity_update_success, {
								timeout: 3500,
								type: 'success',
							});
						},
						onFailure: error => {
							this.props.alert.show(error.getError().source.errors[0].message, {
								timeout: 2000,
								type: 'error',
							});
						}
					}
				)
			}
		})
	}

	removeOrganizer = () => {
		let {sportunitySelected} = this.state;
		let organizers = []
		sportunitySelected.forEach(sportunity => {
			sportunity.organizers.forEach(organizer => {
				if (!organizer.isAdmin && organizers.findIndex(item =>
					item.organizer.id === organizer.organizer.id && (item.secondaryOrganizerType !== null && organizer.secondaryOrganizerType !== null
					? item.secondaryOrganizerType.id === organizer.secondaryOrganizerType.id
					: item.customSecondaryOrganizerType === organizer.customSecondaryOrganizerType)
				) < 0)
					organizers.push(organizer)
			})
		})
		if (organizers.length > 0)
			removeOrganizerModal({
				title: localizations.selectingEvent_action_removeOrganizer_select,
				organizers,
				confirmLabel: localizations.selectingEvent_valid,
				cancelLabel: localizations.selectingEvent_cancel,
				canCloseModal: false,
				onConfirm: (selectedOrganizer) => {
					confirmModal({
						title: localizations.selectingEvent_confirmModal_title,
						nbSelected: sportunitySelected ? sportunitySelected.length : 0,
						confirmLabel: localizations.selectingEvent_valid,
						cancelLabel: localizations.selectingEvent_cancel,
						canCloseModal: true,
						onConfirm: () => {
							RemoveSecondaryOrganizerMutation.commit({
									viewer: this.props.viewer,
									sportunityIDsVar: sportunitySelected ? sportunitySelected.map(sportunity => sportunity.id) : [],
									organizerVar: selectedOrganizer,
								},
								{
									onSuccess: () => {
										this.props.alert.show(localizations.popup_newSportunity_update_success, {
											timeout: 3500,
											type: 'success',
										});
									},
									onFailure: error => {
										this.props.alert.show(error.getError().source.errors[0].message, {
											timeout: 2000,
											type: 'error',
										});
									}
								}
							)
						}
					})
				}
			})
		else {
			this.props.alert.show('Aucun organisateur secondaire dans la s�lection', {
				timeout: 3000,
				type: 'info',
			});
		}
	}

	addOrganizer = (selectedOrganizer) => {
		let {sportunitySelected} = this.state;
		confirmModal({
			title: localizations.selectingEvent_confirmModal_title,
			nbSelected: sportunitySelected ? sportunitySelected.length : 0,
			confirmLabel: localizations.selectingEvent_valid,
			cancelLabel: localizations.selectingEvent_cancel,
			canCloseModal: true,
			onConfirm: () => {
				AddSecondaryOrganizerMutation.commit({
						viewer: this.props.viewer,
						sportunityIDsVar: sportunitySelected ? sportunitySelected.map(sportunity => sportunity.id) : [],
						organizerVar: selectedOrganizer,
					},
					{
						onSuccess: () => {
							this.props.alert.show(localizations.popup_newSportunity_update_success, {
								timeout: 3500,
								type: 'success',
							});
						},
						onFailure: error => {
							this.props.alert.show(error.getError().source.errors[0].message, {
								timeout: 2000,
								type: 'error',
							});
						}
					}
				)
			}
		})
	}


	_toggleOpenModal = () => {
		this.setState({openModal: !this.state.openModal})
	}

	_handleFilterSettingsSelection = selection => {
		if (this.props.viewer.me && this.props.viewer.me.id) {
			this.setState({
				filterSettingsEnabled: selection
			})
		}
		else {
			this.props.alert.show(localizations.popup_filterSettings_login, {
				timeout: 3000,
				type: 'info',
			});
		}
	}

	handleSelectLocationFilter = () => {
		const { coords } = this.props;
		const savedLocationFilter = JSON.parse(localStorage.getItem('sportunity_user_location'));

		if ((coords && coords.latitude) || (savedLocationFilter && savedLocationFilter.lat)) {
			this.applyLocationFilter();
		} 
		else {
			this.setState({ showAskLocationModal: true });
		}
	}

	applyLocationFilter = () => {
		const { coords, positionError } = this.props;
		const savedLocationFilter = JSON.parse(localStorage.getItem('sportunity_user_location'));

		if (!this.props.viewer.me && !this.state.defaultLocationFilter.location.lat) {
			this.setState({ showAskLocationModal: true });
			return;
		}

		if (positionError) {
			if (positionError.code === 1) {
				alert('Location access is currently blocked. Please enable the access from your browser settings.');
			} 
			else {
				alert('There seems to be a problem with fetching your current location. Please try later.');
			}
			localStorage.removeItem('sportunity_user_location');
		}

		if (!coords) {
			this.props.getLocation({
				onSuccess: () => {
					this._createLocationFilter();
					if (this.retriedLocationFetch !== true) {
						setTimeout(this.applyLocationFilter, 100);
					}
					this.retriedLocationFetch = true;
				},
				onError: () => {
					localStorage.removeItem('sportunity_user_location');
				}
			});
			return;
		}

		const { defaultLocationFilter } = this.state;

		if (savedLocationFilter && savedLocationFilter.lat) {
			this.props._updateSelectedFilters([{...defaultLocationFilter, location: savedLocationFilter}]);
			this.setState({ showAskLocationModal: false });
		} else if (coords) {
			this.props._updateSelectedFilters([defaultLocationFilter]);
			this.setState({ showAskLocationModal: false });
		}
	}

	focusOnLocationInput = () => {
		if (!this.props.viewer.me) {
			const filter = {
				userFilterId: currentLocationFilterId,
				filterName: localizations.myEvents_defaultFilters_aroundMe,
				location: {},
				statuses: ['Available'],
			};
			this.props._updateSelectedFilters([filter]);
		}
		this.setState({ showAskLocationModal: false }, () => {
			setTimeout(() => 
				this.setState((prevState) => ({ locationInputFocus: !prevState.locationInputFocus, showAskLocationModal: false })),
				500
			);
		});
	}

	render() {
		if (this.state.loading) {
			return(<Loading />)
		}
    	const { viewer } = this.props ;

		let actionList = [
			{name: localizations.selectingEvent_action_cancel, onClickAction: this.cancelEvents, tip: localizations.selectingEvent_action_cancel_tip},
			{name: localizations.selectingEvent_action_removeOrganizer, onClickAction: this.removeOrganizer},
			{name: localizations.selectingEvent_action_addOrganizer, onClickAction: this._toggleOpenModal},
		]
		let {
			isSelecting,
			sportunitySelected,
			allEventSelected,
			openModal
		} = this.state

		return (
			<div className={"anil"} style={styles.container}>
				<div style={styles.content}>
					<ReactTooltip effect="solid" multiline={true}/>
					{openModal &&
						<AddSecondaryOrganizerModal
							title={localizations.selectingEvent_action_removeOrganizer_select}
							user={this.props.viewer.me}
							viewer={this.props.viewer}
							sprotunities={sportunitySelected}
							confirmLabel={localizations.selectingEvent_valid}
							cancelLabel={localizations.selectingEvent_cancel}
							canCloseModal={false}
							onConfirm={this.addOrganizer}
							isOpen={openModal}
							onClose={this._toggleOpenModal}
						/>
					}
					<div className={"anil2"} style={{display: 'flex', flexDirection: 'column'}}>


						<Sidebar
							{...this.state} 
							viewer={viewer} 
							user={viewer.me} 
							selectAllEvent={this._handleSelectAllEvent} 
							updateSavedFilter={this.updateSavedFilter} 
							updateDefaultFilter={this.updateDefaultFilter} 
							onSeeMore={this._handleSeeMore}
							updateFilterSettingSelection={this._handleFilterSettingsSelection}
							locationInputFocus={this.state.locationInputFocus}
						/>
					</div>

					<div style={styles.event_filter_main}>
						
							<div style={{flex: 1}}>
								<LocationFilterModal
									visible={this.state.showAskLocationModal}
									applyLocationFilter={this.applyLocationFilter}
									focusOnLocationInput={this.focusOnLocationInput}
									onCloseModal={() => {
										this.setState({ showAskLocationModal: false });
									}}
								/>

								<div style={styles.viewsContainer}>
									<TopBar
										{...this.state}
										viewer={viewer}
										updateSavedFilter={this.updateSavedFilter}
										updateDefaultFilter={this.updateDefaultFilter} 
										nameCompletion={this.props.nameCompletion}
										isActivityBar={true}
										updateFilterSettingSelection={this._handleFilterSettingsSelection}
										onSelectLocationFilter={this.handleSelectLocationFilter}
									>
									</TopBar>
									<div className={'switchViewMode'} style={styles.switchViewModeContainer}>
										<i
											className='fa fa-map-marker'
											style={
												this.state.viewMode === viewModes.map
													? { ...styles.switchViewIcon, color: colors.blue }
													: styles.switchViewIcon
											}
											onClick={() => this._handleSwitchViewMode(viewModes.map)}
										/>
										<i
											className='fa fa-bars'
											style={
												this.state.viewMode === viewModes.eventsOnly
													? { ...styles.switchViewIcon, color: colors.blue }
													: styles.switchViewIcon
											}
											onClick={() => this._handleSwitchViewMode(viewModes.eventsOnly)}
										/>
										<i
											className='fa fa-calendar-o'
											style={
												this.state.viewMode === viewModes.calendar
													? { ...styles.switchViewIcon, color: colors.blue }
													: styles.switchViewIcon
											}
											onClick={() => this._handleSwitchViewMode(viewModes.calendar)}
										/>
									</div>
								</div>

								<div style={styles.viewsContainer}>
									{(this.state.viewMode === viewModes.map || this.state.viewMode === viewModes.eventsOnly) &&
										<div style={{flex: 1}}>
											{viewer.me && (
												!isSelecting
												?	<div className={"activity_input_box"} onClick={this._handleSwitchSelecting} style={{...styles.selectBar, cursor: 'pointer'}}>
														{localizations.selectingEvent_showSelecting}
														<i className='fa fa-angle-right fa-2x'/>
													</div>
												: 	<div className={"activity_input_open"} style={styles.selectBar}>
														<ActionSelect
															list={actionList}
															placeholder={"Select an action"}
															isDisabled={!(sportunitySelected && sportunitySelected.length > 0)}
														/>
														<div className={"activity_open1"}>
															{localizations.formatString(localizations.selectingEvent_nbSelected, sportunitySelected ? sportunitySelected.length : 0)}
														</div>
														<div className={"activity_open2"} style={{display: 'flex', alignItems: 'center'}}>
															{localizations.selectingEvent_selectAll}
															<InputCheckbox
																checked={allEventSelected}
																onChange={this._handleSelectAllEvent}
															/>
														</div>
														<i
															className='fa fa-angle-left fa-2x'
															style={{cursor: 'pointer', flexBasis: '10%'}}
															onClick={this._handleSwitchSelecting}
														/>
													</div>
												)
											}
											{this.state.queryIsLoading 
											?	<div style={styles.loadingSpinner}>
													<ReactLoading type='cylon' color={colors.blue} />
												</div>
											:	viewer.sportunities &&  
													<Events
														sportunities={viewer.sportunities}
														onHover={this._onEventHoverHandler}
														onLeave={this._onEventLeaveHandler}
														viewer={viewer}
														queryIsLoading={this.state.queryIsLoading}
														onLoadMore={this._loadMore}
														numberOfEvents={this.context.relay.variables.first}
														selectEvent={this._handleSelectEvent}
														{...this.state}
													/>
											}
										</div>
									}
									{this.state.viewMode === viewModes.calendar &&
										<div style={styles.calendarContainer}>
											<BigCalendar
												viewer={viewer}
												selectedDate={this.state.selectedDate}
												{...this.state}
											/>
										</div>
									}
									{this.state.viewMode === viewModes.map &&
										<div style={{flex: 1}}>
											<GMap
												sportunities={viewer.sportunities}
												highlightedId={this.state.highlightedId}
											/>
										</div>
									}
								</div>
							</div>
						
					</div>
				</div>
			</div>
		);
  }
}

styles = {
	
	event_filter_main: {
		width: '100%',
		display: 'flex',
		flex: '1 1 0',
		'@media (max-width: 767px)': {
			display: 'block',
    	}
		
	},
	activityTopbar: {
		margin: 5,
	},
	selectBar: {
		margin: '5px 5px 5px 17px',
		padding: '0 5px 5px 5px',
		backgroundColor: colors.background,
		display: 'flex',
		flexDirection: 'row',
		fontSize: fonts.size.small,
		alignItems: 'center',
		justifyContent: 'space-between',
		borderRadius: 5,
		'@media (max-width: 767px)': {
      		lineHeight: '45px',
    	}
	},
	container: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		fontFamily: 'Lato',
		width: '100%',
		'@media (max-width: 767px)': {
			display: 'block',
    	}
	},
	h1: {
		fontSize: fonts.size.xxl,
		color: colors.blue,
		fontWeight: fonts.weight.xxl,
	},
	title: {
		display: 'flex',
		alignItems: 'flex-end',
		margin: metrics.margin.xxxl,
		'@media (max-width: 767px)': {
			display: 'block',
    	}
	},
	content: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'left',
		paddingTop: 0,
		'@media (max-width: 960px)': {
      		display: 'block',
    	},
		'@media (max-width: 767px)': {
			display: 'block',
    	}
	},
	loadingSpinner:{
		display: 'flex',
		alignItems: 'flex-start',
		justifyContent: 'center',
		flex: 1,
		marginTop: 50,
		'@media (max-width: 767px)': {
			display: 'block',
    	}
	},
	switchViewIcon: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-around',
		cursor: 'pointer',
		fontSize: metrics.icons.tiny,
		margin: metrics.margin.small
	},
	switchViewModeContainer: {
		display: 'flex',
		flex: 1,
		justifyContent: 'flex-end'
	},
	calendarContainer: {
		width: '100%',
		display: 'flex'
	},
	viewsContainer: {
		display: 'flex',
		flexDirection: 'row',
		'@media (max-width: 767px)': {
			display: 'block',
		}
	},
};

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

const _updateSportLevelsFilter = (value) => {
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

const stateToProps = (state) => ({
	filter: state.myEventFilterReducer.filter,
	userFilter: state.myEventFilterReducer.userFilter,
	sportunityTypeFilter: state.myEventFilterReducer.sportunityTypeFilter,
	sportFilter: state.myEventFilterReducer.sportFilter,
	locationFilter: state.myEventFilterReducer.locationFilter,
	organizersFilter: state.myEventFilterReducer.organizersFilter,
	opponentsFilter: state.myEventFilterReducer.opponentsFilter,
	selectedFilters: state.myEventFilterReducer.selectedFilters,
	hasFilterChanged: state.myEventFilterReducer.hasFilterChanged,
	selectedClubs: state.myEventFilterReducer.selectedClubs,
	dateFromFilter: state.myEventFilterReducer.dateFromFilter,
	dateToFilter: state.myEventFilterReducer.dateToFilter,
  	userLocation: state.globalReducer.userLocation,
});

const _resetAction = () => ({
  type: types.UPDATE_MY_EVENT_RESET_FILTER,
})

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

const _updateHasChangedFilter = value => {
	return {
		type: types.UPDATE_MY_EVENT_FILTER_HAS_CHANGED,
		value
	}
}

const dispatchToProps = (dispatch) => ({
	_resetAction: bindActionCreators(_resetAction,dispatch),
	_updateFilter: bindActionCreators(_updateFilter, dispatch),
	_updateUserFilter: bindActionCreators(_updateUserFilter, dispatch),
	_updateSportunityTypeFilter: bindActionCreators(_updateSportunityTypeFilter, dispatch),
	_updateSportFilter: bindActionCreators(_updateSportFilter, dispatch),
	_updateLocationFilter: bindActionCreators(_updateLocationFilter, dispatch),
	_updateSportLevelsFilter: bindActionCreators(_updateSportLevelsFilter, dispatch),
	_updateOrganizersFilter: bindActionCreators(_updateOrganizersFilter, dispatch),
	_updateOpponentsFilter: bindActionCreators(_updateOpponentsFilter, dispatch),
	_updateSelectedFilters: bindActionCreators(_updateSelectedFilters, dispatch),
	_updateHasChangedFilter: bindActionCreators(_updateHasChangedFilter, dispatch),
	_updateDateFrom: bindActionCreators(_updateDateFrom, dispatch),
	_updateDateTo: bindActionCreators(_updateDateTo, dispatch)
})

const ReduxContainer = connect(
  stateToProps,
	dispatchToProps,
)(Radium(MyEvents));

const MyEventsWithGeolocation = GeolocationHOC({
	positionOptions: {
    enableHighAccuracy: false,
  },
  userDecisionTimeout: 5000,
})(ReduxContainer);

const MyEnentsTemp = createRefetchContainer(Radium(withAlert(MyEventsWithGeolocation)), {
  	viewer: graphql`
      	fragment MyEvents_viewer on Viewer @argumentDefinitions(
			filter: { type: "Filter" },
			filterOrganizer: { type: "Filter" },
			organizersNumber: { type: "Int", defaultValue: 5 },
			first: { type: "Int", defaultValue: 5 },
			orderBy: { type: "Sportunities_Order", defaultValue: BEGINNING_DATE_DESC },
			query: { type: "Boolean!", defaultValue: false },
			queryMain: { type: "Boolean!", defaultValue: true },
	  	) {
          	...MyEventsEvents_viewer
      		...AddSecondaryOrganizerModal_viewer
			id
			sportunityTypes (sportType: COLLECTIVE) @include(if: $queryMain){
				id
				name{FR,EN}
			}
			sportunities(first: $first, filter: $filter, orderBy: $orderBy) @include(if: $query) {
				count
				edges {
					node {
						id
						title
						beginning_date
						ending_date
						description
						sport {
							sport {
								assistantTypes {
									id,
									name {
										FR,
										EN,
										DE, 
										ES
									}
								}
              				}
						}
						organizers {
							id
							isAdmin
							role
                    		secondaryOrganizerType {
                				id
								name {
									FR
									EN
									DE
									ES
								}
              				}
              				customSecondaryOrganizerType
							organizer {
								id
								pseudo
							}
						}
					}
				}
				...MyEventsEvents_sportunities
				...Map_sportunities
			}
			sportunitiesOrganizers(first: $organizersNumber, filter: $filterOrganizer) @include(if: $query) {
				count
				edges {
					node {
						id
						pseudo
					}
				}
			}
			myOpponents (last: 20) @include(if: $query) {
				count
				edges {
					node {
						id
						pseudo
					}
				}
			}
			me {
				...AddSecondaryOrganizerModal_user
				id
				canQuerySportunityTypeFilter @include(if: $query)
				basicSavedFiltersCreated
				profileType
				savedFilters {
					id
					canBeDeleted
					page
					filterName
					statuses
					users {
						id
						pseudo
					}
					subAccounts {
						id
						pseudo
					}
					sportunityTypes {
						id
						name {
							FR
							EN
						}
					}
					sport {
						sport {
							id
							name {
								EN
								FR
								DE
							}
						}
						levels {
							id
							EN {
								name
								skillLevel
								description
							}
							FR {
								name
								skillLevel
								description
							} 
						}
					}
					dates {
						from, 
						to
					}
					location {
						lat
						lng
						radius
					}
				}
				defaultSavedFilter {
					id
					filterName
					statuses
					users {
						id
						pseudo
					}
					subAccounts {
						id
						pseudo
					}
					sportunityTypes {
						id
						name {
							FR
							EN
						}
					}
				}
				circlesUserIsIn (last:20) {
					edges {
						node {
						id
						name
						owner {
							id
							pseudo
							avatar
						}
						mode
						isCircleUpdatableByMembers
						isCircleUsableByMembers
						memberCount
						}
					}
				}
				subAccounts @include(if: $queryMain){
					id,
					pseudo
				}
			}
		}
	`,
},
graphql`
    query MyEventsRefetchQuery(
		$filter: Filter
		$filterOrganizer: Filter
		$organizersNumber: Int
		$first: Int
		$orderBy: Sportunities_Order
		$query: Boolean!
		$queryMain: Boolean!
    ) {
      	viewer {
			...MyEvents_viewer @arguments(
				filter: $filter
				filterOrganizer: $filterOrganizer
				organizersNumber: $organizersNumber
				first: $first
				orderBy: $orderBy
				query: $query
				queryMain: $queryMain
          	)
      	}
    }
`);

export default class extends Component {
    render() {
        return ( 
			<QueryRenderer 
				environment={ environment }
				query = { graphql `
					query MyEventsQuery {
						viewer {
							...MyEvents_viewer
						}
					}
				` }
				variables = {
					{}
				}
				render = {
					({ error, props }) => {
						if (props) {
							return <MyEnentsTemp query = { props }
							viewer = { props.viewer } {...this.props }
							/>;
						} 
						else {
							return ( 
								<Loading />
							)
						}
					}
				}
            />
        )
    }
}