import React from 'react'
import {
  createRefetchContainer,
  graphql,
} from 'react-relay';
import Radium from 'radium'
import Loading from 'react-loading';

import localizations from '../../Localizations'
import { colors, fonts } from '../../../theme'

import Message from '../../ProfileView/Message';
import Form from '../../ProfileView/Form';

import SendMessageMutation from '../../ProfileView/SendMessageMutation';
import ReadChatMutation from '../../ProfileView/ReadChatMutation';
import AddMesssage from '../Subscriptions/AddCircleMessage'

let styles;

class ChatTab extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: false,
            sendingMessage: false,
            isLoadingMore: false,
            messageCount: 20
        }
    }

    componentDidMount() {
        this._commentsNode.addEventListener('scroll', e => this._manageLoadMore());
    }

    componentWillUnmount() {
      !!this.sub && this.sub.dispose()
    }

    componentWillReceiveProps = nextProps => {
        if (!!this.props.chat && nextProps.chat && !this.sub) {
            this._readChat(this.props.chat);
            this._scrollToBottom()

            this.sub = AddMesssage({chatIdsVar: [nextProps.chat.id]})
        }

        if (this.props.chat && this.props.chat.messages && nextProps.chat && nextProps.chat.messages && this.props.chat.messages.count < nextProps.chat.messages.count) {
            setTimeout(() => this._scrollToBottom(), 150);
            setTimeout(() => this._readChat(nextProps.chat), 1000)
        }
    }


  _manageLoadMore = () => {
    if (this._commentsNode.scrollTop < this._commentsNode.clientHeight) {
      this.loadMoreItems();
    }
  }

  loadMoreItems = () => {
    if (!this.state.isLoadingMore && this.props.chat.messages.count > this.state.messageCount) {
      this.setState({isLoadingMore: true})
      this.props.relay.refetch(
        {messageCount: this.state.messageCount + 20},
        null,
        () => this.setState({messageCount: this.state.messageCount + 20, isLoadingMore: false})
      )
    }
  }

    _readChat = (chat) => {
        const viewer = this.props.viewer
        if (chat) {
            ReadChatMutation.commit({ viewer, chat },
                {
                    onFailure: error => console.log(error.getError()),
                    onSuccess: (response) => {
                        console.log(response)
                    },
                }
            );
        }
    }

    _scrollToBottom = () => {
        this._commentsNode.scrollTop = this._commentsNode.scrollHeight;
    }

    _scrollAfterNewMessage = () => {
        setTimeout(() => {
            if (this.props.relay.pendingVariables)
                this._scrollAfterNewMessage();
            else {
                this._scrollToBottom();
            }
        }, 100);
    }

    _handleSendMessage = (message) => {
        if (message && message.length > 0) {
            this.setState({
                sendingMessage: true
            })
            SendMessageMutation.commit({
                    viewer: this.props.viewer,
                    chat: this.props.chat,
                    message: {
                        text: message,
                        author: this.props.viewer.me.id
                    },
                    chatId: this.props.chat.id
                }, {
                    onSuccess: () => {
                        this.setState({
                            sendingMessage: false
                        })
                        this._scrollAfterNewMessage();
                    },
                    onFailure: (error) => {
                        console.log("error sending the message")
                        this.setState({
                            sendingMessage: false
                        })
                    },
                }
            );
        }
    }

    openLogin = () => {
        this.props.router.push('/login');
    }

    render() {
        const { isCurrentUserAMember, isCurrentUserCoOwner, isCurrentUserTheOwner } = this.props;
        return (
            <div style={styles.container}>
                <div style={styles.title}>
                    {localizations.circle_title_chat}
                </div>
                {this.state.isLoading
                ?   <div style={styles.loadingContainer}>
                        <Loading type='spinningBubbles' color={colors.blue} />
                    </div>
                :   (isCurrentUserAMember || isCurrentUserCoOwner || isCurrentUserTheOwner)
                    ?   <div style={styles.chatContainer}>
                            <div style={styles.comments} ref={node => { this._commentsNode = node; }}>
                                {this.state.isLoadingMore &&
                                    <div style={styles.loadingContainer}>
                                        <Loading type='cylon' color={colors.blue} height={50} width={50}/>
                                    </div>
                                }
                                <div style={styles.commentsList}>
                                    {this.props.chat && this.props.chat.messages.edges.map((message,index) =>
                                        <Message
                                            key={index}
                                            message={message.node}
                                            me={this.props.viewer.me}
                                        />
                                    )}
                                </div>
                            </div>
                            { this.props.chat &&
                                <Form
                                    sendMessage={this._handleSendMessage}
                                    user={this.props.viewer.me}
                                    sendingMessage={this.state.sendingMessage}
                                    isDisabled={!this.props.isChatActive}
                                    isCurrentUserAMember={isCurrentUserAMember}
                                    isCurrentUserTheOwner={isCurrentUserCoOwner || isCurrentUserTheOwner}
                                    isChat
                                />
                            }
                        </div>
                    :   <div style={styles.cannotAccessContainer}>
                            <i style={styles.alertIcon} className="fa fa-exclamation-circle fa-2x" />
                            <div style={styles.cannotAccessTitle}>
                                {localizations.circle_chat_not_available}
                            </div>
                            <div style={styles.cannotAccessText}>
                                {this.props.viewer.me
                                ?   localizations.circle_chat_not_availableTextSubscribe
                                :   <span>
                                        {localizations.circle_chat_not_availableTextLogin}
                                        <span style={styles.cannotAccessLink} onClick={this.openLogin}>{localizations.circle_chat_not_availableTextLogin2}</span>
                                    </span>
                                }
                            </div>
                        </div>
                }
            </div>
        )
    }
}

styles = {
    container: {

    },
    title: {
        fontSize: 22,
        fontFamily: 'Lato',
        color: colors.darkGray,
        margin: '25px 0px'
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50
    },
    chatContainer: {
        border: '1px solid #C3C3C3',
        borderRadius: '5px',

        // width: 720,
        height: 390,

        padding: 10,

        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        margin: 'auto'
    },
    comments: {
        flexGrow: 1,
        overflowX: 'hidden',
        overflowY: 'scroll',
        marginBottom: 10,
    },
    cannotAccessContainer: {
        marginLeft: 25,
        fontFamily: 'Lato',
        textAlign: 'center'
    },
    alertIcon: {
        color: colors.blue,
        fontSize: 60,
        marginBottom: 25
    },
    cannotAccessTitle: {
        color: colors.blue,
        fontSize: 22,
        textAlign: 'center',
    },
    cannotAccessText: {
        color: colors.darkGray,
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20
    },
    cannotAccessLink: {
        color: colors.blue,
        cursor: 'pointer'
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center'
    }
}

export default createRefetchContainer(Radium(ChatTab), {
    viewer: graphql`
        fragment Chat_viewer on Viewer {
            id
            me {
                id
                avatar
                pseudo
            }
        }
    `,
    chat: graphql`
        fragment Chat_chat on Chat @argumentDefinitions (
            messageCount: {type: "Int!", defaultValue: 20}
        ) {
            id
            isActive
            messages (last: $messageCount) {
                count
                edges {
                    node {
                        ...Message_message
                    }
                }
            }
        }
    `
    },
    graphql`
        query ChatRefetchQuery(
            $chatCircleId: String,
            $messageCount: Int!
        ) {
            viewer {
                chat (circleId: $chatCircleId) {
                    ...Chat_chat @arguments(messageCount: $messageCount)
                }
            }
        }
    `,
);
