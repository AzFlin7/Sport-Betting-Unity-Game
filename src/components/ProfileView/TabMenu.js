import React from 'react';
import Radium from 'radium';

import { colors } from '../../theme';
import localizations from '../Localizations'

let styles;

class TabMenu extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hoverTab: null,
      tabs: [
        {
          key:"profile",
          onClick: () => this.props.changeActiveTab('profile'),
          onMouseEnter: () => this.onMouseEnter('profile'),
          onMouseLeave: this.onMouseLeave,
          src:"/images/information.png"
        },
        {
          key:"event",
          onClick: () => this.props.changeActiveTab('event'),
          onMouseEnter: () => this.onMouseEnter('event'),
          onMouseLeave: this.onMouseLeave,
          src:"/images/activity_blue-01.png"
        },
        {
          key:"chat",
          onClick: () => this.props.haveChat && this.props.changeActiveTab('chat'),
          onMouseEnter: () => this.onMouseEnter('chat'),
          onMouseLeave: this.onMouseLeave,
          src:"/images/chat.png"
        },
        {
          key:"statistics",
          onClick: () => this.props.changeActiveTab('statistics'),
          onMouseEnter: () => this.onMouseEnter('statistics'),
          onMouseLeave: this.onMouseLeave,
          src:"/images/statistic_bleu-01.png"
        }
      ]
    }
  }

  onMouseEnter = tab => {
    this.setState({
      hoverTab: tab
    })
  }
  onMouseLeave = () => {
    this.setState({
      hoverTab: null
    })
  }
  componentDidMount() {
    if (this.props.showTeamsTab) {
      const {tabs} = this.state ;
      tabs.splice(1, 0, {
        key:"teams",
        onClick: () => this.props.changeActiveTab('teams'),
        onMouseEnter: () => this.onMouseEnter('teams'),
        onMouseLeave: this.onMouseLeave,
        src:"/images/member.png"
      })
      this.setState({tabs})
    }
  }


  render() {
    const {
      viewer,
      sportunity,
      activeTab,
      isPast,
      haveChat,
      showTeamsTab,
    } = this.props

    const {hoverTab, tabs} = this.state

    return(
      <div style={styles.container}>
        {tabs.map(tab => (
          <div 
            style={styles.tab}
            {...tab}
          >
            <div style={isPast ? styles.disabledTab : activeTab === tab.key ? styles.activeTab : hoverTab === tab.key ? styles.tabHover : styles.tabIcon}>
              <img src={tab.src} style={styles.icon}/>
            </div>
          </div>
        ))}
      </div>
    )

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
    width: '60%'
  },
  tabIcon: {
    display: 'flex',
    flexDirection: 'column',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottom: '5px solid transparent',
    width: '60%'
  },
  activeTab: {
    display: 'flex',
    flexDirection: 'column',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottom: '5px solid #fff',
    width: '60%'
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
    filter: 'brightness(3)',
  },
  disabledIcon: {
    filter: 'grayscale(2)',
    width: 30,
  },
  activeIcon: {
    filter: 'brightness(3)',
    width: 30,
  }
};

export default Radium(TabMenu);
