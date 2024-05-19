import React, { PureComponent } from 'react';
import { Grid, AppBar, Tabs, Tab, Paper, NoSsr } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { createRefetchContainer, graphql } from 'react-relay';
import { connect } from 'react-redux';
import { withRouter } from 'found';
import ReactLoading from 'react-loading'

import { fonts, colors } from '../../theme'
import Sportunities from './Sportunities';
import Circles from './Circles';
import Users from './Users';
import Loading from '../common/Loading/Loading';
import localizations from '../Localizations';

let style

class SearchComponent extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      tab: 0,
      activities: 0,
      groups: 0,
      users: 0,
    };
    this.removeTransitionHook = props.router.addTransitionHook(() => {
      this.setState({ loading: true });
      return true;
    });
    this.setTab = this.setTab.bind(this);
    this.setCount = this.setCount.bind(this);
    this.doSearch = this.doSearch.bind(this);
  }

  componentDidMount() {
    if (this.props.location.query.q) {
      this.doSearch(this.props.location.query.q);
    } 
    else {
      this.setState({ loading: false });
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      prevProps.location.query.q !== this.props.location.query.q &&
      this.props.location.query.q
    ) {
      this.setState({ loading: true }, () => {
        this.doSearch(this.props.location.query.q);
      });
    }
  }

  componentWillUnmount() {
    this.removeTransitionHook();
  }

  setTab(tab) {
    this.setState({ tab });
  }

  setCount(tab, count) {
    const n = parseInt(count);
    if (n) {
      this.setState({
        [tab]: n,
      });
    }
  }

  doSearch(q) {
    const refetchVariables = fragmentVariables => ({
      ...fragmentVariables,
      sportunitiesFilter: { searchByName: q },
      circlesFilter: { nameCompletion: q, code: q, circleType: ["MY_CIRCLES", "CIRCLES_I_AM_IN", "CHILDREN_CIRCLES", "PUBLIC_CIRCLES", "OTHER_TEAMS_CIRCLES"] },
      usersFilter: q,
      doSearch: true,
    });
    this.props.relay.refetch(
      refetchVariables,
      null,
      () => {
        this.setState({ loading: false });
      },
      { force: true },
    );
  }

  render() {
    const { loading, tab, activities, groups, users } = this.state;
    const { viewer, classes, language } = this.props;
    
    return (
      <NoSsr>
        <Grid container spacing={40} justify="center">
          <Grid item xs={12}>
            <Paper square>
              <AppBar color="primary" position="static">
                <Tabs
                  className={classes.root_tabs}
                  value={tab}
                  onChange={(e, value) => {
                    this.setState({ tab: value });
                  }}
                  variant="fullWidth"
                  indicatorColor="primary"
                  textColor="primary"
                >
                  <Tab label={localizations.myEvents_all} />
                  <Tab
                    label={`${
                      localizations.search_activities
                    } (${activities})`}
                  />
                  <Tab label={`${localizations.search_groups} (${groups})`} />
                  <Tab label={`${localizations.search_persons} (${users})`} />
                </Tabs>
              </AppBar>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            {loading 
            ? <div style={style.loadingContainer}>
                <ReactLoading type='spinningBubbles' color={colors.blue}/>
              </div>
            : <div style={{ marginLeft: 40, marginBottom: 40, maxWidth: 600 }}>
                {tab === 0 && (
                  <Grid item xs={12}>
                      <Paper className={classes.list_paper}>
                        <Sportunities
                          viewer={viewer}
                          setTab={this.setTab}
                          setCount={this.setCount}
                          language={language}
                        />
                      </Paper>
                      <Paper className={classes.list_paper}>
                        <Circles
                          viewer={viewer}
                          setTab={this.setTab}
                          setCount={this.setCount}
                          language={language}
                        />
                      </Paper>
                      <Paper className={classes.list_paper}>
                        <Users
                          viewer={viewer}
                          setTab={this.setTab}
                          setCount={this.setCount}
                          language={language}
                        />
                      </Paper>
                    </Grid>
                )}
                {tab === 1 && (
                  <Sportunities viewer={viewer} active language={language} />
                )}
                {tab === 2 && (
                  <Circles viewer={viewer} active language={language} />
                )}
                {tab === 3 && (
                  <Users viewer={viewer} active language={language} />
                )}
              </div>
            }
          </Grid>
        </Grid>
      </NoSsr>
    );
  }
}

style = {
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 500
  },
}

const styles = theme => ({
  root_tabs: {
    backgroundColor: '#FFF',
  },
  list_paper: {
    maxWidth: 600,
    marginTop: 40,
  },
});

const stateToProps = state => ({
  language: state.globalReducer.language,
});
const dispatchToProps = () => ({});
const ReduxContainer = connect(
  stateToProps,
  dispatchToProps,
)(withRouter(SearchComponent));

export default createRefetchContainer(
  withStyles(styles)(ReduxContainer),
  {
    viewer: graphql`
      fragment SearchPage_viewer on Viewer
        @argumentDefinitions(
          sportunitiesFilter: { type: Filter }
          circlesFilter: { type: CirclesFilter }
          usersFilter: { type: String }
          doSearch: { type: Boolean, defaultValue: true }
        ) {
        ...Sportunities_viewer
          @arguments(
            sportunitiesFilter: $sportunitiesFilter
            doSearch: $doSearch
          )
        ...Circles_viewer
          @arguments(circlesFilter: $circlesFilter, doSearch: $doSearch)
        ...Users_viewer
          @arguments(usersFilter: $usersFilter, doSearch: $doSearch)
        me {
          id
        }
      }
    `,
  },
  graphql`
    query SearchPageQuery(
      $sportunitiesFilter: Filter
      $circlesFilter: CirclesFilter
      $usersFilter: String
      $doSearch: Boolean!
    ) {
      viewer {
        ...SearchPage_viewer
          @arguments(
            sportunitiesFilter: $sportunitiesFilter
            circlesFilter: $circlesFilter
            usersFilter: $usersFilter
            doSearch: $doSearch
          )
      }
    }
  `,
);
