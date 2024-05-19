import React, { PureComponent } from 'react';
import {
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemAvatar,
} from '@material-ui/core';
import { createPaginationContainer, graphql } from 'react-relay';
import Sportunity from '../common/Sportunity/Sportunity';
import ReactLoading from 'react-loading';
import { colors } from '../../theme';
import localizations from '../Localizations';

class SportunitiesComponent extends PureComponent {
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
      this.props.viewer.sportunities &&
      this.props.viewer.sportunities.count
    ) {
      this.props.setCount('activities', this.props.viewer.sportunities.count);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.setCount &&
      prevProps.viewer.sportunities.count !==
        this.props.viewer.sportunities.count
    ) {
      this.props.setCount('activities', this.props.viewer.sportunities.count);
    }
  }

  render() {
    const { viewer, relay, active, setTab } = this.props;
    const { sportunities } = viewer;
    const { hasMore, loadingMore } = this.state;
    if (!sportunities || !sportunities.count) {
      return <div />;
    }
    return (
      <div>
        <List>
          {!active && (
            <ListItem divider>
              <ListItemAvatar>
                <img
                  src="/images/logo-blue@3x.png"
                  width={30}
                  alt="activities"
                />
              </ListItemAvatar>
              <ListItemText
                primary={`${localizations.search_activities} (${
                  sportunities.count
                })`}
              />
              <ListItemSecondaryAction>
                <Button
                  onClick={() => {
                    setTab(1);
                  }}
                >
                  {localizations.search_see_all}
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          )}
          {sportunities.edges.map(i => (
            <ListItem key={i.node.id}>
              <Sportunity sportunity={i.node} />
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
            sportunities.edges.length < sportunities.count && (
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
  SportunitiesComponent,
  {
    viewer: graphql`
      fragment Sportunities_viewer on Viewer
        @argumentDefinitions(
          sportunitiesFilter: { type: Filter }
          count: { type: "Int", defaultValue: 3 }
          cursor: { type: "String" }
          doSearch: { type: "Boolean!", defaultValue: false }
        ) {
        sportunities(
          first: $count
          after: $cursor
          filter: $sportunitiesFilter
        )
          @connection(
            key: "Viewer_sportunities"
            filters: ["sportunitiesFilter"]
          )
          @include(if: $doSearch) {
          count
          edges {
            node {
              id
              ...Sportunity_sportunity
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
      return props.viewer && props.viewer.sportunities;
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
        sportunitiesFilter: fragmentVariables.sportunitiesFilter,
        doSearch: fragmentVariables.doSearch,
      };
    },
    query: graphql`
      query SportunitiesSearchPage_Query(
        $sportunitiesFilter: Filter
        $count: Int
        $cursor: String
        $doSearch: Boolean!
      ) {
        viewer {
          ...Sportunities_viewer
            @arguments(
              sportunitiesFilter: $sportunitiesFilter
              count: $count
              cursor: $cursor
              doSearch: $doSearch
            )
        }
      }
    `,
  },
);
