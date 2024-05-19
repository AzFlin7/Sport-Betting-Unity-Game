import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation InvitedAnswersSurveyMutation($input: invitedAnswersSurveyInput!) {
		invitedAnswersSurvey(input: $input) {
      clientMutationId,
      edge {
        node {
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
        userId: input.userIdVar,
        answers: input.answersVar
      }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('invitedAnswersSurvey'); 
			const newItem = payload.getLinkedRecord('edge').getLinkedRecord('node'); 
			let currentItem = store.get(input.sportunity.id); 

			currentItem.setLinkedRecord(newItem.getLinkedRecord('survey'), 'survey')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class InvitedAnswersSurveyMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation {invitedAnswersSurvey}`;
  }

  getVariables() {
    return {
      sportunityID: this.props.sportunity.id,
	    userId: this.props.userIdVar,
	    answers: this.props.answersVar
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on invitedAnswersSurveyPayload{
          sportunity {
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