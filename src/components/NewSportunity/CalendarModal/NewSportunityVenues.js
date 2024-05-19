import React from 'react'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import localizations from '../../Localizations'
import { colors } from '../../../theme'
import InputSelect from './InputSelect'

let styles

class Venues extends React.Component {
  constructor(props) {
    super(props)
  }

  _handleVenueChange = (e) => {
    this.props.onSetState('selectedVenue', e)
		this.props.onSetState('selectedFacility', null)
    const venues = this.props.venues
    venues.forEach(venue => {
      if (venue.id === e.id) {
      	let infraList = []
	      venue.infrastructures.forEach(edge =>
		      edge.authorized_managers.forEach(manager => {
			      if (infraList.findIndex(infra => infra.id === edge.id) < 0) {
				      if (manager.user !== null && manager.user.id === this.props.viewer.me.id)
					      infraList.push(edge)
				      else if (manager.circle !== null && manager.circle.members.findIndex(member => member.id === this.props.viewer.me.id) >= 0)
					      infraList.push(edge)
			      }
		      })
	      )
	      this.props.onSetState('selectedFacility', infraList[0])
      }
    })
  }

	_handleFacilityChange = (e) => {
    this.props.onSetState('selectedFacility', e)
  }

  componentDidMount = () => {
    const { selectedVenue, selectedFacility } = this.props
    const venues = this.props.venues
		let _selectedVenue = selectedVenue
		let _selectedFacility = selectedFacility
		if(!selectedVenue && venues.length > 0) {
			_selectedVenue = venues[0]
			this.props.onSetState('selectedVenue', _selectedVenue)
			_selectedFacility = null
		}

		if(!selectedFacility) {
			let infras = venues
					.filter(edge => edge.id === _selectedVenue.id)[0].infrastructures
      if (infras.length) {
	      let infraList = []
	      infras.forEach(edge =>
		      edge.authorized_managers.forEach(manager => {
			      if (infraList.findIndex(infra => infra.id === edge.id) < 0) {
				      if (manager.user !== null && manager.user.id === this.props.viewer.me.id)
					      infraList.push(edge)
				      else if (manager.circle !== null && manager.circle.members.findIndex(member => member.id === this.props.viewer.me.id) >= 0)
					      infraList.push(edge)
			      }
		      })
	      )
	      this.props.onSetState('selectedFacility', infraList[0])
      } 
		}
  }

  componentWillReceiveProps = (nextProps) => {
    const { selectedVenue, selectedFacility } = nextProps
	  if (this.props.selectedVenue !== selectedVenue || this.props.selectedFacility !== selectedFacility) {
		  const venues = nextProps.venues
		  let _selectedVenue = selectedVenue
		  let _selectedFacility = selectedFacility
		  if (!selectedVenue && venues.length > 0) {
			  _selectedVenue = venues[0]
			  this.props.onSetState('selectedVenue', _selectedVenue)
			  _selectedFacility = null
		  }

		  if (!selectedFacility) {
			  let infras = venues
				  .filter(edge => edge.id === _selectedVenue.id)[0].infrastructures
			  if (infras.length) {
				  let infraList = []
				  infras.infrastructures.forEach(edge =>
					  edge.authorized_managers.forEach(manager => {
						  if (infraList.findIndex(infra => infra.id === edge.id) < 0) {
							  if (manager.user !== null && manager.user.id === this.props.viewer.me.id)
								  infraList.push(edge)
							  else if (manager.circle !== null && manager.circle.members.findIndex(member => member.id === this.props.viewer.me.id) >= 0)
								  infraList.push(edge)
						  }
					  })
				  )
				  this.props.onSetState('selectedFacility', infraList[0])
			  }
		  }
	  }
  }

  render() {
    const { selectedVenue, selectedFacility } = this.props
    const venues = this.props.venues
		let _selectedVenue = selectedVenue
		let _selectedFacility = selectedFacility
		/*if(!selectedVenue && venues.length > 0) {
			_selectedVenue = venues.id
			this.props.onSetState('selectedVenue', _selectedVenue)
			_selectedFacility = null
		}

		if(!selectedFacility) {
			let infras = venues
					.filter(edge => edge.id === _selectedVenue)[0].infrastructures

      if (infras.length) {
        _selectedFacility = infras[0].id
        this.props.onSetState('selectedFacility', _selectedFacility)
      } 
		}*/
		let infraList = [];
		if (this.props.selectedVenue && this.props.viewer.me) {
			venues.filter(edge => edge.id === this.props.selectedVenue.id)[0].infrastructures.forEach(edge => {
				edge.authorized_managers.forEach(manager => {
					if (infraList.findIndex(infra => infra.id === edge.id) < 0) {
						if (manager.user !== null && manager.user.id === this.props.viewer.me.id)
							infraList.push(edge)
						else if (manager.circle !== null && manager.circle.members.findIndex(member => member.id === this.props.viewer.me.id) >= 0)
							infraList.push(edge)
					}
				})
			})
		}

    return(
      <section>
        <div style={styles.label}>{localizations.manageVenue_venue}</div>
	      <InputSelect
		      list={venues}
		      selectedItem={selectedVenue}
		      onSelectItem={this._handleVenueChange}
	      />
        <div style={styles.label}>{localizations.manageVenue_facility}</div>
	      <InputSelect
		      list={infraList}
		      selectedItem={selectedFacility}
		      onSelectItem={this._handleFacilityChange}
	      />
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
    fragment NewSportunityVenues_viewer on Viewer {
      me {
        id
        venues(last:100) {
          edges {
            node {
              id
              name
              address {
                address
                city
                country
              }
              infrastructures {
                id
                name
                sport {
                  id
                } 
                slots {
                  id
                  from
                  end
                  price {
                    currency
                    cents
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
});