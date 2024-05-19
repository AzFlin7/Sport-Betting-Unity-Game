import React, { Component } from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import Radium from 'radium';
import get from 'lodash/get';

import localizations from '../Localizations';
import { colors } from '../../theme';
import MyCirclesCircleItem from '../MyCircles/MyCirclesCircleItem';

class ProfileGroups extends Component {
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
    let circleList = get(user, 'circles.edges', []).filter(circle => get(circle, 'node.mode') === 'PUBLIC');

    if (circleList.length === 0) {
      return null;
    }

    return (
      <div style={styles.container}>
        <h1 style={styles.title}>
          {localizations.circles_groups}
        </h1>
        {circleList.map(circle => (
          <MyCirclesCircleItem
            key={circle.node.id}
            circle={circle.node}
            viewer={{ user }}
            link={`/circle/${circle.node.id}`}
          >
            {circle.node.owner
              ? circle.node.name +
                ' ' +
                localizations.find_my_sport_clubs_of +
                ' ' +
                circle.node.owner.pseudo
              : circle.node.name}
          </MyCirclesCircleItem>
        ))}
      </div>
    );
  }
}

const styles = {
  container: {
    paddingLeft: 40,
    paddingRight: 40,
    marginBottom: 40,
    borderBottom: '1px solid ' + colors.lightGray
  },
  title: {
    fontSize: 32,
    fontWeight: 500,
    marginTop: 20,
    marginBottom: 20,
  },
};

export default createFragmentContainer(Radium(ProfileGroups), {
  user: graphql`
    fragment ProfileGroups_user on User {
      id
      circles (last: 10) {
        edges {
          node {
            ...MyCirclesCircleItem_circle
            id
            name
            mode
            owner {
              id
              pseudo
            }
          }
        }
        count
      } 
    }
  `,
});
