const {
    requestSubscription,
    graphql,
  } = require('react-relay');
  
  import environment from 'sportunity/src/createRelayEnvironment';
  
  const subscription = graphql`
    subscription UpdateSportunitySubscriptionSubscription($input: updateSportunitySubscriptionInput!, $sportunityId: ID) {
      updateSportunitySubscription(input: $input) {
        sportunity {
          participants {
            id
          }
          waiting {
            id
          }
          willing {
            id
          }
          status
        }
        viewer {
          sportunity (id: $sportunityId) {
            participants {
              id
            }
            waiting {
              id
            }
            willing {
              id
            }
            status
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
          sportunityId: input.sportunityId
        },
        sportunityId: input.sportunityId
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
  
  