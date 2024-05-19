import React from 'react'
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium'
import { withAlert } from 'react-alert'

import styles from '../Styles'
import ParticipantStatPrefs from './ParticipantStatPrefs';

import UpdateStatisticPreferencesMutation from './Mutations/UpdateStatisticPreferencesMutation';
import UpdateUserMutation from './Mutations/UpdateStatisticUserMutation';

import { appStyles, fonts, colors } from '../../../theme'

import localizations from '../../Localizations'
import cloneDeep from 'lodash/cloneDeep';
import * as types from '../../../actions/actionTypes';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

class MyStatisticPreferences extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            language: localizations.getLanguage(),
            publicChecked: false,
            areStatisticsActivated: false,
            shouldDisplayMainValidateButton: false,
            isManOfTheGameActivated: false,
        };
    }

    componentDidMount = () => {
        if (this.props.user && this.props.user.id) {
            this.props.relay.refetch(fragmentVariables => ({
                ...fragmentVariables,
                userID: this.props.user.id
            }),
            null,
            () => {
                this.setState({
                    publicChecked: !this.props.viewer.statisticPreferences.private,
                    areStatisticsActivated: this.props.user.areStatisticsActivated,
                    isManOfTheGameActivated: this.props.viewer.statisticPreferences.isManOfTheGameActivated,
                })
            })
        }
        setTimeout(() => this.setState({ loading: false }), 1500)
    }

    // componentWillReceiveProps = (nextProps) => {
    //     let publicChecked = nextProps.viewer.statisticPreferences.private;
    //     this.setState({
    //         publicChecked: !publicChecked,
    //         areStatisticsActivated: nextProps.user.areStatisticsActivated,
    //         isManOfTheGameActivated: nextProps.viewer.statisticPreferences.isManOfTheGameActivated,
    //     })
    // }

    _setLanguage = (language) => {
        this.setState({ language: language })
    }

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
    }

    _handleUpdatePrivatePreferences = (e) => {
        this.setState({
            publicChecked: e.target.checked,
            shouldDisplayMainValidateButton: true
        })
    }

    _handleUpdateStatActivation = (e) => {
        this.setState({
            areStatisticsActivated: e.target.checked,
            shouldDisplayMainValidateButton: true
        })
    }

    _handleUpdateManOfTheGameActivated = (e) => this.setState({
      isManOfTheGameActivated: e.target.checked,
      shouldDisplayMainValidateButton: true
    })

    _handleSavePrivatePreferences = () => {
        let params = {
            userIDVar: this.props.user.id,
            areStatisticsActivatedVar: this.state.areStatisticsActivated,
            viewer: this.props.viewer
        } ;
        UpdateUserMutation.commit(params,
            {
                onSuccess: () => {
                    let params = {
                        userIDVar: this.props.user.id,
                        privateVar: !this.state.publicChecked,
                        isManOfTheGameActivatedVar: this.state.isManOfTheGameActivated,
                        viewer: this.props.viewer
                    } ;
                    UpdateStatisticPreferencesMutation.commit(params,
                        {
                            onSuccess: () => {
                                this.props.alert.show(localizations.myStatPrefs_update_success, {
                                    timeout: 2000,
                                    type: 'success',
                                });
                                this._updateTutorialSteps();
                            },
                            onFailure: (error) => {
                                this.props.alert.show(localizations.myStatPrefs_update_failed, {
                                    timeout: 2000,
                                    type: 'success',
                                });
                                console.log(error);
                                this.setState({
                                    shouldDisplayMainValidateButton: false
                                })
                            },
                        }
                    );
                },
                onFailure: (error) => {
                    this.props.alert.show(localizations.myStatPrefs_update_failed, {
                        timeout: 2000,
                        type: 'success',
                    });
                    console.log(error);
                },
            }
        );
        
    }

    _updateTutorialSteps = () => {
        const { tutorialSteps } = this.props;
        let newTutorialSteps = cloneDeep(tutorialSteps);
        newTutorialSteps['setupStatisticsStep'] = true;
        this.props._updateStepsCompleted(newTutorialSteps);
    }

    render() {

        const { viewer, user } = this.props;
console.log("here", this.props)
        return (
            <div>
                <div style={styles.container}>
                    <div style={styles.pageHeader}>{localizations.myStatPrefs_title}</div>
                    <div style={styles.wrapper}>
                        {viewer.statisticPreferences &&
                            <div>
                                <div>
                                    <div style={styles.row}>
                                        <div style={styles.subHeader}>
                                            {localizations.myStatPrefs_activation_label}
                                        </div>
                                        <input
                                            type="checkbox"
                                            style={styles.checkboxInput}
                                            checked={this.state.areStatisticsActivated}
                                            onChange={this._handleUpdateStatActivation}
                                            />
                                    </div>
                                    {/* <div style={styles.explaination} >
                                        {localizations.myStatPrefs_activation_explanation}
                                    </div> */}
                                </div>
                                {this.state.areStatisticsActivated &&
                                    <div>
                                        <div style={styles.row}>
                                            <div style={styles.subHeader}>
                                                {localizations.myStatPrefs_privacy_label}
                                            </div>
                                            <input
                                                type="checkbox"
                                                style={styles.checkboxInput}
                                                checked={this.state.publicChecked}
                                                onChange={this._handleUpdatePrivatePreferences}
                                                />
                                        </div>
                                        <div style={styles.explaination} >
                                            {localizations.myStatPrefs_privacy_explanation}
                                        </div>

                                        <div style={styles.row}>
                                            <div style={styles.subHeader}>
                                                {localizations.myStatPrefs_manofthegame_label}
                                            </div>
                                            <input
                                              type="checkbox"
                                              style={styles.checkboxInput}
                                              checked={this.state.isManOfTheGameActivated}
                                              onChange={this._handleUpdateManOfTheGameActivated}
                                            />
                                        </div>
                                        <div style={styles.explaination} >
                                            {localizations.myStatPrefs_manofthegame_explanation}
                                        </div>

                                    </div>
                                }
                                {this.state.shouldDisplayMainValidateButton &&
                                    <button style={appStyles.blueButton} onClick={this._handleSavePrivatePreferences}>
                                        {localizations.info_update}
                                    </button>
                                }

                            </div>
                        }
                        <div style={styles.rightSide}>
                            {this.state.areStatisticsActivated && viewer.statisticPreferences &&
                                <ParticipantStatPrefs
                                    statisticPreferences={viewer.statisticPreferences}
                                    _handleUpdatePreferences={this._handleUpdateUserPreferences}
                                    {...this.state}
                                />
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const _updateStepsCompleted = (steps) => ({
    type: types.UPDATE_STEPS_COMPLETED,
    tutorialSteps: steps,
});

const dispatchToProps = (dispatch) => ({
    _updateStepsCompleted: bindActionCreators(_updateStepsCompleted, dispatch),
});

const stateToProps = (state) => ({
    tutorialSteps: state.profileReducer.tutorialSteps,
    language: state.globalReducer.language,
});

const ReduxContainer = connect(
  stateToProps,
  dispatchToProps,
)(MyStatisticPreferences);

export default createRefetchContainer(Radium(withAlert(ReduxContainer)), {
//OK
    viewer: graphql`
        fragment MyStatisticPreferences_viewer on Viewer @argumentDefinitions (
            userID: {type: "String", defaultValue: null}
            ){
            id
            statisticPreferences (userID: $userID) {
                private,
                isManOfTheGameActivated,
                userStats {
                    stat0 {name}
                    stat1 {name}
                    stat2 {name}
                    stat3 {name}
                    stat4 {name}
                    stat5 {name}
                }
            }
        }
    `,
    user: graphql`
        fragment MyStatisticPreferences_user on User {
            id
            areStatisticsActivated
        }
    `
},
    graphql`
        query MyStatisticPreferencesRefetchQuery(
            $userID: String
        ) {
            viewer {
            ...MyStatisticPreferences_viewer @arguments(
                userID: $userID
            )
        }
    }
`,
);
