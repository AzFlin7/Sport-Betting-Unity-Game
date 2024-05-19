import { commitMutation, graphql } from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment';

const mutation = graphql`
  mutation DatasheetNewSportunityMutation($input: newSportunityInput!) {
    newSportunity(input: $input) {
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
        sportunity: input.newSportunity,
        notify_people: input.notify_people,
      },
    },
    onCompleted: (response, errors) => {
      if (errors) {
        onError(errors);
      }
    },
    updater: store => {
      const id = store
        .getRootField('newSportunity')
        .getLinkedRecord('edge')
        .getLinkedRecord('node')
        .getValue('id');
      onCompleted({ id });
    },
    onError,
  });
}

export default { commit };
