import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation NewSportunityTemplateMutation($input: newSportunityTemplateInput!) {
		newSportunityTemplate(input: $input) {
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
        sportunityTemplate: {
          title: input.sportunity.title,
          description: input.sportunity.description,
          address: input.sportunity.address,
          organizers: input.sportunity.organizers,
          pendingOrganizers: input.sportunity.pendingOrganizers,
          sport: input.sportunity.sport,
          mode: input.sportunity.mode,
          kind: input.sportunity.kind,
          participantRange: input.sportunity.participantRange,
          price: input.sportunity.price,
          ageRestriction: input.sportunity.ageRestriction,
          sexRestriction: input.sportunity.sexRestriction,
          secondaryOrganizersPaymentMethod: input.sportunity.secondaryOrganizersPaymentMethod,
          secondaryOrganizersPaymentByWallet: input.sportunity.secondaryOrganizersPaymentByWallet,
          invited: input.sportunity.invited,
          invited_circles: input.sportunity.invited_circles,
          price_for_circle: input.sportunity.price_for_circle,
          notification_preference: input.sportunity.notification_preference,
          privacy_switch_preference: input.sportunity.privacy_switch_preference,
          hide_participant_list: input.sportunity.hide_participant_list,
          sportunityType: input.sportunity.sportunityType,
          game_information: input.sportunity.game_information
        }
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('newSportunityTemplate'); 
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

export default class NewSportunityTemplateMutation extends Relay.Mutation {
  
  getMutation() {
    return Relay.QL`mutation Mutation {newSportunityTemplate}`;
  }
  
  getVariables() {
    return {
      sportunityTemplate: {
        title: this.props.sportunity.title,
        description: this.props.sportunity.description,
        address: this.props.sportunity.address,
        organizers: this.props.sportunity.organizers,
        pendingOrganizers: this.props.sportunity.pendingOrganizers,
        sport: this.props.sportunity.sport,
        mode: this.props.sportunity.mode,
        kind: this.props.sportunity.kind,
        participantRange: this.props.sportunity.participantRange,
        price: this.props.sportunity.price,
        ageRestriction: this.props.sportunity.ageRestriction,
        sexRestriction: this.props.sportunity.sexRestriction,
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
      fragment on newSportunityTemplatePayload @relay(pattern: true){
        user,
        clientMutationId,
        viewer {
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