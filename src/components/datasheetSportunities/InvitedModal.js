import React, { PureComponent } from 'react';
import SearchModal from '../common/SearchModal';

export class InvitedModal extends PureComponent {
  render() {
    return (
      <SearchModal
        isOpen={this.props.isOpen}
        viewer={this.props.viewer}
        onClose={this.props.close}
        onValide={users => {
          this.props.updateInvited(users);
          this.props.close();
        }}
        tabs={['People']}
        openOnTab="People"
        allowToSeeCircleDetails
        types={['ADULTS', 'CHILDREN']}
        circleTypes={['MY_CIRCLES', 'CIRCLES_I_AM_IN', 'CHILDREN_CIRCLES']}
        userType="PERSON"
        queryCirclesOnOpen
        noNeedToValidate={false}
      />
    );
  }
}
