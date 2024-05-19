import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import Radium from 'radium';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import PureComponent, { pure } from '../common/PureComponent';
import { colors } from '../../theme';
import localizations from '../Localizations';

import SearchModal from '../common/SearchModal';

import Dropdown from './AddOrganizerDropdown';
import AddOrganizerModal from './AddOrganizerModal';
import FindOrganizerModal from './FindOrganizerModal';
import Organizer from './Organizer';
import OrganizerPendingCircle from './OrganizerPendingCircle';

let styles;

class Organizers extends React.Component {
  state = {
    showDropdown: false,
    chosenModal: 0,
  };

  _handleAddClick = event => {
    event.preventDefault();
    this.setState({ showDropdown: true });
  };

  _handleCloseModal = () => {
    this.setState({ showDropdown: false });
  };

  _handleChooseFindModal = () => {
    this.setState({
      chosenModal: 0,
    });
  };

  _handleChooseModal = value => {
    this.setState({
      showDropdown: false,
      chosenModal: value,
    });
  };

  _handleValidateAddOrganizers = organizers => {
    if (this.state.chosenModal === 4) {
      this.props.addCirclesOfPendingOrganizers(organizers);
      this.setState({
        showDropdown: false,
        chosenModal: 0,
      });
    } else {
      organizers.forEach(assistant => {
        setTimeout(() => {
          this.props.addOrganizer(assistant);
          this.setState({
            showDropdown: false,
            chosenModal: 0,
          });
        }, 200);
      });
    }
  };

  render() {
    const {
      style,
      sport,
      viewer,
      user,
      organizers,
      isModifying,
      isLoggedIn,
      circlesOfPendingOrganizers,
      error,
    } = this.props;
    const finalContainerStyles = Object.assign(
      {},
      error ? styles.errorContainer : styles.container,
      style,
    );

    return (
      <div
        style={finalContainerStyles}
        ref={node => {
          this._containerNode = node;
        }}
      >
        <table style={styles.list}>
          <thead>
            <tr style={styles.tableHeader}>
              <th>{localizations.newSportunity_organizerName}</th>
              <th>{localizations.newSportunity_organizerRole}</th>
              <th>
                {localizations.newSportunity_organizerFee +
                  ' (' +
                  this.props.userCurrency +
                  ')'}
              </th>
              <th>{localizations.newSportunity_organizerRight}</th>
              {!isModifying && <th /> // Removal cross
              }
            </tr>
          </thead>
          <tbody>
            <tr style={styles.mainOrganizerContainer}>
              <td style={styles.mainOrganizerPseudo}>
                {user ? user.pseudo : localizations.myEvents_me}
              </td>
              <td>{localizations.newSportunity_organizerMain}</td>
              <td />
              {!isModifying && <td />}
            </tr>
            {organizers.map((organizer, index) => (
              <Organizer
                key={index}
                organizer={organizer}
                viewer={viewer}
                sport={sport}
                isModifying={isModifying}
                removeOrganizer={this.props.removeOrganizer}
                updatePrice={this.props.updateOrganizerPrice}
                updateRole={this.props.updateOrganizerRole}
                updateCustomRole={this.props.updateOrganizerCustomRole}
                updatePermissions={this.props.updateOrganizerPermissions}
              />
            ))}
            {circlesOfPendingOrganizers.map((organizer, index) => (
              <OrganizerPendingCircle
                key={index}
                organizer={organizer}
                viewer={viewer}
                sport={sport}
                isModifying={isModifying}
                removeOrganizer={() =>
                  this.props.removeCirclesOfPendingOrganizers(index)
                }
                updatePrice={price =>
                  this.props.updateCirclesOfPendingOrganizersPrice(
                    index,
                    price,
                  )
                }
                updateRole={role =>
                  this.props.updateCirclesOfPendingOrganizersRole(index, role)
                }
                updateCustomRole={curstomRole =>
                  this.props.updateCirclesOfPendingOrganizersCustomRole(
                    index,
                    curstomRole,
                  )
                }
                updatePermissions={permissions => {
                  this.props.updatePendingOrganizerPermissions(
                    index,
                    permissions,
                  );
                }}
              />
            ))}
          </tbody>
        </table>
        {
          //!isModifying &&
          <button style={styles.add} onClick={this._handleAddClick}>
            {this.props.buttonLabel}
          </button>
        }

        {this.state.showDropdown && this.state.chosenModal === 0 && (
          <AddOrganizerModal
            isOpen={this.state.showDropdown}
            closeModal={this._handleCloseModal}
            chooseModal={this._handleChooseModal}
          />
        )}

        {this.state.chosenModal !== 0 && (
          <SearchModal
            isOpen={this.state.chosenModal !== 0}
            viewer={this.props.viewer}
            onClose={this._handleChooseFindModal}
            onValide={this._handleValidateAddOrganizers}
            tabs={this.state.chosenModal === 2 ? ['People'] : ['Groups', 'People']}
            openOnTab={this.state.chosenModal === 2 ? 'People' : 'Groups'}
            allowToSeeCircleDetails={this.state.chosenModal === 3}
            types={['ADULTS', 'COMPANIES']}
            circleTypes={['MY_CIRCLES', 'CIRCLES_I_AM_IN', 'CHILDREN_CIRCLES']}
            userType={'PERSON'}
            queryCirclesOnOpen={true}
          />
        )}

        {/* {this.state.chosenModal !== 0 &&
          <FindOrganizerModal
            isLoggedIn={isLoggedIn}
            viewer={viewer}
            user={user}
            sport={sport}
            isOpen={this.state.chosenModal !== 0}
            openedModal={this.state.chosenModal}
            closeModal={this._handleChooseFindModal}
            addOrganizer={this._handleAddOrganizer}
            addCirclesOfPendingOrganizers={this._handleAddCirclesOfPendingOrganizers}
          />
        } */}
      </div>
    );
  }
}

Organizers.defaultProps = {
  buttonLabel: 'Add',
};

styles = {
  container: {
    fontFamily: 'Lato',
    position: 'relative',
    marginBottom: 27,
    marginTop: 10,
    padding: 10,
  },
  errorContainer: {
    fontFamily: 'Lato',
    position: 'relative',
    marginBottom: 27,
    marginTop: 10,
    padding: 10,
    border: '0px solid ' + colors.redGoogle,
    borderRadius: 5,
  },

  list: {
    marginBottom: 18,
    width: '100%',
  },
  tableHeader: {
    fontSize: 20,
    color: '#4E4E4E',
    textAlign: 'left',
    lineHeight: '45px',
  },
  add: {
    border: 'none',
    backgroundColor: colors.blue,
    color: colors.white,

    fontSize: 18,
    fontWeight: 500,
    lineHeight: 1,

    padding: '8.5px 13px 7.5px',

    cursor: 'pointer',

    borderRadius: 3,
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
  },
  mainOrganizerContainer: {
    marginTop: 5,
    fontSize: 13,
    color: '#515151',
    position: 'relative',
    lineHeight: '50px',
    color: colors.gray,
  },
  mainOrganizerPseudo: {
    color: 'rgba(0, 0, 0, 0.64)',
  },
};

const dispatchToProps = dispatch => ({});

const stateToProps = state => ({
  userCurrency: state.globalReducer.userCurrency,
});

let ReduxContainer = connect(
  stateToProps,
  dispatchToProps,
)(Radium(Organizers));

export default createFragmentContainer(Radium(ReduxContainer), {
  viewer: graphql`
    fragment Organizers_viewer on Viewer {
      id
      ...AddOrganizerDropdown_viewer
      ...FindOrganizerModal_viewer
      ...Organizer_viewer
      ...OrganizerPendingCircle_viewer
      ...SearchModal_viewer
    }
  `,
  user: graphql`
    fragment Organizers_user on User {
      id
      pseudo
      ...FindOrganizerModal_user
    }
  `,
});
