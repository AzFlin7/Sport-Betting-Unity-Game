import Relay from 'react-relay';

export default class UpdateFilterMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
      updateStatisticFilter
    }`;
  }

  getVariables() {
    return {
      name: this.props.name,
      date_begin: this.props.from,
      date_end: this.props.to,
      circleList: this.props.circleList,
      statisticFilterId: this.props.filterId
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on updateStatisticFilterPayload {
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
