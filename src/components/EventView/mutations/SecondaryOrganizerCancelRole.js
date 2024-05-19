import { commitMutation, graphql } from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment';

const mutation = graphql`
  mutation SecondaryOrganizerCancelRoleMutation(
    $input: secondaryOrganizerCancelRoleInput!
  ) {
    secondaryOrganizerCancelRole(input: $input) {
      clientMutationId
      edge {
        node {
          id
          organizers {
            organizer {
              id
              pseudo
              avatar
              feedbacks {
                feedbacksList(last: 100) {
                  edges {
                    node {
                      author {
                        id
                      }
                    }
                  }
                }
              }
            }
            isAdmin
            role
            secondaryOrganizerType {
              id
              name {
                FR
                EN
                DE
                ES
              }
            }
            customSecondaryOrganizerType
            price {
              cents
              currency
            }
            permissions {
              chatAccess {
                view
                edit
              }
              memberAccess {
                view
                edit
              }
              carPoolingAccess {
                view
                edit
              }
              imageAccess {
                view
                edit
              }
              detailsAccess {
                view
                edit
              }
              compositionAccess {
                view
                edit
              }
            }
          }
          pendingOrganizers {
            id
            circles(last: 20) {
              edges {
                node {
                  id
                  members {
                    id
                  }
                  name
                  memberCount
                }
              }
            }
            isAdmin
            role
            secondaryOrganizerType {
              id
              name {
                FR
                EN
                DE
                ES
              }
            }
            customSecondaryOrganizerType
            price {
              cents
              currency
            }
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
        cancelSerie: input.cancelSerieVar,
      },
    },
    updater: store => {
      const payload = store.getRootField('secondaryOrganizerCancelRole');
      const newItem = payload.getLinkedRecord('edge').getLinkedRecord('node');
      let currentItem = store.get(input.sportunity.id);

      currentItem.setLinkedRecords(
        newItem.getLinkedRecords('organizers'),
        'organizers',
      );
      currentItem.setLinkedRecords(
        newItem.getLinkedRecords('pendingOrganizers'),
        'pendingOrganizers',
      );
      currentItem.setValue(newItem.getValue('status'), 'status');
      onCompleted();
    },
    onError,
  });
}

export default { commit };

/*;

export default class SecondaryOrganizerCancelRole extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation {secondaryOrganizerCancelRole}`;
  }

  getVariables() {
    return {
      sportunityID: this.props.sportunity.id,
      cancelSerie: this.props.cancelSerieVar
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on secondaryOrganizerCancelRolePayload{
        viewer {
            sportunity {
                organizers
                pendingOrganizers
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
