import React from 'react';
import PureComponent, { pure } from '../../common/PureComponent'
import PropTypes from 'prop-types'
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium';
import ReactLoading from 'react-loading';
import Select from 'react-select';

import localizations from '../../Localizations'
import { colors } from '../../../theme';
import styles from './styles.js';

import Input from './Input'
import Circle from './Circle';
import DatePicker from 'react-datepicker'
import moment from "moment/moment";
import RemoveFilterMutation from "../../Circle/CircleStats/RemoveFilterMutation"
import { withAlert } from 'react-alert'
import SelectFilter from "./SelectFilter";
import NewFilterMutation from "../../Circle/CircleStats/NewFilterMutation"
import UpdateFilterMutation from "../../Circle/CircleStats/UpdateFilterMutation"
import FilterModal from "./FilterModal"
import CircleItem from "./CircleItem";
import MyCirclesCircleItem from '../../MyCircles/MyCirclesCircleItem';
import {BigUserCard} from '../../common/UserCard'
import StatsSummary from '../StatsSummary';

var Style = Radium.Style;

let RSelect = Radium(Select);

class IndividualStats extends React.Component {
  static contextTypes = {
		relay: PropTypes.shape({
		  variables: PropTypes.object,
		}),
	}

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
            selectedCircles: [],
            selectedFilter: null,
            date: null,
            nameFilter: null,
            openModal: false,
            nbCircles: null,
            seeAll: false
        }
    }

    componentDidMount() {
        // window.addEventListener('click', this._handleClickOutside);
        if (this.props.userId) {
            this.props.relay.refetch(fragmentVariables => ({
              ...fragmentVariables,
              id: this.props.userId,
              query: true
            }))
            if (this.props.user && this.props.user.circles && this.props.user.circles.edges && this.props.user.circles.edges.length > 0) {
                this.setState({
                    isProcessing: true
                })
              let circleList = this.props.user.circles.edges.map(circle => ({label: circle.node.name,value: circle}))
              this._changeCircles(circleList);
            }
        }
        setTimeout(() => {
          this._applyFilter();
        }, 150);
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
      // if (nextProps.user && nextProps.user.circles && nextProps.user.circles.edges && this.state.selectedCircles === []) {
      //   let circleList = nextProps.user.circles.edges.map(circle => ({label: circle.node.name,value: circle}))
      //   console.log(circleList);
      //   this._changeCircles(circleList);
      //   // this._changeCircle(circleList[0])
      // }


      // if (nextProps.viewer.circle && nextProps.viewer.circle.id === this.state.selectedCircles.id) {
      // let userStatisticsCols = this._getParticipantsStatsCols(nextProps.viewer.statisticPreferences);
      // let userStatistics = this._getParticipantsStats(userStatisticsCols, nextProps.viewer.circlesStatistics);
      // let opponentColStatistics = this. _getOpponantsColStats(nextProps.viewer.sportunitiesStatistics);
      if (nextProps.user && nextProps.user.userStatistics)
        this.setState({
          // userStatistics,
          // userStatisticsCols,
          // userBestStatistics : this._getParticipantBetterStats(userStatisticsCols, nextProps.viewer.circlesStatistics),
          userStats: this._getUserStats(nextProps.user),
          nbCircles: this.props.user.circlesUserIsIn ? this.props.user.circlesUserIsIn.count : 0
          // opponentColStatistics,
          // opponentStatistics: this._getOpponentsStats(nextProps.viewer.sportunitiesStatistics, opponentColStatistics)
        })
      setTimeout(() => {
        this.sortDown(0);
        this.setState({
          isProcessing: false
        })
      }, 150)
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

  _changeCircles = (circles) => {
    const tmpCircles = circles ? circles.map(circle => (circle.value ? circle.value : circle)) : [];
    this.setState({
      selectedCircles: tmpCircles.map(circle => ({
        id: (circle.node ? circle.node.id : circle.id),
        name : (circle.node ? circle.node.name : circle.name)
      })),
      isCircleListOpen: false
    })
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

  _getUserStats = (user) => {
    let results = [
      {
        name: localizations.profile_statistics_user_participated,
        value: user.userStatistics.numberOfParticipated
      },
      {
        name: localizations.profile_statistics_user_sport,
        value: user.sports ? user.sports.length : 0
      },
      {
        name: localizations.profile_statistics_user_averageWeek,
        value: Math.round(user.userStatistics.averageNumberOfParticipatedWeek * 10) / 10
      },
      {
        name: localizations.profile_statistics_user_averageMonth,
        value: Math.round(user.userStatistics.averageNumberOfParticipatedMonth * 10) / 10
      },
      {
        name: localizations.profile_statistics_user_averageYear,
        value: Math.round(user.userStatistics.averageNumberOfParticipatedYear * 10) / 10
      },
      ];
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
    this.setState({
      selectedFilter: item,
    });
    if (item.date_begin !== null || item.date_end !== null) {
      this.setState({
        date: {
          from: moment(item.date_begin),
          to: moment(item.date_end)
        }
      })
    }
    this._changeCircles(item.circleList.edges)
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
          circleList: this.state.selectedCircles.map(id => id.id)
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
    this.props.relay.refetch(fragmentVariables=> ({
      ...fragmentVariables, 
      dateInterval: {
        from : this.state.date && this.state.date.from ? this.state.date.from : moment().subtract(1, 'years'),
        to : this.state.date && this.state.date.to ? this.state.date.to : moment(),
      },
      circleIds: this.state.selectedCircles.map(id => id.id),
      query: true,
      id: this.props.userId,
    }))
  };

  _toggleModal = () => {
    this.setState({
      openModal: !this.state.openModal,
    });
  }

  _toggleAllCircle = (nbCircles) => {
    this.props.relay.refetch(fragmentVariables => ({
      ...fragmentVariables, 
      nbCircles
    }))
    this.setState({
      seeAll: !this.state.seeAll
    })
  }

    render() {
        let {viewer, user} = this.props;

        const {userStats, opponentColStatistics, opponentStatistics, userStatisticsCols, userStatistics, userBestStatistics, nbCircles} = this.state;

        let circles = (user && user.circles && user.circles.edges) ? user.circles.edges.map(circle => ({label: circle.node.name,value: circle})) : [];
        const numberOfCirclesUserIsIn = user.circlesUserIsIn && user.circlesUserIsIn.count;
        return (

          <div>
            {/*<Style scopeSelector=".react-datepicker__input-container" rules={{*/}
              {/*"input": styles.date*/}
            {/*}}*/}
            {/*/>*/}
            {/*<Style scopeSelector=".react-datepicker" rules={{*/}
              {/*top: -20,*/}
              {/*"div": {fontSize: '1.4rem'},*/}
              {/*".react-datepicker__current-month": {fontSize: '1.5rem'},*/}
              {/*".react-datepicker__month": {margin: '1rem'},*/}
              {/*".react-datepicker__day": {width: '2rem', lineHeight: '2rem', fontSize: '1.4rem', margin: '0.2rem'},*/}
              {/*".react-datepicker__day-names": {width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: 5},*/}
              {/*".react-datepicker__header": {padding: '1rem', display: 'flex', flexDirection: 'column',alignItems: 'center'}*/}
            {/*}}*/}
            {/*/>*/}
            {/*<div style={styles.filterContainer}>*/}
              {/*<FilterModal*/}
                {/*isOpen={this.state.openModal}*/}
                {/*canCloseModal*/}
                {/*title={localizations.profile_statistics_filter_name_title}*/}
                {/*name={this.state.nameFilter}*/}
                {/*updateName={this._changeFilterName}*/}
                {/*onConfirm={this._newFilter}*/}
                {/*toggleModal={this._toggleModal}*/}
                {/*confirmLabel={localizations.profile_statistics_filter_save}*/}
              {/*/>*/}
              {/*<div style={styles.filter}>*/}
                {/*<SelectFilter*/}
                  {/*label={localizations.profile_statistics_filter_label}*/}
                  {/*placeholder={localizations.profile_statistics_filter_placeholder}*/}
                  {/*selectedItem={this.state.selectedFilter}*/}
                  {/*onRemove={this._removeFilter}*/}
                  {/*list={user ? user.statisticFilters : []}*/}
                  {/*onSelectItem={this._changeFilter}*/}
                  {/*allowChange={viewer.me && viewer.me.id === user.id}*/}
                {/*/>*/}
              {/*</div>*/}
              {/*<div style={styles.dateContainer}>*/}
                {/*<div style={styles.dateTitle}>*/}
                  {/*{localizations.profile_statistics_dateFrom}*/}
                {/*</div>*/}
                {/*<DatePicker*/}
                  {/*dateFormat="DD/MM/YYYY"*/}
                  {/*todayButton={localizations.newSportunity_today}*/}
                  {/*selected={((this.state.date && this.state.date.from !== null) ? this.state.date.from : moment().subtract(1, 'years'))}*/}
                  {/*maxDate={(this.state.date ? this.state.date.to : null)}*/}
                  {/*onChange={(moment) => this._changeDate(moment, (this.state.date ? this.state.date.to : null))}*/}
                  {/*locale={localizations.getLanguage().toLowerCase()}*/}
                  {/*popperPlacement="top-end"*/}
                  {/*style={styles.date}*/}
                {/*/>*/}
              {/*</div>*/}
              {/*<div style={styles.dateContainer}>*/}
                {/*<div style={styles.dateTitle}>*/}
                  {/*{localizations.profile_statistics_dateTo}*/}
                {/*</div>*/}
                {/*<DatePicker*/}
                  {/*dateFormat="DD/MM/YYYY"*/}
                  {/*todayButton={localizations.newSportunity_today}*/}
                  {/*selected={((this.state.date && this.state.date.to !== null) ? this.state.date.to : moment())}*/}
                  {/*minDate={(this.state.date ? this.state.date.from : null)}*/}
                  {/*onChange={(moment) => this._changeDate((this.state.date ? this.state.date.from : null), moment)}*/}
                  {/*locale={localizations.getLanguage().toLowerCase()}*/}
                  {/*popperPlacement="top-end"*/}
                  {/*style={styles.date}*/}
                {/*/>*/}
              {/*</div>*/}
              {/*<div onClick={() => { this._applyFilter()}} style={{...styles.saveButton, backgroundColor: colors.green}}>*/}
                {/*{localizations.profile_statistics_filter_apply}*/}
              {/*</div>*/}
              {/*{ viewer.me && viewer.me.id === user.id &&*/}
                {/*<div onClick={() => {console.log('save'); this._saveFilter()}} style={styles.saveButton}>*/}
                  {/*{localizations.profile_statistics_filter_save}*/}
                {/*</div>*/}
              {/*}*/}
            {/*</div>*/}  
          <div style={styles.content}>
            <StatsSummary 
              user={user} 
              language={localizations.getLanguage()}
            />
          </div>
            <section style={{padding: 20}}>
              <div style={styles.circlesContainer}>
                <h1 style={styles.title}>
                  {localizations.profile_statistics_user_circle_title}
                </h1>
                <div style={styles.subtitle}>
                  {`${numberOfCirclesUserIsIn} ${localizations.profile_statistics_user_circle}`}
                </div>
                <div style={styles.circlesList}>
                  { user.circlesUserIsIn && user.circlesUserIsIn.edges && user.circlesUserIsIn.edges.map((circle, index) => (
                    circle.node.owner.profileType === 'PERSON' 
                    ? <MyCirclesCircleItem
                        key={circle.node.id}
                        circle={circle.node}
                        viewer={viewer}
                        link={`/circle/${circle.node.id}/statistics`}
                        showStatistics={true}
                      >
                        {circle.node.owner
                          ? `${circle.node.name} ${localizations.find_my_sport_clubs_of} ${circle.node.owner.pseudo}`
                          : circle.node.name
                        }
                      </MyCirclesCircleItem>
                    : <BigUserCard
                        key={circle.node.id}
                        link={`/profile-view/${circle.node.owner.id}/statistics`}
                        user={circle.node.owner}
                        showStatistics={true}
                      />
                  ))}
                </div>
                <div style={styles.showMoreContainer}>
                  { numberOfCirclesUserIsIn > 4 &&
                  <div style={styles.showMore} onClick={() => this._toggleAllCircle(this.state.seeAll ? 4 : numberOfCirclesUserIsIn)}>
                    {this.state.seeAll ? localizations.profile_statistics_user_showLess : localizations.profile_statistics_user_showMore}
                  </div>
                  }
                </div>
              </div>
            </section>
            {/*<div style={{...styles.content, backgroundColor: '#f3f9fe'}}>*/}
              {/*<h1 style={styles.title}>*/}
                {/*{localizations.profile_statistics_team_member_title}*/}
              {/*</h1>*/}
              {/*{this.state.isProcessing*/}
                {/*? <div style={styles.loadingContainer}><ReactLoading type='cylon' color={colors.blue} /></div>*/}
                {/*:*/}
                {/*<div>*/}
                  {/*{userStatistics && userStatistics.length > 0 ?*/}
                  {/*<div style={styles.section}>*/}
                    {/*<h3 style={styles.subtitle}>*/}
                      {/*{localizations.profile_statistics_participants_title}*/}
                    {/*</h3>*/}
                    {/*<div style={styles.bestRow}>*/}
                      {/*{userBestStatistics.map((stat, index) => (*/}
                        {/*<div key={index+'Best'} style={styles.bestItem}>*/}
                          {/*<div style={{...styles.iconBest, backgroundImage: stat.participant && stat.participant.avatar ? 'url('+ stat.participant.avatar +')' : 'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")'}} />*/}
                          {/*<div style={styles.moreOf}>{localizations.profile_statistics_more_of + userStatisticsCols[index].name.toUpperCase()}</div>*/}
                          {/*<div style={styles.pseudo}>{stat.participant ? stat.participant.pseudo : ''}</div>*/}
                          {/*<div style={styles.value}>{stat.value + ' ' + userStatisticsCols[index].name}</div>*/}
                        {/*</div>*/}
                      {/*))}*/}
                    {/*</div>*/}
                    {/*<div style={{width: '100%', overflowX: 'auto'}}>*/}
                      {/*<table style={styles.table}>*/}
                        {/*<thead>*/}
                        {/*<tr style={{backgroundColor: '#abcff2'}}>*/}
                          {/*<th style={styles.colLabel}>{localizations.profile_statistics_participant}</th>*/}
                          {/*{userStatisticsCols.map((name, index) => (*/}
                            {/*<th key={index} style={styles.headerCol}>*/}
                              {/*<span style={styles.colName}>*/}
                                {/*{name.name}*/}
                                {/*<span style={styles.sortIcons}>*/}
                                  {/*<span style={styles.sortUpIcon} onClick={() => this.sortUp(index)}  />*/}
                                  {/*<span style={styles.sortDownIcon} onClick={() => this.sortDown(index)} />*/}
                                {/*</span>*/}
                              {/*</span>*/}
                            {/*</th>*/}
                          {/*))}*/}
                        {/*</tr>*/}
                        {/*</thead>*/}
                        {/*<tbody>*/}
                        {/*{userStatistics.map((stat, index) => (*/}
                          {/*<tr key={index} style={{backgroundColor: (index % 2 === 1) ? '#FFF' : '#ddefff'}}>*/}
                            {/*<td style={styles.colLabel}>*/}
                              {/*<Circle*/}
                                {/*key={index}*/}
                                {/*name={stat.participant.pseudo || '' }*/}
                                {/*image={stat.participant ? stat.participant.avatar : null}*/}
                              {/*/>*/}
                            {/*</td>*/}
                            {/*{stat.values.map((value, colIndex) => (*/}
                              {/*<td key={index+'-'+colIndex} style={styles.col}>*/}
                                {/*{value.value}*/}
                              {/*</td>*/}
                            {/*))}*/}
                          {/*</tr>*/}
                        {/*))}*/}
                        {/*</tbody>*/}
                      {/*</table>*/}
                    {/*</div>*/}
                  {/*</div>*/}
                    {/*:   <div style={styles.subtitle}>{localizations.profile_statistics_sportunity_none}</div>*/}
                  {/*}*/}
                {/*</div>*/}
              {/*}*/}
            {/*</div>*/}
          </div>
        )
    }
}

export default createRefetchContainer(Radium(withAlert(IndividualStats)), {
  user: graphql`
    fragment IndividualStats_user on User @argumentDefinitions(
      query: {type: "Boolean!", defaultValue: false}
      nbCircles: {type: "Int", defaultValue: 4}
    ) {
      ...StatsSummary_user
      pseudo
      id
      userStatistics @include (if: $query) {
        numberOfParticipated
        averageNumberOfParticipatedWeek
        averageNumberOfParticipatedMonth
        averageNumberOfParticipatedYear
      }
      circlesUserIsIn(first: $nbCircles) {
        edges {
          node {
            ...MyCirclesCircleItem_circle
            id
            owner {
              id
              avatar
              profileType
              pseudo
              publicAddress {
                address
                city,
                country
              }
              sports {
                sport {
                  id
                  logo
                  name {
                    EN 
                    FR
                  }
                }
                levels {
                  id
                  EN {
                    name
                  }
                  FR {
                    name
                  }
                }
              }
            }
            name
            memberCount
          }
        }
        count
      }
      sports {
        sport {
          id
        }
      }
      statisticFilters @include (if: $query){
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
      circles (last: 20) @include (if: $query){
        edges {
          node {
            id
            name
            memberCount
          }
        }
      }
    }
  `,
  viewer: graphql`
    fragment IndividualStats_viewer on Viewer @argumentDefinitions (
      id: {type: "String", defaultValue: null},
      circleIds: {type: "[String]", defaultValue: null},
      query: {type: "Boolean!", defaultValue: false},
      dateInterval: {type: "StringIntervalInput", defaultValue: null}
    ) {
      ...CircleItem_viewer
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
  query IndividualStatsRefetchQuery(
    $id: String
    $circleIds: [String]
    $query: Boolean!
    $dateInterval: StringIntervalInput
    $nbCircles: Int
  ) {
    viewer {
      ...IndividualStats_viewer @arguments(
        id: $id
        circleIds: $circleIds
        query: $query
        dateInterval: $dateInterval
      )
      me {
        ...IndividualStats_user @arguments(
          nbCircles: $nbCircles,
          query: $query
        )
      }
    }
  }
`,
);
