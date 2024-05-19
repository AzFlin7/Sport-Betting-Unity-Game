import Relay from 'react-relay';

export default class CircleMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
      updateFilledInformation
    }`
  }
  
  getVariables() {
    return  {
        circleId: this.props.idVar,
        answers: this.props.answersVar
    }
  }

  getFatQuery() {
      return Relay.QL`
        fragment on updateFilledInformationPayload {
          clientMutationId,
          viewer {
            id,
            me
            circle {
                membersInformation
            }
          }
        }
      `
   
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
        me {
          id
        }
        
      }
    `,
  };

}
