import React from 'react';
import PureComponent, { pure } from '../common/PureComponent';
import { createFragmentContainer, graphql } from 'react-relay';
import Radium from 'radium';
import { withAlert } from 'react-alert';
import uniqBy from 'lodash/uniqBy';

import { colors } from '../../theme';
import localizations from '../Localizations';

import SummoningInvitedListTimeSlot from './SummoningInvitedListTimeSlot';

let styles;

class DetailsListTimeSlot extends PureComponent {
  render() {
    return (
      <div style={styles.container}>
        <SummoningInvitedListTimeSlot
          viewer={this.props.viewer}
          invitedCircles={this.props.invitedCircles}
          list={this.props.list}
          onChangeCirclePrice={this.props.onChangeCirclePrice}
          onChangeCircleAutoParticipate={
            this.props.onChangeCircleAutoParticipate
          }
          onChangeUserAutoParticipate={this.props.onChangeUserAutoParticipate}
          onRemoveItem={this.props.onRemoveItem}
          onRemoveInvitedCircle={this.props.onRemoveInvitedCircle}
          onRemoveInvitee={this.props.onRemoveInvitee}
          isModifying={this.props.isModifying}
          isSurvey={this.props.isSurvey}
          fields={this.props.fields}
          _handleNotificationTypeChange={
            this.props._handleNotificationTypeChange
          }
          _handleNotificationAutoXDaysBeforeChange={
            this.props._handleNotificationAutoXDaysBeforeChange
          }
          _handleChangeInvitedCircleVisibility={this.props._handleChangeInvitedCircleVisibility}
          _handleChangeInvitedCirclemultiBooking={this.props._handleChangeInvitedCirclemultiBooking}
          _handleChangeInvitedCircleNotificationPreference={this.props._handleChangeInvitedCircleNotificationPreference}
        />
      </div>
    );
  }
}

styles = {
  container: {
    position: 'relative',
    width: '100%',
    marginBottom: 25,
  },
};

export default createFragmentContainer(
  Radium(withAlert(DetailsListTimeSlot)),
  {
    viewer: graphql`
      fragment DetailsListTimeSlot_viewer on Viewer {
        id
        ...SummoningInvitedListTimeSlot_viewer
      }
    `,
  },
);
