import Relay from 'react-relay';
/**
*  change password mutation
*/
export default class ChangePasswordMutation extends Relay.Mutation {
  /**
  *  Mutation
  */
  getMutation() {
    return Relay.QL`mutation Mutation {changePassword}`;
  }
  /**
  *  Variables
  */
  getVariables() {
    return {
      email: this.props.email,
      pseudo: this.props.pseudo,
    };
  }
  /**
  *  Fat query
  */
  getFatQuery() {
    return Relay.QL`
      fragment on changePasswordPayload {
        viewer{
          id
        }
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
        id,
      }
    `,
  };
}