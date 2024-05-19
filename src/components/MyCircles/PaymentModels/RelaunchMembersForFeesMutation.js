import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation RelaunchMembersForFeesMutation($input: relaunchMembersForMembershipFeesInput!) {
		relaunchMembers(input: $input) {
			clientMutationId,
		}
	}
`;

function commit(input, {onSuccess: onCompleted, onFailure: onError}) {
	return commitMutation(environment, {
		mutation, 
		variables: { 
			input : {
        		paymentMethodId: input.idVar,
      		}
		}, 
		updater: (store) => { 
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}

