import React from 'react';
import Radium, {StyleRoot} from 'radium'
import { colors, fonts } from '../../theme';
import {connect} from 'react-redux'
import _Geosuggest from 'react-geosuggest';
import moment from 'moment'
import isSameDay from 'date-fns/is_same_day';
import Loading from 'react-loading';
import {withRouter} from 'found'
import {bindActionCreators} from "redux";

import CustomTab from '../common/CustomTab';
import localizations from '../Localizations';
import CalendarModal from "./CalendarModal";
import * as types from "../../actions/actionTypes";
import {
  createFragmentContainer,
  graphql,
} from 'react-relay';

const Geosuggest = Radium(_Geosuggest);

let styles;

class FindPlace extends React.Component {

	state = {
		slotListPageNumber: 0,
		pageNumber: 0,
		inputContent: '',
		locationSuggestions: [],
		calendarOpen: false,
		selectedCalendarInfra: null,
		selectedTab: "one"
	}

	componentDidMount = () => {
		if (this.props.openedModal === 3)
			this._toggleModal()

		setTimeout(() => {
			if (this.props.openedModal === 2 && this.refs.geosuggest) {
				this.refs.geosuggest.focus()
			}
		}, 100)
	}

	_loadNext = () => {
		this.setState({pageNumber: this.state.pageNumber + 1})
	}

	_loadPrevious = () => {
		this.setState({pageNumber: this.state.pageNumber - 1})
	}

	changeSuggestions = (suggestions) => {
		this.setState({
			locationSuggestions: suggestions.map(item => item.label)
		})
	}

	renderTimeToText = (slot) => (
		<div style={styles.date}>
			{slot.serie_information && slot.serie_information.firstDate && !isSameDay(slot.serie_information.lastDate, slot.end)
				?   <div>
					<div style={{color: colors.red, marginBottom: 5}}>{localizations.newSportunity_venueSerie}</div>
					{localizations.newSportunity_venueSerieFrom + ' ' + moment(slot.from).format('ddd DD MMM') + ' ' + localizations.newSportunity_venueSerieTo + ' ' + moment(slot.serie_information.lastDate).format('DD MMM')}<br/>
					{moment(slot.from).format('HH:mm') + '  -  ' + moment(slot.end).format('HH:mm')}<br/>
					{localizations.newSportunity_schedule_total_number_of_iteration + ': ' + slot.serie_information.remainingSlots}
				</div>
				:   <span>
                    {moment(slot.from).format('ddd DD MMM')}<br/>
					{moment(slot.from).format('HH:mm') + '  -  ' + moment(slot.end).format('HH:mm')}
                </span>
			}

		</div>
	)

	_openModal = (infra) => {
		this.setState({
			selectedCalendarInfra : infra
		})
		setTimeout(() => this._toggleModal(), 150)
	}

	_toggleModal = () => {
		this.setState({
			calendarOpen: !this.state.calendarOpen
		})
	}

	createVenue = () => {
		this.props._updateNextToSportunityAction(true);
		this.props._updateSportunityIdAction(this.props.sportunityId);
		this.props.router.push('/manage-venue');
	}

	chooseAdressTabRender = () => {
		const { address } = this.props;
		return (
			<div style={styles.content}>
			<div style={styles.inputContainer}>
				<Geosuggest
					style={this.props.error ? styles.geosuggest_error : styles.geosuggest}
					placeholder={localizations.newSportunity_addressHolder}
					initialValue={address}
					onUpdateSuggests={(e, t) => this.changeSuggestions(e)}
					location={this.props.userLocation}
					radius={50000}
					ref='geosuggest'
				/>
				{!!this.props.errorMessage && <div style={styles.errMsgStyle}> {this.props.errorMessage} </div>}
			</div>

			{this.state.locationSuggestions.length > 0
				? <div id="search_address_div" style={styles.placeList}>
					{this.state.locationSuggestions.map((item, index) =>
						(
							<div style={styles.placeContainer} key={index} onClick={() => this.props.onChangeAddress(item)}>
								<div style={styles.placeDetails}>
									{item}
								</div>
							</div>
						)
					)}
				</div>
				: this.props.address.address != '' ? '' : <div style={styles.noResult}>
					<span style={styles.noResultLabel}>
						{localizations.newSportunity_selection_no_choice}
					</span>
				</div>
			}
			</div>
		)
	}

	changeTab = e  => {
    this.setState({selectedTab: e})
  }

	useVenueRender = () => {
		const { parentViewer, isLoadingSlots } = this.props;
		const { pageNumber } = this.state;

		let venues = [];
		let venuesList = [];

		if (parentViewer.infrastructures)
			parentViewer.infrastructures.forEach(infra => {
				if (venues.findIndex(venue => venue.venue.id === infra.venue.id) < 0) {
					venues.push(infra);
					venuesList.push(infra.venue)
				}
			});
		let listCard = [].concat(
			venues ? venues.map(infra => ({ value: infra, isInfra: true })) : [],
			parentViewer.slots ? parentViewer.slots.map(slot => ({ value: slot, isInfra: false })) : []
		);
		return (
			<div style={styles.content}>
				{isLoadingSlots 
				?	<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 50, marginBottom: 50}}>
						<Loading type='spinningBubbles' color={colors.blue} />
					</div>
				:	<div>
						<div style={styles.inputContainer} />
							<div style={{ ...styles.row, justifyContent: 'flex-start' }}>
								<div style={styles.userList}>
									{listCard.length > 2 &&
										<div>
											{pageNumber > 0
												? <div style={styles.previousPageIcon}
													onClick={this._loadPrevious} key="previous">
													<i style={styles.icon} className="fa fa-arrow-circle-left"
														aria-hidden="true" />
												</div>
												: <div style={styles.previousPageIconDisabled} key="previous">
													<i style={styles.icon} className="fa fa-arrow-circle-left"
														aria-hidden="true" />
												</div>
											}
										</div>
									}

									{listCard && listCard.length > 0 ?
										listCard.map((card, index) => {
											return (
												index >= pageNumber && index <= (pageNumber + 2) - 1
													? card.isInfra
														? <div style={styles.userContainer} key={card.value.id} onClick={() => this._openModal(card.value)}>
															<div style={styles.userDetails}>
																<div style={styles.upper_section_venue_card}>
																	<div style={{ display: 'inline-block', width: '45%', verticalAlign: 'top' }}>
																		<div style={styles.name}>
																			{card.value.venue.name}
																		</div>
																		<div>
																			{card.value.venue.address && card.value.venue.address.city
																				? <div style={styles.place}>
																					{card.value.venue.address.city + ', ' + card.value.venue.address.country}
																				</div>
																				: null
																			}
																		</div>
																	</div>
																	<div style={{ display: 'inline-block', width: '45%', verticalAlign: 'top' }}>
																		<div style={styles.price}>
																			{localizations.newSportunity_InfrastructureFreeTime}
																		</div>
																	</div>
																</div>

																<div style={{ ...styles.avatarContainer, marginTop: 20 }}>
																	<img src={card.value.logo ? card.value.logo : '/images/FindInfrastructure/icones_infra.png'} style={styles.avatar} />
																</div>

															</div>
															<div style={styles.bookOrganizer}>
																{localizations.newSportunity_InfrastructureFreeTime_calendar}
															</div>
														</div>
														: <div style={styles.userContainer} key={card.value.id} onClick={() => this.props.onChooseSlot(card.value)}>
															<div style={styles.userDetails}>

																<div style={styles.upper_section_venue_card}>
																	<div style={{ display: 'inline-block', width: '45%', verticalAlign: 'top' }}>
																		<div style={styles.name}>
																			{card.value.venue.name}
																		</div>
																		{card.value.venue.address && card.value.venue.address.city
																			? <div style={styles.place}>
																				{card.value.venue.address.city + ', ' + card.value.venue.address.country}
																			</div>
																			: null
																		}
																	</div>
																	<div style={{ display: 'inline-block', width: '45%', verticalAlign: 'top' }}>
																		<div style={styles.price}>
																			{card.value.price && card.value.price.cents > 0
																				? card.value.price.currency + '  ' + card.value.price.cents / 100
																				: localizations.find_free
																			}
																		</div>
																		{this.renderTimeToText(card.value)}
																	</div>
																</div>

																<div style={styles.avatarContainer}>
																	<img src={card.value.logo ? card.value.logo : '/images/FindInfrastructure/icones_infra.png'} style={styles.avatar} />
																</div>

															</div>
															<div style={styles.bookOrganizer}>
																{localizations.newSportunity_venueBook}
															</div>
														</div>
													: false
											)
										}).filter(i => Boolean(i))
										:
										this.props.address.address != '' ? '' : <div style={{ ...styles.noResult, margin: '0px 20px' }}>
											<span style={styles.noResultLabel}>
												{localizations.newSportunity_selection_no_choice}
											</span>
										</div>
									}

									{listCard.length > 2 &&
										<div>
											{listCard.length > (pageNumber + 2)
												? <div style={styles.nextPageIcon} onClick={this._loadNext}
													key="next">
													<i style={styles.icon} className="fa fa-arrow-circle-right"
														aria-hidden="true" />
												</div>
												: <div style={styles.nextPageIconDisabled} key="next">
													<i style={styles.icon} className="fa fa-arrow-circle-right"
														aria-hidden="true" />
												</div>
											}
										</div>
									}
								</div>
							</div>
						</div>
				}
			</div>
		)
	}


	render() {
		const { viewer, parentViewer, isLoadingSlots } = this.props;

		let venues = [];
		let venuesList = [];

		if (parentViewer.infrastructures)
			parentViewer.infrastructures.forEach(infra => {
				if (venues.findIndex(venue => venue.venue.id === infra.venue.id) < 0) {
					venues.push(infra);
					venuesList.push(infra.venue)
				}
			});
		let listCard = [].concat(
			venues ? venues.map(infra => ({ value: infra, isInfra: true })) : [],
			parentViewer.slots ? parentViewer.slots.map(slot => ({ value: slot, isInfra: false })) : []
		);
		
		return (
			<StyleRoot>
				<div ref={node => { this._containerNode = node; }}>
					<CalendarModal
						isOpen={this.state.calendarOpen}
						viewer={viewer}
						venues={venuesList}
						infrastructures={viewer.infrastructures}
						selectedCalendarInfra={this.state.selectedCalendarInfra}
						selectSlot={this.props.onChooseSlot}
						toggleModal={this._toggleModal}
					/>
					<CustomTab 
						tab1={this.chooseAdressTabRender()}
						tab2={this.useVenueRender()}
						tab1Level={localizations.newSportunity_place_address}
						tab2Level={isLoadingSlots ? localizations.newSportunity_venueHolder : localizations.newSportunity_venueHolder + ' (' + listCard.length + ')'}
						onChange={this.changeTab}
						value={this.state.selectedTab}
					/>
				</div>
			</StyleRoot>
		);
	}
}

styles = {
	avatar: {
		width: '80%',
		marginLeft:'10%',
	},
	headline: {
		fontSize: 24,
		paddingTop: 16,
		marginBottom: 12,
		fontWeight: 400,
	  },

	button: {
		backgroundColor: colors.blue,
		padding: 10,
		margin: 10,
		borderRadius: 10,
		color: colors.white,
		fontSize: 18,
		fontWeight: 'bold',
		fontFamily: 'Lato',
		textDecoration: 'none',
	},
	noInfrastructure: {
		display: 'flex',
		justifyContent: 'center'
	},
	content: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between',
		margin:'26px auto',
	},
	inputContainer: {
		padding: '10px 35px',
		width: 400 
	},
	errMsgStyle: {
		color: colors.red,
		fontSize: 15,
	},
	avatarContainer: {
		background: 'linear-gradient(to bottom, #1D7CA7, #2AA8E0)'
	},
	row: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginTop: 10,
		padding: 15,
	},
	upper_section_venue_card :
	{
		padding: 15,
	},
	dropdown: {
		position: 'absolute',
		top: 70,
		left: 0,
		maxHeight: 220,
		width: '90%',
		margin: '0px 10px',

		backgroundColor: colors.white,

		boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
		border: '2px solid rgba(94,159,223,0.83)',
		padding: 20,

		overflowY: 'scroll',
		overflowX: 'hidden',

		zIndex: 100,
	},

	userList: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'center',
		padding: 10,
		position: 'relative',
		margin: 10,
	},
	link: {
		fontFamily: 'Lato',
		fontSize:18,
		flex: '1 0 0',
		display: 'flex',
		textDecoration: 'none',
		color: colors.black,
		alignItems: 'center',
	},
	userContainer: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between',
		//height: 380,
		width: 300,
		margin: 15,

		borderRadius: 3,
		boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
		cursor: 'pointer',

		':hover': {
			boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.3), 0 6px 20px 0 rgba(0, 0, 0, 0.25)',
		},
	},

	placeList: {
		padding: '10px 20px',
		color: '#515151',
		fontSize: 20,
		fontWeight: 500,
		fontFamily: 'Lato',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		cursor: 'pointer',
	},
	placeContainer: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between',
		padding: '10px 5px',
		borderRadius: 3,
		marginBottom: 10,
		boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
		cursor: 'pointer',
		width: '100%',

		':hover': {
			boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.3), 0 6px 20px 0 rgba(0, 0, 0, 0.25)',
		},
	},
	placeDetails: {
		fontSize: 18,
		fontFamily: 'Lato',
		color: colors.blue,
		fontWeight: 'bold'
	},
	userDetails: {
		display: 'flex',
		flexDirection: 'column',
	},
	name: {
		fontSize: 18,
		fontFamily: 'Lato',
		color: colors.blue,
		fontWeight: 'bold',
	},
	place: {
		fontSize: 14,
		fontFamily: 'Lato',
		color: colors.gray,
		marginTop: 5
	},
	date: {
		fontSize: 14,
		fontFamily: 'Lato',
		color: colors.gray,
		marginTop: 5
	},
	price: {
		fontSize: 18,
		fontFamily: 'Lato',
		color: colors.blue,
		fontWeight: 'bold',
	},
	bookOrganizer: {
		backgroundColor: colors.blue,
		color: colors.white,
		fontSize: 16,
		fontFamily: 'Lato',
		padding: 10,
		textAlign: 'center',
		border: '10px solid #FFFFFF'
	},
	noResult: {
		margin: '150px auto 0'
	},
	noResultLabel: {
		fontSize: 18,
		color: colors.gray,
		fontWeight: 'bold',
		fontFamily: 'Lato'
	},
	previousPageIcon: {
		color: colors.blue,
		fontSize: 36,
		cursor: 'pointer',
		marginRight: 5,
		':hover': {
			transform:'scale(1.1)',
		},
	},
	previousPageIconDisabled: {
		color: colors.gray,
		fontSize: 36,
		cursor: 'pointer',
		marginRight: 5,
	},
	nextPageIcon: {
		color: colors.blue,
		fontSize: 36,
		cursor: 'pointer',
		':hover': {
			transform:'scale(1.1)',
		},
	},
	nextPageIconDisabled: {
		color: colors.gray,
		fontSize: 36,
		cursor: 'pointer',
	},
	geosuggest: {
		input: {
			width: '100%',
			borderTop: 'none',
			borderLeft: 'none',
			borderRight: 'none',
			borderBottomWidth: 2,
			borderBottomColor: colors.blue,
			paddingRight: 20,

			fontSize: 20,
			fontFamily: 'Lato',
			lineHeight: 1,
			color: 'rgba(0, 0, 0, 0.64)',

			paddingBottom: 8,

			outline: 'none',
			':focus': {
				borderBottomColor: colors.green,
			},
		},

		suggests: {
			display: 'none'
		},
	},
	geosuggest_error: {
		input: {
			width: '100%',
			borderTop: 'none',
			borderLeft: 'none',
			borderRight: 'none',
			borderBottomWidth: 2,
			borderBottomColor: colors.red,
			paddingRight: 20,

			fontSize: 20,
			fontFamily: 'Lato',
			lineHeight: 1,
			color: 'rgba(0, 0, 0, 0.64)',

			paddingBottom: 8,

			outline: 'none',
			':focus': {
				borderBottomColor: colors.green,
			},
		},

		suggests: {
			display: 'none'
		},
	} 

};

const _updateSportunityIdAction = (value) => ({
	type: types.UPDATE_SPORTUNITY_ID,
	value,
})

const _updateNextToSportunityAction = (value) => ({
	type: types.UPDATE_NEXT_TO_SPORTUNITY,
	value,
})

const dispatchToProps = (dispatch) => ({
	_updateSportunityIdAction: bindActionCreators(_updateSportunityIdAction, dispatch),
	_updateNextToSportunityAction: bindActionCreators(_updateNextToSportunityAction, dispatch),
})

const stateToProps = (state) => ({
	userCountry: state.globalReducer.userCountry,
	userLocation: state.globalReducer.userLocation,
	sportunityID: state.createInfraReducer.sportunityID,
	nextToSportunity: state.createInfraReducer.nextToSportunity,
	language: state.globalReducer.language,
})

const ReduxContainer = connect(
	stateToProps,
	dispatchToProps
)(Radium(FindPlace));

export default createFragmentContainer(Radium(withRouter(ReduxContainer)), {
    viewer: graphql`
  fragment FindPlace_viewer on Viewer {
    id
    ...CalendarModal_viewer
  }
`
})