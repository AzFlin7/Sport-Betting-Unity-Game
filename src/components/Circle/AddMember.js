import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { withAlert } from 'react-alert';

import { colors, fonts } from '../../theme';
import TutorialModal from '../common/Tutorial/index.js';
import localizations from '../Localizations';
import AddChildModal from './AddChildModal';
import { Button } from '@material-ui/core';
import SearchModal from '../common/SearchModal';
import AddMembersMutation from './AddMembersMutation';
import AddMemberMutation from './AddCircleMemberMutation';

let styles;
let modalStyles;

class AddMember extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalIsOpen: false,
      childModalIsOpen: false,
      selectedCircle: null,
      selectedUserList: [],
      tutorial4IsVisible: false,
    };
  }

  componentDidMount = () => {
    this.props.onRef && this.props.onRef(this);
  };

  componentWillUnmount = () => {
    this.props.onRef && this.props.onRef(undefined);
  };

  componentWillReceiveProps = nextProps => {
    if (
      this.props.viewer &&
      this.props.viewer.me &&
      this.props.viewer.me.id &&
      !this.props.superMe &&
      nextProps.superMe &&
      (nextProps.superMe.profileType === 'BUSINESS' ||
        nextProps.superMe.profileType === 'ORGANIZATION')
    ) {
      this.setState({
        tutorial4IsVisible: true,
      });
    }
  };

  _openModal = () => {
    this.setState({ modalIsOpen: true, tutorial4IsVisible: false });
  };

  _openChildModal = () => {
    this.setState({ childModalIsOpen: true, tutorial4IsVisible: false });
  };

  _closeModal = () => {
    this.setState({
      modalIsOpen: false,
      childModalIsOpen: false,
      tutorial4IsVisible: false,
    });
    this.props.onErrorChange(false);
    this.props.onCloseModal();
  };

  _handleAutocompleteParentClicked = user => {
    this.props.onParentChange(user);
  };

  isValidEmailAddress(address) {
    let re = /^[a-z0-9][a-z0-9-_\.]+@([a-z]|[a-z0-9]?[a-z0-9-]+[a-z0-9])\.[a-z0-9]{2,10}(?:\.[a-z]{2,10})?$/;
    return re.test(address);
  }

  _addMembers = users => {
    const viewer = this.props.viewer;
    const userIDVar = this.props.viewer.id;
    const idVar = this.props.circleId;

    AddMembersMutation.commit(
      {
        viewer,
        userIDVar,
        idVar,
        newUsersVar: users.map(user => user.id),
        circle: this.props.circle,
      },
      {
        onFailure: error => {
          this.props.alert.show(error.getError().source.errors[0].message, {
            timeout: 2000,
            type: 'error',
          });
        },
        onSuccess: response => {
          this._closeModal();
          this.props.alert.show(
            localizations.popup_editCircle_update_success,
            {
              timeout: 2000,
              type: 'success',
            },
          );
        },
      },
    );
  };

  _inviteMember = users => {
    const viewer = this.props.viewer;
    const userIDVar = this.props.viewer.id;
    const idVar = this.props.circleId;

    AddMemberMutation.commit(
      {
        viewer,
        userIDVar,
        idVar,
        nameVar: typeof users === 'array' ? users[0].invitedPseudo : users.invitedPseudo,
        emailVar: typeof users === 'array' ?  users[0].invitedEmail : users.invitedEmail,
        circle: this.props.circle,
      },
      {
        onFailure: error => {
          this.props.alert.show(error.getError().source.errors[0].message, {
            timeout: 2000,
            type: 'error',
          });
        },
        onSuccess: response => {
          console.log(response);
          this._closeModal();
          this.props.alert.show(
            localizations.popup_editCircle_update_success,
            {
              timeout: 2000,
              type: 'success',
            },
          );
        },
      },
    );
  };

  render() {
    const { me, circle } = this.props;

    return (
      <section>
        {circle.type !== 'CHILDREN' && (
          <div style={styles.button} onClick={this._openModal}>
            <Button style={styles.addButton}>
              {circle.type === 'TEAMS'
              ? localizations.circle_addTeam
              : circle.type === 'CLUBS'
                ? localizations.circle_addClub
                : circle.type === 'COMPANIES'
                  ? localizations.circle_addCompany
                  : localizations.circle_addMember
              }
            </Button>
            <TutorialModal
              isOpen={this.state.tutorial4IsVisible}
              tutorialNumber={5}
              tutorialName={'team_small_tutorial4'}
              message={localizations.team_small_tutorial4}
              confirmLabel={localizations.team_small_tutorial_ok}
              onPass={() => this.setState({ tutorial4IsVisible: false })}
              position={{
                top: 30,
                left: 50,
              }}
              arrowPosition={{
                top: -8,
                left: 25,
              }}
            />
          </div>
        )}

        {circle.type === 'CHILDREN' && (
          <div style={styles.button} onClick={this._openModal}>
            <Button style={styles.addButton}>
              {localizations.circle_addMemberChild}
            </Button>
          </div>
        )}
        {this.props.selectedUserList &&
          this.props.selectedUserList.length > 0 && (
            <div style={styles.button} onClick={this.props.handleTransfer}>
              <Button style={styles.addButton}>
                {localizations.circle_transferMembers}
              </Button>
            </div>
          )}

        {this.state.modalIsOpen && (
          <SearchModal
            isOpen={this.state.modalIsOpen}
            viewer={this.props.viewer}
            onClose={this._closeModal}
            onValide={this._addMembers}
            onInvite={this._inviteMember}
            tabs={['People', 'Groups', 'Invite']}
            openOnTab={'People'}
            allowToSeeCircleDetails={true}
            circleTypes={['MY_CIRCLES', 'CIRCLES_I_AM_IN', 'CHILDREN_CIRCLES']}
            userType={
              circle.type === 'ADULTS' || circle.type === 'CHILDREN'
                ? 'PERSON'
                : circle.type === 'TEAMS' || circle.type === 'CLUBS'
                ? 'ORGANIZATION'
                : 'BUSINESS'
            }
            types={
              circle.type === 'ADULTS' || circle.type === 'CHILDREN'
                ? ['ADULTS']
                : circle.type === 'TEAMS' || circle.type === 'CLUBS'
                ? ['TEAMS', 'CLUBS']
                : ['BUSINESS']
            }
            queryCirclesOnOpen={true}
            childrenOnly={circle.type === 'CHILDREN'}
          />
        )}

        {this.state.childModalIsOpen && (
          <AddChildModal
            viewer={this.props.viewer}
            modalIsOpen={this.state.childModalIsOpen}
            closeModal={this._closeModal}
            onChange={this.props.onChange}
            onParent1Change={this.props.onParent1Change}
            onParent2Change={this.props.onParent2Change}
            isLoggedIn={this.props.isLoggedIn}
            isError={this.props.isError}
            user={this.props.user}
            parent1={this.props.parent1}
            parent2={this.props.parent2}
            onErrorChange={this.props.onErrorChange}
            me={this.props.me}
            circle={this.props.circle}
            circleId={this.props.circleId}
          />
        )}
      </section>
    );
  }
}

styles = {
  container: {
    display: 'flex',
  },
  button: {
    fontFamily: 'Lato',
    fontSize: 18,
    color: colors.blue,
    cursor: 'pointer',
    textAlign: 'left',
    position: 'relative',
  },
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    width: 400,
  },
  modalHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontFamily: 'Lato',
    fontSize: 24,
    fontWeight: fonts.weight.medium,
    color: colors.blue,
    marginBottom: 20,
    flex: '2 0 0',
  },
  modalClose: {
    justifyContent: 'flex-center',
    paddingTop: 10,
    color: colors.gray,
    cursor: 'pointer',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontFamily: 'Lato',
    fontSize: 18,
    color: colors.blue,
  },
  checkBox: {
    cursor: 'pointer',
    height: 14,
    width: 14,
  },
  addButton: {
    fontSize: '15px',
    backgroundColor: colors.blue,
    color: colors.white,
    marginRight: '20px',
    textTransform: 'none',
  },
};

export default createFragmentContainer(withAlert(AddMember), {
  viewer: graphql`
    fragment AddMember_viewer on Viewer {
      me {
        id
      }
      ...SearchModal_viewer
      ...AddChildModal_viewer
    }
  `,
});
