import { commitMutation, graphql } from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment';

const mutation = graphql`
  mutation UpdateUserGenderMutation($input: upUserInput!) {
    upUser(input: $input) {
      clientMutationId
      user {
        id
        sex
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

      currentItem.setValue(newItem.getValue('sex'), 'sex');
      const isPublicProfileComplete = newItem.getValue('isPublicProfileComplete');
      onCompleted(isPublicProfileComplete);
    },
    onError,
  });
}

export default { commit };
