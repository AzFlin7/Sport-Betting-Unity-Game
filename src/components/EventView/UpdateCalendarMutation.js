import Relay from 'react-relay';

export default class UpdateCalendarMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
      upUser
    }`;
  }

  getVariables() {
    return {
      userID: this.props.userIDVar,
      user: {
        calendar: this.props.calendarVar
      },
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on upUserPayload {
        clientMutationId,
        user {
          calendar
        }
        viewer {
          id,
          me {
            calendar
          }
        }
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
        id,
      }
    `,
  };
}
