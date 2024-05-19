import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation UpdateCountryMutation($input: upUserInput!) {
		upUser(input: $input) {
      clientMutationId,
      user {
        id
        appCountry
        appCurrency
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
          appCountry: input.countryVar,
          appCurrency: input.currencyVar,
        },
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('upUser'); 
			const newItem = payload.getLinkedRecord('user')
			let currentItem = store.get(input.userIDVar); 

			currentItem.setValue(newItem.getValue('appCountry'), 'appCountry')
			currentItem.setValue(newItem.getValue('appCurrency'), 'appCurrency')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class UpdateCountryMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation Mutation{
      upUser
    }`;
  }

  getVariables() {
    return {
      userID: this.props.userIDVar,
      user: {
        appCountry: this.props.countryVar,
        appCurrency: this.props.currencyVar,
      },
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on upUserPayload {
        clientMutationId,
        user {
          id
          appCountry
          appCurrency
        }
      }
    `;
  }

  getConfigs() {
    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: {
          user: this.props.userIDVar,
        },
      },
    ];
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