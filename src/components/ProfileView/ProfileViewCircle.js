import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import Radium from 'radium';
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';

import { colors } from '../../theme';


let styles;


const Circle = pure(({ circle }) => (
  <div style={styles.circle}>
    <div style={styles.icon} />
    <div style={styles.name}>{circle.name}</div>
  </div>
));


styles = {

  circle: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 25,
  },

  icon: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    marginBottom: 7,

    backgroundColor: colors.blue,
  },

  name: {
    color: 'rgba(0,0,0,0.65)',
    fontSize: 18,
    fontWeight: 500,
  },
}


export default createFragmentContainer(Radium(Circle), {
  circle: graphql`
    fragment ProfileViewCircle_circle on Circle {
      name
    }
  `,
});
