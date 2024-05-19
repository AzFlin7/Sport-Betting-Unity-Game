import React, { Component } from 'react';
import {
  Paper,
  Grid,
  FormControl,
  TextField,
  FormLabel,
  Button,
} from '@material-ui/core';
import ReactSelect from 'react-select';
import _ from 'lodash';
import localizations from '../Localizations';
import moment from 'moment';

export class ColumnsFilter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...this.props.filter,
    };
  }
  render() {
    const LANG = localizations.getLanguage().toUpperCase() || 'EN';
    const {
      organizer,
      title,
      description,
      beginningDayFrom,
      beginningDayTo,
      beginningTimeFrom,
      beginningTimeTo,
      endingDayFrom,
      endingDayTo,
      endingTimeFrom,
      endingTimeTo,
      minParticipants,
      maxParticipants,
      sport,
      sportLevelFrom,
      sportLevelTo,
      type,
      opponent,
      address,
      kind,
      priceFrom,
      priceTo,
      summonGroup,
      summonUsers,
      coOrganizer,
      status,
    } = this.state;
    const { data, sports } = this.props;

    let organizerOptions = [];
    let sportOptions = [];
    let sportLevelOptions = [];
    let typeOptions = [];
    let opponentOptions = [];
    let addressOptions = [];
    let kindOptions = [
      { label: localizations.circles_private, value: 'PRIVATE' },
      { label: localizations.circles_public, value: 'PUBLIC' },
    ];
    let summonGroupOptions = [];
    let summonUsersOptions = [];
    let coOrganizerOptions = [];
    let statusOptions = [
      { label: localizations.status_organized, value: 'Organized' },
      { label: localizations.status_cancelled, value: 'Cancelled' },
    ];
    data.map(i => {
      const { node } = i;
      if (node.organizers && node.organizers.length) {
        node.organizers.map(j => {
          if (j.isAdmin) {
            organizerOptions.push({
              label: j.organizer.pseudo,
              value: j.organizer.id,
            });
          }
        });
      }
      if (node.sportunityType && node.sportunityType.name) {
        typeOptions.push({
          label: node.sportunityType.name[LANG],
          value: node.sportunityType.name[LANG],
        });
      }
      if (
        node.game_information &&
        node.game_information.opponent &&
        node.game_information.opponent.organizer &&
        node.game_information.opponent.organizer.id
      ) {
        opponentOptions.push({
          label: node.game_information.opponent.organizer.pseudo,
          value: node.game_information.opponent.organizer.id,
        });
      }
      if (node.address && node.address.city) {
        addressOptions.push({
          label: node.address.city,
          value: node.address.city,
        });
      }
      if (
        node.invited_circles &&
        node.invited_circles.edges &&
        node.invited_circles.edges.length
      ) {
        node.invited_circles.edges.map(j => {
          summonGroupOptions.push({
            label: j.node.name,
            value: j.node.id,
          });
        });
      }
      if (node.invited && node.invited.length) {
        node.invited.map(j => {
          summonUsersOptions.push({
            label: j.user.pseudo,
            value: j.user.id,
          });
        });
      }
      if (node.organizers && node.organizers.length) {
        node.organizers.map(j => {
          if (!j.isAdmin) {
            coOrganizerOptions.push({
              label: j.organizer.pseudo,
              value: j.organizer.id,
            });
          }
        });
      }
    });
    sports.map(i => {
      sportOptions.push({
        label: i.node.name[LANG],
        value: i.node.id,
      });
      if (i.node.id === sport && i.node.levels && i.node.levels.length) {
        i.node.levels.map(j => {
          sportLevelOptions.push({
            label: j[LANG].name,
            value: j[LANG].skillLevel,
          });
        });
      }
    });
    organizerOptions = _.uniqBy(organizerOptions, 'value');
    typeOptions = _.uniqBy(typeOptions, 'value');
    opponentOptions = _.uniqBy(opponentOptions, 'value');
    addressOptions = _.uniqBy(addressOptions, 'value');
    summonGroupOptions = _.uniqBy(summonGroupOptions, 'value');
    summonUsersOptions = _.uniqBy(summonUsersOptions, 'value');
    coOrganizerOptions = _.uniqBy(coOrganizerOptions, 'value');
    sportLevelOptions = sportLevelOptions.sort(compare);
    return (
      <div>
        <Paper style={{ padding: 40 }}>
          <Grid container justify="space-around" spacing={40}>
            {/* organizer */}
            <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
              <FormControl fullWidth>
                <FormLabel>{localizations.datasheet_organizer}</FormLabel>
                <ReactSelect
                  isMulti
                  value={organizerOptions.filter(i =>
                    organizer.includes(i.value),
                  )}
                  options={organizerOptions}
                  onChange={opt => {
                    this.setState({ organizer: opt.map(i => i.value) });
                  }}
                />
              </FormControl>
            </Grid>
            {/* title */}
            <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
              <FormControl fullWidth>
                <FormLabel>{localizations.datasheet_title}</FormLabel>
                <TextField
                  label=""
                  value={title}
                  onChange={e => {
                    this.setState({ title: e.target.value });
                  }}
                  margin="normal"
                />
              </FormControl>
            </Grid>
            {/* description */}
            <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
              <FormControl fullWidth>
                <FormLabel>{localizations.datasheet_description}</FormLabel>
                <TextField
                  label=""
                  value={description}
                  onChange={e => {
                    this.setState({ description: e.target.value });
                  }}
                  margin="normal"
                />
              </FormControl>
            </Grid>
            {/* beginning day */}
            <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
              <FormControl fullWidth>
                <FormLabel>{localizations.datasheet_beginning_day}</FormLabel>
                <TextField
                  label={localizations.find_from}
                  placeholder={moment().format('DD/MM/YYYY')}
                  value={beginningDayFrom}
                  margin="normal"
                  onChange={e => {
                    this.setState({
                      beginningDayFrom: e.target.value,
                    });
                  }}
                  onBlur={() => {
                    if (!moment(beginningDayFrom, 'DD/MM/YYYY').isValid()) {
                      this.setState({
                        beginningDayFrom: '',
                      });
                    }
                  }}
                />
                <TextField
                  label={localizations.find_to}
                  placeholder={moment().format('DD/MM/YYYY')}
                  value={beginningDayTo}
                  margin="normal"
                  onChange={e => {
                    this.setState({
                      beginningDayTo: e.target.value,
                    });
                  }}
                  onBlur={() => {
                    if (!moment(beginningDayTo, 'DD/MM/YYYY').isValid()) {
                      this.setState({
                        beginningDayTo: '',
                      });
                    }
                  }}
                />
              </FormControl>
            </Grid>
            {/* beginning time */}
            <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
              <FormControl fullWidth>
                <FormLabel>{localizations.datasheet_beginning_hour}</FormLabel>
                <TextField
                  label={localizations.find_from}
                  placeholder={moment().format('HH:mm')}
                  value={beginningTimeFrom}
                  margin="normal"
                  onChange={e => {
                    this.setState({
                      beginningTimeFrom: e.target.value,
                    });
                  }}
                  onBlur={() => {
                    if (!moment(beginningTimeFrom, 'HH:mm').isValid()) {
                      this.setState({
                        beginningTimeFrom: '',
                      });
                    }
                  }}
                />
                <TextField
                  label={localizations.find_to}
                  placeholder={moment().format('HH:mm')}
                  value={beginningTimeTo}
                  margin="normal"
                  onChange={e => {
                    this.setState({
                      beginningTimeTo: e.target.value,
                    });
                  }}
                  onBlur={() => {
                    if (!moment(beginningTimeTo, 'HH:mm').isValid()) {
                      this.setState({
                        beginningTimeTo: '',
                      });
                    }
                  }}
                />
              </FormControl>
            </Grid>
            {/* ending day */}
            <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
              <FormControl fullWidth>
                <FormLabel>{localizations.datasheet_ending_day}</FormLabel>
                <TextField
                  label={localizations.find_from}
                  placeholder={moment().format('DD/MM/YYYY')}
                  value={endingDayFrom}
                  margin="normal"
                  onChange={e => {
                    this.setState({
                      endingDayFrom: e.target.value,
                    });
                  }}
                  onBlur={() => {
                    if (!moment(endingDayFrom, 'DD/MM/YYYY').isValid()) {
                      this.setState({
                        endingDayFrom: '',
                      });
                    }
                  }}
                />
                <TextField
                  label={localizations.find_to}
                  placeholder={moment().format('DD/MM/YYYY')}
                  value={endingDayTo}
                  margin="normal"
                  onChange={e => {
                    this.setState({
                      endingDayTo: e.target.value,
                    });
                  }}
                  onBlur={() => {
                    if (!moment(endingDayTo, 'DD/MM/YYYY').isValid()) {
                      this.setState({
                        endingDayTo: '',
                      });
                    }
                  }}
                />
              </FormControl>
            </Grid>
            {/* ending time */}
            <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
              <FormControl fullWidth>
                <FormLabel>{localizations.datasheet_ending_hour}</FormLabel>
                <TextField
                  label={localizations.find_from}
                  placeholder={moment().format('HH:mm')}
                  value={endingTimeFrom}
                  margin="normal"
                  onChange={e => {
                    this.setState({
                      endingTimeFrom: e.target.value,
                    });
                  }}
                  onBlur={() => {
                    if (!moment(endingTimeFrom, 'HH:mm').isValid()) {
                      this.setState({
                        endingTimeFrom: '',
                      });
                    }
                  }}
                />
                <TextField
                  label={localizations.find_to}
                  placeholder={moment().format('HH:mm')}
                  value={endingTimeTo}
                  margin="normal"
                  onChange={e => {
                    this.setState({
                      endingTimeTo: e.target.value,
                    });
                  }}
                  onBlur={() => {
                    if (!moment(endingTimeTo, 'HH:mm').isValid()) {
                      this.setState({
                        endingTimeTo: '',
                      });
                    }
                  }}
                />
              </FormControl>
            </Grid>
            {/* participants */}
            <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
              <FormControl fullWidth>
                <FormLabel>{localizations.myStatPrefs_participants}</FormLabel>
                <TextField
                  label={localizations.find_from}
                  value={minParticipants}
                  onChange={e => {
                    if (
                      parseInt(e.target.value) >= 0 ||
                      e.target.value === ''
                    ) {
                      this.setState({
                        minParticipants: e.target.value,
                      });
                    }
                  }}
                  margin="normal"
                />
                <TextField
                  label={localizations.find_to}
                  value={maxParticipants}
                  onChange={e => {
                    if (
                      parseInt(e.target.value) >= 0 ||
                      e.target.value === ''
                    ) {
                      this.setState({
                        maxParticipants: e.target.value,
                      });
                    }
                  }}
                  margin="normal"
                />
              </FormControl>
            </Grid>
            {/* sport */}
            <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
              <FormControl fullWidth>
                <FormLabel>{localizations.datasheet_sport}</FormLabel>
                <ReactSelect
                  isClearable
                  value={sportOptions.filter(i => sport === i.value)}
                  options={sportOptions}
                  onChange={opt => {
                    if (opt && opt.value) {
                      this.setState({
                        sport: opt.value,
                        sportLevelFrom: '',
                        sportLevelTo: '',
                      });
                    } else {
                      this.setState({
                        sport: '',
                        sportLevelFrom: '',
                        sportLevelTo: '',
                      });
                    }
                  }}
                />
              </FormControl>
            </Grid>
            {/* sport level */}
            <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
              <FormControl fullWidth>
                <FormLabel>
                  {localizations.datasheet_sport_level_from}
                </FormLabel>
                <ReactSelect
                  isClearable
                  value={sportLevelOptions.filter(
                    ({ value }) => value === sportLevelFrom,
                  )}
                  options={sportLevelOptions}
                  onChange={opt => {
                    if (opt && opt.value) {
                      this.setState({ sportLevelFrom: opt.value });
                    } else {
                      this.setState({ sportLevelFrom: '' });
                    }
                  }}
                />
              </FormControl>
              <FormControl fullWidth>
                <FormLabel>{localizations.datasheet_sport_level_to}</FormLabel>
                <ReactSelect
                  isClearable
                  value={sportLevelOptions.filter(
                    ({ value }) => value === sportLevelTo,
                  )}
                  options={sportLevelOptions}
                  onChange={opt => {
                    if (opt && opt.value) {
                      this.setState({ sportLevelTo: opt.value });
                    } else {
                      this.setState({ sportLevelTo: '' });
                    }
                  }}
                />
              </FormControl>
            </Grid>
            {/* activity type */}
            <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
              <FormControl fullWidth>
                <FormLabel>{localizations.datasheet_type}</FormLabel>
                <ReactSelect
                  isMulti
                  value={typeOptions.filter(i => type.includes(i.value))}
                  options={typeOptions}
                  onChange={opt => {
                    this.setState({ type: opt.map(i => i.value) });
                  }}
                />
              </FormControl>
            </Grid>
            {/* opponent */}
            <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
              <FormControl fullWidth>
                <FormLabel>{localizations.datasheet_opponent}</FormLabel>
                <ReactSelect
                  isMulti
                  value={opponentOptions.filter(i =>
                    opponent.includes(i.value),
                  )}
                  options={opponentOptions}
                  onChange={opt => {
                    this.setState({ opponent: opt.map(i => i.value) });
                  }}
                />
              </FormControl>
            </Grid>
            {/* address */}
            <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
              <FormControl fullWidth>
                <FormLabel>{localizations.datasheet_address}</FormLabel>
                <ReactSelect
                  isMulti
                  value={addressOptions.filter(i => address.includes(i.value))}
                  options={addressOptions}
                  onChange={opt => {
                    this.setState({ address: opt.map(i => i.value) });
                  }}
                />
              </FormControl>
            </Grid>
            {/* kind */}
            <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
              <FormControl fullWidth>
                <FormLabel>{localizations.datasheet_kind}</FormLabel>
                <ReactSelect
                  isMulti
                  value={kindOptions.filter(i => kind.includes(i.value))}
                  options={kindOptions}
                  onChange={opt => {
                    this.setState({ kind: opt.map(i => i.value) });
                  }}
                />
              </FormControl>
            </Grid>
            {/* price */}
            <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
              <FormControl fullWidth>
                <FormLabel>{localizations.datasheet_price}</FormLabel>
                <TextField
                  label={localizations.find_from}
                  value={priceFrom}
                  onChange={e => {
                    if (
                      parseInt(e.target.value) >= 0 ||
                      e.target.value === ''
                    ) {
                      this.setState({ priceFrom: e.target.value });
                    }
                  }}
                  margin="normal"
                />
                <TextField
                  label={localizations.find_to}
                  value={priceTo}
                  onChange={e => {
                    if (
                      parseInt(e.target.value) >= 0 ||
                      e.target.value === ''
                    ) {
                      this.setState({ priceTo: e.target.value });
                    }
                  }}
                  margin="normal"
                />
              </FormControl>
            </Grid>
            {/* summoned groups */}
            <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
              <FormControl fullWidth>
                <FormLabel>{localizations.datasheet_summon_group}</FormLabel>
                <ReactSelect
                  isMulti
                  value={summonGroupOptions.filter(i =>
                    summonGroup.includes(i.value),
                  )}
                  options={summonGroupOptions}
                  onChange={opt => {
                    this.setState({ summonGroup: opt.map(i => i.value) });
                  }}
                />
              </FormControl>
            </Grid>
            {/* summoned users */}
            <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
              <FormControl fullWidth>
                <FormLabel>{localizations.datasheet_summon_user}</FormLabel>
                <ReactSelect
                  isMulti
                  value={summonUsersOptions.filter(i =>
                    summonUsers.includes(i.value),
                  )}
                  options={summonUsersOptions}
                  onChange={opt => {
                    this.setState({ summonUsers: opt.map(i => i.value) });
                  }}
                />
              </FormControl>
            </Grid>
            {/* co-organizer */}
            <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
              <FormControl fullWidth>
                <FormLabel>{localizations.datasheet_co_organizers}</FormLabel>
                <ReactSelect
                  isMulti
                  value={coOrganizerOptions.filter(i =>
                    coOrganizer.includes(i.value),
                  )}
                  options={coOrganizerOptions}
                  onChange={opt => {
                    this.setState({ coOrganizer: opt.map(i => i.value) });
                  }}
                />
              </FormControl>
            </Grid>
            {/* status */}
            <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
              <FormControl fullWidth>
                <FormLabel>{localizations.datasheet_status}</FormLabel>
                <ReactSelect
                  isMulti
                  value={statusOptions.filter(i => status.includes(i.value))}
                  options={statusOptions}
                  onChange={opt => {
                    this.setState({ status: opt.map(i => i.value) });
                  }}
                />
              </FormControl>
            </Grid>
            {/* buttons */}
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <Button
                variant="contained"
                color="primary"
                style={{ margin: 10 }}
                onClick={() => {
                  this.props.submit(this.state);
                }}
              >
                {localizations.circle_alert_circle_is_private_ok}
              </Button>
              <Button
                variant="contained"
                color="primary"
                style={{ margin: 10 }}
                onClick={this.props.close}
              >
                {
                  localizations.circle_alert_circle_is_private_message_switch_cancel
                }
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </div>
    );
  }
}

// for sorting sport level
function compare(a, b) {
  if (a.value < b.value) return -1;
  if (a.value > b.value) return 1;
  return 0;
}
