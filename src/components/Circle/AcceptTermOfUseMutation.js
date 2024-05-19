import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation AcceptTermOfUseMutation($input: acceptCircleTermsOfUseInput!) {
		acceptTermsOfUse(input: $input) {
      clientMutationId,
      viewer {
        me {
          termsOfUses {
            id
            name
            link
            content
            acceptedBy {
              user {
                id
              }
            }
          }
          circles (last:20) {
            edges {
              node {
                id,
                name
                memberCount
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
        termsOfUseId: input.termsOfUseId,
        userId: input.userId,
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('acceptTermsOfUse'); 
			const newItem = payload.getLinkedRecord('viewer').getLinkedRecord('me'); 
			let currentItem = store.get(input.userId); 

      currentItem.setLinkedRecords(newItem.getLinkedRecords('termsOfUses'), 'termsOfUses')
      /*const circles = ConnectionHandler.getConnection(newItem, 'circles');
      currentItem.setLinkedRecords(newItem.getLinkedRecords('circles'), 'circles')*/
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class AcceptTermOfUseMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
      acceptTermsOfUse
    }`
  }
  
  getVariables() {
    return  {
      termsOfUseId: this.props.termsOfUseId,
      userId: this.props.userId,
    }
  }

  getFatQuery() {
      return Relay.QL`
        fragment on acceptCircleTermsOfUsePayload {
          clientMutationId,
          viewer {
            id,
            me {
              termsOfUses
              circles
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