import React from 'react';
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium';

import { colors } from '../../theme';
import localizations from '../Localizations'

import Dropdown from './AddOrganizerDropdown';
import FindPlace from './FindPlace.js';
import CalendarModal from './CalendarModal'

let styles;



class VenueOrAddress extends React.Component {
  state = {
    showDropdown: false,
    chosenModal: 0,
    isLoadingSlots: false
  }

  componentDidMount() {
    if (this.props.viewer.me) {
      this.setState({isLoadingSlots: true})
      this.props.relay.refetch({
          query: true,
          filter: {
            users: [this.props.viewer.me.id]
          },
          slotFilter: {
              sport: this.props.sport ? {sportID: this.props.sport.id} : null,
              users: [this.props.viewer.me.id]
          }
        },
        null,
        () => this.setState({isLoadingSlots: false})
      )
    }
  }

  componentWillReceiveProps = (nextProps) => {
    if (this.props.viewer.me && this.props.viewer.me.id && (this.props.viewer.me.id !== nextProps.viewer.me.id || nextProps.sport !== this.props.sport)) {
      this.setState({isLoadingSlots: true})
	    this.props.relay.refetch({
          query: true,
          filter: {
            users: [this.props.viewer.me.id]
          },
          slotFilter: {
            sport: nextProps.sport ? {sportID: nextProps.sport.id} : null,
            users: [this.props.viewer.me.id]
          }
        },
        null,
        () => this.setState({isLoadingSlots: false})
      )
    }
  }

  _handleCloseModal = () => {
    this.setState({showDropdown: false})
  }

  _handleChooseAddress = (e) => {
    this._handleCloseModal();
    document.getElementById("search_address_div").style.display = "none";
    this.props.onChangeAddress(e);
  }

  _handleChooseSlot = (slot) => {
    this._handleCloseModal();
    this.props.onChangeSlot(slot);
  }

  _handleChooseInfrastructure = (infrastructure) => {
    this._handleCloseModal();
    this.props.onChangeInfrastructure(infrastructure);
  }

  render() {
    const { style, sport, viewer, isLoggedIn, address, venue, infrastructure, slot } = this.props;
    const finalContainerStyles = Object.assign({}, styles.container, style);

    return (
      <div style={finalContainerStyles} ref={node => { this._containerNode = node; }}>
        <FindPlace
          isLoggedIn={isLoggedIn}
          viewer={viewer}
          parentViewer={viewer}
          sport={sport}
          isOpen={true}
          openedModal={0}
          onChooseSlot={this._handleChooseSlot}
          onChangeAddress={this._handleChooseAddress}
          onChooseInfrastructure={this._handleChooseInfrastructure}
          sportunityId={this.props.sportunityId}
          address = {address}
          error={this.props.error}
          errorMessage={this.props.errorMessage}
          isLoadingSlots={this.state.isLoadingSlots}
        />

        {venue && venue.name &&
          <div style={styles.text}>
            <h3 style = {{fontWeight :'bold'}}>Chosen Venue :</h3>
            {venue.name + ' - ' + infrastructure.name}
          </div>
        }
        {address && 
          <div style={styles.text}>
            <h3 style = {{fontWeight :'bold'}}>{localizations.newSportunity_venueOrAddress_chosenAddress}</h3>
            {address}
          </div>
        }
      </div>
    );
  }
}

styles = {
  container: {
    fontFamily: 'Lato',
    position: 'relative',
    marginBottom: 27
  },
  label: {
    display: 'block',
    color: colors.blueLight,
    fontSize: 16,
    lineHeight: 1,
    marginBottom: 8,
  },

  add: {
    border: 'none',
    backgroundColor: colors.blue,
    color: colors.white,

    fontSize: 18,
    fontWeight: 500,
    lineHeight: 1,

    padding: '8.5px 13px 7.5px',

    cursor: 'pointer',

    borderRadius: 3,
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
  },
  text: {
    display: 'block',
    color: 'rgba(0, 0, 0, 0.64)',
    fontSize: 18,
    lineHeight: 1,
    marginBottom: 8,
  }
};

export default createRefetchContainer(Radium(VenueOrAddress), {
//OK
  viewer: graphql`
    fragment VenueOrAddress_viewer on Viewer @argumentDefinitions(
      slotFilter: {type: "Filter", defaultValue: null}
      query: {type: "Boolean!", defaultValue: false}
      filter: {type: "Filter", defaultValue: null}
      ){
      ...CalendarModal_viewer
      ...FindPlace_viewer
      id
      me {
        id
        profileType
        isSubAccount
      }
      infrastructures (filter: $filter) @include (if: $query) {
        id
        name
        venue {
          id
          name 
          address {
            address, 
            city,
            zip,
            country
          }
          infrastructures {
            id
            name
            authorized_managers {
              user { id }
              circle {
                members { id }
              }
            }
          }
        }
        logo
        sport {
          id
          name {
            EN, FR
          }
          logo
        }
      }
      slots (filter: $slotFilter) @include (if: $query) {
        id
        venue {
          id
          name,
          address {
            address, 
            city,
            zip,
            country
          }
        },
        infrastructure {
          id, 
          name,
          logo,
          sport {
            id
            name {
              EN,
              FR
            }
            logo
          }
        },
        from,
        end, 
        price {
            cents, 
            currency
        },
        serie_information {
            firstDate
            lastDate
            remainingSlots
        }
      }
    }
  `
},
  graphql`
    query VenueOrAddressRefetchQuery(
      $slotFilter: Filter
      $query: Boolean!
      $filter: Filter
    ) {
      viewer {
        ...VenueOrAddress_viewer
          @arguments(
            slotFilter: $slotFilter
            query: $query
            filter: $filter
          )
      }
    }
  `
);
