import React, { PureComponent } from 'react';
import { Button, ListItem, ListItemText, IconButton } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import ReactSelect from 'react-select';

export class InvitedCirclesEditor extends PureComponent {
  render() {
    const value = this.props.cell.value || { edges: [] };
    const options = value.edges.map(i => ({
      label: i.node.name,
      value: i.node.id,
      circle: i.node,
      row: this.props.row,
      removeInvitedCircle: this.props.removeInvitedCircle,
      openInvitedCircleDetailsModal: this.props.openInvitedCircleDetailsModal,
    }));
    return (
      <div>
        <Button
          variant="contained"
          color="primary"
          onClick={() => this.props.openCirclesModal(this.props.row)}
        >
          Add new
        </Button>
        <ReactSelect
          autoFocus
          openOnFocus
          defaultMenuIsOpen
          options={options}
          components={{
            Control: () => null,
            Option: props => (
              <ListItem>
                <ListItemText primary={props.label} />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() =>
                    props.data.openInvitedCircleDetailsModal(
                      props.data.row,
                      props.data.circle,
                    )
                  }
                >
                  Advanced settings
                </Button>
                <IconButton
                  aria-label="Delete"
                  onClick={() =>
                    props.data.removeInvitedCircle(props.data.row, props.value)
                  }
                >
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ),
          }}
        />
      </div>
    );
  }
}
