import React from 'react';
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium';

import { colors } from '../../theme';
import localizations from '../Localizations'

let styles;


class Organizer extends React.Component {
    state = {
        roleOther: false,
    }

    componentDidMount = () => {
        if (this.props.organizer && this.props.organizer.organizer) {
            this.props.relay.refetch(fragmentVariables => ({
                ...fragmentVariables,
                organizerId: this.props.organizer.organizer, 
                query: true
            }))
            if (this.props.sport && this.props.sport.id) {
                this.props.relay.refetch(fragmentVariables => ({
                    ...fragmentVariables, 
                    sportId: this.props.sport.id,
                    querySport: true
                }))
            }
            
            if (this.props.sport && this.props.sport.value) {
                this.props.relay.refetch(fragmentVariables => ({
                    ...fragmentVariables,
                    sportId: this.props.sport.value,
                    querySport: true
                }))
            }

            if (this.props.organizer.customSecondaryOrganizerType) {
                this.setState({
                    roleOther: true
                })
            }
        }        
    }

    componentWillReceiveProps = (nextProps) => {
        if (this.props.organizer && this.props.organizer.organizer && nextProps.organizer && nextProps.organizer.organizer && this.props.organizer.organizer !== nextProps.organizer.organizer) {
            this.props.relay.refetch(fragmentVariables => ({
                ...fragmentVariables,
                organizerId: nextProps.organizer.organizer, 
                query: true
            }))
        }
        if (nextProps.sport && nextProps.sport.id && (!this.props.sport || (this.props.sport.id && this.props.sport.id !== nextProps.sport.id))) {
            this.props.relay.refetch(fragmentVariables => ({
                ...fragmentVariables, 
                sportId: nextProps.sport.id,
                querySport: true
            }))
        }
    }

    _renderSportInformation = (organizer, sport) => {
        if (sport.assistantTypes && sport.assistantTypes.length > 0 && !this.state.roleOther) {
            return (
                <div style={styles.sportInfo}>
                    <select value={organizer.secondaryOrganizerType} style={styles.assistantSelect} onChange={this._handleUpdateRole}>
                        <option key={0} value={""}>
                            {localizations.newSportunity_organizerChoose}
                        </option>}
                        {
                            sport.assistantTypes.map(assistantType => (
                                <option key={assistantType.id} value={assistantType.id}>
                                    {assistantType.name[localizations.getLanguage().toUpperCase()]}
                                </option>
                            ))
                        }
                        <option key={"localOther"} value={"localOther"}>
                            {localizations.other}
                        </option>}
                    </select>
                </div>
            )
        }
        else if (sport.assistantTypes && sport.assistantTypes.length > 0 && this.state.roleOther) {
            return (
                <div style={styles.sportInfo}>
                    <input 
                        type="text" 
                        maxLength="30"
                        style={styles.textInput}
                        value={organizer.customSecondaryOrganizerType || ''} 
                        onChange={this._handleUpdateCustomRole}
                    />
                    <div style={styles.resetRoleOther} onClick={this._handleResetRoleOther}>
                        <i className="fa fa-times" aria-hidden="true"></i>
                    </div>
                </div>
            )
        }
        else 
            return <div>-</div>; 
    }

    _handleUpdateRole = (event) => {
        if (!event.target.value || event.target.value === "")
            this.props.updateRole(null)
        else if (event.target.value == "localOther") {
            this.props.updateRole(null)
            this.setState({roleOther: true})
        }
        else 
            this.props.updateRole(event.target.value)
    }

    _handleUpdateCustomRole = event => {
        if (!event.target.value || event.target.value === "")
            this.props.updateCustomRole(null)
        else 
            this.props.updateCustomRole(event.target.value)
    }

    _handleResetRoleOther = () => {
        this.setState({
            roleOther: false
        })
        this.props.updateCustomRole(null)
    }

    render() {
        const { organizer, viewer, sport, isModifying } = this.props;
        return (
            viewer.user && viewer.user.id
            ?   <tr style={styles.container}>
                    <td style={styles.pseudo}>{viewer.user.pseudo}</td>
                    <td style={styles.role}>{this._renderSportInformation(organizer, sport)}</td>
                </tr>
            :   null
        );
    }
}

styles = {
    container: {
        marginTop: 5,      
        fontSize: 20,
        color: '#515151',
        position: 'relative',
        lineHeight: '50px'
    },
    pseudo: {
        fontWeight: 500, 
    },
    sportInfo: {
        paddingLeft: 10,
        position: 'relative'
    },
    resetRoleOther: {
        position: 'absolute',
        top: 0,
        right: 20,
        fontSize: 12,
        cursor: 'pointer'
    },
    assistantSelect: {
        width: '80%',
        minWidth: 90,
        height: 25,
        fontFamily: 'Lato',
        fontSize: 14
    },
    price: {
        color: colors.gray,
    },
    priceInputContainer: {

    },
    priceInput: {
        width: 90,
        height: 36,
        border: '2px solid #5E9FDF',
        borderRadius: '3px',
        textAlign: 'center',    
        fontFamily: 18,
        lineHeight: 1,    
        color: 'rgba(146,146,146,0.87)',
        fontSize: 16
    },
    removeIcon: {
        cursor: 'pointer',
        textAlign: 'right'
    },
    textInput: {
        width: '80%',
        minWidth: 90,
        height: 25,
        fontFamily: 'Lato',
        fontSize: 14
    }
};

export default createRefetchContainer(Radium(Organizer), {
//OK
  viewer: graphql`
    fragment MyEventsOrganizer_viewer on Viewer @argumentDefinitions (
        organizerId: {type: "String!", defaultValue: "_"}
        query: {type: "Boolean!", defaultValue: false}
        sportId: {type: "ID", defaultValue: null}
        querySport: {type: "Boolean!", defaultValue: false}
        ){
      sport(id: $sportId) @include(if: $querySport) {
          id
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
      user (id: $organizerId) @include(if: $query) {
          id
          pseudo
          sports {
              sport {
                  id, 
              },
              assistantType {
                  id,
                  name {
                      FR,
                      EN,
                      DE, 
                      ES
                  }
              }
          }
      }
    }
  `
},
graphql`
query MyEventsOrganizerRefetchQuery(
  $organizerId: String!
  $query: Boolean!
  $sportId: ID
  $querySport: Boolean!
) {
viewer {
    ...MyEventsOrganizer_viewer
    @arguments(
        organizerId: $organizerId
        query: $query
        sportId: $sportId
        querySport: $querySport
    )
}
}
`,
);