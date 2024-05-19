import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation UpdateUserFeedbackMutation($input: upUserInput!) {
		upUser(input: $input) {
      clientMutationId,
      user {
        id,
        feedbacks {
          feedbacksList (last: 100) {
            edges {
              node {
                author {
                    id
                }
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
        userID: input.userID,
        user: {
          feedbacks: {
            text: input.text,
            rating: input.rating,
            author: input.author,
            createdAt: input.createdAt,
          }
        },
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('upUser'); 
			const newItem = payload.getLinkedRecord('user')
			let currentItem = store.get(input.userID); 

			currentItem.setLinkedRecords(newItem.getLinkedRecords('feedbacks'), 'feedbacks')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class UpdateUserFeedbackMutation extends Relay.Mutation {
  
  getMutation() {
    return Relay.QL`mutation Mutation{
      upUser
    }`;
  }
  
  getVariables() {
    return {
      userID: this.props.userID,
      user: {
        feedbacks: {
          text: this.props.text,
          rating: this.props.rating,
          author: this.props.author,
          createdAt: this.props.createdAt,
        }
      },
    };
  }
  
  getFatQuery() {
    return Relay.QL`
      fragment on upUserPayload {
        clientMutationId,
        user {
          id,
          feedbacks
        }
      }
    `;
  }

  
  getConfigs() {
    return [{
      type: 'RANGE_ADD',
      parentName: 'user',
      parentID: this.props.userID,
      connectionName: 'FeedbackConnection',
      edgeName: 'feedbacks',
      rangeBehaviors: () => 'prepend',
    }];
  }

  static fragments = {
    viewer: () => Relay.QL`
      fragment on Viewer {
        id,
        me {
          id
        }
      }
    `,
  };
}
*/
