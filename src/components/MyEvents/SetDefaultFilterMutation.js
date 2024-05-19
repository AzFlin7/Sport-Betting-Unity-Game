import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation SetDefaultFilterMutation($input: setDefaultFilterInput!) {
		setDefaultFilter(input: $input) {
			clientMutationId,
			user {
				id
				defaultSavedFilter {
					id
					filterName
					statuses
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
	}
`;

function commit(input, {onSuccess: onCompleted, onFailure: onError}) {
	return commitMutation(environment, {
		mutation, 
		variables: { 
			input :{
				filterID: input.filterIDVar,
			}
		}, 
		updater: (store) => { 
			const payload = store.getRootField('setDefaultFilter'); 
			const newItem = payload.getLinkedRecord('user')
			let currentItem = store.get(input.user.id); 

			if (newItem.getLinkedRecord('defaultSavedFilter'))
				currentItem.setLinkedRecord(newItem.getLinkedRecord('defaultSavedFilter'), 'defaultSavedFilter')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class SetDefaultFilterMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
      setDefaultFilter
    }`;
  }

  getVariables() {
    return {
      filterID: this.props.filterIDVar,
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on setDefaultFilterPayload {
        clientMutationId,
        user {
          defaultSavedFilter {
						id
						filterName
						statuses
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
            user: this.props.user.id,
        },
    }];
  }

  static fragments = {
    user: () => Relay.QL`
      fragment on User {
        id
        savedFilters {
						id
						filterName
						statuses
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