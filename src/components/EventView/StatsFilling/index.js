import React from 'react';
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium';
import NumericInput from 'react-numeric-input';
import { withAlert } from 'react-alert'
import ReactLoading from 'react-loading';

import localizations from '../../Localizations'
import { colors } from '../../../theme';
import styles from './styles.js';

import Circle from './Circle';
import InputList from './InputList'

import UpdateSportunityStatisticsMutation from './Mutations/UpdateSportunityStatisticsMutation.js';
import UpdateSportunityTypeMutation from './Mutations/UpdateSportunityTypeMutation.js';
import UpdateSportunityResultMutation from './Mutations/UpdateSportunityResultMutation.js';

class StatsFilling extends React.Component {

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
            sportunityType: null,
            sportunityTypeStatus: null,
            score: {
                currentTeam: null,
                adversaryTeam: null
            },
            isProcessing: false
        }
    }

    componentDidMount() {
        if (this.props.sportunityID) {
            this.props.relay.refetch(fragmentVariables => ({
                ...fragmentVariables,
                id: this.props.sportunityID,
                query: true,
            }))
        }
    }

    componentWillReceiveProps = (nextProps) => {
        if (nextProps.viewer.sportunityStatistics && (!this.state.userStatistics || this.state.userStatistics.length === 0)) {
            this.setState({
                userStatistics: this._getParticipantsStats(nextProps.viewer.sportunityStatistics)
            })

            if (nextProps.sportunity && nextProps.sportunity.sportunityType) {
                this.setState({
                    sportunityType: {
                        id: nextProps.sportunity.sportunityType.id,
                        name: nextProps.sportunity.sportunityType.name,
                    }
                })
            }
            
            if (nextProps.sportunity && nextProps.sportunity.sportunityTypeStatus) {
                this.setState({
                    sportunityTypeStatus: nextProps.sportunity.sportunityTypeStatus
                })
            }

            if (nextProps.sportunity && nextProps.sportunity.score) {
                this.setState({
                    score: {
                        currentTeam: nextProps.sportunity.score.currentTeam.toString(),
                        adversaryTeam: nextProps.sportunity.score.adversaryTeam.toString()
                    }
                })
            }
        }
    }

    _handleChangeSportunityType = (sportunityType) => {
        this.setState({
            sportunityType
        })
    }

    onSaveSportunityType = () => {
        if (!this.state.sportunityType)
            this.props.alert.show(localizations.event_fill_statistics_select_type, {
                timeout: 2000,
                type: 'error',
            });

        let params = {
            viewer: this.props.viewer,
            sportunity: this.props.sportunity,
            sportunityTypeVar: this.state.sportunityType.id 
        }

        UpdateSportunityTypeMutation.commit(params,{
              onSuccess: (response) => {
                this.props.alert.show(localizations.event_fill_statistics_success, {
                    timeout: 2000,
                    type: 'success',
                });
              },
              onFailure: (error) => {
                this.props.alert.show(localizations.event_fill_statistics_failed, {
                  timeout: 4000,
                  type: 'error',
                });
              },
            }
        );
    }

    _handleChangeSportunityResult = (sportunityResult) => {
        this.setState({
            sportunityTypeStatus: sportunityResult
        })
    }

    _handleChangeCurrentTeamScore = (event) => {
        this.setState({
            score: {
                currentTeam: event.target.value,
                adversaryTeam: this.state.score.adversaryTeam
            },
        })
    }

    _handleChangeAversaryTeamScore = (event) => {
        this.setState({
            score: {
                currentTeam: this.state.score.currentTeam,
                adversaryTeam: event.target.value
            },
        })
    }

    onSaveSportunityResult = () => {
        if (!this.state.sportunityTypeStatus)
            this.props.alert.show(localizations.event_fill_statistics_select_result, {
                timeout: 2000,
                type: 'error',
            });
        let scoreVar ; 
        if (this.state.score.currentTeam !== null) {
            if (isNaN(this.state.score.currentTeam)) {
                this.props.alert.show(localizations.event_fill_statistics_wrong_format, {
                    timeout: 2000,
                    type: 'error',
                });
                return ;
            }
            scoreVar = {}
            scoreVar.currentTeam = Number(this.state.score.currentTeam);
            if (this.state.score.adversaryTeam !== null) {
                if (isNaN(this.state.score.adversaryTeam)) {
                    this.props.alert.show(localizations.event_fill_statistics_wrong_format, {
                        timeout: 2000,
                        type: 'error',
                    });
                    return ;
                }
                scoreVar.adversaryTeam = Number(this.state.score.adversaryTeam)
            }
            else {
                this.props.alert.show(localizations.event_fill_statistics_wrong_format, {
                    timeout: 2000,
                    type: 'error',
                });
                return ;
            }
        }

        let params = {
            viewer: this.props.viewer,
            sportunity: this.props.sportunity, 
            scoreVar,
            sportunityTypeStatusVar: this.state.sportunityTypeStatus.id
        }

        UpdateSportunityResultMutation.commit(params,{
              onSuccess: (response) => {
                this.props.alert.show(localizations.event_fill_statistics_success, {
                    timeout: 2000,
                    type: 'success',
                });
              },
              onFailure: (error) => {
                this.props.alert.show(localizations.event_fill_statistics_failed, {
                  timeout: 4000,
                  type: 'error',
                });
              },
            }
        );
    }
    
    _getParticipantsStatsCols = (sportunityStatistics) => {
        let results = [];
        if (sportunityStatistics && sportunityStatistics.length > 0) {
            sportunityStatistics.forEach(stat => {
                if (stat.participant && results.findIndex(result => result.id === stat.statisticName.id) < 0)
                    results.push(stat.statisticName)
            })
        }
        return results ;
    }

    _getParticipantsStats = (sportunityStatistics) => {
        let results = [];
        if (sportunityStatistics && sportunityStatistics.length > 0) {
            sportunityStatistics.forEach(stat => {
                if (stat.participant) {
                    let index = results.findIndex(result => result.participant && result.participant.id === stat.participant.id);
                    if (index < 0) 
                        results.push({participant: stat.participant, values:[{id: stat.statisticName.id , value:stat.value}]})
                    else 
                        results[index].values.push({id: stat.statisticName.id , value:stat.value})
                }
            })
        }
        return results ;
    }

    _handleChangeUserStat = (rowIndex, colIndex, value) => {
        let newUserStats = this.state.userStatistics;
        newUserStats[rowIndex].values[colIndex].value = value ;
        this.setState({
            userStatistics: newUserStats
        })
    }

    _handleChangeUserParticipation = (rowIndex, event) => {
        let newUserStats = this.state.userStatistics;
        newUserStats[rowIndex].values[0].value = event.target.checked ? 1 : 0 ;

        if (!event.target.checked) {
            for (var i = 1 ; i < newUserStats[rowIndex].values.length ; i++) {
                newUserStats[rowIndex].values[i].value = 0 ;
            }
        }

        this.setState({
            userStatistics: newUserStats
        })
    }

    onSave = () => {
        this.setState({isProcessing: true})

        const {userStatistics} = this.state; 
        let sportunityStatisticsVar = [];

        userStatistics.forEach(userStatistic => {
            userStatistic.values.forEach(value => {
                sportunityStatisticsVar.push({
                    statisticId: value.id,
                    participantId: userStatistic.participant.id,
                    value: value.value
                })
            })
        })

        let params = {
            sportunityIDVar: this.props.sportunityID,
            sportunityStatisticsVar,
            viewer: this.props.viewer,
        }
        
        UpdateSportunityStatisticsMutation.commit(params,{
              onSuccess: (response) => {
                this.props.alert.show(localizations.event_fill_statistics_success, {
                    timeout: 2000,
                    type: 'success',
                });
                this.setState({isProcessing: false})
              },
              onFailure: (error) => {
                this.props.alert.show(localizations.event_fill_statistics_failed, {
                  timeout: 4000,
                  type: 'error',
                });
                this.setState({isProcessing: false})
              },
            }
        );
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
        let {viewer, isPast} = this.props;
        
        let participantsStatCols = this._getParticipantsStatsCols(viewer.sportunityStatistics);

        const {userStatistics} = this.state; 
        
        return (
            <div style={styles.container}>
                <div style={styles.returnButton} onClick={this.onClose}>
                <i style={styles.backButton} className="fa fa-long-arrow-left fa-2x" />
                    {localizations.event_fill_statistics_goback}
                </div>
                <h1 style={styles.title}>
                    {localizations.event_fill_statistics_title}
                </h1>
                {(!isPast && (!userStatistics || userStatistics.length === 0)) &&
                    <div style={styles.note}>{localizations.event_fill_statistics_nothing}</div>
                }
                <div>
                    {this.props.sportunity && !this.props.sportunity.sportunityType && 
                         this.props.sportunity.sport.sport.sportunityTypes && this.props.sportunity.sport.sport.sportunityTypes.length > 0 && 
                        <div>
                            <div style={styles.typeRow}>
                                <span style={styles.blueNote}>
                                    {localizations.event_fill_no_sportunity_type}
                                </span>
                                <InputList
                                    value={this.state.sportunityType && this.state.sportunityType.name[localizations.getLanguage().toUpperCase()] || ''}
                                    list={this.props.sportunity.sport.sport.sportunityTypes}
                                    onClickItem={this._handleChangeSportunityType}
                                    />    
                            </div>
                            <div style={styles.button_container}>
                                <button
                                    style={styles.validateButton}
                                    onClick={this.onSaveSportunityType}
                                    >
                                    {localizations.event_fill_statistics_validate}
                                </button>
                            </div>
                        </div>
                    }
                </div>
                {!isPast && this.props.sportunity && this.props.sportunity.sportunityType && 
                    <div style={styles.section}>
                        <div style={styles.typeRow}>
                            <span style={styles.blueNote}>
                                {localizations.event_fill_sportunity_type}
                            </span>
                            <span style={styles.note}>
                                {this.props.sportunity.sportunityType.name[localizations.getLanguage().toUpperCase()]}
                            </span>
                        </div>
                    </div>
                }
                {isPast && this.props.sportunity && this.props.sportunity.sportunityType &&
                    <div style={styles.section}>
                        <h3 style={styles.subtitle}>
                            {localizations.event_fill_statistics_sportunity_title}
                        </h3>
                        <div style={styles.typeRow}>
                            <span style={styles.blueNote}>
                                {localizations.event_fill_sportunity_type}
                            </span>
                            <span style={styles.note}>
                                {this.props.sportunity.sportunityType.name[localizations.getLanguage().toUpperCase()]}
                            </span>
                        </div>
                        {this.props.sportunity.sportunityType.statuses && this.props.sportunity.sportunityType.statuses.length > 0 &&
                            <div>
                                <div style={styles.typeRow}>
                                    <span style={styles.blueNote}>
                                        {localizations.event_fill_set_result}
                                    </span>
                                    <InputList
                                        value={this.state.sportunityTypeStatus && this.state.sportunityTypeStatus.name[localizations.getLanguage().toUpperCase()] || ''}
                                        list={this.props.sportunity.sportunityType.statuses}
                                        onClickItem={this._handleChangeSportunityResult}
                                        />    
                                </div>                            
                                {this.props.sportunity.sportunityType.isScoreRelevant &&
                                   <div>
                                       <div style={styles.typeRow}>
                                            <span style={styles.blueNote}>
                                                {localizations.event_fill_current_team_score}
                                            </span>
                                            <input 
                                                onChange={(e) => this._handleChangeCurrentTeamScore(e)}
                                                key={'currentTeam'}
                                                style={styles.input}
                                                value={this.state.score.currentTeam || ''}
                                                />
                                        </div>
                                        <div style={styles.typeRow}>
                                            <span style={styles.blueNote}>
                                                {localizations.event_fill_adversary_team_score}
                                            </span>
                                            <input 
                                                onChange={(e) => this._handleChangeAversaryTeamScore(e)}
                                                key={'adversaryTeam'}
                                                style={styles.input}
                                                value={this.state.score.adversaryTeam || ''}
                                                />
                                        </div>
                                    </div> 
                                }
                                <div style={styles.button_container}>
                                    <button
                                        style={styles.validateButton}
                                        onClick={this.onSaveSportunityResult}
                                        >
                                        {localizations.event_fill_statistics_validate}
                                    </button>
                                </div>
                            </div>
                        }
                    </div>
                }
                {userStatistics && userStatistics.length > 0 &&
                    <div style={styles.section}>
                        <h3 style={styles.subtitle}>
                            {localizations.event_fill_statistics_participants_title}
                        </h3>
                        <div style={{width: '100%', overflowX: 'scroll'}}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.colLabel}>{localizations.event_fill_statistics_participant}</th>
                                    {participantsStatCols.map((name, index) => (
                                        <th key={index} style={styles.headerCol}>
                                            {name.name}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {userStatistics.map((stat, index) => (
                                    <tr key={index}>
                                        <td style={styles.colLabel}>
                                            <Circle
                                                key={index}
                                                name={stat.participant.pseudo || '' }
                                                image={stat.participant.avatar}
                                            />
                                        </td>
                                        {stat.values.map((value, colIndex) => (
                                            <td key={index+'-'+colIndex} style={styles.col}>
                                                {colIndex === 0 
                                                    ? <input 
                                                        type="checkbox" 
                                                        style={styles.checkboxInput} 
                                                        checked={value.value === 1}
                                                        onChange={(newValue) => this._handleChangeUserParticipation(index, newValue)}
                                                        />
                                                    : <NumericInput
                                                        style={styles.numericInput}
                                                        value={value.value}
                                                        min={0}
                                                        max={100}
                                                        disabled={stat.values[0].value === 0}
                                                        onChange={(newValue) => this._handleChangeUserStat(index, colIndex, newValue)}
                                                        />
                                                }
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                        <section style={styles.button_container}>
                            {this.state.isProcessing 
                            ?   <ReactLoading type='cylon' color={colors.blue} />
                            :   <button
                                    style={styles.validateButton}
                                    onClick={this.onSave}
                                >
                                    {localizations.event_fill_statistics_validate}
                                </button>
                            }
                        </section>
                    </div>
                }
                
                
            </div>
        )
    }
}

export default createRefetchContainer(Radium(withAlert(StatsFilling)), {
    viewer: graphql`
        fragment StatsFilling_viewer on Viewer @argumentDefinitions (
            id: {type: "String", defaultValue: null}
            query: {type: "Boolean!", defaultValue: false}
        ){
            id
            sportunityStatistics (sportunityID: $id) @include(if:$query) {
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
    sportunity: graphql`
        fragment StatsFilling_sportunity on Sportunity {
            id
            sport {
                sport {
                    type
                    sportunityTypes {
                        id
                        name {
                            FR,
                            EN
                        }
                    }
                }
            }
            sportunityType {
                id,
                name {
                    FR,
                    EN,
                },
                statuses {
                    id,
                    name {
                        FR,
                        EN
                    }
                }
                isScoreRelevant
            }
            sportunityTypeStatus {
                id,
                name {
                    FR, 
                    EN
                }
            }
            score {
                currentTeam,
                adversaryTeam
            }
        }
    `
},
graphql`
    query StatsFillingRefetchQuery(
        $id: String
        $query: Boolean!
    ) {
        viewer {
            ...StatsFilling_viewer @arguments(
                id: $id,
                query: $query
            )
        }
    }
`,
);
