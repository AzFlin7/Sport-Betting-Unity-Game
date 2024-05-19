import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation SaveFindFilterMutation($input: upUserInput!) {
		upUser(input: $input) {
      clientMutationId,
      user {
        id
        savedFilters {
          id
          page
          filterName
          location {
            lat
            lng
            radius
          }
          sport {
            sport {
              id
              name {
                EN
                FR
                DE
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
                DE {
                  name
                  skillLevel
                  description
                }
              }
            }
            levels {
              id
              FR {
                name
                skillLevel
                description
              }
              EN {
                name
                skillLevel
                description
              }
              DE {
                name
                skillLevel
                description
              }
            }
          }
          price {
            from
            to
          }
          dates {
            from
            to
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
          savedFilters: input.savedFiltersVar
        }
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('upUser'); 
			const newItem = payload.getLinkedRecord('user')
			let currentItem = store.get(input.userIDVar); 

			currentItem.setLinkedRecords(newItem.getLinkedRecords('savedFilters'), 'savedFilters')
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
        savedFilters: this.props.savedFiltersVar
      }
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on upUserPayload {
        clientMutationId,
        user {
          savedFilters
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
      }
    `,
  };

}
*/