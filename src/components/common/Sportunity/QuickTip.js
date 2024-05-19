import React from 'react';
import Radium from 'radium';
import {Link} from 'found';

import { colors } from '../../../theme';

let styles;
const QuickTip = props => {
  const icon = props.icon || 'magic';

  return (
    <div style={styles.container}>
      <Link style={styles.link} to={props.link}>
        <span style={styles.iconContainer}>
          <i style={styles.icon} className={`fa fa-${icon}`} aria-hidden />
        </span>
        <span style={styles.innerLink}>
          <strong style={styles.strong}>{props.messageHeader}</strong>
          <br />
          {props.messageBody}
        </span>
      </Link>
    </div>
  );
};

styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: 13,
    marginBottom: 15,
  },
  link: {
    textAlign: 'center',
    textDecoration: 'none',
    fontSize: '1.2em',
    lineHeight: 1.2,
    padding: '1.5em',
    boxShadow: '0 2px 5px rgba(0,0,0,0.25)',
    borderRadius: '3em',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  innerLink: {
    color: colors.red,
    textAlign: 'left',
    textDecoration: 'none',
    flexGrow: 2,
  },
  iconContainer: {
    display: 'flex',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 1em',
  },
  icon: {
    fontSize: '1.2em',
    color: 'white',
    height: '1.5em',
    background: colors.blue,
    width: '1.5em',
    borderRadius: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  strong: {
    fontSize: '1.2em',
    fontWeight: 'bold',
  },
};

export default Radium(QuickTip);
