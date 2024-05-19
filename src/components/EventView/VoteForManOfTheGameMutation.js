import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation VoteForManOfTheGameMutation($input: voteForManOfTheGameInput!) {
		voteForManOfTheGame(input: $input) {
      clientMutationId,
      edge {
        node {
          id
          manOfTheGameVotes {
            voter {
              id
              pseudo
            }
            votedFor {
              id
              pseudo
              avatar
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
        sportunityID: input.sportunity.id,
        participantID: input.voterForId,
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('voteForManOfTheGame'); 
			const newItem = payload.getLinkedRecord('edge').getLinkedRecord('node'); 
			let currentItem = store.get(input.sportunity.id); 

			currentItem.setLinkedRecords(newItem.getLinkedRecords('manOfTheGameVotes'), 'manOfTheGameVotes')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class VoteForManOfTheGameMutation extends Relay.Mutation {

    getMutation() {
        return Relay.QL`mutation {voteForManOfTheGame}`;
    }

    getVariables() {
        return {
            sportunityID: this.props.sportunity.id,
            participantID: this.props.voterForId,
        };
    }

    getFatQuery() {
      return Relay.QL`
        fragment on voteForManOfTheGamePayload {
          viewer {
            sportunity {
              manOfTheGameVotes
            }
          }
          edge {
            node {
              manOfTheGameVotes
            }
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

    static fragments = {
      viewer: () => Relay.QL`
        fragment on Viewer {
          id
        }
      `,
      sportunity: () => Relay.QL`
        fragment on Sportunity {
          id
          manOfTheGameVotes {
            voter {
                id
              }
              votedFor {
                  id
                  pseudo,
                  avatar
              }
              date
          }
        }
      `,
    };
}
*/
