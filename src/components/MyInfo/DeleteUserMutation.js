import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment';

const mutation = graphql`
	mutation DeleteUserMutation($input: deleteUserInput!) {
		deleteUser(input: $input) {
			clientMutationId
			viewer {
				me {
					id
					pseudo
					email
					profileType
					mangoId
					isProfileComplete
					isSubAccount
					userPreferences {
						areSubAccountsActivated
					}
					subAccounts {
						id
						pseudo
						email
						avatar
						authorized_managers {
							user {
								id
								avatar
								pseudo
							}
						}
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
			input: {
				userId: input.userIDVar
			}
		},
		updater: (store) => {
			onCompleted()
		},
		onError
	})
}

export default {commit}
