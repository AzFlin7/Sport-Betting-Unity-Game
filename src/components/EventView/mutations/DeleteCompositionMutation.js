import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation DeleteCompositionMutation($input: deleteCompositionInput!) {
		deleteComposition(input: $input) {
      clientMutationId,
      viewer {
        sportunity {
          compositions {
            id
          }
        }
      }
      user {
        id
        compositions {
          id
          name
          fieldImage
          users {
            user {
              id
              pseudo
              avatar
            }
            position {
              xPercentage
              yPercentage
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
        compositionId: input.compositionIdVar,
      }
		}, 
		updater: (store) => { 
			/* const payload = store.getRootField('deleteComposition'); 
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

export default class DeleteCompositionMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation {deleteComposition}`;
  }

  getVariables() {
    return {
	    compositionId: this.props.compositionIdVar,
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on deleteCompositionPayload{
        viewer {
          sportunity {
            compositions {
              id
            }
          }
        }
        user {
          id
          compositions {
            id
            name
            owner
            fieldImage
            users {
              user {
                id
                pseudo
                avatar
              }
              position {
                xPercentage
                yPercentage
              }
            }
          }
        }
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        user: this.props.user.id,
      },
    }];
  }

  static fragments = {
    user: () => Relay.QL`
      fragment on User {
        id
        compositions {
          id
          name
          owner
          fieldImage
          users {
            user {
              id
              pseudo
              avatar
            }
            position {
              xPercentage
              yPercentage
            }
          }
        }
      }
    `,
	  sportunity: () => Relay.QL`
      fragment on Sportunity {
        id
        compositions {
          id
          name
          owner
          fieldImage
          users {
            user {
              id
              pseudo
              avatar
            }
            position {
              xPercentage
              yPercentage
            }
          }
        }
      }
    `,
  };
}
*/
