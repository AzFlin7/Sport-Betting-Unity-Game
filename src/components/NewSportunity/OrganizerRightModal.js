import React, { PureComponent } from 'react';
import Modal from 'react-modal';
import {
  Button,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  Tooltip,
  Checkbox,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import localizations from '../Localizations';
import { colors } from '../../theme';

let styles = {};
let modalStyles = {};
const muiStyles = theme => ({
  tooltip: {
    fontSize: 14,
  },
  tableCell: {
    border: 0,
  },
});

class OrganizerRightModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      permissions: props.organizer.permissions,
    };
  }

  handlePermissionsChange = (name, access) => event => {
    const permissions = JSON.parse(JSON.stringify(this.state.permissions));
    const { checked } = event.target;
    if (access === 'view') {
      permissions[name][access] = checked; 
      if (!checked) permissions[name].edit = checked
    } 
    else if (access === 'edit') {
      permissions[name][access] = checked;
      // update view
      permissions[name].view =
        permissions[name].edit || permissions[name].view;
    }
    this.setState({
      permissions,
    });
  };

  render() {
    const { permissions } = this.state;
    const { props } = this;
    const { classes } = props;
    return (
      <div>
        <Modal
          isOpen={props.isOpen}
          onRequestClose={props.close}
          style={modalStyles}
        >
          <div style={styles.container}>
            <div style={styles.titleRow}>
              <div style={styles.title}>
                {localizations.newSportunity_organizerRightModalTitle}
              </div>
              <div>
                <i
                  className="fa fa-times"
                  style={{
                    color: colors.red,
                    cursor: 'pointer',
                    fontSize: 25,
                  }}
                  onClick={props.close}
                />
              </div>
            </div>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell className={classes.tableCell} />
                  <TableCell
                    style={styles.tableTitle}
                    className={classes.tableCell}
                  >
                    {`${localizations.View}    `}
                    <Tooltip
                      title={
                        localizations.newSportunity_organizerRightViewTooltip
                      }
                      classes={{ tooltip: classes.tooltip }}
                    >
                      <i className="fa fa-question" aria-hidden="true" />
                    </Tooltip>
                  </TableCell>
                  <TableCell
                    style={styles.tableTitle}
                    className={classes.tableCell}
                  >
                    {`${localizations.Edit}    `}
                    <Tooltip
                      title={
                        localizations.newSportunity_organizerRightEditTooltip
                      }
                      classes={{ tooltip: classes.tooltip }}
                    >
                      <i className="fa fa-question" aria-hidden="true" />
                    </Tooltip>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell className={classes.tableCell}>
                    <div style={styles.iconDiv}>
                      <img src="/images/information.png" style={styles.icon} />
                    </div>
                    <div style={styles.nameDiv}>{localizations.Details}</div>
                  </TableCell>
                  <TableCell className={classes.tableCell}>
                    <Checkbox
                      color="primary"
                      checked={permissions.detailsAccess.view}
                      onChange={this.handlePermissionsChange(
                        'detailsAccess',
                        'view',
                      )}
                    />
                  </TableCell>
                  <TableCell className={classes.tableCell}>
                    <Checkbox
                      color="primary"
                      checked={permissions.detailsAccess.edit}
                      onChange={this.handlePermissionsChange(
                        'detailsAccess',
                        'edit',
                      )}
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className={classes.tableCell}>
                    <div style={styles.iconDiv}>
                      <img src="/images/member.png" style={styles.icon} />
                    </div>
                    <div style={styles.nameDiv}>
                      {localizations.Participants}
                    </div>
                  </TableCell>
                  <TableCell className={classes.tableCell}>
                    <Checkbox
                      color="primary"
                      checked={permissions.memberAccess.view}
                      onChange={this.handlePermissionsChange(
                        'memberAccess',
                        'view',
                      )}
                    />
                  </TableCell>
                  <TableCell className={classes.tableCell}>
                    <Checkbox
                      color="primary"
                      checked={permissions.memberAccess.edit}
                      onChange={this.handlePermissionsChange(
                        'memberAccess',
                        'edit',
                      )}
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className={classes.tableCell}>
                    <div style={styles.iconDiv}>
                      <img
                        src="/images/comment_bubble.png"
                        style={styles.icon}
                      />
                    </div>
                    <div style={styles.nameDiv}>{localizations.Chat}</div>
                  </TableCell>
                  <TableCell className={classes.tableCell}>
                    <Checkbox
                      color="primary"
                      checked={permissions.chatAccess.view}
                      onChange={this.handlePermissionsChange(
                        'chatAccess',
                        'view',
                      )}
                    />
                  </TableCell>
                  <TableCell className={classes.tableCell}>
                    <Checkbox
                      color="primary"
                      checked={permissions.chatAccess.edit}
                      onChange={this.handlePermissionsChange(
                        'chatAccess',
                        'edit',
                      )}
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className={classes.tableCell}>
                    <div style={styles.iconDiv}>
                      <img src="/images/car.png" style={styles.icon} />
                    </div>
                    <div style={styles.nameDiv}>
                      {localizations.Carpooling}
                    </div>
                  </TableCell>
                  <TableCell className={classes.tableCell}>
                    <Checkbox
                      color="primary"
                      checked={permissions.carPoolingAccess.view}
                      onChange={this.handlePermissionsChange(
                        'carPoolingAccess',
                        'view',
                      )}
                    />
                  </TableCell>
                  <TableCell className={classes.tableCell}>
                    <Checkbox
                      color="primary"
                      checked={permissions.carPoolingAccess.edit}
                      onChange={this.handlePermissionsChange(
                        'carPoolingAccess',
                        'edit',
                      )}
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className={classes.tableCell}>
                    <div style={styles.iconDiv}>
                      <img src="/images/video-files.png" style={styles.icon} />
                    </div>
                    <div style={styles.nameDiv}>{localizations.Media}</div>
                  </TableCell>
                  <TableCell className={classes.tableCell}>
                    <Checkbox
                      color="primary"
                      checked={permissions.imageAccess.view}
                      onChange={this.handlePermissionsChange(
                        'imageAccess',
                        'view',
                      )}
                    />
                  </TableCell>
                  <TableCell className={classes.tableCell}>
                    <Checkbox
                      color="primary"
                      checked={permissions.imageAccess.edit}
                      onChange={this.handlePermissionsChange(
                        'imageAccess',
                        'edit',
                      )}
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className={classes.tableCell}>
                    <div style={styles.iconDiv}>
                      <img
                        src="/images/Composition/compo.png"
                        style={styles.icon}
                      />
                    </div>
                    <div style={styles.nameDiv}>
                      {localizations.Composition}
                    </div>
                  </TableCell>
                  <TableCell className={classes.tableCell}>
                    <Checkbox
                      color="primary"
                      checked={permissions.compositionAccess.view}
                      onChange={this.handlePermissionsChange(
                        'compositionAccess',
                        'view',
                      )}
                    />
                  </TableCell>
                  <TableCell className={classes.tableCell}>
                    <Checkbox
                      color="primary"
                      checked={permissions.compositionAccess.edit}
                      onChange={this.handlePermissionsChange(
                        'compositionAccess',
                        'edit',
                      )}
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className={classes.tableCell} />
                  <TableCell className={classes.tableCell} />
                  <TableCell className={classes.tableCell}>
                    <Button
                      color="primary"
                      variant="contained"
                      onClick={() => {
                        props.updatePermissions(permissions);
                        props.close();
                      }}
                    >
                      {localizations.newSportunity_save_schedule}
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Modal>
      </div>
    );
  }
}

export default withStyles(muiStyles)(OrganizerRightModal);

styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: 600,
    maxWidth: 600,
  },
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  title: {
    color: colors.blue,
    fontSize: 22,
  },
  tableTitle: {
    fontSize: 20,
  },
  icon: {
    width: 30,
    height: 30,
    filter: 'brightness(3)',
    verticalAlign: 'middle',
  },
  iconDiv: {
    width: 30,
    height: 30,
    backgroundColor: colors.blue,
    display: 'inline-block',
  },
  nameDiv: {
    display: 'inline-block',
    marginLeft: 10,
  },
};

modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    border: '1px solid #ccc',
    background: '#fff',
    overflow: 'visible',
    WebkitOverflowScrolling: 'touch',
    borderRadius: '4px',
    outline: 'none',
    padding: '20px',
  },
};
