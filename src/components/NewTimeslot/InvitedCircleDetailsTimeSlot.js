import React, { Component } from 'react'
import {
    createRefetchContainer,
    graphql,
} from 'react-relay/compat';
import Radium, { Style } from 'radium';
// import Modal from 'react-modal'

import { colors, fonts } from '../../theme'

import InputText from '../common/Inputs/InputText'
import InputSelect from '../common/Inputs/InputSelect'

import NotificationToInvitees from './NotificationToInvitees'
import CircleAutoParticipate from './CircleAutoParticipate';
import AddMemberModal from '../Circle/AddMemberModal';
import AddChildModal from '../Circle/AddChildModal'
import AddUserModal from '../NewSportunity/AddUserModal'

import localizations from '../Localizations'
import CircleMutation from "../Circle/AddCircleMemberMutation";
import AddMembersMutation from "../Circle/AddMembersMutation";
import { withAlert } from 'react-alert'
import Switch from "../common/Switch";

let styles
let modalStyles

const CircleMember = ({ member }) => (
    <div style={styles.memberContainer}>
        <div style={{ ...styles.avatar, backgroundImage: `url(${member.avatar})` }} />
        {member.pseudo}
    </div>
)

class InvitedCircleDetailsTimeSlot extends Component {

    constructor(props) {
        super(props)
        this.alertOptions = {
            offset: 60,
            position: 'top right',
            theme: 'light',
            transition: 'fade',
        };
        this.state = {
            addMemberModalIsOpen: false,
            addMember: null,
            addChildModalIsOpen: false,
            addChild: null,
            parent1: null,
            parent2: null,
            visibility: "",
            multibooking: "",
            showtooltip1:false,
            showtooltip2:false
        }
    }

    openAddMemberModal = () => {
        this.props.relay.refetch(fragmentVariables => ({
            ...fragmentVariables,
            queryCircles: true
        }),
            null,
            () => {
                setTimeout(() => this.setState({ addMemberModalIsOpen: true }), 50)
            })
        // this.setState({
        //     addMemberModalIsOpen: true
        // })
    }

    closeAddMemberModal = () => {
        this.setState({
            addMemberModalIsOpen: false,
            addMember: null
        })
    }

    openAddChildModal = () => {
        this.setState({
            addChildModalIsOpen: true
        })
    }

    closeAddChildModal = () => {
        this.setState({
            addChildModalIsOpen: false,
            addChild: null,
            parent1: null,
            parent2: null
        })
    }

    _handleNewMemberChange = e => {
    }


    isValidEmailAddress(address) {
        let re = /^[a-z0-9][a-z0-9-_\.]+@([a-z]|[a-z0-9]?[a-z0-9-]+[a-z0-9])\.[a-z0-9]{2,10}(?:\.[a-z]{2,10})?$/;
        return re.test(address)
    }

    _submitUpdate = (state) => {
        //this._changeLoadingStatus(true);
        const viewer = this.props.viewer;
        const userIDVar = this.props.viewer.id;
        const idVar = this.props.circleDetails.id;

        if (state.selectedUserList && state.selectedUserList.length > 0) {
            const newUsersVar = state.selectedUserList;

            AddMembersMutation.commit({
                viewer,
                userIDVar,
                idVar,
                newUsersVar,
                circle: this.props.circleDetails
            },
                {
                    onFailure: error => {
                        this.props.alert.show(error.getError().source.errors[0].message, {
                            timeout: 2000,
                            type: 'error',
                        });
                        this.setState({ isLoading: false })

                    },
                    onSuccess: (response) => {
                        this.props.alert.show(localizations.popup_editCircle_update_success, {
                            timeout: 2000,
                            type: 'success',
                        });

                        setTimeout(() => {
                            this.setState({ isLoading: false })
                        }, 1500);
                    },
                }
            )
        }
        else if (state.selectedUser) {
            const nameVar = state.selectedUser.pseudo
            const newUserIdVar = state.selectedUser.id;

            let isEmail = this.isValidEmailAddress(nameVar);

            CircleMutation.commit({
                viewer,
                userIDVar,
                idVar,
                nameVar: state.selectedUser.id ? null : !isEmail ? nameVar : '',
                emailVar: state.selectedUser.id ? null : isEmail ? nameVar : '',
                newUserIdVar: state.selectedUser.id ? newUserIdVar : null,
                circle: this.props.circleDetails
            },
                {
                    onFailure: error => {
                        this.props.alert.show(error.getError().source.errors[0].message, {
                            timeout: 2000,
                            type: 'error',
                        });
                        this.setState({ isLoading: false })

                    },
                    onSuccess: (response) => {
                        console.log(response);
                        this.props.alert.show(localizations.popup_editCircle_update_success, {
                            timeout: 2000,
                            type: 'success',
                        });
                        setTimeout(() => {
                            this.setState({ isLoading: false })
                        }, 1500);
                    },
                }
            )
        }
    }

    _handleAddUser = e => {
        this._submitUpdate(e)
    };

    _handleAutocompleteClicked = e => {
        console.log(e);
        this.setState({
            addMember: e
        })
    }

    _handleNewChildChange = e => {
        this.setState({
            addChild: e
        })
    }

    onParent1Change = e => {
        this.setState({
            parent1: e
        })
    }

    onParent2Change = e => {
        this.setState({
            parent2: e
        })
    }


    handleNotificationTypeChange = e => {
        this.props._handleChangeInvitedCircleNotificationPreference(this.props.selectedCircle, e);
    }


    handleTimeVisibilityChange = e => {
        this.setState({
            visibility: e.target.value
        })

        this.props._handleChangeInvitedCircleVisibility(this.props.selectedCircle, e);
    }

    handleMultiBookingChange = e => {
        this.setState({
            multibooking: e.target.value
        })
        this.props._handleChangeInvitedCirclemultiBooking(this.props.selectedCircle, e);
    }

    hoverme=()=>{
        console.log("show tool")
        this.setState({showtooltip1:true})
    }
    hoverout=()=>{
        console.log("show tool")
        this.setState({showtooltip1:false})
    }
    hoverme2=()=>{
        console.log("show tool")
        this.setState({showtooltip2:true})
    }
    hoverout2=()=>{
        console.log("show tool")
        this.setState({showtooltip2:false})
    }
   


    render() {

        const { viewer, user, isModalOpen, selectedCircle, onChangeCircleAutoParticipate, onChangeUserAutoParticipate, onChangeCirclePrice, circleDetails, circle } = this.props;
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
        ];

        let allMemberParticipate = true;
        let nbInactiveStatus = 0;
        let memberStatusList = [];

        if (circleDetails)
            circleDetails.memberStatus.forEach(status => {
                if (circleDetails.members.findIndex(member => member.id === status.member.id) >= 0) {
                    let index = memberStatusList.findIndex(tmpStatus => tmpStatus.member.id === status.member.id)
                    if (index < 0) {
                        memberStatusList.push(status)
                    }
                    else if (memberStatusList[index].starting_date < status.starting_date)
                        memberStatusList[index] = status
                }
            });
        if (selectedCircle && selectedCircle.excludedParticipantByDefault && selectedCircle.excludedParticipantByDefault) {
            memberStatusList.forEach(member => {
                if (member.status && member.status !== 'ACTIVE') {
                    nbInactiveStatus++;
                    allMemberParticipate = allMemberParticipate && (selectedCircle.excludedParticipantByDefault.excludedMembers.findIndex(excludedMember => excludedMember.id === member.member.id) >= 0)
                }
            })
            allMemberParticipate = allMemberParticipate && selectedCircle.excludedParticipantByDefault.excludedMembers.length === nbInactiveStatus
        }

        return (
            <div>
                <AddUserModal
                    isOpen={this.state.addMemberModalIsOpen}
                    viewer={this.props.viewer}
                    canCloseModal={true}
                    title={localizations.event_addParticipant}
                    message={''}
                    cancelLabel={localizations.info_cancel}
                    confirmLabel={localizations.info_update}
                    circleList={this.props.viewer.me && this.props.viewer.me.circles && this.props.viewer.me.circles.edges.map(edge => edge.node).filter(c => c.type === 'CHILDREN' || c.type === 'ADULTS') || []}
                    circlesFromClub={this.props.viewer.me && this.props.user.circlesFromClub && this.props.user.circlesFromClub.edges.filter(el => el.node.memberCount > 0 && (el.node.type === 'CHILDREN' || el.node.type === 'ADULTS')).map(edge => edge.node) || []}
                    onCancel={() => { this.closeAddMemberModal() }}
                    onConfirm={(values) => this._handleAddUser(values)}
                    ignoredUserList={() => this.props.itemList}
                    user={user}
                />
                <AddChildModal
                    viewer={viewer}
                    inviteFromCirclesFromOtherTeams={false}
                    modalIsOpen={this.state.addChildModalIsOpen}
                    closeModal={this.closeAddChildModal}
                    onChange={this._handleNewChildChange}
                    handleAutocompleteClicked={this._handleAutocompleteClicked}
                    isLoggedIn={user && user.id ? true : false}
                    user={this.state.addMember}
                    onErrorChange={() => console.log("object")}
                    circle={selectedCircle ? selectedCircle.circle : null}
                    circleId={selectedCircle ? selectedCircle.circle.id : null}
                    user={this.state.addChild}
                    parent1={this.state.parent1}
                    parent2={this.state.parent2}
                    onParent1Change={this.onParent1Change}
                    onParent2Change={this.onParent2Change}
                />

                {selectedCircle && selectedCircle.circle &&
                    <div style={styles.modalContainer}>
                        <div style={styles.modalHeader}>
                            <div style={styles.modalTitle}>
                                {localizations.newSportunity_circle_show_details}
                            </div>

                            <div style={styles.circleNameContainer}>
                                <div style={styles.circleName}>
                                    <div style={styles.buttonIcon}>
                                        <img src="/images/Group.svg" height="40px" />
                                        <div style={styles.numberContainer}>
                                            <span style={styles.number}>
                                                {selectedCircle.circle.memberCount}
                                            </span>
                                        </div>
                                    </div>
                                    {selectedCircle.circle.name}
                                </div>
                                <div style={styles.ownerName}>
                                    {selectedCircle.circle.owner
                                        ? selectedCircle.circle.owner.pseudo
                                        : user.pseudo
                                    }
                                </div>
                            </div>
                        </div>

                        <div style={styles.modalContent}>
                            <NotificationToInvitees
                                notificationType={this.props.fields.notificationType}
                                notificationAutoXDaysBefore={this.props.fields.notificationAutoXDaysBefore}
                                _handleNotificationTypeChange={this.handleNotificationTypeChange}
                                _handleNotificationAutoXDaysBeforeChange={this.props._handleNotificationAutoXDaysBeforeChange}
                                rowed={true}
                            />
                            <div style={styles.row}>
                            <Style
                        scopeSelector=".hoverme"
                        rules={{
                            width: '8px',
                            height:'8px',
                            display:'inline-flex',
                            backgroundColor:'#5EA1D9',
                            border:'1px solid #ccc',
                            borderRadius:'100%',
                            marginTop:'-20px',
                            
                          
                        }}
                      />
                                <div style={styles.inputGroup}>
                                    <label style={styles.slotlabel}>{localizations.newSportunity_timevisibility}:</label>
                                    
                                    <input
                                        type="text"
                                        maxLength="5"
                                        value={this.state.visibility}
                                        onChange={this.handleTimeVisibilityChange}
                                        style={{ width: 80,textAlign: 'center', backgroundColor: '#F2F2F2', border: 'none', height: '26px', borderRadius: '3px', }}
                                    />
                                    <div className="hoverme" onMouseEnter={this.hoverme} onMouseLeave={this.hoverout}></div> {this.state.showtooltip1?<span style={styles.hoverspan}>Setup the number of days that the group can see the timeslot</span>:null}
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.slotlabel}>{localizations.newSportunity_multibookinglimitations}:</label>
                                    <input
                                        type="text"
                                        maxLength="5"
                                        value={this.state.multibooking}
                                        onChange={this.handleMultiBookingChange}
                                        style={{ width: 80, textAlign: 'center', backgroundColor: '#F2F2F2', border: 'none', height: '26px', borderRadius: '3px', }}
                                    />
                                    <div className="hoverme" onMouseEnter={this.hoverme2} onMouseLeave={this.hoverout2}></div> {this.state.showtooltip2?<span style={styles.hoverspan}>Setup the maximum simultaneous booking that this group can do</span>:null}

                                </div>
                            </div>
                        </div>
                    </div>
                }
            </div>
        );
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
        zIndex: 201
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
        overflow: 'visible',
        WebkitOverflowScrolling: 'touch',
        borderRadius: '4px',
        outline: 'none',
        padding: 0
    },
}

styles = {
    modalContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        width: 700,
        fontFamily: 'Lato',
        '@media (max-width: 400px)': {
            width: 320,
        }
    },
    modalHeader: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-center',
        justifyContent: 'space-between',
        padding: '20px',
        borderBottom: '1px solid ' + colors.lightGray
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: fonts.weight.medium,
        color: colors.blue,
        flex: 2,
    },
    circleNameContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        flex: 5
    },
    circleName: {
        fontSize: 26,
        color: colors.blue,
        fontWeight: fonts.weight.medium,
        marginBottom: 10,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    ownerName: {
        fontSize: 22,
        color: colors.gray,
    },
    circleInfoContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 3,
        fontSize: 16,
        color: colors.darkGray
    },
    modalClose: {
        justifyContent: 'flex-center',
        color: colors.red,
        cursor: 'pointer',
        textAlign: 'right',
        flex: 1
    },
    modalContent: {
        padding: 20,
        borderBottom: '1px solid ' + colors.lightGray
    },
    buttonIcon: {
        color: colors.blue,
        position: 'relative',
        flex: 1,
        color: '#333',
        marginRight: 10
    },
    numberContainer: {
        position: 'absolute',
        top: '2px',
        left: '6px',
        width: 30,
        textAlign: 'center'
    },
    number: {
        fontSize: 19,
        fontWeight: 'bold'
    },
    label: {
        display: 'block',
        color: colors.blueLight,
        fontSize: 16,
        lineHeight: 1,
        marginBottom: 8,
        marginTop: 13,
    },
    circlePrice: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 16,
        fontFamily: 'Lato',
        color: colors.gray,
        width: '60%'
    },
    price: {
        height: 35,
        width: 60,
        marginRight: 15,
        border: '2px solid #5E9FDF',
        borderRadius: 3,
        textAlign: 'center',
        fontSize: 16,
        fontFamily: 18,
        lineHeight: 1,
        color: 'rgba(146,146,146,0.87)',
    },
    modalFooter: {
        marginRight: 15,
        marginTop: 10
    },
    footerTitle: {
        marginBottom: 15,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '60%'
    },
    addMemberContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        color: colors.blue,
        cursor: 'pointer',
        fontSize: 14
    },
    addButton: {
        textAlign: 'center',
        justifyContent: 'flex-center',
        color: colors.darkGray,
        backgroundColor: colors.lightGray,
        cursor: 'pointer',
        marginRight: 10,
        lineHeight: '46px',
        width: 35,
        height: 35,
        borderRadius: 20,
        fontSize: 12
    },

    memberContainer: {
        border: '1px solid ' + colors.gray,
        borderRadius: 1,
        marginBottom: 3,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: '5px 12px',
        fontWeight: 'bold',
        fontSize: 15,
        color: colors.gray,
        boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
    },

    caseContainer: {
        border: '1px solid ' + colors.gray,
        borderRadius: 1,
        marginBottom: 3,
        width: '100%',
        height: 51,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '5px 12px',
        fontWeight: 'bold',
        fontSize: 15,
        color: colors.gray,
        boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
    },
    titleCaseContainer: {
        border: '1px solid ' + colors.gray,
        borderRadius: 1,
        marginBottom: 3,
        width: '100%',
        height: 51,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '5px 12px',
        fontSize: 15,
        color: colors.darkBlue,
        boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
    },
    subTitleCaseContainer: {
        border: '1px solid ' + colors.gray,
        borderRadius: 1,
        marginBottom: 3,
        width: '100%',
        height: 51,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '5px 12px',
        fontWeight: 'bold',
        fontSize: 15,
        color: colors.darkBlue,
        boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
        '@media (max-width: 400px)': {
            height: 100,
        }
    },
    avatar: {
        width: 39,
        height: 39,
        marginRight: 10,
        color: colors.blue,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        borderRadius: '50%',
    },
    row: {
        display: 'flex',

        marginBottom: 20,
        flexDirection: 'column'
    },
    inputGroup: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px'
    },
    slotlabel: {
        fontFamily: 'Lato',
        fontSize: '15px',
        lineHeight: 1,
        color: '#646464',
        display: 'block',
        marginRight: 20,
        width: '180px',
    },
    hoverspan:{
        color:'#5EA1D9',
        fontSize:'15px'
    }

}


export default createRefetchContainer(Radium(withAlert(InvitedCircleDetailsTimeSlot)), {
    viewer: graphql`
    fragment InvitedCircleDetailsTimeSlot_viewer on Viewer @argumentDefinitions (
        queryCircles: {type: "Boolean!", defaultValue: false}
    ){
        id
        me {
            id
            circles (last: 30) @include (if: $queryCircles) {
                edges {
                    node {
                        id, 
                        name
                        type
                        owner {
                        id
                        pseudo
                        }
                        members {
                        id
                        pseudo
                        }
                    }
                }
            }
            circlesFromClub(last: 100) @include (if: $queryCircles){
                edges {
                node {
                    id
                    name,
                    type
                    owner {
                    id
                    pseudo
                    }
                    memberCount
                    members {
                    id
                    pseudo, 
                    avatar
                    }
                }
                }
            }
        }
        ...AddUserModal_viewer
        ...AddMemberModal_viewer
        ...AddChildModal_viewer
        }
    `
},
    graphql`query InvitedCircleDetailsTimeSlotRefetchQuery(
    $queryCircles: Boolean!
) {
    viewer {
        ...InvitedCircleDetailsTimeSlot_viewer @arguments(
            queryCircles: $queryCircles
        )
    }
}`
)

