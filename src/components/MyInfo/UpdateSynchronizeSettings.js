import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation UpdateSynchronizeSettingsMutation($input: upUserInput!) {
		upUser(input: $input) {
      clientMutationId,
      user {
        id,
        calendar {
          users {
            id
            pseudo
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
          calendar: {
            preferences: {
              own_synchronized_status: input.own_synchronized_statusVar,
            }
          }
        }
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

export default class UpdateSynchronizeSettings extends  Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation Mutation{
      upUser
    }`;
  }

  getVariables() {
    return {
      userID: this.props.userIDVar,
      user: {
        calendar: {
          preferences: {
            own_synchronized_status: this.props.own_synchronized_statusVar,
          }
        }
      }
    }
  }

  getFatQuery() {
    return Relay.QL`
    fragment on upUserPayload {
      clientMutationId,
      viewer
      user {
        id,
        calendar {
          preferences {
            own_synchronized_status
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
          user: this.props.userIDVar,
        },
    }];
  }

  static fragments = {
    user: () => Relay.QL`
      fragment on User{
        id,
        calendar {
          preferences {
            own_synchronized_status
          }
        }
      }
    `
  }
}*/