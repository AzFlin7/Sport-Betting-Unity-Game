import React from 'react';
import ReactTooltip from 'react-tooltip';
import Radium from 'radium';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import { Link } from 'found';
import ReactLoading from 'react-loading';
import _ from 'lodash';


import MemberCard from '../MemberCard';
import MemberRow from '../MemberRow';

import localizations from '../../Localizations';
import { colors, fonts } from '../../../theme';
import { Button } from '@material-ui/core';
import Input from '../../MyCircles/TermOfUse/Input';
import InputText from '../../common/Inputs/InputText';

let styles;
var Style = Radium.Style;

class MembersTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      search: '',
    };
  }

  openLogin = () => {
    this.props.router.push('/login');
  };

  render() {
    const {
      viewer,
      circle,
      isCurrentUserTheOwner,
      isCurrentUserCoOwner,
      isCurrentUserAMember,
      columns,
      rows,
      members,
      waitingMembers,
      refusedMembers,
      allMembers,
    } = this.props;

    const searchMembers = this.state.search.length > 0
    ? allMembers.filter(
      i => i.pseudo.toLowerCase().indexOf(this.state.search.toLowerCase()) > -1
    )
    :  members.filter(
      i => i.pseudo.toLowerCase().indexOf(this.state.search.toLowerCase()) > -1
    );

    const waitingMembersIds = _.map(waitingMembers, 'id')

    if (viewer.me) {
      return (
        <div style={styles.container}>
          <div style={styles.title}>{localizations.circle_title_members}</div>
          <div style={styles.headerRowFullWidth}>
            {(isCurrentUserTheOwner || isCurrentUserCoOwner) && (
              <div style={styles.buttonSection}>
                <ReactTooltip effect="solid" multiline />
                <Style
                  scopeSelector=".download-table-xls-button"
                  rules={{
                    ...styles.textButton,
                  }}
                />
                <Style
                  scopeSelector=".download-table-xls-button:hover"
                  rules={{
                    borderRadius: '5px',
                    backgroundColor: colors.gray,
                    color: colors.white,
                  }}
                />
                <div style={styles.sameRow}>
                  <div
                    key={'import'}
                    style={styles.textButton}
                    onClick={() => {}}
                  >
                    {localizations.circle_import_members}
                  </div>
                  <ReactHTMLTableToExcel
                    id="test-table-xls-button"
                    className="download-table-xls-button"
                    table="table-to-xls"
                    filename={circle.name}
                    sheet={circle.name}
                    buttonText={localizations.circle_export_excel}
                  />

                  {waitingMembersIds.length > 0 &&
                    <div
                      key={'validate-all'}
                      style={styles.textButton}
                      onClick={() => {this.props._acceptDenyMember({acceptedUsers: waitingMembers})}}
                    >
                      {localizations.circle_validateAll}
                    </div>
                  }
                </div>
              </div>
            )}
            <div style={styles.secondTitleRow}>
              {(isCurrentUserTheOwner || isCurrentUserCoOwner) && (
                <div style={styles.headerRow}>
                  <InputText
                    placeholder={localizations.circle_search_member}
                    style={styles.searchText}
                    value={this.state.search}
                    onChange={e => this.setState({ search: e.target.value })}
                  />
                  <div
                    key="switchView"
                    style={styles.icon}
                    onClick={this.props._displayRowsOrCards}
                    data-tip={
                      this.props.rowMembers
                        ? localizations.circle_display_box
                        : localizations.circle_display_rows
                    }
                  >
                  {this.props.rowMembers 
                  ? <i className="fa fa-id-card-o fa-2x" />
                  : <i className="fa fa-list fa-2x" />
                  }
                  </div>
                </div>
              )}
            </div>
            {searchMembers.length === 0 && this.state.search.length > 0 && (
              <div style={styles.errorMessageContainer}>
                <i
                  className="fa fa-exclamation-circle fa-5x"
                  style={{ color: colors.blue }}
                />
                <div style={{ ...styles.title, color: colors.blue }}>
                  {localizations.no_member_for_this_pseudo}
                </div>
                <div style={styles.errorMessageContainer} />
              </div>
            )}
            {members.length > 0 ||
            waitingMembers.length > 0 || 
            refusedMembers.length > 0
            ? <div>
                {this.props.rowMembers 
                ? <table style={styles.memberListRow}>
                    {searchMembers.length > 0 && columns.length > 0 && (
                      <thead>
                        <tr style={styles.tableRowHeader}>
                          <td style={{ width: '5%' }} />
                          <td style={styles.tableRowHeaderPseudo}>Pseudo</td>
                          {isCurrentUserTheOwner &&
                            columns.map((column, index) => (
                              <td
                                key={index}
                                style={{
                                  ...styles.tableRowHeaderTitle,
                                  textAlign: 'center',
                                }}
                              >
                                {column.name}
                              </td>
                            ))}
                          {isCurrentUserTheOwner && circle.shouldValidateNewUser && 
                            <td style={{...styles.tableRowHeaderTitle, textAlign: 'center'}}>{localizations.circle_participationCondition}</td>
                          }
                          <td />
                        </tr>
                      </thead>
                    )}
                    <tbody>
                      {waitingMembers.map(member => (
                        <MemberRow
                          key={member.id}
                          type="waitingMembers"
                          member={member}
                          viewer={viewer}
                          circleId={this.props.circle.id}
                          userCanRemoveMember={
                            (isCurrentUserTheOwner || isCurrentUserCoOwner) &&
                            !this.props.isUserMemberOfMergedCircle(
                              member,
                              circle,
                            )
                          }
                          onAcceptDenyMember={this.props._acceptDenyMember}
                          filledInformation={
                            (isCurrentUserTheOwner || isCurrentUserCoOwner) &&
                            rows.length > 0
                              ? rows[
                                  rows.findIndex(
                                    row => row.user.id === member.id,
                                  )
                                ]
                              : null
                          }
                          handleUserClicked={this.props._handleUserClicked}
                          selectedUserList={this.props.selectedUserList}
                        />
                      ))}
                      {searchMembers.map(member => (
                        <MemberRow
                          type="members"
                          key={member.id}
                          member={member}
                          viewer={viewer}
                          circleId={this.props.circle.id}
                          userCanRemoveMember={
                            (isCurrentUserTheOwner || isCurrentUserCoOwner) &&
                            !this.props.isUserMemberOfMergedCircle(
                              member,
                              circle,
                            )
                          }
                          onDeleteMember={this.props._deleteMember}
                          filledInformation={
                            (isCurrentUserTheOwner || isCurrentUserCoOwner) &&
                            rows.length > 0
                              ? rows[
                                  rows.findIndex(
                                    row => row.user.id === member.id,
                                  )
                                ]
                              : null
                          }
                          handleUserClicked={this.props._handleUserClicked}
                          selectedUserList={this.props.selectedUserList}
                        />
                      ))}
                      {refusedMembers.map(member => (
                        <MemberRow
                            type="refusedMembers"
                            key={member.id}
                            member={member}
                            viewer={viewer}
                            circleId={this.props.circle.id}
                            userCanRemoveMember={
                              (isCurrentUserTheOwner || isCurrentUserCoOwner) &&
                              !this.props.isUserMemberOfMergedCircle(
                                member,
                                circle,
                              )
                            }
                            onDeleteMember={this.props._deleteMember}
                            onAcceptDenyMember={this.props._acceptDenyMember}
                            filledInformation={
                              (isCurrentUserTheOwner || isCurrentUserCoOwner) &&
                              rows.length > 0
                                ? rows[
                                    rows.findIndex(
                                      row => row.user.id === member.id,
                                    )
                                  ]
                                : null
                            }
                            handleUserClicked={this.props._handleUserClicked}
                            selectedUserList={this.props.selectedUserList}
                          />
                      ))}
                    </tbody>
                  </table>
                  : <div style={styles.memberList}>
                      {searchMembers.map(member => (
                        <MemberCard
                          key={member.id}
                          member={member}
                          viewer={viewer}
                          circleId={this.props.circle.id}
                          userCanRemoveMember={
                            (isCurrentUserTheOwner || isCurrentUserCoOwner) &&
                            !this.props.isUserMemberOfMergedCircle(
                              member,
                              circle,
                            )
                          }
                          onDeleteMember={this.props._deleteMember}
                          existingAskedInformation={
                            circle.askedInformation &&
                            circle.askedInformation.length > 0
                          }
                          userFilledInfos={
                            !circle.askedInformation ||
                            circle.askedInformation.length === 0 ||
                            this.props.isUserFilledInformation(member, circle)
                          }
                          handleUserClicked={this.props._handleUserClicked}
                          selectedUserList={this.props.selectedUserList}
                        />
                      ))}
                    </div>
                  }
                  {this.props.rowMembers &&
                    this.props.isRelaunchButtonVisible &&
                    circle.askedInformation &&
                    circle.askedInformation.length > 0 && (
                      <button
                        key={'relaunchButton'}
                        style={styles.button}
                        onClick={this.props._relaunchMembers}
                      >
                        {localizations.circle_relaunch_members}
                      </button>
                    )
                  }
              </div>
            : this.props.queryCircle 
              ? <div style={styles.loadingContainer}>
                  <ReactLoading type="spinningBubbles" color={colors.blue} />
                </div>
              : isCurrentUserTheOwner || isCurrentUserCoOwner 
                ? <div style={styles.errorMessageContainer}>
                    <i
                      className="fa fa-exclamation-circle fa-5x"
                      style={{ color: colors.blue, marginBottom: 20 }}
                    />
                    <div style={{ ...styles.title, color: colors.blue }}>
                      {localizations.circle_members_noMember_title_owner}
                    </div>
                    <div style={styles.errorMessageContainer}>
                      <p style={styles.messageError}>
                        {localizations.circle_members_noMember_message_owner['0']}
                        <span
                          style={{ color: colors.blue, cursor: 'pointer' }}
                          onClick={this.props.addMember}
                        >
                          {circle.type === 'CHILDREN'
                            ? localizations
                                .circle_members_noMember_message_owner_child['1']
                            : localizations.circle_members_noMember_message_owner[
                                '1'
                              ]}
                          <i className="fa fa-plus-circle" />
                        </span>
                        {localizations.circle_members_noMember_message_owner['2']}
                        <span
                          style={{ color: colors.blue, cursor: 'pointer' }}
                          onClick={this.props.onLink}
                        >
                          {
                            localizations.circle_members_noMember_message_owner[
                              '3'
                            ]
                          }
                          <i className="fa fa-link" />
                        </span>
                        {localizations.circle_members_noMember_message_owner['4']}
                      </p>
                      <p style={styles.messageError}>
                        {localizations.circle_members_noMember_message_owner['5']}
                        <span
                          style={{ color: colors.blue, cursor: 'pointer' }}
                          onClick={() => this.props.switchToTab('settings')}
                        >
                          {
                            localizations.circle_members_noMember_message_owner[
                              '6'
                            ]
                          }
                          <i className="fa fa-gear" />
                        </span>
                        {localizations.circle_members_noMember_message_owner['7']}
                      </p>
                    </div>
                  </div>
                : <div style={styles.errorMessageContainer}>
                    <i
                      className="fa fa-exclamation-circle fa-5x"
                      style={{ color: colors.blue }}
                    />
                    <div style={{ ...styles.title, color: colors.blue }}>
                      {localizations.circle_members_noMember_title}
                    </div>
                    <div>
                      <p style={styles.messageError}>
                        {localizations.circle_members_noMember_message['0']}
                        <span
                          style={{ color: colors.blue, cursor: 'pointer' }}
                          onClick={this.props.onSubscribe}
                        >
                          {localizations.circle_members_noMember_message['1']}
                        </span>
                      </p>
                    </div>
                  </div>
            }
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <div style={styles.title}>
            {localizations.circle_title_members +
              ' (' +
              circle.memberCount +
              ')'}
          </div>

          <div style={styles.cannotAccessContainer}>
            <i
              style={styles.alertIcon}
              className="fa fa-exclamation-circle fa-2x"
            />
            <div style={styles.cannotAccessTitle}>
              {localizations.circle_members_not_available}
            </div>
            <div style={styles.cannotAccessText}>
              <span>
                {localizations.circle_members_not_availableTextLogin.replace(
                  '{0}',
                  circle.memberCount,
                )}
                <span style={styles.cannotAccessLink} onClick={this.openLogin}>
                  {localizations.circle_members_not_availableTextLogin2}
                </span>
              </span>
            </div>
          </div>
        </div>
      );
    }
  }
}

styles = {
  container: {
    marginTop: '40px',
    marginLeft: '20px',
    marginRight: '20px',
  },
  messageError: {
    fontSize: 18,
    fontFamily: 'lato',
    textAlign: 'center',
  },
  firstTitleRow: {},

  searchText: {
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottom: 'none',
    // borderBottomWidth: 2,
    // borderBottomColor: colors.blue,
    fontSize: 12,
    fontFamily: 'Lato',
    lineHeight: '25px',
    height: '25px',
    color: colors.black,
    padding: 3,
    outline: 'none',
    boxShadow: 'rgba(0, 0, 0, 0.12) 1px 1px 1px 1px',
    minWidth: '250px',
    backgroundColor: colors.lightGray,
    marginRight: '5px',
  },

  sameRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },

  secondTitleRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: '20px',
  },
  exportButton: {
    backgroundColor: colors.blue,
    color: colors.white,
  },
  loadingSpinner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  errorMessageContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Lato',
    color: colors.darkGray,
    marginBottom: 25
  },
  pageHeader: {
    fontFamily: 'Lato',
    fontSize: 34,
    fontWeight: fonts.weight.large,
    color: colors.blue,
    display: 'flex',
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    //width: 1665,
    '@media (max-width: 1930px)': {
      //width: 1245
    },
    '@media (max-width: 1490px)': {
      //width: 825
    },
    '@media (max-width: 1070px)': {
      width: '100%',
    },
    '@media (max-width: 900px)': {
      flexDirection: 'column',
      marginBottom: 0,
    },
    '@media (max-width: 768px)': {
      paddingLeft: 20,
    },
  },
  memberListRow: {
    marginTop: 15,
    padding: 0,
    minWidth: '100%',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12)',
  },
  navLink: {
    color: colors.blue,
    textDecoration: 'none',
    marginRight: '10px',
  },
  headerRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    //width: 1665,
    '@media (max-width: 1930px)': {
      //width: 1245
    },
    '@media (max-width: 1490px)': {
      //width: 825
    },
    '@media (max-width: 1070px)': {
      //width: '90%'
    },
  },
  param: {
    fontSize: 18,
    color: colors.black,
    marginRight: 20,
  },
  iconEdit: {
    cursor: 'pointer',
    color: colors.blueLight,
    fontSize: 18,
    ':hover': {
      color: colors.blue,
    },
  },
  policyIcon: {
    marginLeft: 5,
    color: colors.gray,
  },
  bodyContainer: {
    display: 'flex',
    width: '100%',

    margin: '0px 0 50px 0',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    minHeight: 600,
    padding: '0 15px',
  },
  newMemberSection: {
    marginTop: 25,
  },
  ownerContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  smallAvatar: {
    width: 30,
    height: 30,
    marginRight: 10,
    color: colors.blue,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    borderRadius: '50%',
  },
  ownerName: {
    color: colors.gray,
    fontSize: 22,
    fontWeight: 'normal',
  },
  memberList: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    width: '100%',
    padding: 0,
    flexWrap: 'wrap',
    '@media (max-width: 1070px)': {
      justifyContent: 'center',
    },
  },
  headerRowFullWidth: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '100%',
  },
  buttonSection: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },

  icons: {
    cursor: 'pointer',
    marginLeft: 5,
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
    },
  },
  textButton: {
    cursor: 'pointer',
    backgroundColor: colors.blue,
    color: colors.white,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
    border: '1 px solid ' + colors.blue,
    borderRadius: '5px',
    marginLeft: 5,
    fontFamily: 'Lato',
    fontSize: 14,
    lineHeight: '22px',
    height: '40px',
    padding: '5px 10px',
    ':hover': {
      borderRadius: '5px',
      backgroundColor: colors.gray,
      color: colors.white,
    },
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
      border: 'none',
    },
    ':hover': {
      borderRadius: '5px',
      backgroundColor: colors.gray,
      color: colors.white,
    },
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 15,
    marginLeft: 15,
  },
  label: {
    fontFamily: 'Lato',
    fontSize: 16,
    color: colors.blue,
    marginRight: 10,
  },
  bigLabel: {
    fontFamily: 'Lato',
    fontSize: 20,
    color: colors.blue,
    marginRight: 10,
    marginTop: 25,
  },
  switchContainer: {
    marginLeft: 15,
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
    },
  },
  tableRowHeader: {
    backgroundColor: colors.white,
    // boxShadow: '0 0 4px 0 rgba(0,0,0,0.12)',
    // border: '1px solid #E7E7E7',
    overflow: 'hidden',
    fontFamily: 'Lato',
    margin: '1px 0',
    padding: 15,
    textDecoration: 'none',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '40px',
  },
  tableRowHeaderPseudo: {
    marginRight: 10,
    fontWeight: 'bold',
    fontSize: 16,
    padding: 5,
    color: 'rgba(0,0,0,0.65)',
    width: '30%',
  },
  tableRowHeaderTitle: {
    marginRight: 10,
    fontWeight: 'bold',
    fontSize: 16,
    padding: 5,
    color: 'rgba(0,0,0,0.65)',
    width: '30%',
  },
  msgContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  msgIcon: {
    fontSize: '1.5em',
    color: '#a6a6a6',
    verticalAlign: 'sub',
  },
  msgHeader: {
    fontSize: 22,
    color: colors.blue,
    fontFamily: 'Lato',
    textAlign: 'center',
    lineHeight: '26px',
    fontWeight: 'bold',
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
  },
  separator: {
    height: 1,
    width: '10%',
    backgroundColor: '#000',
    margin: '20px 0px',
  },
  cannotAccessContainer: {
    marginLeft: 25,
    fontFamily: 'Lato',
    textAlign: 'center',
  },
  alertIcon: {
    color: colors.blue,
    fontSize: 60,
    marginBottom: 25,
  },
  cannotAccessTitle: {
    color: colors.blue,
    fontSize: 22,
    textAlign: 'center',
  },
  cannotAccessText: {
    color: colors.darkGray,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  cannotAccessLink: {
    color: colors.blue,
    cursor: 'pointer',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    width: 600,
    '@media (minWidth: 1024px)': {
      minWidth: 600,
    },
    '@media (maxWidth: 1024px)': {
      width: 'auto',
    },
  },
};

export default Radium(MembersTab);
