import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation FollowUserMutation($input: upUserInput!) {
		upUser(input: $input) {
      clientMutationId,
      user {
        id
        followers {
          id
          pseudo
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
        userID:input.userId,
        user: {
          followers:input.meId,
        },
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('upUser'); 
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

export default class FollowMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
      upUser
    }`;
  }

  getVariables() {
    return {
      userID: this.props.userId,
      user: {
        followers: this.props.meId,
      },
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on upUserPayload @relay(pattern: true){
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