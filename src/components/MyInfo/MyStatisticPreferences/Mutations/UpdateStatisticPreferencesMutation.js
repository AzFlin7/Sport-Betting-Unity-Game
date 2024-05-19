import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation UpdateStatisticPreferencesMutation($input: updateStatisticPreferencesInput!) {
		updateStatisticPreferences(input: $input) {
            clientMutationId,
            statisticPreferences {
                private,
                isManOfTheGameActivated,
                userStats {
                    stat0 {name}
                    stat1 {name}
                    stat2 {name}
                    stat3 {name}
                    stat4 {name}
                    stat5 {name}
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
                userID: input.userIDVar,
                statisticPreferences: {
                    private: input.privateVar,
                    userStats: input.userStatsVar,
                    sportunityStats: input.sportunityStatsVar,
                    isManOfTheGameActivated: input.isManOfTheGameActivatedVar,
                },
            }
		}, 
		updater: (store) => { 
			/* const payload = store.getRootField('updateStatisticPreferences'); 
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

export default class UpdateStatisticPreferencesMutation extends Relay.Mutation {

    getMutation() {
        return Relay.QL`mutation Mutation{
            updateStatisticPreferences
        }`;
    }

    getVariables() {
        return {
            userID: this.props.userIDVar,
            statisticPreferences: {
                private: this.props.privateVar,
                userStats: this.props.userStatsVar,
                sportunityStats: this.props.sportunityStatsVar,
                isManOfTheGameActivated: this.props.isManOfTheGameActivatedVar,
            },

        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on updateStatisticPreferencesPayload {
            clientMutationId,
            viewer {
                id
                statisticPreferences
            }
        }
        `;
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
        }
        `,
    };

}
*/