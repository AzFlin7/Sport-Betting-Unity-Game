import React from 'react'
import styles from './styles.js'
import localizations from '../Localizations'

const Logo = ({isCreatingSubAccount, me, afterRegistration}) => {
  return(
    <div style={styles.logoContainer}>
      <img src='/images/logo-blue@3x.png' alt='logo' style={styles.logo}/>
      <h1 style={styles.h1}>
        {afterRegistration 
        ? localizations.register_header_thankyou
        : isCreatingSubAccount && me 
          ? me.profileType !== 'PERSON'
            ? localizations.register_header_team
            : localizations.register_header_child
          : localizations.register_header
        }
      </h1>
    </div>
  )
}

export default Logo;
