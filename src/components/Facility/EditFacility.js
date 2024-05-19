import React, { Component } from 'react';
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import styles from './styles'
import Modal from 'react-modal'
import { appStyles, colors } from '../../theme'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as types from '../../actions/actionTypes.js';

import Radium from 'radium'

import SportList from './SportList'
import ToggleDisplay from 'react-toggle-display'
import Delete from './Delete';
import Submit from './Submit'
import debounce from 'lodash.debounce'
import Photo from './Photo'
import localizations from '../Localizations'
import Input from "./Input";
import Select from  'react-select'
import SelectCircle from "./SelectCircle";

const customStyles = {
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

let style

class EditFacility extends Component {

  
  constructor(props) {
    super(props)
    this.state = {
      modalIsOpen: false,
      isError: false,
      errorMessages: [],
      inputContent: '',
      userAutocompletionListIsOpen: false,
      circleSelected: '',
      managers: []
    }
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
		this.props._setFacilityAction(
			this.props.infrastructure.name,
			this.props.infrastructure.id,
			this.props.infrastructure.sport.map(sport => { return { node: sport }}),
      this.props.infrastructure.logo,
      this.props.infrastructure.authorized_managers)

    let tmpManagers = [];
		if (this.props.infrastructure.authorized_managers)
      this.props.infrastructure.authorized_managers.forEach(manager => {
        if (manager.user !== null)
          tmpManagers.push({name: manager.user.pseudo, id: manager.user.id, isCircle: false})
        else if (manager.circle !== null)
          tmpManagers.push({name: manager.circle.name, id: manager.circle.id, isCircle: true})
      });
		this.setState({
      managers: tmpManagers,
      modalIsOpen: true
		});
  }
 
  afterOpenModal = () => {
    // references are now sync'd and can be accessed. 
    //this.refs.subtitle.style.color = '#f00';
  }
 
  _closeModal = () => {
    this.setState({ modalIsOpen: false });
		
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

    if(this.props.sports.length === 0) {
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
    }
  }

  _changeSportFilter = (name) => {
    this._onDebounceChangeSportFilter(name)
  }

	componentDidMount = () => {
    this.props.relay.refetch(fragmentVariables => ({
      ...fragmentVariables,
      queryLanguage: localizations.getLanguage().toUpperCase()
    }))
	}

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
    if (this.state.managers.findIndex(el => el.id === user.id)) {
      this.state.managers.push({name: user.pseudo, id: user.id, isCircle: false})
      this.props.onAddManager({user: user.id, circle: null, authorization_level: 'FULL_CONSUMER'})
    }
  }

  _addCircleManager = circle => {
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
	  if (viewer.users && viewer.users.edges) {
		  userList = userList.concat(viewer.users.edges.map(user => user.node));
	  }

	  const triangleStyle = this.state.userAutocompletionListIsOpen ? styles.triangleOpen : styles.triangle ;
	  const finalTriangleStyle = {
		  ...triangleStyle,
		  borderTopColor: this.state.userAutocompletionListIsOpen ? colors.green : colors.blue,
		  top: 33
	  };

	  return (
        <div>
					<div onClick={this.openModal} style={Object.assign({}, styles.button, styles.buttonItem)}>
            <div style={styles.buttonText}>{this.props.children}</div>
            <div style={styles.buttonIcon}>
              <i className="fa fa-chevron-right fa-align-right" />
            </div>
          </div>
					
          <Modal
            isOpen={this.state.modalIsOpen}
            onAfterOpen={this.afterOpenModal}
            onRequestClose={this.closeModal}
            style={customStyles}
            contentLabel={localizations.manageVenue_editFacility}
          >
						<div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <div style={styles.modalTitle}>{localizations.manageVenue_editFacility}</div>
                <div style={styles.modalClose} onClick={this._closeModal} >
                  {localizations.manageVenue_close} <i className="fa fa-times" />
                </div>
              </div>
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
                  <Photo />
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
                          userList.map((el, index) => (<li
                              key={index}
                              style={styles.listItemClickable}
                              onClick={() => {this._handleAutocompleteClicked(el)}}
                            >
                              <div style={{ ...styles.avatar, backgroundImage: `url(${el.avatar})` }} />
                              {el.pseudo}
                            </li>)
                          )
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
							<div style={{width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
								<Submit validateInput={this._validateInput} viewer={viewer} onClose={this._closeModal}/>
								<Delete viewer={viewer} onClose={this._closeModal}/>
							</div>
          </div>
				
          
        </Modal>
      </div>
        

    );
  }
}

style = {
  error: {
    display: 'flex',
    justifyContent: 'flex-center',
		alignItems: 'flex-center',
    color: colors.error,
    lineHeight: '30px',
    fontFamily: 'Lato',
    fontSize: 18,
	},
  modalClose: {
		justifyContent: 'flex-center',
    verticalAlign: 'middle',
		paddingTop: 10,
		color: colors.gray,
		cursor: 'pointer',
    fontSize: 13,
	},
}

const stateToProps = (state) => ({
  venueId: state.facilityReducer.venueId,
  facilities: state.facilityReducer.facilities,
  facilityName: state.facilityReducer.facilityName,
  sports: state.facilityReducer.sports,
  photo: state.facilityReducer.photo,
  authorizedManagers: state.facilityReducer.authorizedManagers,
});

const _resetFacilityAction = () => ({
	type: types.FACILITY_RESET_FACILITY,
})

const _setFacilityAction = (facilityName, facilityId, sports, photo, authorizedManagers) => ({
	type: types.FACILITY_SET_FACILITY,
	facilityName: facilityName,
	facilityId: facilityId,
	sports: sports,
  photo: photo,
  authorizedManagers: authorizedManagers
})

const dispatchToProps = (dispatch) => ({
  _resetFacilityAction: bindActionCreators(_resetFacilityAction, dispatch),
	_setFacilityAction: bindActionCreators(_setFacilityAction, dispatch),
});

const ReduxContainer = connect(
  stateToProps,
	dispatchToProps
)(Radium(EditFacility));

export default createRefetchContainer(Radium(ReduxContainer), {
  viewer: graphql`
    fragment EditFacility_viewer on Viewer @argumentDefinitions (
      filterCircle: {type: "CirclesFilter"},
      autocompletion_required: {type: "Boolean!", defaultValue: false},
      pseudo_autocomplete: {type: "String"},
      venueId: {type: "ID", defaultValue: null},
      filter: {type: "SportFilter"},
      queryLanguage: {type: "SupportedLanguage"}
    ){
      id,
      me {
        id
        pseudo
      }
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
    fragment EditFacility_venue on Venue {
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
  query EditFacilityRefetchQuery (
    $filterCircle: CirclesFilter,
    $autocompletion_required: Boolean!,
    $pseudo_autocomplete: String,
    $venueId: ID,
    $filter: SportFilter,
    $queryLanguage: SupportedLanguage
  ) {
    viewer {
      ...EditFacility_viewer @arguments(
        filterCircle: $filterCircle
        autocompletion_required: $autocompletion_required
        pseudo_autocomplete: $pseudo_autocomplete
        venueId: $venueId
        filter: $filter
        queryLanguage: $queryLanguage
      )
    }
  }
`)
