import React, {Component} from 'react';
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import debounce from 'lodash.debounce'
import ToggleDisplay from 'react-toggle-display'
import {appStyles, colors, fonts} from '../../theme'
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {withRouter} from 'found'
import * as types from '../../actions/actionTypes.js';
import Modal from 'react-modal'
import SportList from './SportList'
import Submit from './Submit'
import Photo from './Photo'
import localizations from '../Localizations'

import Radium from 'radium'
import Input from "./Input";
import Select from "react-select";
import SelectCircle from "./SelectCircle";

let modalStyles
let styles

class NewFacility extends Component {

  constructor(props) {
    super(props)
    this.state = {
      modalIsOpen: false,
      isError: false,
      errorMessages: [],
      inputContent: '',
      userAutocompletionListIsOpen: false,
      circleSelected: '',
      managers: [],
	    query: false
    };
    this._onDebounceChangeSportFilter = debounce(this._onDebounceChangeSportFilter, 400);
	}

	_onDebounceChangeSportFilter = (name) => {
		let filter = {
        name: name,
        language: 'EN',
      }

    this.props.relay.refetch(fragmentVariables => ({
      ...fragmentVariables, 
      filter: filter,
    }))
	}
 
  openModal = () => {
		this.props._resetFacilityAction()
		this.setState({ modalIsOpen: true })
  }
 
  afterOpenModal = () => {
    // references are now sync'd and can be accessed. 
    //this.refs.subtitle.style.color = '#f00';
  }
 
  _closeModal = () => {
    this.setState({ modalIsOpen: false })
  }

  _onNameChanged = (event) => {
    this.props.onNameChanged(event.target.value)
  }

  _validateInput = () => {
    let valid = true
    let errorMessages = []
    if(!this.props.facilityName) {
      valid = false
      errorMessages.push(localizations.manageVenue_facility_name_error)
    }
    
    if(this.props.sports.length == 0) {
      valid = false
      errorMessages.push(localizations.manageVenue_facility_sport_error)
    }

    this.setState({
      isError: !valid,
      errorMessages: errorMessages,
    })
    return valid
  }

  _onSave = () => {
    if (this._validateInput()) {
      this.props.onAddFacility()
      this._closeModal()
			this.props.router.push('/facility/' + this.props.venueId);
    }
  }

  _changeSportFilter = (name) => {
    this._onDebounceChangeSportFilter(name)
  }

	componentDidMount = () => {
		if (this.props.infrastructure) {
			this.props._setFacilityAction(
				this.props.infrastructure.name,
				this.props.infrastructure.id,
				[])
		} else {
			this.props._resetFacilityAction()
    }

    this.props.relay.refetch(fragmentVariables => ({
      ...fragmentVariables,
      queryLanguage: localizations.getLanguage().toUpperCase()
    }))
		this.setState({query: true});
  };

	componentWillReceiveProps = (nextProps) => {
		if (this.state.query) {
			this.setState({query: false});
			this._addUserManager(this.props.viewer.me)
			if (this.props.viewer.me.subAccounts && this.props.viewer.me.subAccounts.length > 0)
				this.props.viewer.me.subAccounts.forEach(subAccount => {
					setTimeout(this._addUserManager(subAccount), 200)
				})
		}
	};

  _handleAutocompleteClicked = (user) => {
    this.setState({
      inputContent: user.pseudo,
      selectedUserId: user.id,
	    userAutocompletionListIsOpen: false
    }, () => {
      this._addUserManager(user);
      setTimeout(() => {
        this.props.relay.refetch(fragmentVariables => ({
          ...fragmentVariables,
          autocompletion_required: false,
          pseudo_autocomplete: '_'
        }));
      }, 400);
    })

  };

  _addUserManager = user => {
    if (this.state.managers.findIndex(el => el.id === user.id) < 0) {
      this.state.managers.push({name: user.pseudo, id: user.id, isCircle: false})
      this.props.onAddManager({user: user.id, circle: null, authorization_level: 'FULL_CONSUMER'})
    }
  }

  _addCircleManager = circle => {
    console.log(circle)
    let tmpCircle = circle.value ? circle.value : circle
    if (this.state.managers.findIndex(el => el.id === tmpCircle.id)) {
      this.state.managers.push({name: tmpCircle.name, id: tmpCircle.id, isCircle: true})
      this.props.onAddManager({user: null, circle: tmpCircle.id, authorization_level: 'FULL_CONSUMER'})
    }
  }

  _removeManager = manager => {
    this.setState({
      managers: this.state.managers.filter(el => el.id !== manager.id)
    });
    this.props.onDeleteManager({user: manager.isCircle ? null : manager.id, circle: manager.isCircle ? manager.id : null, authorization_level: 'FULL_CONSUMER'})
  }

  _handleInputChange = event => {
  	let value = event.target ? event.target.value : event
    this.setState({
      inputContent: value,
      selectedUserId: ''
    });
    if (value.length)
      this.setState({
        userAutocompletionListIsOpen: true,
      })
    if (value.length > 1) {
      this.props.relay.refetch(fragmentVariables => ({
        ...fragmentVariables,
        autocompletion_required: true,
        pseudo_autocomplete: value
      }))
    }
    else {
      this.props.relay.refetch(fragmentVariables => ({
        ...fragmentVariables,
        autocompletion_required: false,
        pseudo_autocomplete: '_'
      }))
    }
  };

  _handleInputCircleChange = event => {
    if (event.target.value.length > 0) {
      this.props.relay.refetch(fragmentVariables => ({
        ...fragmentVariables,
        autocompletion_required: true,
	      filterCircle: {
		      nameCompletion: event.target.value
        }
      }))
    }
    else {
      this.props.relay.refetch(fragmentVariables => ({
        ...fragmentVariables,
        autocompletion_required: false,
	      filterCircle: {
		      nameCompletion: '_'
	      }
      }))
    }
  };

  _changeCircle = (value) => {
    let name = value.node ? value.node.name : value;
    this.setState({
      circleSelected: name
    })
  };

	_onOpenAutoList = () => {
		this.setState({
			userAutocompletionListIsOpen: true,
		})
		this.props.relay.refetch(fragmentVariables => ({
      ...fragmentVariables, 
			autocompletion_required: true,
			pseudo_autocomplete: '',
		}))
	};

	_onCloseAutoList = () => {
		this.setState({
			userAutocompletionListIsOpen: false,
		})
		this.props.relay.refetch(fragmentVariables => ({
      ...fragmentVariables, 
			autocompletion_required: false,
			pseudo_autocomplete: '_',
		}))
	};

	_toggleAutoList = () => {
		if (this.state.userAutocompletionListIsOpen)
			this._onCloseAutoList();
		else
			this._onOpenAutoList();
	}

  render() {
    const { viewer } = this.props;

    let userList = viewer.me.allCircleMembers.map(user => user.user).filter(user => user.pseudo.match(this.state.inputContent));
    if (viewer.users && viewer.users.edges)
	    userList = userList.concat(viewer.users.edges.map(user => user.node));

	  const triangleStyle = this.state.userAutocompletionListIsOpen ? styles.triangleOpen : styles.triangle ;
	  const finalTriangleStyle = {
		  ...triangleStyle,
		  borderTopColor: this.state.userAutocompletionListIsOpen ? colors.green : colors.blue,
		  top: 33
	  };

    return (
        <div>
					<div onClick={this.openModal} style={Object.assign({}, styles.button, styles.buttonNew)}>
            <div style={styles.buttonText}>{localizations.manageVenue_newFacility}</div>
            <div style={styles.buttonIcon}>
              <i className="fa fa-plus fa-align-right" />
            </div>
          </div>

          <Modal
            isOpen={this.state.modalIsOpen}
            onAfterOpen={this.afterOpenModal}
            onRequestClose={this.closeModal}
            style={modalStyles}
            contentLabel={localizations.manageVenue_newFacility}
          >
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <div style={styles.modalTitle}>{localizations.manageVenue_newFacility}</div>
                <div style={styles.modalClose} onClick={this._closeModal}>
                  {localizations.manageVenue_close} <i className="fa fa-times" />
                </div>
              </div>
	            <div style={styles.content}>
		            <div style={styles.modalBody}>
			            <div style={styles.firstColumn}>
				            <div style={styles.inputHeader}>{localizations.manageVenue_facilityDetails}</div>
				            <div style={appStyles.inputLabel}>{localizations.manageVenue_facilityName}</div>
				            <input
					            style={appStyles.input}
					            type='"text'
					            placeholder={localizations.manageVenue_facilityName_placeholder}
					            value={this.props.facilityName}
					            onChange={this._onNameChanged}
				            />

				            <Photo avatar={viewer.me.avatar} />
			            </div>
			            <div style={styles.lastColumn}>
				            <SportList
					            allSports={viewer.sports}
					            onChangeFilter={this._changeSportFilter}
					            {...this.props}/>
			            </div>
		            </div>

		            <div style={{...styles.modalTitle, paddingTop: 20, paddingBottom: 20, marginTop: 20, borderTop: '1px solid #0003'}}>
			            {localizations.manageVenue_rule}
		            </div>
		            <div style={styles.rule}>
			            <div ref={node => { this._autocompletionList = node; }} style={{position: 'relative'}}>
				            {
					            this.state.inputContent && !this.state.userAutocompletionListIsOpen
						            ? <span onClick={() => this._handleInputChange('')} style={{...styles.closeCross, top: 30}}>
							            <i className="fa fa-times" style={styles.cancelIcon} aria-hidden="true"></i>
						            </span>
						            : <span style={finalTriangleStyle} onClick={this._toggleAutoList}/>
				            }
				            <Input
					            containerStyle={{ marginBottom: 20, }}
					            label={localizations.manageVenue_add_manager_person_label}
					            ref={node => { this._inputNode = node }}
					            placeholder={localizations.manageVenue_add_manager_person_holder}
					            value={this.state.inputContent}
					            onChange={this._handleInputChange}
					            onKeyPress={this.handleKeyPress}
					            onClick={this._toggleAutoList}
				            />
				            {
					            this.state.userAutocompletionListIsOpen && (userList.length > 0) &&
					            <div style={styles.autocompletion_dropdown} >
						            <ul style={styles.list}>
							            {
								            userList.map((el, index) => {
									            return (<li
										            key={index}
										            style={styles.listItemClickable}
										            onClick={() => this._handleAutocompleteClicked(el)}
									            >
										            <div style={{ ...styles.avatar, backgroundImage: `url(${el.avatar})` }} />
										            {el.pseudo}
									            </li>)
								            })
							            }
						            </ul>
					            </div>
				            }
			            </div>
			            <div ref={node => { this._autocompletionCircleList = node; }}>
				            <SelectCircle
					            label={localizations.manageVenue_add_manager_circle_label}
					            list={[]
						            .concat(viewer.me.circles.edges, viewer.circles && viewer.circles.edges ? viewer.circles.edges : [])
						            .filter(el => this.state.managers && this.state.managers.filter(circle => circle.isCircle).findIndex(invitedCircle => invitedCircle.id === el.node.id) < 0)
						            .map(el => el.node)
					            }
					            onChange={(circle) => {this._addCircleManager(circle) }}
					            onSearch={(input) => this._handleInputCircleChange(input)}
					            placeholder={localizations.manageVenue_add_manager_circle_holder}
					            term={null}
					            allowAutocompletion={true}
				            />
			            </div>
		            </div>
		            <div style={{...styles.modalTitle, paddingTop: 20, paddingBottom: 20, marginTop: 20, borderTop: '1px solid #0003'}}>
			            {localizations.manageVenue_haveRuleOnVenue}
		            </div>
		            <div>
			            <ul style={{display: 'flex', flexWrap: 'wrap', maxHeight: 95, overflowY: 'scroll'}}>
				            {this.state.managers.map((manager, index) => (
					            <li key={index} style={styles.itemManager}>
						            {manager.name}
						            <i
							            className='fa fa-times-circle'
							            style={{paddingLeft: 10, fontSize: 18, color: colors.blue}}
							            onClick={() => {this._removeManager(manager)}}
						            />
					            </li>
				            ))}
			            </ul>
		            </div>
		            <ToggleDisplay show={this.state.isError}>
			            { this.state.errorMessages.map(errorMessage =>
				            <label style={styles.error}>{errorMessage}</label>
			            )}
		            </ToggleDisplay>
		            <Submit validateInput={this._validateInput} viewer={viewer} onClose={this._closeModal}/>
	            </div>
            </div>
          </Modal>
        </div>
    );
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
		padding                    : '30px',
		maxHeight                  : '100%'
	},
};

const stateToProps = (state) => ({
  venueId: state.facilityReducer.venueId,
  facilities: state.facilityReducer.facilities,
  facilityName: state.facilityReducer.facilityName,
  sports: state.facilityReducer.sports,
  authorizedManagers: state.facilityReducer.authorizedManagers
});

const _resetFacilityAction = () => ({
  type: types.FACILITY_RESET_FACILITY,
})

const _setFacilityAction = (facilityName, facilityId, sports, photo, authorizedManagers) => ({
  type: types.FACILITY_SET_FACILITY,
  facilityName: facilityName,
  facilityId: facilityId,
  sports: sports,
  authorizedManagers: authorizedManagers,
})

const dispatchToProps = (dispatch) => ({
  _resetFacilityAction: bindActionCreators(_resetFacilityAction, dispatch),
	_setFacilityAction: bindActionCreators(_setFacilityAction, dispatch),
});

const ReduxContainer = connect(
  stateToProps,
	dispatchToProps
)(Radium(NewFacility));

export default createRefetchContainer(Radium(withRouter(ReduxContainer)), {
  viewer: graphql`
    fragment NewFacility_viewer on Viewer @argumentDefinitions(
      filterCircle: {type: "CirclesFilter"},
      autocompletion_required: {type: "Boolean!", defaultValue: false},
      pseudo_autocomplete: {type: "String"},
      venueId: {type: "ID", defaultValue: null},
      filter: {type: "SportFilter"},
      queryLanguage: {type: "SupportedLanguage"}
    ){
      id,
      me {
        id,
        pseudo
        subAccounts {
          id
          pseudo
        }
        circles (last: 100) {
          edges {
            node {
              id
                name
              memberCount
            }
          }
        }
          allCircleMembers {
          user {
            id
            pseudo
            avatar
          }
        }
      }
      circles (filter: $filterCircle, first: 5) @include(if: $autocompletion_required) {
        edges {
          node {
            id
              name
            memberCount
            type
          }
        }
      }
      users (pseudo: $pseudo_autocomplete, first: 10) @include(if: $autocompletion_required) {
        edges {
          node {
            id
            pseudo
            avatar
          }
        }
      }
      sports(first: 10, filter:$filter, language: $queryLanguage) {
        ...SportList_allSports
      }
    }
  `,
  venue: graphql`
    fragment NewFacility_venue on Venue {
      id
      infrastructures {
        sport {
          ...SportList_sports
        }
        authorized_managers {
          user {
            id
            pseudo
          }
          circle {
            id
            name
          }
        }
      }
    }
  `
}, graphql`
  query NewFacilityRefetchQuery (
    $filterCircle: CirclesFilter,
    $autocompletion_required: Boolean!,
    $pseudo_autocomplete: String,
    $venueId: ID,
    $filter: SportFilter,
    $queryLanguage: SupportedLanguage
  ) {
    viewer {
      ...NewFacility_viewer @arguments(
        filterCircle: $filterCircle,
        autocompletion_required: $autocompletion_required,
        pseudo_autocomplete: $pseudo_autocomplete,
        venueId: $venueId,
        filter: $filter,
        queryLanguage: $queryLanguage,
      )
    }
  }
`)

styles = {
	triangle: {
		position: 'absolute',
		right: 0,
		width: 0,
		height: 0,

		transition: 'border 100ms',
		transitionOrigin: 'left',

		color: colors.blue,

		cursor: 'pointer',

		borderLeft: '8px solid transparent',
		borderRight: '8px solid transparent',
		borderTop: `8px solid ${colors.blue}`,
	},

	triangleOpen: {
		position: 'absolute',
		right: 0,
		width: 0,
		height: 0,

		transition: 'border 100ms',
		transitionOrigin: 'left',

		color: colors.blue,

		cursor: 'pointer',

		borderLeft: '8px solid transparent',
		borderRight: '8px solid transparent',
		borderBottom: `8px solid ${colors.blue}`,
	},

	closeCross: {
		position: 'absolute',
		right: 0,
		width: 0,
		height: 0,
		color: colors.gray,
		marginRight: '15px',
		cursor: 'pointer',
		fontSize: '16px',
	},

	cancelIcon: {
		marginRight: 15,
	},
	content: {
		overflowY: 'auto',
		maxHeight: '100%',
	},
  itemManager: {
    display: 'flex',
    fontFamily: 'lato',
    fontSize: 18,
    padding: 10,
    margin: 10,
    borderRadius: 10,
    border: '2px solid #0002'
  },
  rule: {
    display: 'flex',
    flexDirection: 'row',
    margin: 10,
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  ruleSelect: {
    padding: 10
  },
  circleSelectContainer: {
    fontFamily: 'lato',
    fontSize: 18,
    minWidth: 200,
    borderBottom: '2px solid #5E9FDF',
    borderLeft: 'none',
    borderRight: 'none',
    borderTop: 'none',
    borderRadius: 0,
    marginBottom: 10
  },
  circleSelectMenu: {
    fontFamily: 'lato',
    fontSize: 18,
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

    zIndex: 100,
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
  label: {
    display: 'block',
    color: colors.blueLight,
    fontSize: 16,
    lineHeight: 1,
    marginBottom: 8,
    flex: 1,
    fontFamily: 'lato'
  },
  listItem: {
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
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 5
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
  modalContent: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'flex-start',
    // maxHeight: '500px', // <-- This sets the height
    overlfow: 'scroll', // <-- This tells the modal to scrol
	},
	modalHeader: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'flex-center',
		justifyContent: 'flex-center',
    marginBottom: 15,
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
		flexDirection: 'row',
		justifyContent: 'flex-start',
  },
  firstColumn: {
    display: 'flex',
		flexDirection: 'column',
		justifyContent: 'flex-start',
    paddingRight: 10,
    flex: '1 0 0',
  },
  lastColumn: {
    display: 'flex',
		flexDirection: 'column',
		justifyContent: 'flex-start',
    paddingLeft: 10,
    flex: '1 0 0',
    alignItems: 'flex-start',
  },
  greenButton: {
		width: '800px',
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
    paddingTop: 10,
    paddingBottom: 10,
  },
  inputHeader: {
    fontFamily: 'Lato',
		fontSize:24,
		fontWeight: fonts.weight.medium,
		color: colors.blue,
		marginBottom: 10,
		marginTop: 20,
  },
  pictureWrapper: {
    display: 'flex',
    flexDirection: 'row',
		justifyContent: 'flex-start',
  },
  picture: {
    backgroundColor: '#D8D8D8',
    borderRadius: '4px',
    display: 'flex',
    width: 100,
    height: 100,
    marginRight: 15,

  },
	
  buttonNew: {
		color: colors.blue,
	},
	buttonItem: {
		color: colors.black,
	},
  blueButton: {
    display: 'flex',
    marginRight: 'auto',
    backgroundColor: colors.blue,
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    borderRadius: '3px',
    fontFamily: 'Lato',
    fontSize: '18px',
    textAlign: 'center',
    color: colors.white,
    borderWidth: 0,
    padding: '10px 15px 10px 15px',
    cursor: 'pointer',
    height: 38,
  },
	button: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'flex-center',
		alignItems: 'flex-center',
		width: 500,
		height: 70,
		backgroundColor: colors.white,
		boxShadow: '0 0 4px 0 rgba(0,0,0,0.12)',
		border: '1px solid #E7E7E7',
		borderRadius: 4,
		fontFamily: 'Lato',
		fontSize: 28,
		lineHeight: '42px',
		cursor: 'pointer',
		paddingLeft: 20,
		paddingRight:20,
		paddingTop: 14,
		marginTop: '20px',
		//lineHeight: 34,
    '@media (max-width: 730px)': {
      width: '300px',
      fontSize: '20px',
    },
	},
	buttonText: {
		flex: '2 0 0',
		textDecoration: 'none',
	},
	buttonIcon: {
		color: colors.blue,
	},
	buttonLink: {
		color: colors.black,
		textDecoration: 'none',
	},
  error: {
    display: 'flex',
    justifyContent: 'flex-center',
		alignItems: 'flex-center',
    color: colors.error,
    lineHeight: '30px',
    fontFamily: 'Lato',
    fontSize: 18,
  },
}