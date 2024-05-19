import React from 'react';
import Radium from 'radium';
import PropTypes from 'prop-types'
import { createRefetchContainer, graphql } from 'react-relay';
import ReactLoading from 'react-loading';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Actions as FarceActions } from 'farce';
import PureComponent, { pure } from '../common/PureComponent';
import Header from '../common/Header/Header';
import Footer from '../common/Footer/Footer';
import Filter from './Filter';
import Events from './Events';
import Map from './FindSportunityMap';
import Loading from '../common/Loading/Loading';
import localizations from '../Localizations';
import * as types from '../../actions/actionTypes';
import { colors } from '../../theme';

let styles;

const Title = pure(({ children, style }) => (
  <h2 style={{ ...styles.title, ...style }}>{children}</h2>
));

class FindSportunity extends PureComponent {
  static contextTypes = {
		relay: PropTypes.shape({
		  variables: PropTypes.object,
		}),
  }
  
  constructor(props) {
    super(props);
    this.state = {
      levels: [],
      selectedLevels: [],
      locationLat: null,
      locationLng: null,
      mapStatus: 'updated',
      loading: true,
      queryIsLoading: false,
      updateQuery: false,
      language: localizations.getLanguage(),
      pageSize: 20,
      itemCount: 10,
      distanceRange: null,
      isFirstQueryDone: false,
      width: '0',
      height: '0',
      showFilter: false,
    };

    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  componentDidMount = () => {
    this.updateWindowDimensions();

    if (typeof window !== 'undefined')
      window.addEventListener('resize', this.updateWindowDimensions);
    if (
      this.props.urlLat ||
      this.props.urlLng ||
      this.props.urlRange ||
      this.props.urlSportId ||
      this.props.urlFromDate ||
      this.props.urlToDate ||
      this.props.urlFree
    ) {
      this._setPropsFromUrl(() => this._setFilter());
    } else if (!this.props.locationLat && !this.props.locationLng) {
      fetch('https://ipapi.co/json')
        .then(res => res.json())
        .then(json => {
          if (json.latitude && json.longitude) {
            this.props._updateLocationAction(
              json.city,
              json.latitude,
              json.longitude,
            );
            this._updateLocationGeo(json.latitude, json.longitude);
            this._updateLocationDistanceRange(100);
            this.props._updateDistanceRange(100);
            this._setFilter();
          }
        });
    } else this._setFilter();
    document.title = 'Find the right sport opportunities';
    setTimeout(() => this.setState({ loading: false }), 1000);
  };

  componentWillReceiveProps = nextProps => {
    if (!this.props.viewer.sport && nextProps.viewer.sport) {
      this.props._updateSportAction(
        nextProps.viewer.sport.id,
        nextProps.viewer.sport.name[this.state.language.toUpperCase()],
      );
      setTimeout(() => this._setFilter(), 150);
    }
  };

  componentDidUpdate = prevProps => {
    if (
      this.state.isFirstQueryDone &&
      (prevProps.sportId !== this.props.sportId ||
        prevProps.locationLat !== this.props.locationLat ||
        prevProps.locationLng !== this.props.locationLng ||
        prevProps.distanceRange !== this.props.distanceRange ||
        prevProps.isFreeOnly !== this.props.isFreeOnly ||
        prevProps.dateFrom !== this.props.dateFrom ||
        prevProps.dateTo !== this.props.dateTo ||
        prevProps.hourFrom !== this.props.hourFrom ||
        prevProps.hourTo !== this.props.hourTo ||
        prevProps.sexRestriction !== this.props.sexRestriction ||
        (prevProps.ageRestriction &&
          this.props.ageRestriction &&
          prevProps.ageRestriction.from !== this.props.ageRestriction.from) ||
        (prevProps.ageRestriction &&
          this.props.ageRestriction &&
          prevProps.ageRestriction.to !== this.props.ageRestriction.to))
    ) {
      this._setFilter();
    }

    // TODO props.relay.* APIs do not exist on compat containers
    const pendingVariables = this.props.relay.pendingVariables;
    if (pendingVariables && this.state.mapStatus === 'updated') {
      this.setState({ mapStatus: 'updating' });
    } else if (!pendingVariables && this.state.mapStatus === 'updating') {
      this.setState({ mapStatus: 'finalizing' });
    }
  };

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.updateWindowDimensions);
  };

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  _loadMore = () => {
    const nextCount = this.state.itemCount + this.state.pageSize;
    this.setState({ queryIsLoading: true });
    
    const refetchVariables = (fragmentVariables) => ({
      ...fragmentVariables,
      first: nextCount,
    });
    this.props.relay.refetch(
      refetchVariables,
      null,
      () => {
        setTimeout(() => {
          // Needed to wait for Relay to re-fetch data in this.props.viewer
          this.setState({
            queryIsLoading: false,
            itemCount: nextCount,
          });
        }, 50);
      },
      { force: true },
    );
  };
  
	_updateLocationGeo = (lat, lng) => {
		/*this.setState({
			locationLat: lat,
			locationLng: lng,
		})*/
	}

  _updateLocationGeo = (lat, lng) => {
    this.setState({
      locationLat: lat,
      locationLng: lng,
    });
  };

  _updateLocationDistanceRange = radius => {
    this.setState({
      distanceRange: radius,
    });
  };

  _updateMapStatus = status => {
    this.setState({
      mapStatus: status,
    });
  };

  _setLevels = levels => {
    this.setState({
      levels,
    });
  };

  _setSelectedLevels = levels => {
    this.setState({
      selectedLevels: levels,
    });
  };

  _setFilter = () => {
    const filter = {};
    if (this.props.locationLat && this.props.locationLng) {
      filter.location = {
        lat: this.props.locationLat,
        lng: this.props.locationLng,
        radius: this.props.distanceRange ? this.props.distanceRange : 50,
      };
    }

    if (this.props.sportId) {
      filter.sport = { sportID: this.props.sportId };
    }

    if (this.props.isFreeOnly) {
      filter.price = { from: 0, to: 0 };
    }

    if (this.props.dateFrom && this.props.dateTo) {
      filter.dates = { from: this.props.dateFrom, to: this.props.dateTo };
    }

    if (this.props.hourFrom && this.props.hourTo) {
      filter.hours = {
        from: this.props.hourFrom.split(':')[0],
        to: this.props.hourTo.split(':')[0],
      };
    }

    filter.status = 'Available';
    if (this.props.sexRestriction !== '')
      filter.sexRestriction = this.props.sexRestriction;
    filter.ageRestriction = this.props.ageRestriction;

    const newValue = {
      filter,
    };

    newValue.query = true;

    newValue.first = 10;
    this.setState({ itemCount: 10 });

    this.setState({ updateQuery: true });
    this.props.relay.refetch(
      fragmentVariables => ({
        ...fragmentVariables,
        ...newValue, 
      }),
      null,
      () => {
        setTimeout(() => {
          // Needed to wait for Relay to re-fetch data in this.props.viewer
          this.setState({
            updateQuery: false,
            isFirstQueryDone: true,
          });
          if (
            this.props.viewer.sportunities &&
            this.props.viewer.sportunities.count > 10 && 
            this.context.relay.variables && 
            this.context.relay.variables.first &&
            this.context.relay.variables.first === 10 &&
            !this.state.queryIsLoading &&
            this.state.isFirstQueryDone
          ) {
            this._loadMore();
          }
        }, 50);
      }
    );
    if (Object.keys(filter).length === 0) {
      this.setState({ mapStatus: 'finalizing' });
    }
  };

  _onEventHoverHandler = id => {
    this.setState({
      highlightedId: id,
    });
  };

  _onEventLeaveHandler = () => {
    this.setState({
      highlightedId: null,
    });
  };

  _setPropsFromUrl = callback => {
    const {
      urlLat,
      urlLng,
      urlRange,
      urlSportId,
      urlFromDate,
      urlToDate,
      urlFree,
    } = this.props;

    if (urlSportId) {
      this.props.relay.refetch(fragmentVariables => ({
        ...fragmentVariables,
        sportId: urlSportId,
        querySport: true,
      }));
    }

    if (
      urlFromDate &&
      urlToDate &&
      new Date(parseInt(urlFromDate)) > 0 &&
      new Date(parseInt(urlFromDate)) > 0
    ) {
      this.props._updateDateFrom(new Date(parseInt(urlFromDate)));
      this.props._updateDateTo(new Date(parseInt(urlToDate)));
    }
    if (urlFree && typeof urlFree === 'boolean') {
      this.props._updateIsFreeOnly(urlFree);
    }

    if (urlLat && urlLng && !Number.isNaN(urlLat) && !Number.isNaN(urlLng)) {
      const geocoder = new google.maps.Geocoder();
      let city;

      geocoder.geocode(
        {
          latLng: new google.maps.LatLng({
            lat: parseFloat(urlLat),
            lng: parseFloat(urlLng),
          }),
        },
        (results, status) => {
          if (status === 'OK') {
            for (let a = 0; a < results.length; a++) {
              let resultIdFound = false;
              for (let n = 0; n < results[a].types.length; n++) {
                if (results[a].types[n] === 'locality') {
                  resultIdFound = true;
                }
              }
              if (resultIdFound) {
                for (
                  let i = 0;
                  i < results[a].address_components.length;
                  i++
                ) {
                  for (
                    let b = 0;
                    b < results[a].address_components[i].types.length;
                    b++
                  ) {
                    if (
                      results[a].address_components[i].types[b] == 'locality'
                    ) {
                      city = results[a].address_components[i].long_name;
                      break;
                    }
                  }
                }
              }
            }
          }

          this.props._updateLocationAction(
            city,
            parseFloat(urlLat),
            parseFloat(urlLng),
          );
          this._updateLocationGeo(parseFloat(urlLat), parseFloat(urlLng));

          if (urlRange && !Number.isNaN(urlRange)) {
            this._updateLocationDistanceRange(parseInt(urlRange));
            this.props._updateDistanceRange(parseInt(urlRange));
          } else {
            this._updateLocationDistanceRange(100);
            this.props._updateDistanceRange(100);
          }
          if (!urlSportId) callback();
        },
      );
    } else if (!urlSportId) callback();
  };

  _setLanguage = language => {
    this.setState({ language });
  };

  toogleFilter = () => {
    this.setState({
      showFilter: !this.state.showFilter,
    });
  };

  render() {
    const { viewer } = this.props;

    return (
      <div>
        {this.state.loading && <Loading />}
        <div style={styles.container}>
        </div>
        <div style={styles.bodyContainer}>
          <div style={styles.leftContainer}>
            <Title style={this.state.width < 1024 && { textAlign: 'center' }}>
              {localizations.find_title}
            </Title>
            {this.state.width >= 1024 ? (
              <Filter
                {...this.props}
                {...this.state}
                setLevels={this._setLevels}
                setSelectedLevels={this._setSelectedLevels}
                viewer={viewer || null}
                user={this.props.viewer ? this.props.viewer.me : null}
                onLocationChange={this._updateLocationGeo}
                onDistanceRangeChange={this._updateLocationDistanceRange}
              />
            ) : (
              viewer.sportunities &&
              !this.state.updateQuery && (
                <Events
                  sportunities={viewer ? viewer.sportunities : null}
                  {...this.props}
                  {...this.state}
                  onHover={this._onEventHoverHandler}
                  onLeave={this._onEventLeaveHandler}
                  onLoadMore={this._loadMore}
                  queryIsLoading={this.state.queryIsLoading}
                />
              )
            )}
          </div>
          <div style={styles.middleContainer}>
            {this.state.updateQuery && (
              <div style={styles.loadingSpinner}>
                <ReactLoading type="cylon" color={colors.blue} />
              </div>
            )}
            {this.state.width < 1024 && (
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <div style={styles.button} onClick={this.toogleFilter}>
                  {this.state.showFilter
                    ? localizations.find_event_hideFilter
                    : localizations.find_event_showFilter}
                </div>
              </div>
            )}
            {this.state.width >= 1024
              ? viewer.sportunities &&
                !this.state.updateQuery && (
                  <Events
                    sportunities={viewer ? viewer.sportunities : null}
                    {...this.props}
                    {...this.state}
                    onHover={this._onEventHoverHandler}
                    onLeave={this._onEventLeaveHandler}
                    onLoadMore={this._loadMore}
                    queryIsLoading={this.state.queryIsLoading}
                  />
                )
              : this.state.showFilter && (
              <Filter
                    {...this.props}
                    {...this.state}
                    setLevels={this._setLevels}
                    setSelectedLevels={this._setSelectedLevels}
                    viewer={viewer || null}
                    user={this.props.viewer ? this.props.viewer.me : null}
                    onLocationChange={this._updateLocationGeo}
                    onDistanceRangeChange={this._updateLocationDistanceRange}
                  />
                )}
          </div>
          <div style={styles.rightContainer}>
            <Map
              sportunities={
                viewer && viewer.sportunities ? viewer.sportunities : null
              }
              {...this.props}
              {...this.state}
              onLocationChange={this._updateLocationGeo}
              onUpdateMapStatus={this._updateMapStatus}
            />
          </div>
        </div>
      </div>
    );
  }
}

const _updateSportAction = (id, name) => ({
  type: types.UPDATE_SPORTUNITY_SEARCH_SPORT,
  sportId: id,
  sportName: name,
});

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

const _updateIsFreeOnly = isFreeOnly => ({
  type: types.UPDATE_SPORTUNITY_SEARCH_FREE_ONLY,
  isFreeOnly,
});

const _updateDateFrom = dateFrom => ({
  type: types.UPDATE_SPORTUNITY_SEARCH_DATE_FROM,
  dateFrom,
});

const _updateDateTo = dateTo => ({
  type: types.UPDATE_SPORTUNITY_SEARCH_DATE_TO,
  dateTo,
});

const _updateHourFrom = hourFrom => ({
  type: types.UPDATE_SPORTUNITY_SEARCH_HOUR_FROM,
  hourFrom,
});

const _updateHourTo = hourTo => ({
  type: types.UPDATE_SPORTUNITY_SEARCH_HOUR_TO,
  hourTo,
});

const _updateSexRestriction = sexRestriction => ({
  type: types.UPDATE_SPORTUNITY_SEARCH_SEX_RESTRICTION,
  sexRestriction,
});

const _updateAgeRestriction = ageRestriction => ({
  type: types.UPDATE_SPORTUNITY_SEARCH_AGE_RESTRICTION,
  ageRestriction,
});

const dispatchToProps = dispatch => ({
  _updateSportAction: bindActionCreators(_updateSportAction, dispatch),
  _updateLocationAction: bindActionCreators(_updateLocationAction, dispatch),
  _updateIsFreeOnly: bindActionCreators(_updateIsFreeOnly, dispatch),
  _updateDistanceRange: bindActionCreators(_updateDistanceRange, dispatch),
  _updateDateFrom: bindActionCreators(_updateDateFrom, dispatch),
  _updateDateTo: bindActionCreators(_updateDateTo, dispatch),
  _updateHourFrom: bindActionCreators(_updateHourFrom, dispatch),
  _updateHourTo: bindActionCreators(_updateHourTo, dispatch),
  _updateSexRestriction: bindActionCreators(_updateSexRestriction, dispatch),
  _updateAgeRestriction: bindActionCreators(_updateAgeRestriction, dispatch),
  push: FarceActions.push,
});

const ReduxContainer = connect(
  ({
    found: { resolvedMatch },
    sportunitySearchReducer, 
    globalReducer ,
  }) => ({
    location: resolvedMatch.location,
    params: resolvedMatch.params,
    sportId: sportunitySearchReducer.sportId,
    sportName: sportunitySearchReducer.sportName,
    locationName: sportunitySearchReducer.locationName,
    locationLat: sportunitySearchReducer.locationLat,
    locationLng: sportunitySearchReducer.locationLng,
    distanceRange: sportunitySearchReducer.distanceRange,
    isFreeOnly: sportunitySearchReducer.isFreeOnly,
    dateFrom: sportunitySearchReducer.dateFrom,
    dateTo: sportunitySearchReducer.dateTo,
    hourFrom: sportunitySearchReducer.hourFrom,
    hourTo: sportunitySearchReducer.hourTo,
    ageRestriction: sportunitySearchReducer.ageRestriction,
    sexRestriction: sportunitySearchReducer.sexRestriction,
    userCountry: globalReducer.userCountry,
  }),
  dispatchToProps,
)(FindSportunity);

styles = {
  button: {
    height: '50px',
    backgroundColor: colors.blue,
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    borderRadius: '20px',
    display: 'inline-block',
    fontFamily: 'Lato',
    fontSize: '22px',
    textAlign: 'center',
    color: colors.white,
    borderWidth: 0,
    margin: 10,
    padding: 10,
    cursor: 'pointer',
    lineHeight: '27px',
  },
  bodyContainer: {
    display: 'flex',
    width: '100%',
    flexDirection: 'row',
    fontFamily: 'Lato',
    padding: 0,
    '@media (maxWidth: 1024px)': {
      display: 'inline-block',
    },
  },
  leftPart: {
    display: 'flex',
    flexDirection: 'row',
    '@media (maxWidth: 1024px)': {
      display: 'inline-block',
    },
    '@media (maxWidth: 750px)': {
      display: 'flex',
      flexDirection: 'column-reverse',
    },
  },
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
    marginLeft: 25,
    color: colors.blue,
  },
  leftContainer: {
    flexDirection: 'column',
    width: 250,
    '@media (maxWidth: 1024px)': {
      display: 'inline-block',
      width: '100%',
    },
    '@media (maxWidth: 420px)': {
      overflow: 'hidden',
    },
  },
  middleContainer: {
    display: 'flex',
    width: 500,
    maxWidth: '100%',
    flex: 1,
    '@media (maxWidth: 1024px)': {
      display: 'inline-block',
    },
  },
  rightContainer: {
    display: 'flex',
    width: '100%',
    flex: 1,
    '@media (maxWidth: 1024px)': {
      display: 'inline-block',
    },
  },
  loadingSpinner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
};

export default createRefetchContainer(
  Radium(ReduxContainer),
  {
    viewer: graphql`
      fragment FindSportunity_viewer on Viewer
        @argumentDefinitions(
          first: { type: "Int", defaultValue: 10 }
          filter: { type: "Filter" }
          sportId: { type: "ID", defaultValue: null }
          querySport: { type: "Boolean!", defaultValue: false }
          query: { type: "Boolean!", defaultValue: true }
        ) {
        me {
          id
          ...Filter_user
        }
        ...Events_viewer
        ...Filter_viewer
        sportunities(first: $first, filter: $filter) @include(if: $query) {
          ...Events_sportunities
          ...FindSportunityMap_sportunities
          pageInfo {
            hasNextPage
          }
          count
        }
        sport(id: $sportId) @include(if: $querySport) {
          id
          name {
            EN
            FR
          }
        }
      }
    `,
  },
  graphql`
    query FindSportunityRefetchQuery(
      $first: Int
      $filter: Filter
      $sportId: ID
      $querySport: Boolean!
      $query: Boolean!
    ) {
      viewer {
        ...FindSportunity_viewer
          @arguments(
            first: $first
            filter: $filter
            sportId: $sportId
            querySport: $querySport
            query: $query
          )
      }
    }
  `,
);
