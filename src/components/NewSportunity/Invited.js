import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import {
    createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium';
import { withAlert } from 'react-alert'
import uniqBy from 'lodash/uniqBy'

import TutorialModal from '../common/Tutorial/index.js'
import Switch from '../common/Switch';
import SelectCircle from '../common/Inputs/SelectCircle'
import { colors } from '../../theme';
import localizations from '../Localizations'

import Dropdown from './Dropdown';
import Input from './Input';
import InvitedList from './InvitedList';
import CircleAutoParticipate from './CircleAutoParticipate';
import NewCircle from './NewCircle'
import SummoningModal from "./SummoningModal";

let styles;

const edgesToNode = ({ node }) => node
const findBy = (options) => (target) =>
  Object.keys(options).reduce((mem, key) => mem && target[key] === options[key], true)

const getAvatarInUserEdges = (usersEdges) => (query) =>
    (usersEdges
      .map(edgesToNode)
      .find(findBy(query)) || {}).avatar

class InvitedSelect extends PureComponent {

    state = {
        dropdownOpen: false,
        open: false,
        inputContent: '',
        circleInputContent: '',
	      selectedUserAvatar: null,
        circleClicked: null, 
        selectedUserId: '',
        autocompletionCirclesList: [],
        inputIsFocused: false,
        tutorial7IsVisible: false,
        seeCirclesFromOtherTeams: false,
        userAutocompletionListIsOpen: false,
        circleAutocompletionListIsOpen: false,
        invitedListIsOpen: false,
        invitedCirclesListIsOpen: false,
        isNewCircleOpen: false,
	    openModal: false,
    }
    alertOptions = {
        offset: 60,
        position: 'top right',
        theme: 'light',
        transition: 'fade',
    };

    componentDidMount() {
        window.addEventListener('click', this._handleClickOutside);        
        if (this.props.superMe && (this.props.superMe.profileType === 'BUSINESS' || this.props.superMe.profileType === 'ORGANIZATION')) {
            setTimeout(() => 
                this.setState({
                    tutorial7IsVisible: true
                }), 100
            );
        }
    }

    componentWillReceiveProps = (nextProps) => {
		if (this.props.viewer && this.props.viewer.me && this.props.viewer.me.id && !this.props.superMe && nextProps.superMe && (nextProps.superMe.profileType === 'BUSINESS' || nextProps.superMe.profileType === 'ORGANIZATION')) {
			setTimeout(() => 
				this.setState({
					tutorial7IsVisible: true
				}), 100
			);
		}
	}

    componentWillUnmount() {
        window.removeEventListener('click', this._handleClickOutside);
    }

    _toggleDropdown = () => {
      if (this.state.dropdownOpen) {
        this._closeDropdown();
      }
      else {
        this._openDropdown();
      }
    };

    _openDropdown = () => {
        this.setState({ dropdownOpen: true, tutorial7IsVisible: false, tutorial7IsVisible: false })
    };

    _openModal = () => {
        this.setState({ openModal: true })
    };

    _closeDropdown = () => {
        this.setState({ open: false, inputContent: '', selectedUserId: '', inputIsFocused: false, dropdownOpen: false })
    };

    _waitAndOpenDropdown = () => {
        setTimeout(() => {
            this.setState({ dropdownOpen: true })
        }, 100);
    };

    _toggleCircleList = () => {
      const list = this.state.circleInputContent.length > 3 
        ?   this.state.autocompletionCirclesList 
        :   [].concat(this.props.circlesList, this.props.circlesCurrentUserIsIn, this.state.seeCirclesFromOtherTeams ? this.props.circlesFromClub : []) 

      this.setState({
        autocompletionCirclesList: [...list],
        open: this.state.open && !list.length,
        invitedCirclesListIsOpen: false,
        invitedListIsOpen: false,
        circleAutocompletionListIsOpen: true,
      })
    }

    _closeCircleList = () => {
      this.setState({
        circleAutocompletionListIsOpen: false,
        autocompletionCirclesList: []
      })
    }

    _handleClickOutside = event => {
        if (this.state.userAutocompletionListIsOpen && !this._autocompletionList.contains(event.target)) {
            this.setState({userAutocompletionListIsOpen: false})
            return;
        }

        if (this.state.circleAutocompletionListIsOpen && !this._autocompletionCircleList.contains(event.target)) {
            this.setState({circleAutocompletionListIsOpen: false})
            return;
        }
        
        if (this.state.invitedCirclesListIsOpen && !this._invitedCircleList.contains(event.target)) {
            this.setState({invitedCirclesListIsOpen: false})
            return;
        }

        if (this.state.invitedListIsOpen && !this._invitedList.contains(event.target)) {
            this.setState({invitedListIsOpen: false})
            return;
        }


        if (!this._containerNode.contains(event.target) && !this.state.isNewCircleOpen) {
            this._closeDropdown();
            this.props.relay.refetch(fragmentVariables => ({
                ...fragmentVariables,
                autocompletion_required: false,
                pseudo_autocomplete: '_'
            }))
        }
    }

    _handleInputClick = () => {
        const { open } = this.state;
        if (!open && (this.props.list && this.props.list.length > 0) || (this.props.invitedCircles && this.props.invitedCircles.length > 0))
            return this.setState({ open: true, inputIsFocused: true });
    }

    _handleAddClick = () => {
        const pseudo = this.state.inputContent || this.state.circleInputContent
        if (!pseudo) { return; }
        const userEdges = this.props.viewer.users && this.props.viewer.users.edges || []
        if (this.props.list && this.props.list.find((element) => element.pseudo === pseudo)) {
            this.props.alert.show(localizations.popup_newSportunity_invited_already_exists, {
                timeout: 3000,
                type: 'info',
            });
            this.setState({
                autocompletionCirclesList: [],
                inputContent: '',
                selectedUserId: '',
                circleInputContent: '',
                open: false,
                inputIsFocused: false
            })

            return;
        }
        
        if (this.state.circleClicked && this.props.invitedCircles && this.props.invitedCircles.length > 0 && this.props.invitedCircles.find(element => element.circle.id === this.state.circleClicked.id)) {
            this.props.alert.show(localizations.popup_newSportunity_invited_already_exists, {
                timeout: 3000,
                type: 'info',
            });
            this.setState({
                autocompletionCirclesList: [],
                inputContent: '',
                selectedUserId: '',
                circleInputContent: '',
                open: false,
                inputIsFocused: false,
                circleClicked: null
            })
            return;
        }

        if (this.state.circleClicked) {
            this.props.onAddCircle(this.state.circleClicked);
            this.setState({
              autocompletionCirclesList: [],
              inputContent: '',
              selectedUserId: '', 
              circleInputContent: '',
              open: true,
              circleClicked: null
            })
        }
        else {
            let isEmail = this.isValidEmailAddress(pseudo);
            if (!isEmail && !this.isValidPseudo(pseudo)) {
                this.props.alert.show(localizations.popup_newSportunity_invited_user_doesnt_exist, {
                    timeout: 3000,
                    type: 'info',
                });
                return;
            }

	          let avatar = this.state.selectedUserAvatar

            this.props.relay.refetch(fragmentVariables => ({
                ...fragmentVariables,
                pseudo: !isEmail ? pseudo : "",
                email: isEmail ? pseudo : ""
            }),
            null, 
            () => {
                setTimeout(() => {// Needed to wait for Relay to re-fetch data in this.props.viewer
                    if (this.props.viewer.invitedUserExists || isEmail) {
                        if (pseudo) {
                            this.props.onAddItem(pseudo, avatar, this.state.selectedUserId);
                            this.setState({
                                inputContent: '',
                                selectedUserId: '', 
                                circleInputContent: '',
                                open: true,
                                autocompletionCirclesList: []
                            })
                        }
                    }
                    else {
                        this.props.alert.show(localizations.popup_newSportunity_invited_user_doesnt_exist, {
                            timeout: 3000,
                            type: 'info',
                        });
                    }
                }, 50);
            });
        }
    }

    isCircle = (str) => {
        let circle
        if (this.props.circlesList.length > 0) {
            circle = this.props.circlesList.find(circle => {
                return circle.node.name === str
            });
        }

        if (!circle && this.props.circlesCurrentUserIsIn && this.props.circlesCurrentUserIsIn.length > 0) {
            circle = this.props.circlesCurrentUserIsIn.find(circle => {
                return circle.node.name === str
            });
        }

        if (!circle && this.state.seeCirclesFromOtherTeams && this.props.circlesFromClub && this.props.circlesFromClub.length > 0) {
            circle = this.props.circlesFromClub.find(circle => {
                return circle.node.name === str
            });   
        }

        return (circle ? circle.node : null)
    }

    isValidEmailAddress(address) {
        let re = /^[a-z0-9][a-z0-9-_\.]+@([a-z]|[a-z0-9]?[a-z0-9-]+[a-z0-9])\.[a-z0-9]{2,10}(?:\.[a-z]{2,10})?$/;
        return re.test(address)
    }

    isValidPseudo(str) {
        return !/[~`!#$%\^&*+=\\[\]\\';,/{}|\\":<>\?]/g.test(str);
    }

    handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            this._handleAddClick();
            setTimeout(() => {
                this.props.relay.refetch(fragmentVariables => ({
                    ...fragmentVariables,
                    autocompletion_required: false,
                    pseudo_autocomplete: '_'
                }));
            }, 400);
        }
    }

    _handleFocus = () => {
        this._toggleDropdown();
    }

    _handleAutocompleteClicked = (user) => {
        this.setState({
            inputContent: user.pseudo,
            selectedUserId: user.id,
            selectedUserAvatar: user.avatar,
        }, () => {
          this._handleAddClick()
          setTimeout(() => {
              this.props.relay.refetch(fragmentVariables => ({
                  ...fragmentVariables,
                  autocompletion_required: false,
                  pseudo_autocomplete: '_'
              }));
          }, 400);
        })

    }

    _handleCircleAutocompleteClicked = (circle) => {
        this.setState({
            circleInputContent: circle.name,
            circleClicked: circle
        })
        setTimeout(() => {
            this._handleAddClick();
        }, 200);
    }

    _handleInputChange = event => {
        this.setState({
            inputContent: event.target.value,
            selectedUserId: ''
        })
        if (event.target.value.length)
            this.setState({
                userAutocompletionListIsOpen: true, 
                invitedCirclesListIsOpen: false,
                invitedListIsOpen: false
            })
        if (event.target.value.length > 3 && this.props.isLoggedIn) {
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

    _handleCircleInputChange = event => {
      this.setState({
          circleInputContent: event.target.value,
      })
      if (event.target.value.length)
          this.setState({
              circleAutocompletionListIsOpen: true
          })
      this._setCircleAutoCompletionList(event.target.value);
    }

    _setCircleAutoCompletionList = (input) => {
        const list = [].concat(this.props.circlesList, this.props.circlesCurrentUserIsIn, this.state.seeCirclesFromOtherTeams ? this.props.circlesFromClub : []) 

        if (this.props.isLoggedIn) {
            let autocompletionCirclesList = list
                .filter(el => {
                    if ((el.node.owner ? el.node.name + ' ' + localizations.find_my_sport_clubs_of + ' ' + el.node.owner.pseudo : el.node.name).toLowerCase().indexOf(input.toLowerCase()) >= 0)
                        return true;
                    else return false;
                });
            

            this.setState({
                autocompletionCirclesList
            })
        }
        else {
            this.setState({
                autocompletionCirclesList: []
            })
        }
    }

    getTermContent = (list, invitedCircles) => {
        if (this.state.dropdownOpen) {
            return '';
        }
        else {
            let term = '';
            if (invitedCircles && invitedCircles.length > 0) {
                if (term) term = term + ',';
                term = term + invitedCircles.map(el => ' ' + el.circle.name);
            }
            if (list && list.length > 0) {
                if (term) term = term + ',';
                term = term + list.map(el => ' ' + el.pseudo)
            }

            return term;
        }
    }

    _switchSeeCirclesFromOtherTeams = (e) => {
        this.setState({seeCirclesFromOtherTeams: e, invitedCirclesListIsOpen: false, invitedListIsOpen: false})
    }

    createNewCircle = (event) => {
        event.preventDefault();
        event.stopPropagation();
    }

    render() {
        const { open, autocompletionCirclesList, dropdownOpen, userAutocompletionListIsOpen, circleAutocompletionListIsOpen } = this.state;
        const { list, invitedCircles, onRemoveItem, onRemoveInvitedCircle, onChangeCirclePrice, onChangeCircleAutoParticipate, onChangeUserAutoParticipate, viewer } = this.props;
        let term = this.getTermContent(list, invitedCircles);
	    const triangleStyle = this.state.dropdownOpen ? styles.triangleOpen : styles.triangle ;
	    const finalTriangleStyle = {
		    ...triangleStyle,
		    borderBottomColor: this.state.dropdownOpen ? colors.green : colors.blue,
	    }

        return (
            <div
                style={styles.container}
                ref={node => { this._containerNode = node; }}
            >
                <TutorialModal
                    isOpen={this.state.tutorial7IsVisible}
                    tutorialNumber={8}
                    tutorialName={"team_small_tutorial7"}
                    message={localizations.team_small_tutorial7}
                    confirmLabel={localizations.team_small_tutorial_ok}
                    onPass={() => this.setState({tutorial7IsVisible: false})}
                    position={{
                      top: 62,
                      left: 50
                    }}
                    arrowPosition= {{
                      top: -8,
                      left: 150
                    }}
                />

	            <SummoningModal
		            canCloseModal={true}
		            viewer={viewer}
		            invitedCircles={invitedCircles}
		            list={list}
		            onChangeCirclePrice={onChangeCirclePrice}
		            onChangeCircleAutoParticipate={onChangeCircleAutoParticipate}
		            onChangeUserAutoParticipate={onChangeUserAutoParticipate}
		            onRemoveItem={onRemoveItem}
		            onRemoveInvitedCircle={onRemoveInvitedCircle}
		            isModifying={this.props.isModifying}
		            isSurvey={this.props.isSurvey}
		            fields={this.props.fields}
		            _handleNotificationTypeChange={this.props._handleNotificationTypeChange}
		            _handleNotificationAutoXDaysBeforeChange={this.props._handleNotificationAutoXDaysBeforeChange}
                    title={viewer.me && viewer.me.profileType === 'ORGANIZATION'
                        ? localizations.newSportunity_invitedList_modal_titleClubs
                        : localizations.newSportunity_invitedList_modal_title}
		            open={this.state.openModal}
		            onClose={() => this.setState({openModal: false})}
                    addCircle={this._handleCircleAutocompleteClicked}
                    isLoggedIn={this.props.isLoggedIn}
		            _handleAutocompleteClicked={this._handleAutocompleteClicked}
	            />

               {/*  <InvitedList 
                    viewer={viewer}
                    invitedCircles={invitedCircles}
                    list={list}
                    onChangeCirclePrice={onChangeCirclePrice}
                    onChangeCircleAutoParticipate={onChangeCircleAutoParticipate}
                    onChangeUserAutoParticipate={onChangeUserAutoParticipate}
                    onRemoveItem={onRemoveItem}
                    onRemoveInvitedCircle={onRemoveInvitedCircle}
                    isModifying={this.props.isModifying}
                    isSurvey={this.props.isSurvey}
                    fields={this.props.fields}
                    _handleNotificationTypeChange={this.props._handleNotificationTypeChange}
                    _handleNotificationAutoXDaysBeforeChange={this.props._handleNotificationAutoXDaysBeforeChange}
                /> */}

	           {/*  <button
		            style={styles.add}
		            onClick={this._openModal}
	            >
		            {viewer.me && viewer.me.profileType !== 'PERSON' ? localizations.newSportunity_invitedList_modifyClub : localizations.newSportunity_invitedList_modify}
	            </button> */}
            </div>
        );
    }
}

InvitedSelect.defaultProps = {
    list: [],
    placeholder: 'Select',
}

const stylesBases = {
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
  }
}

styles = {
    container: {
        position: 'relative',
        width: '100%',
        marginBottom: 25
    },

    dropdown: {
        position: 'absolute',
        top: 70,
        width: '100%',
        height: 280,
        overflowY: 'visible',
        overflowX: 'visible'
    },

    autocompletion_dropdown: {
      ...stylesBases.autocompletion_dropdown,
      top: 77,
    },

	triangle: {
		position: 'absolute',
		right: 0,
		top: 35,
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
		top: 35,
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
    addContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: 20
    },
    list: {},

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

    circleListContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        display: 'block',
        color: colors.blueLight,
        fontSize: 16,
        lineHeight: 1,
        marginBottom: 8,
        marginTop: 13,
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
    userLinePseudoAvatar: {
      display: 'flex',
      alignItems: 'center',
    },
	add: {
		border: 'none',
		backgroundColor: colors.blue,
		color: colors.white,

		fontSize: 18,
		fontWeight: 500,
		lineHeight: 1,

		padding: '8.5px 13px 7.5px',

		cursor: 'pointer',

		borderRadius: 3,
		boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
	},
};

export default createRefetchContainer(Radium(withAlert(InvitedSelect)), {
//OK
    viewer: graphql`
        fragment Invited_viewer on Viewer @argumentDefinitions (
            pseudo: {type: "String", defaultValue: "_"}
            email: {type: "String", defaultValue: "_"}
            pseudo_autocomplete: {type: "String", defaultValue: "_"}
            autocompletion_required: {type: "Boolean!", defaultValue: false}
            ){
            ...InvitedList_viewer
            ...NewCircle_viewer
            ...SummoningModal_viewer
            me {
                id
                profileType
                pseudo
                avatar
            }
            invitedUserExists: userExists (pseudo: $pseudo, email: $email)
            users (pseudo: $pseudo_autocomplete, first: 10, userType: PERSON) @include(if: $autocompletion_required) {
                edges {
                    node {
                        id
                        pseudo
                        avatar
                    }
                }
            }
        }
    `
    },
    graphql`
    query InvitedRefetchQuery(
        $pseudo: String
        $email: String
        $pseudo_autocomplete: String
        $autocompletion_required: Boolean!
    ) {
    viewer {
        ...Invited_viewer
        @arguments(
            pseudo: $pseudo
            email: $email
            pseudo_autocomplete: $pseudo_autocomplete
            autocompletion_required: $autocompletion_required
        )
    }
    }
    `,
    );
