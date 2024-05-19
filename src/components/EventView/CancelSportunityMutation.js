import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation CancelSportunityMutation($input: updateSportunityInput!) {
		updateSportunity(input: $input) {
      clientMutationId,
      edge {
        node {
          id
          status
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
        sportunityID: input.sportunity.id,
        sportunity: {
          cancel_date: new Date(),
          modifyRepeatedSportunities: input.modifyRepeatedSportunities
        },
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('updateSportunity'); 
			const newItem = payload.getLinkedRecord('edge').getLinkedRecord('node'); 
			let currentItem = store.get(input.sportunity.id); 

			currentItem.setValue(newItem.getValue('cancel_date'), 'cancel_date')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class CancelSportunityMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation {updateSportunity}`;
  }

  getVariables() {
    // test status Sportunity
    // canceling

    return {
      sportunityID: this.props.sportunity.id,
      sportunity: {
        cancel_date: new Date(),
        modifyRepeatedSportunities: this.props.modifyRepeatedSportunities
      },
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on updateSportunityPayload{
        viewer {
          sportunity {
						cancel_date
          }
          sportunities(last: 10) {
            edges
          },
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

  getOptimisticResponse() {
    const viewerPayload = { id: this.props.viewer.id };

    return {
      sportunity: {
        id: this.props.sportunity.id,
        cancel_date: new Date(),
      },
      viewer: viewerPayload,
    };
  }

  static fragments = {
    sportunity: () => Relay.QL`
      fragment on Sportunity {
        id,
        cancel_date
      }
    `,
    viewer: () => Relay.QL`
      fragment on Viewer {
        id
        sportunities(last: 10) {
          edges
        },
        me
      }
    `,
  };
}
*/
