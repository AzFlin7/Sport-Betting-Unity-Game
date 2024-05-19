import { commitMutation, graphql } from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment';

const mutation = graphql`
  mutation NewGroupMutation($input: newCircleInput!) {
    newCircle(input: $input) {
      edge {
        node {
          id
        }
      }
    }
  }
`;

function commit(input, { onSuccess, onError }) {
  return commitMutation(environment, {
    mutation,
    variables: {
      input: {
        circle: input.group
      }
    },
    onCompleted: (response, error) => {
      if(response.newCircle && !error) {
        onSuccess(response);
      } else {
        onError(error);
      }
    },
    onError,
  });
}

export default { commit };
