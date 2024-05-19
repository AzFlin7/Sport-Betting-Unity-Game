import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation ReadNotificationsMutation($input: readNotificationsInput!) {
		readNotifications(input: $input) {
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
      input: {
        clientMutationId: input.clientMutationId
      }      
    },
		updater: (store) => { 
			/* const payload = store.getRootField('readNotifications'); 
			const newItem = payload.getLinkedRecord('viewer').getLinkedRecord('me'); 
			let currentItem = store.get(input.circleId); 

			currentItem.setLinkedRecord(newItem.getLinkedRecord('bankAccount'), 'bankAccount')*/ 
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
      readNotifications
    }`;
  }

  getVariables() {
    return {}
  }

  getFatQuery() {
    return Relay.QL`
      fragment on readNotificationsPayload {
        clientMutationId,
        user {
          numberOfUnreadNotifications
          notifications
        }
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        user: this.props.user.id,
      },
    }];
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