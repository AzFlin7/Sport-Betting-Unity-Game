import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation RemoveCardMutation($input: deletePaymentMethodInput!) {
		deletePaymentMethod(input: $input) {
      clientMutationId,
      viewer {
        me {
          id
          paymentMethods {
            id
            cardType
            cardMask
            expirationDate
            currency
          }
        }
      },
		}
	}
`;

function commit(input, {onSuccess: onCompleted, onFailure: onError}) {
	return commitMutation(environment, {
		mutation, 
		variables: { 
			input : {
        paymentMethodId: input.paymentMethodIdVar,
      }
		}, 
		updater: (store) => { 
			/* const payload = store.getRootField('deletePaymentMethod'); 
			const newItem = payload.getLinkedRecord('viewer').getLinkedRecord('me'); 
			let currentItem = store.get(input.circleId); 

			currentItem.setLinkedRecord(newItem.getLinkedRecord('bankAccount'), 'bankAccount')*/ 
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}
