import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import Switch from '../common/Switch';
import localizations from '../Localizations'
import {confirmModal} from '../common/ConfirmationModal'

class CircleAutoParticipate extends PureComponent {
    constructor() {
        super()
        this._handleAutoParticipateChange = this._handleAutoParticipateChange.bind(this);
        this.state = {
            initialValue: false
        }
    }

    componentDidMount = () => {
        if (this.props.checked) {
            this.setState({
                initialValue: this.props.checked
            })
        }
    }

    _handleAutoParticipateChange = checked => {
        const { onChange } = this.props;
        if (this.state.initialValue && this.props.isModifying) {
            //this.props.closeDropdown()
            confirmModal({
                title: localizations.newSportunity_autoParticipateUnswitchACircleModalTitle,
                message: localizations.newSportunity_autoParticipateUnswitchACircleModalMessage,
                confirmLabel: localizations.newSportunity_autoParticipateUnswitchACircleModalConfirm,
                cancelLabel: localizations.newSportunity_autoParticipateUnswitchACircleModal,
                canCloseModal: true,
                onConfirm: () => {
                    onChange(checked);
                  //  this.props.openDropdown()
                },
                onCancel: () => {
                 //   this.props.openDropdown()
                }
            })
        }
        else
            onChange(checked);
    }

    render() {
        return (
            <div style={styles.container}>
                <label style={this.props.labelStyle}>{localizations.newSportunity_autoParticipateInvitedCircles}</label>
                <div style={styles.switch}>
                    <Switch
                        checked={this.props.checked}
                        onChange={this._handleAutoParticipateChange}
                    />
                </div>
            </div>
        )
    }
}

const styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    switch: {
        marginTop: 25,
        marginBottom: 20,
    }
}

export default CircleAutoParticipate;
