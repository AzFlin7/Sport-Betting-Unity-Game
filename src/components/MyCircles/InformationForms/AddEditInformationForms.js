import React from 'react'
import {
    createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium';
import { withAlert } from 'react-alert'
import { withRouter } from 'found'
import { colors, fonts, metrics } from '../../../theme'
import localizations from '../../Localizations'
import InformationForm from './InformationForm';
import UpdateFormMutation from './UpdateFormMutation';
import DeleteFormMutation from './DeleteFormMutation';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import cloneDeep from 'lodash/cloneDeep';
import * as types from '../../../actions/actionTypes';

let styles
let modalStyles

class AddEditInformationForms extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            deleteFormModalOpen: false,
            formToDelete: null,
            formToEdit: null,
            formChanged: false,
            goBackConfirmModalOpen: false
        }
    }

    componentDidMount = () => {
        this.props.relay.refetch(fragmentVariables => ({
            queryAddEditInformationForms: true
        }))
    }

    _handleSaveNewForm = (form) => {
        const {viewer, user} = this.props ;
        let customFieldIds = [];
        /**TODO save customFields
         * form.customFields.map(customField => {
         *      //Call AddCustomFieldMutation
         *      //id = AddCustomFieldMutation.commit({...})
         *      //customFieldIds.push(id)
         *  }
         */
        UpdateFormMutation.commit({
                viewer,
                user,
                nameVar: form.name, 
                circleIdsVar: form.circles, 
                askedInformationVar : form.askedInformation,
                customFieldsIdsVar : form.customFields
            },
            {
            onFailure: error => {
                this.props.alert.show(localizations.popup_editCircle_update_failed, {
                    timeout: 2000,
                    type: 'error',
                });
                let errors = JSON.parse(error.getError().source);
                console.log(errors);
                
            },
            onSuccess: (response) => {
                this.props.alert.show(localizations.popup_editCircle_update_success, {
                    timeout: 2000,
                    type: 'success',
                });
                this._updateTutorialSteps();
                this._navigateToMyForms();
            },
            }
        )
    }

    _updateTutorialSteps = () => {
        const { tutorialSteps } = this.props;
        let newTutorialSteps = cloneDeep(tutorialSteps);

        newTutorialSteps['createFormStep'] = true;
        this.props._updateStepsCompleted(newTutorialSteps);
    }

    _handleSaveEditForm = (form) => {
        const viewer = this.props.viewer ;
        UpdateFormMutation.commit({
                viewer,
                idVar: form.id, 
                nameVar: form.name, 
                circleIdsVar: form.circles, 
                askedInformationVar : form.askedInformation
            },
            {
            onFailure: error => {
                this.props.alert.show(localizations.popup_editCircle_update_failed, {
                    timeout: 2000,
                    type: 'error',
                });
                let errors = JSON.parse(error.getError().source);
                console.log(errors);
                
            },
            onSuccess: (response) => {
                this.props.alert.show(localizations.popup_editCircle_update_success, {
                    timeout: 2000,
                    type: 'success',
                });
                this._navigateToMyForms();
            },
            }
        )
    }

    _closeModal = () => {
        this.setState({
            goBackConfirmModalOpen: false
        })
    }

    _confirmDelete = () => {
        const {viewer, user} = this.props ;
        
        DeleteFormMutation.commit({
                viewer,
                user,
                idVar: this.state.formToDelete.id
            },
            {
            onFailure: error => {
                this.props.alert.show(localizations.popup_editCircle_update_failed, {
                    timeout: 2000,
                    type: 'error',
                });
                let errors = JSON.parse(error.getError().source);
                console.log(errors);
            },
            onSuccess: (response) => {
                this.props.alert.show(localizations.popup_editCircle_update_success, {
                    timeout: 2000,
                    type: 'success',
                });
                this.setState({
                    deleteFormModalOpen: false,
                    formToDelete: null
                })
            },
            }
        )
    }

    _handleSave = form => {
      if (form.id) {
        this._handleSaveEditForm(form);
      } else {
        this._handleSaveNewForm(form);
      }
    }

    _handleGoBack = () => {
      if (this.state.formChanged) {
        this.setState({
            goBackConfirmModalOpen: true
        })
      } else {
        this._navigateToMyForms();
      }
    }

    _navigateToMyForms = () => {
      this.props.router.push('/my-circles/members-info')
    }

    _handleFormChanged = () => {
        this.setState({
            formChanged: true
        })
    }



    render() {
        const { viewer, user, language } = this.props
    
        return(
            <div style={styles.container}>
                <div style={styles.goBackLinkContainer}
                    >
                  <span
                    style={styles.goBackLink}
                    onClick={this._handleGoBack}
                  >
                      {'< ' + localizations.circles_information_form_back_to_forms}
                  </span>
                </div>

                <div style={styles.formContainer}>
                    <InformationForm
                      viewer={viewer}
                      user={user}
                      formToEdit={this.props.formToEdit}
                      onSave={this._handleSave}
                      onClose={this._handleCloseNewForm}
                      handleGoBack={this._handleGoBack}
                      language={language}
                      formChanged={this._handleFormChanged}
                    />
                </div>

                <Modal
                    isOpen={this.state.goBackConfirmModalOpen}
                    onRequestClose={this._closeModal}
                    style={modalStyles}
                    contentLabel={localizations.circles_information_form_go_back_confirm_title}
                  >
                  <div style={styles.modalContent}>
                      <div style={styles.modalHeader}>
                          <div style={styles.modalContent}>
                              <div style={styles.modalText}>
                                  {localizations.circles_information_form_go_back_confirm_title}
                              </div>
                              <div style={styles.modalExplanation}>
                                  {localizations.circles_information_form_go_back_confirm_text}
                              </div>
                              <div style={styles.modalButtonContainer}>
                                  <button style={styles.submitButton} onClick={this._navigateToMyForms}>{localizations.circle_yes}</button>
                                  <button style={styles.cancelButton} onClick={this._closeModal}>{localizations.circle_no}</button>
                              </div>
                          </div>
                      </div>
                  </div>
                </Modal>
            </div>

        )
    }
}

styles = {
    container: {
        width: "100%",
        marginTop: 50
    },
    goBackLinkContainer: {
        width: "20%",
        display: "inline-block",
        overflow: "hidden",
        marginRight: "0%",
        verticalAlign: "top"
    },
    formContainer: {
        width: "80%",
        display: "inline-block",
        verticalAlign: "top",
        marginTop: 9
    },
    button: {
        fontFamily: 'Lato',
        fontSize: 18,
        color: colors.blue,
        cursor: 'pointer',
        textAlign: 'left',
        padding: '0 15px',
        position: 'relative'
    },	
    memberList: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        marginTop: 15,
        width: '100%',
        padding: 0,
        flexWrap: 'wrap',
        '@media (max-width: 1070px)': {
			      justifyContent: 'center'
		    }
    },
    modalContent: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        width: 300,
        padding: 10,'@media (max-width: 768px)': {
            width: 'auto'
        }
    },
    modalHeader: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-center',
        justifyContent: 'flex-center',
    },



    modalText: {
        fontSize: 18,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        fontFamily: 'Lato',
    },
    modalExplanation: {
        fontSize: 16,
        color: colors.gray,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        fontFamily: 'Lato',
        fontStyle: 'italic',
        marginTop: 10,
        textAlign: 'justify'
    },
    modalButtonContainer: {
        fontSize: 18,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        fontFamily: 'Lato',
        marginTop: 30,
    },
    submitButton: {
        width: 80,
        backgroundColor: colors.blue,
        color: colors.white,
        fontSize: fonts.size.small,
        borderRadius: metrics.radius.tiny,
        outline: 'none',
        border: 'none',
        padding: '10px',
        cursor: 'pointer',
        boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
        margin: 10,
    },
    cancelButton: {
        width: 80,
        backgroundColor: colors.gray,
        color: colors.white,
        fontSize: fonts.size.small,
        borderRadius: metrics.radius.tiny,
        outline: 'none',
        border: 'none',
        padding: '10px',
        cursor: 'pointer',
        boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
        margin: 10,
    },
    goBackLink: {
        cursor: 'pointer',
        fontSize: 25,
        color:colors.blue
    },
}
modalStyles = {
    overlay : {
        position          : 'fixed',
        top               : 0,
        left              : 0,
        right             : 0,
        bottom            : 0,
        backgroundColor   : 'rgba(255, 255, 255, 0.75)',
    },
    content : {
        top                   : '50%',
        left                  : '50%',
        right                 : 'auto',
        bottom                : 'auto',
        marginRight           : '-50%',
        transform             : 'translate(-50%, -50%)',
        border                     : '1px solid #ccc',
        background                 : '#fff',
        overflow                   : 'auto',
        WebkitOverflowScrolling    : 'touch',
        borderRadius               : '4px',
        outline                    : 'none',
        padding                    : '20px',
    },
}

const _updateStepsCompleted = (steps) => ({
    type: types.UPDATE_STEPS_COMPLETED,
    tutorialSteps: steps,
});

const dispatchToProps = (dispatch) => ({
    _updateStepsCompleted: bindActionCreators(_updateStepsCompleted, dispatch),
});

const stateToProps = (state) => ({
    tutorialSteps: state.profileReducer.tutorialSteps,
    language: state.globalReducer.language
});

const ReduxContainer = connect(
  stateToProps,
  dispatchToProps,
)(AddEditInformationForms);

export default createRefetchContainer(withRouter(Radium(withAlert(ReduxContainer))), {
  viewer: graphql`
      fragment AddEditInformationForms_viewer on Viewer {
          id
          ...SearchModal_viewer
     }
  `,
  user: graphql`
      fragment AddEditInformationForms_user on User @argumentDefinitions (
          queryAddEditInformationForms: {type: "Boolean!", defaultValue: false}
      ) {
          id
      }
    `,
}, graphql`query AddEditInformationFormsRefetchQuery(
    $queryAddEditInformationForms: Boolean! 
) {
    viewer {
        me {
            ...AddEditInformationForms_user @arguments (queryAddEditInformationForms: $queryAddEditInformationForms)
        }
    }
}
`);
