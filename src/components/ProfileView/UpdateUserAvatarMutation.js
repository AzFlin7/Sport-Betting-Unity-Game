import { commitMutation, graphql } from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment';

const mutation = graphql`
  mutation UpdateUserAvatarMutation($input: upUserInput!) {
    upUser(input: $input) {
      clientMutationId
      user {
        id
        avatar
      }
    }
  }
`;

function commit(input, { onSuccess: onCompleted, onFailure: onError }, file) {
  let uploadables;
  console.log({ file, input })
  
  if (file) {
    uploadables = {
      avatars: file,
    };
  }

  return commitMutation(environment, {
    mutation,
    variables: {
      input: {
        userID: input.userID,
        user: {},
      },
    },
    uploadables,
    updater: store => {
      const payload = store.getRootField('upUser');
      const newItem = payload.getLinkedRecord('user');
      let currentItem = store.get(input.userID);

      currentItem.setValue(newItem.getValue('avatar'), 'avatar');
      onCompleted();
    },
    onError,
  });
}

export default { commit };
