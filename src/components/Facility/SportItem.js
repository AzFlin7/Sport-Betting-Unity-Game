import React, { Component } from 'react'
import { colors } from '../../theme'
import localizations from '../Localizations'

let styles 

class SportItem extends Component {
	_onDelete = () => {
		this.props.onDeleteSport(this.props.sport.id)
	}
  render() {
    const { sport } = this.props
    return(sport &&
      <section style={styles.container}>
        <div style={styles.sportIcon}>
					<img src={sport.logo} style={styles.sportIcon} />
        </div>
        <div style={styles.sport}>{sport.name[localizations.getLanguage().toUpperCase()]}</div>
        <div style={styles.sportClose}>
          <i className="fa fa-times" 
							style={styles.icon} 
							aria-hidden="true"
							onClick={this._onDelete}></i>
        </div>
      </section>
    )
  }
}

export default SportItem

styles = {
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    marginTop: 15,
    
  },
  sportIcon: {
    width: 30,
    height: 30,
		color: colors.blue,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sportClose: {
    
    transform: 'translateY(50%)',

    width: 20,
    height: 20,
    minWidth: 20,

    cursor: 'pointer',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: '50%',
    color: colors.white,
    marginRight: 10,
    backgroundColor: '#5E9FDF',
    boxShadow: '0 0 2px 0 rgba(0,0,0,0.12), 0 1px 2px 0 rgba(0,0,0,0.24)',
  },
  sport: {
    width:'100%',
		marginLeft:10,
		fontFamily: 'Lato',
		fontSize: 22,
		color: colors.black,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'left',
	},
}


