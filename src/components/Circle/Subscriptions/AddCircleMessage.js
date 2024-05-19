const {
    requestSubscription,
    graphql,
} = require('react-relay');
  
import Chat from '../Tabs/Chat'
import environment from 'sportunity/src/createRelayEnvironment';
  
const subscription = graphql`
    subscription AddCircleMessageSubscription($input: addMsgSubscriptionInput!) {
        addMsgSubscription(input: $input) {
            chat {
                ...Chat_chat
            }
        }
    }
`
  
export default (input) => requestSubscription(
    environment, 
    {
      subscription,
      variables: {
        input: {
          chatIds: input.chatIdsVar
        }
      }, // Variables
      onCompleted: (t) => {
        return true ;
      },
      onError: error => console.error(error),
      onNext: response => {
        return true ;
      },
      updater: store => {
        return ;
      }
    }
);
