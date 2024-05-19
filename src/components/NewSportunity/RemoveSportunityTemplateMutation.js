import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation RemoveSportunityTemplateMutation($input: removeSportunityTemplateInput!) {
		removeSportunityTemplate(input: $input) {
      clientMutationId,
      viewer {
        me {
          id
          sportunityTemplates {
            id,
            title
            description
            kind
            privacy_switch_preference {
              privacy_switch_type,
              switch_privacy_x_days_before
            }
            invited {
              user {
                id,
                pseudo
                avatar
              }
              answer
            }
            invited_circles (last: 10) {
              edges {
                node {
                  id,
                  name,
                  members {
                   id
                  }
                  owner {
                    id
                    pseudo
                    avatar
                  }
                  type
                  memberCount
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
            }
            notification_preference {
              notification_type,
              send_notification_x_days_before
            }
            participantRange {
              from
              to
            }
            hide_participant_list
            price {
              currency,
              cents,
            },
            is_repeated_occurence_number
            number_of_occurences
            sport {
              sport {
                id,
                name {
                  EN
                  DE
                  FR
                }
                logo
              }
              positions {
               id
               EN
               FR
               DE
              }
              certificates {
                id,
                name {
                  EN
                  FR
                  DE
                }
              }
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
            }
            ageRestriction {
              from, to
            } 
            sexRestriction
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
              },
              secondaryOrganizerType {
                id
              }
              customSecondaryOrganizerType
            }
            pendingOrganizers { 
              id
              circles (last: 20) {
                edges {
                  node {
                    id, 
                    name,
                    memberCount
                    type
                    members {
                      id
                    }
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
                name {
                  FR
                  EN
                  DE 
                  ES
                }
              }
              customSecondaryOrganizerType
            }
            sportunityType {
              id,
              isScoreRelevant
              name {
                FR,
                EN
              }
            }
            game_information {
              opponent {
                organizer {
                  id, 
                  pseudo,
                  avatar
                }
                organizerPseudo
                lookingForAnOpponent
                invitedOpponents (last: 5) {
                  edges {
                    node {
                      id
                      name
                      memberCount
                    }
                  }
                }
                unknownOpponent
              }
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
        sportunityTemplateId: input.sportunity.id,
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('removeSportunityTemplate'); 
			const newItem = payload.getLinkedRecord('viewer').getLinkedRecord('me'); 
			let currentItem = store.get(input.viewer.me.id); 

			currentItem.setLinkedRecords(newItem.getLinkedRecords('sportunityTemplates'), 'sportunityTemplates')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class RemoveSportunityTemplateMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation {removeSportunityTemplate}`;
  }

  getVariables() {
    return {
      sportunityTemplateId: this.props.sportunity.id,

    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on removeSportunityTemplatePayload{
        viewer {
          id
          me {
            sportunityTemplates {
              id,
              title
              description
              kind
              privacy_switch_preference {
                privacy_switch_type,
                switch_privacy_x_days_before
              }
              invited {
                user {
                  id,
                  pseudo
                  avatar
                }
                answer
              }
              invited_circles (last: 10) {
                edges {
                  node {
                    id,
                    name,
                    members {
                     id
                    }
                    owner {
                      id
                      pseudo
                      avatar
                    }
                    type
                    memberCount
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
              }
              notification_preference {
                notification_type,
                send_notification_x_days_before
              }
              participantRange {
                from
                to
              }
              hide_participant_list
              price {
                currency,
                cents,
              },
              is_repeated_occurence_number
              number_of_occurences
              sport {
                sport {
                  id,
                  name {
                    EN
                    DE
                    FR
                  }
                  logo
                }
                positions {
                 id
                 EN
                 FR
                 DE
                }
                certificates {
                  id,
                  name {
                    EN
                    FR
                    DE
                  }
                }
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
              }
              ageRestriction {
                from, to
              } 
              sexRestriction
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
                },
                secondaryOrganizerType {
                  id
                }
                customSecondaryOrganizerType
              }
              pendingOrganizers { 
                id
                circles (last: 20) {
                  edges {
                    node {
                      id, 
                      name,
                      memberCount
                      type
                      members {
                        id
                      }
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
                  name {
                    FR
                    EN
                    DE 
                    ES
                  }
                }
                customSecondaryOrganizerType
              }
              sportunityType {
                id,
                isScoreRelevant
                name {
                  FR,
                  EN
                }
              }
              game_information {
                opponent {
                  organizer {
                    id, 
                    pseudo,
                    avatar
                  }
                  organizerPseudo
                  lookingForAnOpponent
                  invitedOpponents (last: 5) {
                    edges {
                      node {
                        id
                        name
                        memberCount
                      }
                    }
                  }
                  unknownOpponent
                }
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
        me {
          sportunityTemplates {
            id,
            title
            description
            kind
            privacy_switch_preference {
              privacy_switch_type,
              switch_privacy_x_days_before
            }
            invited {
              user {
                id,
                pseudo
                avatar
              }
              answer
            }
            invited_circles (last: 10) {
              edges {
                node {
                  id,
                  name,
                  members {
                   id
                  }
                  owner {
                    id
                    pseudo
                    avatar
                  }
                  type
                  memberCount
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
            }
            notification_preference {
              notification_type,
              send_notification_x_days_before
            }
            participantRange {
              from
              to
            }
            hide_participant_list
            price {
              currency,
              cents,
            },
            is_repeated_occurence_number
            number_of_occurences
            sport {
              sport {
                id,
                name {
                  EN
                  DE
                  FR
                }
                logo
              }
              positions {
                id
               EN
               FR
               DE
              }
              certificates {
                id,
                name {
                  EN
                  FR
                  DE
                }
              }
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
            }
            ageRestriction {
              from, to
            }
            sexRestriction
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
              },
              secondaryOrganizerType {
                id
              }
              customSecondaryOrganizerType
            }
            pendingOrganizers { 
              id
              circles (last: 20) {
                edges {
                  node {
                    id, 
                    name,
                    memberCount
                    type
                    members {
                      id
                    }
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
                name {
                  FR
                  EN
                  DE
                  ES
                }
              }
              customSecondaryOrganizerType
            }
            sportunityType {
              id,
              isScoreRelevant
              name {
                FR,
                EN
              }
            }
            game_information {
              opponent {
                organizer {
                  id, 
                  pseudo,
                  avatar
                }
                organizerPseudo
                lookingForAnOpponent
                invitedOpponents (last: 5) {
                  edges {
                    node {
                      id
                      name
                      memberCount
                    }
                  }
                }
                unknownOpponent
              }
            }
          }
        }
      }
    `,
  };
}
*/