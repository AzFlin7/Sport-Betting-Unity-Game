import React from 'react'
import ReactTooltip from 'react-tooltip'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import Radium from  'radium'
import styles from './Styles'
import {Link} from 'found'
import { backendUrl } from '../../../constants.json'
import { withAlert } from 'react-alert'

import localizations from '../Localizations'
import {colors} from "../../theme";
import Switch from '../common/Switch'
import UpdateSynchronizeSettings from "./UpdateSynchronizeSettings";
import CircleSynchronizeSettings from "./CircleSynchronizeSettings";

let RadiumLink = Radium(Link);
let localStyle;

class SynchronizeCalendar extends React.Component
{

  constructor(props) {
    super(props);
    this._initSetting();
  }

  _initSetting() {
    const { viewer } = this.props;
    const _organizedIsSynchronized = viewer.me.calendar.preferences.own_synchronized_status.findIndex((status) => {
      return status.toUpperCase() === 'ORGANIZED'
    }) > -1;
    const _reservedIsSynchronized = (viewer.me.calendar.preferences.own_synchronized_status.findIndex((status) => {
      return status.toUpperCase() === 'BOOKED'
    }) > -1);
    const _invitedIsSynchronized = (viewer.me.calendar.preferences.own_synchronized_status.findIndex((status) => {
      return status.toUpperCase() === 'INVITED'
    }) > -1);
    const _refusedIsSynchronized = (viewer.me.calendar.preferences.own_synchronized_status.findIndex((status) => {
      return status.toUpperCase() === 'DECLINED'
    }) > -1);
    this.state = {
      organizedIsSynchronized: _organizedIsSynchronized,
      reservedIsSynchronized: _reservedIsSynchronized,
      invitedIsSynchronized: _invitedIsSynchronized,
      refusedIsSynchronized: _refusedIsSynchronized,
    };
  }

  _updateSettings = () => {
    const { viewer } = this.props;
    const settingArray = [];
    if (this.state.organizedIsSynchronized)
      settingArray.push('Organized');
    if (this.state.reservedIsSynchronized)
      settingArray.push('Booked');
    if (this.state.invitedIsSynchronized)
      settingArray.push('Invited');
    if (this.state.refusedIsSynchronized)
      settingArray.push('Declined');
    const newSetting = {
      userIDVar: viewer.me.id,
      own_synchronized_statusVar: settingArray,
      user: viewer.me,
    };
    UpdateSynchronizeSettings.commit(newSetting, {
        onSuccess: () => {
          this.props.alert.show(localizations.synchronize_calendar_success, {
            timeout: 5000,
            type: 'success',
          });
        },
        onError: (error) => {
          this.props.alert.show(localizations.synchronize_calendar_failed, {
            timeout: 2000,
            type: 'error',
          });
          console.log(error);
        }
      }
    )
  };

  _updateOrganizedSetting = (e) => {
    this.setState({
      organizedIsSynchronized: e
    }, this._updateSettings);
  };
  _updateReservedSetting = (e) => {
    this.setState({
      reservedIsSynchronized: e
    }, this._updateSettings);
  };
  _updateInvitedSetting = (e) => {
    this.setState({
      invitedIsSynchronized: e
    }, this._updateSettings);
  };
  _updateRefusedSetting = (e) => {
    this.setState({
      refusedIsSynchronized: e
    }, this._updateSettings);
  };

  _copyLink = () => {
    console.log(this.synchronizeLink);
    this.synchronizeLink.disabled = false;
    this.synchronizeLink.select();
    document.execCommand('copy');
    this.synchronizeLink.disabled = true;
  };

  render() {

    const { viewer } = this.props;

    return(
      <section style={{...styles.container, ...localStyle.container}}>
        <div style={localStyle.header}>{localizations.synchronize_calendar_title}</div>
        <div style={styles.rowHeader}>
          <ReactTooltip effect='solid' multiline={true}/>
          <div style={styles.header}>{localizations.my_synchronize_link}</div>
          <i
            data-tip={localizations.synchronize_calendar_tooltip}
            style={localStyle.linkToolTipIcon}
            className='fa fa-question-circle'
            aria-hidden='true'
          />
        </div>
        <div style={{...styles.container, ...localStyle.rowContainer}}>
          <RadiumLink style={localStyle.link} to='/faq/tutorial/how-to-synchronise-event-with-your-calendar'>
            www.sportunity.com/faq/tutorial/how-to-synchronise-event-with-your-calendar
          </RadiumLink>
          <div style={styles.row}>
            <input style={localStyle.linkCalendar} ref={(ref) => this.synchronizeLink = ref}
              value={backendUrl + '/ics/mycalendar/' + viewer.me.id+ '.ics'} disabled={true}/>
            <i
              className='fa fa-copy'
              style={localStyle.copy}
              onClick={this._copyLink}
            />
          </div>
          <div style={styles.row}>
            <p style={localStyle.warning}>
              <i
                className='fa fa-warning'
                style={{marginRight: 5}}
              />
              {localizations.my_synchronize_warning['0']}
              <RadiumLink style={localStyle.link} to='/faq/tutorial/how-to-synchronise-event-with-your-calendar'>{localizations.my_synchronize_warning['1']}</RadiumLink>{localizations.my_synchronize_warning['2']}
            </p>
          </div>
        </div>
        <div style={styles.rowHeader}>
          <div style={styles.header}>{localizations.setting_synchronize_title}</div>
        </div>
        <div style={{...styles.container, ...localStyle.rowContainer}}>
          <div style={{...styles.row, ...localStyle.row}}>
            <div style={this.state.organizedIsSynchronized ? localStyle.labelActive : localStyle.label}>
              {localizations.setting_synchronize_organize}
            </div>
            <Switch
              checked={this.state.organizedIsSynchronized}
              onChange={e => this._updateOrganizedSetting(e)}
            />
          </div>
          <div style={{...styles.row, ...localStyle.row}}>
            <div style={this.state.reservedIsSynchronized ? localStyle.labelActive : localStyle.label}>
              {localizations.setting_synchronize_reserved}
            </div>
            <Switch
              checked={this.state.reservedIsSynchronized}
              onChange={e => this._updateReservedSetting(e)}
            />
          </div>
          <div style={{...styles.row, ...localStyle.row}}>
            <div style={this.state.invitedIsSynchronized ? localStyle.labelActive : localStyle.label}>
              {localizations.setting_synchronize_invited}
            </div>
            <Switch
              checked={this.state.invitedIsSynchronized}
              onChange={e => this._updateInvitedSetting(e)}
            />
          </div>
          <div style={{...styles.row, ...localStyle.row}}>
            <div style={this.state.refusedIsSynchronized ? localStyle.labelActive : localStyle.label}>
              {localizations.setting_synchronize_refused}
            </div>
            <Switch
              checked={this.state.refusedIsSynchronized}
              onChange={e => this._updateRefusedSetting(e)}
            />
          </div>
        </div>
        <div style={styles.rowHeader}>
          <div style={styles.header}>{localizations.synchronize_community}</div>
        </div>
        <div style={{...styles.container, ...localStyle.container}}>
          {viewer.me.circlesUserIsIn && viewer.me.circlesUserIsIn.edges && (
            viewer.me.circlesUserIsIn.edges.length > 0
            ? viewer.me.circlesUserIsIn.edges.map(nodeCircle =>
                <CircleSynchronizeSettings
                  style={localStyle}
                  owner={nodeCircle.node.owner}
                  user={this.props.viewer.me}
                />
              )
            : <span style={{fontFamily: 'Lato', fontSize: 14, marginTop: 20}}>
                {localizations.searchModule_No_Group.split('{0}')[0]}
                <Link to="/my-circles">
                  {localizations.searchModule_No_Group_link}
                </Link> 
                {localizations.searchModule_No_Group.split('{0}')[1]}
              </span>
          )}
        </div>
      </section>
    );
  }
}

localStyle = {
  warning: {
    color: colors.red,
    fontFamily: 'Lato',
    fontSize: 16,
  },
  iconImage: {
    color:colors.white,
    width: 50,
    height: 50,
    borderRadius: '50%',
    backgroundPosition: '50% 50%',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    marginRight: 10,
  },
  header: {
    fontFamily: 'Lato',
    fontSize: 20,
    fontWeight: 'bold',
    color: 'rgb(94, 159, 223)',
    marginBottom: 15,
  },
  container: {
    '@media (max-width: 1024px)': {
      maxWidth: 500,
    },
    '@media (max-width: 746px)': {
      maxWidth: 300
    },
    '@media (max-width: 550px)': {
      maxWidth: 250
    },
    '@media (max-width: 480px)': {
      maxWidth: 480
    }
  },
  rowContainer: {
    marginTop: 30,
  },
  row: {
    width: '75%',
    justifyContent: 'space-between',
  },
  linkToolTipIcon: {
    marginLeft: 15,
    fontSize: 22,
    cursor: 'pointer',
    color: colors.blue,
  },
  link: {
    color: '-webkit-link',
    cursor: 'pointer',
    fontSize: 16,
  },
  linkCalendar: {
    border: '1px solid rgba(0, 0, 0, 0.2)',
    padding: '0px 5px',
    marginRight: 10,
    fontSize: 16,
    overflowX: 'auto',
    width: '100%'
  },
  label: {
    fontFamily: 'Lato',
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
  },
  labelActive: {
    fontFamily: 'Lato',
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.blue,
  },
  copy: {
    fontSize: 16,
    padding: 5,
    background: colors.lightGray,
    border: '1px solid #888',
    cursor: 'pointer',
  }
};

export default createFragmentContainer(Radium(withAlert(SynchronizeCalendar)), {
  viewer: graphql`
    fragment SynchronizeCalendar_viewer on Viewer {
      me {
        id
        circlesUserIsIn (last: 100) {
          edges {
            node {
              owner {
                id
                pseudo
                avatar
              }
            }
          }
        }
        calendar {
          users {
            id
            pseudo
          }
          preferences {
            own_synchronized_status
          }
        }
      }
    }
  `,
});