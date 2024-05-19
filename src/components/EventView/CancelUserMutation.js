import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation CancelUserMutation($input: updateSportunityInput!) {
		updateSportunity(input: $input) {
      clientMutationId,
      edge {
        node {
          participants {
            id
            avatar
            pseudo
          },
          waiting {
            id
            avatar
            pseudo
          },
          canceling {
            canceling_user {
              id,
              pseudo,
              avatar
            }
            status
          }
          status
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
          canceling: input.user.id,
          invited: input.invited,
        },
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('updateSportunity'); 
			const newItem = payload.getLinkedRecord('edge').getLinkedRecord('node'); 
			let currentItem = store.get(input.sportunity.id); 

			currentItem.setLinkedRecords(newItem.getLinkedRecords('participants'), 'participants')
			currentItem.setLinkedRecords(newItem.getLinkedRecords('waiting'), 'waiting')
			currentItem.setLinkedRecords(newItem.getLinkedRecords('canceling'), 'canceling')
			currentItem.setValue(newItem.getValue('status'), 'status')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}