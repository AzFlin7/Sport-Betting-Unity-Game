import React, { Component } from 'react';
import {
    createFragmentContainer,
    graphql,
    QueryRenderer
} from 'react-relay';
import debounce from 'lodash.debounce'
import Radium from 'radium'
import Helmet from 'react-helmet'
import { Link } from 'found'
import Scroll from 'react-scroll'
import { withAlert } from 'react-alert'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import get from 'lodash/get';
import * as types from '../../actions/actionTypes';

import environment from 'sportunity/src/createRelayEnvironment';
import Header from '../common/Header/Header.js'
import Footer from '../common/Footer/Footer.js'
import Loading from '../common/Loading/Loading.js'

import YouAreBloc from './common/YouAreBloc';
import HeaderImage from './common/HeaderImage'
import TagBox from './TagBox';
import localizations from '../Localizations'
import constants from "../../../constants";
import colors from './../../theme/colors'
import Features from './Features'
import Slider from './Slider'
import Ref from './Ref'

let Element = Scroll.Element;
const RLink = Radium(Link);

let styles;

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sportFilter: '',
            locationFilter: '',
            loading: true,
            language: localizations.getLanguage(),
            displayStepperModal: false,
            isWebsiteReadyToLoad: false,
        }
        this._onDebounceSportFilterChange = debounce(this._onDebounceSportFilterChange, 400);
        this._onDebounceLocationFilterChange = debounce(this._onDebounceLocationFilterChange, 400);
    }

    componentWillMount() {
        const { viewer, location, isWebSiteOpened, router } = this.props;
        const isLoggedIn = get(viewer, 'me.id');
        if (
            location.pathname === '/' &&
            isLoggedIn &&
            isWebSiteOpened === false
          ) {
            router.push(`/my-events`);
        }

        if (!isLoggedIn && isWebSiteOpened === false) {
            setTimeout(() => {
                this.props._updateOpenedWebSite(true);
            }, 500);
        }
    }

    componentWillUnmount() {
        if (this.props.isWebSiteOpened === false) {
            setTimeout(() => {
                this.props._updateOpenedWebSite(true);
            }, 500);
        }
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
        this.setState({ language: language })
    }

    componentDidMount = () => {
        setTimeout(() => this.setState({ loading: false }), 500)

    }

    renderMetaTags = () => {
        return (
            <Helmet>
                <title> 
                    {localizations.meta_title} 
                </title> 
                <meta 
                    name="description"
                    content={localizations.meta_description}
                />
                <meta 
                    name="keywords"
                    content={localizations.meta_keywords}
                />
                <meta 
                    property="fb:app_id"
                    content="1759806787601548"
                />
                <meta 
                    property="og:type"
                    content="website" 
                />
                <meta 
                    property="og:title"
                    content={localizations.meta_title}
                /> 
                <meta 
                    property="og:description"
                    content={localizations.meta_description}
                /> 
                <meta 
                    property="og:url"
                    content={constants.appUrl}
                />
                <meta 
                    property="og:image"
                    content={constants.appUrl+"/images/logo-blue@3x.png"}
                /> 
                <meta 
                    property="og:image:width"
                    content="225" 
                />
                <meta 
                    property="og:image:height"
                    content="270" 
                />
            </Helmet>
        )
    }

    handleClick = () => {
        if (this.props.viewer.me && this.props.viewer.me.id) {
            this.props.alert.show(localizations.home_alreadyConnect, {
                timeout: 2000,
                type: 'error',
            });
        } else {
            setTimeout(() => {
                this.props.router.push({
                    pathname: '/register'
                })
            }, 200)
        }
    };

    render() {
        const { viewer, isWebSiteOpened } = this.props

        if (isWebSiteOpened !== true) {
            return <Loading />;
        }

        return ( 
            <div style={styles.container}>
                { /* {this.state.loading && <Loading />} */ }
                { this.renderMetaTags() }
                <HeaderImage 
                    viewer={viewer ? viewer : null}
                    onSportFilterChange={this._onSportFilterChange}
                    onLocationFilterChange={this._onLocationFilterChange}
                    router={this.props.router}
                    backgroundImage={'url("/images/background-homepage.jpg")'}
                    videoId={'zrR_fptueYU'}
                    title={localizations.home_headerTextMaj}
                    subTitle={localizations.home_headerTextMin}
                    registerText={localizations.home_createAccount}
                    onClick={this.handleClick} 
                    {...this.state}
                />
                <div style={styles.download_icons_footer}>
                    <div style={{width: '50%'}}>
                        <a target = "_blank" href={constants.appLinkAppStore}>
                            <img style={{width: "75%"}} src="/images/icon_appstore.png" />
                        </a>
                    </div> 
                    <div style={{width: '50%'}}>
                        <a target="_blank" href={constants.appLinkPlayStore}>
                            <img style={{width: "75%"}} src="/images/icon_playstore.png" />
                        </a> 
                    </div> 
                </div>

                <TagBox 
                    {...this.state }
                    router={this.props.router} 
                > 
                    {/* <div style={styles.headerDiscovery}>
                            {localizations.home_category_title}
                        </div> */} 
                </TagBox>

                <Element name="individual" className = "element">
                    <Slider 
                        {...this.state } 
                        router={this.props.router}
                    /> 
                </Element>

                <div style={styles.headerDiscovery}> 
                    {localizations.home_features_title} 
                </div>

                <Features 
                    {...this.state }
                    router={this.props.router }
                />

                <div style={styles.text}> 
                    {localizations.home_understandAs} 
                    <RLink to='/clubs' style={{color: '#514695', textDecoration: 'none'}}> 
                        {localizations.home_understandAsClub + ', '} 
                    </RLink>
                    <RLink to='/companies' style = {{color: "#ed5816", textDecoration: 'none'}}> 
                        {localizations.home_understandAsCompany + ', '} 
                    </RLink> 
                    <RLink to='/venues' style={{color: "#2aad6c", textDecoration: 'none'}}> 
                        {localizations.home_understandAsInfrastructure + ' '} 
                    </RLink> 
                    <span> 
                        {localizations.login_or} 
                    </span> 
                    <RLink to='/universities' style={{color: "#ce2e83", textDecoration: 'none'}}> 
                        {localizations.home_understandAsCity} 
                    </RLink> 
                </div>

                <Ref 
                    {...this.state }
                />

                <YouAreBloc
                    color={colors.blue}
                />
            </div>
        );
    }
}



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
        '@media (maxWidth: 600px)': {
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
        color: colors.darkGray,
        '@media (maxWidth: 1280px)': {
            fontSize: 24,
        },
        '@media (maxWidth: 978px)': {
            fontSize: 22,
        },
        '@media (maxWidth: 768px)': {
            fontSize: 20,
        },
    },
    container: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    download_icons: {
        display: 'none',
        '@media (maxWidth: 480px)': {
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
        justifyContent: 'center',
        flexDirection: 'row',
        maxWidth: 500,
        margin: '-75px auto 20px auto',
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
        '@media (maxWidth: 850px)': {
            borderRadius: '100px 100px 100px 100px',
        },
    },
}

const updateOpenedWebSite = value => ({
    type: types.GLOBAL_SET_SITE_OPENED,
    value,
});

const stateToProps = ({ globalReducer }) => ({
    isWebSiteOpened: globalReducer.isWebSiteOpened,
});

const dispatchToProps = dispatch => ({
    _updateOpenedWebSite: bindActionCreators(updateOpenedWebSite, dispatch),
});

const ReduxContainer = connect(stateToProps, dispatchToProps)(Radium(Home));

const HomeTemp = createFragmentContainer(withAlert(Radium(ReduxContainer)), {
    viewer: graphql `
    fragment Home_viewer on Viewer {
      me {
        id        
      }      
      ...HeaderImage_viewer,
    }
  `
});

export default class extends Component {
    renderMetaTags = () => {
        return (
            <Helmet>
                <title> 
                    {localizations.meta_title} 
                </title> 
                <meta 
                    name="description"
                    content={localizations.meta_description}
                />
                <meta 
                    name="keywords"
                    content={localizations.meta_keywords}
                />
                <meta 
                    property="fb:app_id"
                    content="1759806787601548"
                />
                <meta 
                    property="og:type"
                    content="website" 
                />
                <meta 
                    property="og:title"
                    content={localizations.meta_title}
                /> 
                <meta 
                    property="og:description"
                    content={localizations.meta_description}
                /> 
                <meta 
                    property="og:url"
                    content={constants.appUrl}
                />
                <meta 
                    property="og:image"
                    content={constants.appUrl+"/images/logo-blue@3x.png"}
                /> 
                <meta 
                    property="og:image:width"
                    content="225" 
                />
                <meta 
                    property="og:image:height"
                    content="270" 
                />
            </Helmet>
        )
    }

    render() {
        return ( 
            <QueryRenderer 
                environment = { environment }
                query = { graphql `
                    query HomeQuery {
                        viewer {
                            ...Home_viewer
                        }
                    }
                ` }
                variables = {
                    {}
                }
                render = {
                    ({ error, props }) => {
                        if (props) {
                            return <HomeTemp 
                                query={props}
                                viewer={props.viewer} {...this.props}
                            />;
                        } else {
                            return ( 
                                <div>
                                    { this.renderMetaTags() }
                                    <Loading />
                                </div>
                            )
                        }
                    }
                }
            />
        )
    }
}