import React from 'react';
import { createRefetchContainer, graphql } from 'react-relay/compat';
import Radium from 'radium';

import { colors } from '../../theme';
import localizations from '../Localizations';
import OrganizerRightModal from './OrganizerRightModal';
import { AdministratorPermissions } from './AdministratorPermissions';

let styles;

class Organizer extends React.Component {
  state = {
    roleOther: false,
    rightModalOpen: false,
  };

  componentDidMount = () => {
    if (this.props.sport && this.props.sport.id) {
      // TODO props.relay.* APIs do not exist on compat containers
      this.props.relay.refetch({
        sportId: this.props.sport.id,
        querySport: true,
      });
    }

    if (this.props.sport && this.props.sport.value) {
      // TODO props.relay.* APIs do not exist on compat containers
      this.props.relay.refetch({
        sportId: this.props.sport.value,
        querySport: true,
      });
    }

    if (this.props.organizer.customSecondaryOrganizerType)
      this.setState({ roleOther: true });
  };

  componentWillReceiveProps = nextProps => {
    if (
      nextProps.sport &&
      nextProps.sport.id &&
      (!this.props.sport ||
        (this.props.sport.id && this.props.sport.id !== nextProps.sport.id))
    ) {
      // TODO props.relay.* APIs do not exist on compat containers
      this.props.relay.refetch({
        sportId: nextProps.sport.id,
        querySport: true,
      });
    }
  };

  _renderSportInformation = (organizer, selectedSport) => {
    if (!selectedSport) return <div>-</div>;

    if (
      selectedSport.assistantTypes &&
      selectedSport.assistantTypes.length > 0 &&
      !this.state.roleOther
    ) {
      return (
        <div style={styles.sportInfo}>
          <select
            value={organizer.secondaryOrganizerType}
            style={styles.assistantSelect}
            onChange={this._handleUpdateRole}
          >
            <option key={0} value={''}>
              {localizations.newSportunity_organizerChoose}
            </option>
            }
            {selectedSport.assistantTypes.map(assistantType => (
              <option key={assistantType.id} value={assistantType.id}>
                {assistantType.name[localizations.getLanguage().toUpperCase()]}
              </option>
            ))}
            <option key={'localOther'} value={'localOther'}>
              {localizations.other}
            </option>
            }
          </select>
        </div>
      );
    } else if (
      selectedSport.assistantTypes &&
      selectedSport.assistantTypes.length > 0 &&
      this.state.roleOther
    ) {
      return (
        <div style={styles.sportInfo}>
          <input
            type="text"
            maxLength="30"
            style={styles.textInput}
            value={organizer.customSecondaryOrganizerType || ''}
            onChange={this._handleUpdateCustomRole}
          />
          <div
            style={styles.resetRoleOther}
            onClick={this._handleResetRoleOther}
          >
            <i className="fa fa-times" aria-hidden="true" />
          </div>
        </div>
      );
    } else return <div>-</div>;
  };

  _handleUpdatePrice = event => {
    this.props.updatePrice(Number(event.target.value));
  };

  _handleUpdateRole = event => {
    if (!event.target.value || event.target.value === '')
      this.props.updateRole(null);
    else if (event.target.value == 'localOther') {
      this.props.updateRole(null);
      this.setState({ roleOther: true });
    } else this.props.updateRole(event.target.value);
  };

  _handleUpdateCustomRole = event => {
    if (!event.target.value || event.target.value === '')
      this.props.updateCustomRole(null);
    else this.props.updateCustomRole(event.target.value);
  };

  _handleResetRoleOther = () => {
    this.setState({
      roleOther: false,
    });
    this.props.updateCustomRole(null);
  };

  _renderRight = () => {
    let value = localizations.newSportunity_organizerRightCustomized;
    if (
      JSON.stringify(this.props.organizer.permissions) ===
      JSON.stringify(AdministratorPermissions)
    ) {
      value = localizations.newSportunity_organizerRightAdministrator;
    }
    return (
      <div>
        <select
          value="hidden"
          style={styles.assistantSelect}
          onChange={e => {
            if (e.target.value === 'Customized') {
              this.setState({ rightModalOpen: true });
            } else if (e.target.value === 'Administrator') {
              this._handleUpdatePermissions(AdministratorPermissions);
            }
          }}
        >
          <option hidden value="hidden">
            {value}
          </option>
          <option value="Administrator">
            {localizations.newSportunity_organizerRightAdministrator}
          </option>
          <option value="Customized">
            {localizations.newSportunity_organizerRightCustomized}
          </option>
        </select>
      </div>
    );
  };

  _handleUpdatePermissions = permissions => {
    this.props.updatePermissions(permissions);
  };

  render() {
    const { organizer, viewer, sport, isModifying } = this.props;
    const { rightModalOpen } = this.state;

    if (!organizer) {
      return null;
    }

    return (
      <tr style={styles.container}>
        <td style={styles.pseudo}>
          {organizer.circles.length > 1
            ? organizer.circles.length +
              ' ' +
              localizations.newSportunity_organizerSelectedCircle +
              's'
            : organizer.circles.length +
              ' ' +
              localizations.newSportunity_organizerSelectedCircle}
        </td>
        <td style={styles.role}>
          {this._renderSportInformation(
            organizer,
            viewer.sport ? viewer.sport : sport,
          )}
        </td>
        <td style={styles.priceInputContainer}>
          <input
            type="number"
            style={styles.priceInput}
            value={organizer.price.cents}
            onChange={this._handleUpdatePrice}
          />
        </td>
        <td>{this._renderRight()}</td>
        <td style={styles.removeIcon} onClick={this.props.removeOrganizer}>
          <i className="fa fa-times" aria-hidden="true" />
        </td>
        {rightModalOpen && (
          <OrganizerRightModal
            isOpen={rightModalOpen}
            close={() => {
              this.setState({ rightModalOpen: false });
            }}
            updatePermissions={this._handleUpdatePermissions}
            organizer={this.props.organizer}
          />
        )}
      </tr>
    );
  }
}

styles = {
  container: {
    marginTop: 5,
    fontSize: 20,
    color: '#515151',
    position: 'relative',
    lineHeight: '50px',
  },
  pseudo: {
    fontWeight: 500,
  },
  sportInfo: {
    paddingLeft: 10,
    position: 'relative',
  },
  resetRoleOther: {
    position: 'absolute',
    top: 0,
    right: 20,
    fontSize: 12,
    cursor: 'pointer',
  },
  assistantSelect: {
    width: '80%',
    minWidth: 90,
    height: 25,
    fontFamily: 'Lato',
    fontSize: 14,
  },
  textInput: {
    width: '80%',
    minWidth: 90,
    height: 25,
    fontFamily: 'Lato',
    fontSize: 14,
  },
  price: {
    color: colors.gray,
  },
  priceInputContainer: {},
  priceInput: {
    width: 90,
    height: 36,
    border: '2px solid #5E9FDF',
    borderRadius: '3px',
    textAlign: 'center',
    fontFamily: 18,
    lineHeight: 1,
    color: 'rgba(146,146,146,0.87)',
    fontSize: 16,
  },
  removeIcon: {
    cursor: 'pointer',
    textAlign: 'right',
  },
};

export default createRefetchContainer(
  Radium(Organizer),
  {
    //OK
    viewer: graphql`
      fragment OrganizerPendingCircle_viewer on Viewer
        @argumentDefinitions(
          sportId: { type: "ID", defaultValue: null }
          querySport: { type: "Boolean!", defaultValue: false }
        ) {
        sport(id: $sportId) @include(if: $querySport) {
          id
          assistantTypes {
            id
            name {
              EN
              FR
              DE
              ES
            }
          }
        }
      }
    `,
  },
  graphql`
    query OrganizerPendingCircleRefetchQuery(
      $sportId: ID
      $querySport: Boolean!
    ) {
      viewer {
        ...OrganizerPendingCircle_viewer
          @arguments(sportId: $sportId, querySport: $querySport)
      }
    }
  `,
);
