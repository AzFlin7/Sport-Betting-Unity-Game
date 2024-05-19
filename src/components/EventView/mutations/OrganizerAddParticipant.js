import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation OrganizerAddParticipantMutation($input: organizerAddParticipantsInput!) {
		organizerAddParticipants(input: $input) {
      clientMutationId,
      edge {
        node {
          participants {
            id
            pseudo 
            avatar
          }
          waiting {
            id
            pseudo 
            avatar
          }
          invited {
            user {
              id
              pseudo 
              avatar
            }
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
        participants: input.participantsVar, 
        putParticipantsInCircle: input.putParticipantsInCircleVar
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('organizerAddParticipants'); 
			const newItem = payload.getLinkedRecord('edge').getLinkedRecord('node'); 
			let currentItem = store.get(input.sportunity.id); 

      currentItem.setLinkedRecords(newItem.getLinkedRecords('participants'), 'participants')
      currentItem.setLinkedRecords(newItem.getLinkedRecords('waiting'), 'waiting')
      currentItem.setLinkedRecords(newItem.getLinkedRecords('invited'), 'invited')
      currentItem.setValue(newItem.getValue('status'), 'status')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class OrganizerAddParticipants extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation {organizerAddParticipants}`;
  }

  getVariables() {
    return {
      sportunityID: this.props.sportunity.id,
      participants: this.props.participantsVar, 
      putParticipantsInCircle: this.props.putParticipantsInCircleVar
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on organizerAddParticipantsPayload{
        viewer {
            sportunity {
                participants
                waiting
                invited
                status
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
  };
}
*/