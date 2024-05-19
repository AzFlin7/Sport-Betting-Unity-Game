import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation NewOpponentSportunityMutation($input: newOpponentSportunityInput!) {
		newOpponentSportunity(input: $input) {
      clientMutationId,
      edge {
        node {
          id
          game_information {
            opponent {
              organizer {
                id,
                pseudo,
                avatar
              }
              organizerPseudo 
              lookingForAnOpponent
              unknownOpponent
              invitedOpponents (last: 5) {
                edges {
                  node {
                    id,
                    name,
                    memberCount
                    members {
                      id
                    }
                  }
                }
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
        sportunityId: input.sportunity.id,
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('newOpponentSportunity'); 
			const newItem = payload.getLinkedRecord('edge').getLinkedRecord('node'); 
			let currentItem = store.get(input.sportunity.id); 

			currentItem.setLinkedRecord(newItem.getLinkedRecord('game_information'), 'game_information')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class newOpponentSportunityMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation {newOpponentSportunity}`;
  }

  getVariables() {
    return {
      sportunityId: this.props.sportunity.id,
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on newOpponentSportunityPayload{
        viewer {
          me {
            notifications
          }
          sportunities
          sportunity
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
      }
    `,
    user: () => Relay.QL`
      fragment on User {
        id
      }
    `,
  };
}
*/
