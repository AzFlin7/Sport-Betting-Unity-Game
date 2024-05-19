import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation UpdateNaturalBasicMutation($input: upUserInput!) {
		upUser(input: $input) {
      clientMutationId,
      viewer {
        me {
          id
          mangoId
        }
      }
      user {
        id
        email,
        firstName,
        lastName, 
        birthday,
        mangoId
        nationality
        isProfileComplete
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
          firstName: input.firstNameVar,
          lastName: input.lastNameVar,
          birthday: input.birthdayVar,
          nationality: input.nationalityVar,
        },
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('upUser'); 
			const newItem = payload.getLinkedRecord('user')
			let currentItem = store.get(input.userIDVar); 

			currentItem.setValue(newItem.getValue('email'), 'email')
			currentItem.setValue(newItem.getValue('firstName'), 'firstName')
			currentItem.setValue(newItem.getValue('lastName'), 'lastName')
			currentItem.setValue(newItem.getValue('birthday'), 'birthday')
			currentItem.setValue(newItem.getValue('nationality'), 'nationality')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class UpdateNaturalBasicMutation extends Relay.Mutation {
  
  getMutation() {
    return Relay.QL`mutation Mutation{
      upUser
    }`;
  }
  
  getVariables = () => (
    {
      userID: this.props.userIDVar,
      user: {
        email: this.props.emailVar,
        firstName: this.props.firstNameVar,
        lastName: this.props.lastNameVar,
        birthday: this.props.birthdayVar,
        nationality: this.props.nationalityVar,
      },
    }
  )
  
  getFatQuery() {
    return Relay.QL`
      fragment on upUserPayload {
        user {
          id
          profileType
          email
          firstName
          lastName
          birthday
          nationality
          occupation
          incomeRange
          address {
            address
            city
            country
            zip
          }
        }
        clientMutationId
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
        id
        me {
          id
        }
      }
    `,
    user:() => Relay.QL`
    fragment on User {
      id
      profileType
      email
      firstName
      lastName
      birthday
      nationality
      occupation
      incomeRange
      address {
        address
        city
        country
        zip
      }
    }
    `
  };
}*/