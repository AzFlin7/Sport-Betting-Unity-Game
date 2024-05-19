import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation CancelParticipantSportunityMutation($input: updateSportunityInput!) {
		updateSportunity(input: $input) {
      clientMutationId,
      edge {
        node {
          participants {
            id
            avatar
            pseudo
          },
          waiting {
            id
            avatar
            pseudo
          },
          invited {
            user {
              id
              pseudo
              avatar
              firstName
              lastName
              circlesUserIsIn(last: 100) {
                edges {
                  node {
                    name
                  }
                }
              }
            }
            answer
          }
          canceling {
            canceling_user {
              id,
              pseudo,
              avatar
            }
            status
          }
          status
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
        sportunityID: input.sportunity.id,
        sportunity:{
          canceling: input.user,
          ...input.fields,
        },
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('updateSportunity'); 
			const newItem = payload.getLinkedRecord('edge').getLinkedRecord('node'); 
			let currentItem = store.get(input.sportunity.id); 

			currentItem.setLinkedRecords(newItem.getLinkedRecords('participants'), 'participants')
			currentItem.setLinkedRecords(newItem.getLinkedRecords('waiting'), 'waiting')
			currentItem.setLinkedRecords(newItem.getLinkedRecords('canceling'), 'canceling')
			currentItem.setValue(newItem.getValue('status'), 'status')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class CancelParticipantSportunityMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation {updateSportunity}`;
  }

  getVariables() { 
    return {
      sportunityID: this.props.sportunity.id,
      sportunity:{
        canceling: this.props.user,
        ...this.props.fields,
      },
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on updateSportunityPayload{
        viewer {
          sportunities
        }
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        viewer: this.props.viewer.id,
      },
    }];
  }

  getOptimisticResponse() {
    const viewerPayload = { id: this.props.viewer.id };

    return {
      sportunity: {
        id: this.props.sportunity.id,
      },
      viewer: viewerPayload,
    };
  }

  static fragments = {
    sportunity: () => Relay.QL`
      fragment on Sportunity {
        id,
      }
    `,
    viewer: () => Relay.QL`
    fragment on Viewer {
        id
        sportunities(last: 10) {
          edges
        }
      }
    `,
    user: () => Relay.QL`
      fragment on User {
        id
      }
    `,
  };
}*/
