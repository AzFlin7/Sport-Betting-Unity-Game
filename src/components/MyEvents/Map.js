/* global google */
import React from 'react'
import PureComponent, { pure } from '../common/PureComponent'
import Radium from 'radium'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import { connect } from 'react-redux'
import {
  GoogleMap,
  Marker,
  withScriptjs,
  withGoogleMap,
} from 'react-google-maps'

let styles


const GMap = withScriptjs(withGoogleMap((props) => (
  <GoogleMap
    ref={props._handleMapMounted}
    defaultZoom={8}
    defaultCenter={props.position}
    options={{ 
      scrollwheel: false, 
      navigationControl: false, 
      mapTypeControl: false, 
      scaleControl: false, 
      draggable: true
    }} 
  >
    {props.isMarkerShown && props.sportunities && props.sportunities.map(sportunity => 
      <Marker 
        position={sportunity.position} 
        key={sportunity.key}
        icon={sportunity.icon}
      />
    )}
  </GoogleMap>
)))

class Map extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      sportunities: null,
      gmap_margin_top: 0,
    }
  }

  componentDidMount() {
    window.addEventListener('scroll', e => this._manageMapOffset());
  }

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
            gmap_margin_top: 10,
          });
        }
    } else {
      this.setState({
        gmap_margin_top: 20,
      });
    }
  };

  _setBound = () => {
    if (this.props.sportunities && (this.props.sportunities.length > 0 || (this.props.sportunities.edges && this.props.sportunities.edges.length > 0))) {
      let bounds = new google.maps.LatLngBounds();
      this.props.sportunities.edges.map(edge => {
        const position = new google.maps.LatLng(
          edge.node.address.position.lat,
          edge.node.address.position.lng)
        bounds.extend(position)
        return null
      })

      if(this._map) {
        this._map.fitBounds(bounds);
      }
    }
	}

  _handleMapMounted = (map) => {
   // console.log(map)
    this._map = map;
		this._setBound()
  }

  _handleCenterChanged = () => {
		const nextCenter = this._map.getCenter();
		this.props.onLocationChange(nextCenter.lat(), nextCenter.lng())
  }

  componentDidUpdate() {
    this._setBound()
	}

  render() {
    const {sportunities} = this.props;

    let lat = sportunities && sportunities.length > 0 ? sportunities[0].node.address.position.lat || 46.52 : 46.52
    let lng = sportunities && sportunities.length > 0 ? sportunities[0].node.address.position.lng || 6.6336 : 6.6336

    return (
      <section 
        style={{ marginTop: this.state.gmap_margin_top, ...styles.container }}
        ref="gmapSection"
        id="gmapSection"
      >

      <GMap
        _handleMapMounted={this._handleMapMounted}
        position={{ lat: lat , lng: lng }}
        isMarkerShown
        googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyAC6hY0V4cGyw2_-trCRU3VIPicoZenjjU&v=3.exp&libraries=geometry,drawing,places"
        loadingElement={<div style={{ height: `100%` }} />}
        containerElement={
					<div
            {...this.props.containerElementProps}
            style={{
              height: 'calc(100vh - 40px)'
            }}
          />
        }
        mapElement={<div style={{ height: `100%` }} />}
        sportunities={sportunities && sportunities.edges && sportunities.edges.length > 0 && sportunities.edges.map(edge => ({
          key: edge.node.id, 
          position:{lat: edge.node.address.position.lat, lng: edge.node.address.position.lng },
          icon: edge.node.id === this.props.highlightedId ? '/images/marker-active.png' : null 
        }))}
      />
    </section>
    );
  }
}

styles = {
  container: {
    width: '100%',
    flex: 1,
    '@media (max-width: 960px)': {
          maxWidth: 960,
    }
  },
}

const stateToProps = (state) => ({
});

const ReduxContainer = connect(
  stateToProps,
)(Radium(Map));

export default createFragmentContainer(Radium(ReduxContainer), {
  sportunities: graphql`
    fragment Map_sportunities on SportunityConnection {
      edges {
        node {
                      id
          address {
            position {
              lat
              lng
            }
          }
          beginning_date
        }

      }
    }
  `
});
