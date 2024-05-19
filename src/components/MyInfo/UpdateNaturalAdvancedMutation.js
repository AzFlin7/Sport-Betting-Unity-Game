import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation UpdateNaturalAdvancedMutation($input: upUserInput!) {
		upUser(input: $input) {
      clientMutationId,
      user {
        id
        isProfileComplete
        mangoId
        occupation,
        incomeRange,
        address {
          address
          city
          country
          zip
          position {
            lat, lng
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
        userID: input.userIDVar,
        user: {
          occupation: !!input.occupationVar && input.occupationVar !== '' ? input.occupationVar : null,
          incomeRange: !!input.incomeRangeVar && input.incomeRangeVar !== '' ? input.incomeRangeVar : null,
          address: input.addressVar
        },
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('upUser'); 
			const newItem = payload.getLinkedRecord('user')
			let currentItem = store.get(input.userIDVar); 

			currentItem.setValue(newItem.getValue('occupation'), 'occupation')
			currentItem.setValue(newItem.getValue('incomeRange'), 'incomeRange')
			currentItem.setLinkedRecord(newItem.getLinkedRecord('address'), 'address')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}