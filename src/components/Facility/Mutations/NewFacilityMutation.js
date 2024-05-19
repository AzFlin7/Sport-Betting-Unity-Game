import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation NewFacilityMutation($input: newInfrastructureInput!) {
		newInfrastructure(input: $input) {
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
        venueId: input.venueIDVar,
        infrastructure: {
          name: input.facilityNameVar,
          sport: input.sportsVar,
          authorized_managers: input.authorizedManagersVar
        },
      }
		}, 
		updater: (store) => { 
			/* const payload = store.getRootField('newInfrastructure'); 
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

export default class NewInfrastructureMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
         newInfrastructure
      }`
  }
  
  getVariables() {
    return  {
        venueId: this.props.venueIDVar,
        infrastructure: {
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
        fragment on newInfrastructurePayload {
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