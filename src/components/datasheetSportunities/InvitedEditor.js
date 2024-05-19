import Button from '@material-ui/core/Button';
import React from 'react';
import ReactSelect from 'react-select';

export const InvitedEditor = props => {
  const value = props.cell.value || [];
  const options = value.map(i => ({
    label: i.user.pseudo,
    value: i.user.id,
  }));
  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={() => props.openInvitedModal(props.row)}
      >
        Add new
      </Button>
      <ReactSelect
        autoFocus
        openOnFocus
        defaultMenuIsOpen
        options={options}
        components={{ Control: () => null }}
      />
    </div>
  );
};
