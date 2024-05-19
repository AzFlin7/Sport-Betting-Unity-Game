import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation UpdateLanguageMutation($input: upUserInput!) {
		upUser(input: $input) {
      clientMutationId,
      user {
        id
        appLanguage
      }
		}
	}
`;

function commit(input, {onSuccess: onCompleted, onFailure: onError}) {
	return commitMutation(environment, {
		mutation, 
		variables: { 
			input : {
        userID: input.userIDVar,
        user: {
          appLanguage: input.appLanguageVar
        },
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('upUser'); 
			const newItem = payload.getLinkedRecord('user')
			let currentItem = store.get(input.userIDVar); 

			currentItem.setValue(newItem.getValue('appLanguage'), 'appLanguage')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class UpdateLanguageMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
      upUser
    }`;
  }

  getVariables() {
    return {
      userID: this.props.userIDVar,
      user: {
        appLanguage: this.props.appLanguageVar
      },

    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on upUserPayload {
        clientMutationId,
        user {
          id
          appLanguage
        }
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
        fieldIDs: {
          user: this.props.userIDVar,
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