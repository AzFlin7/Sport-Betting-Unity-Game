import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation UpdateProfileMutation($input: upUserInput!) {
		upUser(input: $input) {
      clientMutationId,
      user {
        firstName,
        lastName,
        isProfileComplete
        address {
          address,
          country,
          city,
          zip,
          position {
            lat, lng
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
        userID: input.userIDVar,
        user: {
          email: input.emailVar,
          lastName: input.lastNameVar, 
          firstName: input.firstNameVar,
          address: input.addressVar,
        },
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('upUser'); 
			const newItem = payload.getLinkedRecord('user')
			let currentItem = store.get(input.userIDVar); 

			currentItem.setLinkedRecord(newItem.getLinkedRecord('address'), 'address')
			currentItem.setValue(newItem.getValue('firstName'), 'firstName')
			currentItem.setValue(newItem.getValue('lastName'), 'lastName')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class UpdateUserProfileMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
      upUser
    }`;
  }

  getVariables() {
    return {
      userID: this.props.userIDVar,
      user: {
        email: this.props.emailVar,
        lastName: this.props.lastNameVar, 
        firstName: this.props.firstNameVar,
        address: this.props.addressVar,
      },

    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on upUserPayload {
        clientMutationId,
        viewer {
          id
          me {
            firstName,
            lastName,
            address {
              address,
              country,
              city,
              zip,
              position
            }
          }
        }
      }
    `;
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