import React from 'react'
import { render } from 'react-dom';
import { connect } from 'react-redux';
import Modal from 'react-modal'
import { fonts, colors } from '../../theme'
import Radium, {StyleRoot} from 'radium'

import localizations from '../Localizations'
import CircleSelect from "./CircleSelect";
import ChipsArray from "./ChipsArray";
import SportLevels from "../FindSportunity/SportLevels";
import SportSelect from "./SportSelect";
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import Geosuggest from 'react-geosuggest'
import CircleSuggestion from "./CircleSuggestion";
import NewCircle from './NewCircle'
import CircleItem from "./CircleItem";
import SummoningInvitedList from "./SummoningInvitedList";
import Input from "./Input";
import Select from "react-select";
import appStyles from "../../theme/appStyles";
import OwnerSelect from "./OwnerSelect";
import Switch from "../common/Switch";

import Paper from '@material-ui/core/Paper';


let styles, modalStyles, cantCloseModalStyles;

class SummoningModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      isLoading: false,
	    type: null,
	    sport: null,
	    location: null,
	    levelFrom: null,
	    levelTo: null,
	    levels: null,
	    name: '',
	    myCircleNb: 5,
	    publicCircleNb: 5,
	    myCircleFullListVisible: false,
	    publicCircleFullListVisible: false,
	    isNewCircleOpen: false,
	    inputContent: null,
	    selectedOwners: [],
	    seeCirclesFromOtherTeams: false
    }
  }


  componentDidMount() {
    this.props.relay.refetch(fragmentVariables => ({
			...fragmentVariables, 
			query: true,
			queryLanguage: localizations.getLanguage().toUpperCase()
		}),
		null,
		() => {
			setTimeout(() => {
				this.setState({isLoading: false})
			}, 50);
    })
  }

	_handleAutocompleteClicked = (user) => {
		this.props._handleAutocompleteClicked(user)
		setTimeout(() => {
			this.props.relay.refetch(fragmentVariables => ({
				...fragmentVariables,
				autocompletion_required: false,
				pseudo_autocomplete: '_'
			}));
		}, 400);
	}

	_updateCircleFilter = (callBack) => {
		this.props.relay.refetch(fragmentVariables => ({
			...fragmentVariables,
			filterCircle: {
				location: (!this.state.location) ? null : {
					lat: this.state.location.location.lat,
					lng: this.state.location.location.lng,
					radius: 50,
				},
				sport: (this.state.sport) ? {
					sportID: this.state.sport.id,
					level: this.state.levels,
				} : null,
				type: (this.state.type) ? this.state.type.key : null,
				nameCompletion: this.state.name,
				owners: this.state.selectedOwners.map(item => item.value)
			},
			query: true,
			firstMyCircle: this.state.myCircleNb,
			firstPublicCircle: this.state.publicCircleNb,
		}),
		null,
		() => {
			if (typeof callBack !== 'undefined')
				setTimeout(() => {
					callBack()
				}, 50);
		});
	};

	_updateType = (type) => {
		this.setState({
			type: type,
		}, this._updateCircleFilter)
	};

	_updateSport = (sport) => {
		this.setState({
			sport: sport,
		}, () => {
			if(this.state.sport && this.state.sport.levels)
				this._updateLevelRange(null, null);
			else
				this._updateCircleFilter();
		})
	};

	_handleLoadAllSports = () => {
		this.props.relay.refetch(fragmentVariables => ({ 
			...fragmentVariables, 
			sportNb: this.props.viewer.sports.count, 
			filterSport: { name: '' , language: localizations.getLanguage().toUpperCase() }
		}));
		this.setState({
			allSportsLoaded: true,
		})
	};

	_locationSelected = (location) => {
		this.setState({
			location: location
		}, this._updateCircleFilter)
	};

	_setLevelRange = (range) =>
	{
		this.setState({
			levels: range
		}, this._updateCircleFilter)
	};

	_updateLevelRange = (levelFrom, levelTo) => {
		const levels = this.state.sport.levels;
		let selectedLevels = null;
		if (levelFrom && levelTo)
		{
			let fromIndex = levels.findIndex((e) => e.id === levelFrom.value);
			let toIndex = levels.findIndex((e) => e.id === levelTo.value);
			selectedLevels = levels.slice(fromIndex, toIndex+1)
		}
		else
			selectedLevels = levels;

		this._setLevelRange(selectedLevels.map(level => level.id));
	};

	_setLevelFrom = (value) => {
		this.setState({
			levelFrom: value,
		});
		this._updateLevelRange(value, this.state.levelTo)
	};

	_setLevelTo = (value) => {
		this.setState({
			levelTo: value,
		});
		this._updateLevelRange(this.state.levelFrom, value)
	};

	_onSearchName = (e, callBack) => {
		this.setState({
			name: e,
		}, () => this._updateCircleFilter(callBack));
	};

	_updateSportFilter = (value) => {
		this.props.relay.refetch(fragmentVariables => ({
			...fragmentVariables,
			filterSport: {
				name: value,
				language: localizations.getLanguage().toUpperCase(),
			},
		}))
	};

	_handleInputChange = event => {
		this.setState({
			inputContent: event.target.value,
		})
		if (event.target.value.length)
			this.setState({
				userAutocompletionListIsOpen: true,
			})
		if (event.target.value.length > 1 && this.props.isLoggedIn) {
			this.props.relay.refetch(fragmentVariables => ({
				...fragmentVariables,
				autocompletion_required: true,
				pseudo_autocomplete: event.target.value
			}))
		}
		else {
			this.props.relay.refetch(fragmentVariables => ({
				...fragmentVariables,
				autocompletion_required: false,
				pseudo_autocomplete: '_'
			}))
		}
	}

	toggleShowMyCircle = (newCircleNb) => {
		this.setState({
			myCircleFullListVisible: !this.state.myCircleFullListVisible,
			myCircleNb: newCircleNb
		})
		this.props.relay.refetch(fragmentVariables => ({
			...fragmentVariables,
			firstMyCircle: newCircleNb
		}))
	}

	toggleShowPublicCircle = (newCircleNb) => {
		this.setState({
			publicCircleFullListVisible: !this.state.publicCircleFullListVisible,
			publicCircleNb: newCircleNb
		})
		this.props.relay.refetch(fragmentVariables => ({
			...fragmentVariables,
			firstPublicCircle: newCircleNb
		}))
	}

	_translatedName = (name) => {
		let translatedName = name.EN;
		switch(localizations.getLanguage().toLowerCase()) {
			case 'en':
				translatedName = name.EN;
				break;
			case 'fr':
				translatedName = name.FR || name.EN;
				break;
			case 'it':
				translatedName = name.IT || name.EN;
				break;
			case 'de':
				translatedName = name.DE || name.EN;
				break;
			default:
				translatedName = name.EN;
				break
		}
		return translatedName
	};

  _handleCloseRequest = () => {
    if (this.props.canCloseModal)
      this._closeModal()
  }

  _closeModal = () => {
    this.props.onClose();
  }

	_updateOwners = (value) => {
		this.setState({selectedOwners: value}, this._updateCircleFilter);
	}

	letSeeCirclesFromOtherTeams = (e) => {
		this.setState({
			seeCirclesFromOtherTeams: e
		});
		this.props.relay.refetch(fragmentVariables => ({
			...fragmentVariables,
			queryFromClub: e
		}))
	}

  render() {
    let sportsList =
      this.props.viewer.sports.edges.map(({node}) => ({...node, name: this._translatedName(node.name), value: node.id}));
    let typeList = [{key: 'ADULTS', name: localizations.circles_member_type_0},
      {key: 'CHILDREN', name: localizations.circles_member_type_1},
      {key: 'TEAMS', name: localizations.circles_member_type_2},
      {key: 'CLUBS', name: localizations.circles_member_type_3},
      {key: 'COMPANIES', name: localizations.circles_member_type_4},
    ];
    let levelList = (this.state.sport) ? this.state.sport.levels : [];
	  let response = (this.props.viewer.circles) ? this.props.viewer.circles.edges : [];
	  let myCircleList = [];
	  if (this.props.viewer.me && this.props.viewer.me.circles && this.props.viewer.me.circles.edges)
		  this.props.viewer.me.circles.edges.forEach(node => {
		  	if (myCircleList.findIndex(circle => circle.id === node.node.id) < 0)
		  		myCircleList.push(node.node)
		  })
	  if (this.props.viewer.me && this.props.viewer.me.circlesUserIsIn && this.props.viewer.me.circlesUserIsIn.edges)
		  this.props.viewer.me.circlesUserIsIn.edges.forEach(node => {
		  	if (myCircleList.findIndex(circle => circle.id === node.node.id) < 0)
		  		myCircleList.push(node.node)
		  })
	  if (this.props.viewer.me && this.props.viewer.me.circlesFromClub && this.props.viewer.me.circlesFromClub.edges)
		  this.props.viewer.me.circlesFromClub.edges.forEach(node => {
		  	if (myCircleList.findIndex(circle => circle.id === node.node.id) < 0)
		  		myCircleList.push(node.node)
		  })
	  let publicCircleList = [];
	  if (this.props.viewer.circles && this.props.viewer.circles.edges)
	  	this.props.viewer.circles.edges.forEach(node => {
			  if (publicCircleList.findIndex(circle => circle.id === node.node.id) < 0)
				  publicCircleList.push(node.node)
		  })
	  let myCircleCount = this.props.viewer.me && this.props.viewer.me.circles ? this.props.viewer.me.circles.count : 0;
	  myCircleCount += this.props.viewer.me && this.props.viewer.me.circlesUserIsIn ? this.props.viewer.me.circlesUserIsIn.count : 0;
	  myCircleCount += this.props.viewer.me && this.props.viewer.me.circlesFromClub ? this.props.viewer.me.circlesFromClub.count : 0;
	  let publicCircleCount = this.props.viewer.circles ? this.props.viewer.circles.count : 0;
	  this.props.invitedCircles.forEach(circle => {
	  	myCircleList = myCircleList.filter(item => item.id !== circle.circle.id)
		  publicCircleList = publicCircleList.filter(item => item.id !== circle.circle.id)
	  })
	  myCircleList.sort((a, b) => a.memberCount - b.memberCount);
	  publicCircleList.sort((a, b) => a.memberCount - b.memberCount);
	  let ownersList = [];
	  if (this.props.viewer.ownersOfCirclesUserIsIn && this.props.viewer.ownersOfCirclesUserIsIn.edges) {
		  this.props.viewer.ownersOfCirclesUserIsIn.edges.forEach(node => {
			  ownersList.push({value: node.node.id, label: node.node.pseudo})
		  })
		}


    return (
      <StyleRoot>

          <div style={styles.modalContent} ref={node => { this._containerNode = node; }}>
            <div style={styles.modalHeader}>
							<div style={styles.modalTitle}>
								{this.props.title}
								<hr style={{ marginBottom: 25, marginLeft: -70, marginRight: -70 }}></hr>
							</div>
            </div>
						<div style={styles.chip}>
							<div>
								<ChipsArray
									chipData={this.props.invitedCircles.map((item, index) => ({
										key: item.circle.id,
										label: item.circle.name,
										id: item.circle.id
									}))}
									onRemoveInvitedCircle={this.props.onRemoveInvitedCircle}
								/>
							</div>
								
							<Paper style={{...styles.wrapper, width: 250}}>
								<CircleSuggestion
									suggestion={response}
									onChange={(e, callBack) => this._onSearchName(e, callBack)}
									value={this.state.name}
								/>
							</Paper>
					</div>
					</div>
	        <div style={styles.filterRow}>
		        {this.props.viewer.me && this.props.viewer.me.profileType !== 'PERSON' &&
			        <div style={styles.wrapper}>
				        
				        <div style={styles.inputContainer}>
					        <OwnerSelect
						        viewer={this.props.viewer}
						        list={ownersList}
						        onSelectItem={e => this._updateOwners(e)}
						        isDisabled={false}
						        placeholder={localizations.find_circleHolder}
						        selectedItem={this.state.selectedOwners}
					        />
				        </div>
			        </div>
		        }
		        <div style={styles.wrapper}>
			        
			        <div style={styles.inputContainer}>
				        <CircleSelect
					        list={typeList}
					        onSelectItem={e => this._updateType(e)}
					        isDisabled={false}
					        placeholder={localizations.find_circleHolder}
					        selectedItem={this.state.type}
				        />
			        </div>
		        </div>
		        <div style={styles.wrapper}>
			        
						<div style={{ ...styles.inputContainer, ...styles.customStyleSportPosition }} >
				        <SportSelect
					        label={localizations.find_sport}
					        onChange={this._updateSport}
					        onSearching={this._updateSportFilter}
					        list={sportsList}
					        placeholder={localizations.find_sportHolder}
					        onLoadAllClick={this._handleLoadAllSports}
					        allSportLoaded={this.state.allSportsLoaded}
// TODO props.relay.* APIs do not exist on compat containers
					        loadingAllSports={this.props.relay.pendingVariables}
								  value={this.state.sport}
								  stylesCustom={styles.customStyleSport}
								  
				        />
			        </div>
		        </div>
		        <div style={styles.wrapper}>
			        
						<div style={{ ...styles.inputContainer, ...styles.customStyleSportPosition }}>
							<SportLevels
								  stylesCustom ={styles.customStyle}
					        label={localizations.find_levels}
					        list={levelList}
					        from={this.state.levelFrom}
					        to={this.state.levelTo}
					        placeholder={!this.state.sport ? localizations.newSportunity_levelHolderBefore : localizations.newSportunity_levelHolder}
					        onFromChange={this._setLevelFrom}
					        onToChange={this._setLevelTo}
					        disabled={levelList.length === 0}
				        />
			        </div>
		        </div>
		        <div style={{...styles.wrapper, ...styles.customWrapperGeosuggest}}>
			        
			        <div style={styles.inputContainer}>
				        <Geosuggest
					        style={inputStyles}
					        placeholder={localizations.find_cityHolder}
					        onSuggestSelect={this._locationSelected}
					        initialValue={this.state.location ? this.state.location.label : null}
					        location={this.props.userLocation}
					        radius={50000}
				        />
			        </div>
		        </div>
	        </div>
	        <div style={styles.listContainer}>
		        <div style={styles.invitedList}>
			        <div style={styles.textLabel}>{localizations.newSportunity_invitedList_modal_invitedCircle}</div>
			        <SummoningInvitedList
				        viewer={this.props.viewer}
				        invitedCircles={this.props.invitedCircles}
				        list={this.props.list}
				        onChangeCirclePrice={this.props.onChangeCirclePrice}
				        onChangeCircleAutoParticipate={this.props.onChangeCircleAutoParticipate}
				        onChangeUserAutoParticipate={this.props.onChangeUserAutoParticipate}
				        onRemoveItem={this.props.onRemoveItem}
				        onRemoveInvitedCircle={this.props.onRemoveInvitedCircle}
				        isModifying={this.props.isModifying}
				        isSurvey={this.props.isSurvey}
				        fields={this.props.fields}
				        _handleNotificationTypeChange={this.props._handleNotificationTypeChange}
				        _handleNotificationAutoXDaysBeforeChange={this.props._handleNotificationAutoXDaysBeforeChange}
			        />
		        </div>
		        <div style={styles.invitedList}>
			        <div style={styles.textLabel}>{localizations.newSportunity_invitedList_modal_myCircle}</div>
			        <div style={styles.listItem}>
			        {myCircleList.map((item, index) => (
			        	<CircleItem
					        key={index}
					        circle={item}
					        link={`/circle/${item.id}`}
					        viewer={this.props.viewer}
					        inviteCircle={() => this.props.addCircle(item)}
				        />
			        ))}
			        </div>
			        {myCircleList.length > 3 &&
			        <span style={{...styles.detailsButton, float: 'right'}} onClick={() => this.toggleShowMyCircle(!this.state.myCircleFullListVisible ? myCircleCount : 5)}>
				        {this.state.myCircleFullListVisible
					        ?   localizations.newSportunity_invitedList_seeLess
					        :   localizations.newSportunity_invitedList_seeMore
				        }
			        </span>
			        }
			        <div style={styles.addContainer}>
				        {this.props.viewer.me &&
				        <NewCircle
					        viewer={this.props.viewer}
					        user={this.props.viewer.me}
					        openNewCircle={() => {this.setState({isNewCircleOpen: true})}}
					        _closeNewCircle={() => {this.setState({isNewCircleOpen: false})}}
				        />
				        }
			        </div>
		        </div>
		        <div style={styles.invitedList}>
			        <div style={styles.textLabel}>{localizations.newSportunity_invitedList_modal_publicCircle}</div>
			        <div style={styles.listItem}>
			        {publicCircleList.map((item, index) => (
			        	<CircleItem
					        key={index}
					        circle={item}
					        link={`/circle/${item.id}`}
					        viewer={this.props.viewer}
					        inviteCircle={() => this.props.addCircle(item)}
				        />
			        ))}
			        </div>
			        {publicCircleCount > 5 &&
			        <span style={{...styles.detailsButton, float: 'right'}} onClick={() => this.toggleShowPublicCircle(!this.state.publicCircleFullListVisible ? publicCircleCount : 5)}>
				        {this.state.publicCircleFullListVisible
					        ?   localizations.newSportunity_invitedList_seeLess
					        :   localizations.newSportunity_invitedList_seeMore
				        }
			        </span>
			        }
		        </div>
	        </div>
	        {this.props.viewer.me && this.props.viewer.me.profileType !== 'PERSON' &&
		        <div style={styles.row}>
			        <label style={styles.label}>{localizations.newSportunity_seeCirclesFromOtherTeams}</label>
			        <Switch
				        checked={this.state.seeCirclesFromOtherTeams}
				        onChange={this.letSeeCirclesFromOtherTeams}
			        />
		        </div>
	        }
	        <div ref={node => { this._autocompletionList = node; }} style={{margin: 10, width: 250}}>
		        {/* <Input
			        containerStyle={{ marginBottom: 20, }}
			        ref={node => { this._inputNode = node }}
			        placeholder={localizations.newSportunity_invitedList_modal_inviteMember}
			        value={this.state.inputContent}
			        onChange={this._handleInputChange}
			        onKeyPress={this.handleKeyPress}
		        /> */}
		        {
			        this.state.userAutocompletionListIsOpen && (this.props.viewer && this.props.viewer.users && this.props.viewer.users.edges.length > 0) &&
			        <div style={styles.autocompletion_dropdown} >
				        <ul style={styles.list}>
					        {
						        this.props.viewer && this.props.viewer.users && this.props.viewer.users.edges.map((el, index) => {
							        return (<li
								        key={index}
								        style={styles.listItemClickable}
								        onClick={() => this._handleAutocompleteClicked(el.node)}
							        >
								        <div style={{ ...styles.avatar, backgroundImage: `url(${el.node.avatar})` }} />
								        {el.node.pseudo}
							        </li>)
						        })
					        }
				        </ul>
			        </div>
		        }
	        </div>
        {/* </Modal> */}
      </StyleRoot>
    )
  }
}

let  inputStyles = {
	'input': {
		borderWidth: 0,
		borderBottomWidth: 2,
		borderStyle: 'solid',
		borderColor: colors.blue,
		height: '30px',
		lineHeight: '36px',
		fontFamily: 'Lato',
		display: 'block',
		background: 'transparent',
		fontSize: 13,
		outline: 'none',
		//marginLeft: 20,
		marginRight: 10,
		paddingRight: 20,
	},
	'suggests': {
		// width: '100%',
		width: 300,
		position: 'absolute',
		backgroundColor: colors.white,

		boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
		border: '2px solid rgba(94,159,223,0.83)',
		padding: 20,
		zIndex: 100,
	},
	'suggests--hidden': {
		width: '0',
		display: 'none',
	},
	'suggestItem': {
		paddingTop: 10,
		paddingBottom: 10,
		color: '#515151',
		fontSize: 18,
		fontWeight: 500,
		fontFamily: 'Helvetica Neue',
	},

};

modalStyles = {
  overlay : {
    position          : 'fixed',
    top               : 0,
    left              : 0,
    right             : 0,
    bottom            : 0,
    backgroundColor   : 'rgba(255, 255, 255, 0.75)',
    zIndex: 101
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
    borderRadius               : '4px',
	  overflow                   : 'auto',
    outline                    : 'none',
    padding                    : '20px',
	  maxWidth                   : '95%',
	  maxHeight                  : '95%',
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
    zIndex: 101
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
    borderRadius               : '4px',
	  overflow                   : 'auto',
    outline                    : 'none',
    padding                    : '20px',
	  maxWidth                   : '95%',
	  maxHeight                  : '95%',
  },
}

styles = {
	row: {
		display: 'flex',
		alignItems: 'center',
		width: '100%',
		borderBottom: '1px solid',
	},
	chip: {
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'space-between',
	},
	detailsButton: {
		color: colors.gray,
		fontFamily: 'lato',
		fontSize: 14,
		marginRight: 10,
		cursor: 'pointer'
	},
	customStyle: {
		fontSize: 13,
		width: 160,
	},
	customStyleSport: {
		fontSize: 13,
		width: 160,
	},
	customStyleSportPosition: {
		position:'relative',
		top:'3px',
	},
	sportSelectStyle: {
		fontSize:13,
	},
	inputContainer: {
		width: 'auto',
	},
	avatar: {
		width: 39,
		height: 39,
		marginRight: 10,
		color: colors.blue,
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat',
		borderRadius: '50%',
	},
	listItemClickable: {
		paddingBottom: 10,
		color: '#515151',
		fontSize: 20,
		fontWeight: 500,
		fontFamily: 'Lato',
		borderBottomWidth: 1,
		borderColor: colors.blue,
		borderStyle: 'solid',
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'center',
		marginBottom: 5,
		cursor: 'pointer'
	},
	autocompletion_dropdown: {
		position: 'absolute',
		left: 0,

		width: '90%',
		marginLeft: '5%',
		maxHeight: 220,

		backgroundColor: colors.white,

		boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
		border: '2px solid rgba(94,159,223,0.83)',
		padding: 20,

		overflowY: 'scroll',
		overflowX: 'hidden',

		bottom: 70,

		zIndex: 100,
	},
	addContainer: {
		display: 'flex',
		justifyContent: 'center',
		marginTop: 20,
		fontFamily: 'Lato'
	},
	listItem: {
		overflow: 'auto',
		maxHeight: 400,
	},
	textLabel: {
		display: 'flex',
		justifyContent: 'center',
		fontSize: fonts.size.large,
		fontFamily: 'lato',
		margin: 10,
		fontWeight: fonts.weight.large,
		color: '#212121',
		fontSize: 20
	},
	listContainer: {
		display: 'flex',
		flexDirection: 'row',
	},
	invitedList: {
		padding: 10,
		border: '1px solid ' + colors.gray,
		width: 'calc(100%/3)'
	},
	label: {
		fontSize: 16,
		margin: 10,
		color: '#5e9fdf',
		fontFamily: 'Lato',
		/*flex: 1,
		display: 'flex',
		justifyContent: 'flex-end'*/
	},
	wrapper: {
		display: 'flex',
		flexDirection: 'row',
		marginBottom: 10,
		marginRight: 10,
		justifyContent: 'flex-start',
		maxWidth: 350,
		alignItems: 'center'
	},
	customWrapperGeosuggest:{
    justifyContent: 'center',
	},
	filterRow: {
		display: 'flex',
		flexDirection: 'row',
		flexWrap: 'wrap',
		width: '100%',
		justifyContent: 'center',
	},
    container: {
        display: 'flex',
        alignItems: 'center',
        flexGrow: 1,
        justifyContent: 'space-between',
        fontFamily: 'Lato',
        lineHeight: 1,
        '@media (max-width: 500px)': {
            display: 'block',
        }
    },
    modalContent: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        width: '100%',
        '@media (max-width: 400px)': {
            width: '100%',
        }
    },
    modalHeader: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-center',
        justifyContent: 'space-between',
    },
    modalTitle: {
        fontFamily: 'Lato',
        fontSize:20,
        fontWeight: fonts.weight.medium,
			  color: '#212121',
        flex: '2 0 0',
    },
    modalClose: {
        justifyContent: 'flex-center',
        color: colors.gray,
        cursor: 'pointer',
    },
    buttonRow: {
        display: 'flex',
        justifyContent: 'space-between'
    },
    greenButton: {
        backgroundColor: colors.green,
        boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
        borderRadius: '3px',
        display: 'inline-block',
        fontFamily: 'Lato',
        fontSize: '22px',
        textAlign: 'center',
        color: colors.white,
        borderWidth: 0,
        marginTop: 10,
        marginBottom: 10,
        cursor: 'pointer',
        lineHeight: '27px',
        padding: '10px 20px'
    },
    redButton: {
		backgroundColor: colors.redGoogle,
		boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
		borderRadius: '3px',
        display: 'inline-block',
        fontFamily: 'Lato',
        fontSize: '22px',
        textAlign: 'center',
        color: colors.white,
        borderWidth: 0,
        marginTop: 10,
        marginBottom: 10,
        cursor: 'pointer',
        lineHeight: '27px',
        padding: '10px 20px'
    },
    confirm: {
        color: colors.black,
        fontSize: 16,
        fontFamily: 'Lato',
        marginTop:20,
        marginBottom: 10,
    },
};

const dispatchToProps = (dispatch) => ({
})
  
const stateToProps = (state) => ({
})

let ReduxContainer = connect(
    stateToProps,
    dispatchToProps
)(Radium(SummoningModal));

export default createRefetchContainer(ReduxContainer,{
//OK
    viewer: graphql`
  fragment SummoningModal_viewer on Viewer @argumentDefinitions(
		pseudo_autocomplete: {type: "String", defaultValue: "_"},
		autocompletion_required: {type: "Boolean!", defaultValue: false},
		firstMyCircle: {type: "Int", defaultValue: 5},
		firstPublicCircle: {type: "Int", defaultValue: 5},
		sportNb: {type: "Int", defaultValue: 10},
		filterSport: {type: "SportFilter", defaultValue: null},
		filterCircle: {type: "CirclesFilter"},
		query: {type: "Boolean!", defaultValue: false},
		queryFromClub: {type: "Boolean!", defaultValue: false},
		queryLanguage: {type: "SupportedLanguage", defaultValue: "EN"}
		){
    ...SummoningInvitedList_viewer
    ...NewCircle_viewer
    ...OwnerSelect_viewer
            users (pseudo: $pseudo_autocomplete, first: 10, userType: PERSON) @include(if: $autocompletion_required) {
                edges {
                    node {
                        id
                        pseudo
                        avatar
                    }
                }
            }
    me {
      profileType
      circles (first: $firstMyCircle, filter: $filterCircle) @include(if: $query) {
        edges {
          node {
            ...CircleItem_circle
            id
            name
            mode
            isCircleUpdatableByMembers
            isCircleUsableByMembers
            memberStatus {
              starting_date
              member {
                id
                pseudo
              }
              status
            }
            owner {
              id
              pseudo
              avatar
            }
            memberCount
            members {
              id
              pseudo
            }
            type
          }
        }
        count
      }
      circlesFromClub (first: $firstMyCircle, filter: $filterCircle) @include(if: $queryFromClub) {
        edges {
          node {
            ...CircleItem_circle
            id
            name
            mode
            isCircleUpdatableByMembers
            isCircleUsableByMembers
            memberStatus {
              starting_date
              member {
                id
                pseudo
              }
              status
            }
            owner {
              id
              pseudo
              avatar
            }
            memberCount
            members {
              id
              pseudo
            }
            type
          }
        }
        count
      }
      circlesUserIsIn (first: $firstMyCircle, filter: $filterCircle) @include(if: $query) {
        edges {
          node {
            ...CircleItem_circle
            id
            name
            mode
            isCircleUpdatableByMembers
            isCircleUsableByMembers
            memberStatus {
              starting_date
              member {
                id
                pseudo
              }
              status
            }
            owner {
              id
              pseudo
              avatar
            }
            memberCount
            members {
              id
              pseudo
            }
            type
          }
        }
        count
      }
    } 
    ownersOfCirclesUserIsIn (first: 100) @include(if: $query) {
      edges {
        node {
          id
          pseudo
          avatar
        }
      }
      count
    }
    circles (first: $firstPublicCircle, filter: $filterCircle) @include(if: $query) {
      edges {
        node {
          ...CircleItem_circle
          id
          name
          mode
          isCircleUpdatableByMembers
          isCircleUsableByMembers
          memberStatus {
              starting_date
              member {
                id
                pseudo
              }
              status
          }
          owner {
              id
              pseudo
              avatar
          }
          memberCount
          members {
              id
              pseudo
          }
          type
        }
      }
      count
    }
    summoningModalSports: sports(first: $sportNb, filter: $filterSport, language: $queryLanguage) {
      count
      edges {
        node {
          id
          name {
            EN
            FR
            DE
          }
          logo
          levels {
            id
            EN {
              name
              skillLevel
              description
            }
            FR {
              name
              skillLevel
              description
            }
            DE {
              name
              skillLevel
              description
            }
          }
        }
      }
    }
  }
`,
},
graphql`
query SummoningModalRefetchQuery(
	$pseudo: String
	$email: String
	$pseudo_autocomplete: String
	$autocompletion_required: Boolean!
	$firstMyCircle: Int
	$firstPublicCircle: Int
	$sportNb: Int
	$filterSport: SportFilter
	$filterCircle: CirclesFilter
	$query: Boolean!
	$queryFromClub: Boolean!
	$queryLanguage: SupportedLanguage
) {
viewer {
    ...SummoningModal_viewer
    @arguments(
			pseudo: $pseudo
			email: $email
			pseudo_autocomplete: $pseudo_autocomplete
			autocompletion_required: $autocompletion_required
			firstMyCircle: $firstMyCircle
			firstPublicCircle: $firstPublicCircle
			sportNb: $sportNb
			filterSport: $filterSport
			filterCircle: $filterCircle
			query: $query
			queryFromClub: $queryFromClub
      queryLanguage: $queryLanguage
    )
}
}
`,
);
