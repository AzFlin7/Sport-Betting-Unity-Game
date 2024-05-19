import React, {Component} from 'react';
import { createRefetchContainer, graphql, QueryRenderer } from 'react-relay';
import PureComponent from '../PureComponent';
import environment from 'sportunity/src/createRelayEnvironment';
import Radium from 'radium';
import { IconTint } from '../Icons/Icon';

import { colors } from '../../../theme';

import Input from './FilterInput';
import localizations from '../../Localizations';

let styles;

class SportSelect extends PureComponent {
  state = {
    open: false,
    term: '',
    allSportsLoaded: false,
    loadingAllSports: false
  };

  componentDidMount() {
    window.addEventListener('click', this._handleClickOutside);
  }

  componentWillReceiveProps = nextProps => {
    if (!this.props.value && nextProps.value) {
      this.setState({
        term: nextProps.value,
      });
    }
  };

  componentWillUnmount() {
    window.removeEventListener('click', this._handleClickOutside);
  }

  _toggleDropdown = () => {
    this.setState(prevState => ({ open: !prevState.open }));
  };

  _handleFocus = () => {
    this._inputNode.focus();
    this._toggleDropdown();
  };

  _handleChange = item => {
    const { onChange } = this.props;
    if (item) this.setState({ term: item.name, open: false });
    if (typeof onChange === 'function') {
      onChange(item);
    }
  };

  _handleRemoveSelection = () => {
    const { onChange } = this.props;
    this.setState({ term: '' });

    if (typeof onChange === 'function') {
      onChange();
    }
  };

  _handleSearchChange = event => {
    if (event.target.value.length > 1) this.setState({ open: true });
    else this.setState({ open: false });

    if (event.target.value.length > 0) {
      this.setState({ term: event.target.value });
      this.filterSports(event.target.value);
      this.props._updateSportNameAction(event.target.value);
    } else {
      this.setState({ term: '' });
      this.filterSports('');
      this.props._updateSportNameAction('');
    }
  };

  _handleClickOutside = event => {
    const list = this.props.viewer.sports.edges.map(({ node }) => ({
      ...node,
      name: this._translatedName(node.name),
      value: node.id,
    }));

    const selected = list.filter(
      item => item.name === this.state.term,
    );
    if (this.state.open && selected.length === 0) this._handleChange(null);
    if (!this._containerNode.contains(event.target)) {
      this.setState({ open: false });
    }
  };

  _filterList(list, term) {
    console.log("list", list)
    const termLength = term.length;
    return list
      .map(item => {
        const start = item.name && item.name.toLowerCase().indexOf(term.toLowerCase());
        if (start === -1) return {...item, bold: { start: 0, end: 0 }};
        return { ...item, bold: { start, end: start + termLength } };
      })
      .filter(i => Boolean(i))
      .sort((a, b) => {
        if (a.name > b.name) return 1;
        return -1;
      });
  }

  loadAllSports = () => {
    this.setState({loadingAllSports: true})
    this.props.relay.refetch(fragmentVariables => ({
        ...fragmentVariables,
        sportsNb: 1000,
        filterName: { name: '', language: 'EN' },
      }),
      null,
      () => {
        this.setState({loadingAllSports: false, allSportsLoaded: true})
      }
    );
  }

  _translatedName = name => {
    let translatedName = name.EN;
    switch (localizations.getLanguage().toLowerCase()) {
      case 'en':
        translatedName = name.EN;
        break;
      case 'fr':
        translatedName = name.FR || name.EN;
        break;
      case 'it':
        translatedName = name.IT || name.EN;
        break;
      case 'de':
        translatedName = name.DE || name.EN;
        break;
      default:
        translatedName = name.EN;
        break;
    }
    return translatedName;
  };

  _renderName(name, bold) {
    return (
      <span>
        {name.substring(0, bold.start)}
        <span style={styles.bold}>{name.substring(bold.start, bold.end)}</span>
        {name.substring(bold.end)}
      </span>
    );
  }

	filterSports = value => {
    this.setState({loadingAllSports: true})
		this.props.relay.refetch(fragmentVariables => ({
			...fragmentVariables,
			filterName: {
			  name: value,
			  language: localizations.getLanguage().toUpperCase(),
			},
			sportsNb: 5,
    }),
    null,
    () => this.setState({loadingAllSports: false}));
	}

  render() {
    const { open, term } = this.state;
    const { label, style, disabled, required, placeholder } = this.props;

    const finalContainerStyle = { ...styles.container, ...style };
    const triangleStyle = open ? styles.triangleOpen : styles.triangle;
    const finalTriangleStyle = {
      ...triangleStyle,
      borderTopColor: disabled ? '#D1D1D1' : open ? colors.green : colors.blue,
    };

    if (!this.props.viewer || !this.props.viewer.sports)
      return null ;

    const list = this.props.viewer.sports.edges.map(({ node }) => ({
      ...node,
      name: this._translatedName(node.name),
      value: node.id,
    }));

    const filteredList = this._filterList(list, term);
    return (
      <div
        style={finalContainerStyle}
        ref={node => {
          this._containerNode = node;
        }}
      >
        {term ? (
          <span
            onClick={this._handleRemoveSelection}
            style={styles.closeCross}
          >
            <i
              className="fa fa-times"
              style={styles.cancelIcon}
              aria-hidden="true"
            />
          </span>
        ) : (
          <div style={finalTriangleStyle} onClick={this._toggleDropdown} />
        )}
        <Input
          label={label}
          ref={node => {
            this._inputNode = node;
          }}
          disabled={disabled}
          onChange={this._handleSearchChange}
          onClick={this._handleInputClick}
          placeholder={placeholder}
          required={required}
          value={this.props.sportName || term}
        />
        {open && (
          <div style={styles.dropdown}>
            <ul style={styles.list}>
              {this.state.loadingAllSports
              ? <li key={0} style={styles.listItem}>
                  <span key={1} style={styles.spinnerItem} />
                  {localizations.newSportunity_sport_loading}
                </li>
              : null
              }

              {!this.state.loadingAllSports && filteredList.length === 0 ? (
                <li style={styles.listItem}>
                  {localizations.newSportunity_selection_no_choice}
                </li>
              ) : (
                filteredList.map(item => (
                  <li
                    key={item.value}
                    style={styles.listItem}
                    onClick={this._handleChange.bind(null, item)}
                  >
                    <IconTint
                      width="36"
                      height="36"
                      src={item.logo}
                      color={colors.blue}
                    />
                    <span style={styles.listText}>
                      {this._renderName(item.name, item.bold)}
                    </span>
                  </li>
                ))
              )}
              {term 
              ? ('') 
              : this.state.loadingAllSports
                ? <li style={styles.listItem}>
                    <span key={2} style={styles.spinnerItem} />
                    {localizations.newSportunity_sport_loading}
                  </li>
                : this.state.allSportsLoaded
                  ? <li /> 
                  : <li onClick={this.loadAllSports} style={styles.listItem}>
                      {localizations.newSportunity_sport_load_all}
                    </li>
              }
            </ul>
          </div>
        )}
      </div>
    );
  }
}

const spinKeyframes = Radium.keyframes(
  {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
  'spin',
);

styles = {
  container: {
    position: 'relative',
    margin: '10px 12px',
  },

  dropdown: {
    position: 'absolute',
    top: 30,
    left: 0,

    width: '100%',
    maxHeight: 270,

    backgroundColor: colors.white,
    border: '2px solid rgba(94,159,223,0.83)',
    padding: '0px',

    overflowY: 'scroll',
    overflowX: 'hidden',

    zIndex: 100,
  },

  triangle: {
    position: 'absolute',
    right: -5,
    top: 10,
    width: 0,
    height: 0,

    transition: 'border 100ms',
    transitionOrigin: 'left',

    color: colors.blue,

    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderTop: `8px solid ${colors.blue}`,
    cursor: 'pointer',
    zIndex: 10,
  },

  triangleOpen: {
    position: 'absolute',
    right: -5,
    top: 12,
    width: 0,
    height: 0,

    transition: 'border 100ms',
    transitionOrigin: 'left',

    color: colors.blue,

    cursor: 'pointer',

    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderBottom: `8px solid ${colors.blue}`,
    zIndex: 10,
  },

  closeCross: {
    position: 'absolute',
    right: -5,
    top: 5,
    width: 0,
    height: 0,
    color: colors.gray,
    marginRight: '15px',
    cursor: 'pointer',
    fontSize: '16px',
    zIndex: 10,
  },

  cancelIcon: {
    marginRight: 15,
  },

  list: {},
  listText: {
    marginLeft: 20,
  },
  listItem: {
    paddingTop: 7,
    paddingBottom: 7,
    color: colors.blue,
    fontSize: 20,
    fontWeight: 500,
    paddingLeft: 20,
    paddingRight: 10,
    fontFamily: 'Lato',
    display: 'flex',
    cursor: 'pointer',
    borderBottomWidth: 1,
    borderColor: colors.blue,
    borderStyle: 'solid',
    alignItems: 'center',

    ':hover': {
      backgroundColor: '#e9e9e9',
    },
  },

  spinnerItem: {
    borderLeft: '6px solid #f3f3f3',
    borderRight: '6px solid #f3f3f3',
    borderBottom: '6px solid #f3f3f3',
    borderTop: '6px solid #3498db',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    marginRight: '20px',
    animation: 'x 1.5s ease 0s infinite',
    animationName: spinKeyframes,
  },

  bold: {
    fontWeight: 'bold',
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 10,
    color: colors.blue,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
};

const SportSelectTemp = createRefetchContainer(Radium(SportSelect), {
  viewer: graphql`
    fragment FilterSport_viewer on Viewer @argumentDefinitions (
      sportsNb: { type: "Int", defaultValue: 10 }
			filterName: { type: "SportFilter", defaultValue: null }
			queryLanguage: { type: "SupportedLanguage", defaultValue: "EN" }
    ) {
      sports(first: $sportsNb, filter: $filterName, language: $queryLanguage) {
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
    }
  `,
}, graphql`
    query FilterSportRefetchQuery (
      $sportsNb: Int
      $filterName: SportFilter
      $queryLanguage: SupportedLanguage
    ) {
      viewer {
        ...FilterSport_viewer @arguments(sportsNb: $sportsNb, filterName: $filterName, queryLanguage: $queryLanguage)
      }
    }
`);

export default class extends Component {
  render() {
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query FilterSportQuery {
            viewer {
              ...FilterSport_viewer
            }
          }
        `}
        variables={{}}
        render={({error, props}) => {
          if (props) {
            return <SportSelectTemp query={props} viewer={props.viewer} {...this.props}/>;
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