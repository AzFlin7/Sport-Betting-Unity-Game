import React from 'react';
import PureComponent, { pure } from '../PureComponent'
import Radium from 'radium';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { withAlert } from 'react-alert'
import Loading from 'react-loading';
import { Button } from '@material-ui/core';

import localizations from '../../Localizations'
import InputText from "../../MyEvents/InputText";
import * as types from '../../../actions/actionTypes.js';
import { colors, metrics, fonts } from '../../../theme';
import FilterButton from './FilterButton';
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
			createFilter: false,
		}
	}


	_handleSelect = filter => event => {
		if (filter.userFilterId === currentLocationFilterId || filter.userCircleFilterId === currentLocationFilterId) {
			this.props.onSelectLocationFilter(filter);
		} else {
			this.props._updateSelectedFilters([filter]);
		}
	};


	_handleCreate = () => {
		let savedFilters = this.props.viewer.me.savedCircleFilters
			.map(item => ({
				userCircleFilterId: item.id,
				filterName: item.filterName,
				memberTypes: item.memberTypes,
				sport: item.sport.map(sport => ({ sportID: sport.sport.id })),
				owners: item.owners.map(user => user.id),
				circleType: item.circleType,
				location: {
					lat: item.location.lat,
					lng: item.location.lng,
					radius: 100,
				}
			}));

		savedFilters.push({
			filterName: this.state.newFilterName,
			memberTypes: this.props.filter,
			sport: this.props.sportFilter ? this.props.sportFilter.map(sport => ({ sportID: sport })) : {},
			owners: this.props.userFilter,
			circleType: this.props.typeFilter,
			location: this.props.locationFilter ? {
				lat: this.props.locationFilter.location.lat,
				lng: this.props.locationFilter.location.lng,
				radius: 100,
			} : null,
		});

		this.props.updateSavedFilter(savedFilters);

		setTimeout(() => {
			this.setState({
				newFilterName: '',
				createFilter: false
			});
			this.props._resetFilter();
		}, 200)
	}


	_handleDelete = filter => event => {
		let savedFilters = this.props.viewer.me.savedCircleFilters
			.map(item => {
				if (item.id === filter.id)
					return false;
				else return {
					userCircleFilterId: item.id,
					filterName: item.filterName,
					memberTypes: item.memberTypes,
					sport: item.sport.map(sport => ({ sportID: sport.sport.id })),
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


	componentDidMount = () => {
		const { viewer, userFilter } = this.props;

		if (viewer.me && viewer.me.defaultSavedCircleFilter)
			this.setState({defaultFilter: viewer.me.defaultSavedCircleFilter})
	}	

	createFilter = () => {
		if (this.props.viewer.me) {
			this.setState({createFilter: true, newFilterName: ''})
		}
		else {
			this.props.alert.show(localizations.popup_filterSettings_login, {
				timeout: 3000,
				type: 'info',
			});
		}
	}

	render() {

		const { selectedFilters, viewer, defaultLocationFilter } = this.props;
		let filterList = [].concat(
			viewer.me && viewer.me.savedCircleFilters ? viewer.me.savedCircleFilters : [],
		  );
		
		if (viewer.me && viewer.me.defaultSavedCircleFilter && filterList.findIndex(item => viewer.me.defaultSavedCircleFilter.id === item.id) < 0) {
			filterList.push(viewer.me.defaultSavedCircleFilter)
		}
		if (defaultLocationFilter) {
			filterList.unshift(defaultLocationFilter);
		}
	  
		return (
			<div style={styles.outsideContainer}>
				{viewer.me && this.state.createFilter && 
					<div style={styles.inputRow}>
                		<InputText
							placeholder={localizations.myEvents_savedFilter_name}
							value={this.state.newFilterName}
							onChange={(e) => this.setState({newFilterName: e.target.value})}
						/>
						<i
							className='fa fa-check'
							style={{backgroundColor: colors.green, color: colors.white, cursor: 'pointer', fontSize: '15px', padding: '0.3em', maginLeft: '5px'}}
							onClick={(this._handleCreate)}
						/>
						<i
							className='fa fa-times'
							style={{backgroundColor: colors.red, color: colors.white, cursor: 'pointer', fontSize: '15px', padding: '0.3em', maginLeft: '5px'}}
							onClick={() => this.setState({createFilter: false, newFilterName: ''})}
						/>
              		</div>
				}

				{this.state.createFilter === false && 
					<div style={styles.container}>
						<div style={styles.box}>
							<Button
								onClick={this.createFilter}
								style={ this.state.createFilter ? styles.filterSettingsButtonEnabled : styles.filterSettingsButton }
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
									selected={selectedFilters.findIndex(localFilter => localFilter.id === filter.id) >= 0}
									canBeDeleted={typeof filter.canBeDeleted !== "undefined" ? filter.canBeDeleted : true}
									hideCloseIcon={filter.userCircleFilterId === currentLocationFilterId}
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
		fontSize: fonts.size.tiny,
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
		minWidth: 'min-content',
		alignItems: 'center'
	},
	icon: {
		cursor: 'pointer',
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
	  type: types.UPDATE_MY_CIRCLE_FILTER,
	  value,
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
	_updateSelectedFilters: bindActionCreators(_updateSelectedFilters, dispatch)
  });
  
  const stateToProps = (state) => ({
	  filter: state.myCircleFilterReducer.filter,
	  selectedFilters: state.myCircleFilterReducer.selectedFilters,
		sportFilter: state.myCircleFilterReducer.sportFilter,
		locationFilter: state.myCircleFilterReducer.locationFilter,
		typeFilter: state.myCircleFilterReducer.typeFilter,
		userFilter: state.myCircleFilterReducer.userFilter,
  });
  
  const ReduxContainer = connect(
	stateToProps,
	dispatchToProps,
  )(TopBar);


export default Radium(withAlert(ReduxContainer));
