import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation NewSlotMutation($input: newSlotInput!) {
		newSlot(input: $input) {
      clientMutationId,
		}
	}
`;

function commit(input, {onSuccess: onCompleted, onFailure: onError}) {
	return commitMutation(environment, {
		mutation, 
		variables: { 
			input : {
        venueId: input.venueIDVar,
        infrastructureId: input.infrastructureIDVar,
        slot: {
            from: input.fromVar,
            end: input.endVar,
            price: input.priceVar,
            usersSlotIsFor: input.usersVar,
            circlesSlotIsFor: input.circlesVar, 
            flexible: input.flexibleVar
        },
        repetitionNumber: input.repetitionNumberVar
      }
		}, 
		updater: (store) => { 
			/* const payload = store.getRootField('newSlot'); 
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

export default class NewSlotMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
         newSlot
      }`
  }
  
  getVariables() {
    return  {
        venueId: this.props.venueIDVar,
        infrastructureId: this.props.infrastructureIDVar,
        slot: {
            from: this.props.fromVar,
            end: this.props.endVar,
            price: this.props.priceVar,
            usersSlotIsFor: this.props.usersVar,
            circlesSlotIsFor: this.props.circlesVar, 
            flexible: this.props.flexibleVar
        },
        repetitionNumber: this.props.repetitionNumberVar
    }
  }

  getFatQuery() {
    return Relay.QL`
        fragment on newSlotPayload {
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