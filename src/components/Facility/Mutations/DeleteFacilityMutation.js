import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation DeleteFacilityMutation($input: deleteInfrastructureInput!) {
		deleteInfrastructure(input: $input) {
      clientMutationId,
      edge {
        node {
          id
          infrastructures {
            id
            name
            logo
            sport {
              id
              logo
              name {
                EN
                FR
              }
            }
            authorized_managers {
              user {
                id
                pseudo
              }
              circle {
                id
                name
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
        infrastructureId: input.facilityIdVar, 
      }
		}, 
		updater: (store) => { 
			/* const payload = store.getRootField('deleteInfrastructure'); 
			const newItem = payload.getLinkedRecord('viewer').getLinkedRecord('me'); 
			let currentItem = store.get(input.circleId); 

			currentItem.setLinkedRecords(newItem.getLinkedRecords('infrastructures'), 'infrastructures')*/ 
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class DeleteInfrastructureMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
         deleteInfrastructure
      }`
  }
  
  getVariables() {
    return  {
        infrastructureId: this.props.facilityIdVar, 
    }
  }

  getFatQuery() {
    return Relay.QL`
        fragment on deleteInfrastructurePayload {
          clientMutationId,
          viewer {
            id,
            me
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