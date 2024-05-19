import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation UpdateAskedInformationMutation($input: updateAskedInformationInput!) {
		updateAskedInformation(input: $input) {
      clientMutationId,
      edge {
        node {
          askedInformation {
            id, 
            name,
            type,
            filledByOwner
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
        circleId: input.idVar,
        askedInformation: input.askedInformationVar
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('updateAskedInformation'); 
			const newItem = payload.getLinkedRecord('edge').getLinkedRecord('node'); 
			let currentItem = store.get(input.idVar); 

			currentItem.setLinkedRecords(newItem.getLinkedRecords('askedInformation'), 'askedInformation')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class CircleMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
      updateAskedInformation
    }`
  }
  
  getVariables() {
    return  {
        circleId: this.props.idVar,
        askedInformation: this.props.askedInformationVar
    }
  }

  getFatQuery() {
      return Relay.QL`
        fragment on updateAskedInformationPayload {
          clientMutationId,
          viewer {
            id,
            me
            circle {
                askedInformation
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
        
      }
    `,
  };

}
*/