import React from 'react'
import {
    createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium';
import Modal from 'react-modal';
import {Link} from 'found'
import { withAlert } from 'react-alert'
import { withRouter } from 'found'

import { colors, fonts, metrics } from '../../../theme'
import localizations from '../../Localizations'
import DeleteFormMutation from './DeleteFormMutation';
import Button from '@material-ui/core/Button';
import MyCircleFormsTableView from './MyCircleFormsTableView'
import RelaunchMembersMutation from '../../Circle/CircleMembersInformation/RelaunchMembersMutation';
import Loading from '../../common/Loading/Loading';
import { connect } from 'react-redux';

let styles
let modalStyles

class InformationForms extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            loading: true,
            language: localizations.getLanguage(),
            deleteFormModalOpen: false,
            formToDelete: null,
            formToEdit: null
        }
    }

    componentDidMount = () => {
        this.props.relay.refetch(fragmentVariables => ({
            queryInformationForms: true
        }),
        null,
        () => {
          setTimeout(() => this.setState({ loading: false }), 50);
        })
    }

    componentWillReceiveProps = (nextProps) => {
    }

    _handleNewForm = () => {
        console.log(this.props);
        this.props.router.push('/my-circles/form-info');
    }

    _handleEditForm = form => {
        this.props.router.push({pathname: '/my-circles/form-info', formToEdit: form});
    }

    _handleViewForm = formId => {
      this.props.router.push(`/my-circles/form-details/${formId}`);
    }

    _handleOnRemove = (form) => {
        this.setState({
            deleteFormModalOpen: true,
            formToDelete: form
        })
    }

    _closeModal = () => {
        this.setState({
            deleteFormModalOpen: false,
            formToDelete: null
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

    _getAnsweredFormCount = form => {
        let answeredFormCount = 0;
        form.circles.edges.forEach(circleEdge => {
            circleEdge.node.members.forEach(member => {
                let isNotMissing = true;
                form.askedInformation.forEach(askedInfo => {
                      if (askedInfo.type !== 'BOOLEAN' &&
                        (!circleEdge.node.membersInformation ||
                          circleEdge.node.membersInformation.findIndex(memberInfo => {
                              return memberInfo.user.id === member.id && memberInfo.information === askedInfo.id
                          }) < 0)
                      ) {
                          isNotMissing = false
                      }
                  }
                )
                answeredFormCount += isNotMissing & 1;
            })
        })

        return answeredFormCount
    }


    _handleRelaunchMembers = form => {
        form.circles.edges.forEach(circleEdge => {
            const idVar = circleEdge.node.id;
            const viewer = this.props.viewer;
            RelaunchMembersMutation.commit(
              {
                  viewer,
                  idVar,
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
                      this.setState({ isRelaunchButtonVisible: false });
                  },
              },
            );
        })
    };


    render() {
        const { viewer, user, language } = this.props
    
        return(
        <div style={{width: '100%'}}>
            {this.state.loading && <Loading/>}
            <div style={styles.pageHeader}>
                {localizations.circles_information}
            </div>
            
            <div style={styles.wrapper}>
                <div style={styles.bodyContainer}>
                    {user.circleInformationForms && user.circleInformationForms.length > 0
                    ?   <div>
                          <MyCircleFormsTableView
                            user={user}
                            forms={user.circleInformationForms}
                            editForm={this._handleEditForm}
                            removeForm={this._handleOnRemove}
                            viewForm={this._handleViewForm}
                            relaunchMembers={this._handleRelaunchMembers}
                            getAnsweredFormCount={this._getAnsweredFormCount}
                            language={language}
                          />
                      </div>
                    :   <div style={styles.memberList}>
                            <div style={styles.noFormContainer}>
                                <div style={styles.noFormText}>
                                    {localizations.circles_information_form_none}
                                    <br/>
                                    {localizations.circles_information_form_disclaimer}
                                </div>
                                {localizations.getLanguage().toUpperCase() === 'FR'
                                ?	<img src="/images/circle_information_form-FR.png" style={styles.noFormImage}/>
                                :	<img src="/images/circle_information_form-EN.png" style={styles.noFormImage}/>
                                }
                                <div style={styles.noFormText}>
                                    {localizations.circles_information_form_circles_applied_see_tutorial}
                                    <Link to={'/faq/tutorial/paiement-des-cotisations'} style={{color: colors.blue, textDecoration: 'none'}}>
                                        {localizations.circles_information_form_circles_applied_see_tutorial2}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    }
                    {!this.state.isNewFormVisible && !this.state.isEditFormVisible &&
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
                              onClick={
                                  this._handleNewForm
                              }
                            >
                                {localizations.circles_information_create_form_button}
                            </Button>
                        </div>
                    }
                </div> 
            </div>

            <Modal
                isOpen={this.state.deleteFormModalOpen}
                onRequestClose={this._closeModal}
                style={modalStyles}
                contentLabel={localizations.circles_information_delete}
            >
                <div style={styles.modalContent}>
                    <div style={styles.modalHeader}>
                        <div style={styles.modalContent}>
                            <div style={styles.modalText}>
                                {localizations.circles_information_delete} ?
                            </div>
                            <div style={styles.modalExplanation}>
                                {localizations.circles_information_delete_explanation}
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
    noFormContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '15px 25px',
        border: '1px solid ' + colors.lightGray,
        borderRadius: 5,
        marginTop: 40
    },
    noFormText: {
        display: 'flex',
        flexDirection: 'column',
        fontSize: 16,
		color: colors.gray,
		fontFamily: 'Lato',
		marginTop: 10,
		textAlign: 'justify'
    },
    noFormImage: {
        maxWidth: '90%',
        height: 'auto',
        maxHeight: 450,
        marginTop: 25
    }
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


const dispatchToProps = (dispatch) => ({});

const stateToProps = (state) => ({
    language: state.globalReducer.language
});

const ReduxContainer = connect(
  stateToProps,
  dispatchToProps,
)(InformationForms);

export default createRefetchContainer(withRouter(Radium(withAlert(ReduxContainer))), {
  viewer: graphql`
      fragment InformationForms_viewer on Viewer {
          id
      }
  `,
  user: graphql`
      fragment InformationForms_user on User @argumentDefinitions (
          queryInformationForms: {type: "Boolean!", defaultValue: false}
      ) {
          id
          circleInformationForms @include(if: $queryInformationForms) {
              id
              name
              circles {
                  edges {
                      node {
                          id
                          name
                          owner {
                              id
                              pseudo
                              avatar
                          }
                          members {
                              id
                          }
                          membersInformation {
                              id
                              information
                              user {
                                  id
                              }
                              value
                              document {
                                id,
                                name
                              }
                              validationStatus
                              comment
                          }
                      }
                  }
              }
              askedInformation {
                  id
                  name
                  type
                  filledByOwner
              }
          }
      }
    `,
}, graphql`query InformationFormsRefetchQuery(
    $queryInformationForms: Boolean! 
) {
    viewer {
        me {
            ...InformationForms_user @arguments (queryInformationForms: $queryInformationForms)
        }
    }
}
`);
