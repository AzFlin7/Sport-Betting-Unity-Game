import React, { Component } from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import Radium from 'radium';

import localizations from '../Localizations';
import { colors } from '../../theme';

class StatsSummary extends Component {
  _getUserStats = user => {
    let userStats = [
      {
        name: localizations.profile_statistics_user_participated,
        value: user.userStatistics.numberOfParticipated,
      },
      {
        name: localizations.profile_statistics_user_averageWeek,
        value:
          Math.round(
            user.userStatistics.averageNumberOfParticipatedWeek * 10,
          ) / 10,
      },
      {
        name: localizations.profile_statistics_user_averageMonth,
        value:
          Math.round(
            user.userStatistics.averageNumberOfParticipatedMonth * 10,
          ) / 10,
      },
      {
        name: localizations.profile_statistics_user_averageYear,
        value:
          Math.round(
            user.userStatistics.averageNumberOfParticipatedYear * 10,
          ) / 10,
      },
    ];
    return userStats;
  };

  render() {
    const { user } = this.props;
    const userStats = this._getUserStats(user);

    return (
      <div>
        <h1 style={styles.title}>
          {localizations.profile_statistics_sportunity_title}
        </h1>
        <div style={styles.teamRow}>
          {userStats &&
            userStats.map((stat, index) => (
              <div key={index + 'Stat'} style={styles.statItem}>
                <div style={styles.statValue}>{stat.value}</div>
                <div style={styles.statName}>{stat.name}</div>
              </div>
            ))}
        </div>
      </div>
    );
  }
}

const styles = {
  title: {
    fontSize: 32,
    fontWeight: 500,
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 40,
  },
  teamRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    alignItems: 'baseline',
    flexWrap: 'wrap',
    paddingLeft: 20,
    paddingRight: 20,
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: 10,
    flex: 1
  },
  statValue: {
    fontSize: 45,
    color: colors.blue,
    fontWeight: 'bold',
    fontFamily: 'lato',
  },
  statName: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'lato',
    marginTop: 10,
  },
};

export default createFragmentContainer(Radium(StatsSummary), {
  user: graphql`
    fragment StatsSummary_user on User {
      id
      userStatistics {
        numberOfParticipated
        averageNumberOfParticipatedWeek
        averageNumberOfParticipatedMonth
        averageNumberOfParticipatedYear
        membersUserParticipatesWith {
          number
        }
      }
    }
  `,
});
