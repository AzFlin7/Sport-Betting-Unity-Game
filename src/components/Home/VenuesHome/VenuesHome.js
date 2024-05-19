import React, { Component } from 'react';
import {createFragmentContainer, graphql} from 'react-relay';
import debounce from 'lodash.debounce'
import Radium from 'radium'
import Helmet from 'react-helmet'
import { Link } from 'found'
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import { withAlert } from 'react-alert'

import * as types from "../../../actions/actionTypes";
import Header from '../../common/Header/Header.js'
import Footer from '../../common/Footer/Footer.js'
import Loading from '../../common/Loading/Loading.js'
import HeaderImage from '../common/HeaderImage';
import YouAreBloc from '../common/YouAreBloc';
import TagBox from './TagBox';
//import VideoArea from './VideoArea';
import localizations from '../../Localizations'
import constants from "../../../../constants";
import colors from './../../../theme/colors'
import Ref from './Ref'

let styles;

const RLink = Radium(Link);

class VenuesHome extends Component {
	constructor(props){
		super(props);
		this.state = {
			sportFilter: '',
			locationFilter: '',
      loading: true,
      language: localizations.getLanguage(),
		}
		this._onDebounceSportFilterChange = debounce(this._onDebounceSportFilterChange, 400);
		this._onDebounceLocationFilterChange = debounce(this._onDebounceLocationFilterChange, 400);
	}

	_onDebounceSportFilterChange = (e) => {
		this.setState({ sportFilter: e.target.value })
	}

	_onDebounceLocationFilterChange = (e) => {
		this.setState({ locationFilter: e.target.value })
	}

	_onSportFilterChange = (e) => {
    e.persist();
    this._onDebounceSportFilterChange(e);
  }

	_onLocationFilterChange = (e) => {
    e.persist();
    this._onDebounceLocationFilterChange(e);
  }

  _resetState = (language) => {
    this.setState({ language:language })
  }

  componentDidMount = () => {
    setTimeout(() => this.setState({ loading: false }), 1500)
  }

  renderMetaTags = () => {
    return <Helmet>
              <title>{localizations.meta_title_venues}</title>
              <meta name="description" content={localizations.meta_desc_venues}/>
              <meta property="fb:app_id" content="1759806787601548"/>
              <meta property="og:type" content="website"/>
              <meta property="og:title" content={localizations.meta_title_venues} />
              <meta property="og:description" content={localizations.meta_desc_venues}/>
              <meta property="og:url" content={constants.appUrl}/>
              <meta property="og:image" content={constants.appUrl+"/images/logo-blue@3x.png"} />
              <meta property="og:image:width" content="225"/>
              <meta property="og:image:height" content="270"/>
          </Helmet>
  }
  
  handleClick = () => {
    if (this.props.viewer.me && this.props.viewer.me.id) {
      this.props.alert.show(localizations.home_alreadyConnect, {
        timeout: 2000,
        type: 'error',
      });
    }
    else {
      this.props._updateRegisterFromAction('profileType/ORGANIZATION');
      this.props.router.push({
        pathname : '/contact-us'
      })
    }      
  };

  render() {
    const { viewer } = this.props

    return (
      <div style={styles.container}>
        {this.state.loading && <Loading />}
        {this.renderMetaTags()}
        <HeaderImage 
          viewer={viewer ? viewer : null}
          onSportFilterChange={this._onSportFilterChange}
          onLocationFilterChange={this._onLocationFilterChange}
          backgroundImage={'url("/images/background-venue.jpg")'}
          videoId={'oIXeyNbqx_w'}
          title={localizations.homeVenue_headerTextMaj}
          subTitle={localizations.homeVenue_headerTextMin}
          registerText={localizations.homeVenue_createAccount}
          onClick={this.handleClick}
          {...this.state}
        />

        <div style={styles.download_icons_footer}>
          <div style={{width:'50%'}}>
              <a target="_blank" href={constants.appLinkAppStore}>
                <img style={{width:"75%"}} src="/images/icon_appstore.png"/>
              </a>
            </div>
            <div style={{width:'50%'}}>
              <a target="_blank" href={constants.appLinkPlayStore}>
                <img style={{width:"75%"}} src="/images/icon_playstore.png"/>
              </a>
            </div>
        </div>

        <TagBox  {...this.state}/>
        <div style={styles.text}>
          {localizations.home_understandAs}
          <RLink to='/' style={{color: '#5e9fdf', textDecoration: 'none'}}>
            {localizations.home_understandAsIndividual + ', '}
          </RLink>
          <RLink to='/clubs' style={{color: "#504596", textDecoration: 'none'}}>
            {localizations.home_understandAsClub + ', '}
          </RLink>
          <RLink to='/companies' style={{color: "#e9591b", textDecoration: 'none'}}>
            {localizations.home_understandAsCompany + ' '}
          </RLink>
          <span>
            {localizations.login_or}
          </span>
          <RLink to='/universities' style={{color: "#ce2e83", textDecoration: 'none'}}> 
            {localizations.home_understandAsCity} 
          </RLink> 
        </div>

        <YouAreBloc
          color={'#2fac67'}
        />
      </div>

    );
  }
}

const _updateRegisterFromAction = (text) => ({
  type: types.UPDATE_REGISTER_FROM,
  text
})

const stateToProps = (state) => ({
  createProfileFrom: state.registerReducer.createProfileFrom,
})

const dispatchToProps = (dispatch) => ({
  _updateRegisterFromAction: bindActionCreators(_updateRegisterFromAction, dispatch),
})

const ReduxContainer = connect(stateToProps,dispatchToProps)(Radium(VenuesHome));

export default createFragmentContainer(withAlert(Radium(ReduxContainer)), {
  viewer: graphql`
    fragment VenuesHome_viewer on Viewer {
      me {
        id
      }
      ...HeaderImage_viewer,
    }
  `
});

styles = {
  text: {
    // width: '160px',
    fontFamily: 'Lato',
    fontSize: '24px',
    fontWeight: '500',
    textAlign: 'center',
    color: 'rgba(0,0,0,0.65)',
    marginTop: 30,
    marginBottom: 30,
    lineHeight: "32px",
    '@media (max-width: 600px)': {
      fontSize: '22px',
    },
  },
  headerDiscovery: {
    textAlign: 'center',
    fontFamily: 'lato',
    margin: '20px 0px',
    padding: 10,
    fontSize: 26,
    fontWeight: 'bold',
    '@media (max-width: 1280px)': {
      fontSize: 24,
    },
    '@media (max-width: 978px)': {
      fontSize: 22,
    },
    '@media (max-width: 768px)': {
      fontSize: 20,
    },
  },
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  download_icons:{
    display: 'none',
    '@media (max-width: 480px)': {
      display: 'block',
      textAlign: 'center',
      paddingTop: 7,
      paddingBottom: 7
    },
  },
  download_icons_text: {
    fontSize: 14,
    fontFamily: 'Lato',
  },
  download_icons_footer: {
    display: 'flex',
    justifyContent:'center',
    flexDirection:'row',
    maxWidth: 500,
    margin: '-75px auto 14px auto',
    textAlign: 'center',
    width: '100%',
    zIndex: 100,
  },
  button: {
    height: '55px',
    borderRadius: '100px',
    backgroundColor: colors.blue,
    margin: '40px auto',
    maxWidth: '360px',
    paddingRight: 40,
    paddingLeft: 40,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    textDecoration: 'none',
    fontSize: 25,
    fontFamily: 'Lato',
    color: '#fff',
    cursor: 'pointer',
    '@media (max-width: 850px)': {
      borderRadius: '100px 100px 100px 100px',
    },
  },
}
