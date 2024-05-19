import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation removeEventImageUpdateMutation($input: removeSportunityImageInput!) {
		removeEventImage(input: $input) {
      clientMutationId,
      sportunity {
        id
        images
      }
		}
	}
`;

function commit(input, {onSuccess: onCompleted, onFailure: onError}) {
	return commitMutation(environment, {
		mutation, 
		variables: { 
			input : {
        sportunityID: input.sportunity.id,
        imageUrl: input.url,
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('removeEventImage'); 
			const newItem = payload.getLinkedRecord('sportunity')
			let currentItem = store.get(input.sportunity.id); 

			currentItem.setValue(newItem.getValue('images'), 'images')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class RemoveEventImageUpdateMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
      removeEventImage
    }`;
  }

  getVariables() {
    return {
      sportunityID: this.props.sportunity.id,
      imageUrl: this.props.url,
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on removeSportunityImagePayload{
        viewer {
          sportunity {
            images
          }
        }
        sportunity {
          id
          images
        }
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        sportunity: this.props.sportunity.id,
      },
    }];
  }

  static fragments = {
    sportunity: () => Relay.QL`
      fragment on Sportunity {
        id,
        images
      }
    `,
    viewer: () => Relay.QL`
      fragment on Viewer {
        id,
      }
    `,
  };

}
*/
