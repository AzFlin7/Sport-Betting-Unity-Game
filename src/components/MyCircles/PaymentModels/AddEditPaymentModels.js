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
import PaymentModel from './PaymentModel';
import NewPaymentModelMutation from './NewPaymentModelMutation';
import UpdatePaymentModelMutation from './UpdatePaymentModelMutation';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import cloneDeep from 'lodash/cloneDeep';
import * as types from '../../../actions/actionTypes';

let styles
let modalStyles

class AddEditPaymentModels extends React.Component {
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
        if (this.props.paymentModelId) {
            this.props.relay.refetch(fragmentVariables => ({
                queryAddEditPaymentModels: true,
                paymentModelId: this.props.paymentModelId,
                queryPaymentModel: true
            }))
        }
        else {
            this.props.relay.refetch(fragmentVariables => ({
                queryAddEditPaymentModels: true,
                queryPaymentModel: false
            }))
        }
    }

    _updateTutorialSteps = () => {
        const { tutorialSteps } = this.props;
        let newTutorialSteps = cloneDeep(tutorialSteps);

        newTutorialSteps['setupMembersSubscriptionStep'] = true;
        this.props._updateStepsCompleted(newTutorialSteps);
    }

    _handleSave = paymentModel => {
        if (paymentModel.id) 
            this._handleSaveEditModel(paymentModel);
        else 
          this._handleSaveNewModel(paymentModel);
    }

      
    _handleSaveNewModel = (paymentModel) => {
        const {viewer, user} = this.props ;
        
        NewPaymentModelMutation.commit({
                viewer,
                paymentModelVar: paymentModel
            },
            {
                onFailure: error => {
                    this.props.alert.show(localizations.popup_editCircle_update_failed, {
                        timeout: 2000,
                        type: 'error',
                    });
                    let errors = JSON.parse(error.getError().source);
                    console.log(errors);
                    this.setState({isSaving: false})
                    
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

    _handleSaveEditModel = (paymentModel) => {
        const viewer = this.props.viewer ;

        UpdatePaymentModelMutation.commit({
                viewer,
                paymentModelVar: paymentModel
            },
            {
                onFailure: error => {
                    this.props.alert.show(localizations.popup_editCircle_update_failed, {
                        timeout: 2000,
                        type: 'error',
                    });
                    let errors = JSON.parse(error.getError().source);
                    console.log(errors);
                    this.setState({isSaving: false})
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

    _handleGoBack = () => {
        if (this.state.formChanged) 
            this.setState({
                goBackConfirmModalOpen: true
            })
        else 
            this._navigateToMyForms();
    }

    _navigateToMyForms = () => {
        this.props.router.push('/my-circles/payment-models')
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
                      {'< ' + localizations.circles_paymentModel_back_to_payment_models}
                  </span>
                </div>

                <div style={styles.formContainer}>
                    {this.props.paymentModelId
                    ?   this.props.viewer.circlePaymentModel && 
                        <PaymentModel
                            viewer={viewer}
                            user={user}
                            onSave={this._handleSave}
                            onClose={this._handleCloseNewForm}
                            handleGoBack={this._handleGoBack}
                            language={language}
                            formChanged={this._handleFormChanged}
                            userCurrency={this.props.userCurrency}
                            _updateUserCurrency={this.props._updateUserCurrency}
                            paymentModelToEdit={this.props.viewer.circlePaymentModel}
                        />
                    :   <PaymentModel
                            viewer={viewer}
                            user={user}
                            onSave={this._handleSave}
                            onClose={this._handleCloseNewForm}
                            handleGoBack={this._handleGoBack}
                            language={language}
                            formChanged={this._handleFormChanged}
                            userCurrency={this.props.userCurrency}
                            _updateUserCurrency={this.props._updateUserCurrency}
                        />
                    }
                </div>
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
const _updateUserCurrency = value => ({
    type: types.GLOBAL_SET_USER_CURRENCY,
    value,
});

const dispatchToProps = (dispatch) => ({
    _updateStepsCompleted: bindActionCreators(_updateStepsCompleted, dispatch),
    _updateUserCurrency: bindActionCreators(_updateUserCurrency, dispatch),
});

const stateToProps = (state) => ({
    tutorialSteps: state.profileReducer.tutorialSteps,
    language: state.globalReducer.language,
    userCurrency: state.globalReducer.userCurrency
});

const ReduxContainer = connect(
  stateToProps,
  dispatchToProps,
)(AddEditPaymentModels);

export default createRefetchContainer(withRouter(Radium(withAlert(ReduxContainer))), {
        viewer: graphql`
            fragment AddEditPaymentModels_viewer on Viewer @argumentDefinitions (
                paymentModelId: {type: "ID"},
                queryPaymentModel: {type: "Boolean!", defaultValue: false}
            ) {
                id
                ...SearchModal_viewer
                circlePaymentModel (paymentModelId: $paymentModelId) @include (if: $queryPaymentModel) {
                    id,
                    name, 
                    beginning_date,
                    ending_date,
                    max_duration {
                        days,
                        months,
                        years
                    }
                    max_uses,
                    memberShipFeesType,
                    inAppPaymentAllowed,
                    memberToPayFees,
                    paymentViaBankWireAllowed,
                    conditions {
                        id,
                        name,
                        price {
                            cents,
                            currency
                        },
                        conditions {
                            askedInformation {
                                id,
                                name,
                                type,
                                filledByOwner
                                answers
                            }
                            askedInformationComparator
                            askedInformationComparatorValue
                            askedInformationComparatorDate
                            askedInformationComparatorValueString
                        }
                    }
                    price {
                        cents,
                        currency
                    },
                    circles (last: 20) {
                        edges {
                            node {
                                id,
                                name
                                askedInformation {
                                    id, 
                                    name,
                                    type,
                                    filledByOwner
                                    answers
                                }
                                owner {
                                    id
                                    pseudo
                                    avatar
                                }
                            }
                        }
                    }
                }
            }
        `,
        user: graphql`
            fragment AddEditPaymentModels_user on User @argumentDefinitions (
                queryAddEditPaymentModels: {type: "Boolean!", defaultValue: false}
            ) {
                id
                paymentModelFees
            }
        `,
    }, 
    graphql`
        query AddEditPaymentModelsRefetchQuery(
            $paymentModelId: ID,
            $queryPaymentModel: Boolean!
            $queryAddEditPaymentModels: Boolean!
        ) {
            viewer {
                ...AddEditPaymentModels_viewer @arguments (paymentModelId: $paymentModelId, queryPaymentModel: $queryPaymentModel)
                me {
                    ...AddEditPaymentModels_user @arguments (queryAddEditPaymentModels: $queryAddEditPaymentModels)
            }
        }
    }
`);
