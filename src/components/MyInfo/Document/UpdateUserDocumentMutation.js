import { commitMutation, graphql } from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment';

const mutation = graphql`
  mutation UpdateUserDocumentMutation($input: userAddsDocumentInput!) {
    userAddDocument(input: $input) {
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
  let uploadables;

  if (file) {
    uploadables = {
      document: file,
   };
}

  return commitMutation(environment, {
    mutation,
    variables: {
      input: {
        name: input.name
      },
    },
    uploadables,
    updater: store => {
      onCompleted();
    },
    onError,
  });
}

export default { commit };
