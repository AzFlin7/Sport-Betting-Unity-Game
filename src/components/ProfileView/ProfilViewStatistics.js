import React from 'react';
import PureComponent, { pure } from './../common/PureComponent';
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium';
import ReactLoading from 'react-loading';
import Select from 'react-select';

import localizations from './../Localizations'
import styles from './../../components/ProfileView/ClubsStats/styles.js';

import {withRouter} from "found";
import {Link} from 'found'

var Style = Radium.Style;

let RSelect = Radium(Select);

class Stats extends React.Component {

  constructor() {
    super();
    this.state = {
      teamStatistics: [],
      teamStatisticsCols: [],
      isProcessing: false,
      isCircleListOpen: false,
      selectedCircles: [],
      selectedFilter: null,
      date: null,
      nameFilter: null,
      openModal: false,
      userStats: []
    }
  }

  componentDidMount() {
    // window.addEventListener('click', this._handleClickOutside);
    if (this.props.userId) {
      this.props.relay.refetch(fragmentVariables => ({
          ...fragmentVariables,
          id: this.props.userId,
          query: true
        }),
        null,
        () => {
          setTimeout(() => {
            this.props.relay.refetch(fragmentVariables => ({
              ...fragmentVariables,
              query2: true
            }))
          }, 50);
        })
      if (this.props.user && this.props.user.circles && this.props.user.circles.edges && this.props.user.circles.edges.length > 0) {
        this.setState({
          isProcessing: true
        })
      }
    }
  }

  componentWillUnmount() {
    // window.removeEventListener('click', this._handleClickOutside);
  }

  _handleClickOutside = event => {
    if (!this._containerNode.contains(event.target)) {
      this.setState({ isCircleListOpen: false });
    }
  }

  componentWillReceiveProps = (nextProps) => {
    this.setState({
      isProcessing: true
    })

    if (nextProps.user && nextProps.user.userStatistics) {
      let teamStatisticsCols = this._getTeamsStatsCols();
      let teamStatistics = this._getTeamsStats(nextProps.user);
      this.setState({
        teamStatistics,
        teamStatisticsCols,
        userStats: this._getUserStats(nextProps.user),
      })
      setTimeout(() => {
        this.sortDown(0);
        if (this.state.isProcessing)
          this.setState({
            isProcessing: false
          })
      }, teamStatistics.length > 0 ? 1500 : 20000)
    }
  }

  _getUserStats = (user) => {
    let result = [
      { name: localizations.profile_statistics_club_member, value: this._getAllMember(user) },
      { name: localizations.profile_statistics_user_averageWeek, value: this._getAverageWeek(user) },
      { name: localizations.profile_statistics_user_averageMonth, value: this._getAverageMonth(user) },
      { name: localizations.profile_statistics_user_averageYear, value: this._getAverageYear(user) },
    ]
    return result
  };

  _getAllMember = (user) => {
    let result = [];
    user.allCircleMembers.forEach(member => {
      if (result.findIndex(id => id === member.user.id) < 0)
        result.push(member.user.id)
    });
    user.subAccounts && user.subAccounts.forEach(team => {
      team.allCircleMembers.forEach(member => {
        if (result.findIndex(id => id === member.user.id) < 0)
          result.push(member.user.id)
      });
    });
    return result.length;
  };

  _getAverageWeek = (user) => {
    let result = 0;
    result += user.userStatistics.averageNumberOfOrganizedWeek;
    user.subAccounts && user.subAccounts.forEach(team => {
      result += team.userStatistics.averageNumberOfOrganizedWeek;
    });
    return Math.round(result * 10) / 10;
  };

  _getAverageMonth = (user) => {
    let result = 0;
    result += user.userStatistics.averageNumberOfOrganizedMonth;
    user.subAccounts && user.subAccounts.forEach(team => {
      result += team.userStatistics.averageNumberOfOrganizedMonth;
    });
    return Math.round(result * 10) / 10;
  };

  _getAverageYear = (user) => {
    let result = 0;
    result += user.userStatistics.averageNumberOfOrganizedYear;
    user.subAccounts && user.subAccounts.forEach(team => {
      result += team.userStatistics.averageNumberOfOrganizedYear;
    });
    return Math.round(result * 10) / 10;
  };

  _getTeamsStatsCols = () => {
    let result = [
      {
        name: localizations.profile_statistics_club_team_member,
        id: 1,
      },
      {
        name: localizations.profile_statistics_club_team_event,
        id: 2
      }
    ];
    return result;
  };

  _getTeamsStats = (user) => {
    let result = [];

    user.subAccounts && user.subAccounts.forEach(team => {
      let values = [];
      let nbMember = 0;
      team.allCircleMembers.forEach(member => {
        //if (member.circles.findIndex(circle => circle.circle.owner.id === team.id) >= 0)
        nbMember += 1;
      });
      values.push({ value: nbMember });
      values.push({ value: team.sportunityNumber });
      result.push({ participant: team, values })
    });
    return result
  };

  onClose = () => {
    this.props.relay.refetch(fragmentVariables => ({
      ...fragmentVariables,
      id: null,
      query: false,
    }))
    this.props.onLeave();
  }

  sortUp = (colIndex) => {
    let teamStats = this.state.teamStatistics;

    teamStats = teamStats.sort((a, b) => {
      if (a.values[colIndex].value - b.values[colIndex].value > 0)
        return 1;
      else if (a.values[colIndex].value - b.values[colIndex].value < 0)
        return -1
      else return 0;
    })
    this.setState({
      teamStatistics: teamStats
    })
  }

  sortDown = (colIndex) => {
    let teamStats = this.state.teamStatistics;

    teamStats = teamStats.sort((a, b) => {
      if (b.values[colIndex].value - a.values[colIndex].value > 0)
        return 1;
      else if (b.values[colIndex].value - a.values[colIndex].value < 0)
        return -1
      else return 0;
    })
    this.setState({
      teamStatistics: teamStats
    })
  }


  render() {
    let { viewer, user } = this.props;
    const { userStats, teamStatisticsCols, teamStatistics, userBestStatistics } = this.state;

    return (

      <div>
        <div style={styles.padding}>
          <button
            style={styles.blueButton}
          >
            Complete your statistics
            <i
              style={styles.marker}
              className="fa fa-pencil"
              aria-hidden="true"
            />
          </button>
        </div>
        <div style={styles.content}>
          <div style={styles.section}>
            <div>
              <h1 style={styles.title}>Statistique</h1>

                <button
                  style={styles.blueButton}
                >
                  Add new filter
                </button>
              </div>
            <h1 style={styles.title}>
              {localizations.profile_statistics_sportunity_title}
            </h1>
            <div style={styles.teamRow}>
              {userStats && userStats.map((stat, index) => (
                <div key={index + 'Stat'} style={styles.statItem}>
                  <div style={styles.statValue}>{stat.value}12</div>
                  <div style={styles.statName}>{stat.name}</div>
                </div>
              ))}
            </div>
            <div>
              <h1 style={styles.title}>Member statistics</h1>
              <div style={styles.userpic} />
              <p>name</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
}



export default createRefetchContainer(Radium(withRouter(Stats)), {
//OK
    user: graphql`
        fragment ProfilViewStatistics_user on User @argumentDefinitions(
            query: { type: "Boolean!", defaultValue: false }
            query2: { type: "Boolean!", defaultValue: false }
          ){
            pseudo
            id
            allCircleMembers @include(if:$query) {
                user {
                    id
                }
            }
            userStatistics @include(if:$query){
                averageNumberOfOrganizedWeek
                averageNumberOfOrganizedMonth
                averageNumberOfOrganizedYear
            }
            subAccounts @include(if:$query2){
                id
                pseudo
                avatar
                sportunityNumber
                allCircleMembers {
                    user {
                        id
                    }
                }
                userStatistics {
                    averageNumberOfOrganizedWeek
                    averageNumberOfOrganizedMonth
                    averageNumberOfOrganizedYear
                }
            }
        }
    `,
    viewer: graphql`
        fragment ProfilViewStatistics_viewer on Viewer @argumentDefinitions(
            id: { type: "String", defaultValue: null }
            circleIds: { type: "[String]", defaultValue: null }
            query: { type: "Boolean!", defaultValue: false }
            dateInterval: { type: "StringIntervalInput", defaultValue: null }
          ){
            me {
                id
            }
            statisticPreferences (userID: $id) @include(if:$query) {
                private,
                userStats {
                    stat0 {
                        id
                        name
                    }
                    stat1 {
                        id,
                        name
                    }
                    stat2 {
                        id,
                        name
                    }
                    stat3 {
                        id,
                        name
                    }
                    stat4 {
                        id,
                        name
                    }
                    stat5 {
                        id,
                        name
                    }
                    statManOfTheGame {
                        id,
                        name
                    }
                }
            }
            sportunitiesStatistics (userID: $id) @include(if:$query) {
                sportunityType {
                    id
                    name {
                        EN,
                        FR
                    }
                }
                sportunityTypeStatus {
                    id
                    name {
                        EN,
                        FR
                    }
                }
                details {
                    opponent {
                        id
                        pseudo
                        avatar
                    }
                    value
                }
                value
            }
            circlesStatistics (userID: $id, circlesIDs: $circleIds, dateInterval: $dateInterval) @include(if:$query) {
                statisticName {
                    id,
                    name
                },
                participant {
                    id
                    pseudo
                    avatar
                }
                value
            }
        }
    `,
  },
  graphql`
query ProfilViewStatisticsRefetchQuery(
    $id: String
    $circleIds: [String]
    $query: Boolean!
    $query2: Boolean!
    $dateInterval: StringIntervalInput
) {
  viewer {
    ...ProfilViewStatistics_viewer
      @arguments(
        id: $id
        circleIds: $circleIds
        query: $query
        dateInterval: $dateInterval
      )
      me{
        ...ProfilViewStatistics_user
        @arguments(
            query: $query
            query2: $query2
        )
      }
  }
}
`,
);
