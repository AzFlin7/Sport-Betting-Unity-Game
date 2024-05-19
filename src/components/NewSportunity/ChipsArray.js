import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';
import TagFacesIcon from '@material-ui/icons/TagFaces';

const styles = theme => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    padding: theme.spacing.unit / 2,
  },
  chip: {
    margin: theme.spacing.unit / 2,
    background: '#64a5d7',
    color: 'white',
    // colorPrimary:"primary",
  },
  
});

class ChipsArray extends React.Component {


  render() {
      
    const { classes, chipData, onDelete } = this.props;

    return (
      <div>
        {chipData.map(data => {
          let icon = null;

          return (
            <Chip
              
              key={data.key}
              icon={icon}
              label={data.label}
              onDelete={e => onDelete(data, e)}
              className={classes.chip}
            />
          );
        })}
      </div>
    );
  }
}

ChipsArray.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ChipsArray);
