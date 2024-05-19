import { commitMutation, graphql } from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment';

const mutation = graphql`
  mutation UpdateCircleMutation($input: updateCircleInput!) {
    updateCircle(input: $input) {
      clientMutationId
      edge {
        node {
          isCircleUpdatableByMembers
          isCircleUsableByMembers
          isCircleAccessibleFromUrl
          shouldValidateNewUser
          isChatActive
          name
          mode
          description
          address {
            address
            city
            country
            position {
              lat
              lng
            }
          }
          sport {
            sport {
              id
              logo
              name {
                EN
                FR
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
            }
          }
          circlePreferences {
            isChildrenCircle
          }
        }
      }
    }
  }
`;

function commit(input, { onSuccess: onCompleted, onFailure: onError }) {
  console.log(input);
  return commitMutation(environment, {
    mutation,
    variables: {
      input: {
        circleId: input.idVar,
        circle: {
          name: input.nameVar,
          mode: input.modeVar,
          sport: input.sportVar,
          address: input.addressVar,
          isCircleUpdatableByMembers: input.isCircleUpdatableByMembersVar,
          isCircleUsableByMembers: input.isCircleUsableByMembersVar,
          isCircleAccessibleFromUrl: input.isCircleAccessibleFromUrlVar,
          shouldValidateNewUser: input.shouldValidateNewUser,
          isChatActive: input.isChatActive,
          circlePreferences: input.circlePreferencesVar,
          description: input.circleDescriptionVar,
        },
      },
    },
    updater: store => {
      const payload = store.getRootField('updateCircle');
      const newItem = payload.getLinkedRecord('edge').getLinkedRecord('node');
      let currentItem = store.get(input.idVar);

      newItem.getValue('name')
        ? currentItem.setValue(newItem.getValue('name'), 'name')
        : true;
      newItem.getValue('mode')
        ? currentItem.setValue(newItem.getValue('mode'), 'mode')
        : true;
      newItem.getValue('isCircleUpdatableByMembers')
        ? currentItem.setValue(
            newItem.getValue('isCircleUpdatableByMembers'),
            'isCircleUpdatableByMembers',
          )
        : true;
      newItem.getValue('isCircleUsableByMembers')
        ? currentItem.setValue(
            newItem.getValue('isCircleUsableByMembers'),
            'isCircleUsableByMembers',
          )
        : true;
      newItem.getValue('isCircleAccessibleFromUrl')
        ? currentItem.setValue(
            newItem.getValue('isCircleAccessibleFromUrl'),
            'isCircleAccessibleFromUrl',
          )
        : true;
      newItem.getValue('shouldValidateNewUser')
        ? currentItem.setValue(
            newItem.getValue('shouldValidateNewUser'),
            'shouldValidateNewUser',
          )
        : true;
        newItem.getValue('isChatActive')
        ? currentItem.setValue(
            newItem.getValue('isChatActive'),
            'isChatActive',
          )
        : true;
      newItem.getValue('description')
        ? currentItem.setValue(newItem.getValue('description'), 'description')
        : true;
      newItem.getLinkedRecord('sport')
        ? currentItem.setLinkedRecord(
            newItem.getLinkedRecord('sport'),
            'sport',
          )
        : true;
      newItem.getLinkedRecord('address')
        ? currentItem.setLinkedRecord(
            newItem.getLinkedRecord('address'),
            'address',
          )
        : true;
      newItem.getLinkedRecord('circlePreferences')
        ? currentItem.setLinkedRecord(
            newItem.getLinkedRecord('circlePreferences'),
            'circlePreferences',
          )
        : true;
      onCompleted();
    },
    onError,
  });
}

export default { commit };

/*;

export default class CircleMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
      updateCircle
    }`
  }

  getVariables() {
    return  {
      circleId: this.props.idVar,
      circle: {
        name: this.props.nameVar,
        mode: this.props.modeVar,
        sport: this.props.sportVar,
        address: this.props.addressVar,
        isCircleUpdatableByMembers: this.props.isCircleUpdatableByMembersVar,
        isCircleUsableByMembers: this.props.isCircleUsableByMembersVar,
        isCircleAccessibleFromUrl: this.props.isCircleAccessibleFromUrlVar,
        circlePreferences: this.props.circlePreferencesVar,
        description:  this.props.circleDescriptionVar
      },
    }
  }

  getFatQuery() {
      return Relay.QL`
        fragment on updateCirclePayload {
          clientMutationId,
          viewer {
            id,
            me
            circle {
              members,
              isCircleUpdatableByMembers,
              isCircleUsableByMembers,
              isCircleAccessibleFromUrl,
              name,
              mode
              description
              address
              sport
              circlePreferences {
                isChildrenCircle
              }
            }
          }
        }
      `

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
          id
        }

      }
    `,
  };

}
*/
