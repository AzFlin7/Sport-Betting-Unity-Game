import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation UpdateLegalBasicMutation($input: upUserInput!) {
		upUser(input: $input) {
      clientMutationId,
      user {
        id
        isProfileComplete
        mangoId
        business {
          businessName
          businessEmail
          VATNumber
          headquarterAddress {
            address
            city
            country
            zip
          }
        },
        firstName,
        lastName,
        birthday,
        nationality,
        address {
          address
          city
          country
          zip
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
          business: input.businessVar,
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

			currentItem.setLinkedRecord(newItem.getLinkedRecord('business'), 'business')
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

export default class UpdateLegalBasicMutation extends Relay.Mutation {
  
  getMutation() {
    return Relay.QL`mutation Mutation{
      upUser
    }`;
  }
  
  getVariables = () => (
    {
      userID: this.props.userIDVar,
      user: {
        business: this.props.businessVar,
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
        viewer
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
          business {
            businessName
            businessEmail
            VATNumber
            headquarterAddress {
              address
              city
              country
              zip
            }
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
       
        user: this.props.user.id, 
      },
    }];
  }

  static fragments = {
    user: () => Relay.QL`
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
        business {
          businessName
          businessEmail
          VATNumber
          headquarterAddress {
            address
            city
            country
            zip
          }
        }
      }
    `,
    viewer: () => Relay.QL`
      fragment on Viewer {
        id
        me {
          id
        }
      }
    `,
  };
}*/