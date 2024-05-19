import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import Radium from 'radium';

import Switch from '../common/Switch';
import Dropdown from '../NewSportunity/Dropdown';
import Input from '../NewSportunity/Input'

import { colors } from '../../theme';
import localizations from '../Localizations'

let styles;

class NotificationToInvitees extends PureComponent {
    constructor() {
        super();
        this.state = {
            dropdownOpen: false,
        }
    }

    componentDidMount() {
        window.addEventListener('click', this._onClickOutside);
    }

    componentWillUnmount() {
        window.removeEventListener('click', this._onClickOutside);
    }

    _onClickOutside = (event) => {
        const { dropdownOpen } = this.state;
        if (dropdownOpen) {
            if (!this._containerNode.contains(event.target)) {
                this._closeDropdown();
            }
        }
    }

    _openDropdown = () => {
        this.setState({dropdownOpen: true});
    }

    _closeDropdown = () => {
        this.setState({dropdownOpen: false});
    }

    _onValueChange = (event) => {
        let value = event.target.value ;
        let newText = '';
        let numbers = '0123456789';

        for (var i = 0; i < value.length; i++) {
            if ( numbers.indexOf(value[i]) > -1 ) {
                newText = newText + value[i];
            }
        }
        if (parseInt(newText) <= 150)
            this.props._handleNotificationAutoXDaysBeforeChange(parseInt(newText));
    }

    render() {
        const { notificationType, notificationAutoXDaysBefore, _handleNotificationTypeChange, error } = this.props;
        
        const notificationTypeChoices = [
            {value: 'Now', label: localizations.newSportunity_notificationPreferenceImmediateShort},
            {value: 'Manually', label: localizations.newSportunity_notificationPreferenceManuallyShort},
            {value: 'Automatically', label: localizations.newSportunity_notificationPreferenceAutomaticallyShort}
        ]

        const labels = [
            {value: "Now", label: localizations.newSportunity_notificationPreferenceImmediate},
            {value: "Manually", label: localizations.newSportunity_notificationPreferenceManually},
            {value: "Automatically", label: notificationAutoXDaysBefore > 1
                ? localizations.newSportunity_notificationPreferenceAutomatically.replace('{0}', notificationAutoXDaysBefore)
                : localizations.newSportunity_notificationPreferenceAutomaticallyAday
            }
        ]

        const triangleStyle = this.state.dropdownOpen ? styles.triangleOpen : styles.triangle ;
        const finalTriangleStyle = {
            ...triangleStyle,
            top: this.props.rowed ? 15 : 35, 
            borderBottomColor: this.state.dropdownOpen ? colors.green : colors.blue,
        }

        return (
            <div style={styles.container} ref={node => { this._containerNode = node }}>
                <Input
                    label={localizations.newSportunity_notificationPreference}
                    value={labels.find(label => label.value === notificationType).label}
                    onFocus={this._openDropdown}
                    readOnly
                    error={error}
                    rowed={this.props.rowed}
                />

                <span style={finalTriangleStyle} onClick={this._toggleDropdown}/>

                <Dropdown style={{...styles.dropdown, top: this.props.rowed ? 40 : 70,  width: this.props.rowed ? '60%' : '100%'}} open={this.state.dropdownOpen}>
                    <div style={styles.dropdownContent}>
                        <div style={styles.row}>
                            <label style={styles.label}>
                                {localizations.newSportunity_notificationPreferenceLabel}
                            </label>
                            <select style={styles.select} onChange={_handleNotificationTypeChange} value={notificationType}>
                                {notificationTypeChoices
                                    .map((item, index) =>
                                        <option key={index} value={item.value}>
                                            {item.label}
                                        </option>
                                    )
                                }
                            </select>
                        </div>
                        {notificationType === 'Automatically' &&
                            <div style={styles.row}>
                                <label style={styles.label}>
                                    {localizations.newSportunity_notificationPreferenceAutomaticallyNumberOfDays}
                                </label>
                                <input
                                    style={styles.number}
                                    type="number"
                                    value={notificationAutoXDaysBefore}
                                    onChange={this._onValueChange}
                                    maxLength={3}
                                />
                            </div>
                        }
                    </div>
                </Dropdown>
            </div>
        )
    }
}

styles = {
    container: {
        position: 'relative',
        width: '100%',
        marginBottom: 25,
        fontFamily: 'Lato',
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
    row: {
        marginBottom: 25,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    label: {
        display: 'block',
        color: colors.blueLight,
        fontSize: 16,
        lineHeight: 1,
        marginBottom: 8,
    },
    dropdown: {
        position: 'absolute',
        overflow: 'hidden',
        right: 0
    },
    dropdownContent: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    number: {
        height: 35,
        width: 60,
        border: '2px solid #5E9FDF',
        borderRadius: 3,
        textAlign: 'center',
        fontSize: 16,
        fontFamily: 18,
        lineHeight: 1,
        color: 'rgba(146,146,146,0.87)',
        marginLeft: 20
    },
    select: {
        width: 300,
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        borderBottomWidth: 2,
        borderBottomColor: colors.blue,
        fontFamily: 'Lato',
        paddingBottom: 5,
        fontSize: 16,
        lineHeight: 1,
        paddingLeft: 3,
        backgroundColor: colors.white,
        cursor: 'pointer'
    },
}


export default Radium(NotificationToInvitees);
