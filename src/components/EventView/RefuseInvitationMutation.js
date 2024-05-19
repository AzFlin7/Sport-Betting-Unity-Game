import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation RefuseInvitationMutation($input: updateSportunityInput!) {
		updateSportunity(input: $input) {
      clientMutationId,
      edge {
        node {
          id
          invited {
            user {
              id 
              pseudo
              avatar
            }
          }
          status
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
        sportunityID: input.sportunity.id,
        sportunity:{
          invited: {
            user: input.userId,
            answer: "NO"
          }
        },
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('updateSportunity'); 
			const newItem = payload.getLinkedRecord('edge').getLinkedRecord('node'); 
			let currentItem = store.get(input.sportunity.id); 

			currentItem.setLinkedRecords(newItem.getLinkedRecords('invited'), 'invited')
			currentItem.setValue(newItem.getValue('status'), 'status')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class RefuseInvitationMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation {updateSportunity}`;
  }

  getVariables() { 
    return {
      sportunityID: this.props.sportunity.id,
      sportunity:{
        invited: {
          user: this.props.userId,
          answer: "NO"
        }
      },
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on updateSportunityPayload{
        viewer {
          sportunities
        }
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        viewer: this.props.viewer.id,
      },
    }];
  }

  static fragments = {
    sportunity: () => Relay.QL`
      fragment on Sportunity {
        id,
        invited {
          user {
            id,
            pseudo,
            avatar
          }
          answer
        }
      }
    `,
    viewer: () => Relay.QL`
    fragment on Viewer {
        id
        sportunities(last: 10) {
          edges
        }
      }
    `
  };
}*/
