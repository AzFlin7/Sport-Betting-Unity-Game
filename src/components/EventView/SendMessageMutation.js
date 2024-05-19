import Relay from 'react-relay';
/**
*  Send a new message in chat
*/
export default class SendMessageMutation extends Relay.Mutation {
  /**
  *  Mutation
  */
  getMutation() {
    return Relay.QL`mutation Mutation{
      addMsg
    }`;
  }
  /**
  *  Variables
  */
  getVariables = () => (
    {
      chatId: this.props.chatId,
      message: this.props.message
    }
  )
  /**
  *  Fat query
  */
  getFatQuery() {
    return Relay.QL`
      fragment on addMsgPayload @relay(pattern: true) {
        edge
        viewer {
          id
          chat
        }
      }
    `;
  }

  /**
  *  Config
  */
  getConfigs() {
    return [{
      type: 'RANGE_ADD',
      parentName: 'viewer',
      parentID: this.props.viewer.id,
      connectionName: 'chats',
      edgeName: 'edge',
      rangeBehaviors: ({ status }) => (
        status === 'completed' ? 'ignore' : 'append'
      ),
    }];
  }

  static fragments = {
    viewer: () => Relay.QL`
      fragment on Viewer {
        id
      }
    `,
    chat: () => Relay.QL`
      fragment on Chat {
        id
      }
    `,
  };
}