import { commitMutation, graphql } from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment';

const mutation = graphql`
  mutation NewSportunityMutation($input: newSportunityInput!) {
    newSportunity(input: $input) {
      clientMutationId
      edge {
        node {
          id
          title
          description
          kind
          images
          number_of_occurences
          beginning_date
          ending_date
          survey {
            isSurveyTransformed
            surveyDates {
              beginning_date
              ending_date
              answers {
                user {
                  id
                  pseudo
                  avatar
                }
                answer
              }
            }
          }
          participantRange {
            from
            to
          }
          participants {
            id
            avatar
            pseudo
          }
          invited_circles(last: 10) {
            edges {
              node {
                id
                name
                mode
                type
                members {
                  id
                  pseudo
                  avatar
                }
                owner {
                  id
                  pseudo
                  avatar
                }
                askedInformation {
                  id
                  name
                }
                membersInformation {
                  information
                  user {
                    id
                  }
                  value
                  document {
                    id,
                    name
                  }
                  validationStatus
                  comment
                }
              }
            }
          }
          hide_participant_list
          invited {
            user {
              id
              pseudo
              avatar
            }
          }
          waiting {
            id
            pseudo
            avatar
          }
          price {
            currency
            cents
          }
          address {
            address
            city
            position {
              lat
              lng
            }
          }
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
          sport {
            sport {
              logo
              name {
                EN
                FR
                DE
              }
            }
            allLevelSelected
            levels {
              id
              EN {
                name
                skillLevel
                description
              }
              FR {
                name
                skillLevel
                description
              }
              DE {
                name
                skillLevel
                description
              }
            }
            certificates {
              name {
                EN
                FR
                DE
              }
            }
            positions {
              EN
              FR
              DE
            }
          }
          game_information {
            opponent {
              organizer {
                id
                pseudo
                avatar
              }
              organizerPseudo
              lookingForAnOpponent
              unknownOpponent
              invitedOpponents(last: 5) {
                edges {
                  node {
                    id
                    name
                    memberCount
                    members {
                      id
                    }
                  }
                }
              }
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
        sportunity: {
          title: input.sportunity.title,
          description: input.sportunity.description,
          address: input.sportunity.address,
          venue: input.sportunity.venue,
          infrastructure: input.sportunity.infrastructure,
          slot: input.sportunity.slot,
          organizers: input.sportunity.organizers,
          pendingOrganizers: input.sportunity.pendingOrganizers,
          sport: input.sportunity.sport,
          mode: input.sportunity.mode,
          kind: input.sportunity.kind,
          participantRange: input.sportunity.participantRange,
          price: input.sportunity.price,
          ageRestriction: input.sportunity.ageRestriction,
          sexRestriction: input.sportunity.sexRestriction,
          beginning_date: input.sportunity.beginningDate,
          ending_date: input.sportunity.endingDate,
          survey_dates: input.sportunity.survey_dates,
          repeat: input.sportunity.repeat,
          participants: input.sportunity.participants,
          paymentMethodId: input.sportunity.paymentMethodId,
          secondaryOrganizersPaymentMethod:
            input.sportunity.secondaryOrganizersPaymentMethod,
          secondaryOrganizersPaymentByWallet:
            input.sportunity.secondaryOrganizersPaymentByWallet,
          invited: input.sportunity.invited,
          invited_circles: input.sportunity.invited_circles,
          price_for_circle: input.sportunity.price_for_circle,
          notification_preference: input.sportunity.notification_preference,
          privacy_switch_preference:
            input.sportunity.privacy_switch_preference,
          hide_participant_list: input.sportunity.hide_participant_list,
          sportunityType: input.sportunity.sportunityType,
          game_information: input.sportunity.game_information,
        },
      },
    },
    updater: store => {
      /* const payload = store.getRootField('newSportunity');
			const newItem = payload.getLinkedRecord('viewer').getLinkedRecord('me');
			let currentItem = store.get(input.circleId);

			currentItem.setLinkedRecord(newItem.getLinkedRecord('bankAccount'), 'bankAccount')*/

      onCompleted();
    },
    onError,
  });
}

export default { commit };

/*;

export default class NewSportunityMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation {newSportunity}`;
  }

  getVariables() {
    return {
      sportunity: {
        title: this.props.sportunity.title,
        description: this.props.sportunity.description,
        address: this.props.sportunity.address,
        venue: this.props.sportunity.venue,
        infrastructure: this.props.sportunity.infrastructure,
        slot: this.props.sportunity.slot,
        organizers: this.props.sportunity.organizers,
        pendingOrganizers: this.props.sportunity.pendingOrganizers,
        sport: this.props.sportunity.sport,
        mode: this.props.sportunity.mode,
        kind: this.props.sportunity.kind,
        participantRange: this.props.sportunity.participantRange,
        price: this.props.sportunity.price,
        ageRestriction: this.props.sportunity.ageRestriction,
        sexRestriction: this.props.sportunity.sexRestriction,
        beginning_date: this.props.sportunity.beginningDate,
        ending_date: this.props.sportunity.endingDate,
        survey_dates: this.props.sportunity.survey_dates,
        repeat: this.props.sportunity.repeat,
        participants: this.props.sportunity.participants,
        paymentMethodId: this.props.sportunity.paymentMethodId,
        secondaryOrganizersPaymentMethod: this.props.sportunity.secondaryOrganizersPaymentMethod,
        secondaryOrganizersPaymentByWallet: this.props.sportunity.secondaryOrganizersPaymentByWallet,
        invited: this.props.sportunity.invited,
        invited_circles: this.props.sportunity.invited_circles,
        price_for_circle: this.props.sportunity.price_for_circle,
        notification_preference: this.props.sportunity.notification_preference,
        privacy_switch_preference: this.props.sportunity.privacy_switch_preference,
        hide_participant_list: this.props.sportunity.hide_participant_list,
        sportunityType: this.props.sportunity.sportunityType,
        game_information: this.props.sportunity.game_information
      },
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on newSportunityPayload @relay(pattern: true){
        edge,
        clientMutationId,
        viewer {
          id,
          sportunities
        }
      }
    `;
  }


  getConfigs() {
    return [{
      type: 'RANGE_ADD',
      parentName: 'viewer',
      parentID: this.props.viewerID,
      connectionName: 'SportunityConnection',
      edgeName: 'edge',
      rangeBehaviors: () => 'prepend',
    }];
  }

  static fragments = {
    viewer: () => Relay.QL`
      fragment on Viewer {
        id,
        sportunities(last: 1) {
          edges {
            node {
              id
              title
            }
          }
        }
      }
    `,
  };
}
*/
