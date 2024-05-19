import { commitMutation, graphql } from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment';

const mutation = graphql`
  mutation UpdateUserPseudoMutation($input: upUserInput!) {
    upUser(input: $input) {
      clientMutationId
      user {
        id
        pseudo
        publicAddress {
          city, 
          country
          position {
            lat, 
            lng
          }
        }
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

      currentItem.setValue(newItem.getValue('pseudo'), 'pseudo');
      onCompleted();
    },
    onError,
  });
}

export default { commit };
