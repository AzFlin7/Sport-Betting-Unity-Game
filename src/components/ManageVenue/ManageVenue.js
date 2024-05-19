import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import Radium from 'radium';

import Header from '../common/Header/Header';
import Footer from '../common/Footer/Footer';
import Loading from '../common/Loading/Loading';
import Sidebar from './ManageVenueSidebar';
import BigCalendar from './ManageVenueBigCalendar';
import CalendarSidebar from './ManageVenueCalendarSidebar';
import localizations from '../Localizations';

import Venue from '../Venue/Venue';
import Facility from '../Facility/Facility';
import { colors } from '../../theme';

let styles;

class ManageVenue extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDate: new Date(),
      venueId: null,
      facilityId: null,
      loading: true,
      venueCount: 100,
      language: localizations.getLanguage(),
      selectedTimeSlot: {
        start: null,
        end: null,
      },
      activeTab: 'venues',
      calendarSectionIsHidden: true,
      selectedVenueId: null,
    };
  }

  componentDidMount = () => {
    if (
      this.props.viewer.me &&
      this.props.viewer.me.venues &&
      this.props.viewer.me.venues.edges &&
      this.props.viewer.me.venues.edges.length > 0
    ) {
      let hasFacility = false;
      this.props.viewer.me.venues.edges.forEach(edge => {
        if (edge.node.infrastructures && edge.node.infrastructures.length > 0)
          hasFacility = true;
      });
      if (hasFacility) {
        this.setState({
          calendarSectionIsHidden: false,
          activeTab: 'calendar',
          venueId: this.props.viewer.me.venues.edges[0].node.id,
        });
      }
    }
    setTimeout(() => this.setState({ loading: false }), 1000);
    document.title = 'Rent time slot of your facilities';
  };

  componentWillReceiveProps = nextProps => {
    if (
      this.state.calendarSectionIsHidden &&
      nextProps.viewer.me &&
      nextProps.viewer.me.venues &&
      nextProps.viewer.me.venues.edges &&
      nextProps.viewer.me.venues.edges.length > 0
    ) {
      let hasFacility = false;
      nextProps.viewer.me.venues.edges.forEach(edge => {
        if (edge.node.infrastructures && edge.node.infrastructures.length > 0)
          hasFacility = true;
      });
      if (hasFacility) {
        this.setState({
          calendarSectionIsHidden: false,
          venueId: nextProps.viewer.me.venues.edges[0].node.id,
        });
      }
    }
  };

  _setLanguage = language => {
    this.setState({ language: language });
  };

  _setState = (name, value) => {
    this.setState({
      [name]: value,
    });
  };

  _handleCalenderChange = value => {
    this.setState({
      selectedDate: value,
    });
  };

  _openNewTimeSlot = timeSlotInfo => {
    this.setState({
      selectedTimeSlot: {
        from: timeSlotInfo.start,
        end: timeSlotInfo.end,
      },
    });
  };

  _changeSection = name => {
    this.setState({
      activeTab: name,
    });
  };

  _selectVenue = id => {
    this.setState({
      selectedVenueId: id,
      activeTab: 'venue',
    });
  };

  render() {
    if (this.state.loading) {
      return <Loading />;
    }
    const { viewer } = this.props;

    return (
      <div style={styles.mainContainer}>
        <div style={styles.container}>
          {viewer.me && (
            <div style={styles.content}>
              <Sidebar
                onChange={this._handleCalenderChange}
                onSetState={this._setState}
                viewer={this.props.viewer}
                onChangeSection={this._changeSection}
                calendarSectionIsHidden={this.state.calendarSectionIsHidden}
                {...this.state}
                language={localizations.getLanguage()}
              />
              {this.state.activeTab === 'calendar' && (
                <div style={styles.calendarContainer}>
                  <BigCalendar
                    onRef={node => (this.bigCalendar = node)}
                    viewer={viewer}
                    selectedDate={this.state.selectedDate}
                    onSelectDate={this._openNewTimeSlot}
                    {...this.state}
                  />
                </div>
              )}
              {this.state.activeTab === 'venues' && (
                <Venue
                  viewer={viewer}
                  selectVenue={this._selectVenue}
                  language={localizations.getLanguage()}
                  onSetState={this._setState}
                />
              )}
              {this.state.activeTab === 'venue' && (
                <div>
                  <div
                    style={{
                      fontFamily: 'Lato',
                      fontSize: 16,
                      color: colors.blue,
                      cursor: 'pointer',
                    }}
                    onClick={() => this._changeSection('venues')}
                  >
                    <i className="fa fa-arrow-left" aria-hidden="true" />
                    {' ' + localizations.back}
                  </div>
                  <Facility
                    viewer={viewer}
                    selectedVenueId={this.state.selectedVenueId}
                    language={localizations.getLanguage()}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}

styles = {
  mainContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 20,
  },
  contentContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'left',
    paddingTop: 15,
    height: '100%',
    '@media (max-width: 550px)': {
      flexDirection: 'column',
    },
  },
  calendarContainer: {
    width: '100%',
    display: 'flex',
  },
};

export default createFragmentContainer(Radium(ManageVenue), {
  viewer: graphql`
    fragment ManageVenue_viewer on Viewer
      @argumentDefinitions(venueCount: { type: "Int", defaultValue: 10 }) {
      ...ManageVenueSidebar_viewer
      ...ManageVenueCalendarSidebar_viewer
      ...ManageVenueBigCalendar_viewer
      ...ManageVenueVenues_viewer
      ...EditVenue_viewer
      ...Facility_viewer
      id
      me {
        id
        circles(last: 100) {
          edges {
            node {
              id
              name
              memberCount
            }
          }
        }
        venues(last: 100) {
          edges {
            node {
              id
              name
              infrastructures {
                id
                name
                sport {
                  id
                }
              }
            }
          }
        }
      }
    }
  `,
});
