import { commitMutation, graphql } from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment';

const mutation = graphql`
  mutation OrganizerAddInvitedMutation($input: organizerAddInvitedsInput!) {
    organizerAddInviteds(input: $input) {
      clientMutationId
      edge {
        node {
          invited {
            user {
              id
              pseudo
              avatar
            }
          }
          participants {
            id
            pseudo
            avatar
          }
          status
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
        sportunityID: input.sportunity.id,
        inviteds: input.invitedsVar,
        putInvitedsInCircle: input.putInvitedsInCircleVar,
      },
    },
    updater: store => {
      const payload = store.getRootField('organizerAddInviteds');
      const newItem = payload.getLinkedRecord('edge').getLinkedRecord('node');
      let currentItem = store.get(input.sportunity.id);

      currentItem.setLinkedRecords(
        newItem.getLinkedRecords('invited'),
        'invited',
      );
      currentItem.setLinkedRecords(
        newItem.getLinkedRecords('participants'),
        'participants',
      );
      currentItem.setValue(newItem.getValue('status'), 'status');
      onCompleted();
    },
    onError,
  });
}

export default { commit };

/* ;

export default class OrganizerAddInviteds extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation {organizerAddInviteds}`;
  }

  getVariables() {
    return {
      sportunityID: this.props.sportunity.id,
      inviteds: this.props.invitedsVar,
      putInvitedsInCircle: this.props.putInvitedsInCircleVar
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on organizerAddInvitedsPayload{
        viewer {
            sportunity {
                invited
                participants
                status
            }
        }
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        viewer: this.props.viewer.id,
      },
    }];
  }

  static fragments = {
    viewer: () => Relay.QL`
      fragment on Viewer {
        id
      }
    `,
  };
}
*/
