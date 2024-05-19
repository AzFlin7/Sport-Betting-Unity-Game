import React from 'react'
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium';
import Modal from 'react-modal';
import { withAlert } from 'react-alert'
import { withRouter, Link } from 'found'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { Button } from '@material-ui/core';
import { colors, fonts, metrics } from '../../../theme'
import localizations from '../../Localizations'

import PaymentModelModal from './PaymentModelModal';
import NewPaymentModelMutation from './NewPaymentModelMutation';
import UpdatePaymentModelMutation from './UpdatePaymentModelMutation';
import DeletePaymentModelMutation from './DeletePaymentModelMutation';
import RelaunchMembersMutation from './RelaunchMembersForFeesMutation'
import * as types from '../../../actions/actionTypes';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import cloneDeep from 'lodash/cloneDeep';

let styles
let modalStyles

class PaymentModels extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            language: localizations.getLanguage(),
            isNewPaymentModelVisible: false,
            deleteModalOpen: false,
            paymentModelToDelete: null,
            isEditPaymentModelVisible: false,
            paymentModelToEdit: null,
            isSaving: false,
            relaunchedIds: []
        }
    }

    componentDidMount = () => {
        this.props.relay.refetch(fragmentVariables => ({
            ...fragmentVariables,
            query: true
        }))
    }

    componentWillReceiveProps = (nextProps) => {
    }

    _showNewPaymentModel = () => {
        this.setState({
            isNewPaymentModelVisible: true
        })
    }

    _handleCloseNewPaymentModel = () => {
        this.setState({
            isNewPaymentModelVisible: false
        })
    }

    _handleSaveNewPaymentModel = (paymentModel) => {
        const viewer = this.props.viewer ;
        this.setState({isSaving: true})

        NewPaymentModelMutation.commit({
                viewer,
                paymentModelVar: {
                    name: paymentModel.name,
                    conditions: paymentModel.conditions, 
                    price: paymentModel.price,
                    circles: paymentModel.circles
                }
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
                this.setState({
                    isSaving: false,
                    isNewPaymentModelVisible: false,
                })
                this._updateTutorialSteps();
            },
            }
        )
    }

    _handleEditPaymentModel = paymentModel => {
        this.setState({
            isEditPaymentModelVisible: true,
            paymentModelToEdit: paymentModel
        })
    }

    _handleNewForm = (paymentModel) => {
        const { viewer, user } = this.props
        
        if (paymentModel) 
            this.props.router.push('/my-circles/edit-payment-info/' + paymentModel.id);
        else {
            if (user.mangoId)
                this.props.router.push('/my-circles/payment-info');
            else {
                this.props.alert.show(localizations.circles_paymentModel_new_missing_bankAccount, {
                    timeout: 2000,
                    type: 'warning',
                });
            }
        }
    }

    _handleCloseEditPaymentModel = () => {
        this.setState({
            isEditPaymentModelVisible: false,
            paymentModelToEdit: null
        })
    }

    _handleSaveEditPaymentModel = (paymentModel) => {
        const viewer = this.props.viewer ;
        this.setState({isSaving: true})

        UpdatePaymentModelMutation.commit({
                viewer,
                paymentModelVar: {
                    id: paymentModel.id, 
                    name: paymentModel.name,
                    conditions: paymentModel.conditions, 
                    price: paymentModel.price,
                    circles: paymentModel.circles
                }
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
                this.setState({
                    isEditPaymentModelVisible: false,
                    paymentModelToEdit: null,
                    isSaving: false
                })
            },
            }
        )
    }

    _handleOnRemove = (paymentModel) => {
        this.setState({
            deleteModalOpen: true,
            paymentModelToDelete: paymentModel
        })
    }

    _closeModal = () => {
        this.setState({
            deleteModalOpen: false,
            paymentModelToDelete: null
        })
    }

    _confirmDelete = () => {
        const viewer = this.props.viewer ;
        
        DeletePaymentModelMutation.commit({
                viewer,
                paymentModelIdVar: this.state.paymentModelToDelete.id
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
                    deleteModalOpen: false,
                    paymentModelToDelete: null
                })
            },
            }
        )
    }

    relaunchMembers = (paymentModel) => {
        if (this.state.relaunchedIds.indexOf(paymentModel.id) < 0) {
            RelaunchMembersMutation.commit(
                {
                viewer: this.props.viewer,
                idVar: paymentModel.id,
                },
                {
                    onFailure: error => {
                        this.props.alert.show(localizations.popup_editCircle_update_failed, {
                        timeout: 2000,
                        type: 'error',
                        });
                        const errors = JSON.parse(error.getError().source);
                    },
                    onSuccess: response => {
                        this.props.alert.show(
                        localizations.popup_editCircle_update_success,
                        {
                            timeout: 2000,
                            type: 'success',
                        },
                        );
                        
                        this.setState({ relaunchedIds: [...this.state.relaunchedIds, paymentModel.id] });
                    },
                },
            );
        }
    }

    _updateTutorialSteps = () => {
        const { tutorialSteps } = this.props;
        let newTutorialSteps = cloneDeep(tutorialSteps);
  
        newTutorialSteps['setupMembersSubscriptionStep'] = true;
        this.props._updateStepsCompleted(newTutorialSteps);
    }

    _getPendingPayments = (paymentModel) => {
        let paid = paymentModel.memberSubscriptions ? paymentModel.memberSubscriptions.length : 0 ;
        let memberCount = 0; 
        paymentModel.circles.edges.forEach(edge => memberCount = memberCount + edge.node.memberCount)

        return memberCount - paid;
    }

    _handleViewPaymentModel = paymentModelId => {
        this.props.router.push(`/my-circles/payment-model-details/${paymentModelId}`);
      }

    render() {
        const { viewer, user } = this.props
    
        return(
        <div style={{width: '100%'}}>
            <div style={styles.pageHeader}>
                {localizations.circles_paymentModels}
            </div>
            
            <div style={styles.wrapper}>
                {((user && !user.mangoId) || (!user.circlePaymentModels || user.circlePaymentModels.length === 0))
                ?   <div style={styles.completeAccountContainer}>
                        {user && !user.mangoId && 
                            <div style={styles.explanation}>
                                {localizations.circles_paymentModel_new_missing_bankAccount}
                                <Link to={'/my-info'} style={{color: colors.blue, textDecoration: 'none'}}>
                                    {localizations.circles_paymentModel_new_missing_bankAccount_linkLabel}
                                </Link>
                            </div>
                        }
                        <div style={styles.completeAccountDetailsContainer}>
                            <div style={styles.completeAccountDetailsCol}>
                                <div style={styles.completeAccountDetailsText}>
                                    {localizations.circles_paymentModel_new_missing_bankAccount_expl1}
                                </div>
                                {localizations.getLanguage().toUpperCase() === 'FR'
                                ?	<img src="/images/new_payment_model-FR.png" style={styles.completeAccountImage}/>
                                :	<img src="/images/new_payment_model-EN.png" style={styles.completeAccountImage}/>
                                }
                            </div>
                            <div style={styles.completeAccountDetailsCol}>
                                <div style={styles.completeAccountDetailsText}>
                                    {localizations.circles_paymentModel_new_missing_bankAccount_expl2}
                                </div>
                                {localizations.getLanguage().toUpperCase() === 'FR'
                                ?	<img src="/images/payment_model-FR.png" style={styles.completeAccountImage}/>
                                :	<img src="/images/payment_model-EN.png" style={styles.completeAccountImage}/>
                                }
                            </div>
                        </div>
                        <div style={styles.explanation}>
                            {localizations.circles_paymentModel_new_missing_bankAccount_see_tutorial}
                            <Link to={'/faq/tutorial/paiement-des-cotisations'} style={{color: colors.blue, textDecoration: 'none'}}>
                                {localizations.circles_paymentModel_new_missing_bankAccount_see_tutorial2}
                            </Link>
                        </div>
                    </div> 
                :   <div style={styles.bodyContainer}>
                        {user.circlePaymentModels && user.circlePaymentModels.length > 0 && 
                            <Paper style={styles.root}>
                                <Table style={styles.table}>
                                    <TableHead>
                                        <TableRow >
                                            <TableCell style={styles.headerText}>{localizations.circles_paymentModel_name1}</TableCell>
                                            <TableCell style={styles.headerText} align="right">{localizations.circles_paymentModel_circles_applied}</TableCell>
                                            <TableCell style={styles.headerText} align="right">{localizations.circles_paymentModel_numbere_fulfill}</TableCell>
                                            <TableCell style={styles.headerText} align="right">{localizations.circles_paymentModel_numbere_waiting_answer}</TableCell>
                                            <TableCell style={styles.headerText} align="right">{localizations.circles_paymentModel_contact_again}</TableCell>
                                            <TableCell style={styles.headerText} align="right">{localizations.circles_paymentModel_modification}</TableCell>
                                            <TableCell style={styles.headerText} align="right">{localizations.circles_paymentModel_delete_from_table}</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                    { user.circlePaymentModels.map((paymentModel, index) => (
                                    <TableRow style={{cursor: 'pointer'}} key={paymentModel.id} >
                                        <TableCell style={styles.bodyText} component="th" scope="row">
                                            {paymentModel.name}
                                        </TableCell>
                                        <TableCell style={styles.bodyText} align="right" onClick={() => this._handleViewPaymentModel(paymentModel.id)}>
                                            {paymentModel.circles && paymentModel.circles.edges && paymentModel.circles.edges.length > 0
                                            ?   paymentModel.circles.edges.map((edge, index) => (
                                                    <p>
                                                        {edge.node.owner.id === user.id ? edge.node.name + (index < paymentModel.circles.edges.length - 1 ? ',' : '') : edge.node.name + ' (' + edge.node.owner.pseudo + ')' + (index < paymentModel.circles.edges.length - 1 ? ',' : '')}
                                                    </p>
                                                ))
                                            :   '-'
                                            }
                                        </TableCell>
                                        <TableCell style={styles.bodyText} align="right" onClick={() => this._handleViewPaymentModel(paymentModel.id)}>
                                            {paymentModel.memberSubscriptions && paymentModel.memberSubscriptions.length > 0 && 
                                                `${paymentModel.memberSubscriptions.length}`
                                            }
                                        </TableCell>
                                        <TableCell style={styles.bodyText} align="right" onClick={() => this._handleViewPaymentModel(paymentModel.id)}>
                                            {this._getPendingPayments(paymentModel)}
                                        </TableCell>
                                        <TableCell style={styles.bodyText} align="right">
                                            <Button 
                                                style={this.state.relaunchedIds.indexOf(paymentModel.id) >= 0 ? styles.disabledAltButton : styles.altButton} 
                                                onClick={() => this.relaunchMembers(paymentModel)}
                                            >
                                                <i className="fa fa-envelope-o" style={styles.iconCheck}></i>
                                            </Button>
                                        </TableCell>
                                        <TableCell style={styles.bodyText} align="right" >
                                            <div style={styles.icon} onClick={() => this._handleNewForm(paymentModel)}>
                                                <i key={"edit"+index} className="fa fa-pencil" style={styles.iconEdit}></i>
                                            </div>
                                        </TableCell>
                                        <TableCell style={styles.bodyText} align="right">
                                            <div style={styles.icon} onClick={() => this._handleOnRemove(paymentModel)}>
                                                <i key={"delete"+index} className="fa fa-times" style={styles.iconRemove}></i>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                    ))}
                                    </TableBody>
                                </Table>
                            </Paper>
                        }
                    </div>
                }
            </div>

            {!this.state.isNewPaymentModelVisible && !this.state.isEditPaymentModelVisible && 
                <div
                    style={{
                        position: 'fixed',
                        right: 20,
                        bottom: 20,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        height: 150,
                    }}
                >
                    <Button
                        variant="contained"
                        color="primary"
                        style={styles.altButton}
                        onClick={() => this._handleNewForm()}
                    >
                        {localizations.circles_paymentModel_create_membership_button}
                    </Button>
                </div>
            }

            {this.state.isNewPaymentModelVisible &&
                <PaymentModelModal 
                    isModalVisible={this.state.isNewPaymentModelVisible}
                    viewer={viewer}
                    user={user}
                    onSave={this._handleSaveNewPaymentModel}
                    onClose={this._handleCloseNewPaymentModel}
                    isSaving={this.state.isSaving}
                />
            }

            {this.state.isEditPaymentModelVisible &&
                <PaymentModelModal 
                    isModalVisible={this.state.isEditPaymentModelVisible}
                    viewer={viewer}
                    user={user}
                    paymentModelToEdit={this.state.paymentModelToEdit}
                    onSave={this._handleSaveEditPaymentModel}
                    onClose={this._handleCloseEditPaymentModel}
                    isSaving={this.state.isSaving}
                />
            }
            
            <Modal
                isOpen={this.state.deleteModalOpen}
                onRequestClose={this._closeModal}
                style={modalStyles}
                contentLabel={localizations.circles_paymentModel_delete}
            >
                <div style={styles.modalContent}>
                    <div style={styles.modalHeader}>
                        <div style={styles.modalContent}>
                            <div style={styles.modalText}>
                                {localizations.circles_paymentModel_delete}
                            </div>
                            <div style={styles.modalExplanation}>
                                {localizations.circles_paymentModel_delete_explanation}
                            </div>
                            <div style={styles.modalButtonContainer}>
                                <button style={styles.submitButton} onClick={this._confirmDelete}>{localizations.circle_yes}</button>
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
    pageHeader: {
		fontFamily: 'Lato',
		fontSize: 34,
		fontWeight: fonts.weight.large,
		color: colors.blue,
		display: 'flex',
        maxWidth: 1400,
		margin: '30px auto 0px auto',
        flexDirection: 'row',
		alignItems: 'left',
        justifyContent: 'left',
        '@media (max-width: 900px)': {
            flexDirection: 'column',
            marginBottom: 0
        },
        '@media (max-width: 768px)': {
            paddingLeft: 20
        }
    },
    bodyContainer: {
        display: 'flex',
        width: '100%',
        margin: '0px 0 50px 0', 
        flexDirection: 'column',
		justifyContent: 'flex-start',
        minHeight: 600,
        padding: '0 15px'
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
    wrapper: {
        margin: '35px auto',
        display: 'flex',
        flexDirection: 'row',
        fontFamily: 'Lato',
        '@media (max-width: 960px)': {
            width: '100%',
        },
        '@media (max-width: 580px)': {
            display: 'block',
        }
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
    memberListRow: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        marginTop: 15,
        width: '100%',
        padding: 0,
        flexWrap: 'wrap',
    },
    tableRowHeader: {
        width: '100%',
        height: 50,
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: colors.white,
        boxShadow: '0 0 4px 0 rgba(0,0,0,0.12)',
        border: '1px solid #E7E7E7',
        overflow: 'hidden',
        fontFamily: 'Lato',
        margin: '1px 0',
        padding: 15,
        textDecoration: 'none',
        justifyContent: 'space-between',
        alignItems: 'center',
        '@media (max-width: 768px)': {
          width: 'auto'
        }
    },
    tableRowHeaderText: {
        flex: 3,
        marginRight: 10,
        fontWeight: 'bold',
        fontSize: 16,
        color: 'rgba(0,0,0,0.65)'
    },
    tableRowHeaderCircleText: {
        flex: 8,
        marginRight: 10,
        fontWeight: 'bold',
        fontSize: 16,
        color: 'rgba(0,0,0,0.65)'
    },
    tableRow: {
        width: '100%',
        height: 50,
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: colors.white,
        boxShadow: '0 0 4px 0 rgba(0,0,0,0.12)',
        border: '1px solid #E7E7E7',
        overflow: 'hidden',
        fontFamily: 'Lato',
        margin: '1px 0',
        padding: 15,
        textDecoration: 'none',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#A6A6A6',
        transition: 'all cubic-bezier(0.22,0.61,0.36,1) .15s',
        ':hover': {
            backgroundColor: '#F1F1F1',
            color: '#B6B6B6',
        },
        '@media (max-width: 768px)': {
          width: 'auto'
        }
    },
    tableRowText: {
        flex: 3,
        marginRight: 10,
        fontWeight: 'bold',
        fontSize: 16,
    },
    tableRowCircleText: {
        flex: 8,
        marginRight: 10,
        fontSize: 16,
    },
    buttonContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        flex: 2,
        justifyContent: 'flex-end'
    },
    icon: {
		//flex: 1,
		fontSize: 24,
		cursor: 'pointer',
        textAlign: 'end',
        marginLeft: 10
    },
    iconRemove: {
        color: '#A6A6A6',
        ':hover': {
            color: colors.redGoogle
        }
    },
    iconEdit: {
        color: colors.blueLight,
        ':hover': {
            color: colors.blue
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
	modalTitle: {
		fontFamily: 'Lato',
		fontSize:24,
		fontWeight: fonts.weight.medium,
		color: colors.blue,
		marginBottom: 20,
		flex: '2 0 0',
	},
	modalClose: {
		justifyContent: 'flex-center',
		paddingTop: 10,
		color: colors.gray,
		cursor: 'pointer',
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
    explanation: {
		fontSize: 16,
		color: colors.gray,
		fontFamily: 'Lato',
		fontStyle: 'italic',
		marginTop: 10,
		textAlign: 'justify'
    },
    completeAccountContainer: {
        display: 'flex',
        width: '100%',
        margin: '0px 0 50px 0', 
        flexDirection: 'column',
		justifyContent: 'flex-start',
        minHeight: 600,
        padding: '0 15px',
        alignItems: 'center'
    },
    completeAccountImage: {
		maxWidth: '90%',
        height: 'auto',
        maxHeight: 450,
        marginTop: 25
    },
    completeAccountDetailsContainer: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        border: '1px solid ' + colors.lightGray,
        borderRadius: 5,
        marginTop: 40,
        padding: '10px 15px',
        '@media (max-width: 740px)': {
            flexDirection: 'column',
        }
    },
    completeAccountDetailsCol: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1, 
        alignItems: 'center',
        margin: '10px 20px',
        '@media (max-width: 740px)': {
            margin: 20
        }
    },
    completeAccountDetailsText: {
        fontSize: 16,
		color: colors.gray,
		fontFamily: 'Lato',
		marginTop: 10,
		textAlign: 'justify'
    },
    root: {
        width: '100%',
        marginTop: 15,
        overflowX: 'auto',
    },
    table: {
        minWidth: 700,
    },
    iconCheck: {
        fontSize: 15,
        color: colors.white
    },
    headerText: {
        fontWeight: 'bold',
        fontSize: 16
    },
    bodyText: {
        fontSize: 14
    },
    altButton: {
        fontSize: 13,
        backgroundColor: colors.blue,
        color: colors.white,
        textTransform: 'none',
    },
    disabledAltButton: {
        fontSize: 13,
        backgroundColor: colors.darkGray,
        color: colors.white,
        textTransform: 'none',
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

// const _updateStepsCompleted = (steps) => ({
//     type: types.UPDATE_STEPS_COMPLETED,
//     tutorialSteps: steps,
//   });
  
//   const dispatchToProps = (dispatch) => ({
//     _updateStepsCompleted: bindActionCreators(_updateStepsCompleted, dispatch),
//   });
  
//   const stateToProps = (state) => ({
//     tutorialSteps: state.profileReducer.tutorialSteps,
//   });
  
//   const ReduxContainer = connect(
//     stateToProps,
//     dispatchToProps,
//   )(PaymentModels);
  
//   export default createRefetchContainer(Radium(withAlert(ReduxContainer)), {

export default createRefetchContainer(withRouter(Radium(withAlert(PaymentModels))), {
    viewer: graphql`
        fragment PaymentModels_viewer on Viewer {
            id
        }
    `,
    user: graphql`
        fragment PaymentModels_user on User @argumentDefinitions(
            query: {type: "Boolean!", defaultValue: false}
        ){
            id
            mangoId
            paymenModelsCircles: circles (last: 25) @include (if: $query) {
                edges {
                    node {
                        id,
                        name,
                        type
                        askedInformation {
                            id, 
                            name,
                            type,
                            filledByOwner
                        }
                        memberCount
                    }
                }
            }
            paymenModelsCirclesSuperUser: circlesSuperUser(last: 60) @include (if: $query) {
                edges {
                    node {
                        id,
                        name,
                        type
                        askedInformation {
                            id, 
                            name,
                            type,
                            filledByOwner
                        }
                        memberCount
                        owner {
                            id
                            pseudo
                            avatar
                        }
                    }
                }
            }
            circlePaymentModels @include (if: $query) {
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
                memberSubscriptions {
                    user {
                        id
                    }
                    beginning_date,
                    ending_date
                    amount {
                        cents
                        currency
                    }
                }
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
                            memberCount
                            askedInformation {
                                id, 
                                name,
                                type,
                                filledByOwner
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
},
graphql`
    query PaymentModelsRefetchQuery(
        $query: Boolean!
    ) {
        viewer {
            ...PaymentModels_viewer
            me {
                ...PaymentModels_user @arguments(query: $query)
            }
        }
    }
`,
);
