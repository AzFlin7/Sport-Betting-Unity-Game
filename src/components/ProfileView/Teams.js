import React from 'react';
import Radium from 'radium';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import get from 'lodash/get';

import localizations from '../Localizations';
import { colors, fonts, metrics } from '../../theme';
import TeamStatsTable from './clubStatsTableView';

let styles;

class Teams extends React.Component {
  getTotalMembers = () => {
    const { user } = this.props;
    const subAccounts = get(user, 'subAccounts', []);
    const totalMembers = subAccounts.reduce((acc, subAccount) => acc + get(subAccount, 'allCircleMembers', []).length, 0);
    return totalMembers;
  }

  getTotalTeams = () => {
    const { user } = this.props;
    const totalTeams = get(user, 'subAccounts', []).length;
    return totalTeams;
  }

  getStats = () => {
    const { user } = this.props;
    const subAccounts = get(user, 'subAccounts', []);

    const stats = subAccounts.map((subAccount) => {
      const { id, avatar, pseudo, sportunityNumber, allCircleMembers = [] } = subAccount;
      return {
        avatar,
        key: id,
        name: pseudo,
        membersCount: allCircleMembers.length,
        eventsCount: sportunityNumber,
      };
    });

    return stats;
  };

  render() {
    const { user, viewer } = this.props;
    console.log({ user, viewer });

    return (
      <div style={styles.content}>
        <div style={styles.teamRow}>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{this.getTotalMembers()}</div>
            <div style={styles.statName}>Total Members</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{this.getTotalTeams()}</div>
            <div style={styles.statName}>Number of Children</div>
          </div>
        </div>
        <TeamStatsTable stats={this.getStats()} />
      </div>
    );
  }
}

styles = {
  content: {
    flexGrow: '1',
    padding: '40px',
    fontFamily: 'Lato',
    color: 'rgba(0,0,0,0.65)',
    '@media (max-width: 483px)': {
      padding: '40px 20px',
    },
  },
  title: {
    fontSize: 32,
    fontWeight: 500,
    marginBottom: 30,
  },
  pencil: {
    fontSize: 20,
    color: colors.black,
    marginLeft: 10,
    cursor: 'pointer',
  },
  teamRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    alignItems: 'baseline'
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 10,
  },
  statValue: {
    fontSize: 50,
    color: colors.blue,
    fontWeight: 'bold',
    fontFamily: 'lato',
  },
  statName: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'lato',
  },
};

export default createFragmentContainer(Radium(Teams), {
  user: graphql`
    fragment Teams_user on User {
      id
      pseudo
      subAccounts {
        id
        pseudo
        avatar
        sportunityNumber
        allCircleMembers {
          user {
            id
          }
        }
      }
    }
  `,
  viewer: graphql`
    fragment Teams_viewer on Viewer {
      id
      me {
        id
        pseudo
      }
    }
  `,
});
