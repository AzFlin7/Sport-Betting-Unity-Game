import React, { PureComponent } from 'react';
import {
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
} from '@material-ui/core';
import { createPaginationContainer, graphql } from 'react-relay';
import MyCircle from '../MyCircles/MyCirclesCircleItem';
import ReactLoading from 'react-loading';
import { colors } from '../../theme';
import localizations from '../Localizations';

class CirclesComponent extends PureComponent {
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
      this.props.viewer.circles &&
      this.props.viewer.circles.count
    ) {
      this.props.setCount('groups', this.props.viewer.circles.count);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.setCount &&
      prevProps.viewer.circles.count !== this.props.viewer.circles.count
    ) {
      this.props.setCount('groups', this.props.viewer.circles.count);
    }
  }

  render() {
    const { viewer, relay, active, setTab } = this.props;
    const { circles } = viewer;
    const { hasMore, loadingMore } = this.state;
    if (!circles || !circles.count) {
      return <div />;
    }
    return (
      <div>
        <List>
          {!active && (
            <ListItem divider>
              <ListItemAvatar>
                <img src="/images/Group.svg" width={30} alt="groups" />
              </ListItemAvatar>
              <ListItemText
                primary={`${localizations.search_groups} (${circles.count})`}
              />
              <ListItemSecondaryAction>
                <Button
                  onClick={() => {
                    setTab(2);
                  }}
                >
                  {localizations.search_see_all}
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          )}
          {circles.edges.map(i => (
            <ListItem key={i.node.id}>
              <MyCircle
                viewer={viewer}
                link={`/circle/${i.node.id}`}
                circle={i.node}
                circleIsMine={false}
              />
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
            circles.edges.length < circles.count && (
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

export default createPaginationContainer(
  CirclesComponent,
  {
    viewer: graphql`
      fragment Circles_viewer on Viewer
        @argumentDefinitions(
          circlesFilter: { type: CirclesFilter }
          count: { type: "Int", defaultValue: 3 }
          cursor: { type: "String" }
          doSearch: { type: "Boolean!", defaultValue: false }
        ) {
        circles(first: $count, after: $cursor, filter: $circlesFilter)
          @connection(key: "Viewer_circles", filters: ["circlesFilter"])
          @include(if: $doSearch) {
          count
          edges {
            node {
              id
              ...MyCirclesCircleItem_circle
            }
          }
        }
      }
    `,
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      // unction that should indicate which connection to paginate over
      return props.viewer && props.viewer.circles;
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
        circlesFilter: fragmentVariables.circlesFilter,
        doSearch: fragmentVariables.doSearch,
      };
    },
    query: graphql`
      query CirclesSearchPage_Query(
        $circlesFilter: CirclesFilter
        $count: Int
        $cursor: String
        $doSearch: Boolean!
      ) {
        viewer {
          ...Circles_viewer
            @arguments(
              circlesFilter: $circlesFilter
              count: $count
              cursor: $cursor
              doSearch: $doSearch
            )
        }
      }
    `,
  },
);
