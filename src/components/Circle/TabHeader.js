import React from 'react';
import Radium from 'radium';

import { colors } from '../../theme';
import Badge from '@material-ui/core/Badge';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

let styles;

class TabHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hoverTab: null,
    };
  }

  onMouseEnter = tab => {
    this.setState({
      hoverTab: tab,
    });
  };
  onMouseLeave = () => {
    this.setState({
      hoverTab: null,
    });
  };

  render() {
    const {
      viewer,
      circle,
      activeTab,
      isCurrentUserTheOwner,
      isCurrentUserCoOwner,
      isCurrentUserAMember,
    } = this.props;
    const { hoverTab } = this.state;

    return (
      <AppBar color="primary" position="static" style={{ minHeight: 60 }}>
        <Toolbar style={{ minHeight: 60, justifyContent: 'center' }}>
          <div
            style={
              activeTab === 'details'
                ? styles.activeTab
                : hoverTab === 'details'
                ? styles.tabHover
                : styles.tab
            }
            onClick={() => this.props.switchToTab('details')}
            onMouseEnter={() => this.onMouseEnter('details')}
            onMouseLeave={this.onMouseLeave}
          >
            <div>
              <img src="/images/information.png" style={styles.icon} />
            </div>
          </div>
          <div
            style={
              activeTab === 'members'
                ? styles.activeTab
                : hoverTab === 'members'
                ? styles.tabHover
                : styles.tab
            }
            onClick={() => this.props.switchToTab('members')}
            onMouseEnter={() => this.onMouseEnter('members')}
            onMouseLeave={this.onMouseLeave}
          >
            <div>
              {/* <Badge badgeContent={circle.memberCount} classes={{ badge: 'badge' }}> */}
                <img src="/images/member.png" style={styles.icon}/>
              {/* </Badge> */}
            </div>
          </div>
          {(isCurrentUserTheOwner ||
            isCurrentUserCoOwner ||
            isCurrentUserAMember) && (
            <div
              style={
                activeTab === 'chat'
                  ? styles.activeTab
                  : hoverTab === 'chat'
                  ? styles.tabHover
                  : styles.tab
              }
              onClick={() =>
                (isCurrentUserTheOwner ||
                  isCurrentUserCoOwner ||
                  isCurrentUserAMember) &&
                this.props.switchToTab('chat')
              }
              onMouseEnter={() => this.onMouseEnter('chat')}
              onMouseLeave={this.onMouseLeave}
            >
              <div>
                {/* <Badge badgeContent={0} classes={{ badge: 'badge' }}> */}
                  <img src="/images/comment_bubble.png" style={styles.icon}/>
                {/* </Badge> */}
              </div>
            </div>
          )}
          <div
            style={
              activeTab === 'activities'
                ? styles.activeTab
                : hoverTab === 'activities'
                ? styles.tabHover
                : styles.tab
            }
            onClick={() => this.props.switchToTab('activities')}
            onMouseEnter={() => this.onMouseEnter('activities')}
            onMouseLeave={this.onMouseLeave}
          >
            <div>
              <img src="/images/activity_blue-01.png" style={styles.icon} />
            </div>
          </div>
          {circle.owner.profileType === 'PERSON' && (
            <div
              style={
                activeTab === 'statistics'
                  ? styles.activeTab
                  : hoverTab === 'statistics'
                  ? styles.tabHover
                  : styles.tab
              }
              onClick={() => this.props.switchToTab('statistics')}
              onMouseEnter={() => this.onMouseEnter('statistics')}
              onMouseLeave={this.onMouseLeave}
            >
              <div>
                <img src="/images/statistic_bleu-01.png" style={styles.icon} />
              </div>
            </div>
          )}
          {(isCurrentUserTheOwner || isCurrentUserCoOwner) && (
            <div
              style={
                activeTab === 'settings'
                  ? styles.activeTab
                  : hoverTab === 'settings'
                  ? styles.tabHover
                  : styles.tab
              }
              onClick={() => this.props.switchToTab('settings')}
              onMouseEnter={() => this.onMouseEnter('settings')}
              onMouseLeave={this.onMouseLeave}
            >
              <div>
                <img src="/images/settings-02.png" style={styles.icon} />
              </div>
            </div>
          )}
        </Toolbar>
      </AppBar>
    );
  }
}

styles = {
  tab: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blue,
    flex: 1,
    height: 60,
    cursor: 'pointer',
    fontSize: 16,
    color: colors.white,
    fontFamily: 'Lato',
    fontWeight: 'bold',
    maxWidth: '12%',
  },
  tabHover: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: 60,
    cursor: 'pointer',
    fontSize: 16,
    fontFamily: 'Lato',
    transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
    fontWeight: 'bold',
    backgroundColor: '#c9c9c9',
    color: colors.white,
    maxWidth: '12%',
  },
  disabledTab: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: 60,
    cursor: 'pointer',
    fontSize: 16,
    fontFamily: 'Lato',
    backgroundColor: 'rgb(225, 225, 225)',
    color: colors.gray,
    fontWeight: 'bold',
    maxWidth: '12%',
  },
  activeTab: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blue,
    flex: 1,
    height: 60,
    cursor: 'pointer',
    fontSize: 16,
    color: colors.white,
    fontFamily: 'Lato',
    fontWeight: 'bold',
    borderBottom: '4px solid #e89922',
    maxWidth: '12%',
  },
  icon: {
    filter: 'brightness(3)',
    width: 30,
    height: 30,
  },
};

export default Radium(TabHeader);
