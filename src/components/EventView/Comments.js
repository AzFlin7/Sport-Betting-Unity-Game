import React from 'react';
import Radium from 'radium';
import Loading from 'react-loading';
import {createRefetchContainer,graphql} from 'react-relay';

import { colors } from '../../theme'

import Comment from './Comment';
import Form from './Form';

import SendMessageMutation from '../ProfileView/SendMessageMutation';
import ReadChatMutation from '../ProfileView/ReadChatMutation';
import AddMesssage from './Subscriptions/AddMessage'

let styles;

class Comments extends React.PureComponent {
  constructor() {
    super();
    this.state = {
      sendingMessage: false,
      isLoadingMore: false,
      messageCount: 20
    }
  }
  
  componentDidMount() {
    this._commentsNode.addEventListener('scroll', e => this._manageLoadMore());

    this._scrollToBottom();
    this._readChat(this.props.chat);
    
    this.sub = AddMesssage({chatIdsVar: [this.props.chat.id]})
  }

  componentWillUnmount() {
    !!this.sub && this.sub.dispose()
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

  _readChat = chat => {
    const viewer = this.props.viewer;
    ReadChatMutation.commit(
      { viewer, chat },
      {
        onFailure: error => console.log(error.getError()),
        onSuccess: response => {
          console.log(response);
        },
      },
    );
  };

  _scrollToBottom = () => {
    this._commentsNode.scrollTop = this._commentsNode.scrollHeight;
  };

  _scrollAfterNewMessage = () => {
    setTimeout(() => {
      if (this.props.relay.pendingVariables)
        this._scrollAfterNewMessage();
      else {
        this._scrollToBottom();
      }
    }, 100);
  };

  componentWillReceiveProps = nextProps => {
    if (this.props.chat.messages && nextProps.chat.messages && this.props.chat.messages.count < nextProps.chat.messages.count) {
      setTimeout(() => this._scrollToBottom(), 150);
      setTimeout(() => this._readChat(nextProps.chat), 1000)
    }
  }

  _handleSendMessage = (message) => {
    if (message && message.length > 0) {
      this.setState({
        sendingMessage: true,
      });
      SendMessageMutation.commit(
        {
          viewer: this.props.viewer,
          chat: this.props.chat,
          message: {
            text: message,
            author: this.props.viewer.me.id,
          },
          chatId: this.props.chat.id,
        },
        {
          onSuccess: () => {
            this.setState({
              sendingMessage: false,
            });
            this._scrollAfterNewMessage();
          },
          onFailure: error => {
            this.setState({
              sendingMessage: false,
            });
            console.log('error sending the message');
          },
        },
      );
    }
  };

  render() {
    return (
      <div style={styles.container}>
        <div style={styles.comments} ref={node => { this._commentsNode = node; }}>
          {this.state.isLoadingMore &&
            <div style={styles.loadingContainer}>
              <Loading type='cylon' color={colors.blue} height={50} width={50}/>
            </div>
          }
          <div style={styles.commentsList}>
            {this.props.chat.messages.edges.map((message, index) => (
              <Comment
                key={index}
                message={message.node}
                me={this.props.viewer.me}
              />
            ))}
          </div>
        </div>
        {this.props.chat.isActive && (
          <Form
            viewOnly={this.props.viewOnly}
            sendMessage={this._handleSendMessage}
            user={this.props.user}
            sendingMessage={this.state.sendingMessage}
          />
        )}
      </div>
    );
  }
}

styles = {
  container: {
    border: '1px solid #C3C3C3',
    borderRadius: '5px',

    // width: 720,
    height: 390,

    padding: 10,

    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },

  comments: {
    flexGrow: 1,
    overflowX: 'hidden',
    overflowY: 'scroll',
    marginBottom: 10,
  },

  commentsList: {
  },

  loadingContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center'
  }
};

export default createRefetchContainer(Radium(Comments), {
    user: graphql`
      fragment Comments_user on User {
        ...Form_user
      }
    `,
    viewer: graphql`
      fragment Comments_viewer on Viewer {
        id
        me {
          id
        }
      }
    `,
    chat: graphql`
      fragment Comments_chat on Chat @argumentDefinitions(messageCount: {type: "Int!", defaultValue: 20}) {
        id
        isActive
        messages (last: $messageCount) {
          count
          edges {
            node {
              ...Comment_message
            }
          }
        }
      }
    `
  }, 
  graphql`
    query CommentsRefetchQuery ($messageCount: Int!, $chatSportunityId: String) {
      viewer {
        chat (sportunityId: $chatSportunityId) {
          ...Comments_chat @arguments(messageCount: $messageCount)
        }
      }
    }
  
  `
);
