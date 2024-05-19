import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation AddSecondaryOrganizerMutation($input: addSecondaryOrganizerInput!) {
		addSecondaryOrganizer(input: $input) {
      clientMutationId,
      viewer {
        id
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
          organizer: input.organizerVar.organizer,
          isAdmin: false,
          role: 'COACH',
          secondaryOrganizerType: input.organizerVar.secondaryOrganizerType,
          customSecondaryOrganizerType: input.organizerVar.customSecondaryOrganizerType
        }
      }
		}, 
		updater: (store) => { 
			/* const payload = store.getRootField('addSecondaryOrganizer'); 
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

export default class AddSecondaryOrganizerMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
      addSecondaryOrganizer
    }`;
  }

  getVariables() {
    return {
	    sportunityIDs: this.props.sportunityIDsVar,
	    organizer: {
		    organizer: this.props.organizerVar.organizer,
        isAdmin: false,
		    role: 'COACH',
		    secondaryOrganizerType: this.props.organizerVar.secondaryOrganizerType,
		    customSecondaryOrganizerType: this.props.organizerVar.customSecondaryOrganizerType
      }
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on addSecondaryOrganizerPayload {
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