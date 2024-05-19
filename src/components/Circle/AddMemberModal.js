import React from 'react'
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import { colors, fonts } from '../../theme'
import Modal from 'react-modal'
import InputText from './InputText'
import Submit from './Submit'
import Switch from '../common/Switch';
import SelectCircle from '../common/Inputs/SelectCircle';
import localizations from '../Localizations'

let styles
let modalStyles

class AddMemberModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            autocompletionListIsOpen: false, 
            circleListIsOpen: false,
            membersFromCirclesListIsOpen: false,
            inviteFromCirclesFromOtherTeams: false,
        }
    }

    componentDidMount() {
        window.addEventListener('click', this._handleClickOutside);
    }

    componentWillUnmount() {
        window.removeEventListener('click', this._handleClickOutside);
    }

    _handleClickOutside = (event) => {
        if (this._containerNode && !this._containerNode.contains(event.target)) {
        this.setState({ 
            autocompletionListIsOpen: false,
        });
        }
        if (this._containerCircleNode && !this._containerCircleNode.contains(event.target)) {
        this.setState({
            circleListIsOpen: false
        })
        }
        if (this._containerMembersNode && !this._containerMembersNode.contains(event.target)) {
        this.setState({
            membersFromCirclesListIsOpen: false
        })
        }
    }

    _handleInputChange = event => {
        if(this.props.value !== event.target.value) {
            this.props.onChange({pseudo: event.target.value})
        }
        let tempo = event.target.value ;
        setTimeout(() => {
            if (tempo.length > 0 && this.props.isLoggedIn && tempo === this.props.user.pseudo) {
                this.props.relay.refetch(fragmentVariables => ({
                    ...fragmentVariables, 
                    autocompletion_required: true,
                    pseudo_autocomplete: tempo,
                    userType: 
                        (this.props.circle.type === 'CHILDREN' || this.props.circle.type === 'ADULTS') ? 'PERSON' : 
                        (this.props.circle.type === 'TEAMS' || this.props.circle.type === 'CLUBS') ? 'ORGANIZATION' : 
                        this.props.circle.type === 'COMPANIES' ? 'BUSINESS' : 
                        null
                }));
                this.setState({
                    autocompletionListIsOpen: true
                })
            }
            else {
                this.props.relay.refetch(fragmentVariables => ({
                    ...fragmentVariables, 
                    autocompletion_required: false,
                    pseudo_autocomplete: '_',
                    userType: null
                }));
                this.setState({
                    autocompletionListIsOpen: false
                }) 
            }
        }, 350);
    }

    checkUserExistence = (user, callback, error) => {
        this.props.relay.refetch(fragmentVariables => ({
            ...fragmentVariables,
            pseudo: user.pseudo ? user.pseudo : '',
            email: user.email ? user.email : '',
            userType: 
                (this.props.circle.type === 'CHILDREN' || this.props.circle.type === 'ADULTS') 
                ?   'PERSON' 
                :   (this.props.circle.type === 'TEAMS' || this.props.circle.type === 'CLUBS') 
                    ?   'ORGANIZATION' 
                    :   this.props.circle.type === 'COMPANIES' 
                        ?   'BUSINESS' 
                        :   null
        }),
        null,
        () => {
            setTimeout(() => {
                if (this.props.viewer.userExists) {
                    callback();
                }
                else {
                    error(); 
                }
            }, 100);
        })
    }

    _handleAutocompleteClicked = (user) => {
        this.props.handleAutocompleteClicked(user)
        this.setState({
            autocompletionListIsOpen: false
        }) 
    }

    _switchInviteCirclesFromOtherTeams = (e) => {
        this.setState({
            inviteFromCirclesFromOtherTeams: e
        })
    }

    _handleSelectCircle = circle => {
        this.setState({
            circleListIsOpen: false,
        });
        this.props.handleSelectCircle(circle)
    }

    _handleUserClicked = user => {
        this.props.handleUserClicked(user)
    }

    _handleSelectAll = () => {
        this.props.handleSelectAll()
    }
  
    render() {
        const { me, closeModal } = this.props;

        return(
            <Modal
                isOpen={this.props.modalIsOpen}
                onRequestClose={closeModal}
                style={modalStyles}
                contentLabel={localizations.circle_addMember}
            >
                <div style={styles.modalContent}>
                    <div style={styles.modalHeader}>
                        <div style={styles.modalTitle}>{localizations.circle_addMember}</div>
                        <div style={styles.modalClose} onClick={closeModal}>
                            <i className="fa fa-times fa-2x" />
                        </div>
                    </div>
                    
                    {this.state.inviteFromCirclesFromOtherTeams
                    ? <div>
                        <div style={{position:'relative', marginBottom: 20}} ref={node => { this._containerCircleNode = node; }}>
                            <SelectCircle
                                label={localizations.circle_select}
                                list={me.circlesFromClub.edges.filter(el => el.node.memberCount > 0).map(el => el.node)}
                                value={this.props.selectedCircle
                                    ? this.props.selectedCircle.name + ' ' + localizations.circle_owner + ' ' + this.props.selectedCircle.owner.pseudo
                                    : null}
                                onClick={() => this.setState({circleListIsOpen: !this.state.circleListIsOpen})}
                                onClose={() => setTimeout(() => this.setState({circleListIsOpen: false}),20)}
                                onChange={(el) => {this._handleSelectCircle(el); setTimeout(() => this.setState({circleListIsOpen: false}),20)}}
                                placeholder={localizations.circle_select}
                                term={this.props.selectedCircle
                                    ? this.props.selectedCircle.name + ' ' + localizations.circle_owner + ' ' + this.props.selectedCircle.owner.pseudo
                                    : localizations.circle_select} 
                            />
                        </div>
                        
                        <div style={{position:'relative'}} ref={node => { this._containerMembersNode = node; }}>
                            <InputText 
                                isError={this.props.isError}
                                label={localizations.circle_members}
                                value={this.props.selectedUserList.length > 0 
                                ? this.props.selectedUserList.length > 1
                                    ? this.props.selectedUserList.length + ' ' + localizations.circle_members_selected
                                    : this.props.selectedUserList.length + ' ' + localizations.circle_member_selected
                                : localizations.circle_members 
                                }
                                placeholder={localizations.circle_select}
                                onClick={() => this.setState({membersFromCirclesListIsOpen: !this.state.membersFromCirclesListIsOpen})}
                                disabled={!this.props.selectedCircle}
                            />
                            {this.state.membersFromCirclesListIsOpen && 
                                <div style={modalStyles.dropdown} >
                                    <ul style={modalStyles.list}>
                                        <li 
                                            key={"0"}
                                            style={modalStyles.listItem}
                                            onClick={this._handleSelectAll}
                                        >
                                            {this.props.selectedCircle.members.length === this.props.selectedUserList.length
                                            ? localizations.unselectAll
                                            : localizations.selectAll
                                            }

                                            <input 
                                                style={styles.checkBox} 
                                                type='checkbox' 
                                                onChange={this._handleSelectAll}
                                                checked={this.props.selectedCircle.members.length === this.props.selectedUserList.length}
                                            />
                                        
                                        </li>

                                        {this.props.selectedCircle.members && this.props.selectedCircle.members.map((el, index) => (
                                            <li 
                                                key={index}
                                                style={this.props.selectedUserList.indexOf(el.id) >= 0 ? modalStyles.listItemBold : modalStyles.listItem}
                                                onClick={() => this._handleUserClicked(el)}
                                            >
                                                {el.pseudo}
                                                <input 
                                                    style={styles.checkBox} 
                                                    type='checkbox' 
                                                    onChange={() => {}}
                                                    checked={this.props.selectedUserList.indexOf(el.id) >= 0}
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            }
                        </div>
                    </div>
                    : <div style={{position:'relative'}} ref={node => { this._containerNode = node; }}>
                        <InputText 
                            isError={this.props.isError}
                            label={localizations.circle_pseudo}
                            value={this.props.user && this.props.user.pseudo}
                            placeholder={localizations.circle_pseudo}
                            onChange={this._handleInputChange} 
                        />

                        {this.state.autocompletionListIsOpen && this.props.viewer && this.props.viewer.users && this.props.viewer.users.edges.length > 0 && 
                            <div style={modalStyles.dropdown} >
                                <ul style={modalStyles.list}>
                                {
                                    this.props.viewer.users.edges.map((el, index) => {
                                        return (<li 
                                        key={index}
                                        style={modalStyles.listItem}
                                        onClick={() => this._handleAutocompleteClicked(el.node)}
                                        >
                                        {el.node.pseudo}
                                        </li>)
                                    })
                                }
                                </ul>
                            </div>
                        }
                    </div>
                    }
                    
                    {me && me.circlesFromClub && me.circlesFromClub.edges && me.circlesFromClub.edges.filter(el => el.node.memberCount > 0).length > 0 && 
                    <div style={styles.row}>
                        <label style={styles.label}>
                            {localizations.newSportunity_seeCirclesFromOtherTeams}
                        </label>
                        <Switch
                            checked={this.state.inviteFromCirclesFromOtherTeams}
                            onChange={(e) => this._switchInviteCirclesFromOtherTeams(e)}
                        />
                    </div>
                    }
                    <Submit  
                        onClose={closeModal} 
                        buttonLabel={localizations.circle_add}
                        {...this.props}
                        viewer={this.props.viewer}
                        inviteFromCirclesFromOtherTeams={this.state.inviteFromCirclesFromOtherTeams}
                        selectedUserList={this.props.selectedUserList}
                        checkUserExistence={this.checkUserExistence}
                    />
                </div>
            </Modal>
        )
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
    zIndex: 201
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
    overflow                   : 'visible',
    WebkitOverflowScrolling    : 'touch',
    borderRadius               : '4px',
    outline                    : 'none',
    padding                    : '20px',
  },
  dropdown: {
    position: 'absolute',
    top: 50,
    left: 0,
    width: '100%',
    maxHeight: 300,

    backgroundColor: colors.white,

    boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
    border: '2px solid rgba(94,159,223,0.83)',
    padding: 20,

    overflowY: 'scroll',
    overflowX: 'hidden',

    zIndex: 100,
  },
  list: {},

  listItem: {
    paddingTop: 10,
    paddingBottom: 10,
    color: '#515151',
    fontSize: 20,
    fontWeight: 500,
    fontFamily: 'Lato',
		borderBottomWidth: 1,
		borderColor: colors.blue,
		borderStyle: 'solid',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  listItemBold: {
    paddingTop: 10,
    paddingBottom: 10,
    color: '#515151',
    fontSize: 20,
    fontWeight: 500,
    fontFamily: 'Lato',
		borderBottomWidth: 1,
		borderColor: colors.blue,
		borderStyle: 'solid',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontWeight: 'bold'
  }
}

styles = {
  button: {
    fontFamily: 'Lato',
    fontSize: 18,
    color: colors.blue,
    cursor: 'pointer',
    textAlign: 'left',
    padding: '0 15px',
    position: 'relative'
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
		fontSize:24,
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
  row: {
    display: 'flex',
		flexDirection: 'row',
    alignItems: 'flex-center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  label: {
    fontFamily: 'Lato',
    fontSize: 18,
    color: colors.blue,
  },
  checkBox: {
    cursor: 'pointer',
    height: 14,
    width: 14
  }
}

export default createRefetchContainer(AddMemberModal, {
// OK
  viewer: graphql`
    fragment AddMemberModal_viewer on Viewer @argumentDefinitions (
        pseudo: {type: "String", defaultValue: "_"}
        email: {type: "String", defaultValue: "_"}
        pseudo_autocomplete: {type: "String", defaultValue: "_"}
        userType: {type: "UserProfileType", defaultValue: null}
        autocompletion_required: {type: "Boolean!", defaultValue: false}
        ){
      me {
        id
      }
      userExists (pseudo: $pseudo, email: $email, userType: $userType) 
      users (pseudo: $pseudo_autocomplete, first: 10, userType: $userType) @include(if: $autocompletion_required) {
        edges {
          node {
            id
            pseudo
          }
        }
      }
    }
  `,
},
graphql`
query AddMemberModalRefetchQuery(
    $pseudo: String
    $email: String
    $pseudo_autocomplete: String
    $userType: UserProfileType
    $autocompletion_required: Boolean!
) {
viewer {
    ...AddMemberModal_viewer
    @arguments(
        pseudo: $pseudo
        email: $email
        pseudo_autocomplete: $pseudo_autocomplete
        userType: $userType
        autocompletion_required: $autocompletion_required
    )
}
}
`,
);
