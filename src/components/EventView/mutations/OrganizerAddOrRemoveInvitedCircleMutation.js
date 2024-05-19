import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation OrganizerAddOrRemoveInvitedCircleMutation($input: updateSportunityInput!) {
		updateSportunity(input: $input) {
            clientMutationId,
            edge {
                node {
                    id
                    status
                    price_for_circle {
                        circle {
                            id
                            members {
                                id
                            }
                        }
                        price {
                            cents
                            currency
                        }
                    }
                    invited_circles(last: 10) {
                        edges {
                            node {
                                ...MyCirclesCircleItem_circle
                                id
                                name
                                mode
                                type
                                members {
                                    id
                                    pseudo
                                    avatar
                                }
                                owner {
                                    id
                                    pseudo
                                    avatar
                                }
                                askedInformation {
                                    id
                                    name
                                }
                                membersInformation {
                                    information
                                    user {
                                        id
                                    }
                                    value
                                    document {
                                        id,
                                        name
                                    }
                                    validationStatus
                                    comment
                                }
                            }
                        }
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
                sportunity: {
                    invited_circles: input.updateInvitedCirclesVar,
                    price_for_circle: input.updatePriceForCircleVar,
                    modifyRepeatedSportunities: false
                },
            }
		}, 
		updater: (store) => { 
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}