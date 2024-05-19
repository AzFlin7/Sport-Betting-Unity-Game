import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation UpdateSportunityMutation($input: updateSportunityInput!) {
		updateSportunity(input: $input) {
      clientMutationId,
      edge {
        node {
          id,
          title
          description
          kind
          privacy_switch_preference {
            privacy_switch_type,
            switch_privacy_x_days_before
          }
          participants {
            id
            avatar
            pseudo
          },
          waiting {
            id,
            pseudo
            avatar
          }
          invited {
            user {
              id,
              pseudo
            }
            answer
          }
          survey {
            isSurveyTransformed
            surveyDates {
              beginning_date
              ending_date
            }
          }
          invited_circles (last: 10) {
            edges {
              node {
                id,
                name,
                members {
                  id
                }
              }
            }
          }
          price_for_circle {
            circle {
              id
            }
            price {
              cents,
              currency
            }
            participantByDefault
            excludedParticipantByDefault {
              excludedMembers {
                id
                pseudo
              }
            }
          }
          notification_preference {
            notification_type,
            send_notification_x_days_before
          }
          participantRange {
            from
            to
          }
          beginning_date
          ending_date
          price {
            currency,
            cents,
          },
          sport {
            sport {
              id,
              name {
                EN
              }
              logo
            }
            positions {
              id
              EN
            }
            certificates {
              id,
              name {
                EN
              }
            }
            levels {
              id
              EN {
                name
                skillLevel
              }
            }
          }
          address {
            address
            country
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
            }
            isAdmin
            role
            price {
              cents,
              currency
            }
          }
          pendingOrganizers {
            id
            circles (last: 20) {
              edges {
                node {
                  id, 
                  name,
                  memberCount
                }
              }
            }
            isAdmin
            role
            price {
              cents,
              currency
            },
            secondaryOrganizerType {
              id
            }
            customSecondaryOrganizerType
          }
          venue {
            id
            name
            address {
              address,
              city,
              country
            }
          }
          infrastructure {
            id
            name
          }
          slot {
            id
            from
            end
          }
          status
          ageRestriction {from, to},
          sexRestriction,
          sportunityType {
            id,
            name {
              FR,
              EN
            }
          }
        }
      }
		}
	}
`;

function commit(input, {onSuccess: onCompleted, onFailure: onError}) {
	return commitMutation(environment, {
		mutation, 
		variables: { 
			input : {
        sportunityID: input.sportunity.id,
        sportunity: {
          title: input.sportunity.title,
          description: input.sportunity.description,
          address: input.sportunity.address,
          venue: input.sportunity.venue,
          infrastructure: input.sportunity.infrastructure,
          slot: input.sportunity.slot,
          organizers: input.sportunity.organizers,
          pendingOrganizers: input.sportunity.pendingOrganizers,
          secondaryOrganizersPaymentMethod: input.sportunity.secondaryOrganizersPaymentMethod,
          secondaryOrganizersPaymentByWallet: input.sportunity.secondaryOrganizersPaymentByWallet,
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
          participants: input.sportunity.participants, 
          invited: input.sportunity.invited,
          invited_circles: input.sportunity.invited_circles,
          price_for_circle: input.sportunity.price_for_circle,
          notification_preference: input.sportunity.notification_preference,
          privacy_switch_preference: input.sportunity.privacy_switch_preference,
          modifyRepeatedSportunities: input.modifyRepeatedSportunities,
          hide_participant_list: input.sportunity.hide_participant_list,
          sportunityType: input.sportunity.sportunityType,
          game_information: input.sportunity.game_information
        },
        notify_people: input.notify_people,
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('updateSportunity'); 
			const newItem = payload.getLinkedRecord('edge').getLinkedRecord('node'); 
			// let currentItem = store.get(input.sportunity.id); 

      //  currentItem.setLinkedRecords(newItem.getLinkedRecords('organizers'), 'organizers')
      //  currentItem.setLinkedRecords(newItem.getLinkedRecords('pendingOrganizers'), 'pendingOrganizers')
      //  currentItem.setLinkedRecords(newItem.getLinkedRecords('survey_dates'), 'survey_dates')
      //  currentItem.setLinkedRecords(newItem.getLinkedRecords('participants'), 'participants')
      //  currentItem.setLinkedRecords(newItem.getLinkedRecords('invited'), 'invited')
      //  currentItem.setLinkedRecords(newItem.getLinkedRecords('invited_circles'), 'invited_circles')
      //  currentItem.setLinkedRecords(newItem.getLinkedRecords('price_for_circle'), 'price_for_circle')

      //  currentItem.setLinkedRecord(newItem.getLinkedRecord('address'), 'address')
      //  currentItem.setLinkedRecord(newItem.getLinkedRecord('venue'), 'venue')
      //  currentItem.setLinkedRecord(newItem.getLinkedRecord('infrastructure'), 'infrastructure')
      //  currentItem.setLinkedRecord(newItem.getLinkedRecord('slot'), 'slot')
      //  currentItem.setLinkedRecord(newItem.getLinkedRecord('sport'), 'sport')
      //  currentItem.setLinkedRecord(newItem.getLinkedRecord('participantRange'), 'participantRange')
      //  currentItem.setLinkedRecord(newItem.getLinkedRecord('price'), 'price')
      //  currentItem.setLinkedRecord(newItem.getLinkedRecord('ageRestriction'), 'ageRestriction')
      //  currentItem.setLinkedRecord(newItem.getLinkedRecord('sexRestriction'), 'sexRestriction')
      //  currentItem.setLinkedRecord(newItem.getLinkedRecord('notification_preference'), 'notification_preference')
      //  currentItem.setLinkedRecord(newItem.getLinkedRecord('privacy_switch_preference'), 'privacy_switch_preference')
      //  currentItem.setLinkedRecord(newItem.getLinkedRecord('sportunityType'), 'sportunityType')
      //  currentItem.setLinkedRecord(newItem.getLinkedRecord('game_information'), 'game_information')
       
      //  currentItem.setValue(newItem.getValue('title'), 'title')
      //  currentItem.setValue(newItem.getValue('description'), 'description')
      //  currentItem.setValue(newItem.getValue('secondaryOrganizersPaymentByWallet'), 'secondaryOrganizersPaymentByWallet')
      //  currentItem.setValue(newItem.getValue('mode'), 'mode')
      //  currentItem.setValue(newItem.getValue('kind'), 'kind')
      //  currentItem.setValue(newItem.getValue('beginning_date'), 'beginning_date')
      //  currentItem.setValue(newItem.getValue('ending_date'), 'ending_date')
       
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class UpdateSportunityMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation {updateSportunity}`;
  }

  getVariables() {
    return {
      sportunityID: this.props.sportunity.id,
      sportunity: {
        title: this.props.sportunity.title,
        description: this.props.sportunity.description,
        address: this.props.sportunity.address,
        venue: this.props.sportunity.venue,
        infrastructure: this.props.sportunity.infrastructure,
        slot: this.props.sportunity.slot,
        organizers: this.props.sportunity.organizers,
        pendingOrganizers: this.props.sportunity.pendingOrganizers,
        secondaryOrganizersPaymentMethod: this.props.sportunity.secondaryOrganizersPaymentMethod,
        secondaryOrganizersPaymentByWallet: this.props.sportunity.secondaryOrganizersPaymentByWallet,
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
        participants: this.props.sportunity.participants, 
        invited: this.props.sportunity.invited,
        invited_circles: this.props.sportunity.invited_circles,
        price_for_circle: this.props.sportunity.price_for_circle,
        notification_preference: this.props.sportunity.notification_preference,
        privacy_switch_preference: this.props.sportunity.privacy_switch_preference,
        modifyRepeatedSportunities: this.props.modifyRepeatedSportunities,
        hide_participant_list: this.props.sportunity.hide_participant_list,
        sportunityType: this.props.sportunity.sportunityType,
        game_information: this.props.sportunity.game_information
      },
      notify_people: this.props.notify_people,
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on updateSportunityPayload{
        viewer {
          sportunity {
						id,
            title
            description
            kind
            privacy_switch_preference {
              privacy_switch_type,
              switch_privacy_x_days_before
            }
            participants {
              id
              avatar
              pseudo
            },
            waiting {
              id,
              pseudo
              avatar
            }
            invited {
              user {
                id,
                pseudo
              }
              answer
            }
            survey {
              isSurveyTransformed
              surveyDates {
                beginning_date
                ending_date
              }
            }
            invited_circles (last: 10) {
              edges {
                node {
                  id,
                  name,
                  members {
                    id
                  }
                }
              }
            }
            price_for_circle
            notification_preference {
              notification_type,
              send_notification_x_days_before
            }
            participantRange {
              from
              to
            }
            beginning_date
            ending_date
            price {
              currency,
              cents,
            },
            sport {
              sport {
                id,
                name {
                  EN
                }
                logo
              }
              positions {
                id
                EN
              }
              certificates {
                id,
                name {
                  EN
                }
              }
              levels {
                id
                EN {
                  name
                  skillLevel
                }
              }
            }
            address {
              address
              country
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
              }
              isAdmin
              role
              price {
                cents,
                currency
              }
            }
            pendingOrganizers {
              id
              circles (last: 20) {
                edges {
                  node {
                    id, 
                    name,
                    memberCount
                  }
                }
              }
              isAdmin
              role
              price {
                cents,
                currency
              },
              secondaryOrganizerType {
                id
              }
              customSecondaryOrganizerType
            }
            venue {
              id
              name
              address {
                address,
                city,
                country
              }
            }
            infrastructure {
              id
              name
            }
            slot {
              id
              from
              end
            }
            status
            ageRestriction {from, to},
            sexRestriction,
            sportunityType {
              id,
              name {
                FR,
                EN
              }
            }
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
        id,
      }
    `,
  };
}
*/