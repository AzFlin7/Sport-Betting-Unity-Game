import React from 'react'
import PureComponent, { pure } from '../common/PureComponent'
import {Link} from 'found'
import Radium from 'radium'
import { connect } from 'react-redux'
import { fonts, colors, metrics } from '../../theme'
import localizations from '../Localizations'

let styles

class NoResult extends PureComponent {
  renderHeader = () => {
    return (<div style={styles.infoHeader}>
      {localizations.myCircles_nothing_found_header}
    </div>)
  };
  renderText = () => {
    const {viewer} = this.props ;
    return (
      <section style={styles.containerText}>
        {viewer.me && 
            <p style={styles.infoText}>
                <Link style={styles.link} to="/new-group">
                    {localizations.myCircles_nothing_found_text1_1}
                </Link>
            </p>
        }
        {viewer.me && 
            <div style={styles.separator}/>
        }
        <p style={styles.infoText}>
          {localizations.myCircles_nothing_found_text1_2}
        </p>
        <div style={styles.separator}/>
        <p style={styles.infoText}>
            {localizations.myCircles_nothing_found_text2_1}
        </p>
      </section>
    )
  };

  render() {
    return(
      <div style={styles.container}>
        <div style={styles.iconContainer}>
          <i
            style={styles.questionIcon}
            className="fa fa-exclamation-circle"
            aria-hidden="true"
          />
        </div>
        {this.renderHeader()}
        {this.renderText()}
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
    '@media (maxWidth: 1024px)': {
      width: '100%',
    }
  },
  containerText: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    marginBottom: 25
  },
  questionIcon: {
    color: '#ffb000',
    fontSize: 100,
  },
  separator: {
    height: 1,
    width: '15%',
    backgroundColor: colors.darkGray,
    margin: '20px 0px',
  },
  infoHeader: {
    fontSize: 30,
    color: '#858585',
    fontFamily: 'Lato',
    textAlign: 'center',
    lineHeight: '26px',
    fontWeight: 'bold',
    marginBottom: 25
  },
  infoText: {
    fontSize: 18,
    color: '#838383',
    fontFamily: 'Lato',
    textAlign: 'center',
    lineHeight: '26px',
  },
  link: {
    color: colors.blue,
    textDecoration: 'none'
  }
}

const stateToProps = (state) => ({
  filter: state.myEventFilterReducer.filter,
});

const ReduxContainer = connect(
  stateToProps,
)(NoResult);


export default Radium(ReduxContainer);