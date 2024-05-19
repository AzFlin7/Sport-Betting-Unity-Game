import React from 'react'
import {createRefetchContainer, graphql} from "react-relay";
import Paper from '@material-ui/core/Paper';
import { connect } from 'react-redux';
import { fonts, colors } from '../../theme'
import Radium, {StyleRoot} from 'radium'
import Geosuggest from 'react-geosuggest'
import Select from "react-select";

import localizations from '../Localizations'
import CircleSelect from "./CircleSelect";
import ChipsArray from "./ChipsArray";
// import SportSelect from "./SportSelect";
import SportSelect from '../common/Inputs/SportSelect';
import CircleSuggestion from "./CircleSuggestion";
import NewCircle from './NewCircle'
import CircleItem from "./CircleItem";
import OwnerSelect from "./OwnerSelect";
import Switch from "../common/Switch";

let styles, modalStyles, cantCloseModalStyles;

class SummonGroups extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
	    type: null,
	    sport: null,
	    location: null,
	    name: '',
	    myCircleNb: 5,
	    publicCircleNb: 5,
	    myCircleFullListVisible: false,
	    publicCircleFullListVisible: false,
	    isNewCircleOpen: false,
	    selectedOwners: [],
	    seeCirclesFromOtherTeams: false
    }
  }


  componentDidMount() {
    this.props.relay.refetch(fragmentVariables => ({
			...fragmentVariables,
			query: true,
		}),
		null,
		() => setTimeout(() => this.setState({isLoading: false}), 50)
		)
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
		}, this._updateCircleFilter)
	};

	_locationSelected = (location) => {
		this.setState({
			location: location
		}, this._updateCircleFilter)
	}

	_onSearchName = (e, callBack) => {
		this.setState({
			name: e,
		}, () => this._updateCircleFilter(callBack));
	};

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
    let typeList = [{key: 'ADULTS', name: localizations.circles_member_type_0},
      {key: 'CHILDREN', name: localizations.circles_member_type_1},
      {key: 'TEAMS', name: localizations.circles_member_type_2},
      {key: 'CLUBS', name: localizations.circles_member_type_3},
      {key: 'COMPANIES', name: localizations.circles_member_type_4},
		];
		
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
						<div style={styles.chip}>
							<div>
								<ChipsArray
									chipData={this.props.invitedCircles.map((item, index) => ({
										key: item.circle.id,
										label: item.circle.name,
										id: item.circle.id
									}))}
									onDelete={this.props.onRemoveInvitedCircle}
								/>
							</div>
								
							<Paper style={{...styles.wrapper, width: 250}}>
								<CircleSuggestion
									suggestion={(this.props.viewer.circles) ? this.props.viewer.circles.edges : []}
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
									viewer={this.props.viewer}
					        label={localizations.find_sport}
					        onChange={this._updateSport}
								  value={this.state.sport ? this.state.sport.name : ''}
								  stylesCustom={styles.customStyleSport}								  
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
	userCountry: state.globalReducer.userCountry,
  userLocation: state.globalReducer.userLocation
})

let ReduxContainer = connect(
    stateToProps,
    dispatchToProps
)(Radium(SummonGroups));

export default createRefetchContainer(ReduxContainer,{
		viewer: graphql`
      fragment SummonGroups_viewer on Viewer @argumentDefinitions (
				pseudo_autocomplete: {type: "String", defaultValue: "_"},
				autocompletion_required: {type: "Boolean!", defaultValue: false},
				firstMyCircle: {type: "Int", defaultValue: 5},
				firstPublicCircle: {type: "Int", defaultValue: 5},
				filterCircle: {type: "CirclesFilter", defaultValue: null},
				query: {type: "Boolean!", defaultValue: false},
				queryFromClub: {type: "Boolean!", defaultValue: false},
			) {
        ...NewCircle_viewer
				...OwnerSelect_viewer
				...SportSelect_viewer
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
      }
    `,
	},
	graphql`query SummonGroupsRefetchQuery (
		$pseudo_autocomplete: String,
		$autocompletion_required: Boolean!,
		$firstMyCircle: Int,
		$firstPublicCircle: Int,
		$filterCircle: CirclesFilter,
		$query: Boolean!,
		$queryFromClub: Boolean!,
	) {
		viewer {
			...SummonGroups_viewer @arguments(
				pseudo_autocomplete: $pseudo_autocomplete,
				autocompletion_required: $autocompletion_required,
				firstMyCircle: $firstMyCircle,
				firstPublicCircle: $firstPublicCircle,
				filterCircle: $filterCircle,
				query: $query,
				queryFromClub: $queryFromClub,
			)
		}
	}`
);