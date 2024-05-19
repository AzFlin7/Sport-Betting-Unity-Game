import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation DeleteCircleMutation($input: deleteCircleInput!) {
		deleteCircle(input: $input) {
      clientMutationId,
      viewer {
        id,
      }
		}
	}
`;

function commit(input, {onSuccess: onCompleted, onFailure: onError}) {
	return commitMutation(environment, {
		mutation, 
		variables: { 
			input: {
        circleId: input.idVar,
      }
		}, 
		updater: (store) => { 
			/* const payload = store.getRootField('deleteCircle'); 
			const newItem = payload.getLinkedRecord('viewer').getLinkedRecord('me'); 
			let currentItem = store.get(input.circleId); 

			currentItem.setLinkedRecord(newItem.getLinkedRecord('bankAccount'), 'bankAccount')*/ 
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class CircleMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
      deleteCircle
    }`
  }
  
  getVariables() {
    return  {
      circleId: this.props.idVar,
    
    }
  }

  getFatQuery() {
      return Relay.QL`
        fragment on deleteCirclePayload {
          clientMutationId,
          viewer {
            id,
            me {
              circles
            }
            circle {
              members
            }
          }
        }
      `
   
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
    viewer: () => Relay.QL`
      fragment on Viewer {
        id,
        me {
          id
        }
        
      }
    `,
  };

}
*/
