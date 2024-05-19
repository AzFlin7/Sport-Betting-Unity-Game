import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation CancelEventMutation($input: cancelSportunityInput!) {
		cancelSportunity(input: $input) {
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
        sportunityIDs: input.sportunityIDsVar
      }
		}, 
		updater: (store) => { 
			/* const payload = store.getRootField('cancelSportunity'); 
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

export default class CancelEventMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
      cancelSportunity
    }`;
  }

  getVariables() {
    return {
	    sportunityIDs: this.props.sportunityIDsVar
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on cancelSportunityPayload {
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