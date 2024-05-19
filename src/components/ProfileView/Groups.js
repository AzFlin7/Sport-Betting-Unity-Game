import React from 'react'
import PureComponent, { pure } from '../common/PureComponent'
// import IconTint from 'react-icon-tint'
import { colors, fonts, metrics } from '../../theme'
import localizations from '../Localizations'

let styles


const Groups = pure((group) => {

    return(
      <div style={styles.container}>
        Group
      </div>
    )
})

styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginBottom: metrics.margin.large,
    color: colors.black,
  },
}


export default Groups