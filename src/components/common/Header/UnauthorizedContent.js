import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'found';
import Radium from 'radium';
import {
  Select,
  MenuItem,
  Input,
  FormControl,
  InputBase,
} from '@material-ui/core';
var Style = Radium.Style;
const RadiumLink = Radium(Link);
import { withStyles } from '@material-ui/core/styles';

import { appStyles, colors, metrics, fonts } from '../../../theme';
import localizations from '../../Localizations';
import { Search } from '../Search/Search';

let styles;
const propTypes = {
  location: PropTypes.object.isRequired,
};

const BootstrapInput = withStyles(theme => ({
  input: {
    paddingBottom: 3,
    position: 'relative',
    borderBottom: '1px solid ' + colors.white,
    width: 'auto',
    transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
    fontFamily: 'Lato',
    color: colors.white,
  },
}))(InputBase);

const muiStyle = theme => ({
  icon: {
    color: colors.white,
  },
});

class UnauthorizedContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isMobileMenuOpen: false,
      width: '851',
      version: 1
    };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  componentDidMount() {
    this.updateWindowDimensions();
    if (typeof window !== 'undefined')
      window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentWillReceiveProps = nextProps => {
    if (this.state.width !== window.innerWidth) this.updateWindowDimensions();
  };

  componentWillUnmount() {
    if (typeof window !== 'undefined')
      window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth });
  }

  _toggleMobileMenu = () => {
    this.setState({ isMobileMenuOpen: !this.state.isMobileMenuOpen });
  };

  redirectProfileType = e => {
    if (e.target.value === 'INDIVIDUAL') {
      this.props.router.push({ pathname: '/' });
    } else if (e.target.value === 'CLUBS') {
      this.props.router.push({ pathname: '/clubs' });
    } else if (e.target.value === 'COMPANIES') {
      this.props.router.push({ pathname: '/companies' });
    } else if (e.target.value === 'VENUES') {
      this.props.router.push({ pathname: '/venues' });
    }
  };

  _getActivePage = () => {
    const { location } = this.props;
    if (location.pathname.indexOf('circle') >= 0) return 'circles';
    if (location.pathname.indexOf('find') >= 0) return 'find';
    if (location.pathname.indexOf('new-sportunity') >= 0)
      return 'new-sportunity';
    if (location.pathname.indexOf('event') >= 0) return 'events';
    if (location.pathname.indexOf('blog') >= 0) return 'blog';
    if (location.pathname.indexOf('venues') >= 0) return 'venues';
    if (location.pathname.indexOf('venue') >= 0) return 'venue';
    if (location.pathname.indexOf('clubs') >= 0) return 'clubs';
    if (location.pathname.indexOf('companies') >= 0) return 'companies';
    if (location.pathname.indexOf('universities') >= 0) return 'universities';
    if (location.pathname.indexOf('features') >= 0) return 'features'
    else return 'home';
  };

  render() {
    const {version} = this.state ;

    const leftStyle =
      this.state.width > 1000
        ? styles.left
        : this.state.isMobileMenuOpen
        ? styles.left
        : styles.leftHidden;

    const activePage = this._getActivePage();
    const profileType = activePage
      ? activePage === 'clubs'
        ? 'CLUBS'
        : activePage === 'companies'
        ? 'COMPANIES'
        : activePage === 'venues'
        ? 'VENUES'
        : 'INDIVIDUAL'
      : 'INDIVIDUAL';

    return (
      <div style={styles.container}>
        <Style scopeSelector=".header_link:hover" rules={{
            backgroundColor: '#72afec',
          }}
        />
        {version === 1 && (this.state.width > 1000 || this.state.isMobileMenuOpen) && (
          <div style={{ ...leftStyle, height: 62 }}>
            <Link className="header_link" style={activePage === 'home' ? styles.activeLink : styles.link} to="/">
              {localizations.home_particuliers_title}
            </Link>
            <Link className="header_link" style={activePage === 'clubs' ? styles.activeLink : styles.link} to="/clubs">
              {localizations.home_club_title}
            </Link>
            <Link className="header_link" style={activePage === 'companies' ? styles.activeLink : styles.link} to="/companies">
              {localizations.home_enterprise_title}
            </Link>
            <Link className="header_link" style={activePage === 'venues' ? styles.activeLink : styles.link} to="/venues">
              {localizations.home_venues_title}
            </Link>
            <Link className="header_link" style={activePage === 'universities' ? styles.activeLink : styles.link} to="/universities">
              {localizations.home_cities_title}
            </Link>
            <Link className="header_link" style={activePage === 'features' ? styles.activeLink : styles.link} to="/features">
              {localizations.header_offers}
            </Link>
          </div>
        )}
        {version === 2 && (this.state.width > 1000 || this.state.isMobileMenuOpen) && (
          <div style={{ ...leftStyle }}>
            <Link style={activePage === 'events' ? styles.activeLink : styles.link} to="/my-events">
              {localizations.header_mySportunities}
            </Link>
            <Link style={activePage === 'new-sportunity' ? styles.activeLink : styles.link} to="/new-sportunity">
              {localizations.header_organizeSportunities}
            </Link>
            <Link style={activePage === 'circles' ? styles.activeLink : styles.link} to="/my-circles">
              {localizations.header_find_circles}
            </Link>
            <Link style={activePage === 'features' ? styles.activeLink : styles.link} to="/features">
              {localizations.header_offers}
            </Link>
          </div>
        )}
        {version === 2 && 
          <div style={{width: '100%', maxWidth: 400, paddingLeft: 20, paddingRight: 20}}>
            <Search viewer={this.props.viewer} />
          </div>
        }

        <div style={{ display: 'flex', width: 300, justifyContent: 'flex-end', '@media (max-width: 1100px)': {width: 'auto'}, '@media (max-width: 1000px)': {flex:1}}}>
          {this.state.width > 1000 && version === 2 && (
            <FormControl style={styles.selectLabel}>
              <Select
                input={<BootstrapInput />}
                value={localizations.home_header_button}
                onChange={this.redirectProfileType}
                classes={{ icon: this.props.classes.icon }}
              >
                <MenuItem value={localizations.home_header_button}>
                  {localizations.home_header_button}
                </MenuItem>
                {activePage !== 'home' && (
                  <MenuItem value="INDIVIDUAL">
                    {localizations.home_particuliers}
                  </MenuItem>
                )}
                {activePage !== 'clubs' && (
                  <MenuItem value="CLUBS">{localizations.home_club}</MenuItem>
                )}
                {activePage !== 'companies' && (
                  <MenuItem value="COMPANIES">
                    {localizations.home_enterprise}
                  </MenuItem>
                )}
                {activePage !== 'venues' && (
                  <MenuItem value="VENUES">
                    {localizations.home_facility}
                  </MenuItem>
                )}
                {activePage !== 'universities' && (
                  <MenuItem value="UNIVERSITIES">
                    {localizations.home_cities_title}
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          )}
          <div style={styles.right}>
            <div style={styles.register}>
              <Link className="header_link" style={{...styles.link, padding: '0px 20px'}} to="/register">
                {localizations.header_register}
              </Link>
            </div>
            <div style={styles.login}>
              <Link className="header_link" style={{...styles.link, padding: '0px 20px'}} to="/login">
                {localizations.header_login}
              </Link>
            </div>
          </div>
          <button style={styles.mobileMenu} onClick={this._toggleMobileMenu}>
            <i className="fa fa-bars fa-2x" />
          </button>
        </div>
      </div>
    );
  }
}

styles = {
  container: {
    whiteSpace: 'nowrap',
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontFamily: 'Lato',
    '@media (min-width: 321px) and (max-width: 480px)': {
      textAlign: 'center',
    },
    '@media (max-width: 320px)': {
      display: 'flex',
    },
  },
  register: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.white,
    marginLeft: metrics.margin.small,
    borderLeft: metrics.border.tiny,
    borderLeftStyle: 'solid',
    borderColor: colors.white,
    height: 62,
    '@media (max-width: 780px)': {
      padding: '0px 5px',
    },
    '@media (max-width: 480px)': {
      marginLeft: 0,
      border: 'none',
      lineHeight: '20px',
      flex: 1,
    },
    '@media (max-width: 320px)': {
      height: 55,
    },
  },
  login: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.white,
    marginLeft: 0,
    borderLeft: metrics.border.tiny,
    borderLeftStyle: 'solid',
    borderColor: colors.white,
    height: 62,
    '@media (max-width: 480px)': {
      border: 'none',
      lineHeight: '20px',
      flex: 1,
    },
    '@media (max-width: 320px)': {
      height: 55,
    },
  },
  clubs: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 19,
    marginRight: 75,
    '@media (max-width: 730px)': {
      marginRight: 0,
    },
    '@media (max-width: 500px)': {
      fontSize: 16,
    },
    '@media (max-width: 480px)': {
      justifyContent: 'center',
      flex: 1,
    },
  },
  link: {
    color: colors.white,
    textDecoration: 'none',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    justifyContent: 'center',
    padding: 10,
    height: '100%',
    transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
    '@media (max-width: 1000px)': {
      fontSize: 15,
    },
  },
  activeLink: {
    color: colors.white,
    textDecoration: 'none',
    flex: 1,
    textAlign: 'center',
    backgroundColor: '#85C2FF',
    padding: 10,
    //borderRadius: 5,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
    '@media (max-width: 1000px)': {
      fontSize: 15,
    },
  },
  header_button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    border: '1px solid #FFFFFF',
    color: colors.blue,
    borderRadius: '3px',
    fontSize: 14,
    fontWeight: 'bold',
    textDecoration: 'none',
    backgroundColor: colors.white,
    width: 140,
    height: 34,
    marginRight: 20,
    cursor: 'pointer',
    '@media (max-width: 730px)': {
      width: 120,
    },
    '@media (max-width: 480px)': {
      width: 100,
      fontSize: 12,
      display: 'inline-block',
      lineHeight: '34px',
    },
    '@media (max-width: 320px)': {
      marginRight: 4,
    },
  },

  left: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 19,
    flex: 1,
    '@media (max-width: 1100px)': {
      fontSize: 16,
    },
    '@media (max-width: 1000px)': {
      fontSize: 14,
      position: 'absolute',
      width: '100%',
      top: 60,
      left: 0,
      flexDirection: 'column',
      backgroundColor: colors.blue,
      borderTop: `1px solid ${colors.white}`,
      zIndex: 1,
      justifyContent: 'space-between',
      padding: 8,
      height: 'auto',
    },
  },
  leftHidden: {
    height: 0,
  },
  mobileMenu: {
    display: 'none',
    '@media (max-width: 1000px)': {
      display: 'flex',
      backgroundColor: colors.blue,
      color: colors.white,
      flex: 1,
      justifyContent: 'center',
      cursor: 'pointer',
      borderRight: 'none',
      borderTop: 'none',
      borderBottom: 'none',
      borderLeft: metrics.border.tiny,
      borderLeftStyle: 'solid',
      borderColor: colors.white,
    },
  },
  right: {
    display: 'flex',
    fontSize: 14,
    '@media (max-width: 1000px)': {
      flex: 5,
      justifyContent: 'flex-end',
    },
    '@media (max-width: 480px)': {
      justifyContent: 'center',
      fontSize: 18,
    },
    '@media (max-width: 320px)': {
      flex: 7,
    },
  },
  selectLabel: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    color: colors.blueLight,
    fontSize: '14px',
    lineHeight: 1,
    fontFamily: 'Lato',
    marginLeft: 15,
  },
  selectInput: {
    color: 'rgba(0,0,0,0.65)',
    border: '1px solid rgba(0,0,0,0.2)',
    borderColor: 'transparent',
    background: 'rgba(255,255,255,.5)',
    borderBottom: '2px solid ' + colors.blue,
    fontSize: fonts.size.medium,
    outline: 'none',
    fontFamily: 'Lato',
  },
};

UnauthorizedContent.propTypes = propTypes;
//export default withStyles(muiStyle)(Radium(UnauthorizedContent));
export default Radium(UnauthorizedContent);