import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation CircleMutation($input: newCircleInput!) {
		newCircle(input: $input) {
      clientMutationId,
      
		}
	}
`;

function commit(input, {onSuccess: onCompleted, onFailure: onError}) {
	return commitMutation(environment, {
		mutation, 
    variables: {
      input: {
        circle: {
          name: input.nameVar,
          subCircles: input.subCirclesVar,
          owner: input.ownerVar,
          mode: input.modeVar,
          type: input.typeVar,
          sport: input.sportVar,
          address: input.addressVar,
          isCircleUsableByMembers: input.isCircleUsableByMembersVar,
          isCircleAccessibleFromUrl: input.isCircleAccessibleFromUrlVar,
          shouldValidateNewUser: input.shouldValidateNewUser,
        }
      }
    },  
		updater: (store) => { 
			// const payload = store.getRootField('updateCircle'); 
			// const newItem = payload.getLinkedRecord('edge').getLinkedRecord('node'); 
			// let currentItem = store.get(input.idVar); 

			// currentItem.setValue(newItem.getValue('name'), 'name')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class CircleMutation extends Relay.Mutation {

  getMutation() {
    if (this.props.idVar) {
      return Relay.QL`mutation Mutation{
        updateCircle
      }`
    } else {
      return Relay.QL`mutation Mutation{
        newCircle
      }`
    }
  }
  
  getVariables() {
    if (this.props.idVar) {
      return  {
        circleId: this.props.idVar,
        circle: {
          name: this.props.nameVar,
        },
      };
    } else {
      return  {
        circle: {
          name: this.props.nameVar,
          subCircles: this.props.subCirclesVar,
          owner: this.props.ownerVar,
          mode: this.props.modeVar,
          type: this.props.typeVar,
          sport: this.props.sportVar,
          address: this.props.addressVar,
          isCircleUsableByMembers: this.props.isCircleUsableByMembersVar,
          isCircleAccessibleFromUrl: this.props.isCircleAccessibleFromUrlVar,
        },
      };
    }

    
  }

  getFatQuery() {
    if (this.props.idVar) {
      return Relay.QL`
        fragment on updateCirclePayload {
          clientMutationId,
          viewer {
            id,
            me {
              circles
            }
          }
        }
      `
    } else {
      return Relay.QL`
        fragment on newCirclePayload {
          clientMutationId,
          viewer {
            id,
            me {
              circles
              circlesSuperUser
            }
          }
        }
      `
    }
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
        }
        
      }
    `,
  };

}
*/