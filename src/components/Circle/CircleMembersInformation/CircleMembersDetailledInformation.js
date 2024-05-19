import React from 'react'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium'
import { withAlert } from 'react-alert'
import isEqual from 'lodash/isEqual';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import moment from 'moment'
import Select from 'react-select';

var Style = Radium.Style;

import localizations from '../../Localizations'
import { colors, fonts } from '../../../theme'
import UpdateFilledInformationMutation from './UpdateFilledInformationMutation.js'
import RelaunchMembersMutation from './RelaunchMembersMutation.js';
import UpdateMemberStatusMutation from './UpdateMemberStatusMutation';

let styles ;

class MembersInformation extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            columns: [],
            rows: [],
            isRelaunchButtonVisible: true
        }
    }

    componentDidMount = () => {
        let columns = [];
        columns.push({type:'STATUS', name: 'Status', id: 'SERKET', filledByOwner: true});
        
        this.props.circle.askedInformation.map(askedInfo => {
            columns.push(askedInfo);
        });
        let rows = [];
	    let statusList = [];

	    this.props.circle.memberStatus.forEach(status => {
		    let index = statusList.findIndex(tmpStatus => tmpStatus.member.id === status.member.id)
		    if (index < 0) {
			    statusList.push(status)
		    }
		    else if (statusList[index].starting_date < status.starting_date)
			    statusList[index] = status
	    });
	    this.props.circle.members.map(member => {
		    let answers = [];
		    statusList.map(status => {
			    if (status.member.id === member.id) {
				    answers.push({askedInfo: columns[0], answer: status.status})
			    }
		    });
            if (answers.length < 1)
                answers.push({askedInfo: columns[0], answer: 'ACTIVE'});
            
            this.props.circle.askedInformation.map(askedInfo => {
                let answer ;
                this.props.circle.membersInformation.map(info => {
                    if (info.user.id === member.id && askedInfo.id === info.information) {
                        if (askedInfo.type === 'NUMBER')
                            answer = parseInt(info.value); 
                        else if (askedInfo.type === 'BOOLEAN') 
                            answer = info.value === 'false' ? false : true ;
                        else 
                            answer = info.value; 
                    }
                })
                answers.push({askedInfo, answer})
            })
            rows.push({user: member, answers})
        })

        this.setState({rows, columns})
    }

    componentWillReceiveProps = (nextProps) => {
        if (!isEqual(nextProps.circle, this.props.circle) || this.state.columns.length === 0) {
            let columns = [];
            columns.push({type:'STATUS', name: 'Status', id: 'SERKET', filledByOwner: true});
            nextProps.circle.askedInformation.map(askedInfo => {
                columns.push(askedInfo);
            });
            let rows = [];
            let statusList = [];

            nextProps.circle.memberStatus.forEach(status => {
	            let index = statusList.findIndex(tmpStatus => tmpStatus.member.id === status.member.id)
              if (index < 0) {
	              statusList.push(status)
              }
              else if (statusList[index].starting_date < status.starting_date)
                statusList[index] = status
            });
            nextProps.circle.members.map(member => {
                let answers = [];
                statusList.map(status => {
                    if (status.member.id === member.id) {
	                    answers.push({askedInfo: columns[0], answer: status.status})
                    }
                });
                if (answers.length < 1)
                    answers.push({askedInfo: columns[0], answer: 'ACTIVE'});

                nextProps.circle.askedInformation.map(askedInfo => {
                    let answer ;
                    nextProps.circle.membersInformation.map(info => {
                        if (info.user.id === member.id && askedInfo.id === info.information) {
                            if (askedInfo.type === 'NUMBER')
                                answer = parseInt(info.value); 
                            else if (askedInfo.type === 'BOOLEAN') 
                                answer = info.value === 'false' ? false : true ;
                            else 
                                answer = info.value; 
                        }
                    })
                    answers.push({askedInfo, answer})
                })
                rows.push({user: member, answers})
            })
            
            this.setState({rows, columns})
        }
    }

    updateAnswer = (rowIndex, colIndex, type, e) => {
        let newState = this.state.rows ;

        if (type === 'BOOLEAN')
            newState[rowIndex].answers[colIndex].answer = e.target.checked;
        else if (type === 'NUMBER')
            newState[rowIndex].answers[colIndex].answer = parseInt(e.target.value);
        else if (type === 'STATUS')
            newState[rowIndex].answers[colIndex].answer = e.value;
        else 
            newState[rowIndex].answers[colIndex].answer = e.target.value;

        this.setState({rows: newState})
    }

    _handleSubmit = () => {
        const idVar = this.props.circle.id;
        const viewer = this.props.viewer ;

        let answersVar = this.state.rows.map(row => (
            {
                userId: row.user.id,
                filledInformation: row.answers.slice(1).map(answer => (
                    typeof answer.answer !== 'undefined'
                    ?   {
                            id: answer.askedInfo.id,
                            value: answer.answer
                        }
                    :   false
                )).filter(i => Boolean(i))
            }
        ));

        let memberStatusVar = [];

        this.state.rows.map((row) => {
                memberStatusVar.push({memberId: row.user.id, status: row.answers[0].answer})
        });
        UpdateMemberStatusMutation.commit({
                viewer,
                circle: this.props.circle,
                idVar,
                memberStatusVar
            },
            {
                onFailure: error => {
                    this.props.alert.show(localizations.popup_editCircle_status_update_failed, {
                        timeout: 2000,
                        type: 'error',
                    });
                    let errors = JSON.parse(error.getError().source);
                    console.log(errors);
                },
                onSuccess: (response) => {
                    this.props.alert.show(localizations.popup_editCircle_status_update_success, {
                        timeout: 2000,
                        type: 'success',
                    });
                    UpdateFilledInformationMutation.commit({
                            viewer,
                            idVar,
                            answersVar
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
                                this.props.alert.show(localizations.popup_editCircle_update_success, {
                                    timeout: 2000,
                                    type: 'success',
                                });
                            },
                        }
                    )
                },
            }
        )
        
        /*UpdateFilledInformationMutation.commit({
              viewer,
              idVar,
              answersVar
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
                this.props.alert.show(localizations.popup_editCircle_update_success, {
                  timeout: 2000,
                  type: 'success',
                });
              },
            }
        )*/
    }

    _relaunchMembers = () => {
        const idVar = this.props.circle.id;
        const viewer = this.props.viewer ;

        RelaunchMembersMutation.commit({
              viewer,
              idVar,
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
                this.props.alert.show(localizations.popup_editCircle_update_success, {
                  timeout: 2000,
                  type: 'success',
                });
                this.setState({isRelaunchButtonVisible: false})
              },
            }
        )
    }
    
    render() {
        
        const { viewer, circle } = this.props;
        const { rows, columns } = this.state; 

        const statusList = [
            { value: 'ACTIVE', label: localizations.circle_status_active },
            { value: 'INJURED', label: localizations.circle_status_injured },
            { value: 'INACTIVE', label: localizations.circle_status_inactive },
            { value: 'OTHER', label: localizations.circle_status_other },
        ];

        return (
            <div style={styles.container}>
                <div style={styles.wrapper}>
                    <div style={styles.memberList}>
                        <table style={styles.memberTable}>
                            <thead>
                                <tr>
                                    <td style={styles.firstRowText}>Pseudo</td>
                                    {columns.map(info => 
                                        <td key={info.id} style={styles.firstRowText}>
                                            {info.name}
                                        </td>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                { rows.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        <td style={styles.firstCol}>
                                            <div style={styles.firstColContent}>
                                                <span 
                                                    style={{...styles.iconImage, backgroundImage: row.user.avatar ? 'url('+ row.user.avatar +')' : 'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")'}}
                                                />
                                                {row.user.pseudo}
                                            </div>
                                        </td>
                                        {row.answers.map((info, colIndex) => (
                                            <td key={colIndex} style={styles.cellContent}>
                                                {info.askedInfo.filledByOwner 
                                                ?   
                                                    info.askedInfo.type === "BOOLEAN"
                                                    ?   <div style={styles.inputContainer}>
                                                            <input 
                                                                style={styles.input} 
                                                                type={"checkbox"}
                                                                checked={info.answer}
                                                                onChange={(e) => this.updateAnswer(rowIndex, colIndex, info.askedInfo.type, e)} 
                                                            />
                                                            <span style={{marginLeft: 5}}>
                                                                {info.answer ? localizations.circle_yes : localizations.circle_no}
                                                            </span>
                                                        </div>
                                                    :   <div style={styles.inputContainer}>
                                                            {info.askedInfo.type === 'STATUS'
                                                            ?   <Select
                                                                    options={statusList}
                                                                    style={{width: 100}}
                                                                    onChange={(e) => this.updateAnswer(rowIndex, colIndex, info.askedInfo.type, e)}
                                                                    value={info.answer}
                                                                    clearable={false}
                                                                    searchable={false}
                                                                    menuContainerStyle={{zIndex:100}}
                                                                />
                                                            :   <input 
                                                                    style={styles.input} 
                                                                    type={info.askedInfo.type}
                                                                    value={info.answer}
                                                                    maxLength={"25"}
                                                                    onChange={(e) => this.updateAnswer(rowIndex, colIndex, info.askedInfo.type, e)} 
                                                                />
                                                            }
                                                    </div>
                                                :   info.askedInfo.type === "BOOLEAN"
                                                    ? info.answer ? localizations.circle_yes : info.answer === false ? localizations.circle_no : ''
                                                    : info.askedInfo && info.askedInfo.type === 'DATE'
                                                        ?	info.answer ? moment(new Date(info.answer)).format('DD/MM/YYYY') : ''
                                                        :   info.answer
                                                }
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div style={styles.buttonRow}>
                    <button onClick={this._handleSubmit} style={styles.submitButton}>
                        {localizations.circles_save}
                    </button>
                    <Style scopeSelector="#test-table-xls-button" rules={{
                        ...styles.submitButton
                        }}
                    />
                    <ReactHTMLTableToExcel
                        id="test-table-xls-button"
                        className="download-table-xls-button"
                        table="table-to-xls"
                        filename={circle.name}
                        sheet={circle.name}
                        buttonText={localizations.circle_export_excel}/>

                    {this.state.isRelaunchButtonVisible && 
                        <button style={styles.submitButton} onClick={this._relaunchMembers}>
                            {localizations.circle_relaunch_members}
                        </button>
                    }
                </div>
                <table id="table-to-xls" style={{display: 'none'}}>
                    <tr>
                        <td>Pseudo</td>
                        {columns.map(info => 
                            <td key={info.id}>
                                {info.name}
                            </td>
                        )}
                    </tr>
                    { rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            <td >
                                {row.user.pseudo}
                            </td>
                            {row.answers.map((info, colIndex) => (
                                <td key={colIndex} >
                                    {   info.askedInfo.type === "BOOLEAN"
                                        ? info.answer ? localizations.circle_yes : info.answer === false ? localizations.circle_no : ''
                                        : info.answer
                                    }
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
    container: {
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
    },
    wrapper: {
        paddingBottom: '150px',
        overflow: 'scroll',
        width: '100%',
        margin: '25px 10px',
    },
    memberList: {
		display: 'flex',
		flexDirection: 'column',
		width: '100%',
        padding: 5/*,
        backgroundColor: 'whitesmoke',
        margin: '25px 10px',
        overflow: 'scroll'*/
        
    },
    memberTable: {
        boxShadow: '0 0 14px 0 rgba(0,0,0,0.12)',
        //border: '1px solid #E7E7E7',
        fontSize: 18,
		lineHeight: '24px',
        color: 'rgba(0,0,0,0.65)',
        fontFamily: 'Lato',
        margin: 'auto',
    },
    firstCol: {
        padding: '5px 10px',
        border: '1px solid '+colors.gray,
        backgroundColor: 'whitesmoke',
    },
    firstColContent: {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: 'whitesmoke',
    },
    firstRowText: {
        fontSize: 20, 
        fontWeight: 'bold',
        padding: 10,
        minWidth: 120,
        textAlign: 'center',
        border: '1px solid '+colors.gray,
        backgroundColor: 'whitesmoke',
    },
    iconImage: {
		color:colors.white,
		width: 40,
        height: 40,
        marginRight: 10,
		borderRadius: '50%',
		backgroundPosition: '50% 50%',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        display: 'inline-block'
    },
    cellContent: {
        border: '1px solid '+colors.gray,
        padding: 7,
        verticalAlign: 'middle',
        textAlign: 'center',
        backgroundColor: 'whitesmoke',
    },
    inputContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    input: {
        height: 30,
        fontFamily: 'Lato',
        fontSize: 14
    },
    buttonRow: {
        display: 'flex',
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-around',
        width: '100%',
        flexWrap: 'wrap',
        marginTop: -150,
        zIndex: 1,
        '@media (max-width: 960px)': {
            flexDirection: 'column'
        }
    },
    submitButton: {
        width: '200px',
        minHeight: '50px',
        backgroundColor: colors.green,
        boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
        borderRadius: '3px',
        display: 'inline-block',
        fontFamily: 'Lato',
        fontSize: '22px',
        textAlign: 'center',
        color: colors.white,
        borderWidth: 0,
        marginTop: 10,
        marginBottom: 10,
        cursor: 'pointer',
        lineHeight: '27px',
      },
    
}

export default createFragmentContainer(Radium(withAlert(MembersInformation)), {
  viewer: graphql`
    fragment CircleMembersDetailledInformation_viewer on Viewer {
      id
    }
  `
});