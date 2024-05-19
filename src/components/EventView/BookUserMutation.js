import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation BookUserMutation($input: userBooksEventInput!) {
		userBooksEvent(input: $input) {
      clientMutationId,
      secure3DURL
      sportunity {
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
        status
      }
      edge {
        node {
          status
        }
      }
		}
	}
`;

function commit(input, onCompleted, onError) {
	return commitMutation(environment, {
		mutation, 
		variables: { 
			input : {
        sportunityID: input.sportunity.id,
        participantID: input.user.id,
        paymentMethodId: input.paymentMethod,
        paymentByWallet: input.paymentByWallet,
        confirmationPage: input.confirmationPage
      }
		}, 
		/*updater: (store) => { 
			const payload = store.getRootField('userBooksEvent'); 
			// const newItem = payload.getLinkedRecord('edge').getLinkedRecord('node'); 
			// let currentItem = store.get(input.sportunity.id); 

      // currentItem.setLinkedRecords(newItem.getLinkedRecords('participants'), 'participants')
      // currentItem.setLinkedRecords(newItem.getLinkedRecords('waiting'), 'waiting')
      // currentItem.setValue(newItem.getValue('status'), 'status')
			onCompleted() 
    }, */
    onCompleted: (response, errors) => {
      if (errors && errors.length > 0) {
        onError(errors);
      }
      else {
        onCompleted(response)
      }
    },
		onError 
	}) 
} 

export default {commit}
