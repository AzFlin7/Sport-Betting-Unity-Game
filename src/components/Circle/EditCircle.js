import React from 'react'
import {
	createRefetchContainer,
	graphql,
} from 'react-relay/compat';
import Modal from 'react-modal'
import { withAlert } from 'react-alert'
import Radium from 'radium'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Switch from '../common/Switch';
import { colors, fonts } from '../../theme'
import InputText from './InputText'
import EditButton from './EditButton'
import SportSelect from './SportSelect'
import SportLevels from './SportLevels'
import Geosuggest from 'react-geosuggest'

import UpdateCircleMutation from './UpdateCircleMutation'
import localizations from '../Localizations'
import { CardContent, Button, TextField, Card } from '@material-ui/core';

let styles, modalStyles
class EditCircle extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			modalIsOpen: false,
			circleName: '',
			isCirclePublic: false,
			isCircleUpdatableByMembers: false,
			isCircleUsableByMembers: false,
			isCircleAccessibleFromUrl: false,
			shouldValidateNewUser: false,
			isChildrenCircle: false,
			circleSport: null,
			circleSportLevelFrom: null,
			circleSportLevelTo: null,
			circleAddress: null,
			description: '',
			isError: false,
			isCheckboxChanged: false,
			mode: 'view', // if edit, edit fields will be visible
			isChatActive: false,
		};
		this.alertOptions = {
			offset: 14,
			position: 'top right',
			theme: 'light',
			timeout: 100,
			transition: 'fade',
		};
	}

	componentDidMount = () => {
		this.setState({
			circleName: this.props.circle.name,
			isCirclePublic: this.props.circle.mode === 'PUBLIC',
			isCircleUpdatableByMembers: this.props.circle.isCircleUpdatableByMembers,
			isCircleUsableByMembers: this.props.circle.isCircleUsableByMembers,
			isCircleAccessibleFromUrl: this.props.circle.isCircleAccessibleFromUrl,
			isChildrenCircle: this.props.circle.circlePreferences.isChildrenCircle,
			shouldValidateNewUser: this.props.circle.shouldValidateNewUser,
			isChatActive: this.props.circle.isChatActive,
			circleSport: this.props.circle.sport
				? {
					id: this.props.circle.sport.sport.id,
					name: this.props.circle.sport.sport.name[localizations.getLanguage().toUpperCase()],
					levels: this.props.circle.sport.sport.levels
				}
				: null,
			circleSportLevelFrom: this.props.circle.sport && this.props.circle.sport.levels && this.props.circle.sport.levels.length > 0
				? {
					id: this.props.circle.sport.levels[0].id,
					name: this.props.circle.sport.levels[0][localizations.getLanguage().toUpperCase()].name,
					skillLevel: this.props.circle.sport.levels[0][localizations.getLanguage().toUpperCase()].skillLevel,
					description: this.props.circle.sport.levels[0][localizations.getLanguage().toUpperCase()].description,
				}
				: null,
			circleSportLevelTo: this.props.circle.sport && this.props.circle.sport.levels && this.props.circle.sport.levels.length > 0
				? {
					id: this.props.circle.sport.levels[this.props.circle.sport.levels.length - 1].id,
					name: this.props.circle.sport.levels[this.props.circle.sport.levels.length - 1][localizations.getLanguage().toUpperCase()].name,
					skillLevel: this.props.circle.sport.levels[this.props.circle.sport.levels.length - 1][localizations.getLanguage().toUpperCase()].skillLevel,
					description: this.props.circle.sport.levels[this.props.circle.sport.levels.length - 1][localizations.getLanguage().toUpperCase()].description,
				}
				: null,
			circleAddress: this.props.circle.address
				? {
					address: this.props.circle.address.address,
					city: this.props.circle.address.city,
					country: this.props.circle.address.country,
				}
				: null,
			description: this.props.circle.description,
		});
		this.props.relay.refetch(fragmentVariables => ({
			...fragmentVariables,
			queryLanguage: localizations.getLanguage().toUpperCase()
		}))
	}

	_closeModal = () => {
		this.setState({
			modalIsOpen: false,
		})
	};


	_onActionReceived = action => {
		switch (action) {
			case 'fail':
				// error shown already, do nothing
				break;
			case 'edit':
				// please go ahead and save the ciricle
				this.setState({
					mode: 'edit'
				});
				break;
			case 'cancel':
				// please go ahead and save the ciricle
				this.setState({
					mode: 'view'
				});
				break;
			case 'save':
				// please go ahead and save the ciricle
				this._submitUpdate();
				break;
			case 'delete':
				// won't come here as in case of delete success, the request is routed to circles
				break;
		}
	};

	_openModal = () => {
		this.setState({
			modalIsOpen: true,
			circleName: this.props.circle.name,
		})
	}

	_updateName = (e) => {
		this.setState({
			circleName: e.target.value,
		})
	};

	_handlePrivacyChanged = (e) => {
		this.setState({
			isCirclePublic: !this.state.isCirclePublic,
			isCircleUpdatableByMembers: !this.state.isCirclePublic,
			isCircleAccessibleFromUrl: e ? true : this.state.isCircleAccessibleFromUrl,
			isCheckboxChanged: true
		})
	}

	_handleEditableChanged = (e) => {
		this.setState({
			isCircleUpdatableByMembers: !this.state.isCircleUpdatableByMembers,
			isCheckboxChanged: true
		})
	}

	_handleUsableByMemberChanged = (e) => {
		this.setState({
			isCircleUsableByMembers: !this.state.isCircleUsableByMembers,
			isCheckboxChanged: true
		})
	}

	_handleIsCircleAccessibleFromUrl = (e) => {
		this.setState({
			isCircleAccessibleFromUrl: !this.state.isCircleAccessibleFromUrl,
			isCheckboxChanged: true
		})
	}

	_handleshouldValidateNewUser = (e) => {
		this.setState({
			shouldValidateNewUser: !this.state.shouldValidateNewUser,
			isCheckboxChanged: true
		})
	}

	handleIsChatActive = (e) => {
		this.setState({
			isChatActive: !this.state.isChatActive,
			isCheckboxChanged: true
		})
	}

	_handleCircleOfChildrenChanged = (e) => {
		this.setState({
			isChildrenCircle: !this.state.isChildrenCircle,
			isCheckboxChanged: true
		})
	}

	_handleErrorChanged = (value) => {
		this.setState({
			isError: value,
		})
	}

	_submitUpdate = () => {
		if (this.state.isCheckboxChanged) {
			// TODO: refactor these!
			const viewer = this.props.viewer
			const userIDVar = this.props.viewer.id
			const idVar = this.props.circleId
			const nameVar = this.state.circleName
			const modeVar = this.state.isCirclePublic ? 'PUBLIC' : 'PRIVATE';
			const isCircleUpdatableByMembersVar = this.state.isCircleUpdatableByMembers;
			const isCircleUsableByMembersVar = this.state.isCircleUsableByMembers;
			const isCircleAccessibleFromUrlVar = this.state.isCircleAccessibleFromUrl;
			const shouldValidateNewUserVar = this.state.shouldValidateNewUser;
			const shouldValidateNewUser = this.state.shouldValidateNewUser;
			const isChatActive = this.state.isChatActive;
			const circlePreferencesVar = {
				isChildrenCircle: this.state.isChildrenCircle
			};
			const sportVar = this.state.circleSport ? {
				sport: this.state.circleSport.id,
				levels: this.state.circleSportLevelFrom && this.state.circleSportLevelTo
					? this._getLevelsRange(this.state.circleSportLevelFrom, this.state.circleSportLevelTo).map(level => level.id)
					: this.state.circleSport.levels.map(level => (level.id))
			} : null;
			const addressVar = this.state.circleAddress;

			this.setState({
				isCheckboxChanged: false
			})

			UpdateCircleMutation.commit({
				viewer,
				userIDVar,
				idVar,
				nameVar,
				modeVar,
				sportVar,
				addressVar,
				isCircleUpdatableByMembersVar,
				isCircleUsableByMembersVar,
				isCircleAccessibleFromUrlVar,
				shouldValidateNewUserVar,
				circlePreferencesVar,
				shouldValidateNewUser,
				isChatActive,
				circleDescriptionVar: this.state.description
			},
				{
					onFailure: error => {
						this.props.alert.show(localizations.popup_editCircle_update_failed, {
							timeout: 2000,
							type: 'error',
						});
						let errors = JSON.parse(error.getError().source);
						console.log(errors);
						this.setState({
							isCirclePublic: this.props.circle.mode === 'PUBLIC',
							isCircleUpdatableByMembers: this.props.circle.isCircleUpdatableByMembers,
						})
					},
					onSuccess: (response) => {
						this.setState({
							mode: 'view'
						});
						this.props.alert.show(localizations.popup_editCircle_update_success, {
							timeout: 2000,
							type: 'success',
						});
					},
				}
			)
		}
		else {
			this.props.onLeave()
		}
	};

	_getLevelsRange = (levelFrom, levelTo) => {
		const { levels } = this.state.circleSport;
		if (!levelFrom || !levelTo) {
			return []
		} else {
			let fromIndex = levels.findIndex((e) => e.id == levelFrom.value);
			let toIndex = levels.findIndex((e) => e.id == levelTo.value);
			let selectedLevels = levels.slice(fromIndex, toIndex + 1)
			return selectedLevels
		}
	}

	_updateSportFilter = (name) => {
		this.props.relay.refetch(fragmentVariables => ({
			...fragmentVariables,
			filter: {
				name: name,
				language: localizations.getLanguage().toUpperCase()
			},
		}))
	};

	_handleLoadAllSports = () => {
		this.props.relay.refetch(fragmentVariables => ({
			...fragmentVariables,
			sportsNb: this.props.viewer.sports.count,
			filter: {
				name: '',
				language: localizations.getLanguage().toUpperCase()
			},
		}));
		this.setState({
			allSportsLoaded: true,
		})
	};

	_setLevelFrom = (value) => {
		this.setState({
			circleSportLevelFrom: value,
			isCheckboxChanged: true
		})
	}

	_setLevelTo = (value) => {
		this.setState({
			circleSportLevelTo: value,
			isCheckboxChanged: true
		})
	}

	_translatedName = (name) => {
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
				break
		}
		return translatedName
	};

	_updateAddress = (value) => {
		if (value) {
			const {label} = value;
			if (label) {
				const splitted = label.split(', ');

				/*if (splitted.length < 3) {
				this.props.alert.show(localizations.circle_address_error, {
					timeout: 2000,
					type: 'error',
				});
				return ;
				}*/
				const address = splitted.slice(0, splitted.length - 2).join(', ') || '';
				const country = splitted[splitted.length - 1] || '';
				const city = splitted[splitted.length - 2] || '';

				this.setState({
					circleAddress: {
						address,
						country,
						city,
					},
					isCheckboxChanged: true
				});
			}
			else {
				this.setState({
					circleAddress: null,
					isCheckboxChanged: true
				});
			}
		}
		else {
			this.setState({
				circleAddress: null,
				isCheckboxChanged: true
			});
		}
	};

	_updateSport = (sport) => {
		this.setState({
			circleSport: sport,
			circleSportLevelFrom: null,
			circleSportLevelTo: null,
			isCheckboxChanged: true
		});
	};

	_handleChangeDescription = e => {
		this.setState({
			description: e.target.value,
			isCheckboxChanged: true
		})
	}


	handleDataChange = index => event => {
		switch(index) {
			case 1:
				this.state.circleName = event.target.value;
				break;
			case 3:
				this.state.description = event.target.value;
				break;
		}

		this.state.isCheckboxChanged = true;
	};


	DataCell = props => {
		// it would need the props.index to identify the property

		let title = '';
		let value = '';
		let value1 = '';
		let editField = <div></div>;


		const { index, pendingVariables, sportsList, userLocation, levelOptions, ...others } = props;

		switch (index) {
			case 1:
				title = 'Title';
				value = this.state.circleName;
				editField = <TextField
								{...others}
								inputProps={{ style: {
									fontSize: '16px',
									fontFamily: 'Lato',
									color: colors.black
								}}}
								onChange={this.handleDataChange(index)} defaultValue={value}></TextField>

				break;
			case 2:
				title = localizations.find_sport;
				value = this.state.circleSport ?  this.state.circleSport.name : 'No Sports Found';

				editField =
					<SportSelect
						{...others}
						onChange={this._updateSport}
						onSearching={this._updateSportFilter}
						list={sportsList}
						placeholder={localizations.find_sportHolder}
						onLoadAllClick={this._handleLoadAllSports}
						allSportLoaded={this.state.allSportsLoaded}
						// TODO props.relay.* APIs do not exist on compat containers
						loadingAllSports={pendingVariables}
						value={this.state.circleSport ? this.state.circleSport.name : null}
					//isError={isSportError}
					/>
					break;
			case 3:
				title = localizations.circle_title_description;
				value = this.state.description;
				editField = <TextField
								multiline={true}
								rows={4}
								inputProps={{ style: {
									fontSize: '16px',
									fontFamily: 'Lato',
									color: colors.black
								}}}
								onChange={this.handleDataChange(props.index)}
								defaultValue={value}>
							</TextField>

				break;
			case 4:
				title = localizations.find_levels;
				value = this.state.circleSportLevelFrom ? this.state.circleSportLevelFrom.name : '';
				value1 = this.state.circleSportLevelTo? this.state.circleSportLevelTo.name : '';

				editField = <SportLevels
					{...others}
					list={levelOptions}
					from={this.state.circleSportLevelFrom}
					to={this.state.circleSportLevelTo}
					placeholder={!this.state.circleSport ? localizations.profile_beforeSport : localizations.newSportunity_levelHolder}
					onFromChange={this._setLevelFrom}
					onToChange={this._setLevelTo}
					disabled={!this.state.circleSport}
				/>

				break;
			case 5:
				title = localizations.find_city;
				value = this.state.circleAddress
					? 	this.state.circleAddress.address !== ''
						? 	this.state.circleAddress.address + ', ' + this.state.circleAddress.city
						: 	this.state.circleAddress.city
					:	localizations.find_cityNoneFound ;

				editField =
					<Geosuggest
						{...others}
						placeholder={localizations.find_cityHolder}
						initialValue={value}
						onSuggestSelect={this._updateAddress}
						location={userLocation}
						radius={50000}
					/>

				break;
			default:
				title = '';
				value = '';

		}
		return (
			<div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
				<div style={styles.checkboxLabel}>{title}</div>
				{this.state.mode === 'view' && <div style={styles.dataCellLabel}>{value}</div>}
				{this.state.mode === 'edit' && editField}
			</div>
		)
	};


	render() {
		let sportsList = [];
		if (this.props.viewer.sports && this.props.viewer.sports.edges && this.props.viewer.sports.edges.length > 0) {
			 sportsList = this.props.viewer.sports.edges.map(({ node }) => ({ ...node, name: this._translatedName(node.name), value: node.id }));
		}

		const levelOptions = this.state.circleSport ?
			this.state.circleSport.levels
				.map(level => ({ value: level.id, name: level[localizations.getLanguage().toUpperCase()].name, skillLevel: level[localizations.getLanguage().toUpperCase()].skillLevel, description: level[localizations.getLanguage().toUpperCase()].description }))
				.sort((a, b) => { return a.skillLevel - b.skillLevel })
			: [];

		return (
			<section>

				<EditButton mode='view'
					circles={this.props.meCircles}
					circleName={this.state.circleName}
					onErrorChange={this._handleErrorChanged}
					receiveAction={this._onActionReceived}
					isCirclePublic={this.state.isCirclePublic}
					isCircleUpdatableByMembers={this.state.isCircleUpdatableByMembers}
					onErrorChange={this._handleErrorChanged}
					{...this.props}				/>

				<Card id='newDivTest' style={{ marginLeft: '5%', marginRight: '5%', marginTop: '10px' }} >
					<CardContent style={{ width: '100%', padding: '0px' }}>
						<div id='title' style={styles.titleRow}>
							Group Information
            			</div>
						<div id='content'>
							{/*
                there are three rows, first two rows are two columns and third rows consists of many single line rows */}

							<div id='firstRow' style={styles.dataCellRow}>
								<div style={styles.dataCellWrapper}>
									<this.DataCell index={1} style={styles.dataCellText} ></this.DataCell>
								</div>
								<div style={styles.dataCellWrapper}>
									<this.DataCell index={2}
										sportsList={sportsList}
										pendingVariables={this.props.relay.pendingVariables}></this.DataCell>
								</div>
							</div>

							<div id='secondRow' style={styles.dataCellRow}>
								<div style={styles.dataCellWrapper}>
									<this.DataCell index={3} style={styles.dataCellText} ></this.DataCell>
								</div>
								<div style={styles.dataCellWrapper}>
									<this.DataCell index={4} levelOptions={levelOptions}  style={ styles.select }></this.DataCell>
								</div>
							</div>

							<div id='thirdRow' style={styles.dataCellRow}>
								<div style={styles.dataCellWrapper}>
									<this.DataCell userLocation={this.props.userLocation} index={5} style={{ marginTop:'20px', ...inputStyles }} ></this.DataCell>
								</div>
							</div>



					<div style={styles.checkboxRow}>
						<div style={styles.checkboxLabel}>
							{this.state.isCirclePublic
								? <div><span style={styles.checkboxTitle}>{localizations.circle_public + ': '}</span>{localizations.circle_public_explaination}</div>
								: <div><span style={styles.checkboxTitle}>{localizations.circle_publicFalse + ': '}</span>{localizations.circle_publicFalse_explaination}</div>
							}
						</div>
						{this.state.mode === 'edit' && <Switch
							checked={this.state.isCirclePublic}
							onChange={(e) => this._handlePrivacyChanged(e)}
						/>}
					</div>

					<div style={styles.checkboxRow}>
						<div style={styles.checkboxLabel}>
							{this.state.isCircleAccessibleFromUrl
								? <div><span style={styles.checkboxTitle}>{localizations.circle_accessibleFromUrl + ': '}</span>{localizations.circle_accessibleFromUrlExplanation}</div>
								: <div><span style={styles.checkboxTitle}>{localizations.circle_accessibleFromUrlFalse + ': '}</span>{localizations.circle_accessibleFromUrlFalseExplanation}</div>
							}
						</div>
						{this.state.mode === 'edit' && <Switch
							checked={this.state.isCircleAccessibleFromUrl}
							onChange={(e) => this._handleIsCircleAccessibleFromUrl(e)}
							disabled={this.state.isCirclePublic}
						/>}
					</div>

					<div style={styles.checkboxRow}>
						<div style={styles.checkboxLabel}>
							{this.state.isCircleUsableByMembers
								? <div><span style={styles.checkboxTitle}>{localizations.circle_usable_by_members + ': '}</span>{localizations.circle_usable_by_membersExplanation}</div>
								: <div><span style={styles.checkboxTitle}>{localizations.circle_usable_by_membersFalse + ': '}</span>{localizations.circle_usable_by_membersFalseExplanation}</div>
							}
						</div>
						{this.state.mode === 'edit' && <Switch
							checked={this.state.isCircleUsableByMembers}
							onChange={(e) => this._handleUsableByMemberChanged(e)}
						/>}
					</div>

					<div style={styles.checkboxRow}>
						<div style={styles.checkboxLabel}>
							{this.state.isChatActive
								? <div><span style={styles.checkboxTitle}>{localizations.circle_enabledChat + ': '}</span>{localizations.circle_disableChatExplanation}</div>
								: <div><span style={styles.checkboxTitle}>{localizations.circle_disabledChat + ': '}</span>{localizations.circle_enableChatExplanation}</div>
							}
						</div>
						{this.state.mode === 'edit' && <Switch
							checked={this.state.isChatActive}
							onChange={(e) => this.handleIsChatActive(e)}
						/>}
					</div>

					<div style={{...styles.checkboxRow, marginBottom: '20px'}}>
						<div style={styles.checkboxLabel}>
							{this.state.shouldValidateNewUser
								? <div><span style={styles.checkboxTitle}>{localizations.circle_validateNewUser + ': '}</span>{localizations.circle_validateNewUserExplanation}</div>
								: <div><span style={styles.checkboxTitle}>{localizations.circle_validateNewUser + ': '}</span>{localizations.circle_validateNewUserExplanationOff}</div>
							}
						</div>
						{this.state.mode === 'edit' && <Switch
							checked={this.state.shouldValidateNewUser}
							onChange={(e) => this._handleshouldValidateNewUser(e)}
						/>}
					</div>

						</div>
					</CardContent>
				</Card>
			</section>
		)
	}
}
let inputStyles = {

	'input': {
		minWidth: '30%',
		borderWidth: 0,
		borderBottomWidth: 2,
		borderStyle: 'solid',
		borderColor: colors.blue,
		height: '30px',
		lineHeight: '36px',
		fontSize:'15px',
		fontFamily: 'Lato',
		display: 'block',
		background: 'transparent',
		fontSize: fonts.size.medium,
		outline: 'none',
		//marginLeft: 20,
		paddingRight: 20,
		color: colors.darkGray
	},
	'suggests': {
		// width: '100%',
		width: 300,
		position: 'absolute',
		backgroundColor: colors.white,

		boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
		border: '2px solid rgba(94,159,223,0.83)',
		padding: 20,
		zIndex: 100,
	},
	'suggests--hidden': {
		width: '0',
		display: 'none',
	},
	'suggestItem': {
		paddingTop: 10,
		paddingBottom: 10,
		color: '#515151',
		fontSize: 18,
		fontWeight: 500,
		fontFamily: 'Helvetica Neue',
	},

};

styles = {
	titleRow: {
		width: '100%',
		height: '40px',
		lineHeight: '40px',
		fontSize: '20px',
		fontFamily: 'Lato',
		paddingLeft:'30px',
		borderBottom: '1px solid ' + colors.black,
	},
	dataCellWrapper: {
		marginLeft: '10%',
		width: '40%',
		flex: 1
	}
	,

	title: {
		fontSize: 22,
		fontFamily: 'Lato',
		color: colors.darkGray,
		margin: '15px 0px'
	},
	label: {
		fontFamily: 'Lato',
		color: colors.blue,
		fontSize: 16,
		marginTop: 15,
		cursor: 'pointer',
	},
	dataCellLabel: {
		fontFamily: 'Lato',
		color: colors.black,
		fontSize: 16,
		marginTop: 15,
		cursor: 'pointer',
	},

	dataCellRow: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'flex-start',
		marginTop: '40px'
	},

	dataCellText: {
		width: '200px',
		fontSize: '16px',
		marginTop: '20px'
		}
	,
	dataCellButton: {
		backgroundColor: colors.blue,
		width: '160px',
		marginLeft: '30px',
		color: colors.white,
		fontSize: '16px',
		fontFamily: 'Lato'
   },

   dataCellDeleteButton: {
	   backgroundColor: '#c61331',
	   width: '160px',
	   marginLeft: '30px',
	   color: colors.white,
	   fontSize: '16px',
	   fontFamily: 'Lato'
  },
	button: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'flex-center',
		alignItems: 'flex-center',
		width: 500,
		height: 70,
		backgroundColor: colors.white,
		boxShadow: '0 0 4px 0 rgba(0,0,0,0.12)',
		border: '1px solid #E7E7E7',
		borderRadius: 4,
		fontFamily: 'Lato',
		fontSize: 28,
		lineHeight: '42px',
		cursor: 'pointer',
		paddingLeft: 20,
		paddingRight: 20,
		paddingTop: 14,
		marginTop: '20px',
		color: colors.blue,
	},
	buttonText: {
		flex: '2 0 0',
		textDecoration: 'none',
	},
	buttonIcon: {
		color: colors.blue,
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
		justifyContent: 'space-between',
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
	greenButton: {
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
	checkboxSection: {
		marginTop: 40,
		marginRight: 15,
		border: '1px solid ' + colors.gray,
		borderRadius: 5,
		boxShadow: '0 0 4px 0 rgba(0,0,0,0.4)',
		padding: '25px 20px'
	},
	checkboxRow: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: '30px',
		marginRight: '2%',
		marginLeft: '2%'
	},
	inputRow: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 30,
		marginRight: 25,
		'@media (max-width: 450px)': {
			flexDirection: 'column',
			justifyContent: 'space-between',
			alignItems: 'center',
		}
	},
	checkboxLabel:  {
		fontFamily: 'Lato',
		fontSize: 16,
		color: colors.blue,
		flex: 5
	},
	checkboxTitle: {
		fontWeight: 'bold'
	},
	checkBox: {
		width: 18,
		height: 18,
		border: '2px solid #5E9FDF',
		display: 'block',
		cursor: 'pointer',
		marginLeft: 15,
		flex: 1
	},
	buttonSection: {
		marginTop: 50,
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-around',
		width: '100%',
		'@media (max-width: 450px)': {
			flexDirection: 'column',
			justifyContent: 'space-between',
			alignItems: 'center',
		}
	},
	editButton: {
		width: '200px',
		height: '50px',
		backgroundColor: colors.green,
		boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
		borderRadius: '3px',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		fontFamily: 'Lato',
		fontSize: '22px',
		color: colors.white,
		borderWidth: 0,
		marginTop: 15,
		marginBottom: 10,
		marginLeft: 'auto',
		marginRight: 'auto',
		cursor: 'pointer',
		lineHeight: '27px',
	},
	editButtonDisabled: {
		width: '200px',
		height: '50px',
		boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
		borderRadius: '3px',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		fontFamily: 'Lato',
		fontSize: '22px',
		borderWidth: 0,
		marginTop: 15,
		marginBottom: 10,
		marginLeft: 'auto',
		marginRight: 'auto',
		lineHeight: '27px',
		backgroundColor: colors.lightGray,
		color: colors.darkGray
	},
	cancelButton: {
		width: '200px',
		height: '50px',
		backgroundColor: colors.redGoogle,
		boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
		borderRadius: '3px',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		fontFamily: 'Lato',
		fontSize: '22px',
		color: colors.white,
		borderWidth: 0,
		marginTop: 15,
		marginBottom: 10,
		marginLeft: 'auto',
		marginRight: 'auto',
		cursor: 'pointer',
		lineHeight: '27px',
	},
	inputTextArea: {
		width: 400,
		borderTop: '1px solid ' + colors.lightGray,
		borderLeft: '1px solid ' + colors.lightGray,
		borderRight: '1px solid ' + colors.lightGray,
		borderBottomWidth: 2,
		borderBottomColor: colors.blue,
		fontSize: 20,
		fontFamily: 'Lato',
		lineHeight: 1,
		color: 'rgba(0, 0, 0, 0.64)',
		padding: 8,
		outline: 'none',
		'@media (max-width: 450px)': {
			width: '100%',
			marginTop: 10
		}
	},
	select: {
		marginTop: '20px'
	}
}

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
}

const dispatchToProps = (dispatch) => ({
})

const stateToProps = (state) => ({
	userLocation: state.globalReducer.userLocation,
})

let ReduxContainer = connect(
	stateToProps,
	dispatchToProps
)(Radium(EditCircle));

export default createRefetchContainer(withAlert(ReduxContainer), {
	//OK
	viewer: graphql`
    fragment EditCircle_viewer on Viewer @argumentDefinitions(
      filter: {type: "SportFilter"},
      sportsNb: { type: "Int", defaultValue: 10}
      queryLanguage: { type: "SupportedLanguage", defaultValue: "EN" }
      ){
      id
      sports(first:$sportsNb, filter:$filter, language: $queryLanguage) {
        count
        edges {
          node {
            id
            name {
              id
              EN
              FR
            }
            logo
            status
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
              DE {
                name
                skillLevel
                description
              }
            }
          }
        }
      }
    }
  `
},
	graphql`
  query EditCircleRefetchQuery(
    $filter: SportFilter
    $sportsNb: Int
    $queryLanguage: SupportedLanguage
  ) {
    viewer {
      ...EditCircle_viewer
        @arguments(
          filter: $filter
          sportsNb: $sportsNb
          queryLanguage: $queryLanguage
        )
    }
  }
  `,
);
