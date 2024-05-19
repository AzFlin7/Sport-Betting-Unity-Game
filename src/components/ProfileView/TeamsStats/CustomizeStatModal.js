import React from 'react'
import { render } from 'react-dom';
import Modal from 'react-modal'
import {fonts, colors, appStyles} from '../../../theme'
import Radium, {Style, StyleRoot} from 'radium'

import localizations from '../../Localizations'
import InputText from "./InputText";
import UpdateStatisticPreferencesMutation
	from "../../MyInfo/MyStatisticPreferences/Mutations/UpdateStatisticPreferencesMutation";

let styles, modalStyles, cantCloseModalStyles;

class CustomizeStatModal extends React.Component {
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
		this._handleCloseRequest()
	}

	_handleChangeStatName = (statName, event) => {
		this.setState({
			[statName]: event.target.value
		})
	}

	_handleCancel = () => {
		this._handleCloseRequest()
	}

    _handleClickOutside = event => {
        if (this._containerNode && !this._containerNode.contains(event.target) && this.props.canCloseModal) {
            this._closeModal()
        }
    }

    _handleCloseRequest = () => {
        if (this.props.canCloseModal)
            this._closeModal()
    }

    _closeModal = () => {
        this.props.toggleModal()
    }




    render() {
	    const {statisticPreferences} = this.props ;
        return (
          <Modal
            isOpen={this.props.isOpen}
            onRequestClose={this._handleCloseRequest}
            style={this.props.canCloseModal ? modalStyles : cantCloseModalStyles}
            contentLabel={this.props.title}
          >
            <section style={styles.container}>
	            <Style scopeSelector='.inputTextClass::-webkit-input-placeholder' rules={{
		            color: '#BBB'
	            }} />
              <div style={styles.rowHeader}>
                <div style={styles.header}>
                  {localizations.myStatPrefs_participants_title}
                </div>
              </div>
              <div style={styles.explaination} >
                {localizations.myStatPrefs_participants_explaination}
              </div>
              {statisticPreferences &&
              Object.keys(statisticPreferences.userStats).filter(statName => statName !== '__dataID__' && statName !== 'stat0' && statName !== 'statManOfTheGame').map((statName, index) => (
                <div key={index} style={styles.row} >
                  <div style={styles.label}>{localizations['myStatPrefs_participants_'+statName]}</div>
                  <input
                    type='text'
                    className='inputTextClass'
                    placeholder={localizations['myStatPrefs_participants_'+statName+'_placeholder']}
                    style={styles.input}
                    value={this.state[statName]}
                    onChange={(event) => this._handleChangeStatName(statName, event)}
                  />
                </div>
              ))
              }
              <div style={styles.row}>
                <label style={styles.label}></label>
                <section>
                  <button style={appStyles.blueButton} onClick={this._handleSave}>{localizations.info_update}</button>
                  <button style={appStyles.grayButton} onClick={this._handleCancel}>{localizations.info_cancel}</button>
                </section>
              </div>
            </section>
          </Modal>
        )
    }
}

modalStyles = {
  overlay : {
    position          : 'fixed',
    top               : 0,
    left              : 0,
    right             : 0,
    bottom            : 0,
    backgroundColor   : 'rgba(255, 255, 255, 0.75)',
    zIndex: 201
  },
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    border                     : '1px solid #ccc',
    background                 : '#fff',
    overflow                   : 'auto',
    WebkitOverflowScrolling    : 'touch',
    borderRadius               : '4px',
    outline                    : 'none',
    padding                    : '20px',
  },
}

cantCloseModalStyles = {
  overlay : {
    position          : 'fixed',
    top               : 0,
    left              : 0,
    right             : 0,
    bottom            : 0,
    backgroundColor   : 'rgba(255, 255, 255, 0.9)',
    zIndex: 201
  },
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    border                     : '1px solid #ccc',
    background                 : '#fff',
    overflow                   : 'auto',
    WebkitOverflowScrolling    : 'touch',
    borderRadius               : '4px',
    outline                    : 'none',
    padding                    : '20px',
  },
}

styles = {
	container: {
		width: '100%',
		display: 'flex',
		flexDirection: 'column',
		fontFamily: 'Lato',
	},
	rowHeader: {
		width: '100%',
		display: 'flex',
		flexDirection: 'row',
		marginTop: 30,
		borderBottom: '1px solid ' + colors.gray,
		flexGrow: 0,
	},
	header: {
		fontFamily: 'Lato',
		fontSize: 20,
		//fontWeight: 'bold',
		color: colors.black,
		paddingBottom: 15,
		flex: 5,
	},
	explaination: {
		fontSize: 16,
		lineHeight: '24px',
		color: colors.black,
		fontStyle: 'italic',
		marginBottom: 30
	},
	row: {
		width: '100%',
		display: 'flex',
		flexDirection: 'row',
		marginTop: 15,
		//marginBottom: 10,
		alignItems: 'baseline',
	},
	label: {
		fontSize: 16,
		width: 180,
		color: colors.black,
	},
	input: {
		borderWidth: 0,
		borderBottomWidth: 2,
		borderStyle: 'solid',
		borderColor: colors.blue,
		height: '32px',
		lineHeight: '32px',
		fontFamily: 'Lato',
		color: 'rgba(0,0,0,0.65)',
		display: 'block',
		background: 'transparent',
		//marginBottom: '20px',
		//width: '100%',
		fontSize: 16,
		outline: 'none',
		width: 300,
	},
};

export default Radium(CustomizeStatModal);

// export function filterModal(properties) {
//     document.body.children[0].classList.add('react-confirm-alert-blur');
//     const divTarget = document.createElement('div');
//     divTarget.id = 'react-confirm-alert';
//     document.body.appendChild(divTarget);
//     render(<FilterModal {...properties} isOpen={true} />, divTarget);
// }