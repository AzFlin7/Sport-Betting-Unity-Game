import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation UpdateCalendarMutation($input: upUserInput!) {
		upUser(input: $input) {
      clientMutationId,
      user {
        id
        calendar {
          users {
            id
            pseudo
          }
          sportunities (last: 100) {
            edges {
              node {
                id
              }
            }
          }
          preferences {
            own_synchronized_status
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
        userID: input.userIDVar,
        user: {
          calendar: input.calendarVar
        },
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('upUser'); 
			const newItem = payload.getLinkedRecord('user')
			let currentItem = store.get(input.userIDVar); 

			currentItem.setLinkedRecord(newItem.getLinkedRecord('calendar'), 'calendar')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class UpdateCalendarMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
      upUser
    }`;
  }

  getVariables() {
    return {
      userID: this.props.userIDVar,
      user: {
        calendar: this.props.calendarVar
      },
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on upUserPayload {
        clientMutationId,
        user {
          calendar
        }
        viewer {
          id,
          me {
            calendar
          }
        }
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
        fieldIDs: {
          user: this.props.me.id,
        },
    }];
  }

  static fragments = {
    me: () => Relay.QL`
      fragment on User {
        id,
      }
    `,
  };
}
*/