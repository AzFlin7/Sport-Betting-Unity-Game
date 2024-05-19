import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation OrganizerPickDateMutation($input: organizerPickSurveyDateInput!) {
		organizerPickDate(input: $input) {
      clientMutationId,
      edge {
        node {
          beginning_date
          ending_date
          participants {
            id
            pseudo
            avatar
          }
          invited {
            user {
              id
              pseudo
              avatar
            }
          }
          survey {
            isSurveyTransformed
            surveyDates {
              beginning_date
              ending_date
              answers {
                user {
                  id
                }
                answer
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
        sportunityID: input.sportunity.id,
        beginning_date: input.answerVar.beginning_date,
        ending_date: input.answerVar.ending_date
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('organizerPickDate'); 
			const newItem = payload.getLinkedRecord('edge').getLinkedRecord('node'); 
			let currentItem = store.get(input.sportunity.id); 

      currentItem.setLinkedRecord(newItem.getLinkedRecord('survey'), 'survey')
      currentItem.setLinkedRecords(newItem.getLinkedRecords('participants'), 'participants')
      currentItem.setLinkedRecords(newItem.getLinkedRecords('invited'), 'invited')
      currentItem.setValue(newItem.getValue('beginning_date'), 'beginning_date')
      currentItem.setValue(newItem.getValue('ending_date'), 'ending_date')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class OrganizerPickDateMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation {organizerPickDate}`;
  }

  getVariables() {
    return {
      sportunityID: this.props.sportunity.id,
	    beginning_date: this.props.answerVar.beginning_date,
	    ending_date: this.props.answerVar.ending_date
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on organizerPickSurveyDatePayload{
          sportunity {
            beginning_date
            ending_date
            participants {
              id
              pseudo
              avatar
            }
            invited {
              user {
                id
                pseudo
                avatar
              }
            }
            survey {
              isSurveyTransformed
              surveyDates {
                beginning_date
                ending_date
                answers {
                  user {
                    id
                  }
                  answer
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
	      sportunity: this.props.sportunity.id,
      },
    }];
  }

  static fragments = {
    sportunity: () => Relay.QL`
      fragment on Sportunity {
        id
        beginning_date
        ending_date
        participants {
          id
          pseudo
          avatar
        }
        invited {
          user {
            id
            pseudo
            avatar
          }
        }
        survey {
          isSurveyTransformed
          surveyDates {
            beginning_date
            ending_date
            answers {
              user {
                id
              }
              answer
            }
          }
        }
      }
    `,
  };
}
*/