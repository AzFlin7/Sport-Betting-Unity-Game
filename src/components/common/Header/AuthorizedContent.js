import React, { Component } from 'react';
import { createRefetchContainer, graphql } from 'react-relay';
import { Link } from 'found';
import { colors } from '../../../theme';
import moment from 'moment';
import ReactLoading from 'react-loading';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Radium from 'radium';

var Style = Radium.Style;

import TutorialModal from '../Tutorial/index';
import ReadNotificationsMutation from './ReadNotificationsMutation';
import ReadNotificationMutation from './ReadNotificationMutation';
import localizations from '../../Localizations';
import SubAccounts from './SubAccounts';
import Circle from './Circle';
import Loading from '../Loading/Loading';
import { Search } from '../Search/Search';

import UnreadChatsSubscription from './Subscriptions/unreadChatsSubscription'
import UnreadNotificationsSubscription from './Subscriptions/unreadNotificationsSubscription'
import ImportActivitiesModal from './ImportActivitiesModal';

const RadiumLink = Radium(Link);

let styles;

const truncateStr = (str, limit) =>
  !str || str.length <= limit ? str : `${str.substring(0, limit - 3)}...`;

class AuthorizedContent extends Component {
  static contextTypes = {
    relay: PropTypes.shape({
      variables: PropTypes.object,
    }),
  };

  constructor(props) {
    super(props);
    this.state = {
      popup_profile_visible: false,
      popup_profile_isactive: false,
      popup_notification_visible: false,
      popup_notification_isactive: false,
      popup_chat_visible: false,
      popup_chat_isactive: false,
      isMobileMenuOpen: false,
      width: '0',
      height: '0',
      tutorial1IsVisible: false,
      tutorial2IsVisible: false,
      tutorial3IsVisible: false,
      tutorial6IsVisible: false,
      hoverCircle: false,
      hoverCreate: false,
      isLoadingChat: false,
      isLoadingNotifications: false,
      showImportPopup: false,
    };

    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  componentDidMount() {
    // Hide dropdown block on click outside the block
    window.addEventListener('click', this._hidePopups);
    this.updateWindowDimensions();

    if (typeof window !== 'undefined')
      window.addEventListener('resize', this.updateWindowDimensions);

    this.refetchAuthorizedContent();
    this.sub = UnreadChatsSubscription()
    this.sub1 = UnreadNotificationsSubscription()
  }

  componentWillUnmount() {
    // Remove click event listener on component unmount
    window.removeEventListener('click', this._hidePopups);
    window.removeEventListener('resize', this.updateWindowDimensions);
    !!this.sub && this.sub.dispose()
    !!this.sub1 && this.sub1.dispose()
  }

  componentWillReceiveProps = nextProps => {
    if (this.props.location.pathname !== nextProps.location.pathname) {
      this.setState({ hoverCircle: false, hoverCreate: false });
    }
    if (this.state.width !== window.innerWidth) this.updateWindowDimensions();

    if (
      this.props.user &&
      nextProps.user &&
      this.props.user.id !== nextProps.user.id
    ) {
      setTimeout(() => this.refetchAuthorizedContent(), 800);
    }
  };

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  refetchAuthorizedContent = () => {
    const superToken = localStorage.getItem('superToken');
    const userToken = localStorage.getItem('userToken');
    if (superToken) {
      this.setState({
        superToken,
        userToken,
      });
      this.props.relay.refetch(
        fragmentVariables => ({
          ...fragmentVariables,
          delayedQuery: true,
          queryNotifications: false,
          queryChats: false,
          superToken,
          query: true,
          userToken,
        }),
        null,
        () => setTimeout(() => this.shouldDisplayTutorials(), 50),
        { force: true },
      );
    } else {
      const refetchVariables = fragmentVariables => ({
        ...fragmentVariables,
        delayedQuery: true,
        queryNotifications: false,
        queryChats: false,
        query: false,
      });

      this.props.relay.refetch(refetchVariables, null, null, { force: true });
    }
  };

  shouldDisplayTutorials() {
    if (
      this.props.viewer &&
      this.props.user &&
      this.props.user.id &&
      this.props.viewer.superMe &&
      (this.props.viewer.superMe.profileType === 'BUSINESS' ||
        this.props.viewer.superMe.profileType === 'ORGANIZATION')
    ) {
      if (this.props.shownTutorial.indexOf(1) < 0)
        this.setState({
          tutorial1IsVisible: true,
        });

      if (this.props.shownTutorial.indexOf(2) < 0)
        this.setState({
          tutorial2IsVisible: true,
        });

      if (this.props.shownTutorial.indexOf(3) < 0)
        this.setState({
          tutorial3IsVisible: true,
        });

      if (this.props.shownTutorial.indexOf(7) < 0)
        this.setState({
          tutorial6IsVisible: true,
        });
    }
  }

  _toggleMobileMenu = e => {
    e.preventDefault() ; 
    e.stopPropagation();
    this.setState({ isMobileMenuOpen: !this.state.isMobileMenuOpen });
  };

  _readNotification = event => {
    if (event) event.preventDefault();
    const viewer = this.props.viewer;
    ReadNotificationsMutation.commit(
      { viewer, user: this.props.user },
      {
        onFailure: error => {},
        onSuccess: response => {},
      },
    );
  };

  _onNotificationClick = notification => {
    const viewer = this.props.viewer;
    ReadNotificationMutation.commit(
      {
        viewer,
        user: this.props.user,
        notificationIdVar: notification.id,
      },
      {
        onFailure: error => {},
        onSuccess: response => {},
      },
    );
    const to =
      notification.notificationType === 'circleAskedInfo' 
        ? '/my-shared-info'
        : notification.notificationType === 'circleFees'
          ? '/my-membership-fees'
          : notification.notificationType === 'circle'
            ? notification.link && `/circle/${notification.link}`
            : notification.notificationType === 'sportunity-carpooling'
              ? notification.link && `/event-view/${notification.link}#carpooling`
              : notification.notificationType === 'circleAskedInformationFormFilled'
                ? notification.id && `/my-circles/form-details/${notification.link}`
                : notification.notificationType === 'datasheet'
                ? '/datasheet-sportunities'
                : notification.link && `/event-view/${notification.link}`;

    if (to) {
      this.props.router.push({
        pathname: to,
      });
    }
  };

  _toggleProfilePopup = () => {
    this.refetchAuthorizedContent();
    this.setState({
      popup_profile_visible: !this.state.popup_profile_visible,
    });
  };

  _toggleNotificationPopup() {
    this.setState({
      popup_notification_visible: !this.state.popup_notification_visible,
      isLoadingNotifications: true,
    });

    if (this.props.user && !!this.props.user.numberOfUnreadNotifications && this.props.user.numberOfUnreadNotifications > 0) {
      this.props.relay.refetch({
          ...this.context.relay.variables,
          queryNotifications: true,
        },
        null,
        () => this.setState({ isLoadingNotifications: false }),
      );
    } 
    else {
      this.setState({ isLoadingNotifications: false });
    }
  }

  _toggleChatPopup() {
    this.setState({
      popup_chat_visible: !this.state.popup_chat_visible,
      isLoadingChat: true,
    });
    this.props.relay.refetch(
      {
        ...this.context.relay.variables,
        queryChats: true,
      },
      null,
      () => this.setState({ isLoadingChat: false }),
    );
  }

  _hidePopups = event => {
    if (!this || !(this._containerProfileNode && this._containerNotificationNode && this._containerChatNode))
      return false;

    if (!this._containerProfileNode.contains(event.target)) {
      this.setState({
        popup_profile_visible: false,
      });
    }

    if (!this._containerNotificationNode.contains(event.target) && (!this._readAllNode || (this._readAllNode && !this._readAllNode.contains(event.target)))) {
      this.setState({
        popup_notification_visible: false,
      });
    }

    if (!this._containerChatNode.contains(event.target)) {
      this.setState({
        popup_chat_visible: false,
      });
    }

    if (!!this._navNode && !this._navNode.contains(event.target) && this.state.isMobileMenuOpen) {
      console.log("là?")
      this.setState({
        isMobileMenuOpen: false,
      })
    }
  };

  _handleProfileFocus() {
    this.setState({ popup_profile_isactive: true });
  }

  _handleProfileBlur = e => {
    this.setState({
      popup_profile_isactive: false,
      popup_profile_visible: false,
    });
  };

  _handleNotificationFocus() {
    this.setState({ popup_notification_isactive: true });
  }

  _handleNotificationBlur() {
    this.setState({
      popup_notification_isactive: false,
      popup_notification_visible: false,
    });
  }

  _handleChatPopupFocus() {
    this.setState({ popup_chat_isactive: true });
  }

  _handleChatPopupBlur() {
    this.setState({
      popup_chat_isactive: false,
      popup_chat_visible: false,
    });
  }

  _handleClick(e) {
    this.props.router.push({
      pathname: e,
    });
  }

  _handleClickdocument(e) {
    this.props.router.push({
      pathname: e,
    });
  }

  _timesBefore = date1 => moment(date1).fromNow();

  _filterChats = chats => {
    if (chats) {
      const filteredChats = chats.edges.filter(
        chat => chat.node.messages.edges.length > 0,
      );
      return filteredChats;
    }
    return [];
  };

  _sortChats = chats => {
    if (chats) {
      return chats.sort((chatA, chatB) => {
        if (
          chatA.node.messages.edges.length > 0 &&
          chatB.node.messages.edges.length > 0
        ) {
          if (!chatA.node.read && !chatB.node.read) {
            if (
              new Date(chatB.node.messages.edges[0].node.created) -
                new Date(chatA.node.messages.edges[0].node.created) >
              0
            )
              return 1;
            return -1;
          } else if (!chatA.node.read) return -1;
          else if (!chatB.node.read) return 1;
          else if (
            new Date(chatB.node.messages.edges[0].node.created) -
              new Date(chatA.node.messages.edges[0].node.created) >
            0
          )
            return 1;
          return -1;
        } else if (chatA.node.messages.edges.length > 0) return -1;
        return 1;
      });
    }
    return [];
  };

  _transformChats = (chats, me) => {
    if (chats) {
      chats = chats.map(edge => {
        let title;
        if (edge.node.sportunity) title = edge.node.sportunity.title;
        else if (edge.node.circle) title = edge.node.circle.name;
        else {
          edge.node.users.forEach(user => {
            if (user.id !== me.id) {
              if (title) title = `${title}, ${user.pseudo}`;
              else title = user.pseudo;
            }
          });
        }
        return {
          title,
          lastAuthor:
            me.id === edge.node.messages.edges[0].node.author.id
              ? localizations.header_you
              : edge.node.messages.edges[0].node.author.pseudo,
          lastMessageText:
            edge.node.messages.edges[0].node.text.length > 50
              ? `${edge.node.messages.edges[0].node.text.substr(0, 50)}...`
              : edge.node.messages.edges[0].node.text,
          lastMessageDate: edge.node.messages.edges[0].node.created,
          isChatRead: edge.node.read,
          link: this._getChatLink(edge.node),
          key: edge.node.id,
        };
      });
      return chats;
    }
    return [];
  };

  _getChatLink = chat => {
    let link = '';
    if (chat.sportunity) link = `/event-view/${chat.sportunity.id}#chat`;
    else if (chat.circle) link = `/circle/${chat.circle.id}#chat`;
    else {
      chat.users.forEach(user => {
        if (user.id !== this.props.user.id)
          link = `/profile-view/${user.id}/chat`;
      });
    }
    return link;
  };

  _forecedReload = () => {
    this.setState({
      isReloading: true,
    });
  };

  _getActivePage = () => {
    const { location } = this.props;
    if (location.pathname.indexOf('circle') >= 0) return 'circles';
    if (location.pathname.indexOf('find') >= 0) return 'find';
    if (location.pathname.indexOf('new-sportunity') >= 0)
      return 'new-sportunity';
    if (location.pathname.indexOf('event') >= 0) return 'events';
    if (location.pathname.indexOf('blog') >= 0) return 'blog';
    if (location.pathname.indexOf('venue') >= 0) return 'venue';
  };

  _handleAddClick = event => {
    event.preventDefault();
    this.setState({ showImportPopup: true });
  };

  _handleCloseModal = () => {
    this.setState({ showImportPopup: false });
  };

  render() {
    const { viewer, user } = this.props;
    const {
      notifications,
      numberOfUnreadNotifications,
      unreadChats,
      chats,
    } = user;

    if (this.state.isReloading) {
      return (
        <div style={styles.fullscreen}>
          <Loading />
        </div>
      );
    }

    let filteredChats = this._filterChats(chats);
    filteredChats = this._sortChats(filteredChats);
    filteredChats = this._transformChats(filteredChats, user);

    const leftStyle =
      this.state.width > 500
        ? styles.navigation
        : this.state.isMobileMenuOpen
        ? styles.navigation
        : styles.leftHidden;

    let subAccountsUnread = 0;
    viewer.superMe &&
      viewer.superMe.subAccounts.map(
        ({ numberOfUnreadNotifications, unreadChats }) => {
          subAccountsUnread += numberOfUnreadNotifications + unreadChats;
        },
      );
    viewer.authorizedAccounts &&
      viewer.authorizedAccounts.accounts.map(
        ({ numberOfUnreadNotifications, unreadChats }) => {
          subAccountsUnread += numberOfUnreadNotifications + unreadChats;
        },
      );
    !!user.numberOfFormsToFill && (subAccountsUnread += user.numberOfFormsToFill)
    !!user.numberOfPaymentModelsToPay && (subAccountsUnread += user.numberOfPaymentModelsToPay)

    const activePage = this._getActivePage();

    return (
      <div style={styles.container}>
        <Style scopeSelector=".header_link:hover" rules={{
            backgroundColor: '#72afec',
          }}
        />
        <Style scopeSelector=".header_icon:hover" rules={{
            filter: 'brightness(0.9)'
          }}
        />
        <Style scopeSelector=".menu-item:hover" rules={{
            backgroundColor: '#0002',
          }}
        />
        {(this.state.width > 500 || this.state.isMobileMenuOpen) && (
          <nav ref={node => {this._navNode = node;}} style={{ ...leftStyle }}>
            <div
              style={{
                width: '100%',
                maxWidth: 300,
                paddingLeft: 20,
                paddingRight: 20,
              }}
            >
              <Search viewer={viewer} />
            </div>

            <div
              className="header_link"
              style={
                activePage === 'new-sportunity'
                  ? styles.activeLinkContainer
                  : styles.linkContainer
              }
              onClick={() => this.setState({ tutorial6IsVisible: false })}
              onMouseEnter={() => {
                this.setState({ hoverCreate: true });
              }}
              onMouseLeave={() => {
                setTimeout(() => this.setState({ hoverCreate: false }), 50);
              }}
            >
              <Link style={styles.link} to="/new-sportunity">
                {localizations.header_organizeSportunities}
              </Link>
              {this.state.hoverCreate && (
                <div style={styles.dropdownMenuContainer}>
                  <ul style={styles.dropdownMenu}>
                    {user && (
                      <Link to="/new-sportunity" style={styles.menu} className="menu-item">
                        {localizations.header_organizeSportunities}
                      </Link>
                    )}
                    {user && (
                      <Link to="/datasheet-sportunities" style={styles.menu} className="menu-item">
                        {localizations.header_organizeDatasheet}
                      </Link>
                    )}
                    {user && (
                      <div style={styles.menu} onClick={this._handleAddClick}>
                        {localizations.header_import}
                      </div>
                    )}
                  </ul>
                </div>
              )}
              
              <TutorialModal
                isOpen={
                  !this.state.popup_profile_visible &&
                  !this.state.tutorial1IsVisible &&
                  !this.state.tutorial2IsVisible &&
                  !this.state.tutorial3IsVisible &&
                  this.state.tutorial6IsVisible
                }
                tutorialNumber={7}
                tutorialName="team_small_tutorial6"
                message={localizations.team_small_tutorial6}
                confirmLabel={localizations.team_small_tutorial_ok}
                onPass={() => this.setState({ tutorial6IsVisible: false })}
                position={{
                  top: 40,
                  left: -95,
                }}
                arrowPosition={{
                  top: -8,
                  left: 130,
                }}
              />
            </div>

            <div
              className="header_link"
              style={
                activePage === 'events'
                  ? styles.activeLinkContainer
                  : styles.linkContainer
              }
            >
              <Link style={styles.link} to="/my-events">
                {localizations.header_mySportunities}
              </Link>
            </div>

            <div
              className="header_link"
              style={
                activePage === 'circles'
                  ? styles.activeLinkContainer
                  : styles.linkContainer
              }
              onClick={() => this.setState({ tutorial3IsVisible: false })}
              onMouseEnter={() => {
                this.refetchAuthorizedContent()
                this.setState({ hoverCircle: true });
              }}
              onMouseLeave={() => {
                setTimeout(() => this.setState({ hoverCircle: false }), 50);
              }}
            >
              <Link style={styles.link} to="/my-circles">
                {user.profileType === 'PERSON'
                  ? localizations.header_my_community
                  : localizations.header_my_teams}
              </Link>
              {this.state.hoverCircle && (
                <div style={styles.dropdownMenuContainer}>
                  <ul style={styles.dropdownMenu}>
                    {user && (
                      <Link
                        to="/my-circles"
                        className="menu-item"
                        style={
                          this.props.activeSection === 'myCircles'
                            ? styles.menuActive
                            : styles.menu
                        }
                      >
                        {localizations.circles_title}
                      </Link>
                    )}
                    {user &&
                      ((user.circles &&
                        user.circles.edges &&
                        user.circles.edges.length > 0) ||
                        (user.circlesSuperUser &&
                          user.circlesSuperUser.edges &&
                          user.circlesSuperUser.edges.length > 0)) && (
                        <Link
                          to="/my-circles/all-members"
                          className="menu-item"
                          style={
                            this.props.activeSection === 'allMembers'
                              ? styles.menuActive
                              : styles.menu
                          }
                        >
                          {localizations.circles_allMembers}
                        </Link>
                      )}
                    {user &&
                      user.profileType !== 'PERSON' &&
                      ((user.circles &&
                        user.circles.edges &&
                        user.circles.edges.length > 0) ||
                        (user.circlesSuperUser &&
                          user.circlesSuperUser.edges &&
                          user.circlesSuperUser.edges.length > 0)) && (
                        <Link
                          to="/my-circles/members-info"
                          className="menu-item"
                          style={
                            this.props.activeSection === 'membersInfo'
                              ? styles.menuActive
                              : styles.menu
                          }
                        >
                          {localizations.circles_information}
                        </Link>
                      )}
                    {user &&
                      user.profileType !== 'PERSON' &&
                      ((user.circles &&
                        user.circles.edges &&
                        user.circles.edges.length > 0) ||
                        (user.circlesSuperUser &&
                          user.circlesSuperUser.edges &&
                          user.circlesSuperUser.edges.length > 0)) && (
                        <Link
                          to="/my-circles/payment-models"
                          className="menu-item"
                          style={
                            this.props.activeSection === 'paymentModels'
                              ? styles.menuActive
                              : styles.menu
                          }
                        >
                          {localizations.circles_paymentModels}
                        </Link>
                      )}
                    {user &&
                      user.profileType !== 'PERSON' &&
                      ((user.circles &&
                        user.circles.edges &&
                        user.circles.edges.length > 0) ||
                        (user.circlesSuperUser &&
                          user.circlesSuperUser.edges &&
                          user.circlesSuperUser.edges.length > 0)) && (
                        <Link
                          to="/my-circles/terms-of-uses"
                          className="menu-item"
                          style={
                            this.props.activeSection === 'termOfUse'
                              ? styles.menuActive
                              : styles.menu
                          }
                        >
                          {localizations.circles_termOfUse}
                        </Link>
                      )}
                  </ul>
                </div>
              )}
              <TutorialModal
                isOpen={
                  !this.state.popup_profile_visible &&
                  !this.state.tutorial1IsVisible &&
                  !this.state.tutorial2IsVisible &&
                  this.state.tutorial3IsVisible
                }
                tutorialNumber={3}
                tutorialName="team_small_tutorial3"
                message={localizations.team_small_tutorial3}
                confirmLabel={localizations.team_small_tutorial_ok}
                onPass={() => this.setState({ tutorial3IsVisible: false })}
                position={{
                  top: 40,
                  right: -115,
                }}
                arrowPosition={{
                  top: -8,
                  right: 180,
                }}
              />
            </div>

            {(this.state.width >= 550 || this.state.width <= 500) &&
              user.userCanManageVenue && (
                <div
                  className="header_link"
                  style={
                    activePage === 'venue'
                      ? styles.activeLinkContainer
                      : styles.linkContainer
                  }
                >
                  <Link style={styles.link} to="/manage-venue">
                    {localizations.header_manageMyVenue}
                  </Link>
                </div>
              )}

            {/* {(this.state.width >= 620 || this.state.width <= 500) && (
              <div
                style={
                  activePage === 'blog'
                    ? styles.activeLinkContainer
                    : styles.linkContainer
                }
              >
                <Link style={styles.link} to="/blog">
                  {localizations.blog_link}
                </Link>
              </div>
            )} */}
          </nav>
        )}

        <div style={styles.right}>
          <div style={styles.icons}>
            <div
              style={styles.notification}
              tabIndex="-1"
              ref={node => {
                this._containerNotificationNode = node;
              }}
            >
              {numberOfUnreadNotifications 
              ? <span style={styles.marked}>
                  {numberOfUnreadNotifications}
                </span>
              : null
              }
              <img
                className="header_icon"
                style={styles.icon}
                src="/images/bell.svg"
                alt="See notifications"
                onClick={() => this._toggleNotificationPopup()}
              />
            </div>
            {this.state.popup_notification_visible && (
              <div style={this.props.stepsPercentage === 100 ? styles.notification_popup : {...styles.notification_popup, top: '60px'}}>
                <div style={styles.notifications_container}>
                  {notifications &&
                  notifications.edges &&
                  notifications.edges.length > 0 
                  ? notifications.edges.map((edge, index) => (
                      <div
                        onClick={() => this._onNotificationClick(edge.node)}
                        style={
                          edge.node.isRead
                            ? styles.notification_link
                            : styles.unread_notification_link
                        }
                        key={edge.node.id}
                      >
                        <div
                          style={[
                            styles.notification_item,
                            index === notifications.edges.length - 1
                              ? { borderBottomWidth: 0 }
                              : null,
                          ]}
                          key={edge.node.id}
                        >
                          <div style={styles.notification_header_row}>
                            <div style={styles.notification_header_col}>
                              <div style={styles.notification_title}>
                                {edge.node.title}
                              </div>
                              <div style={edge.node.title ? styles.notification_text : styles.notification_title}>
                                {edge.node.text}
                              </div>
                            </div>
                            <div style={styles.notification_header_time}>
                              {this._timesBefore(new Date(edge.node.created))}
                            </div>
                          </div>
                          <div style={styles.notification_time}>
                            {moment(edge.node.created).format('LLLL')}
                          </div>
                        </div>
                      </div>
                    ))
                  : this.state.isLoadingNotifications 
                  ? <div style={styles.loadingContainer}>
                      <ReactLoading type="cylon" color={colors.blue} />
                    </div>
                  : <div style={styles.notification_item}>
                      <div style={styles.chatTitle}>
                        {localizations.header_no_notification}
                      </div>
                    </div>
                  }
                </div>
                {numberOfUnreadNotifications > 0 &&
                  !this.state.isLoadingNotifications && (
                    <div
                      style={styles.readAllButton}
                      ref={node => {
                        this._readAllNode = node;
                      }}
                    >
                      <span
                        style={{ cursor: 'pointer' }}
                        onClick={this._readNotification}
                      >
                        {localizations.readAllNotifications}
                      </span>
                    </div>
                  )}
              </div>
            )}

            <div
              style={styles.notification}
              tabIndex="-1"
              ref={node => {
                this._containerChatNode = node;
              }}
            >
              {unreadChats ? (
                <span style={styles.marked}>{unreadChats}</span>
              ) : null}
              <span
                onClick={() => this._toggleChatPopup()}
                style={styles.chatIconContainer}
              >
                <i
                  className="fa fa-comment-o header_icon"
                  style={styles.chatIcon}
                  aria-hidden="true"
                />
              </span>
            </div>
            {this.state.popup_chat_visible && (
              <div style={styles.notification_popup}>
                <div style={styles.notifications_container}>
                  {filteredChats && filteredChats.length > 0 ? (
                    filteredChats.map((chat, index) => (
                      <Link
                        to={chat.link}
                        style={styles.notification_link}
                        key={chat.key}
                      >
                        <div
                          style={[
                            styles.notification_item,
                            index === filteredChats.length - 1
                              ? { borderBottomWidth: 0 }
                              : null,
                          ]}
                          key={chat.key}
                        >
                          <div style={styles.notification_header_row}>
                            <div style={styles.chatTitle}>{chat.title}</div>
                            <div style={styles.notification_header_time}>
                              {this._timesBefore(
                                new Date(chat.lastMessageDate),
                              )}
                            </div>
                          </div>
                          <div
                            style={
                              chat.isChatRead
                                ? styles.chat_text
                                : { ...styles.chat_text, fontWeight: 'bold' }
                            }
                          >
                            {`${chat.lastAuthor}: ${chat.lastMessageText}`}
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : this.state.isLoadingChat ? (
                    <div style={styles.loadingContainer}>
                      <ReactLoading type="cylon" color={colors.blue} />
                    </div>
                  ) : (
                    <div style={styles.notification_item}>
                      <div style={styles.chatTitle}>
                        {localizations.header_no_chat}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div
              style={styles.notification}
              ref={node => {
                this._containerProfileNode = node;
              }}
              tabIndex="-1"
            >
              <TutorialModal
                isOpen={
                  !this.state.popup_profile_visible &&
                  (this.state.tutorial1IsVisible ||
                    this.state.tutorial2IsVisible)
                }
                tutorialNumber={this.state.tutorial1IsVisible ? 1 : 2}
                tutorialName={
                  this.state.tutorial1IsVisible
                    ? 'team_small_tutorial1'
                    : 'team_small_tutorial2'
                }
                message={
                  this.state.tutorial1IsVisible
                    ? localizations.team_small_tutorial1
                    : localizations.team_small_tutorial2
                }
                confirmLabel={localizations.team_small_tutorial_ok}
                onPass={() => {
                  if (this.state.tutorial1IsVisible) {
                    this.setState({ tutorial1IsVisible: false });
                  } else {
                    this.setState({ tutorial2IsVisible: false });
                  }
                }}
                hideLabel={
                  this.state.tutorial1IsVisible
                    ? localizations.team_small_tutorial_hide
                    : null
                }
                position={{
                  top: 50,
                  right: 22,
                }}
                arrowPosition={{
                  top: -8,
                  right: 5,
                }}
              />
              <div
                style={styles.userContainer}
                onClick={this._toggleProfilePopup}
                className="header_icon"
              >
                <Circle
                  image={user.avatar || '/images/profile.svg'}
                  name={user.pseudo}
                  style={styles.icon}
                  unreadNotif={subAccountsUnread}
                />
                <span style={styles.userPseudo}>
                  {truncateStr(user.pseudo, 18)}
                </span>
                {this.state.popup_profile_visible ? (
                  <i
                    className="fa fa-angle-up"
                    style={styles.menuArrow}
                    aria-hidden="true"
                  />
                ) : (
                  <i
                    className="fa fa-angle-down"
                    style={styles.menuArrow}
                    aria-hidden="true"
                  />
                )}
              </div>
            </div>

            <ul
              style={
                this.state.popup_profile_visible
                  ? styles.profile_popup
                  : styles.hidedPopup
              }
            >
              <SubAccounts
                viewer={viewer}
                user={user}
                forceReload={this._forecedReload}
                isMenuOpen={this.state.popup_profile_visible}
              />
              <li
                onClick={() =>
                  this._handleClick(`/profile-view/${this.props.user.id}`)
                }
                style={styles.popup_link}
              >
                <img
                  style={styles.menuIcon}
                  src="/images/profil-01.png"
                  alt=""
                />
                {localizations.header_menu_profile}
              </li>
              <li
                onClick={() =>
                  this._handleClick(
                    `/profile-view/${this.props.user.id}/statistics`,
                  )
                }
                style={styles.popup_link}
              >
                <img
                  style={{ ...styles.menuIcon, filter: 'brightness(0%)' }}
                  src="/images/statistic_bleu-01.png"
                />
                {localizations.header_menu_statistic}
              </li>
              <li
                onClick={() => this._handleClick('/my-wallet')}
                style={styles.popup_link}
              >
                <img style={styles.menuIcon} src="/images/wallet.png" />
                {localizations.header_menu_wallet}
              </li>

              {/* //Documentuploaded_content */}
              <li
                onClick={() => this._handleClickdocument('/my-document')}
                style={styles.popup_link}
              >
                <img style={styles.menuIcon} src="/images/wallet.png" />
                {localizations.header_menu_document}
              </li>
              {user && user.profileType === 'PERSON' && (
                <li
                  onClick={() => this._handleClick('/my-shared-info')}
                  style={styles.popup_link}
                >
                  <div style={{position: 'relative'}}>
                    {!!user.numberOfFormsToFill && user.numberOfFormsToFill > 0 
                    ? <span style={{...styles.marked, paddingTop: 0, right: 2, zIndex: 2}}>
                        {user.numberOfFormsToFill}
                      </span>
                    : null
                    }
                    <img
                      style={styles.menuIcon}
                      src="/images/form_club-01.png"
                      alt=""
                    />
                  </div>
                  {localizations.circles_information}
                </li>
              )}
              {user && user.profileType === 'PERSON' && (
                <li
                  onClick={() => this._handleClick('/my-membership-fees')}
                  style={styles.popup_link}
                >
                  <div style={{position: 'relative'}}>
                    {!!user.numberOfPaymentModelsToPay && user.numberOfPaymentModelsToPay > 0 
                    ? <span style={{...styles.marked, paddingTop: 0, right: 2, zIndex: 2}}>
                        {user.numberOfPaymentModelsToPay}
                      </span>
                    : null
                    }
                    <img
                      style={styles.menuIcon}
                      src="/images/coti_club-01.png"
                      alt=""
                    />
                  </div>
                  {localizations.circles_myPaymentModels}
                </li>
              )}
              <li
                onClick={() => this._handleClick('/my-info')}
                style={styles.popup_link}
              >
                <img style={styles.menuIcon} src="/images/settings-01.png" />
                {localizations.header_menu_settings}
              </li>
              <li
                onClick={() => this._handleClick('/logout')}
                style={styles.popup_link}
              >
                <img
                  style={styles.menuIcon}
                  src="/images/logout-01.png"
                  alt=""
                />
                {localizations.header_menu_logout}
              </li>
            </ul>
          </div>
        </div>
        <div style={styles.mobileMenu} onClick={e => this._toggleMobileMenu(e)}>
          <i className="fa fa-bars fa-2x" />
        </div>
        {this.state.showImportPopup && (
          <ImportActivitiesModal
            isOpen={this.state.showImportPopup}
            closeModal={this._handleCloseModal}
            user={user}
            isFromMenu={true}
          />
        )}
      </div>
    );
  }
}

const ReduxContainer = connect(
  ({ found: { resolvedMatch },  tutorialReducer, profileReducer }) => ({
    location: resolvedMatch.location,
    params: resolvedMatch.params,
    shownTutorial: tutorialReducer.shownTutorial,
    stepsPercentage: profileReducer.stepsPercentage
  })
)(Radium(AuthorizedContent));

export default createRefetchContainer(
  ReduxContainer,
  {
    user: graphql`
      fragment AuthorizedContent_user on User
        @argumentDefinitions(
          delayedQuery: { type: "Boolean!", defaultValue: false }
          queryNotifications: { type: "Boolean!", defaultValue: false }
          queryChats: { type: "Boolean!", defaultValue: false }
        ) {
        id
        avatar
        pseudo
        unreadChats @include(if: $delayedQuery)
        profileType
        numberOfUnreadNotifications @include(if: $delayedQuery)
        numberOfFormsToFill @include(if: $delayedQuery)
        numberOfPaymentModelsToPay @include(if: $delayedQuery)
        userCanManageVenue
        circles(last: 100) @include(if: $delayedQuery) {
          edges {
            node {
              id
              name
              type
            }
          }
        }
        circlesSuperUser(last: 5) @include(if: $delayedQuery) {
          edges {
            node {
              id
              name
              owner {
                pseudo
                avatar
              }
              type
            }
          }
        }
        notifications(first: 20) @include(if: $queryNotifications) {
          edges {
            node {
              id
              title
              text
              link
              created
              notificationType
              isRead
            }
          }
        }
        chats(last: 100) @include(if: $queryChats) {
          edges {
            node {
              id
              sportunity {
                id
                title
              }
              circle {
                id
                name
              }
              read
              users {
                id
                pseudo
              }
              messages(last: 1) {
                edges {
                  node {
                    text
                    created
                    author {
                      id
                      pseudo
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    viewer: graphql`
      fragment AuthorizedContent_viewer on Viewer
        @argumentDefinitions(
          query: { type: "Boolean!", defaultValue: false }
          superToken: { type: "String" }
          userToken: { type: "String" }
        ) {
        id
        ...Search_viewer
        superMe(superToken: $superToken) @include(if: $query) {
          id
          pseudo
          avatar
          profileType
          isSubAccount
          userPreferences {
            areSubAccountsActivated
          }
          subAccounts {
            id
            pseudo
            avatar
            numberOfUnreadNotifications
            unreadChats
            token
          }
        }

        authorizedAccounts(userToken: $userToken) @include(if: $query) {
          id
          pseudo
          avatar
          profileType
          numberOfUnreadNotifications
          unreadChats
          accounts {
            id
            pseudo
            avatar
            token
            authorization_level
            numberOfUnreadNotifications
            unreadChats
          }
        }
      }
    `,
  },
  graphql`
    query AuthorizedContentRefetchQuery(
      $delayedQuery: Boolean!
      $queryNotifications: Boolean!
      $queryChats: Boolean!
      $query: Boolean!
      $superToken: String
      $userToken: String
    ) {
      viewer {
        ...AuthorizedContent_viewer
          @arguments(
            query: $query
            superToken: $superToken
            userToken: $userToken
          )
        me {
          id
          ...AuthorizedContent_user
            @arguments(
              delayedQuery: $delayedQuery
              queryNotifications: $queryNotifications
              queryChats: $queryChats
            )
        }
      }
    }
  `,
);

styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'space-between',
    fontFamily: 'Lato',
    lineHeight: 1,
    '@media (max-width: 500px)': {
      display: 'flex',
      flex: 4,
    },
  },

  dropdownMenuContainer: {
    position: 'absolute',
    top: 'calc(100% - 10px)',
    zIndex: 1000,
    width: '100%',
    minWidth: 150
  },

  dropdownMenu: {
    marginTop: 10,
    border: `1px solid ${colors.blue}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',

    borderRadius: '0px 0px 5px 5px',
    backgroundColor: colors.background,
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
  },

  menu: {
    fontFamily: 'Lato',
    fontSize: 17,
    color: colors.blue,
    padding: '10px 15px 10px 15px',
    // marginLeft: 15,
    cursor: 'pointer',
    position: 'relative',
    width: '100%',
    textDecoration: 'none',
    ':hover': {
      backgroundColor: '#0002',
    },
  },

  menuActive: {
    fontFamily: 'Lato',
    fontSize: 16,
    color: colors.white,
    padding: '10px 15px',
    borderTop: `1px solid ${colors.blue}`,
    borderBottom: `1px solid ${colors.blue}`,
    borderLeft: `3px solid ${colors.blue}`,
    cursor: 'pointer',
    position: 'relative',
    width: '100%',
    fontWeight: 'bold',
    textDecoration: 'none',
    backgroundColor: colors.blue,
  },

  navigation: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 19,
    height: 62,
    '@media (min-width: 1150px)': {
      width: 850,
    },
    '@media (max-width: 1150px)': {
      fontSize: 18,
      width: '70%',
    },
    '@media (max-width: 950px)': {
      fontSize: 15,
    },
    '@media (max-width: 990px)': {
      fontSize: 15,
      textAlign: 'center',
      justifyContent: 'space-around',
      // flexWrap: 'warp',
    },
    /* '@media (min-width: 321px) and (max-width: 550px)': {
      //flexWrap: 'wrap',
    }, */
    '@media (max-width: 700px)': {
      fontSize: 13,
    },
    '@media (max-width: 500px)': {
      position: 'absolute',
      width: '100%',
      top: 62,
      left: 0,
      flexDirection: 'column',
      backgroundColor: colors.blue,
      borderTop: `1px solid ${colors.white}`,
      zIndex: 1,
      justifyContent: 'space-between',
      padding: 8,
      height: '20vh',
    },
  },
  leftHidden: {
    height: 0,
  },
  mobileMenu: {
    display: 'none',
    '@media (max-width: 500px)': {
      display: 'flex',
      color: colors.white,
      flex: 1,
      justifyContent: 'center',
      cursor: 'pointer',
    },
  },

  notification_link: {
    textDecoration: 'none',
    cursor: 'pointer',
  },
  unread_notification_link: {
    textDecoration: 'none',
    cursor: 'pointer',
    backgroundColor: colors.lightGray,
  },

  linkContainer: {
    flex: 1,
    position: 'relative',
    padding: '5px 10px',
    margin: '0px 5px',
    display: 'flex',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
    '@media (max-width: 700px)': {
      margin: '0 2px',
    },
  },
  activeLinkContainer: {
    flex: 1,
    position: 'relative',
    padding: '5px 10px',
    margin: '0px 5px',
    backgroundColor: '#85C2FF',
    //borderRadius: 5,
    display: 'flex',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
    '@media (max-width: 700px)': {
      margin: '0 2px',
    },
  },

  link: {
    color: 'white',
    textDecoration: 'none',
    position: 'relative',
  },
  chatIconContainer: {
    display: 'flex',
  },
  chatIcon: {
    fontSize: 32,
    color: colors.white,
    paddingBottom: 5,
    cursor: 'pointer',
  },
  marked: {
    backgroundColor: '#E64131',
    width: 17,
    height: 17,
    position: 'absolute',
    top: -10,
    right: -4,
    borderRadius: '50%',
    color: colors.white,
    textAlign: 'center',
    paddingTop: 3,
    fontWeight: 'bold',
    fontSize: 10,
  },

  header_button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    border: '1px solid #FFFFFF',
    color: colors.blue,
    borderRadius: '3px',
    fontSize: 14,
    fontWeight: 'bold',
    textDecoration: 'none',
    backgroundColor: colors.white,

    width: 140,
    height: 34,

    marginRight: 20,

    cursor: 'pointer',
  },

  right: {
    display: 'flex',
    alignItems: 'center',
    '@media (max-width: 551px)': {
      marginRight: 0,
    },
    '@media (max-width: 500px)': {
      flex: 3,
    },
  },

  icons: {
    display: 'flex',
    alignItems: 'center',
    borderLeft: 0,
    '@media (max-width: 990px)': {
      width: '100%',
      // display: 'block',
      justifyContent: 'center',
      textAlign: 'center',
      marginTop: 5,
    },
    '@media (max-width:500px)': {
      justifyContent: 'space-around',
    },
  },

  userContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    cursor: 'pointer',
  },
  icon: {
    minWidth: 32,
    minHeight: 32,
    maxWidth: 32,
    maxHeight: 32,
    cursor: 'pointer',
  },
  userPseudo: {
    fontSize: 14,
    color: colors.white,
    marginRight: 8,
    marginLeft: 8,
    '@media (max-width: 750px)': {
      display: 'none',
    },
  },
  menuArrow: {
    fontSize: 18,
    color: colors.white,
    fontWeight: 'bold',
    marginBottom: 3,
    '@media (max-width: 750px)': {
      marginLeft: 5,
    },
  },
  notification: {
    position: 'relative',
    marginRight: 10,
    '@media (max-width: 990px)': {
      display: 'inline-block',
      margin: '10px 5px',
    },
  },
  profile_popup: {
    // display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
    position: 'absolute',
    top: '62px',
    right: '2px',
    width: '250px',
    // height: '120px',
    backgroundColor: colors.blue,
    zIndex: 1000,
    borderWidth: '1px 0px',
    borderStyle: 'solid',
    borderColor: colors.blue,
    boxShadow: '0 2px 8px 0 rgba(0,0,0,0.48), 0 0 8px 0 rgba(0,0,0,0.24)',
    '@media (max-width: 990px)': {
      right: 10,
      top: 130,
    },
    '@media (max-width: 550px)': {
      top: 180,
    },
    /* '@media (max-width: 370px)': {
      top: 206
    }, */
    '@media (max-width: 500px)': {
      width: '96%',
      right: 0,
      margin: '0 3px',
      top: 65,
    },
  },
  notification_popup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    // justifyContent: 'space-around',
    position: 'absolute',
    top: '60px',
    right: '10px',
    width: '310px',
    // maxHeight: 500,
    backgroundColor: colors.white,
    zIndex: 1000,
    borderTop: `2px solid ${colors.blue}`,
    borderLeft: `2px solid ${colors.blue}`,
    borderRight: `2px solid ${colors.blue}`,
    borderBottom: `2px solid ${colors.blue}`,
    boxShadow: '0 2px 8px 0 rgba(0,0,0,0.48), 0 0 8px 0 rgba(0,0,0,0.24)',
    borderRadius: '5px',
    overflow: 'hidden',

    maxHeight: '50vh',
    '@media (max-width: 990px) and (min-width: 321px)': {
      // right: 'calc(50% - 100px)',
      top: '130px',
      maxWidth: '100%',
    },
    '@media (max-width: 550px)': {
      top: '180px',
    },
    /* '@media (max-width: 370px)': {
      top: '210px'
    }, */
    '@media (max-width: 500px)': {
      right: 0,
      margin: '0 3px',
      width: '98%',
      top: 60,
    },
  },
  notifications_container: {
    overflowY: 'scroll',
    overflowX: 'hidden',
  },
  readAllButton: {
    borderTop: `1px solid ${colors.blue}`,
    // borderBottom: '2px solid ' + colors.blue,
    height: 50,
    width: '100%',
    padding: '10px 15px',
    textAlign: 'center',
    fontFamily: 'Lato',
    fontSize: 14,
    color: colors.darkBlue,
  },
  notification_item: {
    width: 300,
    borderBottom: `2px solid ${colors.blue}`,
    padding: '10px 15px',
    // backgroundColor: '#FF9999',
  },
  notification_title: {
    fontSize: 16,
    color: colors.black,
    fontWeight: 'bold',
    lineHeight: '22px',
    width: 220,
  },
  notification_text: {
    fontSize: 14,
    color: colors.black,
    lineHeight: '20px',
    width: 220,
  },
  notification_header_row: {
    display: 'flex',
    flexDirection: 'row',
  },
  notification_header_col: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  notification_header_time: {
    fontSize: 12,
    textAlign: 'right',
    top: 5,
    right: 0,
    position: 'relative',
    // backgroundColor: '#99FF99',
    width: 70,
  },
  notification_time: {
    fontSize: 14,
    color: colors.black,
    marginTop: 10,
  },
  notification_location: {
    fontSize: 14,
  },
  chat_text: {
    fontSize: 16,
    color: colors.black,
    lineHeight: '22px',
    width: 220,
  },
  marker: {
    marginRight: 8,
    color: colors.blue,
  },
  popup_link: {
    borderWidth: '1px 2px',
    borderStyle: 'solid',
    borderColor: colors.blue,
    height: '100%',
    textAlign: 'start',
    lineHeight: '16px',
    fontFamily: 'Lato',
    fontWeight: 'bold',
    fontSize: 14,
    textDecoration: 'none',
    color: colors.black,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'center',
    marginLeft: 60,
    marginBottom: 8,
  },
  menuIcon: {
    height: 24,
    width: 24,
    marginRight: 10,
    filter: 'grayscale(100%)',
  },

  chatTitle: {
    fontSize: 16,
    color: colors.black,
    lineHeight: '22px',
    width: 220,
    fontWeight: 'bold',
  },
  hidedPopup: {
    display: 'none',
  },
  fullscreen: {
    position: 'absolute',
    display: 'block',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
};
