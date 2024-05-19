import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation UpdateNotificationMutation($input: upUserInput!) {
		upUser(input: $input) {
      clientMutationId,
      user {
        id
        notification_preferences {
          sportunityBooked
          sportunityBookerCancel
          sportunityNewInvited
          sportunityNewFollower
          sportunityModifiedParticipant					
          sportunityCancelParticipant
          paymentConfirmationOnDDay
          sportunityNewMainOrganizer
          sportunityBookedOrganizer
          sportunityBookerCancelOrganizer
          sportunityCancelMainOrganizer
          sportunityModifiedMainOrganizer					
          paymentReceivedMainOrganizer
          sportunityCompleteStatistics
          sportunityVoteForManOfTheGame
        }
        email_preferences {
          sportunityBooked
          sportunityBookerCancel
          sportunityNewInvited
          sportunityNewFollower
          sportunityModifiedParticipant					
          sportunityCancelParticipant
          chatUnReadMessage
          paymentConfirmationOnDDay
          sportunityNewMainOrganizer
          sportunityBookedOrganizer
          sportunityBookerCancelOrganizer
          sportunityCancelMainOrganizer
          sportunityModifiedMainOrganizer					
          paymentReceivedMainOrganizer
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
        userID: input.userIDVar,
        user: {
          notification_preferences: input.notification_preferencesVar,
          email_preferences: input.email_preferencesVar
        },
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('upUser'); 
			const newItem = payload.getLinkedRecord('user')
			let currentItem = store.get(input.userIDVar); 

			currentItem.setLinkedRecord(newItem.getLinkedRecord('notification_preferences'), 'notification_preferences')
			currentItem.setLinkedRecord(newItem.getLinkedRecord('email_preferences'), 'email_preferences')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class UpdateNotificationMutation extends Relay.Mutation {
  
  getMutation() {
    return Relay.QL`mutation Mutation{
      upUser
    }`;
  }
  
  getVariables = () => (
    {
      userID: this.props.userIDVar,
      user: {
        notification_preferences: this.props.notification_preferencesVar,
        email_preferences: this.props.email_preferencesVar
      },
    }
  )
  
  getFatQuery() {
    return Relay.QL`
      fragment on upUserPayload {
        viewer
        user {
          id
          notification_preferences {
            sportunityBooked
            sportunityBookerCancel
            sportunityNewInvited
            sportunityNewFollower
            sportunityModifiedParticipant					
            sportunityCancelParticipant
            paymentConfirmationOnDDay
            sportunityNewMainOrganizer
            sportunityBookedOrganizer
            sportunityBookerCancelOrganizer
            sportunityCancelMainOrganizer
            sportunityModifiedMainOrganizer					
            paymentReceivedMainOrganizer
            sportunityCompleteStatistics
            sportunityVoteForManOfTheGame
          }
          email_preferences {
            sportunityBooked
            sportunityBookerCancel
            sportunityNewInvited
            sportunityNewFollower
            sportunityModifiedParticipant					
            sportunityCancelParticipant
            chatUnReadMessage
            paymentConfirmationOnDDay
            sportunityNewMainOrganizer
            sportunityBookedOrganizer
            sportunityBookerCancelOrganizer
            sportunityCancelMainOrganizer
            sportunityModifiedMainOrganizer					
            paymentReceivedMainOrganizer
          }
        }
        clientMutationId
      }
    `;
  }

  
  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        user: this.props.userIDVar,
      },
    }];
  }

  static fragments = {
    viewer: () => Relay.QL`
      fragment on Viewer {
        id
        me {
          id
        }
      }
    `,
  };
}*/