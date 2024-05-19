import { commitMutation, graphql } from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment';

const mutation = graphql`
  mutation NewTimeslotMutation($input: createManySlotInput!) {
    createManySlots(input: $input) {
      clientMutationId
      edge {
      node {
        infrastructures {
          id,
          slots {
            id
            venue{
              id
              },
            infrastructure{
              id
              }
            from
            end
            price{
              cents
              },
            user_creating{
              pseudo
              },
          }
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
      input: {
        venueIds: input.timeslot.venueIds,
        infrastructureIds: input.timeslot.infrastructureIds,
        price: input.timeslot.price,
        privacy: input.timeslot.privacy,
        privacy_switch_preference: input.timeslot.privacy_switch_preference,
        repetition: input.timeslot.repetition,
        usersSlotIsFor: input.timeslot.usersSlotIsFor,
      },
    },
    updater: store => {
      onCompleted();
    },
    onError,
  });
}

export default { commit };
