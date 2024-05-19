import React from 'react'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import { colors, fonts, metrics } from '../../theme'
import Modal from 'react-modal'
import Radium from 'radium'
import ReactTooltip from 'react-tooltip'
import moment from 'moment'
import ReactLoading from 'react-loading'
import { Button } from '@material-ui/core';
import localizations from '../Localizations'
import UpdateMemberStatusMutation from "./CircleMembersInformation/UpdateMemberStatusMutation";
import PseudoInfoForTable from '../common/PseudoInfoForTable';

import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';


let styles, modalStyles

const ITEM_HEIGHT = 48;


class MemberRow extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			modalIsOpen: false,
			memberToRemove: null,
			isLoading: false,
			anchorEl: null
		}
		this._handleOnRemove = this._handleOnRemove.bind(this);
		this._confirmDeny = this._confirmDeny.bind(this);
		this._confirmAccept = this._confirmAccept.bind(this);
		this._closeModal = this._closeModal.bind(this);
		this._confirmDelete = this._confirmDelete.bind(this);
		this._confirmValidate = this._confirmValidate.bind(this);
	}

  handleMoreOptionsClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleMoreOptionsClose = () => {
    this.setState({ anchorEl: null });
  };

  handleSubscriptionDeny = () => {
    alert("hi")
  };

	componentDidMount() {
		Modal.setAppElement('#root');
	}

	_handleOnRemove(id) {
		this.setState({
			modalIsOpen: true,
			memberToRemove: id,
		})
	}

	_closeModal() {
		this.setState({
			modalIsOpen: false,
			memberToRemove: null,
		})
	}

	_confirmDelete() {
		this.setState({isLoading: true});
		this.props.onDeleteMember(this.state.memberToRemove);
	}

	_confirmValidate() {
		this.setState({isLoading: true});
		this.props.onValidateMember(this.state.memberToRemove);
	}

	_confirmDeny(member) {
		this.setState({isLoading: true});
		this.props.onAcceptDenyMember({refusedUsers: [member]});
	}

	_confirmAccept(member) {
		this.setState({isLoading: true});
		this.props.onAcceptDenyMember({acceptedUsers: [member]});
	}

	render() {
		const { anchorEl } = this.state;
    const open = Boolean(anchorEl);
		const { member, userCanRemoveMember, userFilledInfos, existingAskedInformation, filledInformation, type } = this.props
		let statusList = [
	      {
	        type: 'ACTIVE',
	        name: localizations.circle_status_active,
	      },
	      {
	        type: 'INJURED',
	        name: localizations.circle_status_injured,
	      },
	      {
	        type: 'INACTIVE',
	        name: localizations.circle_status_inactive,
		  },
		  {
				type: 'OLD',
				name: localizations.circle_status_old,
		  },
	      {
	        type: 'OTHER',
	        name: localizations.circle_status_other,
		  },
		  {
				type: 'PENDING',
				name: localizations.circle_subscription_pending
			},
			{
				type: 'REFUSED',
				name: localizations.circle_subscription_refused
			}
		];

		const status = filledInformation && filledInformation.answers && filledInformation.answers.length > 0 && !!filledInformation.answers.find(answer => answer.askedInfo.type === 'STATUS') ? [filledInformation.answers.find(answer => answer.askedInfo.type === 'STATUS')] : [];

		return (
			<tr style={styles.row}>
				<td style={styles.checkBoxWrapper}>
					{userCanRemoveMember &&
						[<ReactTooltip effect="solid" multiline={true}/>,
						<input
							type="checkbox"
							style={styles.checkBox}
							onChange={() => this.props.handleUserClicked(member)}
							checked={this.props.selectedUserList.indexOf(member.id) >= 0}
						/>]
					}
				</td>
				
				<td style={styles.memberDetail}>
					<PseudoInfoForTable member={member}></PseudoInfoForTable>
				</td>

				{
					// VB: We don't need that many dynamic columns, I only need specific column, like status and Acceptance
					//{filledInformation && filledInformation.answers && filledInformation.answers.length > 0 &&
				}

				{filledInformation && filledInformation.answers && filledInformation.answers.length > 0
				? filledInformation.answers.map((answer, index) => (
					<td key={index} style={styles.memberAnswer}>
						<div style={
							answer.askedInfo && (answer.askedInfo.type === 'STATUS' || (answer.askedInfo.askedInfo && answer.askedInfo.askedInfo.type))
								?	answer.answer === 'ACTIVE'
								? 	{...styles.answer, color: '#20bf70'}
								:	answer.answer === 'INJURED'
									? 	{...styles.answer, color: '#f7ba17'}
									:	answer.answer === 'INACTIVE'
										? 	{...styles.answer, color: '#ff0000'}
										:	answer.answer === 'PENDING' ?  {...styles.answer, color: colors.blue}  : styles.answer
								: 	styles.answer}>
							{answer.askedInfo && answer.askedInfo.type === 'BOOLEAN' || (answer.askedInfo.askedInfo && answer.askedInfo.askedInfo.type === 'BOOLEAN')
							?	answer.answer ? localizations.circle_yes : localizations.circle_no
							:	answer.askedInfo && answer.askedInfo.type === 'DATE' || (answer.askedInfo.askedInfo && answer.askedInfo.askedInfo.type === 'DATE')
								?	answer.answer ? moment(new Date(answer.answer)).format('DD/MM/YYYY') : '-'
								:	answer.askedInfo && (answer.askedInfo.type === 'STATUS' || (answer.askedInfo.askedInfo && answer.askedInfo.askedInfo.type === 'STATUS')) && statusList.findIndex((status) => answer.answer === status.type) >= 0
										? 	statusList.find((status) => answer.answer === status.type).name
										: answer.askedInfo && answer.askedInfo.type === 'TERM' || (answer.askedInfo.askedInfo && answer.askedInfo.askedInfo.type === 'TERM')
											? answer.answer ? localizations.circle_termOfUse_isAccepted : localizations.circle_termOfUse_isNotAccepted
											: answer.answer !== undefined ? answer.answer : '-' }
						</div>
					</td>
				))
				:	<td style={styles.memberAnswer}>
						<div style={{...styles.answer}}>-</div>
					</td>
				}


				<td style={styles.memberAnswer}>
					<div style={{...styles.answer}}>
						{type==="members" && localizations.circle_accepted}
					</div>
				</td>

				{userCanRemoveMember && (type === "members" || type === "waitingMembers") && 
					<td style={styles.remove}>
						<div style={styles.iconContainer}>
							{type === "waitingMembers"
							?	<Button variant="contained" onClick={()=>this._confirmAccept(member)} style={{ backgroundColor: colors.blue, color: colors.white, marginRight: '15px' }}>
									<i className="material-icons">
										person_add
									</i>
									{localizations.circle_subscribe_validate}
								</Button>
							:	<i className="fa fa-times" style={styles.iconRemove} onClick={()=>this._handleOnRemove(member.id)}></i>
							}
							
							{type === "waitingMembers" &&
								<div>
					        <IconButton
					          aria-label="More"
					          aria-owns={open ? 'long-menu' : undefined}
					          aria-haspopup="true"
					          onClick={this.handleMoreOptionsClick}
					        >
					          <MoreVertIcon />
					        </IconButton>
					        <Menu
					          id="long-menu"
					          anchorEl={anchorEl}
					          open={open}
					          onClose={this.handleMoreOptionsClose}
					          PaperProps={{
					            style: {
					              maxHeight: ITEM_HEIGHT * 4.5,
					              width: 200,
					            },
					          }}
					        >
				            <MenuItem onClick={()=>this._confirmDeny(member)}>
				              {localizations.circle_subscribe_deny}
				            </MenuItem>
					        </Menu>
					      </div>
					    }
						</div>
					</td>
				}
                  
        
				<Modal
					isOpen={this.state.modalIsOpen && this.state.memberToRemove}
					onRequestClose={this._closeModal}
					style={modalStyles}
					contentLabel={localizations.circle_removeMember}
				>
					<div style={styles.modalContent}>
						<div style={styles.modalHeader}>
							<div style={styles.modalContent}>
								<div style={styles.modalText}>
									{localizations.circle_removeMember}
								</div>
								<div style={styles.modalExplanation}>
									{localizations.circle_removeMemberExplanation}
								</div>
								{this.state.isLoading
									?	(<div style={styles.modalButtonContainer}><ReactLoading type='cylon' color={colors.blue} /></div>)
									:	(<div style={styles.modalButtonContainer}>
										<Button style={styles.submitButton} onClick={this._confirmDelete}>{localizations.circle_yes}</Button>
										<Button style={styles.cancelButton} onClick={this._closeModal}>{localizations.circle_no}</Button>
									</div>)
								}
							</div>
						</div>
					</div>
				</Modal>
			</tr>
		)
	}
}

styles = {
	row: {
		backgroundColor: colors.white,
		// boxShadow: '0 0 4px 0 rgba(0,0,0,0.12)',
		border: '1px solid #E7E7E7',
		overflow: 'hidden',
		fontFamily: 'Lato',
		margin: '1px 0',
		padding: 15,
		textDecoration: 'none',
		justifyContent: 'space-between',
		alignItems: 'center',
		height: '40px'
	},
	middle: {
		flex: 2,
		padding: 5,
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	checkBoxWrapper: {
		verticalAlign: 'middle'
	},
	checkBox: {
		cursor: 'pointer',
		height: 14,
		width: 14,
		userSelect: 'all',
		marginLeft: 10,
	},
	icon: {
        width: 25,
        height: 25,
        marginRight: 10,
        borderRadius: '50%',
		backgroundColor: colors.white,
		'@media (max-width: 768px)': {
			width: 'auto'
		}
	},
    iconImage: {
		color:colors.white,
		width: 50,
        height: 50,
		borderRadius: '50%',
		backgroundPosition: '50% 50%',
        backgroundSize: 'cover',
		backgroundRepeat: 'no-repeat',
	},
	memberDetail: {
		display: 'flex',
		padding: 5,
		justifyContent: 'flex-start',
		marginRight: 10,
		alignItems: 'center'
	},
	memberAnswer: {
		justifyContent: 'flex-start',
		marginRight: 10,
		padding: 5,
		textAlign: 'center',
		verticalAlign: 'middle'
	},
	acceptance: {
		fontSize: 14,
		color: '#A6A6A6',
		textAlign: 'center',
		verticalAlign: 'middle'
	},
	remove: {
		fontSize: 14,
		cursor: 'pointer',
		textAlign: 'end',
		padding: 5,
		verticalAlign: 'middle'
	},
	iconContainer: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-end'
	},
	iconMore: {
		marginRight: '10px',
		cursor: 'pointer',
		fontSize: '17px'
	},
	iconRemove: {
		color: colors.black,
		cursor: 'pointer',
		marginRight: '15px',
		fontSize: '17px'
	},
	iconAdd: {
		marginRight: '10px',

	},
	modalContent: {
		justifyContent: 'flex-start',
		width: 300,
		padding: 10,
		'@media (max-width: 768px)': {
			width: 'auto'
		}
	},
	modalHeader: {
		display: 'flex',
		flexDirection: 'row',
        alignItems: 'flex-center',
		justifyContent: 'flex-center',
	},
	modalTitle: {
		fontFamily: 'Lato',
		fontSize:24,
		fontWeight: fonts.weight.medium,
		color: colors.blue,
		marginBottom: 20,
	},
	modalClose: {
		justifyContent: 'flex-center',
		paddingTop: 10,
		color: colors.gray,
		cursor: 'pointer',
	},
	modalText: {
		fontSize: 18,
		justifyContent: 'center',
		width: '100%',
		fontFamily: 'Lato',
	},
	modalExplanation: {
		fontSize: 16,
		color: colors.gray,
		justifyContent: 'center',
		width: '100%',
		fontFamily: 'Lato',
		fontStyle: 'italic',
		marginTop: 10,
		textAlign: 'justify'
	},
	modalButtonContainer: {
		fontSize: 18,
		justifyContent: 'center',
		width: '100%',
		fontFamily: 'Lato',
		marginTop: 30,
	},
	submitButton: {
		width: 80,
		backgroundColor: colors.blue,
        color: colors.white,
        fontSize: fonts.size.small,
        borderRadius: metrics.radius.tiny,
        outline: 'none',
		border: 'none',
		padding: '10px',
		cursor: 'pointer',
		boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
		margin: 10,
	},
  	cancelButton: {
		width: 80,
		backgroundColor: colors.gray,
        color: colors.white,
        fontSize: fonts.size.small,
        borderRadius: metrics.radius.tiny,
        outline: 'none',
		border: 'none',
		padding: '10px',
		cursor: 'pointer',
		boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
		margin: 10,
	},
	answer: {
		fontSize: 14,
		lineHeight: '20px',
		color: 'rgba(0,0,0,0.65)',
	}
}


modalStyles = {
  overlay : {
    position          : 'fixed',
    top               : 0,
    left              : 0,
    right             : 0,
    bottom            : 0,
    backgroundColor   : 'rgba(255, 255, 255, 0.75)',
  },
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    border                     : '1px solid #ccc',
    background                 : '#fff',
    overflow                   : 'auto',
    WebkitOverflowScrolling    : 'touch',
    borderRadius               : '4px',
    outline                    : 'none',
    padding                    : '20px',
  },
}

export default createFragmentContainer(Radium(MemberRow), {
  viewer: graphql`
    fragment MemberRow_viewer on Viewer {
              id
          }
      `
  })
