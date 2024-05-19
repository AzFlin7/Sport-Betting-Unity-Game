import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation UpdateSportunityTypeMutation($input: updateSportunityInput!) {
		updateSportunity(input: $input) {
            clientMutationId,
            edge {
                node {
                    sportunityType {
                        id,
                        name {
                            FR,
                            EN,
                        },
                        statuses {
                            id,
                            name {
                                FR,
                                EN
                            }
                        }
                        isScoreRelevant
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
                    sportunityType: input.sportunityTypeVar
                },
            }
		}, 
		updater: (store) => { 
			const payload = store.getRootField('updateSportunity'); 
			const newItem = payload.getLinkedRecord('edge').getLinkedRecord('node'); 
			let currentItem = store.get(input.sportunity.id); 

			currentItem.setLinkedRecord(newItem.getLinkedRecord('sportunityType'), 'sportunityType')
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
                sportunityType: this.props.sportunityTypeVar
            },
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on updateSportunityPayload{
            viewer {
                sportunity {
                    sportunityType
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