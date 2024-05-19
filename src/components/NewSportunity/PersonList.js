import React, {Component} from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import {createRefetchContainer, graphql} from 'react-relay';
import Radium from 'radium';
import uniqBy from 'lodash/uniqBy'
import { withAlert } from 'react-alert'
import ChipsArray from "./ChipsArray";

import { colors } from '../../theme';
import localizations from '../Localizations'

import InputUserAutocompleted from '../common/Inputs/InputUserAutocompleted'

let styles;

class PersonList extends Component {
    state = {
        dropdownOpen: false,
        inputContent: '',
        selectedUserAvatar: null,
        selectedUserId: '',
    }

    _handleAddClick = () => {
        const pseudo = this.state.inputContent || this.state.circleInputContent
        if (!pseudo) { return; }

        if (this.props.list && this.props.list.find((element) => element.pseudo === pseudo)) {
            this.props.alert.show(localizations.popup_newSportunity_invited_already_exists, {
                timeout: 3000,
                type: 'info',
            });
            this.setState({
                inputContent: '',
                selectedUserId: '',
                selectedUserAvatar: null,
            })

            return;
        }

        let isEmail = this.isValidEmailAddress(pseudo);
        if (!isEmail && !this.isValidPseudo(pseudo)) {
            this.props.alert.show(localizations.popup_newSportunity_invited_user_doesnt_exist, {
                timeout: 3000,
                type: 'info',
            });
            return;
        }

        let avatar = this.state.selectedUserAvatar

        this.props.relay.refetch(fragmentVariables => ({
            ...fragmentVariables,
            pseudo: !isEmail ? pseudo : "",
            email: isEmail ? pseudo : ""
        }), 
        null,
        () => {
            setTimeout(() => {
                if (this.props.viewer.personListUserExists || isEmail) {
                    if (pseudo) {
                        this.props.onAddItem(pseudo, avatar, this.state.selectedUserId);
                        setTimeout(() => 
                            this.setState({
                                inputContent: '',
                                selectedUserId: '',
                                selectedUserAvatar: null
                            }), 50
                        )
                    }
                }
                else {
                    this.props.alert.show(localizations.popup_newSportunity_invited_user_doesnt_exist, {
                        timeout: 3000,
                        type: 'info',
                    });
                }
            }, 50);
        });
    }

    isValidEmailAddress(address) {
        let re = /^[a-z0-9][a-z0-9-_\.]+@([a-z]|[a-z0-9]?[a-z0-9-]+[a-z0-9])\.[a-z0-9]{2,10}(?:\.[a-z]{2,10})?$/;
        return re.test(address)
    }

    isValidPseudo(str) {
        return !/[~`!#$%\^&*+=\\[\]\\';,/{}|\\":<>\?]/g.test(str);
    }

    _handleAutocompleteClicked = (user) => {
        this.setState({
            inputContent: user.pseudo,
            selectedUserId: user.id,
            selectedUserAvatar: user.avatar,
        }, () => {
            this._handleAddClick()
        })
    }

    render() {
        return (
            <div style={styles.container}> 
                <InputUserAutocompleted
                    viewer={this.props.viewer}
                    handleAutocompleteClicked={this._handleAutocompleteClicked}
                    label={localizations.circle_pseudo}
                    userType={'PERSON'}
                    clearOnClicked={true}
                />
                {this.props.list && this.props.list.length > 0 && 
                    <div style={styles.chip}>
                        <ChipsArray
                            chipData={this.props.list.map((item, index) => ({
                                key: index,
                                label: item.pseudo,
                                id: item.id
                            }))}
                            onDelete={(data, e) => this.props.onRemoveItem(data.key, e)}
                        />
                    </div>
                }
            </div>
        );
    }
}

PersonList.defaultProps = {
    list: [],
    placeholder: 'Select',
}

styles = {
    container: {
        position: 'relative',
        width: '100%',
        marginBottom: 25
    },
    chip: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
};

export default createRefetchContainer(Radium(withAlert(PersonList)), {
    viewer: graphql`
        fragment PersonList_viewer on Viewer @argumentDefinitions (
            pseudo: {type: "String", defaultValue: "_"},
            email: {type: "String", defaultValue: "_"},
        ) {
            ...InputUserAutocompleted_viewer
            me {
                id
                profileType
                pseudo
                avatar
            }
            personListUserExists: userExists (pseudo: $pseudo, email: $email)
        }
    `},
    graphql`query PersonListRefetchQuery (
        $pseudo: String,
        $email: String,
    ) {
        viewer {
            ...PersonList_viewer @arguments (
                pseudo: $pseudo,
                email: $email,
            )
        }
    }`
);
