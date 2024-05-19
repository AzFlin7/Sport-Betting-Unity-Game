import React from 'react';
import Radium from 'radium';

import Switch from '../common/Switch';
import Dropdown from './Dropdown';
import Input from './Input'

import TutorialModal from '../common/Tutorial/index.js'
import { colors } from '../../theme';
import localizations from '../Localizations'

let styles;

class Privacy extends React.Component {
    constructor() {
        super();
        this.state = {
            dropdownOpen: false,
            tutorial8IsVisible: false
        }
    }

    componentDidMount() {
        window.addEventListener('click', this._onClickOutside);
        if (this.props.superMe && (this.props.superMe.profileType === 'BUSINESS' || this.props.superMe.profileType === 'ORGANIZATION')) {
            setTimeout(() =>
                this.setState({
                    tutorial8IsVisible: true
                }), 100
            );
        }
    }

    componentWillReceiveProps = (nextProps) => {
        if (this.props.me && this.props.me.id && !this.props.superMe && nextProps.superMe && (nextProps.superMe.profileType === 'BUSINESS' || nextProps.superMe.profileType === 'ORGANIZATION')) {
            setTimeout(() =>
                this.setState({
                    tutorial8IsVisible: true
                }), 100
            );
        }
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

    _toggleDropdown = () => {
        if (this.state.dropdownOpen) {
            this._closeDropdown();
        }
        else {
            this._openDropdown();
        }
    };

    _openDropdown = () => {
        this.refs._inputNode._focus();
        this.setState({ dropdownOpen: true, tutorial8IsVisible: false, tutorial8IsVisible: false });
    };

    _closeDropdown = () => {
        this.refs._inputNode._onBlur();
        this.setState({ dropdownOpen: false });
    };

    _onValueChange = (event) => {
        let value = event.target.value;
        let newText = '';
        let numbers = '0123456789';

        for (var i = 0; i < value.length; i++) {
            if (numbers.indexOf(value[i]) > -1) {
                newText = newText + value[i];
            }
        }
        if (parseInt(newText) <= 150)
            this.props._handleAutoSwitchPrivacyXDaysBeforeChange(parseInt(newText));
    }

    render() {
        const { privateChecked, autoSwitchPrivacyChecked, autoSwitchPrivacyXDaysBefore,
            _handlePrivateChange, _handleAutoSwitchPrivacyChange,
            error } = this.props;


        const triangleStyle = this.state.dropdownOpen ? styles.triangleOpen : styles.triangle;
        const finalTriangleStyle = {
            ...triangleStyle,
            borderBottomColor: this.state.dropdownOpen ? colors.green : colors.blue,
        }

        return (
            <div style={styles.container} ref={node => { this._containerNode = node }}>
                {/* <Input
                    label={localizations.newSportunity_privacy}
                    ref="_inputNode"
                    value={privateChecked ? localizations.newSportunity_private : localizations.newSportunity_public}
                    onFocus={this._openDropdown}
                    readOnly
                    error={error}
                />
                <span style={finalTriangleStyle} onClick={this._toggleDropdown}/>
 */}
                <TutorialModal
                    isOpen={this.state.tutorial8IsVisible}
                    tutorialNumber={9}
                    tutorialName={"team_small_tutorial8"}
                    message={localizations.team_small_tutorial8}
                    confirmLabel={localizations.team_small_tutorial_ok}
                    onPass={() => this.setState({ tutorial8IsVisible: false })}
                    hideLabel={localizations.team_small_tutorial_hide}
                    position={{
                        top: 62,
                        left: 50
                    }}
                    arrowPosition={{
                        top: -8,
                        left: 150
                    }}
                />

                {/* <Dropdown style={styles.dropdown} open={this.state.dropdownOpen}> */}
                <div style={styles.dropdownContent} onKeyPress={e => e.key === 'Enter' && this._closeDropdown()}>
                    <div style={styles.row}>
                        <div style={styles.titles}>
                            {localizations.newSportunity_privacy}
                        </div>
                        <label style={styles.label}>
                            {privateChecked ? localizations.newSportunity_private : localizations.newSportunity_public}
                        </label>
                        <Switch
                            containerStyle={styles.switch}
                            checked={privateChecked}
                            onChange={_handlePrivateChange}
                        />
                        {this.props.helperText ? <span style={styles.helpertext}>{this.props.helperText}</span> : null}
                    </div>
                    {privateChecked &&
                        <div style={styles.row}>
                            <label style={styles.label}>
                                {autoSwitchPrivacyChecked
                                    ? localizations.newSportunity_autoSwitchPrivacy
                                    : localizations.newSportunity_autoSwitchPrivacyOff}
                            </label>
                            <Switch
                                containerStyle={styles.switch}
                                checked={autoSwitchPrivacyChecked}
                                onChange={_handleAutoSwitchPrivacyChange}
                            />
                        </div>
                    }
                    {privateChecked && autoSwitchPrivacyChecked &&
                        <div style={styles.row}>
                            <label style={styles.label}>
                                {localizations.newSportunity_autoSwitchPrivacyXDays}
                            </label>
                            <input
                                style={styles.number}
                                type="number"
                                value={autoSwitchPrivacyXDaysBefore}
                                onChange={this._onValueChange}
                                maxLength={3}
                            />
                        </div>
                    }
                </div>
                {/* </Dropdown> */}
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
        marginBottom: 5,
        display: 'block',
        alignItems: 'center',
    },
    label: {
        display: 'inline-block',
        color: '#9A9A9A',
        fontSize: 16,
        lineHeight: 1,
        marginTop: '23px',
    },
    dropdown: {
        position: 'absolute',
        top: 70,
        width: '100%',
        overflow: 'hidden',
    },
    dropdownContent: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    switch: {
        marginLeft: 20,
        display: 'inline-block',
    },
    number: {
        height: 35,
        width: 60,
        border: '0px solid #5E9FDF',
        borderRadius: 3,
        textAlign: 'center',
        fontSize: 16,
        fontFamily: 18,
        lineHeight: 1,
        color: 'rgba(146,146,146,0.87)',
        marginLeft: 20,
        backgroundColor: '#E2E2E2',

    },
    titles: {
        fontSize: 18,
        fontFamily: 'Lato',
        display: 'block',
        marginTop: '15px',
    },
    helpertext: {
        fontSize: '12px',
        color: '#666',
        display: 'inline-block',
        marginLeft: '10px'
    }
}


export default Radium(Privacy);
