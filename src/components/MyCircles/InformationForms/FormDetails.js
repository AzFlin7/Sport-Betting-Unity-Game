import React from 'react'
import {
    createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium';
import { connect } from 'react-redux';
import { withAlert } from 'react-alert'
import { withRouter } from 'found'
import ReactHTMLTableToExcel from 'react-html-table-to-excel';

import { colors, fonts, metrics } from '../../../theme'
import localizations from '../../Localizations'
import FormsDetailsTableView from './FormsDetailsTableView'
import Loading from '../../common/Loading/Loading';
import CircleCardsView from './CircleCardsView';
import UpdateFormMutation from './UpdateFormMutation';
import ValidateDocumentMutation from './ValidateDocumentMutation';
import {openPromptModal} from '../../common/PromptModal'

let styles
var Style = Radium.Style;

const muiStyles = theme => ({
});

class FormDetails extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            loading: true,
            language: localizations.getLanguage(),
            circleSelected: null
        }
    }

    componentDidMount = () => {
        this.props.relay.refetch(fragmentVariables => ({
            queryInformationForms: true
        }),
        null,
        () => {
            setTimeout(() => {
                const { viewer, user, language } = this.props

                if (this.props.formId && user.circleInformationForms && user.circleInformationForms.find(form => form.id === this.props.formId)) {
                    let form = user.circleInformationForms.find(form => form.id === this.props.formId)
                    if (form.circles && form.circles.edges && form.circles.edges.length > 0) {
                        this.setState({circleSelected: form.circles.edges[0].node})
                    }
                }
                this.setState({ loading: false })
            }, 50);
        })
    }

    _handleCircleSelect = circle => {
      this.setState({
        circleSelected: circle
      })
    }

    _withdrawGroup = circleToRemove => {
      let {user} = this.props;
      let formToModify = user.circleInformationForms && user.circleInformationForms.find(form => form.id === this.props.formId)
      const viewer = this.props.viewer ;

      let newCirclesVar = formToModify.circles.edges.map(circleEdge => {
        if (circleEdge.node.id !== circleToRemove.id)
          return circleEdge.node.id
        else
          return null;
      });
      UpdateFormMutation.commit({
          viewer,
          idVar: formToModify.id,
          nameVar: formToModify.name,
          circleIdsVar: newCirclesVar.filter(circleId => circleId),
          askedInformationVar : formToModify.askedInformation,
          customFieldsIdsVar : formToModify.customFields || []
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
            window.location.reload();
          },
        }
      )
    }

    _navigateToMyForms = () => {
      this.props.router.push('/my-circles/members-info')
    }

    validateDocument = (document, filledInformation) => {
      let formToModify = this.props.user.circleInformationForms && this.props.user.circleInformationForms.find(form => form.id === this.props.formId)
      let newCirclesVar = formToModify.circles.edges.map(circleEdge => circleEdge.node.id);

      ValidateDocumentMutation.commit({
        circleId: newCirclesVar.filter(circleId => circleId)[0],
        filledInformationId: filledInformation,
        documentId: document.id,
        isValidated: true,
      }, {
        onFailure: error => {
          this.props.alert.show(localizations.popup_editCircle_update_failed, {
            timeout: 2000,
            type: 'error',
          });
        },
        onSuccess: (response) => {
          this.props.relay.refetch(fragmentVariables => 
            ({queryInformationForms: true}),
            null,
            () => {
              setTimeout(() => {
                const { user } = this.props

                if (this.props.formId && user.circleInformationForms && user.circleInformationForms.find(form => form.id === this.props.formId)) {
                  let form = user.circleInformationForms.find(form => form.id === this.props.formId)
                  if (form.circles && form.circles.edges && form.circles.edges.length > 0) {
                    let selectedCircle = form.circles.edges.map(edge => edge.node).find(node => node.id === this.state.circleSelected.id)
                    this.setState({circleSelected: selectedCircle})
                  }
                }
                this.setState({ loading: false })
              }, 50);
            }
          )
          this.props.alert.show(localizations.circles_information_form_doc_validated, {
            timeout: 2000,
            type: 'success',
          });
        },
      })
    }

    confirmRefuseDocument = (document, filledInformation) => {
      openPromptModal({
        title: localizations.circles_information_form_doc_write_comment,
        confirmLabel: localizations.circles_information_form_doc_send,
        canCloseModal: true,
        onConfirm: comment => {
          this.refuseDocument(document, filledInformation, comment)
        },
      })
    }

    refuseDocument = (document, filledInformation, comment) => {
      if (!comment || comment === '') {
        this.props.alert.show(localizations.circles_information_form_doc_unvalidated_write_comment, {
          timeout: 2000,
          type: 'error',
        });
        this.confirmRefuseDocument(document, filledInformation)
        return 
      }

      let formToModify = this.props.user.circleInformationForms && this.props.user.circleInformationForms.find(form => form.id === this.props.formId)
      let newCirclesVar = formToModify.circles.edges.map(circleEdge => circleEdge.node.id);

      ValidateDocumentMutation.commit({
        circleId: newCirclesVar.filter(circleId => circleId)[0],
        filledInformationId: filledInformation,
        documentId: document.id,
        comment,
        isValidated: false,
      }, {
        onFailure: error => {
          this.props.alert.show(localizations.popup_editCircle_update_failed, {
            timeout: 2000,
            type: 'error',
          });
        },
        onSuccess: (response) => {
          this.props.relay.refetch(fragmentVariables => 
            ({queryInformationForms: true}),
            null,
            () => {
              setTimeout(() => {
                const { user } = this.props
  
                if (this.props.formId && user.circleInformationForms && user.circleInformationForms.find(form => form.id === this.props.formId)) {
                  let form = user.circleInformationForms.find(form => form.id === this.props.formId)
                  if (form.circles && form.circles.edges && form.circles.edges.length > 0) {
                    let selectedCircle = form.circles.edges.map(edge => edge.node).find(node => node.id === this.state.circleSelected.id)
                    this.setState({circleSelected: selectedCircle})
                  }
                }
                this.setState({ loading: false })
              }, 50);
            }
          )
          this.props.alert.show(localizations.circles_information_form_doc_unvalidated, {
            timeout: 2000,
            type: 'success',
          });
        },
      })
    }

    render() {
        const { viewer, user, language } = this.props
        const { circleSelected } = this.state
        let formToView = user.circleInformationForms && user.circleInformationForms.find(form => form.id === this.props.formId)
        
        return(
          <div style={{width: '100%'}}>
            {this.state.loading && <Loading/>}


            <div style={styles.pageHeader}>
              <div style={styles.goBackLinkContainer}>
                <span
                  style={styles.goBackLink}
                  onClick={this._navigateToMyForms}
                >
                  {'< ' + localizations.circles_information_form_back_to_forms}
                </span>
              </div>
              <div style={styles.title}>
                {formToView && formToView.name}
              </div>
              <Style scopeSelector="#test-table-xls-button" rules={{
                  ...styles.submitButton
                  }}
              />
              <ReactHTMLTableToExcel
                id="test-table-xls-button"
                table="table-to-xls"
                filename="sample"
                sheet="sheet1"
                buttonText={localizations.circle_export_excel}
              />
            </div>

            <div style={styles.container}>
              <div style={styles.circleCardsContainer}>
                <CircleCardsView
                  user={user}
                  form={formToView}
                  circleSelected={circleSelected}
                  onSelectCircle={this._handleCircleSelect}
                  onWithdrawGroup={this._withdrawGroup}
                  language={language}
                />
              </div>
              <div style={styles.formContainer}>
                <FormsDetailsTableView
                  user={user}
                  form={formToView}
                  circle={circleSelected}
                  editForm={this._handleEditForm}
                  removeForm={this._handleOnRemove}
                  language={language}
                  validateDocument={this.validateDocument}
                  refuseDocument={this.confirmRefuseDocument}
                />
              </div>
            </div>
          </div>
        )
    }
}

styles = {
  container: {
    width: "100%",
    marginTop: 25
  },
  circleCardsContainer: {
    width: "15%",
    display: "inline-block",
    overflow: "hidden",
    marginRight: "0%",
    verticalAlign: "top"
  },
  formContainer: {
    width: "85%",
    display: "inline-block",
    verticalAlign: "top",
    marginTop: 9
  },
  pageHeader: {
    display: 'flex',
    maxWidth: 1400,
    margin: '50px auto 0px auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'left',
    '@media (max-width: 900px)': {
      flexDirection: 'column',
      marginBottom: 0
    },
    '@media (max-width: 768px)': {
      paddingLeft: 20
    }
  },
  title: {
    fontFamily: 'Lato',
    fontSize: 34,
    fontWeight: fonts.weight.large,
    color: colors.black,
    paddingLeft: 20,
    flex: 1
  },
  goBackLinkContainer: {
    width: "15%",
    display: "inline-block",
    overflow: "hidden",
    marginRight: "0%",
    verticalAlign: "top"
  },
  goBackLink: {
    cursor: 'pointer',
    fontSize: 24,
    color:colors.blue
  },
  submitButton: {
    width: '200px',
    backgroundColor: colors.blue,
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    borderRadius: '3px',
    fontFamily: 'Lato',
    fontSize: '16px',
    textAlign: 'center',
    color: colors.white,
    borderWidth: 0,
    cursor: 'pointer',
    lineHeight: '26px',
    marginRight: 30
  },
}


const dispatchToProps = (dispatch) => ({});

const stateToProps = (state) => ({
    language: state.globalReducer.language
});

const ReduxContainer = connect(
  stateToProps,
  dispatchToProps,
)(FormDetails);

export default createRefetchContainer(withRouter(Radium(withAlert(ReduxContainer))), {
  viewer: graphql`
      fragment FormDetails_viewer on Viewer {
          id
      }
  `,
  user: graphql`
      fragment FormDetails_user on User @argumentDefinitions (
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
                              pseudo
                          }
                          membersInformation {
                              id
                              information
                              user {
                                  id
                              }
                              value
                              fillingDate
                              document {
                                id,
                                link,
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
}, graphql`query FormDetailsRefetchQuery(
    $queryInformationForms: Boolean!
) {
    viewer {
        me {
            ...FormDetails_user @arguments (queryInformationForms: $queryInformationForms)
        }
    }
}
`);
