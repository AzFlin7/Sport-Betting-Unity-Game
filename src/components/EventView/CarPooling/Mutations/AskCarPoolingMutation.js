import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation AskCarPoolingMutation($input: askCarPoolingInput!) {
		askCarPooling(input: $input) {
			clientMutationId,
		}
	}
`;

function commit(input, {onSuccess: onCompleted, onFailure: onError}) {
	return commitMutation(environment, {
		mutation, 
		variables: { 
			input : {
        sportunityID: input.sportunityIDVar,
      }
		}, 
		updater: (store) => { 
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}

