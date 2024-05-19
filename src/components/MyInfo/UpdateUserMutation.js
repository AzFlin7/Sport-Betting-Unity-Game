import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation UpdateUserMutation($input: upUserInput!) {
		upUser(input: $input) {
            clientMutationId,
            user {
                id,
                authorized_managers {
                    user {
						id
						avatar
						pseudo
					}
                }
                userPreferences {
                    areSubAccountsActivated
                }
                homePagePreference
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
                    authorized_managers: input.authorized_managersVar,
                    userPreferences: input.userPreferencesVar,
                    homePagePreference: input.homePagePreferenceVar
                }
            }
		}, 
		updater: (store) => { 
			/*const payload = store.getRootField('upUser');
			const newItem = payload.getLinkedRecord('user')
			let currentItem = store.get(input.userIDVar); 

			currentItem.setLinkedRecords(newItem.getLinkedRecords('authorized_managers'), 'authorized_managers') 
			currentItem.setLinkedRecord(newItem.getLinkedRecord('userPreferences'), 'userPreferences') 
			currentItem.setValue(newItem.getValue('homePagePreference'), 'homePagePreference')*/
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class UpdateUserMutation extends Relay.Mutation {

    getMutation() {
        return Relay.QL`mutation Mutation{
            upUser
        }`;
    }

    getVariables() {
        return {
            userID: this.props.userIDVar,
            user: {
                authorized_managers: this.props.authorized_managersVar,
                userPreferences: this.props.userPreferencesVar,
                homePagePreference: this.props.homePagePreferenceVar
            }

        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on upUserPayload {
            clientMutationId,
            viewer
            user {
                id,
                authorized_managers
                userPreferences {
                    areSubAccountsActivated
                }
                homePagePreference
            }
        }
        `;
    }

    getConfigs() {
        return [{
        type: 'FIELDS_CHANGE',
            fieldIDs: {
                user: this.props.userIDVar,
            },
        }];
    }

    static fragments = {
        user: () => Relay.QL`
            fragment on User {
                id,
                authorized_managers {
                    user {
                        id
                        pseudo
                        avatar
                    }
                    authorization_level
                }
                userPreferences {
                    areSubAccountsActivated
                }
                homePagePreference
            }
        `,
    };

}
*/