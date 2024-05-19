import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation AddChildMutation($input: addParentMemberInput!) {
		addParentMember(input: $input) {
      clientMutationId,
      edge {
        node {
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
        circleId: input.idVar,
        parent1Id: input.parent1IdVar,
        parent1Email: input.parent1EmailVar,
        parent2Id: input.parent2IdVar, 
        parent2Email: input.parent2EmailVar,
        childPseudo: input.childPseudoVar
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('addParentMember'); 
			const newItem = payload.getLinkedRecord('edge').getLinkedRecord('node'); 
			let currentItem = store.get(input.idVar); 

      currentItem.setLinkedRecords(newItem.getLinkedRecords('members'), 'members')
      currentItem.setLinkedRecords(newItem.getLinkedRecords('memberParents'), 'memberParents')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}

