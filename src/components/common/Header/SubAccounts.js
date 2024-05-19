import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link, withRouter } from 'found'
import Radium from 'radium'
import Circle from './Circle'
import { colors } from '../../../theme'
import localizations from '../../Localizations'

const truncateStr = (str, limit) => !str || str.length<=limit?
  str :
  str.substring(0, limit-3)+'...'

export const subAccountsIsVisible = (viewer, user) =>
  (viewer &&
    viewer.superMe &&
    user &&
    !viewer.superMe.isSubAccount)

const tintColors = [
  {key: 'icon-name-0', value: '#e6194b'},
  {key: 'icon-name-1', value: '#3cb44b'},
  {key: 'icon-name-2', value: '#ffe119'},
  {key: 'icon-name-3', value: '#0082c8'},
  {key: 'icon-name-4', value: '#f58231'},
  {key: 'icon-name-5', value: '#911eb4'},
  {key: 'icon-name-6', value: '#46f0f0'},
  {key: 'icon-name-7', value: '#f032e6'},
  {key: 'icon-name-8', value: '#d2f53c'},
  {key: 'icon-name-9', value: '#fabebe'},
  {key: 'icon-name-10', value: '#008080'},
  {key: 'icon-name-11', value: '#e6beff'},
  {key: 'icon-name-12', value: '#aa6e28'},
  {key: 'icon-name-13', value: '#fffac8'},
  {key: 'icon-name-14', value: '#800000'},
  {key: 'icon-name-15', value: '#aaffc3'},
  {key: 'icon-name-16', value: '#808000'},
  {key: 'icon-name-17', value: '#ffd8b1'},
  {key: 'icon-name-18', value: '#000080'},
  {key: 'icon-name-19', value: '#808080'},
  {key: 'icon-name-20', value: '#231222'},
]

const IconName = (Wrapper) =>
  ({
     image,
     name,
     active,
     onClick,
	   unreadNotif,
     iconStyle={},
     textStyle={},
     activeStyle={},
     customKey=null,
  }) => (
    <Wrapper style={{
        ...styles.iconNameContainer,
        ...(active ? styles.iconNameContainerActive : {}),
      }}
      onClick={onClick}
    >
      {active && <i style={activeStyle} >.</i>}
      <Circle 
        image={image} 
        style={iconStyle}
        unreadNotif={unreadNotif}
        tintColor={customKey && tintColors.find(color => color.key === customKey) ? tintColors.find(color => color.key === customKey).value : null}
      />
      <span style={textStyle} >{truncateStr(name, 18)}</span>
    </Wrapper>
  )

const Li = ({ children, ...props}) => (<li {...props}>{children}</li>)
const ListIconName = IconName(Li)

class SubAccounts extends Component {
  state = {
    superToken: '',
    actualToken: '',
    userId: '0',
  }

  componentWillReceiveProps = nextProps => {
    if (!this.props.isMenuOpen && nextProps.isMenuOpen) {
      const superToken = localStorage.getItem('superToken');
      const userToken = localStorage.getItem('userToken');
      const actualToken = localStorage.getItem('token');
      const userId = localStorage.getItem('userId') || 0;
      if (superToken) {
        this.setState({
          superToken,
          userToken,
          actualToken,
          userId,
        })
      }
    }
  }

  switchAccount = (token, id='0') => {
    if (token !== this.state.actualToken) {
        this.setState({
          actualToken: token,
        })
        localStorage.setItem('userId', id)
        setTimeout(() => {
          this.props.router.push({pathname: '/login-superuser/'+token});
        }, 100)
    }
  }

  switchUserAccount = (token, id=0) => {
    this.setState({
        actualToken: token,
    })
    if (id === 0)
      localStorage.removeItem('userId')
    else
      localStorage.setItem('userId', id)
    setTimeout(() => {
      this.props.router.push({pathname: '/login-switch/'+token});
    }, 100)
  }

  switchToMainAccount = () => {
    this.switchAccount(this.state.superToken)
  }

  switchToUserAccount = () => {
    this.switchUserAccount(this.state.userToken)
  }

  switchToMainUserAccount = () => {
    localStorage.removeItem('userId')
    this.switchUserAccount(localStorage.getItem('userToken'))  }

  componentDidMount = () => {
    const superToken = localStorage.getItem('superToken');
    const userToken = localStorage.getItem('userToken');
    const actualToken = localStorage.getItem('token');
    const userId = localStorage.getItem('userId') || 0;
    
    if (superToken) {
      this.setState({
        superToken,
        userToken,
        actualToken,
        userId,
      })
    }
  }

  render() {
    const { viewer, user } = this.props
    const { superMe, authorizedAccounts } = viewer

    const hasSub = subAccountsIsVisible(viewer, user)
    
    return (
      <div>
        {((authorizedAccounts && authorizedAccounts.accounts && authorizedAccounts.accounts.length > 0) || (this.state.userToken === this.state.superToken && superMe && superMe.subAccounts && superMe.subAccounts.length > 0) || (superMe && superMe.userPreferences && superMe.userPreferences.areSubAccountsActivated)) &&
          <ul>
            <ListIconName
              name={authorizedAccounts.pseudo}
              image={authorizedAccounts.avatar}
              iconStyle={styles.iconMedium}
              textStyle={styles.iconNameNameTitle}
              onClick={this.switchToMainUserAccount}
              active={authorizedAccounts.id===user.id}
              unreadNotif={authorizedAccounts.numberOfUnreadNotifications + authorizedAccounts.unreadChats}
              activeStyle={styles.activeMedium}
            />

              {this.state.userToken === this.state.superToken && 
                <ul style={styles.subAccountsContainer}>
                  {superMe.subAccounts.map(({ id, token, pseudo, avatar, numberOfUnreadNotifications, unreadChats }, index) => (
                    <div key={`subAccounts-icon-name-${index}-container`}>
                      <ListIconName
                        key={`icon-name-${index}`}
                        customKey={`icon-name-${index}`}
                        name={pseudo}
                        image={avatar}
                        unreadNotif={numberOfUnreadNotifications + unreadChats}
                        iconStyle={styles.iconSmall}
                        textStyle={styles.smallIconNameName}
                        active={this.state.userId===id}
                        activeStyle={styles.active}
                        onClick={() => this.switchAccount(token, id) }
                      />
                      <li><hr style={styles.separator} /></li>
                    </div>
                  ))}
                  {superMe.userPreferences && superMe.userPreferences.areSubAccountsActivated && !superMe.isSubAccount && 
                    <li>
                      <Link to='/register' style={styles.addTeamLink}>
                        <i style={styles.addTeamIcon}>+</i>
                        <span style={styles.addTeamText}>
                          {superMe.profileType === 'PERSON'
                          ? localizations.header_menu_add_child
                          : localizations.header_menu_add_team
                          }
                        </span>
                      </Link>
                    </li>
                  }
                  {superMe.userPreferences && superMe.userPreferences.areSubAccountsActivated && 
                    <li><hr style={styles.separator} /></li>
                  }
                </ul>
              }
            
            
            {authorizedAccounts.accounts.map(({ id, token, pseudo, avatar, numberOfUnreadNotifications, unreadChats }, index) => (
              <div key={`icon-name-${index}`}>
                <ListIconName
                  name={pseudo}
                  image={avatar}
                  unreadNotif={numberOfUnreadNotifications + unreadChats}
                  iconStyle={styles.icon}
                  textStyle={styles.iconNameName}
                  active={this.state.userId===id}
                  activeStyle={styles.active}
                  onClick={() => this.switchUserAccount(token, id) }
                />
                {(id === superMe.id && (hasSub || (superMe && !superMe.isSubAccount && superMe.userPreferences && superMe.userPreferences.areSubAccountsActivated))) && (
                <ul style={styles.subAccountsContainer}>
                  <li><hr style={styles.separator} /></li>
                  {superMe.subAccounts.map(({ id, token, pseudo, avatar, numberOfUnreadNotifications, unreadChats }, index) => (
                    <div key={`subAccounts-icon-name-${index}-container`}>
                      <ListIconName
                        key={`icon-name-${index}`}
                        customKey={`icon-name-${index}`}
                        name={pseudo}
                        image={avatar}
                        unreadNotif={numberOfUnreadNotifications + unreadChats}
                        iconStyle={styles.iconSmall}
                        textStyle={styles.smallIconNameName}
                        active={this.state.userId===id}
                        activeStyle={styles.active}
                        onClick={() => this.switchAccount(token, id) }
                      />
                      <li><hr style={styles.separator} /></li>
                    </div>
                  ))}
                  {(superMe && superMe.userPreferences && superMe.userPreferences.areSubAccountsActivated) &&
                    <li>
                      <Link to='/register' style={styles.addTeamLink}>
                        <i style={styles.addTeamIcon}>+</i>
                        <span style={styles.addTeamText}>
                          {superMe.profileType === 'PERSON'
                          ? localizations.header_menu_add_child
                          : localizations.header_menu_add_team
                          }
                        </span>
                      </Link>
                    </li>
                  }
                  {(superMe && superMe.userPreferences && superMe.userPreferences.areSubAccountsActivated) &&
                    <li><hr style={styles.separator} /></li>
                  }
                </ul>
              )}
              </div>
            ))}
          </ul>
        }
        </div>
      )
  }
}

SubAccounts.propTypes = {
  showSuperUser: PropTypes.bool,
}

const displayInlineBlock = {
  display: 'inline-block',
}

const iconNameNameCommonStyle = {
  verticalAlign: 'top',
  margin: '16px 0px 0 3px',
  color: colors.white,
  fontSize: '12px',
}

const styles = {
  iconNameContainer: {
    display: 'flex',
    cursor: 'pointer',
  },
  iconNameContainerActive: {
    backgroundColor: colors.blueLight,
    paddingBottom: 4,
    marginTop: 2,
  },
  icon: {
    ...displayInlineBlock,
    width: 38,
    height: 38,
    margin: '5px 13px 0 32px',
  },
  iconMedium: {
    ...displayInlineBlock,
    width: 46,
    height: 46,
    margin: '5px 10px 0 17px',
  },
  iconSmall: {
    ...displayInlineBlock,
    width: 30,
    height: 30,
    margin: '5px 8px 5px 45px',
  },
  iconNameName: {
    ...displayInlineBlock,
    ...iconNameNameCommonStyle,
    fontSize: 14,
  },
  iconNameNameTitle: {
    ...displayInlineBlock,
    ...iconNameNameCommonStyle,
    margin: '22px 0px 0 3px',
    fontSize: 16,
  },
  smallIconNameName: {
    ...displayInlineBlock,
    ...iconNameNameCommonStyle,
    fontSize: 12,
  },
  separator: {
    width: '68%',
    borderBottom: '0',
    borderRight: '0',
    borderLeft: '0',
    borderTop: `1px solid ${colors.white}`,
    height: 2
  },
  addTeamText: {
    color: colors.white,
    fontSize: 14,
  },
  addTeamLink: {
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    textDecoration: 'none',
    height: 55,
  },
  addTeamIcon: {
    fontSize: 30,
    width: 46,
    height: 46,
    margin: '0px 10px 0 30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    color: colors.blue,
    backgroundColor: colors.white,
    fontFamily: 'Lato',
  },
  active: {
    color: colors.green,
    fontSize: 50,
    position: 'absolute',
    marginLeft: '12px',
    lineHeight: '15px',
  },
  activeMedium: {
    color: colors.green,
    fontSize: 50,
    position: 'absolute',
    marginLeft: '4px',
    lineHeight: '23px',
  },
  subAccountsContainer: {
    //backgroundColor: 'rgb(120, 170, 240)',
    margin: '0px 4px',
    borderRadius: 4
  }
}

export default withRouter(Radium(SubAccounts))
