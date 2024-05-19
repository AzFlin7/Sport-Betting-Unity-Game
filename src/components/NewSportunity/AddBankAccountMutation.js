import Relay from 'react-relay';
/**
*  Add new bank account mutation
*/
export default class AddBankAccountMutation extends Relay.Mutation {
  /**
  *  Mutation
  */
  getMutation() {
    return Relay.QL`mutation Mutation{
      registerBankAccount
    }`;
  }
  /**
  *  Variables
  */
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
  /**
  *  Fat query
  */
  getFatQuery() {
    return Relay.QL`
      fragment on registerBankAccountPayload {
        viewer {
          me {
            bankAccount {
              id
              IBAN
            }
          }
        },
        clientMutationId
      }
    `;
  }

  /**
  *  Config
  */
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
}