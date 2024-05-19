import React from 'react'
import PureComponent, { pure } from '../common/PureComponent'
import Radium from 'radium'
import { connect } from 'react-redux';
import Autosuggest from 'react-autosuggest'
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import debounce from 'lodash.debounce'
import localizations from '../Localizations'

import { fonts, colors, metrics } from '../../theme'

let autoSuggestStyle
let styles

class SportAutoSuggest extends PureComponent {
	constructor(props) {
		super(props)
		this.state = {
			value: '',
			suggestions: [],
		}
		this._onDebounceSportFilterChange = debounce(this._onDebounceSportFilterChange, 400);
  }
  
  componentDidMount() {
    this.props.relay.refetch(fragmentVariables => ({
      ...fragmentVariables,
      queryLanguage: localizations.getLanguage().toUpperCase()
    }))
  }

	_onDebounceSportFilterChange = (value) => {
		const filter = { name: value, language: 'EN' }
		this.props.relay.refetch(fragmentVariables => ({ 
      ...fragmentVariables, 
      filter: filter
    }))
	}

	_onChange = (event, { newValue }) => {
    this.setState({
      value: newValue,
    });
    this._onDebounceSportFilterChange(newValue)
  };

  _onSuggestionsFetchRequested = () => {
  };

  _onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });
  };

  _shouldRenderSuggestions = (value) => {
    return true
  }

  _getSuggestionValue = (suggestion) => {
    return suggestion.node.name.EN;
  }

  _renderSuggestion = (suggestion) => {
    return (
      <span>
				<img style={styles.icon} src={suggestion.node.logo} />
				{suggestion.node.name.EN}
			</span>
    );
  }

  _onSuggestionSelected = (event, { suggestion }) => {
    this.props.onSportSelected(suggestion.node)
    //this.props.onSelected(suggestion.node.id)
  }

  _handleRemoveSelection = () => {
    this.props.onSportSelected(null)
    this.setState({
      value: '',
    })
    this._onDebounceSportFilterChange('')
  }

	render() {
		const inputProps = {
      placeholder: 'Type here',
      value: this.state.value,
      onChange: this._onChange,
      //style: appStyles.input,
    }

    autoSuggestStyle = {
      continer: {
        width: '320',
        marginRight: 30,
        marginTop: 15,
      },
      suggestionsContainer: {
        maxHeight: 300,
        overflowY: 'scroll',
        overflowX: 'hidden',
        zIndex: 100,
        boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
        position: 'absolute',
        width: '320',
        marginTop: -10,

      },
      sectionContainer: {

      },
      suggestion: {
        padding: metrics.padding.small,
        borderBottomWidth: 1,
        borderStyle: 'solid',
        borderColor: colors.blue,
        color: colors.blue,
        backgroundColor: colors.white,
        fontFamily: 'Lato',
        display: 'block',
        fontSize: fonts.size.medium,
        cursor: 'pointer',
        width: '320',
      },
      suggestionFocused: {
        backgroundColor: colors.blueLight,
      },
      input: {
        width: 320,
        borderWidth: 0,
        borderBottomWidth: 2,
        borderStyle: 'solid',
        borderColor: this.props.isSportError ? colors.error: colors.blue,
        height: '32px',
        lineHeight: '32px',
        fontFamily: 'Lato',
        color: 'rgba(0,0,0,0.65)',
        display: 'block',
        background: 'transparent',
        fontSize: fonts.size.medium,
        outline: 'none',
        marginBottom: 20,
      },
    }

		return(
      <div style={styles.container}>
        {
          this.props.selectedSport &&

        <span onClick={this._handleRemoveSelection} style={styles.closeCross}>
          <i className="fa fa-times" style={styles.cancelIcon} aria-hidden="true"></i>
        </span>
        }
        <Autosuggest
          suggestions={this.props.viewer.sports.edges}
          theme={autoSuggestStyle}

          onSuggestionSelected={this._onSuggestionSelected}
          onSuggestionsFetchRequested={this._onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this._onSuggestionsClearRequested}
          getSuggestionValue={this._getSuggestionValue}
          shouldRenderSuggestions = {this._shouldRenderSuggestions}
          renderSuggestion={this._renderSuggestion}
          focusInputOnSuggestionClick={false}
          inputProps={inputProps} />
      </div>
		)
	}
}

styles = {
  container: {
    position: 'relative',
    width: 320,
  },
	icon: {
		width: 24,
		height: 24,
		marginRight: 12,
	},
  closeCross: {
    position: 'absolute',
    right: 0,
    top: 4,
    width: 0,
    height: 0,
    color: colors.gray,
    marginRight: '15px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  cancelIcon: {
    marginRight: 15,
  },
}

const dispatchToProps = (dispatch) => ({
})
  
const stateToProps = (state) => ({
})

let ReduxContainer = connect(
    stateToProps,
    dispatchToProps
)(Radium(SportAutoSuggest));

export default createRefetchContainer(ReduxContainer, {
//OK
  viewer: graphql`
    fragment SportAutoSuggest_viewer on Viewer @argumentDefinitions(
      filter: { type: "SportFilter", defaultValue: null }
      queryLanguage: { type: "SupportedLanguage", defaultValue: "EN" }
    ){
      sports(first: 10, filter: $filter, language: $queryLanguage) {
                  edges {
                      node {
                          id
                          name {
                              EN
                          }
                          logo
            positions {
              id
              EN
            }
            certificates {
              id
              name {
                id
                EN
              }
            }
            levels {
              id
              EN {
                name
              }
            }
                      }
                  }
              }
    }
  `,
},
graphql`
query SportAutoSuggestRefetchQuery(
  $filter: SportFilter
  $queryLanguage: SupportedLanguage
) {
viewer {
    ...SportAutoSuggest_viewer
    @arguments(
      filter: $filter
      queryLanguage: $queryLanguage
    )
}
}
`,
)
