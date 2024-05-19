import React, { PureComponent } from 'react';
import {
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Avatar,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { createPaginationContainer, graphql } from 'react-relay';
import PseudoInfoForTable from '../common/PseudoInfoForTable';
import ReactLoading from 'react-loading';
import { colors } from '../../theme';
import localizations from '../Localizations';

class UsersComponent extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      hasMore: true,
      loadingMore: false,
    };
  }

  componentDidMount() {
    if (
      this.props.setCount &&
      this.props.viewer.users &&
      this.props.viewer.users.count
    ) {
      this.props.setCount('users', this.props.viewer.users.count);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.setCount &&
      prevProps.viewer.users.count !== this.props.viewer.users.count
    ) {
      this.props.setCount('users', this.props.viewer.users.count);
    }
  }

  render() {
    const { viewer, relay, active, setTab, classes } = this.props;
    const { users } = viewer;
    const { hasMore, loadingMore } = this.state;
    if (!users || !users.count) {
      return <div />;
    }
    return (
      <div>
        <List>
          {!active && (
            <ListItem divider>
              <ListItemAvatar>
                <Avatar
                  alt="activities"
                  src="https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png"
                  className={classes.avatar}
                />
              </ListItemAvatar>
              <ListItemText
                primary={`${localizations.search_persons} (${users.count})`}
              />
              <ListItemSecondaryAction>
                <Button
                  onClick={() => {
                    setTab(3);
                  }}
                >
                  {localizations.search_see_all}
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          )}
          {users.edges.map(i => (
            <ListItem key={i.node.id}>
              <Paper style={{ width: '100%', padding: 20 }}>
                <PseudoInfoForTable member={i.node} />
              </Paper>
            </ListItem>
          ))}
          {loadingMore && (
            <ListItem>
              <ReactLoading type="spinningBubbles" color={colors.blue} />
            </ListItem>
          )}
          {active &&
            hasMore &&
            !loadingMore &&
            users.edges.length < users.count && (
              <ListItem>
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
              </ListItem>
            )}
        </List>
      </div>
    );
  }
}

const styles = {
  avatar: {
    width: 30,
    height: 30,
  },
};

export default createPaginationContainer(
  withStyles(styles)(UsersComponent),
  {
    viewer: graphql`
      fragment Users_viewer on Viewer
        @argumentDefinitions(
          usersFilter: { type: String }
          count: { type: "Int", defaultValue: 3 }
          cursor: { type: "String" }
          doSearch: { type: "Boolean!", defaultValue: false }
        ) {
        users(first: $count, after: $cursor, pseudo: $usersFilter)
          @connection(key: "Viewer_users", filters: ["usersFilter"])
          @include(if: $doSearch) {
          count
          edges {
            node {
              id
              pseudo
              avatar
              firstName
              lastName
              circlesUserIsIn {
                edges {
                  node {
                    id
                    name
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
        usersFilter: fragmentVariables.usersFilter,
        doSearch: fragmentVariables.doSearch,
      };
    },
    query: graphql`
      query UsersSearchPage_Query(
        $usersFilter: String
        $count: Int
        $cursor: String
        $doSearch: Boolean!
      ) {
        viewer {
          ...Users_viewer
            @arguments(
              usersFilter: $usersFilter
              count: $count
              cursor: $cursor
              doSearch: $doSearch
            )
        }
      }
    `,
  },
);
