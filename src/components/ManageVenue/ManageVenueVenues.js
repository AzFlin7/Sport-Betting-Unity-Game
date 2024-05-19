import React from 'react'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import localizations from '../Localizations'
import { colors } from '../../theme'

let styles

class Venues extends React.Component {
  constructor(props) {
    super(props)
  }

  _handleVenueChange = (e) => {
    this.props.onSetState('venueId', e.target.value)
		this.props.onSetState('facilityId', null)
    const venues = this.props.viewer.me.venues
    venues.edges.forEach(venue => {
      if (venue.node.id === e.target.value) 
        this.props.onSetState('facilityId', venue.node.infrastructures[0].id)
    })
  }

	_handleFacilityChange = (e) => {
    this.props.onSetState('facilityId', e.target.value)
  }

  componentDidMount = () => {
    const { venueId, facilityId } = this.props
    const venues = this.props.viewer.me.venues 
		let _venueId = venueId
		let _facilityId = facilityId
		if(!venueId && venues.edges.length > 0) {
			_venueId = venues.edges[0].node.id
			this.props.onSetState('venueId', _venueId)
			_facilityId = null
		}

		if(!facilityId  && venues.edges.length > 0) {
			let infras = venues.edges
					.filter(edge => edge.node.id === _venueId)[0].node.infrastructures

      if (infras.length) {
        _facilityId = infras[0].id
        this.props.onSetState('facilityId', _facilityId)
      } 
		}
  }

  render() {
    const { venueId, facilityId } = this.props
    const venues = this.props.viewer.me.venues 
		let _venueId = venueId
		let _facilityId = facilityId
		/*if(!venueId && venues.edges.length > 0) {
			_venueId = venues.edges[0].node.id
			this.props.onSetState('venueId', _venueId)
			_facilityId = null
		}

		if(!facilityId) {
			let infras = venues.edges
					.filter(edge => edge.node.id === _venueId)[0].node.infrastructures

      if (infras.length) {
        _facilityId = infras[0].id
        this.props.onSetState('facilityId', _facilityId)
      } 
		}*/

    return(
      <section>
        <div style={styles.label}>{localizations.manageVenue_venue}</div>
        <select style={styles.select} onChange={this._handleVenueChange}>
          {venues.edges.map(edge => <option value={edge.node.id} key={edge.node.id}>{edge.node.name}</option> ) }
        </select>
        <div style={styles.label}>{localizations.manageVenue_facility}</div>
        <select style={styles.select} onChange={this._handleFacilityChange}>
          {venues.edges
            .filter(edge => edge.node.id === this.props.venueId)
            .map(edge => edge.node.infrastructures
            .map(infra => <option key={infra.id} value={infra.id}>{infra.name}</option>)) 
          }
        </select>
      </section>
    )
  }
}

styles = {
  label: {
    width: '200px',
    fontFamily: 'Lato',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: '27px',
    color: colors.black,
  },
  select: {
    width: '200px',
    height: '32px',
    fontFamily: 'Lato',
    fontSize: 20,
    textAlign: 'center',
    lineHeight: '32px',
    color: colors.blue,
    border: 'none',
    marginBottom: 20,
  },
}

export default createFragmentContainer(Venues, {
  viewer: graphql`
    fragment ManageVenueVenues_viewer on Viewer {
      me {
        venues(last:100) {
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