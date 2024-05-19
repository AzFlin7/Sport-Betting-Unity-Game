import React from 'react';
import Radium from 'radium';
import { withAlert } from 'react-alert'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';

import localizations from '../Localizations'
import { colors } from '../../theme';
import UpdateCalendarMutation from '../ProfileView/UpdateCalendarMutation'

let styles;

class AddToCalendar extends React.Component {
    constructor() {
        super();
        this.alertOptions = {
            offset: 60,
            position: 'top right',
            theme: 'light',
            transition: 'fade',
        };

        this.state = {
            isAlreadyAdded: false
        }
    }

    componentWillReceiveProps = (nextProps) => {
        let {calendar} = nextProps.user || {};
        
        if (calendar && calendar.sportunities && calendar.sportunities.edges && calendar.sportunities.edges.length > 0) {
            calendar.sportunities.edges.forEach(sportunity => {
            if (sportunity.node.id === nextProps.sportunity.id)
                this.setState({isAlreadyAdded: true}) ;
            })
        }
    }

    addToMyCalendar = () => {
        if (!this.props.user) {
            this.props.alert.show(localizations.event_login_needed_calendar, {
                timeout: 3000, 
                type: 'error'
            })
            return ;
        }
        let calendar = this.props.user.calendar 
        ? {
            sportunities: this.props.user.calendar.sportunities && this.props.user.calendar.sportunities.edges && this.props.user.calendar.sportunities.edges.length > 0 
            ? this.props.user.calendar.sportunities.edges.map(sportunity => sportunity.node.id) 
            : [],
            users: this.props.user.calendar.users && this.props.user.calendar.users.length > 0 
            ? this.props.user.calendar.users.map(user => user.id)
            : []
        } 
        : {
            sportunities:[],
            users:[]
        } ;
        calendar.sportunities.push(this.props.sportunity.id);
        
        UpdateCalendarMutation.commit({
                user: this.props.user,
                userIDVar: this.props.user.id,
                calendarVar: calendar,
            },
            {
                onFailure: error => {
                    console.log(error);
                    this.props.alert.show(localizations.event_update_calendar_error, {
                        timeout: 3000,
                        type: 'error'
                    })
                },
                onSuccess: () => {
                    this.props.alert.show(localizations.event_update_calendar_success, {
                        timeout: 3000,
                        type: 'success',
                    });
                    this.setState({
                        isAlreadyAdded: true
                    })
                },
            }
        );
    }

    removeFromMyCalendar = () => {
        if (!this.props.user) {
            this.props.alert.show(localizations.event_login_needed_calendar, {
                timeout: 3000, 
                type: 'error'
            })
            return ;
        }
        let calendar = this.props.user.calendar 
            ? {
                sportunities: this.props.user.calendar.sportunities && this.props.user.calendar.sportunities.edges && this.props.user.calendar.sportunities.edges.length > 0 
                ? this.props.user.calendar.sportunities.edges.map(sportunity => sportunity.node.id) 
                : [],
                users: this.props.user.calendar.users && this.props.user.calendar.users.length > 0 
                ? this.props.user.calendar.users.map(user => user.id)
                : []
            } 
            : {
                sportunities:[],
                users:[]
            } ;

        let sportunityIndex = calendar.sportunities.findIndex(sportunity => {
            return (sportunity === this.props.sportunity.id)
        })
        calendar.sportunities.splice(sportunityIndex, 1);
        
        UpdateCalendarMutation.commit({
                user: this.props.user,
                userIDVar: this.props.user.id,
                calendarVar: calendar,
            },
            {
                onFailure: error => {
                    console.log(error);
                    this.props.alert.show(localizations.event_update_calendar_error, {
                        timeout: 3000,
                        type: 'error'
                    });
                },
                onSuccess: () => {
                    this.props.alert.show(localizations.event_update_calendar_success, {
                        timeout: 3000,
                        type: 'success',
                    });
                    this.setState({
                        isAlreadyAdded: false
                    })
                },
            }
        );
    }

    render() {
        return (
            <div style={styles.container}>
                {this.state.isAlreadyAdded 
                ? <div style={styles.button} onClick={this.removeFromMyCalendar}>{localizations.event_remove_from_calendar}</div>
                : <div style={styles.button} onClick={this.addToMyCalendar}>{localizations.event_add_to_calendar}</div>
                }
            </div>
        );
    }

}

styles = {
    container: {
        
    },
    button: {
        cursor: 'pointer',
    }
};

export default createFragmentContainer(Radium(withAlert(AddToCalendar)), {
    user: graphql`
        fragment AddToCalendar_user on User {
            id
            calendar {
                sportunities (last: 100) {
                    edges {
                        node {
                            id
                        }
                    }
                }
                users {
                    id
                }
            }
        }
    `
})