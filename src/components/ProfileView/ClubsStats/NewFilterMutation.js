import Relay from 'react-relay';

export default class NewFilterMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
      newStatisticFilter
    }`;
  }

  getVariables() {
    return {
      name: this.props.name,
      date_begin: this.props.from,
      date_end: this.props.to,
      circleList: this.props.circleList
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on newStatisticFilterPayload {
        clientMutationId,
        user {
          statisticFilters {
            id
            name
            date_begin
            date_end
            circleList(first: 100) {
              edges { 
                node { 
                  name
                }
              }
            }
          }
        }
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        user: this.props.userId,
      },
    }];
  }

  static fragments = {
    user: () => Relay.QL`
      fragment on User {
        id,
        statisticFilters {
          id
          name
          date_begin
          date_end
          circleList(first: 100)
          {
            edges { 
              node { 
                name
              }
            }
          }
        }
      }
    `,
  };
}
