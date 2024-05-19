import React, { Component } from 'react';
import { appStyles, colors } from '../../theme'
import Radium from 'radium'
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';

let styles ;

class OwnerSelect extends Component {
  constructor(props) {
    super(props)
    this.state = {
      listIsOpen: false,
	    value: '',
	    isFocus: false,
    }
  }

  componentDidMount() {
    window.addEventListener('click', this._handleClickOutside);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this._handleClickOutside);
  }

  _toggleDropdown = () => {
    if (!this.props.isDisabled)
      this.setState({
        listIsOpen: !this.state.listIsOpen
      })
  }

  _handleClickOutside = event => {
    if (!this._containerNode.contains(event.target)) {
      this.setState({ listIsOpen: false });
    }
  }

  onChange = (item) => {
	  let {selectedItem, onSelectItem} = this.props
    if (selectedItem.findIndex(selected => selected.value.id === item.value.id) >= 0)
      selectedItem = selectedItem.filter(selected => selected.value.id !== item.value.id);
	  else
	    selectedItem.push(item);
	  this.setState({isFocus: false, value: ''})
	  onSelectItem(selectedItem)
  }

	isValidEmailAddress = (address) => {
		let re = /^[a-z0-9][a-z0-9-_\.]+@([a-z]|[a-z0-9]?[a-z0-9-]+[a-z0-9])\.[a-z0-9]{2,10}(?:\.[a-z]{2,10})?$/;
		return re.test(address)
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
					listIsOpen: true,
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
					listIsOpen: false
				})
			}
		}, 350)
	}

	_onFocus = () => {
		this.setState({
			isFocus: true,
			value: ''
		})
	}

	_onBlur = () => {
		this.setState({
			isFocus: false,
			value: ''
		})
	}

  render() {
    let { isDisabled, list, selectedItem, placeholder, label, viewer } = this.props ;
    let { listIsOpen } = this.state

    const inputStyle = isDisabled ? appStyles.inputDisabled : {...appStyles.input, ...styles.input} ;
    const triangleStyle = isDisabled ? styles.triangleDisabled : listIsOpen ? styles.triangleOpen : styles.triangle ;
    if (label) triangleStyle.top = 22 ;

	  selectedItem && selectedItem.forEach(user => {
    	if (list.findIndex(item => item.value === user.value) < 0)
    		list.push(user)
    })

    viewer.users && viewer.users.edges.forEach(user => {
    	if (list.findIndex(item => item.value === user.node.id) < 0)
    		list.push({value: user.node.id, label: user.node.pseudo})
    })

    return(
      <div style={styles.container} onClick={this._toggleDropdown} ref={node => { this._containerNode = node; }}>
        {label && <div style={appStyles.inputLabel}>{label}</div>}
        <div>
        <input
          style={inputStyle}
          type='text'
          value={this.state.isFocus ? this.state.value : selectedItem ? selectedItem.map((item, index) => (index > 0 ? ' ' : '') + item.label) : ''}
          readOnly={false}
          placeholder={placeholder}
          onChange={this._handleInputChange}
          onFocus={this._onFocus}
          onBlur={this._onBlur}
          width='100%'/>
        <span style={triangleStyle} onClick={this._toggleDropdown} />
        {
          listIsOpen &&
          <div style={label ? styles.dropdownWithLabel : styles.dropdown}>
            <ul style={styles.list}>
              {
                list.map((item, index) =>
                  <li
                    key={index}
                    style={selectedItem.findIndex(selected => selected.value === item.value) >= 0
                      ? {...styles.listItem, fontWeight: 'bold'} : styles.listItem}
                    onClick={() => this.onChange(item)}
                  >
                    {item.label}
                  </li>
                )
              }
            </ul>
          </div>
        }
        </div>
      </div>
    )
  }
}

styles = {
  container: {
    position: 'relative',
    cursor: 'pointer',
  },
  input: {
    cursor: 'pointer',
    width: 160,
    fontSize: 13,
    marginBottom: 0,
    '@media (maxWidth: 768px)': {
      width: 180
    }
  },
  triangle: {
    position: 'absolute',
    right: 0,
    top: 12,
    width: 0,
    height: 0,

    transition: 'border 100ms',
    transitionOrigin: 'left',

    cursor: 'pointer',

    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderTop: `8px solid #212121`,
  },
  triangleOpen: {
    position: 'absolute',
    right: 0,
    top: 12,
    width: 0,
    height: 0,

    transition: 'border 100ms',
    transitionOrigin: 'left',

    cursor: 'pointer',

    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderBottom: `8px solid ${colors.green}`,
  },
  triangleDisabled: {
    position: 'absolute',
    right: 0,
    top: 12,
    width: 0,
    height: 0,
    cursor: 'default',

    transition: 'border 100ms',
    transitionOrigin: 'left',

    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderTop: `8px solid ${colors.gray}`,
  },
  dropdown: {
    position: 'absolute',
    top: 30,
    left: 0,

    width: '100%',
    maxHeight: 300,

    backgroundColor: colors.white,

    boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
    border: '2px solid rgba(94,159,223,0.83)',
    padding: '10px 15px',

    overflowY: 'scroll',
    overflowX: 'hidden',

    zIndex: 100,
  },
  dropdownWithLabel: {
    position: 'absolute',
    top: 45,
    left: 0,

    width: '100%',
    maxHeight: 300,

    backgroundColor: colors.white,

    boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
    border: '2px solid rgba(94,159,223,0.83)',
    padding: '10px 15px',

    overflowY: 'scroll',
    overflowX: 'hidden',

    zIndex: 100,
  },
  list: {},
  listItem: {
    paddingTop: 5,
    paddingBottom: 5,
    color: '#515151',
    fontSize: 16,
    fontWeight: 500,
    fontFamily: 'Lato',
    borderBottomWidth: 1,
    borderColor: colors.blue,
    borderStyle: 'solid',
    cursor: 'pointer',
  },
  listItemSelected: {
    paddingTop: 5,
    paddingBottom: 5,
    color: '#515151',
    fontSize: 16,
    fontFamily: 'Lato',
    borderBottomWidth: 1,
    borderColor: colors.blue,
    borderStyle: 'solid',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
};

export default createRefetchContainer(OwnerSelect, {
//OK
    viewer: graphql`
  fragment OwnerSelect_viewer on Viewer @argumentDefinitions (
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
        }
      }
    }
  }
`,
},
graphql`
query OwnerSelectRefetchQuery(
    $pseudo_autocomplete: String
    $email_autocomplete: String
    $autocompletion_required: Boolean!
    $userType: UserProfileType
    $parentsOnly: Boolean
) {
viewer {
    ...OwnerSelect_viewer
    @arguments(
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
