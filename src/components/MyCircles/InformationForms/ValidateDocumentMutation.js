import {commitMutation, graphql} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment'; 


const mutation = graphql`
	mutation ValidateDocumentMutationMutation($input: ownerValidateDocumentInput!) {
		ownerValidateDocument(input: $input) {
            clientMutationId,
            viewer {
                id,
                me {
                    id
                    circleInformationForms {
                        id
                        name
                        circles {
                            edges {
                                node {
                                    id
                                    name
                                    owner {
                                        id
                                        pseudo
                                        avatar
                                    }
                                    members {
                                        id
                                        pseudo
                                    }
                                    membersInformation {
                                        id
                                        information
                                        user {
                                            id
                                        }
                                        value
                                        fillingDate
                                        document {
                                          id,
                                          link,
                                          name
                                        }
                                        validationStatus
                                        comment
                                    }
                                }
                            }
                        }
                        askedInformation {
                            id
                            name
                            type
                            filledByOwner
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
			input : input
		}, 
		updater: (store) => { 
			/*const payload = store.getRootField('updateAskedInformationForm');
			const newItem = payload.getLinkedRecord('viewer').getLinkedRecord('me'); 
			let currentItem = store.get(input.user.id); 

			currentItem.setLinkedRecords(newItem.getLinkedRecords('circleInformationForms'), 'circleInformationForms')*/
			onCompleted() 
		}, 
		onError 
	}) 
} 

export default {commit}
