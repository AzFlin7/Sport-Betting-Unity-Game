import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import InputCheckbox from '../common/Inputs/InputCheckbox'

import { fonts, colors } from '../../theme';
import localizations from "../Localizations";

let styles;

const FilterItem = pure((props) => {
    const { label, selected, defaultFilter } = props;
    return (
      <div style={selected ? styles.selectedContainer : styles.container}>
        {props.selectDefault
          ?  <InputCheckbox
		        checked={defaultFilter}
            onChange={props.onChangeDefault}
          />
          : defaultFilter &&
          <i
            className='fa fa-check'
            style={{fontSize: '1.5em', margin: 5}}
          />
        }
        <label style={selected ? styles.selectedLabel : styles.label} onClick={props.onChange}>
          {label}
        </label>
        <div style={styles.deleteLabel} onClick={props.onDelete}>
          {localizations.myEvents_savedFilter_delete}
        </div>
      </div>
    );
});

styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
	  border: '1px solid ' + colors.blue,
	  padding: '10px 7px',
    justifyContent: 'space-between',
  },

  deleteLabel: {
    fontSize: fonts.size.small,
    fontFamily: 'Lato',
    color: 'rgba(0, 0, 0, 0.64)',
    cursor: 'pointer'
  },

  label: {
    fontSize: fonts.size.medium,
    fontFamily: 'Lato',
    color: 'rgba(0, 0, 0, 0.64)',
    cursor: 'pointer',
    width: '100%'
  },

  selectedContainer: {
    display: 'flex',
		border: '1px solid ' + colors.blue,
		padding: '10px 7px',
		borderLeft: '5px solid ' + colors.blue,
	  justifyContent: 'space-between',
  },

  selectedLabel: {
    fontSize: fonts.size.medium,
    fontWeight: 'bold',
    fontFamily: 'Lato',
    color: colors.blue,
    cursor: 'pointer',
    width: '100%'
  }
};

export default FilterItem ;
