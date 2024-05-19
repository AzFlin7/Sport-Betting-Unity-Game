import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation NewCompositionMutation($input: newCompositionInput!) {
		newComposition(input: $input) {
      clientMutationId,
      viewer {
        me {
          id
          compositions {
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
		}
	}
`;

function commit(input, {onSuccess: onCompleted, onFailure: onError}) {
	return commitMutation(environment, {
		mutation, 
		variables: { 
			input : {
        composition: {
          name: input.nameVar,
          owner: input.owner.id,
          fieldImage: input.fieldImageVar,
          users: input.usersVar
        },
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('newComposition'); 
			const newItem = payload.getLinkedRecord('viewer').getLinkedRecord('me'); 
			let currentItem = store.get(input.owner.id); 

			currentItem.setLinkedRecords(newItem.getLinkedRecords('compositions'), 'compositions')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class NewCompositionMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation {newComposition}`;
  }

  getVariables() {
    return {
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
      fragment on newCompositionPayload{
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