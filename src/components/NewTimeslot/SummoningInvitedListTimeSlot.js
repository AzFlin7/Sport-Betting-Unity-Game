import React, { Component } from 'react';
import PropTypes from 'prop-types'
import {
    createRefetchContainer,
    graphql,
    QueryRenderer
} from 'react-relay/compat';
import PureComponent, { pure } from '../common/PureComponent'
import Radium from 'radium';
import isEqual from 'lodash/isEqual'

import Switch from '../common/Switch';
import { colors } from '../../theme';
import localizations from '../Localizations'
import environment from 'sportunity/src/createRelayEnvironment';

import InvitedCircleDetailsTimeSlot from './InvitedCircleDetailsTimeSlot'
import CircleAutoParticipate from './CircleAutoParticipate';
import PanelCircle from './PanelCircle';

let styles;
let id;

class SummoningInvitedListTimeSlot extends PureComponent {
    static contextTypes = {
        relay: PropTypes.shape({
            variables: PropTypes.object,
        }),
    }

    constructor(props) {
        super(props);
        this.state = {
            isFullListVisible: true,
            circleDetailsModalIsOpen: false,
            selectedCircle: null,
        }
    }

    componentDidMount() {
        if (this.props.invitedCircles && this.props.invitedCircles.length > 0) {
            this.openCircleDetails(this.props.invitedCircles[0])
        }
    }

    componentWillReceiveProps = (nextProps) => {
        if (this.props.invitedCircles && this.props.invitedCircles.length === 0 && nextProps.invitedCircles && nextProps.invitedCircles.length > 0) {
            this.openCircleDetails(nextProps.invitedCircles[0])
        }
        if (!!this.state.selectedCircle && !isEqual(this.props.invitedCircles, nextProps.invitedCircles)) {
            let index = nextProps.invitedCircles.findIndex(invitedCircle => invitedCircle.circle.id === this.state.selectedCircle.circle.id);
            if (index >= 0) {
                this.setState({
                    selectedCircle: nextProps.invitedCircles[index]
                })
            }
        }
    }

    openCircleDetails = (item) => {
        this.setState({
            selectedCircle: item,
            circleDetailsModalIsOpen: true
        });
        this.props.relay.refetch(fragmentVariables => ({
            ...this.context.relay.variables,
            queryCircle: true,
            circleId: item.circle.id
        }))
    }

    closeCircleDetails = () => {
        this.setState({
            //  selectedCircle: null,
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
                {itemList && itemList.length > 0 &&
                    <div style={styles.invitedList} >
                        <ul style={styles.list}>
                            {(this.state.isFullListVisible ? itemList : itemList.filter((el, index) => index < 5)).map((el, index) => (
                                el.type === 'user'
                                    ? <li key={index} style={styles.listItem}>
                                        <div style={styles.leftContainer}>
                                            <div style={styles.avatarContainer}>
                                                <div style={{ ...styles.avatar, backgroundImage: `url(${el.item.avatar || "https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png"})` }} />
                                            </div>
                                            <div style={styles.userLinePseudo}>
                                                {el.item.pseudo || el.item.invitedPseudo}
                                            </div>
                                            <div style={{ marginLeft: 'auto' }} onClick={() => this.props.onRemoveInvitee(el.item)}>
                                                <i style={{ marginLeft: 5, cursor: 'pointer', fontSize: 20, color: colors.redGoogle }} className="fa fa-times" />
                                            </div>
                                        </div>
                                    </li>
                                    : <PanelCircle
                                        key={index}
                                        selectedCircle={this.state.selectedCircle}
                                        name={el.item.circle.name}
                                        circle={viewer.circle}
                                        openCircleDetails={() => this.openCircleDetails(el.item)}
                                        closeCircleDetails={this.closeCircleDetails}
                                        viewer={viewer}
                                        itemList={itemList}
                                        user={viewer.me}
                                        circleDetails={viewer.circle}
                                        isModalOpen={this.state.circleDetailsModalIsOpen && this.state.selectedCircle && this.state.selectedCircle.circle.id === el.item.circle.id}
                                        closeModal={() => this.closeCircleDetails()}
                                        onChangeCircleAutoParticipate={onChangeCircleAutoParticipate}
                                        onChangeUserAutoParticipate={onChangeUserAutoParticipate}
                                        onChangeCirclePrice={onChangeCirclePrice}
                                        _handleNotificationTypeChange={this.props._handleNotificationTypeChange}
                                        _handleNotificationAutoXDaysBeforeChange={this.props._handleNotificationAutoXDaysBeforeChange}
                                        isModifying={this.props.isModifying}
                                        isSurvey={this.props.isSurvey}
                                        fields={this.props.fields}
                                        _handleChangeInvitedCircleVisibility={this.props._handleChangeInvitedCircleVisibility}
                                        _handleChangeInvitedCirclemultiBooking={this.props._handleChangeInvitedCirclemultiBooking}
                                        _handleChangeInvitedCircleNotificationPreference={this.props._handleChangeInvitedCircleNotificationPreference}
                                    />
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
    },

    invitedCircleList: {
        marginLeft: 0
    },

    list: {},

    listItem: {
        fontFamily: 'Lato',
        fontSize: 16,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0px 70px',
        marginLeft: -70,
        marginRight: -70,
        // borderBottom: '1px solid ' + colors.gray,
    },

    removeCross: {
        width: 24,
        height: 60,
        paddingTop: 6,
        paddingLeft: 4,
        color: '#212121',
        cursor: 'pointer',
        fontSize: '13px',
    },
    cancelIcon: {
    },
    circleItemContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexDirection: 'column',
        fontSize: 13,
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
    circleName: {
        color: colors.blue,
        fontWeight: 'bold',
        marginBottom: 5
    },
    detailsButton: {
        color: '#fff',
        fontSize: 10,
        marginRight: 10,
        cursor: 'pointer',
        backgroundColor: '#64A5D7',
        padding: '6px 10px',
        position: 'relative',
        top: 13,
        left: 20,

    },
    detailsIcon: {
        marginRight: 5,
        fontSize: 13
    },

    ownerContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        fontSize: 11
    },
    price: {
        width: 60,
        height: 36,

        border: '2px solid #5E9FDF',
        borderRadius: '3px',
        textAlign: 'center',

        fontSize: 13,
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
        marginRight: 5,
        color: '#fff',
        backgroundColor: '#64a5d8',
        padding: '8px 5px',
    },
    numberContainer: {
        position: 'absolute',
        top: '17px',
        left: '27px',
        width: 24,
        textAlign: 'center'
    },
    number: {
        fontSize: 19,
        fontWeight: 'bold'
    },
    leftContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '5px 10px',
        boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
        flex: 1
    },
    avatarContainer: {
        // flex: 1,
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
        fontSize: 13,
        fontWeight: 'bold',
        color: colors.darkGray
    },
};

const SummoningInvitedListTemp = createRefetchContainer(Radium(SummoningInvitedListTimeSlot), {
    viewer: graphql`
        fragment SummoningInvitedListTimeSlot_viewer on Viewer @argumentDefinitions(
            queryCircle: {type: "Boolean!", defaultValue: false},
            circleId: {type: "ID", defaultValue: null}
        ){
            ...InvitedCircleDetailsTimeSlot_viewer
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
    query SummoningInvitedListTimeSlotRefetchQuery($queryCircle: Boolean!, $circleId: ID) {
        viewer {
            ...SummoningInvitedListTimeSlot_viewer @arguments(queryCircle: $queryCircle, circleId: $circleId)
        }
    }
`
)

export default class extends Component {
    render() {
        return (
            <QueryRenderer
                environment={environment}
                query={graphql`
            query SummoningInvitedListTimeSlotQuery {
              viewer {
                ...SummoningInvitedListTimeSlot_viewer
              }
            }
          `}
                variables={{
                    queryCircle: false,
                    circleId: null
                }}
                render={({ error, props }) => {
                    if (props) {
                        return <SummoningInvitedListTemp query={props} viewer={props.viewer} {...this.props} />;
                    } else {
                        return (
                            <SummoningInvitedListTemp query={props} viewer={null} {...this.props} />
                        )
                    }
                }}
            />
        )
    }
}