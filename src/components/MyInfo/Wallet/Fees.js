import React, { PureComponent } from 'react';
import {
  Paper,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Avatar,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import {
  createPaginationContainer,
  graphql,
  QueryRenderer,
} from 'react-relay';
import environment from 'sportunity/src/createRelayEnvironment';
import ReactLoading from 'react-loading';
import { colors } from '../../../theme';
import localizations from '../../Localizations';
import moment from 'moment';
import flatten from 'lodash/flatten';
import { withRouter } from 'found';
import FeesPaymentPopup from './FeesPaymentPopup';
import UpdateUserSubscription from '../Subscriptions/UpdateUserSubscription';

class Fees extends PureComponent {
  constructor(props) {
    super(props);
    this.sub;
    this.state = {
      loadingMore: false,
      hasMore: true,
      refetchConnection: false,
      displayFeesPaymentPopup: false,
      feesPaymentPopupProps: {},
    };
    this._refetch = this._refetch.bind(this);
  }

  componentDidMount() {
    this.sub = UpdateUserSubscription({userId: this.props.viewer.me.id});
    this._refetch();
  }

  componentWillUnmount() {
    this.sub && this.sub.dispose()
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.users.length !== this.props.users.length) {
      this.setState({ refetchConnection: true });
    }
    if (this.state.refetchConnection) {
      this._refetch();
    }
  }

  _refetch() {
    this.setState({ refetchConnection: false, loadingMore: true });
    this.props.relay.refetchConnection(
      100,
      () => {
        this.setState({ loadingMore: false });
      },
      {
        doQuery: true,
        users: this.props.users,
      },
    );
  }

  render() {
    const { loadingMore, hasMore } = this.state;
    const { viewer, relay, classes, noDataMessage } = this.props;
    const { me, users } = this.props.viewer;
    // loading
    if (!me) {
      return (
        <div>
          <ReactLoading type="spinningBubbles" color={colors.blue} />
        </div>
      );
    }
    // no data
    let noData = true;
    if (users && users.edges && users.edges.length) {
      users.edges.map(i => {
        if (
          i.node.circlesUserIsIn &&
          i.node.circlesUserIsIn.edges &&
          i.node.circlesUserIsIn.edges.length
        ) {
          i.node.circlesUserIsIn.edges.map(ii => {
            if (
              ii.node &&
              ii.node.paymentModels &&
              ii.node.paymentModels.length
            ) {
              ii.node.paymentModels.map(iii => {
                if (iii && _didUserPayFees('ToBePaid', ii.node, iii, me.id)) {
                  noData = false;
                }
              });
            }
          });
        }
      });
    }
    if (noData) {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 10,
            fontSize: 22,
          }}
        >
          {noDataMessage}
        </div>
      );
    }
    // process data
    const circles = [];
    users.edges.map(i => {
      if (
        i.node.circlesUserIsIn &&
        i.node.circlesUserIsIn.edges &&
        i.node.circlesUserIsIn.edges.length
      ) {
        i.node.circlesUserIsIn.edges.map(j => {
          if (
            j &&
            j.node &&
            j.node.paymentModels &&
            j.node.paymentModels.length &&
            j.node.owner
          ) {
            circles.push({ ...j, user: i });
          }
        });
      }
    });
    const data = flatten(
      circles.map(i => {
        return i.node.paymentModels
          .filter(ii => _didUserPayFees('ToBePaid', i.node, ii, me.id))
          .map(j => {
            const price = _getAmoutToPay(i.node, j, i.user.node.id);
            const priceText = _getAmoutToPayText(i.node, j, i.user.node.id);
            const didUserFillAll = _didUserFillAll(i.node, j, i.user.node.id);
            const { name } = i.node;
            const to = i.node.owner ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Avatar
                  alt={i.node.owner.pseudo}
                  src={i.node.owner.avatar}
                  className={classes.avatar}
                />
                <span>{i.node.owner.pseudo}</span>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              />
            );
            const { inAppPaymentAllowed, paymentViaBankWireAllowed } = j;
            const paymentModelId = j.id;

            return {
              price,
              priceText,
              name,
              to,
              inAppPaymentAllowed,
              didUserFillAll,
              paymentViaBankWireAllowed,
              paymentModelId,
            };
          });
      }),
    );
    
    return (
      <Paper elevation={1} style={{ overflowX: 'auto' }}>
        <Table>
          <TableBody>
            {data.map(i => (
              <TableRow>
                <TableCell style={{ width: '33%' }}>
                  {i.didUserFillAll ? (
                    <p style={{ fontSize: 22 }}>{i.priceText}</p>
                  ) : (
                    <p>{localizations.accountMembershipFeesMissingInfo}</p>
                  )}
                </TableCell>
                <TableCell style={{ width: '33%' }}>
                  <div style={{ fontSize: 16 }}>{i.name}</div>
                  <div>{i.to}</div>
                </TableCell>
                <TableCell style={{ width: '33%' }}>
                  {!i.didUserFillAll && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        this.props.router.push({
                          pathname: '/my-shared-info',
                        });
                      }}
                    >
                      {localizations.goToForm}
                    </Button>
                  )}
                  {!i.inAppPaymentAllowed && (
                    <p>
                      {localizations.accountMembershipFeesPaymentNotAllowed}
                    </p>
                  )}
                  {i.inAppPaymentAllowed && i.didUserFillAll && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        this.setState({
                          displayFeesPaymentPopup: true,
                          feesPaymentPopupProps: {
                            name: i.name,
                            price: i.price,
                            priceText: i.priceText,
                            paymentViaBankWireAllowed:
                              i.paymentViaBankWireAllowed,
                            paymentModelId: i.paymentModelId,
                          },
                        });
                      }}
                    >
                      {localizations.pay}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {loadingMore && (
          <div>
            <ReactLoading type="spinningBubbles" color={colors.blue} />
          </div>
        )}
        {false &&
          hasMore &&
          !loadingMore &&
          transactions.edges.length < transactions.count && (
            <div>
              <Button
                color="primary"
                onClick={() => {
                  if (!relay.hasMore()) {
                    this.setState({ hasMore: false });
                  } else {
                    this.setState({ loadingMore: true });
                    relay.loadMore(10, () => {
                      this.setState({ loadingMore: false });
                    });
                  }
                }}
              >
                {localizations.find_loadSportunities}
              </Button>
            </div>
          )}
        {this.state.displayFeesPaymentPopup && (
          <FeesPaymentPopup
            viewer={viewer}
            onClose={() => this.setState({ displayFeesPaymentPopup: false })}
            refetch={this._refetch}
            fromWallet={true}
            {...this.state.feesPaymentPopupProps}
          />
        )}
      </Paper>
    );
  }
}

const styles = {
  cell_header: {
    fontSize: 18,
    color: colors.blue,
  },
  avatar: {
    margin: 10,
    width: 20,
    height: 20,
  },
};

const TransactionsTemp = createPaginationContainer(
  withStyles(styles)(withRouter(Fees)),
  {
    viewer: graphql`
      fragment Fees_viewer on Viewer
        @argumentDefinitions(
          count: { type: "Int", defaultValue: 100 }
          cursor: { type: "String" }
          users: { type: "[String]" }
          doQuery: { type: "Boolean!", defaultValue: false }
        ) {
        ...FeesPaymentPopup_viewer
        me {
          id
        }
        users(first: $count, after: $cursor, ids: $users)
          @include(if: $doQuery)
          @connection(key: "Viewer_users") {
          edges {
            node {
              id
              pseudo
              avatar
              circlesUserIsIn(circlesWithFeesOnly: true) {
                edges {
                  node {
                    id
                    name
                    owner {
                      id
                      pseudo
                      avatar
                      paymentModelFees
                    }
                    askedInformation {
                      id
                      name
                      type
                      filledByOwner
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
                    paymentModels {
                      id
                      name
                      price {
                        cents
                        currency
                      }
                      conditions {
                        id
                        name
                        price {
                          cents
                          currency
                        }
                        conditions {
                          askedInformation {
                            id
                            type
                          }
                          askedInformationComparator
                          askedInformationComparatorValue
                          askedInformationComparatorDate
                          askedInformationComparatorValueString
                        }
                      }
                      memberSubscriptions {
                        user {
                          id
                        }
                        amount {
                          cents
                          currency
                        }
                        beginning_date
                        ending_date
                      }
                      paymentViaBankWireAllowed
                      memberToPayFees
                      inAppPaymentAllowed
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      // function that should indicate which connection to paginate over
      return props.viewer && props.viewer.users;
    },
    // This is also the default implementation of `getFragmentVariables` if it isn't provided.
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount,
      };
    },
    getVariables(props, { count, cursor }, fragmentVariables) {
      return {
        count,
        cursor,
        filter: fragmentVariables.filter,
        doQuery: fragmentVariables.doQuery,
      };
    },
    query: graphql`
      query FeesTemp_Query(
        $count: Int
        $cursor: String
        $users: [String]
        $doQuery: Boolean!
      ) {
        viewer {
          ...Fees_viewer
            @arguments(
              count: $count
              cursor: $cursor
              users: $users
              doQuery: $doQuery
            )
        }
      }
    `,
  },
);

export default props => {
  const { users, noDataMessage } = props;
  return (
    <QueryRenderer
      environment={environment}
      query={graphql`
        query FeesQuery($doQuery: Boolean!, $users: [String]) {
          viewer {
            ...Fees_viewer @arguments(doQuery: $doQuery, users: $users)
          }
        }
      `}
      variables={{
        doQuery: true,
        users: users,
      }}
      render={({ error, props }) => {
        if (props) {
          return (
            <div>
              <TransactionsTemp
                viewer={props.viewer}
                users={users}
                noDataMessage={noDataMessage}
              />
            </div>
          );
        }
        return (
          <div>
            <ReactLoading type="spinningBubbles" color={colors.blue} />
          </div>
        );
      }}
    />
  );
};

// helper functions

function isConditionFilled(condition, answer) {
  if (!answer || !answer.value) {
    return false;
  }
  switch (condition.askedInformation.type) {
    case 'NUMBER': {
      switch (condition.askedInformationComparator) {
        case '≤': {
          return (
            parseInt(answer.value) <= condition.askedInformationComparatorValue
          );
        }
        case '<': {
          return (
            parseInt(answer.value) < condition.askedInformationComparatorValue
          );
        }
        case '=': {
          return (
            parseInt(answer.value) ===
            condition.askedInformationComparatorValue
          );
        }
        case '>': {
          return (
            parseInt(answer.value) > condition.askedInformationComparatorValue
          );
        }
        case '≥': {
          return (
            parseInt(answer.value) >= condition.askedInformationComparatorValue
          );
        }
      }
    }
    case 'BOOLEAN': {
      if (
        (condition.askedInformationComparatorValue === 1 &&
          answer.value === 'true') ||
        (condition.askedInformationComparatorValue === 0 &&
          answer.value === 'false')
      )
        return true;
      else return false;
    }
    case 'DATE': {
      switch (condition.askedInformationComparator) {
        case '≤': {
          if (
            moment(answer.value).isBefore(
              condition.askedInformationComparatorDate,
            )
          )
            return true;
          else return false;
        }
        case '≥': {
          if (
            moment(answer.value).isAfter(
              condition.askedInformationComparatorDate,
            )
          )
            return true;
          else return false;
        }
      }
    }
    case 'CUSTOM': {
      return condition.askedInformationComparatorValueString === answer.value;
    }
    default:
      return false;
  }
}

function _getAmoutToPayText(circle, paymentModel, userId) {
  let price = _getAmoutToPay(circle, paymentModel, userId);
  if (price) return price.cents / 100 + ' ' + price.currency;
  else return '-';
}

function _getAmoutToPay(circle, paymentModel, userId) {
  let conditionListFilled = null;
  let numberOfValidAnswer = 0;
  let userInformation = circle.membersInformation.filter(
    info => info.user.id === userId,
  );

  paymentModel.conditions.forEach(condition => {
    let conditionAreValidated = true;
    let currentNumberOfValidAnswer = 0;

    condition.conditions.forEach(cond => {
      let memberInfoIndex = userInformation.findIndex(
        userInfo => userInfo.information === cond.askedInformation.id,
      );

      if (
        cond.askedInformation.type === 'BOOLEAN' ||
        isConditionFilled(cond, userInformation[memberInfoIndex])
      ) {
        currentNumberOfValidAnswer++;
      } else conditionAreValidated = false;
    });

    if (
      conditionAreValidated &&
      currentNumberOfValidAnswer > numberOfValidAnswer
    ) {
      numberOfValidAnswer = currentNumberOfValidAnswer;
      conditionListFilled = condition;
    }
  });

  if (conditionListFilled) {
    if (paymentModel.memberToPayFees) {
      return {
        cents: conditionListFilled.price.cents * (1 + circle.owner.paymentModelFees / 100),
        currency: conditionListFilled.price.currency,
      };
    } 
    else {
      return conditionListFilled.price;
    }
  } 
  else {
      if (paymentModel.memberToPayFees) {
          return {
              cents: paymentModel.price.cents * (1 + circle.owner.paymentModelFees / 100),
              currency: paymentModel.price.currency
          }
      }
      else 
          return paymentModel.price
  }
}

function _didUserFillAll(circle, paymentModel, userId) {
  let paymentModelAskedInformation = [];
  paymentModel.conditions.forEach(condition => {
    condition.conditions.forEach(cond => {
      paymentModelAskedInformation = paymentModelAskedInformation.concat(
        cond.askedInformation,
      );
    });
  });

  let didUserFillAll = true;
  paymentModelAskedInformation.forEach(askedInfo => {
    if (
      !circle.membersInformation ||
      (askedInfo.type !== 'BOOLEAN' &&
        circle.membersInformation.findIndex(
          memberInfo =>
            userId === memberInfo.user.id &&
            memberInfo.information === askedInfo.id,
        ) < 0)
    )
      didUserFillAll = false;
  });

  return didUserFillAll;
}

function _didUserPayFees(status, circle, paymentModel, userId) {
  if (status === 'Paid') {
    return (
      !!paymentModel.memberSubscriptions &&
      paymentModel.memberSubscriptions.length > 0 &&
      paymentModel.memberSubscriptions.findIndex(
        memberSubscription => memberSubscription.user.id === userId,
      ) >= 0
    );
  } else if (status === 'ToBePaid') {
    return (
      !!paymentModel.memberSubscriptions &&
      (paymentModel.memberSubscriptions.length === 0 ||
        (paymentModel.memberSubscriptions.length > 0 &&
          paymentModel.memberSubscriptions.findIndex(
            memberSubscription => memberSubscription.user.id === userId,
          ) < 0))
    );
  }
}
