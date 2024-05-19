import React from 'react'
import Modal from 'react-modal'
import Radium, {StyleRoot} from 'radium'
import List from '@material-ui/core/List'
import { createFragmentContainer, graphql } from 'react-relay';
import ListItem from '@material-ui/core/ListItem'
import { withAlert } from 'react-alert'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import cloneDeep from 'lodash/cloneDeep';
import { isEqual } from 'lodash';

import { fonts, colors } from '../../../theme'
import ProgressBar from '../ProgressBar'
import localizations from '../../Localizations'
import * as types from '../../../actions/actionTypes';
import UpdateUserTutorialStepsMutation from './UpdateUserTutorialStepsMutation'
import UpdateUserProfileTypeMutation from '../../MyInfo/UpdateUserProfileTypeMutation';
import ClubSteps from './ClubSteps'
import PersonSteps from './PersonSteps'
import CompanySteps from './CompanySteps'
import { confirmModal } from '../../common/ConfirmationModal';

import styles from './styles';

let  modalStyles, cantCloseModalStyles;
let profileType = [];
profileType["PERSON"] = localizations.info_access_rights_user_type_person;
profileType["BUSINESS"] = localizations.info_access_rights_user_type_business;
profileType["ORGANIZATION"] = localizations.info_access_rights_user_type_organization;
profileType["SOLETRADER"] = localizations.info_access_rights_user_type_soletrader;

class StepperModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      profileType: props.viewer.me.profileType
    }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.viewer.me.profileType !== this.state.profileType)
      this.setState({
        profileType: nextProps.viewer.me.profileType
      })
  }

  componentDidMount() {
    Modal.setAppElement('#root');
    window.addEventListener('click', this._handleClickOutside);
    if (this.props.isOpen)
      setTimeout(() => {this.setState({open: true})}, 50)

    let percentage = this._checkAndUpdateSteps();
    if (percentage === 100)
      setTimeout(() => this._closeModal(), 55)
  }

  componentWillUnmount() {
    window.removeEventListener('click', this._handleClickOutside);
  }

  _checkAndUpdateSteps = () => {
    const { viewer, user, tutorialSteps } = this.props;
    let newTutorialSteps = cloneDeep(tutorialSteps);

    if (viewer && viewer.me && viewer.me.tutorialSteps) {
      if (this.state.profileType === "PERSON") {
        if (viewer.me.tutorialSteps.joinAPrivateCircleStep)
          newTutorialSteps['joinAPrivateCircleStep'] = true;
        if (viewer.me.tutorialSteps.joinAPublicCircleStep)
          newTutorialSteps['joinAPublicCircleStep'] = true;
        if (viewer.me.tutorialSteps.giveAvailabilitiesStep)
          newTutorialSteps['giveAvailabilitiesStep'] = true;
        if (viewer.me.tutorialSteps.fulfilProfileStep || viewer.me.isPublicProfileComplete)
          newTutorialSteps['fulfilProfileStep'] = true;
        if (viewer.me.tutorialSteps.createSubAccountStep || viewer.me.isSubAccount)
          newTutorialSteps['createSubAccountStep'] = true;
        if (viewer.me.tutorialSteps.createCircleStep)
          newTutorialSteps['createCircleStep'] = true;
        if (viewer.me.tutorialSteps.organizeStep)
          newTutorialSteps['organizeStep'] = true;

      } else if (this.state.profileType === "BUSINESS"
        || this.state.profileType === "ORGANIZATION"
        || this.state.profileType === "SOLETRADER") {
        if (viewer.me.tutorialSteps.createSubAccountStep || viewer.me.isSubAccount)
          newTutorialSteps['createSubAccountStep'] = true;
        if (viewer.me.tutorialSteps.shareAccessStep)
          newTutorialSteps['shareAccessStep'] = true;
        if (viewer.me.tutorialSteps.createCircleStep)
          newTutorialSteps['createCircleStep'] = true;
        if (viewer.me.tutorialSteps.organizeStep)
          newTutorialSteps['organizeStep'] = true;
        if (viewer.me.tutorialSteps.setupStatisticsStep)
          newTutorialSteps['setupStatisticsStep'] = true;
        if (viewer.me.tutorialSteps.createFormStep)
          newTutorialSteps['createFormStep'] = true;
        if (viewer.me.tutorialSteps.setupMembersSubscriptionStep)
          newTutorialSteps['setupMembersSubscriptionStep'] = true;
        if (viewer.me.tutorialSteps.addOfficialDocumentsStep)
          newTutorialSteps['addOfficialDocumentsStep'] = true;
      }
    }

    if(!isEqual(newTutorialSteps, tutorialSteps)) {
      this.props._updateStepsCompleted(newTutorialSteps);

    }
    if (!isEqual(newTutorialSteps, viewer.me.tutorialSteps)){
      this._updateStepsStatus(newTutorialSteps)
    }

    let percentage = this._calculatePercentage(newTutorialSteps, this.state.profileType);
    return percentage;
  }

  hideStepperTutorial = () => {
    confirmModal({
      title: localizations.stepper_hide_confirm_title,
      message: localizations.stepper_hide_confirm,
      confirmLabel: localizations.manageVenue_confirm_yes,
      cancelLabel: localizations.manageVenue_confirm_no,
      canCloseModal: true,
      onConfirm: this.validateAllSteps,
      closeModal: () => {setTimeout(() => {this.props.showStepperModal() ; this.setState({open: true})}, 20)},
      onCancel: () => {setTimeout(() => {this.props.showStepperModal() ; this.setState({open: true})}, 20)}
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
        userIDVar: this.props.viewer.me.id,
        tutorialVar: tutorialVar,
      },
      {
        onFailure: error => {
          const errors = JSON.parse(error.getError().source);
          console.log(errors);
        },
        onSuccess: response => {
          this.props._updateStepsPercentage(100)
          setTimeout(() => {this.props.onClose() ; this.setState({open: false})}, 200)
        },
      },
    );
  }

  _updateStepsStatus = newTutorialSteps => {
    let tutorialVar = {
      createFormStep: newTutorialSteps['createFormStep'],
      setupMembersSubscriptionStep: newTutorialSteps['setupMembersSubscriptionStep'],
      fulfilProfileStep: newTutorialSteps['fulfilProfileStep'],
      addOfficialDocumentsStep: newTutorialSteps['addOfficialDocumentsStep'],
      createSubAccountStep: newTutorialSteps['createSubAccountStep'],
      shareAccessStep: newTutorialSteps['shareAccessStep'],
      createCircleStep: newTutorialSteps['createCircleStep'],
      organizeStep: newTutorialSteps['organizeStep'],
      setupStatisticsStep: newTutorialSteps['setupStatisticsStep'],
      joinAPrivateCircleStep: newTutorialSteps['joinAPrivateCircleStep'],
      joinAPublicCircleStep: newTutorialSteps['joinAPublicCircleStep'],
      giveAvailabilitiesStep: newTutorialSteps['giveAvailabilitiesStep'],
      bookSportunityStep: newTutorialSteps['bookSportunityStep']
    }
    UpdateUserTutorialStepsMutation.commit({
        userIDVar: this.props.viewer.me.id,
        tutorialVar: tutorialVar,
      },
      {
        onFailure: error => {
          const errors = JSON.parse(error.getError().source);
          console.log(errors);
        },
        onSuccess: response => {
          console.log('step status changed');
          //this._calculatePercentage(newTutorialSteps, this.props.viewer.me.profileType);
        },
      },
    );
  }

  _handleSkipStep = step => {
    const { viewer, tutorialSteps } = this.props;
    let newTutorialSteps = cloneDeep(tutorialSteps);
    newTutorialSteps[step] = true;
    this.props._updateStepsCompleted(newTutorialSteps);
    this._updateStepsStatus(newTutorialSteps);
    this._calculatePercentage(newTutorialSteps, this.state.profileType)
  }

  _handleCloseRequest = () => {
    if (this.props.canCloseModal)
      this._closeModal()
  }

  _handleClickOutside = event => {
    if (!this._containerNode.contains(event.target) && this.props.canCloseModal) {
      this._closeModal()
    }
  }

  _closeModal = () => {
    this.setState({ open: false });
    this.props.onClose()
  }

  _calculatePercentage = (steps, profileType) => {
    let count = 0;
    const { isSubAccount } = this.props.viewer.me;
    
    if (profileType === "PERSON") {
      count = (steps.joinAPrivateCircleStep & 1)
        + (steps.joinAPublicCircleStep & 1)
        + (steps.giveAvailabilitiesStep & 1)
        + (steps.fulfilProfileStep & 1)
        + (isSubAccount ? 0 : steps.createSubAccountStep & 1)
        + (steps.createCircleStep & 1)
        + (steps.organizeStep & 1);


      let nextStepToDo = !steps.joinAPrivateCircleStep ? "stepper_modal_person_join_private_group"
        : !steps.joinAPublicCircleStep ? "stepper_modal_person_join_public_group"
          : !steps.giveAvailabilitiesStep ? "stepper_modal_person_availability"
            : !steps.fulfilProfileStep ? "stepper_modal_person_profile"
              : !steps.createSubAccountStep ? "stepper_modal_person_kids_profile"
                : !steps.createCircleStep ? "stepper_modal_person_create_group"
                  : !steps.organizeStep ? "stepper_modal_person_organize_activity" :'';

      let percentage =  Math.round(count * (isSubAccount ? (100/6) : (100/7)));
      this.props._updateStepsPercentage(percentage);
      this.props._updateNextStepToDo(nextStepToDo);
      return percentage;
    } 
    else if (profileType === "BUSINESS" || "ORGANIZATION" || "SOLETRADER") {
      count = + (isSubAccount ? 0 : steps.createSubAccountStep & 1)
        + (steps.shareAccessStep & 1)
        + (steps.createCircleStep & 1)
        + (steps.organizeStep & 1)
        + (steps.setupStatisticsStep & 1)
        + (steps.createFormStep & 1)
        + (steps.setupMembersSubscriptionStep & 1)
        + (steps.addOfficialDocumentsStep & 1);

      let nextStepToDo = !steps.createSubAccountStep ?
        (profileType === "BUSINESS"
          ? "stepper_modal_company_create_teams"
          : "stepper_modal_club_create_teams")
        : !steps.shareAccessStep ?
          (profileType === "BUSINESS"
            ? "stepper_modal_company_give_access"
            : "stepper_modal_club_give_access")
          : !steps.createCircleStep ?
            (profileType === "BUSINESS"
              ? "stepper_modal_company_create_group"
              : "stepper_modal_club_create_group")
            : !steps.organizeStep ?
              (profileType === "BUSINESS"
                ? "stepper_modal_company_organize_activity"
                : "stepper_modal_club_organize_activity")
              : !steps.setupStatisticsStep ?
                (profileType === "BUSINESS"
                  ? "stepper_modal_company_stats"
                  : "stepper_modal_club_stats")
                : !steps.createFormStep ?
                  (profileType === "BUSINESS"
                    ? "stepper_modal_company_form"
                    : "stepper_modal_club_form")
                  : !steps.setupMembersSubscriptionStep ?
                    (profileType === "BUSINESS"
                      ? "stepper_modal_company_subscription"
                      : "stepper_modal_club_subscription")
                    : !steps.addOfficialDocumentsStep ?
                      (profileType === "BUSINESS"
                        ? "stepper_modal_company_documents"
                        : "stepper_modal_club_documents")
                      : "stepper_modal_completed";

      let percentage = Math.round(count * (isSubAccount ? (100/7) : (100/8)));
      this.props._updateStepsPercentage(percentage);
      this.props._updateNextStepToDo(nextStepToDo);
      return percentage;
    }
  }


  _handleProfileTypeChange = e => {

    if (e && e.target && e.target.value) {
      let profileType = e.target.value;
      this.setState({
        isSaving: true,
      })
      UpdateUserProfileTypeMutation.commit({
          userIDVar: this.props.viewer.me.id,
          profileTypeVar: profileType
        }, {
          onFailure: error => {
            this.props.alert.show(localizations.popup_editMyInfo_update_falied, {
              timeout: 2000,
              type: 'error',
            });
            this.setState({
              isSaving: false,
              profileType: this.props.viewer.me.profileType
            })
          },
          onSuccess: response => {
            this.props.alert.show(localizations.popup_editMyInfo_update_sucess, {
              timeout: 2000,
              type: 'success',
            });
            this.setState({
              isSaving: false,
              profileType: profileType
            })
            this._clearSteps();
            this._checkAndUpdateSteps();
          }
        }
      )
    }
  }

  _clearSteps = () => {
    let clearTutorialSteps = {
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
    }
    this._updateStepsStatus(clearTutorialSteps)
    this.props._updateStepsCompleted(clearTutorialSteps);
  }

  render() {
    const { me } = this.props.viewer;
    let { tutorialSteps, stepsPercentage, nextStepToDo } = this.props;

    return (
      <StyleRoot>
        <Modal
          isOpen={this.state.open && !!this.state.profileType}
          onRequestClose={this._handleCloseRequest}
          style={modalStyles}
          contentLabel={this.props.title}
        >
          <div style={styles.modalContent} ref={node => { this._containerNode = node; }}>
            <div style={styles.modalHeader}>
              <div style={{display: 'flex', flex:'1 1 0', flexDirection: 'column'}}>
                <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                  <div
                    style={{
                      ...styles.iconImage,
                      backgroundImage: me.avatar
                        ? `url(${me.avatar})`
                        : 'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")',
                    }}
                  />
                </div>
                <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                  <div style={styles.label}>
                    {me.pseudo}
                  </div>
                </div>
              </div>
              <div style={{display: 'flex', flexDirection: 'column', flex: '6 1 0', justifyContent: 'center', alignItems: 'center'}}>
                <ProgressBar percentage={stepsPercentage} nextStepText={nextStepToDo} hideStepperTutorial={this.hideStepperTutorial}/>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <div style={styles.stepDescription}>
                    {localizations.stepper_modal_change_profile}
                  </div>
                  <div style={styles.profileType}>
                    <select
                      style={(me.mangoId || (me.subAccounts && me.subAccounts.length > 0) || me.isSubAccount)
                        ? styles.selectInputDisabled
                        : styles.selectInput
                      }
                      onChange={this._handleProfileTypeChange}
                      value={this.state.profileType}
                      required={true}
                      disabled={me.mangoId || (me.subAccounts && me.subAccounts.length > 0) || me.isSubAccount || me.isPublicProfileComplete || stepsPercentage > 0}
                    >
                      <option value=''>{localizations.register_user_type_none}</option>
                      <option value="PERSON">{localizations.info_access_rights_user_type_person}</option>
                      <option value="BUSINESS">{localizations.info_access_rights_user_type_business}</option>
                      <option value="ORGANIZATION">{localizations.info_access_rights_user_type_organization}</option>
                      <option value="SOLETRADER">{localizations.info_access_rights_user_type_soletrader}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div>
              {(this.state.profileType === "ORGANIZATION" || this.state.profileType === "SOLETRADER") &&
              <ClubSteps
                user={me}
                tutorialSteps={tutorialSteps}
                onSkipStep={this._handleSkipStep}
                onClose={this._closeModal}
                router={this.props.router}
              />
              }
              {this.state.profileType === "PERSON" &&
              <PersonSteps
                user={me}
                tutorialSteps={tutorialSteps}
                onSkipStep={this._handleSkipStep}
                onClose={this._closeModal}mo
                router={this.props.router}
              />
              }
              {this.state.profileType === "BUSINESS" &&
              <CompanySteps
                user={me}
                tutorialSteps={tutorialSteps}
                onSkipStep={this._handleSkipStep}
                onClose={this._closeModal}
                router={this.props.router}
              />
              }
            </div>
          </div>

        </Modal>
      </StyleRoot>
    )
  }
}

modalStyles = {
  overlay : {
    position          : 'fixed',
    top               : 0,
    left              : 0,
    right             : 0,
    bottom            : 0,
    zIndex            : 101
    //backgroundColor   : 'rgba(255, 255, 255, 0.75)',
  },
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    border                     : '1px solid #ccc',
    background                 : '#f2f2f2',
    overflow                   : 'auto',
    WebkitOverflowScrolling    : 'touch',
    borderRadius               : '4px',
    outline                    : 'none',
    padding                    : 0,
    minWidth             : '55%',
    maxWidth             : '95%',
    maxHeight             : '95%',
  },
}

cantCloseModalStyles = {
  overlay : {
    position          : 'fixed',
    top               : 0,
    left              : 0,
    right             : 0,
    bottom            : 0,
    backgroundColor   : 'rgba(255, 255, 255, 0.9)',
  },
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    border                     : '1px solid #ccc',
    background                 : colors.lightGray,
    WebkitOverflowScrolling    : 'touch',
    borderRadius               : '4px',
    outline                    : 'none',
    overflowY: 'visible',

  },
}

const _updateStepsCompleted = (steps) => ({
  type: types.UPDATE_STEPS_COMPLETED,
  tutorialSteps: steps,
});

const _updateStepsPercentage = (percentage) => ({
  type: types.UPDATE_STEPS_PERCENTAGE,
  stepsPercentage: percentage,
});

const _updateNextStepToDo = (stepText) => ({
  type: types.UPDATE_NEXT_STEP_TO_DO,
  nextStepToDo: stepText,
});

const dispatchToProps = (dispatch) => ({
  _updateStepsCompleted: bindActionCreators(_updateStepsCompleted, dispatch),
  _updateStepsPercentage: bindActionCreators(_updateStepsPercentage, dispatch),
  _updateNextStepToDo: bindActionCreators(_updateNextStepToDo, dispatch)
});

const stateToProps = (state) => ({
  tutorialSteps: state.profileReducer.tutorialSteps,
  stepsPercentage: state.profileReducer.stepsPercentage,
  nextStepToDo: state.profileReducer.nextStepToDo

});

const ReduxContainer = connect(
  stateToProps,
  dispatchToProps,
)(StepperModal);

export default createFragmentContainer(withAlert(Radium(ReduxContainer)), {
  viewer: graphql`
      fragment StepperModal_viewer on Viewer {
          id
          me {
              id
              avatar
              pseudo
              profileType
              mangoId
              subAccounts {
                  id
              }
              tutorialSteps {
                  createFormStep
                  setupMembersSubscriptionStep
                  fulfilProfileStep
                  addOfficialDocumentsStep
                  createSubAccountStep
                  shareAccessStep
                  createCircleStep
                  organizeStep
                  setupStatisticsStep
                  joinAPrivateCircleStep
                  joinAPublicCircleStep
                  giveAvailabilitiesStep
                  bookSportunityStep
              }
              isPublicProfileComplete
              isSubAccount
          }
      }
  `,
});