/* global google */
import React from 'react';
import PureComponent from '../common/PureComponent';
import Radium from 'radium';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { withGoogleMap, GoogleMap, Marker } from 'react-google-maps';

let styles;

const MapWithAMarker = withGoogleMap(
  ({
    lat,
    lng,
    sportunities,
    onMapClick,
    handleCenterChanged,
    handleMapMounted,
    highlightedId,
  }) => (
    <GoogleMap
      defaultZoom={16}
      center={{ lat, lng }}
      onClick={onMapClick}
      onCenterChanged={handleCenterChanged}
      ref={handleMapMounted}
    >
      {sportunities.map(edge => (
        <Marker
          key={edge.node.id}
          position={{
            lat: edge.node.address.position.lat,
            lng: edge.node.address.position.lng,
          }}
          defaultAnimation="2"
          icon={
            edge.node.id === highlightedId ? '/images/marker-active.png' : null
          }
        />
      ))}
    </GoogleMap>
  ),
);
class Map extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      sportunities: [],
      gmap_margin_top: 0,
    };
  }

  componentDidMount() {
    window.addEventListener('scroll', e => this._manageMapOffset());
  }

  componentDidUpdate() {
    if (
      this.props.sportunities &&
      this._isNewSet(this.props.sportunities.edges)
    ) {
      this._setBound();
      this.setState({
        sportunities: this.props.sportunities.edges,
      });
    }
    if (this.props.mapStatus === 'finalizing') {
      this.props.onUpdateMapStatus('updated');
      this._setBound();
    }
  }

  _isNewSet = edges => {
    if (edges.length !== this.state.sportunities.length) return true;
  };

  _setBound = () => {
    if (this.props.sportunities) {
      const bounds = new google.maps.LatLngBounds();

      this.props.sportunities.edges.map(edge => {
        const position = new google.maps.LatLng(
          edge.node.address.position.lat,
          edge.node.address.position.lng,
        );
        bounds.extend(position);
        return null;
      });

      if (this._map) {
        this._map.fitBounds(bounds);
      }
    }
  };

  _handleMapMounted = map => {
    this._map = map;
    this._setBound();
  };

  _handleCenterChanged = () => {
    const nextCenter = this._map.getCenter();
    this.props.onLocationChange(nextCenter.lat(), nextCenter.lng());
  };

  _manageMapOffset = () => {
    if (window.innerWidth >= 1024) {
      const element = this.refs.gmapSection;

      if (element && element.getBoundingClientRect().bottom > 1000)
        if (window.pageYOffset >= 62)
          // Avoid the map to be in front of the footer
          this.setState({
            gmap_margin_top: window.pageYOffset - 62,
          });
        else {
          this.setState({
            gmap_margin_top: 0,
          });
        }
    } else {
      this.setState({
        gmap_margin_top: 0,
      });
    }
  };

  render() {
    const sportunities = this.props.sportunities
      ? this.props.selectedLevels.length === 0
        ? this.props.sportunities.edges
        : this.props.sportunities.edges
            .map(event => {
              if (event.node.sport.allLevelSelected) {
                return event;
              }
              const levelIds = event.node.sport.levels.map(level => level.id);
              const matched = levelIds.filter(
                id =>
                  this.props.selectedLevels.findIndex(e => e.id === id) >= 0,
              );
              if (matched.length > 0) return event;
              return false;
            })
            .filter(i => Boolean(i))
      : [];
    let lat, lng;
    if (this.props.locationLat && this.props.locationLng) {
      lat = this.props.locationLat;
      lng = this.props.locationLng;
    } else {
      lat =
        sportunities.length > 0
          ? sportunities[0].node.address.position.lat || 46.52
          : 46.52;
      lng =
        sportunities.length > 0
          ? sportunities[0].node.address.position.lng || 6.6336
          : 6.6336;
    }
    return (
      <section
        style={{ marginTop: this.state.gmap_margin_top, ...styles.container }}
        ref="gmapSection"
        id="gmapSection"
      >
        <MapWithAMarker
          containerElement={
            <div
              {...this.props.containerElementProps}
              style={styles.containerElement}
            />
          }
          mapElement={<div style={{ height: `100%` }} />}
          lat={lat}
          lng={lng}
          sportunities={sportunities}
          onMapClick={this.onMapClick}
          handleCenterChanged={this._handleCenterChanged}
          handleMapMounted={this._handleMapMounted}
          highlightedId={this.props.highlightedId}
        />
      </section>
    );
  }
}

styles = {
  container: {
    width: '100%',
    '@media (maxWidth: 1024px)': {
      position: 'relative',
    },
  },
  containerElement: {
    height: '800px',
    '@media (maxWidth: 1024px)': {
      height: '800px',
    },
  },
};

export default createFragmentContainer(Radium(Map), {
  sportunities: graphql`
    fragment FindSportunityMap_sportunities on SportunityConnection {
      edges {
        node {
          id
          title
          beginning_date
          ending_date
          sport {
            sport {
              name {
                EN
              }
              levels {
                EN {
                  name
                }
              }
              logo
            }
            allLevelSelected
            levels {
              id
              EN {
                name
              }
            }
          }
          venue {
            name
          }
          address {
            address
            city
            country
            position {
              lat
              lng
            }
          }
          participants {
            id
          }
          price {
            currency
            cents
          }
          mode
          kind
          status
        }
      }
    }
  `,
});
