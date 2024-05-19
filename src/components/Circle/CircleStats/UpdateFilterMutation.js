import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation UpdateFilterMutation($input: updateStatisticFilterInput!) {
		updateStatisticFilter(input: $input) {
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
	}
`;

function commit(input, {onSuccess: onCompleted, onFailure: onError}) {
	return commitMutation(environment, {
		mutation, 
		variables: { 
			input : {
        name: input.name,
        date_begin: input.from,
        date_end: input.to,
        circleList: input.circleList,
        statisticFilterId: input.filterId
      }
		}, 
		updater: (store) => { 
			/* const payload = store.getRootField('updateStatisticFilter'); 
			const newItem = payload.getLinkedRecord('viewer').getLinkedRecord('me'); 
			let currentItem = store.get(input.circleId); 

      currentItem.setLinkedRecord(newItem.getLinkedRecord('bankAccount'), 'bankAccount')*/ 
      
      const payload = store.getRootField('updateStatisticFilter');
      const newItem = payload.getLinkedRecord('user');
      const currentItem = store.get(input.userId);
      currentItem.setLinkedRecords(newItem.getLinkedRecords('statisticFilters'), 'statisticFilters');
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

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
*/
