import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation ChangePasswordMutation($input: upUserInput!) {
		upUser(input: $input) {
			clientMutationId,
		}
	}
`;

function commit(input, {onSuccess: onCompleted, onFailure: onError}) {
	return commitMutation(environment, {
		mutation, 
		variables: { 
			input: {
        token: input.token,
        user: {
          password: input.password,
        },
      }
		}, 
		updater: (store) => { 
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}