const {
    requestSubscription,
    graphql,
  } = require('react-relay');
  
  import ProfileViewChat from '../ProfileViewChat';
  import environment from 'sportunity/src/createRelayEnvironment';
  
  const subscription = graphql`
    subscription AddProfileMessageSubscription($input: addMsgSubscriptionInput!) {
      addMsgSubscription(input: $input) {
        chat {
          ...ProfileViewChat_chat
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
  