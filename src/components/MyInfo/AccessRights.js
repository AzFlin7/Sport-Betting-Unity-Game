import React from 'react'
import {
	createFragmentContainer,
	graphql,
} from 'react-relay/compat';
import { withAlert } from 'react-alert'
import ReactLoading from 'react-loading'
import { colors, fonts } from '../../theme'
import localizations from '../Localizations'
import Circle from '../common/Header/Circle'
import UpdateUserMutation from './UpdateUserMutation'
import UpdateUserEmailMutation from './UpdateUserEmailMutation'
import UpdateUserProfileTypeMutation from './UpdateUserProfileTypeMutation'
import DeleteUserMutation from './DeleteUserMutation'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import cloneDeep from 'lodash/cloneDeep';

import Styles from './Styles'
import PanelTeam from './PanelTeam';
import { Link } from "found";
import { confirmModal } from '../common/ConfirmationModal';
import { Button } from '@material-ui/core';
import SearchModal from '../common/SearchModal';
import UpdateUserTutorialStepsMutation from '../common/StepperModal/UpdateUserTutorialStepsMutation';
import * as types from '../../actions/actionTypes';

const ADMIN_LEVEL = 'ADMIN'
let profileType = [];
profileType["PERSON"] = localizations.info_access_rights_user_type_person;
profileType["BUSINESS"] = localizations.info_access_rights_user_type_business;
profileType["ORGANIZATION"] = localizations.info_access_rights_user_type_organization;
profileType["SOLETRADER"] = localizations.info_access_rights_user_type_soletrader;

const toAuthorizedManagersVar = (mngrs) =>
	mngrs.reduce((mem, mngr) => [...mem, {
		user: mngr.user.id,
		authorization_level: ADMIN_LEVEL,
	}], [])

class AccessRights extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			authorized_managers: [],
			isSaving: false,
			editEmail: false,
			editProfileType: false,
			email: this.props.viewer.me.email || '',
			profileType: this.props.viewer.me.profileType || ''
		}
	}

	alertOptions = {
		offset: 60,
		position: 'top right',
		theme: 'light',
		transition: 'fade',
	};

	componentDidMount() {
		this.componentWillReceiveProps(this.props)
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.user && nextProps.user.authorized_managers) {
			this.setState({
				authorized_managers: nextProps.user.authorized_managers,
				authorized_managersSrc: nextProps.user.authorized_managers,
			})
		}
	}

	_handleEmailInputChange = e => {
		this.setState({
			email: e.target.value,
			hasChanged: true
		})
	}

	_handleSaveEmail = () => {
		if (this.state.hasChanged) {
			this.setState({
				isSaving: true,
			})
			UpdateUserEmailMutation.commit({
					userIDVar: this.props.user.id,
					emailVar: this.state.email
				}, {
					onFailure: error => {
						this.props.alert.show(localizations.popup_editMyInfo_update_falied, {
							timeout: 2000,
							type: 'error',
						});
						this.setState({
							isSaving: false,
							email: this.props.viewer.me.email
						})
					},
					onSuccess: response => {
						this.props.alert.show(localizations.popup_editMyInfo_update_sucess, {
							timeout: 2000,
							type: 'success',
						});
						this.setState({
							isSaving: false,
						})

					}
				}
			)
		}
		this.setState({
			editEmail: false,
			hasChanged: false
		})
	}

	_handleCancelEditEmail = () => {
		this.setState({
			editEmail: false,
			email: this.props.viewer.me.email,
			hasChanged: false
		})
	}

	_handleSaveProfileType = () => {
		if (this.state.hasChanged) {
			this.setState({
				isSaving: true,
			})
			UpdateUserProfileTypeMutation.commit({
					userIDVar: this.props.user.id,
					profileTypeVar: this.state.profileType
				}, {
					onFailure: error => {
						this.props.alert.show(localizations.popup_editMyInfo_update_falied, {
							timeout: 2000,
							type: 'error',
						});
						this.setState({
							isSaving: false,
							profileType: this.props.viewer.me.profileType
						})
					},
					onSuccess: response => {
						this.props.alert.show(localizations.popup_editMyInfo_update_sucess, {
							timeout: 2000,
							type: 'success',
						});
						this.setState({
							isSaving: false,
						})

					}
				}
			)
		}
		this.setState({
			editProfileType: false,
			hasChanged: false
		})
	}

	_handleCancelEditProfileType = () => {
		this.setState({
			editProfileType: false,
			profileType: this.props.viewer.me.profileType,
			hasChanged: false
		})
	}

	_handleProfileTypeChange = e => {
		this.setState({
			profileType: e.target.value,
			hasChanged: true
		})
	}

	_handleUpdateTeamEmail = (userId, newEmail) => {
		UpdateUserEmailMutation.commit({
				userIDVar: userId,
				emailVar: newEmail
			}, {
				onFailure: error => {
					this.props.alert.show(localizations.popup_editMyInfo_update_falied, {
						timeout: 2000,
						type: 'error',
					});
					this.setState({
						isSaving: false,
						profileType: this.props.viewer.me.profileType
					})
				},
				onSuccess: response => {
					this.props.alert.show(localizations.popup_editMyInfo_update_sucess, {
						timeout: 2000,
						type: 'success',
					});
					this.setState({
						isSaving: false,
					})

				}
			}
		)

	}

	_handleDeleteSelfAccount = () => {
		let message = localizations.info_access_rights_remove_selfaccount;
		if (this.props.viewer.me.subAccounts && this.props.viewer.me.subAccounts.length > 0){
			message += localizations.info_access_rights_sub_ccounts_will_be_deleted;
			this.props.viewer.me.subAccounts.map((subAccount, index) => {
				if (index !== this.props.viewer.me.subAccounts.length - 1)
					return message += subAccount.pseudo + ', ';
				else
					return message += subAccount.pseudo
			})
		}

		confirmModal({
			title: localizations.info_access_rights_remove_selfaccount_title,
			message: message,
			confirmLabel: localizations.info_access_rights_remove_selfaccount_yes,
			cancelLabel: localizations.info_access_rights_remove_selfaccount_no,
			canCloseModal: true,
			onConfirm: () => {
				this._deleteUser(this.props.viewer.me.id, true);
			},
			onCancel: () => {}
		})
	}

	_handleDeleteSubAccount = (subAccountId, subAccountPseudo) => {
		confirmModal({
			title: localizations.info_access_rights_remove_subaccount_title,
			message: localizations.info_access_rights_remove_subaccount_pre
				+ subAccountPseudo
				+ localizations.info_access_rights_remove_subaccount_post ,
			confirmLabel: localizations.info_access_rights_remove_subaccount_yes,
			cancelLabel: localizations.info_access_rights_remove_subaccount_no,
			canCloseModal: true,
			onConfirm: () => {
				this._deleteUser(subAccountId, false);
			},
			onCancel: () => {}
		})
	}

	_deleteUser = (userId, isSelfAccount) => {
		DeleteUserMutation.commit({
				userIDVar: userId
			}, {
				onFailure: error => {
					this.props.alert.show(localizations.popup_editMyInfo_update_falied, {
						timeout: 2000,
						type: 'error',
					});
					this.setState({
						isSaving: false,
						profileType: this.props.viewer.me.profileType
					})
				},
				onSuccess: response => {
					this.props.alert.show(localizations.popup_editMyInfo_update_sucess, {
						timeout: 2000,
						type: 'success',
					});
					this.setState({
						isSaving: false,
					})
					if (isSelfAccount) {
						this.props.router.push({
							pathname: '/logout',
						});
					}
				}
			}
		)
	}

	showSearchModal = (user) => {
		this.setState({
			displaySearchModal: true,
			user: user,
			managersList: user.authorized_managers
		})
	}

	_userAlreadyExist = (newManager, managersList) =>
		managersList.find(
			(authrorized) => authrorized.user.id === newManager.user.id
		)


	onSearchModalAdd = values => {
		let newManagerUsers = values.map(value => ({
			user:	{
				id: value.id,
				avatar: value.avatar,
				pseudo: value.pseudo
			}
		}));
		let newManagerFilteredUsers = newManagerUsers.filter(user => !this._userAlreadyExist(user, this.state.managersList))
		let newManagersList = [
			...this.state.managersList,
			...newManagerFilteredUsers
		];
		this._handleSaveManagers(this.state.user, newManagersList)

		this.onCloseModal();
	};

	_removeManager = (user, managerId) => {
		let newManagersList =	user.authorized_managers.filter((item) => item.user.id !== managerId)
		this._handleSaveManagers(user, newManagersList)
	}

	_handleSaveManagers = (user, authorizedUsers) => {
		this.setState({
			isSaving: true,
		})
		UpdateUserMutation.commit({
				user: user,
				userIDVar: user.id,
				authorized_managersVar:
					toAuthorizedManagersVar(authorizedUsers)
			},	{
				onFailure: error => {
					this.props.alert.show(localizations.popup_editMyInfo_update_falied, {
						timeout: 2000,
						type: 'error',
					});
					this.setState({
						isSaving: false,
					})
				},
				onSuccess: response => {
					this.props.alert.show(localizations.popup_editMyInfo_update_sucess, {
						timeout: 2000,
						type: 'success',
					});
					this.setState({
						isSaving: false,
					})
					this._updateTutorialSteps();
				}
			}
		)
	}

	_updateTutorialSteps = () => {
		const { tutorialSteps } = this.props;
		let newTutorialSteps = cloneDeep(tutorialSteps);

		newTutorialSteps['shareAccessStep'] = true;
		this.props._updateStepsCompleted(newTutorialSteps);
	}

	onCloseModal = () => {
		this.setState({
			displaySearchModal: false,
		});
	};

	createNewSubAccount = () => {
		this.props._updateRegisterFromAction(`/share-access`)
		this.props._updateSubAccountCreation(true);
		this.props.router.push('/register')
	}	

	render() {
		const { user, viewer } = this.props
		const { authorized_managers, editEmail, editProfileType } = this.state

		return(
			<section style={styles.container}>
				<div style={{...styles.row, alignItems: 'center'}}>
					<div style={{...styles.pageHeader, marginRight: 20}}>{localizations.accessshare_title}</div>
					{	this.state.isSaving
					&&	<ReactLoading type='cylon' color={colors.blue} />
					}
				</div>
				<div style={styles.row}>
					<label style={styles.label}>{localizations.info_access_rights_user_email}</label>
					{ editEmail
						?	<div style={styles.inputRow}>
							<input
								type='text' style={styles.input}
								value={this.state.email}
								placeholder='example@example.com'
								onChange={this._handleEmailInputChange}
							/>
							<i
								className='fa fa-check'
								style={styles.checkIcon}
								onClick={this._handleSaveEmail}
							/>
							<i
								className='fa fa-times'
								style={styles.cancelEditIcon}
								onClick={this._handleCancelEditEmail}
							/>
						</div>
						: <div>
							<label style={styles.label}>{viewer.me.email}</label>
							{!viewer.me.mangoId &&
							<i
								style={styles.pencilIcon}
								className="fa fa-pencil"
								aria-hidden="true"
								onClick={() => this.setState({ editEmail: true })}
							/>
							}
						</div> }
				</div>
				<div style={styles.row}>
					<label style={styles.label}>{localizations.info_access_rights_user_type}:</label>
					{ editProfileType
						?	<div style={styles.inputRow}>
							<select
								style={{...styles.selectInput, width: 300}}
								onChange={this._handleProfileTypeChange}
								value={this.state.profileType}
								required={true}
							>
								<option value=''>{localizations.register_user_type_none}</option>
								<option value="PERSON">{localizations.info_access_rights_user_type_person}</option>
								<option value="BUSINESS">{localizations.info_access_rights_user_type_business}</option>
								<option value="ORGANIZATION">{localizations.info_access_rights_user_type_organization}</option>
								<option value="SOLETRADER">{localizations.info_access_rights_user_type_soletrader}</option>
							</select>
							<i
								className='fa fa-check'
								style={styles.checkIcon}
								onClick={this._handleSaveProfileType}
							/>
							<i
								className='fa fa-times'
								style={styles.cancelEditIcon}
								onClick={this._handleCancelEditProfileType}
							/>
						</div>
						: <div>
							<label style={styles.label}>{profileType[this.state.profileType]}</label>
							{!viewer.me.mangoId && !viewer.me.isProfileComplete && this.props.stepsPercentage > 0 &&
								<i
									style={styles.pencilIcon}
									className="fa fa-pencil"
									aria-hidden="true"
									onClick={() => this.setState({ editProfileType: true })}
								/>
							}
						</div>
					}
				</div>
				<div style={{...styles.row, justifyContent: 'flex-end', marginTop: 0}}>
					<span style={{color: colors.red, font: 6, cursor: 'pointer'}} onClick={this._handleDeleteSelfAccount}>
						{localizations.info_access_rights_delete_account}
					</span>
				</div>
				<div style={styles.row}>
					<div style={styles.header}>{localizations.info_access_rights_sub_account_access}</div>
					<Button style={styles.altButton} onClick={() => this.showSearchModal(this.props.user)}>
						{localizations.info_access_rights_add_account}
					</Button>
				</div>
				<div style={styles.row}>
					{this.state.displaySearchModal && (
						<SearchModal
							isOpen={this.state.displaySearchModal}
							viewer={viewer}
							onClose={this.onCloseModal}
							onValide={this.onSearchModalAdd}
							tabs={['People', 'Groups']}
							allowToSeeCircleDetails={true}
							types={['ADULTS', 'CHILDREN']}
							circleTypes={['MY_CIRCLES', 'CIRCLES_I_AM_IN', 'CHILDREN_CIRCLES']}
							userType="PERSON"
							queryCirclesOnOpen={true}
						/>
					)}
				</div>
				<div style={styles.row}>
					{authorized_managers && authorized_managers.length >0
						? <ul style={styles.list}>
							{authorized_managers.map((authorized, index) => (
								<li
									key={index}
									style={styles.listItem}
								>
									<Circle image={authorized.user.avatar} style={styles.icon} />
									{authorized.user.pseudo}
									<span style={styles.removeCross} onClick={() => this._removeManager(this.props.user, authorized.user.id)}>
										<i className="fa fa-times" style={styles.cancelIcon} aria-hidden="true"></i>
									</span>
								</li>
							))
							}
						</ul>
						:<label style={{...styles.label, width: 250}}>
							{localizations.info_access_rights_no_manager}
						</label>
					}
				</div>

				{!viewer.me.isSubAccount &&
				<div style={styles.row}>
					<div style={styles.header}>
						{viewer.me.profileType === 'PERSON'
							? localizations.info_access_rights_my_children_of
							: localizations.info_access_rights_my_teams_of
						}
						{viewer.me.pseudo}
					</div>
					{(viewer.me && viewer.me.userPreferences && viewer.me.userPreferences.areSubAccountsActivated && !viewer.me.isSubAccount) &&
					<Button style={styles.altButton} onClick={this.createNewSubAccount}>
						{viewer.me.profileType === 'PERSON'
							? localizations.info_access_rights_create_child
							: localizations.info_access_rights_create_team
						}
					</Button>
					}
				</div>
				}
				{!viewer.me.isSubAccount &&
				<div style={styles.row}>
					<div style={{...styles.col, width: '100%'}}>
						{viewer.me.subAccounts && viewer.me.subAccounts.length > 0
							? viewer.me.subAccounts.map((subAccount, index) => (
								<div key={`subAccounts-team-view-${index}-container`}>
									<PanelTeam
										viewer={viewer}
										user={subAccount}
										updateEmail={this._handleUpdateTeamEmail}
										handleDelete={this._handleDeleteSubAccount}
										handleSaveManagers={this._handleSaveManagers}
										handleRemoveManager={this._removeManager}
										showMemberSearchModal={() => this.showSearchModal(subAccount)}
									/>
								</div>
							))
							: <label style={{...styles.label, width: 250}}>
								{viewer.me.profileType === 'PERSON'
									? localizations.info_access_rights_no_children
									: localizations.info_access_rights_no_teams
								}
							</label>
						}
					</div>
				</div>
				}
			</section>
		)
	}
}

const alertOptions = {
	offset: 60,
	position: 'top right',
	theme: 'light',
	transition: 'fade',
}

const styles = {
	...Styles,
	list: {
		width: '100%',
	},
	listItem: {
		paddingBottom: 10,
		color: '#515151',
		fontSize: 20,
		fontWeight: 500,
		fontFamily: 'Lato',
		borderBottomWidth: 1,
		borderColor: colors.blue,
		borderStyle: 'solid',
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'center',
		marginBottom: 5,
		maxWidth: 500,
	},
	removeCross: {
		float: 'right',
		marginLeft: 'auto',
		width: 0,
		color: colors.gray,
		marginRight: '15px',
		cursor: 'pointer',
		fontSize: '16px',
	},
	cancelIcon: {
		marginRight: 15,
	},
	icon: {
		display: 'inline-block',
		width: 38,
		height: 38,
		marginRight: 10,
	},
	noManagerContainer: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center'
	},
	noManagerText: {
		textAlign: 'center',
		fontSize: 16,
		fontFamily: 'Lato',
		color: colors.darkGray,
		margin: 25
	},
	noManagerImage: {
		maxWidth: '100%',
		height: 'auto'
	},
	selectInput: {
		color: 'rgba(0,0,0,0.65)',
		border: '1px solid rgba(0,0,0,0.2)',
		borderColor: 'transparent',
		background: 'rgba(255,255,255,.5)',
		borderBottom: '2px solid '+colors.blue,
		fontSize: fonts.size.medium,
		outline: 'none',
		fontFamily: 'Lato'
	},
	header: {
		fontFamily: 'Lato',
		fontSize: 20,
		fontWeight: 'bold',
		color: colors.black,
		paddingBottom: 15,
		flex: 5,
		marginTop: 40
	},
	input: {
		borderWidth: 0,
		borderBottomWidth: 2,
		borderStyle: 'solid',
		borderColor: colors.blue,
		height: '32px',
		lineHeight: '32px',
		fontFamily: 'Lato',
		color: 'rgba(0,0,0,0.65)',
		background: 'transparent',
		fontSize: 16,
		outline: 'none',
		width: 300,
	},
	checkIcon: {
		backgroundColor: colors.green,
		color: colors.white,
		cursor: 'pointer',
		padding: '0.3em',
		margin: '0.5em'
	},
	cancelEditIcon: {
		backgroundColor: colors.red,
		color: colors.white,
		cursor: 'pointer',
		padding: '0.3em',
		margin: '0.5em'
	},
	pencilIcon: {
		fontSize: 20,
		color: colors.black,
		marginLeft: 10,
		cursor: 'pointer',
	},
	button: {
		fontFamily: 'Lato',
		fontSize: 16,
		color: colors.white,
		backgroundColor: colors.blue,
		cursor: 'pointer',
		textAlign: 'left',
		padding: '0 15px',
		marginLetf: 10,
		position: 'relative'
	},
	createTeam: {
		backgroundColor: colors.blue,
		color: colors.white,
		cursor: 'pointer',
		fontSize: '1.3em',
		padding: '0.5em 0.7em'
	},
	altButton: {
		fontSize: '15px',
		backgroundColor: colors.blue,
		color: colors.white,
		textTransform: 'none',
	}
}


const _updateStepsCompleted = (steps) => ({
	type: types.UPDATE_STEPS_COMPLETED,
	tutorialSteps: steps,
});

const _updateRegisterFromAction = text => ({
	type: types.UPDATE_REGISTER_FROM,
	text,
});

const _updateSubAccountCreation = value => ({
	type: types.UPDATE_REGISTER_SUBACCOUNT_CREATION,
	value,
});


const dispatchToProps = (dispatch) => ({
	_updateStepsCompleted: bindActionCreators(_updateStepsCompleted, dispatch),
	_updateRegisterFromAction: bindActionCreators(_updateRegisterFromAction,dispatch),
	_updateSubAccountCreation: bindActionCreators(_updateSubAccountCreation,dispatch),
});

const stateToProps = (state) => ({
	tutorialSteps: state.profileReducer.tutorialSteps,
	stepsPercentage: state.profileReducer.stepsPercentage,
	language: state.globalReducer.language,
});

const ReduxContainer = connect(
	stateToProps,
	dispatchToProps,
)(AccessRights);

export default createFragmentContainer(withAlert(ReduxContainer), {
	viewer: graphql`
		fragment AccessRights_viewer on Viewer {
			id
			me {
				id
				pseudo
				email
				profileType
				mangoId
				isProfileComplete
				isSubAccount
				userPreferences {
					areSubAccountsActivated
				}
				subAccounts {
					id
					pseudo
					email
					avatar
					numberOfUnreadNotifications
					unreadChats
					token
					authorized_managers {
						user {
							id
							avatar
							pseudo
						}
					}
				}
			}
			...SelectUser_viewer
			...SearchModal_viewer
		}
	`,
	user: graphql`
		fragment AccessRights_user on User {
			id
			profileType
			authorized_managers {
				user {
					id
					avatar
					pseudo
				}
			}
			
		}`
})
