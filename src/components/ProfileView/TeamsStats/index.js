import React from 'react';
import {Link} from 'found'
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium';
import ReactLoading from 'react-loading';
import Select from 'react-select';
import get from 'lodash/get';

import localizations from '../../Localizations'
import {colors, appStyles} from '../../../theme';
import styles from './styles.js';
import Circle from './Circle';
import DatePicker from 'react-datepicker'
import moment from "moment/moment";
import { withAlert } from 'react-alert'
import NewFilterMutation from "../../Circle/CircleStats/NewFilterMutation"
import RemoveFilterMutation from "../../Circle/CircleStats/RemoveFilterMutation"
import UpdateFilterMutation from '../../Circle/CircleStats/UpdateFilterMutation';
import SetDefaultStatisticFilterMutation from '../SetDefaultStatisticFilterMutation';
import UpdateStatisticPreferencesMutation
	from "../../MyInfo/MyStatisticPreferences/Mutations/UpdateStatisticPreferencesMutation";
import CustomizeStatModal from './CustomizeStatModal'
import FillStatsModal from "./FillStatsModal";
import FilterSelector from '../FilterSelector';
import NewFilterGroups, { styles as checkboxStyles } from '../NewFilterGroups';
import InputText from './InputText';

const RLink = Radium(Link);

var Style = Radium.Style;

let RSelect = Radium(Select);

class TeamsStats extends React.Component {

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
            isFilterProcessing: false,
            isCircleListOpen: false,
            selectedFilter: null,
	          statisticIsChanging: false,
            statisticIsFilling: false,
            
            nameFilter: '',
            date: null,
            selectedFilterCircles: [],
            createNewFilter: true,
            filterId: null,
        }
    }

    componentDidMount() {
        // window.addEventListener('click', this._handleClickOutside);
        if (this.props.userId) {
          this.setState({isProcessing: true})
            this.props.relay.refetch(fragmentVariables => ({
              ...fragmentVariables,
              id: this.props.userId,
              query: true
            }),
            null,
            () => 
              setTimeout(() => {
                this._applyFilter();
              }, 150)
            )
        }

        const { user } = this.props;
        if (user && user.defaultStatisticFilter) {
            this._changeFilter(user.defaultStatisticFilter);
        } else if (user && user.statisticFilters && user.statisticFilters.length) {
            this._changeFilter(user.statisticFilters[0]);
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
      if (nextProps.viewer.statisticPreferences) {
        let userStatisticsCols = this._getParticipantsStatsCols(nextProps.viewer.statisticPreferences);
        let userStatistics = this._getParticipantsStats(userStatisticsCols, nextProps.viewer.circlesStatistics);
        let opponentColStatistics = this. _getOpponantsColStats(nextProps.viewer.sportunitiesStatistics);
        if (nextProps.viewer.statisticPreferences.isManOfTheGameActivated) {
          let nbManOfTheMatch = 0;
          userStatistics.forEach(stat => {
            stat.values.forEach(value => {
              if (nextProps.viewer.statisticPreferences.userStats.statManOfTheGame && value.id === nextProps.viewer.statisticPreferences.userStats.statManOfTheGame.id)
                nbManOfTheMatch += value.value
            })
          });
          if (nextProps.viewer.statisticPreferences.userStats.statManOfTheGame && nbManOfTheMatch === 0) {
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
          sportunitiesStatistics: this._getSportunitiesStats(nextProps.viewer.sportunitiesStatistics),
          opponentColStatistics,
          opponentStatistics: this._getOpponentsStats(nextProps.viewer.sportunitiesStatistics, opponentColStatistics),
          isFilterProcessing: false
        })
        setTimeout(() => {
          this.sortDown(0);
          this.setState({
            isProcessing: false
          })
        }, 150)
      }
    }

    _getParticipantBetterStats = (circlesStatisticsCols, circlesStatistics) => {
        let result = [];
        if (circlesStatisticsCols && circlesStatisticsCols.length > 0) {
            circlesStatisticsCols.forEach((statCol, index) => {
                result[index] = {participant: null, value: 0};
                circlesStatistics && circlesStatistics.length > 0 && circlesStatistics.forEach((stat) => {
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

    sortUp = (colIndex) => {
        let userStats = this.state.userStatistics ;

        userStats = userStats.sort((a,b) => {
            if (a.values.length > 0 && a.values[colIndex].value - b.values[colIndex].value > 0)
                return 1;
            else if (a.values.length > 0 && a.values[colIndex].value - b.values[colIndex].value < 0)
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
            if (b.values.length > 0 && b.values[colIndex].value - a.values[colIndex].value > 0)
                return 1;
            else if (b.values.length > 0 && b.values[colIndex].value - a.values[colIndex].value < 0)
                return -1
            else return 0;
        })
        this.setState({
            userStatistics: userStats
        })
    }

  _getOpponentsStats = (sportunitiesStatistics, opponentsColStats) => {
    let results = [];
    if (sportunitiesStatistics && sportunitiesStatistics.length > 0) {
      sportunitiesStatistics.forEach(stat => {
        let colIndex = opponentsColStats.findIndex(col => !!stat.sportunityTypeStatus && col.id === stat.sportunityTypeStatus.id)

        stat.details.forEach(detail => {
          if (detail.opponent) {
            let index = results.findIndex(result => result.opponent && result.opponent.id === detail.opponent.id)
            if (index < 0) {
              results.push({
                opponent: detail.opponent,
                values: opponentsColStats.map(i => 0)
              })
              index = results.length - 1; 
            }
            if (colIndex >= 0) {
              results[index].values[colIndex] = results[index].values[colIndex] + detail.value;
              results[index].values[0] = results[index].values[0] + detail.value
            }
            else {
              results[index].values[results[index].values.length - 2] = results[index].values[results[index].values.length - 2] + detail.value;
              results[index].values[0] = results[index].values[0] + detail.value
            }
          }
          else {
            let index = results.findIndex(result => result.opponent.pseudo === localizations.profile_statistics_not_completed)
            if (index < 0) {
              results.push({
                opponent: {pseudo: localizations.profile_statistics_not_completed},
                values: opponentsColStats.map(i => 0)
              })
              index = results.length - 1; 
            }
            if (colIndex >= 0) {
              results[index].values[colIndex] = results[index].values[colIndex] + detail.value;
              results[index].values[0] = results[index].values[0] + detail.value
            }
            else {
              results[index].values[results[index].values.length - 2] = results[index].values[results[index].values.length - 2] + detail.value;
              results[index].values[0] = results[index].values[0] + detail.value
            }
          }
        })
      });
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
        if (results.findIndex(result => !!stat.sportunityTypeStatus && result.id === stat.sportunityTypeStatus.id) < 0)
          results.push({
            id: !!stat.sportunityTypeStatus ? stat.sportunityTypeStatus.id : null,
            name: !!stat.sportunityTypeStatus ? stat.sportunityTypeStatus.name[localizations.getLanguage().toUpperCase()] : localizations.profile_statistics_not_completed,
            isType: !!stat.sportunityTypeStatus ? false : true
          })
      })
    }
    results.sort((a, b) => a.isType + b.isType);
    return results ;
  };

  _getSportunitiesStats = (sportunitiesStatistics) => {
    let results = [];
    let totalNumber = 0;

    if (sportunitiesStatistics && sportunitiesStatistics.length > 0) {
      sportunitiesStatistics.forEach(stat => {
        if (stat.sportunityTypeStatus) {
          results.splice(0,0, {
            sportunityType: stat.sportunityType.name[localizations.getLanguage().toUpperCase()],
            sportunityTypeStatus: !!stat.sportunityTypeStatus ? stat.sportunityTypeStatus.name[localizations.getLanguage().toUpperCase()] : null,
            value: stat.value
          })
        }
        else {
          results.push({
            sportunityType: stat.sportunityType.name[localizations.getLanguage().toUpperCase()],
            sportunityTypeStatus: localizations.profile_statistics_not_completed,
            value: stat.value
          })
        }
        totalNumber += stat.value;
      })
    }
    if (sportunitiesStatistics && sportunitiesStatistics.length > 0)
      results.splice(0,0, {
        sportunityType: sportunitiesStatistics[0].sportunityType.name[localizations.getLanguage().toUpperCase()],
        value: totalNumber
      });
    
    return results ;
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
    if (this.state.filterId && this.state.filterId === item.id) return ;

    const defaultFilter = get(this.props, 'user.defaultStatisticFilter') || {};
    this.setState(
      {
        createNewFilter: false,
        selectedFilter: item,
        filterId: item.id,
        nameFilter: item.name,
        selectedFilterCircles: get(item, 'circleList.edges', []).map(circle => ({ label: circle.node.name, value: circle })),
        date: {
          from: item.date_begin ? moment(item.date_begin) : moment(),
          to: item.date_end ? moment(item.date_end) : moment()
        },
        setAsDefaultFilter: defaultFilter.id === item.id,
      },
      this._applyFilter
    );
  };

  _changeFilterName = (name) => {
    this.setState({
      nameFilter: name
    })
  };

  _changeDate = (from, to) => {
    this.setState({
      date: {
        from,
        to
      }
    })
  }

  changeDefaultFilter = () => {
    this.setState((prevState) => ({
      setAsDefaultFilter: !prevState.setAsDefaultFilter,
    }));
  }

  validateNewFilterForm = ({ name = '', from, to, circleList }) => {
    if (name.length === 0) {
      throw new Error('Name is required');
    }

    if (!from || !to || from >= to) {
      throw new Error('Invalid date range');
    }

    return true;
  };

  _newFilter = () => {
    const params = {
      userId: this.props.userId,
      name: this.state.nameFilter,
      from: this.state.date ? this.state.date.from : null,
      to: this.state.date ? this.state.date.to : null,
      circleList: this.state.selectedFilterCircles.map(selectedCircle => selectedCircle.value.node.id),
    };

    try {
      const isFormValid = this.validateNewFilterForm(params);

      if (isFormValid) {
        NewFilterMutation.commit(params, {
          onFailure: error => {
            this.props.alert.show(error.getError().source.errors[0].message, {
              timeout: 2000,
              type: 'error',
            });

          },
          onSuccess: (filterId) => {
            if (this.state.setAsDefaultFilter) {
              this.setDefaultStatisticFilter(filterId);
            }
            this.props.alert.show(localizations.popup_editCircle_update_success, {
              timeout: 2000,
              type: 'success',
            });
          },
        })
      }
    } catch (error) {
      this.props.alert.show(error.message, {
        timeout: 2000,
        type: 'error',
      });
    } 
  };

  setDefaultStatisticFilter = (filterID) => {
    const { userId } = this.props;
    SetDefaultStatisticFilterMutation.commit(
      {
        userId,
        input: {
          filterID
        }
      },
      () => {
        console.log('Saved as default filter');
      },
      error => {
        console.error(error);
      }
    )
  }

  _updateFilter = () => {
    const params = {
      filterId: this.state.filterId,
      userId: this.props.userId,
      name: this.state.nameFilter,
      from: this.state.date ? this.state.date.from : null,
      to: this.state.date ? this.state.date.to : null,
      circleList: this.state.selectedFilterCircles.map(selectedCircle => selectedCircle.value.node.id),
    };

    try {
      const isFormValid = this.validateNewFilterForm(params);

      if (isFormValid) {
        UpdateFilterMutation.commit(params, {
          onFailure: error => {
            this.props.alert.show(error.getError().source.errors[0].message, {
              timeout: 2000,
              type: 'error',
            });

          },
          onSuccess: () => {
            if (this.state.setAsDefaultFilter) {
              this.setDefaultStatisticFilter(this.state.filterId);
            }
            this.props.alert.show(localizations.popup_editCircle_update_success, {
              timeout: 2000,
              type: 'success',
            });
          },
        })
      }
    } catch (error) {
      this.props.alert.show(error.message, {
        timeout: 2000,
        type: 'error',
      });
    } 
  }

  _applyFilter = (filter) => {
    let input = {
      dateInterval: {
        from : this.state.date && this.state.date.from ? this.state.date.from._d : moment().subtract(1, 'years')._d,
        to : this.state.date && this.state.date.to ? this.state.date.to._d : moment()._d,
      },
      circleIds: this.state.selectedFilterCircles.map(id => id.id),
    }
    if (filter) {
      const circleIds = get(filter, 'circleList.edges', []).map(circle => circle.node.id);
      const dateBegin = get(filter, 'date_begin', moment().subtract(1, 'years')._d);
      const dateEnd = get(filter, 'date_end', moment()._d);

      const dateInterval = {
        from: dateBegin,
        to: dateEnd,
      };

      input = {
        dateInterval,
        circleIds,
      };
    }
	  this.setState({
      isFilterProcessing: true,
		  isProcessing: true
    })
    this.props.relay.refetch(fragmentVariables => ({
      ...fragmentVariables, 
      ...input,
      id: this.props.userId,
      query: true
    }))
  };

	_handleUpdateUserPreferences = (userStatPrefs) => {
		let params = {
			userIDVar: this.props.user.id,
			userStatsVar: userStatPrefs,
			viewer: this.props.viewer,
		} ;
    UpdateStatisticPreferencesMutation.commit(params,
			{
				onSuccess: () => {
					this.props.alert.show(localizations.myStatPrefs_update_success, {
						timeout: 2000,
						type: 'success',
					});
				},
				onFailure: (error) => {
					this.props.alert.show(localizations.myStatPrefs_update_failed, {
						timeout: 2000,
						type: 'error',
					});
					console.log(error);
				},
			}
		);
	};

	toggleCustomizeStat = () => {
	  this.setState({
		  statisticIsChanging: !this.state.statisticIsChanging
    })
  };

	toggleFillStat = () => {
	  this.setState({
		  statisticIsFilling: !this.state.statisticIsFilling
    })
  };

	openCustomizeStat = () => {
	  this.toggleCustomizeStat()
  };

	openFillStat = () => {
	  this.toggleFillStat()
  }

  removeFilter = () => {
	  this.setState({
      selectedFilter: null
    })
  }

  resetFilterState = () => {
    this.setState({
      selectedFilter: null,
      filterId: null,
      nameFilter: '',
      date: null,
      selectedFilterCircles: [],
      createNewFilter: true,
      setAsDefaultFilter: false,
      createNewFilter: true,
    });
  };

  updateSelectedCircles = (circle) => {
    const { selectedFilterCircles } = this.state;
    const selectedCircleId = circle.value.node.id;
    const isCircleAlreadySelected = selectedFilterCircles.find(selectedCircle => get(selectedCircle, 'value.node.id') === selectedCircleId);

    if (isCircleAlreadySelected) {
      this.setState((prevState) => ({
        selectedFilterCircles: prevState.selectedFilterCircles.filter(selectedCircle => get(selectedCircle, 'value.node.id') !== selectedCircleId),
      }));
    } else {
      this.setState((prevState) => ({
        selectedFilterCircles: [
          ...prevState.selectedFilterCircles,
          circle,
        ],
      }));
    }
  }

  handleSaveFilter = () => {
    if (this.state.selectedFilter) {
      this._updateFilter();
    } else {
      this._newFilter();
    }
  }
	
  render() {
    let {viewer, user} = this.props;
    
    const currentUserIsOwner = viewer.me && viewer.me.id === user.id;

    const {sportunitiesStatistics, opponentColStatistics, opponentStatistics, userStatisticsCols, userStatistics, userBestStatistics} = this.state;

    let circles = (user && user.circles && user.circles.edges) ? user.circles.edges
      .filter(circle => circle.node.type === 'ADULTS' || circle.node.type === 'CHILDREN')
      .map(circle => ({label: circle.node.name,value: circle})): [];

    return (
      <div>
        {this.state.statisticIsChanging &&
          <CustomizeStatModal
            isOpen={true}
            user={user}
            viewer={viewer}
            statisticPreferences={viewer.statisticPreferences}
            canCloseModal
            toggleModal={this.toggleCustomizeStat}
            _handleUpdatePreferences={this._handleUpdateUserPreferences}
          />
        }
        {this.state.statisticIsFilling &&
          <FillStatsModal
            isOpen={true}
            user={user}
            viewer={viewer}
            canCloseModal
            toggleModal={this.toggleFillStat}
          />
        }
        <Style scopeSelector=".react-datepicker__input-container" rules={{"input": styles.dateField}} />
        <Style scopeSelector=".react-datepicker__input-top" rules={styles.dateFieldTop} />
        <Style scopeSelector=".react-datepicker__input-bottom" rules={styles.dateFieldBottom} />
        <Style scopeSelector=".react-datepicker-popper" rules={{zIndex: 1}} />

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

        <div style={{ padding: 10 }}>
          <FilterSelector
            user={user}
            filterList={get(user, 'statisticFilters', [])}
            handleNewFilterClick={this.resetFilterState}
            handleFilterClick={this._changeFilter}
            activeFilter={this.state.selectedFilter}
            defaultFilter={get(user, 'defaultStatisticFilter', {})}
            handleDelete={this._removeFilter}
            allowChange={viewer.me && viewer.me.id === user.id}
          />

          <div style={styles.newFilterContainer}>
            <div style={{ flex: 3 }}>
              <h2 style={styles.heading}>Groups</h2>

              <NewFilterGroups
                circles={circles}
                selectedCircles={this.state.selectedFilterCircles}
                onSelectCircle={this.updateSelectedCircles}
              />
            </div>
            <div style={{ flex: 2, marginTop: 15 }}>
              <div>
                <DatePicker
                  dateFormat="DD/MM/YYYY"
                  todayButton={localizations.newSportunity_today}
                  selected={((this.state.date && this.state.date.from !== null) ? this.state.date.from : null)}
                  maxDate={(this.state.date ? this.state.date.to : null)}
                  onChange={(moment) => {this._changeDate(moment, (this.state.date ? this.state.date.to : null)); this.removeFilter()}}
                  locale={localizations.getLanguage().toLowerCase()}
                  popperPlacement="top-end"
                  className="react-datepicker__input-top"
                  nextMonthButtonLabel=""
                  previousMonthButtonLabel=""
                  placeholderText={localizations.profile_statistics_dateFrom}
                />

                <DatePicker
                  dateFormat="DD/MM/YYYY"
                  todayButton={localizations.newSportunity_today}
                  selected={((this.state.date && this.state.date.to !== null) ? this.state.date.to : null)}
                  minDate={(this.state.date ? this.state.date.from : null)}
                  onChange={(moment) => {this._changeDate((this.state.date ? this.state.date.from : null), moment); this.removeFilter()}}
                  locale={localizations.getLanguage().toLowerCase()}
                  popperPlacement="top-end"
                  className="react-datepicker__input-bottom"
                  nextMonthButtonLabel=""
                  previousMonthButtonLabel=""
                  placeholderText={localizations.profile_statistics_dateTo}
                />
              </div>

              {viewer.me && viewer.me.id === user.id &&
                <div style={{ marginTop: 10 }}>
                  <label style={checkboxStyles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={this.state.setAsDefaultFilter}
                      value={this.state.setAsDefaultFilter}
                      onChange={this.changeDefaultFilter}
                      style={checkboxStyles.checkbox}
                    />
                    Set as default
                  </label>
                </div>
              }

            </div>
            <div style={{ flex: 2, alignItems: 'center', justifyContent: 'space-evenly', display: 'flex', flexDirection: 'column' }}>

              {viewer.me && viewer.me.id === user.id &&
                <div style={{ width: '70%' }}>
                  <InputText
                    placeholder="Name"
                    value={this.state.nameFilter}
                    onChange={this._changeFilterName} 
                  />
                </div>
              }
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-evenly' }}>
                {!this.state.isFilterProcessing && viewer.me && viewer.me.id === user.id &&
                  <button
                    onClick={this.handleSaveFilter}
                    style={styles.button}
                  >
                    {localizations.profile_statistics_filter_save}
                  </button>
                }
                {!this.state.isFilterProcessing &&
                  <button
                    onClick={this._applyFilter}
                    style={{ ...styles.button, backgroundColor: colors.gray }}
                  >
                    {localizations.profile_statistics_filter_apply}
                  </button>
                }
                {this.state.isFilterProcessing && <ReactLoading type='cylon' color={colors.blue} />}
              </div>

            </div>
          </div>
        </div>

        {user.areStatisticsActivated && userStatistics && userStatistics.length > 0 && currentUserIsOwner &&
        <div style={{...styles.changeStatContainer, margin: '0px 40px'}}>
          <div style={styles.optionRow}>
            <p style={styles.text}>
              {localizations.profile_statistics_fill_stat_text}
            </p>
            <div style={styles.button} onClick={this.openFillStat}>
              {localizations.profile_statistics_fill_stat_button}
            </div>
          </div>
        </div>
        }
      <div style={styles.content}>
        <h1 style={styles.title}>
          {localizations.profile_statistics_teams_title}
        </h1>
        <div style={styles.teamRow}>
          {sportunitiesStatistics && user.areStatisticsActivated && sportunitiesStatistics.map((stat, index) => (
            <div key={index+'Stat'} style={styles.statItem}>
              <div style={styles.statValue}>{stat.value}</div>
              <div style={styles.statName}>{stat.sportunityTypeStatus ? stat.sportunityTypeStatus : stat.sportunityType}</div>
            </div>
          ))}
        </div>
        <div>
          <div style={styles.section}>
            {user.areStatisticsActivated && opponentStatistics && user.areStatisticsActivated && opponentStatistics.length > 0
              ? <div>
                <div style={{width: '100%', overflowX: 'auto'}}>
                  <table style={styles.table}>
                    <thead>
                    <tr style={{backgroundColor: '#abcff2'}}>
                      <th style={styles.colLabel}>{localizations.profile_statistics_sportunity_opponent}</th>
                      {opponentColStatistics.map((col, index) => (
                        <th style={styles.headerCol} key={index + 'Col'}>{localizations.profile_statistics_sportunity_nbrOf + col.name}</th>
                      ))}
                    </tr>
                    </thead>
                    <tbody>
                    {opponentStatistics && opponentStatistics.map((stat, index) => (
                      <tr key={index} style={{backgroundColor: (index % 2 === 1) ? '#FFF' : '#ddefff'}}>
                        <td style={styles.col}>
                          <div style={styles.circle}>
                            <div style={{...styles.icon, backgroundImage: stat.opponent && stat.opponent.avatar ? 'url('+ stat.opponent.avatar +')' : 'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")'}} />
                            <div style={styles.name}>{stat.opponent ? stat.opponent.pseudo : ''}</div>
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
                </div>
              </div>
              : this.state.isProcessing
                ? <div style={styles.loadingContainer}><ReactLoading type='cylon' color={colors.blue} /></div>
                : user.areStatisticsActivated
                ? <div style={{...styles.subtitle, textAlign: 'center'}}>
                    {localizations.profile_statistics_empty}
                  </div>
                : currentUserIsOwner
                  ?
                  <div style={styles.section}>
                    <div style={{...styles.subtitle, textAlign: 'center'}}>
                      {localizations.profile_statistics_teams_none_owner['0']}
                      <Link to='/my-info' style={{textDecoration: 'none', color: colors.blue}}>{localizations.profile_statistics_teams_none_owner['1']}</Link>
                      {localizations.profile_statistics_teams_none_owner['2']}
                    </div>
                    <img style={styles.image} src={localizations.profile_statistics_teams_none_image_owner}/>
                  </div>
                  :
                  <div style={styles.section}>
                    <div style={{...styles.subtitle, textAlign: 'center'}}>
                      {localizations.profile_statistics_teams_none['0'] + user.pseudo + localizations.profile_statistics_teams_none['1']}
                    </div>
                    <img style={styles.image} src={localizations.profile_statistics_teams_none_image}/>
                  </div>
                }
              </div>
            </div>
          </div>
            <div style={{...styles.content, backgroundColor: '#f3f9fe'}}>
              <h1 style={styles.title}>
                {localizations.profile_statistics_team_member_title}
              </h1>
              {this.state.isProcessing
                ? <div style={styles.loadingContainer}><ReactLoading type='cylon' color={colors.blue} /></div>
                :
                <div>
                  {user.areStatisticsActivated && userStatistics && userStatistics.length > 0
                    ? <div style={styles.section}>
                      <h3 style={styles.subtitle}>
                        {localizations.profile_statistics_participants_title}
                      </h3>
                      {currentUserIsOwner &&
                      <div style={styles.changeStatContainer}>
                        <div style={styles.optionRow}>
                          <p style={styles.text}>
                            {localizations.profile_statistics_customize_stat['0']}
                            <span style={{color: colors.red, margin: '0.25em'}}>
                              {' ' + localizations.profile_statistics_customize_stat['1'] + ' '}
                            </span>
                            {localizations.profile_statistics_customize_stat['2']}
                          </p>
                          <div style={styles.button} onClick={this.openCustomizeStat}>
                            {localizations.profile_statistics_customize_stat_add}
                          </div>
                        </div>
                        <div style={styles.optionRow}>
                          <p style={styles.text}>
                            {localizations.profile_statistics_fill_stat_text}
                          </p>
                          <div style={styles.button} onClick={this.openFillStat}>
                            {localizations.profile_statistics_fill_stat_button}
                          </div>
                        </div>
                      </div>
                      }
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
                      <div style={{width: '100%', overflowX: 'auto'}}>
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
                    : this.state.isProcessing
                      ? <div style={styles.loadingContainer}><ReactLoading type='cylon' color={colors.blue} /></div>
                      : user.areStatisticsActivated
                        ? <div style={{...styles.subtitle, textAlign: 'center'}}>
                            {localizations.profile_statistics_empty}
                          </div>
                        : currentUserIsOwner
                          ?
                          <div style={styles.section}>
                            <div style={{...styles.subtitle, textAlign: 'center'}}>
                              {localizations.profile_statistics_user_none_owner['0']}
                              <span style={{color: colors.red}}>{localizations.profile_statistics_user_none_owner['1']}</span>
                              {localizations.profile_statistics_user_none_owner['2']}
                              <Link to='/my-info' style={{textDecoration: 'none', color: colors.blue}}>{localizations.profile_statistics_user_none_owner['3']}</Link>
                              {localizations.profile_statistics_user_none_owner['4']}
                            </div>
                            <img style={styles.image} src={localizations.profile_statistics_user_none_image_owner}/>
                          </div>
                          :
                          <div style={styles.section}>
                            <div style={{...styles.subtitle, textAlign: 'center'}}>
                              {localizations.profile_statistics_user_none['0'] + user.pseudo + localizations.profile_statistics_user_none['1']}
                            </div>
                            <img style={styles.image} src={localizations.profile_statistics_user_none_image}/>
                          </div>
                  }
                </div>
              }
            </div>
          </div>
        )
    }
}

export default createRefetchContainer(Radium(withAlert(TeamsStats)), {
//OK
  user: graphql`
      fragment TeamsStats_user on User @argumentDefinitions(
        query: {type: "Boolean!", defaultValue: false}
      ){
          pseudo
          id
          areStatisticsActivated
          ...FillStatsModal_user
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
          defaultStatisticFilter {
            id
            name
            date_begin
            date_end
            circleList (first: 20) {
                edges {
                    node {
                        id
                    }
                }
            }
        }
          circles (last: 10) {
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
    fragment TeamsStats_viewer on Viewer @argumentDefinitions(
        id: {type: "String", defaultValue: null}
        circleIds: {type: "[String]", defaultValue: null}
        query: {type: "Boolean!", defaultValue: false}
        dateInterval: {type: "StringIntervalInput", defaultValue: null}
      ){
        ...FillStatsModal_viewer
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
    query TeamsStatsRefetchQuery(
      $id: String
      $circleIds: [String]
      $query: Boolean!
      $dateInterval: StringIntervalInput
    ) {
      viewer {
        ...TeamsStats_viewer @arguments(
          id: $id
          circleIds: $circleIds
          query: $query
          dateInterval: $dateInterval
        )
        me{
          ...TeamsStats_user @arguments(
            query: $query
          )
        }
      }
    }
  `,
);
