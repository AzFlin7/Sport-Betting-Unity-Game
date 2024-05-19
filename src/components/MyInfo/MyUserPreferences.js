import React from 'react'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium'
import { withAlert } from 'react-alert'

import styles from './Styles'

import UpdateUserMutation from './UpdateUserMutation';

import { appStyles, fonts, colors } from '../../theme'
import InputSelect from '../common/Inputs/InputSelect'

import localizations from '../Localizations'

class MyUserPreferences extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            language: localizations.getLanguage(),
            areSubAccountsActivated: false,
            homePagePreference: 'FIND'
        };
    }

    componentDidMount = () => {
        setTimeout(() => this.setState({ loading: false }), 1500)
        if (this.props.user && this.props.user.userPreferences)
            this.setState({
                areSubAccountsActivated: this.props.user.userPreferences.areSubAccountsActivated,
                homePagePreference: this.props.user.homePagePreference
            })
    }

    componentWillReceiveProps = (nextProps) => {
        let areSubAccountsActivated = nextProps.user.userPreferences.areSubAccountsActivated;
        this.setState({
            areSubAccountsActivated: areSubAccountsActivated,
            homePagePreference: nextProps.user.homePagePreference
        })
    }

    _setLanguage = (language) => {
        this.setState({ language: language })
    }

    _handleUpdateUserPreferences = () => {
        let params = {
            userIDVar: this.props.user.id,
            user: this.props.user,
            userPreferencesVar: {
                areSubAccountsActivated: this.state.areSubAccountsActivated
            },
            homePagePreferenceVar: this.state.homePagePreference,
            viewer: this.props.viewer,
        } ;
        UpdateUserMutation.commit(params,
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

    _handleUpdateSubAccountActivated = (e) => {
        this.setState({
            areSubAccountsActivated: e.target.checked,
            shouldDisplayMainValidateButton: true
        })
    }

    _handleUpdateHomePagePreference = e => {
        this.setState({
            homePagePreference: e,
            shouldDisplayMainValidateButton: true
        })
    }

    render() {
        const { viewer, user } = this.props;
        const pagePreferenceList = [{key: 'FIND', name: localizations.header_findSportunities},{key: 'ORGANIZED', name: localizations.header_mySportunities}];

        return (
            <div>
                <div style={styles.container}>
                    <div style={styles.pageHeader}>{localizations.myUserPrefs_title}</div>
                    <div style={styles.wrapper}>
                        <div style={styles.row}>
                            <div style={styles.subHeader}>
                                {user.profileType === 'PERSON' 
                                ?   localizations.myUserPrefs_subAccountChildren_activation_label
                                :   localizations.myUserPrefs_subAccountTeams_activation_label
                                }
                            </div>
                            <input
                                type="checkbox"
                                style={styles.checkboxInput}
                                checked={this.state.areSubAccountsActivated}
                                onChange={this._handleUpdateSubAccountActivated}
                            />
                        </div>
                        <div style={styles.explaination} >
                            {user.profileType === 'PERSON' 
                            ?   localizations.myUserPrefs_subAccountChildren_activation_explanation
                            :   localizations.myUserPrefs_subAccountTeams_activation_explanation
                            }
                        </div>
                        <div style={{...styles.row, alignItems: 'center'}}>
                            <div style={{...styles.subHeader, marginBottom: 20}}>
                                {localizations.myUserPrefs_homePagePref}
                            </div>
                            <InputSelect
                                list={pagePreferenceList}
                                isDisabled={false} 
                                onSelectItem={e => this._handleUpdateHomePagePreference(e.key)}
                                selectedItem={pagePreferenceList.find(item => item.key === this.state.homePagePreference)}
                            />
                        </div>
                        <div style={{...styles.explaination, marginTop: -15}} >
                            {localizations.myUserPrefs_homePagePref_explanation}
                        </div>
                        <button style={appStyles.blueButton} onClick={this._handleUpdateUserPreferences}>
                            {localizations.info_update}
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}

export default createFragmentContainer(Radium(withAlert(MyUserPreferences)), {
    viewer: graphql`
        fragment MyUserPreferences_viewer on Viewer {
            id
        }
    `,
    user: graphql`
        fragment MyUserPreferences_user on User {
            id
            profileType
            userPreferences {
                areSubAccountsActivated
            }
            homePagePreference
        }
    `
});
