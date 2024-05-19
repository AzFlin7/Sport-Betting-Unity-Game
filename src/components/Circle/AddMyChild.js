import React from 'react';
import { colors, fonts } from '../../theme';
import localizations from '../Localizations';
import { Button } from '@material-ui/core';

let styles;

class AddMyChild extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Button variant="contained" color="primary" onClick={this.props.onClick}>
        {localizations.circle_addMemberChild}
      </Button>
    );
  }
}

styles = {};

export default AddMyChild;
