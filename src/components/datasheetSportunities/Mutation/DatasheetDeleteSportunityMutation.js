import { commitMutation, graphql } from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment';

const mutation = graphql`
  mutation DatasheetDeleteSportunityMutation($input: deleteSportunityInput!) {
    deleteSportunity(input: $input) {
      edge {
        node {
          id
        }
      }
    }
  }
`;

function commit(input, { onSuccess: onCompleted, onFailure: onError }) {
  return commitMutation(environment, {
    mutation,
    variables: {
      input: {
        sportunityID: input.sportunityID,
      },
    },
    onCompleted: (response, errors) => {
      if (response && !errors) {
        onCompleted();
      } else if (errors) {
        onError(errors);
      }
    },
    onError,
  });
}

export default { commit };
