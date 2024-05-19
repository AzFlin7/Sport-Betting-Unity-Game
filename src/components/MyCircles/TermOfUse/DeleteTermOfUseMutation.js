import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation DeleteTermOfUseMutation($input: removeCircleTermsOfUseInput!) {
		removeTermsOfUse(input: $input) {
      clientMutationId,
      viewer {
        id,
        me {
          id
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
            circles (first: 100) {
              edges {
                node {
                  id 
                  name
                  owner {
                    id
                    pseudo
                  }
                  members {
                    id
                  }
                  type
                  memberCount
                }
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
        termsOfUseId: input.idVar,
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('removeTermsOfUse'); 
			const newItem = payload.getLinkedRecord('viewer').getLinkedRecord('me'); 
			let currentItem = store.get(input.user.id); 

			currentItem.setLinkedRecords(newItem.getLinkedRecords('termsOfUses'), 'termsOfUses')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class deleteTermOfUseMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
      removeTermsOfUse
    }`
  }
  
  getVariables() {
    return  {
      termsOfUseId: this.props.idVar,
    }
  }

  getFatQuery() {
      return Relay.QL`
        fragment on removeCircleTermsOfUsePayload {
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
    user: () => Relay.QL`
      fragment on User {
          id
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
            circles (first: 100) {
              edges {
                node {
                  id 
                  name
                  owner {
                    id
                    pseudo
                  }
                  members {
                    id
                  }
                  type
                  memberCount
                }
              }
            }
          }
      }
    `,
  };

}
*/