import React from 'react'
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium'
import Modal from 'react-modal'
import Calendar from 'react-big-calendar'
const localizer = Calendar.momentLocalizer(moment);
import moment from 'moment'
import format from 'date-fns/format';

import { fonts, colors } from '../../../theme'
import ToggleDisplay from 'react-toggle-display'
import ReactLoading from 'react-loading'
import DeleteSlotMutation from '../../ManageVenue/Mutations/DeleteSlotMutation'
import localizations from '../../Localizations'
import ConfirmationModal, {confirmModal} from '../../common/ConfirmationModal'
import EditTimeSlotModal from './NewOrEditTimeSlotModal'
import dateformat from "dateformat";

function Event({ event }) {
  return (
    <span>
      <div style={{color: event.titleColor, fontWeight: 'bold', marginBottom: 4}}>{event.title}</div>
      {event.desc1 && event.displayDesc1 && <div style={{marginBottom: 3, fontWeight: 'bold'}}>{event.desc1}</div>}
      {event.displayDesc2 && event.desc2}
    </span>
  )
}

let styles, modalStyles

class BigCalendar extends React.Component {
  constructor(props) {
    super(props)
		this.state = {
			event: null,
      isModalOpen: false,
      isEditModalOpen: false,
      deleting: false,
		}
  }

  componentDidMount = () => {
    if (this.props.selectedFacility)
      this.props.relay.refetch({
        id: this.props.selectedFacility.id,
	      filter: {
          dates: {
	          from: dateformat(moment(this.props.selectedDate).subtract(1, 'months'), 'yyyy-mm-dd'),
	          to: dateformat(moment(this.props.selectedDate).add(1, 'months'), 'yyyy-mm-dd'),
          }
	      }
      })
  }

	_selectEvent = (event) => {
		this.setState({
			event: event,
			isModalOpen: true,
		})
	}

  _selectTimeSlot = (slotInfo) => {
    if (this.props.selectedFacility)
      this.props.onSelectDate(slotInfo)
    else 
      alert('Please select facility')
    
  }

	_closeModal = () => {
		this.setState({
			isModalOpen: false,
		})
  }
  
  componentWillReceiveProps = nextProps => {
    if ((!this.props.selectedFacility && nextProps.selectedFacility)
      || (this.props.selectedFacility && nextProps.selectedFacility && this.props.selectedFacility.id !== nextProps.selectedFacility.id)
      || (nextProps.selectedFacility && moment(this.props.selectedDate).format('YYYY-MM') !== moment(nextProps.selectedDate).format('YYYY-MM'))) {
      this.props.relay.refetch({
        id: nextProps.selectedFacility.id,
	      filter: {
		      dates: {
			      from: dateformat(moment(nextProps.selectedDate).subtract(1, 'months'), 'yyyy-mm-dd'),
			      to: dateformat(moment(nextProps.selectedDate).add(1, 'months'), 'yyyy-mm-dd'),
		      }
	      }
      })
    }
  }

  _deleteTimeSlot = () => {
    const event = this.state.event
    confirmModal({
      title: event.is_repeated ? localizations.manageVenue_facility_cancelTimeSlotSerie : localizations.manageVenue_facility_cancelTimeSlot,
      message: event.is_repeated ? localizations.manageVenue_facility_cancelTimeSlotSerieConfirm : localizations.manageVenue_facility_cancelTimeSlotConfirm,
      confirmLabel: localizations.manageVenue_confirm_yes,
      cancelLabel: localizations.manageVenue_confirm_no,
      canCloseModal: true,
      onConfirm: () => {
        this._confirmDelete()
      },
      onCancel: () => {}
    })
  }

  _confirmDelete = () => {
    this.setState({
      deleting: true,
    })
    this._deleteSlot()
  }

  _deleteSlot = () => {
    const event = this.state.event
    const viewer = this.props.viewer
    
    DeleteSlotMutation.commit({
        viewer,
        slotIDVar: event.id,
        deleteSlotSerieVar: event.is_repeated
      },
      {
        onFailure: error => {
          let errors = JSON.parse(error.getError().source);
          console.log(errors);
          this.setState({
            deleting: false,
          })
        },
        onSuccess: (response) => {
          console.log(response);
          this.setState({
            deleting: false,
          })
          this._closeModal();
        },
      }
    )
  }
  
  _editTimeSlot = () => {
    this.setState({isModalOpen: false, isEditModalOpen: true})
  }

  _closeEditModal = () => this.setState({isModalOpen: false, isEditModalOpen: false});

  render() {
    //const venues = this.props.viewer.me.venues.edges

    let events = []
    //let venue = venues.filter(venue => venue.node.id === this.props.selectedVenue)
    //if (venue.length === 0 && this.props.viewer.me.venues.edges > 0) {
    //  venue = this.props.viewer.me.venues.edges[0]
    //}
    const {infrastructure} = this.props.viewer ;
    
    if (infrastructure) {

        events = infrastructure.slots.map(slot => ({
					id: slot.id,
          title: slot.status === 'PAST' 
            ? (!slot.sportunity) 
              ? localizations['slot_'+slot.status]
              : slot.sportunity && !slot.sportunity.cancel_date
                ? localizations['slot_'+slot.status] + ' ( ' + localizations['slot_PLANNED'] + ' )'
                : localizations['slot_'+slot.status] + ' ( ' + localizations['slot_CANCELLED'] + ' )'
            : localizations['slot_'+slot.status],
          titleColor: 
            slot.status === 'PENDING' ? colors.yellow : 
            slot.status === 'PLANNED' ? colors.green : 
            slot.status === 'CANCELLED' ? colors.red : 
            slot.status === 'PAST' && (!slot.sportunity) ? colors.yellow :
            slot.status === 'PAST' && (slot.sportunity && !slot.sportunity.cancel_date) ? colors.green :
            slot.status === 'PAST' && (slot.sportunity && slot.sportunity.cancel_date) ? colors.red :
            colors.white,
          start: new Date(slot.from),
          end: new Date(slot.end),
          slot: slot,
          desc1: slot.sportunity && slot.sportunity.organizers.filter(org => org.isAdmin).map(org => org.organizer.pseudo),
          desc2: slot.price.currency + ' ' + (slot.price.cents / 100),
          displayDesc1: ((new Date(slot.end) - new Date(slot.from)) / 60000 ) > 30,
          displayDesc2: ((new Date(slot.end) - new Date(slot.from)) / 60000 ) > 30,
        }))

    }

    return(
      <section style={styles.container} >
        {this.state.isEditModalOpen && 
          <EditTimeSlotModal
            {...this.state}
            viewer={this.props.viewer}
            isOpen={this.state.isEditModalOpen}
            selectedVenue={this.props.selectedVenue}
            selectedFacility={this.props.selectedFacility}
            selectedSlot={this.state.event}
            selectSlot={this.props.selectSlot}
            onClose={this._closeEditModal}
          />
        }

        <Calendar 
          selectable
          events={events}
          localizer={localizer}
          defaultView='week'
          scrollToTime={new Date(1970, 1, 1, 7)}
          defaultDate={this.props.selectedDate}
          date={this.props.selectedDate}
          views={['week']}
          toolbar={false}
          onNavigate={(day) => {
            this.setState({
              day,
            });
          }}
          onSelectEvent={event => this._selectEvent(event.slot)}
          onSelectSlot={timeSlotInfo => this._selectTimeSlot(timeSlotInfo)}
          timeslots={1}
          components={{
            event: Event,
          }}
        />
        { this.state.isModalOpen && 
        <Modal
          isOpen={this.state.isModalOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this._closeModal}
          style={modalStyles}
          contentLabel="Time slot"
        >
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>{localizations.manageVenue_timeslot}</div>
              <div style={styles.modalClose} onClick={this._closeModal}>
                <i className="fa fa-times fa-2x" onClick={this._closeModal}/>
              </div>
            </div>
            <div style={styles.row}>
              <label style={styles.label}>{this.state.flexible ? 'start' : 'date'}</label>
              <label style={styles.value}>{this.state.event && moment(this.state.event.from).format('L')}</label>
            </div>
            { this.state.flexible &&
            <div style={styles.row}>
              <label style={styles.label}>{localizations.manageVenue_end}</label>
              <label style={styles.value}>{this.state.event && moment(this.state.event.end).format('L')}</label>
            </div>
            }
            
            <div style={styles.row}>
              <label style={styles.label}>{localizations.manageVenue_from}</label>
              <label style={styles.value}>
                {this.state.event && moment(this.state.event.from).format('LT')}
                <label style={styles.label1}>{localizations.manageVenue_to}</label>
                {this.state.event && moment(this.state.event.end).format('LT')}
              </label>	
            </div>

            {this.state.event.is_repeated &&
              <div style={styles.row}>
                <label style={styles.label}>{localizations.newSportunity_confirmation_popup_repeatition_number}</label>
                <label style={styles.value}>
                  {this.state.event.number_of_occurences - this.state.event.is_repeated_occurence_number}
                </label>
              </div>
            }

            <div style={styles.row}>
                <label style={styles.labelCents}>{localizations.manageVenue_price}</label>
                <label style={styles.value}>{this.state.event.price.currency} {(this.state.event.price.cents/100)}</label>	
            </div>
            {this.state.event.usersSlotIsFor && this.state.event.usersSlotIsFor.length > 0 &&
              <div style={styles.row}>
                  <label style={styles.label}>{localizations.manageVenue_users}</label>
                  <label style={styles.value}>
                    {this.state.event.usersSlotIsFor.map((user, index) => (
                      <ul key={index}>
                        {user.pseudo}
                      </ul>
                    ))}
                  </label>	
              </div>
            }
            {this.state.event.circlesSlotIsFor && this.state.event.circlesSlotIsFor.edges && this.state.event.circlesSlotIsFor.edges.length > 0 &&
              <div style={styles.row}>
                  <label style={styles.label}>{localizations.manageVenue_circles}</label>
                  <label style={styles.value}>
                    {this.state.event.circlesSlotIsFor.edges.map((circle, index) => (
                      <ul key={index}>
                        {circle.node.name}
                      </ul>
                    ))}
                  </label>	
              </div>
            }

            {this.state.event.sportunity &&              
              <div style={styles.row}>
                <label style={styles.label}>{localizations.manageVenue_sportunity}</label>
                <label style={styles.value}>
                  {this.state.event.sportunity.title + ' ' + localizations.manageVenue_sportunity_by + ' ' + this.state.event.sportunity.organizers.map(organizer => (
                    organizer.isAdmin 
                    ? organizer.organizer.pseudo
                    : false
                  )).filter(i => Boolean(i))}
                </label>	
            </div>
            }

            {this.state.event.sportunity && this.state.event.sportunity.cancel_date &&
              <div style={styles.row}>
                <label style={styles.label}>{localizations.cancel_date}</label>
                <label style={styles.value}>
                  {moment(this.state.event.sportunity.cancel_date).format('L')}
                </label>	
            </div>
            }

            { this.state.deleting 
            ? <div style={{display: 'flex', justifyContent: 'center'}}><ReactLoading type='cylon' color={colors.white} /> </div>
            : !this.state.event.sportunity && this.state.event.status !== 'PAST' &&
              <section>
                  <div style={styles.editButton} onClick={this._editTimeSlot}>
                    {localizations.manageVenue_facility_editTimeSlot}
                  </div>
                  <div style={styles.deleteButton} onClick={this._deleteTimeSlot}>
                    {localizations.manageVenue_facility_cancelTimeSlot}
                  </div>
                </section>
            }
          </div>
          
        </Modal>}
      </section>
    )
  }
}

styles = {
  container: {
    marginLeft: 20,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '88vh',
    overflow: 'scroll'
  },
	modalContent: {
		display: 'flex',
		flexDirection: 'column',
    justifyContent: 'flex-start',
    zIndex: 100,
	},
	modalHeader: {
		display: 'flex',
		flexDirection: 'row',
    alignItems: 'flex-center',
		justifyContent: 'flex-center',
    zIndex: 100,
	},
	modalTitle: {
		fontFamily: 'Lato',
		fontSize:30,
		fontWeight: fonts.weight.medium,
		color: colors.white,
		marginBottom: 20,
		flex: '2 0 0',
    zIndex: 100,
	},
	modalClose: {
		justifyContent: 'flex-center',
		paddingTop: 10,
		color: colors.gray,
		cursor: 'pointer',
    zIndex: 100,
	},
	row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 7,
    marginBottom: 7,
    zIndex: 100,
  },
  label: {
    fontFamily: 'Lato',
    fontSize: '18px',
    textAlign: 'left',
    lineHeight: '22px',
    color: colors.white,
    zIndex: 100,
    flex: 1
  },
	value: {
    fontFamily: 'Lato',
    fontSize: '18px',
    textAlign: 'left',
    lineHeight: '22px',
    color: colors.white,
    zIndex: 100,
    fontWeight: 'bold',
    flex: 2
  },
	label1: {
    fontFamily: 'Lato',
    fontSize: '18px',
    textAlign: 'left',
    lineHeight: '22px',
    color: colors.white,
    zIndex: 100,
    flex: 1,
    margin: '0 15px'
  },
  labelCents: {
    height: '22px',
    fontFamily: 'Lato',
    fontSize: '18px',
    textAlign: 'left',
    lineHeight: '22px',
    color: colors.white,
    zIndex: 100,    
    flex: 1
  },
  inputHour: {
    width: '80px',
    height: 35,
    backgroundColor: '#FFFFFF',
    border: '2px solid ' + colors.blue,
    borderRadius: '3px',
    color: colors.black,
    zIndex: 100,
  },
  inputPrice: {
    width: '60px',
    height: 35,
    backgroundColor: '#FFFFFF',
    border: '2px solid ' + colors.blue,
    borderRadius: '3px',
    color: colors.black,
    zIndex: 100,
  },
  inputDate: {
    width: '115px',
    height: 35,
    backgroundColor: '#FFFFFF',
    border: '2px solid ' + colors.blue,
    borderRadius: '3px',
    color: colors.black,
    zIndex: 100,
  },
  day: {
    flex: 8,
    fontFamily: 'Lato',
    fontSize: '18px',
    lineHeight: '22px',
    color: 'rgba(0,0,0,0.87)',
    zIndex: 100,
  },
  checkbox: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '18px',
    height: '18px',
    backgroundColor: '#5E9FDF',
    zIndex: 100,
  },
  editButton: {
    width: '360px',
    height: '50px',
    backgroundColor: colors.green,
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    borderRadius: '3px',
    display: 'inline-block',
    fontFamily: 'Lato',
    fontSize: '22px',
    textAlign: 'center',
    color: colors.white,
    borderWidth: 0,
    marginTop: 20,
    cursor: 'pointer',
    lineHeight: '27px',
    paddingTop:10,
  },
  deleteButton: {
		width: '360px',
		height: '50px',
		backgroundColor: colors.redGoogle,
		boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
		borderRadius: '3px',
    display: 'inline-block',
    fontFamily: 'Lato',
    fontSize: '22px',
    textAlign: 'center',
    color: colors.white,
    borderWidth: 0,
    marginTop: 20,
    marginBottom: 10,
    cursor: 'pointer',
		lineHeight: '27px',
    paddingTop:10,
  },
  error: {
    color: colors.red,
    fontSize: 16,
    fontFamily: 'Lato',
    width: 300,
    margin:0,
  },
  confirm: {
    color: colors.white,
    fontSize: 16,
    fontFamily: 'Lato',
    width: 300,
    marginTop:20,
    marginBottom: 10,
  },
  linkYes: {
    color: colors.white,
    fontSize: 16,
    fontFamily: 'Lato',
    marginTop:10,
    marginBottom: 20,
    width:40,
    cursor:'pointer',
  },
  linkNo: {
    color: colors.gray,
    fontSize: 16,
    fontFamily: 'Lato',
    marginTop:10,
    marginBottom: 20,
    width:40,
    cursor:'pointer',
  },
}

modalStyles = {
  overlay : {
    position          : 'fixed',
    top               : 0,
    left              : 0,
    right             : 0,
    bottom            : 0,
    backgroundColor   : 'rgba(255, 255, 255, 0.75)',
    zIndex            : 150
  },
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    border                     : '1px solid #ccc',
    background                 : colors.blue,
    overflow                   : 'auto',
    WebkitOverflowScrolling    : 'touch',
    borderRadius               : '4px',
    outline                    : 'none',
    padding                    : '20px',
    width: 400,
  },
}

export default createRefetchContainer(Radium(BigCalendar), {
//OK
  viewer: graphql`
    fragment BigCalendar_viewer on Viewer @argumentDefinitions (
      id: {type: "ID", defaultValue: null}
      filter: {type: "Filter", defaultValue: null}
      ){
      id
      ...NewOrEditTimeSlotModal_viewer
      infrastructure (id: $id) {
          id
          name
          sport {
            id
          } 
          logo
          slots (filter: $filter) {
            id
            from
            end
            is_repeated
            is_repeated_occurence_number
            number_of_occurences
            usersSlotIsFor {
              id, 
              pseudo,
              avatar
            }
            circlesSlotIsFor (last: 20) {
              edges {
                node {
                  id
                  name
                  memberCount
                }
              }
            }
            price {
              currency
              cents
            }
            status
            sportunity {
              id
              title
              organizers {
                isAdmin
                organizer {
                  pseudo
                }
              }
              cancel_date
            }
          }
      } 
    }
  `,
},
graphql`
query BigCalendarRefetchQuery(
  $id: ID
  $filter: Filter
) {
viewer {
    ...BigCalendar_viewer
    @arguments(
      id: $id
      filter: $filter
    )
}
}
`,
);
