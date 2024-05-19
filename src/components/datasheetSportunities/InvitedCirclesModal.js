import React, { PureComponent } from 'react';
import SearchModal from '../common/SearchModal';

export class InvitedCirclesModal extends PureComponent {
  render() {
    return (
      <SearchModal
        isOpen={this.props.isOpen}
        viewer={this.props.viewer}
        onClose={this.props.close}
        onValide={circles => {
          this.props.close();
          this.props.updateCircles(circles);
        }}
        tabs={['Groups']}
        openOnTab="Groups"
        allowToSeeCircleDetails={false}
        types={['ADULTS', 'CHILDREN']}
        circleTypes={[
          'MY_CIRCLES',
          'CIRCLES_I_AM_IN',
          'CHILDREN_CIRCLES',
          'PUBLIC_CIRCLES',
        ]}
        userType="PERSON"
        queryCirclesOnOpen
        noNeedToValidate={false}
      />
    );
  }
}
