import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation UpdateSportunityStatisticsMutation($input: updateSportunityStatisticsInput!) {
		updateSportunityStatistic(input: $input) {
      clientMutationId,
      sportunityStatistics {
        statisticName {
          id,
          name
        },
        participant {
            id
            pseudo
            avatar
        }
        value
      }
		}
	}
`;

function commit(input, {onSuccess: onCompleted, onFailure: onError}) {
	return commitMutation(environment, {
		mutation, 
		variables: { 
			input : {
        sportunityID: input.sportunityIDVar,
        sportunityStatistics: input.sportunityStatisticsVar,
      }
		}, 
		updater: (store) => { 
			/*const payload = store.getRootField('updateSportunityStatistic'); 
			const newItem = payload.getLinkedRecords('sportunityStatistics')
			let currentItem = store.get(input.sportunityIDVar); 

			currentItem.setLinkedRecord(newItem.getLinkedRecord('bankAccount'), 'bankAccount')*/
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class UpdateSportunityStatisticsMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
      updateSportunityStatistic
    }`
  }
  
  getVariables() {
    return  {
      sportunityID: this.props.sportunityIDVar,
      sportunityStatistics: this.props.sportunityStatisticsVar,
    }
  }

  getFatQuery() {
      return Relay.QL`
        fragment on updateSportunityStatisticsPayload {
          clientMutationId,
          viewer {
            id,
            sportunityStatistics
          }
        }
      `
   
  }

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
*/