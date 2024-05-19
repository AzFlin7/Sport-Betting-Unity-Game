import React from 'react'
import PropTypes from 'prop-types'
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium'
import {Link} from 'found'
import {withRouter} from 'found'
import ReactLoading from 'react-loading'
import { withAlert } from 'react-alert'
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import Button from '@material-ui/core/Button';

import NewFilterModal from "./NewFilterModal";
import Header from '../common/Header/Header'
import Footer from '../common/Footer/Footer'
import Loading from '../common/Loading/Loading'
import LeftSide from './LeftSide';
import { fonts, colors } from '../../theme'
import CirclePage from '../Circle/Circle';
import TutorialModal from '../common/Tutorial/index.js'
import {confirmModal} from '../common/ConfirmationModal'
import AllCircleMembers from './AllCircleMembers';
import InformationForms from './InformationForms';
import AddEditInformationForms from './InformationForms/AddEditInformationForms';
import AddEditPaymentModels from './PaymentModels/AddEditPaymentModels';
import FormDetails from './InformationForms/FormDetails';
import PaymentModelDetails from './PaymentModels/PaymentModelDetails'
import PaymentModels from './PaymentModels';
import CircleItem from './MyCirclesCircleItem'
import NewCircle from './MyCirclesNewCircle'
import UnsubscribeFromCircleMutation from './mutation/UnsubscribeFromCircle';
import NewPaymentModelMutation from './PaymentModels/NewPaymentModelMutation';
import UpdatePaymentModelMutation from './PaymentModels/UpdatePaymentModelMutation';
import DeletePaymentModelMutation from './PaymentModels/DeletePaymentModelMutation';
import UpdateFormMutation from './InformationForms/UpdateFormMutation';
import DeleteFormMutation from './InformationForms/DeleteFormMutation';
import TermOfUse from './TermOfUse'
import NoResult from './NoResult'

import localizations from '../Localizations'
import SaveCircleFilterMutation from "./SaveCircleFilterMutation";
import SetDefaultCircleFilterMutation from "./SetDefaultCircleFilterMutation";
import Sidebar from "./Sidebar";
import * as types from "../../actions/actionTypes";
import TopBar from '../common/FilterTopBar/TopBar';
import { currentLocationFilterId } from '../../constants';
import LocationFilterModal from '../common/LocationFilterModal';
import GeolocationHOC from '../common/GeolocationHOC';

let styles

class MyCircles extends React.Component {
  static contextTypes = {
    relay: PropTypes.shape({
      variables: PropTypes.object,
    }),
  }

  changeFilterTime;
  doneChangingFilterInterval = 1000;

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      isQuerying: false,
      isQueryingMore: false,
      isError: false,
      isNewCircleModalOpen: false,
      name: '',
      newCircleType: 0,
      newCirclePublic: false,
      newCircleInvitationWithLink: true,
      newCircleShared: true,
      subCircles: [],
      newCircleSport: null,
      newCircleAddress: null,
      language: localizations.getLanguage(),
      tutorial3aIsVisible: false,
      activeSection: 'myCircles',
      formToEdit: null,
      selectedCircle: null,
      shouldQuery: false,
      isQueryingText: false,
      isQueryingCode: false,
			showAskLocationModal: false,
			locationInputFocus: false,
    };
    this.alertOptions = {
      offset: 60,
      position: 'top right',
      theme: 'light',
      transition: 'fade',
    };
  }

  _setLanguage = (language) => {
    this.setState({ language: language })
  };

  componentDidMount = () => {
    let superToken = localStorage.getItem('superToken');

    if (this.props.location.pathname.indexOf('/my-circles') >= 0 && this.props.location.pathname.indexOf('/my-circles/') < 0) {
      this.props.relay.refetch(fragmentVariables => ({
        ...fragmentVariables,
        queryLanguage: localizations.getLanguage().toUpperCase(),
        querySuperMe: superToken ? true : false,
        superToken,
      }), 
      null,
      () => {
        if (this.props.viewer && this.props.viewer.me && !this.props.viewer.me.basicCircleSavedFiltersCreated) {
          this._createDefaultFilters();
        }
        else if (this.props.viewer && this.props.viewer.me && this.props.viewer.me.defaultSavedCircleFilter) {
          this.setState({shouldQuery: true})
          let defaultFilter = [];
          defaultFilter.push(this.props.viewer.me.defaultSavedCircleFilter)
          setTimeout(() => this.props._updateSelectedFilters(defaultFilter), 150);
        }
        else if (this.props.viewer && this.props.viewer.me && this.props.viewer.me.savedCircleFilters && this.props.viewer.me.savedCircleFilters.length > 0 && !this.props.viewer.me.defaultSavedCircleFilter) {
          let defaultFilter = this.props.viewer.me.savedCircleFilters.find(filter => 
            filter.filterName === localizations.myCircles_defaultFilters_MyCircles
          ) || this.props.viewer.me.savedCircleFilters[0];

					if (defaultFilter) {
						this.updateDefaultFilter(defaultFilter.id, () => {
							this.props._updateSelectedFilters([defaultFilter])
						})
					}
        }
      })
    }
    else if (this.props.routeParams.circleId) {
      this.setState({
        selectedCircle: this.props.routeParams.circleId
      });
      let activeSection = null;
      if (this.props.viewer && this.props.viewer.me && this.props.viewer.me.circles && this.props.viewer.me.circles.edges && this.props.viewer.me.circles.edges.length > 0) {
        this.props.viewer.me.circles.edges.forEach(edge => {
          if (edge.node.id === this.props.routeParams.circleId)
            activeSection = 'myCircles';
        })
      }
      if (!activeSection && this.props.viewer && this.props.viewer.me && this.props.viewer.me.circlesUserIsIn && this.props.viewer.me.circlesUserIsIn.edges && this.props.viewer.me.circlesUserIsIn.edges.length > 0) {
        this.props.viewer.me.circlesUserIsIn.edges.forEach(edge => {
          if (edge.node.id === this.props.routeParams.circleId)
            activeSection = 'sportClubs';
        })
      }
      if (!activeSection && this.props.viewer && this.props.viewer.me && this.props.viewer.me.circlesSuperUser && this.props.viewer.me.circlesSuperUser.edges && this.props.viewer.me.circlesSuperUser.edges.length > 0) {
        this.props.viewer.me.circlesSuperUser.edges.forEach(edge => {
          if (edge.node.id === this.props.routeParams.circleId)
            activeSection = 'subAccounts';
        })
      }

      this.setState({activeSection})
    }
    else if (this.props.location.pathname.indexOf('subaccounts-circle-creation') >= 0) {
      this.setState({
        activeSection: 'subAccounts',
        isNewCircleModalOpen: true
      })
    }
    else if (this.props.location.pathname.indexOf('/find-circles') >= 0)
      this.setState({
        activeSection: 'myCircles'
      });
     else if (this.props.location.pathname.indexOf('/all-members') >= 0)
      this.setState({
        activeSection: 'allMembers'
      });
    else if (this.props.location.pathname.indexOf('/members-info') >= 0)
      this.setState({
        activeSection: 'membersInfo'
      });
    else if (this.props.location.pathname.indexOf('/form-info') >= 0)
      this.setState({
        activeSection: 'addEditForm',
        formToEdit: this.props.location && this.props.location.formToEdit ? this.props.location.formToEdit : null
      });
    else if (this.props.location.pathname.indexOf('/payment-info') >= 0 || this.props.location.pathname.indexOf('/edit-payment-info') >= 0)
      this.setState({
        activeSection: 'addEditPayment',
        formToEdit: this.props.location && this.props.location.formToEdit ? this.props.location.formToEdit : null
      });
    else if (this.props.location.pathname.indexOf('/form-details/') >= 0) {
      if (this.props.routeParams.formId)
        this.setState({
          activeSection: 'formDetails',
          formId: this.props.routeParams.formId
        });
    }
    else if (this.props.location.pathname.indexOf('/payment-models') >= 0)
      this.setState({
        activeSection: 'paymentModels'
      });
    else if (this.props.location.pathname.indexOf('/payment-model-details/') >= 0) 
      this.setState({
        activeSection: 'paymentModelDetails',
        paymentModelId: this.props.routeParams.paymentModelId
      })
    else if (this.props.location.pathname.indexOf('/terms-of-uses') >= 0)
      this.setState({
        activeSection: 'termOfUse'
      });
    else if (this.props.viewer && !this.props.viewer.me) {
      this.setState({
        activeSection: 'myCircles'
      })
      // this.props._updateTypeFilter(["PUBLIC_CIRCLES"]);
    }
    else {
      this.setState({shouldQuery: true})
      // this.props._updateTypeFilter(["MY_CIRCLES"]);
      // if (this.props.viewer.me.profileType === 'PERSON')
      //   this.props._updateFilter(["ADULTS", "CHILDREN"])
      // else
      //   this.props._updateFilter(["ADULTS", "CHILDREN", "TEAMS", "CLUBS", "COMPANIES"])
    }

    if (this.props.location.showPublicCircles) {
      if (this.props.viewer.me
        && this.props.viewer.me.savedCircleFilters
        && this.props.viewer.me.savedCircleFilters.indexOf(localizations.myCircles_defaultFilters_AroundMe) >= 0
      )
        this.props._updateSelectedFilters(this.props.viewer.me.savedCircleFilters[localizations.myCircles_defaultFilters_AroundMe])
      else {
        this.props._updateSelectedFilters([{
          filterName: localizations.myCircles_defaultFilters_AroundMe,
          memberTypes: ["ADULTS", "CHILDREN"],
          circleType: ["PUBLIC_CIRCLES"],
          location: {
            lat: this.props.userLocation ? this.props.userLocation.lat() : null,
            lng: this.props.userLocation ? this.props.userLocation.lng() : null
          }
        }]);

      }
    }
    setTimeout(() => this.setState({ loading: false }), 500)

    if (!this.props.viewer.me) {
      this._createLocationFilter(() => 
        this.handleSelectLocationFilter()
      )
		}
  };

  componentDidUpdate = (prevProps) => {
		if ((!prevProps.coords && this.props.coords) || prevProps.isGeolocationEnabled !== this.props.isGeolocationEnabled) {
      if (this.props.coords) {
				setTimeout(this.applyLocationFilter, 100);
			}
		}
	}

	_createLocationFilter = (callback) => {
		const { coords, isGeolocationAvailable, isGeolocationEnabled, positionError } = this.props;
    let location = {};

		if (isGeolocationEnabled && coords) {
			location = {
				lat: coords.latitude,
				lng: coords.longitude,
				radius: 100
			};
			localStorage.setItem('sportunity_user_location', JSON.stringify(location));
    }
  

		const defaultLocationFilter = {
			userCircleFilterId: currentLocationFilterId,
      filterName: localizations.myEvents_defaultFilters_aroundMe,
      memberTypes: ["ADULTS", "CHILDREN"],
      circleType: ['PUBLIC_CIRCLES'],
      canBeDeleted: false,
			location,
		};

		this.setState({ defaultLocationFilter }, () => typeof callback !== 'undefined' && callback());
		return defaultLocationFilter;
	}

  _createDefaultFilters = () => {
		let savedCircleFilters = [];
		/*if (this.props.viewer.me.savedCircleFilters && this.props.viewer.me.savedCircleFilters.length > 0) {
      savedCircleFilters = this.props.viewer.me.savedCircleFilters
		  .map(item => ({
			  userCircleFilterId: item.id,
        filterName: item.filterName,
			  memberTypes: item.memberTypes,
        sport: item.sport.map(sport => ({sportID: sport.sport.id})),
        owners: item.owners.map(user => user.id),
			  circleType: item.circleType,
			  location: {
				  lat: item.location.lat,
				  lng: item.location.lng,
				  radius: 100,
			  }
		  }))
		}*/
    
		if (this.props.viewer.me.profileType === 'PERSON') {
			savedCircleFilters.push({
        filterName: localizations.myCircles_defaultFilters_MyCircles,
        memberTypes: ["ADULTS", "CHILDREN"],
        circleType: ["MY_CIRCLES", "CIRCLES_I_AM_IN"],
        canBeDeleted: false
      });
      savedCircleFilters.push({
        filterName: localizations.myCircles_defaultFilters_AroundMe,
        memberTypes: ["ADULTS", "CHILDREN"],
        circleType: ["PUBLIC_CIRCLES"],
        canBeDeleted: false
      });
      if (this.props.viewer.me.subAccounts && this.props.viewer.me.subAccounts.length > 0) {
        savedCircleFilters.push({
          filterName: localizations.myCircles_defaultFilters_ChildrenCircles,
          memberTypes: ["ADULTS", "CHILDREN"],
          circleType: ["CHILDREN_CIRCLES"],
          canBeDeleted: false
        })
      }
		}
		else if (this.props.viewer.me.profileType === 'ORGANIZATION') {
			savedCircleFilters.push({
        filterName: localizations.myCircles_defaultFilters_MyCircles,
        memberTypes: ["ADULTS", "CHILDREN", "TEAMS", "CLUBS", "COMPANIES"],
        circleType: ["MY_CIRCLES"],
        canBeDeleted: false
      });
      savedCircleFilters.push({
        filterName: localizations.myCircles_defaultFilters_AroundMe,
        memberTypes: ["ADULTS", "CHILDREN", "TEAMS", "CLUBS", "COMPANIES"],
        circleType: ["PUBLIC_CIRCLES"],
        canBeDeleted: false
      });
      if (this.props.viewer.me.subAccounts && this.props.viewer.me.subAccounts.length > 0) {
        savedCircleFilters.push({
          filterName: localizations.myCircles_defaultFilters_TeamsCircles,
          memberTypes: ["ADULTS", "CHILDREN", "TEAMS", "CLUBS", "COMPANIES"],
          circleType: ["CHILDREN_CIRCLES"],
          canBeDeleted: false
        })
      }
		}
		else {
			savedCircleFilters.push({
        filterName: localizations.myCircles_defaultFilters_MyCircles,
        memberTypes: ["ADULTS", "CHILDREN", "TEAMS", "CLUBS", "COMPANIES"],
        circleType: ["MY_CIRCLES"],
        canBeDeleted: false
      });
      savedCircleFilters.push({
        filterName: localizations.myCircles_defaultFilters_AroundMe,
        memberTypes: ["ADULTS", "CHILDREN", "TEAMS", "CLUBS", "COMPANIES"],
        circleType: ["PUBLIC_CIRCLES"],
        canBeDeleted: false
      });
      if (this.props.viewer.me.subAccounts && this.props.viewer.me.subAccounts.length > 0) {
        savedCircleFilters.push({
          filterName: localizations.myCircles_defaultFilters_SubAccountsCircles,
          memberTypes: ["ADULTS", "CHILDREN", "TEAMS", "CLUBS", "COMPANIES"],
          circleType: ["CHILDREN_CIRCLES"],
          canBeDeleted: false
        })
      }
		}

		if (savedCircleFilters.length > 0) {
			this.updateSavedFilter(savedCircleFilters, true, (props) => {
				if (props.viewer.me.savedCircleFilters.length > 0) {
          let defaultFilter = props.viewer.me.savedCircleFilters.find(filter => filter.filterName === localizations.myCircles_defaultFilters_MyCircles) || props.viewer.me.savedCircleFilters[0];
					if (defaultFilter) {
						this.updateDefaultFilter(defaultFilter.id, () => {
							this.props._updateSelectedFilters([defaultFilter])
						})
					}
				}
			});
		}
	}

  _setFilter = (nextProps) => {
    if (this.state.activeSection === 'myCircles') {
      this.setState({isQuerying: true})
      clearTimeout(this.changeFilterTime);
      this.changeFilterTime = setTimeout(() => this._handleRefetch(nextProps), this.doneChangingFilterInterval);
    }
  }

  _handleRefetch = props => {
    if (!props) props = this.props; 
    
    let circleType = cloneDeep(props.typeFilter) ;
    if (props.userFilter && props.userFilter.length > 0) {
      if (circleType.indexOf("CHILDREN_CIRCLES") < 0) circleType.push("CHILDREN_CIRCLES")
      if (circleType.indexOf("PUBLIC_CIRCLES") < 0) circleType.push("PUBLIC_CIRCLES")
    }

    this.props.relay.refetch(fragmentVariables => ({
      ...fragmentVariables,
      filterCircle: {
        types: props.filter,
        location: props.locationFilter ? {
          lat: props.locationFilter.location.lat,
          lng: props.locationFilter.location.lng,
          radius: 100,
        } : null,
        owners: props.userFilter,
        sport: props.sportFilter && props.sportFilter.length > 0 ? props.sportFilter.map(sport => ({sportID: sport})) : null,
        nameCompletion: props.nameCompletion,
        circleType: circleType
      },
      // queryMyCircle: props.typeFilter.indexOf("MY_CIRCLES") >= 0 || (props.typeFilter.length === 0 && props.userFilter.length === 0),
      // queryCirclesImIn: props.typeFilter.indexOf("CIRCLES_I_AM_IN") >= 0 || (props.typeFilter.length === 0 && props.userFilter.length === 0),
      // querySubAccount: props.userFilter && props.userFilter.length > 0, //props.typeFilter.indexOf("CHILDREN_CIRCLES") >= 0 || (props.typeFilter.length === 0 && props.userFilter.length === 0),
      queryPublicCircle: true// props.typeFilter.indexOf("PUBLIC_CIRCLES") >= 0 || (props.typeFilter.length === 0 && props.userFilter.length === 0),
      // queryOtherTeamsCircles: props.typeFilter.indexOf("OTHER_TEAMS_CIRCLES") >= 0
    }),
    null,
    () => {
      setTimeout(() => {
          this.setState({
            isQuerying: false,
            isQueryingText: false,
            isQueryingCode: false
          })

      }, 50);
    });
  }

  componentWillReceiveProps = (nextProps) => {
    if (!this.props.locationFilter && nextProps.locationFilter && this.state.locationInputFocus) {
			this.setState({locationInputFocus: false})
    }
    
		if (this.props.viewer && this.props.viewer.me && this.props.viewer.me.id && !this.props.viewer.superMe && nextProps.viewer.superMe && (nextProps.viewer.superMe.profileType === 'BUSINESS' || nextProps.viewer.superMe.profileType === 'ORGANIZATION')) {
			setTimeout(() =>
				this.setState({
					tutorial3aIsVisible: true
				}), 100
			);
    }
    
	  if (!isEqual(this.props.selectedFilters, nextProps.selectedFilters) && nextProps.selectedFilters.length > 0) {
      //this.setState({isQuerying: true})
			let memberfilter = [];
			let sportFilter = [];
		  let typeFilter = [];
		  let userFilter = [];

		  nextProps.selectedFilters.forEach((filter) => {
		  	if (filter.memberTypes !== null && filter.memberTypes !== undefined)
		  		filter.memberTypes.forEach((memberType) => {
		  			if (memberfilter.indexOf(memberType) < 0)
		  				memberfilter.push(memberType)
				  })
			  if (filter.sport !== null && filter.sport !== undefined)
			  	filter.sport.forEach((sport) => {
			  		if (sportFilter.indexOf(sport.sport.id) < 0)
			  			sportFilter.push(sport.sport.id)
				  })
			  if (filter.circleType !== null && filter.circleType !== undefined)
			  	filter.circleType.forEach((type) => {
			  		if (typeFilter.indexOf(type) < 0)
			  			typeFilter.push(type)
				  })
			  if (filter.owners !== null && filter.owners !== undefined)
			  	filter.owners.forEach((user) => {
			  		if (userFilter.indexOf(user.id) < 0)
			  			userFilter.push(user.id)
          })
        if (filter.location && filter.location.lat) {
          if (filter.userCircleFilterId === currentLocationFilterId) {
						this.props._updateLocationFilter({
							location: {
								lat: filter.location.lat,
								lng: filter.location.lng,
								radius: filter.location.radius
							}, label: 'Current Location'
						});
					} else {
          let geocoder = new google.maps.Geocoder();
          geocoder.geocode({'latLng': new google.maps.LatLng(filter.location)},(results, status) => {
            if (status === 'OK') {
              let city
              for (var a=0 ; a<results.length; a++) {
                let resultIdFound = false;
                for (var n=0; n<results[a].types.length ; n++) {
                  if (results[a].types[n] === "locality") {
                    resultIdFound = true ;
                  }
                }
                if (resultIdFound) {
                  for (var i=0; i<results[a].address_components.length; i++) {
                    for (var b=0;b<results[a].address_components[i].types.length;b++) {
                        if (results[a].address_components[i].types[b] == "locality") {
                            city = results[a].address_components[i].long_name;
                            break;
                        }
                    }
                  }
                }
              }
              if (city)
                this.props._updateLocationFilter({location: {lat: filter.location.lat, lng:filter.location.lng}, label: city})
            }
          })
        }
        }
		  })
		  this.props._updateFilter(memberfilter);
		  this.props._updateSportFilter(sportFilter);
      this.props._updateTypeFilter(typeFilter);
		  this.props._updateUserFilter(userFilter);
    }
    else if (((nextProps.selectedFilters && 
			nextProps.selectedFilters[0] && 
			nextProps.selectedFilters[0].circleType && 
      nextProps.selectedFilters[0].circleType.indexOf('PUBLIC_CIRCLES') >= 0) || 
      (nextProps.selectedFilters.length === 0 && nextProps.typeFilter.indexOf('PUBLIC_CIRCLES') >= 0)
      ) && 
			!nextProps.locationFilter
		) {
			if (!this.state.showAskLocationModal) {
        this.setState({showAskLocationModal: true})
      }
				
			return;
		}
    else if (!isEqual(this.props.typeFilter, nextProps.typeFilter) 
      || !isEqual(this.props.filter, nextProps.filter)
	    || !isEqual(this.props.userFilter, nextProps.userFilter) || !isEqual(this.props.sportFilter, nextProps.sportFilter)
      || !isEqual(this.props.locationFilter, nextProps.locationFilter)) {
      this._setFilter(nextProps);
    }

    if (this.props.nameCompletion !== nextProps.nameCompletion) {
      let tempo = nextProps.nameCompletion;
      this.setState({isQueryingText: true})
      setTimeout(() => {
        if (tempo === this.props.nameCompletion) {
          this._setFilter(nextProps)
        }
      }, 250)
    }

    if (this.props.codeInput !== nextProps.codeInput) {
      let tempo = nextProps.codeInput;
      this.setState({isQueryingCode: true})
      setTimeout(() => {
        if (tempo === this.props.codeInput) {
          this.props.relay.refetch(fragmentVariables => ({
            ...fragmentVariables,
            filterCircle: {
              code: nextProps.codeInput,
              nameCompletion: nextProps.codeInput
            },
            queryMyCircle: false,
            queryCirclesImIn: false,
            querySubAccount: false,
            queryPublicCircle: true,
            queryOtherTeamsCircles: false
          }),
          null,
          () => {
            setTimeout(() => {
                this.setState({
                  isQuerying: false,
                  isQueryingText: false,
                  isQueryingCode: false
                })
      
            }, 50);
          });
        }
      }, 250)
    }

    if (this.state.shouldQuery
      && isEqual(this.props.selectedFilters, nextProps.selectedFilters)
      && isEqual(this.props.typeFilter, nextProps.typeFilter)
      && isEqual(this.props.filter, nextProps.filter)
      && isEqual(this.props.userFilter, nextProps.userFilter)
      && isEqual(this.props.sportFilter, nextProps.sportFilter)
      && isEqual(this.props.locationFilter, nextProps.locationFilter)) {
        this.setState({shouldQuery: false});
        this._setFilter(nextProps)
    }
    if (!this.props.routeParams.circleId && nextProps.circleId) {
      this.setState({
        selectedCircle: nextProps.circleId
      })
    }
    if (this.props.routeParams.circleId && !nextProps.circleId) {
      this.setState({
        selectedCircle: null,
        activeSection: 'myCircles'
      })
      this._setFilter(nextProps)
    }
    else if (this.props.location.pathname !== nextProps.location.pathname && this.props.location.pathname.indexOf('/circle/') < 0 && nextProps.location.pathname.indexOf('/circle/') < 0) {
      if (nextProps.location.pathname.indexOf('/find-circles') >= 0)
        this.setState({
          activeSection: 'myCircles'
        });
      else if (nextProps.location.pathname.indexOf('/all-members') >= 0)
        this.setState({
          activeSection: 'allMembers'
        });
      else if (nextProps.location.pathname.indexOf('/members-info') >= 0)
        this.setState({
          activeSection: 'membersInfo'
        });
      else if (nextProps.location.pathname.indexOf('/form-info') >= 0)
        this.setState({
          activeSection: 'addEditForm',
          formToEdit: nextProps.location && nextProps.location.formToEdit ? nextProps.location.formToEdit : null
        });
      else if (nextProps.location.pathname.indexOf('/payment-info') >= 0 || nextProps.location.pathname.indexOf('/edit-payment-info') >= 0)
        this.setState({
          activeSection: 'addEditPayment',
          formToEdit: nextProps.location && nextProps.location.formToEdit ? nextProps.location.formToEdit : null
        });
      else if (nextProps.location.pathname.indexOf('/form-details/') >= 0) {
        if (nextProps.routeParams.formId)
          this.setState({
            activeSection: 'formDetails',
            formId: nextProps.routeParams.formId
          });
      }
      else if (nextProps.location.pathname.indexOf('/payment-model-details/') >= 0) 
        this.setState({
          activeSection: 'paymentModelDetails',
          paymentModelId: nextProps.routeParams.paymentModelId
        })
      else if (nextProps.location.pathname.indexOf('/payment-models') >= 0)
        this.setState({
          activeSection: 'paymentModels'
        });
      else if (nextProps.location.pathname.indexOf('/terms-of-uses') >= 0)
        this.setState({
          activeSection: 'termOfUse'
        });
      else {
        this.setState({
          activeSection: 'myCircles'
        });
        if (this.props.viewer && !this.props.viewer.me)
          this.props._updateTypeFilter(["PUBLIC_CIRCLES"])
        else {
          this.props._updateTypeFilter(["MY_CIRCLES"]);
          if (this.props.viewer.me.profileType === 'PERSON')
            this.props._updateFilter(["ADULTS", "CHILDREN"])
          else
            this.props._updateFilter(["ADULTS", "CHILDREN", "TEAMS", "CLUBS", "COMPANIES"])
        }
      }
    }

    if (!this.props.location.showPublicCircles && nextProps.location.showPublicCircles) {
      if (this.props.viewer.me
        && this.props.viewer.me.savedCircleFilters
        && this.props.viewer.me.savedCircleFilters.indexOf(localizations.myCircles_defaultFilters_AroundMe) >= 0
      )
        this.props._updateSelectedFilters(this.props.viewer.me.savedCircleFilters[localizations.myCircles_defaultFilters_AroundMe])
      else {
        this.props._updateSelectedFilters([{
          filterName: localizations.myCircles_defaultFilters_AroundMe,
          memberTypes: ["ADULTS", "CHILDREN"],
          circleType: ["PUBLIC_CIRCLES"],
          location: {
            lat: this.props.userLocation ? this.props.userLocation.lat() : null,
            lng: this.props.userLocation ? this.props.userLocation.lng() : null
          }
        }]);

      }
    }
	};

  _setIsError = (value) => {
    this.setState({
      isError: value,
    })
  }

  _handleChange = (value) => {
    if (value !== this.state.name) {
      this.setState({
        name: value,
      })
    }
  };

  _updateSubCircles = (subCircles) => {
    this.setState({
      subCircles
    })
  };
  _updateNewCircleType = e => {
    this.setState({
      newCircleType: e
    })
  };

  _updateNewCirclePrivacy = e => {
    this.setState({
      newCirclePublic: e,
      newCircleInvitationWithLink: e ? true : this.state.newCircleInvitationWithLink
    })
  };

  _updateNewCircleInvitationWithLink = e => {
    this.setState({
      newCircleInvitationWithLink: e
    })
  };

  _updateNewCircleShared = e => {
    this.setState({
      newCircleShared: e
    })
  };

  _updateNewCircleSport = e => {
    this.setState({
      newCircleSport: e
    })
  };

  _closeNewCircle = () => {
    this.setState({
      isNewCircleModalOpen: false,
      name: '',
      newCircleType: 0,
      newCirclePublic: false,
      newCircleInvitationWithLink: true,
      newCircleShared: false,
      subCircles: [],
      newCircleSport: null,
      newCircleAddress: null,
    })
  };

  _handleAddressChange = ({label}) => {
    const splitted = label.split(', ');
    if (splitted.length < 2) {
      this.props.alert.show(localizations.circle_address_error, {
        timeout: 2000,
        type: 'error',
      });

      return ;
    }
    const address = splitted.slice(0, splitted.length-2).join(', ') || '';
    const country = splitted[splitted.length - 1] || '';
    const city = splitted[splitted.length - 2] || '';

    this.setState({
      newCircleAddress: {
        address,
        country,
        city,
      }
    });
  };

  unSubscribe = (circle, callback) => {
    confirmModal({
      title: localizations.circles_unsubscribe,
      message: localizations.circles_unsubscribe_validation + ' ' + circle.name + ' ?',
      confirmLabel: localizations.circle_remove_all_data_yes,
      cancelLabel: localizations.circle_remove_all_data_no,
      canCloseModal: true,
      onConfirm: () => {
        let params = {
          circleIdVar: circle.id,
          userIdVar: this.props.viewer.me.id,
          viewer: this.props.viewer
        }

        UnsubscribeFromCircleMutation.commit(params,
          {
            onFailure: error => {
              console.log(error.getError());
              this.props.alert.show(localizations.circles_unsubscribe_error, {
                timeout: 2000,
                type: 'error',
              });
            },
            onSuccess: (response) => {
              this.props.alert.show(localizations.circles_unsubscribe_success + ' ' + circle.name, {
                timeout: 2000,
                type: 'success',
              });
              if (typeof callback !== 'undefined')
                callback()
            },
          }
        );
      },
      onCancel: () => {}
    })
  }

  _showMoreCircles = () => {
    this.setState({
      isQueryingMore: true
    })
    this.props.relay.refetch(fragmentVariables => ({
      ...this.context.relay.variables,
      firstCircle: this.context.relay.variables.firstCircle + 10
    }),
    null,
    () => {
      setTimeout(() => this.setState({isQueryingMore: false}), 50)
    })
  }

  _handleChangeSection = section => {
    this.setState({
      activeSection: section !== this.state.activeSection ? section : 'myCircles',
      selectedCircle: null
    });
    this.props.router.push(`/my-circles`);
  };

	updateSavedFilter = (data, basicCircleSavedFiltersCreated = false, callback) => {
    SaveCircleFilterMutation.commit(
        basicCircleSavedFiltersCreated
        ? {
            viewer: this.props.viewer,
            user: this.props.viewer.me,
            userIDVar: this.props.viewer.me.id,
            savedFiltersVar: data,
            basicCircleSavedFiltersCreatedVar: basicCircleSavedFiltersCreated
          }
        : {
          viewer: this.props.viewer,
          user: this.props.viewer.me,
          userIDVar: this.props.viewer.me.id,
          savedFiltersVar: data
        },
			{
				onSuccess: () => {
          if (typeof callback !== "undefined")
            setTimeout(() => callback(this.props), 150);
          else
            this.props.alert.show(localizations.popup_findSportunity_filter_success, {
              timeout: 3000,
              type: 'success',
            });
				},
				onFailure: (error) => {
					console.log(error.getError());
					this.props.alert.show(error.getError(), {
						timeout: 3000,
						type: 'error',
					});
				},
			}
		)
	}

	updateDefaultFilter = (data, callback) => {
    SetDefaultCircleFilterMutation.commit({
				viewer: this.props.viewer,
				user: this.props.viewer.me,
				filterIDVar: data
    },
			{
				onSuccess: () => {
          if (typeof callback !== 'undefined') {
						callback();
					}
					else {
            this.props.alert.show(localizations.popup_findSportunity_filter_success, {
              timeout: 3000,
              type: 'success',
            });
          }
				},
				onFailure: (error) => {
					console.log(error.getError());
					this.props.alert.show(error.getError(), {
						timeout: 3000,
						type: 'error',
					});
				},
			}
		)
  }

  _handleSearchChange = e => {
    this.props._updateNameCompletion(e.target.value)
  }

  _handleSearchByCodeChange = e => {
    this.props._updateSearchByCode(e.target.value)
  }

	_handleSeeMore = (newStatus, callback) => {
		if (newStatus)
			this.props.relay.refetch(fragmentVariables => ({
        ...this.context.relay.variables,
				sportNb: this.props.viewer.myCirclesSports.count
      }),
      null,
      () => {
        setTimeout(() => {
            callback()
        }, 100);
      })
		else
			this.props.relay.refetch(fragmentVariables => ({
        ...this.context.relay.variables,
				sportNb: 10
      }),
      null,
      () => {
        setTimeout(() => {
            callback()
        }, 100);
      })
  };

	handleSelectLocationFilter = () => {
		const { coords } = this.props;
		const savedLocationFilter = JSON.parse(localStorage.getItem('sportunity_user_location'));

		if ((coords && coords.latitude) || (savedLocationFilter && savedLocationFilter.lat)) {
			this.applyLocationFilter();
    } else {
			this.setState({ showAskLocationModal: true});
		}
	}

	applyLocationFilter = () => {
		const { coords, positionError } = this.props;
    const savedLocationFilter = JSON.parse(localStorage.getItem('sportunity_user_location'));

		if (positionError) {
			if (positionError.code === 1) {
				alert('Location access is currently blocked. Please enable the access from your browser settings.');
			} else {
				alert('There seems to be a problem with fetching your current location. Please try later.');
			}
			localStorage.removeItem('sportunity_user_location');
		}

		if (!coords) {
			this.props.getLocation({
				onSuccess: () => {
					this._createLocationFilter();
					if (this.retriedLocationFetch !== true) {
						setTimeout(this.applyLocationFilter, 100);
					}
					this.retriedLocationFetch = true;
				},
				onError: () => {
					localStorage.removeItem('sportunity_user_location');
				}
			});
			return;
		}

		const { defaultLocationFilter } = this.state;

		if (savedLocationFilter && savedLocationFilter.lat) {
			this.props._updateSelectedFilters([{...defaultLocationFilter, location: savedLocationFilter}]);
			this.setState({ showAskLocationModal: false });
		} else if (coords) {
			this.props._updateSelectedFilters([defaultLocationFilter]);
			this.setState({ showAskLocationModal: false });
		}
	}

	focusOnLocationInput = () => {
    if (!this.props.viewer.me) {
      const filter = {
        userCircleFilterId: currentLocationFilterId,
        filterName: localizations.myEvents_defaultFilters_aroundMe,
        location: {},
        memberTypes: ["ADULTS", "CHILDREN"],
        circleType: ['PUBLIC_CIRCLES'],
      };
      this.props._updateSelectedFilters([filter]);
    }
		this.setState({ showAskLocationModal: false }, () => {
			setTimeout(
				() => {
					this.setState((prevState) => ({ locationInputFocus: true, showAskLocationModal: false }));
				},
				500
			);
		});
  }
  
  openNewCircle = () => {
    this.props.router.push({pathname:`/new-group`, isCreatingForSubAccount: this.props.userFilter && this.props.userFilter.length > 0})
  }

  render() {
    const { viewer } = this.props
	  let circleList = [].concat(
		  viewer.circles && viewer.circles.edges ? viewer.circles.edges : []
    );

    let circleNb = 0 ;
    viewer.circles && viewer.circles.edges && (circleNb = circleNb + viewer.circles.count);

    return (
      <div>
        {this.state.loading && <Loading/>}
        <div className={"circle_main"} style={styles.bodyContainer}>

          <LocationFilterModal
            visible={this.state.showAskLocationModal}
            applyLocationFilter={this.applyLocationFilter}
            focusOnLocationInput={this.focusOnLocationInput}
            onCloseModal={() => {
              this.setState({ showAskLocationModal: false });
            }}
          />

	        {!this.props.routeParams.circleId && this.state.activeSection === 'myCircles' &&
		        <Sidebar
              {...this.state}
              viewer={viewer}
              updateSavedFilter={this.updateSavedFilter}
              updateDefaultFilter={this.updateDefaultFilter}
              onSeeMore={this._handleSeeMore}
              _handleSearchChange={this._handleSearchChange}
              _handleSearchByCodeChange={this._handleSearchByCodeChange}
              nameCompletion={this.props.nameCompletion}
              codeInput={this.props.codeInput}
							locationInputFocus={this.state.locationInputFocus}
            />
	        }

          {this.props.routeParams.circleId &&
            <CirclePage
              circleId={this.props.routeParams.circleId}
              circle={this.props.viewer.circle}
              viewer={viewer}
              activeTab={this.props.activeTab}
              unSubscribe={this.unSubscribe}
            />
          }

          {this.state.activeSection === 'allMembers' && !this.state.selectedCircle &&
            <div style={{...styles.circlesContainer, width: '100%'}}>
              <AllCircleMembers
                user={viewer.me}
                viewer={viewer}
                onChangeSection={this._handleChangeSection}
              />
            </div>
          }
          {!this.props.routeParams.circleId && this.state.activeSection === 'myCircles' && !this.state.selectedCircle &&
            <div style={styles.circlesContainer}>
              <div style={styles.topBarContainer}>
                <NewFilterModal
                  open={this.state.newFilterModalOpen}
                  onClose={() => this.setState({newFilterModalOpen: false})}
                  onCancel={() => this.setState({createFilter: false})}
                  onConfirm={() => this.setState({createFilter: true})}
                />
                <TopBar
                  {...this.state}
                  viewer={viewer}
                  updateSavedFilter={this.updateSavedFilter}
                  nameCompletion={this.props.nameCompletion}
                  onSelectLocationFilter={this.handleSelectLocationFilter}
                  >
                </TopBar>
              </div>

              <div style={styles.circleList}>
                <div style={styles.circleCreateContainer}>
                  <div style={styles.circleNumber}>
                    {localizations.circles_groups + ' (' + circleNb +')'
                    }
                  </div>

                  {viewer.me &&
                    <div style={styles.button}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={this.openNewCircle}
                      >
                        {this.props.userFilter && this.props.userFilter.length > 0
                          ? viewer.me && viewer.me.profileType === 'PERSON'
                            ? localizations.circles_create_child
                            : localizations.circles_create_team
                          : localizations.circles_create}
                      </Button>
                    </div>
                  }
                </div>

                <TutorialModal
                  isOpen={this.state.tutorial3aIsVisible}
                  tutorialNumber={4}
                  tutorialName={"team_small_tutorial4"}
                  message={localizations.team_small_tutorial3a}
                  confirmLabel={localizations.team_small_tutorial_ok}
                  onPass={() => this.setState({tutorial3aIsVisible: false})}
                  position={{
                    bottom: -125,
                    left: 50
                  }}
                  arrowPosition= {{
                    top: -8,
                    left: 130
                  }}
                />

                {!this.state.isQuerying && circleList.map(circle =>
                  <CircleItem key={circle.node.id}
                    circle={circle.node}
                    viewer={viewer}
                    link={`/circle/${circle.node.id}`}
                    openCircle={() => this.setState({tutorial3aIsVisible: false})}
                    handleRefetch={this._handleRefetch}
                    {...this.state}>
                      {circle.node.owner ? circle.node.name + ' ' + localizations.find_my_sport_clubs_of + ' ' + circle.node.owner.pseudo : circle.node.name}
                    </CircleItem>
                  )
                }
                {!this.state.isQuerying && circleNb === 0 && 
                  <NoResult viewer={viewer}/>
                }
                {circleNb > 3 && circleList.length < circleNb && !this.state.isQueryingMore && !this.state.isQuerying && 
                  <div style={styles.showContainer}>
                    <div onClick={() => this._showMoreCircles(circleNb)} style={styles.showButton}>
                      {localizations.find_public_circle_show_more}
                    </div>
                  </div>
                }
                {(this.state.isQuerying || this.state.isQueryingMore) &&
                  <div style={styles.loadingContainer}>
                    <ReactLoading type='spinningBubbles' color={colors.blue}/>
                  </div>
                }
              </div>
            </div>
          }

          {this.state.activeSection === 'membersInfo' &&
          <div style={styles.circlesContainer}>
            <InformationForms
              user={viewer.me}
              viewer={viewer}
              language={this.props.language}
            />
          </div>
          }
          {this.state.activeSection === 'addEditForm' &&
          <div style={styles.circlesContainer}>
            <AddEditInformationForms
              user={viewer.me}
              viewer={viewer}
              formToEdit={this.state.formToEdit}
              language={this.props.language}
            />
          </div>
          }
          {this.state.activeSection === 'addEditPayment' &&
            <div style={styles.circlesContainer}>
              <AddEditPaymentModels
                user={viewer.me}
                viewer={viewer}
                formToEdit={this.state.formToEdit}
                language={this.props.language}
                paymentModelId={this.props.routeParams.paymentModelId}
              />
            </div>
          }
          {this.state.activeSection === 'formDetails' &&
            <div style={styles.circlesContainer}>
              <FormDetails
                user={viewer.me}
                viewer={viewer}
                formId={this.state.formId}
                language={this.props.language}
              />
            </div>
          }
          {this.state.activeSection === 'paymentModelDetails' &&
            <div style={styles.circlesContainer}>
              <PaymentModelDetails
                user={viewer.me}
                viewer={viewer}
                paymentModelId={this.state.paymentModelId}
                language={this.props.language}
              />
            </div>
          }
          {this.state.activeSection === 'paymentModels' &&
            <div style={styles.circlesContainer}>
              <PaymentModels
                user={viewer.me}
                viewer={viewer}
                language={this.props.language}
              />
            </div>
          }
          {this.state.activeSection === 'termOfUse' &&
            <div style={styles.circlesContainer}>
              <TermOfUse
                user={viewer.me}
                viewer={viewer}
                language={this.props.language}
              />
            </div>
          }
        </div>
      </div>
    )
  }
}

styles = {
  bodyContainer: {
    width: '100%',
    minHeight: 600,
    paddingBottom: 50,
    //old code: paddingTop: 15,
    paddingTop: 0, // Vikas B: Overriding the style because we need to mix the container with upper header
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'left',
    fontFamily: 'Lato',
	'@media (max-width: 767px)': {
      display: 'block',
	  },
    '@media (maxWidth: 677px)': {
      flexDirection: 'column',
    },
  },
  circlesContainer: {
    display: 'flex',
    flex: 1,
    width: '100%',
    margin: '0px auto',
    flexDirection: 'column',
	  paddingLeft: 70,
    justifyContent: 'flex-start',
    '@media (maxWidth: 1024px)': {
      paddingLeft: 10,
      paddingRight: 10
    },
    '@media (maxWidth: 850px) and (minWidth: 761px)': {
      width: '70%',
    },
	'@media (max-width: 767px)':  {
	  display: 'block',
      paddingLeft: 15,
      paddingRight: 15,
    },
  },
  circleCreateContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '600px',
    maxWidth: '100%',
    alignItems: 'center'
  },
  circleList: {
    marginTop: 15,
    maxWidth: '100%',
    position: 'relative'
  },
  circleNumber: {
    fontFamily: 'Lato',
    fontSize: 20,
    color: '#898c8d',
  },
  pageHeader: {
		//height: 41,
		fontFamily: 'Lato',
		fontSize: '25px',
		fontWeight: 'bold',
		color: colors.blue,
		display: 'flex',
    maxWidth: '100%',
		margin: '30px 0px 10px',
    flexDirection: 'row',
		//paddingLeft: 70,
		alignItems: 'left',
    justifyContent: 'left',
    '@media (maxWidth: 960px)': {
      paddingLeft: 0,
      textAlign: 'center',
      display: 'block',
    }
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    width: 600,
    '@media (minWidth: 1024px)': {
      minWidth: 600,
    },
    '@media (maxWidth: 1024px)': {
      width: 'auto',
    },
	'@media (max-width: 767px)':  {
      display: 'block',
    }
  },
  showContainer: {
    display: 'flex',
    margin: '25px 0px 0px 25px',
	'@media (max-width: 767px)': {
      display: 'block',
    }
  },
  showButton: {
    fontFamily: 'Lato',
    fontSize: 18,
    cursor: 'pointer',
    color: colors.blue
  },
  button: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-center',
    fontFamily: 'Lato',
    position: 'fixed',
    right: 50,
    bottom: 100,
    zIndex: 2
  },
  createCircleButton: {
    color: colors.white,
    backgroundColor: colors.blue,
    fontWeight: 'bold',
    fontSize: '16px',
    width: '200px'
  },
  topBarContainer: {
    display: 'flex',
    flexDirection: 'row',
    '@media (max-width: 767px)': {
      display: 'block',
    }
  }
}

const _updateFilter = (value) => {
	return {
		type: types.UPDATE_MY_CIRCLE_FILTER,
		value,
	}
}

const _updateSportFilter = (value) => {
	return {
		type: types.UPDATE_MY_CIRCLE_SPORT_FILTER,
		value
	}
}

const _updateLocationFilter = value => {
	return {
		type: types.UPDATE_MY_CIRCLE_LOCATION_FILTER,
		value
	}
}

const _updateTypeFilter = value => {
	return {
		type: types.UPDATE_MY_CIRCLE_TYPE_FILTER,
		value
	}
}

const _updateUserFilter = value => {
	return {
		type: types.UPDATE_MY_CIRCLE_USER_FILTER,
		value
	}
}

const _updateSelectedFilters = value => {
	return {
		type: types.UPDATE_MY_CIRCLE_SELECTED_FILTERS,
		value
	}
}

const _updateNameCompletion = value => {
  return {
    type: types.UPDATE_MY_CIRCLE_NAME_COMPLETION,
    value
  }
}

const _updateSearchByCode = value => {
  return {
    type: types.UPDATE_MY_CIRCLE_SEARCH_CODE,
    value
  }
}

const _resetFilter = () => {
	return {
		type: types.UPDATE_MY_CIRCLE_RESET_FILTER,
	}
}


const dispatchToProps = (dispatch) => ({
	_updateFilter: bindActionCreators(_updateFilter, dispatch),
	_resetFilter: bindActionCreators(_resetFilter, dispatch),
	_updateSportFilter: bindActionCreators(_updateSportFilter, dispatch),
	_updateLocationFilter: bindActionCreators(_updateLocationFilter, dispatch),
	_updateTypeFilter: bindActionCreators(_updateTypeFilter, dispatch),
	_updateUserFilter: bindActionCreators(_updateUserFilter, dispatch),
  _updateSelectedFilters: bindActionCreators(_updateSelectedFilters, dispatch),
  _updateNameCompletion: bindActionCreators(_updateNameCompletion, dispatch),
  _updateSearchByCode: bindActionCreators(_updateSearchByCode, dispatch),
});

const stateToProps = (state) => ({
	filter: state.myCircleFilterReducer.filter,
	sportFilter: state.myCircleFilterReducer.sportFilter,
	locationFilter: state.myCircleFilterReducer.locationFilter,
	typeFilter: state.myCircleFilterReducer.typeFilter,
	userFilter: state.myCircleFilterReducer.userFilter,
  selectedFilters: state.myCircleFilterReducer.selectedFilters,
  nameCompletion: state.myCircleFilterReducer.nameCompletion,
  codeInput: state.myCircleFilterReducer.codeInput, 
  userLocation: state.globalReducer.userLocation,
  language: state.globalReducer.language,
});

const ReduxContainer = connect(
	stateToProps,
	dispatchToProps,
)(Radium(MyCircles));

const MyCirclesWithGeolocation = GeolocationHOC({
	positionOptions: {
    enableHighAccuracy: false,
  },
  userDecisionTimeout: 5000,
})(ReduxContainer);

export default createRefetchContainer(withRouter(Radium(withAlert(MyCirclesWithGeolocation))), {
//OK
  viewer: graphql`
    fragment MyCircles_viewer on Viewer @argumentDefinitions(
      superToken: {type: "String", defaultValue: null},
      querySuperMe: {type: "Boolean!", defaultValue: false},
      circleId: {type: "ID", defaultValue: null},
      formId: {type: "ID", defaultValue: null},
      circlesSuperUserNumber: {type: "Int", defaultValue: 5},
      circlesUserIsInNumber: {type: "Int", defaultValue: 5},
      ownerOfCirclesNumber: {type: "Int", defaultValue: 5},
      otherTeamsCirclesNumber: {type: "Int", defaultValue: 5}, 
      firstCircle: {type: "Int", defaultValue: 10},
      sportNb: {type: "Int", defaultValue: 10},
      filterSport: {type: "SportFilter", defaultValue: null},
      filterCircle: {type: "CirclesFilter"},
      filterCircleSubAccount: {type: "CirclesFilter"}, 
      queryMyCircle: {type: "Boolean!", defaultValue: false},
      queryCirclesImIn: {type: "Boolean!", defaultValue: false},
      querySubAccount: {type: "Boolean!", defaultValue: false},
      queryPublicCircle: {type: "Boolean!", defaultValue: false},
      queryOtherTeamsCircles: {type: "Boolean!", defaultValue: false},
      queryLanguage: {type: "SupportedLanguage", defaultValue: "EN"},
      queryCircle: {type: "Boolean!", defaultValue: false}
    ){
      id
      ...AllCircleMembers_viewer
      ...InformationForms_viewer
      ...AddEditInformationForms_viewer
      ...FormDetails_viewer
      ...PaymentModelDetails_viewer
      ...PaymentModels_viewer
      ...AddEditPaymentModels_viewer
      circles (first: $firstCircle, filter: $filterCircle) @include(if: $queryPublicCircle) {
        edges {
          node {
            ...MyCirclesCircleItem_circle
            id
            name
            mode
            isCircleUpdatableByMembers
            isCircleUsableByMembers
            memberCount
            owner {
              avatar
              pseudo
            }
            type
          }
        }
        count
      }
      myCirclesSports: sports(first: $sportNb, filter: $filterSport, language: $queryLanguage){
        count
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
      ownersOfCirclesUserIsIn(last: $ownerOfCirclesNumber) @include(if: $queryPublicCircle) {
        count
        edges {
          node {
            id
            pseudo
          }
        }
      }
      superMe (superToken: $superToken) @include(if:$querySuperMe) {
        id,
        profileType
        userPreferences {
          areSubAccountsActivated
        }
      }     
      me {
        id
        profileType
        isSubAccount
        basicCircleSavedFiltersCreated
        defaultSavedCircleFilter {
          id
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
              }
            }
          }
          circleType
          memberTypes
          modes
          owners {
            id
            pseudo
          }
        }
        savedCircleFilters {
          id
          filterName
          canBeDeleted
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
              }
            }
          }
          circleType
          memberTypes
          modes
          owners {
            id
            pseudo
          }
        }
        ...AllCircleMembers_user
        ...InformationForms_user
        ...AddEditInformationForms_user
        ...FormDetails_user
        ...PaymentModelDetails_user
        ...PaymentModels_user
        ...AddEditPaymentModels_user
        ...TermOfUse_user
        subAccounts {
          id ,
          pseudo ,
          circles (last: 30) {
            edges {
              node {
                id
                name
                memberCount
              }
            }
          }
        }
        masterAccount {
          id
          subAccounts {
            id
            pseudo ,
            circles (last: 30) {
              edges {
                node {
                  id
                  name
                  memberCount
                }
              }
            }
          }
        }
      }
    }
  `,
},
  graphql`
  query MyCirclesRefetchQuery(
    $superToken: String
    $querySuperMe: Boolean!
    $circleId: ID
    $formId: ID
    $circlesSuperUserNumber: Int
    $circlesUserIsInNumber: Int
    $ownerOfCirclesNumber: Int
    $otherTeamsCirclesNumber: Int 
    $firstCircle: Int
    $sportNb: Int
    $filterSport: SportFilter
    $filterCircle: CirclesFilter
    $filterCircleSubAccount: CirclesFilter
    $queryMyCircle: Boolean!
    $queryCirclesImIn: Boolean!
    $querySubAccount: Boolean!
    $queryPublicCircle: Boolean!
    $queryOtherTeamsCircles: Boolean!
    $queryCircle: Boolean!,
    $queryLanguage: SupportedLanguage
  ) {
    viewer {
      ...MyCircles_viewer
        @arguments(
          superToken: $superToken
          querySuperMe: $querySuperMe
          circleId: $circleId
          formId: $formId
          circlesSuperUserNumber: $circlesSuperUserNumber
          circlesUserIsInNumber: $circlesUserIsInNumber
          ownerOfCirclesNumber: $ownerOfCirclesNumber
          otherTeamsCirclesNumber: $otherTeamsCirclesNumber
          firstCircle: $firstCircle
          sportNb: $sportNb
          filterSport: $filterSport
          filterCircle: $filterCircle
          filterCircleSubAccount: $filterCircleSubAccount
          queryMyCircle: $queryMyCircle
          queryCirclesImIn: $queryCirclesImIn
          querySubAccount: $querySubAccount
          queryPublicCircle: $queryPublicCircle
          queryOtherTeamsCircles: $queryOtherTeamsCircles
          queryLanguage: $queryLanguage,
          queryCircle: $queryCircle,
        )
    }
  }
  `,
);
