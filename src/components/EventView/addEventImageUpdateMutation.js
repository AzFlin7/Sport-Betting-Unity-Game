import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation addEventImageUpdateMutation($input: addSportunityImageInput!) {
		addEventImage(input: $input) {
      clientMutationId,
      sportunity {
        id
        images
      }
		}
	}
`;

function commit(input, {onSuccess: onCompleted, onFailure: onError}, file) {
  let uploadables;
  
  if (file) {
    uploadables = {
      eventimage1: file,
    };
  }
  
  return commitMutation(environment, {
		mutation, 
		variables: { 
			input : {
        sportunityID: input.sportunity.id
      }
    }, 
    uploadables,
		updater: (store) => { 
			const payload = store.getRootField('addEventImage'); 
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

export default class AddEventImageUpdateMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
      addEventImage
    }`;
  }

  getVariables() {
    return {
      sportunityID: this.props.sportunity.id,
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on addSportunityImagePayload{
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

  getFiles() {
    return {
      eventimage1: this.props.file,
    };
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
