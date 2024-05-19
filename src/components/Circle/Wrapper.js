import React from 'react';
import Radium from 'radium';

let styles;

const Wrapper = ({ children }) => (
  <div style={styles.wrapper}>{children}</div>
);


styles = {
  wrapper: {
    width: '100%',
    maxWidth: 1000,
    borderRadius: 5,
    margin: '0px auto',
    boxShadow: '0px 0px 2px rgb(210,210, 210)'
  },
};

export default Radium(Wrapper);
