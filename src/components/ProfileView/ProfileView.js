import React, {Component} from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import PropTypes from 'prop-types'
import Radium from 'radium';
import { withAlert } from 'react-alert'
import platform from 'platform';
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import {Link} from 'found'
import get from 'lodash/get';

import AppHeader from '../common/Header/Header.js'
import Footer from '../common/Footer/Footer'
import Wrapper from './Wrapper';
import Header from './ProfileViewHeader';
import Sidebar from './Sidebar';
import Content from './Content';
import Helmet from 'react-helmet';
import TabMenu from './TabMenu'
import OrganizedSportunitiesStatistics from './OrganizedSportunitiesStatistics';
import TeamsStats from './TeamsStats';
import Stats from './ProfilViewStatistics';
import IndividualStats from './IndividualStats';
import ConfirmationModal from '../common/ConfirmationModal';
import Teams from './Teams';

import localizations from '../Localizations'
import { colors, fonts } from '../../theme'
import { appUrl } from '../../../constants.json';
import Chat from "./ProfileViewChat";
import Events from "./ProfileViewEvents";

let styles


class ProfileView extends Component {

  static contextTypes = {
    relay: PropTypes.shape({
      variables: PropTypes.object,
    }),
  }
 
  constructor(props) {
    super(props)
    this.state = {
      language: localizations.getLanguage(),
      blockModalIsOpen: false,
      showChat: true,
      chatIsQueried: true,
      userId: null, // work around for an issue with Chat
      avatar: null,
      activeTab: 'profile',
      loadMoreQueryIsLoading: false,
      pageSize: 10,
      itemCount: 2,
      displayAndroidOpenApp: false,
      circleId: null,
      showCircle: true,
    }
    this.alertOptions = {
      offset: 60,
      position: 'top right',
      theme: 'light',
      transition: 'fade',
    };
  }
  _setLanguage = (language) => {
    this.setState({ language: language })
  }
  renderMetaTags = (user) => {
    return <Helmet>
              <title>{"Sportunity - Profile de "+user.pseudo}</title>
              <meta name="robots" content="noindex"/>
              <meta name="description" content={localizations.meta_description}/>
              <meta property="fb:app_id" content="1759806787601548"/>
              <meta property="og:type" content="profile"/>
              <meta property="og:title" content={"Sportunity - Profile de "+user.pseudo} />
              <meta property="og:description" content={localizations.meta_description}/>
              <meta property="og:url" content={appUrl + this.props.location.pathname}/>
              <meta property="og:image" content={user.avatar} />
              <meta property="og:image:width" content="150"/>
              <meta property="og:image:height" content="150"/>
          </Helmet>
  }

  componentDidMount = () => {
    if (platform.name.indexOf("Firefox") < 0) {
      if (platform.os.family === "iOS") {
        if (typeof window !== 'undefined')
          window.location.href = "sportunity://profile/"+this.props.routeParams.userId;
      }
      else if (platform.os.family === "Android") {
        this.setState({displayAndroidOpenApp: true})
      }
    }

    if (this.props.routeParams.userId) {
      this.setState({
        userId: this.props.routeParams.userId
      })
    }
    if (this.props.viewer.user.avatar) {
      this.setState({avatar: this.props.viewer.user.avatar})
    }
    if (this.props.routeParams.activeTab === 'chat') {
      this.setState({
        activeTab: 'chat'
      })
    }
    if (this.props.location.pathname.includes('/statistics')) {
      this.setState({
        activeTab: 'statistics'
      })
    }
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.routeParams.userId && this.state.userId && this.state.userId !== nextProps.routeParams.userId)
      this.setState({
        avatar: nextProps.viewer.user.avatar,
        userId: nextProps.routeParams.userId,
      })
    if (this.props.routeParams.userId !== nextProps.routeParams.userId) {
      if (nextProps.routeParams.activeTab) {
        let tabList = ['profile', 'event', 'chat', 'statistics'];
        if (tabList.findIndex(tab => tab === nextProps.routeParams.activeTab) >= 0)
          this._changeTab(nextProps.routeParams.activeTab)
      }
      else {
        this._changeTab('profile')
      }
    }
    if (nextProps.circleId)
      this.setState({
        circleId: nextProps.circleId
      });
  }

  _handleShowChat = () => { // As chat is displayed by default when user is logged in, only anonymous can call this function
    this.props.alert.show(localizations.popup_profileView_login_needed, {
      timeout: 3000,
      type: 'info',
    });
  }


  _showChatSection = () => {
    setTimeout(() => {
// TODO props.relay.* APIs do not exist on compat containers
      if (this.props.relay.pendingVariables)
        this._showChatSection();
      else {
        this.setState({
          showChat: true
        })
      }
    }, 100);
  }

  _loadMoreQueryIsLoaded = () => {
		if (this.context.relay.variables.first === this.state.itemCount) {
			this.setState({
				loadMoreQueryIsLoading: false,
			})
		} else {
			setTimeout(this._loadMoreQueryIsLoaded, 200)
		}
	}

  _loadMore = () => {
    const nextCount = this.state.itemCount + this.state.pageSize
    this.props.relay.refetch(fragmentVariables => ({ 
        ...fragmentVariables,
        first: nextCount 
      }),
      null,
      this._loadMoreQueryIsLoaded
    )
    this.setState({
      itemCount: nextCount,
			loadMoreQueryIsLoading: true,
    })
  }

  openAndroidApp = () => {
    document.location="sportunity://profile/"+this.props.routeParams.userId;
  }

  _changeCircle = (circleID) => {
    this.setState({
      circleId: circleID,
      showCircle: circleID !== null
    })
  };

  _changeTab = (tab) => {
    const {viewer} = this.props;
    // if (this.props.routeParams.activeTab !== tab)
    //   this.props.router.replace('/profile-view/' + this.props.routeParams.userId + '/' + tab)
    this.setState({
      activeTab: tab
    });
  }

  render() {
    const { viewer } = this.props;
    
    const isSelfProfile = viewer.me && this.props.routeParams.userId && viewer.me.id === this.props.routeParams.userId ;
    const showTeamsTab = !get(viewer, 'user.isSubAccount') && get(viewer, 'user.subAccounts', []) && get(viewer, 'user.subAccounts', []).length > 0;

    return (
      <div style={styles.wrapper}>
        {viewer.user && this.renderMetaTags(viewer.user)}
        {this.state.displayAndroidOpenApp && <ConfirmationModal
          isOpen={true}
          title={localizations.android_open_appTitle}
          message={localizations.android_open_appText}
          confirmLabel={localizations.android_open_appConfirm}
          cancelLabel={localizations.android_open_appCancel}
          canCloseModal={true}
          onConfirm= {this.openAndroidApp}
          onCancel={() => {}}
        />}
        <Wrapper>

          <Header
            user={this.props.viewer.user}
            userId={this.props.routeParams.userId}
            viewer={viewer}
            me={viewer.me}
            isSelfProfile={isSelfProfile}
            {...this.state}
          />
          <div style={styles.container}>
            {/*{(isSelfProfile || !viewer.statisticPreferences.private)*/}
              {/*&& (viewer.user && viewer.user.areStatisticsActivated) &&*/}
              <TabMenu
                changeActiveTab={(tab) => this._changeTab(tab)}
                activeTab={this.state.activeTab}
                haveChat={this.state.chatIsQueried && this.props.viewer.chat && !isSelfProfile}
                showTeamsTab={showTeamsTab}
                />
            {/*}*/}
            {this.state.activeTab === 'profile' && this.props.viewer.user && 
              <Content  user={this.props.viewer.user}
                me={this.props.viewer.me}
                viewer={this.props.viewer}
                sportunity={this.props.viewer.sportunities}
                chat={this.props.viewer.chat ? this.props.viewer.chat : null}
                shouldShowChat={this.state.chatIsQueried && this.props.viewer.chat}
                onShowChat={this._handleShowChat}
                isSelfProfile={isSelfProfile}
                onLoadMore={this._loadMore}
                {...this.state}/>
            }
            {this.state.activeTab === 'teams' &&
              <Teams  
                user={this.props.viewer.user}
                me={this.props.viewer.me}
                viewer={this.props.viewer}
                sportunities={this.props.viewer.sportunities}
                chat={this.props.viewer.chat ? this.props.viewer.chat : null}
                shouldShowChat={this.state.chatIsQueried && this.props.viewer.chat}
                onShowChat={this._handleShowChat}
                isSelfProfile={isSelfProfile}
                onLoadMore={this._loadMore}
                {...this.state}/>
            }
            { this.state.activeTab === 'event' &&
              <div style={styles.content}>
                {this.props.viewer.sportunities &&
                  <Events
                    sportunities={this.props.viewer.sportunities}
                    title={localizations.profileView_current_events}
                    user={this.props.viewer.user}
                    viewer={this.props.viewer}
                    loadMoreQueryIsLoading={this.state.loadMoreQueryIsLoading}
                    onLoadMore={this._loadMore}
                    shouldQueryUserStatus={true}/>
                }
                {this.props.viewer.user.sportunities &&
                  <Events
                    sportunities={this.props.viewer.user.sportunities}
                    title={localizations.profileView_past_events}
                    user={this.props.viewer.user}
                    viewer={this.props.viewer}
                    loadMoreQueryIsLoading={this.state.loadMoreQueryIsLoading}
                    onLoadMore={this._loadMore}
                    shouldQueryUserStatus={false}/>
                }
                {viewer.user && ((isSelfProfile && this.props.viewer.sportunities && this.props.viewer.sportunities.count === 0 && this.props.viewer.user.sportunities && this.props.viewer.user.sportunities.count === 0) || (!isSelfProfile && this.props.viewer.user.sportunities && this.props.viewer.user.sportunities.count === 0)) &&
                  <div style={styles.noActivity}>
                    {isSelfProfile 
                    ? localizations.profileView_no_sportunity_you
                    : viewer.user.pseudo + " " + localizations.profileView_no_sportunity
                    }
                    {isSelfProfile &&
                      <Link to='/new-sportunity' style={{textDecoration: 'none', color: colors.blue, marginLeft: 5}}>
                        {localizations.profileView_no_sportunity_organize}
                      </Link>
                    }
                  </div>
                }
              </div>
            }
            {
              this.state.activeTab === 'chat' && !(this.state.chatIsQueried && this.props.viewer.chat) && !isSelfProfile &&
              <div style={styles.chatButtonContainer}>
                <div style={styles.chatButton} onClick={this.props.onShowChat}>
                  {localizations.profile_chat_button+' '+this.props.viewer.user.pseudo}
                </div>
              </div>
            }
            {
              this.state.activeTab === 'chat' && this.state.chatIsQueried && this.props.viewer.chat && !isSelfProfile &&
              <section style={styles.chatBox}>
                <h2 style={styles.title}>{localizations.profile_chat_title}</h2>
                <Chat
                  viewer={this.props.viewer}
                  user={this.props.viewer.user}
                  me={this.props.viewer.me}
                  chat={this.props.viewer.chat ? this.props.viewer.chat : null}
                />
              </section>
            }
            {this.state.activeTab === 'statistics' &&
              <div>
                {/*<OrganizedSportunitiesStatistics*/}
                  {/*viewer={this.props.viewer}*/}
                  {/*userId={this.state.userId}*/}
                {/*/>*/}
                {viewer.user.profileType !== 'PERSON' ?
                // {viewer.user.profileType !== 'PERSON' ?
                  // viewer.user.subAccounts && viewer.user.subAccounts.length > 0 ?
                    //   <Stats
                    //     viewer={this.props.viewer}
                    //     user={this.props.viewer.user}
                    //     userId={this.state.userId}
                    //   />
                    // :
                    <TeamsStats
                      viewer={this.props.viewer}
                      user={this.props.viewer.user}
                      userId={this.state.userId}
                    />
                  :
                  <IndividualStats
                    viewer={this.props.viewer}
                    user={this.props.viewer.user}
                    userId={this.state.userId}
                    language={localizations.getLanguage()}
                  />
                }
              </div>
            }
            {/*<Sidebar user={this.props.viewer.user} {...this.state}/>*/}
          </div>
        </Wrapper>
      </div>
    );
  }
}

styles = {
  wrapper: {
    overflowX: 'hidden',
  },
  container: {},
  title: {
    fontSize: 32,
    fontWeight: 500,
    marginBottom: 30,
  },
  chatBox: {
    marginBottom: 35,
    padding: '40px',
    fontFamily: 'Lato',
  },
  chatButtonContainer: {
    margin: '35px auto',
    textAlign: 'center'
  },
  chatButton: {
    textDecoration: 'none',
    backgroundColor: colors.green,
    color: colors.white,
    borderRadius: 100,
    borderStyle: 'none',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    fontSize: 22,
    cursor: 'pointer',
    padding: '10px 25px',
    maxWidth: 350,
    margin: 'auto',
    fontFamily: 'Lato'
  },
  content: {
    flexGrow: '1',
    padding: '40px',
    fontFamily: 'Lato',
    color: 'rgba(0,0,0,0.65)',
    '@media (maxWidth: 483px)': {
      padding: '40px 20px'
    }
  },
  noActivity: {
    fontSize: 18,
    fontFamily: 'Lato',
    color: colors.darkGray,
    marginTop: 30,
    marginLeft: 10
  },
}

export default createRefetchContainer(Radium(withAlert(ProfileView)), {
//OK
  viewer: graphql`
    fragment ProfileView_viewer on Viewer @argumentDefinitions(
      userId: {type: "String!", defaultValue: "_"}
      queryChat: {type: "Boolean!", defaultValue: false},
      queryStatsIndividual: {type: "Boolean!", defaultValue: false},
      queryStatsClubs: {type: "Boolean!", defaultValue: false},
      queryStatsTeams: {type: "Boolean!", defaultValue: false}, 
      first: { type: "Int", defaultValue: 2 }
    ) {
      ...ProfileViewHeader_viewer,
      ...Content_viewer,
      ...OrganizedSportunitiesStatistics_viewer
      ...TeamsStats_viewer
      ...ClubsStats_viewer
      ...IndividualStats_viewer
      ...ProfileViewChat_viewer
      ...ProfileViewEvents_viewer,
      ...Teams_viewer
      id,
      statisticPreferences (userID: $userId) {
        private
      }
      me {
        id
        ...Content_me,
        ...ProfileViewHeader_me,
        ...ProfileViewChat_me
      }
      user(id: $userId) {
        pseudo
        avatar
        areStatisticsActivated
        profileType
        isSubAccount
        subAccounts {
          id
          pseudo
          avatar
          userStatistics {
            averageNumberOfParticipatedWeek
            averageNumberOfParticipatedMonth
            averageNumberOfParticipatedYear
          }
        }
        sportunities (first: $first) {
          count
          ...ProfileViewEvents_sportunities,
        }
        ...Teams_user
        ...Content_user,
        ...Sidebar_user,
        ...TeamsStats_user
        ...ClubsStats_user
        ...IndividualStats_user
        ...ProfileViewHeader_user
      }
      chat (userId: $userId) {
        ...ProfileViewChat_chat
      }
      sportunities (first:$first, userId: $userId, filter: {status: MySportunities}) {
        count
        ...ProfileViewEvents_sportunities,
      }
    }
  `,
}, 
  graphql`
  query ProfileViewRefetchQuery(
    $userId: String!
    $queryChat: Boolean!
    $queryStatsIndividual: Boolean!
    $queryStatsClubs: Boolean!
    $queryStatsTeams: Boolean!
    $first: Int
  ) {
    viewer {
      ...ProfileView_viewer
        @arguments(
          userId: $userId
          queryChat: $queryChat
          queryStatsIndividual: $queryStatsIndividual
          queryStatsClubs: $queryStatsClubs
          queryStatsTeams: $queryStatsTeams
          first: $first
        )
    }
  }
  `,
);
