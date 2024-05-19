import queryMiddleware from 'farce/lib/queryMiddleware';
import createRender from 'found/lib/createRender';
import makeRouteConfig from 'found/lib/makeRouteConfig';
import Route from 'found/lib/Route';
import React from 'react';
import { graphql } from 'react-relay';
import ReactGA from 'react-ga';

import App from './components/App';

import Home from './components/Home/Home'
import Register from './components/Register/Register.js';
import Login from './components/Login/Login';
import Blog from './components/Blog/Blog';
import SinglePost from './components/Blog/SinglePost/SinglePost'
import AboutUs from './components/AboutUs/AboutUs';
import Privacy from './components/Static/Privacy';
import Term from './components/Static/Term';
import Circle from './components/Circle/Circle.js'
import AddGroup from './components/MyCircles/AddGroup'
import MyCircles from './components/MyCircles/MyCircles.js'
import EventView from './components/EventView/EventView'
import ProfileView from './components/ProfileView/ProfileView.js';
import MyEvents from './components/MyEvents/MyEvents'
import LoggedIn from './components/LoggedIn/LoggedIn'
import Logout from './components/Login/Logout.js';
import FindSportunity from './components/FindSportunity/FindSportunity';
import NewSportunity from './components/NewSportunity/NewSportunity.js';
import NewTimeSlot from './components/NewTimeslot/NewTimeslot.js';
import DatasheetSportunities from './components/datasheetSportunities/DatasheetSportunities.js';
import LoadUrl from './components/common/LoadUrl/LoadUrl';
import ChangePassword from './components/ChangePassword/ChangePassword.js';
import ResetPassword from './components/ResetPassword/ResetPassword.js';
import Profile from './components/Profile/Profile.js';
import Venue from './components/Venue/Venue.js';
import VenueView from './components/VenueView/VenueView.js';
import Venues from './components/Venues/Venues.js';
import Facility from './components/Facility/Facility.js';
import ManageVenue from './components/ManageVenue/ManageVenue.js'
import MyInfo from './components/MyInfo/MyInfo.js'
import Contact from './components/Static/Contact'
import FaqCalendarSync from './components/FAQ/CalendarSync/index';
import FaqGoogleCalendarSync from './components/FAQ/CalendarSync/GoogleCalendarSync';
import FaqOutlookCalendarSync from './components/FAQ/CalendarSync/OutlookCalendarSync';
import FaqAppleCalendarSync from './components/FAQ/CalendarSync/AppleCalendarSync';
import FaqHowtoFollowOrganiser from './components/FAQ/UserTutorial/FollowOrganiser';
import FaqHowtoModifyProfile from './components/FAQ/UserTutorial/ModifyProfile';
import TeamTutorial from './components/FAQ/UserTutorial/TeamTutorial';
import Tutorial from './components/FAQ/Tutorial';
import TutorialContent from './components/FAQ/TutorialContent';
import ClubsTutorialShareWithTeammates from './components/FAQ/UserTutorial/Clubs/ShareWithTeammates';
import ManageAClubTutorial from './components/FAQ/UserTutorial/Clubs/ManageAClub'
import ClubsTutorialUseStatistics from './components/FAQ/UserTutorial/Clubs/UseStatistics';
import IndividualOrganizeSportActivities from './components/FAQ/UserTutorial/OrganizeSportActivities';
import CompaniesTutorial from './components/FAQ/UserTutorial/CompaniesTutorial';
import VenuesHome from './components/Home/VenuesHome/VenuesHome';
import CompaniesHome from './components/Home/CompaniesHome/CompaniesHome';
import ClubsHome from './components/Home/ClubsHome/ClubsHome'
import UniversityHome from './components/Home/UniversityHome/UniversityHome'
import EmbedEvent from './components/Embed/EmbedEvent';
import EmbedUserEvents from './components/Embed/EmbedUserEvents';
import EmbedCircle from './components/Embed/EmbedCircle';
import EmbedUserCircles from './components/Embed/EmbedUserCircles';
import NewGroup from './components/NewGroup';
import SearchPage from './components/Search/SearchPage';
import MyWallet from './components/MyInfo/Wallet/index';
import Document from './components/MyInfo/Document'
import Features from './components/Features/Features';

export const historyMiddlewares = [queryMiddleware];

import { updateToken, logout, updateSuperToken } from './createRelayEnvironment'
import UserDocumentRecord from './components/MyInfo/Document/UserDocumentRecord';

ReactGA.initialize('UA-86793644-1');

export const routes = (
    <Route
        path="/"
        Component={App}
    >
        <Route
            Component={Home}
            query={graphql`
                query router_Home_Query {
                    viewer {
                        ...Home_viewer
                    }
                }
            `}
        />
        <Route
            Component={Home}
            path="/fr"
            query={graphql`
                query router_HomeFr_Query {
                    viewer {
                        ...Home_viewer
                    }
                }
            `}
        />
        <Route
            path="/clubs"
            Component={ClubsHome}
            query={graphql`
                query router_ClubsHome_Query {
                    viewer {
                        ...ClubsHome_viewer
                    }
                }
            `}
        />
        <Route
            path="/fr/clubs"
            Component={ClubsHome}
            query={graphql`
                query router_ClubsFRHome_Query {
                    viewer {
                        ...ClubsHome_viewer
                    }
                }
            `}
        />
        <Route
            path="/universities"
            Component={UniversityHome}
            query={graphql`
                query router_UniversityHome_Query {
                    viewer {
                        ...UniversityHome_viewer
                    }
                }
            `}
        />
        <Route
            path="/fr/universities"
            Component={UniversityHome}
            query={graphql`
                query router_UniversityFRHome_Query {
                    viewer {
                        ...UniversityHome_viewer
                    }
                }
            `}
        />
        <Route
            path="/venues"
            Component={VenuesHome}
            query={graphql`
                query router_VenuesHome_Query {
                    viewer {
                        ...VenuesHome_viewer
                    }
                }
            `}
        />
        <Route
            path="/fr/venues"
            Component={VenuesHome}
            query={graphql`
                query router_VenuesFRHome_Query {
                    viewer {
                        ...VenuesHome_viewer
                    }
                }
            `}
        />
        <Route
            path="/companies"
            Component={CompaniesHome}
            query={graphql`
                query router_CompaniesHome_Query {
                    viewer {
                        ...CompaniesHome_viewer
                    }
                }
            `}
        />
        <Route
            path="/fr/companies"
            Component={CompaniesHome}
            query={graphql`
                query router_CompaniesFRHome_Query {
                    viewer {
                        ...CompaniesHome_viewer
                    }
                }
            `}
        />
        <Route
            path="/s/:shortUrl"
            Component={LoadUrl}
            query={graphql`
                query router_LoadUrl_Query {
                    viewer {
                        ...LoadUrl_viewer
                    }
                }
            `}
        />
        <Route
            path="/register"
            Component={Register}
            query={graphql`
                query router_Register_Query {
                    viewer {
                        ...Register_viewer
                    }
                }
            `}
            updateToken={updateToken}
            updateSuperToken={updateSuperToken}
        />
        <Route
            path="/registration-completed"
            Component={Register}
            query={graphql`
                query router_RegistrationCompleted_Query {
                    viewer {
                        ...Register_viewer
                    }
                }
            `}
            updateToken={updateToken}
            updateSuperToken={updateSuperToken}
        />
        <Route
            path="/manage-venue"
            Component={ManageVenue}
            query={graphql`
                query router_ManageVenue_Query {
                    viewer {
                        ...ManageVenue_viewer
                    }
                }
            `}
        />
        <Route
            path="/resetpassword"
            Component={ResetPassword}
            query={graphql`
                query router_ResetPassword_Query {
                    viewer {
                        ...ResetPassword_viewer
                    }
                }
            `}
        />
        <Route
            path="/changepassword&token=:tokenId"
            Component={ChangePassword}
            query={graphql`
                query router_ChangePassword_Query {
                    viewer {
                        ...ChangePassword_viewer
                    }
                }
            `}
        />
        <Route
            path="/profile"
            Component={Profile}
            query={graphql`
                query router_Profile_Query {
                    viewer {
                        ...Profile_viewer
                    }
                }
            `}
        />
        <Route
            path="/venue"
            Component={Venue}
            query={graphql`
                query router_Venue_Query {
                    viewer {
                        ...Venue_viewer
                    }
                }
            `}
        />
        <Route
            path='/venue-view/:venueId'
            Component={VenueView}
            query={graphql`
                query router_VenueView_Query {
                    viewer {
                        ...VenueView_viewer
                    }
                }
            `}
        />
        <Route
            path="/facility/:venueId"
            Component={Facility}
            query={graphql`
                query router_Facility_Query ($venueId: ID) {
                    viewer {
                        ...Facility_viewer @arguments (venueId: $venueId)
                    }
                }
            `}
            prepareVariables={params => ({
                ...params,
            })}
        />
        <Route
            path="/my-info"
            Component={MyInfo}
            query={graphql`
                query router_MyInfo_Query {
                    viewer {
                        ...MyInfo_viewer
                    }
                }
            `}
        />
        <Route
            path="/my-shared-info"
            Component={MyInfo}
            query={graphql`
                query router_MySharedInfo_Query {
                    viewer {
                        ...MyInfo_viewer
                    }
                }
            `}
        />
        <Route
            path="/my-membership-fees/:options?"
            Component={MyInfo}
            query={graphql`
                query router_MyMembershipFees_Query {
                    viewer {
                        ...MyInfo_viewer
                    }
                }
            `}
        />
        <Route
            path="/my-password"
            Component={MyInfo}
            query={graphql`
                query router_MyPassword_Query {
                    viewer {
                        ...MyInfo_viewer
                    }
                }
            `}
        />
        <Route
            path="/sync-calendar"
            Component={MyInfo}
            query={graphql`
                query router_SyncCalendar_Query {
                    viewer {
                        ...MyInfo_viewer
                    }
                }
            `}
        />
        <Route
            path="/my-wallet/:options?"
            Component={MyWallet}
            query={graphql`
                query router_MyWallet_Query {
                    viewer {
                        ...Wallet_viewer
                    }
                }
            `}
        />
        <Route
            path="/cashin-confirmation"
            Component={MyWallet}
            query={graphql`
                query router_CashInConfirmation_Query {
                    viewer {
                        ...Wallet_viewer
                    }
                }
            `}
        />
        <Route
            path="/my-document"
            Component={Document}
            query={graphql`
                query router_MyDocument_Query {
                    viewer {
                        ...Document_viewer
                    }
                }
            `}
        />
        <Route
            path="/user-document"
            Component={UserDocumentRecord}
        />
        <Route
            path="/preferences"
            Component={MyInfo}
            query={graphql`
                query router_Preferences_Query {
                    viewer {
                        ...MyInfo_viewer
                    }
                }
            `}
        />
        <Route
            path="/share-access"
            Component={MyInfo}
            query={graphql`
                query router_ShareAccess_Query {
                    viewer {
                        ...MyInfo_viewer
                    }
                }
            `}
        />
        <Route
            path="/statistics"
            Component={MyInfo}
            query={graphql`
                query router_Statistics_Query {
                    viewer {
                        ...MyInfo_viewer
                    }
                }
            `}
        />
        <Route
            path="/notification-preferences"
            Component={MyInfo}
            query={graphql`
                query router_MyInfoNotificationPreferences_Query {
                    viewer {
                        ...MyInfo_viewer
                    }
                }
            `}
            prepareVariables={params => ({
                ...params,
            })}
        />
        <Route
            path="/notification-preferences/:token"
            Component={Login}
            query={graphql`
                query router_AutoLoginToNotifications_Query {
                    viewer {
                        ...Login_viewer
                    }
                }
            `}
            updateToken={updateToken}
            updateSuperToken={updateSuperToken}
        />
        <Route
            path="/faq/calendar-sync"
            Component={FaqCalendarSync}
            query={graphql`
                query router_FaqCalendarSync_Query {
                    viewer {
                        ...CalendarSync_viewer
                    }
                }
            `}
        />
        <Route
            path="/faq/calendar-sync/google-calendar"
            Component={FaqGoogleCalendarSync}
            query={graphql`
                query router_FaqGoogleCalendarSync_Query {
                    viewer {
                        ...GoogleCalendarSync_viewer
                    }
                }
            `}
        />
        <Route
            path="/faq/calendar-sync/outlook-calendar"
            Component={FaqOutlookCalendarSync}
            query={graphql`
                query router_FaqOutlookCalendarSync_Query {
                    viewer {
                        ...OutlookCalendarSync_viewer
                    }
                }
            `}
        />
        <Route
            path="/faq/calendar-sync/apple-calendar"
            Component={FaqAppleCalendarSync}
            query={graphql`
                query router_FaqAppleCalendarSync_Query {
                    viewer {
                        ...AppleCalendarSync_viewer
                    }
                }
            `}
        />
        <Route
            path="/faq/how-to-follow-organizer"
            Component={FaqHowtoFollowOrganiser}
            query={graphql`
                query router_FaqHowtoFollowOrganiser_Query {
                    viewer {
                        ...FollowOrganiser_viewer
                    }
                }
            `}
        />
        <Route
            path="/faq/how-to-modify-profile"
            Component={FaqHowtoModifyProfile}
            query={graphql`
                query router_FaqHowtoModifyProfile_Query {
                    viewer {
                        ...ModifyProfile_viewer
                    }
                }
            `}
        />
        <Route
            path="/faq/team-tutorial"
            Component={TeamTutorial}
            query={graphql`
                query router_TeamTutorial_Query {
                    viewer {
                        ...TeamTutorial_viewer
                    }
                }
            `}
        />
        <Route
            path="/faq/tutorial"
            Component={Tutorial}
            query={graphql`
                query router_Tutorial_Query {
                    viewer {
                        ...Tutorial_viewer
                    }
                }
            `}
        />
        <Route
            path="/faq-mobile/tutorial"
            Component={Tutorial}
            query={graphql`
                query router_MobileTutorial_Query {
                    viewer {
                        ...Tutorial_viewer
                    }
                }
            `}
        />
        <Route
            path="/faq/tutorial/:tutorial"
            Component={TutorialContent}
            query={graphql`
                query router_TutorialContent_Query {
                    viewer {
                        ...TutorialContent_viewer
                    }
                }
            `}
            prepareVariables={params => ({
                ...params,
            })}
        />
        <Route
            path="/faq-mobile/tutorial/:tutorial"
            Component={TutorialContent}
            query={graphql`
                query router_MobileTutorialContent_Query {
                    viewer {
                        ...TutorialContent_viewer
                    }
                }
            `}
            prepareVariables={params => ({
                ...params,
            })}
        />
        <Route
            path="/faq/clubs/share-with-teammates"
            Component={ClubsTutorialShareWithTeammates}
            query={graphql`
                query router_ClubsTutorialShareWithTeammates_Query {
                    viewer {
                        ...ShareWithTeammates_viewer
                    }
                }
            `}
        />
        <Route
            path="/faq/clubs/use-statistics"
            Component={ClubsTutorialUseStatistics}
            query={graphql`
                query router_ClubsTutorialUseStatistics_Query {
                    viewer {
                        ...UseStatistics_viewer
                    }
                }
            `}
        />
        <Route
            path="/faq/clubs/manage-a-club"
            Component={ManageAClubTutorial}
            query={graphql`
                query router_ManageAClubTutorial_Query {
                    viewer {
                        ...ManageAClub_viewer
                    }
                }
            `}
        />
        <Route
            path="/faq/individuals-organize-sport-activities"
            Component={IndividualOrganizeSportActivities}
            query={graphql`
                query router_IndividualOrganizeSportActivities_Query {
                    viewer {
                        ...OrganizeSportActivities_viewer
                    }
                }
            `}
        />
        <Route
            path="/faq/companies-tutorial"
            Component={CompaniesTutorial}
            query={graphql`
                query router_CompaniesTutorial_Query {
                    viewer {
                        ...CompaniesTutorial_viewer
                    }
                }
            `}
        />
        <Route
            path="about-us"
            Component={AboutUs}
            query={graphql`
                query router_AboutUs_Query {
                    viewer {
                        ...AboutUs_viewer
                    }
                }
            `}
        />
        <Route
            path="contact-us"
            Component={AboutUs}
            query={graphql`
                query router_ContactUs_Query {
                    viewer {
                        ...AboutUs_viewer
                    }
                }
            `}
        />
        <Route
            path="/my-events"
            Component={MyEvents}
            query={graphql`
                query router_MyEvents_Query {
                    viewer {
                        ...MyEvents_viewer
                    }
                }
            `}
        />
        <Route
            path="privacy"
            Component={Privacy}
            query={graphql`
                query router_Privacy_Query {
                    viewer {
                        ...Privacy_viewer
                    }
                }
            `}
        />
        <Route
            path="term"
            Component={Term}
            query={graphql`
                query router_Term_Query {
                    viewer {
                        ...Term_viewer
                    }
                }
            `}
        />
        <Route
            path="blog"
            Component={Blog}
            query={graphql`
                query router_Blog_Query {
                    viewer {
                        ...Blog_viewer
                    }
                }
            `}
        />
        <Route
            path="/blog/comment-developper-le-sport-dans-son-entreprise-quand-on-a-ni-temps-ni-budget"
            Component={SinglePost}
        />
        <Route
            path="/event-view/:sportunityId/:options?"
            Component={EventView}
            query={graphql`
                query router_EventViewSportunityId_Query (
                    $sportunityId: ID,
                    $chatSportunityId: String,
                    $isCoOrganizerOnSerieSportunityId: String!,
                    $querySuperMe: Boolean!,
                    $queryIsCoOrganizerOnSerie: Boolean!,
                    $queryAuthorizedAccounts: Boolean!
                ){
                    viewer {
                        ...EventView_viewer @arguments(
                            sportunityId: $sportunityId,
                            chatSportunityId: $chatSportunityId,
                            isCoOrganizerOnSerieSportunityId: $isCoOrganizerOnSerieSportunityId,
                            querySuperMe: $querySuperMe,
                            queryIsCoOrganizerOnSerie: $queryIsCoOrganizerOnSerie,
                            queryAuthorizedAccounts: $queryAuthorizedAccounts
                        )
                    }
                }
            `}
            prepareVariables={params => ({
                ...params,
                chatSportunityId: params.sportunityId,
                isCoOrganizerOnSerieSportunityId: params.sportunityId,
                querySuperMe: false,
                queryIsCoOrganizerOnSerie: false,
                queryAuthorizedAccounts: false
            })}
        />
        <Route
            path="/find-sportunity"
            Component={FindSportunity}
            query={graphql`
                query router_FindSportunity_Query {
                    viewer {
                        ...FindSportunity_viewer
                    }
                }
            `}
        />
        <Route
            path="/find-sportunity(/lat=(:urlLat)&lng=(:urlLng)(/range=(:urlRange)))(/sport=(:urlSportId))(/fromDate=(:urlFromDate)&toDate=(:urlToDate))(/free=(:urlFree))"
            Component={FindSportunity}
            query={graphql`
                query router_FindSportunityURL_Query {
                    viewer {
                        ...FindSportunity_viewer
                    }
                }
            `}
        />
        <Route
            path="/login"
            Component={Login}
            query={graphql`
                query router_Login_Query {
                    viewer {
                        ...Login_viewer
                    }
                }
            `}
            updateToken={updateToken}
            updateSuperToken={updateSuperToken}
        />
        <Route
            path="/login/:token"
            Component={Login}
            query={graphql`
                query router_AutoLogin_Query {
                    viewer {
                        ...Login_viewer
                    }
                }
            `}
            updateToken={updateToken}
            updateSuperToken={updateSuperToken}
        />
        <Route
            path="/login-superuser/:token"
            Component={Login}
            query={graphql`
                query router_LoginSuperUser_Query {
                    viewer {
                        ...Login_viewer
                    }
                }
            `}
            updateToken={updateToken}
            updateSuperToken={updateSuperToken}
        />
        <Route
            path="/login-switch/:token"
            Component={Login}
            query={graphql`
                query router_LoginSwitch_Query {
                    viewer {
                        ...Login_viewer
                    }
                }
            `}
            updateToken={updateToken}
            updateSuperToken={updateSuperToken}
        />
        <Route
            path="/mailvalidation&token=:tokenId"
            Component={Login}
            query={graphql`
                query router_MailValidation_Query {
                    viewer {
                        ...Login_viewer
                    }
            }
            `}
            updateToken={updateToken}
            updateSuperToken={updateSuperToken}
        />
        <Route
            path="/logged-in"
            Component={LoggedIn}
            query={graphql`
                query router_LoggedIn_Query {
                    viewer {
                        ...LoggedIn_viewer
                    }
                }
            `}
        />
        <Route
            path="/logout"
            Component={Logout}
            logout={logout}
        />


        <Route
            path="/profile-view/:userId/:activeTab"
            Component={ProfileView}
            query={graphql`
                query router_ProfileViewActiveTab_Query ($userId: String!) {
                    viewer {
                        ...ProfileView_viewer @arguments(userId: $userId)
                    }
                }
            `}
            prepareVariables={params => ({
                ...params,
            })}
        />
        <Route
            path="/profile-view/:userId/:activeTab/:circleId"
            Component={ProfileView}
            query={graphql`
                query router_ProfileViewCircleId_Query ($userId: String!) {
                    viewer {
                        ...ProfileView_viewer @arguments(userId: $userId)
                    }
                }
            `}
            prepareVariables={params => ({
                ...params,
            })}
        />
        <Route
            path="/profile-view/:userId"
            Component={ProfileView}
            query={graphql`
                query router_ProfileViewUserId_Query (
                    $userId: String!
                    $queryChat: Boolean!
                    $queryStatsIndividual: Boolean!
                    $queryStatsClubs: Boolean!
                    $queryStatsTeams: Boolean!,
                    $first: Int
                ) {
                    viewer {
                        ...ProfileView_viewer @arguments(
                            userId: $userId,
                            queryChat: $queryChat,
                            queryStatsIndividual: $queryStatsIndividual,
                            queryStatsClubs: $queryStatsClubs,
                            queryStatsTeams: $queryStatsTeams,
                            first: $first
                        )
                    }
                }
            `}
            prepareVariables={params => ({
                ...params,
                queryChat: false,
                queryStatsIndividual: false,
                queryStatsClubs: false,
                queryStatsTeams: false,
                first: 2
            })}
        />
        <Route
            path="/circle/:circleId"
            Component={Circle}
            query={graphql`
                query router_CircleId_Query (
                    $userToken: String
                    $queryAuthorizedAccounts: Boolean!
                    $superToken: String
                    $querySuperMe: Boolean!
                    $circleId: ID
                ) {
                    viewer {
                        ...Circle_viewer @arguments(
                            userToken: $userToken
                            queryAuthorizedAccounts: $queryAuthorizedAccounts
                            superToken: $superToken
                            querySuperMe: $querySuperMe
                            circleId: $circleId
                        )
                    }
                }
            `}
            prepareVariables={params => ({
                ...params,
                queryAuthorizedAccounts: false,
                querySuperMe: false,
                circleId: params.circleId,
            })}
        />
        <Route
            path="/circle/:circleId/:activeTab"
            Component={Circle}
            query={graphql`
                query router_CircleActiveTab_Query (
                    $userToken: String
                    $queryAuthorizedAccounts: Boolean!
                    $superToken: String
                    $querySuperMe: Boolean!
                    $circleId: ID
                ) {
                    viewer {
                        ...Circle_viewer @arguments (
                            userToken: $userToken
                            queryAuthorizedAccounts: $queryAuthorizedAccounts
                            superToken: $superToken
                            querySuperMe: $querySuperMe
                            circleId: $circleId
                        )
                    }
                }
            `}
            prepareVariables={params => ({
                ...params,
                queryAuthorizedAccounts: false,
                querySuperMe: false,
                circleId: params.circleId
            })}
        />
        <Route
            path="/join-circle/:circleId"
            Component={Circle}
            query={graphql`
                query router_JoinCircle_Query (
                    $userToken: String
                    $queryAuthorizedAccounts: Boolean!
                    $superToken: String
                    $querySuperMe: Boolean!
                    $circleId: ID
                ) {
                    viewer {
                        ...Circle_viewer @arguments (
                            userToken: $userToken
                            queryAuthorizedAccounts: $queryAuthorizedAccounts
                            superToken: $superToken
                            querySuperMe: $querySuperMe
                            circleId: $circleId
                        )
                    }
                }
            `}
            prepareVariables={params => ({
                ...params,
                queryAuthorizedAccounts: false,
                querySuperMe: false,
                circleId: params.circleId,
            })}
        />
        <Route
            path="/subaccounts-circle-creation"
            Component={MyCircles}
            query={graphql`
                query router_SubAccountCircleCreation_Query {
                    viewer {
                        ...MyCircles_viewer
                    }
                }
            `}
        />
        <Route
            path="/my-circles"
            Component={MyCircles}
            query={graphql`
                query router_MyCircles_Query (
                    $circleId: ID
                    $querySuperMe: Boolean!
                    $queryMyCircle: Boolean!
                    $queryCirclesImIn: Boolean!
                    $querySubAccount: Boolean!
                    $queryPublicCircle: Boolean!
                    $queryOtherTeamsCircles: Boolean!
                    $queryCircle: Boolean!
                ){
                    viewer {
                        ...MyCircles_viewer @arguments (
                            circleId: $circleId
                            querySuperMe: $querySuperMe,
                            queryMyCircle: $queryMyCircle,
                            queryCirclesImIn: $queryCirclesImIn,
                            querySubAccount: $querySubAccount,
                            queryPublicCircle: $queryPublicCircle,
                            queryOtherTeamsCircles: $queryOtherTeamsCircles,
                            queryCircle: $queryCircle,
                        )
                    }
                }
            `}
            prepareVariables={params => ({
                ...params,
                querySuperMe: false,
                queryMyCircle: false,
                queryCirclesImIn: false,
                querySubAccount: false,
                queryPublicCircle: false,
                queryOtherTeamsCircles: false,
                queryCircle: false
            })}
        />
        <Route
            path="/my-circles/all-members"
            Component={MyCircles}
            query={graphql`
                query router_MyCirclesAllMembers_Query (
                    $circleId: ID
                    $querySuperMe: Boolean!
                    $queryMyCircle: Boolean!
                    $queryCirclesImIn: Boolean!
                    $querySubAccount: Boolean!
                    $queryPublicCircle: Boolean!
                    $queryOtherTeamsCircles: Boolean!
                    $queryCircle: Boolean!
                ){
                    viewer {
                        ...MyCircles_viewer @arguments (
                            circleId: $circleId
                            querySuperMe: $querySuperMe,
                            queryMyCircle: $queryMyCircle,
                            queryCirclesImIn: $queryCirclesImIn,
                            querySubAccount: $querySubAccount,
                            queryPublicCircle: $queryPublicCircle,
                            queryOtherTeamsCircles: $queryOtherTeamsCircles,
                            queryCircle: $queryCircle,
                        )
                    }
                }
            `}
            prepareVariables={params => ({
                ...params,
                querySuperMe: false,
                queryMyCircle: false,
                queryCirclesImIn: false,
                querySubAccount: false,
                queryPublicCircle: false,
                queryOtherTeamsCircles: false,
                queryCircle: false
            })}
        />
        <Route
            path="/my-circles/members-info"
            Component={MyCircles}
            query={graphql`
                query router_MyCirclesMembersInfo_Query (
                    $circleId: ID
                    $querySuperMe: Boolean!
                    $queryMyCircle: Boolean!
                    $queryCirclesImIn: Boolean!
                    $querySubAccount: Boolean!
                    $queryPublicCircle: Boolean!
                    $queryOtherTeamsCircles: Boolean!
                    $queryCircle: Boolean!
                ){
                    viewer {
                        ...MyCircles_viewer @arguments (
                            circleId: $circleId
                            querySuperMe: $querySuperMe,
                            queryMyCircle: $queryMyCircle,
                            queryCirclesImIn: $queryCirclesImIn,
                            querySubAccount: $querySubAccount,
                            queryPublicCircle: $queryPublicCircle,
                            queryOtherTeamsCircles: $queryOtherTeamsCircles,
                            queryCircle: $queryCircle,
                        )
                    }
                }
            `}
            prepareVariables={params => ({
                ...params,
                querySuperMe: false,
                queryMyCircle: false,
                queryCirclesImIn: false,
                querySubAccount: false,
                queryPublicCircle: false,
                queryOtherTeamsCircles: false,
                queryCircle: false
            })}
        />
        <Route
            path="/my-circles/form-info"
            Component={MyCircles}
            query={graphql`
                query router_MyCirclesNewForm_Query (
                    $circleId: ID
                    $querySuperMe: Boolean!
                    $queryMyCircle: Boolean!
                    $queryCirclesImIn: Boolean!
                    $querySubAccount: Boolean!
                    $queryPublicCircle: Boolean!
                    $queryOtherTeamsCircles: Boolean!
                    $queryCircle: Boolean!
                ){
                    viewer {
                        ...MyCircles_viewer @arguments (
                            circleId: $circleId
                            querySuperMe: $querySuperMe,
                            queryMyCircle: $queryMyCircle,
                            queryCirclesImIn: $queryCirclesImIn,
                            querySubAccount: $querySubAccount,
                            queryPublicCircle: $queryPublicCircle,
                            queryOtherTeamsCircles: $queryOtherTeamsCircles,
                            queryCircle: $queryCircle,
                        )
                    }
                }
            `}
            prepareVariables={params => ({
                ...params,
                querySuperMe: false,
                queryMyCircle: false,
                queryCirclesImIn: false,
                querySubAccount: false,
                queryPublicCircle: false,
                queryOtherTeamsCircles: false,
                queryCircle: false
            })}
        />
        <Route
            path="/my-circles/form-details/:formId"
            Component={MyCircles}
            query={graphql`
                query router_MyCirclesFormDetails_Query (
                    $circleId: ID
                    $formId: ID
                    $querySuperMe: Boolean!
                    $queryMyCircle: Boolean!
                    $queryCirclesImIn: Boolean!
                    $querySubAccount: Boolean!
                    $queryPublicCircle: Boolean!
                    $queryOtherTeamsCircles: Boolean!
                    $queryCircle: Boolean!
                ){
                    viewer {
                        ...MyCircles_viewer @arguments (
                            circleId: $circleId
                            formId: $formId
                            querySuperMe: $querySuperMe,
                            queryMyCircle: $queryMyCircle,
                            queryCirclesImIn: $queryCirclesImIn,
                            querySubAccount: $querySubAccount,
                            queryPublicCircle: $queryPublicCircle,
                            queryOtherTeamsCircles: $queryOtherTeamsCircles,
                            queryCircle: $queryCircle,
                        )
                    }
                }
            `}
            prepareVariables={params => ({
                ...params,
                querySuperMe: false,
                queryMyCircle: false,
                queryCirclesImIn: false,
                querySubAccount: false,
                queryPublicCircle: false,
                queryOtherTeamsCircles: false,
                queryCircle: false
            })}
        />
        <Route
            path="/my-circles/payment-models"
            Component={MyCircles}
            query={graphql`
                query router_MyCirclesPaymentModels_Query (
                    $circleId: ID
                    $querySuperMe: Boolean!
                    $queryMyCircle: Boolean!
                    $queryCirclesImIn: Boolean!
                    $querySubAccount: Boolean!
                    $queryPublicCircle: Boolean!
                    $queryOtherTeamsCircles: Boolean!
                    $queryCircle: Boolean!
                ){
                    viewer {
                        ...MyCircles_viewer @arguments (
                            circleId: $circleId
                            querySuperMe: $querySuperMe,
                            queryMyCircle: $queryMyCircle,
                            queryCirclesImIn: $queryCirclesImIn,
                            querySubAccount: $querySubAccount,
                            queryPublicCircle: $queryPublicCircle,
                            queryOtherTeamsCircles: $queryOtherTeamsCircles,
                            queryCircle: $queryCircle,
                        )
                    }
                }
            `}
            prepareVariables={params => ({
                ...params,
                querySuperMe: false,
                queryMyCircle: false,
                queryCirclesImIn: false,
                querySubAccount: false,
                queryPublicCircle: false,
                queryOtherTeamsCircles: false,
                queryCircle: false
            })}
        />
        <Route
            path="/my-circles/payment-info"
            Component={MyCircles}
            query={graphql`
                query router_MyCirclesNewPayment_Query (
                    $circleId: ID
                    $querySuperMe: Boolean!
                    $queryMyCircle: Boolean!
                    $queryCirclesImIn: Boolean!
                    $querySubAccount: Boolean!
                    $queryPublicCircle: Boolean!
                    $queryOtherTeamsCircles: Boolean!
                    $queryCircle: Boolean!
                ){
                    viewer {
                        ...MyCircles_viewer @arguments (
                            circleId: $circleId
                            querySuperMe: $querySuperMe,
                            queryMyCircle: $queryMyCircle,
                            queryCirclesImIn: $queryCirclesImIn,
                            querySubAccount: $querySubAccount,
                            queryPublicCircle: $queryPublicCircle,
                            queryOtherTeamsCircles: $queryOtherTeamsCircles,
                            queryCircle: $queryCircle,
                        )
                    }
                }
            `}
            prepareVariables={params => ({
                ...params,
                querySuperMe: false,
                queryMyCircle: false,
                queryCirclesImIn: false,
                querySubAccount: false,
                queryPublicCircle: false,
                queryOtherTeamsCircles: false,
                queryCircle: false
            })}
        />
        <Route
            path="/my-circles/edit-payment-info/:paymentModelId"
            Component={MyCircles}
            query={graphql`
                query router_MyCirclesEditPayment_Query (
                    $circleId: ID
                    $querySuperMe: Boolean!
                    $queryMyCircle: Boolean!
                    $queryCirclesImIn: Boolean!
                    $querySubAccount: Boolean!
                    $queryPublicCircle: Boolean!
                    $queryOtherTeamsCircles: Boolean!
                    $queryCircle: Boolean!
                ){
                    viewer {
                        ...MyCircles_viewer @arguments (
                            circleId: $circleId
                            querySuperMe: $querySuperMe,
                            queryMyCircle: $queryMyCircle,
                            queryCirclesImIn: $queryCirclesImIn,
                            querySubAccount: $querySubAccount,
                            queryPublicCircle: $queryPublicCircle,
                            queryOtherTeamsCircles: $queryOtherTeamsCircles,
                            queryCircle: $queryCircle,
                        )
                    }
                }
            `}
            prepareVariables={params => ({
                ...params,
                querySuperMe: false,
                queryMyCircle: false,
                queryCirclesImIn: false,
                querySubAccount: false,
                queryPublicCircle: false,
                queryOtherTeamsCircles: false,
                queryCircle: false
            })}
        />
        <Route
            path="/my-circles/payment-model-details/:paymentModelId"
            Component={MyCircles}
            query={graphql`
                query router_MyCirclesPaymentModelDetails_Query (
                    $circleId: ID
                    $paymentModelId: ID
                    $querySuperMe: Boolean!
                    $queryMyCircle: Boolean!
                    $queryCirclesImIn: Boolean!
                    $querySubAccount: Boolean!
                    $queryPublicCircle: Boolean!
                    $queryOtherTeamsCircles: Boolean!
                    $queryCircle: Boolean!
                ){
                    viewer {
                        ...MyCircles_viewer @arguments (
                            circleId: $circleId
                            paymentModelId: $paymentModelId
                            querySuperMe: $querySuperMe,
                            queryMyCircle: $queryMyCircle,
                            queryCirclesImIn: $queryCirclesImIn,
                            querySubAccount: $querySubAccount,
                            queryPublicCircle: $queryPublicCircle,
                            queryOtherTeamsCircles: $queryOtherTeamsCircles,
                            queryCircle: $queryCircle,
                        )
                    }
                }
            `}
            prepareVariables={params => ({
                ...params,
                querySuperMe: false,
                queryMyCircle: false,
                queryCirclesImIn: false,
                querySubAccount: false,
                queryPublicCircle: false,
                queryOtherTeamsCircles: false,
                queryCircle: false
            })}
        />
        <Route
            path="/my-circles/terms-of-uses"
            Component={MyCircles}
            query={graphql`
                query router_MyCirclesTermsOfUses_Query (
                    $circleId: ID
                    $querySuperMe: Boolean!
                    $queryMyCircle: Boolean!
                    $queryCirclesImIn: Boolean!
                    $querySubAccount: Boolean!
                    $queryPublicCircle: Boolean!
                    $queryOtherTeamsCircles: Boolean!
                    $queryCircle: Boolean!
                ){
                    viewer {
                        ...MyCircles_viewer @arguments (
                            circleId: $circleId
                            querySuperMe: $querySuperMe,
                            queryMyCircle: $queryMyCircle,
                            queryCirclesImIn: $queryCirclesImIn,
                            querySubAccount: $querySubAccount,
                            queryPublicCircle: $queryPublicCircle,
                            queryOtherTeamsCircles: $queryOtherTeamsCircles,
                            queryCircle: $queryCircle,
                        )
                    }
                }
            `}
            prepareVariables={params => ({
                ...params,
                querySuperMe: false,
                queryMyCircle: false,
                queryCirclesImIn: false,
                querySubAccount: false,
                queryPublicCircle: false,
                queryOtherTeamsCircles: false,
                queryCircle: false
            })}
        />
        <Route
            path="/add-group"
            Component={AddGroup}
        />
        <Route
            path="/find-circles"
            Component={MyCircles}
            query={graphql`
                query router_FindCircles_Query (
                    $circleId: ID
                    $querySuperMe: Boolean!
                    $queryMyCircle: Boolean!
                    $queryCirclesImIn: Boolean!
                    $querySubAccount: Boolean!
                    $queryPublicCircle: Boolean!
                    $queryOtherTeamsCircles: Boolean!
                    $queryCircle: Boolean!
                ){
                    viewer {
                        ...MyCircles_viewer @arguments (
                            circleId: $circleId
                            querySuperMe: $querySuperMe,
                            queryMyCircle: $queryMyCircle,
                            queryCirclesImIn: $queryCirclesImIn,
                            querySubAccount: $querySubAccount,
                            queryPublicCircle: $queryPublicCircle,
                            queryOtherTeamsCircles: $queryOtherTeamsCircles,
                            queryCircle: $queryCircle,
                        )
                    }
                }
            `}
            prepareVariables={params => ({
                ...params,
                querySuperMe: false,
                queryMyCircle: false,
                queryCirclesImIn: false,
                querySubAccount: false,
                queryPublicCircle: false,
                queryOtherTeamsCircles: false,
                queryCircle: false
            })}
        />
        <Route
            path="/new-sportunity"
            Component={NewSportunity}
            query={graphql`
                query router_NewSportunity_Query {
                    viewer {
                        ...NewSportunity_viewer
                    }
                }
            `}
            prepareVariables={params => ({
                ...params,
            })}
        />
        <Route
            path="/new-timeslot"
            Component={NewTimeSlot}
            query={graphql`
                query router_NewTimeslot_Query {
                    viewer {
                        ...NewTimeslot_viewer
                    }
                }
            `}
            prepareVariables={params => ({
                ...params,
            })}
        />
        <Route
            path="/datasheet-sportunities"
            Component={DatasheetSportunities}
            query={graphql`
                query router_DatasheetSportunities_Query {
                    viewer {
                        ...DatasheetSportunities_viewer
                    }
                }
            `}
            prepareVariables={params => ({
                ...params,
            })}
        />
        <Route
            path="/event-edit/:sportunityId"
            Component={NewSportunity}
            query={graphql`
                query router_EventEdit_Query (
                    $sportunityId: ID,
                    $querySuperMe: Boolean!,
                    $queryDetails: Boolean!
                ) {
                    viewer {
                        ...NewSportunity_viewer @arguments(
                            sportunityId: $sportunityId,
                            querySuperMe: $querySuperMe,
                            querDetails: $queryDetails
                        )
                    }
                }
            `}
            prepareVariables={params => ({
                ...params,
                sportunityId: params.sportunityId,
                querySuperMe: false,
                queryDetails: false
            })}
        />
        <Route
            path="/serie-edit/:sportunityId"
            Component={NewSportunity}
            query={graphql`
                query router_SerieEdit_Query (
                    $sportunityId: ID,
                    $querySuperMe: Boolean!,
                    $queryDetails: Boolean!
                ) {
                    viewer {
                        ...NewSportunity_viewer @arguments(
                            sportunityId: $sportunityId,
                            querySuperMe: $querySuperMe,
                            querDetails: $queryDetails
                        )
                    }
                }
            `}
            prepareVariables={params => ({
                ...params,
                sportunityId: params.sportunityId,
                querySuperMe: false,
                queryDetails: false
            })}
        />
        <Route
            path="/event-reorganize/:sportunityId"
            Component={NewSportunity}
            query={graphql`
                query router_EventReorganize_Query (
                    $sportunityId: ID,
                    $querySuperMe: Boolean!,
                    $queryDetails: Boolean!
                ) {
                    viewer {
                        ...NewSportunity_viewer @arguments(
                            sportunityId: $sportunityId,
                            querySuperMe: $querySuperMe,
                            querDetails: $queryDetails
                        )
                    }
                }
            `}
            prepareVariables={params => ({
                ...params,
                sportunityId: params.sportunityId,
                querySuperMe: false,
                queryDetails: false
            })}
        />
        <Route
            path="/public-frame/event/:eventId"
            Component={EmbedEvent}
        />
        <Route
            path="/public-frame/user-events/:userId"
            Component={EmbedUserEvents}
            prepareVariables={params => ({
                ...params,
            })}
        />
        <Route
            path="/public-frame/circle/:circleId"
            Component={EmbedCircle}
        />
        <Route
            path="/public-frame/user-circles/:userId"
            Component={EmbedUserCircles}
            prepareVariables={params => ({
                ...params,
            })}
        />
        <Route
            path="/new-group"
            Component={NewGroup}
            query={graphql`
                  query router_NewGroup_Query {
                      viewer {
                          ...NewGroup_viewer
                      }
                  }
              `}
            prepareVariables={params => ({
                ...params,
            })}
        />
        <Route
            path="/search"
            Component={SearchPage}
            query={graphql`
                  query router_SearchPage_Query (
                    $sportunitiesFilter: Filter
                    $circlesFilter: CirclesFilter
                    $usersFilter: String
                    $doSearch: Boolean!
                  ) {
                      viewer {
                          ...SearchPage_viewer @arguments(
                            sportunitiesFilter: $sportunitiesFilter
                            circlesFilter: $circlesFilter
                            usersFilter: $usersFilter
                            doSearch: $doSearch
                          )
                      }
                  }
              `}
            prepareVariables={(params, { location }) => {
                const { q } = location.query;
                return {
                    q,
                    sportunitiesFilter: { searchByName: q },
                    circlesFilter: { nameCompletion: q },
                    usersFilter: q,
                    doSearch: false,
                    ...params,
                }
            }}
        />

        <Route
            path="/features"
            Component={Features}
        />
    </Route>
)

export const routeConfig = makeRouteConfig(routes);

export const render = createRender({
    renderError: (
        { error }, // eslint-disable-line react/prop-types
    ) => <div>{error.status === 404 ? 'Not found' : 'Error'}</div>,
});
/*
import React, { Component } from 'react';
import { Route, IndexRoute, browserHistory, applyRouterMiddleware, Router } from 'react-router';
import useRelay from 'react-router-relay';
import { Provider } from 'react-redux';
import Radium, {StyleRoot} from 'radium';
import ReactGA from 'react-ga';

import store from './store/store';

import App from './App'
import Home from './components/Home/Home';
//import Clubs from './components/Clubs/Clubs';
import Register from './components/Register/Register.js';

import Logout from './components/Login/Logout.js';
import ChangePassword from './components/ChangePassword/ChangePassword.js';
import ResetPassword from './components/ResetPassword/ResetPassword.js';
import Profile from './components/Profile/Profile.js';
import ProfileView from './components/ProfileView/ProfileView.js';
import NewSportunity from './components/NewSportunity/NewSportunity.js';
import FindSportunity from './components/FindSportunity/FindSportunity.js';
import Venue from './components/Venue/Venue.js';
import VenueView from './components/VenueView/VenueView.js';
import Venues from './components/Venues/Venues.js';
import SportOrganization from './components/SportOrganization/SportOrganization';
import Facility from './components/Facility/Facility.js';
import EventView from './components/EventView/EventView'
import SportunityDetail from './components/SportunityDetail/SportunityDetail.js';
import SportsUpdate from './components/SportsUpdate/SportsUpdate.js';
import MyEvents from './components/MyEvents/MyEvents.js'
import Me from './components/Me/Me.js'
import ManageVenue from './components/ManageVenue/ManageVenue.js'
import LoggedIn from './components/LoggedIn/LoggedIn.js'
import MyCircles from './components/MyCircles/MyCircles.js'
import Circle from './components/Circle/Circle.js'
import MyInfo from './components/MyInfo/MyInfo.js'
import Privacy from './components/Static/Privacy'
import AboutUs from './components/AboutUs/AboutUs'
import Term from './components/Static/Term'
import Contact from './components/Static/Contact'
import FaqCalendarSync from './components/FAQ/CalendarSync/index';
import FaqGoogleCalendarSync from './components/FAQ/CalendarSync/GoogleCalendarSync';
import FaqOutlookCalendarSync from './components/FAQ/CalendarSync/OutlookCalendarSync';
import FaqAppleCalendarSync from './components/FAQ/CalendarSync/AppleCalendarSync';
import FaqHowtoFollowOrganiser from './components/FAQ/UserTutorial/FollowOrganiser';
import FaqHowtoModifyProfile from './components/FAQ/UserTutorial/ModifyProfile';
import TeamTutorial from './components/FAQ/UserTutorial/TeamTutorial';
import Tutorial, { TutorialContent } from './components/FAQ/Tutorial';
import ClubsTutorialShareWithTeammates from './components/FAQ/UserTutorial/Clubs/ShareWithTeammates';
import ManageAClubTutorial from './components/FAQ/UserTutorial/Clubs/ManageAClub'
import ClubsTutorialUseStatistics from './components/FAQ/UserTutorial/Clubs/UseStatistics';
import IndividualOrganizeSportActivities from './components/FAQ/UserTutorial/OrganizeSportActivities';
import CompaniesTutorial from './components/FAQ/UserTutorial/CompaniesTutorial';
import Blog from './components/Blog/Blog';
import VenuesHome from  './components/VenuesHome/VenuesHome';
import CompaniesHome from './components/CompaniesHome/CompaniesHome';
import ClubsHome from  './components/ClubsHome/ClubsHome'
import LoadUrl from './components/common/LoadUrl/LoadUrl';
import Loading from './components/common/Loading/Loading.js'
import Footer from './components/common/Footer/Footer'

import { backendUrlGraphql } from '../constants.json';
import NetworkLayer from './NetworkLayer';
import RelayStore, {
  updateGlobalToken,
  updateSuperToken,
  updateUserToken
} from './RelayStore';

const ViewerQueries = {
  viewer: () => Relay.QL`query { viewer }`,
};

ReactGA.initialize('UA-86793644-1');

// export const routes = [
//     {
//         path: '/',
//         component: App,
//         indexRoute: {
//             component: Home,
//             queries: ViewerQueries,
//         },
//         childRoutes: [
//             {
//                 path: 'register',
//                 component: Register,
//                 queries: ViewerQueries,
//             },
//             {
//                 path: 'login',
//                 component: Login,
//                 queries: ViewerQueries
//             },
//             {
//                 path:'logged-in',
//                 component: LoggedIn,
//                 queries: ViewerQueries
//             }
//         ],
//     },
// ];
*/
