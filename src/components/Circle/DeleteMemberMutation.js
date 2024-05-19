import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation DeleteMemberMutation($input: removeCircleMemberInput!) {
		removeCircleMember(input: $input) {
      clientMutationId,
      edge {
        node {
          waitingMembers {
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
          refusedMembers {
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
          memberParents {
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
          memberCount
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
        circleId: input.idVar,
        pseudo: input.nameVar,
        userId: input.removedUserIdVar,
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('removeCircleMember'); 
			const newItem = payload.getLinkedRecord('edge').getLinkedRecord('node'); 
			let currentItem = store.get(input.idVar); 

			currentItem.setLinkedRecords(newItem.getLinkedRecords('members'), 'members')
      currentItem.setLinkedRecords(newItem.getLinkedRecords('memberParents'), 'memberParents')
      currentItem.setValue(newItem.getValue('memberCount'), 'memberCount'); 
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class DeleteMemberMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
      removeCircleMember
    }`
  }
  
  getVariables() {
    return  {
      circleId: this.props.idVar,
      pseudo: this.props.nameVar,
      userId: this.props.removedUserIdVar,
    
    }
  }

  getFatQuery() {
      return Relay.QL`
        fragment on removeCircleMemberPayload {
          clientMutationId,
          viewer {
            id,
            me {
              circles
            }
            circle {
              members,
            }
          }
        }
      `
   
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
        id,
        me {
          id
          circles(last: 100) {
            edges {
              node {
                memberCount
              }
            }
          }
        }
        
      }
    `,
    circle: () => Relay.QL`
    fragment on Circle {
      id,
    }
  `
  };

}
*/
