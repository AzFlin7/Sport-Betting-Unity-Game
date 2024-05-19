import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import Radium from 'radium';
import { withAlert } from 'react-alert'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';

import localizations from '../Localizations'
import { colors } from '../../theme';
import UpdateCalendarMutation from './UpdateCalendarMutation'

let styles;

class AddToCalendar extends PureComponent {
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
        let {calendar} = nextProps.me || {};

        if (calendar && calendar.sportunities && calendar.sportunities.edges && calendar.sportunities.edges.length > 0) {
            calendar.users.forEach(user => {
            if (user.id === nextProps.userId)
                this.setState({isAlreadyAdded: true}) ;
            })
        }
    }

    addToMyCalendar = () => {
        if (!this.props.me) {
            this.props.alert.show(localizations.event_login_needed_calendar, {
                timeout: 3000,
                type: 'error'
            })
            return ;
        }
        let calendar = this.props.me.calendar
        ? {
            sportunities: this.props.me.calendar.sportunities && this.props.me.calendar.sportunities.edges && this.props.me.calendar.sportunities.edges.length > 0
            ? this.props.me.calendar.sportunities.edges.map(sportunity => sportunity.node.id)
            : [],
            users: this.props.me.calendar.users && this.props.me.calendar.users.length > 0
            ? this.props.me.calendar.users.map(user => user.id)
            : []
        }
        : {
            sportunities:[],
            users:[]
        } ;
        calendar.users.push(this.props.userId);

        UpdateCalendarMutation.commit({
                me: this.props.me,
                userIDVar: this.props.me.id,
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
        if (!this.props.me) {
            this.props.alert.show(localizations.event_login_needed_calendar, {
                timeout: 3000,
                type: 'error'
            })
            return ;
        }
        let calendar = this.props.me.calendar
            ? {
                sportunities: this.props.me.calendar.sportunities && this.props.me.calendar.sportunities.edges && this.props.me.calendar.sportunities.edges.length > 0
                ? this.props.me.calendar.sportunities.edges.map(sportunity => sportunity.node.id)
                : [],
                users: this.props.me.calendar.users && this.props.me.calendar.users.length > 0
                ? this.props.me.calendar.users.map(user => user.id)
                : []
            }
            : {
                sportunities:[],
                users:[]
            } ;

        let userIndex = calendar.users.findIndex(user => {
            return (user === this.props.userId)
        })
        calendar.users.splice(userIndex, 1);

        UpdateCalendarMutation.commit({
                me: this.props.me,
                userIDVar: this.props.me.id,
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
                    });
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
        marginTop: 15
    },
    button: {
        cursor: 'pointer',
        fontSize: 16,
        fontFamily: 'Lato',
        color: colors.lightGray
    }
};

export default createFragmentContainer(Radium(withAlert(AddToCalendar)), {
    me: graphql`
        fragment AddToCalendar_me on User {
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
