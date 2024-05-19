import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation NewFilterMutation($input: newStatisticFilterInput!) {
		newStatisticFilter(input: $input) {
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
                id
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
        circleList: input.circleList
      }
		}, 
		updater: (store) => { 
			/*const newItem = payload.getLinkedRecord('viewer').getLinkedRecord('me'); 
			let currentItem = store.get(input.circleId); 

      currentItem.setLinkedRecord(newItem.getLinkedRecord('bankAccount'), 'bankAccount')*/
      
      const payload = store.getRootField('newStatisticFilter');
      const newItem = payload.getLinkedRecord('user');
      const currentItem = store.get(input.userId);
      const filters = newItem.getLinkedRecords('statisticFilters');

      const newFilter = filters[filters.length - 1];
      const newFilterId = newFilter.getValue('id');

      currentItem.setLinkedRecords(newItem.getLinkedRecords('statisticFilters'), 'statisticFilters');
      onCompleted(newFilterId);

		}, 
		onError 
	}) 
} 

export default {commit}



/*;

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
*/
