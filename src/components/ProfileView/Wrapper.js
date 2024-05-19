import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import Radium from 'radium';

let styles;

const Wrapper = pure(({ children }) => (
  <div style={styles.wrapper}>{children}</div>
));


styles = {
  wrapper: {
    width: '95%',
    maxWidth: 1000,
    borderRadius: 5,
    margin: '25px auto',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.4)',
  },
};

export default Radium(Wrapper);
