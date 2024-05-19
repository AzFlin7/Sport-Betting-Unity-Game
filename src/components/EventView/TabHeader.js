import React from 'react';
import Radium from 'radium';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

import { colors } from '../../theme';

let styles;

class TabHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hoverTab: null,
      width: null,
    };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth });
  }

  componentDidMount() {
    this.setState({ width: window.innerWidth });
    if (typeof window !== 'undefined')
      window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
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
      sportunity,
      activeTab,
      isPast,
      detailsView,
      memberView,
      chatView,
      carPoolingView,
      imageView,
      compositionView,
    } = this.props;
    const { hoverTab } = this.state;

    return (
      <AppBar position="static" color="primary">
        <Toolbar>
          {detailsView && (
            <div
              style={styles.tab}
              key={'main'}
              onClick={() => this.props.onChange('main')}
              onMouseEnter={() => this.onMouseEnter('main')}
              onMouseLeave={this.onMouseLeave}
            >
              <div
                style={
                  activeTab === 'main'
                    ? styles.activeTab
                    : hoverTab === 'main'
                    ? styles.tabHover
                    : styles.tabIcon
                }
              >
                <img src="/images/information.png" style={styles.icon} />
              </div>
            </div>
          )}
          {memberView && (
            <div
              style={styles.tab}
              key={'member'}
              onClick={() => this.props.onChange('member')}
              onMouseEnter={() => this.onMouseEnter('member')}
              onMouseLeave={this.onMouseLeave}
            >
              <div
                style={
                  activeTab === 'member'
                    ? styles.activeTab
                    : hoverTab === 'member'
                    ? styles.tabHover
                    : styles.tabIcon
                }
              >
                {/* <Badge color="error" badgeContent={this.props.participantsCount}> */}
                <img src="/images/member.png" style={styles.icon} />
                {/* </Badge> */}
              </div>
            </div>
          )}
          {chatView && (
            <div
              style={styles.tab}
              key={'chat'}
              onClick={() => this.props.onChange('chat')}
              onMouseEnter={() => this.onMouseEnter('chat')}
              onMouseLeave={this.onMouseLeave}
            >
              <div
                style={
                  isPast
                    ? styles.disabledTab
                    : activeTab === 'chat'
                    ? styles.activeTab
                    : hoverTab === 'chat'
                    ? styles.tabHover
                    : styles.tabIcon
                }
              >
                <img src="/images/comment_bubble.png" style={styles.icon} />
              </div>
            </div>
          )}
          {carPoolingView && (
            <div
              style={styles.tab}
              key={'carPooling'}
              onClick={() => this.props.onChange('carPooling')}
              onMouseEnter={() => this.onMouseEnter('carPooling')}
              onMouseLeave={this.onMouseLeave}
            >
              <div
                style={
                  isPast
                    ? styles.disabledTab
                    : activeTab === 'carPooling'
                    ? styles.activeTab
                    : hoverTab === 'carPooling'
                    ? styles.tabHover
                    : styles.tabIcon
                }
              >
                <img src="/images/car.png" style={styles.icon} />
              </div>
            </div>
          )}
          {imageView && (
            <div
              style={styles.tab}
              key={'media'}
              onClick={() => this.props.onChange('media')}
              onMouseEnter={() => this.onMouseEnter('media')}
              onMouseLeave={this.onMouseLeave}
            >
              <div
                style={
                  activeTab === 'media'
                    ? styles.activeTab
                    : hoverTab === 'media'
                    ? styles.tabHover
                    : styles.tabIcon
                }
              >
                {/* <Badge color="error" badgeContent={this.props.imagesCount}> */}
                <img src="/images/video-files.png" style={styles.icon} />
                {/* </Badge> */}
              </div>
            </div>
          )}
          {compositionView &&
            sportunity.sport &&
            sportunity.sport.sport &&
            sportunity.sport.sport.fieldImages &&
            sportunity.sport.sport.fieldImages.length > 0 && (
              <div
                style={styles.tab}
                key={'compo'}
                onClick={() => this.props.onChange('compo')}
                onMouseEnter={() => this.onMouseEnter('compo')}
                onMouseLeave={this.onMouseLeave}
              >
                <div
                  style={
                    activeTab === 'compo'
                      ? styles.activeTab
                      : hoverTab === 'compo'
                      ? styles.tabHover
                      : styles.tabIcon
                  }
                >
                  <img
                    src="/images/Composition/compo.png"
                    style={styles.icon}
                  />
                </div>
              </div>
            )}
        </Toolbar>
      </AppBar>
    );
  }
}

styles = {
  container: {
    minHeight: 60,
    backgroundColor: colors.blue,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '-2px',
    flexWrap: 'wrap',
  },
  tab: {
    padding: '5px 10px',
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
    color: colors.darkGray,
  },
  tabHover: {
    display: 'flex',
    flexDirection: 'column',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottom: '5px solid #fff',
    width: '60%',
  },
  tabIcon: {
    display: 'flex',
    flexDirection: 'column',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottom: '5px solid transparent',
    width: '60%',
  },
  activeTab: {
    display: 'flex',
    flexDirection: 'column',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottom: '5px solid #fff',
    width: '60%',
  },
  disabledTab: {
    padding: '5px 10px',
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
  },
  icon: {
    width: 30,
    height: 30,
    filter: 'brightness(3)',
  },
  disabledIcon: {
    filter: 'grayscale(2)',
    width: 30,
    height: 30,
  },
  activeIcon: {
    filter: 'brightness(3)',
    width: 30,
    height: 30,
  },
};

export default Radium(TabHeader);
