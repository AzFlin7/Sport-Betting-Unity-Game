import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import {createFragmentContainer, graphql} from 'react-relay';
import Radium from 'radium';
import { withAlert } from 'react-alert'

import TutorialModal from '../common/Tutorial/index.js'
import { colors } from '../../theme';
import localizations from '../Localizations'

import SummonGroups from './SummonGroups';

let styles;

class GroupList extends PureComponent {
    state = {
        tutorial7IsVisible: false,
    }

    componentDidMount() {
        if (this.props.superMe && (this.props.superMe.profileType === 'BUSINESS' || this.props.superMe.profileType === 'ORGANIZATION')) {
            setTimeout(() =>
                this.setState({
                    tutorial7IsVisible: true
                }), 100
            );
        }
    }

    componentWillReceiveProps = (nextProps) => {
        if (this.props.viewer && this.props.viewer.me && this.props.viewer.me.id && !this.props.superMe && nextProps.superMe && (nextProps.superMe.profileType === 'BUSINESS' || nextProps.superMe.profileType === 'ORGANIZATION')) {
            setTimeout(() =>
                this.setState({
                    tutorial7IsVisible: true
                }), 100
            );
        }
    }

    _handleAddClick = (circle) => {
        if (this.props.invitedCircles && this.props.invitedCircles.length > 0 && this.props.invitedCircles.find(element => element.circle.id === circle.id)) {
            this.props.alert.show(localizations.popup_newSportunity_invited_already_exists, {
                timeout: 3000,
                type: 'info',
            });
            return;
        }

        this.props.onAddCircle(circle);
    }

    render() {
        const { invitedCircles, onRemoveInvitedCircle, viewer } = this.props;

        return (
            <div
                style={styles.container}
                ref={node => { this._containerNode = node; }}
            > 
                <TutorialModal
                    isOpen={this.state.tutorial7IsVisible}
                    tutorialNumber={8}
                    tutorialName={"team_small_tutorial7"}
                    message={localizations.team_small_tutorial7}
                    confirmLabel={localizations.team_small_tutorial_ok}
                    onPass={() => this.setState({ tutorial7IsVisible: false })}
                    position={{
                        top: 62,
                        left: 50
                    }}
                    arrowPosition={{
                        top: -8,
                        left: 150
                    }}
                />

                <SummonGroups
                    viewer={viewer}
                    isLoggedIn={this.props.isLoggedIn}
                    addCircle={this._handleAddClick}
                    invitedCircles={invitedCircles}
                    onRemoveInvitedCircle={onRemoveInvitedCircle}
                />
                
            </div>
        );
    }
}

styles = {
    container: {
        position: 'relative',
        width: '100%',
        marginBottom: 25
    },
};

export default createFragmentContainer(Radium(withAlert(GroupList)), {
    viewer: graphql`
        fragment GroupList_viewer on Viewer {
            ...SummonGroups_viewer
            me {
                id
                profileType
                pseudo
                avatar
            }
        }
    `
});
