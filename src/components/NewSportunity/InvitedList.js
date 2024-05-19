import React from 'react';
import {
    createRefetchContainer,
    graphql,
} from 'react-relay/compat';
import PureComponent, { pure } from '../common/PureComponent'
import Radium from 'radium';

import Switch from '../common/Switch';
import { colors } from '../../theme';
import localizations from '../Localizations'

import InvitedCircleDetails from './InvitedCircleDetails'
import CircleAutoParticipate from './CircleAutoParticipate';

let styles;

class InvitedList extends PureComponent {
    componentDidMount() {
        this.state = {
            isFullListVisible: false,
            circleDetailsModalIsOpen: false,
            selectedCircle: null
        }
        this.props.relay.refetch(fragmentVariables => ({...fragmentVariables, queryDetails: true}))
    }

    componentWillReceiveProps = (nextProps) => {
        if (this.state.selectedCircle && nextProps.invitedCircles && this.state.circleDetailsModalIsOpen) {
            let index = nextProps.invitedCircles.findIndex(invitedCircle => invitedCircle.circle.id === this.state.selectedCircle.circle.id)
            this.setState({
                selectedCircle: nextProps.invitedCircles[index]
            })
        }
    }
    
    openCircleDetails = (item) => {
        this.setState({
            selectedCircle: item,
            circleDetailsModalIsOpen: true
        });
        this.props.relay.refetch(fragmentVariables => ({
            ...fragmentVariables, 
            queryCircle: true,
            circleId: item.circle.id
        }))
    }

    closeCircleDetails = () => {
        this.setState({
            selectedCircle: null,
            circleDetailsModalIsOpen: false
        })
    }

    render() {
        const { 
            list, 
            invitedCircles, 
            onRemoveItem, 
            onRemoveInvitedCircle, 
            onChangeCirclePrice, 
            onChangeCircleAutoParticipate, 
            onChangeUserAutoParticipate,
            viewer
        } = this.props;

        let itemList = [];
        if (list && list.length > 0) {
            list.forEach(item => 
                itemList.push({
                    type: 'user',
                    item
                })
            )
        }
        if (invitedCircles && invitedCircles.length > 0) {
            invitedCircles.forEach(item => 
                itemList.push({
                    type: 'circle',
                    item
                })
            )
        }
        
        return (
            <div
                style={styles.container}
            >
                <InvitedCircleDetails
                    viewer={viewer}
                    itemList={itemList}
                    user={viewer.me}
                    circleDetails={viewer.circle}
                    isModalOpen={this.state.circleDetailsModalIsOpen}
                    selectedCircle={this.state.selectedCircle}
                    closeModal={this.closeCircleDetails}
                    onChangeCircleAutoParticipate={onChangeCircleAutoParticipate}
                    onChangeUserAutoParticipate={onChangeUserAutoParticipate}
                    onChangeCirclePrice={onChangeCirclePrice}
                    _handleNotificationTypeChange={this.props._handleNotificationTypeChange}
                    _handleNotificationAutoXDaysBeforeChange={this.props._handleNotificationAutoXDaysBeforeChange}
                    isModifying={this.props.isModifying}
                    isSurvey={this.props.isSurvey}
                    fields={this.props.fields}
                />

                    <div style={styles.title}>
                        {(viewer.me && (viewer.me.profileType === 'BUSINESS' || viewer.me.profileType === 'ORGANIZATION') ? localizations.newSportunity_invitedListClubs : localizations.newSportunity_invitedList)}
                        {itemList.length > 3 && 
                            <span style={{...styles.detailsButton, float: 'right'}} onClick={() => this.setState({isFullListVisible: !this.state.isFullListVisible})}>
                                {this.state.isFullListVisible
                                ?   localizations.newSportunity_invitedList_seeLess
                                :   localizations.newSportunity_invitedList_seeMore
                                }
                            </span>
                        }
                    </div>
                {itemList && itemList.length > 0 && 
                    <div style={styles.invitedList} >
                        <ul style={styles.list}>
                            {(this.state.isFullListVisible ? itemList : itemList.filter((el, index) => index < 3)).map((el, index) => (
                                el.type === 'user'
                                ?   <li
                                        key={index}
                                        style={{...styles.listItem, alignItems: 'center'}}
                                    >
                                        <div style={styles.avatarContainer}>
                                            <div style={{ ...styles.avatar, backgroundImage: `url(${el.item.avatar})` }} />
                                        </div>
                                        <div style={styles.userLinePseudo}>
                                            <span style={styles.userName}>
                                                {el.item.pseudo}
                                            </span>
                                        </div>
                                        <div style={styles.removeCross} onClick={e => {this.props.onRemoveItem(index, e); if (list.length === 0) this.setState({invitedListIsOpen: false}) }}>
                                            <i className="fa fa-times" style={styles.cancelIcon} aria-hidden="true"></i>
                                        </div>
                                    </li>
                                :   <li
                                        key={index}
                                        style={styles.listItem}
                                    >
                                        <div style={styles.buttonIcon}>
                                            <img src="/images/icon_circle@3x.png" height="40px" />
                                            <div style={styles.numberContainer}>
                                                <span style={styles.number}>
                                                    {el.item.circle.memberCount}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={styles.circleItemContainer}>
                                            <div style={styles.circleTopContent}>
                                                <span style={styles.circleName}>
                                                    {el.item.circle.name}
                                                </span>
                                                <span style={styles.detailsButton} onClick={() => this.openCircleDetails(el.item)}>
                                                    <i className="fa fa-cogs" style={styles.detailsIcon} aria-hidden="true"></i>
                                                    {localizations.newSportunity_circle_show_details}
                                                </span>
                                            </div>
                                            <div style={styles.circleBottomContent}>
                                                {el.item.circle.owner 
                                                ?   <div style={styles.ownerContainer}>
                                                        <div style={{...styles.smallAvatar, backgroundImage: el.item.circle.owner.avatar ? 'url('+ el.item.circle.owner.avatar +')' : 'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")'}} />
                                                        {el.item.circle.owner.pseudo}
                                                    </div>
                                                :   <div style={styles.ownerContainer}>
                                                        <div style={{...styles.smallAvatar, backgroundImage: viewer.me.avatar ? 'url('+ viewer.me.avatar +')' : 'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")'}} />
                                                        {viewer.me.pseudo}
                                                    </div>
                                                }

                                                <span style={styles.circlePrice}>
                                                    {el.item.price.cents + ' ' + el.item.price.currency}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={styles.removeCross} onClick={onRemoveInvitedCircle.bind(this, el)}>
                                            <i className="fa fa-times" style={styles.cancelIcon} aria-hidden="true"></i>
                                        </div>
                                    </li>
                            
                            ))}
                        </ul>
                    </div>                        
                }
                    
            </div>
        );
    }
}

styles = {
    container: {
        position: 'relative',
        width: '100%',
        marginBottom: 25
    },

    title: {
        color: colors.darkBlue,
        fontSize: 16,
        marginTop: 20
    },
    invitedList: {
        marginLeft: 0,
        marginTop: 10,
        maxHeight: 300,
        overflow: 'scroll'
    },
    
    invitedCircleList: {
        marginLeft: 0
    },
    
    list: {},
    
    listItem: {
        color: '#515151',
        fontSize: 20,
        fontFamily: 'Lato',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
        border: '1px solid ' + colors.gray,
        boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
        padding: '0px 0px 0px 20px',
    },
    
    removeCross: {
        width: 24,
        height: 60, 
        paddingTop: 6,
        paddingLeft: 4,
        color: colors.gray,
        cursor: 'pointer',
        fontSize: '20px',
        backgroundColor: colors.lightGray,
    },
    cancelIcon: {
    },
    circleItemContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexDirection: 'column',
        fontSize: 18,
        flex: 4
    },
    circleTopContent: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%'
    },
    circleBottomContent: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%'
    },
    userName: {
        color: colors.blue,
        fontWeight: 'bold',
    },
    circleName: {
        color: colors.blue,
        fontWeight: 'bold',
        marginBottom: 5
    },
    detailsButton: {
        color: colors.gray,
        fontSize: 14,
        marginRight: 10,
        cursor: 'pointer'
    },
    detailsIcon: {
        marginRight: 5,
        fontSize: 16
    },
    circlePrice: {
        marginRight: 10,
        display: 'flex',
        alignItems: 'center',
        color: colors.gray
    },
    ownerContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        fontSize: 16
    },
    price: {
        width: 60,
        height: 36,

        border: '2px solid #5E9FDF',
        borderRadius: '3px',
        textAlign: 'center',

        fontSize: 16,
        lineHeight: 1,
        marginRight: 10,

        color: 'rgb(111, 101, 101)',
    },

    bold: {
        fontWeight: 'bold',
    },
    buttonIcon: {
        color: colors.blue,
        position: 'relative',
        flex: 1,
        marginRight: 5
    },
    numberContainer: {
        position: 'absolute',
        top: '9px',
        left: '23px',
        width: 24,
        textAlign: 'center'
    },
    number: {
        fontSize: 19,
        fontWeight: 'bold'
    },
    avatarContainer: {
        flex: 1,
        display: 'flex',
        marginRight: 5,
        justifyContent: 'center'
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
    userLinePseudo: {
      display: 'flex',
      alignItems: 'center',
      fontSize: 18,
      color: colors.blue,
      fontWeight: 'bold',
      flex: 4
    },
};

export default createRefetchContainer(Radium(InvitedList), {
//OK
    viewer: graphql`
        fragment InvitedList_viewer on Viewer @argumentDefinitions(
            queryDetails: {type: "Boolean!", defaultValue: false},
            queryCircle: {type: "Boolean!", defaultValue: false},
            circleId: {type: "ID", defaultValue: null}
            ){
            me {
                id
                pseudo
                avatar
                profileType
            }
            circle(id: $circleId) @include(if: $queryCircle) {
                id
                members {
                    id,
                    avatar,
                    pseudo,
                }
                memberStatus {
                    starting_date
                    member {
                        id
                        pseudo
                    }
                    status
                }
            }
        }
    `
},
    graphql`
    query InvitedListRefetchQuery(
        $queryDetails: Boolean!
        $queryCircle: Boolean!
        $circleId: ID
    ) {
    viewer {
        ...InvitedList_viewer
        @arguments(
            queryDetails: $queryDetails
            queryCircle: $queryCircle
            circleId: $circleId
        )
    }
    }
    `,
);
