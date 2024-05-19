import React, { Component } from "react";
import { connect } from "react-redux";
import {
  createRefetchContainer,
  graphql,
} from "react-relay/compat";
import {Link} from 'found'
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import InputLabel from "@material-ui/core/InputLabel";
import TextField from "@material-ui/core/TextField";
import Switch from "@material-ui/core/Switch";
import Button from "@material-ui/core/Button";

import CircleItem from './NewGroupCircleItem';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';
import Radium from 'radium';
import { withAlert } from 'react-alert';
import localizations from '../Localizations';

let styles;

class Step2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      language: localizations.getLanguage(),
      filterCircle: '',
    };
    this.renderFinishButton = this.renderFinishButton.bind(this);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.filterCircle !== this.state.filterCircle) {
      this.props.relay.refetch(fragmentVariables => ({
        ...fragmentVariables,
        filterCircle: {
          nameCompletion: this.state.filterCircle,
          circleType: ['PUBLIC_CIRCLES'],
        },
        queryPublicCircle: !!this.state.filterCircle,
      }));
    }
  }

  _setLanguage = language => {
    this.setState({ language });
  };

  renderNextButton() {
    return (
      <Button
        color="primary"
        variant="contained"
        onClick={() => this.props.onNextClicked()}
      >
        {localizations.newSportunity_next}
      </Button>
    );
  }

  renderFinishButton() {
    return (
      <Button
        color="primary"
        variant="contained"
        onClick={() => this.props.onFinishClicked()}
      >
        {localizations.new_group_finish}
      </Button>
    );
  }

  render() {
    const { props } = this;
    const { group } = this.props;
    return (
      <div>
        <Paper elevation={4} style={{ padding: '8px 70px 0px' }}>
          <form autoComplete="off">
            <Grid container spacing={24}>
              {/*row 1*/}
              <Grid item xs={12} container spacing={24}>
                <Grid item xs={12}>
                  <h1 style={styles.title}>
                    {localizations.new_group_privacy}
                  </h1>
                  <h3 style={styles.subtitle}>{localizations.newcircle_step.replace('{0}', 2).replace('{1}', 3)}</h3>
                </Grid>
              </Grid>
              <Grid item xs={12} style={{ paddingTop: 0, paddingBottom: 0 }}>
                <hr
                  style={{
                    paddingTop: 0,
                    marginTop: 0,
                    marginBottom: 25,
                    marginLeft: -70,
                    marginRight: -70,
                  }}
                />
              </Grid>
              {/* row 2 */}
              <Grid item xs={12}>
                <InputLabel style={{...styles.label, ...styles.inline}} htmlFor="input-mode">
                  {group.mode === "PUBLIC" ?
                    localizations.new_group_public_group :
                    localizations.new_group_private_group
                  }
                </InputLabel>
                <Switch
                  required
                  id="input-mode"
                  color="primary"
                  checked={group.mode === 'PUBLIC'}
                  onChange={(e, checked) => {
                    checked
                      ? props.onModeChanged('PUBLIC')
                      : props.onModeChanged('PRIVATE');
                  }}
                />
                <p style={styles.inline}>
                  {group.mode === 'PUBLIC'
                    ? localizations.new_group_public_group_string
                    : localizations.new_group_private_group_string}
                </p>
              </Grid>
              {/* row 3 */}
              <Grid item xs={12}>
                <InputLabel style={{...styles.label, ...styles.inline}} htmlFor="input-link">{localizations.new_group_invite}</InputLabel>
                <Switch
                  required
                  id="input-link"
                  color="primary"
                  checked={group.isCircleAccessibleFromUrl}
                  onChange={(e, checked) => {
                    props.onLinkChanged(checked);
                  }}
                />
                <p style={styles.inline}>
                  {localizations.new_group_invite_string}
                </p>
              </Grid>
            </Grid>
          </form>
        </Paper>
        {/* paper 2 */}
        <Paper
          elevation={4}
          style={{ padding: '25px 70px 0px', marginTop: '50px' }}
        >
          <Grid container spacing={24}>
            <Grid item xs={12} container spacing={24}>
              <Grid item xs={6}>
                <h1 style={styles.title}>
                  {localizations.new_group_visibility}
                </h1>
                <h3 style={styles.subtitle}>
                  {localizations.new_group_visibility_string}
                </h3>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  id="input-search"
                  placeholder={localizations.new_group_find_circle}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  onChange={e =>
                    this.setState({ filterCircle: e.target.value })
                  }
                />
              </Grid>
              {/* circles from search */}
              <Grid item xs={6}>
                {this.props.viewer &&
                  this.props.viewer.circles &&
                  this.props.viewer.circles.edges &&
                  this.props.viewer.circles.edges.map(i =>
                    group.circlesInPrivateMode.indexOf(i.node.id) >
                    -1 ? null : (
                      <CircleItem
                        key={i.node.id}
                        circle={i.node}
                        link={''}
                        circleIsMine={true}
                        addCircle={() => props.onCircleAdd(i.node)}
                      />
                    ),
                  )}
                <p style={styles.subtitle}>
                  {localizations.new_group_my_groups}
                </p>
                {/* private circles */}
                {this.props.viewer && this.props.viewer.me.circles && this.props.viewer.me.circles.edges && (
                  this.props.viewer.me.circles.edges.length > 0
                  ? this.props.viewer.me.circles.edges.map(i =>
                      group.circlesInPrivateMode.indexOf(i.node.id) > -1 ?
                        null :
                        <CircleItem
                          key={i.node.id}
                          circle={i.node}
                          link={""}
                          circleIsMine={true}
                          addCircle={()=> props.onCircleAdd(i.node)}
                        />
                    )
                  : <span style={{fontFamily: 'Lato', fontSize: 14, marginTop: 20}}>
                      {localizations.searchModule_No_Group.split('{0}')[0]}
                      <Link to="/my-circles">
                        {localizations.searchModule_No_Group_link}
                      </Link>
                      {localizations.searchModule_No_Group.split('{0}')[1]}
                    </span>
                )}
              </Grid>
            </Grid>
            {/* line */}
            {props.circlesInPrivateMode && props.circlesInPrivateMode.length > 0 && 
              <Grid item xs={12} style={{ paddingTop: 0, paddingBottom: 0 }}>
                <hr
                  style={{
                    paddingTop: 0,
                    marginTop: 0,
                    marginBottom: 25,
                    marginLeft: -70,
                    marginRight: -70,
                  }}
                />
              </Grid>
            }
            {props.circlesInPrivateMode && props.circlesInPrivateMode.length > 0 && 
              <Grid item xs={12}>
                <h3 style={styles.subtitle}>
                  {localizations.new_group_visibility_string_all}
                </h3>
              </Grid>
            }
            {/* display circlesInPrivateMode */}
            {props.circlesInPrivateMode && props.circlesInPrivateMode.length > 0 && 
              <Grid item xs={6}>
                {props.circlesInPrivateMode.map(i => (
                  <CircleItem
                    key={i.id}
                    circle={i}
                    link={''}
                    circleIsMine={true}
                    removeCircle={() => props.onCircleRemove(i.id)}
                  />
                ))}
              </Grid>
            }
            {/* line */}
            <Grid item xs={12} style={{ paddingTop: 0, paddingBottom: 0 }}>
              <hr
                style={{
                  paddingTop: 0,
                  marginTop: 0,
                  marginBottom: 25,
                  marginLeft: -70,
                  marginRight: -70,
                }}
              />
            </Grid>
            <Grid item xs={12} style={{ paddingTop: 0 }}>
              {this.renderNextButton()}
            </Grid>
          </Grid>
        </Paper>
      </div>
    );
  }
}

//redux, relay
const dispatchToProps = dispatch => ({});
const stateToProps = state => ({});
let ReduxContainer = connect(
  stateToProps,
  dispatchToProps,
)(Radium(Step2));

export default createRefetchContainer(
  withAlert(ReduxContainer),
  {
    viewer: graphql`
      fragment step2_viewer on Viewer
        @argumentDefinitions(
          filterCircle: { type: "CirclesFilter" }
          queryPublicCircle: { type: "Boolean!", defaultValue: false }
        ) {
        me {
          id
          circles {
            edges {
              node {
                id
                ...NewGroupCircleItem_circle
              }
            }
          }
        }
        circles(filter: $filterCircle) @include(if: $queryPublicCircle) {
          edges {
            node {
              id
              ...NewGroupCircleItem_circle
            }
          }
        }
      }
    `,
  },
  graphql`
    query step2RefetchQuery(
      $filterCircle: CirclesFilter!
      $queryPublicCircle: Boolean!
    ) {
      viewer {
        ...step2_viewer
          @arguments(
            filterCircle: $filterCircle
            queryPublicCircle: $queryPublicCircle
          )
      }
    }
  `,
);

styles = {
  title: {
    marginBottom: 10,
    color: '#4E4E4E',
    fontFamily: 'Lato',

    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    marginBottom: 5,
    color: '#646464',
    fontSize: 15,
  },
  label: {
    fontSize: '15px',
  },
  input: {
    marginBottom: 25,
  },
  select: {
    marginBottom: 4,
  },
  inline: {
    display: 'inline',
  },
};
