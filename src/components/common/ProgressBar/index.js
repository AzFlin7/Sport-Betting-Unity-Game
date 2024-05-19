import React from 'react'
import { colors } from '../../../theme'
import Radium from 'radium'
import localizations from '../../Localizations';

let styles;

class ProgressBar extends React.Component {

  render() {
    return (
      <div className="progress-bar" style={styles.progressBar}>
        <Filler percentage={this.props.percentage} nextStepText={localizations[this.props.nextStepText]} hideStepper={this.props.percentage >= 50 ? localizations.stepper_hide_forever : null} hideStepperTutorial={this.props.hideStepperTutorial}/>
      </div>
    )
  }
}

const Filler = Radium(props =>
  <div className="filler" style={{...styles.filler, width: `${props.percentage}%` }}>
    <div style={styles.percent}>{props.percentage + '%'}</div>
    <div style={styles.nextStep}>{props.nextStepText}</div>
    {!!props.hideStepper && <div onClick={props.hideStepperTutorial} style={styles.hideText}>{props.hideStepper}</div>}
  </div>
)

styles = {
  progressBar: {
    position: 'relative',
    height: '30px',
    width: '95%',
    margin: '0 1px',
    border: '1px solid #333'
  },
  filler: {
    display: 'flex',
    fontWeight: 'bold',
    background: colors.green,
    alignItems: 'center',
    height: '100%',
    borderRadius: 'inherit',
    transition: 'width .2s ease-in'
  },
  percent: {
    fontFamily: 'Lato',
    fontSize: 20,
    textAlign: 'center',
    color: colors.black,
    marginLeft: 15,
    '@media (max-width: 425px)': {
      marginLeft: 3
    }
  },
  nextStep: {
    display: 'flex',
    fontFamily: 'Lato',
    fontSize: 18,
    textAlign: 'center',
    color: colors.black,
    whiteSpace: 'nowrap',
    position: 'absolute',
    left: '33%',
    '@media (max-width: 450px)': {
      fontSize: 15,
      left: '23%'
    }
  },
  hideText: {
    display: 'flex',
    fontFamily: 'Lato',
    fontSize: 14,
    color: colors.black,
    whiteSpace: 'nowrap',
    position: 'absolute',
    right: 5, 
    cursor: 'pointer',
    '@media (max-width: 450px)': {
      display: 'none'
    }
  }
}

export default Radium(ProgressBar);