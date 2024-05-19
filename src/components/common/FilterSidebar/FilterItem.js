import React from 'react';
import PureComponent, { pure } from '../PureComponent'
import InputCheckbox from '../../common/Inputs/InputCheckbox'

import { colors, metrics, fonts } from '../../../theme';
import localizations from "../../Localizations";

let styles;

const FilterItem = pure((props) => {
    const { label, selected, defaultFilter } = props;
    return (
        <div style={selected && !props.selectDefault ? styles.selectedContainer : styles.container}>
                {props.selectDefault
                ?   <InputCheckbox
                        checked={defaultFilter}
                        onChange={props.onChangeDefault}
                    />
                :   defaultFilter &&
                        <i
                            className='fa fa-check'
                            style={{fontSize: '1.5em', marginRight: 5}}
                        />
                }
                <label 
                  style={props.selectDefault ? {...styles.label, marginBottom: 5} : selected ? styles.selectedLabel : styles.label} 
                  onClick={props.selectDefault ? props.onChangeDefault : props.onChange}>
                    {label}
                </label>
                {!props.selectDefault && 
                  <div style={styles.deleteLabel} onClick={props.onDelete}>
                      {localizations.myEvents_savedFilter_delete}
                  </div>
                }
        </div>
    );
});

styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 2,
    padding: '3px 12px 3px 12px',
    cursor: 'pointer',
    color: 'rgba(0, 0, 0, 0.64)',
  },

  selectedContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 2,
    padding: '3px 12px 3px 12px',
    cursor: 'pointer',
    backgroundColor: colors.blue,
    color: colors.white
  },

  deleteLabel: {
    fontSize: fonts.size.small,
    fontFamily: 'Lato',
    cursor: 'pointer'
  },

  label: {
    fontSize: fonts.size.small,
    fontFamily: 'Lato',
    cursor: 'pointer',
    width: '100%'
  },

  selectedLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Lato',
    cursor: 'pointer',
    width: '100%'
  }
};

export default FilterItem ;
