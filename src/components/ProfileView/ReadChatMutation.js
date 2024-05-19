import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation ReadChatMutation($input: readChatInput!) {
		readChat(input: $input) {
      clientMutationId,
      user {
        id
        chats (last: 100) {
          edges {
            node {
              id
              read
            }
          }
        },
        unreadChats
      }
		}
	}
`;

function commit(input, {onSuccess: onCompleted, onFailure: onError}) {
	return commitMutation(environment, {
		mutation, 
		variables: { 
			input : {
        chatId: input.chat.id,
      }
		}, 
		updater: (store) => { 
			/* const payload = store.getRootField('readChat'); 
			const newItem = payload.getLinkedRecord('viewer').getLinkedRecord('me'); 
			let currentItem = store.get(input.circleId); 

			currentItem.setLinkedRecord(newItem.getLinkedRecord('bankAccount'), 'bankAccount')*/ 
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class ReadChatMutation extends Relay.Mutation {

  getVariables() {
    return {
      chatId: this.props.chat.id,
    };
  }

  getMutation() {
    return Relay.QL`mutation { readChat }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on readChatPayload @relay(pattern: true) {
        viewer {
          chats,
          me {
            unreadChats
          }
        }
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        viewer: this.props.viewer.id,
      },
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
*/