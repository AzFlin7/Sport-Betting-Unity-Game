import React from 'react';
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { colors, metrics } from '../../theme';
import * as types from '../../actions/actionTypes.js';
import Calendar from './Calendar'
import Venues from './ManageVenueVenues'
import localizations from '../Localizations'

let styles

const Title = ({ children }) => <h2 style={styles.title}>{children}</h2>
const SubTitle = ({ children }) => <h3 style={styles.subtitle}>{children}</h3>

class Sidebar extends React.Component {
  constructor(props) {
    super(props)
  }
  _organizedChanged = (e) => {
    this.props._updateFilter('organized', e.target.checked)
  }
  _bookedChanged = (e) => {
    this.props._updateFilter('booked', e.target.checked)
  }
  _waitListChanged = (e) => {
    this.props._updateFilter('waitList', e.target.checked)
  }
  _passedChanged = (e) => {
    this.props._updateFilter('passed', e.target.checked)
  }
  render() {
    const {  viewer, activeTab, calendarSectionIsHidden } = this.props
    
    return(
        <aside style={styles.sidebar}>
          <Title>{localizations.manageVenue_title}</Title>

          <div style={styles.menuContainer}>
            {!calendarSectionIsHidden && 
              <div 
                style={activeTab === 'calendar' ? styles.menuActive : styles.menu}
                onClick={this.props.onChangeSection.bind(this, 'calendar')}>
                {localizations.manageVenue_calendar}
              </div>
            }
            <div 
              style={activeTab === 'venues' || activeTab === 'venue' ? styles.menuActive : styles.menu}
              onClick={this.props.onChangeSection.bind(this, 'venues')}>
              {localizations.manageVenues}
            </div>
          </div>
          
          {activeTab === 'calendar' && 
            <div style={styles.checkbox_container}>
              <Venues viewer={viewer} {...this.props} />
              <Calendar {...this.props} />
            </div>
          }
        </aside>
    )
  }
}

styles = {
  sidebar: {
    paddingLeft: 20,
    paddinfRight: 20,
    width: 200,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    fontFamily: 'Lato',
    margin: metrics.margin.medium,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.blue,    
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'rgba(0,0,0,0.65)',
  },
  checkbox_container: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
  },
  menuContainer: {
    marginBottom: 20,
    width: '100%'
  },
  menu: {
      fontFamily: 'Lato',
      fontSize: 16,
      color: colors.black,
      marginTop: 15,
      marginBottom: 17,
      marginLeft: 15,
      cursor: 'pointer',
      width: '100%'
	},
	menuActive: {
      fontFamily: 'Lato',
      fontSize: 16,
      color: colors.blue,
      border: '1px solid ' + colors.blue,
      padding: '10px 15px',
      borderLeft: '5px solid ' + colors.blue,
      cursor: 'pointer',
      width: '100%'
	},
};

const _updateFilter = (type, value) => {
  switch(type) {
    case 'organized':
      return {
          type: types.UPDATE_MY_EVENT_FILTER_ORGANIZED,
          organized: value,
        }
    case 'booked': 
      return {
          type: types.UPDATE_MY_EVENT_FILTER_BOOKED,
          booked: value,
        }
    case 'waitList': 
      return {
          type: types.UPDATE_MY_EVENT_FILTER_WAIT_LIST,
          waitList: value,
        }
    case 'passed': 
      return {
          type: types.UPDATE_MY_EVENT_FILTER_PASSED,
          passed: value,
        }
  }
}


const dispatchToProps = (dispatch) => ({
  _updateFilter: bindActionCreators(_updateFilter, dispatch),
});

const stateToProps = (state) => ({
  organized: state.myEventFilterReducer.organized,
  booked: state.myEventFilterReducer.booked,
  waitList: state.myEventFilterReducer.waitList,
  passed: state.myEventFilterReducer.passed,
});

const ReduxContainer = connect(
  stateToProps,
	dispatchToProps,
)(Sidebar);

export default createFragmentContainer(ReduxContainer, {
  viewer: graphql`
    fragment ManageVenueSidebar_viewer on Viewer {
      ...ManageVenueVenues_viewer
    }
  `,
});