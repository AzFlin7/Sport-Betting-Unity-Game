import Relay from 'react-relay';

export default class DeleteSlotMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation Mutation{
         deleteSlot
      }`
  }
  
  getVariables() {
    return  {
        slotId: this.props.slotIDVar,
        deleteSlotSerie: this.props.deleteSlotSerieVar
    }
  }

  getFatQuery() {
    return Relay.QL`
        fragment on deleteSlotPayload {
          clientMutationId,
          viewer {
            id,
            venue {
              infrastructures
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
        venue
        
      }
    `,
  };

}
