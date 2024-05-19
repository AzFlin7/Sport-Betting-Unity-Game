import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation SaveCircleFilterMutation($input: upUserInput!) {
		upUser(input: $input) {
      clientMutationId,
      user {
        id
        savedCircleFilters {
          id
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
              }
            }
          }
          circleType
          memberTypes
          modes
          owners {
            id
            pseudo
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
          savedCircleFilters: input.savedFiltersVar,
          basicCircleSavedFiltersCreated: input.basicCircleSavedFiltersCreatedVar
        }
      }
		}, 
		updater: (store) => { 
		  const payload = store.getRootField('upUser'); 
			const newItem = payload.getLinkedRecord('user')
			let currentItem = store.get(input.userIDVar); 

			currentItem.setLinkedRecords(newItem.getLinkedRecords('savedCircleFilters'), 'savedCircleFilters')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class SaveCircleFilterMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
      upUser
    }`;
  }

  getVariables() {
    return {
      userID: this.props.userIDVar,
      user: {
        savedCircleFilters: this.props.savedFiltersVar,
        basicCircleSavedFiltersCreated: this.props.basicCircleSavedFiltersCreatedVar
      }
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on upUserPayload {
        clientMutationId,
        user {
          savedCircleFilters 
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
        savedCircleFilters {
						id
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
                }
              }
            }
            circleType
            memberTypes
            modes
            owners {
              id
              pseudo
            }
				}
      }
    `,
  };

}
*/