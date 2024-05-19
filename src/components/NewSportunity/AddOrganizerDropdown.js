import React from 'react';
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import PureComponent, { pure } from '../common/PureComponent'
import Radium from 'radium';
import { colors } from '../../theme';

import Input from './Input';
import localizations from '../Localizations'

let styles;


class AddOrganizerDropdown extends PureComponent {

    state = {
      assistantTypeDropdownOpen: false,
      assistantDropdownOpen: false,
    }


  componentDidMount() {
    window.addEventListener('click', this._handleClickOutside);
    
    if (this.props.sport && this.props.sport.id)
      this.props.relay.refetch({
        query: true,
        sportId: this.props.sport.id
      })
  }


  componentWillUnmount() {
    window.removeEventListener('click', this._handleClickOutside);
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.sport && nextProps.sport.id && (!this.props.sport || (this.props.sport.id && this.props.sport.id !== nextProps.sport.id)))
      this.props.relay.refetch({
        query: true,
        sportId: nextProps.sport.id
      })
  }


  _toggleDropdown = () => {
    this.setState(prevState => ({ open: !prevState.open }));
  }

  _handleInputClick = () => {
    const { open } = this.state;
    if (!open) return this.setState({ open: true });
  }


  _handleFocus = () => {
    this._inputNode.focus();
    this._toggleDropdown();
  }


  _handleChange = (item) => {
    const { onChange } = this.props;
    this.setState({ term: item.name, open: false });
    if (typeof onChange === 'function') {
      onChange(item);
    }
  }


  _handleClickOutside = event => {
    if (!this._containerNode.contains(event.target)) {
      this.setState({ open: false });
    }
  }


  _filterList(list) {
    if (list && list.edges && list.edges.length > 0) {
      return list.edges
        .map(item => {
          return item.node
        })
        .filter(i => Boolean(i));
    }
    else
      return []
  }

  render() {
    const { style, list, disabled, required, viewer } = this.props;

    const finalContainerStyle = { ...styles.container, ...style };

    const finalAssistantTypeTriangleStyle = {
      ...(this.state.assistantTypeDropdownOpen ? styles.triangleOpen : styles.triangle),
      borderBottomColor: this.state.assistantTypeDropdownOpen ? colors.green : colors.blue,
    }

    const finalAssistantListTriangleStyle = {
      ...(this.state.assistantDropdownOpen ? styles.triangleOpen : styles.triangle),
      borderBottomColor: this.state.assistantDropdownOpen ? colors.green : colors.blue,
    }

    const filteredList = this._filterList(viewer.assistants);

    return (
      <div
        style={finalContainerStyle}
        onFocus={this._toggleDropdown}
        ref={node => { this._containerNode = node; }}
      >
        <div style={styles.assistantTypeInput}>
          <Input
            label={localizations.newSportunity_organizerRoles}
            ref={node => { this._inputNode = node }}
            onClick={() => {this.setState({assistantTypeDropdownOpen: true})}}
            placeholder={this.props.sport && this.props.sport.id ? localizations.newSportunity_organizerChoose : localizations.newSportunity_organizerHolderBefore}
            value={this.state.selectedRole}
            onChange={this._handleInputChange}
            onKeyPress={this._handleOpenRoleList}
            readOnly
          />
          <span style={finalAssistantTypeTriangleStyle} onClick={() => {this.setState({assistantTypeDropdownOpen: true})}}/>
        </div>

        <div style={styles.assistantInput}>
          <Input
            label={localizations.newSportunity_organizerAssistantsAvailable}
            ref={node => { this._inputNode = node }}
            onClick={() => {this.setState({assistantDropdownOpen: true})}}
            placeholder={this.props.sport && this.props.sport.id 
                        ? viewer.assistants && viewer.assistants.edges && viewer.assistants.edges.length > 0
                          ? viewer.assistants.edges.length > 1 
                            ? viewer.assistants.edges.length + ' ' + localizations.newSportunity_organizerAssistantsResults
                            : viewer.assistants.edges.length + ' ' + localizations.newSportunity_organizerAssistantsResult
                          : localizations.newSportunity_selection_no_choice
                        : localizations.newSportunity_organizerHolderBefore
                        }
            value={this.state.selectedRole}
            onChange={this._handleInputChange}
            onKeyPress={this._handleOpenRoleList}
            readOnly
          />
          <span style={finalAssistantListTriangleStyle} onClick={() => {this.setState({assistantDropdownOpen: true})}}/>
        </div>
        
        
        
        {/*<div style={styles.dropdown}>
          <ul style={styles.list}>
            {
              viewer.assistants && viewer.assistants.edges && viewer.assistants.edges.length > 0
                ? viewer.assistants.edges.map((item) =>
                    <li
                      key={item.node.id}
                      style={styles.listItem}
                      onClick={(item) => this._handleChange(item)}
                    >
                      <div style={{ ...styles.avatar, backgroundImage: `url(${item.node.avatar})` }} />
                      {item.node.pseudo}
                    </li>
                  )
                : <li style={styles.listItem}>{localizations.newSportunity_selection_no_choice}</li>              
            }
          </ul>
        </div>*/}
      </div>
    );
  }
}

AddOrganizerDropdown.defaultProps = {
  list: [],
  placeholder: 'Select',
}


styles = {
  container: {
    position: 'absolute',
    top: 90,
    width: '100%',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
    border: '2px solid rgba(94,159,223,0.83)',
    zIndex: 100,
    padding: 20
  },

  assistantInput: {
    position: 'relative'
  },
  assistantTypeInput: {
    position: 'relative',
    marginBottom: 15
  },

  dropdown: {
    width: '100%',
    maxHeight: 300,

    backgroundColor: colors.white,
    overflowY: 'scroll',
    overflowX: 'hidden',

    padding: '20px 0',
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

  list: {},

  listItem: {
    paddingLeft: 20,
    paddingRight: 20,
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
    cursor: 'pointer',

    ':hover': {
      backgroundColor: '#e9e9e9',
    },
  },

  bold: {
    fontWeight: 'bold',
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

  input: {
    width: '100%',
    height: 48,
    fontSize: 18,
    boxShadow: 'inset 0 -2px 0 0 #5E9FDF',
    borderStyle: 'none',
    padding: '10px 10px 10px 70px',
  },
};


export default createRefetchContainer(Radium(AddOrganizerDropdown), {
//OK
  viewer: graphql`
    fragment AddOrganizerDropdown_viewer on Viewer @argumentDefinitions (
      sportId: {type: "ID", defaultValue: null}
      assistantsSportId: {type: "String!", defaultValue: "_"}
      assistantTypeId: {type: "String", defaultValue: null}
      query: {type: "Boolean!", defaultValue: false}
      last: {type: "Int", defaultValue: 20}
      ){
      sport(id: $sportId) @include(if: $query) {
        assistantTypes {
          id,
          name {
            EN,
            FR,
            DE,
            ES
          }
        }
      }
      assistants(sportId: $assistantsSportId, assistantTypeId: $assistantTypeId, last: $last) @include(if: $query){
        edges {
          node {
            id
            avatar
            pseudo
            birthday
            publicAddress {
              city
              country
            }
          }
        }
      }
    }
  `
},
  graphql`
  query AddOrganizerDropdownRefetchQuery(
    $sportId: ID
    $assistantsSportId: String!
    $assistantTypeId: String
    $query: Boolean!
    $last: Int
  ) {
  viewer {
      ...AddOrganizerDropdown_viewer
      @arguments(
        sportId: $sportId
        assistantsSportId: $assistantsSportId
        assistantTypeId: $assistantTypeId
        query: $query
        last: $last
      )
  }
  }
  `,
);
