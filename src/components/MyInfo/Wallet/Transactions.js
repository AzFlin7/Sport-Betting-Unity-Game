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
import moment from 'moment';
import ReactLoading from 'react-loading';

import environment from 'sportunity/src/createRelayEnvironment';
import { colors } from '../../../theme';
import localizations from '../../Localizations';

class Transactions extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loadingMore: false,
      hasMore: true,
      refetchConnection: false,
    };
    this._refetch = this._refetch.bind(this);
  }

  componentDidMount() {
    this._refetch();
    this.props.onRef && this.props.onRef(this);
  }

  componentWillUnmount = () => {
    this.props.onRef && this.props.onRef(undefined);
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      prevProps.users.length !== this.props.users.length ||
      prevProps.transactionStatus !== this.props.transactionStatus ||
      prevProps.transactionKinds !== this.props.transactionKinds
    ) {
      this.setState({ refetchConnection: true });
    }
    if (this.state.refetchConnection) {
      this._refetch();
    }
  }

  _refetch() {
    this.setState({ refetchConnection: false, loadingMore: true });
    this.props.relay.refetchConnection(
      3,
      () => {
        this.setState({ loadingMore: false });
      },
      {
        doQuery: true,
        filter: {
          transactionStatus: 'DONE',
          users: this.props.users,
          transactionKinds: this.props.transactionKinds,
        },
      },
    );
  }

  render() {
    const { loadingMore, hasMore } = this.state;
    const { relay, classes, noDataMessage } = this.props;
    const { me, transactions } = this.props.viewer;
    // loading
    if (!transactions) {
      return (
        <div>
          <ReactLoading type="spinningBubbles" color={colors.blue} />
        </div>
      );
    }
    // no data
    if (transactions.edges && transactions.edges.length === 0) {
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
    const data = transactions.edges.map(i => {
      const name = i.node.kind === 'FEES' && i.node.transactionFeesAreFor
      ? i.node.transactionFeesAreFor.from.pseudo
      : i.node.reason && i.node.reason.sportunity
        ? i.node.reason.sportunity.title
        : i.node.reason.paymentModel
          ? i.node.reason.paymentModel.name
          : '';

      const from = i.node.from ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Avatar
            alt={i.node.from.pseudo}
            src={i.node.from.avatar}
            className={classes.avatar}
          />

          <span>{i.node.from.pseudo}</span>
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
      const to = i.node.to ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Avatar
            alt={i.node.to.pseudo}
            src={i.node.to.avatar}
            className={classes.avatar}
          />
          <span>{i.node.to.pseudo}</span>
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
      const date = moment(i.node.creation_date).format('DD/MM/YYYY');
      let type = '';
      switch (i.node.kind) {
        case 'FEES':
          type = 'FEES';
          break;
        case 'REFUND':
          type = 'REFUND';
          break;
        case 'CASH_OUT':
          type = 'CASH_OUT';
          break;
        case 'CASH_IN':
          type = 'CASH_IN';
          break;
        case 'TRANSFERT':
          type = 'TRANSFERT';
          break;
      }
      const price = `${i.node.amount.cents / 100} ${i.node.amount.currency}`;
      let priceView = <div style={{}}>{price}</div>;
      if (
        type === 'CASH_OUT' ||
        type === 'FEES' ||
        ((type === 'TRANSFERT' || type === 'REFUND') &&
          i.node.from &&
          i.node.from.id &&
          i.node.from.id === me.id)
      ) {
        priceView = <div style={{ color: 'red' }}>{`- ${price}`}</div>;
      }

      return {
        price,
        priceView,
        type,
        name,
        from,
        to,
        date,
      };
    });

    return (
      <Paper elevation={1} style={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className={classes.cell_header}>
                {localizations.price}
              </TableCell>
              <TableCell className={classes.cell_header}>
                {localizations.type}
              </TableCell>
              <TableCell className={classes.cell_header}>
                {localizations.name}
              </TableCell>
              <TableCell className={classes.cell_header}>
                {localizations.debit}
              </TableCell>
              <TableCell className={classes.cell_header}>
                {localizations.credit}
              </TableCell>
              <TableCell className={classes.cell_header}>
                {localizations.date}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(i => (
              <TableRow>
                <TableCell>{i.priceView}</TableCell>
                <TableCell>{i.type}</TableCell>
                <TableCell>{i.name}</TableCell>
                <TableCell>{i.from}</TableCell>
                <TableCell>{i.to}</TableCell>
                <TableCell>{i.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {loadingMore && (
          <div>
            <ReactLoading type="spinningBubbles" color={colors.blue} />
          </div>
        )}
        {hasMore &&
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
  withStyles(styles)(Transactions),
  {
    viewer: graphql`
      fragment Transactions_viewer on Viewer
        @argumentDefinitions(
          count: { type: "Int", defaultValue: 3 }
          cursor: { type: "String" }
          filter: { type: TransactionFilter, defaultValue: { users: [] } }
          doQuery: { type: "Boolean!", defaultValue: false }
        ) {
        me {
          id
        }
        transactions(first: $count, after: $cursor, filter: $filter)
          @include(if: $doQuery)
          @connection(key: "Viewer_transactions", filters: ["filter"]) {
          count
          edges {
            node {
              id
              amount {
                currency
                cents
              }
              from {
                id
                pseudo
                avatar
              }
              to {
                id
                pseudo
                avatar
              }
              kind
              reason {
                sportunity {
                  title
                }
                paymentModel {
                  name
                }
              }
              transactionFeesAreFor {
                id
                from {
                  pseudo
                }
                to {
                  pseudo
                }
              }
              creation_date
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
      return props.viewer && props.viewer.transactions;
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
      query TransactionsTemp_Query(
        $count: Int
        $cursor: String
        $filter: TransactionFilter
        $doQuery: Boolean!
      ) {
        viewer {
          ...Transactions_viewer
            @arguments(
              count: $count
              cursor: $cursor
              filter: $filter
              doQuery: $doQuery
            )
        }
      }
    `,
  },
);

export default props => {
  const { transactionKinds, users, noDataMessage, onRef } = props;
  const transactionStatus = 'DONE';
  return (
    <QueryRenderer
      environment={environment}
      query={graphql`
        query TransactionsQuery(
          $doQuery: Boolean!
          $filter: TransactionFilter
        ) {
          viewer {
            ...Transactions_viewer
              @arguments(doQuery: $doQuery, filter: $filter)
          }
        }
      `}
      variables={{
        doQuery: true,
        filter: {
          transactionStatus,
          users,
          transactionKinds,
        },
      }}
      render={({ error, props }) => {
        if (props) {
          return (
            <div>
              <TransactionsTemp
                viewer={props.viewer}
                transactionStatus={transactionStatus}
                users={users}
                transactionKinds={transactionKinds}
                noDataMessage={noDataMessage}
                onRef={onRef}
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
