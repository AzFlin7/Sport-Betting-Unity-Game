import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation UpdateLegalAdvancedMutation($input: upUserInput!) {
		upUser(input: $input) {
      clientMutationId,
      user {
        id
        email
        shouldDeclareVAT
        isProfileComplete
        mangoId
        address {
          address
          city
          country
          zip
          position {
            lat, lng
          }
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
          address: input.addressVar,
          email: input.emailVar,
          business: input.businessVar,
          shouldDeclareVAT: input.shouldDeclareVATVar
        },
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('upUser'); 
			const newItem = payload.getLinkedRecord('user')
			let currentItem = store.get(input.userIDVar); 

			currentItem.setLinkedRecord(newItem.getLinkedRecord('business'), 'business')
			currentItem.setValue(newItem.getValue('shouldDeclareVAT'), 'shouldDeclareVAT')
			currentItem.setValue(newItem.getValue('email'), 'email')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class UpdateLegalAdvancedMutation extends Relay.Mutation {
  
  getMutation() {
    return Relay.QL`mutation Mutation{
      upUser
    }`;
  }
  
  getVariables = () => (
    {
      userID: this.props.userIDVar,
      user: {
        address: this.props.addressVar,
        email: this.props.emailVar,
        business: this.props.businessVar,
        shouldDeclareVAT: this.props.shouldDeclareVATVar
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
          shouldDeclareVAT
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
        user: this.props.userIDVar,
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
        shouldDeclareVAT
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