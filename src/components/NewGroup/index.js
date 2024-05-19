import React, { Component } from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';
import { createRefetchContainer, graphql } from 'react-relay/compat';
import { withRouter } from 'found';
import { withAlert } from 'react-alert';
import Loading from '../common/Loading/Loading';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import localizations from '../Localizations';

import Step1 from './step-1';
import Step2 from './step-2';
import Step3 from './step-3';

import newGroupMutation from './NewGroupMutation';
import cloneDeep from 'lodash/cloneDeep';
import { bindActionCreators } from 'redux';
import * as types from '../../actions/actionTypes';

let styles;

class NewGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      saving: false,
      stepIndex: 0,
      maxAllowedStepIndex: 0,
      circlesInPrivateMode: [],
      group: {
        owner: '',
        name: '',
        description: '',
        type: 'ADULTS',
        isCircleUpdatableByMembers: true,
        isCircleAccessibleFromUrl: true,
        shouldValidateNewUser: false,
        isChatActive: false,
        circlesInPrivateMode: [],
        mode: 'PRIVATE',
        sport: {
          sport: '',
          levels: [],
        },
        address: ''
      },
    };
    this.renderStepContent = this.renderStepContent.bind(this);
  }
  componentDidMount() {
    setTimeout(() => this.setState({ loading: false }), 1500);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      !this.state.group.owner &&
      this.props.viewer &&
      this.props.viewer.me &&
      this.props.viewer.me.id
    ) {
      const owner = this.props.viewer.me.id;
      this.setState({ group: { ...this.state.group, owner } });
    }
  }

  renderStepContent(stepIndex) {
    if (this.state.saving) {
      return <Loading />;
    }
    switch (stepIndex) {
      case 0:
        return (
          <Step1
            viewer={this.props.viewer}
            group={this.state.group}
            accounts={[
              {
                id: this.props.viewer.me.id,
                pseudo: this.props.viewer.me.pseudo,
              },
              ...this.props.viewer.me.subAccounts,
            ]}
            onNameChanged={name =>
              this.setState({ group: { ...this.state.group, name } })
            }
            onDescriptionChanged={description =>
              this.setState({ group: { ...this.state.group, description } })
            }
            onTypeChanged={type =>
              this.setState({ group: { ...this.state.group, type } })
            }
            onUpdatableChanged={isCircleUpdatableByMembers =>
              this.setState({
                group: { ...this.state.group, isCircleUpdatableByMembers },
              })
            }
            onAccountChanged={owner =>
              this.setState({ group: { ...this.state.group, owner } })
            }
            onSportChanged={value => {
              const sport = { sport: '', levels: [] };
              sport.sport = value;
              this.setState({ group: { ...this.state.group, sport } });
            }}
            onSportLevelChanged={(value, selectedSport) => {
              const sport = this.state.group.sport;

              if (value.length > 0) {
                const selectedLevels = selectedSport.levels
                  .filter(level => value.indexOf(level.id) >= 0)
                  .sort((a, b) => a.EN.skillLevel - b.EN.skillLevel);
                const lowerSelectedLevel = selectedLevels[0];
                const higherSelectedLevel =
                  selectedLevels[selectedLevels.length - 1];
                const rangedLevels = [];
                selectedSport.levels.forEach(level => {
                  if (
                    level.EN.skillLevel <= higherSelectedLevel.EN.skillLevel &&
                    level.EN.skillLevel >= lowerSelectedLevel.EN.skillLevel
                  )
                    rangedLevels.push(level.id);
                });
                sport.levels = rangedLevels;
              } else {
                sport.levels = value;
              }
              this.setState({ group: { ...this.state.group, sport } });
            }}
            sports={this.props.viewer.sports.edges}
            onAddressChanged={value => {
              if (value) {
                const splitted = value.split(', ');
                const address = splitted.slice(0, splitted.length - 2).join(', ') || '';
                const country = splitted[splitted.length - 1] || '';
                const city = splitted[splitted.length - 2] || '';
        
                this.setState({
                  group: {
                    ...this.state.group,
                    address: {
                      address,
                      country,
                      city,
                    },
                  }
                });
              }
              else {
                this.setState({
                  group: {
                    ...this.state.group,
                    address: null
                  }
                });
              }
            }}
            onNextClicked={() =>
              this.setState({ stepIndex: this.state.stepIndex + 1, maxAllowedStepIndex: this.state.stepIndex + 1 })
            }
            isCreatingForSubAccount={this.props.location.isCreatingForSubAccount}
          />
        );
      case 1:
        return (
          <Step2
            viewer={this.props.viewer}
            group={this.state.group}
            circlesInPrivateMode={this.state.circlesInPrivateMode}
            onModeChanged={mode =>
              this.setState({ group: { ...this.state.group, mode, isChatActive: mode === 'PRIVATE', shouldValidateNewUser: mode === 'PUBLIC' } })
            }
            onLinkChanged={isCircleAccessibleFromUrl =>
              this.setState({
                group: { ...this.state.group, isCircleAccessibleFromUrl },
              })
            }
            onCircleAdd={circle =>
              this.setState({
                group: {
                  ...this.state.group,
                  circlesInPrivateMode: [
                    ...this.state.group.circlesInPrivateMode,
                    circle.id,
                  ],
                },
                circlesInPrivateMode: [
                  ...this.state.circlesInPrivateMode,
                  circle,
                ],
              })
            }
            onCircleRemove={id => {
              const circlesInPrivateMode = this.state.group.circlesInPrivateMode.filter(
                i => i !== id,
              );
              const circlesInPrivateModeNodes = this.state.circlesInPrivateMode.filter(
                i => i.id !== id,
              );
              this.setState({
                group: { ...this.state.group, circlesInPrivateMode },
                circlesInPrivateMode: circlesInPrivateModeNodes,
              });
            }}
            onNextClicked={() =>
              this.setState({ stepIndex: this.state.stepIndex + 1, maxAllowedStepIndex: this.state.stepIndex + 1 })
            }
          />
        );
      case 2:
        return (
          <Step3
            viewer={this.props.viewer}
            group={this.state.group}
            handleshouldValidateNewUser={shouldValidateNewUser =>
              this.setState({
                group: { ...this.state.group, shouldValidateNewUser },
              })
            }
            handleIsChatActive={isChatActive =>
              this.setState({
                group: {
                  ...this.state.group,
                  isChatActive,
                },
              })
            }
            onFinishClicked={() => {
              this.setState({ saving: true });
              newGroupMutation.commit(
                { group: this.state.group },
                {
                  onSuccess: response => {
                    console.log(response);
                    if (response.newCircle) {
                      this.props.router.push(
                        `/circle/${response.newCircle.edge.node.id}`,
                      );
                    }
                    this._updateTutorialSteps();
                  },
                  onError: error => {
                    this.setState({ saving: false });
                    this.props.alert.show('Failed!', {
                      timeout: 3000,
                      type: 'error',
                    });
                  },
                },
              );
            }}
          />
        );
    }
  }

  _updateTutorialSteps = () => {
    const { tutorialSteps } = this.props;
    let newTutorialSteps = cloneDeep(tutorialSteps);

    newTutorialSteps['createCircleStep'] = true;
    this.props._updateStepsCompleted(newTutorialSteps);
  };

  render() {
    if (this.state.loading) {
      return <Loading />;
    }
    const { viewer } = this.props;
    return (
      <div>
        <div style={styles.container}>
          <Paper elevation={0} style={styles.mainPaper}>
            <Grid container spacing={0}>
              <Grid item xs={12} sm={12} md={2}>
                <Paper elevation={0} style={styles.menuPaper}>
                  <MenuList style={styles.menuList}>
                    <MenuItem
                      onClick={() => this.setState({ stepIndex: 0 })}
                      style={
                        this.state.stepIndex === 0
                          ? { ...styles.menuItem }
                          : {}
                      }
                    >
                      {localizations.new_group_advanced_information}
                    </MenuItem>
                    <MenuItem
                      onClick={() => this.state.maxAllowedStepIndex  >= 1 && this.setState({ stepIndex: 1 })}
                      style={
                        this.state.stepIndex === 1
                          ? { ...styles.menuItem }
                          : {}
                      }
                    >
                      {localizations.new_group_advanced_privacy}
                    </MenuItem>
                    <MenuItem
                      onClick={() => this.state.maxAllowedStepIndex  >= 2 && this.setState({ stepIndex: 2 })}
                      style={
                        this.state.stepIndex === 2
                          ? { ...styles.menuItem }
                          : {}
                      }
                    >
                      {localizations.new_group_advanced_settings}
                    </MenuItem>
                  </MenuList>
                </Paper>
              </Grid>
              <Grid item xs>
                <div>{this.renderStepContent(this.state.stepIndex)}</div>
              </Grid>
            </Grid>
          </Paper>
        </div>
        <div />
      </div>
    );
  }
}

//redux, relay
const _updateStepsCompleted = steps => ({
  type: types.UPDATE_STEPS_COMPLETED,
  tutorialSteps: steps,
});

const dispatchToProps = dispatch => ({
  _updateStepsCompleted: bindActionCreators(_updateStepsCompleted, dispatch),
});

const stateToProps = state => ({
  userCurrency: state.globalReducer.userCurrency,
  tutorialSteps: state.profileReducer.tutorialSteps,
});

let ReduxContainer = connect(
  stateToProps,
  dispatchToProps,
)(Radium(NewGroup));

export default createRefetchContainer(
  withRouter(withAlert(ReduxContainer)),
  {
    // OK
    viewer: graphql`
      fragment NewGroup_viewer on Viewer {
        ...step2_viewer
        id
        me {
          ...Organizers_user
          id
          pseudo
          subAccounts {
            id
            pseudo
          }
        }
        sports {
          edges {
            node {
              id
              name {
                EN
                FR
                DE
                ES
              }
              levels {
                id
                EN {
                  name
                  description
                  skillLevel
                }
                FR {
                  name
                  description
                  skillLevel
                }
                ES {
                  name
                  description
                  skillLevel
                }
                DE {
                  name
                  description
                  skillLevel
                }
              }
            }
          }
        }
      }
    `,
  },
  graphql`
    query NewGroupRefetchQuery {
      viewer {
        ...NewGroup_viewer
      }
    }
  `,
);

styles = {
  container: {
    paddingTop: 40,
    paddingBottom: 63,

    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    width: '100%',

    fontFamily: 'Lato',
    backgroundColor: '#F3F3F3',
  },
  mainPaper: {
    backgroundColor: 'transparent',
    width: '94%',
  },
  menuPaper: {
    backgroundColor: 'transparent',
    borderRadius: 0,
  },
  menuList: {
    backgroundColor: 'transparent',
    padding: 0,
  },
  menuItem: {
    borderLeft: '5px solid #5EA1D9',
    backgroundColor: '#FFFFFF',
    boxShadow: 'box-shadow: inset -7px 0 9px -7px rgba(0,0,0,0.4)',
  },
};
