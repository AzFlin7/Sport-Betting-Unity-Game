import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation UpdateSlotMutation($input: updateSlotInput!) {
		updateSlot(input: $input) {
      clientMutationId,
      slot {
        id
        from
        end
        is_repeated
        is_repeated_occurence_number
        number_of_occurences
        usersSlotIsFor {
          id, 
          pseudo,
          avatar
        }
        circlesSlotIsFor (last: 20) {
          edges {
            node {
              id
              name
              memberCount
            }
          }
        }
        price {
          currency
          cents
        }
        status
        sportunity {
          id
          title
          organizers {
            isAdmin
            organizer {
              pseudo
            }
          }
          cancel_date
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
        slot: {
          id: input.slotIDVar, 
          from: input.fromVar,
          end: input.endVar,
          price: input.priceVar,
          usersSlotIsFor: input.usersVar,
          circlesSlotIsFor: input.circlesVar, 
          flexible: input.flexibleVar
      },
      updateSlotSerie: input.updateSlotSerieVar
      }
		}, 
		updater: (store) => { 
			/* const payload = store.getRootField('updateSlot'); 
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

export default class UpdateSlotMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
         updateSlot
      }`
  }
  
  getVariables() {
    return  {
        slot: {
            id: this.props.slotIDVar, 
            from: this.props.fromVar,
            end: this.props.endVar,
            price: this.props.priceVar,
            usersSlotIsFor: this.props.usersVar,
            circlesSlotIsFor: this.props.circlesVar, 
            flexible: this.props.flexibleVar
        },
        updateSlotSerie: this.props.updateSlotSerieVar
    }
  }

  getFatQuery() {
    return Relay.QL`
        fragment on updateSlotPayload {
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