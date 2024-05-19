import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation UpdateSportunityLevelsMutation($input: updateSportunityInput!) {
    updateSportunity(input: $input) {
      clientMutationId,
      edge {
        node {
          sport {
            levels {
              id,
              EN {
                name,
                skillLevel
                description
              }
              FR {
                name,
                skillLevel
                description
              }
              DE {
                name,
                skillLevel
                description
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
        sportunityID: input.sportunity.id,
        sportunity: {
          sport: {
            sport: input.sport.id,
            levels: input.sport.levels
          }
        },
      }
		},
		updater: (store) => {
      const payload = store.getRootField('updateSportunity');
      const newItem = payload.getLinkedRecord('edge').getLinkedRecord('node');
      let currentItem = store.get(input.sportunity.id);

      //currentItem.setValue(newItem.getLinkedRecord('sport'), 'sport')
      onCompleted()
		}, 
		onError 
	}) 
} 

export default {commit}

