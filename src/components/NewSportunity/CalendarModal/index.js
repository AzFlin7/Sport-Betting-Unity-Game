import React from 'react'
import {
  createRefetchContainer,
  graphql,
} from 'react-relay';
import Radium from 'radium'

import Loading from '../../common/Loading/Loading'
import Sidebar from './Sidebar'
import BigCalendar from './BigCalendar'
import CalendarSidebar from './CalendarSidebar'
import localizations from '../../Localizations'
import {colors, fonts} from "../../../theme";
import Modal from "react-modal";


let styles

class CalendarModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedDate: new Date(),
      selectedVenue: null,
			selectedFacility: null,
      venueCount: 100,
      language: localizations.getLanguage(),
      selectedTimeSlot: {
        start: null,
        end: null
      },
      calendarSectionIsHidden: true,
      selectedVenueId: null,
	    localChange: false
    }
  }

  componentDidMount = () => {
    if (this.props.viewer.me) {
      this.props.relay.refetch({
        query: true,
        filter: {
          users: [this.props.viewer.me.id]
        }
      },
      null,
      () => {
        setTimeout(() => {
          if (this.props.venues && this.props.venues.length > 0) {
            let hasFacility = false ;
            this.props.venues.forEach(edge => {
              if (edge.infrastructures && edge.infrastructures.length > 0)
                hasFacility = true;
            })
            if (hasFacility && this.props.selectedCalendarInfra) {
              this.setState({
                selectedVenue: this.props.venues.find(venue => venue.id === this.props.selectedCalendarInfra.venue.id)
              })
            }
          }
          setTimeout(() => this.setState({ loading: false }), 1500)
        }, 100)
      })
    }
  }

  componentWillReceiveProps = nextProps => {
    if (this.state.calendarSectionIsHidden && nextProps.venues && nextProps.venues.length > 0) {
      let hasFacility = false ;
      nextProps.venues.forEach(edge => {
        if (edge.infrastructures && edge.infrastructures.length > 0)
          hasFacility = true;
      })
      if (hasFacility && nextProps.selectedCalendarInfra && !this.state.localChange) {
        this.setState({
          selectedVenue: nextProps.venues.find(venue => venue.id === nextProps.selectedCalendarInfra.venue.id)
        })
      }
      if (this.state.localChange)
        this.setState({localChange: false})
    }
  }

  _setLanguage = (language) => {
    this.setState({ language: language })
  }
  
  _setState = (name, value) => {
		this.setState({
			[name]: value,
      localChange: true
		})
	}

  _handleCalenderChange = (value) => {
		this.setState({
			selectedDate: value,
		})
	}

  _openNewTimeSlot = (timeSlotInfo) => {
    this.setState({
      selectedTimeSlot: {
        from: timeSlotInfo.start,
        end: timeSlotInfo.end
      }
    })
  }

  _handleCloseRequest = () => {
    this._closeModal()
  }

  _closeModal = () => {
	  this.setState({
		  selectedDate: new Date(),
		  selectedVenue: null,
		  selectedFacility: null,
	  })
    this.props.toggleModal()
  }

  _selectSlot = (slot) => {
    this.props.selectSlot(slot);
    this._closeModal();
  }

  render() {
    const { viewer, venues } = this.props

    return(
      <Modal
        isOpen={this.props.isOpen}
        onRequestClose={this._handleCloseRequest}
        style={modalStyles}
        contentLabel={this.props.title}
      >
        <div style={styles.modalHeader}>
          <div style={styles.modalTitle}>{this.props.title}</div>
          <div style={styles.modalClose} onClick={this._handleCloseRequest}>
            <i className="fa fa-times fa-2x" />
          </div>
        </div>
        <div style={styles.container}>
					<div style={styles.content}>
            <Sidebar
              onChange={ this._handleCalenderChange }
              onSetState={ this._setState }
              viewer={this.props.viewer}
              venues={venues}
              language={localizations.getLanguage()}
              {...this.state}
            />
            <div style={styles.calendarContainer}>
              <BigCalendar
                viewer={viewer}
                selectedDate={this.state.selectedDate}
                onSelectDate={this._openNewTimeSlot}
                selectSlot={this._selectSlot}
                {...this.state}
                venue={this.props.venue}
                venues={venues}
              />
              <CalendarSidebar
                viewer={viewer}
                {...this.state}
                venue={this.props.venue}
                venues={venues}
                selectSlot={this._selectSlot}
              />
            </div>
          </div>
        </div>
      </Modal>
    )

  }
}

let modalStyles = {
  overlay : {
    position          : 'fixed',
    top               : 0,
    left              : 0,
    right             : 0,
    bottom            : 0,
    backgroundColor   : 'rgba(255, 255, 255, 0.75)',
    zIndex: 50
  },
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    width                 : '90%',
    transform             : 'translate(-50%, -50%)',
    border                     : '1px solid #ccc',
    background                 : '#fff',
    overflow                   : 'auto',
    WebkitOverflowScrolling    : 'touch',
    borderRadius               : '4px',
    outline                    : 'none',
    padding                    : '20px',
  },
}

styles = {
  modalHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontFamily: 'Lato',
    fontSize:24,
    fontWeight: fonts.weight.medium,
    color: colors.blue,
    flex: '2 0 0',
  },
  modalClose: {
    justifyContent: 'flex-center',
    color: colors.gray,
    cursor: 'pointer',
  },
  mainContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
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
  calendarContainer: {
    width: '100%',
    display: 'flex'
  }
}

export default createRefetchContainer(Radium(CalendarModal), {
  viewer: graphql`
    fragment CalendarModal_viewer on Viewer @argumentDefinitions (
      query: {type: "Boolean!", defaultValue: false}
      filter: {type: "Filter", defaultValue: null}
      venueCount: {type: "Int", defaultValue: 100}
    ){
      ...Sidebar_viewer
      ...CalendarSidebar_viewer
      ...BigCalendar_viewer
      id
      me {
        id
        circles (last:100) @include(if: $query) {
          edges {
            node {
              id
              name
              memberCount
            }
          }
        }
      }
    }
  `},
  graphql`query CalendarModalRefetchQuery(
      $infraId: ID
      $query: Boolean!
      $filter: Filter
      $venueCount: Int
    ) {
      viewer {
        ...CalendarModal_viewer @arguments(
          infraId: $infraId
          query: $query
          filter: $filter
          venueCount: $venueCount
        )
      }
    }
  `,
);
