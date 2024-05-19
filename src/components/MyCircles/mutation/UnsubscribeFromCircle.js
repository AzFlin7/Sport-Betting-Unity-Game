import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation UnsubscribeFromCircleMutation($input: removeCircleMemberInput!) {
		removeCircleMember(input: $input) {
      clientMutationId,
      viewer {
        me {
          id
          circlesUserIsIn (last: 40) {
            edges {
              node {
                id
                members {
                  id
                  pseudo
                  avatar
                  lastConnexionDate
                  sports {
                    sport {
                      id
                      name {
                        EN
                        FR
                        DE
                      }
                    }
                  }
                  sportunityNumber
                }
                isCurrentUserAMember
                memberCount
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
        circleId: input.circleIdVar,
        userId: input.userIdVar
      }
		}, 
		updater: (store) => { 
			/* const payload = store.getRootField('removeCircleMember'); 
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

export default class RemoveCircleMember extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation{ removeCircleMember }`;
  }

  getVariables() {
    return {
        circleId: this.props.circleIdVar,
        userId: this.props.userIdVar
    };
  }

  getFatQuery() {
    return Relay.QL`
        fragment on removeCircleMemberPayload {
        clientMutationId,
        viewer {
            me {
                circlesUserIsIn
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
    `
  };
}*/