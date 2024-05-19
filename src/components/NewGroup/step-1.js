import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

import MaterialReactSelect from './MaterialReactSelect';
import MaterialGeoSuggest from './MaterialGeoSuggest';
import localizations from '../Localizations';

let styles;

class Step1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      language: localizations.getLanguage(),
      selectAccountIsOpen: false, 
      errors: {
        name: false,
        description: false,
        updatable: false,
        account: false,
        sport: false,
      },
    };
    this._setLanguage = this._setLanguage.bind(this);
  }

  _setLanguage = language => {
    this.setState({ language });
  };

  componentDidMount() {
    this.setState({selectAccountIsOpen: this.props.isCreatingForSubAccount})
  }

  render() {
    const { props } = this;
    const { group } = this.props;
    const { errors } = this.state;
    let selectedSport = props.sports.find(
      sport => sport.node.id === props.group.sport.sport,
    );

    return (
      <Paper elevation={4} style={{ padding: '8px 70px 0px' }}>
        <form autoComplete="off">
          <Grid container spacing={40}>
            {/* row 1*/}
            <Grid item xs={12} container spacing={40}>
              <Grid item xs={12} sm={6}>
                <h1 style={styles.title}>{localizations.new_group_header}</h1>
                <h3 style={styles.subtitle}>{localizations.newcircle_step.replace('{0}', 1).replace('{1}', 3)}</h3>
              </Grid>
              <Grid item xs>
                <InputLabel style={styles.label} htmlFor="input-account">
                  {localizations.new_group_account_selection}
                </InputLabel>
                <br />
                <Select
                  required
                  fullWidth
                  value={group.owner}
                  inputProps={{
                    name: 'account',
                    id: 'input-account',
                  }}
                  onChange={e => props.onAccountChanged(e.target.value)}
                  error={errors.account}
                  open={this.state.selectAccountIsOpen}
                  onClose={() => this.setState({selectAccountIsOpen: false})}
                  onOpen={() => this.setState({selectAccountIsOpen: true})}
                >
                  {props.accounts.map(i => (
                    <MenuItem key={i.id} value={i.id}>
                      {i.pseudo}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
            </Grid>
            <Grid item xs={12} style={{ paddingTop: 0 }}>
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
            <Grid item xs={12} container spacing={40}>
              <Grid item xs={12} sm={6}>
                <InputLabel style={styles.label} htmlFor="input-name">
                  {localizations.new_group_title}
                </InputLabel>
                <br />
                <TextField
                  required
                  fullWidth
                  id="input-name"
                  value={group.name}
                  placeholder={localizations.new_group_group_name}
                  onChange={e => props.onNameChanged(e.target.value)}
                  error={errors.name}
                />
              </Grid>
              <Grid item xs>
                <InputLabel style={styles.label} htmlFor="input-sport-sport">
                  {localizations.new_group_sport}
                </InputLabel>
                <br />
                <MaterialReactSelect
                  value={props.group.sport.sport}
                  options={props.sports.map(i => ({
                    value: i.node.id,
                    label: !!i.node.name[
                      localizations.getLanguage().toUpperCase()
                    ]
                      ? i.node.name[localizations.getLanguage().toUpperCase()]
                      : i.node.name.EN,
                  }))}
                  onChange={option => props.onSportChanged(option.value)}
                  error={errors.sport}
                />
              </Grid>
            </Grid>
            {/* row 3 */}
            <Grid item xs={12} container spacing={40}>
              <Grid item xs={12} sm={6}>
                <InputLabel style={styles.label} htmlFor="input-description">
                  {localizations.new_group_description}
                </InputLabel>
                <br />
                <TextField
                  required
                  fullWidth
                  multiline
                  value={group.description}
                  id="input-description"
                  placeholder={localizations.new_group_description_placeholder}
                  rows="4"
                  onChange={e => props.onDescriptionChanged(e.target.value)}
                  error={errors.description}
                />
              </Grid>
              <Grid item xs>
                <InputLabel style={styles.label} htmlFor="input-sport-level">
                  {localizations.new_group_level_range}
                </InputLabel>
                <br />
                <Select
                  multiple
                  fullWidth
                  value={group.sport.levels}
                  inputProps={{
                    name: 'type',
                    id: 'input-sport-level',
                  }}
                  renderValue={selected =>
                    selected
                      .map(
                        selectedItem =>
                          selectedSport &&
                          selectedSport.node.levels.find(
                            level => selectedItem === level.id,
                          ) &&
                          selectedSport.node.levels.find(
                            level => selectedItem === level.id,
                          )[localizations.getLanguage().toUpperCase()] &&
                          selectedSport.node.levels.find(
                            level => selectedItem === level.id,
                          )[localizations.getLanguage().toUpperCase()].name,
                      )
                      .join(', ')
                  }
                  onChange={e =>
                    props.onSportLevelChanged(
                      e.target.value,
                      selectedSport.node,
                    )
                  }
                >
                  {selectedSport &&
                    selectedSport.node.levels &&
                    selectedSport.node.levels.map(j => (
                      <MenuItem key={j.id} value={j.id}>
                        <Checkbox
                          checked={
                            group.sport.levels.findIndex(
                              level => level === j.id,
                            ) >= 0
                          }
                        />
                        {!!j[localizations.getLanguage().toUpperCase()]
                          ? j[localizations.getLanguage().toUpperCase()].name
                          : j.EN.name}
                      </MenuItem>
                    ))}
                </Select>
              </Grid>
            </Grid>
            {/* row 4 */}
            <Grid item xs={12} container spacing={40}>
              <Grid item xs={12}>
                <InputLabel style={styles.label} htmlFor="input-address">
                  {localizations.find_city}
                </InputLabel>
                <MaterialGeoSuggest
                  value={props.group.address ? [props.group.address.address, props.group.address.city, props.group.address.country].filter(i => i!=="").join(', ') : null}
                  onChange={option => props.onAddressChanged(option.value)}
                  error={errors.address}
                  inputProps={{
                    name: 'type',
                    id: 'input-address',
                  }}
                />
              </Grid>
            </Grid>
            {/* row 5 */}
            <Grid item xs={12} container spacing={40}>
              <Grid item xs={12}>
                <InputLabel style={styles.label} htmlFor="input-type">
                  {localizations.new_group_type}
                </InputLabel>
                <br />
                <Select
                  required
                  fullWidth
                  value={group.type}
                  inputProps={{
                    name: 'type',
                    id: 'input-type',
                  }}
                  onChange={e => props.onTypeChanged(e.target.value)}
                  error={errors.type}
                >
                  <MenuItem value="ADULTS">
                    {localizations.new_group_type_adults}
                  </MenuItem>
                  <MenuItem value="CHILDREN">
                    {localizations.new_group_type_children}
                  </MenuItem>
                  <MenuItem value="TEAMS">
                    {localizations.new_group_type_teams}
                  </MenuItem>
                  <MenuItem value="CLUBS">
                    {localizations.new_group_type_clubs}
                  </MenuItem>
                  <MenuItem value="COMPANIES">
                    {localizations.new_group_type_companies}
                  </MenuItem>
                </Select>
              </Grid>
            </Grid>
            {/* row 6 */}
            <Grid item xs={12} container spacing={40}>
              <Grid item xs={12}>
                <InputLabel style={styles.label} htmlFor="input-mode">
                  {localizations.new_group_open_usage}
                </InputLabel>
                <Switch
                  required
                  id="input-mode"
                  color="primary"
                  checked={group.isCircleUpdatableByMembers}
                  onChange={(e, checked) => {
                    props.onUpdatableChanged(checked);
                  }}
                  error={errors.updatable}
                />
                <p style={styles.inline}>
                  {localizations.new_group_open_usage_string}
                </p>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <hr
                style={{ marginBottom: 0, marginLeft: -70, marginRight: -70 }}
              />
            </Grid>
            <Grid item xs={12} style={{ paddingTop: 0 }}>
              <Button
                color="primary"
                variant="contained"
                onClick={() => {
                  let errors = JSON.parse(JSON.stringify(this.state.errors));
                  group.name ? (errors.name = false) : (errors.name = true);
                  group.description
                    ? (errors.description = false)
                    : (errors.description = true);
                  group.type ? (errors.type = false) : (errors.type = true);
                  group.owner
                    ? (errors.account = false)
                    : (errors.account = true);
                  group.sport.sport
                    ? (errors.sport = false)
                    : (errors.sport = true);
                  group.address
                    ? (errors.address = false)
                    : (errors.address = true);
                  const hasErrors =
                    Object.keys(errors).filter(i => errors[i]).length !== 0;
                  hasErrors
                    ? this.setState({ errors })
                    : props.onNextClicked();
                }}
              >
                {localizations.newSportunity_next}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    );
  }
}

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
    color: '#353535',
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
  placeholder: {
    fontSize: 15,
  },
};

export default withStyles(styles, { withTheme: true })(Step1);
