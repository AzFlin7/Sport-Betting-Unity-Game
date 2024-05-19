import Relay from 'react-relay';
/**
*  Add new bank account mutation
*/
export default class ChangePasswordMutation extends Relay.Mutation {
  /**
  *  Mutation
  */
  getMutation() {
    return Relay.QL`mutation Mutation{
      updatePassword 
    }`;
  }
  /**
  *  Variables
  */
  getVariables = () => (
    {
      // viewer: this.props.viewer,
      oldPassword: this.props.oldPasswordVar,
      newPassword: this.props.newPasswordVar,
    }
  )
  /**
  *  Fat query
  */
  getFatQuery() {
    return Relay.QL`
      fragment on updatePasswordPayload {
        viewer {
          me {
            id
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
          id
        }
      }
    `,
  };
}