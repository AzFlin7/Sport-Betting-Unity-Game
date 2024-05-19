import React from 'react';
import PureComponent, { pure } from '../common/PureComponent';
import {createRefetchContainer, graphql} from 'react-relay';
import Radium from 'radium';
import ReactTooltip from 'react-tooltip';
import PropTypes from 'prop-types'

import { colors } from '../../theme';
import localizations from '../Localizations';

import Switch from '../common/Switch';
import SelectCircle from '../common/Inputs/SelectCircle';
import Dropdown from './Dropdown';
import Input from './Input';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import InputUserAutocompleted from '../common/Inputs/InputUserAutocompleted'
 let styles;
 const isEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
 
 class CircleList extends PureComponent {
    static contextTypes = {
        relay: PropTypes.shape({
          variables: PropTypes.object,
        }),
    }

    state = {
        isLoading: false,
        inputContent: '',
        inputPseudoContent: '',
        dropdownOpen: false,
        userListIsOpen: false,
        circleListIsOpen: false,
        circleList: [],
        selectedTab: "one"
    }

    typingTimer;
    doneTypingInterval = 800;

    componentDidMount() {
        window.addEventListener('click', this._handleClickOutside);
        this._closeDropdown()
    }

    componentWillReceiveProps = (nextProps) => {
        if (this.state.circleList.length === 0 && ((nextProps.circlesList && nextProps.circlesList.length > 0) || (nextProps.circlesCurrentUserIsIn && nextProps.circlesCurrentUserIsIn.length > 0) || (nextProps.circlesFromClub && nextProps.circlesFromClub.length > 0))) {
            let circleList = [];
            nextProps.circlesList.forEach(edge => circleList.push(edge.node));

            if (nextProps.circlesFromClub && nextProps.circlesFromClub.length > 0) 
                nextProps.circlesFromClub.forEach(edge => circleList.push(edge.node));

            if (nextProps.circlesCurrentUserIsIn && nextProps.circlesCurrentUserIsIn.length > 0) 
                nextProps.circlesCurrentUserIsIn.forEach(edge => circleList.push(edge.node))

            this.setState({circleList});
        }
    }

    componentWillUnmount() {
        window.removeEventListener('click', this._handleClickOutside);
    }

    
    _handleClickOutside = event => {
        if (this.state.circleListIsOpen && this._containerCircleNode && !this._containerCircleNode.contains(event.target)) {
            this.setState({ 
                inputContent: !!this.props.selectedOpponent ? this.props.selectedOpponent.pseudo : '',
                userListIsOpen: false,
                circleListIsOpen: false,
            });
        }
        else if (this.state.userListIsOpen && this._containerUserNode && !this._containerUserNode.contains(event.target)) {
            this.setState({ 
                inputContent: !!this.props.selectedOpponent ? this.props.selectedOpponent.pseudo : '',
                userListIsOpen: false,
                circleListIsOpen: false,
            });
        }
        else if ((!this._containerUserNode || !this._containerUserNode.contains(event.target)) && 
            (!this._containerCircleNode || !this._containerCircleNode.contains(event.target))) {
            this._closeDropdown()

            this.props.relay.refetch(fragmentVariables => ({
                ...this.context.relay.variables, 
                requestUsersByEmail: false,
                requestUsersAutocompletion: false,
                sportId: null,
                pseudo: '_',
            }))
        }
    }

    _openDropdown = () => {
        this.refs._inputNode._focus();
        this.setState({dropdownOpen: true})
    }

    _closeDropdown = () => {
      //  this.refs._inputNode._onBlur();
        this.setState({ 
            isLoading: false,
            inputContent: !!this.props.selectedOpponent ? this.props.selectedOpponent.pseudo : '',
            dropdownOpen: false,
            userListIsOpen: false,
            circleListIsOpen: false
        });
    }

    _handleAutocompleteClicked = (user) => {
        this.props.onChange(user);
        this.setState({
            inputContent: user.pseudo ? user.pseudo : user.email ? user.email : '',
        })

        setTimeout(() => this.setState({userListIsOpen: false}),20)
        
        setTimeout(() => {
            this.props.relay.refetch(fragmentVariables => ({
                ...this.context.relay.variables, 
                pseudo: '_',
                sportId: null,
                requestUsersAutocompletion: false,
                requestUsersByEmail: false
            }));
        }, 400);
    }

    _handleInputChange = event => {
        clearTimeout(this.typingTimer);
        this.typingTimer = setTimeout(() => this.handleRefetchAfterInputChange(event), this.doneTypingInterval);
    }

    handleRefetchAfterInputChange = event => {

        this.setState({
            inputContent: event.target.value,
            userListIsOpen: false
        })

        if (event.target.value.length >= 1 && this.props.isLoggedIn) {
            this.setState({
                isLoading: true
            })

            if (isEmail.test(event.target.value)) {
                this.props.relay.refetch(fragmentVariables => ({
                    ...this.context.relay.variables, 
                    email: event.target.value,
                    requestUsersByEmail: true, 
                    requestUsersAutocompletion: false,
                }),
                null,
                () => setTimeout(() => this.setState({ isLoading: false }) , 50)
                )
            }
            else {
                this.props.relay.refetch(fragmentVariables => ({
                    ...this.context.relay.variables, 
                    pseudo: event.target.value,
                    requestUsersAutocompletion: true,
                    requestUsersByEmail: false,
                    sportId: this.props.sport.id ? this.props.sport.id : this.props.sport.value ? this.props.sport.value : null,
                }),
                    null,
                    () => setTimeout(() => this.setState({ isLoading: false }) , 50)
                )
            }
            this.setState({
                userListIsOpen: true
            })    
        }
        else {
            this.props.relay.refetch(fragmentVariables => ({
                ...this.context.relay.variables, 
                pseudo: null,
                requestUsersAutocompletion: false,
                email: null,
                requestUsersByEmail: false
            }))
        }
    }

    _handleInputPseudoChange = event => {
        this.setState({
            inputPseudoContent: event.target.value,
        })
        this.props.onChange({email: this.state.inputContent, pseudo: this.state.inputPseudoContent});
    }

    _handleRemoveCircleSelection = () => {
        const { onChangeCircle } = this.props;
        
        if (typeof onChangeCircle === 'function') {
          setTimeout(() => onChangeCircle(), 20)
        }
    }

    changeTab = (e, tab) => this.setState({selectedTab: tab})

    render() {

        const { userListIsOpen, inputContent, inputPseudoContent, isLoading,  circleListIsOpen} = this.state;
        const { selectedOpponent, viewer, isOpenMatch, unknownOpponent, circleOfOpponents, error, circleList , renderStepActions } = this.props;

        let isEmailWritten = isEmail.test(inputContent);
        let autoCompletionList = isEmailWritten
            ?   viewer.users && viewer.users.edges.length > 0 
                ?   viewer.users.edges.map(edge => edge.node)
                :   []
            :   viewer.usersByPseudo && viewer.usersByPseudo.edges.length > 0
                ?   viewer.usersByPseudo.edges.map(edge => edge.node)
                :   viewer.opponents && viewer.opponents.edges.length > 0 
                    ?   viewer.opponents.edges.map(edge => edge.node)
                    :   [];
        
        if (autoCompletionList.length > 0 && viewer.me)
            autoCompletionList = autoCompletionList.filter(user => user.id !== viewer.me.id)

	    const triangleStyle = this.state.dropdownOpen ? styles.triangleOpen : styles.triangle ;
	    const finalTriangleStyle = {
		    ...triangleStyle,
		    borderBottomColor: this.state.dropdownOpen ? colors.green : colors.blue,
        };

        return (
            <div>
                <Paper zDepth={4} style={styles.paperStyle}>
                    <div style={styles.section}>
                        <Tabs 
                            style = {{ width:'calc(100% + 140px)', marginLeft: '-70px', marginRight: '-70px'}} 
                            inkBarStyle = {{background:'#5EA1D9'}}
                            onChange={this.changeTab}
                        >
                            <Tab 
                                label={localizations.myOpponent} 
                                value = "one" 
                                style = {{backgroundColor: '#FFFFFF', color: '#000000', borderBottom : '1px solid  #9A9A9A'}}
                            />
                            <Tab 
                                label={localizations.myOpponentPropose} 
                                value = "two" 
                                style = {{backgroundColor: '#FFFFFF', color: '#000000', borderBottom : '1px solid  #9A9A9A'}}
                            />
                        </Tabs>
                            {this.state.selectedTab === "one" && 
                                <div style={{margin: '26px 70px', width: 300, position: 'relative'}} ref={node => { this._containerCircleNode = node; }}>
                                    <Input
                                        label=""
                                        disabled={false}
                                        onChange={this._handleInputChange}
                                        placeholder={localizations.myOpponent}
                                        required
                                        value={inputContent}
                                        error={''}
                                        errorMessage={''}
                                        color="#5F9FDF"
                                        ref={node => {this.circleCreateSection = node}}
                                    />
                                    {userListIsOpen &&
                                        <div style={styles.autocompletion_dropdown}>
                                            <ul style={styles.list}>
                                                {isLoading 
                                                ?   <li style={styles.listItemClickable}><span style={styles.spinnerItem}></span></li>
                                                :   autoCompletionList.length > 0
                                                    ?   autoCompletionList.map((el, id) => (
                                                            <li
                                                                key={id}
                                                                style={styles.listItemClickable}
                                                                onClick={() => this._handleAutocompleteClicked(el)}
                                                            >
                                                                <div style={{ ...styles.avatar, backgroundImage: `url(${el.avatar})` }} />
                                                                {el.pseudo}
                                                            </li>
                                                        ))
                                                    :   <li
                                                            style={styles.listItemClickableColumn}
                                                            onClick={() => this._handleAutocompleteClicked(isEmailWritten ? {email: inputContent} : {pseudo: inputContent})}
                                                        >
                                                            <span style={styles.note}>
                                                                {isEmailWritten ? localizations.newSportunity_unknown_opponent_email : localizations.newSportunity_unknown_opponent_pseudo}
                                                            </span>
                                                            {inputContent}
                                                        </li>
                                                }
                                            </ul>
                                        </div>
                                    }
                                    {!isLoading && autoCompletionList.length === 0 && isEmailWritten && 
                                        <div style={{marginTop: 20}}>
                                            <Input
                                                label=""
                                                disabled={false}
                                                onChange={this._handleInputPseudoChange}
                                                placeholder={localizations.newSportunity_opponent_write}
                                                value={inputPseudoContent}
                                                error={''}
                                                errorMessage={''}
                                                color="#5F9FDF"
                                                ref={node => {this.circleCreateSection = node}}
                                            />
                                        </div>
                                    }
                                </div>
                            }
                            {this.state.selectedTab === "two" && 
                                <div style={{margin: '26px 70px', width: 300}} ref={node => { this._containerCircleNode = node; }}>
                                    <SelectCircle
                                        label={localizations.newSportunity_opponent_circles_label}
                                        list={circleList}
                                        value={circleOfOpponents}
                                        onClick={() => this.setState({ circleListIsOpen: true })}
                                        onClose={() => setTimeout(() => this.setState({ circleListIsOpen: false }), 20)}
                                        onChange={(el) => { this.props.onChangeCircle(el); setTimeout(() => this.setState({ circleListIsOpen: false }), 20) }}
                                        clearSelection={this._handleRemoveCircleSelection}
                                        placeholder={localizations.newSportunity_opponent_circles_select}
                                        term={circleOfOpponents ? circleOfOpponents.name : ''}
                                        disabled={unknownOpponent || isOpenMatch}
                                        isLoading={this.props.isLoadingCircles}
                                    /> 
                                </div>
                            }
                        <hr style={styles.hr}></hr>
                        {renderStepActions}
                    </div>
                </Paper>  
            </div>
        );
    }
}

var spinKeyframes = Radium.keyframes({
    '0%': { transform: 'rotate(0deg)' },
    '100%' :{ transform: 'rotate(360deg)' },
}, 'spin');

const stylesBases = {
  autocompletion_dropdown: {
    position: 'absolute',
    left: 0,

    width: '100%',
    maxHeight: 220,

    backgroundColor: colors.white,

    boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
    border: '2px solid rgba(94,159,223,0.83)',
    padding: 20,

    overflowY: 'scroll',
    overflowX: 'hidden',

    zIndex: 100,
  }
}

styles = {
    container: {
        position: 'relative',
        width: '100%',
        marginBottom: 25
    },
    dropdown: {
        position: 'absolute',
        top: 65,
        width: '100%',
        overflow: 'visible',
    },
    paperStyle: {
        padding: '8px 70px 1px',
        marginTop:'20px'
        
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
    section: {
      //   backgroundColor: colors.lightGray,
        padding: '10px 0px 10px 0px',
        marginBottom: 10,
        borderRadius: 5
    },
    sectionTitle: {
        fontFamily: 'Lato',
        fontSize: '18px',
        marginBottom: 15,
        paddingBottom: 5, 
        borderBottom: '1px solid '+colors.darkGray,
        color: colors.darkGray
    },

    autocompletion_dropdown: {
      ...stylesBases.autocompletion_dropdown,
      top: 60,
    },

    removeCross: {
        float: 'right',
        width: 0,
        color: colors.gray,
        marginRight: '15px',
        cursor: 'pointer',
        fontSize: '16px',
    },

    list: {},

    listItem: {
        paddingBottom: 10,
        color: '#515151',
        fontSize: 20,
        fontWeight: 500,
        fontFamily: 'Lato',
        borderBottomWidth: 1,
        borderColor: colors.blue,
        borderStyle: 'solid',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 5
    },

    listItemClickable: {
        paddingBottom: 10,
        color: '#515151',
        fontSize: 20,
        fontWeight: 500,
        fontFamily: 'Lato',
        borderBottomWidth: 1,
        borderColor: colors.blue,
        borderStyle: 'solid',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 5,
        cursor: 'pointer'
    },
    listItemClickableFullWidth: {
        paddingBottom: 10,
        color: '#515151',
        fontSize: 20,
        fontWeight: 500,
        fontFamily: 'Lato',
        borderBottomWidth: 1,
        borderColor: colors.blue,
        borderStyle: 'solid',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
        cursor: 'pointer'
    },
    listItemClickableColumn: {
        paddingBottom: 10,
        color: '#515151',
        fontSize: 20,
        fontWeight: 500,
        fontFamily: 'Lato',
        borderBottomWidth: 1,
        borderColor: colors.blue,
        borderStyle: 'solid',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        marginBottom: 5,
        cursor: 'pointer'
    },
    note: {
        fontSize: 16, 
        cursor: 'auto',
        fontStyle: 'italic',
        marginBottom: 10
    },
    avatar: {
        width: 39,
        height: 39,
        marginRight: 10,
        color: colors.blue,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        borderRadius: '50%',
    },
    closeCross: {
        position: 'absolute',
        right: 0,
        top: 30,
        width: 0, 
        height: 0,
        color: colors.gray,
        marginRight: '15px',
        cursor: 'pointer',
        fontSize: '16px',
    },
    cancelIcon: {
        marginRight: 15,
    },
    spinnerItem: {
        borderLeft: '6px solid #f3f3f3',
        borderRight: '6px solid #f3f3f3',
        borderBottom: '6px solid #f3f3f3',
        borderTop: '6px solid #3498db',
        borderRadius: '50%',
        width: '20px',
        height: '20px',
        marginRight: '20px',
        animation: 'x 1.5s ease 0s infinite',
        animationName: spinKeyframes,
    },
    inputRow: {
        marginBottom: 25,
        position: 'relative',
    },
    switchRow: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: 25,
        width : '40%',
    },
    label: {
        fontFamily: 'Lato',
        fontSize: '18px',
        //textAlign: 'right',
        lineHeight: 1,
        color: '#316394',
        display: 'block',
        marginRight: 20,
        flex: 1
    },
    disabledLabel: {
        fontFamily: 'Lato',
        fontSize: '18px',
        //textAlign: 'right',
        lineHeight: 1,
        color: '#D1D1D1',
        display: 'block',
        marginRight: 20,
        flex: 1
      },
    openMatchToolTip: {
        marginLeft: 10,
        fontSize: 16,
        cursor: 'pointer'
    },
    buttonIcon: {
        color: colors.blue,
        position: 'relative',
        marginLeft: 10
    },
    numberContainer: {
        position: 'absolute',
        top: '4px',
        left: '15px',
        width: 24,
        textAlign: 'center'
    },
    number: {
        fontSize: 17,
        fontWeight: 'bold'
    },
    hr: {
        marginLeft: -70,
        marginRight: -70,
    },
};

export default createRefetchContainer(Radium(CircleList), {
        viewer: graphql`
          fragment CircleList_viewer on Viewer @argumentDefinitions (
            pseudo: {type: "String"},
            requestUsersAutocompletion: {type: "Boolean!", defaultValue: false},
            sportId: {type: "String"},
            email: {type: "String"},
            requestUsersByEmail: {type: "Boolean!", defaultValue: false},
          ) {
            me {
                id
            }
            opponents (sportId: $sportId, pseudo: $pseudo, first: 8) @include(if: $requestUsersAutocompletion) {
                edges {
                    node {
                        id
                        avatar
                        pseudo
                    }
                }
            }
            users (email: $email, first: 10) @include(if: $requestUsersByEmail) {
                edges {
                    node {
                        id
                        avatar
                        pseudo
                    }
                }
            }
            usersByPseudo: users (pseudo: $pseudo, first: 10) @include(if: $requestUsersAutocompletion) {
                edges {
                    node {
                        id
                        avatar
                        pseudo
                    }
                }
            }
          }
        `,
    },
    graphql`query CircleListRefetchQuery (
        $pseudo: String,
        $requestUsersAutocompletion: Boolean!,
        $sportId: String,
        $email: String,
        $requestUsersByEmail: Boolean!
    ) {    
        viewer {
            ...CircleList_viewer @arguments (
                pseudo: $pseudo,
                requestUsersAutocompletion: $requestUsersAutocompletion,
                sportId: $sportId,
                email: $email,
                requestUsersByEmail: $requestUsersByEmail
            )
        }
    }`
);