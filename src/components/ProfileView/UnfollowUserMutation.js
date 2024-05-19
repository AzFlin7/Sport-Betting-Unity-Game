import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation UnfollowUserMutation($input: unfollowUserInput!) {
		unfollowUser(input: $input) {
      clientMutationId,
      user {
        followers {
          id
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
        userID: input.userId,
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('unfollowUser'); 
			const newItem = payload.getLinkedRecord('user')
			let currentItem = store.get(input.userId); 

			currentItem.setLinkedRecords(newItem.getLinkedRecords('followers'), 'followers')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class UnollowMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
      unfollowUser
    }`;
  }

  getVariables() {
    return {
      userID: this.props.userId,
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on unfollowUserPayload @relay(pattern: true){
        clientMutationId,
        user,
        viewer
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
        id,
      }
    `,
  };
}
*/