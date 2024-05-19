import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation UpdateUserProfileMutation($input: upUserInput!) {
		upUser(input: $input) {
      clientMutationId,
      user {
        id
        firstName,
        lastName,
        nationality,
        birthday,
        shouldDeclareVAT,
        address {
          address,
          country,
          city,
          zip,
          position {
            lat,
            lng
          }
        }
        business {
          businessName,
          businessEmail,
          VATNumber,
          headquarterAddress {
            address,
            city,
            country
          }
        }
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
          lastName: input.lastNameVar, 
          firstName: input.firstNameVar,
          address: {
            address:input.addressVar.address,
            city: input.addressVar.city,
            country: input.addressVar.country
          },
          nationality: input.nationalityVar,
          birthday: input.birthdayVar,
          shouldDeclareVAT: input.shouldDeclareVATVar,
          business: {
            businessName: input.businessNameVar,
            businessEmail: input.businessEmailVar,
            headquarterAddress: input.headquarterAddressVar ? {
              address: input.headquarterAddressVar.address,
              city: input.headquarterAddressVar.city,
              country: input.headquarterAddressVar.country
            } : null,
            VATNumber: input.VATNumberVar
          }
        },
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('upUser'); 
			const newItem = payload.getLinkedRecord('user')
			let currentItem = store.get(input.userIDVar); 

      currentItem.setLinkedRecord(newItem.getLinkedRecord('address'), 'address')
      currentItem.setLinkedRecord(newItem.getLinkedRecord('business'), 'business')
      currentItem.setValue(newItem.getValue('firstName'), 'firstName')
      currentItem.setValue(newItem.getValue('lastName'), 'lastName')
      currentItem.setValue(newItem.getValue('nationality'), 'nationality')
      currentItem.setValue(newItem.getValue('birthday'), 'birthday')
      currentItem.setValue(newItem.getValue('shouldDeclareVAT'), 'shouldDeclareVAT')
      currentItem.setValue(newItem.getValue('isProfileComplete'), 'isProfileComplete')

      
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
        lastName: this.props.lastNameVar, 
        firstName: this.props.firstNameVar,
        address: {
          address:this.props.addressVar.address,
          city: this.props.addressVar.city,
          country: this.props.addressVar.country
        },
        nationality: this.props.nationalityVar,
        birthday: this.props.birthdayVar,
        shouldDeclareVAT: this.props.shouldDeclareVATVar,
        business: {
          businessName: this.props.businessNameVar,
          businessEmail: this.props.businessEmailVar,
          headquarterAddress: this.props.headquarterAddressVar ? {
            address: this.props.headquarterAddressVar.address,
            city: this.props.headquarterAddressVar.city,
            country: this.props.headquarterAddressVar.country
          } : null,
          VATNumber: this.props.VATNumberVar
        }
      },

    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on upUserPayload {
        clientMutationId,
        user {
          id
          firstName,
          lastName,
          nationality,
          birthday,
          shouldDeclareVAT,
          address {
            address,
            country,
            city,
            zip,
            position
          }
          business {
            businessName,
            businessEmail,
            VATNumber,
            headquarterAddress {
              address,
              city,
              country
            }
          }
          isProfileComplete
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
