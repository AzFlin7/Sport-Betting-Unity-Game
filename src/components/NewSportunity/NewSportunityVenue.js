import React from 'react';
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import isEqual from 'lodash/isEqual';

import Input from './Input'
import localizations from '../Localizations'

import { colors } from '../../theme';

let styles;

class Venue extends React.Component {
  state = {
    open: false,
  }

  componentDidMount() {
    window.addEventListener('click', this._handleClickOutside);
    this.setFilter(this.props);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this._handleClickOutside);
  }

  componentWillReceiveProps = (nextProps) => {
    if (!isEqual(this.props.venueFilter, nextProps.venueFilter))
      this.setFilter(nextProps);
  }

  setFilter = (props) => {
    if (props.venueFilter.sport) {
      let filter = {
        sport: {
          sportID: props.venueFilter.sport,
        }
      };

      this.props.relay.refetch({
        filter,
        queryVenues: true,
      })
    }
// TODO props.relay.* APIs do not exist on compat containers
    else if (this.props.relay.variables.queryVenues) {
// TODO props.relay.* APIs do not exist on compat containers
      this.props.relay.refetch({
        filter: null,
        queryVenues: false,
      })
    }
    
  }

  _toggleDropdown = () => {
    this.setState(prevState => ({ open: !prevState.open }));
  }

  _handleInputClick = (e) => {
    const { open } = this.state;
    if (!open) return this.setState({ open: true });
  }

  _handleClickOutside = event => {
    if (!this._containerNode.contains(event.target)) {
      this.setState({ open: false });
    }
  }

  _handleChange = (item) => {
    const { onChange } = this.props;
    this.setState({ open: false });
    if (typeof onChange === 'function') {
      onChange(item);
    }
  }

  _handleRemoveSelection = () => {
    const { onChange } = this.props;
    
    if (typeof onChange === 'function') {
      onChange({
        infrastructure: {
          id: '',
          name: ''
        },
        venue: {
          id: '',
          name: '',
          price: {
            cents: 0,
            currency: this.props.userCurrency,
          },
          address: {
            address: '',
          },
        }
      });
    }
  }

  _renderInfrastructureList = (venues, venueFilter) => {
    
    return venues.map(venue => {
      let infrastructureList = venue.node.infrastructures.map(infrastructure => {
        if (infrastructure.sport && infrastructure.sport.length > 0) {
          let isSportFound = infrastructure.sport.findIndex(sport => {
            return (sport.id === venueFilter.sport)
          })
          
          if (isSportFound >= 0) return infrastructure
        }
        return false; 
      }).filter(i => Boolean(i))

      return infrastructureList.map(infrastructure => {
        let selector = {
          infrastructure,
          venue: venue.node
         } ;
        
        return (
          <li
           key={infrastructure.id}
           style={styles.listItem}
           onClick={this._handleChange.bind(null, selector)}
          >
            <span style={styles.listVenueName}>{venue.node.name}</span>
            {' - ' + infrastructure.name}
          </li>
        )
      })
      
    }) 
  }
  
  render() {
    const { venue, infrastructure, onChange, venueFilter, error, placeholder, disabled } = this.props;
    let { open } = this.state;

    const finalTriangleStyle = {
      ...styles.triangle,
      borderTopColor: disabled ?  '#D1D1D1' : open ? colors.green : colors.blue,
    };
    
    return (
      <div
        style={styles.container}
        onFocus={this._toggleDropdown}
        ref={node => { this._containerNode = node; }}
        >
        {
          venue.id !== ""
          ? <span onClick={this._handleRemoveSelection} style={styles.closeCross}>
              <i className="fa fa-times" style={styles.cancelIcon} aria-hidden="true"></i>
            </span> 
          : <span style={finalTriangleStyle} />
        }
        <Input
          label={localizations.newSportunity_venue}
          ref={node => { this._inputNode = node }}
          onClick={this._handleInputClick}
          placeholder={placeholder}
          value={venue.name && infrastructure.name ? venue.name + ' - ' + infrastructure.name : ''}
          disabled={disabled}
          error={error}
        />
        {
          open && 
          <div style={styles.dropdown}>
            <ul style={styles.list}>
              {
// TODO props.relay.* APIs do not exist on compat containers
                this.props.relay.pendingVariables 
                ?   <li key={0} style={styles.listItem}>
                        <span key={1} style={styles.spinnerItem}></span>
                        {localizations.newSportunity_sport_loading}
                    </li>
                : !this.props.viewer.venues || this.props.viewer.venues.edges.length === 0
                  ? <li style={styles.listItem}>No choices available</li>
                  : this._renderInfrastructureList(this.props.viewer.venues.edges, venueFilter)
              }
            </ul>
          </div>
        }
      </div>
    );
  }
}

var spinKeyframes = Radium.keyframes({
    '0%': { transform: 'rotate(0deg)' },
    '100%' :{ transform: 'rotate(360deg)' },
}, 'spin');

styles = {
  container: {
    position: 'relative',
  },

  label: {
    display: 'block',
    color: colors.blueLight,
    fontSize: 16,
    lineHeight: 1,
    marginBottom: 8,
  },

  triangle: {
    position: 'absolute',
    right: 0,
    top: 35,
    width: 0,
    height: 0,

    transition: 'border 100ms',
    transitionOrigin: 'left',

    color: colors.blue,

    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderTop: `8px solid ${colors.blue}`,
  },

  closeCross: {
    position: 'absolute',
    right: 0,
    top: 30,
    width: 0, 
    height: 0,
    color: colors.gray,
    marginRight: '15px',
    cursor: 'pointer',
    fontSize: '16px',
  },

  dropdown: {
    position: 'absolute',
    top: 70,
    left: 0,

    width: '100%',
    maxHeight: 300,

    backgroundColor: colors.white,

    boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
    border: '2px solid rgba(94,159,223,0.83)',
    padding: 20,

    overflowY: 'scroll',
    overflowX: 'hidden',

    zIndex: 100,
  },

  listItem: {
    paddingTop: 10,
    paddingBottom: 10,
    color: '#515151',
    fontSize: 20,
    fontWeight: 500,
    fontFamily: 'Lato',
		borderBottomWidth: 1,
		borderColor: colors.blue,
		borderStyle: 'solid',
		cursor: 'pointer',
    display: 'flex'
  },

  listVenueName: {
    color: colors.blue,
  },

  bold: {
    fontWeight: 'bold',
  },
  
  listHeader: {
    paddingBottom: 5,
		borderBottomWidth: 2,
		borderColor: colors.blue,
		borderStyle: 'solid',
    fontSize: 20,
    fontFamily: 'Lato',
    marginBottom: 9,
  },

  spinnerItem: {
      borderLeft: '6px solid #f3f3f3',
      borderRight: '6px solid #f3f3f3',
      borderBottom: '6px solid #f3f3f3',
      borderTop: '6px solid #3498db',
      borderRadius: '50%',
      width: '20px',
      height: '20px',
      marginRight: '20px',
      animation: 'x 1.5s ease 0s infinite',
      animationName: spinKeyframes,
  },
};

const dispatchToProps = (dispatch) => ({
})
  
const stateToProps = (state) => ({
    userCurrency: state.globalReducer.userCurrency,
})

const ReduxContainer = connect(
    stateToProps,
    dispatchToProps
)(Radium(Venue));

export default createRefetchContainer(Radium(ReduxContainer), {
//OK
  viewer: graphql`
    fragment NewSportunityVenue_viewer on Viewer @argumentDefinitions (
      filter: {type: "Filter", defaultValue: null}
      queryVenues: {type: "Boolean!", defaultValue: false}
      ){
      venues (last: 100, filter: $filter) @include(if: $queryVenues) {
        edges {
          node {
            id
            name
            address {
              address,
              city,
              country
            }
            infrastructures {
              id,
              name, 
              sport {
                id
              }
            }
          }
        }
      }
    }
  `,
},
graphql`
query NewSportunityVenueRefetchQuery(
    $filter: Filter
    $queryVenues: Boolean!
) {
viewer {
    ...NewSportunityVenue_viewer
    @arguments(
      filter: $filter
      queryVenues: $queryVenues
    )
}
}
`,
);
