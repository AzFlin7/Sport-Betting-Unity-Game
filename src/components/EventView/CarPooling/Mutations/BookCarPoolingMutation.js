import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation BookCarPoolingMutation($input: bookCarPoolingInput!) {
		bookCarPooling(input: $input) {
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
        carPoolingID: input.carPoolingIDVar,
        userID: input.userIDVar,
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('bookCarPooling'); 
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

export default class bookCarPoolingMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
      bookCarPooling
    }`
  }
  
  getVariables() {
    return  {
      sportunityID: this.props.sportunityIDVar,
      carPoolingID: this.props.carPoolingIDVar,
      userID: this.props.userIDVar, 
    }
  }

  getFatQuery() {
      return Relay.QL`
        fragment on bookCarPoolingPayload {
          clientMutationId,
          viewer {
            id,
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
    `,
  };

}
*/
