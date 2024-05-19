import React from 'react';
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium';
import ReactLoading from 'react-loading';
import Circle from '../TeamsStats'

import localizations from '../../Localizations'
import { colors } from '../../../theme';
import styles from './styles.js';

class SportunitiesStats extends React.Component {

    constructor() {
        super(); 
        this.alertOptions = {
            offset: 60,
            position: 'top right',
            theme: 'light',
            transition: 'fade',
        };
        this.state = {
            sportunitiesStatistics: [],
            isProcessing: false
        }
    }

    componentDidMount() {
        if (this.props.userId) {
            this.props.relay.refetch(fragmentVariables => ({
                ...fragmentVariables, 
                id: this.props.userId,
                query: true,
            }))
            this.setState({
                isProcessing: true
            })
        }
    }

    componentWillReceiveProps = (nextProps) => {
      if (nextProps.relay.variables.id === this.props.userId && nextProps.viewer.sportunitiesStatistics) {
        let opponentColStatistics = this. _getOpponantsColStats(nextProps.viewer.sportunitiesStatistics);
        this.setState({
          sportunitiesStatistics: this._getParticipantsStats(nextProps.viewer.sportunitiesStatistics),
          opponentColStatistics,
          opponentStatistics: this._getOpponentsStats(nextProps.viewer.sportunitiesStatistics, opponentColStatistics)
        })
        this.setState({
          isProcessing: false
        })
      }
    }

    _getOpponentsStats = (sportunitiesStatistics, opponentsColStats) => {
      let results = [];

      if (sportunitiesStatistics && sportunitiesStatistics.length > 0) {
        sportunitiesStatistics.forEach(stat => {
          stat.details.forEach(detail => {
            if (detail.opponent) {
              let index = results.findIndex(result => result.opponent && result.opponent.id === detail.opponent.id)
              let indexColType = opponentsColStats.findIndex(col => (col.id === stat.sportunityType.id));
              let indexCol = opponentsColStats.findIndex(col => (col.id === stat.sportunityTypeStatus.id));

              if (index < 0) {
                results.push({opponent: detail.opponent, values: []});
                index = results.length - 1;
              }
              if (indexColType >= 0)
                results[index].values[indexColType] = (results[index].values[indexColType]) ?
                  results[index].values[indexColType] + detail.value : detail.value;
              if (indexCol >= 0)
                results[index].values[indexCol] = (results[index].values[indexCol]) ?
                  results[index].values[indexCol] + detail.value : detail.value;
            }
          })
        })
      }
      return results
    };

    _getOpponantsColStats = (sportunitiesStatistics) => {
      let results = [];

      if (sportunitiesStatistics && sportunitiesStatistics.length > 0) {
        sportunitiesStatistics.forEach(stat => {
          if (results.findIndex(result => result.id === stat.sportunityType.id) < 0)
            results.push({
              id: stat.sportunityType.id,
              name: stat.sportunityType.name[localizations.getLanguage().toUpperCase()],
              isType: true
            })
          if (results.findIndex(result => result.id === stat.sportunityTypeStatus.id) < 0)
            results.push({
              id: stat.sportunityTypeStatus.id,
              name: stat.sportunityTypeStatus.name[localizations.getLanguage().toUpperCase()],
              isType: false
            })
        })
      }
      results.sort((a, b) => a.isType + b.isType)
      return results ;
    };

    _getParticipantsStats = (sportunitiesStatistics) => {
        let results = [];

        if (sportunitiesStatistics && sportunitiesStatistics.length > 0) {
            sportunitiesStatistics.forEach(stat => {
                results.push({
                    sportunityType: stat.sportunityType.name[localizations.getLanguage().toUpperCase()],
                    sportunityTypeStatus: stat.sportunityTypeStatus.name[localizations.getLanguage().toUpperCase()],
                    value: stat.value
                })                
            })
        }
        return results ;
    }

    
    onClose = () => {
        this.props.relay.refetch(fragmentVariables => ({
            ...fragmentVariables,
            id: null,
            query: false,
        }))
        this.props.onLeave();
    }

    render() {
        let {viewer} = this.props;
        
        const {sportunitiesStatistics, opponentColStatistics, opponentStatistics} = this.state;

        console.log(opponentStatistics);

        return (
            <div style={styles.container}>
                <h1 style={styles.title}>
                    {localizations.profile_statistics_sportunity_title}
                </h1>
                <div style={styles.teamRow}>
                  {sportunitiesStatistics.map((stat, index) => (
                    <div key={index+'Stat'} style={styles.statItem}>
                      <div style={styles.statValue}>{stat.value}</div>
                      <div style={styles.statName}>{stat.sportunityTypeStatus}</div>
                    </div>
                  ))}
                </div>
                {this.state.isProcessing 
                    ? <div style={styles.loadingContainer}><ReactLoading type='cylon' color={colors.blue} /></div>
                    :
                    <div>
                        <div style={styles.section}>
                            {sportunitiesStatistics && sportunitiesStatistics.length > 0 
                            ?   <table style={styles.table}>
                                    <thead>
                                        <tr style={{backgroundColor: '#abcff2'}}>
                                            <th style={styles.colLabel}>{localizations.profile_statistics_sportunity_opponent}</th>
                                          {opponentColStatistics.map((col, index) => (
                                            <th style={styles.headerCol} key={index + 'Col'}>{localizations.profile_statistics_sportunity_nbrOf + col.name}</th>
                                          ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {opponentStatistics.map((stat, index) => (
                                            <tr key={index} style={{backgroundColor: (index % 2 === 1) ? '#FFF' : '#ddefff'}}>
                                              <td style={styles.col}>
                                                <div style={styles.circle}>
                                                  <div style={{...styles.icon, backgroundImage: stat.opponent.avatar ? 'url('+ stat.opponent.avatar +')' : 'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")'}} />
                                                  <div style={styles.name}>{stat.opponent.pseudo}</div>
                                                </div>
                                              </td>
                                              {stat.values.map((value, indexCol) => (
                                                <td key={index+'-'+indexCol} style={styles.col}>
                                                  {value}
                                                </td>
                                              ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            :   <div style={styles.subtitle}>{localizations.profile_statistics_sportunity_none}</div>
                            }
                        </div>
                    </div>
                }
            </div>
        )
    }
}

export default createRefetchContainer(Radium(SportunitiesStats), {
//OK
    viewer: graphql`
        fragment OrganizedSportunitiesStatistics_viewer on Viewer @argumentDefinitions (
            id: {type: "String", defaultValue: null}
            query: {type: "Boolean!", defaultValue: false}
            ){
                id
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
        }
    `,
},
graphql`
query OrganizedSportunitiesStatisticsRefetchQuery(
    $id: String
    $query: Boolean!
) {
viewer {
    ...OrganizedSportunitiesStatistics_viewer
    @arguments(
      id: $id
      query: $query
    )
}
}
`,
);
