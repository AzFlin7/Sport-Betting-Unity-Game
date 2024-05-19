import { commitMutation, graphql } from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment';

const mutation = graphql`
  mutation RemoveDocumentMutation($input: userRemoveDocumentInput!) {
    userRemoveDocument(input: $input) {
      clientMutationId
      viewer {
        me {
          id
          documents {
            id,
            name,
            link,
            creation_date
          }
        }
      }
    }
  }
`;

function commit(input, { onSuccess: onCompleted, onFailure: onError }, file) {
  return commitMutation(environment, {
    mutation,
    variables: {
      input: {
        documentId: input.documentId
      },
    },
    updater: store => {
      onCompleted();
    },
    onError,
  });
}

export default { commit };
