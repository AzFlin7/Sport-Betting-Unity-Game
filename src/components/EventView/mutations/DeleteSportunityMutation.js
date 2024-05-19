import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation DeleteSportunityMutation($input: deleteSportunityInput!) {
		deleteSportunity(input: $input) {
            clientMutationId,
            edge {
                node {
                    id
                    status
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
            },
		}, 
		updater: (store) => { 
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}
