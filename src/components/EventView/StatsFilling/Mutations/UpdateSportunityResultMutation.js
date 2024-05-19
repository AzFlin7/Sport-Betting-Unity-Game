import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation UpdateSportunityResultMutation($input: updateSportunityInput!) {
		updateSportunity(input: $input) {
            clientMutationId,
            edge {
                node {
                    id 
                    sportunityTypeStatus {
                        id,
                        name {
                            FR, 
                            EN
                        }
                    }
                    score {
                        currentTeam,
                        adversaryTeam
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
                sportunityID: input.sportunity.id,
                sportunity:{
                    sportunityTypeStatus: input.sportunityTypeStatusVar,
                    score: input.scoreVar
                },
            }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('updateSportunity'); 
			const newItem = payload.getLinkedRecord('edge').getLinkedRecord('node'); 
			let currentItem = store.get(input.sportunity.id); 

			currentItem.setLinkedRecord(newItem.getLinkedRecord('sportunityTypeStatus'), 'sportunityTypeStatus')
			currentItem.setLinkedRecord(newItem.getLinkedRecord('score'), 'score')
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}



/*;

export default class UpdateSportunityTypeMutation extends Relay.Mutation {

    getMutation() {
        return Relay.QL`mutation {updateSportunity}`;
    }

    getVariables() { 
        return {
            sportunityID: this.props.sportunity.id,
            sportunity:{
                sportunityTypeStatus: this.props.sportunityTypeStatusVar,
                score: this.props.scoreVar
            },
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on updateSportunityPayload{
            viewer {
                sportunity {
                    sportunityTypeStatus,
                    score
                }
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
}*/