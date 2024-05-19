import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation RegisterCardDataMutation($input: registerCardDataInput!) {
		registerCardData(input: $input) {
      clientMutationId,
      viewer {
        me {
          id
          paymentMethods {
            id,
            cardType
            cardMask
            expirationDate
            currency
          }
        }
      },
      paymentMethodId
		}
	}
`;

function commit(input, { onSuccess, onError }) {
	return commitMutation(environment, {
		mutation, 
		variables: { 
			input : {
        cardRegistrationId: input.cardRegistration.cardRegistrationId,
        registrationData: input.registrationData
      }
		}, 
    onCompleted: (response, error) => {
      if (!error) {
        onSuccess(response);
      } 
      else {
        onError(error);
      }
    },
		onError 
	}) 
} 

export default {commit}
