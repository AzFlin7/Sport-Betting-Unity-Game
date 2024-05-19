import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation DeleteSlotMutation($input: deleteSlotInput!) {
		deleteSlot(input: $input) {
      clientMutationId,
		}
	}
`;

function commit(input, {onSuccess: onCompleted, onFailure: onError}) {
	return commitMutation(environment, {
		mutation, 
		variables: { 
			input : {
        slotId: input.slotIDVar,
        deleteSlotSerie: input.deleteSlotSerieVar
      }
		}, 
		updater: (store) => { 
			/* const payload = store.getRootField('deleteSlot'); 
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

export default class DeleteSlotMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
         deleteSlot
      }`
  }
  
  getVariables() {
    return  {
        slotId: this.props.slotIDVar,
        deleteSlotSerie: this.props.deleteSlotSerieVar
    }
  }

  getFatQuery() {
    return Relay.QL`
        fragment on deleteSlotPayload {
          clientMutationId,
          viewer {
            id,
            venue {
              infrastructures
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
        venue
        
      }
    `,
  };

}
*/