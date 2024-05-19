import React, { Component } from 'react';
import SportItem from './SportItem'
import { fonts, colors } from '../../theme'

let styles 

class Sports extends Component {
  render() {
    return(
      <div>
      <div style={styles.inputHeader}>Sports</div>
        <div style={styles.timeList}>
          <ul>
            <SportItem>Tennis</SportItem>
            <SportItem>Basketball</SportItem>
          </ul>
        </div>
      </div>
    )
  }
}

export default Sports


styles = {
	inputHeader: {
    fontFamily: 'Lato',
		fontSize:24,
		fontWeight: fonts.weight.medium,
		color: colors.blue,
		marginBottom: 10,
		marginTop: 20,
  },
	timeList: {
		marginTop: -5,
		marginBottom: 15,
	},
}


