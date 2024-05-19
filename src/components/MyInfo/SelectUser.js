import React from 'react'
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import Input from '../NewSportunity/Input'
import { colors } from '../../theme'
import Radium from 'radium'
import localizations from '../Localizations'

class SelectUser extends React.Component {
  
  state = {
    inputContent: '',
    open: true,
  }

  componentDidMount() {
    window.addEventListener('click', this._handleClickOutside);
  }

  componentWillUnmount() {
      window.removeEventListener('click', this._handleClickOutside);
  }

  _handleClickOutside = event => {
    if (this.state.open && this._containerNode && !this._containerNode.contains(event.target)) {
        this.setState({ open: false, inputContent: '', inputIsFocused: false, dropdownOpen: false });
        this.props.relay.refetch(fragmentVariables => ({
          ...fragmentVariables,
          autocompletion_required: false,
          pseudo_autocomplete: '_'
        }))
    }
  }

  _handleInputChange = e => {
    this.setState({
        inputContent: e.target.value,
        open: true,
    })
    this.props.relay.refetch(fragmentVariables => 
      e.target.value.length > 3 && this.props.viewer.me
      ? ({
        ...fragmentVariables,
        autocompletion_required: true,
        pseudo_autocomplete: e.target.value
      }) : ({
        ...fragmentVariables,
        autocompletion_required: false,
        pseudo_autocomplete: '_'
      })
    )
  }

  _hasResults = () =>
    this.props.viewer.users &&
    this.props.viewer.users.edges.length > 0

  _handleSelected = (user) => {
    this.setState({
      open: false,
      inputContent: '',
    })
    this.props.onSelectedUser(user)
  }



  render() {
    const { onSelectedUser, viewer } = this.props
    const { users } = viewer

    return (
      <div style={styles.inputContainer}>
        <Input
          language={this.props.language}
          ref={node => { this._inputNode = node }}
          placeholder={localizations.selectAUserHolder}
          value={this.state.inputContent}
          onChange={this._handleInputChange}
          onKeyPress={this.handleKeyPress}
        />
        {this.state.open && (
          this._hasResults()
          ? <ul style={styles.list} ref={node => { this._containerNode = node; }}>
              {users.edges.map((edge) => edge.node).map((user, index) =>
                <li
                    key={index}
                    style={styles.listItemClickable}
                    onClick={() => this._handleSelected(user)}
                >
                  {user.pseudo}
                </li>
              )}
            </ul>
          : <ul style={styles.list} ref={node => { this._containerNode = node; }}>
              <li
                key={"0"}
                style={styles.listItemClickable}
              >
                {localizations.newSportunity_unknown_opponent}
              </li>
            )}
          </ul>
        )}
      </div>
    )
  }

}

const styles = {
  inputContainer: {
    position: 'relative',
  },
  list: {
    position: 'absolute',
    backgroundColor: colors.white,
    width: '100%',
    left: 0,
    maxHeight: 220,
    backgroundColor: colors.white,
    boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
    border: '2px solid rgba(94,159,223,0.83)',
    padding: 20,
    overflowY: 'scroll',
    overflowX: 'hidden',
    zIndex: 100,
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
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 5,
      cursor: 'pointer'
  },
}

export default createRefetchContainer(Radium(SelectUser), {
//OK
    viewer: graphql`
  fragment SelectUser_viewer on Viewer @argumentDefinitions (
    pseudo_autocomplete: {type: "String", defaultValue: "_"}
    autocompletion_required: {type: "Boolean!", defaultValue: false}
    ){
    users (pseudo: $pseudo_autocomplete, first: 10) @include(if: $autocompletion_required) {
      edges {
        node {
          id
          pseudo
          avatar
        }
      }
    }
    me {
      id
    }
  }
`,
},
graphql`
query SelectUserRefetchQuery(
  $pseudo_autocomplete: String
  $autocompletion_required: Boolean!
) {
viewer {
    ...SelectUser_viewer
    @arguments(
      pseudo_autocomplete: $pseudo_autocomplete
      autocompletion_required: $autocompletion_required
    )
}
}
`,
)
