import React from 'react'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium'
import { withAlert } from 'react-alert'
import isEqual from 'lodash/isEqual';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import Select from "react-select";
import moment from 'moment'

var Style = Radium.Style;

import localizations from '../../Localizations'
import { colors, fonts } from '../../../theme'
import UpdateFilledInformationMutation from '../../Circle/CircleMembersInformation/UpdateFilledInformationMutation.js'
import RelaunchMembersMutation from '../../Circle/CircleMembersInformation/RelaunchMembersMutation';
import UpdateMemberStatusMutation from "../../Circle/CircleMembersInformation/UpdateMemberStatusMutation";

let styles ;

class MembersInformation extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            isRelaunchButtonVisible: false,
            rows: this.props.rows,
            columns: this.props.columns,
        };
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
    };

  submit = (idVar, viewer, affiche) => {
    let answersVar = this.state.rows.map(row => (
      {
        userId: row.user.id,
        filledInformation: row.answers.slice(2).map(answer => (
          typeof answer.answer !== 'undefined'
            ?   {
              id: answer.askedInfo.id,
              value: answer.answer
            }
            :   false
        )).filter(i => Boolean(i))
      }
    )).filter(awnsers => awnsers.userId === idVar.circle.id);

    let memberStatusVar = [];

    this.state.rows.forEach((row) => {
      memberStatusVar.push({memberId: row.user.id, status: row.answers[1].answer})
    });
    UpdateMemberStatusMutation.commit({
        viewer,
        circle: idVar.circle,
        idVar: idVar.circle.id,
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
          if (affiche)
            this.props.alert.show(localizations.popup_editCircle_status_update_success, {
              timeout: 2000,
              type: 'success',
            });
        UpdateFilledInformationMutation.commit({
              viewer,
              idVar: idVar.circle.id,
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
                if (affiche)
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
  };

  _handleSubmit = () => {
    let Circles = [];
    const viewer = this.props.viewer ;

    this.props.user.allCircleMembers.forEach(member => {
      member.circles.forEach(circle => {
        if (Circles.findIndex(tmpCircle => circle.circle.id === tmpCircle.circle.id) < 0)
          Circles.push(circle)
      })
    });
    Circles.forEach((idVar, index) => this.submit(idVar, viewer, index + 1 >= Circles.length))
  };
    
    render() {

      const { viewer, user } = this.props;
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
                                    <td key={info.askedInfo.id} style={styles.firstRowText}>
                                        {info.askedInfo.name}
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
                                            {info.askedInfo.askedInfo.filledByOwner
                                            ?
                                                info.askedInfo.askedInfo.type === "BOOLEAN"
                                                ?   <div style={styles.inputContainer}>
                                                        <input
                                                            style={styles.input}
                                                            type={"checkbox"}
                                                            checked={info.answer}
                                                            onChange={(e) => this.updateAnswer(rowIndex, colIndex, info.askedInfo.askedInfo.type, e)}
                                                        />
                                                        <span style={{marginLeft: 5}}>
                                                            {info.answer ? localizations.circle_yes : localizations.circle_no}
                                                        </span>
                                                    </div>
                                                :
                                                  info.askedInfo.askedInfo.type === 'STATUS'
                                                    ?
                                                    <div style={styles.inputContainer}>
                                                      <div style={{width: 150}}>
                                                        <Select
                                                            options={statusList}
                                                            onChange={(e) => this.updateAnswer(rowIndex, colIndex, info.askedInfo.askedInfo.type, e)}
                                                            //value={info.answer}
                                                            value={statusList.find(status => status.value === info.answer)}
                                                            clearable={false}
                                                            searchable={false}
                                                            menuContainerStyle={{zIndex:100}}
                                                        />
                                                      </div>
                                                    </div>
                                                    :
                                                  <div style={styles.inputContainer}>
                                                    <input
                                                        style={styles.input}
                                                        type={info.askedInfo.askedInfo.type}
                                                        value={info.answer}
                                                        maxLength={"25"}
                                                        onChange={(e) => this.updateAnswer(rowIndex, colIndex, info.askedInfo.askedInfo.type, e)}
                                                    />
                                                </div>
                                            :   info.askedInfo.askedInfo.type === "BOOLEAN"
                                                ? info.answer ? localizations.circle_yes : info.answer === false ? localizations.circle_no : ''
                                                : info.askedInfo && info.askedInfo.askedInfo.type === 'DATE'
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
                        filename={viewer.me.pseudo}
                        sheet={viewer.me.pseudo}
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
                            <td key={info.askedInfo.id}>
                                {info.askedInfo.name}
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
                                    {   info.askedInfo.askedInfo.type === "BOOLEAN"
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
        '@media (max-width: 960px)': {
            width: '70%'
        },
        '@media (max-width: 580px)': {
            width: '100%'
        }
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
        padding: 5
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
      marginBottom: 40,
      cursor: 'pointer',
      lineHeight: '27px',
    },
}

export default createFragmentContainer(Radium(withAlert(MembersInformation)), {
  viewer: graphql`
    fragment MembersDetailledInformation_viewer on Viewer {
      id
      me {
        pseudo
      }
    }
  `
});