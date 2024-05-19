import React from 'react';
import get from 'lodash/get';

import { colors, fonts } from '../../theme';

const GroupCheckbox = ({ id, label, isChecked, onChange }) => (
  <label style={styles.checkboxLabel}>
    <input
      name={id}
      type="checkbox"
      checked={isChecked}
      value={isChecked}
      onChange={onChange}
      style={styles.checkbox}
    />
    {label}
  </label>
)

const NewFilterGroups = ({ circles, selectedCircles, onSelectCircle }) => {
  return (
    <div style={styles.container}>
      {circles.map((circle, index) => (
        <div key={get(circle, 'value.node.id', index)} style={styles.checkboxContainer}>
          <GroupCheckbox
            id={get(circle, 'value.node.id')}
            label={circle.label}
            isChecked={selectedCircles.find(selectedCircle => {
              console.log({ selectedCircle });
              return get(selectedCircle, 'value.node.id') === get(circle, 'value.node.id');
            })}
            onChange={() => { onSelectCircle(circle); }}
          />
        </div>
      ))}
    </div>
  )
};

export const styles = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  checkboxContainer: {
    minWidth: 120,
    paddingTop: 15,
    marginRight: 5,
  },
  checkboxLabel: {
    fontSize: fonts.size.medium,
    fontFamily: 'Lato',
    cursor: 'pointer',
  },
  checkbox: {
    borderWidth: 0,
    borderBottomWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.blue,
    lineHeight: 32,
    fontFamily: 'Lato',
    color: 'rgba(0,0,0,0.65)',
    background: 'transparent',
    fontSize: fonts.size.medium,
    outline: 'none',
    cursor: 'pointer',
    width: 20, 
    height: 20, 
    ':disabled': {
      backgroundColor: colors.gray,
    },
  }
};

export default NewFilterGroups;
