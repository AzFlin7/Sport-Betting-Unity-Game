import Relay from 'react-relay';

export default class RemoveFilterMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
      removeStatisticFilter
    }`;
  }

  getVariables() {
    return {
      statisticFilterId: this.props.filterId,
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on removeStatisticFilterPayload {
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
