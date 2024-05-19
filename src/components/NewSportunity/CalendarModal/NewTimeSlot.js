import React from 'react'
import Modal from 'react-modal'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import dateformat from 'dateformat'
import ToggleDisplay from 'react-toggle-display'

import { colors, fonts } from '../../../theme'
import OnOff from './OnOff'
import Input from './Input'
import Submit from './Submit'
import localizations from '../../Localizations'
import NewTimeSlotModal from './NewOrEditTimeSlotModal'

let styles 

class NewTimeSlot extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      modalIsOpen: false,
	    withoutSlot: false
    }
  }

  _openModal = () => {
    if (this.props.selectedFacility) {
      this.setState({
        modalIsOpen: true,
        withoutSlot: true
      }) 
    } else {
      alert('Please select facility')
    }
  }

  _closeModal = () => {
    this.setState({
      modalIsOpen: false,
	    withoutSlot: false
    })
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.selectedTimeSlot.start && nextProps.selectedTimeSlot.end &&
        nextProps.selectedTimeSlot.start !== this.props.selectedTimeSlot.start || nextProps.selectedTimeSlot.end !== this.props.selectedTimeSlot.end) {
        this.setState({
            modalIsOpen: true,
        })
    }
  }

  render() {
		const { viewer } = this.props
		return(
      <section>
      <div style={styles.container} onClick={this._openModal}>{localizations.manageVenue_timeslot}<br/><span className="fa fa-plus" /></div>
      {this.state.modalIsOpen && 
        <NewTimeSlotModal
          {...this.state}
          viewer={viewer}
          isOpen={this.state.modalIsOpen}
          selectedVenue={this.props.selectedVenue}
			    selectedFacility={this.props.selectedFacility}
          selectedSlot={this.state.withoutSlot ? null : this.props.selectedTimeSlot}
          onClose={this._closeModal}
          selectSlot={this.props.selectSlot}
        />
      }
    </section>)
  }
}

styles = {
  container: {
    width: 144,
    height: 90,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: colors.blue,
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 4px 4px 0 rgba(0,0,0,0.24)',
    borderRadius: '3px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 50,
    textAlign: 'center',
    fontFamily: 'Lato',
    fontSize: 19,
    color: colors.white,
    lineHeight: '40px',
    cursor: 'pointer',
    zIndex:100,
  },
}

export default createFragmentContainer(NewTimeSlot, {
  viewer: graphql`
    fragment NewTimeSlot_viewer on Viewer {        
      ...NewOrEditTimeSlotModal_viewer
    }
  `,
});

