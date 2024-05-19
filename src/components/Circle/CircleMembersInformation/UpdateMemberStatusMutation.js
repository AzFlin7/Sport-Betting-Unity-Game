import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation UpdateMemberStatusMutation($input: updateCircleMemberStatusInput!) {
		updateMemberStatus(input: $input) {
      clientMutationId,
      edge {
        node {
          memberStatus {
            member {
              id
            }
            status
            starting_date
            ending_date
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
        circleId: input.idVar,
        memberStatus: input.memberStatusVar,
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('updateMemberStatus'); 
			const newItem = payload.getLinkedRecord('edge').getLinkedRecord('node'); 
			let currentItem = store.get(input.idVar); 

			currentItem.setLinkedRecords(newItem.getLinkedRecords('memberStatus'), 'memberStatus')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class UpdateMemberStatusMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
      updateMemberStatus
    }`
  }

  getVariables() {
    return  {
      circleId: this.props.idVar,
      memberStatus: this.props.memberStatusVar,
    }
  }

  getFatQuery() {
    return Relay.QL`
        fragment on updateCircleMemberStatusPayload {
          clientMutationId,
          viewer {
            id,
            me
            circle {
                memberStatus
            }
          }
          circle {
            memberStatus
          }
        }
      `

  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
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
      id
      memberStatus {
        member {
          id
        }
        status
      }
    }`
  };

}*/