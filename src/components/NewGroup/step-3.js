import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import InputLabel from '@material-ui/core/InputLabel';
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';

import Radium from 'radium';
import { withAlert } from 'react-alert';
import localizations from '../Localizations';

let styles;

class Step3 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      language: localizations.getLanguage(),
      filterCircle: '',
    };
    this.renderFinishButton = this.renderFinishButton.bind(this);
  }

  _setLanguage = language => {
    this.setState({ language });
  };

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
              <Grid item xs={12} container spacing={24}>
                <Grid item xs={12}>
                  <h1 style={styles.title}>
                    {localizations.new_group_advanced_settings}
                  </h1>
                  <h3 style={styles.subtitle}>{localizations.newcircle_step.replace('{0}', 3).replace('{1}', 3)}</h3>
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
              <Grid item xs={12}>
                <InputLabel
                  style={{ ...styles.label, ...styles.inline }}
                  htmlFor="input-link"
                >
                  {group.isChatActive
                    ? localizations.circle_enabledChat
                    : localizations.circle_disabledChat}
                </InputLabel>
                <Switch
                  required
                  id="input-link"
                  color="primary"
                  checked={group.isChatActive}
                  onChange={(e, checked) => {
                    props.handleIsChatActive(checked);
                  }}
                />
                <p style={styles.inline}>
                  {group.isChatActive
                    ? localizations.circle_disableChatExplanation
                    : localizations.circle_enableChatExplanation}
                </p>
              </Grid>
              <Grid item xs={12}>
                <InputLabel
                  style={{ ...styles.label, ...styles.inline }}
                  htmlFor="input-link"
                >
                  {localizations.circle_validateNewUser}
                </InputLabel>
                <Switch
                  required
                  id="input-link"
                  color="primary"
                  checked={group.shouldValidateNewUser}
                  onChange={(e, checked) => {
                    props.handleshouldValidateNewUser(checked);
                  }}
                />
                <p style={styles.inline}>
                  {group.shouldValidateNewUser 
                  ? localizations.circle_validateNewUserExplanation
                  : localizations.circle_validateNewUserExplanationOff
                  }
                </p>
              </Grid>
              <Grid item xs={12} style={{ paddingTop: 0 }}>
                {this.renderFinishButton()}
              </Grid>
            </Grid>
          </form>
        </Paper>
      </div>
    );
  }
}

export default withAlert(Radium(Step3));


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
