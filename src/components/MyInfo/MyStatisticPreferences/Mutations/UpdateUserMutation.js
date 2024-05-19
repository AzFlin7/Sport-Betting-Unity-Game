import Relay from 'react-relay';

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
