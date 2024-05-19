import React from 'react';
import Radium from 'radium';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { withAlert } from 'react-alert';
import { withRouter } from 'found';

import localizations from '../Localizations';
import { colors } from '../../theme';
import Comments from './Comments';
import Feedback from './Feedback';
import CarPooling from './CarPooling';
import TabHeader from './TabHeader';
import Info from './Info';
import Media from './Media';
import { Link } from 'found';
import Slider from './Slider';
import Compositions from './Compositions';
import Sidebar from './EventViewSidebar';
import MemberTab from './MemberTab';

let styles;

const Title = ({ children }) => <h2 style={styles.title}>{children}</h2>;

class Content extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoginError: false,
      showFeedBack: false,
      activeTab: 'main',
    };
  }

  componentDidMount() {
    this.props.onRef && this.props.onRef(this);
    if (this.props.match.location.hash === '#chat') {
      this.setState({
        activeTab: 'chat',
      });
    } else if (
      this.props.match.location.pathname.indexOf('#compositions') >= 0
    ) {
      this.setState({
        activeTab: 'compo',
      });
    } else if (
      this.props.match.location.pathname.indexOf('#carpooling') >= 0
    ) {
      this.setState({
        activeTab: 'carPooling',
      });
    }
  }

  componentWillUnmount() {
    this.props.onRef && this.props.onRef(undefined);
  }

  _handlerFeedbackClicked = () => {
    this.setState({
      showFeedBack: true,
    });
  };

  showError = errorMsg => {
    this.props.alert.show(errorMsg, {
      timeout: 4000,
      type: 'error',
    });
  };

  validTab = newTab => {
    if (
      newTab === 'carPooling' &&
      (this.props.isCancelled || this.props.isPast)
    ) {
      if (this.props.isPast)
        this.showError(localizations.event_view_car_pooling_past_error);
      else
        this.showError(localizations.event_view_car_pooling_cancelled_error);
      return false;
    } else if (
      newTab === 'chat' &&
      (!this.props.shouldShowChat || !this.props.chat)
    ) {
      this.showError(localizations.event_view_chat_error);
      return false;
    }
    return true;
  };

  _changeActiveTab = newTab => {
    // if (this.validTab(newTab)) {
    this.setState({
      activeTab: newTab,
    });
    // }
  };

  render() {
    const {
      sportunity,
      status,
      showBook,
      showJoinWaitingList,
      enableBook,
      onBook,
      onCancel,
      onAdminModify,
      onAdminCancel,
      onAdminReOrganize,
      onAdminDisplayStatForm,
      onDeclineInvitation,
      onOpponentBook,
      viewer,
      isActive,
      isPast,
      isSecondaryOrganizer,
      isPotentialSecondaryOrganizer,
      isAdmin,
      isAuthorizedAdmin,
      isPotentialOpponent,
      onSeeAsAdmin,
      props,
      isLogin,
      isCancelled,
      userIsInvited,
      userIsOnWaitingList,
      userIsParticipant,
      shouldShowChat,
      chat,
      organizers,
      isLoading,
      user,
      userWasInvited,
      onDescriptionUpdate,
      me,
    } = this.props;

    let mainOrganizer = sportunity.organizers.find(org => org.isAdmin);

    // view of tabs for "isSecondaryOrganizer"
    let detailsView = true;
    let memberView = true;
    let chatView = true;
    let carPoolingView = true;
    let imageView = true;
    let compositionView = true;
    if (isSecondaryOrganizer) {
      detailsView =
        isAdmin ||
        !!organizers.find(
          i =>
            i.organizer.id === me.id &&
            i.permissions &&
            i.permissions.detailsAccess &&
            i.permissions.detailsAccess.view,
        );
      memberView =
        isAdmin ||
        !!organizers.find(
          i =>
            i.organizer.id === me.id &&
            i.permissions &&
            i.permissions.memberAccess &&
            i.permissions.memberAccess.view,
        );
      chatView =
        isAdmin ||
        !!organizers.find(
          i =>
            i.organizer.id === me.id &&
            i.permissions &&
            i.permissions.chatAccess &&
            i.permissions.chatAccess.view,
        );
      carPoolingView =
        isAdmin ||
        !!organizers.find(
          i =>
            i.organizer.id === me.id &&
            i.permissions &&
            i.permissions.carPoolingAccess &&
            i.permissions.carPoolingAccess.view,
        );
      imageView =
        isAdmin ||
        !!organizers.find(
          i =>
            i.organizer.id === me.id &&
            i.permissions &&
            i.permissions.imageAccess &&
            i.permissions.imageAccess.view,
        );
      compositionView =
        isAdmin ||
        !!organizers.find(
          i =>
            i.organizer.id === me.id &&
            i.permissions &&
            i.permissions.compositionAccess &&
            i.permissions.compositionAccess.view,
        );
    }

    return (
      <div style={styles.wrapper}>
        <div style={styles.container}>
          <TabHeader
            viewer={viewer}
            sportunity={sportunity}
            activeTab={this.state.activeTab}
            participantsCount={this.props.status.participants.length}
            imagesCount={this.props.status.images.length}
            onChange={tab => this._changeActiveTab(tab)}
            detailsView={detailsView}
            memberView={memberView}
            chatView={chatView}
            carPoolingView={carPoolingView}
            imageView={imageView}
            compositionView={compositionView}
          />

          <div style={styles.content}>
            {this.state.activeTab === 'main' && detailsView && (
              <Info
                viewer={viewer}
                sportunity={sportunity}
                user={user}
                onDescriptionUpdate={onDescriptionUpdate}
                isActive={isActive}
                isAdmin={
                  this.props.isAdmin ||
                  !!this.props.organizers.filter(
                    i =>
                      i.permissions.detailsAccess &&
                      i.permissions.detailsAccess.edit &&
                      this.props.me && 
                      i.organizer.id === this.props.me.id,
                  ).length
                }
                {...this.props}
              />
            )}
            {this.state.activeTab === 'member' && memberView && (
              <MemberTab
                {...this.props}
                isAdmin={
                  this.props.isAdmin ||
                  !!this.props.organizers.filter(
                    i =>
                      i.permissions.memberAccess &&
                      i.permissions.memberAccess.edit &&
                      this.props.me &&
                      i.organizer.id === this.props.me.id,
                  ).length
                }
              />
            )}
            {this.state.activeTab === 'carPooling' && carPoolingView && (
              <CarPooling
                language={() => localizations.getLanguage()}
                sportunity={sportunity}
                viewer={viewer}
                isCancelled={this.props.isCancelled}
                isPast={this.props.isPast}
                userIsParticipant={userIsParticipant}
                isAdmin={
                  this.props.isAdmin ||
                  !!this.props.organizers.filter(
                    i =>
                      i.permissions.carPoolingAccess &&
                      i.permissions.carPoolingAccess.edit &&
                      this.props.me && 
                      i.organizer.id === this.props.me.id,
                  ).length
                }
                canView={carPoolingView}
                viewOnly={
                  !!this.props.organizers.filter(
                    i =>
                      !i.isAdmin &&
                      i.permissions.carPoolingAccess &&
                      i.permissions.carPoolingAccess.view &&
                      !i.permissions.carPoolingAccess.edit &&
                      this.props.me &&
                      i.organizer.id === this.props.me.id,
                  ).length
                }
              />
            )}
            {this.state.activeTab === 'chat' &&
              (isAdmin || userIsParticipant || isSecondaryOrganizer) &&
              chatView && (
                <section style={{ padding: 15 }}>
                  <Title>{localizations.event_comments}</Title>
                  <Comments
                    viewer={viewer}
                    user={this.props.user}
                    me={viewer.me}
                    chat={chat}
                    isAdmin={
                      this.props.isAdmin ||
                      !!this.props.organizers.filter(
                        i =>
                          i.permissions.chatAccess &&
                          i.permissions.chatAccess.edit &&
                          this.props.me &&
                          i.organizer.id === this.props.me.id,
                      ).length
                    }
                    viewOnly={
                      !!this.props.organizers.filter(
                        i =>
                          !i.isAdmin &&
                          i.permissions.chatAccess &&
                          i.permissions.chatAccess.view &&
                          !i.permissions.chatAccess.edit &&
                          this.props.me &&
                          i.organizer.id === this.props.me.id,
                      ).length
                    }
                  />
                </section>
              )}
            {this.state.activeTab === 'chat' &&
              !isAdmin &&
              !userIsParticipant &&
              !isSecondaryOrganizer && (
                <section style={styles.msgContainer}>
                  <i className="fa fa-exclamation-circle fa-5x" />
                  <div>
                    {/*TODO ajouté dans localisation avec l'organisateur dynamique*/}
                    <p style={styles.text}>
                      {localizations.event_chat_errorMessage1 +
                        mainOrganizer.organizer.pseudo +
                        localizations.event_chat_errorMessage2}
                    </p>
                    <p style={styles.text}>
                      {localizations.event_chat_errorMessage3}
                      <Link to={'/profile-view/' + mainOrganizer.organizer.id}>
                        {mainOrganizer.organizer.pseudo}
                      </Link>
                      {localizations.event_chat_errorMessage4}
                    </p>
                  </div>
                </section>
              )}
            {this.state.activeTab === 'media' && imageView && (
              <Media
                sportunity={sportunity}
                viewer={viewer}
                isAdmin={
                  this.props.isAdmin ||
                  !!this.props.organizers.filter(
                    i =>
                      i.permissions.imageAccess &&
                      i.permissions.imageAccess.edit &&
                      this.props.me &&
                      i.organizer.id === this.props.me.id,
                  ).length
                }
              />
            )}
            {this.state.activeTab === 'compo' && compositionView && (
              <Compositions
                onRef={a => (this.addComposition = a)}
                viewer={viewer}
                sportunity={sportunity}
                isAdmin={
                  this.props.isAdmin ||
                  !!this.props.organizers.filter(
                    i =>
                      i.permissions.compositionAccess &&
                      i.permissions.compositionAccess.edit &&
                      this.props.me && 
                      i.organizer.id === this.props.me.id,
                  ).length
                }
              />
            )}
            {/* isCancelled &&
            <Feedback
              viewer={viewer}
              sportunity={sportunity}
            />
          */}
          </div>
        </div>
      </div>
    );
  }
}

styles = {
  wrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    '@media (max-width: 600px)': {
      flexDirection: 'column',
    },
  },
  container: {
    width: '100%',
  },
  containerWithImages: {
    width: 'calc(100% - 200px)',
    '@media (max-width: 600px)': {
      width: '100%',
    },
  },
  content: {
    flexGrow: '1',
    // padding: '40px',
    fontFamily: 'Lato',
    color: 'rgba(0,0,0,0.65)',
    // '@media (max-width: 700px)': {
    //   padding: '20px',
    // },
  },
  book: {
    backgroundColor: colors.green,
    color: colors.white,
    width: 230,
    // height: 70,
    borderRadius: 100,
    borderStyle: 'none',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    fontSize: 22,
    cursor: 'pointer',
    padding: '13px 5px',

    position: 'relative',
    // left: 'calc(50% - 115px)',

    ':disabled': {
      cursor: 'not-allowed',
      backgroundColor: colors.gray,
    },
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: 500,
    marginBottom: 30,
  },
  msgContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: 15,
  },
  text: {
    fontSize: 15,
    fontFamily: 'lato',
  },
  textContainer: {
    width: '60%',
    display: 'flex',
    flexDirection: 'column',
    marginRight: 20,
  },
  carPoolingStat: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
};

export default createFragmentContainer(
  withAlert(withRouter(Radium(Content))),
  {
    sportunity: graphql`
      fragment EventViewContent_sportunity on Sportunity {
        id
        description
        organizers {
          isAdmin
          organizer {
            pseudo
            id
          }
        }
        ...Info_sportunity
        ...Feedback_sportunity
        ...CarPooling_sportunity
        ...Compositions_sportunity
        ...Media_sportunity
        ...EventViewSidebar_sportunity
        participantRange {
          from
          to
        }
        kind
        hide_participant_list
        survey {
          isSurveyTransformed
          surveyDates {
            beginning_date
            ending_date
            answers {
              user {
                id
                pseudo
                avatar
              }
              answer
            }
          }
        }
        invited_circles(last: 10) {
          edges {
            node {
              id
              name
              mode
              type
              memberCount
              members {
                id
              }
              owner {
                id
                pseudo
                avatar
              }
            }
          }
        }
        address {
          address
          city
          position {
            lat
            lng
          }
        }
        images
        sexRestriction
        ageRestriction {
          from
          to
        }
        sport {
          allLevelSelected
          sport {
            fieldImages
          }
          levels {
            id
            EN {
              name
              skillLevel
              description
            }
            FR {
              name
              skillLevel
              description
            }
            DE {
              name
              skillLevel
              description
            }
          }
          certificates {
            name {
              EN
              FR
              DE
            }
          }
          positions {
            EN
            FR
            DE
          }
        }
      }
    `,
    chat: graphql`
      fragment EventViewContent_chat on Chat {
        id
        ...Comments_chat
      }
    `,
    viewer: graphql`
      fragment EventViewContent_viewer on Viewer {
        ...Comments_viewer
        ...Feedback_viewer
        ...CarPooling_viewer
        ...Info_viewer
        ...Media_viewer
        ...Compositions_viewer
        ...EventViewSidebar_viewer
        ...SearchModal_viewer
      }
    `,
    user: graphql`
      fragment EventViewContent_user on User {
        id
        profileType
        ...Comments_user
        ...Info_user
        ...Sidebar_user
        areStatisticsActivated
      }
    `,
  },
);
