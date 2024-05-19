import React, {Component} from 'react';
import { createRefetchContainer, graphql, QueryRenderer } from 'react-relay';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import moment from 'moment';
import { Link, withRouter } from 'found';
import Radium from 'radium';

import environment from 'sportunity/src/createRelayEnvironment';
import PureComponent, { forceUpdate } from '../../common/PureComponent';
import { appUrl } from '../../../../constants.json';
import * as types from '../../../actions/actionTypes';
import { colors } from '../../../theme';
import localizations from '../../Localizations';

import UpdateLanguageMutation from './UpdateLanguageMutation';
import UpdateCountryMutation from './UpdateCountryMutation';

let styles;

const socialArray = [
  {
    href: 'https://www.facebook.com/sportunitysarl/?ref:bookmarks',
    icon: 'fa fa-facebook',
  },
  {
    href: 'https://twitter.com/Sportunitysarl',
    icon: 'fa fa-twitter',
  },
  {
    href: 'https://www.linkedin.com/company/sportunity-sarl?trk:company_logo',
    icon: 'fa fa-linkedin',
  },
  {
    href: 'https://www.youtube.com/channel/UCUxriN0QQpU6Rx3n0F6Ybaw',
    icon: 'fa fa-youtube',
  },
];

class Footer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      url: '',
    };
  }

  componentWillMount() {
    super.componentWillMount();
    if (this.props.user && this.props.user.appLanguage) {
      this.props._setLanguageAction(this.props.user.appLanguage.toLowerCase())
    
      if (this.props.user.appLanguage.toLowerCase() !== localizations.getLanguage()) {
        if (this.props.user.appLanguage.toLowerCase() === 'fr')
          localizations.setLanguage(this.props.user.appLanguage.toLowerCase());
        else 
          localizations.setLanguage('en') 
      }

      if (this.props.user.appLanguage.toLowerCase() !== moment.locale())
        moment.locale(this.props.user.appLanguage.toLowerCase());
    }

    if (
      !this.props.user &&
      localizations.getLanguage().toLowerCase() !==
        moment.locale().toLowerCase()
    )
      moment.locale(localizations.getLanguage().toLowerCase());
  }

  componentDidMount() {
    fetch('https://ipapi.co/json')
      .then(res => res.json())
      .then(json => {
        if (this.props.user && this.props.user.appCountry) {
          this.props.updateUserCountry(this.props.user.appCountry);
          if (this.props.user.appCurrency)
            this.props.updateUserCurrency(this.props.user.appCurrency);
        } else if (!this.props.user) {
          this.props.updateUserCountry(json.country);
          this.props.updateUserCurrency(this.getCountryCurrency(json.country));
        } else if (!this.props.user.appCountry) {
          this.props.updateUserCountry(json.country);
          this.props.updateUserCurrency(this.getCountryCurrency(json.country));
          this.changeUserCountry(
            json.country,
            this.getCountryCurrency(json.country),
          );
        }
        this.props.updateUserCity(json.city);
        this.props.updateUserLocation(
          new google.maps.LatLng(json.latitude, json.longitude),
        );
      });
    const path = this.props.location.pathname;
    if (path.indexOf('/s/') >= 0) {
      const hash = path.split('/');
      this.props.relay.refetch(fragmentVariables => ({
        ...fragmentVariables, 
        queryShortUrl: false,
        queryLongUrl: true,
        shortUrl: hash[2],
      }),
      null,
      () => {
        setTimeout(() => {
          if (this.props.viewer.url) {
            this.props.router.push({
              pathname: this.props.viewer.url,
            });
          } else {
            this.props.router.push({
              pathname: '/',
            });
          }
        }, 100);
        }
      );
      
    }
  }

  getCountryCurrency = countryCode => {
    if (countryCode === 'CH') return 'CHF';
    return 'EUR';
  };

  _changeLanguage = e => {
    localizations.setLanguage(e.target.value);
    moment.locale(e.target.value);
    forceUpdate({ lang: e.target.value });
    this.setState({});
    this.props.onUpdateLanguage(e.target.value);
    this.props._setLanguageAction(e.target.value)
    if (this.props.viewer.me) {
      UpdateLanguageMutation.commit({
          viewer: this.props.viewer,
          userIDVar: this.props.viewer.me.id,
          appLanguageVar: localizations.getLanguage().toUpperCase(),
        },
        {
          onFailure: error => {
            const errors = JSON.parse(error.getError().source);
            console.log(errors);
          },
          onSuccess: response => {
            console.log('language changed');
          },
        },
      );
    }
  };

  changeUserCountry = (e, currency) => {

    if (this.props.viewer.me) {
      UpdateCountryMutation.commit({
          viewer: this.props.viewer,
          userIDVar: this.props.viewer.me.id,
          countryVar: e,
          currencyVar: currency,
        },
        {
          onFailure: error => {
            const errors = JSON.parse(error.getError().source);
            console.log(errors);
          },
          onSuccess: response => {},
        },
      );
    }
  };

  shareUrl = () => {
    if (this.state.url) {
      this.synchronizeLink.select();
      document.execCommand('copy');
      this.setState({ url: '' });
    } else {
      let path = this.props.location.pathname;

      if (path === '/find-sportunity' || path === '/find-sportunity/') {
        path =
          '/find-sportunity/lat=&lng=/range=/sport=/fromDate=&toDate=/free=';

        const splitted = path.split('/');

        if (this.props.locationLat && this.props.locationLng) {
          const index = splitted.findIndex(
            split => split.indexOf('lat=') >= 0,
          );
          if (index >= 0)
            splitted[index] = `lat=${this.props.locationLat}&lng=${
              this.props.locationLng
            }`;

          if (this.props.distanceRange || this.props.distanceRange === 0) {
            const index = splitted.findIndex(
              split => split.indexOf('range=') >= 0,
            );
            if (index >= 0)
              splitted[index] = `range=${this.props.distanceRange}`;
          } else {
            const index = splitted.findIndex(
              split => split.indexOf('range=') >= 0,
            );
            if (index >= 0) splitted[index] = 'range=';
          }
        } else {
          let index = splitted.findIndex(split => split.indexOf('lat=') >= 0);
          if (index >= 0) splitted[index] = 'lat=&lng=';

          index = splitted.findIndex(split => split.indexOf('range=') >= 0);
          if (index >= 0) splitted[index] = 'range=';
        }

        if (this.props.sportId) {
          const index = splitted.findIndex(
            split => split.indexOf('sport=') >= 0,
          );
          if (index >= 0) splitted[index] = `sport=${this.props.sportId}`;
        } else {
          const index = splitted.findIndex(
            split => split.indexOf('sport=') >= 0,
          );
          if (index >= 0) splitted[index] = 'sport=';
        }

        if (this.props.dateFrom && this.props.dateTo) {
          const index = splitted.findIndex(
            split => split.indexOf('fromDate=') >= 0,
          );
          if (index >= 0)
            splitted[index] = `fromDate=${new Date(
              this.props.dateFrom,
            ).valueOf()}&toDate=${new Date(this.props.dateTo).valueOf()}`;
        } else {
          const index = splitted.findIndex(
            split => split.indexOf('fromDate=') >= 0,
          );
          if (index >= 0) splitted[index] = 'fromDate=&toDate=';
        }

        if (typeof this.props.isFreeOnly !== 'undefined') {
          const index = splitted.findIndex(
            split => split.indexOf('free=') >= 0,
          );
          if (index >= 0)
            splitted[index] = this.props.isFreeOnly ? 'free=true' : 'free=';
        } else {
          const index = splitted.findIndex(
            split => split.indexOf('free=') >= 0,
          );
          if (index >= 0) splitted[index] = 'free=';
        }
        path = splitted.join('/');
      }
      if (path) {
        this.props.relay.refetch(fragmentVariables => ({
          ...fragmentVariables,
          queryLongUrl: false,
          queryShortUrl: true,
          url: path,
        }),
        null,
        () => {
          setTimeout(() => {
            this.setState({
              url: `${appUrl}/s/${this.props.viewer.createShortUrl}`,
            });
          }, 100);
        }
        );
      }
    }
  };

  render() {
    return (
      <div className={"footer_main"} style={styles.container}>
        <div className={"footer_inner1"} style={styles.topLine}>
          <div className={"footer_logo"} style={styles.topLeft}>
            <img src="/images/white-logo.png" width="80" height="80" alt="" />
            <span
              style={{ color: colors.black, cursor: 'pointer', marginTop: 10 }}
              onClick={this.shareUrl}
            >
              {localizations.shareThisUrl}
              <input 
                ref={(ref) => this.synchronizeLink = ref}
                style={{opacity: 0, position: "absolute", width: 8}} 
                value={this.state.url} 
                readOnly
                />
            </span>
          </div>
          <div className={"footer_social"} style={styles.topCenter}>
            <div>{localizations.footer_followUs}</div>
            <div style={styles.iconsLine}>
              {socialArray.map((item, index) => (
                <a
                  key={`socialIcon${index}`}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.icon}
                >
                  <i className={item.icon} />
                </a>
              ))}
            </div>
          </div>
          <div className={"footer_langug"} style={styles.topRight}>
            <div style={{ ...styles.row, marginTop: 15 }}>
              {localizations.footer_language}
              &nbsp;&nbsp;&nbsp;&nbsp;
              <select
                onChange={this._changeLanguage}
                value={localizations.getLanguage()}
                style={styles.input}
              >
                <option value="en">english</option>
                <option value="fr">français</option>
              </select>
            </div>
            <div style={styles.row}>
              <a style={styles.mailLink} href="mailto:info@sportunity.ch">
                info@sportunity.ch
              </a>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <i className="fa fa-envelope" />
            </div>
            <div style={styles.row}>
              <span>{localizations.contactUs_phoneNumber}</span>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <img
                src="/images/AboutUs/swiss.png"
                style={{ width: '1em' }}
                alt=""
              />
            </div>
            <div style={styles.row}>
              <span>{localizations.contactUs_phoneNumber_FR}</span>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <img
                src="/images/AboutUs/france.png"
                style={{ width: '1em' }}
                alt=""
              />
            </div>
          </div>
        </div>
        <div className={"footer_bottom"} style={styles.bottomLine}>
          <Link to="/about-us" style={styles.link}>
            {localizations.footer_aboutUs}
          </Link>
          <Link to="/privacy" style={styles.link}>
            {localizations.footer_privacy}
          </Link>
          <Link to="/term" style={styles.link}>
            {localizations.footer_terms}
          </Link>
          <Link to="/faq/tutorial" style={styles.link}>
            {localizations.footer_tutorials}
          </Link>
          <Link to="/blog" style={styles.link}>
            {localizations.blog_link}
          </Link>
        </div>
      </div>
    );
  }
}

styles = {
  container: {
    display: 'flex',
    color: colors.white,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingRight: 20,
    flexDirection: 'column',
    fontFamily: 'Lato',
    fontSize: 16,
	  '@media (max-width: 767px)': {
      padding: '0',
    },
    '@media (max-width: 600px)': {
      paddingLeft: 0,
    },
  },
  topLine: {
    display: 'flex',
    flexDirection: 'row',
    width: '1000px',
    maxWidth: '100%',
    padding: '0 40px',
    marginTop: 40,
    marginBottom: 40,
    '@media (max-width: 768px)': {
      width: '100%',
      padding: '0 10px',
      flexDirection: 'column',
      marginBottom: 5,
    },
  },
  topLeft: {
    display: 'flex',
    flex: 4,
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    '@media (max-width: 768px)': {
      marginBottom: 25,
      flex: 1,
    },
	'@media (max-width: 640px)': {
     paddingBottom: 28,
    },
  },
  topCenter: {
    display: 'flex',
    flex: 3,
    justifyContent: 'flex-start',
    fontSize: 16,
    flexDirection: 'column',
    width: '100%',
    textAlign: 'center',
    top: 0,
    '@media (max-width: 768px)': {
      marginBottom: 25,
    },
  },
  topRight: {
    display: 'flex',
    flex: 4,
    justifyContent: 'flex-start',
    flexDirection: 'column',
    '@media (max-width: 600px)': {
      flexDirection: 'column',
      marginBottom: 10,
    },
  },
  iconsLine: {
    color: colors.white,

    marginTop: 15,
    textDecortation: 'none',
  },
  icon: {
    margin: 10,
    color: colors.white,
    fontSize: 30,
  },
  row: {
    width: '100%',
    textAlign: 'right',
    marginBottom: 7,
    marginRight: 15,
    '@media (max-width: 768px)': {
      textAlign: 'center',
    },
  },
  bottomLine: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    padding: '0 40px',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 40,
    '@media (max-width: 768px)': {
      flexDirection: 'column',
      alignItems: 'center'
    },
  },
  link: {
    color: colors.white,
    marginLeft: 13,
    marginRight: 13,
    fontSize: 16,
    textDecoration: 'none',
    marginBottom: 10,
  },
  groupLink: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: 13,
    marginTop: 5,
    marginBottom: 5,
    maxWidth: 260,
    '@media (max-width: 650px)': {
      maxWidth: 'none',
    },
  },
  subLink: {
    color: colors.gray,
    lineHeight: '18px',
    fontSize: 12,
    textDecoration: 'none',
  },
  mailLink: {
    color: colors.white,
    fontSize: 16,
    textDecoration: 'none',
  },
};

const updateUserCountry = value => ({
  type: types.GLOBAL_SET_USER_COUNTRY,
  value,
});
const updateUserCurrency = value => ({
  type: types.GLOBAL_SET_USER_CURRENCY,
  value,
});
const updateUserLocation = value => ({
  type: types.GLOBAL_SET_USER_LOCATION,
  value,
});
const updateUserCity = value => ({
  type: types.GLOBAL_SET_USER_CITY,
  value,
});
const _setLanguageAction = (language) => ({
  type: types.GLOBAL_SET_LANGUAGE,
  language: language,
})

const dispatchToProps = dispatch => ({
  updateUserCountry: bindActionCreators(updateUserCountry, dispatch),
  updateUserCurrency: bindActionCreators(updateUserCurrency, dispatch),
  updateUserLocation: bindActionCreators(updateUserLocation, dispatch),
  updateUserCity: bindActionCreators(updateUserCity, dispatch),
  _setLanguageAction: bindActionCreators(_setLanguageAction, dispatch),
});

const ReduxContainer = connect(
  ({
    found: { resolvedMatch },
    globalReducer, 
    sportunitySearchReducer ,
  }) => ({
    location: resolvedMatch.location,
    params: resolvedMatch.params,
    language: globalReducer.language,
    userCountry: globalReducer.userCountry,
    userCurrency: globalReducer.userCurrency,
    userLocation: globalReducer.userLocation,
    userCity: globalReducer.userCity,
    sportId: sportunitySearchReducer.sportId,
    locationLat: sportunitySearchReducer.locationLat,
    locationLng: sportunitySearchReducer.locationLng,
    distanceRange: sportunitySearchReducer.distanceRange,
    isFreeOnly: sportunitySearchReducer.isFreeOnly,
    dateFrom: sportunitySearchReducer.dateFrom,
    dateTo: sportunitySearchReducer.dateTo,
  }),
  ...dispatchToProps,
)(Radium(Footer));

const FooterTemp = createRefetchContainer(withRouter(Radium(ReduxContainer)), {
  viewer: graphql`
    fragment Footer_viewer on Viewer @argumentDefinitions (
      url: {type: "String!", defaultValue: "_"},
      queryShortUrl: {type: "Boolean!", defaultValue: false},
      queryLongUrl: {type: "Boolean!", defaultValue: false},
    ) {
      id
      me {
        id
      }
      createShortUrl(url: $url) @include(if: $queryShortUrl)
      url(shortUrl: $shortUrl) @include(if: $queryLongUrl)
    }
  `,
  user: graphql`
    fragment Footer_user on User {
      id
      appLanguage
      appCountry
      appCurrency
    }
  `,
}, graphql`
  query FooterRefetchQuery (
    $url: String!,
    $queryShortUrl: Boolean!,
    $queryLongUrl: Boolean!
  ) {
    viewer {
      ...Footer_viewer @arguments(url: $url, queryShortUrl: $queryShortUrl, queryLongUrl: $queryLongUrl)
    }
  }
`);


export default class extends Component {
  render() {
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query FooterQuery {
            viewer {
              ...Footer_viewer
              me {
                id
                ...Footer_user
              }
            }
          }
        `}
        variables={{}}
        render={({error, props}) => {
          if (props) {
            return <FooterTemp query={props} viewer={props.viewer} user={props.viewer.me} {...this.props}/>;
          } else {
            return (
              <div style={{...styles.container}}></div>
            )
          }
        }}
      />
    )
  }
}