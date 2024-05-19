import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation RequestNewValidationMailMutation($input: askNewValidationMailInput!) {
		askNewValidationMail(input: $input) {
			clientMutationId,
		}
	}
`;

function commit(input, {onSuccess: onCompleted, onFailure: onError}) {
	return commitMutation(environment, {
		mutation, 
		variables: { 
			input : {
        pseudo: input.pseudo,
        email: input.email,
      }
		}, 
		updater: (store) => { 
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}
