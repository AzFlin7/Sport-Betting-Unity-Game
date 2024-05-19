import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation SetDefaultCircleFilterMutation($input: setDefaultCircleFilterInput!) {
		setDefaultCircleFilter(input: $input) {
      clientMutationId,
      user {
        id
        defaultSavedCircleFilter {
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
        filterID: input.filterIDVar,
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('setDefaultCircleFilter'); 
			const newItem = payload.getLinkedRecord('user')
			let currentItem = store.get(input.user.id); 

			currentItem.setLinkedRecord(newItem.getLinkedRecord('defaultSavedCircleFilter'), 'defaultSavedCircleFilter')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class SetDefaultCircleFilterMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
      setDefaultCircleFilter
    }`;
  }

  getVariables() {
    return {
      filterID: this.props.filterIDVar,
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on setDefaultCircleFilterPayload {
        clientMutationId,
        user {
          defaultSavedCircleFilter {
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