import React, { PureComponent } from 'react';
import Button from '@material-ui/core/Button';

export class OrganizersEditor extends PureComponent {
  componentDidMount() {
    setTimeout(() => {
      this.props.openOrganizersModal(this.props.row);
    }, 1);
  }

  render() {
    return (
      <Button
        variant="contained"
        color="primary"
        onClick={() => this.props.openOrganizersModal(this.props.row)}
      >
        Manage organizers
      </Button>
    );
  }
}
