import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation ChangeEventCompositionsMutation($input: updateSportunityCompositionsInput!) {
		changeEventCompositions(input: $input) {
      clientMutationId,
      edge {
        node {
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
	}
`;

function commit(input, {onSuccess: onCompleted, onFailure: onError}) {
	return commitMutation(environment, {
		mutation, 
		variables: { 
			input : {
        sportunityId: input.sportunity.id,
        compositionIds: input.compositionIdsVar,
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('changeEventCompositions'); 
			const newItem = payload.getLinkedRecord('edge').getLinkedRecord('node'); 
			let currentItem = store.get(input.sportunity.id); 

			currentItem.setLinkedRecords(newItem.getLinkedRecords('compositions'), 'compositions')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class ChangeEventCompositionsMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation {changeEventCompositions}`;
  }

  getVariables() {
    return {
	    sportunityId: this.props.sportunity.id,
	    compositionIds: this.props.compositionIdsVar,
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on updateSportunityCompositionsPayload{
        sportunity {
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
	      sportunity: this.props.sportunity.id,
      },
    }];
  }

  static fragments = {
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
