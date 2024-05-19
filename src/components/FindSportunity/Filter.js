import React from 'react';
import PureComponent from '../common/PureComponent';
import Radium from 'radium';
import PropTypes from 'prop-types'
import { createRefetchContainer, graphql } from 'react-relay/compat';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withAlert } from 'react-alert';

import * as types from '../../actions/actionTypes';
import { fonts, colors, metrics } from '../../theme';

import FilterOpen from './FilterOpen';
import localizations from '../Localizations';

let styles;
import SaveFilterMutation from './SaveFindFilterMutation';

class Filter extends PureComponent {
  static contextTypes = {
		relay: PropTypes.shape({
		  variables: PropTypes.object,
		}),
  }

  constructor(props) {
    super(props);
    this.state = {
      suggestions: [],
      value: this.props.sportName,
      isOpen: false,
    };
    this.alertOptions = {
      offset: 60,
      position: 'top right',
      theme: 'light',
      transition: 'fade',
    };
  }

  componentDidMount() {
    this.props.relay.refetch(fragmentVariables => ({
      ...fragmentVariables,
      queryLanguage: localizations.getLanguage().toUpperCase(),
    }));
  }

  _locationSelected = suggest => {
    this.props._updateLocationAction(
      suggest.label,
      suggest.location.lat,
      suggest.location.lng,
    );
    this.props.onLocationChange(suggest.location.lat, suggest.location.lng);
  };

  _handleRemoveLocation = () => {
    this.props._updateLocationAction('', null, null);
    // this.props.onLocationChange(null, null)
  };

  _onChange = (event, { newValue }) => {
    this.setState({
      value: newValue,
    });
  };

  _handleSaveFilters = data => {
    if (this.props.user) {
      SaveFilterMutation.commit({
          viewer: this.props.viewer,
          user: this.props.user,
          userIDVar: this.props.viewer.me.id,
          savedFiltersVar: data,
        },
        {
          onSuccess: () => {
            this.props.alert.show(
              localizations.popup_findSportunity_filter_success,
              {
                timeout: 3000,
                type: 'success',
                ...this.alertOptions,
              },
            );
          },
          onFailure: error => {
            this.props.alert.show(error.getError(), {
              timeout: 3000,
              type: 'error',
              ...this.alertOptions,
            });
          },
        },
      );
    }
  };

  _selectSport = suggestion => {
    if (suggestion) {
      this.props._updateSportAction(suggestion.value, suggestion.name);
      this.props.setLevels(suggestion.levels);
    } else {
      this.props._updateSportAction('', '');
      this.props.setLevels([]);
    }
  };

  _setOpen = e => {
    e.preventDefault();
    this.setState({ isOpen: !this.state.isOpen });
  };

  _handleRemoveSport = () => {
    this.props.setLevels([]);
    this.props._updateSportAction('', '');
    this.setState({
      value: '',
    });
    this._setLevelFrom('');
    this._setLevelTo('');
  };

  _handleLoadAllSports = () => {
    this.props.relay.refetch(fragmentVariables => ({
      ...fragmentVariables,
      sportsNb: 1000,
      filterName: { name: '', language: 'EN' },
    }));
    this.setState({
      allSportsLoaded: true,
    });
  };

  _updateSportFilter = value => {
    if (this.context.relay.variables.sportsNb < 1000 && value.length >= 2) {
      this.props.relay.refetch(fragmentVariables => ({
        ...fragmentVariables, 
        filterName: {
          name: value,
          language: localizations.getLanguage().toUpperCase(),
        },
        sportsNb: 5,
      }));
    }
  };

  _translatedName = name => {
    let translatedName = name.EN;
    switch (localizations.getLanguage().toLowerCase()) {
      case 'en':
        translatedName = name.EN;
        break;
      case 'fr':
        translatedName = name.FR || name.EN;
        break;
      case 'it':
        translatedName = name.IT || name.EN;
        break;
      case 'de':
        translatedName = name.DE || name.EN;
        break;
      default:
        translatedName = name.EN;
        break;
    }
    return translatedName;
  };

  render() {
    const sportsList = this.props.viewer
      ? this.props.viewer.sports.edges.map(({ node }) => ({
          ...node,
          name: this._translatedName(node.name),
          value: node.id,
        }))
      : [];

    return (
      <div style={styles.sidebar}>
        <FilterOpen
          {...this.props}
          variables={this.context.relay.variables}
          onClick={this._setOpen}
          value={this.props.sportName}
          onSaveFilters={this._handleSaveFilters}
          _updateAddSportClubFilter={this._updateAddSportClubFilter}
          _updateRemoveSportClubFilter={this._updateRemoveSportClubFilter}
          _updateClearSportClubFilter={this._updateClearSportClubFilter}
        />
      </div>
    );
  }
}

styles = {
  label1Container: {
    width: 70,
    '@media (maxWidth: 830px)': {
      margin: '0 auto',
    },
  },
  label2Container: {
    width: 65,
    '@media (maxWidth: 830px)': {
      margin: '20px auto 0 auto',
    },
  },
  inputContainer: {
    width: 240,
    marginRigth: 20,
    position: 'relative',
    paddingRight: 20,
    '@media (maxWidth: 768px)': {
      width: 220,
    },
    '@media (maxWidth: 830px)': {
      margin: '0 auto',
      width: 260,
    },
  },
  sportContainer: {
    position: 'relative',
    width: 260,
    marginRight: 30,
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,0.1)',
    marginBottom: 10,
  },
  logo: {
    width: 30,
    height: 30,
  },
  sidebar: {
    paddinfRight: 20,
    width: 250,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    fontFamily: 'Lato',
    margin: metrics.margin.medium,
  },
  itemContainer: {
    display: 'flex',
    // width: 300,
    position: 'relative',
    '@media (maxWidth: 830px)': {
      display: 'inline-block',
      width: '100%',
    },
  },
  container: {
    fontFamily: 'Lato',
    padding: '20px 30px',
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'row',
    zIndex: 1,
    width: 840,
    '@media (maxWidth: 1024px)': {
      display: 'inline-block',
      width: '100%',
    },
  },
  closeCross: {
    position: 'absolute',
    right: 0,
    top: 4,
    width: 0,
    height: 0,
    color: colors.gray,
    marginRight: '15px',
    cursor: 'pointer',
    fontSize: '16px',
  },

  cancelIcon: {
    marginRight: 15,
  },
  buttonContainer: {
    display: 'flex',
    width: 190,
    '@media (maxWidth: 830px)': {
      margin: '20px auto 0 auto',
    },
  },
  vContainer: {
    fontFamily: 'Lato',
    padding: '30px 30px 20px 30px',

    display: 'flex',
    flexDirection: 'column',
    zIndex: 1,
    width: '100%',
  },
  label: {
    color: colors.blue,
    fontSize: fonts.size.large,
    fontWeight: fonts.weight.xxl,
    height: '32px',
    width: 70,
  },
  input: {
    width: 240,
    borderWidth: 0,
    borderBottomWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.blue,
    height: '30px',
    lineHeight: '36px',
    fontFamily: 'Lato',
    display: 'block',
    background: 'transparent',
    fontSize: fonts.size.medium,
    outline: 'none',
    marginLeft: 20,
    marginRight: 10,
  },
  button: {
    width: '160px',
    height: '45px',
    backgroundColor: '#5E9FDF',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    borderRadius: '100px',
    border: 'none',
    fontSize: 16,
    fontWeight: fonts.weight.medium,
    textAling: 'center',
    color: colors.white,
    paddingTop: 12,
    paddingBottom: 14,
    textAlign: 'center',
    position: 'relative',
    top: '-7px',
    cursor: 'pointer',
    marginLeft: 10,
  },
  span: {
    height: '100%',
    width: '37%',
    boxSizing: 'border-box',
    padding: 18,
    borderRight: '1px #ccc solid',
    display: 'inline-flex',
    icon: {
      fontSize: '30px',
      color: '#ccc',
    },
    iconSearch: {
      fontSize: '30px',
      color: '#fff',
      marginLeft: '25%',
    },
    input: {
      /* shall toggle, from <p> to <input> */
      marginLeft: '6%',
      width: 250,
      border: 'none',
      fontFamily: 'Lato',
      fontSize: fonts.size.medium,
      display: 'inline',
      outline: 'none',
      borderWidth: 0,
      borderBottomWidth: 2,
      borderStyle: 'solid',
      borderColor: colors.blue,
      background: 'transparent',
    },
    inputSearch: {
      marginLeft: '15%',
      fontFamily: 'Lato',
      fontSize: fonts.size.medium,
      display: 'inline',
      color: colors.white,
      height: '32px',
      lineHeight: '32px',
      outline: 'none',
    },
  },
};

const inputStyles = {
  input: {
    width: 240,
    borderWidth: 0,
    borderBottomWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.blue,
    height: '30px',
    lineHeight: '36px',
    fontFamily: 'Lato',
    display: 'block',
    background: 'transparent',
    fontSize: fonts.size.medium,
    outline: 'none',
    // marginLeft: 20,
    marginRight: 10,
    paddingRight: 20,
  },
  suggests: {
    // width: '100%',
    width: 300,
    position: 'absolute',
    backgroundColor: colors.white,

    boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
    border: '2px solid rgba(94,159,223,0.83)',
    padding: 20,
    zIndex: 100,
  },
  'suggests--hidden': {
    width: '0',
    display: 'none',
  },
  suggestItem: {
    paddingTop: 10,
    paddingBottom: 10,
    color: '#515151',
    fontSize: 18,
    fontWeight: 500,
    fontFamily: 'Helvetica Neue',
  },
};

const _updateLocationAction = (name, lat, lng) => ({
  type: types.UPDATE_SPORTUNITY_SEARCH_LOCATION,
  locationName: name,
  locationLat: lat,
  locationLng: lng,
});

const _updateDistanceRange = distanceRange => ({
  type: types.UPDATE_SPORTUNITY_SEARCH_DISTANCE_RANGE,
  distanceRange,
});

const _updateSportAction = (id, name) => ({
  type: types.UPDATE_SPORTUNITY_SEARCH_SPORT,
  sportId: id,
  sportName: name,
});

const dispatchToProps = dispatch => ({
  _updateSportAction: bindActionCreators(_updateSportAction, dispatch),
  _updateLocationAction: bindActionCreators(_updateLocationAction, dispatch),
  _updateDistanceRange: bindActionCreators(_updateDistanceRange, dispatch),
});

const stateToProps = ({
  sportunitySearchReducer, 
  globalReducer,
}) => ({
  sportId: sportunitySearchReducer.sportId,
  sportName: sportunitySearchReducer.sportName,
  locationName: sportunitySearchReducer.locationName,
  locationLat: sportunitySearchReducer.locationLat,
  locationLng: sportunitySearchReducer.locationLng,
  userCountry: globalReducer.userCountry,
  userLocation: globalReducer.userLocation,
});

const ReduxContainer = connect(
  stateToProps,
  dispatchToProps,
)(Filter);

export default createRefetchContainer(withAlert(Radium(ReduxContainer)), {
//OK
  viewer: graphql`
    fragment Filter_viewer on Viewer
      @argumentDefinitions(
        sportsNb: { type: "Int", defaultValue: 10 }
        filterName: { type: "SportFilter", defaultValue: null }
        queryLanguage: { type: "SupportedLanguage", defaultValue: "EN" }
      ) {
      me {
        id
        appCountry
      }
      sports(first: $sportsNb, filter: $filterName, language: $queryLanguage) {
        edges {
          node {
            id
            name {
              EN
              FR
              DE
            }
            logo
            levels {
              id
              EN {
                name
                skillLevel
                description
              }
              FR {
                name
                skillLevel
                description
              }
              DE {
                name
                skillLevel
                description
              }
            }
          }
        }
      }
    }
  `,
  user: graphql`
    fragment Filter_user on User {
      appCountry
      circlesUserIsIn(last: 20) {
        edges {
          node {
            id
            name
            owner {
              id
              pseudo
              avatar
            }
            mode
            isCircleUpdatableByMembers
            isCircleUsableByMembers
            memberCount
          }
        }
      }
      savedFilters {
        id
        page
        filterName
        location {
          lat
          lng
          radius
        }
        sport {
          sport {
            id
            name {
              EN
              FR
              DE
            }
            levels {
              id
              EN {
                name
                skillLevel
                description
              }
              FR {
                name
                skillLevel
                description
              }
              DE {
                name
                skillLevel
                description
              }
            }
          }
          levels {
            id
            FR {
              name
              skillLevel
              description
            }
            EN {
              name
              skillLevel
              description
            }
            DE {
              name
              skillLevel
              description
            }
          }
        }
        price {
          from
          to
        }
        dates {
          from
          to
        }
      }
    }
  `,
},
graphql`
query FilterRefetchQuery(
  $sportsNb: Int
  $filterName: SportFilter
  $queryLanguage: SupportedLanguage
) {
viewer {
    ...Filter_viewer
    @arguments(
      sportsNb: $sportsNb
      filterName: $filterName
      queryLanguage: $queryLanguage
    )
}
}
`,
);
