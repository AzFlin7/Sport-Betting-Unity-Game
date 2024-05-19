import React from 'react';
import { colors } from '../../theme'
let styles;

const Logo = () => {
  return(
    <div style={styles.container}>
      <img src='/images/logo-blue@3x.png' alt='logo' width='75'/>
      <span style={styles.header}>Change Password</span>
    </div>
  )
}

export default Logo;

// STYLES //

styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    color: colors.black,
    fontSize: 24,
    marginTop: 15,
    marginBottom: 35,
  },
}
