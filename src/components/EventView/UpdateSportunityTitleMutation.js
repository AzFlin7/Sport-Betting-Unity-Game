import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment';

const mutation = graphql`
	mutation UpdateSportunityTitleMutation($input: updateSportunityInput!) {
		updateSportunity(input: $input) {
      clientMutationId,
      edge {
          node {
              title
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
        sportunityID: input.sportunity.id,
        sportunity: {
          title: input.title
        },
      }
    },
    updater: (store) => {
      const payload = store.getRootField('updateSportunity');
      const newItem = payload.getLinkedRecord('edge').getLinkedRecord('node');
      let currentItem = store.get(input.sportunity.id);

      currentItem.setValue(newItem.getValue('title'), 'title')
      onCompleted()
    },
    onError
  })
}

export default {commit}
