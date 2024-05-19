import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation ProfileUpdateMutation($input: upUserInput!) {
		upUser(input: $input) {
      clientMutationId,
      user {
        id
        description,
        sex,
        languages {
          id
          code
          name
        }
        sports {
          sport {
            id
            logo
            name {
              EN
              DE
              FR
            }
          } 
          levels {
            id
            EN {
              name
            }
            DE {
              name
            }
            FR {
              name
            }
          }
          positions {
            id
            EN
            DE
            FR
          }
          certificates {
            certificate {
              id
              name {
                EN,
                FR,
                DE
              }
            }
          }
        }
        pseudo
        birthday
        hideMyAge
        publicAddress {
          city
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
        userID: input.userIDVar,
        user: {
          description: input.descriptionVar,
          sex: input.sexVar,
          languages: input.languagesVar,
          sports: input.sportsVar,
          pseudo: input.usernameVar,
          birthday: input.birthdayVar,
          hideMyAge: input.hideMyAgeVar,
          publicAddress: input.publicAddressVar
        },
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('upUser'); 
			const newItem = payload.getLinkedRecord('user')
			let currentItem = store.get(input.userIDVar); 

      currentItem.setValue(newItem.getValue('description'), 'description')
      currentItem.setValue(newItem.getValue('sex'), 'sex')
      currentItem.setValue(newItem.getValue('pseudo'), 'pseudo')
      currentItem.setValue(newItem.getValue('birthday'), 'birthday')
      currentItem.setValue(newItem.getValue('hideMyAge'), 'hideMyAge')

      currentItem.setLinkedRecord(newItem.getLinkedRecord('publicAddress'), 'publicAddress')

      currentItem.setLinkedRecords(newItem.getLinkedRecords('languages'), 'languages')
      currentItem.setLinkedRecords(newItem.getLinkedRecords('sports'), 'sports')

      onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class ProfileUpdateMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
      upUser
    }`;
  }

  getVariables() {
    
    let var1 ={
      userID: this.props.userIDVar,
      user: {
       
        description: this.props.descriptionVar,
        sex: this.props.sexVar,
        languages: this.props.languagesVar,
        sports: this.props.sportsVar,
        pseudo: this.props.usernameVar,
        birthday: this.props.birthdayVar,
        hideMyAge: this.props.hideMyAgeVar,
       
       
       
        publicAddress: this.props.publicAddressVar
      },

    };
    return var1
  }

  getFiles() {
    return {
      avatars: this.props.file,
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on upUserPayload {
        clientMutationId,
        user {
          id, 
          birthday
          pseudo,
          hideMyAge,
          publicAddress {
            city
          },
          sports  {
            sport {
              id
              logo
              name {
                EN
                DE
                FR
              }
            } 
            levels {
              id
              EN {
                name
              }
              DE {
                name
              }
              FR {
                name
              }
            }
            positions {
              id
              EN
              DE
              FR
            }
            certificates {
              certificate {
                id
                name {
                  EN,
                  FR,
                  DE
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
          user: this.props.userIDVar,
        },
    }];
  }

  static fragments = {
    viewer: () => Relay.QL`
      fragment on Viewer {
        id
        me {
          id
        }
      }
    `,
    user: () => Relay.QL`
      fragment on User {
        id
      }
    `
  };

}
*/