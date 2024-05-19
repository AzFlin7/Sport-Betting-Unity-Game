import React from 'react';
import PropTypes from 'prop-types';
import PureComponent, { pure } from '../../common/PureComponent'
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium';
import ReactLoading from 'react-loading';
import Select from 'react-select';

import localizations from '../../Localizations'
import { colors } from '../../../theme/index';
import styles from './styles.js';

import Input from './Input'
import Circle from './Circle';
import DatePicker from 'react-datepicker'
import moment from "moment/moment";
import RemoveFilterMutation from "./RemoveFilterMutation";
import { withAlert } from 'react-alert'
import SelectFilter from "./SelectFilter";
import NewFilterMutation from "./NewFilterMutation";
import UpdateFilterMutation from "./UpdateFilterMutation";
import FilterModal from "./FilterModal"

var Style = Radium.Style;

let RSelect = Radium(Select);

class CircleStats extends React.Component {
  static contextTypes = {
    relay: PropTypes.shape({
      variables: PropTypes.object,
    }),
  };
    constructor() {
        super();
        this.alertOptions = {
            offset: 60,
            position: 'top right',
            theme: 'light',
            transition: 'fade',
        };
        this.state = {
            userStatistics: [],
            userStatisticsCols: [],
            isProcessing: false,
            isCircleListOpen: false,
            selectedFilter: null,
            date: null,
            nameFilter: null,
            openModal: false
        }
    }

    componentDidMount() {
        // window.addEventListener('click', this._handleClickOutside);
        
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
      if (this.props.queryCircle && !nextProps.queryCircle) {
        if (this.props.userId) {
          this.props.relay.refetch(fragmentVariables => ({
            ...fragmentVariables, 
            id: this.props.userId,
            circleStatsCircleId: this.props.circleId,
            query: true
          }),
          null,
          () => setTimeout(() => this._applyFilter(), 150)
        )
          if (this.props.user && this.props.user.statCircles && this.props.user.statCircles.edges && this.props.user.statCircles.edges.length > 0) {
              this.setState({
                  isProcessing: true
              })
          }
      }
      }

      if (nextProps.viewer.statisticPreferences) {
        // if (nextProps.viewer.circle && nextProps.viewer.circle.id === this.state.selectedCircles.id) {
        let userStatisticsCols = this._getParticipantsStatsCols(nextProps.viewer.statisticPreferences);
        let userStatistics = this._getParticipantsStats(userStatisticsCols, nextProps.viewer.circlesStatistics);
        if (nextProps.viewer.statisticPreferences.isManOfTheGameActivated)
        {
          let nbManOfTheMatch = 0;
          userStatistics.forEach(stat => {
            stat.values.forEach(value => {
              if (value.id === nextProps.viewer.statisticPreferences.userStats.statManOfTheGame.id)
                nbManOfTheMatch += value.value
            })
          });
          if (nbManOfTheMatch === 0) {
            userStatisticsCols = userStatisticsCols.filter(col => col.id !== nextProps.viewer.statisticPreferences.userStats.statManOfTheGame.id)
            userStatistics = userStatistics.map(stat => ({
              participant: stat.participant,
              values: stat.values.filter(value => value.id !== nextProps.viewer.statisticPreferences.userStats.statManOfTheGame.id)
            }))
          }
        }
        this.setState({
          userStatistics,
          userStatisticsCols,
          userBestStatistics : this._getParticipantBetterStats(userStatisticsCols, nextProps.viewer.circlesStatistics),
        })
        setTimeout(() => {
          this.sortDown(0);
          this.setState({
            isProcessing: false
          })
        }, 150)
      }
        // }
    }

    _getParticipantBetterStats = (circlesStatisticsCols, circlesStatistics) => {
        let result = [];
        if (circlesStatisticsCols && circlesStatisticsCols.length > 0) {
            circlesStatisticsCols.forEach((statCol, index) => {
                result[index] = {participant: null, value: 0};
                circlesStatistics.forEach((stat) => {
                    if (stat.statisticName.id === statCol.id && stat.value >= result[index].value)
                        result[index] = {participant: stat.participant, value: stat.value}
                })
            })
        }
        return result;
    };

    _getParticipantsStatsCols = (statisticPreferences) => {
        let results = [];
        if (statisticPreferences && statisticPreferences.userStats) {
            Object.keys(statisticPreferences.userStats).forEach(stat => {
                if (statisticPreferences.userStats[stat] && statisticPreferences.userStats[stat].id)
                    results.push(statisticPreferences.userStats[stat])
            })
        }
        return results ;
    }

    _getParticipantsStats = (userStatisticsCols, circlesStatistics) => {
        let results = [];

        if (circlesStatistics && circlesStatistics.length > 0) {
            circlesStatistics.forEach(stat => {
                if (stat.participant) {
                    let index = results.findIndex(result => result.participant && result.participant.id === stat.participant.id);
                    let colIndex = userStatisticsCols.findIndex(result => result.id === stat.statisticName.id);

                    if (index < 0) {
                        results.push({participant: stat.participant, values:[]})
                        results[results.length - 1].values[colIndex] = {id: stat.statisticName.id , value:stat.value};
                    }
                    else {
                        results[index].values[colIndex] = {id: stat.statisticName.id , value:stat.value}
                    }
                }
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

    sortUp = (colIndex) => {
        let userStats = this.state.userStatistics ;

        userStats = userStats.sort((a,b) => {
            if (a.values[colIndex].value - b.values[colIndex].value > 0)
                return 1;
            else if (a.values[colIndex].value - b.values[colIndex].value < 0)
                return -1
            else return 0;
        })
        this.setState({
            userStatistics: userStats
        })
    }

    sortDown = (colIndex) => {
        let userStats = this.state.userStatistics ;

        userStats = userStats.sort((a,b) => {
            if (b.values[colIndex].value - a.values[colIndex].value > 0)
                return 1;
            else if (b.values[colIndex].value - a.values[colIndex].value < 0)
                return -1
            else return 0;
        })
        this.setState({
            userStatistics: userStats
        })
    }

  _removeFilter = (item) => {
      RemoveFilterMutation.commit({
        userId: this.props.userId,
        filterId: item.id
      }, {
        onFailure: error => {
          this.props.alert.show(error.getError().source.errors[0].message, {
            timeout: 2000,
            type: 'error',
          });
        },
        onSuccess: (response) => {
          this.props.alert.show(localizations.popup_editCircle_update_success, {
            timeout: 2000,
            type: 'success',
          });
        },
      }
    )
  };

  _changeFilter = (item) => {
    this.setState({
      selectedFilter: item,
    });
    
    if (item.date_begin !== null || item.date_end !== null) {
      this.setState({
        date: {
          from: item.date_begin !== null ? moment(item.date_begin) : moment(),
          to: item.date_end !== null ? moment(item.date_end) : moment(),
        }
      })
    }
  };

  _changeDate = (from, to) => {
    this.setState({
      date: {
        from,
        to
      }
    })
  }

  _saveFilter = () => {
    // if (!this.state.selectedFilter) {
      this._toggleModal()
      // this._newFilter();
    // }
    // else
    //     UpdateFilterMutation.commit({
    //       userId: this.props.userId,
    //       name: this.state.selectedFilter.name,
    //       from: this.state.date ? this.state.date.from : null,
    //       to: this.state.date ? this.state.date.to : null,
    //       filterId: this.state.selectedFilter.id,
    //       circleList: this.state.selectedCircles
    //     }, {
    //       onFailure: error => {
    //         this.props.alert.show(error.getError().source.errors[0].message, {
    //           timeout: 2000,
    //           type: 'error',
    //         });
    //
    //       },
    //       onSuccess: (response) => {
    //         this.props.alert.show(localizations.popup_editCircle_update_success, {
    //           timeout: 2000,
    //           type: 'success',
    //         });
    //       },
    //     })
  };

  _newFilter = () => {
    let name = this.state.nameFilter /*? this.state.nameFilter : prompt(localizations.profile_statistics_filter_name_title)*/
    if (name !== null)
        NewFilterMutation.commit({
          userId: this.props.userId,
          name: this.state.nameFilter,
          from: this.state.date ? this.state.date.from : null,
          to: this.state.date ? this.state.date.to : null,
        }, {
          onFailure: error => {
            this.props.alert.show(error.getError().source.errors[0].message, {
              timeout: 2000,
              type: 'error',
            });
          },
          onSuccess: (response) => {
            this.props.alert.show(localizations.popup_editCircle_update_success, {
              timeout: 2000,
              type: 'success',
            });
          },
        })
  };

  _changeFilterName = (name) => {
    this.setState({
      nameFilter: name
    })
  };

  _applyFilter = () => {
    this.props.relay.refetch(fragmentVariables => ({
      ...fragmentVariables,
      id: this.props.userId,
      circleStatsCircleId: this.props.circleId,
      dateInterval: {
        from : this.state.date && this.state.date.from ? moment(this.state.date.from)._d : moment().subtract(1, 'years')._d,
        to : this.state.date && this.state.date.to ? moment(this.state.date.to)._d : moment()._d,
      },
      query: true
    }))
  };

  _toggleModal = () => {
    this.setState({
      openModal: !this.state.openModal,
    });
  }

	removeFilter = () => {
		this.setState({
			selectedFilter: null
		})
	}

    render() {
        let {viewer, user} = this.props;

        const { userStatisticsCols, userStatistics, userBestStatistics} = this.state;

        return (

          <div>
            <Style scopeSelector=".react-datepicker__input-container" rules={{
              "input": styles.date
            }}
            />
            <Style scopeSelector=".react-datepicker" rules={{
              top: -20,
              "div": {fontSize: '1.4rem'},
              ".react-datepicker__current-month": {fontSize: '1.5rem'},
              ".react-datepicker__month": {margin: '1rem'},
              ".react-datepicker__day": {width: '2rem', lineHeight: '2rem', fontSize: '1.4rem', margin: '0.2rem'},
              ".react-datepicker__day-names": {width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: 5},
              ".react-datepicker__header": {padding: '1rem', display: 'flex', flexDirection: 'column',alignItems: 'center'}
            }}
            />
            <div style={styles.filterContainer}>
              <FilterModal
                isOpen={this.state.openModal}
                canCloseModal
                title={localizations.profile_statistics_filter_name_title}
                name={this.state.nameFilter}
                updateName={this._changeFilterName}
                onConfirm={this._newFilter}
                toggleModal={this._toggleModal}
                confirmLabel={localizations.profile_statistics_filter_save}
              />
              <div style={styles.filter}>
                <SelectFilter
                  label={localizations.profile_statistics_filter_label}
                  placeholder={localizations.profile_statistics_filter_placeholder}
                  selectedItem={this.state.selectedFilter}
                  onRemove={this._removeFilter}
                  list={user ? user.statisticFilters : []}
                  onSelectItem={this._changeFilter}
                  allowChange={viewer.me && viewer.me.id === user.id}
                />
              </div>
              <div style={styles.dateContainer}>
                <div style={styles.dateTitle}>
                  {localizations.profile_statistics_dateFrom}
                </div>
                <DatePicker
                  dateFormat="DD/MM/YYYY"
                  todayButton={localizations.newSportunity_today}
                  selected={((this.state.date && this.state.date.from !== null) ? this.state.date.from : moment().subtract(1, 'years'))}
                  maxDate={(this.state.date ? this.state.date.to : null)}
                  onChange={(moment) => {this._changeDate(moment, (this.state.date ? this.state.date.to : null)); this.removeFilter()}}
                  locale={localizations.getLanguage().toLowerCase()}
                  popperPlacement="top-end"
                  style={styles.date}
                  nextMonthButtonLabel=""
                  previousMonthButtonLabel=""
                />
              </div>
              <div style={styles.dateContainer}>
                <div style={styles.dateTitle}>
                  {localizations.profile_statistics_dateTo}
                </div>
                <DatePicker
                  dateFormat="DD/MM/YYYY"
                  todayButton={localizations.newSportunity_today}
                  selected={((this.state.date && this.state.date.to !== null) ? this.state.date.to : moment())}
                  minDate={(this.state.date ? this.state.date.from : null)}
                  onChange={(moment) => {this._changeDate((this.state.date ? this.state.date.from : null), moment); this.removeFilter()}}
                  locale={localizations.getLanguage().toLowerCase()}
                  popperPlacement="top-end"
                  style={styles.date}
                  nextMonthButtonLabel=""
                  previousMonthButtonLabel=""
                />
              </div>
              <div onClick={() => { this._applyFilter()}} style={{...styles.saveButton, backgroundColor: colors.green}}>
                {localizations.profile_statistics_filter_apply}
              </div>
              {!this.state.selectedFilter && viewer.me && viewer.me.id === user.id &&
              <div onClick={this._saveFilter} style={styles.saveButton}>
                {localizations.profile_statistics_filter_save}
              </div>
              }
            </div>
            <div style={{...styles.content, backgroundColor: '#f3f9fe'}}>
              <h1 style={styles.title}>
                {localizations.profile_statistics_team_member_title}
              </h1>
              {this.state.isProcessing
              ? <div style={styles.loadingContainer}>
                  <ReactLoading type='cylon' color={colors.blue} />
                </div>
              : <div>
                  {user.areStatisticsActivated && userStatistics && userStatistics.length > 0 
                  ? <div style={styles.section}>
                      <h3 style={styles.subtitle}>
                        {localizations.profile_statistics_participants_title}
                      </h3>
                      <div style={styles.bestRow}>
                        {userBestStatistics.filter(stat => stat.value > 0).map((stat, index) => (
                          <div key={index+'Best'} style={styles.bestItem}>
                            <div style={{...styles.iconBest, backgroundImage: stat.participant && stat.participant.avatar ? 'url('+ stat.participant.avatar +')' : 'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")'}} />
                            <div style={styles.moreOf}>{localizations.profile_statistics_more_of + userStatisticsCols[index].name.toUpperCase()}</div>
                            <div style={styles.pseudo}>{stat.participant ? stat.participant.pseudo : ''}</div>
                            <div style={styles.value}>{stat.value + ' ' + userStatisticsCols[index].name}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{width: '100%', overflow: 'auto'}}>
                        <table style={styles.table}>
                          <thead>
                          <tr style={{backgroundColor: '#abcff2'}}>
                            <th style={styles.colLabel}>{localizations.profile_statistics_participant}</th>
                            {userStatisticsCols.map((name, index) => (
                              <th key={index} style={styles.headerCol}>
                                <span style={styles.colName}>
                                  {name.name}
                                  <span style={styles.sortIcons}>
                                    <span style={styles.sortUpIcon} onClick={() => this.sortUp(index)}  />
                                    <span style={styles.sortDownIcon} onClick={() => this.sortDown(index)} />
                                  </span>
                                </span>
                              </th>
                            ))}
                          </tr>
                          </thead>
                          <tbody>
                          {userStatistics.map((stat, index) => (
                            <tr key={index} style={{backgroundColor: (index % 2 === 1) ? '#FFF' : '#ddefff'}}>
                              <td style={styles.colLabel}>
                                <Circle
                                  key={index}
                                  name={stat.participant.pseudo || '' }
                                  image={stat.participant ? stat.participant.avatar : null}
                                />
                              </td>
                              {stat.values.map((value, colIndex) => (
                                <td key={index+'-'+colIndex} style={styles.col}>
                                  {value.value}
                                </td>
                              ))}
                            </tr>
                          ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  : <div style={styles.subtitle}>
                      {localizations.profile_statistics_sportunity_none}
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        )
    }
}

export default createRefetchContainer(Radium(withAlert(CircleStats)), {
  user: graphql`
    fragment CircleStats_user on User {
      id
      pseudo
      areStatisticsActivated
      statisticFilters {
        id
        name
        date_begin
        date_end
        circleList(first: 20) {
          edges { 
            node { 
              id
              name
            }
          }
        }
      }
      statCircles: circles (last: 20) {
        edges {
          node {
            id
            name
            memberCount
            type
          }
        }
      }
    }
  `,
  viewer: graphql`
    fragment CircleStats_viewer on Viewer @argumentDefinitions(
      id: {type: "String"}
      circleStatsCircleId: {type: "String"}
      query: {type: "Boolean!", defaultValue: false}
      dateInterval: {type: "StringIntervalInput"}
    ){
      me {
        id
      }
      statisticPreferences (userID: $id) @include(if:$query) {
        private,
        isManOfTheGameActivated
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
      circlesStatistics (userID: $id, circleID: $circleStatsCircleId, dateInterval: $dateInterval) @include(if:$query) {
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
  `
},
  graphql`
    query CircleStatsRefetchQuery(
      $id: String
      $circleStatsCircleId: String
      $query: Boolean!
      $dateInterval: StringIntervalInput
    ) {
      viewer {
        ...CircleStats_viewer @arguments(
          id: $id
          circleStatsCircleId: $circleStatsCircleId
          query: $query
          dateInterval: $dateInterval
        )
      }
    }
  `
);
