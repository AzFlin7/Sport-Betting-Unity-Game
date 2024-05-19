/* eslint react/prop-types: 0 */
/* eslint react/sort-comp: 0 */
/* eslint no-use-before-define: 0 */
/* eslint no-param-reassign: 0 */
/* eslint consistent-return: 0 */
/* eslint array-callback-return: 0 */
/* eslint camelcase: 0 */
import React, { Component } from 'react';
import { createPaginationContainer, graphql } from 'react-relay';
import { connect } from 'react-redux';
import { withAlert } from 'react-alert';
import Radium from 'radium';
import ICAL from 'ical.js';
import moment from 'moment';
import Datasheet from 'react-datasheet';
import isEqual from 'lodash/isEqual';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import RemoveRedEyeOutlinedIcon from '@material-ui/icons/RemoveRedEyeOutlined';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import SvgIcon from '@material-ui/core/SvgIcon';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import DatePicker from 'react-datepicker';

import Loading from '../common/Loading/Loading';
import NewSportunityMutation from './Mutation/DatasheetNewSportunityMutation';
import DeleteSportunityMutation from './Mutation/DatasheetDeleteSportunityMutation';
import UpdateSportunityMutation from './Mutation/DatasheetUpdateSportunityMutation';

import { colors } from '../../theme';
import localizations from '../Localizations';

import InvitedCircleDetails from '../NewSportunity/InvitedCircleDetails';
import Modal from 'react-modal';
import Organizers from '../NewSportunity/Organizers';
import { DescriptionEditor } from './DescriptionEditor';
import { SportEditor } from './SportEditor';
import { SportLevelEditor } from './SportLevelEditor';
import { SportunityTypeEditor } from './SportunityTypeEditor';
import { KindEditor } from './KindEditor';
import { OrganizerEditor } from './OrganizerEditor';
import { AddressEditor } from './AddressEditor';
import { InvitedCirclesEditor } from './InvitedCirclesEditor';
import { InvitedEditor } from './InvitedEditor';
import { OpponentEditor } from './OpponentEditor';
import { InvitedCirclesModal } from './InvitedCirclesModal';
import { InvitedModal } from './InvitedModal';
import { OrganizersEditor } from './OrganizersEditor';
import { StatusEditor } from './StatusEditor';
import { ColumnsFilter } from './ColumnsFilter';

import { defaultColumns } from './defaultCol';
import { defaultFilter } from './defaultFilter';
import { AdministratorPermissions } from '../NewSportunity/AdministratorPermissions';
import ImportActivitiesModal from '../common/Header/ImportActivitiesModal';

var Style = Radium.Style;

const FilterIcon = props => (
  <SvgIcon {...props}>
    <path d="M 22.875 0 L 1.125 0 C 0.128906 0 -0.378906 1.210938 0.332031 1.921875 L 9 10.589844 L 9 20.25 C 9 20.617188 9.179688 20.960938 9.480469 21.171875 L 13.230469 23.796875 C 13.96875 24.3125 15 23.789062 15 22.875 L 15 10.589844 L 23.667969 1.921875 C 24.375 1.214844 23.875 0 22.875 0 Z M 22.875 0 " />
  </SvgIcon>
);

Modal.setAppElement('#root');
let styles;

const muiStyles = theme => ({
  tooltip: {
    fontSize: 14,
  },
  icon: {
    margin: theme.spacing.unit,
  },
  noSelect: {
    '&::selection': {
      background: '#00000000',
    },
    '&::MozSelection': {
      background: '#00000000',
    },
    '& span::selection': {
      background: '#00000000',
    },
    '& span::MozSelection': {
      background: '#00000000',
    },
  },
});

class DatasheetSportunities extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      dataFiltered: [],
      selected: {},
      propsDataSaved: false,
      updated: [],
      errors: [],
      loading: true,
      isLoadingFileOrLink: false,
      invitedCirclesModal: false,
      columns: [],
      resizeCol: {
        index: null,
        offset: 0,
      },
      reorderCol: {
        index: null,
        offset: 0,
      },
      filter: defaultFilter,
      datasheetContainerBoundingClientRectTop: 0,
      showColumnsFilter: false,
      showImportPopup: false,
      downloadExcel: false,
      submitted: false,
    };
    this.rowRenderer = this.rowRenderer.bind(this);
    this.sheetRenderer = this.sheetRenderer.bind(this);
    this.cellRenderer = this.cellRenderer.bind(this);
    this.valueRenderer = this.valueRenderer.bind(this);
    this.dataRenderer = this.dataRenderer.bind(this);
    this.onCellsChanged = this.onCellsChanged.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.saveData = this.saveData.bind(this);
    this.addNewLines = this.addNewLines.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
    this.mouseDownHandler = this.mouseDownHandler.bind(this);
    this.mouseUpHandler = this.mouseUpHandler.bind(this);
    this._startLoadingSportunities = this._startLoadingSportunities.bind(this);
    this._loadMoreSportunities = this._loadMoreSportunities.bind(this);
  }

  componentDidMount() {
    // fetch sportunities
    this._startLoadingSportunities();

    //  add blank lines
    this.addNewLines();

    document.addEventListener('mousemove', this.mouseMoveHandler);
    //  helper event to detect mouse condition
    document.addEventListener('mousedown', this.mouseDownHandler);
    document.addEventListener('mouseup', this.mouseUpHandler);
    //  restore columns from local storage, or set the defaultColumns
    const columns =
      JSON.parse(localStorage.getItem('datasheet_columns')) || defaultColumns;
    this.setState({ columns });

    if (this.props.location && this.props.location.files) {
      this.handleUpload(this.props.location.files)
    }
    else {
      this.syncICSLink()
    }
  }

  componentWillReceiveProps = nextProps => {
    if (this.props.location && nextProps.location && !isEqual(this.props.location.files, nextProps.location.files)) {
      this.handleUpload(nextProps.location.files)
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // update the modified status & id after success
    if (this.state.updated && this.state.updated.length && this.state.updated.length !== prevState.updated.length) {
      const data = JSON.parse(JSON.stringify(this.state.data));
      data.forEach((item, index, arr) => {
        this.state.updated.map(i => {
          // update id
          if (index === i.index) {
            arr[index].modified = false;
            arr[index].node.id = i.id;
            delete arr[index].preSaveStatus;
          }
        });
      });
      // show saved
      this.props.alert.show(localizations.datasheet_saved, {
        timeout: 2000,
        type: 'success',
      });
      if (JSON.stringify(data) !== JSON.stringify(this.state.data)) {
        this.setState({ data });
      }
    }

    //  show error messages
    if (this.state.errors && this.state.errors.length && this.state.errors.length > prevState.errors.length) {
      this.props.alert.show(localizations.datasheet_error, {
        timeout: 2000,
        type: 'error',
      });
    }

    if (this.state.errors.length === 0 && this.state.updated.length === 0 && this.state.submitted) {
      this.props.alert.show(localizations.datasheet_saved, {
        timeout: 2000,
        type: 'success',
      });
      this.setState({submitted: false}) 
    }

    //  save table columns to local storage
    if (this.state.columns && this.state.columns.length && JSON.stringify(prevState.columns) !== JSON.stringify(this.state.column)) {
      localStorage.setItem(
        'datasheet_columns',
        JSON.stringify(this.state.columns),
      );
    }

    // filter on "submitFilter"
    if (this.state.submitFilter) {
      const { filter } = this.state;
      let { data } = this.state;
      // index is "index" in the original "data" state, used for saving
      data = data.map((i, index) => ({ ...i, index }));
      const dataFiltered = applyFilter(data, filter);
      this.setState({ dataFiltered, submitFilter: false });
    }
  }
  componentWillUnmount() {
    document.removeEventListener('mousemove', this.mouseMoveHandler);
    document.removeEventListener('mousedown', this.mouseDownHandler);
    document.removeEventListener('mouseup', this.mouseUpHandler);
  }

  _startLoadingSportunities() {
    const subAccounts = [];
    subAccounts.push(this.props.viewer.me.id);
    if (
      this.props.viewer.me.subAccounts &&
      this.props.viewer.me.subAccounts.length
    ) {
      this.props.viewer.me.subAccounts.map(i => {
        subAccounts.push(i.id);
      });
    }
    this.props.relay.refetchConnection(
      20,
      () => {
        this._loadMoreSportunities();
      },
      {
        includeSportunities: true,
        filter: {
          statuses: ['Organized', 'Cancelled'],
          subAccounts,
        },
      },
    );
  }

  _loadMoreSportunities() {
    this.props.relay.loadMore(20, error => {
      if (error) {
        this.setState({ loading: false });
        console.log(error);
      } else if (this.props.relay.hasMore()) {
        this._loadMoreSportunities();
      } else if (
        this.props.viewer &&
        this.props.viewer.sportunities &&
        this.props.viewer.sportunities.edges
      ) {
        const edges = JSON.parse(
          JSON.stringify(this.props.viewer.sportunities.edges),
        );
        edges.map(i => {
          // hack // we should not display "available" for sub accounts
          // change "available" to "organized"
          if (i.node.status && i.node.status.indexOf('Available') > -1) {
            i.node.status = 'Organized';
          }
        });
        this.setState({
          data: [...edges, ...this.state.data],
          submitFilter: true,
          loading: false,
        });
      } else {
        this.setState({ loading: false });
      }
    });
  }

  mouseMoveHandler(e) {
    //  the resize col function
    if (
      this.mouseDown &&
      this.state.resizeCol &&
      this.state.resizeCol.index >= 0 &&
      this.state.resizeCol.index !== null
    ) {
      const columns = JSON.parse(JSON.stringify(this.state.columns));
      const { index, offset } = this.state.resizeCol;
      columns[index].width = columns[index].width + e.pageX - offset;
      this.setState({
        columns,
        resizeCol: {
          ...this.state.resizeCol,
          offset: e.pageX,
        },
      });
    }
    //  the reorder col function
    if (
      !this.reorderColSaving &&
      this.mouseDown &&
      this.state.reorderCol &&
      this.state.reorderCol.index >= 0 &&
      this.state.reorderCol.index !== null
    ) {
      const columns = JSON.parse(JSON.stringify(this.state.columns));
      const { index, offset } = this.state.reorderCol;
      const movedX = e.pageX - offset;
      if (
        movedX > 0 &&
        columns[index] &&
        columns[index + 1] &&
        movedX > columns[index + 1].width
      ) {
        this.reorderColSaving = true;
        const tmp = columns[index];
        columns[index] = columns[index + 1];
        columns[index + 1] = tmp;
        this.setState(
          {
            columns,
            reorderCol: {
              index: index + 1,
              offset: offset + columns[index].width,
            },
          },
          () => {
            this.reorderColSaving = false;
            clearSelection();
          },
        );
      } else if (
        movedX < 0 &&
        columns[index] &&
        columns[index - 1] &&
        Math.abs(movedX) > columns[index - 1].width
      ) {
        this.reorderColSaving = true;
        const tmp = columns[index];
        columns[index] = columns[index - 1];
        columns[index - 1] = tmp;
        this.setState(
          {
            columns,
            reorderCol: {
              index: index - 1,
              offset: offset - columns[index].width,
            },
          },
          () => {
            this.reorderColSaving = false;
            clearSelection();
          },
        );
      }
    }
  }
  mouseDownHandler() {
    this.mouseDown = true;
  }
  mouseUpHandler() {
    this.mouseDown = false;
    if (
      (this.state.resizeCol &&
        this.state.resizeCol.index !== null &&
        this.state.resizeCol.offset >= 0) ||
      (this.state.reorderCol &&
        this.state.reorderCol.index !== null &&
        this.state.reorderCol.offset >= 0)
    ) {
      this.setState({
        resizeCol: {
          index: null,
          offset: 0,
        },
        reorderCol: {
          index: null,
          offset: 0,
        },
      });
    }
  }
  addNewLines() {
    const newData = [];
    for (let i = 0; i < 20; i++) {
      const newSportunity = JSON.parse(JSON.stringify(Sportunity));
      newSportunity.node.organizers[0] = {
        organizer: {
          id: this.props.viewer.me.id,
          pseudo: this.props.viewer.me.pseudo,
        },
        isAdmin: true,
        permissions: AdministratorPermissions,
      };
      newData.push(newSportunity);
    }
    this.setState({
      data: [...this.state.data, ...newData],
      submitFilter: true,
    });
  }

  sheetRenderer(props) {
    const { columns, reorderCol } = this.state;
    const { classes } = this.props;
    let maxHeight = window.innerHeight;
    if (this.state.datasheetContainerBoundingClientRectTop) {
      maxHeight =
        window.innerHeight -
        this.state.datasheetContainerBoundingClientRectTop;
    }
    return (
      <div>
        <div
          ref={el => {
            if (
              el &&
              this.state.datasheetContainerBoundingClientRectTop !==
                el.getBoundingClientRect().top
            ) {
              this.setState({
                datasheetContainerBoundingClientRectTop: el.getBoundingClientRect()
                  .top,
              });
            }
          }}
          style={{ overflow: 'auto', maxHeight }}
        >
          <Table id="table-to-xls">
            <TableHead>
              <TableRow>
                {columns.map((i, index) => {
                  if (!i.visible) {
                    return null;
                  }
                  return (
                    <TableCell
                      className={classes.noSelect}
                      key={i.name}
                      style={{
                        ...styles.headerCell,
                        minWidth: i.width,
                      }}
                      onMouseDown={e => {
                        this.setState({
                          reorderCol: {
                            index,
                            offset: e.pageX,
                          },
                        });
                      }}
                    >
                      {localizations[i.name]}
                      <div
                        style={styles.resizeHandle}
                        onMouseDown={e => {
                          this.setState({
                            resizeCol: {
                              index,
                              offset: e.pageX,
                            },
                          });
                        }}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>{props.children}</TableBody>
          </Table>
        </div>
      </div>
    );
  }

  rowRenderer(props) {
    const { classes } = this.props;
    let style = {};
    let error = '';
    let myIndex = -1;
    if (props && props.cells && props.cells[0] && props.cells[0].index >= 0) {
      myIndex = props.cells[0].index;
    }
    this.state.errors.map(i => {
      if (i.index === myIndex) {
        style = {
          ...style,
          backgroundColor: '#f08080',
          transition: 'background-color 0ms ease',
        };
        if (i.errors && i.errors[0] && i.errors[0].message) {
          error = i.errors[0].message;
        } else {
          error = localizations.datasheet_error_occurred;
        }
      }
    });
    this.state.updated.map(i => {
      if (i.index === myIndex) {
        style = {
          ...style,
          backgroundColor: '#90ee90',
          transition: 'background-color 0ms ease',
        };
      }
    });
    return (
      <Tooltip classes={{ tooltip: classes.tooltip }} title={error}>
        <TableRow style={style}>{props.children}</TableRow>
      </Tooltip>
    );
  }

  cellRenderer(props) {
    const { columns, reorderCol } = this.state;
    const { classes } = this.props;
    const {
      cell,
      onMouseDown,
      onMouseOver,
      onDoubleClick,
      onContextMenu,
      attributesRenderer,
      row,
      col,
    } = props;
    const { colSpan, rowSpan } = cell;
    const attributes = attributesRenderer
      ? attributesRenderer(cell, row, col)
      : {};
    let style = {
      minWidth: columns[props.col].width,
      ...styles.cell,
    };
    if (props.selected) {
      style = {
        ...style,
        border: '1px double rgb(33, 133, 208)',
        transition: 'none',
        boxShadow: 'inset 0 -100px 0 rgba(33, 133, 208, 0.15)',
      };
    }
    let readOnlyMessage = '';
    if (props.cell.readOnly) {
      style = {
        ...style,
        ...styles.cellReadOnly,
      };
      readOnlyMessage = props.cell.readOnlyMessage;
    }
    if (!columns[col].visible) {
      return null;
    }
    return (
      <Tooltip classes={{ tooltip: classes.tooltip }} title={readOnlyMessage}>
        <TableCell
          className={classes.noSelect}
          {...attributes}
          onMouseDown={onMouseDown}
          onMouseOver={onMouseOver}
          onDoubleClick={onDoubleClick}
          onContextMenu={onContextMenu}
          colSpan={colSpan}
          rowSpan={rowSpan}
          style={style}
        >
          {props.children}
        </TableCell>
      </Tooltip>
    );
  }

  valueRenderer(cell, i, j) {
    switch (cell.name) {
      case 'index':
        return cell.value;
      case 'externalReference':
        return external_idValueRenderer(cell);
      case 'title':
        return titleValueRenderer(cell);
      case 'description':
        return descriptionValueRenderer(cell);
      case 'beginning_day':
        return beginning_dayValueRenderer(cell);
      case 'beginning_hour':
        return beginning_hourValueRenderer(cell);
      case 'ending_day':
        return ending_dayValueRenderer(cell);
      case 'ending_hour':
        return ending_hourValueRenderer(cell);
      case 'participantRangeFrom':
        return participant_rangeFromValueRenderer(cell);
      case 'participantRangeTo':
        return participant_rangeToValueRenderer(cell);
      case 'sport':
        return sport_nameValueRenderer(cell, this.props.language);
      case 'sportLevelFrom':
        return sportLevelFromValueRenderer(cell, this.props.language);
      case 'sportLevelTo':
        return sportLevelToValueRenderer(cell, this.props.language);
      case 'address':
        return addressValueRenderer(cell);
      case 'kind':
        return kindValueRenderer(cell);
      case 'price':
        return priceValueRenderer(cell);
      case 'organizer':
        return organizerValueRenderer(cell);
      case 'organizers':
        return organizersValueRenderer(cell);
      case 'invited_circles':
        return invitedCirclesValueRenderer(cell);
      case 'invited':
        return invitedValueRenderer(cell);
      case 'sportunityType':
        return sportunityTypeValueRenderer(cell, this.props.language);
      case 'opponent':
        return opponentValueRenderer(cell);
      case 'status':
        return statusValueRenderer(cell);
      default:
        return false;
    }
  }

  dataRenderer(cell, i, j) {
    switch (cell.name) {
      case 'externalReference':
        return external_idDataRenderer(cell);
      case 'title':
        return titleDataRenderer(cell);
      case 'description':
        return descriptionDataRenderer(cell);
      case 'beginning_day':
        return beginning_dayDataRenderer(cell);
      case 'beginning_hour':
        return beginning_hourDataRenderer(cell);
      case 'ending_day':
        return enging_dayDataRenderer(cell);
      case 'ending_hour':
        return enging_hourDataRenderer(cell);
      case 'participantRangeFrom':
        return participant_rangeFromDataRenderer(cell);
      case 'participantRangeTo':
        return participant_rangeToDataRenderer(cell);
      case 'sport':
        return sport_nameDataRenderer(
          cell,
          this.props.viewer.sports.edges,
          this.props.language,
        );
      case 'sportLevelFrom':
        return sportLevelFromValueRenderer(cell, this.props.language);
      case 'sportLevelTo':
        return sportLevelToValueRenderer(cell, this.props.language);
      case 'address':
        return addressDataRenderer(cell);
      case 'kind':
        return kindDataRenderer(cell);
      case 'price':
        return priceDataRenderer(cell);
      case 'organizers':
        return organizersDataRenderer(cell);
      case 'organizer':
        return organizerDataRenderer(cell);
      case 'invited_circles':
        return invitedCirclesDataRenderer(cell);
      case 'invited':
        return invitedDataRenderer(cell);
      case 'sportunityType':
        return sportunityTypeDataRenderer(cell, this.props.language);
      case 'opponent':
        return opponentDataRenderer(cell);
      case 'status':
        return statusValueRenderer(cell);
      default:
        return false;
    }
  }

  async onCellsChanged(changes) {
    let beginning_date, ending_date;
    const data = JSON.parse(JSON.stringify(this.state.data));
    for (const change of changes) {
      const { cell, col, value } = change;
      const { selected } = this.state;
      const startRow = Math.min(selected.start.i, selected.end.i);
      const endRow = Math.max(selected.start.i, selected.end.i);
      for (let i = startRow; i <= endRow; i++) {
        // apply changes to all selected cells,
        // if the selection is a column
        //
        // dataFiltered hold the actual index of the state.date
        const myIndex = this.state.dataFiltered[i];
        
        Label: if (cell.name === 'title') {
          data[myIndex].node.title = titleUpdater(cell, value);
        } 
        else if (cell.name === 'description') {
          data[myIndex].node.description = descriptionUpdater(cell, value);
        } 
        else if (cell.name === 'beginning_day') {
          beginning_date = beginning_dayUpdater(
            cell,
            moment(value, 'DD/MM/YYYY'),
          );
          if (value === "")
            data[myIndex].node.beginning_date = ""
          else if (!moment(beginning_date).isValid()) {
            break Label;
          }
          else {
            data[myIndex].node.beginning_date = beginning_date;
            data[myIndex].node.ending_date = cell.ending_date;
          }
        } 
        else if (cell.name === 'beginning_hour') {
          beginning_date = beginning_hourUpdater(cell, value);
          if (value === "")
            data[myIndex].node.beginning_date = ""
          else if (!moment(beginning_date).isValid()) {
            break Label;
          }
          else {
            data[myIndex].node.beginning_date = beginning_date;
            data[myIndex].node.ending_date = cell.ending_date;
          }
        } 
        else if (cell.name === 'ending_day') {
          ending_date = ending_dayUpdater(cell, moment(value, 'DD/MM/YYYY'));
          if (value === "")
            data[myIndex].node.ending_date = ""
          else if (!moment(ending_date).isValid()) {
            break Label;
          }
          else {
            data[myIndex].node.beginning_date = cell.beginning_date;
            data[myIndex].node.ending_date = ending_date;
          }
        } 
        else if (cell.name === 'ending_hour') {
          ending_date = ending_hourUpdater(cell, value);
          if (value === "")
            data[myIndex].node.ending_date = ""
          else if (!moment(ending_date).isValid()) {
            break Label;
          }
          else {
            data[myIndex].node.beginning_date = cell.beginning_date;
            data[myIndex].node.ending_date = ending_date;
          }
        } 
        else if (cell.name === 'participantRangeFrom') {
          const from = participantRangeFromUpdater(cell, value);
          if (value === "") {
            data[myIndex].node.participantRange = {};
            data[myIndex].node.participantRange.from = 0;
            data[myIndex].node.participantRange.to = cell.to;
          }
          else if (!from) {
            break Label;
          }
          else {
            data[myIndex].node.participantRange = {};
            data[myIndex].node.participantRange.from = from;
            data[myIndex].node.participantRange.to = cell.to;
          }
        } 
        else if (cell.name === 'participantRangeTo') {
          const to = participantRangeToUpdater(cell, value);
          if (value === "") {
            data[myIndex].node.participantRange = {};
            data[myIndex].node.participantRange.from = cell.from;
            data[myIndex].node.participantRange.to = 0;
          }
          else if (!to) {
            break Label;
          }
          else {
            data[myIndex].node.participantRange = {};
            data[myIndex].node.participantRange.from = cell.from;
            data[myIndex].node.participantRange.to = to;
          }
        } 
        else if (cell.name === 'sport') {
          let sportValue = value;
          // handle paste value
          try {
            this.props.viewer.sports.edges.map(ii => {
              for (const k in ii.node.name) {
                if (
                  ii.node.name.hasOwnProperty(k) &&
                  ii.node.name[k].toLowerCase() === value.toLowerCase()
                ) {
                  sportValue = ii.node;
                }
              }
            });
          } catch (e) {
            //
          }
          // convert id to node
          this.props.viewer.sports.edges.map(ii => {
            if (ii.node.id === value) {
              sportValue = ii.node;
            }
          });
          data[myIndex].node.sport = {};
          data[myIndex].node.sport.sport = sportValue;
          // reset sportunityType
          data[myIndex].node.sportunityType = {};
        } 
        else if (cell.name === 'sportLevelFrom') {
          const LANG = this.props.language.toUpperCase();
          let level = value;
          // // convert the pasted value to node
          this.props.viewer.sports.edges.map(ii => {
            if (
              ii &&
              ii.node &&
              ii.node.levels &&
              ii.node.levels.length &&
              ii.node.id &&
              data[myIndex].node &&
              data[myIndex].node.sport &&
              data[myIndex].node.sport.sport &&
              data[myIndex].node.sport.sport.id === ii.node.id
            ) {
              ii.node.levels.map(jj => {
                if (
                  jj[LANG].name === level ||
                  jj.EN.name === level ||
                  jj.FR.name === level
                ) {
                  level = jj;
                }
              });
            }
          });
          // //
          const levels = [];
          let maxLevel = 0;
          if (
            data[myIndex].node.sport &&
            data[myIndex].node.sport.levels &&
            data[myIndex].node.sport.levels.length
          ) {
            data[myIndex].node.sport.levels.map(ii => {
              if (ii.EN && ii.EN.skillLevel && ii.EN.skillLevel >= maxLevel) {
                maxLevel = ii.EN.skillLevel;
              }
            });
          } 
          else {
            // no levels are set
            maxLevel = 101;
          }
          this.props.viewer.sports.edges.map(ii => {
            if (
              data[myIndex].node.sport &&
              data[myIndex].node.sport.sport &&
              data[myIndex].node.sport.sport.id &&
              ii.node &&
              ii.node.levels &&
              ii.node.levels.length &&
              ii.node.id === data[myIndex].node.sport.sport.id
            ) {
              ii.node.levels.map(j => {
                if (
                  j.EN.skillLevel >= level.EN.skillLevel &&
                  j.EN.skillLevel <= maxLevel
                ) {
                  levels.push(j);
                }
              });
            }
            data[myIndex].node.sport.levels = levels;
          });
        } 
        else if (cell.name === 'sportLevelTo') {
          const LANG = this.props.language.toUpperCase();
          let level = value;
          // // convert the pasted value to node
          this.props.viewer.sports.edges.map(ii => {
            if (
              ii &&
              ii.node &&
              ii.node.levels &&
              ii.node.levels.length &&
              ii.node.id &&
              data[myIndex].node &&
              data[myIndex].node.sport &&
              data[myIndex].node.sport.sport &&
              data[myIndex].node.sport.sport.id === ii.node.id
            ) {
              ii.node.levels.map(jj => {
                if (
                  jj[LANG].name === level ||
                  jj.EN.name === level ||
                  jj.FR.name === level
                ) {
                  level = jj;
                }
              });
            }
          });
          // //
          const levels = [];
          let minLevel = 101;
          if (
            data[myIndex].node.sport &&
            data[myIndex].node.sport.levels &&
            data[myIndex].node.sport.levels.length
          ) {
            data[myIndex].node.sport.levels.map(ii => {
              if (ii.EN && ii.EN.skillLevel && ii.EN.skillLevel <= minLevel) {
                minLevel = ii.EN.skillLevel;
              }
            });
          } else {
            // no levels are set
            minLevel = 0;
          }
          this.props.viewer.sports.edges.map(ii => {
            if (
              data[myIndex].node.sport &&
              data[myIndex].node.sport.sport &&
              data[myIndex].node.sport.sport.id &&
              ii.node &&
              ii.node.levels &&
              ii.node.levels.length &&
              ii.node.id === data[myIndex].node.sport.sport.id
            ) {
              ii.node.levels.map(j => {
                if (
                  j.EN.skillLevel <= level.EN.skillLevel &&
                  j.EN.skillLevel >= minLevel
                ) {
                  levels.push(j);
                }
              });
            }
            data[myIndex].node.sport.levels = levels;
          });
        } 
        else if (cell.name === 'address') {
          if (value.address && value.country && value.city && value.zip) {
            const { address, country, city, zip } = value;
            data[myIndex].node.address = {};
            data[myIndex].node.address.address = address;
            data[myIndex].node.address.country = country;
            data[myIndex].node.address.city = city;
            data[myIndex].node.address.zip = zip;
          } 
          else {
            // handle paste case
            const { address, country, city, zip } = await addressUpdater(
              value,
            );
            if (address && country && city && zip) {
              data[myIndex].node.address = {};
              data[myIndex].node.address.address = address;
              data[myIndex].node.address.country = country;
              data[myIndex].node.address.city = city;
              data[myIndex].node.address.zip = zip;
            }
            else {
              data[myIndex].node.address = {};
              data[myIndex].node.address.address = "";
              data[myIndex].node.address.country = "";
              data[myIndex].node.address.city = "";
              data[myIndex].node.address.zip = "";
            }
          }
        } 
        else if (cell.name === 'kind') {
          data[myIndex].node.kind = value;
        } 
        else if (cell.name === 'price') {
          data[myIndex].node.price = {};
          data[myIndex].node.price.currency = cell.value.currency;
          data[myIndex].node.price.cents = priceUpdater(cell, value);
        }
        else if (cell.name === 'sportunityType') {
          let val = value;
          // handle paste
          this.props.viewer.sportunityTypes.map(ii => {
            for (const k in ii.name) {
              if (ii.name.hasOwnProperty(k) && ii.name[k] === val) {
                val = ii;
              }
            }
          });
          data[myIndex].node.sportunityType = val;
        } 
        else if (cell.name === 'organizer') {
          const { organizers } = data[myIndex].node;
          this.props.viewer.me.subAccounts.map(ii => {
            if (ii.id === value) {
              let oldAdminIndex = null;
              organizers.map((j, index) => {
                if (j.isAdmin) {
                  oldAdminIndex = index;
                }
              });
              organizers.splice(oldAdminIndex, 1, {
                organizer: { id: ii.id, pseudo: ii.pseudo },
                isAdmin: true,
              });
            }
          });
          // parse paste
          try {
            const parsed = JSON.parse(value);
            if (
              parsed &&
              parsed.organizer &&
              parsed.organizer.id &&
              parsed.organizer.pseudo
            ) {
              let oldAdminIndex = null;
              organizers.map((j, index) => {
                if (j.isAdmin) {
                  oldAdminIndex = index;
                }
              });
              organizers.splice(oldAdminIndex, 1, {
                organizer: {
                  id: parsed.organizer.id,
                  pseudo: parsed.organizer.pseudo,
                },
                isAdmin: true,
              });
            }
          } catch (e) {
            // e
          }
          data[myIndex].node.organizers = organizers;
        } 
        else if (cell.name === 'organizers') {
          const isAdmin = data[myIndex].node.organizers.find(ii => ii.isAdmin);
          if (value === "") {
            data[myIndex].node.organizers = [];
            data[myIndex].node.pendingOrganizers = [];
            data[myIndex].node.organizers.push(isAdmin);
          }
          else {
            // parse paste
            try {
              const parsed = JSON.parse(value);
              const newOrganizers = [];
              const newPendingOrganizers = [];
              if (parsed && parsed.organizers && parsed.organizers.length) {
                parsed.organizers.map(ii => {
                  if (ii && ii.organizer && ii.organizer.id && !ii.isAdmin) {
                    newOrganizers.push(ii);
                  }
                });
              }
              if (
                parsed &&
                parsed.pendingOrganizers &&
                parsed.pendingOrganizers.length
              ) {
                parsed.pendingOrganizers.map(ii => {
                  if (ii.circles && ii.circles.edges) {
                    newPendingOrganizers.push(ii);
                  }
                });
              }
              if (newOrganizers.length || newPendingOrganizers.length) {
                data[myIndex].node.organizers = [];
                data[myIndex].node.pendingOrganizers = [];
                // copy isAdmin back
                data[myIndex].node.organizers.push(isAdmin);
              }
              if (newOrganizers.length) {
                data[myIndex].node.organizers = newOrganizers;
                // copy isAdmin back
                data[myIndex].node.organizers.push(isAdmin);
              }
              if (newPendingOrganizers.length) {
                data[myIndex].node.pendingOrganizers = newPendingOrganizers;
              }
            } 
            catch (e) {
              // e
            }
          }
        } 
        else if (cell.name === 'invited') {
          if (value === "")
            data[myIndex].node.invited = []
          else {
            try {
              const parsed = JSON.parse(value);
              const newUsers = [];
              if (parsed && parsed.length) {
                parsed.map(ii => {
                  if (ii && ii.user && ii.user.id && ii.user.pseudo) {
                    newUsers.push(ii);
                  }
                });
              }
              if (newUsers && newUsers.length) {
                data[myIndex].node.invited = newUsers;
              }
            } catch (e) {
              // e
            }
          }
        } 
        else if (cell.name === 'opponent') {
          let opponent = {};
          if (value.id && value.pseudo) {
            opponent = {
              organizer: {
                ...value,
              },
            };
          }
          // handle paste
          try {
            const parsed = JSON.parse(value);
            if (parsed && parsed.id && parsed.pseudo) {
              opponent = {
                organizer: {
                  ...parsed,
                },
              };
            }
          } catch (e) {
            // e
          }
          if (opponent && opponent.organizer && opponent.organizer.id) {
            data[myIndex].node.game_information =
              data[myIndex].node.game_information || {};
            data[myIndex].node.game_information.opponent = opponent;
          }
          // handle creation of new opponent (no id)
          if (!value.id && value.pseudo) {
            opponent = {
              organizerPseudo: value.pseudo,
            };
          }
          // handle paste of new opponent
          try {
            const parsed = JSON.parse(value);
            if (parsed && !parsed.id && parsed.pseudo) {
              opponent = {
                organizerPseudo: parsed.pseudo,
              };
            }
          } catch (e) {
            // e
          }
          if (opponent && opponent.organizerPseudo) {
            data[myIndex].node.game_information =
              data[myIndex].node.game_information || {};
            data[myIndex].node.game_information.opponent = opponent;
          }
        } 
        else if (cell.name === 'invited_circles') {
          if (value === "")
            data[myIndex].node.invited_circles = {edges: []}
          else {
            try {
              const parsed = JSON.parse(value);
              const newCircles = { edges: [] };
              if (parsed && parsed.edges && parsed.edges.length) {
                parsed.edges.map(ii => {
                  if (ii && ii.node && ii.node.id && ii.node.name) {
                    newCircles.edges.push(ii);
                  }
                });
                if (newCircles.edges.length) {
                  data[myIndex].node.invited_circles = newCircles;
                }
              }
            } catch (e) {
              //
            }
          }
        } 
        else if (cell.name === 'status') {
          let status = '';
          if (statuses.organized.find(ii => ii === value.toLowerCase())) {
            status = 'Organized';
          } else if (
            statuses.cancelled.find(ii => ii === value.toLowerCase())
          ) {
            status = 'Cancelled';
          } else if (statuses.deleted.find(ii => ii === value.toLowerCase())) {
            status = 'Deleted';
          }
          // keep a record of the status before saving it
          data[myIndex].preSaveStatus =
            data[myIndex].preSaveStatus || data[myIndex].node.status;
          //
          data[myIndex].node.status = status;
        }
        // set status as organized for new lines once the user start editing
        if (!data[myIndex].node.id && !data[myIndex].node.status) {
          data[myIndex].node.status = 'Organized';
        }
        // mark as modified
        data[myIndex].modified = true;
      }
    }
    this.setState({ data });
  }

  onSelect(selected) {
    // selected = { start, end }
    this.setState({ selected });
  }

  saveData() {
    // step 0, reset updates & errors
    this.setState({ updated: [], errors: [] }, () => {
      const data = JSON.parse(JSON.stringify(this.state.data));
      let errors = [];
      data.map((item, index) => {
        if (allFieldsCompleted(item.node) && item.modified && item.node.id && item.node.status.indexOf('Deleted') === -1) {
          // update mutation
          const sportunity = JSON.parse(JSON.stringify(item.node));
          delete sportunity.__typename;
          delete sportunity.id;

          // sportunityType
          delete sportunity.SportunityType;
          if (item.node.sportunityType && item.node.sportunityType.id) {
            sportunity.sportunityType = item.node.sportunityType.id;
          }

          // sport
          delete sportunity.sport;
          if (item.node.sport && item.node.sport.sport && item.node.sport.sport.id) {
            sportunity.sport = {};
            sportunity.sport.sport = item.node.sport.sport.id;

            // sport levels
            if (item.node.sport && item.node.sport.levels && item.node.sport.levels.length) {
              sportunity.sport.levels = item.node.sport.levels.map(i => i.id);
            }
          }

          // invited circles
          delete sportunity.invited_circles;
          if (item.node.invited_circles && item.node.invited_circles.edges) {
            sportunity.invited_circles = item.node.invited_circles.edges.map(
              i => i.node.id,
            );
          }
          // price_for_circle
          delete sportunity.price_for_circle;
          if (item.node.price_for_circle && item.node.price_for_circle.length > 0) {
            sportunity.price_for_circle = item.node.price_for_circle.map(
              i => ({
                circle: i.circle.id,
                price: i.price,
              }),
            );
          }

          // invited users
          delete sportunity.invited;
          if (item.node.invited && item.node.invited.length) {
            sportunity.invited = item.node.invited.map(i => ({
              user: i.user.id,
              pseudo: i.user.pseudo,
              answer: i.answer ? i.answer : 'WAITING',
            }));
          }

          // organizers
          delete sportunity.organizers;
          if (item.node.organizers && item.node.organizers.length) {
            sportunity.organizers = item.node.organizers.map(i => ({
              organizer: i.organizer.id,
              circles: i.circles,
              isAdmin: !!i.isAdmin,
              role: i.role ? i.role : 'COACH',
              price: i.price ? i.price : { cents: 0, currency: 'CHF' },
              secondaryOrganizerType: i.secondaryOrganizerType
                ? i.secondaryOrganizerType.id
                : null,
              customSecondaryOrganizerType: i.customSecondaryOrganizerType,
              permissions: i.permissions,
            }));
          }

          // pendingOrganizers
          delete sportunity.pendingOrganizers;
          if (item.node.pendingOrganizers && item.node.pendingOrganizers.length) {
            sportunity.pendingOrganizers = item.node.pendingOrganizers.map(
              i => ({
                circles: i.circles.edges
                  ? i.circles.edges.map(i => i.node.id)
                  : [],
                isAdmin: !!i.isAdmin,
                role: i.role ? i.role : 'COACH',
                price: i.price ? i.price : { cents: 0, currency: 'CHF' },
                secondaryOrganizerType: i.secondaryOrganizerType
                  ? i.secondaryOrganizerType.id
                  : null,
                customSecondaryOrganizerType: i.customSecondaryOrganizerType,
                permissions: i.permissions,
              }),
            );
          }

          // status
          delete sportunity.status;
          delete sportunity.cancel_date;

          if (item.node.status && item.node.status.indexOf('Cancelled') > -1) {
            sportunity.cancel_date = moment();
          }

          // sportunityType
          delete sportunity.sportunityType;
          if (item.node.sportunityType && item.node.sportunityType.id) {
            sportunity.sportunityType = item.node.sportunityType.id;
          }

          // opponent
          delete sportunity.game_information;
          if (item.node.game_information && item.node.game_information && item.node.game_information.opponent && item.node.game_information.opponent.organizer && item.node.game_information.opponent.organizer.id) {
            sportunity.game_information = {};
            sportunity.game_information.opponent = {};
            sportunity.game_information.opponent.organizer =
              item.node.game_information.opponent.organizer.id;
          }

          // opponent new
          if (item.node.game_information && item.node.game_information.opponent && item.node.game_information.opponent.organizerPseudo) {
            sportunity.game_information = {};
            sportunity.game_information.opponent = {};
            sportunity.game_information.opponent.organizerPseudo =
              item.node.game_information.opponent.organizerPseudo;
          }

          // commit
          UpdateSportunityMutation.commit({ 
              sportunityID: item.node.id, 
              sportunity,
              notify_people: false
            },
            {
              onSuccess: () => {
                this.setState({
                  updated: [
                    ...this.state.updated,
                    { id: item.node.id, index },
                  ],
                });
              },
              onFailure: error => {
                this.setState({
                  errors: [...this.state.errors, { error, index }],
                });
              },
            },
          );
        } 
        else if (allFieldsCompleted(item.node) && item.modified && !item.node.id) {
          const newSportunity = JSON.parse(JSON.stringify(item.node));
          
          // sportunityType
          delete newSportunity.__typename;
          delete newSportunity.SportunityType;
          if (item.node.sportunityType && item.node.sportunityType.id) {
            newSportunity.sportunityType = item.node.sportunityType.id;
          }

          // sport
          if (item.node.sport && item.node.sport.sport && item.node.sport.sport.id) {
            newSportunity.sport = {};
            newSportunity.sport.sport = item.node.sport.sport.id;

            // sport levels
            if (item.node.sport && item.node.sport.levels && item.node.sport.levels.length) {
              newSportunity.sport.levels = item.node.sport.levels.map(i => i.id);
            }
          }

          // invited circles
          delete newSportunity.invited_circles;
          if (item.node.invited_circles && item.node.invited_circles.edges) {
            newSportunity.invited_circles = item.node.invited_circles.edges.map(i => i.node.id);
          }

          // price_for_circle
          delete newSportunity.price_for_circle;
          if (item.node.price_for_circle && item.node.price_for_circle.length > 0) {
            newSportunity.price_for_circle = item.node.price_for_circle.map(i => (
              {
                circle: i.circle.id,
                price: i.price,
              }
            ));
          }

          // invited
          delete newSportunity.invited;
          if (item.node.invited && item.node.invited.length) {
            newSportunity.invited = item.node.invited.map(i => (
              {
                user: i.user.id,
                pseudo: i.user.pseudo,
                answer: i.answer ? i.answer : 'WAITING',
              }
            ));
          }

          // organizers
          delete newSportunity.organizers;

          if (item.node.organizers && item.node.organizers.length) {
            newSportunity.organizers = item.node.organizers.map(i => (
              {
                organizer: i.organizer.id,
                circles: i.circles,
                isAdmin: !!i.isAdmin,
                role: i.role ? i.role : 'COACH',
                price: i.price ? i.price : { cents: 0, currency: 'CHF' },
                secondaryOrganizerType: i.secondaryOrganizerType
                  ? i.secondaryOrganizerType.id
                  : null,
                customSecondaryOrganizerType: i.customSecondaryOrganizerType,
                permissions: i.permissions,
              }
            ));
          }

          // pendingOrganizers
          delete newSportunity.pendingOrganizers;
          if (item.node.pendingOrganizers && item.node.pendingOrganizers.length) {
            newSportunity.pendingOrganizers = item.node.pendingOrganizers.map(i => (
              {
                circles: i.circles.edges
                  ? i.circles.edges.map(i => i.node.id)
                  : [],
                isAdmin: !!i.isAdmin,
                role: i.role ? i.role : 'COACH',
                price: i.price ? i.price : { cents: 0, currency: 'CHF' },
                secondaryOrganizerType: i.secondaryOrganizerType
                  ? i.secondaryOrganizerType.id
                  : null,
                customSecondaryOrganizerType: i.customSecondaryOrganizerType,
                permissions: i.permissions,
              }
            ));
          }

          // status, Organized is the only option, no action required
          delete newSportunity.status;
          delete newSportunity.cancel_date;

          // sportunityType
          delete newSportunity.sportunityType;
          if (item.node.sportunityType && item.node.sportunityType.id) {
            newSportunity.sportunityType = item.node.sportunityType.id;
          }

          // opponent
          delete newSportunity.game_information;
          if (item.node.game_information && item.node.game_information && item.node.game_information.opponent && item.node.game_information.opponent.organizer && item.node.game_information.opponent.organizer.id) {
            newSportunity.game_information = {};
            newSportunity.game_information.opponent = {};
            newSportunity.game_information.opponent.organizer =
              item.node.game_information.opponent.organizer.id;
          }

          // commit new mutation
          NewSportunityMutation.commit({ 
              newSportunity,
              notify_people: false
            },
            {
              onSuccess: ({ id }) => {
                this.setState({
                  updated: [...this.state.updated, { id, index }],
                });
              },
              onFailure: error => {
                this.setState({
                  errors: [...this.state.errors, { error, index }],
                });
              },
            },
          );
        } 
        else if (item.modified && item.node.id && item.node.status.indexOf('Deleted') > -1) {
          // delete
          DeleteSportunityMutation.commit(
            { sportunityID: item.node.id },
            {
              onSuccess: () => {
                this.setState({
                  updated: [
                    ...this.state.updated,
                    { id: item.node.id, index },
                  ],
                });
              },
              onFailure: errors => {
                this.setState({
                  errors: [...this.state.errors, { errors, index }],
                });
              },
            },
          );
        } 
        else if (!allFieldsCompleted(item.node) && item.modified) {
          errors.push({
            errors: [
              { message: localizations.datasheet_error_fill_all_fields },
            ],
            index,
          });
        }

        if (errors && errors.length) {
          this.setState({ errors: [...this.state.errors, ...errors] });
        }
      })
      this.setState({submitted: true})
    });
  }

  handleUpload(files) {
    if (!files || !files[0]) {
      return;
    }
    if (files[0].name.split('.').pop() !== 'ics') {
      this.props.alert.show(localizations.datasheet_error_upload_ics, {
        timeout: 2000,
        type: 'error',
      });
      return;
    }

    this.setState({isLoadingFileOrLink: true})
    const file = files[0];
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = async ev => {
      const data = ev.target.result;
      this.readICS(data)
      this._handleCloseModal()
    };

  }

  syncICSLink = () => {
    if (this.props.viewer.me && this.props.viewer.me.icsLinks && this.props.viewer.me.icsLinks.length > 0) {
      this.props.viewer.me.icsLinks.forEach(link => {
        fetch(link, {headers: {'Content-Type': 'text/calendar'}})
        .then(response => response.text())
        .then(response => this.readICS(response))
        .catch(err => {console.log("err", err); this.setState({isLoadingFileOrLink: false})})
      })
    }
  }

  readICS = async data => {
    const jcalData = ICAL.parse(data);
    const comp = new ICAL.Component(jcalData);
    // Fetch the VEVENT part
    const vevents = comp.getAllSubcomponents('vevent');
    const icsData = [];
    // loop, parse, mark as modified
    for (const vevent of vevents) {
      const sportuniy = JSON.parse(JSON.stringify(Sportunity));
      sportuniy.modified = true;
      sportuniy.node.organizers[0] = {
        organizer: {
          id: this.props.viewer.me.id,
          pseudo: this.props.viewer.me.pseudo,
        },
        isAdmin: true,
      };
      sportuniy.node.externalReference = vevent
        .getFirstPropertyValue('uid')
        .toString();
      sportuniy.node.title = vevent
        .getFirstPropertyValue('summary')
        .toString();
      // sportuniy.node.description = vevent
      //   .getFirstPropertyValue('description')
      //   .toString();
      sportuniy.node.beginning_date = vevent
        .getFirstPropertyValue('dtstart')
        .toJSDate()
        .toString();
      sportuniy.node.ending_date = vevent
        .getFirstPropertyValue('dtend')
        .toJSDate()
        .toString();
      const address = vevent.getFirstPropertyValue('location') && 
        vevent
          .getFirstPropertyValue('location')
          .toString();
      const addressObject = address && await addressUpdater(address);
      addressObject
        ? (sportuniy.node.address = addressObject)
        : address && (sportuniy.node.address = address);
      icsData.push(sportuniy);
    }
    // remove duplicate external_reference
    const d = JSON.parse(JSON.stringify(this.state.data));
    const icsDataFilter = icsData.filter(i => {
      let found = false;
      d.map(j => {
        if (i.node.externalReference === j.node.externalReference) {
          found = true;
        }
      });
      return !found;
    });
    // find the first unused index
    let index = d.length;
    d.map((k, q) => {
      if (!k.node.id && !k.modified && q < index) {
        index = q;
      }
    });
    // inject the new icd data into the data array
    d.splice(index, icsDataFilter.length, ...icsDataFilter);
    // save
    this.setState({ data: d, isLoadingFileOrLink: false });
  }

  _importData = () => {
    this.setState({ showImportPopup: true });
  }

  _exportData = () => {
  }

  _handleCloseModal = () => {
    this.setState({ showImportPopup: false });
  };


  render() {
    if (this.state.loading) {
      return <Loading />;
    }
    const { viewer } = this.props;
    const { columns } = this.state;
    const { classes } = this.props;
    let data = [];
    try {
      data = this.state.dataFiltered.map((item, index) =>
        prepareItem({
          item: this.state.data[item],
          dataIndex: item,
          index,
          viewer,
          columns,
          accounts: this.props.viewer.me.subAccounts,
          sports: this.props.viewer.sports.edges,
          openCirclesModal: row =>
            this.setState({ invitedCirclesModal: true, selectedRow: item }),
          openInvitedModal: row =>
            this.setState({ invitedModal: true, selectedRow: item }),
          removeInvitedCircle: (row, id) => {
            const d = JSON.parse(JSON.stringify(this.state.data));
            d[row].node.invited_circles.edges = d[
              row
            ].node.invited_circles.edges.filter(i => i.node.id !== id);
            d[row].node.price_for_circle = d[row].node.price_for_circle.filter(
              i => i.circle.id !== id,
            );
            d[row].modified = true;
            this.setState({ data: d });
          },
          openInvitedCircleDetailsModal: (row, circle) => {
            this.setState({
              selectedRow: item,
              invitedCircleDetailsModal: true,
              invitedCircleDetailsModalCircle: circle,
            });
          },
          openOrganizersModal: row =>
            this.setState({ organizersModal: true, selectedRow: item }),
        }),
      );
    } catch (err) {
      console.log(err);
    }
    
    return (
      <div>
        {this.state.isLoadingFileOrLink &&
          <Loading transparent={true}/>
        }
        {/* filter & visibility buttons */}
        <div style={{display: 'flex', padding: '10px 0px', justifyContent: 'space-around', maxWidth: 500}}>
          <IconButton
            onClick={e =>
              this.setState({
                columnsVisibilityMenuAnchor: e.currentTarget,
              })
            }
          >
            <RemoveRedEyeOutlinedIcon />
          </IconButton>
          <IconButton
            onClick={() => {
              this.setState({
                showColumnsFilter: !this.state.showColumnsFilter,
              });
            }}
          >
            <FilterIcon />
          </IconButton>
          <Button variant="contained" size="medium" color="primary" onClick={this._importData}>
            {localizations.datasheet_import}
          </Button>
          <ReactHTMLTableToExcel
            id="test-table-xls-button"
            className="MuiButtonBase-root MuiButton-root MuiButton-contained MuiButton-containedPrimary MuiButton-raised MuiButton-raisedPrimary"
            table="table-to-xls"
            filename="sample"
            sheet="sheet1"
            buttonText={localizations.datasheet_export}
          />
          <Menu
            anchorEl={this.state.columnsVisibilityMenuAnchor}
            open={Boolean(this.state.columnsVisibilityMenuAnchor)}
            onClose={() =>
              this.setState({
                columnsVisibilityMenuAnchor: null,
              })
            }
          >
            {columns.map((i, index) => (
              <MenuItem 
                key={i.name} 
                onClick={() => {
                  const { columns } = this.state;
                  columns[index].visible = !columns[index].visible;
                  this.setState({ columns });
                }}
              >
                <Checkbox
                  color="primary"
                  checked={i.visible}
                />
                <ListItemText>{localizations[i.name]}</ListItemText>
              </MenuItem>
            ))}
          </Menu>
        </div>
        {/* import options */}
        {this.state.showImportPopup && (
          <ImportActivitiesModal
            isOpen={this.state.showImportPopup}
            closeModal={this._handleCloseModal}
            user={this.props.viewer.me}
            handleUpload={this.handleUpload}
            syncICSLink={this.syncICSLink}
          />
        )}
        {/* filter */}
        {this.state.showColumnsFilter && (
          <ColumnsFilter
            close={() => {
              this.setState({ showColumnsFilter: false });
            }}
            filter={this.state.filter}
            submit={filter =>
              this.setState({
                filter,
                showColumnsFilter: false,
                submitFilter: true,
              })
            }
            data={this.state.data}
            sports={this.props.viewer.sports.edges}
          />
        )}
        {/* floating buttons */}
        {!this.state.showColumnsFilter && (
          <div>
            <div
              style={{
                position: 'fixed',
                right: 20,
                bottom: 20,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-around',
                height: 150,
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  this.saveData();
                }}
              >
                {localizations.datasheet_save}
              </Button>
             <input
                id="ics-upload"
                style={{ display: 'none' }}
                type="file"
                accept=".ics"
                onChange={e => this.handleUpload(e.target.files)}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  this.addNewLines();
                }}
              >
                {localizations.datasheet_add_new}
              </Button>
            </div>
            <Datasheet
              lang={this.props.language}
              data={data}
              sheetRenderer={this.sheetRenderer}
              rowRenderer={this.rowRenderer}
              cellRenderer={this.cellRenderer}
              valueRenderer={this.valueRenderer}
              dataRenderer={this.dataRenderer}
              onCellsChanged={this.onCellsChanged}
              onSelect={this.onSelect}
            />
          </div>
        )}
        {this.state.invitedCirclesModal && (
          <InvitedCirclesModal
            isOpen={this.state.invitedCirclesModal}
            viewer={this.props.viewer}
            close={() => this.setState({ invitedCirclesModal: false })}
            updateCircles={circles => {
              const d = JSON.parse(JSON.stringify(this.state.data));
              // insert new circles into the data
              const oldCircles =
                d[this.state.selectedRow].node.invited_circles.edges;
              const newCircles = circles.map(i => ({
                node: { id: i.id, name: i.name },
              }));
              d[this.state.selectedRow].node.invited_circles.edges = [
                ...oldCircles,
                ...newCircles,
              ];
              // insert price_for_circle
              const newPrice = circles.map(i => ({
                circle: { id: i.id },
                price: { currency: 'CHF', cents: 0 },
              }));
              const oldPrice = d[this.state.selectedRow].node.price_for_circle;
              d[this.state.selectedRow].node.price_for_circle = [
                ...oldPrice,
                ...newPrice,
              ];
              // make modified, update state
              d[this.state.selectedRow].modified = true;
              this.setState({ data: d });
            }}
          />
        )}
        {this.state.invitedModal && (
          <InvitedModal
            isOpen={this.state.invitedModal}
            viewer={this.props.viewer}
            close={() => this.setState({ invitedModal: false })}
            updateInvited={users => {
              const d = JSON.parse(JSON.stringify(this.state.data));
              const newUsers = [];
              users.map(i => {
                let found = false;
                d[this.state.selectedRow].node.invited.map(j => {
                  if (i.id === j.user.id) {
                    found = true;
                  }
                });
                if (!found) {
                  newUsers.push({ user: { id: i.id, pseudo: i.pseudo } });
                }
              });
              d[this.state.selectedRow].node.invited.push(...newUsers);
              d[this.state.selectedRow].modified = true;
              this.setState({ data: d });
            }}
          />
        )}
        {this.state.invitedCircleDetailsModal && (
          <Modal
            isOpen={this.state.invitedCircleDetailsModal}
            onRequestClose={() =>
              this.setState({ invitedCircleDetailsModal: false })
            }
          >
            <InvitedCircleDetails
              selectedCircle={{
                circle: this.state.invitedCircleDetailsModalCircle,
                price: this.state.data[
                  this.state.selectedRow
                ].node.price_for_circle.filter(
                  i =>
                    i.circle.id ===
                    this.state.invitedCircleDetailsModalCircle.id,
                )[0].price,
              }}
              viewer={this.props.viewer}
              user={this.props.viewer.me}
              fields={{
                notificationType: this.state.data[this.state.selectedRow].node
                  .notification_preference.notification_type,
                notificationAutoXDaysBefore: this.state.data[
                  this.state.selectedRow
                ].node.notification_preference.send_notification_x_days_before,
              }}
              _handleNotificationTypeChange={e => {
                const d = JSON.parse(JSON.stringify(this.state.data));
                d[
                  this.state.selectedRow
                ].node.notification_preference.notification_type =
                  e.target.value;
                d[this.state.selectedRow].modified = true;
                this.setState({ data: d });
              }}
              _handleNotificationAutoXDaysBeforeChange={value => {
                const d = JSON.parse(JSON.stringify(this.state.data));
                d[
                  this.state.selectedRow
                ].node.notification_preference.send_notification_x_days_before = value;
                d[this.state.selectedRow].modified = true;
                this.setState({ data: d });
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() =>
                this.setState({ invitedCircleDetailsModal: false })
              }
            >
              Close
            </Button>
          </Modal>
        )}
        {this.state.organizersModal && (
          <Modal isOpen={this.state.organizersModal}>
            <Organizers
              buttonLabel={localizations.newSportunity_addOrganizers}
              sport={this.state.data[this.state.selectedRow].node.sport.sport}
              viewer={this.props.viewer}
              user={this.props.viewer.me}
              organizers={this.state.data[
                this.state.selectedRow
              ].node.organizers.filter(i => !i.isAdmin)}
              circlesOfPendingOrganizers={this.state.data[
                this.state.selectedRow
              ].node.pendingOrganizers.map(i => ({
                ...i,
                circles: i.circles.edges,
                secondaryOrganizerType: i.secondaryOrganizerType
                  ? i.secondaryOrganizerType.id
                  : null,
              }))}
              addOrganizer={(assistant, sport) => {
                const data = JSON.parse(JSON.stringify(this.state.data));
                let found = false;
                data[this.state.selectedRow].node.organizers.map(i => {
                  if (i.organizer && i.organizer.id === assistant.id) {
                    found = true;
                  }
                });
                if (found) return;
                let secondaryOrganizerType;
                if (sport) {
                  let userSport;
                  assistant.sports.forEach(item => {
                    if (item.sport.id === sport.id) userSport = item;
                  });

                  if (
                    sport.assistantTypes &&
                    sport.assistantTypes.length > 0
                  ) {
                    if (
                      userSport &&
                      userSport.assistantType &&
                      userSport.assistantType.length > 0
                    ) {
                      secondaryOrganizerType = userSport.assistantType[0].id;
                    }
                  }
                }
                data[this.state.selectedRow].node.organizers.push({
                  organizer: {
                    id: assistant.id,
                    pseudo: assistant.pseudo,
                  },
                  price: {
                    cents: 0,
                    currency: 'CHF',
                  },
                  secondaryOrganizerType,
                  customSecondaryOrganizerType: null,
                  permissions: AdministratorPermissions,
                });
                data[this.state.selectedRow].modified = true;
                this.setState({ data });
              }}
              addCirclesOfPendingOrganizers={circles => {
                const data = JSON.parse(JSON.stringify(this.state.data));
                data[this.state.selectedRow].node.pendingOrganizers.push({
                  circles: { edges: circles.map(i => ({ node: i })) },
                  price: {
                    cents: 0,
                    currency: 'CHF',
                  },
                  secondaryOrganizerType: null,
                  customSecondaryOrganizerType: null,
                  permissions: AdministratorPermissions,
                });
                data[this.state.selectedRow].modified = true;
                this.setState({ data });
              }}
              removeOrganizer={assistant => {
                const data = JSON.parse(JSON.stringify(this.state.data));
                data[this.state.selectedRow].node.organizers = data[
                  this.state.selectedRow
                ].node.organizers.filter(i => i.organizer.id !== assistant.id);
                data[this.state.selectedRow].modified = true;
                this.setState({ data });
              }}
              removeCirclesOfPendingOrganizers={index => {
                const data = JSON.parse(JSON.stringify(this.state.data));
                data[this.state.selectedRow].node.pendingOrganizers.splice(
                  index,
                  1,
                );
                data[this.state.selectedRow].modified = true;
                this.setState({ data });
              }}
              updateOrganizerPrice={(assistant, price) => {
                const data = JSON.parse(JSON.stringify(this.state.data));
                data[this.state.selectedRow].node.organizers = data[
                  this.state.selectedRow
                ].node.organizers.map(i => {
                  if (i.organizer.id === assistant.organizer.id) {
                    i.price.cents = price;
                  }
                  return i;
                });
                data[this.state.selectedRow].modified = true;
                this.setState({ data });
              }}
              updateCirclesOfPendingOrganizersPrice={(index, price) => {
                const data = JSON.parse(JSON.stringify(this.state.data));
                data[this.state.selectedRow].node.pendingOrganizers[
                  index
                ].price.cents = price;
                data[this.state.selectedRow].modified = true;
                this.setState({ data });
              }}
              updateOrganizerRole={(assistant, role) => {
                const data = JSON.parse(JSON.stringify(this.state.data));
                data[this.state.selectedRow].node.organizers = data[
                  this.state.selectedRow
                ].node.organizers.map(i => {
                  if (i.organizer.id === assistant.organizer.id) {
                    i.secondaryOrganizerType = role;
                  }
                  return i;
                });
                data[this.state.selectedRow].modified = true;
                this.setState({ data });
              }}
              updateCirclesOfPendingOrganizersRole={(index, role) => {
                const data = JSON.parse(JSON.stringify(this.state.data));
                data[this.state.selectedRow].node.pendingOrganizers[
                  index
                ].secondaryOrganizerType = { id: role };
                data[this.state.selectedRow].modified = true;
                this.setState({ data });
              }}
              updateOrganizerCustomRole={(assistant, role) => {
                const data = JSON.parse(JSON.stringify(this.state.data));
                data[this.state.selectedRow].node.organizers = data[
                  this.state.selectedRow
                ].node.organizers.map(i => {
                  if (i.organizer.id === assistant.organizer.id) {
                    i.customSecondaryOrganizerType = role;
                  }
                  return i;
                });
                data[this.state.selectedRow].modified = true;
                this.setState({ data });
              }}
              updateCirclesOfPendingOrganizersCustomRole={(index, role) => {
                const data = JSON.parse(JSON.stringify(this.state.data));
                data[this.state.selectedRow].node.pendingOrganizers[
                  index
                ].customSecondaryOrganizerType = role;
                data[this.state.selectedRow].modified = true;
                this.setState({ data });
              }}
              updateOrganizerPermissions={(assistant, permissions) => {
                const data = JSON.parse(JSON.stringify(this.state.data));
                data[this.state.selectedRow].node.organizers.map(i => {
                  if (i.organizer.id === assistant.organizer.id) {
                    i.permissions = permissions;
                  }
                });
                data[this.state.selectedRow].modified = true;
                this.setState({ data });
              }}
              updatePendingOrganizerPermissions={(index, permissions) => {
                const data = JSON.parse(JSON.stringify(this.state.data));
                data[this.state.selectedRow].node.pendingOrganizers[
                  index
                ].permissions = permissions;
                data[this.state.selectedRow].modified = true;
                this.setState({ data });
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                const data = JSON.parse(JSON.stringify(this.state.data));
                let valid = true;
                // validation, if invalid just don't close modal
                data[this.state.selectedRow].node.organizers.map(ii => {
                  if (
                    !ii.isAdmin &&
                    !ii.secondaryOrganizerType &&
                    !ii.customSecondaryOrganizerType
                  ) {
                    valid = false;
                  }
                });
                data[this.state.selectedRow].node.pendingOrganizers.map(ii => {
                  if (
                    !ii.secondaryOrganizerType &&
                    !ii.customSecondaryOrganizerType
                  ) {
                    valid = false;
                  }
                });
                if (valid) {
                  this.setState({ organizersModal: false });
                }
              }}
            >
              Close
            </Button>
          </Modal>
        )}
      </div>
    );
  }
}

//
// redux & relay
//
const stateToProps = state => ({
  language: state.globalReducer.language,
});
const dispatchToProps = () => ({});

const ReduxContainer = connect(
  stateToProps,
  dispatchToProps,
)(withStyles(muiStyles)(DatasheetSportunities));

export default createPaginationContainer(
  Radium(withAlert(ReduxContainer)),
  {
    viewer: graphql`
      fragment DatasheetSportunities_viewer on Viewer
        @argumentDefinitions(
          filter: {
            type: Filter
            defaultValue: { statuses: [Organized, Cancelled], subAccounts: [] }
          }
          includeSportunities: { type: "Boolean!", defaultValue: false }
          count: { type: "Int", defaultValue: 2 }
          cursor: { type: "String" }
        ) {
        id
        ...SearchModal_viewer
        ...InvitedCircleDetails_viewer
        ...Organizers_viewer
        ...OpponentEditor_viewer
        me {
          ...Organizers_user
          id
          pseudo
          icsLinks
          subAccounts {
            id
            pseudo
          }
        }
        sportunities(
          orderBy: CREATION_DATE_DESC
          filter: $filter
          first: $count
          after: $cursor
        )
          @connection(key: "Viewer_sportunities", filters: ["filter"])
          @include(if: $includeSportunities) {
          count
          pageInfo {
            endCursor
            hasNextPage
          }
          edges {
            node {
              id
              externalReference
              title
              description
              beginning_date
              ending_date
              status
              cancel_date
              participantRange {
                from
                to
              }
              sport {
                sport {
                  id
                  type
                  name {
                    EN
                    FR
                  }
                }
                levels {
                  id
                  EN {
                    name
                    skillLevel
                  }
                  FR {
                    name
                    skillLevel
                  }
                }
              }
              sportunityType {
                id
                name {
                  EN
                  FR
                }
              }
              address {
                address
                country
                city
                zip
              }
              kind
              price {
                currency
                cents
              }
              invited {
                answer
                user {
                  id
                  pseudo
                }
              }
              invited_circles {
                edges {
                  node {
                    id
                    name
                  }
                }
              }
              price_for_circle {
                circle {
                  id
                }
                price {
                  currency
                  cents
                }
              }
              organizers {
                organizer {
                  id
                  pseudo
                }
                isAdmin
                role
                price {
                  currency
                  cents
                }
                secondaryOrganizerType {
                  id
                  name {
                    id
                    EN
                    FR
                  }
                }
                customSecondaryOrganizerType
                permissions {
                  chatAccess {
                    view
                    edit
                  }
                  memberAccess {
                    view
                    edit
                  }
                  carPoolingAccess {
                    view
                    edit
                  }
                  imageAccess {
                    view
                    edit
                  }
                  detailsAccess {
                    view
                    edit
                  }
                  compositionAccess {
                    view
                    edit
                  }
                }
              }
              pendingOrganizers {
                id
                circles {
                  edges {
                    node {
                      id
                      name
                      memberCount
                      type
                      members {
                        id
                      }
                      owner {
                        id
                        pseudo
                      }
                    }
                  }
                }
                isAdmin
                role
                price {
                  cents
                  currency
                }
                secondaryOrganizerType {
                  id
                  name {
                    id
                    EN
                    FR
                  }
                }
                customSecondaryOrganizerType
                permissions {
                  chatAccess {
                    view
                    edit
                  }
                  memberAccess {
                    view
                    edit
                  }
                  carPoolingAccess {
                    view
                    edit
                  }
                  imageAccess {
                    view
                    edit
                  }
                  detailsAccess {
                    view
                    edit
                  }
                  compositionAccess {
                    view
                    edit
                  }
                }
              }
              notification_preference {
                notification_type
                send_notification_x_days_before
              }
              game_information {
                opponent {
                  organizerPseudo
                  unknownOpponent
                  lookingForAnOpponent
                  organizer {
                    id
                    pseudo
                  }
                  invitedOpponents {
                    edges {
                      node {
                        id
                        members {
                          id
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        sports {
          edges {
            node {
              id
              type
              name {
                id
                EN
                FR
              }
              levels {
                id
                EN {
                  name
                  skillLevel
                }
                FR {
                  name
                  skillLevel
                }
              }
            }
          }
        }
        sportunityTypes(sportType: COLLECTIVE) {
          id
          name {
            EN
            FR
          }
        }
      }
    `,
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      // unction that should indicate which connection to paginate over
      return props.viewer.sportunities;
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
        includeSportunities: fragmentVariables.includeSportunities,
      };
    },
    query: graphql`
      query DatasheetSportunitiesRefetchQuery(
        $filter: Filter
        $includeSportunities: Boolean!
        $count: Int
        $cursor: String
      ) {
        viewer {
          ...DatasheetSportunities_viewer
            @arguments(
              filter: $filter
              includeSportunities: $includeSportunities
              count: $count
              cursor: $cursor
            )
        }
      }
    `,
  },
);

//
// react-datasheet functions
//
// value renderer functions
const external_idValueRenderer = cell => cell.value;
const titleValueRenderer = cell => cell.value;
const descriptionValueRenderer = cell => cell.value;
const beginning_dayValueRenderer = cell =>
  moment(cell.value).isValid() ? moment(cell.value).format('DD/MM/YYYY') : '';
const beginning_hourValueRenderer = cell =>
  moment(cell.value).isValid() ? moment(cell.value).format('HH:mm') : '';
const ending_dayValueRenderer = cell =>
  moment(cell.value).isValid() ? moment(cell.value).format('DD/MM/YYYY') : '';
const ending_hourValueRenderer = cell =>
  moment(cell.value).isValid() ? moment(cell.value).format('HH:mm') : '';
const participant_rangeFromValueRenderer = cell => cell.value;
const participant_rangeToValueRenderer = cell => cell.value;
const sport_nameValueRenderer = (cell, lang) => {
  let name = '';
  const LANG = lang.toUpperCase();
  if (cell.value && cell.value.sport && cell.value.sport.name) {
    name = cell.value.sport.name[LANG] || cell.value.sport.name.EN;
  }
  return name;
};
const sportLevelFromValueRenderer = (cell, lang) => {
  let level = 100;
  let name = '';
  const LANG = lang.toUpperCase();
  if (cell.value && cell.value.levels && cell.value.levels.length) {
    cell.value.levels.map(i => {
      if (i.EN && i.EN.name && i.EN.skillLevel && i.EN.skillLevel <= level) {
        level = i[LANG].skillLevel || i.EN.skillLevel;
        name = i[LANG].name || i.EN.name;
      }
    });
  }
  return name;
};
const sportLevelToValueRenderer = (cell, lang) => {
  let level = 0;
  let name = '';
  const LANG = lang.toUpperCase();
  if (cell.value && cell.value.levels && cell.value.levels.length) {
    cell.value.levels.map(i => {
      if (i.EN && i.EN.name && i.EN.skillLevel && i.EN.skillLevel >= level) {
        level = i[LANG].skillLevel || i.EN.skillLevel;
        name = i[LANG].name || i.EN.name;
      }
    });
  }
  return name;
};
const addressValueRenderer = cell =>
  `${cell.value.address} ${cell.value.country} ${cell.value.city} ${
    cell.value.zip
  }`;
const kindValueRenderer = cell => {
  let value = '';
  if (cell.value === 'PRIVATE') {
    value = localizations.circles_private;
  } else if (cell.value === 'PUBLIC') {
    value = localizations.circles_public;
  }
  return value;
};
const priceValueRenderer = cell =>
  `${cell.value.cents} ${cell.value.currency}`;
const organizersValueRenderer = cell => {
  const c = cell.value.organizers.length + cell.value.pendingOrganizers.length;
  return c - 1 === 1
    ? `${c - 1} ${localizations.event_organizer}`
    : `${c - 1} ${localizations.event_organizers}`;
};
const organizerValueRenderer = cell => {
  let val = '';
  cell.value.map(i => {
    if (
      i &&
      i.organizer &&
      i.organizer.id &&
      i.organizer.pseudo &&
      i.isAdmin
    ) {
      val = i.organizer.pseudo;
    }
  });
  return val;
};
const invitedCirclesValueRenderer = cell => {
  if (cell.value && cell.value.edges) {
    return cell.value.edges.length === 1
      ? `${cell.value.edges.length} ${localizations.find_circle}`
      : `${cell.value.edges.length} ${localizations.find_circles}`;
  }
  return '';
};
const invitedValueRenderer = cell => {
  if (cell.value) {
    return cell.value.length === 1
      ? `${cell.value.length} user`
      : `${cell.value.length} users`;
  }
  return '';
};

const sportunityTypeValueRenderer = (cell, lang) => {
  let val = '';
  const LANG = lang.toUpperCase();
  if (cell && cell.value && cell.value.name && cell.value.name.EN) {
    val = cell.value.name[LANG] || cell.value.name.EN;
  }
  return val;
};

const statusValueRenderer = cell => {
  if (cell.value.indexOf('Organized') > -1) {
    return localizations.status_organized;
  } else if (cell.value.indexOf('Cancelled') > -1) {
    return localizations.status_cancelled;
  } else if (cell.value.indexOf('Deleted') > -1) {
    return localizations.status_deleted;
  }
  return '';
};

const opponentValueRenderer = cell => {
  let val = '';
  if (cell.value && cell.value.organizerPseudo) {
    val = cell.value.organizerPseudo;
  } else if (
    cell.value &&
    cell.value.organizer &&
    cell.value.organizer.pseudo
  ) {
    val = cell.value.organizer.pseudo;
  }
  return val;
};

// date renderer functions
const external_idDataRenderer = cell => cell.value;
const titleDataRenderer = cell => cell.value.replace(/ {2}|\r\n|\n|\r/gm, '');
const descriptionDataRenderer = cell =>
  cell.value.replace(/ {2}|\r\n|\n|\r/gm, '');
const beginning_dayDataRenderer = cell =>
  moment(cell.value).isValid() ? moment(cell.value).format('DD/MM/YYYY') : '';
const beginning_hourDataRenderer = cell =>
  moment(cell.value).isValid() ? moment(cell.value).format('HH:mm') : '';
const enging_dayDataRenderer = cell =>
  moment(cell.value).isValid() ? moment(cell.value).format('DD/MM/YYYY') : '';
const enging_hourDataRenderer = cell =>
  moment(cell.value).isValid() ? moment(cell.value).format('HH:mm') : '';
const participant_rangeFromDataRenderer = cell => cell.from;
const participant_rangeToDataRenderer = cell => cell.to;
const sport_nameDataRenderer = (cell, list, lang) => {
  let name = '';
  const LANG = lang.toUpperCase();
  list.map(i => {
    if (i.node.id === cell.value.sport) {
      name = i.node.name[LANG] || i.node.name.EN;
    }
  });
  return name;
};
const addressDataRenderer = cell =>
  `${cell.value.address} ${cell.value.country} ${cell.value.city} ${
    cell.value.zip
  }`;
const kindDataRenderer = cell => cell.value;
const priceDataRenderer = cell => cell.value.cents;
const invitedCirclesDataRenderer = cell => JSON.stringify(cell.value);
const invitedDataRenderer = cell => JSON.stringify(cell.value);
const sportunityTypeDataRenderer = (cell, lang) => {
  let val = '';
  const LANG = lang.toUpperCase();
  if (cell.value && cell.value.name && cell.value.name.EN) {
    val = cell.value.name[LANG] || cell.value.name.EN;
  }
  return val;
};
const organizersDataRenderer = cell => {
  let val = { organizers: [], pendingOrganizers: [] };
  cell.value.organizers.map(i => {
    if (
      i &&
      i.organizer &&
      i.organizer.id &&
      i.organizer.pseudo &&
      !i.isAdmin
    ) {
      val.organizers.push(i);
    }
  });
  cell.value.pendingOrganizers.map(i => {
    val.pendingOrganizers.push(i);
  });
  return JSON.stringify(val);
};
const organizerDataRenderer = cell => {
  let val = '';
  cell.value.map(i => {
    if (
      i &&
      i.organizer &&
      i.organizer.id &&
      i.organizer.pseudo &&
      i.isAdmin
    ) {
      val = JSON.stringify(i);
    }
  });
  return val;
};

const opponentDataRenderer = cell => {
  let val = {};
  if (
    cell.value &&
    cell.value.organizer &&
    cell.value.organizer.id &&
    cell.value.organizer.pseudo
  ) {
    val = {
      id: cell.value.organizer.id,
      pseudo: cell.value.organizer.pseudo,
    };
  } else if (cell.value.organizerPseudo) {
    val = {
      pseudo: cell.value.organizerPseudo,
    };
  }
  return JSON.stringify(val);
};

// validation and update functions
const titleUpdater = (cell, value) => value;
const descriptionUpdater = (cell, value) => value;
const beginning_dayUpdater = (cell, value) => {
  const beginning_date = moment(cell.value).isValid()
    ? moment(cell.value)
    : moment();
  beginning_date.set('year', value.year());
  beginning_date.set('month', value.month());
  beginning_date.set('date', value.date());
  if (beginning_date.isSameOrAfter(moment(), 'day')) {
    return beginning_date.toDate();
  }
  return false;
};
const beginning_hourUpdater = (cell, value) => {
  const beginning_date = moment(cell.value).isValid()
    ? moment(cell.value)
    : moment();
  beginning_date.set('hour', moment(value, 'HH:mm').hour());
  beginning_date.set('minute', moment(value, 'HH:mm').minute());
  if (beginning_date.isAfter(moment())) {
    return beginning_date.toDate();
  }
  return false;
};
const ending_dayUpdater = (cell, value) => {
  const ending_date = moment(cell.value).isValid()
    ? moment(cell.value)
    : moment();
  ending_date.set('year', value.year());
  ending_date.set('month', value.month());
  ending_date.set('date', value.date());
  if (ending_date.isSameOrAfter(moment(cell.beginning_date), 'day')) {
    return ending_date.toDate();
  }
  return false;
};
const ending_hourUpdater = (cell, value) => {
  const ending_date = moment(cell.value).isValid()
    ? moment(cell.value)
    : moment();
  ending_date.set('hour', moment(value, 'HH:mm').hour());
  ending_date.set('minute', moment(value, 'HH:mm').minute());
  if (ending_date.isAfter(moment(cell.beginning_date))) {
    return ending_date.toDate();
  }
  return false;
};
const participantRangeFromUpdater = (cell, value) => {
  const from = parseInt(value);
  if (from === 0 || !from) {
    return null;
  }
  return from;
};
const participantRangeToUpdater = (cell, value) => {
  const to = parseInt(value);
  if (to === 0 || !to || to < cell.from) {
    return null;
  }
  return to;
};
const addressUpdater = input =>
  new Promise((resolve, reject) => {
    const coder = new google.maps.Geocoder();
    coder.geocode({ address: input }, (results, status) => {
      if (
        status === 'OK' &&
        results &&
        results[0] &&
        results[0].address_components
      ) {
        let address, country, city, zip;
        results[0].address_components.map(i => {
          if (i.types.indexOf('postal_code') > -1) {
            zip = i.long_name;
          }
          if (i.types.indexOf('locality') > -1) {
            city = i.long_name;
          }
          if (i.types.indexOf('country') > -1) {
            country = i.long_name;
          }
        });
        address = results[0].formatted_address;
        resolve({ address, country, city, zip });
      } else {
        resolve({ address: input, country: '', city: '', zip: '' });
      }
    });
  });
const priceUpdater = (cell, value) => {
  if (parseInt(value) >= 0) {
    return parseInt(value);
  }
  return cell.value.cents;
};

styles = {
  title: {
    fontSize: 30,
    color: colors.blue,
    fontFamily: 'Lato',
    marginBottom: 30,
    fontWeight: '500',
  },
  body: {
    borderRadius: 5,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.4)',
    fontSize: 16,
    fontFamily: 'Lato',
    color: colors.black,
    padding: '30px 40px',
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: '500',
    paddingBottom: 15,
    borderBottom: `1px solid ${colors.blue}`,
  },
  contentParagraph: {
    marginTop: 35,
    fontSize: 16,
    lineHeight: '20px',
  },
  videoContainer: {
    height: 500,
    '@media (maxWidth: 960px)': {
      height: 410,
    },
    '@media (maxWidth: 680px)': {
      height: 300,
    },
    '@media (maxWidth: 480px)': {
      height: 200,
    },
    '@media (maxWidth: 360px)': {
      height: 150,
    },
  },
  buttonContainer: {
    margin: 'auto',
    marginTop: 10,
    marginBottom: 10,
  },
  confirm: {
    backgroundColor: colors.green,
    color: colors.white,
    borderRadius: 100,
    borderStyle: 'none',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    cursor: 'pointer',
    ':disabled': {
      cursor: 'not-allowed',
      backgroundColor: colors.gray,
    },
  },
  cell: {
    padding: 0,
    cursor: 'cell',
    border: '1px solid #DDD',
    textAlign: 'center',
  },
  cellReadOnly: {
    background: 'whitesmoke',
    color: '#999',
    textAlign: 'center',
  },
  headerCell: {
    backgroundColor: colors.blue,
    position: 'sticky',
    top: 0,
    padding: 0,
    textAlign: 'center',
    border: '1px solid #DDD',
    cursor: 'move',
  },
  resizeHandle: {
    top: 0,
    right: 0,
    bottom: 0,
    width: 5,
    position: 'absolute',
    cursor: 'col-resize',
  },
  tooltip: {
    fontSize: 22,
  },
};

const Sportunity = {
  node: {
    title: '',
    description: '',
    beginning_date: '',
    ending_date: '',
    participantRange: {
      from: '',
      to: '',
    },
    sport: {},
    address: {
      address: '',
      country: '',
      city: '',
      zip: '',
    },
    kind: '',
    price: {
      currency: 'CHF',
      cents: 0,
    },
    ageRestriction: {
      from: 1,
      to: 100,
    },
    invited: [],
    invited_circles: { edges: [] },
    price_for_circle: [],
    organizers: [
      {
        organizer: '',
        isAdmin: true,
        role: 'COACH',
      },
    ],
    pendingOrganizers: [],
    mode: 'FCFS',
    externalReference: '',
    status: '',
    notification_preference: {
      notification_type: 'Automatically',
      send_notification_x_days_before: 15,
    },
    game_information: {
      opponent: {},
    },
  },
};

const prepareItem = ({
  item,
  dataIndex,
  index,
  viewer,
  columns,
  accounts,
  sports,
  openCirclesModal,
  openInvitedModal,
  removeInvitedCircle,
  openInvitedCircleDetailsModal,
  openOrganizersModal,
}) => {
  // some events don't have price!
  const price = {
    currency: 'CHF',
    price: 0,
  };
  // step 1, prepare the data, the object key is matching column.name
  const data = {
    datasheet_index: {
      index: dataIndex,
      sportunityID: item.node.id,
      name: 'index',
      value: index + 1,
      readOnly: true,
      readOnlyMessage: '',
    },
    datasheet_external_id: {
      index: dataIndex,
      sportunityID: item.node.id,
      name: 'externalReference',
      value: item.node.externalReference,
      readOnly: true,
      readOnlyMessage: '',
    },
    datasheet_organizer: {
      index: dataIndex,
      sportunityID: item.node.id,
      name: 'organizer',
      value: item.node.organizers,
      readOnly: false,
      dataEditor: props => <OrganizerEditor {...props} accounts={accounts} />,
    },
    datasheet_title: {
      index: dataIndex,
      sportunityID: item.node.id,
      name: 'title',
      value: item.node.title,
      readOnly: false,
    },
    datasheet_description: {
      index: dataIndex,
      sportunityID: item.node.id,
      name: 'description',
      value: item.node.description,
      readOnly: false,
      dataEditor: props => <DescriptionEditor {...props} />,
    },
    datasheet_beginning_day: {
      index: dataIndex,
      sportunityID: item.node.id,
      name: 'beginning_day',
      value: item.node.beginning_date,
      ending_date: item.node.ending_date,
      readOnly: false,
      dataEditor: props => (
        <DatePicker
          autoFocus
          dateFormat="DD/MM/YYYY"
          todayButton={localizations.newSportunity_today}
          selected={
            moment(props.cell.value).isValid()
              ? moment(props.cell.value)
              : moment()
          }
          onSelect={date => {
            props.onCommit(date);
          }}
          minDate={moment()}
          locale={localizations.getLanguage().toLowerCase()}
          popperPlacement="top-end"
          nextMonthButtonLabel=""
          previousMonthButtonLabel=""
        />
      ),
    },
    datasheet_beginning_hour: {
      index: dataIndex,
      sportunityID: item.node.id,
      name: 'beginning_hour',
      value: item.node.beginning_date,
      ending_date: item.node.ending_date,
      readOnly: false,
    },
    datasheet_ending_day: {
      index: dataIndex,
      sportunityID: item.node.id,
      name: 'ending_day',
      value: item.node.ending_date,
      beginning_date: item.node.beginning_date,
      readOnly: false,
      dataEditor: props => (
        <DatePicker
          autoFocus
          dateFormat="DD/MM/YYYY"
          todayButton={localizations.newSportunity_today}
          selected={
            moment(props.cell.value).isValid()
              ? moment(props.cell.value)
              : moment()
          }
          onSelect={date => {
            props.onCommit(date);
          }}
          minDate={
            moment(props.cell.beginning_date).isValid()
              ? moment(props.cell.beginning_date)
              : moment()
          }
          locale={localizations.getLanguage().toLowerCase()}
          popperPlacement="top-end"
          nextMonthButtonLabel=""
          previousMonthButtonLabel=""
        />
      ),
    },
    datasheet_ending_hour: {
      index: dataIndex,
      sportunityID: item.node.id,
      name: 'ending_hour',
      value: item.node.ending_date,
      beginning_date: item.node.beginning_date,
      readOnly: false,
    },
    datasheet_min_participants: {
      index: dataIndex,
      sportunityID: item.node.id,
      name: 'participantRangeFrom',
      value: item.node.participantRange.from,
      to: item.node.participantRange.to,
      readOnly: false,
    },
    datasheet_max_participants: {
      index: dataIndex,
      sportunityID: item.node.id,
      name: 'participantRangeTo',
      from: item.node.participantRange.from,
      value: item.node.participantRange.to,
      readOnly: false,
    },
    datasheet_sport: {
      index: dataIndex,
      sportunityID: item.node.id,
      name: 'sport',
      value: item.node.sport,
      readOnly: false,
      dataEditor: props => <SportEditor list={sports} {...props} />,
    },
    datasheet_sport_level_from: {
      index: dataIndex,
      sportunityID: item.node.id,
      name: 'sportLevelFrom',
      value: item.node.sport,
      readOnly: false,
      dataEditor: props => <SportLevelEditor list={sports} {...props} />,
    },
    datasheet_sport_level_to: {
      index: dataIndex,
      sportunityID: item.node.id,
      name: 'sportLevelTo',
      value: item.node.sport,
      readOnly: false,
      dataEditor: props => <SportLevelEditor list={sports} {...props} />,
    },
    datasheet_type: {
      index: dataIndex,
      sportunityID: item.node.id,
      name: 'sportunityType',
      value: item.node.sportunityType,
      sport: item.node.sport,
      readOnly: false,
      dataEditor: props => <SportunityTypeEditor {...props} />,
    },
    datasheet_opponent: {
      index: dataIndex,
      sportunityID: item.node.id,
      name: 'opponent',
      value: item.node.game_information
        ? item.node.game_information.opponent
        : '',
      readOnly:
        !item.node.sportunityType ||
        (item.node.sportunityType && !item.node.sportunityType.name) ||
        (item.node.sportunityType &&
          item.node.sportunityType.name &&
          item.node.sportunityType.name.EN !== 'Match'),
      readOnlyMessage: localizations.datasheet_no_opponent,
      dataEditor: props => (
        <OpponentEditor
          viewer={viewer}
          sportId={
            item.node.sport
              ? item.node.sport.sport
                ? item.node.sport.sport.id
                : null
              : null
          }
          {...props}
        />
      ),
    },
    datasheet_address: {
      index: dataIndex,
      sportunityID: item.node.id,
      name: 'address',
      value: item.node.address,
      readOnly: false,
      dataEditor: props => <AddressEditor {...props} />,
    },
    datasheet_kind: {
      index: dataIndex,
      sportunityID: item.node.id,
      name: 'kind',
      value: item.node.kind,
      readOnly: false,
      dataEditor: props => <KindEditor {...props} />,
    },
    datasheet_price: {
      index: dataIndex,
      sportunityID: item.node.id,
      name: 'price',
      value: item.node.price || price,
      readOnly: item.node.kind !== 'PUBLIC',
      readOnlyMessage: localizations.datasheet_no_public_price,
    },
    datasheet_summon_group: {
      index: dataIndex,
      sportunityID: item.node.id,
      name: 'invited_circles',
      value: item.node.invited_circles,
      readOnly: false,
      dataEditor: props => (
        <InvitedCirclesEditor
          openCirclesModal={openCirclesModal}
          removeInvitedCircle={removeInvitedCircle}
          openInvitedCircleDetailsModal={openInvitedCircleDetailsModal}
          {...props}
        />
      ),
    },
    datasheet_summon_user: {
      index: dataIndex,
      sportunityID: item.node.id,
      name: 'invited',
      value: item.node.invited,
      readOnly: false,
      dataEditor: props => (
        <InvitedEditor openInvitedModal={openInvitedModal} {...props} />
      ),
    },
    datasheet_co_organizers: {
      index: dataIndex,
      sportunityID: item.node.id,
      name: 'organizers',
      value: {
        organizers: item.node.organizers,
        pendingOrganizers: item.node.pendingOrganizers,
      },
      readOnly: false,
      dataEditor: props => (
        <OrganizersEditor
          openOrganizersModal={openOrganizersModal}
          {...props}
        />
      ),
    },
    datasheet_status: {
      index: dataIndex,
      sportunityID: item.node.id,
      name: 'status',
      value: item.node.status,
      preSaveStatus: item.preSaveStatus,
      readOnly: false,
      dataEditor: props => <StatusEditor {...props} />,
    },
  };
  //  step 2, put the data in the correct order
  const orderedData = [];
  columns.map(i => {
    orderedData.push(data[i.name]);
  });
  // step 3, return it
  return orderedData;
};

const allFieldsCompleted = sportunity => {
  if (
    sportunity.title &&
    sportunity.description &&
    sportunity.beginning_date &&
    sportunity.ending_date &&
    sportunity.participantRange &&
    sportunity.participantRange.from &&
    sportunity.participantRange.to &&
    sportunity.sport &&
    sportunity.sport.sport &&
    sportunity.address &&
    sportunity.address.address &&
    sportunity.address.country &&
    sportunity.address.city &&
    sportunity.address.zip &&
    sportunity.kind &&
    sportunity.price &&
    sportunity.price.currency &&
    Number.isInteger(sportunity.price.cents)
  ) {
    return true;
  }
  return false;
};

function applyFilter(data, filter) {
  const f = [];
  data.map((i, index) => {
    // return all new lines
    if (!i.node.id) {
      f.push(index);
    }
    let organizer = true;
    let title = true;
    let description = true;
    let beginningDayFrom = true;
    let beginningDayTo = true;
    let beginningTimeFrom = true;
    let beginningTimeTo = true;
    let endingDayFrom = true;
    let endingDayTo = true;
    let endingTimeFrom = true;
    let endingTimeTo = true;
    let minParticipants = true;
    let maxParticipants = true;
    let sport = true;
    let sportLevelFrom = true;
    let sportLevelTo = true;
    let type = true;
    let opponent = true;
    let address = true;
    let kind = true;
    let priceFrom = true;
    let priceTo = true;
    let summonGroup = true;
    let summonUsers = true;
    let coOrganizer = true;
    let status = true;
    // organizer
    if (filter.organizer && filter.organizer.length) {
      organizer = false;
      if (i.node.organizers && i.node.organizers.length) {
        i.node.organizers.map(j => {
          if (j.isAdmin && filter.organizer.includes(j.organizer.id)) {
            organizer = true;
          }
        });
      }
    }
    // title
    if (filter.title) {
      title = false;
      if (
        i.node.title &&
        i.node.title.toLowerCase().indexOf(filter.title.toLowerCase()) > -1
      ) {
        title = true;
      }
    }
    // description
    if (filter.description) {
      description = false;
      if (
        i.node.description &&
        i.node.description
          .toLowerCase()
          .indexOf(filter.description.toLowerCase()) > -1
      ) {
        description = true;
      }
    }
    // beginningDayFrom
    if (
      filter.beginningDayFrom &&
      moment(filter.beginningDayFrom, 'DD/MM/YYYY').isValid()
    ) {
      beginningDayFrom = false;
      if (
        i.node.beginning_date &&
        moment(i.node.beginning_date).isValid() &&
        moment(i.node.beginning_date).isSameOrAfter(
          moment(filter.beginningDayFrom, 'DD/MM/YYYY'),
          'day',
        )
      ) {
        beginningDayFrom = true;
      }
    }
    // beginningDayTo
    if (
      filter.beginningDayTo &&
      moment(filter.beginningDayTo, 'DD/MM/YYYY').isValid()
    ) {
      beginningDayTo = false;
      if (
        i.node.beginning_date &&
        moment(i.node.beginning_date).isValid() &&
        moment(i.node.beginning_date).isSameOrBefore(
          moment(filter.beginningDayTo, 'DD/MM/YYYY'),
          'day',
        )
      ) {
        beginningDayTo = true;
      }
    }
    // beginningTimeFrom
    if (
      filter.beginningTimeFrom &&
      moment(filter.beginningTimeFrom, 'HH:mm').isValid()
    ) {
      beginningTimeFrom = false;
      if (
        i.node.beginning_date &&
        moment(i.node.beginning_date).isValid() &&
        moment(
          moment(i.node.beginning_date).format('HH:mm'),
          'HH:mm',
        ).isSameOrAfter(moment(filter.beginningTimeFrom, 'HH:mm'))
      ) {
        beginningTimeFrom = true;
      }
    }
    // beginningTimeTo
    if (
      filter.beginningTimeTo &&
      moment(filter.beginningTimeTo, 'HH:mm').isValid()
    ) {
      beginningTimeTo = false;
      if (
        i.node.beginning_date &&
        moment(i.node.beginning_date).isValid() &&
        moment(
          moment(i.node.beginning_date).format('HH:mm'),
          'HH:mm',
        ).isSameOrBefore(moment(filter.beginningTimeTo, 'HH:mm'))
      ) {
        beginningTimeTo = true;
      }
    }
    // endingDayFrom
    if (
      filter.endingDayFrom &&
      moment(filter.endingDayFrom, 'DD/MM/YYYY').isValid()
    ) {
      endingDayFrom = false;
      if (
        i.node.ending_date &&
        moment(i.node.ending_date).isValid() &&
        moment(i.node.ending_date).isSameOrAfter(
          moment(filter.endingDayFrom, 'DD/MM/YYYY'),
          'day',
        )
      ) {
        endingDayFrom = true;
      }
    }
    // endingDayTo
    if (
      filter.endingDayTo &&
      moment(filter.endingDayTo, 'DD/MM/YYYY').isValid()
    ) {
      endingDayTo = false;
      if (
        i.node.ending_date &&
        moment(i.node.ending_date).isValid() &&
        moment(i.node.ending_date).isSameOrBefore(
          moment(filter.endingDayTo, 'DD/MM/YYYY'),
          'day',
        )
      ) {
        endingDayTo = true;
      }
    }
    // endingTimeFrom
    if (
      filter.endingTimeFrom &&
      moment(filter.endingTimeFrom, 'HH:mm').isValid()
    ) {
      endingTimeFrom = false;
      if (
        i.node.ending_date &&
        moment(i.node.ending_date).isValid() &&
        moment(
          moment(i.node.ending_date).format('HH:mm'),
          'HH:mm',
        ).isSameOrAfter(moment(filter.endingTimeFrom, 'HH:mm'))
      ) {
        endingTimeFrom = true;
      }
    }
    // endingTimeTo
    if (
      filter.endingTimeTo &&
      moment(filter.endingTimeTo, 'HH:mm').isValid()
    ) {
      endingTimeTo = false;
      if (
        i.node.ending_date &&
        moment(i.node.ending_date).isValid() &&
        moment(
          moment(i.node.ending_date).format('HH:mm'),
          'HH:mm',
        ).isSameOrBefore(moment(filter.endingTimeTo, 'HH:mm'))
      ) {
        endingTimeTo = true;
      }
    }
    // minParticipants
    if (filter.minParticipants) {
      minParticipants = false;
      if (
        i.node.participantRange &&
        i.node.participantRange.from &&
        i.node.participantRange.from >= filter.minParticipants
      ) {
        minParticipants = true;
      }
    }
    // maxParticipants
    if (filter.maxParticipants) {
      maxParticipants = false;
      if (
        i.node.participantRange &&
        i.node.participantRange.to &&
        i.node.participantRange.to <= filter.maxParticipants
      ) {
        maxParticipants = true;
      }
    }
    // sport
    if (filter.sport) {
      sport = false;
      if (
        i.node.sport &&
        i.node.sport.sport &&
        i.node.sport.sport.id &&
        i.node.sport.sport.id === filter.sport
      ) {
        sport = true;
      }
    }
    // sportLevelFrom
    if (filter.sportLevelFrom) {
      sportLevelFrom = false;
      if (i.node.sport && i.node.sport.levels && i.node.sport.levels.length) {
        let minLevel = 101;
        i.node.sport.levels.map(j => {
          if (j.EN.skillLevel <= minLevel) {
            minLevel = j.EN.skillLevel;
          }
        });
        if (minLevel >= filter.sportLevelFrom) {
          sportLevelFrom = true;
        }
      }
    }
    // sportLevelTo
    if (filter.sportLevelTo) {
      sportLevelTo = false;
      if (i.node.sport && i.node.sport.levels && i.node.sport.levels.length) {
        let maxLevel = 0;
        i.node.sport.levels.map(j => {
          if (j.EN.skillLevel >= maxLevel) {
            maxLevel = j.EN.skillLevel;
          }
        });
        if (maxLevel <= filter.sportLevelTo) {
          sportLevelTo = true;
        }
      }
    }
    // type
    if (filter.type && filter.type.length) {
      type = false;
      if (
        i.node.sportunityType &&
        i.node.sportunityType.id &&
        filter.type.includes(i.node.sportunityType.name.EN)
      ) {
        type = true;
      }
    }
    // opponent
    if (filter.opponent && filter.opponent.length) {
      opponent = false;
      if (
        i.node.game_information &&
        i.node.game_information.opponent &&
        i.node.game_information.opponent.organizer &&
        i.node.game_information.opponent.organizer.id &&
        filter.opponent.includes(i.node.game_information.opponent.organizer.id)
      ) {
        opponent = true;
      }
    }
    //  address
    if (filter.address && filter.address.length) {
      address = false;
      if (
        i.node.address &&
        i.node.address.city &&
        filter.address.includes(i.node.address.city)
      ) {
        address = true;
      }
    }
    //  kind
    if (filter.kind && filter.kind.length) {
      kind = false;
      if (i.node.kind && filter.kind.includes(i.node.kind)) {
        kind = true;
      }
    }
    // priceFrom
    if (filter.priceFrom && filter.priceFrom >= 0) {
      priceFrom = false;
      if (
        i.node.price &&
        i.node.price.cents >= 0 &&
        i.node.price.cents >= filter.priceFrom
      ) {
        priceFrom = true;
      }
    }
    // priceTo
    if (filter.priceTo && filter.priceTo >= 0) {
      priceTo = false;
      if (
        i.node.price &&
        i.node.price.cents >= 0 &&
        i.node.price.cents <= filter.priceTo
      ) {
        priceTo = true;
      }
    }
    // summonGroup
    if (filter.summonGroup && filter.summonGroup.length) {
      summonGroup = false;
      if (
        i.node.invited_circles &&
        i.node.invited_circles.edges &&
        i.node.invited_circles.edges.length
      ) {
        i.node.invited_circles.edges.map(j => {
          if (j.node && j.node.id && filter.summonGroup.includes(j.node.id)) {
            summonGroup = true;
          }
        });
      }
    }
    // summonUsers
    if (filter.summonUsers && filter.summonUsers.length) {
      summonUsers = false;
      if (i.node.invited && i.node.invited.length) {
        i.node.invited.map(j => {
          if (j.user && j.user.id && filter.summonUsers.includes(j.user.id)) {
            summonUsers = true;
          }
        });
      }
    }
    // coOrganizer
    if (filter.coOrganizer && filter.coOrganizer.length) {
      coOrganizer = false;
      if (i.node.organizers && i.node.organizers.length) {
        i.node.organizers.map(j => {
          if (
            !j.isAdmin &&
            j.organizer &&
            j.organizer.id &&
            filter.coOrganizer.includes(j.organizer.id)
          ) {
            coOrganizer = true;
          }
        });
      }
    }
    // status
    if (filter.status && filter.status.length) {
      status = false;
      filter.status.map(j => {
        if (i.node.status && i.node.status.indexOf(j) > -1) {
          status = true;
        }
      });
    }
    if (
      organizer &&
      title &&
      description &&
      beginningDayFrom &&
      beginningDayTo &&
      beginningTimeFrom &&
      beginningTimeTo &&
      endingDayFrom &&
      endingDayTo &&
      endingTimeFrom &&
      endingTimeTo &&
      minParticipants &&
      maxParticipants &&
      sport &&
      sportLevelFrom &&
      sportLevelTo &&
      type &&
      opponent &&
      address &&
      kind &&
      priceFrom &&
      priceTo &&
      summonGroup &&
      summonUsers &&
      coOrganizer &&
      status
    ) {
      f.push(index);
    }
  });
  return f;
}

function clearSelection() {
  if (window.getSelection) {
    window.getSelection().removeAllRanges();
  } else if (document.selection) {
    document.selection.empty();
  }
}

const statuses = {
  organized: ['organized', 'organisé'],
  cancelled: ['cancelled', 'annulé'],
  deleted: ['deleted', 'supprimé'],
};
