import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation CancelCarPoolingMutation($input: deleteCarPoolingInput!) {
		deleteCarPooling(input: $input) {
      clientMutationId,
      edge {
        node {
          carPoolings {
            id,
            driver {
                id,
                pseudo,
                avatar
            },
            address {
                address,
                city,
                zip,
                country
            },
            starting_date,
            number_of_sits
            passengers {
                id,
                pseudo,
                avatar
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
        sportunityID: input.sportunityIDVar,
        carPoolingID: input.carPoolingIDVar
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('deleteCarPooling'); 
			const newItem = payload.getLinkedRecord('edge').getLinkedRecord('node'); 
			let currentItem = store.get(input.sportunityIDVar); 

			currentItem.setLinkedRecords(newItem.getLinkedRecords('carPoolings'), 'carPoolings')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class deleteCarPoolingMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
      deleteCarPooling
    }`
  }
  
  getVariables() {
    return  {
      sportunityID: this.props.sportunityIDVar,
      carPoolingID: this.props.carPoolingIDVar
    }
  }

  getFatQuery() {
      return Relay.QL`
        fragment on deleteCarPoolingPayload {
          clientMutationId,
          viewer {
            sportunity {
              carPoolings
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
      }
    `
  };

}
*/
