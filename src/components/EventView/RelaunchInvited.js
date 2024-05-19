import React from 'react';
import Radium from 'radium';
import { withAlert } from 'react-alert'
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';

import localizations from '../Localizations'
import { colors } from '../../theme';

let styles;

class RelaunchInvited extends React.Component {
    constructor() {
        super();
        this.alertOptions = {
            offset: 60,
            position: 'top right',
            theme: 'light',
            transition: 'fade',
        };
        this.state = {
            relaunched: false
        }
    }

    relaunchInvitedUsers = () => {
        if (!this.state.relaunched) {
            this.setState({
                relaunched: true
            })
            this.props.relay.refetch(fragmentVariables => ({
                ...fragmentVariables,
                id: this.props.sportunity.id,
                queryRelaunch: true
            }))
            setTimeout(() => {
                this.props.alert.show(localizations.event_relaunch_invited_success, {
                    timeout: 3000,
                    type: 'success',
                }); 
            }, 1000) 
        }
        else {
            this.props.alert.show(localizations.event_relaunch_invited_done, {
                timeout: 3000,
                type: 'info',
            }); 
        }
    }

    render() {
        return (
            <div style={styles.container}>
                <span style={styles.separator}> - </span>
                <div style={styles.button} onClick={this.relaunchInvitedUsers}>{localizations.event_relaunch_invited}</div>
            </div>
        );
    }

}

styles = {
    container: {
        display: 'flex',
    },
    separator: {
        margin: '0 10px'
    },
    button: {
        cursor: 'pointer',
    }
};

export default createRefetchContainer(withAlert(Radium(RelaunchInvited)), {
//OK
    viewer: graphql`
        fragment RelaunchInvited_viewer on Viewer @argumentDefinitions (
            id: {type: "String!", defaultValue: ""}
            queryRelaunch: {type: "Boolean!", defaultValue: false}
            ){
            id
            relaunchInviteds (sportunityID: $id) @include(if: $queryRelaunch) {
                id
            }
        }
    `
},
graphql`
query RelaunchInvitedRefetchQuery(
  $id: String!
  $queryRelaunch: Boolean!
) {
viewer {
    ...RelaunchInvited_viewer
    @arguments(
      id: $id
      queryRelaunch: $queryRelaunch
    )
}
}
`,
)
