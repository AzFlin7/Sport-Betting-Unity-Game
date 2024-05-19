import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import Radium from 'radium';
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import localizations from '../Localizations'

import { colors } from '../../theme';

import Circle from './ProfileViewCircle';

let styles;

const Sidebar = pure(({ user }) => {
  return(
    <aside style={styles.sidebar}>
      <h2 style={styles.title}>{localizations.profileView_circles}</h2>
      {
        user.circles.edges && user.circles.edges.length
        ? user.circles.edges.map(edge => {return <Circle key={edge.node.id} circle={edge.node} />})
        : <div style={styles.circle_no_data}>- No data entered by user yet -</div>
      }
    </aside>
  )
})

styles = {
  circle_no_data: {
    fontFamily: 'Lato',
    fontSize: 14,
    marginTop: 10,
    width: 100,
    lineHeight: '18px',
    textAlign: 'center',
  },
  sidebar: {
    padding: 20,
    width: 200,
    boxShadow: 'inset 1px 0 0 0 rgba(217,217,217,0.5)',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',

    fontFamily: 'Lato',
  },

  title: {
    color: 'rgba(0,0,0,0.65)',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  add: {
    width: '130px',
    height: '26px',
    backgroundColor: '#5E9FDF',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    borderRadius: '97px',
    borderStyle: 'none',

    cursor: 'pointer',

    color: colors.white,
  },
};

export default createFragmentContainer(Radium(Sidebar), {
  user: graphql`
    fragment Sidebar_user on User {
      circles(last:10) {
        edges {
          node {
            id
            name
          }
        }
      }
    }
  `,
});
