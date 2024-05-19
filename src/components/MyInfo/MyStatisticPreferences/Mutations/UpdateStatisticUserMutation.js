import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation UpdateStatisticUserMutation($input: upUserInput!) {
		upUser(input: $input) {
            clientMutationId,
            user {
                id,
                areStatisticsActivated
            }
		}
	}
`;

function commit(input, {onSuccess: onCompleted, onFailure: onError}) {
	return commitMutation(environment, {
		mutation, 
		variables: { 
			input : {
                userID: input.userIDVar,
                user: {
                    areStatisticsActivated: input.areStatisticsActivatedVar
                }
            }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('upUser'); 
			const newItem = payload.getLinkedRecord('user')
			let currentItem = store.get(input.userIDVar); 

			currentItem.setValue(newItem.getValue('areStatisticsActivated'), 'areStatisticsActivated')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class UpdateUserMutation extends Relay.Mutation {

    getMutation() {
        return Relay.QL`mutation Mutation{
            upUser
        }`;
    }

    getVariables() {
        return {
            userID: this.props.userIDVar,
            user: {
                areStatisticsActivated: this.props.areStatisticsActivatedVar
            }

        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on upUserPayload {
            clientMutationId,
            viewer 
            user {
                id,
                areStatisticsActivated
            }
        }
        `;
    }

    getConfigs() {
        return [{
        type: 'FIELDS_CHANGE',
            fieldIDs: {
                user: this.props.userIDVar,
            },
        }];
    }

    static fragments = {
        user: () => Relay.QL`
            fragment on User {
                id,
                areStatisticsActivated
            }
        `,
    };

}
*/