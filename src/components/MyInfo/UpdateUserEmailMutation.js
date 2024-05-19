import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment';


const mutation = graphql`
	mutation UpdateUserEmailMutation($input: upUserInput!) {
		upUser(input: $input) {
			clientMutationId,
			user {
				id,
				email
			}
		}
	}
`;

function commit(input, {onSuccess: onCompleted, onFailure: onError}) {
	return commitMutation(environment, {
		mutation,
		variables: {
			input: {
				userID: input.userIDVar,
				user: {
					email: input.emailVar
				}
			}
		},
		updater: (store) => {
			onCompleted()
		},
		onError
	})
}

export default {commit}
