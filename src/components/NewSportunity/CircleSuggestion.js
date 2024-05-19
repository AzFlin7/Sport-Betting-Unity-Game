import React from 'react'
import Relay from 'react-relay';
import Radium from 'radium'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Loading from 'react-loading';

import * as types from '../../actions/actionTypes.js';
import { colors, metrics, fonts } from '../../theme'
import Autosuggest from 'react-autosuggest'
import localizations from '../Localizations'

let styles;
let autoSuggestStyle;

class CircleSuggestion extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      suggestions: [],
      value: '',//this.props.sportName,
      isLoading: false
    };
  }

  _escapeRegexCharacters = (str) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  _getSuggestionValue = (suggestion) => {
    if(!suggestion) {
      return ''
    }
    return suggestion.node.name;
  }

  _renderSuggestion = (suggestion) => {
    return (
      <span style={styles.suggestionLine}>
        {suggestion.node.name}
      </span>
    );
  }

  _onChange = (event, { newValue }) => {
    this.setState({
      value: newValue,
      isLoading: true
    });
    this.setState({
      suggestions: []
    });
    this.props.onChange(newValue, () => this.setState({isLoading: false}))
		//this.props._updateSportAction('', newValue);
  };

  _onSuggestionsFetchRequested = ({ value }) => {
    this.loadSuggestions(value);
  };

  loadSuggestions = (value) => {
    if (value === this.state.value) {
      this.setState({
        suggestions: this._getSuggestions(value),
      });
    }
  };


  _onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });
  };

  _getSuggestions = (value) => {
    if(!value || value.length < 2) {
      return []
    }
    return this.props.suggestion.sort((a, b) => {
      return a.node.name >= b.node.name
    });
  };

  render() {
    const { suggestions, value } = this.state;
    const inputProps = {
      placeholder: localizations.find_circleHolder,
      value,
      onChange: this._onChange,
      style: styles.span.input,
    };
    
    return(
      <span style={styles.span} >
        <Autosuggest
          suggestions={[]}
          theme={autoSuggestStyle}
          onSuggestionsFetchRequested={this._onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this._onSuggestionsClearRequested}
          getSuggestionValue={this._getSuggestionValue}
          renderSuggestion={this._renderSuggestion}
          inputProps={inputProps} />
        {this.state.isLoading 
        ? <div style={styles.loadingContainer}><Loading type='spinningBubbles' color={colors.blue} /></div>
        : <i style={styles.span.iconSuggest} className="fa fa-search" aria-hidden="true"/>
        }
      </span>
    )
  };
}

styles = {
  span: {
    width: 250,
    boxSizing: 'border-box',
    borderBottom: '1px solid',
    borderBottomColor: '#ccc',
    display: 'inline-flex',
    boxShadow: 'box-shadow: 1px 1px 1px #888',
    position: 'relative',
    '@media (max-width: 850px)': {
      display: 'flex',
      marginBottom: 5,
    },
    iconSuggest: {
      fontSize: '13px',
      color: '#ccc',
      lineHeight: '34px',
      marginRight: 10,
      position: 'absolute',
      left:0,
    },
    iconSearch: {
      fontSize: '13px',
      color: '#fff',
      marginLeft: '0%',
    },
    input: { /* shall toggle, from <p> to <input> */
      marginLeft: '13%',
      width: '100%',
      border: 'none',
      fontFamily: 'Lato',
      display: 'inline',
      outline: 'none',
      fontSize: 13,
      lineHeight: '30px',
    },
    inputSearch: {
      marginLeft: '15%',
      fontFamily: 'Lato',
      fontSize: 13,
      display: 'inline',
      color: colors.white,
      marginBottom: 16,
      outline: 'none',
    },
  },
  logo: {
    width:30,
    height: 30,
    marginRight: 10,
  },
  suggestionLine: {
    display: 'flex',
    alignItems: 'center'
  },
  loadingContainer: {
    height: 20,
    width: 20,
    marginRight: 5,
    marginTop: 6,
    display: 'flex'
  }
}

autoSuggestStyle = {
  suggestion: {
    padding: metrics.padding.small,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.blue,
    color: colors.blue,
    backgroundColor: colors.white,
    fontFamily: 'Lato',
    display: 'block',
    fontSize: 18,
    cursor: 'pointer',
    verticalAlign: 'middle',
  },
  suggestionFocused: {
    backgroundColor: colors.blueLight,
  },
}


export default Radium(CircleSuggestion);

// https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions#Using_Special_Characters


