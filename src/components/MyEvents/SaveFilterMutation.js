import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation SaveFilterMutation($input: upUserInput!) {
		upUser(input: $input) {
			clientMutationId,
			user {
				id
				basicSavedFiltersCreated
				savedFilters {
					id
					filterName
					statuses
					page
					subAccounts {
						id
						pseudo
					}
					sportunityTypes {
						id
						name {
							FR
							EN
						}
					}
					sport {
						sport {
							id
							name {
								EN
								FR
								DE
							}
						}
						levels {
							id
							EN {
								name
								skillLevel
								description
							}
							FR {
								name
								skillLevel
								description
							}
						}
					}
					location {
						lat
						lng
						radius
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
					savedFilters: input.savedFiltersVar,
					basicSavedFiltersCreated: input.basicSavedFiltersCreatedVar
				}
			}
		}, 
		updater: (store) => { 
			const payload = store.getRootField('upUser'); 
			const newItem = payload.getLinkedRecord('user')
			let currentItem = store.get(input.userIDVar); 

			currentItem.setLinkedRecords(newItem.getLinkedRecords('savedFilters'), 'savedFilters')
			currentItem.setValue(newItem.getValue('basicSavedFiltersCreated'), 'basicSavedFiltersCreated')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class SaveFilterMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
      upUser
    }`;
  }

  getVariables() {
    return {
      userID: this.props.userIDVar,
      user: {
        savedFilters: this.props.savedFiltersVar,
        basicSavedFiltersCreated: this.props.basicSavedFiltersCreatedVar
      }
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on upUserPayload {
        clientMutationId,
        user {
          basicSavedFiltersCreated
          savedFilters {
						id
						filterName
						statuses
						page
						subAccounts {
							id
							pseudo
						}
						sportunityTypes {
							id
							name {
								FR
								EN
							}
						}
					}
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
        id
        basicSavedFiltersCreated
        savedFilters {
						id
						filterName
						statuses
						page
						subAccounts {
							id
							pseudo
						}
						sportunityTypes {
							id
							name {
								FR
								EN
							}
						}
				}
      }
    `,
  };

}
*/