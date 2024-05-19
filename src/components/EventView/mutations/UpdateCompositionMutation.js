import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation UpdateCompositionMutation($input: updateCompositionInput!) {
		updateComposition(input: $input) {
      clientMutationId,
      composition {
        id
        name
        fieldImage
        users {
          user {
            id
            pseudo
            avatar
          }
          position {
            xPercentage
            yPercentage
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
        compositionId: input.compositionIdVar,
        composition: {
          name: input.nameVar,
          owner: input.owner.id,
          fieldImage: input.fieldImageVar,
          users: input.usersVar
        },
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('updateComposition'); 
			const newItem = payload.getLinkedRecord('composition')
			let currentItem = store.get(input.compositionIdVar); 

			currentItem.setValue(newItem.getValue('name'), 'name')
			currentItem.setValue(newItem.getValue('fieldImage'), 'fieldImage')
			currentItem.setLinkedRecords(newItem.getLinkedRecords('users'), 'users')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class UpdateCompositionMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation {updateComposition}`;
  }

  getVariables() {
    return {
	    compositionId: this.props.compositionIdVar,
	    composition: {
	      name: this.props.nameVar,
	      owner: this.props.owner.id,
		    fieldImage: this.props.fieldImageVar,
		    users: this.props.usersVar
      },
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on updateCompositionPayload{
        user {
          compositions {
            id
            name
            owner
            fieldImage
            users {
              user {
                id
                pseudo
                avatar
              }
              position {
                xPercentage
                yPercentage
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
        user: this.props.owner.id,
      },
    }];
  }

  static fragments = {
    user: () => Relay.QL`
      fragment on User {
        compositions {
          id
          name
          owner
          fieldImage
          users {
            user {
              id
              pseudo
              avatar
            }
            position {
              xPercentage
              yPercentage
            }
          }
        }
      }
    `,
  };
}
*/