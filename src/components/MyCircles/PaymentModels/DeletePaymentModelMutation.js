import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation DeletePaymentModelMutation($input: deleteCirclePaymentModelInput!) {
		deleteCirclePaymentModel(input: $input) {
      clientMutationId,
      viewer {
        id,
        me {
          id
          circlePaymentModels {
            id,
            name, 
            conditions {
                id,
                name,
                price {
                    cents,
                    currency
                },
                conditions {
                    askedInformation {
                        id,
                        name,
                        type,
                        filledByOwner
                    }
                    askedInformationComparator
                    askedInformationComparatorValue
                    askedInformationComparatorDate
                    askedInformationComparatorValueString
                }
            }
            price {
                cents,
                currency
            },
            circles (last: 20) {
                edges {
                    node {
                        id,
                        name
                        askedInformation {
                            id, 
                            name,
                            type,
                            filledByOwner
                        }
                        owner {
                            id
                            pseudo
                            avatar
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

function commit(input, {onSuccess: onCompleted, onFailure: onError}) {
	return commitMutation(environment, {
		mutation, 
		variables: { 
			input : {
        paymentModelId: input.paymentModelIdVar
      }
		}, 
		updater: (store) => { 
			/* const payload = store.getRootField('deleteCirclePaymentModel'); 
			const newItem = payload.getLinkedRecord('viewer').getLinkedRecord('me'); 
			let currentItem = store.get(input.circleId); 

			currentItem.setLinkedRecord(newItem.getLinkedRecord('bankAccount'), 'bankAccount')*/ 
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class deletePaymentModelMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
      deleteCirclePaymentModel
    }`
  }
  
  getVariables() {
    return  {
        paymentModelId: this.props.paymentModelIdVar
    }
  }

  getFatQuery() {
      return Relay.QL`
        fragment on deleteCirclePaymentModelPayload {
          clientMutationId,
          viewer {
            id,
            me {
              circlePaymentModels
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
          circlePaymentModels  {
            id,
            name, 
            conditions {
                id,
                name,
                price {
                    cents,
                    currency
                },
                conditions {
                    askedInformation {
                        id,
                        name,
                        type,
                        filledByOwner
                    }
                    askedInformationComparator
                    askedInformationComparatorValue
                    askedInformationComparatorDate
                }
            }
            price {
                cents,
                currency
            },
            circles (last: 20) {
                edges {
                    node {
                        id,
                        name
                        askedInformation {
                            id, 
                            name,
                            type,
                            filledByOwner
                        }
                        owner {
                            id
                            pseudo
                            avatar
                        }
                    }
                }
            }
          }
        }
        
      }
    `,
  };

}
*/