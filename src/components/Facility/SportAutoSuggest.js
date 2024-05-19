import React from 'react'
import Radium from 'radium'
import Autosuggest from 'react-autosuggest'
import { colors, fonts, metrics } from '../../theme'
import localizations from '../Localizations'

let autoSuggestStyle;

class SportAutoSuggest extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: props.value || '',
    }
  }

  _onChange = (event, { newValue }) => {
    this.setState({
      value: newValue,
    });
    this.props.onChangeFilter(newValue)
  };

  _onSuggestionsFetchRequested = () => {
  };

  _onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });
  };

  _shouldRenderSuggestions = (value) => {
    return (true)
  }

  _getSuggestionValue = (suggestion) => {
    return suggestion.node.name[localizations.getLanguage().toUpperCase()];
  }

  _renderSuggestion = (suggestion) => {
    return (
      <span>{suggestion.node.name[localizations.getLanguage().toUpperCase()]}</span>
    );
  }

  _onSuggestionSelected = (event, { suggestion }) => {
    this.props.onSelected(suggestion.node.id) ;
    this.setState({
      value: '',
    })
  }

  render() {
    const inputProps = {
      placeholder: localizations.manageVenue_facility_selectSport,
      value: this.state.value,
      onChange: this._onChange,
      //style: appStyles.input,
    };
    return(
      <Autosuggest
        suggestions={this.props.sports}
        theme={autoSuggestStyle}
        onSuggestionSelected={this._onSuggestionSelected}
        onSuggestionsFetchRequested={this._onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this._onSuggestionsClearRequested}
        getSuggestionValue={this._getSuggestionValue}
        shouldRenderSuggestions = {this._shouldRenderSuggestions}
        renderSuggestion={this._renderSuggestion}
        focusInputOnSuggestionClick={false}
        inputProps={inputProps} />
    )
  }
}

export default Radium(SportAutoSuggest)

autoSuggestStyle = {
	continer: {
		width: '380',
		marginRight: 30,
		marginTop: 15,
	},
	suggestionsContainerOpen: {
		maxHeight: 300,
		overflowY: 'scroll',
    overflowX: 'hidden',
    zIndex: 100,
		boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
    position: 'absolute',
		width: '380',
		marginTop: -10,
	},
  suggestion: {
    padding: metrics.padding.medium,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.blue,
    color: colors.blue,    
    backgroundColor: colors.white,
    fontFamily: 'Lato',
    display: 'block',
    fontSize: fonts.size.medium,
    cursor: 'pointer',
		width: '380',
  },
  suggestionFocused: {
    backgroundColor: colors.blueLight,
  },
  input: {
    width: '101%',
    borderWidth: 0,
    borderBottomWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.blue,
    height: '32px',
    lineHeight: '32px',
    fontFamily: 'Lato',
    color: 'rgba(0,0,0,0.65)',
    display: 'block',
    background: 'transparent',
    marginBottom: '10px',
    fontSize: fonts.size.medium,
    outline: 'none',
    marginTop: 15,
  },
}


