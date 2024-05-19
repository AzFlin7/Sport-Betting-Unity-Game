import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql, QueryRenderer } from 'react-relay/compat';
import debounce from 'lodash.debounce';
import Radium from 'radium';
import Helmet from 'react-helmet';
import MessengerCustomerChat from 'react-messenger-customer-chat';


import Header from '../common/Header/Header';
import Footer from '../common/Footer/Footer';
import Loading from '../common/Loading/Loading';
import HeaderImage from './HeaderAboutUsImage';
import localizations from '../Localizations';
import constants from '../../../constants.json';
import { colors } from './../../theme';
import environment from '../../createRelayEnvironment'

let styles;

const propTypes = {
  viewer: PropTypes.object.isRequired,
  relay: PropTypes.object.isRequired,
};

class AboutUs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sportFilter: '',
      locationFilter: '',
      loading: true,
      language: localizations.getLanguage(),
    };
    this._onDebounceSportFilterChange = debounce(
      this._onDebounceSportFilterChange,
      400,
    );
    this._onDebounceLocationFilterChange = debounce(
      this._onDebounceLocationFilterChange,
      400,
    );
  }
  componentDidMount = () => {
    setTimeout(() => this.setState({ loading: false }), 1000);
  };

  _onDebounceSportFilterChange = e => {
    this.setState({ sportFilter: e.target.value });
  };

  _onDebounceLocationFilterChange = e => {
    this.setState({ locationFilter: e.target.value });
  };

  _onSportFilterChange = e => {
    e.persist();
    this._onDebounceSportFilterChange(e);
  };

  _onLocationFilterChange = e => {
    e.persist();
    this._onDebounceLocationFilterChange(e);
  };

  _resetState = language => {
    this.setState({ language });
  };

  renderMetaTags = () => (
    <Helmet>
      <title>{localizations.meta_title}</title>
      <meta name="description" content={localizations.meta_description} />
      <meta property="fb:app_id" content="1759806787601548" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={localizations.meta_title} />
      <meta
        property="og:description"
        content={localizations.meta_description}
      />
      <meta property="og:url" content={constants.appUrl} />
      <meta property="og:image" content="/images/logo-blue@3x.png" />
      <meta property="og:image:width" content="225" />
      <meta property="og:image:height" content="270" />
    </Helmet>
  );

  render() {
    const { viewer } = this.props;
    return (
      <div style={styles.container}>
        {this.state.loading && <Loading />}
        {this.renderMetaTags()}
        <MessengerCustomerChat
          appId="307163170100651"
          pageId="1785262331755411"
        />
        <HeaderImage
          viewer={viewer}
          onSportFilterChange={this._onSportFilterChange}
          onLocationFilterChange={this._onLocationFilterChange}
          {...this.state}
        />
      </div>
    );
  }
}

styles = {
  youAreContainer: {
    backgroundColor: colors.blue,
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
  },
  youAreTitle: {
    color: colors.white,
    fontFamily: 'Lato',
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '5px auto 15px auto',
    '@media (maxWidth: 600px)': {
      fontSize: '12px',
    },
  },
  youAreLink: {
    color: colors.white,
    textDecoration: 'none',
    fontFamily: 'Lato',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    padding: '0px 15px',
    lineHeight: "32px",
    ':hover': {
      color: colors.lightGray,
    },
    '@media (maxWidth: 600px)': {
      fontSize: '14px',
    },
  },
  text: {
    fontFamily: 'Lato',
    fontSize: '24px',
    fontWeight: '500',
    textAlign: 'center',
    color: 'rgba(0,0,0,0.65)',
    marginBottom: 30,
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
      paddingBottom: 7,
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
};

AboutUs.propTypes = propTypes;
const AboutUsTemp = createFragmentContainer(Radium(AboutUs), {
  viewer: graphql`
    fragment AboutUs_viewer on Viewer {
      id
      me {
        id
      }
      ...HeaderAboutUsImage_viewer
    }
  `,
});

export default class extends Component {
  renderMetaTags = () => (
    <Helmet>
      <title>{localizations.meta_title}</title>
      <meta name="description" content={localizations.meta_description} />
      <meta property="fb:app_id" content="1759806787601548" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={localizations.meta_title} />
      <meta
        property="og:description"
        content={localizations.meta_description}
      />
      <meta property="og:url" content={constants.appUrl} />
      <meta property="og:image" content="/images/logo-blue@3x.png" />
      <meta property="og:image:width" content="225" />
      <meta property="og:image:height" content="270" />
    </Helmet>
  );

  render() {
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query AboutUsQuery {
            viewer {
              ...AboutUs_viewer
            }
          }
        `}
        render={({error, props}) => {
          if (props) {
            return <AboutUsTemp 
                viewer={props.viewer} 
                query={props} 
                {...this.props} 
              />;
          } else {
            return (
              <div>
                { this.renderMetaTags() }
                <Loading />
              </div>
            )
          }
        }}
      />
    )
  }
}