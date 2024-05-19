import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation UpdateFacilityMutation($input: updateInfrastructureInput!) {
		updateInfrastructure(input: $input) {
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
        infrastructure: {
          id: input.facilityIdVar, 
          name: input.facilityNameVar,
          sport: input.sportsVar,
          authorized_managers: input.authorizedManagersVar
         
      },
      }
		}, 
		updater: (store) => { 
			/* const payload = store.getRootField('updateInfrastructure'); 
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

export default class UpdateInfrastructureMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
         updateInfrastructure
      }`
  }
  
  getVariables() {
    return  {
        infrastructure: {
            id: this.props.facilityIdVar, 
            name: this.props.facilityNameVar,
            sport: this.props.sportsVar,
            authorized_managers: this.props.authorizedManagersVar
           
        },
    }
  }

  getFiles() {
    return {
      avatars: this.props.photoVar,
    };
  }

  getFatQuery() {
    return Relay.QL`
        fragment on updateInfrastructurePayload {
          clientMutationId,
          viewer {
            id
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