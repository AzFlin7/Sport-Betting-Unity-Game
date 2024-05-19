import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 

const mutation = graphql`
	mutation ImportActivitiesMutation($input: upUserInput!) {
		upUser(input: $input) {
            clientMutationId,
			user {
				id,
				icsLinks
			}
		}
	}
`;

function commit(input, {onSuccess: onCompleted, onFailure: onError}) {
	return commitMutation(environment, {
		mutation, 
		variables: { 
			input: {
                userID: input.userID,
                user: {
                    icsLinks: input.icsLinks,
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