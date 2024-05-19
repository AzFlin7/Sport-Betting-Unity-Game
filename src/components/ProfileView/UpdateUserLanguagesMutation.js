import { commitMutation, graphql } from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment';

const mutation = graphql`
  mutation UpdateUserLanguagesMutation($input: upUserInput!) {
    upUser(input: $input) {
      clientMutationId
      user {
        id
        languages {
          id
          code
          name
        }
        isPublicProfileComplete
      }
    }
  }
`;

function commit(input, { onSuccess: onCompleted, onFailure: onError }) {
  return commitMutation(environment, {
    mutation,
    variables: {
      input,
    },
    updater: store => {
      const payload = store.getRootField('upUser');
      const newItem = payload.getLinkedRecord('user');
      let currentItem = store.get(input.userID);
      
      currentItem.setLinkedRecords(newItem.getLinkedRecords('languages'), 'languages');
      const isPublicProfileComplete = newItem.getValue('isPublicProfileComplete');
      onCompleted(isPublicProfileComplete);
      },
    onError,
  });
}

export default { commit };
