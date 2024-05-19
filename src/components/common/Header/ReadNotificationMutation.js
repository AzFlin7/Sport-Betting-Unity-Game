import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation ReadNotificationMutation($input: readNotificationInput!) {
		readNotification(input: $input) {
      clientMutationId,
      user {
        id
        numberOfUnreadNotifications
        notifications(first: 20) {
          edges {
            node {
              id
              title
              text
              link
              created
              notificationType
              isRead
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
        notificationId: input.notificationIdVar,
      }
		}, 
		updater: (store) => { 
			/*const payload = store.getRootField('readNotification'); 
			const newItem = payload.getLinkedRecord('user')
			let currentItem = store.get(input.circleId); 

			currentItem.setLinkedRecords(newItem.getLinkedRecords('numberOfUnreadNotifications'), 'numberOfUnreadNotifications')*/
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class NotificationMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation Mutation{
      readNotification
    }`;
  }

  getVariables() {
    return {
      notificationId: this.props.notificationIdVar,
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on readNotificationPayload {
        clientMutationId,
        user {
          numberOfUnreadNotifications
          notifications
        }
      }
    `;
  }

  getConfigs() {
    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: {
          user: this.props.user.id,
        },
      },
    ];
  }

  static fragments = {
    user: () => Relay.QL`
      fragment on User {
        id,
        numberOfUnreadNotifications
      }
    `,
  };
}
*/