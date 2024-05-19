import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation RemoveSecondaryOrganizerMutation($input: removeSecondaryOrganizerInput!) {
		removeSecondaryOrganizer(input: $input) {
      clientMutationId,
      viewer {
        ...MyEvents_viewer
      }
		}
	}
`;

function commit(input, {onSuccess: onCompleted, onFailure: onError}) {
	return commitMutation(environment, {
		mutation, 
		variables: { 
			input : {
        sportunityIDs: input.sportunityIDsVar,
        organizer: {
          organizer: input.organizerVar.organizer.id,
          isAdmin: false,
          role: input.organizerVar.role,
          secondaryOrganizerType: input.organizerVar.secondaryOrganizerType ? input.organizerVar.secondaryOrganizerType.id : null,
          customSecondaryOrganizerType: input.organizerVar.customSecondaryOrganizerType
        }
      }
		}, 
		updater: (store) => { 
			/* const payload = store.getRootField('removeSecondaryOrganizer'); 
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

export default class RemoveSecondaryOrganizerMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
      removeSecondaryOrganizer
    }`;
  }

  getVariables() {
    return {
	    sportunityIDs: this.props.sportunityIDsVar,
	    organizer: {
		    organizer: this.props.organizerVar.organizer.id,
        isAdmin: false,
		    role: this.props.organizerVar.role,
		    secondaryOrganizerType: this.props.organizerVar.secondaryOrganizerType ? this.props.organizerVar.secondaryOrganizerType.id : null,
		    customSecondaryOrganizerType: this.props.organizerVar.customSecondaryOrganizerType
      }
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on removeSecondaryOrganizerPayload {
        clientMutationId,
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
	  viewer: () => Relay.QL`
      fragment on Viewer {
            id
      }
    `,
  };

}
*/