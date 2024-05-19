import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
  mutation AcceptOrRefusedCircleMembersMutation($input: acceptOrRefusedCircleMembersInput!) {
    acceptOrRefusedCircleMembers(input: $input) {
      clientMutationId,
      edge {
        node {
          waitingMembers {
            id
            pseudo
            avatar
            lastConnexionDate
            sports {
              sport {
                id
                name {
                  EN
                  FR
                  DE
                }
              }
            }
            sportunityNumber
          }
          refusedMembers {
            id
            pseudo
            avatar
            lastConnexionDate
            sports {
              sport {
                id
                name {
                  EN
                  FR
                  DE
                }
              }
            }
            sportunityNumber
          }
          members {
            id
            pseudo
            avatar
            lastConnexionDate
            sports {
              sport {
                id
                name {
                  EN
                  FR
                  DE
                }
              }
            }
            sportunityNumber
          }
          memberParents {
            id
            pseudo
            avatar
            lastConnexionDate
            sports {
              sport {
                id
                name {
                  EN
                  FR
                  DE
                }
              }
            }
            sportunityNumber
          }
          memberCount
        }
      }
    }
  }
`;

function commit(input, {onSuccess: onCompleted, onFailure: onError}) {
  return commitMutation(environment, {
    mutation, 
    variables: { 
      input: {
        circleId: input.circleId,
        ...input.member
      }
    }, 
    updater: (store) => { 
      // const payload = store.getRootField('acceptTermsOfUse'); 
      // const newItem = payload.getLinkedRecord('viewer').getLinkedRecord('me'); 
      // let currentItem = store.get(input.userId); 

      // currentItem.setLinkedRecords(newItem.getLinkedRecords('termsOfUses'), 'termsOfUses')
      /*const circles = ConnectionHandler.getConnection(newItem, 'circles');
      currentItem.setLinkedRecords(newItem.getLinkedRecords('circles'), 'circles')*/
      onCompleted() 
    }, 
    onError 
  }) 
} 

export default {commit}



/*;

export default class AcceptTermOfUseMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
      acceptTermsOfUse
    }`
  }
  
  getVariables() {
    return  {
      termsOfUseId: this.props.termsOfUseId,
      userId: this.props.userId,
    }
  }

  getFatQuery() {
      return Relay.QL`
        fragment on acceptCircleTermsOfUsePayload {
          clientMutationId,
          viewer {
            id,
            me {
              termsOfUses
              circles
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