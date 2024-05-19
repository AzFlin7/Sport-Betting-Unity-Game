import React from 'react'
import {colors} from "../../theme";
import localizations from "../Localizations";
import Radium from 'radium';
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import cloneDeep from 'lodash/cloneDeep';
import Draggable from "react-draggable";
import NewCompositionMutation from "./mutations/NewCompositionMutation";
import { withAlert } from 'react-alert'
import ChangeEventCompositionsMutation from "./mutations/ChangeEventCompositionsMutation";
import SelectComposition from "./SelectComposition";
import DeleteCompositionMutation from "./mutations/DeleteCompositionMutation";
import UpdateCompositionMutation from "./mutations/UpdateCompositionMutation";
import * as types from '../../actions/actionTypes.js';
import { bindActionCreators } from 'redux'
import {connect} from "react-redux";
import isEqual from 'lodash/isEqual'
import Button from "./Button";
import TutoComposition from "./TutoComposition";


class Compositions extends React.Component{
	constructor(props) {
		super(props);
		this.state = {
			addComposition: false,
			selectionMode: true,
			compositionName: '',
			compositionSelected: null,
			activeDrags: 0,
			userPositions: [],
			error: false,
			openModal: false
		}
		this.alertOptions = {
			offset: 60,
			position: 'top right',
			theme: 'light',
			transition: 'fade',
		};
	}

	componentDidMount = () => {
		this.props.onRef && this.props.onRef(this.state.addComposition);
		if (this.props.sportunity.compositions && this.props.sportunity.compositions.length > 0) {
			setTimeout(() => this._handleChangeComposition(this.props.sportunity.compositions[0]), 1000)
		}
	}

	componentWillUnmount() {
		this.props.onRef && this.props.onRef(undefined);
	}

	componentWillReceiveProps = (nextProps) => {
		if (!isEqual(nextProps.userPositions, this.props.userPositions))
			this.setState({userPositions: nextProps.userPositions})
	}

	onStart = () => {
		this.setState({activeDrags: ++this.state.activeDrags});
	}

	onStop = (position, index) => {
		let {userPositions} = this.props;
		this.props._updateUserPositionUpdate({...userPositions[index], position: {x: position.x, y: position.y}}, index)
	};

	onUpdateComposition = () => {
		let usersVar = [];
		const {userPositions} = this.props
		const { compositionName} = this.state;
		userPositions.forEach(position => {
			if (position.position.x >= 0 && position.position.y >= 0)
				usersVar.push({
					user: position.user.id,
					position: {
						xPercentage: parseInt(position.position.x / this.fieldImage.width * 1000),
						yPercentage: parseInt(position.position.y / this.fieldImage.height * 1000),
					}
				})
		});
		UpdateCompositionMutation.commit({
				compositionIdVar: this.state.compositionSelected.id,
				nameVar: this.state.compositionSelected.name,
				owner: this.state.compositionSelected.owner,
				fieldImageVar: this.state.compositionSelected.fieldImage,
				user: this.props.viewer.me,
				usersVar
			}, {
				onFailure: error => {
					this.props.alert.show(error.getError().source.errors[0].message, {
						timeout: 2000,
						type: 'error',
					});
				},
				onSuccess: (response) => {
					this.props.alert.show(localizations.popup_editCircle_update_success, {
						timeout: 2000,
						type: 'success',
					});
					let newComposition = this.props.sportunity.compositions.map(c => c.id) ;
					if (newComposition.findIndex(compo => compo === this.state.compositionSelected.id) < 0)
						newComposition.push(this.state.compositionSelected.id);

					ChangeEventCompositionsMutation.commit({
							sportunity: this.props.sportunity,
							compositionIdsVar: newComposition
						}, {
							onFailure: error => {
								this.props.alert.show(error.getError().source.errors[0].message, {
									timeout: 2000,
									type: 'error',
								});
							},
							onSuccess: () => {
								this.props.alert.show(localizations.popup_editCircle_update_success, {
									timeout: 2000,
									type: 'success',
								});
								this.toggleAddComposition()
							}
						}
					)
				}
			})
	};

	onSaveComposition = () => {
		let usersVar = [];
		if (!this.state.compositionName || this.state.compositionName === '' ) {
			this.setState({error: true});
			return;
		}
		const {userPositions} = this.props
		const {compositionName} = this.state;
		userPositions.forEach(position => {
			if (position.position.x >= 0 && position.position.y >= 0)
			usersVar.push({
				user: position.user.id,
				position: {
					xPercentage: parseInt(position.position.x / this.fieldImage.width * 1000),
					yPercentage: parseInt(position.position.y / this.fieldImage.height * 1000),
				}
			})
		});
		
		NewCompositionMutation.commit({
				nameVar: compositionName,
				owner: this.props.viewer.me,
				fieldImageVar: this.props.sportunity.sport.sport.fieldImages[0],
				user: this.props.viewer.me,
				usersVar
			}, {
				onFailure: error => {
					this.props.alert.show(error.getError().source.errors[0].message, {
						timeout: 2000,
						type: 'error',
					});
				},
				onSuccess: (response) => {
					this.props.alert.show(localizations.popup_editCircle_update_success, {
						timeout: 2000,
						type: 'success',
					});
					let newComposition = cloneDeep(this.props.sportunity.compositions);
					setTimeout(() => {
						newComposition.push(this.props.viewer.me.compositions[this.props.viewer.me.compositions.length - 1])
						ChangeEventCompositionsMutation.commit({
								sportunity: this.props.sportunity,
								compositionIdsVar: newComposition.map(composition => composition.id)
							}, {
								onFailure: error => {
									this.props.alert.show(error.getError().source.errors[0].message, {
										timeout: 2000,
										type: 'error',
									});
								},
								onSuccess: () => {
									this.props.alert.show(localizations.popup_editCircle_update_success, {
										timeout: 2000,
										type: 'success',
									});
									this.toggleAddComposition()
								}
							}
						)
					}, 150)
				},
			}
		)
	};


	onDeleteCompositionUser = (compo) => {
		DeleteCompositionMutation.commit({
			user: this.props.viewer.me,
			sportunity: this.props.sportunity,
			compositionIdVar: compo.id
		}, {
				onFailure: error => {
					this.props.alert.show(error.getError().source.errors[0].message, {
						timeout: 2000,
						type: 'error',
					});
				},
				onSuccess: () => {
					this.props.alert.show(localizations.popup_editCircle_update_success, {
						timeout: 2000,
						type: 'success',
					});
					ChangeEventCompositionsMutation.commit({
							sportunity: this.props.sportunity,
							compositionIdsVar: this.props.sportunity.compositions.map(composition => composition.id).filter(id => id !== compo.id)
						}, {
							onFailure: error => {
								this.props.alert.show(error.getError().source.errors[0].message, {
									timeout: 2000,
									type: 'error',
								});
							},
							onSuccess: () => {
								this.props.alert.show(localizations.popup_editCircle_update_success, {
									timeout: 2000,
									type: 'success',
								});
							}
						}
					)
				}
			}
		)
	};

	_handleChangeComposition = (compositionSelected) => {
		this.props._updateUserPositionClear();
		setTimeout(() => {
			if (compositionSelected)
				compositionSelected.users.forEach(composition => {
					let index = this.props.userPositions.findIndex((user) => user.user.id === composition.user.id)
					if (index < 0)
						this.props._updateUserPositionAdd({
							user: composition.user,
							position: {
								x: parseInt(composition.position.xPercentage / 1000 * this.fieldImage.width),
								y: parseInt(composition.position.yPercentage / 1000 * this.fieldImage.height)
							}
						})
					else
						this.props._updateUserPositionUpdate({
							user: composition.user,
							position: {
								x: parseInt(composition.position.xPercentage / 1000 * this.fieldImage.width),
								y: parseInt(composition.position.yPercentage / 1000 * this.fieldImage.height)
							}}, index
						);
				});
			this.setState({compositionSelected});
		}, 250)
	};

	toggleSelectionMode = (selectionMode) => {
		const {viewer, sportunity, isAdmin} = this.props;
		let compositionList= [].concat(
			sportunity.compositions ? sportunity.compositions : [],
			viewer.me && viewer.me.compositions && isAdmin && this.state.addComposition
				? viewer.me.compositions.filter(compo => !sportunity.compositions || sportunity.compositions.findIndex(composition => composition.id === compo.id) < 0)
				: []
		);
		this._handleChangeComposition(null);
		if (compositionList.length > 0) {
			this.setState({selectionMode});
			setTimeout(() => {
				this._handleChangeComposition(!selectionMode ? compositionList[0] : null)
			}, 1000)
		}
		else {
			this.props.alert.show("Tu n'as pas encore de composition existante, créé en pour les sélectionner ici.", {
				timeout: 4000,
				type: 'info',
			});
		}
	}

	toggleAddComposition = () => {
		const {viewer, sportunity, isAdmin} = this.props;
		let compositionList= [].concat(
			sportunity.compositions ? sportunity.compositions : [],
			viewer.me && viewer.me.compositions && isAdmin && this.state.addComposition
				? viewer.me.compositions.filter(compo => !sportunity.compositions || sportunity.compositions.findIndex(composition => composition.id === compo.id) < 0)
				: []
		);
		this.props.onRef && this.props.onRef(!this.state.addComposition)
		this._handleChangeComposition(this.state.addComposition && compositionList.length > 0 ? compositionList[0] : null)
		this.setState({addComposition: !this.state.addComposition})
	}

	_onHover = () => {
		this.setState({openModal: true});
	};

	_handleCloseComposition = () => {
		this.setState({openModal: false})
		localStorage.setItem('tutoCompositionDone', 'done')
	}

	render() {
		const {viewer, sportunity, isAdmin, userPositions} = this.props;
		const {error, compositionSelected} = this.state;

		let compositionList= [].concat(
			sportunity.compositions ? sportunity.compositions : [],
			viewer.me && viewer.me.compositions && isAdmin && this.state.addComposition
				? viewer.me.compositions.filter(compo => !sportunity.compositions || sportunity.compositions.findIndex(composition => composition.id === compo.id) < 0)
				: []
		);

		if (this.fieldImage !== null && this.fieldImage !== undefined && !isEqual(this.fieldImage, this.props.fieldElement))
			this.props._updateFieldElement(this.fieldImage)
		let tutoDone = localStorage.getItem('tutoCompositionDone') === 'done';
		return (
			<div>
				{isAdmin &&
					<div style={{position: "relative", top: -80}}>
						{this.state.addComposition ?
							<div style={styles.buttonsContainer}>
								<button
									key={'green'}
									style={styles.greenButton}
									onClick={() => compositionSelected ? this.onUpdateComposition() : this.onSaveComposition()}
								>
									<i style={styles.icon} className="fa fa-check"/>
									{localizations.event_compo_valid}
								</button>
								<button
									key={'red'}
									style={styles.redButton}
									onClick={() => this.toggleAddComposition()}
								>
									<i style={styles.icon} className="fa fa-times"/>
									{localizations.event_compo_cancel}
								</button>
							</div>
							:
							<div style={styles.buttonsContainer}>
								<button
									style={styles.grayButton}
									onClick={() => this.toggleAddComposition()}
								>
									<i
										className='fa fa-plus-circle'
										style={{marginRight: 8}}
									/>
									{localizations.event_compo_add}
								</button>
							</div>
						}
					</div>
				}
				{this.state.addComposition ?
					<div style={{marginTop: 80}}>
						<h1 style={styles.title}>{localizations.event_compo_add}</h1>
						<div>
							<div style={styles.rowInput}>
								<input
									type='checkbox'
									checked={this.state.selectionMode}
									onChange={(e) => this.toggleSelectionMode(e.target.checked)}
								/>
								{localizations.event_compo_create}
							</div>
							<div style={styles.rowInput}>
								<input
									type='checkbox'
									checked={!this.state.selectionMode}
									onChange={(e) => this.toggleSelectionMode(!e.target.checked)}
								/>
								{localizations.event_compo_select}
							</div>
						</div>
						<div style={{marginTop: 30}}>
							{this.state.selectionMode ?
								<div style={{display: 'flex', alignItems: 'center'}}>
									<div style={styles.label}>
										{localizations.event_compo_name}
									</div>
									<input
										type='text'
										placeholder={localizations.event_compo_name_placeholder}
										style={error ? {...styles.input, borderBottom: '2px solid ' + colors.error} : styles.input}
										value={this.state.compositionName}
										onChange={(e) => this.setState({compositionName: e.target.value, error: false})}
									/>
								</div>
								:
								<div style={styles.rowInput}>
									<SelectComposition
										list={compositionList}
										onSelectItem={this._handleChangeComposition}
										onRemove={this.onDeleteCompositionUser}
										selectedItem={compositionSelected}
									/>
								</div>
							}
						</div>
						<div
							style={{
								position: 'relative',
								width: 'calc(100%)',
								display: 'flex',
								marginTop: 10,
							}}
							onMouseEnter={() => this._onHover()}
						>
							<img src={sportunity.sport && sportunity.sport.sport.fieldImages ? sportunity.sport.sport.fieldImages[0] : '/images/Composition/terrains_volleyball.png'}
							     style={{width: '100%', height: '100%'}}
							     ref={a => this.fieldImage = a}
							/>
							<TutoComposition
								canCloseModal={true}
								title={localizations.composition_title}
								open={!tutoDone && this.state.openModal}
								onClose={() => this._handleCloseComposition()}
							/>
							{userPositions && userPositions.map((user, index) => (
								<Draggable key={user.user.id}
								           bounds='parent'
								           position={user.position}
								           onStart={this.onStart}
								           onStop={(e, position) => this.onStop(position, index)}
								>
									<div style={{display:'flex', flexDirection: 'column', alignItems: 'center', width: 50, margin: 5, cursor: 'pointer', position: 'absolute'}}>

										<Button
											onClick={() => this.props._updateUserPositionRemove(index)}
											style={styles.close}
											text={<i style={styles.closeIcon} className="fa fa-times-circle fa-2x" />}
										/>
										<div style={{...styles.iconCircle, backgroundImage: user.user.avatar ? 'url('+ user.user.avatar +')' : 'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")'}} />
										<div style={{...styles.name}}>{user.user.pseudo}</div>
									</div>
								</Draggable>
							))}
						</div>
					</div>
					: sportunity.compositions && sportunity.compositions.length > 0 ?
						<div style={{marginTop: 80}}>
							<div style={styles.label}>
								{localizations.event_compo_name}
							</div>
							<div style={styles.rowInput}>
								<SelectComposition
									list={sportunity.compositions}
									onSelectItem={this._handleChangeComposition}
									onRemove={isAdmin ? this.onDeleteCompositionUser : null}
									selectedItem={compositionSelected}
								/>
							</div>
							<div
								style={{
									position: 'relative',
									width: 'calc(100%)',
									display: 'flex',
									marginTop: 10,
								}}>
								<img src={sportunity.sport && sportunity.sport.sport.fieldImages ? sportunity.sport.sport.fieldImages[0] : '/images/Composition/terrains_volleyball.png'}
								     style={{width: '100%', height: '100%'}} ref={a => this.fieldImage = a}/>
								{userPositions && userPositions.map((user, index) => (
									user.position.x >= 0 && user.position.y >= 0 &&
									<Draggable key={user.user.id}
									           bounds='parent'
									           position={user.position}
									           onStart={() => false}
									>
										<div style={{display:'flex', flexDirection: 'column', alignItems: 'center', width: 50, margin: 5, cursor: 'pointer', position: 'absolute'}}>
											<div style={{...styles.iconCircle, backgroundImage: user.user.avatar ? 'url('+ user.user.avatar +')' : 'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")'}} />
											<div style={{...styles.name}}>{user.user.pseudo}</div>
										</div>
									</Draggable>
								))}
							</div>
						</div>
						:
					<div style={{marginTop: 80}}>
						<div style={{height: '5em', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
							<img src="/images/Composition/compo.png" style={{width: '5em'}}/>
							<div style={styles.timeContainer}>
								<i
									style={{color: colors.red}}
									className='fa fa-times fa-5x'
								/>
							</div>
						</div>
						<div style={styles.errorMessages}>
							{localizations.event_compo_empty}
						</div>
					</div>
				}
			</div>
		)
	}
}

let styles = {
	label: {
		fontSize: 16,
		color: colors.blue,
		marginRight: 10
	},
	rowInput: {
		display: 'flex',
		alignItems: 'center',
		fontSize: 14,
	},
	input: {
		borderTop: 'none',
		borderRight: 'none',
		borderLeft: 'none',
		borderBottom: '2px solid ' + colors.blue,
		padding: 5,
		minWidth: 150
	},
	timeContainer: {
		position: 'relative',
		top: '-5em',
		left: '-8px',
		width: 24,
		textAlign: 'center'
	},
	errorMessages: {
		fontFamily: 'Lato',
		fontSize: 18,
		color: colors.blue,
		textAlign: 'center',
		marginTop: 10,
	},
	buttonsContainer: {
		position: 'absolute',
		right: 25,
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'baseline',
	},
	greenButton: {
		backgroundColor: colors.green,
		color: colors.white,
		padding: '7px',
		marginRight: 5,
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		fontSize: 18,
		minWidth: 180,
		height: 40,
		fontFamily: 'Lato',
		cursor: 'pointer',
		border: 0,
		transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
		':hover': {
			filter: 'brightness(0.9)'
		},
		':disabled': {
			backgroundColor: colors.lightGray,
			color: colors.darkGray
		},
		':active': {
			outline: 'none'
		},
		'@media (max-width: 900px)': {
			width: '100%'
		}
	},

	iconCircle: {
		width: 40,
		height: 40,
		flexShrink: 0,
		borderRadius: '50%',
		marginBottom: 7,
		backgroundPosition: '50% 50%',
		backgroundSize: 'cover',
		backgroundRepeat: 'no-repeat',
	},
	redButton: {
		backgroundColor: colors.redGoogle,
		color: colors.white,
		padding: '7px',
		marginRight: 5,
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		fontSize: 18,
		minWidth: 180,
		height: 40,
		fontFamily: 'Lato',
		cursor: 'pointer',
		border: 0,
		transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
		':hover': {
			filter: 'brightness(0.9)'
		},
		':disabled': {
			backgroundColor: colors.lightGray,
			color: colors.darkGray
		},
		':active': {
			outline: 'none'
		},
		'@media (max-width: 900px)': {
			width: '100%',
			marginTop: 10
		}
	},
	grayButton: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: colors.lightGray,
		color: colors.darkGray,
		fontSize: 20,
		padding: '7px',
		cursor: 'pointer',
		height: 40,
		border: '1px solid ' + colors.gray,
		transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
		':hover': {
			filter: 'brightness(0.9)'
		},
		':active': {
			outline: 'none'
		},
	},
	icon: {
		fontSize: 24,
		marginRight: 7
	},
	name: {
		color: colors.black,
		fontSize: 17,
		fontWeight: 500,
		textDecoration: 'none',
		textTransition: 'none',
		
		textAlign: 'center',
		wordWrap: 'break-word'
	},
	title: {
		color: colors.blue,
		fontSize: 20,
		fontWeight: 500,
		marginBottom: 10,
	},
	close: {
		backgroundColor: colors.white,
		color: colors.red,
		width: 20,
		height: 20,
		borderStyle: 'none',
		borderRadius: '50%',
		padding: 0,
		cursor: 'pointer',
		position: 'absolute',
		top: -5,
		right: 42,
	},
	closeIcon: {
		fontSize: '24px',
	}
}

const _updateUserPositionUpdate = (value, index) => {
	return {
		type: types.COMPOSITION_UPDATE_POSITION_UPDATE,
		value,
		index
	}
}

const _updateUserPositionAdd = (value) => {
	return {
		type: types.COMPOSITION_UPDATE_POSITION_ADD,
		value
	}
}

const _updateUserPositionRemove = (index) => {
	return {
		type: types.COMPOSITION_UPDATE_POSITION_REMOVE,
		index
	}
}

const _updateUserPositionClear = () => {
	return {
		type: types.COMPOSITION_UPDATE_POSITION_CLEAR,
	}
}

const _updateFieldElement = (value) => {
	return {
		type: types.COMPOSITION_UPDATE_ELEMENT,
		value
	}
}

const stateToProps = (state) => ({
	userPositions: state.compositionReducer.userPositions,
	fieldElement: state.compositionReducer.fieldElement,
})

const dispatchToProps = (dispatch) => ({
	_updateUserPositionUpdate: bindActionCreators(_updateUserPositionUpdate,dispatch),
	_updateUserPositionAdd: bindActionCreators(_updateUserPositionAdd,dispatch),
	_updateUserPositionRemove: bindActionCreators(_updateUserPositionRemove,dispatch),
	_updateUserPositionClear: bindActionCreators(_updateUserPositionClear,dispatch),
	_updateFieldElement: bindActionCreators(_updateFieldElement,dispatch)
})

const ReduxContainer = connect(
	stateToProps,
	dispatchToProps,
)(Radium(Compositions))

export default createFragmentContainer(Radium(withAlert(ReduxContainer)), {
    viewer: graphql`
        fragment Compositions_viewer on Viewer {
            me {
                id
                pseudo
                avatar
                compositions {
                    id
                    name
          			fieldImage
        			owner {
          				id
					}
        			users {
          				user {
							id
							pseudo
							avatar
						}
            			position {
							xPercentage
							yPercentage
						}
					}
                }
            }
        }
    `,
    sportunity: graphql`
        fragment Compositions_sportunity on Sportunity {
            id
			participants {
				id,
				pseudo
				avatar
			}
			sport {
				sport {
					fieldImages
				}
			}
			compositions {
				id
				name
				fieldImage
				owner {
					id
				}
				users {
					user {
						id
						pseudo
						avatar
					}
					position {
						xPercentage
						yPercentage
					}
				}
			}
        }
    `
})