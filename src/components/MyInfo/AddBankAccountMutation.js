import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation AddBankAccountMutation($input: registerBankAccountInput!) {
		registerBankAccount(input: $input) {
      clientMutationId,
      viewer {
        me {
          id
          bankAccount {
            id
            addressLine1
            addressLine2
            city
            postalCode
            country
            ownerName
            IBAN
            BIC
          }
        }
      },
		}
	}
`;

function commit(input, {onSuccess: onCompleted, onFailure: onError}) {
	return commitMutation(environment, {
		mutation, 
		variables: { 
			input : {
        addressLine1: input.addressLine1Var,
        addressLine2: input.addressLine2Var,
        city:input.cityVar,
        postalCode: input.postalCodeVar,
        country: input.countryVar,
        ownerName: input.ownerNameVar,
        IBAN:input.IBANVar,
        BIC: input.BICVar ? input.BICVar : null,
      }
    }, 
    onCompleted: (response, errors) => {
      if (errors) 
        onError(errors)
      else 
        onCompleted()
    },
		updater: (store) => { 
      // console.log("store", store)
      // const payload = store.getRootField('registerBankAccount'); 
      // console.log("payload", payload)
      // if (payload) {
      //   const newItem = payload.getLinkedRecord('viewer').getLinkedRecord('me'); 
      //   let currentItem = store.get(input.user.id); 

      //   newItem && currentItem.setLinkedRecord(newItem.getLinkedRecord('bankAccount'), 'bankAccount')
      //   onCompleted() 
      // }
		}, 
	}) 
} 

export default {commit}



/*;

export default class AddBankAccountMutation extends Relay.Mutation {
  
  getMutation() {
    return Relay.QL`mutation Mutation{
      registerBankAccount
    }`;
  }
  
  getVariables = () => (
    {
      addressLine1: this.props.addressLine1Var,
      addressLine2: this.props.addressLine2Var,
      city:this.props.cityVar,
      postalCode: this.props.postalCodeVar,
      country: this.props.countryVar,
      ownerName: this.props.ownerNameVar,
      IBAN:this.props.IBANVar,
      BIC: this.props.BICVar ? this.props.BICVar : null,
    }
  )
  
  getFatQuery() {
    return Relay.QL`
      fragment on registerBankAccountPayload {
        viewer {
          me {
            bankAccount {
              id
              addressLine1
              addressLine2
              city
              postalCode
              country
              ownerName
              IBAN
              BIC
            }
          }
        },
        clientMutationId
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
        id
        me {
          bankAccount {
            id,
            IBAN
          }
        }
      }
    `,
  };
}*/