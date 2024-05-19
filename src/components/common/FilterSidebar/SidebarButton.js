import React from 'react';
import PureComponent, { pure } from '../PureComponent'
import InputCheckbox from '../../common/Inputs/InputCheckbox'

import { colors, metrics, fonts } from '../../../theme';
import localizations from "../../Localizations";

let styles;

const FilterButton = pure((props) => {
    const { label, onClick, iconFa, color, textColor } = props;
    return (
        <div 
            style={{...styles.container, backgroundColor: color}} 
            onClick={onClick}>
            <i
              className={'fa '+iconFa}
              style={{...styles.icon, color: textColor}}
            />
            <div style={{...styles.label, color: textColor}}>
              {label}
            </div>
        </div>
    );
});

styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '8px 5px',
    padding: '12px 3px',
    cursor: 'pointer',
    borderRadius: 10,
    boxShadow: 'rgba(0, 0, 0, 0.3) 0px 0px 4px 0px'
  },

  label: {
    fontSize: 17,
    fontFamily: 'Lato',
    cursor: 'pointer',
  },
  icon: {
    fontSize: '2em', 
    marginRight: 10
  }
};

export default FilterButton ;
