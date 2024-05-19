import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation ReportMutation($input: reportUserInput!) {
		reportUser(input: $input) {
			clientMutationId,
		}
	}
`;

function commit(input, {onSuccess: onCompleted, onFailure: onError}) {
	return commitMutation(environment, {
		mutation, 
		variables: { 
			input : {
        userID: input.userIDVar,
        reason: input.reasonVar,
      }
		}, 
		updater: (store) => { 
			
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}

