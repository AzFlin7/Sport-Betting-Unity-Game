import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation NewCarPoolingMutation($input: newCarPoolingInput!) {
		newCarPooling(input: $input) {
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
        carPooling: input.carPoolingVar
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('newCarPooling'); 
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

export default class newCarPoolingMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
      newCarPooling
    }`
  }
  
  getVariables() {
    return  {
      sportunityID: this.props.sportunityIDVar,
      carPooling: this.props.carPoolingVar
    }
  }

  getFatQuery() {
      return Relay.QL`
        fragment on newCarPoolingPayload {
          clientMutationId,
          viewer {
            id,
            sportunity 
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
