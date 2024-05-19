import React from 'react';
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import Radium, {StyleRoot} from 'radium'
import { colors, fonts } from '../../theme';
import Modal from 'react-modal'

import Input from '../NewSportunity/Input';
import localizations from '../Localizations'
import InputCheckbox from '../common/Inputs/InputCheckbox';


let styles, modalStyles, cantCloseModalStyles;

class FindOrganizerModal extends React.Component {

    state = {
        assistantTypeDropdownOpen: false,
        selectAssistantType: null,
        assistantListPageNumber: 0,
        userListPageNumber: 0,
        inputContent: '',
        selectACircleSwitch: true,
        selectACircleMember: false,
        selectedCircleList: [],
        communitySelectedCircle: null
    }

    componentDidMount() {
        window.addEventListener('click', this._handleClickOutside);
        this.props.relay.refetch(fragmentVariables => ({
            ...fragmentVariables, 
            queryCircles: true
        }));
        if (this.props.sport && this.props.sport.id)
            this.props.relay.refetch(fragmentVariables => ({
                ...fragmentVariables,
                query: true,
                sportId: this.props.sport.id
            }))
    }

    componentWillUnmount() {
        window.removeEventListener('click', this._handleClickOutside);
    }

    componentWillReceiveProps = (nextProps) => {
        if (nextProps.sport && nextProps.sport.id && (!this.props.sport || (this.props.sport.id && this.props.sport.id !== nextProps.sport.id)))
            this.props.relay.refetch(fragmentVariables => ({
                ...fragmentVariables,
                query: true,
                sportId: nextProps.sport.id
            }))
    }

    _handleClickOutside = event => {
        if (!this._inputNode.contains(event.target)) {
            if (this.state.assistantTypeDropdownOpen)
                this.setState({assistantTypeDropdownOpen: false});
        }
    }   

    _closeModal = () => {
        this.props.closeModal()
    }

    _handleChangeAssistantType = (assistantType) => {
        this.props.relay.refetch(fragmentVariables => ({
            ...fragmentVariables,
            assistantTypeId: assistantType.id
        }))
        this.setState({
            assistantListPageNumber: 0,
            assistantTypeDropdownOpen: false,
            selectAssistantType: assistantType.name[localizations.getLanguage().toUpperCase()]
        })
    }

    _loadNextAssistants = () => {
        this.setState({assistantListPageNumber: this.state.assistantListPageNumber + 1})
    }

    _loadPreviousAssistants = () => {
        this.setState({assistantListPageNumber: this.state.assistantListPageNumber - 1})
    }

    _loadNextUsers = () => {
        this.setState({userListPageNumber: this.state.userListPageNumber + 1})
    }

    _loadPreviousUsers = () => {
        this.setState({userListPageNumber: this.state.userListPageNumber - 1})
    }

    _handleChooseAssistant = (assistant, sport) => {
        this.props.addOrganizer(assistant, sport)
    }

    _handleInputChange = (event) => {
        this.setState({
            inputContent: event.target.value,
            userListPageNumber: 0
        })

        if (event.target.value.length >= 3 && this.props.isLoggedIn) {
            this.props.relay.refetch(fragmentVariables => ({
                ...fragmentVariables,
                listAssistantByName: true,
                listAssistantByNameValue: event.target.value
            }))
        }
        else {
            this.props.relay.refetch(fragmentVariables => ({
                ...fragmentVariables,
                listAssistantByName: false,
                listAssistantByNameValue: '_'
            }))
        }
    }

    _handleSelectCircle = (circle) => {
        let newList = this.state.selectedCircleList;
        let index = newList.findIndex(i => i.id === circle.id);
        if (index >= 0) {
            newList.splice(index, 1);
        }
        else {
            newList.push(circle)
        }

        this.setState({selectedCircleList: newList})
    }

    _handleOpenCircle = (circle) => {
        this.props.relay.refetch(fragmentVariables => ({
            ...fragmentVariables,
            circleId: circle.id,
            queryCircle: true
        }))
        this.setState({
            communitySelectedCircle: circle
        })
    }
    _handleCloseCircle = () => {
        this.setState({
            communitySelectedCircle: null
        })
    }

    _renderSportInformation = (userSports, selectedSport) => {
        if (!selectedSport)
            return null;
        let userSport ;
        userSports.forEach(item => {
            if (item.sport.id === selectedSport.id)
                userSport = item
        });
        if (userSport)
            return (
                <div style={styles.sportInfo}>
                    <span style={styles.roles}>
                        {userSport.assistantType.map(item => item.name[localizations.getLanguage().toUpperCase()]).join(', ')}
                    </span>
                    <img style={styles.sportLogo} src={userSport.sport.logo}/>
                </div>
            )
        else return null
    }

    validateCircleSelection = () => {
        if (this.state.selectedCircleList.length > 0)
            this.props.addCirclesOfPendingOrganizers(this.state.selectedCircleList);

    }

    render() {
        const { openedModal, viewer, sport, user } = this.props;
        const { assistantTypeDropdownOpen, selectAssistantType, assistantListPageNumber, userListPageNumber } = this.state;

        let circleList = []; 
        if (user.circles && user.circles.edges && user.circles.edges.length > 0)
            circleList = circleList.concat(user.circles.edges);
        if (user.circlesFromClub && user.circlesFromClub.edges && user.circlesFromClub.edges.length > 0)
            circleList = circleList.concat(user.circlesFromClub.edges)
        
        circleList = circleList.filter(c => c.node.type !== 'TEAMS' && c.node.type !== 'CLUBS')

        return (
            <StyleRoot>
                <div ref={node => { this._containerNode = node; }}>
                    <Modal
                        isOpen={this.props.isOpen}
                        onRequestClose={this._closeModal}
                        style={modalStyles}
                        contentLabel={localizations.newSportunity_addOrganizersModal}
                    >
                        <div style={styles.modalContent}>
                            <div style={styles.modalHeader}>
                                <div style={styles.modalTitle}>
                                    {openedModal === 1 
                                        ? localizations.newSportunity_organizerFind
                                        : openedModal === 2
                                            ?   localizations.newSportunity_organizerSelect
                                            :   openedModal === 3
                                                ?   localizations.newSportunity_organizerSelectCommunity
                                                :   localizations.newSportunity_organizerSelectCircles
                                    }
                                </div>
                                <div style={styles.modalClose} onClick={this._closeModal}>
                                <i className="fa fa-times fa-2x" />
                                </div>
                            </div>
                            
                            {openedModal === 1 
                            ?   <div style={styles.content}>
                                    <div style={styles.inputContainer} ref={node => { this._inputNode = node }}>
                                        <Input
                                            label={localizations.newSportunity_organizerRoles}                                            
                                            onClick={() => {this.setState({assistantTypeDropdownOpen: true})}}
                                            placeholder={sport && sport.id ? localizations.newSportunity_organizerChoose : localizations.newSportunity_organizerHolderBefore}
                                            value={this.state.selectAssistantType}
                                            onKeyPress={this._handleOpenRoleList}
                                            readOnly
                                        />
                                    
                                        {
                                            assistantTypeDropdownOpen 
                                            ?   <div style={styles.dropdown}>
                                                    <ul>
                                                        {viewer.sport && viewer.sport.assistantTypes && viewer.sport.assistantTypes.length > 0 
                                                        ?   viewer.sport.assistantTypes.map((item) =>
                                                                <li
                                                                    key={item.id}
                                                                    style={styles.listItem}
                                                                    onClick={() => this._handleChangeAssistantType(item)}
                                                                >
                                                                    {item.name[localizations.getLanguage().toUpperCase()]}
                                                                </li>
                                                            )
                                                        :   <li style={styles.listItem} key={"no_choice"}>
                                                                {localizations.newSportunity_selection_no_choice}
                                                            </li>              
                                                        }
                                                    </ul>
                                                </div>
                                            :   null
                                        }
                                    </div>
                                    {viewer.assistants && viewer.assistants.edges && viewer.assistants.edges.length > 0 
                                    ?   <div style={styles.userList}>
                                            
                                            {assistantListPageNumber > 0 && 
                                                <div style={styles.previousPageIcon} onClick={this._loadPreviousAssistants} key="previous">
                                                    <i style={styles.icon} className="fa fa-arrow-circle-left" aria-hidden="true" />
                                                </div>
                                            }

                                            {viewer.assistants.edges.map((item, index) => {
                                                return (
                                                    index >= assistantListPageNumber * 3 && index <= (assistantListPageNumber + 1) * 3 - 1 
                                                    ? <div style={styles.userContainer} key={item.node.id} onClick={() => this._handleChooseAssistant(item.node, viewer.sport)}>
                                                        <div style={styles.userDetails}>
                                                            <div style={styles.avatarContainer}>
                                                                <img src={item.node.avatar} style={styles.avatar}/>
                                                            </div>
                                                            <div style={styles.pseudo}>{item.node.pseudo}</div>
                                                            {item.node.publicAddress && item.node.publicAddress.city 
                                                            ?   <div style={styles.place}>
                                                                    {item.node.publicAddress.city + ', ' + item.node.publicAddress.country}
                                                                </div>
                                                            :   null
                                                            }
                                                            {this._renderSportInformation(item.node.sports, sport)}
                                                        </div>
                                                        <div style={styles.bookOrganizer}>
                                                            {localizations.newSportunity_organizerAssistantBook}
                                                        </div>
                                                    </div>
                                                    : false
                                                )
                                            }).filter(i => Boolean(i))}

                                            {viewer.assistants.edges.length > (assistantListPageNumber + 1) * 3  &&
                                                <div style={styles.nextPageIcon} onClick={this._loadNextAssistants} key="next">
                                                    <i style={styles.icon} className="fa fa-arrow-circle-right" aria-hidden="true" />
                                                </div>
                                            }
                                        </div>
                                    :   <div style={styles.noResult}>
                                            <span style={styles.noResultLabel}>
                                                {viewer.sport && viewer.sport.assistantTypes && viewer.sport.assistantTypes.length > 0 
                                                ?   localizations.newSportunity_selection_no_choice
                                                :   localizations.newSportunity_organizerHolderBefore
                                                }
                                            </span>
                                        </div>
                                    }
                                </div>
                            :   openedModal === 2 
                                ?   <div style={styles.content}>
                                        <div style={styles.inputContainer} ref={node => { this._inputNode = node }}>
                                            <Input
                                                label={localizations.newSportunity_organizerPseudo}
                                                placeholder={localizations.newSportunity_invitationDropdownHolder}
                                                value={this.state.inputContent}
                                                onChange={this._handleInputChange}
                                            />
                                        </div>
                                        {viewer.users && viewer.users.edges && viewer.users.edges.length > 0 
                                        ?   <div style={styles.userList}>
                                                
                                                {userListPageNumber > 0 && 
                                                    <div style={styles.previousPageIcon} onClick={this._loadPreviousUsers} key="previous">
                                                        <i style={styles.icon} className="fa fa-arrow-circle-left" aria-hidden="true" />
                                                    </div>
                                                }

                                                {viewer.users.edges.map((item, index) => {
                                                    return (
                                                        index >= userListPageNumber * 3 && index <= (userListPageNumber + 1) * 3 - 1 
                                                        ? <div style={styles.userContainer} key={item.node.id} onClick={() => this._handleChooseAssistant(item.node, viewer.sport)}>
                                                            <div style={styles.userDetails}>
                                                                <div style={styles.avatarContainer}>
                                                                    <img src={item.node.avatar} style={styles.avatar}/>
                                                                </div>
                                                                <div style={styles.pseudo}>{item.node.pseudo}</div>
                                                                {item.node.publicAddress && item.node.publicAddress.city 
                                                                ?   <div style={styles.place}>
                                                                        {item.node.publicAddress.city + ', ' + item.node.publicAddress.country}
                                                                    </div>
                                                                :   null
                                                                }
                                                                {this._renderSportInformation(item.node.sports, sport)}
                                                            </div>
                                                            <div style={styles.bookOrganizer}>
                                                                {localizations.newSportunity_organizerAssistantBook}
                                                            </div>
                                                        </div>
                                                        : false
                                                    )
                                                }).filter(i => Boolean(i))}

                                                {viewer.users.edges.length > (userListPageNumber + 1) * 3  &&
                                                    <div style={styles.nextPageIcon} onClick={this._loadNextUsers} key="next">
                                                        <i style={styles.icon} className="fa fa-arrow-circle-right" aria-hidden="true" />
                                                    </div>
                                                }
                                            </div>
                                        :   <div style={styles.noResult}>
                                                <span style={styles.noResultLabel}>
                                                    {localizations.newSportunity_selection_no_choice}
                                                </span>
                                            </div>
                                        }
                                    </div>
                                :   openedModal === 3
                                    &&   <div style={styles.content}>
                                            <div style={styles.inputContainer} ref={node => { this._inputNode = node }}>
                                                {this.state.communitySelectedCircle && 
                                                    <div style={styles.backButton} onClick={this._handleCloseCircle}>
                                                        <i className="fa fa-arrow-left" aria-hidden="true" />
                                                        {'  ' + localizations.back}
                                                    </div>
                                                }
                                            </div>
                                            <div style={styles.circleList}>
                                                {this.state.communitySelectedCircle
                                                ?   this.props.viewer.circle && this.props.viewer.circle.members && this.props.viewer.circle.members.length > 0 &&
                                                    this.props.viewer.circle.members.map((member, index) => (
                                                        <div style={styles.circleContainer} key={index} onClick={() => this._handleChooseAssistant(member, viewer.sport)}>
                                                            <div style={styles.circleDetails}>
                                                            <div style={{...styles.iconImage, backgroundImage: member.avatar ? 'url('+ member.avatar +')' : 'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")'}}/>
                                                                <div style={styles.circleNameContainer}> 
                                                                        <div style={styles.circleName}>{member.pseudo}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                :   circleList.length > 0
                                                    ?   circleList.map((edge, index) => (
                                                        <div style={styles.circleContainer} key={index} onClick={() => this._handleOpenCircle(edge.node)}>
                                                            <div style={styles.circleDetails}>
                                                                <img style={styles.buttonImage} src="/images/icon_circle@3x.png"/>
                                                                <div style={styles.numberContainer}>
                                                                    <span style={styles.number}>
                                                                        {edge.node.memberCount}
                                                                    </span>
                                                                </div>
                                                                {edge.node.owner 
                                                                ?   <div style={styles.circleNameContainer}>
                                                                        <div style={styles.circleName}>{edge.node.name}</div>
                                                                        <div style={styles.ownerContainer}>
                                                                            <div style={{ ...styles.smallAvatar, backgroundImage: `url(${edge.node.owner.avatar})` }} />
                                                                            <div style={styles.ownerName}>{edge.node.owner.pseudo}</div>
                                                                        </div>
                                                                    </div>
                                                                :   <div style={styles.circleNameContainer}> 
                                                                        <div style={styles.circleName}>{edge.node.name}</div>
                                                                    </div>
                                                                }
                                                            </div>
                                                        </div>
                                                        ))
                                                    :   <div style={styles.noResult}>
                                                            <span style={styles.noResultLabel}>
                                                                {localizations.newSportunity_organizerSelectCircles_none}
                                                            </span>
                                                        </div>
                                                }
                                            </div>
                                        </div>
                            }
                            
                        </div>
                    </Modal>
                </div>
            </StyleRoot>
        );
    }
}

styles = {
    modalContent: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        width: 700,
        minHeight: 500,
        '@media (max-width: 400px)': {
            width: '96%',
        }
    },
    modalHeader: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-center',
        justifyContent: 'space-between',
        padding: '20px 35px 10px',
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
        color: colors.redGoogle,
        cursor: 'pointer',
        position: 'absolute',
        right: 15,
        top: 10
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    inputContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        position: 'relative',
        borderBottom: '1px solid '+colors.gray,
        padding: '10px 35px',
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
    
    listItem: {
        padding: '10px 20px',
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
        cursor: 'pointer',
    
        ':hover': {
            backgroundColor: '#e9e9e9',
        },
    },

    userList: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 10,
        position: 'relative'
    },
    userContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: 340,
        width: 230,
        marginRight: 10,

        borderRadius: 3,
        boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
        cursor: 'pointer',

        ':hover': {
            boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.3), 0 6px 20px 0 rgba(0, 0, 0, 0.25)',
        },
    },
    userDetails: {
        display: 'flex',
        flexDirection: 'column',
        padding: 15,
    },
    explanation: {
        fontStyle: 'italic',
        fontFamily: 'Lato',
        fontSize: 16,
        color: colors.darkGray
    },
    backButton: {
        fontFamily: 'Lato',
        fontSize: 16,
        color: colors.blue,
        cursor: 'pointer'
    },
    circleList: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 10,
        position: 'relative',
        height: 430,
        overflow: 'scroll'

    },
    circleContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 50,
        width: '100%',
        margin: '5px 10px',
        padding: '10px',

        borderRadius: 3,
        boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
        cursor: 'pointer',

        ':hover': {
            boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.3), 0 6px 20px 0 rgba(0, 0, 0, 0.25)',
        },
    },
    circleDetails: {
        display: 'flex',
        flexDirection: 'row',
        position: 'relative',
        alignItems: 'center'
    },
    circleNameContainer: {
        marginLeft: 15,
        fontSize: 18,
        fontFamily: 'Lato',
        color: colors.blue,
        fontWeight: 'bold',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
    },
    ownerContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5
    },
    smallAvatar: {
        width: 20,
        height: 20,
        marginRight: 10,
        color: colors.blue,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        borderRadius: '50%',
    },
    iconImage: {
		color:colors.white,
		width: 25,
        height: 25,
		borderRadius: '50%',
		backgroundPosition: '50% 50%',
        backgroundSize: 'cover',
		backgroundRepeat: 'no-repeat',
	},
    ownerName: {
        color: colors.gray,
        fontSize: 16,
        fontWeight: 'normal'
    },
    circleName: {
        fontSize: 18,
        fontFamily: 'Lato',
        color: colors.blue,
        fontWeight: 'bold',
    },
    buttonImage: {
        height: 40,
        width: 'auto'
    },
    numberContainer: {
        position: 'absolute',
        top: '11px',
        left: '23px',
        width: 24,
        textAlign: 'center',                
    },
    number: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Lato',
        color: colors.blue,
    },
    avatarContainer: {
        height: 190,
        display: 'flex',
        alignItems: 'center'
    },
    avatar: {
        width: '100%',
        height: 'auto',
    },
    pseudo: {
        fontSize: 18,
        fontFamily: 'Lato',
        color: colors.blue,
        marginTop: 10,
        fontWeight: 'bold'
    },
    role: {
        fontSize: 14, 
        fontFamily: 'Lato',
        color: colors.blue,
    },
    place: {
        fontSize: 14, 
        fontFamily: 'Lato',
        color: colors.blue,
        marginTop: 5
    },
    sportInfo: {
        display: 'flex', 
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    }, 
    roles: {
        color: colors.blue,
        fontSize: 14,
        fontFamily: 'Lato'
    }, 
    sportLogo: {
        width: 35,
        height: 'auto'
    }, 
    bookOrganizer: {
        backgroundColor: colors.blue,
        color: colors.white,
        fontSize: 16,
        fontFamily: 'Lato',
        padding: 10,
        textAlign: 'center',
        borderBottomRightRadius: 3,
        borderBottomLeftRadius: 3,
        cursor: 'pointer'
    },
    grayedBookOrganizer: {
        backgroundColor: colors.gray,
        color: colors.white,
        fontSize: 16,
        fontFamily: 'Lato',
        padding: 10,
        textAlign: 'center',
        borderBottomRightRadius: 3,
        borderBottomLeftRadius: 3,
        cursor: 'pointer'
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
        marginRight: 3,
        ':hover': {
            transform:'scale(1.1)',
        },

    },
    nextPageIcon: {
        color: colors.blue,
        fontSize: 36,
        cursor: 'pointer',
        ':hover': {
            transform:'scale(1.1)',
        },
    },
    
};

modalStyles = {
    overlay : {
        position          : 'fixed',
        top               : 0,
        left              : 0,
        right             : 0,
        bottom            : 0,
        backgroundColor   : 'rgba(255, 255, 255, 0.75)',
	      zIndex            : 413,
    },
    content : {
        top                   : '50%',
        left                  : '50%',
        right                 : 'auto',
        bottom                : 'auto',
        marginRight           : '-50%',
        transform             : 'translate(-50%, -50%)',
        border                     : '1px solid '+colors.blue,
        background                 : '#fff',
        overflow                   : 'auto',
        WebkitOverflowScrolling    : 'touch',
        borderRadius               : '4px',
        outline                    : 'none',
        boxShadow                  : '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
        padding                    : 0
    },
}


export default createRefetchContainer(Radium(FindOrganizerModal), {
//OK
    user: graphql`
        fragment MyEventsFindOrganizerModal_user on User @argumentDefinitions(
            queryCircles: {type: "Boolean!", defaultValue: false}
          ) {
            id,
            circles (last: 20) @include(if: $queryCircles){
                edges {
                    node {
                        id, 
                        name,
                        memberCount
                        type
                    }
                }
            }
            circlesFromClub(last: 50) @include(if: $queryCircles){
                edges {
                    node {
                        id
                        name,
                        memberCount
                        owner {
                            id
                            avatar
                            pseudo
                        }
                        type
                    }
                }
            }
        }
    `,
    viewer: graphql`
        fragment MyEventsFindOrganizerModal_viewer on Viewer @argumentDefinitions(
            listAssistantByNameValue: {type: "String", defaultValue: "_"}
            firstUsers: {type: "Int", defaultValue: 18},
            listAssistantByName: {type: "Boolean!", defaultValue: false},
            sportId: {type: "ID", defaultValue: null},
            assistantsSportId: {type: "String!", defaultValue: "_"},
            query: {type: "Boolean!", defaultValue: false}, 
            assistantTypeId: {type: "String", defaultValue: null},
            first: {type: "Int", defaultValue: 18},
            circleId: {type: "ID", defaultValue: null},
            queryCircle: {type: "Boolean!", defaultValue: false}
          ){
            users (pseudo: $listAssistantByNameValue, first: $firstUsers, userType: PERSON) @include(if: $listAssistantByName) {
                pageInfo {
                    hasNextPage,
                    endCursor,
                }
                edges {
                    node {
                        id
                        pseudo
                        avatar
                        sports {
                            sport {
                                id, 
                                logo
                            },
                            assistantType {
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
                }
            }
            sport(id: $sportId) @include(if: $query) {
                id
                assistantTypes {
                    id,
                    name {
                        EN,
                        FR,
                        DE,
                        ES
                    }
                }
            }
            assistants(sportId: $assistantsSportId, assistantTypeId: $assistantTypeId, first: $first) @include(if: $query){
                pageInfo {
                    hasNextPage,
                    endCursor,
                }
                edges {
                    node {
                        id
                        avatar
                        pseudo
                        birthday
                        publicAddress {
                            city
                            country
                        }
                        sports {
                            sport {
                                id, 
                                logo
                            },
                            assistantType {
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
                }
            }
            circle (id: $circleId) @include(if: $queryCircle) {
                id,
                name, 
                memberCount, 
                members {
                    id
                    pseudo
                    avatar
                    sports {
                        sport {
                            id, 
                            logo
                        },
                        assistantType {
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
            }
        }
    `
},
graphql`
query MyEventsFindOrganizerModalRefetchQuery(
    $queryCircles: Boolean!
    $listAssistantByNameValue: String
    $firstUsers: Int
    $listAssistantByName: Boolean!
    $sportId: ID
    $assistantsSportId: String!
    $query: Boolean! 
    $assistantTypeId: String
    $first: Int
    $circleId: ID
    $queryCircle: Boolean!
) {
  viewer {
    ...MyEventsFindOrganizerModal_viewer
      @arguments(
        listAssistantByNameValue: $listAssistantByNameValue
        firstUsers: $firstUsers
        listAssistantByName: $listAssistantByName
        sportId: $sportId
        assistantsSportId: $assistantsSportId
        query: $query
        assistantTypeId: $assistantTypeId
        first: $first
        circleId: $circleId
        queryCircle: $queryCircle
      )
      me{
        ...MyEventsFindOrganizerModal_user
        @arguments(
            queryCircles: $queryCircles
          )
  }

  }
}
`,
);