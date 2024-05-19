import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation UpdateFilledInformationMutation($input: updateFilledInformationInput!) {
		updateFilledInformation(input: $input) {
      clientMutationId,
      edge {
        node {
          membersInformation {
            id,
            information,
            user {
              id,
            }
            value
            document {
              id,
              name
            }
            validationStatus
            comment
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
        answers: input.answersVar
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('updateFilledInformation'); 
			const newItem = payload.getLinkedRecord('edge').getLinkedRecord('node'); 
			let currentItem = store.get(input.idVar); 

			currentItem.setLinkedRecords(newItem.getLinkedRecords('membersInformation'), 'membersInformation')
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
      updateFilledInformation
    }`
  }
  
  getVariables() {
    return  {
        circleId: this.props.idVar,
        answers: this.props.answersVar
    }
  }

  getFatQuery() {
      return Relay.QL`
        fragment on updateFilledInformationPayload {
          clientMutationId,
          viewer {
            id,
            me
            circle {
                membersInformation
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