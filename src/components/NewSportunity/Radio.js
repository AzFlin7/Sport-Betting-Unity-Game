import React from 'react';
import { fonts } from '../../theme';


let styles;

const Radio = (props) => {
  const { checked, label, onChange, name, id } = props;
  const finalContainerStyle = Object.assign({}, styles.container, props.style);
  return (
    <div style={finalContainerStyle}>
      <input type="radio" onChange={onChange} checked={checked} style={styles.radio} name={name} id={id}/>
      <label style={styles.label}>{label}</label>
    </div>
  );
}


styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    fontSize: fonts.size.xl,
  },

  radio: {
    width: 20,
    height: 20,
    margin: '0 17px 0 0',

    backgroundColor: 'white',
    border: '1px solid black',
  },

  label: {
    fontWeight: 500,
    fontFamily: 'Lato',
    color: 'rgba(0, 0, 0, 0.64)',
  },
}


export default Radio;
