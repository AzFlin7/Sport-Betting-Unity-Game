import React from 'react';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Styles from './Styles'

import Circle from '../common/Header/Circle'

import Radium from 'radium';
import localizations from '../Localizations';
import { colors, fonts } from '../../theme'

class PanelTeam extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      authorized_managers: [],
      isSaving: false,
      editEmail: false,
      email: this.props.user.email || '',
    }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.user && nextProps.user.authorized_managers) {
      this.setState({
        authorized_managers: nextProps.user.authorized_managers,
        authorized_managersSrc: nextProps.user.authorized_managers,
      })
    }
  }

  _handleEmailInputChange = e => {
    this.setState({
      email: e.target.value,
      hasChanged: true
    })
  }

  _handleSaveEmail = () => {
    this.props.updateEmail(this.props.user.id, this.state.email)
    this.setState({
      editEmail: false
    })
  }

  _handleCancelEditEmail = () => {
    this.setState({
      editEmail: false,
      email: this.props.user.email
    })
  }

  _userAlreadyExist = (user) =>
    this.state.authorized_managers.find(
      (authrorized) => authrorized.user.id === user.user.id
    )

  onCloseModal = () => {
    this.setState({
      displaySearchModal: false,
    });
  };

  render() {
    const { viewer, user } = this.props;
    const { editEmail } = this.state;

    return (
      <div style={styles.root}>
        <ExpansionPanel>
          <ExpansionPanelSummary  expandIcon={<ExpandMoreIcon/>}>
            <span style={{display: 'flex', alignItems: 'center'}}>
              <Circle image={user.avatar} style={styles.icon} />
              {user.pseudo}
            </span>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <section style={styles.container}>
              <div style={styles.row}>
                <label style={styles.label}>{localizations.contactUs_email_text}</label>
                { editEmail
                  ?	<div style={styles.inputRow}>
                    <input
                      type='text' style={styles.input}
                      value={this.state.email}
                      placeholder='example@example.com'
                      onChange={this._handleEmailInputChange}
                    />
                    <i
                      className='fa fa-check'
                      style={styles.checkIcon}
                      onClick={this._handleSaveEmail}
                    />
                    <i
                      className='fa fa-times'
                      style={styles.cancelEditIcon}
                      onClick={this._handleCancelEditEmail}
                    />
                  </div>
                  : <div>
                    <label style={{...styles.label, width: 300}}>{user.email}</label>
                    <i
                      style={styles.pencilIcon}
                      className="fa fa-pencil"
                      aria-hidden="true"
                      onClick={() => this.setState({editEmail: true})}
                    />
                  </div> }
              </div>
              <div style={{...styles.teamPanelRow, marginTop: 15}}>
                <label style={styles.label}>{localizations.info_access_rights_access_right}:</label>
                {user.authorized_managers.length > 0
                  ? <div style={styles.teamPanelRow}>
                    {user.authorized_managers.map((authorized, index) => (
                      <span style={styles.teamPanelRow}>
                        <Circle image={authorized.user.avatar} style={styles.icon}/>
                        {authorized.user.pseudo}
                        <span style={styles.removeCross} onClick={() => this.props.handleRemoveManager(this.props.user, authorized.user.id)}>
										      <i className="fa fa-times" style={styles.cancelIcon} aria-hidden="true"></i>
									      </span>
                      </span>
                    ))}
                  </div>
                  : <label style={{...styles.label, width: 250}}>
                      {localizations.info_access_rights_no_manager}
                    </label>
                }
                <span style={styles.teamPanelRow}>
                  <i
                    style={styles.pencilIcon}
                    className="fa fa-plus"
                    aria-hidden="true"
                    onClick={this.props.showMemberSearchModal}
                  />
                </span>
              </div>
              <div style={{...styles.row, justifyContent: 'flex-end'}}>
                <span style={{color: colors.red, font: 6, cursor: 'pointer'}} onClick={() => this.props.handleDelete(user.id, user.pseudo)}>
                  {viewer.me.profileType === 'PERSON'
                    ? localizations.info_access_rights_delete_children
                    : localizations.info_access_rights_delete_team
                  }
                </span>
              </div>
            </section>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </div>
    )
  }
}

let styles = {
  ...Styles,
  root: {
    width: '100%'
  },
  icon: {
    display: 'inline-block',
    width: 38,
    height: 38,
    marginRight: 10,
  },
  selectInput: {
    color: 'rgba(0,0,0,0.65)',
    border: '1px solid rgba(0,0,0,0.2)',
    borderColor: 'transparent',
    background: 'rgba(255,255,255,.5)',
    borderBottom: '2px solid '+colors.blue,
    fontSize: fonts.size.medium,
    outline: 'none',
    fontFamily: 'Lato'
  },
  header: {
    fontFamily: 'Lato',
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
    paddingBottom: 15,
    flex: 5,
    marginTop: 40
  },
  input: {
    borderWidth: 0,
    borderBottomWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.blue,
    height: '32px',
    lineHeight: '32px',
    fontFamily: 'Lato',
    color: 'rgba(0,0,0,0.65)',
    background: 'transparent',
    fontSize: 16,
    outline: 'none',
    width: 300,
  },
  checkIcon: {
    backgroundColor: colors.green,
    color: colors.white,
    cursor: 'pointer',
    padding: '0.3em',
    margin: '0.5em'
  },
  cancelEditIcon: {
    backgroundColor: colors.red,
    color: colors.white,
    cursor: 'pointer',
    padding: '0.3em',
    margin: '0.5em'
  },
  pencilIcon: {
    fontSize: 20,
    color: colors.black,
    marginLeft: 10,
    cursor: 'pointer',
  },
  noManagerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  noManagerText: {
    textAlign: 'left',
    fontSize: 16,
    fontFamily: 'Lato',
    color: colors.darkGray,
    margin: 25
  },
  noManagerImage: {
    maxWidth: '100%',
    height: 'auto'
  },
  addButton: {
    fontSize: '10px',
    backgroundColor: colors.blue,
    color: colors.white,
    textTransform: 'none',
  },
  removeCross: {
    float: 'right',
    width: 0,
    color: colors.gray,
    marginLeft: '15px',
    marginRight: '15px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  teamPanelRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10
  }
};

export default Radium(PanelTeam);