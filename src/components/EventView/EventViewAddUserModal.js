import React from 'react'
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import { withAlert } from 'react-alert'
import { render } from 'react-dom';
import Modal from 'react-modal'
import Loading from 'react-loading';
import { fonts, colors } from '../../theme'
import Radium, {StyleRoot} from 'radium';

import InputCheckbox from '../common/Inputs/InputCheckbox';
import InputSelect from '../common/Inputs/InputSelect'
import InputText from '../common/Inputs/InputText';
import InputUserAutocompleted from '../common/Inputs/InputUserAutocompleted'
import SelectCircle from '../common/Inputs/SelectCircle';
import InputSelectMultiple from '../common/Inputs/InputSelectMultiple';
import Switch from '../common/Switch';
import localizations from '../Localizations'

let styles, modalStyles, cantCloseModalStyles;

class AddUserModal extends React.Component {
    constructor(props) {
      super(props);
      this.alertOptions = {
        offset: 60,
        position: 'top right',
        theme: 'light',
        transition: 'fade',
      };

      this.state = {
          isLoading: false,
          open: false,
          selectedUser: null,
          userPseudo: '',
          userEmail: '', 
          addUserToCircle: false,
          selectedCircleToPutUsersIn: null,          
          displayPseudoInput: false,
          addUserFromMyCircles: false,
          selectedCircle: null,
          selectedUserList: [],
          circleListIsOpen: false,
          membersFromCirclesListIsOpen: false,
          searchInTeams: false
      }
    }

    componentDidMount() {
        if (this.props.isOpen)
            setTimeout(() => {this.setState({open: true})}, 50) 
        if (this.props.user && this.props.circleList && this.props.circleList.length > 0) {
            this.setState({addUserFromMyCircles: true})
        }
        window.addEventListener('keydown', this._handleKeyPress);
    }

    _handleKeyPress = (event) => {
        if (event.key === 'Enter')  {
          this._handleConfirm();
        }
    }
    
    isValidEmailAddress(address) {
        let re = /^[a-z0-9][a-z0-9-_\.]+@([a-z]|[a-z0-9]?[a-z0-9-]+[a-z0-9])\.[a-z0-9]{2,10}(?:\.[a-z]{2,10})?$/;
        return re.test(address.toLowerCase())
    }

    _handleCloseRequest = () => {
        if (this.props.canCloseModal)
            this._closeModal()
    }

    _closeModal = () => {
        this.props.onCancel()
        this.setState({ open: false });
    }

    _handleSelectCircleToPutUsersIn = circle => 
        this.setState({selectedCircleToPutUsersIn: circle})

    _handleSelectCircle = circle => 
        this.setState({selectedCircle: circle, circleListIsOpen: false})

    _handleAddUserToCircle = e => 
        this.setState({addUserToCircle: e.target.checked})    
    

    _handleAutocompleteClicked = user => {
        this.setState({selectedUser: user})
        if (!user.id) this.setState({displayPseudoInput: true})
    }    

    _switchAddUserFromMyCircles = e => 
        this.setState({
            addUserFromMyCircles: e, 
            selectedUser: null,
            userPseudo: '',
            addUserToCircle: false,
            selectedCircleToPutUsersIn: null,          
            displayPseudoInput: false,
            selectedCircle: null,
            selectedUserList: [],
            circleListIsOpen: false,
            membersFromCirclesListIsOpen: false,
            searchInTeams: false
        })

    _switchSearchInTeams = e => 
        this.setState({
            searchInTeams: e,
            selectedCircle: null,
            selectedUserList: [],
            circleListIsOpen: false,
            membersFromCirclesListIsOpen: false,
        })

    _handleUserClicked = user => {
        if (user && typeof user !== 'undefined') {
            let userList = this.state.selectedUserList;
            let index = userList.indexOf(user.id); 
            if (index >= 0)
                userList.splice(index, 1);
            else  
                userList.push(user.id);
        
            this.setState({
                selectedUserList: userList
            })
        }
    }

    _handleSelectAll = () => {
        if (this.state.selectedCircle.members.length === this.state.selectedUserList.length)
            this.setState({
                selectedUserList: []
            })
        else
            this.setState({
                selectedUserList: this.state.selectedCircle.members.map(member => member.id).filter(member => !this.props.ignoredUserList || this.props.ignoredUserList().length === 0 || this.props.ignoredUserList().findIndex(user => user.id === member) < 0)
            })
    }

    _handleConfirm = () => {
        if (this.state.addUserFromMyCircles) {
            if (!this.state.selectedUserList || this.state.selectedUserList.length === 0) {
                this.props.alert.show(localizations.event_addParticipantOrInvited_error, {
                    timeout: 2000,
                    type: 'info',
                });
                return ;   
            }
        }
        else {
            if (!this.state.selectedUser || (!this.state.selectedUser.id && ((this.state.selectedUser.email && !this.state.userPseudo) || (this.state.selectedUser.pseudo && (!this.state.userEmail || !this.isValidEmailAddress(this.state.userEmail) ))))) {
                this.props.alert.show(localizations.event_addParticipantOrInvited_error, {
                    timeout: 2000,
                    type: 'info',
                });
                return ;   
            }
            if (this.state.addUserToCircle && !this.state.selectedCircleToPutUsersIn) {
                this.props.alert.show(localizations.event_addParticipantOrInvited_error, {
                    timeout: 2000,
                    type: 'info',
                });
                return ;
            }
        }
        
        if (this.state.displayPseudoInput) {
            this.setState({isLoading: true})
            if (this.state.userEmail) {
                this.props.relay.refetch(fragmentVariables => ({
                    ...fragmentVariables,
                    email: this.state.userEmail,
                    queryUserExists: true
                }),
                null,
                () => {
                    setTimeout(() => {
                        if (this.props.viewer.userExists) {
                            this.props.alert.show(localizations.popup_registration_user_already_exists, {
                                timeout: 2000,
                                type: 'info',
                            });
                            this.setState({isLoading: false})
                        }
                        else {
                            this.setState({isLoading: true})
                            this.props.onConfirm(this.state); 
                            setTimeout(() => {this.setState({isLoading: false}); this._closeModal()},2500)
                        }
                    }, 500);
                }
                )
            }
            else if (this.state.userPseudo) {
                this.props.relay.refetch(fragmentVariables => ({
                    ...fragmentVariables,
                    pseudo: this.state.userPseudo,
                    queryUserExists: true
                }),
                null,
                () => {
                    setTimeout(() => {
                        if (this.props.viewer.userExists) {
                            this.props.alert.show(localizations.popup_registration_user_already_exists, {
                                timeout: 2000,
                                type: 'info',
                            });
                            this.setState({isLoading: false})
                        }
                        else {
                            this.setState({isLoading: true})
                            this.props.onConfirm(this.state); 
                            setTimeout(() => {this.setState({isLoading: false}); this._closeModal()},2500)
                        }
                    }, 500);
                })
            }
        }
        else {
            this.setState({isLoading: true})
            this.props.onConfirm(this.state); 
            setTimeout(() => {this.setState({isLoading: false}); this._closeModal()},2500)
        }      
    }
    
    onCancel = () => {
        this.props.onCancel();
        this.setState({open: false})
    }

    render() {
        
        return (
            <StyleRoot>
                <div>
                    <Modal
                        isOpen={this.state.open}
                        style={this.props.canCloseModal ? modalStyles : cantCloseModalStyles}
                        contentLabel={this.props.title}
                    >
                        <div style={styles.modalContent}>
                            <div style={styles.modalHeader}>
                                <div style={styles.modalTitle}>{this.props.title}</div>
                                <div style={styles.modalClose} onClick={this._handleCloseRequest}>
                                <i className="fa fa-times fa-2x" />
                                </div>
                            </div>
                            <span style={styles.confirm}>{this.props.message}</span>

                            {this.props.circleList && this.props.circleList.length > 0 &&
                                <div style={{...styles.row, marginRight: 7}}>
                                    <label style={styles.inputLabel}>
                                        {this.state.addUserFromMyCircles ? localizations.event_addParticipantOrInvited_fromCircles : localizations.event_addParticipantOrInvited_notFromCircles}
                                    </label>
                                    <Switch
                                        checked={this.state.addUserFromMyCircles}
                                        onChange={(e) => this._switchAddUserFromMyCircles(e)}
                                    />
                                </div>
                            }

                            {this.state.addUserFromMyCircles 
                            ?   <div>
                                    {this.props.circlesFromClub && this.props.circlesFromClub.length > 0 && 
                                        <div style={{...styles.row, marginRight: 7}}>
                                            <label style={styles.inputLabel}>
                                                {this.state.searchInTeams ? localizations.event_addParticipantOrInvited_fromTeamCircles : localizations.event_addParticipantOrInvited_notFromTeamCircles}
                                            </label>
                                            <Switch
                                                checked={this.state.searchInTeams}
                                                onChange={(e) => this._switchSearchInTeams(e)}
                                            />
                                        </div>
                                    }

                                    <div style={{position:'relative'}} ref={node => { this._containerCircleNode = node; }}>
                                        <SelectCircle
                                            label={localizations.circle_select}
                                            list={(this.state.searchInTeams ? this.props.circlesFromClub : this.props.circleList)}
                                            value={this.state.selectedCircle}
                                            onChange={this._handleSelectCircle}
                                            placeholder={localizations.circle_select}
                                            term={this.state.selectedCircle
                                                ? this.state.selectedCircle.name
                                                : localizations.circle_select} 
                                            allowAutocompletion={false}
                                        />
                                    </div>

                                    <div style={{marginBottom: 15}}/>

                                    <div style={{position:'relative'}} ref={node => { this._containerMembersNode = node; }}>
                                        <InputSelectMultiple
                                            list={this.state.selectedCircle && 
                                                    this.state.selectedCircle.members && 
                                                    this.state.selectedCircle.members
                                                        .filter(member => !this.props.ignoredUserList || this.props.ignoredUserList().length === 0 || this.props.ignoredUserList().findIndex(user => user.id === member.id) < 0)
                                                        .map(user => ({name: user.pseudo, id: user.id}))
                                                }
                                            values={this.state.selectedUserList.map(item => ({id: item}))}
                                            term={this.state.selectedUserList.length > 0 
                                                ? this.state.selectedUserList.length > 1
                                                    ? this.state.selectedUserList.length + ' ' + localizations.circle_members_selected
                                                    : this.state.selectedUserList.length + ' ' + localizations.circle_member_selected
                                                : localizations.circle_members }
                                            onChange={this._handleUserClicked}
                                            disabled={!this.state.selectedCircle}
                                            label={localizations.circle_members}
                                            allowSelectAll={true}
                                            onSelectAll={this._handleSelectAll}
                                            isAllSelected={this.state.selectedCircle && this.state.selectedCircle.members.filter(member => !this.props.ignoredUserList || this.props.ignoredUserList().length === 0 || this.props.ignoredUserList().findIndex(user => user.id === member.id) < 0).length === this.state.selectedUserList.length}
                                        />
                                    </div>
                                </div>
                            :   <div>
                                    <InputUserAutocompleted 
                                        viewer={this.props.viewer}
                                        handleAutocompleteClicked={this._handleAutocompleteClicked}
                                        label={localizations.circle_pseudo}
                                        ignoredUserList={this.props.ignoredUserList}
                                        userType={'PERSON'}
                                    />

                                    <div style={{marginBottom: 15}}/>

                                    {this.state.displayPseudoInput &&
                                        <div style={{marginBottom: 15}}>
                                            {this.state.selectedUser.email 
                                            ?   <InputText
                                                    label={localizations.event_addParticipantOrInvited_unknown}
                                                    placeholder={localizations.profile_pseudo}
                                                    value={this.state.userPseudo}
                                                    onChange={e => this.setState({userPseudo: e.target.value})}
                                                    maxLength={30}
                                                />
                                            :   <InputText
                                                    label={localizations.event_addParticipantOrInvited_unknown_email}
                                                    placeholder={"Email"}
                                                    value={this.state.userEmail}
                                                    onChange={e => this.setState({userEmail: e.target.value})}
                                                    maxLength={30}
                                                />
                                            }
                                        </div>
                                    }
                                    
                                    {this.props.userCircles && this.props.userCircles.length > 0 && 
                                        <div style={styles.row}>
                                            <label style={styles.inputLabel}>
                                                {localizations.event_addParticipantOrInvited_to_circle}
                                            </label>
                                            <InputCheckbox 
                                                checked={this.state.addUserToCircle}
                                                onChange={this._handleAddUserToCircle}
                                                isDisabled={false}
                                            />
                                        </div>
                                    }

                                    {this.state.addUserToCircle && 
                                        <InputSelect
                                            isDisabled={false}
                                            list={this.props.userCircles}
                                            onSelectItem={this._handleSelectCircleToPutUsersIn}
                                            selectedItem={this.state.selectedCircleToPutUsersIn}
                                            label={localizations.circle_select}
                                        />
                                    }
                                </div>
                            }

                            {this.state.isLoading
                            ?   <div style={styles.loadingContainer}><Loading type='cylon' color={colors.blue}/></div>
                            :
                                <div style={styles.buttonRow}>
                                    {this.props.cancelLabel 
                                        ? <button onClick={this.onCancel} style={styles.redButton}>{this.props.cancelLabel}</button>
                                        : <span></span>
                                    }
                                    <button onClick={this._handleConfirm} style={styles.greenButton}>{this.props.confirmLabel}</button>
                                </div>
                            }
                        </div>
                    
                    </Modal>
                </div>
            </StyleRoot>
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
        zIndex: 101
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
        maxHeight: 200,
    
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

cantCloseModalStyles = {
  overlay : {
    position          : 'fixed',
    top               : 0,
    left              : 0,
    right             : 0,
    bottom            : 0,
    backgroundColor   : 'rgba(255, 255, 255, 0.9)',
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

styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        flexGrow: 1,
        justifyContent: 'space-between',
        fontFamily: 'Lato',
        lineHeight: 1,
        '@media (max-width: 500px)': {
            display: 'block',
        }
    },
    modalContent: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        width: 400,
        '@media (max-width: 400px)': {
            width: 320,
        }
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
        flex: '2 0 0',
    },
    modalClose: {
        justifyContent: 'flex-center',
        color: colors.gray,
        cursor: 'pointer',
    },
    buttonRow: {
        display: 'flex',
        justifyContent: 'space-between'
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center'
    },
    greenButton: {
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
        padding: '10px 20px'
    },
    redButton: {
		backgroundColor: colors.redGoogle,
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
        padding: '10px 20px'
    },
    confirm: {
        color: colors.black,
        fontSize: 16,
        fontFamily: 'Lato',
        marginTop:20,
        marginBottom: 15,
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 7
    },
    inputLabel: {
        color: colors.black,
        fontSize: 18,
        fontFamily: 'Lato',
        flex: '2 0 0',
        marginBottom: 12,
    },
};

export default createRefetchContainer(Radium(withAlert(AddUserModal)), {
// OK
  viewer: graphql`
    fragment EventViewAddUserModal_viewer on Viewer @argumentDefinitions (
        pseudo: {type: "String", defaultValue: null}
        email: {type: "String", defaultValue: null}
        queryUserExists: {type: "Boolean!", defaultValue: false}
        ){
      id
      userExists (pseudo: $pseudo, email: $email) @include (if: $queryUserExists)
      ...InputUserAutocompleted_viewer
    }`
},
graphql`
query EventViewAddUserModalRefetchQuery(
    $pseudo: String
    $email: String
    $queryUserExists: Boolean!
) {
viewer {
    ...EventViewAddUserModal_viewer
    @arguments(
      pseudo: $pseudo
      email: $email
      queryUserExists: $queryUserExists
    )
}
}
`,
)
