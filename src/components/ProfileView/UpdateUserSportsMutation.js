import { commitMutation, graphql } from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment';

const mutation = graphql`
  mutation UpdateUserSportsMutation($input: upUserInput!) {
    upUser(input: $input) {
      clientMutationId
      user {
        id
        sports {
          sport {
            id
            type
            logo
            name {
              EN
              DE
              FR
            }
          }
          levels {
            id
            EN {
              name
            }
            DE {
              name
            }
            FR {
              name
            }
          }
          positions {
            id
            EN
            DE
            FR
          }
          certificates {
            certificate {
              id
              name {
                EN,
                FR,
                DE
              }
            }
          }
          assistantType {
            id,
            name {
              EN,
              DE,
              FR
            }
          }
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

      currentItem.setLinkedRecords(
        newItem.getLinkedRecords('sports'),
        'sports',
      );
      const isPublicProfileComplete = newItem.getValue('isPublicProfileComplete');
      onCompleted(isPublicProfileComplete);
    },
    onError,
  });
}

export default { commit };
