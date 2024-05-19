import Relay from 'react-relay';
/**
*  change password mutation
*/
export default class UpdatePasswordMutation extends Relay.Mutation {
  /**
  *  Mutation
  */
  getMutation() {
    return Relay.QL`mutation Mutation {upUser}`;
  }
  /**
  *  Variables
  */
  getVariables() {
    return {
      token: this.props.token,
      user: {
        password: this.props.password,
      },
    };
  }
  /**
  *  Fat query
  */
  getFatQuery() {
    return Relay.QL`
      fragment on upUserPayload {
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