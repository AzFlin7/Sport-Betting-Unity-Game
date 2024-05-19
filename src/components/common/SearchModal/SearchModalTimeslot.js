import React, { Component } from 'react';
import { render } from 'react-dom';
import { withAlert } from 'react-alert'
import { createRefetchContainer, graphql, QueryRenderer } from 'react-relay'
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import Radium, { StyleRoot } from 'radium';
import ReactLoading from 'react-loading'
import { withStyles } from '@material-ui/core/styles';
import cloneDeep from 'lodash/cloneDeep';
import { Link } from 'found';

import CommentIcon from '@material-ui/icons/Comment';
import Typography from '@material-ui/core/Typography'
import SvgIcon from '@material-ui/core/SvgIcon'
import Input from '@material-ui/core/Input'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import ListSubheader from '@material-ui/core/ListSubheader'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import IconButton from '@material-ui/core/IconButton'
import Collapse from '@material-ui/core/Collapse'
import Avatar from '@material-ui/core/Avatar'
import InboxIcon from '@material-ui/icons/MoveToInbox';
import DraftsIcon from '@material-ui/icons/Drafts';
import SendIcon from '@material-ui/icons/Send';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import StarBorder from '@material-ui/icons/StarBorder';
import Chip from '@material-ui/core/Chip';
import TextField from '@material-ui/core/TextField';
import isEqual from 'lodash/isEqual'

import environment from 'sportunity/src/createRelayEnvironment';
import localizations from '../../Localizations'
import { styles } from './styles';
import { colors, metrics } from '../../../theme';
import HeadTabs from '../HeadTabs';


const TabContainer = (props) => (
    <div style={{ flex: 20 }}>
        <Typography component="div">
            {props.children}
        </Typography>
    </div>
);
TabContainer.propTypes = {
    children: PropTypes.node.isRequired,
};

const UnStyledCircleItem = ({ classes, circle, onItemTap, onCirleMemberItemTap, state, onCheckboxChange, onSelectAllChange, allowToSeeCircleDetails, displayPriceField, handleChangePrice, price_for_circles, currency }) => {
    let isAllSelected = true;
    circle.members.forEach(member => isAllSelected = isAllSelected && state.checked.findIndex(checkedMember => checkedMember.id === member.id) >= 0)

    return (
        <div key={circle.id} style={styles.cirlcelistdiv}>
            <ListItem style={styles.listItemWrapper} className={classes.listmain} onClick={onItemTap(circle)}>

                <div style={styles.buttonIcon}>
                    <div style={styles.numberContainer}>
                        <span style={styles.number}>
                            {circle.memberCount}
                        </span>
                    </div>
                </div>
                <ListItemText inset primary={circle.name} secondary={circle.owner.pseudo} className={classes.listtext} />
                {displayPriceField && state.checked.findIndex(checkedCircle => checkedCircle.id === circle.id) >= 0 &&
                    <ListItemSecondaryAction>
                        <TextField
                            id="outlined-name"
                            label={localizations.price + ` (${currency})`}
                            className={classes.textField}
                            value={
                                price_for_circles.find(price_for_circle => price_for_circle.circle.id === circle.id)
                                    ? price_for_circles.find(price_for_circle => price_for_circle.circle.id === circle.id).price.cents / 100
                                    : 0
                            }
                            onChange={e => handleChangePrice(e.target.value, circle)}
                            margin="normal"
                            variant="outlined"
                        />
                    </ListItemSecondaryAction>
                }
                {!allowToSeeCircleDetails &&
                    <Checkbox
                        checked={state.checked.findIndex(checkedCircle => checkedCircle.id === circle.id) >= 0}
                        color="primary"
                        style={styles.listcheckbox}
                        className={classes.listcheckbox}
                    />
                }
            </ListItem>
            {allowToSeeCircleDetails &&
                <Collapse in={state.openedNodes.indexOf(circle.id) !== -1} timeout="auto" unmountOnExit>
                    <MembersList
                        onItemTap={onCirleMemberItemTap}
                        checked={state.checked}
                        members={circle.members}
                        showSelectAll={true}
                        isAllSelected={isAllSelected}
                        onSelectAllChange={onSelectAllChange}
                    />
                </Collapse>
            }
        </div>
    )
}

const CircleItem = withStyles({
    textField: {
        margin: 16
    },
    listcheckbox
        : {
        padding: 0
    },
    listtext: {
        borderLeft: '1px solid #ccc',
        marginLeft: '5px',
        padding: '10px'
    },
    listmain: {
        padding: '0 10px'
    }
})(UnStyledCircleItem);

const CirclesList = (props) => {
    const { onItemTap, searchFieldValue, isAllCirclesSelected, open, state, onCheckboxChange, checked, circles, onCirleMemberItemTap, displayLoadMore, onLoadMore, isLoadingMore, onSelectAllChange, count } = props;

    return (
        <div>
            <List
                component="nav"
            >
                {circles && count > 0
                    ? circles && circles
                        .map(edge => edge.node)
                        .map((circle, index) => (
                            <CircleItem
                                key={index}
                                circle={circle}
                                onSelectAllChange={onSelectAllChange}
                                {...props}
                            />
                        ))
                    : <div style={styles.noResult}>
                        {searchFieldValue && searchFieldValue.length > 0
                            ? localizations.searchModule_No_result
                            : <span>
                                {localizations.searchModule_No_Group.split('{0}')[0]}
                                <Link to="/my-circles">
                                    {localizations.searchModule_No_Group_link}
                                </Link>
                                {localizations.searchModule_No_Group.split('{0}')[1]}
                            </span>
                        }
                    </div>
                }
                {displayLoadMore && !isLoadingMore &&
                    <div style={styles.loadMoreButton} onClick={onLoadMore}>
                        {localizations.searchModule_loadMore}
                    </div>
                }
                {isLoadingMore &&
                    <div style={styles.smallLoadingContainer}>
                        <ReactLoading type='spinningBubbles' color={colors.blue} height={40} width={40} />
                    </div>
                }
            </List>
        </div>
    );
}

CirclesList.propTypes = {
    onItemTap: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    state: PropTypes.any,
    onCheckboxChange: PropTypes.func,
    checked: PropTypes.any,
    members: PropTypes.any,
    onCirleMemberItemTap: PropTypes.any,
    onSelectAllChange: PropTypes.func,
    isAllCirclesSelected: PropTypes.any
};

function InviteList(props) {
    const { nameFieldValue, onChangeName, onInvite } = props;
    return (
        <div >
            <List component="nav">
                <ListItem style={styles.inviteWrapper}>
                    <div style={{ display: 'flex', width: '100%' }}>
                        <div style={{ width: 80, textAlign: 'center' }}>
                            <img src="/svg-icons/person.svg" style={styles.icon} />
                        </div>
                        <Input
                            placeholder={localizations.searchModule_name}
                            disableUnderline={true}
                            style={styles.searchField}
                            value={nameFieldValue}
                            inputProps={{ 'aria-label': 'Description', tabIndex: 2 }}
                            onChange={onChangeName}
                        />
                    </div>
                    <Button onClick={onInvite} style={styles.inviteButton} >
                        {localizations.searchModule_Invite}
                    </Button>
                </ListItem>
            </List>
        </div>
    );
}

const SelectedChip = props => {
    const { onRemoveItem, selectedMembers } = props;

    return (
        <div style={styles.chipPanel}>
            {selectedMembers.map((member, index) => (
                <Chip
                    key={index}
                    label={member.pseudo}
                    onDelete={onRemoveItem(member.id)}
                    className={props.classes.chip}
                    clickable={false}
                    color="primary"
                />
            ))}
        </div>
    );
}

SelectedChip.propTypes = {
    onRemoveItem: PropTypes.func.isRequired,
    selectedMembers: PropTypes.any,
};

const StyledSelectedChip = withStyles({
    root: {
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    chip: {
        marginRight: 5,
        marginLeft: 5,
        marginTop: 5,
        background: '#64a5d7',
        color: 'white',
    },
})(SelectedChip);

const MembersList = (props) => {
    const { onItemTap, checked, onCheckboxChange, members, isAllSelected, onSelectAllChange, showSelectAll } = props;
    return (
        <div>
            {showSelectAll &&
                <div style={styles.selectAllWrapper} onClick={() => onSelectAllChange(isAllSelected, members)}>
                    <Checkbox
                        checked={isAllSelected}
                        color="primary"
                    />
                    <span>{localizations.searchModule_selectAll}</span>
                </div>
            }
            <List>
                {members.map(member => (
                    <ListItem
                        key={member.id}
                        role={undefined}
                        dense
                        button
                        onClick={() => onItemTap(member)}
                        style={styles.listItemWrapper}
                    >
                        <Checkbox
                            checked={checked.findIndex(checkedMember => checkedMember.id === member.id) >= 0}
                            color="primary"
                        />
                        <img src={member.avatar} style={styles.avatorIcon} />

                        <div style={styles.titleWrapper}>
                            <div style={styles.titleName}>
                                {member.pseudo}
                            </div>

                            {member.firstName && member.lastName &&
                                <div style={styles.titleCaption}>
                                    {member.firstName + '  ' + member.lastName}
                                </div>
                            }
                        </div>
                    </ListItem>
                ))}
            </List>
        </div>
    );
}

MembersList.propTypes = {
    onItemTap: PropTypes.func.isRequired,
    onCheckboxChange: PropTypes.func,
    checked: PropTypes.any,
    members: PropTypes.any,
    onSelectAllChange: PropTypes.func,
    isAllSelected: PropTypes.any,
    showSelectAll: PropTypes.any
};

const SearchBar = props => {
    const { placeholder, onChange, onErase, searchFieldValue, image } = props;
    return (
        <Typography component="div" style={styles.searchBarcustom}>
            <div style={styles.searchIconWrapper}>
                <img src={image} style={styles.searchIcon} />
            </div>
            <Input
                placeholder={placeholder}
                disableUnderline={true}
                style={styles.searchField}
                value={searchFieldValue}
                inputProps={{ 'aria-label': 'Description', tabIndex: 1 }}
                onChange={onChange}
            />

            {!!searchFieldValue && searchFieldValue !== '' &&
                <Button onClick={onErase} style={styles.eraseButton}>
                    {localizations.searchModule_erase}
                </Button>
            }
        </Typography>
    );
}

SearchBar.propTypes = {
    onChange: PropTypes.func.isRequired,
    onErase: PropTypes.func.isRequired,
    searchFieldValue: PropTypes.any,
};

const Container = props => {
    return (
        <div>
            {props.isModal
                ? <Modal
                    isOpen={props.isOpen}
                    style={styles.modalStyles}
                >
                    {props.children}
                </Modal>
                : <div style={props.maxHeight ? { maxHeight: props.maxHeight, overflow: "auto" } : { maxHeight: 600, overflow: "auto" }}>
                    {props.children}
                </div>
            }
        </div>
    )
}

class SearchModalTimeslot extends Component {
    static contextTypes = {
        relay: PropTypes.shape({
            variables: PropTypes.object,
        }),
    }

    typingTimer;
    doneTypingInterval = 800;

    constructor(props) {
        super(props);
        this.state = {
            open: false,
            nestOpen: false,
            activeTab: "People",
            checked: [],
            searchValue: '',
            openedNodes: [],
            isAllSelected: false,
            isAllCirclesSelected: false,
            membersSearchFieldValue: '',
            circlesSearchFieldValue: '',
            publicCirclesSearchFieldValue: '',
            inviteSearchFieldValue: '',
            nameFieldValue: '',
            circles: [],
            price_for_circles: [],
            circlesNumber: 15,
            publicCirclesNumber: 15
        }
    }

    componentDidMount() {
        if (this.props.isOpen) {
            setTimeout(() => { this.setState({ open: true }) }, 50)
        }
        if (this.props.openOnTab) {
            this.setState({ activeTab: this.props.openOnTab })
        }
        this.setInitialFilters()

        if (this.props.defaultCircleList && this.props.defaultCircleList.length > 0) {
            this.setState({
                checked: cloneDeep(this.props.defaultCircleList)
            })
        }

        if (this.props.defaultPriceList && this.props.defaultPriceList.length > 0) {
            this.setState({
                price_for_circles: cloneDeep(this.props.defaultPriceList)
            })
        }
    }

    componentWillReceiveProps = nextProps => {
        if ((!this.props.defaultCircleList || this.props.defaultCircleList.length === 0) && nextProps.defaultCircleList && nextProps.defaultCircleList.length > 0) {
            this.setState({
                checked: nextProps.defaultCircleList
            })
        }
        if (!!this.props.checkedUsers && !!nextProps.checkedUsers && !isEqual(this.props.checkedUsers, nextProps.checkedUsers)) {
            this.setState({
                checked: nextProps.checkedUsers
            })
        }
    }

    setInitialFilters = () => {
        if (this.props.queryCirclesOnOpen && this.props.tabs.indexOf("Groups") >= 0) {
            this.setState({ isLoading: true });

            const refetchVariables = fragmentVariables => {
                let variables = {
                    ...fragmentVariables,
                    queryMain: true,
                    queryCircles: true,
                    circlesFilter: {
                        circleType: this.props.circleTypes || ['MY_CIRCLES', 'CIRCLES_I_AM_IN', 'CHILDREN_CIRCLES', 'PUBLIC_CIRCLES'],
                        types: this.props.types,
                        seeAs: this.props.seeAs
                    },
                    firstCircles: 15,
                    queryPublicCircles: this.props.tabs.indexOf("PublicGroups") >= 0,
                    publicCirclesFilter: {
                        circleType: ['PUBLIC_CIRCLES'],
                        types: this.props.types,
                        sport: this.props.publicGroupsSport
                            ? [{ sportID: this.props.publicGroupsSport.id }]
                            : null,
                        seeAs: this.props.seeAs,
                        location: this.props.around ? { radius: 200, lat: this.props.around.lat, lng: this.props.around.lng } : null
                    },
                    publicFirstCircles: 15,
                    autocompletion_required: false,
                }

                if (this.props.from === 'new-sportunity-invitations' || this.props.from === "invite-from-event") {
                    variables.circlesFilter.isCircleUsableByMember = true
                    if (this.props.tabs.indexOf("PublicGroups") >= 0)
                        variables.publicCirclesFilter.isCircleUsableByMember = true
                }

                if (typeof this.props.childrenOnly !== 'undefined') {
                    variables.childrenOnly = this.props.childrenOnly
                }

                return variables
            }

            this.props.relay.refetch(
                refetchVariables,
                null,
                () => {
                    this.setState({ isLoading: false })
                }
            )
        }
    }

    handleMembersItemTap = (member) => {
        let isSelectedIndex = this.state.checked.findIndex(checkedMember => checkedMember.id === member.id);
        let newState = this.state.checked;

        if (isSelectedIndex >= 0) {
            newState.splice(isSelectedIndex, 1);
        }
        else {
            newState.push(member)
        }

        this.setState({
            checked: newState
        })

        if (this.props.noNeedToValidate) {
            this.props.onValide(this.state.checked)
        }
    }

    onChangeTab = (event, value) => {
        this.setState({ activeTab: value })

        if (value.indexOf('Groups') >= 0) {
            this.setState({ isLoading: true });

            const refetchVariables = fragmentVariables => {
                let variables = {
                    ...fragmentVariables,
                    queryMain: true,
                    queryCircles: true,
                    circlesFilter: {
                        circleType: this.props.circleTypes || ['MY_CIRCLES', 'CIRCLES_I_AM_IN', 'CHILDREN_CIRCLES', 'PUBLIC_CIRCLES'],
                        types: this.props.types,
                        seeAs: this.props.seeAs
                    },
                    firstCircles: 15,
                    queryPublicCircles: this.props.tabs.indexOf("PublicGroups") >= 0,
                    publicCirclesFilter: {
                        circleType: ['PUBLIC_CIRCLES'],
                        types: this.props.types,
                        sport: this.props.publicGroupsSport
                            ? [{ sportID: this.props.publicGroupsSport.id }]
                            : null,
                        seeAs: this.props.seeAs,
                        location: this.props.around ? { radius: 200, lat: this.props.around.lat, lng: this.props.around.lng } : null
                    },
                    publicFirstCircles: 15,
                    autocompletion_required: this.state.membersSearchFieldValue ? true : false,
                    pseudo_autocomplete: this.isValidEmailAddress(this.state.membersSearchFieldValue) ? null : this.state.membersSearchFieldValue,
                    email_autocomplete: this.isValidEmailAddress(this.state.membersSearchFieldValue) ? this.state.membersSearchFieldValue : null,
                }

                if (this.props.from === 'new-sportunity-invitations' || this.props.from === "invite-from-event") {
                    variables.circlesFilter.isCircleUsableByMember = true
                    if (this.props.tabs.indexOf("PublicGroups") >= 0)
                        variables.publicCirclesFilter.isCircleUsableByMember = true
                }

                if (typeof this.props.childrenOnly !== 'undefined') {
                    variables.childrenOnly = this.props.childrenOnly
                }

                return variables
            }

            this.props.relay.refetch(
                refetchVariables,
                null,
                () => {
                    this.setState({ isLoading: false })
                }
            )
        }
    }

    handleCirclesSelectAllMembers = (isAllSelected, members) => {
        let newState = this.state.checked;

        members.forEach(member => {
            let isSelectedIndex = newState.findIndex(checkedMember => checkedMember.id === member.id);

            if (isSelectedIndex >= 0 && isAllSelected) {
                newState.splice(isSelectedIndex, 1);
            }
            else if (isSelectedIndex < 0 && !isAllSelected) {
                newState.push(member)
            }
        })

        this.setState({
            checked: newState
        })
    }

    handleRemoveItem = value => () => {
        const { checked } = this.state;
        const currentIndex = checked.findIndex(checkedMember => checkedMember.id === value);
        const newChecked = [...checked];
        if (currentIndex !== -1) {
            newChecked.splice(currentIndex, 1);
        }
        this.setState({
            checked: newChecked,
        }, () => {
            if (this.props.noNeedToValidate) {
                this.props.onValide(this.state.checked)
            }
        });
    }

    handleCirclesItemTap = value => () => {
        if (this.props.allowToSeeCircleDetails) {
            if (value.id && value.members && value.members.length > 0) {
                const { openedNodes } = this.state;
                const currentIndex = openedNodes.indexOf(value.id);
                const newOpened = [...openedNodes];

                if (currentIndex === -1) {
                    newOpened.push(value.id);
                } else {
                    newOpened.splice(currentIndex, 1);
                }

                this.setState({
                    openedNodes: newOpened,
                });
            }
        }
        else {
            let isSelectedIndex = this.state.checked.findIndex(checkedMember => checkedMember.id === value.id);
            let newState = this.state.checked;

            if (isSelectedIndex >= 0) {
                newState.splice(isSelectedIndex, 1);
            }
            else {
                newState.push(value)
            }

            this.setState({
                checked: newState
            }, () => {
                if (this.props.noNeedToValidate) {
                    this.props.onValide(this.state.checked)
                }
            })
        }
    }


    isValidEmailAddress(address) {
        let re = /^[a-z0-9][a-z0-9-_\.]+@([a-z]|[a-z0-9]?[a-z0-9-]+[a-z0-9])\.[a-z0-9]{2,10}(?:\.[a-z]{2,10})?$/;
        return re.test(address.toLowerCase())
    }

    onValideTap = () => {
        if (!this.state.checked || this.state.checked.length === 0) {
            this.props.alert.show(localizations.searchModule_selectOne, {
                timeout: 2000,
                type: 'error'
            })
            return;
        }

        if (this.props.displayPriceField) {
            this.props.onValideWithPrice(this.state.checked, this.state.price_for_circles);
        }
        else {
            this.props.onValide(this.state.checked);
        }
    }

    onInviteEraseTap = () => {
        this.setState({
            inviteSearchFieldValue: ''
        });
    }

    onCirclesEraseTap = () => {
        this.setState({
            checked: [],
            isAllSelected: false,
            isAllCirclesSelected: false,
            circlesSearchFieldValue: '',
            publicCirclesSearchFieldValue: ''
        });
    }

    handleInviteTap = () => {
        if (!this.isValidEmailAddress(this.state.inviteSearchFieldValue)) {
            this.props.alert.show(localizations.popup_completeProfile_email_error, {
                timeout: 2000,
                type: 'error',
            })
            return;
        }
        if (!this.state.nameFieldValue || this.state.nameFieldValue === "circle_new_error1") {
            this.props.alert.show(localizations.circle_new_error1, {
                timeout: 2000,
                type: 'error'
            })
            return;
        }

        this.props.onInvite({
            invitedEmail: this.state.inviteSearchFieldValue,
            invitedPseudo: this.state.nameFieldValue
        })
        this.setState({
            nameFieldValue: '',
            inviteSearchFieldValue: '',
        });
    }

    handleInviteInputChange = event => {
        this.setState({
            inviteSearchFieldValue: event.target.value
        })
    }

    handleNameChange = event => {
        this.setState({
            nameFieldValue: event.target.value
        })
    }

    handleCirclesInputChange = event => {
        let value = event.target.value
        this.setState({
            circlesSearchFieldValue: value,
            isLoading: true
        });

        clearTimeout(this.typingTimer);
        this.typingTimer = setTimeout(() => this.handleRefetchAfterCircleInputChange(value), this.doneTypingInterval);
    }

    handlePublicCirclesInputChange = event => {
        let value = event.target.value
        this.setState({
            publicCirclesSearchFieldValue: value,
            isLoading: true
        });

        clearTimeout(this.typingTimer);
        this.typingTimer = setTimeout(() => this.handleRefetchAfterPublicCircleInputChange(value), this.doneTypingInterval);
    }

    handleRefetchAfterCircleInputChange = text => {
        if ((text !== '' && text) || this.props.queryCirclesOnOpen) {
            const refetchVariables = fragmentVariables => {
                let variables = {
                    ...fragmentVariables,
                    queryMain: true,
                    queryCircles: true,
                    circlesFilter: {
                        nameCompletion: text,
                        code: text,
                        circleType: this.props.circleTypes || ['MY_CIRCLES', 'CIRCLES_I_AM_IN', 'CHILDREN_CIRCLES', 'PUBLIC_CIRCLES'],
                        types: this.props.types,
                        seeAs: null
                    },
                    firstCircles: 15,
                    autocompletion_required: false,
                }

                if (this.props.from === 'new-sportunity-invitations' || this.props.from === "invite-from-event")
                    variables.circlesFilter.isCircleUsableByMember = true

                if (typeof this.props.childrenOnly !== 'undefined') {
                    variables.childrenOnly = this.props.childrenOnly
                }

                return variables
            }

            this.props.relay.refetch(
                refetchVariables,
                null,
                () => {
                    this.setState({ isLoading: false })
                }
            )
        }
        else {
            this.handleClearInput()
        }
    }

    handleRefetchAfterPublicCircleInputChange = text => {
        if ((text !== '' && text) || this.props.queryCirclesOnOpen) {
            const refetchVariables = fragmentVariables => {
                let variables = {
                    ...fragmentVariables,
                    queryMain: true,
                    queryPublicCircles: this.state.activeTab === "PublicGroups",
                    publicCirclesFilter: {
                        nameCompletion: text,
                        code: text,
                        circleType: ['PUBLIC_CIRCLES'],
                        types: this.props.types,
                        seeAs: this.props.seeAs,
                        location: this.props.around ? { radius: 200, lat: this.props.around.lat, lng: this.props.around.lng } : null
                    },
                    publicFirstCircles: 15,
                    autocompletion_required: false,
                }

                if (this.props.from === 'new-sportunity-invitations' || this.props.from === "invite-from-event")
                    variables.publicCirclesFilter.isCircleUsableByMember = true

                if (typeof this.props.childrenOnly !== 'undefined') {
                    variables.childrenOnly = this.props.childrenOnly
                }

                return variables
            }

            this.props.relay.refetch(
                refetchVariables,
                null,
                () => {
                    this.setState({ isLoading: false })
                }
            )
        }
        else {
            this.handleClearInput()
        }
    }

    loadMoreCircles = () => {
        let newCircleNumber = this.state.circlesNumber + 10

        this.setState({
            circlesNumber: newCircleNumber,
            isLoadingMore: true
        })


        this.props.relay.refetch(fragmentVariables => ({
            ...this.context.relay.variables,
            firstCircles: newCircleNumber
        }),
            null,
            () => {
                this.setState({ isLoadingMore: false })
            }
        )
    }

    loadMorePublicCircles = () => {
        let newCircleNumber = this.state.publicCirclesNumber + 10

        this.setState({
            publicCirclesNumber: newCircleNumber,
            isLoadingMore: true
        })


        this.props.relay.refetch(fragmentVariables => ({
            ...this.context.relay.variables,
            publicFirstCircles: newCircleNumber
        }),
            null,
            () => {
                this.setState({ isLoadingMore: false })
            }
        )
    }

    handleInputChange = event => {
        let value = event.target.value
        this.setState({
            membersSearchFieldValue: value,
            isLoading: true
        });

        clearTimeout(this.typingTimer);
        this.typingTimer = setTimeout(() => this.handleRefetchAfterInputChange(value), this.doneTypingInterval);
    }

    handleRefetchAfterInputChange = text => {
        if ((text !== '' && text)) {
            const refetchVariables = fragmentVariables => {
                let variables = {
                    ...fragmentVariables,
                    queryMain: true,
                    queryCircles: true,
                    circlesFilter: {
                        code: text,
                        nameCompletion:text,
                        circleType: this.props.circleTypes || ['MY_CIRCLES', 'CIRCLES_I_AM_IN', 'CHILDREN_CIRCLES', 'PUBLIC_CIRCLES'],
                        types: this.props.types,
                        seeAs: this.props.seeAs
                    },
                    firstCircles: 15,
                    queryPublicCircles: this.props.tabs.indexOf("PublicGroups") >= 0,
                    publicFirstCircles: 15,
                    autocompletion_required: this.state.membersSearchFieldValue ? true : false,
                    pseudo_autocomplete: this.isValidEmailAddress(this.state.membersSearchFieldValue) ? null : this.state.membersSearchFieldValue,
                    email_autocomplete: this.isValidEmailAddress(this.state.membersSearchFieldValue) ? this.state.membersSearchFieldValue : null,
                    publicCirclesFilter:{
                        code: text,
                        nameCompletion:text,
                        circleType: ['PUBLIC_CIRCLES'],
                        types: this.props.types,
                        seeAs: this.props.seeAs
                    },
                }

                return variables
            }

            this.props.relay.refetch(
                refetchVariables,
                null,
                () => this.setState({ isLoading: false })
            );
        }
        else {
            this.props.relay.refetch(fragmentVariables => ({
                autocompletion_required: false,
                pseudo_autocomplete: null,
                email_autocomplete: null,
                userType: null,
                parentsOnly: null,
                childrenOnly: null,
                queryMain: false,
                queryCircles: false,
                queryPublicCircles: false,
            }),
                null,
                () => this.setState({ isLoading: false })
            );
        }
    }

    handleClearInput = () => {
        this.setState({
            membersSearchFieldValue: '',
            circlesSearchFieldValue: '',
            publicCirclesSearchFieldValue: '',
            isLoading: true
        })

        this.setInitialFilters()
    }

    handleChangePrice = (value, circle) => {
        if (isNaN(value))
            return;

        let price_for_circles = this.state.price_for_circles;

        let index = price_for_circles.findIndex(price_for_circle => price_for_circle.circle.id === circle.id);
        if (index >= 0) {
            price_for_circles[index] = { price: { cents: value * 100, currency: this.props.currency }, circle }
        }
        else {
            price_for_circles.push({ price: { cents: value * 100, currency: this.props.currency }, circle })
        }

        this.setState({ price_for_circles })
    }

    render() {
        const { onClose, tabs, isModal = true } = this.props;
        const shownTabs = tabs.map(tab => ({ value: tab, label: localizations["searchModule_" + tab] }))

        return (
            <div>
                <Container
                    isModal={isModal}
                    isOpen={this.state.open}
                    maxHeight={this.props.maxHeight}
                >

                    <div style={styles.modalContent}>
                        {isModal && <img src="/images/crosss.svg" onClick={onClose} style={styles.closeIcon} />}
                        <div style={tabs.indexOf("People") >= 0 ? styles.searchbarwraperbyperson : styles.searchbarwraper}>
                            <SearchBar
                                placeholder={tabs.indexOf("People") >= 0 ? localizations.searchModule_person_placeholder : localizations.searchModule_people_placeholder}
                                onChange={this.handleInputChange}
                                onErase={this.handleClearInput}
                                searchFieldValue={this.state.membersSearchFieldValue}
                                image="/svg-icons/outline-search.svg"
                            />
                        </div>
                        <StyledSelectedChip
                            onRemoveItem={this.handleRemoveItem}
                            selectedMembers={this.state.checked.map(item => item.name ? { ...item, pseudo: item.name } : item)}
                            isMembersList={false}
                        />

                        {tabs.indexOf("PublicGroups") >= 0 &&
                            <React.Fragment>
                                <div style={styles.row}>

                                    <div style={styles.col50}>
                                        <p style={styles.colheading}>My Groups</p>
                                        <div style={styles.colcontent}>


                                            {this.state.isLoading
                                                ? <div style={styles.loadingContainer}>
                                                    <ReactLoading type='spinningBubbles' color={colors.blue} />
                                                </div>
                                                : this.props.viewer && this.props.viewer.circles &&
                                                <CirclesList
                                                    onItemTap={this.handleCirclesItemTap}
                                                    onCirleMemberItemTap={this.handleMembersItemTap}
                                                    checked={this.state.checked}
                                                    searchFieldValue={this.state.circlesSearchFieldValue}
                                                    open={this.state.nestOpen}
                                                    state={this.state}
                                                    onSelectAllChange={this.handleCirclesSelectAllMembers}
                                                    circles={this.props.hiddenCircleList ? this.props.viewer.circles.edges.filter(edge => this.props.hiddenCircleList.findIndex(hiddenCircle => hiddenCircle.id === edge.node.id) < 0) : this.props.viewer.circles.edges}
                                                    count={this.props.viewer.circles ? this.props.viewer.circles.count : 0}
                                                    allowToSeeCircleDetails={this.props.allowToSeeCircleDetails}
                                                    displayLoadMore={this.props.viewer.circles && this.props.viewer.circles.edges && this.props.viewer.circles.count > this.state.circlesNumber}
                                                    onLoadMore={this.loadMoreCircles}
                                                    isLoadingMore={this.state.isLoadingMore}
                                                    displayPriceField={this.props.displayPriceField}
                                                    price_for_circles={this.state.price_for_circles}
                                                    handleChangePrice={this.handleChangePrice}
                                                    currency={this.props.currency}

                                                />
                                            }
                                        </div></div>


                                    <div style={styles.col50}>
                                        <p style={styles.colheading}>Public Groups</p>
                                        <div style={styles.colcontent}>


                                            {this.state.isLoading
                                                ? <div style={styles.loadingContainer}>
                                                    <ReactLoading type='spinningBubbles' color={colors.blue} />
                                                </div>
                                                : this.props.viewer && this.props.viewer.publicCircles &&
                                                <CirclesList
                                                    searchFieldValue={this.state.publicCirclesSearchFieldValue}
                                                    onItemTap={this.handleCirclesItemTap}
                                                    onCirleMemberItemTap={this.handleMembersItemTap}
                                                    checked={this.state.checked}
                                                    open={this.state.nestOpen}
                                                    state={this.state}
                                                    onSelectAllChange={this.handleCirclesSelectAllMembers}
                                                    //circles={this.props.viewer.publicCircles}
                                                    circles={this.props.hiddenCircleList ? this.props.viewer.publicCircles.edges.filter(edge => this.props.hiddenCircleList.findIndex(hiddenCircle => hiddenCircle.id === edge.node.id) < 0) : this.props.viewer.publicCircles.edges}
                                                    count={this.props.viewer.circles ? this.props.viewer.circles.count : 0}
                                                    allowToSeeCircleDetails={this.props.allowToSeeCircleDetails}
                                                    displayLoadMore={this.props.viewer.publicCircles && this.props.viewer.publicCircles.edges && this.props.viewer.publicCircles.count > this.state.publicCirclesNumber}
                                                    onLoadMore={this.loadMorePublicCircles}
                                                    isLoadingMore={this.state.isLoadingMore}
                                                    displayPriceField={this.props.displayPriceField}
                                                    price_for_circles={this.state.price_for_circles}
                                                    handleChangePrice={this.handleChangePrice}
                                                    currency={this.props.currency}
                                                />
                                            }
                                        </div>
                                    </div>



                                </div>

                                <div style={[styles.row, styles.createcircle]}>
                                    <Link to="/new-group">
                                        <Button variant="contained" color="primary" onClick={this.showtimeslotcards}>
                                            Create a new group
                        </Button>
                                    </Link>
                                </div>

                            </React.Fragment>
                        }


                        {tabs.indexOf("People") >= 0 &&

                            <div style={styles.rowcolum}>

                                {this.state.isLoading
                                    ? <div style={styles.loadingContainer}>
                                        <ReactLoading type='spinningBubbles' color={colors.blue} />
                                    </div>
                                    : this.props.viewer && this.props.viewer.users && this.props.viewer.users.edges &&
                                    (this.props.viewer.users.count > 0
                                        ? <MembersList
                                            onItemTap={this.handleMembersItemTap}
                                            checked={this.state.checked}
                                            members={this.props.viewer.users.edges.map(edge => edge.node)}
                                            showSelectAll={false}
                                        />
                                        : <div style={styles.noResult}>
                                            {localizations.searchModule_No_result}

                                        </div>
                                    )
                                }
                            </div>

                        }

                        {this.state.activeTab !== "Invite" && !this.props.noNeedToValidate &&
                            <div style={{ minHeight: 50 }}></div>
                        }
                    </div>
                    {this.state.activeTab !== "Invite" && !this.props.noNeedToValidate &&
                        <div style={styles.valideWrapper}>
                            <Button onClick={this.onValideTap} style={styles.inviteButton} >
                                {localizations.searchModule_validate}
                            </Button>
                        </div>
                    }
                </Container>
            </div>
        );
    }
}

SearchModalTimeslot.propTypes = {
    onClose: PropTypes.func.isRequired,
};

const SearchModalTemp = createRefetchContainer(withAlert(Radium(SearchModalTimeslot)), {
    viewer: graphql`
    fragment SearchModalTimeslot_viewer on Viewer @argumentDefinitions(
      queryMain: {type: "Boolean!", defaultValue: false},
      pseudo_autocomplete: {type: "String"},
      email_autocomplete: {type: "String"},
      autocompletion_required: {type: "Boolean!", defaultValue: false},
      userType: {type: "UserProfileType"},
      parentsOnly: {type: "Boolean"},
      childrenOnly: {type: "Boolean"},
      queryCircles: {type: "Boolean!", defaultValue: false},
      circlesFilter: {type: "CirclesFilter"},
      firstCircles: {type: "Int", defaultValue: 15},
      publicCirclesFilter: {type: "CirclesFilter"},
      publicFirstCircles: {type: "Int", defaultValue: 15},
      queryPublicCircles: {type: "Boolean!", defaultValue: false},
    ) {
      me {
        id
      }
      users (pseudo: $pseudo_autocomplete, email: $email_autocomplete, first: 10, userType: $userType, parentsOnly: $parentsOnly, childrenOnly: $childrenOnly) @include(if: $autocompletion_required) {
        count
        edges {
          node {
            id
            pseudo
            avatar
            firstName
            lastName
            profileType
          }
        }
      }
      circles (filter: $circlesFilter, first: $firstCircles) @include(if: $queryMain) {
        count
        edges @include (if: $queryCircles){
          node {
            id, 
            memberCount
            name
            owner {
              id
              pseudo
            }
            mode
            type
            members {
              id
              pseudo
              avatar
              profileType
            }
            askedInformation {
              id, 
              name,
              type,
              filledByOwner
              answers
            }
          }
        }
      }
      publicCircles: circles (filter: $publicCirclesFilter, first: $publicFirstCircles) @include(if: $queryMain) {
        count
        edges @include (if: $queryPublicCircles){
          node {
            id, 
            memberCount
            name
            owner {
              id
              pseudo
            }
            mode
            type
            members {
              id
              pseudo
              avatar
              profileType
            }
            askedInformation {
              id, 
              name,
              type,
              filledByOwner
              answers
            }
          }
        }
      }
    }
  `},
    graphql`
    query SearchModalTimeslotRefetchQuery (
      $queryMain: Boolean!,
      $pseudo_autocomplete: String,
      $email_autocomplete: String,
      $autocompletion_required: Boolean!,
      $userType: UserProfileType,
      $parentsOnly: Boolean,
      $childrenOnly: Boolean,
      $queryCircles: Boolean!,
      $circlesFilter: CirclesFilter,
      $firstCircles: Int,
      $publicCirclesFilter: CirclesFilter,
      $publicFirstCircles: Int,
      $queryPublicCircles: Boolean!,
    ) {
      viewer {
        ...SearchModalTimeslot_viewer @arguments (
          queryMain: $queryMain,
          pseudo_autocomplete: $pseudo_autocomplete,
          email_autocomplete: $email_autocomplete,
          autocompletion_required: $autocompletion_required,
          userType: $userType,
          parentsOnly: $parentsOnly,
          childrenOnly: $childrenOnly, 
          queryCircles: $queryCircles,
          circlesFilter: $circlesFilter,
          firstCircles: $firstCircles,
          publicCirclesFilter: $publicCirclesFilter,
          publicFirstCircles: $publicFirstCircles,
          queryPublicCircles: $queryPublicCircles,
        )
      }
    }
  `
)


export default class extends Component {
    render() {
        return (
            <QueryRenderer
                environment={environment}
                query={graphql`
          query SearchModalTimeslotQuery {
            viewer {
              ...SearchModalTimeslot_viewer
            }
          }
        `}
                variables={{
                    queryMain: false,
                    autocompletion_required: false,
                    queryCircles: false,
                    firstCircles: 15
                }}
                render={({ error, props }) => {
                    if (props) {
                        return <SearchModalTemp query={props} viewer={props.viewer} {...this.props} />;
                    } else {
                        return (
                            <SearchModalTemp query={props} viewer={null} {...this.props} />
                        )
                    }
                }}
            />
        )
    }
}
