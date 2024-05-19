import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation AddMembersMutation($input: addCircleMembersInput!) {
		addCircleMembers(input: $input) {
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
        users: input.newUsersVar,
      }
		}, 
		updater: (store) => { 
		  const payload = store.getRootField('addCircleMembers'); 
			const newItem = payload.getLinkedRecord('edge').getLinkedRecord('node'); 
			let currentItem = store.get(input.idVar); 

			currentItem.setLinkedRecords(newItem.getLinkedRecords('members'), 'members')
      currentItem.setLinkedRecords(newItem.getLinkedRecords('memberParents'), 'memberParents')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class AddMembersMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
      addCircleMembers
    }`
  }
  
  getVariables() {
    return  {
      circleId: this.props.idVar,
      users: this.props.newUsersVar,
    }
  }

  getFatQuery() {
      return Relay.QL`
        fragment on addCircleMembersPayload {
          clientMutationId,
          viewer {
            id,
            me {
              circles
            }
            circle {
              members
              memberCount
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
