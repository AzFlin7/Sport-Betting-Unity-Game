import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation SendMessageMutation($input: addMsgInput!) {
		addMsg(input: $input) {
      clientMutationId,
      edge {
        node {
          id
          messages (last:20) {
            edges {
              node {
                ...Message_message
              }
            }
          }
        }
      }
		}
	}
`;

function commit(input, {onSuccess: onCompleted, onFailure: onError}) {
	return commitMutation(environment, {
		mutation, 
		variables: { 
			input : {
        chatId: input.chatId,
        message: input.message
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('addMsg'); 
			// const newItem = payload.getLinkedRecord('edge').getLinkedRecord('node'); 
			// let currentItem = store.get(input.chatId); 

			// currentItem.setLinkedRecords(newItem.getLinkedRecords('messages'), 'messages')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class SendMessageMutation extends Relay.Mutation {
  
  getMutation() {
    return Relay.QL`mutation Mutation{
      addMsg
    }`;
  }
  
  getVariables = () => (
    {
      chatId: this.props.chatId,
      message: this.props.message
    }
  )
  
  getFatQuery() {
    return Relay.QL`
      fragment on addMsgPayload @relay(pattern: true) {
        edge
        viewer {
          id,
          chat
        }
      }
    `;
  }

  
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
}*/