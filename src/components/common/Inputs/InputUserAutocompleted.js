import React from 'react'
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat'
import { colors, fonts } from '../../../theme'
import InputText from './InputText'

let styles

class InputUserAutocompleted extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            autocompletionListIsOpen: false, 
            value: ''
        }
    }

    componentDidMount() {
        window.addEventListener('click', this._handleClickOutside);
    }

    componentWillUnmount() {
        window.removeEventListener('click', this._handleClickOutside);
    }

    _handleClickOutside = (event) => {
        const { ignoredUserList } = this.props;

        if (this._containerNode && this._listNode && !this._containerNode.contains(event.target) && !this._listNode.contains(event.target)) {
            this.setState({ 
                autocompletionListIsOpen: false,
            });
            // if (this.props.viewer.users 
            //   &&  this.props.viewer.users.edges 
            //   && this.props.viewer.users.edges.filter(el => el.node.id !== this.props.viewer.me.id && (!ignoredUserList || ignoredUserList().length === 0 || ignoredUserList().findIndex(user => user.id === el.node.id) < 0)).length > 0) {
            //     this.setState({value: this.props.viewer.users.edges.filter(el => el.node.id !== this.props.viewer.me.id && (!ignoredUserList || ignoredUserList().length === 0 || ignoredUserList().findIndex(user => user.id === el.node.id) < 0))[0].node.pseudo})
            //     this.props.handleAutocompleteClicked(this.props.viewer.users.edges.filter(el => el.node.id !== this.props.viewer.me.id && (!ignoredUserList || ignoredUserList().length === 0 || ignoredUserList().findIndex(user => user.id === el.node.id) < 0))[0].node)
            // }
            // else if (this.state.value !== '') {
            //     this._handleAutocompleteClicked(this.isValidEmailAddress(this.state.value) ? {email: this.state.value.trim()} : {pseudo: this.state.value})
            // }
        }
    }

    isValidEmailAddress(address) {
        let re = /^[a-z0-9][a-z0-9-_\.]+@([a-z]|[a-z0-9]?[a-z0-9-]+[a-z0-9])\.[a-z0-9]{2,10}(?:\.[a-z]{2,10})?$/;
        return re.test(address)
    }

    onFocus = () => {
	    this.props.relay.refetch(fragmentVariables => ({
            ...fragmentVariables,
            autocompletion_required: true,
		    pseudo_autocomplete: this.isValidEmailAddress(this.state.value) ? '_' : this.state.value,
		    email_autocomplete: this.isValidEmailAddress(this.state.value) ? this.state.value : '_',
            userType: this.props.userType,
            parentsOnly: this.props.parentsOnly
	    }));
	    this.setState({
		    autocompletionListParentIsOpen: false,
		    autocompletionListIsOpen: true
	    })
    }

    _handleInputChange = event => {
        if(this.state.value !== event.target.value) {
            this.setState({
                value: event.target.value
            });
        }
	    let tempo = event.target.value ;
        setTimeout(() => {
          if (tempo.length > 0) {
            this.props.relay.refetch(fragmentVariables => ({
                ...fragmentVariables,
                autocompletion_required: true,
                pseudo_autocomplete: this.isValidEmailAddress(tempo) ? null : tempo,
                email_autocomplete: this.isValidEmailAddress(tempo) ? tempo : null,
                userType: this.props.userType,
                parentsOnly: this.props.parentsOnly
            }));
            this.setState({
              autocompletionListParentIsOpen: false,
              autocompletionListIsOpen: true
            })
          }
          else {
            this.props.relay.refetch(fragmentVariables => ({
                ...fragmentVariables,
                autocompletion_required: false,
                pseudo_autocomplete: null,
                email_autocomplete: null,
                userType: null,
                parentsOnly: null
            }));
            this.setState({
              autocompletionListIsOpen: false
            }) 
          }
        }, 350)
    }

    _handleAutocompleteClicked = (user) => {
        this.props.handleAutocompleteClicked(user)

        this.setState({
            value: this.props.clearOnClicked ? '' : user.pseudo,
            autocompletionListIsOpen: false,
        }) 
    }
    

    render() {
        const { viewer,viewer:{me}, ignoredUserList } = this.props;

        return(
            <div style={{position:'relative'}} ref={node => { this._containerNode = node; }}>
                <InputText 
                    label={this.props.label}
                    value={this.state.value}
                    placeholder={this.props.label}
                    onChange={this._handleInputChange}
                    onFocus={this.onFocus}
                    onBlur={this.onBlur}
                />
                {this.state.autocompletionListIsOpen && ((this.props.viewer && this.props.viewer.users && this.props.viewer.users.edges.length > 0) || (this.state.value.length > 0 && !this.props.relay.pendingVariables)) && 
                    <div style={styles.dropdown} ref={node => { this._listNode = node; }}>
                        <ul style={styles.list}>
                        {this.props.viewer && this.props.viewer.users && this.props.viewer.users.edges.length > 0 
                        ?   this.props.viewer.users.edges.filter(el => el.node.id !== me.id && (!ignoredUserList || ignoredUserList().length === 0 || ignoredUserList().findIndex(user => user.id === el.node.id) < 0)).map((el, index) => {
                                return (
                                    <li 
                                        key={index}
                                        style={styles.listItem}
                                        onClick={() => this._handleAutocompleteClicked(el.node)}
                                    >
                                        {el.node.pseudo}
                                    </li>
                                )
                            })
                        :   <li 
                                style={styles.listItem}
                                onClick={() => this._handleAutocompleteClicked(this.isValidEmailAddress(this.state.value) ? {email: this.state.value.trim()} : {pseudo: this.state.value})}
                            >
                                {this.state.value}
                            </li>                        
                        }
                        </ul>
                    </div>
                }
            </div>
        )
    }
}

styles = {
    dropdown: {
        position: 'absolute',
        top: 50,
        left: 0,
        width: '100%',
        maxHeight: 300,
    
        backgroundColor: colors.white,
    
        boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
        border: '2px solid rgba(94,159,223,0.83)',
        padding: 20,
    
        overflowY: 'scroll',
        overflowX: 'hidden',
    
        zIndex: 100,
    },
    list: {},

    listItem: {
        paddingTop: 10,
        paddingBottom: 10,
        color: '#515151',
        fontSize: 20,
        fontWeight: 500,
        fontFamily: 'Lato',
        borderBottomWidth: 1,
        borderColor: colors.blue,
        borderStyle: 'solid',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    listItemBold: {
        paddingTop: 10,
        paddingBottom: 10,
        color: '#515151',
        fontSize: 20,
        fontWeight: 500,
        fontFamily: 'Lato',
        borderBottomWidth: 1,
        borderColor: colors.blue,
        borderStyle: 'solid',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontWeight: 'bold'
    }
}

export default createRefetchContainer(InputUserAutocompleted, {
  viewer: graphql`
    fragment InputUserAutocompleted_viewer on Viewer @argumentDefinitions (
        pseudo_autocomplete: {type: "String", defaultValue: "_"}
        email_autocomplete: {type: "String", defaultValue: "_"}
        autocompletion_required: {type: "Boolean!", defaultValue: false}
        userType: {type: "UserProfileType", defaultValue: null}
        parentsOnly: {type: "Boolean", defaultValue: null}
        ){
      me {
        id
      }
      users (pseudo: $pseudo_autocomplete, email: $email_autocomplete, first: 10, userType: $userType, parentsOnly: $parentsOnly) @include(if: $autocompletion_required) {
        edges {
          node {
            id
            pseudo
            avatar
          }
        }
      }
    }
  `,
},
graphql`query InputUserAutocompletedRefetchQuery(
        $pseudo_autocomplete: String
        $email_autocomplete: String
        $autocompletion_required: Boolean!
        $userType: UserProfileType
        $parentsOnly: Boolean
    ) {
        viewer {
            ...InputUserAutocompleted_viewer @arguments(
                pseudo_autocomplete: $pseudo_autocomplete
                email_autocomplete: $email_autocomplete
                autocompletion_required: $autocompletion_required
                userType: $userType
                parentsOnly: $parentsOnly
            )
        }
    }
`,
);