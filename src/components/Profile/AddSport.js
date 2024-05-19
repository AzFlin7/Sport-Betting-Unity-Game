import React from 'react'
import PureComponent, { pure } from '../common/PureComponent'
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import Modal from 'react-modal'
import { connect } from 'react-redux';
import Radium from 'radium'
// import 'react-select/dist/react-select.css';
import SportLevels from './SportLevels'
import Multiselect from './Multiselect'
import SportSelect from './SportSelect'
import localizations from '../Localizations'

import { fonts, colors, metrics } from '../../theme'

let styles
let modalStyles

class AddSport extends PureComponent {
	constructor(props) {
		super(props)
		this.state = {
			isOpen: false,
			selectedLevelId: null,
			selectedPositionId: null,
			selectedCertificateId: null,
			certificateNo: '',
			selectedSport: null,
			shouldSave: false,
			levelFrom: null,
			levelTo: null,
			positions: [],
			certificates: [],
			assistantTypes: [],
			allSportsLoaded: false,
		}
	}

	componentDidMount() {
		this.props.relay.refetch(fragmentVariables => ({
			...fragmentVariables,
      queryLanguage: localizations.getLanguage().toUpperCase()
    }))
	}

	_selectSport = (sport) => {

    this.setState({
      selectedSport: sport,
			levelFrom: null,
			levelTo: null,
			positions: [],
			assistantTypes: [],
			certificates: [],
    })
  }

	_openModal = () => {
		this.setState({
			isOpen: true,
		})
	}

	_closeModal = () => {
		this.setState({
			isOpen: false,
			selectedLevelId: null,
			selectedPositionId: null,
			selectedCertificateId: null,
			certificateNo: '',
			selectedSport: null,
			shouldSave: false,
			levelFrom: null,
			levelTo: null,
			positions: [],
			certificates: [],
			assistantTypes: [],
		})
	}

	_onLavelChange = (e) => {
		this.setState({
			selectedLevelId: e.target.value,
		})
	}

	_onPositionChange = (e) => {
		this.setState({
			selectedPositionId: e.target.value,
		})
	}

	_onCertificateNoChanged = (e) => {
		this.setState({
			certificateNo: e.target.value,
		})
	}

	_setLevelFrom = (value) => {
		this.setState({
			levelFrom: value,
		})
	}

	_setLevelTo = (value) => {
		this.setState({
			levelTo: value,
		})
	}

	_addPositions = (value) => {
		if (value === undefined) {
			this.setState({
				positions: [],
			})
		} else {
			let idx = this.state.positions.findIndex((e) => e.value == value.value)
			console.log(idx)
			console.log(this.state.positions)
			let newValues = idx >= 0
					? [].concat(this.state.positions.slice(0, idx), this.state.positions.slice(idx))
					: [...this.state.positions, value]
			console.log(newValues)



			this.setState({
				positions:
					idx >= 0
						? [].concat(this.state.positions.slice(0, idx), this.state.positions.slice(idx+1))
						: [...this.state.positions, value],
			})
		}
	}

	_addCertificates = (value) => {
		if (value === undefined) {
			this.setState({
				certificates: [],
			})
		} else {
			let idx = this.state.certificates.findIndex((e) => e.value == value.value)

			this.setState({
				certificates:
					idx >= 0
						? [].concat(this.state.certificates.slice(0, idx), this.state.certificates.slice(idx+1))
						: [...this.state.certificates, value],
			})
		}
	}

	addAssistantType = (value) => {
		if (value === undefined) {
			this.setState({
				assistantTypes: [],
			})
		} else {
			let idx = this.state.assistantTypes.findIndex((e) => e.value == value.value)
			
			this.setState({
				assistantTypes: 
					idx >= 0 
						? [].concat(this.state.assistantTypes.slice(0, idx), this.state.assistantTypes.slice(idx+1))
						: [...this.state.assistantTypes, value],
			})
		}
	}

	_getLevelsRange = (levelFrom, levelTo) => {
    const { levels } = this.state.selectedSport
		const levelsSorted = [...levels].sort((a, b) => {
			if (a[localizations.getLanguage().toUpperCase()].skillLevel > b[localizations.getLanguage().toUpperCase()].skillLevel)
				return 1;
			else return -1;
		})
    if (!levelFrom || !levelTo) {
      return []
    } else {
      let fromIndex = levelsSorted.findIndex((e) => e.id == levelFrom.value);
      let toIndex = levelsSorted.findIndex((e) => e.id == levelTo.value);
      let selectedLevels = levelsSorted.slice(fromIndex, toIndex+1)
			return selectedLevels
      //this.props.setSelectedLevels(selectedLevels)
    }
  }

	_handleLoadAllSports = () => {
    this.props.relay.refetch(fragmentVariables => ({ 
			...fragmentVariables, 
			sportsNb: 1000, 
			filterName: { name: '' , language: 'EN' }
		}));
    this.setState({
      allSportsLoaded: true,
    })
  }

	_updateSportFilter =(value) => {
		this.props.relay.refetch(fragmentVariables => ({
			...fragmentVariables,
			filterName: { name: value, language: localizations.getLanguage().toUpperCase() },
			sportsNb: 5,
		}));
  }

	_handleSave = () => {
		if(this.state.levelFrom && this.state.selectedSport) {
			let sport = {
				sport: this.state.selectedSport,
				levelFrom: this.state.levelFrom,
				levelTo: this.state.levelTo,
				levels: this._getLevelsRange(this.state.levelFrom, this.state.levelTo),
				positions: this.state.positions,
				certificates: this.state.certificates,
				assistantType: this.state.assistantTypes
			}
			this.props.onAddSport(sport)
			this._closeModal()
		} else {
			this.setState({
				shouldSave: true,
			})
		}
	}

	render() {
		const { viewer } = this.props
		const sportsList = viewer.sports.edges.map(({ node }) => ({ ...node, name: node.name[localizations.getLanguage().toUpperCase()], value: node.id }));
    const { selectedSport, shouldSave } = this.state

		const levelOptions = selectedSport ?
			selectedSport.levels
				.map(level => ({ value: level.id, name: level[localizations.getLanguage().toUpperCase()].name, skillLevel: level[localizations.getLanguage().toUpperCase()].skillLevel, description: level[localizations.getLanguage().toUpperCase()].description }))
				.sort((a, b) => {return a.skillLevel - b.skillLevel})
			: [] ;
		const positionOptions = selectedSport ?
			selectedSport.positions.map(position => { return { value: position.id, name: position[localizations.getLanguage().toUpperCase()] } } ) : []
		const certificateOptions = selectedSport ?
			selectedSport.certificates.map(certificate => { return { value: certificate.id, name: certificate.name[localizations.getLanguage().toUpperCase()] }}) : []
		const assistantTypesOptions = selectedSport 
			? selectedSport.assistantTypes.map(assistantType => ({value: assistantType.id, name: assistantType.name[localizations.getLanguage().toUpperCase()]})) 
			: [];

// TODO props.relay.* APIs do not exist on compat containers
		const pendingVariables = this.props.relay.pendingVariables

		const isLevelError = shouldSave && !this.state.levelFrom
		const isSportError = shouldSave && !this.state.selectedSport
		return(
			<section>
				<button style={styles.blueButton} onClick={this._openModal}>{localizations.profile_addSport}</button>
				<Modal isOpen={this.state.isOpen}
								onRequestClose={this._closeModal}
								style={modalStyles}
								shouldCloseOnOverlayClick={false}
								contentLabel="Create facility">
						<div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <div style={styles.modalTitle}>{localizations.profile_addSport}</div>
                <div style={styles.modalClose} onClick={this._closeModal}>
                  <i className="fa fa-times" />
                </div>
              </div>
							<div style={styles.modalBody}>
									<SportSelect
											style={styles.select}
											label={localizations.profile_sport}
											onChange={this._selectSport}
											onSearching={this._updateSportFilter}
											list={sportsList}
											required
											placeholder={localizations.profile_sportHolder}
											onLoadAllClick={this._handleLoadAllSports}
											allSportLoaded={this.state.allSportsLoaded}
											loadingAllSports={pendingVariables}
											isError={isSportError}
										/>

									<SportLevels
										style={styles.select}
										label={localizations.profile_level}
										list={levelOptions}
										from={this.state.levelFrom}
										to={this.state.levelTo}
										placeholder={!selectedSport ? localizations.profile_beforeSport : localizations.newSportunity_levelHolder}
										onFromChange={this._setLevelFrom}
										onToChange={this._setLevelTo}
										disabled={!selectedSport}
										isError={isLevelError}
										/>
									{/* positionOptions.length > 0 &&
										<Multiselect
											style={styles.select}
											label={localizations.profile_position}
											list={positionOptions}
											values={this.state.positions}
											placeholder={!selectedSport ? localizations.profile_beforeSport : localizations.newSportunity_positionHolder}
											onChange={this._addPositions}
											disabled={!selectedSport}
										/>
									*/}
									{ certificateOptions.length > 0 &&
										<Multiselect
											style={styles.select}
											label={localizations.profile_certificate}
											list={certificateOptions}
											values={this.state.certificates}
											placeholder={!selectedSport ? localizations.profile_beforeSport : localizations.newSportunity_certificateHolder}
											onChange={this._addCertificates}
											disabled={!selectedSport}
										/>
									}
									{assistantTypesOptions.length > 0 &&
										<Multiselect
											style={styles.select}
											label={localizations.profile_assistant}
											list={assistantTypesOptions}
											values={this.state.assistantTypes}
											placeholder={!selectedSport ? localizations.profile_beforeSport : localizations.newSportunity_assistantHolder}
											onChange={this.addAssistantType}
											disabled={!selectedSport}
										/>	
									}

									<button style={styles.submitButton}
													onClick={this._handleSave}>{localizations.profile_addSport}</button>
							</div>
						</div>
				</Modal>
			</section>
		)
	}
}

styles = {
	button: {
		width: 140,
		backgroundColor: colors.blue,
    color: colors.white,
    fontSize: fonts.size.small,
    borderRadius: metrics.radius.tiny,
    outline: 'none',
		border: 'none',
		padding: '10px',
		cursor: 'pointer',
		boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
	},

	submitButton: {
		width: 320,
		backgroundColor: colors.green,
    color: colors.white,
    fontSize: fonts.size.small,
    borderRadius: metrics.radius.tiny,
    outline: 'none',
		border: 'none',
		padding: '10px',
		cursor: 'pointer',
		boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
	},
	modalContent: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'flex-start',
    maxHeight: '500px', // <-- This sets the height
    overlfow: 'scroll', // <-- This tells the modal to scrol
	},
	modalHeader: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'flex-center',
		justifyContent: 'flex-center',
    marginBottom: 30,
	},
  modalTitle: {
		fontFamily: 'Lato',
		fontSize:30,
		fontWeight: fonts.weight.large,
		color: colors.blue,

		flex: '2 0 0',
	},
	modalClose: {
		justifyContent: 'flex-center',
    verticalAlign: 'middle',
		paddingTop: 10,
		color: colors.gray,
		cursor: 'pointer',
    fontSize: 16,
	},
  modalBody: {
    display: 'flex',
		width: 320,
		flexDirection: 'column',
		justifyContent: 'flex-start',
  },
	emptyOption: {
		color: colors.gray,
	},
	inputEmpty: {
    borderWidth: 0,
    borderBottomWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.blue,
    height: '32px',
    lineHeight: '32px',
    fontFamily: 'Lato',
    color: colors.gray,
    display: 'block',
    background: 'transparent',
    marginBottom: '20px',
    width: '100%',
    fontSize: fonts.size.medium,
    outline: 'none',
  },
	inputError: {
    borderWidth: 0,
    borderBottomWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.error,
    height: '32px',
    lineHeight: '32px',
    fontFamily: 'Lato',
    color: colors.gray,
    display: 'block',
    background: 'transparent',
    marginBottom: '20px',
    width: '100%',
    fontSize: fonts.size.medium,
    outline: 'none',
	},
	blueButton: {
    backgroundColor: colors.blue,
    color: colors.white,
    padding: '7px',
    marginRight: 5,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    minWidth: 180,
    height: 40,
    fontFamily: 'Lato',
    cursor: 'pointer',
    border: 0,
    borderRadius: 5,
    transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
    ':hover': {
      filter: 'brightness(0.9)'
    },
    ':disabled': {
      backgroundColor: colors.lightGray,
      color: colors.darkGray
    },
    ':active': {
      outline: 'none'
    },
    '@media (max-width: 900px)': {
      width: '100%'
    },
    bottomBorder: 'black solid 5px'

  },
}

const dispatchToProps = (dispatch) => ({
})
  
const stateToProps = (state) => ({
})

let ReduxContainer = connect(
    stateToProps,
    dispatchToProps
)(Radium(AddSport));

export default createRefetchContainer(ReduxContainer, {
//OK
      viewer: graphql`
          fragment AddSport_viewer on Viewer @argumentDefinitions(
						sportsNb: { type: "Int", defaultValue: 10 }
						filterName: { type: "SportFilter"}
						queryLanguage: { type: "SupportedLanguage", defaultValue: "EN" }
					) {
      sports(first: $sportsNb, filter:$filterName, language: $queryLanguage) {
                  edges {
                      node {
                          id
                          type
                          name {
                              EN
                              FR
                              DE
                          }
                          logo
            positions {
              id
              EN
                              FR
                              DE
            }
            certificates {
              id
              name {
                id
                EN
                                  FR
                                  DE
              }
            }
            levels {
              id
              EN {
                skillLevel
                                  name
                                  description
              }
                              FR {
                skillLevel
                                  name
                                  description
              }
                              DE {
                skillLevel
                                  name
                                  description
              }
                          }
                          assistantTypes {
                              id,
                              name {
                                  EN,
                                  FR,
                                  DE,
                              }
                          }
                      }
                  }
              }
          }
      `,
},
graphql`
query AddSportRefetchQuery(
  $sportsNb: Int
  $filterName: SportFilter
  $queryLanguage: SupportedLanguage
) {
viewer {
    ...AddSport_viewer
    @arguments(
      sportsNb: $sportsNb
      filterName: $filterName
      queryLanguage: $queryLanguage
    )
}
}
`,
);


modalStyles = {
  overlay : {
    position          : 'fixed',
    top               : 0,
    left              : 0,
    right             : 0,
    bottom            : 0,
    backgroundColor   : 'rgba(255, 255, 255, 0.75)',
    overlfow: 'scroll', // <-- This tells the modal to scrol
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
    overflow                   : 'visible',
    WebkitOverflowScrolling    : 'touch',
    borderRadius               : '4px',
    outline                    : 'none',
    padding                    : '20px',
  },

}
