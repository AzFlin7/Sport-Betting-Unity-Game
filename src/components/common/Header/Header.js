import React, { Component } from 'react';
import { createFragmentContainer, graphql, QueryRenderer } from 'react-relay';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'found';
import { bindActionCreators } from 'redux';
import Radium from 'radium';
import { connect } from 'react-redux';
import isEqual from 'lodash/isEqual';
import { Button } from '@material-ui/core';
import { FacebookProvider, CustomChat } from 'react-facebook'

import { styles } from './styles';
import AuthorizedContent from './AuthorizedContent';
import UnauthorizedContent from './UnauthorizedContent';
import ProgressBar from '../ProgressBar';
import StepperModal from '../../common/StepperModal';
import UpdateUserTutorialStepsMutation from '../../common/StepperModal/UpdateUserTutorialStepsMutation'
import CreateEventOptionsModal from '../CreateEventOptionsModal';
import { confirmModal } from '../../common/ConfirmationModal';

import environment from 'sportunity/src/createRelayEnvironment';
import * as types from '../../../actions/actionTypes';
import constants from '../../../../constants.json';
import localizations from '../../Localizations';

const propTypes = {
  viewer: PropTypes.object.isRequired,
  user: PropTypes.oneOfType([PropTypes.object]),
};

class Header extends Component {
  constructor(props) {
    super(props);
    this.state= {
      displayStepperModal: true,
      forceStepperOpen: false,
    }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const { viewer, user } = this.props;
    if (viewer && user) {
      if (!isEqual(this.props.tutorialSteps, nextProps.tutorialSteps)) {
        this.setState({ displayStepperModal: true })
      }
    }

    if (!isEqual(viewer,nextProps.viewer)){
      this.props._updateStepsCompleted({
        createFormStep: false,
        setupMembersSubscriptionStep: false,
        fulfilProfileStep: false,
        addOfficialDocumentsStep: false,
        createSubAccountStep: false,
        shareAccessStep: false,
        createCircleStep: false,
        organizeStep: false,
        setupStatisticsStep: false,
        joinAPrivateCircleStep: false,
        joinAPublicCircleStep: false,
        giveAvailabilitiesStep: false,
        bookSportunityStep: false
      });
      this.setState({ displayStepperModal: true })
    }
  }

  componentDidMount() {
    if (
      this.props.location.pathname === '/' &&
      this.props.user &&
      this.props.user.id &&
      !this.props.isWebSiteOpened
    ) {
        this.props.router.push(`/my-events`);
        this.setState({ displayStepperModal: true })
      }
  }

  showStepperModal = () => {
    this.setState({
      displayStepperModal: true,
      forceStepperOpen: true,
    })
  }

  closeStepperModal = () => {
    this.setState({
      displayStepperModal: false,
      forceStepperOpen: false
    })
  }

  hideStepperTutorial = () => {
    confirmModal({
      title: localizations.stepper_hide_confirm_title,
      message: localizations.stepper_hide_confirm,
      confirmLabel: localizations.manageVenue_confirm_yes,
      cancelLabel: localizations.manageVenue_confirm_no,
      canCloseModal: true,
      onConfirm: this.validateAllSteps,
      onCancel: () => {}
    });
  }

  validateAllSteps = () => {
    let tutorialVar = {
      createFormStep: true,
      setupMembersSubscriptionStep: true,
      fulfilProfileStep: true,
      addOfficialDocumentsStep: true,
      createSubAccountStep: true,
      shareAccessStep: true,
      createCircleStep: true,
      organizeStep: true,
      setupStatisticsStep: true,
      joinAPrivateCircleStep: true,
      joinAPublicCircleStep: true,
      giveAvailabilitiesStep: true,
      bookSportunityStep: true
    }
    UpdateUserTutorialStepsMutation.commit({
        userIDVar: this.props.user.id,
        tutorialVar: tutorialVar,
      },
      {
        onFailure: error => {
          const errors = JSON.parse(error.getError().source);
          console.log(errors);
        },
        onSuccess: response => {
          this.closeStepperModal()
          this.props._updateStepsPercentage(100)
        },
      },
    );
  }

  render() {
    const { viewer, user } = this.props;

    return (
      <div style={{display: 'flex', flexDirection: 'column'}}>
        {viewer && user && this.props.stepsPercentage !== 100 &&
          <div style={{display: 'flex', flexDirection: 'row', background: '#f2f2f2', alignItems: 'center'}}>
              <div style={{display: 'flex', flex: '6 6 0', padding: 10, justifyContent: 'center'}}>
                <ProgressBar percentage={this.props.stepsPercentage} nextStepText={this.props.nextStepToDo} language={this.props.language} hideStepperTutorial={this.hideStepperTutorial}/>
              </div>
              <div style={{flex: '1 1 0', padding: 10}}>
                <Button style={styles.button} onClick={this.showStepperModal}>
                  {localizations.stepper_modal_header_show_stepper}
                </Button>
              </div>
          </div>
        }
        {!user && 
          <div style={{'@media (max-width: 600px)': {display: 'none'}}}>
            <FacebookProvider 
              appId='1759806787601548'
              language={localizations.getLanguage()}
            >
              <CustomChat 
                pageId="1785262331755411"
                minimized="true"
              /> 
            </FacebookProvider>
          </div>
        }
                
        {viewer && user && this.state.displayStepperModal &&
          <StepperModal
            viewer={viewer}
            isOpen={this.state.displayStepperModal}
            forceOpen={this.state.forceStepperOpen}
            canCloseModal={true}
            onClose={this.closeStepperModal}
            showStepperModal={this.showStepperModal}
            router={this.props.router}
            onOrganizeClick={() => { this.setState({ displayStepperModal: false }, () => { this.setState({ showOrganizeModal: true }) }) }}
          />
        }
        {viewer && user && this.state.showOrganizeModal &&
          <CreateEventOptionsModal
            isOpen={this.state.showOrganizeModal}
            onClose={() => { this.setState({ showOrganizeModal: false }) }}
            router={this.props.router}
          />
        }
        <div style={user ? styles.loggedInContainer : styles.container}>
          <div style={user ? styles.loggedInLogo : styles.logo}>
            <Link to="/" style={styles.logoLink}>
              <img
                src="/images/logo@3x.png"
                alt="Sportunity.com"
                style={styles.logoImg}
                title="Sportunity.com"
              />
            </Link>
          </div>
          {viewer && (
            user
            ? <AuthorizedContent
                user={this.props.user}
                viewer={viewer}
                {...this.props}
              />
            : <UnauthorizedContent {...this.props} viewer={viewer} />
            )
          }
        </div>
        <div style={styles.download_icons}>
          <span style={styles.download_icons_text}>
            {localizations.home_download_app_text}
          </span>
          <div id='divF'
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexDirection: 'row',
              marginTop: 7,
            }}
          >
            <div style={styles.col5}>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={constants.appLinkAppStore}
              >
                <img
                  style={styles.iconImage}
                  src="/images/icon_appstore.png"
                  alt="icon_appstore"
                />
              </a>
            </div>
            <div style={styles.col5}>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={constants.appLinkPlayStore}
              >
                <img
                  style={styles.iconImage}
                  src="/images/icon_playstore.png"
                  alt="png"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const updateOpenedWebSite = value => ({
  type: types.GLOBAL_SET_SITE_OPENED,
  value,
});

const _updateStepsCompleted = (steps) => ({
  type: types.UPDATE_STEPS_COMPLETED,
  tutorialSteps: steps,
});

const _updateStepsPercentage = (percentage) => ({
  type: types.UPDATE_STEPS_PERCENTAGE,
  stepsPercentage: percentage,
});

const dispatchToProps = dispatch => ({
  _updateOpenedWebSite: bindActionCreators(updateOpenedWebSite, dispatch),
  _updateStepsCompleted: bindActionCreators(_updateStepsCompleted, dispatch),
  _updateStepsPercentage: bindActionCreators(_updateStepsPercentage, dispatch)
});

Header.propTypes = propTypes;

const ReduxContainer = connect(
  ({ found: { resolvedMatch },  globalReducer, profileReducer }) => ({
    location: resolvedMatch.location,
    params: resolvedMatch.params,
    isWebSiteOpened: globalReducer.isWebSiteOpened,
    tutorialSteps: profileReducer.tutorialSteps,
    stepsPercentage: profileReducer.stepsPercentage,
    nextStepToDo: profileReducer.nextStepToDo,
    language: globalReducer.language
  }),
  dispatchToProps,
)(Radium(Header));

const HeaderTemp = createFragmentContainer(withRouter(ReduxContainer), {
  viewer: graphql`
    fragment Header_viewer on Viewer @argumentDefinitions(
        filter: { type: "Filter" }){
      id
      ...StepperModal_viewer
      ...AuthorizedContent_viewer
      ...Search_viewer
    }
  `,
  user: graphql`
    fragment Header_user on User {
      id
      homePagePreference
      ...AuthorizedContent_user
    }
  `,
});



export default class extends Component {
  render() {
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query HeaderQuery {
            viewer {
              ...Header_viewer
              me {
                id
                ...Header_user
              }
            }
          }
        `}
        variables={{}}
        render={({error, props}) => {
          if (props) {
            return <HeaderTemp query={props} viewer={props.viewer} user={props.viewer.me} {...this.props}/>;
          } else {
            return (
              <div style={{...styles.container, height: 62}}></div>
            )
          }
        }}
      />
    )
  }
}
