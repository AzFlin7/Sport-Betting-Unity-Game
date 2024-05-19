import React from 'react'
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import { Link } from 'found'
import Radium from 'radium';
import { connect } from 'react-redux';
import platform from 'platform';
import isEqual from 'lodash/isEqual';
import ReactTooltip from 'react-tooltip'
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import { withAlert } from 'react-alert'
import Loading from 'react-loading';
import moment from 'moment'

import { colors, fonts } from '../../../theme'

import MembersInformation from './MembersInformation';
import MemberCard from '../../Circle/MemberCard'
import MemberRow from '../../Circle/MemberRow';
import RelaunchMembersMutation from '../../Circle/CircleMembersInformation/RelaunchMembersMutation';
import localizations from '../../Localizations'
import UpdateFormMutation from '../InformationForms/UpdateFormMutation';
import DeleteFormMutation from '../InformationForms/DeleteFormMutation';

var Style = Radium.Style;

let styles

class AllMembers extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            isError: false,
            user: null,
            language: localizations.getLanguage(),
            rowMembers: true,
            columns: [],
            rows: [],
            isRelaunchButtonVisible: true,
            activeSection: 'members',
            isLoading: false
        }
    }

    componentDidMount = () => {
        this.setState({isLoading: true})
        this.props.relay.refetch(fragmentVariables => ({
            ...fragmentVariables, 
            query : true
        }), 
        null,
        () => {
            setTimeout(() =>
                this.setState({isLoading: false})
            , 50);
        })
    }

    componentWillReceiveProps = (nextProps) => {
        if (this.state.rowMembers && nextProps.user.allCircleMembers) {
            this.setRowsAndCols(nextProps);
        }
    }

    isConditionFilled = (condition, answer) => {
        
        switch(condition.askedInformation.type) {
            case 'NUMBER': {
                switch(condition.askedInformationComparator)  {
                    case '≤': {
                        return (parseInt(answer.value) <= condition.askedInformationComparatorValue)
                    }
                    case '<': {
                        return (parseInt(answer.value) < condition.askedInformationComparatorValue)
                    }
                    case '=': {
                        return (parseInt(answer.value) === condition.askedInformationComparatorValue)
                    }
                    case '>': {
                        return (parseInt(answer.value) > condition.askedInformationComparatorValue)
                    }
                    case '≥': {
                        return (parseInt(answer.value) >= condition.askedInformationComparatorValue)
                    }
                }
            }
            case 'BOOLEAN': {
                if ((condition.askedInformationComparatorValue === 1 && answer.value === 'true') || (condition.askedInformationComparatorValue === 0 && answer.value === 'false'))
                    return true ; 
                else 
                    return false
            }
            case 'DATE': {
                switch(condition.askedInformationComparator)  {
                    case '≤': {
                        if (moment(answer.value).isBefore(condition.askedInformationComparatorDate))
                            return true; 
                        else 
                            return false;
                    }
                    case '≥': {
                        if (moment(answer.value).isAfter(condition.askedInformationComparatorDate))
                            return true; 
                        else 
                            return false;
                    }
                }
            }
            case 'CUSTOM': {
                if (condition.askedInformationComparatorValueString === answer.value)
                    return true ; 
                else 
                    return false
            }
            default: return false;
        }
    }

    _getAmoutToPay = (user, circle, paymentModel) => {
        let userId = user.id ;

        let paymentModelAskedInformation = [];
        paymentModel.conditions.forEach(condition => {
            condition.conditions.forEach(cond => {
                paymentModelAskedInformation = paymentModelAskedInformation.concat(cond.askedInformation)
            })
        })       

        let didUserFillAll = true ;
        paymentModelAskedInformation.forEach(askedInfo => {
            if (askedInfo.type !== 'BOOLEAN' && (!circle.membersInformation || circle.membersInformation.findIndex(memberInfo => userId === memberInfo.user.id && memberInfo.information === askedInfo.id) < 0))
                didUserFillAll = false
        })

        if (!didUserFillAll)
            return false
        else {
            let conditionListFilled = null;
            let numberOfValidAnswer = 0 ;  
            let userInformation = circle.membersInformation.filter(info => info.user.id === userId)
            
            paymentModel.conditions.forEach(condition => {
                let conditionAreValidated = true; 
                let currentNumberOfValidAnswer = 0 ; 

                condition.conditions.forEach(cond => {
                    let memberInfoIndex = userInformation.findIndex(userInfo => userInfo.information === cond.askedInformation.id);

                    if (cond.askedInformation.type === 'BOOLEAN' || this.isConditionFilled(cond, userInformation[memberInfoIndex])) {
                        currentNumberOfValidAnswer++ ;
                    }
                    else 
                        conditionAreValidated = false;
                })
                if (conditionAreValidated && currentNumberOfValidAnswer > numberOfValidAnswer) {
                    numberOfValidAnswer = currentNumberOfValidAnswer;
                    conditionListFilled = condition
                }
            })
            if  (conditionListFilled)
                return conditionListFilled.price.cents / 100
            else    
                return false
        }
    }

    setRowsAndCols = props => {
        let columns = [];
        let rows = [];
        let statusList = ['ACTIVE', 'INJURED', 'INACTIVE', 'OTHER'];
        let displayPaymentModels = false;

        columns.push({askedInfo: {name: localizations.profileView_circles}});
        columns.push({askedInfo: {type:'STATUS', name: 'Status', filledByOwner: true}});
        
        props.user.allCircleMembers.forEach(member => {
            member.circles.forEach(circle => {
                if (circle.circle.paymentModels && circle.circle.paymentModels.length > 0) {
                    displayPaymentModels = true ;
                }
            })
        })
        displayPaymentModels && columns.push({askedInfo: {type:'PAYMENT', name: localizations.circle_member_asked_payment, filledByOwner: false}});

        props.user.termsOfUses.forEach(term => {
            columns.push({askedInfo: {type: 'TERM', name: term.name, id: term.id, acceptedBy: term.acceptedBy}})
        })       

        props.user.allCircleMembers.forEach(member => {
            let answers = [];
            let amountToPay = 0 ;

            if (member.circles && member.circles.length > 0)
                answers.push({askedInfo: columns[0], answer: member.circles.filter(circle => circle.isActive).map(circle => (circle.circle.name)).join(', ')});

            let membersStatus = [];
            member.circles.forEach(circle => {
                if (circle.isActive) {
                    circle.circle.memberStatus.map(status => {
                        if (status.member.id === member.user.id && !status.ending_date) {
                            membersStatus.push(status.status);
                        }
                    });
                }
                if (displayPaymentModels) {
                    circle.circle.paymentModels.forEach(paymentModel => 
                        amountToPay = amountToPay + this._getAmoutToPay(member.user, circle.circle, paymentModel)
                    )
                }
            });

            let status = 'OLD';
            if (membersStatus.length === 0)
                status = 'ACTIVE';
            else if (membersStatus.indexOf('ACTIVE') >= 0)
                status = 'ACTIVE';
            else if (membersStatus.indexOf('INJURED') >= 0)
                status = 'INJURED';
            else 
                status = 'INACTIVE';

            answers.push({askedInfo: columns[1], answer: status});
            displayPaymentModels && answers.push({askedInfo: columns[2], answer: amountToPay > 0 ? amountToPay + ' ' + this.props.userCurrency : '-'});

            props.user.allCircleMembers.forEach(member => {
                member.circles.map(circle => {
                    circle.circle.askedInformation.map(askedInfo => {
                        if (columns.findIndex(col => col.askedInfo.id === askedInfo.id) < 0)
                            columns.push({askedInfo, circle: circle});
                    })
                });
            });

            columns.forEach(col => {
                if (col.askedInfo.id) {
                    let currentAnswer;
                    if (col.askedInfo.type === 'TERM') {
                        currentAnswer = (col.askedInfo.acceptedBy.findIndex(accept => accept.user.id === member.user.id) >= 0);
                    }
                    else {
                        member.circles.forEach(circle => {
                            circle.circle.membersInformation.forEach(memberInfo => {
                                if (memberInfo.user.id === member.user.id && memberInfo.information === col.askedInfo.id && answers.findIndex(answer => answer && answer.answer && answer.answer.id === memberInfo.information) < 0) {
                                    if (col.type === 'NUMBER')
                                        currentAnswer = parseInt(memberInfo.value);
                                    else if (col.type === 'BOOLEAN')
                                        currentAnswer = memberInfo.value === 'false' ? false : true;
                                    else
                                        currentAnswer = memberInfo.value;
                                }
                            })
                        });
                    }
                    answers.push({askedInfo: col, answer: currentAnswer})
                }
            })


            let row = {
                user: member.user,
                answers
            }
            rows.push(row)
        })
        rows.sort((a, b) => {
            let rowA = rows.find(row => a.user.id === row.user.id);
            let rowB = rows.find(row => b.user.id === row.user.id);
            let indexA = statusList.findIndex((status) => status === rowA.answers[1].answer);
            let indexB = statusList.findIndex((status) => status === rowB.answers[1].answer);
            return indexA - indexB;
        });
        this.setState({rows, columns})
    }

    _relaunchMembers = () => {
        this.setState({isRelaunchButtonVisible: false})
    
        const viewer = this.props.viewer ;
    
        let circleList = [];
        this.props.user.allCircleMembers.forEach(circleMember => {
            circleMember.circles.forEach(circle => {
                if (circleList.findIndex(circleInList => circleInList.id === circle.circle.id) < 0) {
                    circleList.push(circle.circle)
                }
            })
        })
    
        circleList.forEach(circle => {
            RelaunchMembersMutation.commit({
                    viewer,
                    idVar: circle.id,
                },
                {
                onFailure: error => {
                    this.props.alert.show(localizations.popup_editCircle_update_failed, {
                        timeout: 2000,
                        type: 'error',
                    });
                    let errors = JSON.parse(error.getError().source);
                    console.log(errors);
    
                },
                onSuccess: (response) => {
                    /*this.props.alert.show(localizations.popup_editCircle_update_success, {
                        timeout: 2000,
                        type: 'success',
                    });*/
                },
                }
            )
        });
        setTimeout(() =>
            this.props.alert.show(localizations.popup_editCircle_update_success, {
                timeout: 2000,
                type: 'success',
            }), 1500
        );
    }

    _displayRowsOrCards = () => {
        if (!this.state.rowMembers && (this.state.columns.length === 0 || this.state.rows.length === 0)) {
            this.setRowsAndCols(this.props)
        }

        this.setState({rowMembers: !this.state.rowMembers})
    }

    _changeSection = (name) => {
        this.setState({
            activeSection: name,
        })
    }

    render() {
        const { viewer, user } = this.props;
        const { columns, rows } = this.state;
        let statusList = ['ACTIVE', 'INJURED', 'INACTIVE', 'OTHER'];
        let members = (user.allCircleMembers) ? user.allCircleMembers.filter(e => true) : [];
        if (members && this.state.rowMembers) {
            members.sort((a, b) => {
                let rowA = rows.find(row => a.user.id === row.user.id);
                let rowB = rows.find(row => b.user.id === row.user.id);
                let indexA = statusList.findIndex((status) => status === rowA.answers[1].answer);
                let indexB = statusList.findIndex((status) => status === rowB.answers[1].answer);
                return indexA - indexB;
            });
        }

        return(
            <div style={{width: '100%'}}>
                <div style={styles.pageHeader}>
                    {localizations.circles_allMembers}
                </div>
                <div style={styles.wrapper}>
                    <div style={styles.bodyContainer}>
                        <div>
                            <div style={this.state.rowMembers ? styles.headerRowFullWidth : styles.headerRow}>
                                <div style={styles.buttonSection}>
                                    <ReactTooltip effect="solid" multiline={true}/>
                                
                                    <Style scopeSelector=".download-table-xls-button" rules={{
                                        ...styles.textButton
                                        }}
                                    />
                                    <Style scopeSelector=".download-table-xls-button:hover" rules={{
                                        borderRadius: '5px', 
                                        backgroundColor: colors.gray,
                                        color: colors.white, 
                                        }}
                                    />
                                    {this.state.rowMembers && this.state.activeSection === 'members' && 
                                        <ReactHTMLTableToExcel
                                            id="test-table-xls-button"
                                            className="download-table-xls-button"
                                            table="table-to-xls"
                                            filename={localizations.circles_allMembers}
                                            sheet={localizations.circles_allMembers}
                                            buttonText={localizations.circle_export_excel}
                                        />
                                    }
                                    {this.state.rowMembers && this.state.activeSection === 'members' && 
                                        <div 
                                            key={"information"} 
                                            style={styles.textButton} 
                                            onClick={() => this.setState({activeSection: 'information'})}
                                        >
                                            {localizations.circle_show_details}
                                        </div>
                                    }
                                    {this.state.activeSection === 'members' && 
                                        <div 
                                            key={"switchView"} 
                                            style={styles.icon} 
                                            onClick={this._displayRowsOrCards}
                                            data-tip={this.state.rowMembers ? localizations.circle_display_box : localizations.circle_display_rows}
                                        >
                                            {this.state.rowMembers
                                            ?   <i className="fa fa-id-card-o fa-2x" />
                                            :   <i className="fa fa-list fa-2x" />
                                            }
                                        </div>
                                    }
                                </div>
                            </div>
                            {this.state.isLoading && 
                                <div style={styles.loadingContainer}><Loading type='spinningBubbles' color={colors.blue} /></div>
                            }
                            {this.state.activeSection === 'members' && !this.state.isLoading && 
                                <section>
                                    {members && members.length > 0 
                                    ?   this.state.rowMembers
                                        ?   <div style={{overflow: 'auto'}}>
                                                <table style={styles.memberListRow}>
                                                    {columns.length > 0 &&
                                                        <thead>
                                                            <tr style={styles.tableRowHeader}>
                                                                <td >
                                                                </td>
                                                                <td style={styles.tableRowHeaderPseudo}>
                                                                    Pseudo
                                                                </td>
                                                                {columns.map((column, index) => (
                                                                    <td key={index} style={styles.tableRowHeaderTitle}>
                                                                        {column.askedInfo.name}
                                                                    </td>
                                                                ))}
                                                                <td/>
                                                            </tr>
                                                        </thead>
                                                    }
                                                    <tbody>
                                                        {members.map(member =>
                                                            <MemberRow
                                                                key={member.user.id}
                                                                member={member.user}
                                                                viewer={viewer}
                                                                userCanRemoveMember={false}
                                                                filledInformation={rows.length > 0 ? rows[rows.findIndex(row => row.user.id === member.user.id)] : null}
                                                                {...this.state}
                                                            />
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        :   <div style={styles.memberList}>
                                                {members.map(member =>
                                                    <MemberCard
                                                        key={member.user.id}
                                                        member={member.user}
                                                        viewer={viewer}
                                                        userCanRemoveMember={false}
                                                        {...this.state}
                                                    />
                                                )}
                                            </div>
                                    :   <div style={styles.msgContainer}>
                                            <img src='/images/noMember/message_non_membre-01.png' style={{width: 100, height: 100, margin: '20px 0px'}}/>
                                            <p style={styles.msgHeader}>
                                                {localizations.circles_noMember_header}
                                            </p>
                                            <p style={styles.msgText}>
                                                {localizations.circles_noMember_text}
                                                <Link to='' style={styles.msgLink} onClick={() => this.props.onChangeSection('myCircles')}>
                                                    {localizations.circles_noMember_link}
                                                </Link>
                                            </p>
                                            <img 
                                                src={user.profileType === 'ORGANIZATION' ? localizations.circles_noMember_table_club : localizations.circles_noMember_table_individual}
                                                style={{width: '80%'}}
                                            />
                                        </div>
                                    }
                                </section>
                            }

                            {this.state.activeSection === 'information' && !this.state.isLoading && 
                                <MembersInformation
                                    viewer={viewer}
                                    user={user}
                                    onLeave={() => this.setState({activeSection: 'members'})}
                                    rows={rows}
                                    columns={columns}
                                />
                            }
                            {!this.state.isLoading && this.state.rowMembers && this.state.isRelaunchButtonVisible && user.allCircleMembers && user.allCircleMembers.length > 0 && 
                                <button style={styles.button} onClick={this._relaunchMembers}>
                                    {localizations.circle_relaunch_members}
                                </button>
                            }            
                        </div>
                    </div> 
                </div>
            

                <table id="table-to-xls" style={{display: 'none'}}>
                    <tr>
                        <td key={'pseudo'}>Pseudo</td>
                        <td key={'circles'}>{localizations.profileView_circles}</td>
                        {columns.map((column, index) => (
                            <td key={'col' + index}>
                                {column.askedInfo.name}
                            </td>
                        ))}
                    </tr>
                    { rows.map((row, rowIndex) => (
                        <tr key={'row' + rowIndex}>
                            <td key={"row-pseudo"}>
                                {row.user.pseudo}
                            </td>
                            {row.answers.map((info, colIndex) => (
                                <td key={rowIndex+'-'+colIndex} >
                                    {info.answer}
                                </td>
                            ))}
                        </tr>
                    ))}
                </table>
            </div>
        )
    }
}

styles = {
    pageHeader: {
		fontFamily: 'Lato',
		fontSize: 34,
		fontWeight: fonts.weight.large,
		color: colors.blue,
		display: 'flex',
        maxWidth: 1400,
		margin: '30px auto 0px auto',
        flexDirection: 'row',
		alignItems: 'left',
        justifyContent: 'left',
        '@media (max-width: 900px)': {
            flexDirection: 'column',
            marginBottom: 0
        },
        '@media (max-width: 768px)': {
            paddingLeft: 20
        }
    },
    bodyContainer: {
        display: 'flex',
        width: '100%',
        margin: '0px 0 50px 0', 
        flexDirection: 'column',
		justifyContent: 'flex-start',
        minHeight: 600,
        padding: '0 15px'
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50
    },
	memberList: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'flex-start',
		marginTop: 15,
		width: '100%',
		padding: 0,
        flexWrap: 'wrap',
        '@media (max-width: 1070px)': {
			justifyContent: 'center'
		}
    },
    memberListRow: {
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        marginTop: 15,
        width: '100%',
        padding: 0,
        flexWrap: 'wrap',
        overflow: 'auto'
    },
	navLink: {
		color: colors.blue,
		textDecoration: 'none',
		marginRight: '10px',
    },
    headerRow: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: 1665,
        '@media (max-width: 1930px)': {
            width: 1245
        },
        '@media (max-width: 1490px)': {
            width: 825
        },
        '@media (max-width: 1070px)': {
            width: '100%'
        },
    },
    headerRowFullWidth: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: '100%'
    },
    buttonSection: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    icon: {
        cursor: 'pointer',
        color: colors.gray,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40, 
        transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
        borderRadius: 20,
        marginLeft: 5,
        ':hover': {
            backgroundColor: colors.gray,
            color: colors.white, 
        }
    },
    textButton: {
        cursor: 'pointer',
        color: colors.gray,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
        border: 'none',
        marginLeft: 5,
        padding: '5px 10px',
        fontSize: 14,
        ':hover': {
            borderRadius: '5px', 
            backgroundColor: colors.gray,
            color: colors.white, 
        }
    },
    button: {
        cursor: 'pointer',
        color: colors.gray,
        display: 'flex',
        fontSize: 16,
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
        border: 'none',
        margin: '20px auto',
        padding: '5px 10px',
        ':active': {
            border: 'none'
        },
        ':hover': {
            borderRadius: '5px', 
            backgroundColor: colors.gray,
            color: colors.white, 
        }
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        alignSelf: 'flex-start',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 15,
        marginLeft: 15
    },
    label: {
        fontFamily: 'Lato',
        fontSize: 16, 
        color: colors.blue,
        marginRight: 10
    },
    switchContainer: {
        marginLeft: 15
    },
    wrapper: {
        margin: '35px auto',
        display: 'flex',
        flexDirection: 'row',
        fontFamily: 'Lato',
        '@media (max-width: 960px)': {
            width: '100%',
        },
        '@media (max-width: 580px)': {
            display: 'block',
        }
    },
    leftSide: {
        minWidth: 200,
        display: 'flex',
        flexDirection: 'column',
        fontSize: 16,
    },
    tableRowHeader: {
        backgroundColor: colors.white,
        boxShadow: '0 0 4px 0 rgba(0,0,0,0.12)',
        border: '1px solid #E7E7E7',
        overflow: 'hidden',
        fontFamily: 'Lato',
        margin: '1px 0',
        padding: 15,
    },
    tableRowHeaderPseudo: {
        marginRight: 10,
        fontWeight: 'bold',
        padding: 5,
        fontSize: 16,
        color: 'rgba(0,0,0,0.65)',
        textAlign: 'center',
    },
    tableRowHeaderTitle: {
        marginRight: 10,
        fontWeight: 'bold',
        fontSize: 16,
        padding: 5,
        color: 'rgba(0,0,0,0.65)',
	      textAlign: 'center',
    },
    msgContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    msgIcon: {
        fontSize: '1.5em',
        color: '#a6a6a6',
        verticalAlign: 'sub'
    },
    msgHeader: {
        fontSize: 22,
        color: '#838383',
        fontFamily: 'Lato',
        textAlign: 'center',
        lineHeight: '26px',
        fontWeight: 'bold'
    },
    msgText: {
        fontSize: 18,
        color: '#838383',
        fontFamily: 'Lato',
        textAlign: 'center',
        lineHeight: '26px',
        width: '75%',
    },
    msgLink: {
        color: colors.blue,
        textDecoration: 'none',
        cursor: 'pointer'
    },
    msgImage: {
        width: '75%',
    }
}


const dispatchToProps = (dispatch) => ({
})
  
const stateToProps = (state) => ({
    userCurrency: state.globalReducer.userCurrency,
})
  
let ReduxContainer = connect(
    stateToProps,
    dispatchToProps
)(Radium(AllMembers));

export default createRefetchContainer(withAlert(ReduxContainer), {
//OK
    viewer: graphql`
        fragment AllCircleMembers_viewer on Viewer {
            ...MemberCard_viewer
            ...MemberRow_viewer
            ...MembersInformation_viewer
        }
    `,
    user: graphql`
    fragment AllCircleMembers_user on User @argumentDefinitions(
        query: {type: "Boolean!", defaultValue: false}
        ){
            profileType
            termsOfUses {
              id,
              name
              acceptedBy {
                user {
                  id
                }
              }
            }
            allCircleMembers @include(if: $query) {
                user {
                    id
                    pseudo
                    avatar
                    lastConnexionDate
                    sports {
                        sport {
                            id
                            name {
                                EN
                                FR
                                DE
                            }
                        }
                    }
                    sportunityNumber
                    followers {id}
                }
                circles {
                    circle {
                        id 
                        name
                        memberStatus {
                            member {
                                id
                            }
                            status
                            starting_date
                            ending_date
                        }
                        askedInformation {
                            id, 
                            name,
                            type,
                            filledByOwner
                            form {
                                id
                                name
                            }
                        }
                        membersInformation {
                            id,
                            information,
                            user {
                                id,
                            }
                            value
                            document {
                                id,
                                name
                            }
                            validationStatus
                            comment
                        }
                        paymentModels {
                            id,
                            name,
                            conditions {
                                id,
                                name, 
                                price {
                                    cents,
                                    currency
                                }
                                conditions {
                                    askedInformation {
                                        id
                                        type
                                    }
                                    askedInformationComparator
                                    askedInformationComparatorValue
                                    askedInformationComparatorDate
                                    askedInformationComparatorValueString
                                }
                            }
                        }
                    }
                    isActive
                }
            }
        }
    `,
},
    graphql`
    query AllCircleMembersRefetchQuery(
    $query: Boolean!
    ) {
    viewer {
        ...AllCircleMembers_viewer
        me{
            ...AllCircleMembers_user
            @arguments(
            query: $query
            )
        }
    }
    }
    `,
);
