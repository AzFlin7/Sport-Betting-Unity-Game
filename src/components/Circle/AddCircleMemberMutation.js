import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation AddCircleMemberMutation($input: addCircleMemberInput!) {
		addCircleMember(input: $input) {
      clientMutationId,
      edge {
        node {
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
          waitingMembers {
            id
            pseudo
            firstName
            lastName
            avatar
            lastConnexionDate
          }
          refusedMembers {
            id
            pseudo
            firstName
            lastName
            avatar
            lastConnexionDate
          }
          isCurrentUserAMember
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
			input: {
        circleId: input.idVar,
        pseudo: input.nameVar,
        email: input.emailVar,
        userId: input.newUserIdVar,
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('addCircleMember'); 
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

export default class CircleMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
      addCircleMember
    }`
  }
  
  getVariables() {
    return  {
      circleId: this.props.idVar,
      pseudo: this.props.nameVar,
      email: this.props.emailVar,
      userId: this.props.newUserIdVar,
    }
  }

  getFatQuery() {
      return Relay.QL`
        fragment on addCircleMemberPayload {
          clientMutationId,
          viewer {
            id,
            me {
              circles
              circlesUserIsIn
            }
            circle {
              members,
              memberParents
              memberCount
            }
          }
          circle {
            members,
            memberParents
            memberCount
          }
        }
      `
   
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
        fieldIDs: {
          viewer: this.props.viewer.id,
          circle: this.props.circle.id,
        },
    }];
  }

  static fragments = {
    viewer: () => Relay.QL`
      fragment on Viewer {
        id,
        me {
          id
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