import React from 'react'
import PureComponent, { pure } from '../common/PureComponent'
import { Link } from 'found';
import Radium from 'radium'
import { fonts, colors, metrics } from '../../theme'
import localizations from '../Localizations'

let styles

class NoResult extends PureComponent {
	render() {
    const {viewer} = this.props ;
		return(
      <div style={styles.container}>
        <div style={styles.iconContainer}>
          <i
            style={styles.questionIcon}
            className="fa fa-question-circle"
            aria-hidden="true"
          />
        </div>
        <div style={styles.infoText}>
          {viewer.me && viewer.me.profileType === 'ORGANIZATION' 
          ? localizations.find_nothing_found_clubs
          : localizations.find_nothing_found}
        </div>
        <div style={styles.buttonContainer}>
          <Link to="/new-sportunity" style={styles.organizeButton}>
            {localizations.find_organize}
          </Link>
        </div>
      </div>
		)
	}
}

styles = {
	container: {
		fontFamily: 'Lato',
		padding: '30px 30px 20px 30px',
		display: 'flex',
		flexDirection: 'column',
    alignItems: 'center',
		width: '100%',
    '@media (max-width: 1024px)': {
      width: '100%',
    }
	},
  iconContainer: {
    marginBottom: 25
  },
  questionIcon: {
    color: '#ffb000',
    fontSize: 100,
  },
  infoText: {
    fontSize: 18,
    width: 300,
    color: '#366969',
    fontFamily: 'Lato',
    textAlign: 'center',
    lineHeight: '26px',
    marginBottom: 25
  },
  buttonContainer: {
    marginTop: 10
  },
  organizeButton: {
		height: '45px',
    backgroundColor: '#5E9FDF',
		boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
		borderRadius: '100px',
		border: 'none',
		fontSize: 18,
		fontWeight: fonts.weight.medium,
		textAling: 'center',
		color: colors.white,
		padding: '14px 35px',
		textAlign: 'center',
		position: 'relative',
		cursor: 'pointer',
    textDecoration: 'none'
  }
}

export default Radium(NoResult);
