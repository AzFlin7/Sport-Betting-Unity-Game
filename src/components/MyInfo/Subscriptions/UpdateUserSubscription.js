const {
    requestSubscription,
    graphql,
  } = require('react-relay');
  
  import environment from 'sportunity/src/createRelayEnvironment';
  
  const subscription = graphql`
    subscription UpdateUserSubscriptionSubscription($input: updateUserSubscriptionInput!) {
        updateUserSubscription(input: $input) {
            viewer {
                ...CircleMemberships_viewer
                me {
                    ...CircleMemberships_user
                }
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
          userId: input.userId
        },
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