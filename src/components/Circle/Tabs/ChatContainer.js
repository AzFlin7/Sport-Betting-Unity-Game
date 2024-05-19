import React from 'react'
import {
  createRefetchContainer,
  graphql,
} from 'react-relay';
import Radium from 'radium'
import Loading from 'react-loading';

import localizations from '../../Localizations'
import { colors, fonts } from '../../../theme'
import Chat from './Chat'

let styles;

class ChatTab extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: false,
        }
    }

    componentDidMount() {
        if (this.props.circle) {
            this.setState({isLoading: true})
            this.props.relay.refetch(fragmentVariables => ({
                ...fragmentVariables,
                queryChat: true,
                chatCircleId: this.props.circle.id
            }),
            null,
            () => {
                setTimeout(() => {
                    this.setState({ isLoading: false })
                }, 50);
            }
            )
        }
    }

    componentWillReceiveProps = nextProps => {
        if (!!this.props.viewer && !!this.props.viewer.chat && nextProps.viewer && !nextProps.viewer.chat && nextProps.circle) {
            this.setState({isLoading: true})
            setTimeout(() => {
                nextProps.relay.refetch(fragmentVariables => ({
                    ...fragmentVariables,
                    queryChat: true,
                    chatCircleId: nextProps.circle.id
                }),
                null,
                () => {
                    setTimeout(() => {
                        this.setState({ isLoading: false })
                    }, 50);
                }
                )
            }, 500);
        }
    }

    openLogin = () => {
        this.props.router.push('/login');
    }

    render() {
        return (
            <div style={styles.container}>
                <Chat
                    viewer={this.props.viewer}
                    chat={this.props.viewer.chat || null}
                    isCurrentUserAMember={this.props.isCurrentUserAMember}
                    isCurrentUserCoOwner={this.props.isCurrentUserCoOwner}
                    isCurrentUserTheOwner={this.props.isCurrentUserTheOwner}
                    router={this.props.router}
                    isChatActive={this.props.circle.isChatActive}
                />
            </div>
        )
    }
}

styles = {
    container: {

    },
}

export default createRefetchContainer(Radium(ChatTab), {
    viewer: graphql`
        fragment ChatContainer_viewer on Viewer @argumentDefinitions(
                chatCircleId: {type: "String", defaultValue: null},
                queryChat: {type: "Boolean!", defaultValue: false}
        ) {
            id
            ...Chat_viewer
            chat (circleId: $chatCircleId) @include (if: $queryChat) {
                ...Chat_chat
            }
        }
    `
    },
    graphql`
        query ChatContainerRefetchQuery(
            $chatCircleId: String,
            $queryChat: Boolean!
        ) {
            viewer {
                ...ChatContainer_viewer @arguments(chatCircleId: $chatCircleId, queryChat: $queryChat)
            }
        }
    `,
);
