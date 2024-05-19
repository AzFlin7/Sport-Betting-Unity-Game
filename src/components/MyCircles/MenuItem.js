import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'

import { fonts, colors } from '../../theme';

let styles;

const MenuItem = pure((props) => {
    const { label, selected } = props;
    return (
      <div style={selected ? styles.selectedContainer : styles.container} onClick={props.onChange}>
        <label style={selected ? styles.selectedLabel : styles.label}>
          {label}
        </label>
      </div>
    );
});

styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 1,
    marginBottom: 1,
    paddingTop: 10,
		paddingBottom: 10,
		marginLeft: 12,
    justifyContent: 'space-between',
    cursor: 'pointer'
  },

  label: {
    fontSize: 18,
    fontFamily: 'Lato',
    color: 'rgba(0, 0, 0, 0.64)',
    cursor: 'pointer'
  },

  selectedContainer: {
		border: '1px solid ' + colors.blue,
		padding: '10px 7px',
		borderLeft: '5px solid ' + colors.blue,
		cursor: 'pointer',
  },

  selectedLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Lato',
    color: colors.blue,
    cursor: 'pointer'
  }
};

export default MenuItem ;
