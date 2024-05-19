import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Radium, { StyleRoot } from 'radium';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import JssProvider from 'react-jss/lib/JssProvider';
import { createGenerateClassName } from '@material-ui/core/styles';
import ReactGA from 'react-ga';


import localizations from './Localizations';
import Header from './common/Header/Header'
import Footer from './common/Footer/Footer'

// theme & generateClassName also in renderOnServer.js
const generateClassName = createGenerateClassName({
  dangerouslyUseGlobalCSS: true,
  productionPrefix: 'c',
});

const propTypes = {
  children: PropTypes.node,
};

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#5EA1D9',
      contrastText: '#fff',
    },
    secondary: {
      main: '#A6A6A6',
      contrastText: '#fff',
    },
  },
  typography: { useNextVariants: true },
});

class App extends Component {
  constructor() {
    super()
    this.state = {
      language: localizations.getLanguage(),
      hideHeader: false
    }
  }

  componentWillMount() {
  //   ReactGA.initialize('UA-86793644-1', { standardImplementation: true });
    if (this.props.location && this.props.location.pathname.indexOf('/fr/') >= 0) {
      localizations.setLanguage('fr')
    }
    else if (localizations.getLanguage().toLowerCase() !== 'en' && localizations.getLanguage().toLowerCase() !== 'fr') {
      localizations.setLanguage('en')
    }

    if (this.props.location && this.props.location.pathname.indexOf('mailvalidation') >= 0) {
      this.setState({hideHeader: true})
    }
  }

  // Remove the server-side injected CSS.
  componentDidMount() {
    const jssStyles = document.getElementById('jss-server-side');
    if (jssStyles && jssStyles.parentNode) {
      jssStyles.parentNode.removeChild(jssStyles);
    }
    if (this.props.location && (
        this.props.location.pathname.indexOf('notification-preferences') >= 0
      || this.props.location.pathname.indexOf('faq-mobile') >= 0
      || this.props.location.pathname.indexOf('public-frame') >= 0)) {
      let splitted = this.props.location.pathname.split('/') ;
			if (splitted[2]) {
				this.setState({hideHeader: true})
			}
    }
  }

  componentWillReceiveProps = nextProps => {
    if (this.props.location.pathname !== nextProps.location.pathname && typeof window !== "undefined") {
      ReactGA.pageview(nextProps.location.pathname);
      window.scrollTo(0, 0)
      if (this.state.hideHeader && this.props.location.pathname.indexOf('mailvalidation') >= 0 && nextProps.location.pathname.indexOf('mailvalidation') < 0) {
        this.setState({hideHeader: false})
      }
    }
  }

  _setLanguage = language => {
    this.setState({ language });
  };

  render() {
    const { children } = this.props;
    const childrenWithProps = React.Children.map(children, child =>
      React.cloneElement(child, { language: this.state.language, onUpdateLanguage: this._setLanguage })
    );

    return (
      <JssProvider generateClassName={generateClassName}>
        <MuiThemeProvider theme={theme}>
          <StyleRoot>
            {this.props.router && !this.state.hideHeader && <Header {...this.props}/>}
            {childrenWithProps}
            {this.props.router && !this.state.hideHeader && <Footer {...this.props} onUpdateLanguage={this._setLanguage}/>}
          </StyleRoot>
        </MuiThemeProvider>
      </JssProvider>
    );
  }
}

App.propTypes = propTypes;

export default Radium(App);
