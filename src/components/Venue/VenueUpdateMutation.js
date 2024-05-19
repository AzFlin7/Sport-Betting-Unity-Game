import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation VenueUpdateMutation($input: updateVenueInput!) {
		updateVenue(input: $input) {
      clientMutationId,
      viewer {
        id,
        me {
          venues(last: 15) {
            edges {
              node {
                id, 
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
      input: {
        venueId: this.props.idVar,
        venue: {
          name: this.props.nameVar,
          address: {
            address: this.props.addressVar,
            city: this.props.cityVar,
            country: this.props.countryVar,
          },
            
        },
      }
    }, 
		updater: (store) => { 
			/* const payload = store.getRootField('updateVenue'); 
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

export default class VenueUpdateMutation extends Relay.Mutation {

  getMutation() {
    if (this.props.idVar) {
      return Relay.QL`mutation Mutation{
        updateVenue
      }`
    } else {
      return Relay.QL`mutation Mutation{
        newVenue
      }`
    }
  }
  
  getVariables() {
    if (this.props.idVar) {
      return  {
        venueId: this.props.idVar,
        venue: {
          name: this.props.nameVar,
          address: {
            address: this.props.addressVar,
            city: this.props.cityVar,
            country: this.props.countryVar,
          },
          
        },
      };
    } else {
      return  {
        venue: {
          name: this.props.nameVar,
          description: this.props.nameVar + ', ' + this.props.cityVar + ', ' + this.props.countryVar,
          address: {
            address: this.props.addressVar,
            city: this.props.cityVar,
            country: this.props.countryVar,
          },
          owner: this.props.userIDVar,
        },
      };
    }

    
  }

  getFatQuery() {
    if (this.props.idVar) {
      return Relay.QL`
        fragment on updateVenuePayload {
          clientMutationId,
          viewer {
            id,
            me {
              venues
            }
          }
        }
      `
    } else {
      return Relay.QL`
        fragment on newVenuePayload {
          clientMutationId,
          viewer {
            id,
            me {
              venues(last: 15) {
                edges {
                  node {
                    id, 
                    name
                  }
                }
              }
            }
          }
        }
      `
    }
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
          venues
        }
        
      }
    `,
  };

}
*/