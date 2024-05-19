import React from 'react'
import {
    createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium';
import { withAlert } from 'react-alert'
import { connect } from 'react-redux';
import { withRouter } from 'found'
import ReactHTMLTableToExcel from 'react-html-table-to-excel';

import { colors, fonts } from '../../../theme'
import localizations from '../../Localizations'
import CircleCardsView from '../InformationForms/CircleCardsView';
import FormsDetailsTableView from './PaymentModelDetailsTableView'
import Loading from '../../common/Loading/Loading';

let styles
var Style = Radium.Style;

class PaymentModelDetails extends React.Component {
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
                queryPaymentModel: true,
                paymentModelId: this.props.paymentModelId
            }),
            null,
            () => {
                setTimeout(() => {
                    const { viewer, user, language } = this.props
                    
                    if (this.props.paymentModelId && viewer.circlePaymentModel) {
                        let paymentModel = viewer.circlePaymentModel
                        if (paymentModel.circles && paymentModel.circles.edges && paymentModel.circles.edges.length > 0) {
                            this.setState({circleSelected: paymentModel.circles.edges[0].node})
                        }
                    }

                    this.setState({ loading: false })
                }, 50)
            }
        )
    }

    _handleCircleSelect = circle => {
      this.setState({
        circleSelected: circle
      })
    }

    _navigateToMyForms = () => {
      this.props.router.push('/my-circles/payment-models')
    }

    render() {
        const { viewer, user, language, userCurrency } = this.props
        const { circleSelected } = this.state
        
        return(
          <div style={{width: '100%'}}>
            {this.state.loading && <Loading/>}

            <div style={styles.pageHeader}>
              <div style={styles.goBackLinkContainer}>
                <span
                  style={styles.goBackLink}
                  onClick={this._navigateToMyForms}
                >
                  {'< ' + localizations.circles_paymentModel_back_to_payment_models}
                </span>
              </div>
              <div style={styles.title}>
                {viewer.circlePaymentModel && viewer.circlePaymentModel.name}
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
                  form={viewer.circlePaymentModel}
                  circleSelected={circleSelected}
                  onSelectCircle={this._handleCircleSelect}
                  language={language}
                />
              </div>
              <div style={styles.formContainer}>
                <FormsDetailsTableView
                  user={user}
                  paymentModel={viewer.circlePaymentModel}
                  circle={circleSelected}
                  language={language}
                  userCurrency={userCurrency}
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
  bodyContainer: {
    display: 'flex',
    width: '100%',
    margin: '0px 0 50px 0', 
    flexDirection: 'column',
    justifyContent: 'flex-start',
    minHeight: 600,
    padding: '0 15px'
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
  }
}

const dispatchToProps = (dispatch) => ({});

const stateToProps = (state) => ({
    language: state.globalReducer.language,
    userCurrency: state.globalReducer.userCurrency,
});

const ReduxContainer = connect(
  stateToProps,
  dispatchToProps,
)(PaymentModelDetails);

export default createRefetchContainer(withRouter(Radium(withAlert(ReduxContainer))), {
    viewer: graphql`
        fragment PaymentModelDetails_viewer on Viewer @argumentDefinitions (
            queryPaymentModel: {type: "Boolean!", defaultValue: false},
            paymentModelId: {type: "ID"},
        ) {
            id
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
                memberSubscriptions {
                    user {
                        id
                    }
                    amount {
                        cents
                        currency
                    }
                    payment_date
                    beginning_date
                    ending_date
                }
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
                            membersInformation {
                                id,
                                information,
                                user {
                                    id,
                                }
                                value
                                document {
                                  id,
                                  name
                                }
                                validationStatus
                                comment
                            }
                            owner {
                                id
                                pseudo
                                paymentModelFees
                            }
                            members {
                                id,
                                pseudo
                            }
                        }
                    }
                }
            }
        }
    `,
    user: graphql`
        fragment PaymentModelDetails_user on User {
            id            
        }
        `,
    }, 
    graphql`
        query PaymentModelDetailsRefetchQuery ($queryPaymentModel: Boolean!, $paymentModelId: ID,) {
            viewer {
                ...PaymentModelDetails_viewer @arguments (paymentModelId: $paymentModelId, queryPaymentModel: $queryPaymentModel)
                me {
                    ...PaymentModelDetails_user 
                }
            }
        }
    `
);
