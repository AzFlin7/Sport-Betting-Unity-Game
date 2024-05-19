const {
    requestSubscription,
    graphql,
  } = require('react-relay');
  
  import environment from 'sportunity/src/createRelayEnvironment';
  
  const subscription = graphql`
    subscription UpdateUserWalletSubscriptionSubscription($input: updateUserSubscriptionInput!) {
        updateUserSubscription(input: $input) {
            viewer {
                ...Wallet_viewer
                ...Transactions_viewer
                ...Fees_viewer
                ...PaymentPopup_viewer
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
          userId: input.userId,
        }
      }, // Variables
      onCompleted: (t) => {
          console.log("ici", input)
        return true ;
      },
      onError: error => console.error(error),
      onNext: response => {
        return true ;
      },
      updater: store => {
        if (typeof input._refetch !== "undefined")
            input._refetch()

        return ;
      }
    }
  );