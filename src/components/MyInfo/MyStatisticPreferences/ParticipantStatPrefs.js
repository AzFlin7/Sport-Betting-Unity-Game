import React from 'react'

import { appStyles, colors, fonts } from '../../../theme'

import localizations from '../../Localizations'

import styles from '../Styles'
import {Style} from "radium";

class ParticipantStatPrefs extends React.Component {
	constructor(props) {
        super(props)
        this.state = {
            stat1: '',
            stat2: '',
            stat3: '',
            stat4: '',
            stat5: '',
            isModifying: false,
        }
    }

    componentDidMount = () => {
        const {statisticPreferences} = this.props ;
        if (statisticPreferences) {
            this.setState({
                stat1: statisticPreferences.userStats.stat1 && statisticPreferences.userStats.stat1.name || '',
                stat2: statisticPreferences.userStats.stat2 && statisticPreferences.userStats.stat2.name || '',
                stat3: statisticPreferences.userStats.stat3 && statisticPreferences.userStats.stat3.name || '',
                stat4: statisticPreferences.userStats.stat4 && statisticPreferences.userStats.stat4.name || '',
                stat5: statisticPreferences.userStats.stat5 && statisticPreferences.userStats.stat5.name || '',
            })
        }
    }

    _handleSave = () => {
        let userStats = {
            stat1: this.state.stat1, 
            stat2: this.state.stat2, 
            stat3: this.state.stat3, 
            stat4: this.state.stat4, 
            stat5: this.state.stat5, 
        }
        this.props._handleUpdatePreferences(userStats);
        this.setState({isModifying: false})
    }

    _handleChangeStatName = (statName, event) => {
        this.setState({
            [statName]: event.target.value
        })
    }

    _editPrefs = () => {
        this.setState({isModifying: true})
    }

    _handleCancel = () => {
        this.setState({isModifying: false})
    }
    

	render() {		
        const {statisticPreferences} = this.props ;
		return(
			<section style={styles.container}>
				<Style scopeSelector='.inputTextClass::-webkit-input-placeholder' rules={{
					color: '#BBB'
				}} />
                <div style={styles.rowHeader}>
                    <div style={styles.header}>
                        {localizations.myStatPrefs_participants_title}
                    </div>
                    { !this.state.isModifying && 
                        <div style={styles.editButton} onClick={this._editPrefs}>{localizations.info_edit}</div>
                    }
                </div>
				<div style={styles.explaination} >
                    {localizations.myStatPrefs_participants_explaination}
				</div>
                {statisticPreferences && 
                    Object.keys(statisticPreferences.userStats).filter(statName => statName !== '__dataID__' && statName !== 'stat0').map((statName, index) => (
                        <div key={index} style={styles.row} >
                            <div style={styles.label}>{localizations['myStatPrefs_participants_'+statName]}</div>
                            {this.state.isModifying 
                            ?   <input 
                                    type='text'
                                    className='inputTextClass'
                                    placeholder={localizations['myStatPrefs_participants_'+statName+'_placeholder']}
                                    style={styles.input} 
                                    value={this.state[statName]} 
                                    onChange={(event) => this._handleChangeStatName(statName, event)} 
                                /> 
                            :   <label style={this.state[statName] ? styles.inputLabel : styles.inputLabelExample}>
                                    {this.state[statName] ? this.state[statName] : localizations['myStatPrefs_participants_'+statName+'_placeholder']}
                                </label> 
                            }
                        </div>                    
                    ))
                }
                {this.state.isModifying && 
                    <div style={styles.row}>
                        <label style={styles.label}></label>
                        <section>
                            <button style={appStyles.blueButton} onClick={this._handleSave}>{localizations.info_update}</button> 
                            <button style={appStyles.grayButton} onClick={this._handleCancel}>{localizations.info_cancel}</button>
                        </section>
                    </div>
                }
			</section>
		)
	}
}

export default ParticipantStatPrefs