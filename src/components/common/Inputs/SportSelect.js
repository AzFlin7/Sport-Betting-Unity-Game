import React from 'react';
import {createRefetchContainer, graphql} from 'react-relay'; 
import Radium from 'radium';
import { colors } from '../../../theme';
import localizations from '../../Localizations';

import Input from './InputText';

let styles;


class Sports extends React.Component {

    state = {
      open: false,
      term: '',
      sportSearch: '',
      loadingAllSports: false,
      allSportLoaded: false
    }


  componentDidMount() {
    window.addEventListener('click', this._handleClickOutside);
    if (!!this.props.value) {
      this.setState({term: this.props.value})
    }
  }


  componentWillUnmount() {
    window.removeEventListener('click', this._handleClickOutside);
  }


  _toggleDropdown = () => {
    if (!this.state.open)
     // this.refs._inputNode._focus();
      if(this.props.passingRef){
         setTimeout(() => { this.props.passingRef.focus(); }, 10);
    }
    this.setState(prevState => ({ open: !prevState.open }));
  }

  _handleInputClick = () => {
    if(this.props.passingRef){
      setTimeout(() => { this.props.passingRef.focus(); }, 10);
    }
    const { open } = this.state;
    if (!open) return this.setState({ open: true });
  }


  _handleFocus = () => {
    this._toggleDropdown();
  }


  _handleChange = (item, e) => {
    e.preventDefault();
    const { onChange } = this.props;
    if (item)
      this.setState({ term: item.name, open: false });
    else 
      this.setState({ term: '', open: false })
      
    if (typeof onChange === 'function') {
      onChange(item);
    }
  }

  _handleRemoveSelection = () => {
    const { onChange } = this.props;
    this.setState({ term: '' });
    
    if (typeof onChange === 'function') {
      onChange();
    }
  }


  _handleSearchChange = event => {
    if(this.props.passingRef){
      setTimeout(() => { this.props.passingRef.focus(); }, 10);
    }
    
    if (event.target.value.length > 0) {
      this.setState({ term: event.target.value});
      this._updateSportFilter(event.target.value);
    }
    else {
      this.setState({ term: ''});
      this._updateSportFilter('');
    }
  };

  _handleLoadAllClick = () => {
    this.setState({loadingAllSports: true})
    this.props.relay.refetch(fragmentVariables => ({
      ...fragmentVariables,
      sportsNb: 1000,
      filterName: { name: '', language: 'EN' },
      queryLanguage: localizations.getLanguage().toUpperCase()
    }),
    null,
    () => this.setState({ allSportLoaded: true, loadingAllSports: false })
  )
  }


  _handleClickOutside = event => {
    let selected = this.props.list.filter(item => {
      return item.name == this.state.term
    });
    // if (this.state.open && selected.length == 0) this._handleChange(null);
    if (!this._containerNode.contains(event.target)) {
      this.setState({ open: false });
    }
  }

  _updateSportFilter(value) {
    this.setState({
      sportSearch: value,
      loadingAllSports: true
    })

    let tempo = value ;
    setTimeout(() => {
      if (tempo.length > 0 && tempo === this.state.sportSearch) {
        if (!this.state.allSportLoaded && value.length >= 1) {
          this.props.relay.refetch(fragmentVariables => ({
            ...fragmentVariables,
            filterName: { name: value, language: localizations.getLanguage().toUpperCase() },
            sportsNb: 5,
            queryLanguage: localizations.getLanguage().toUpperCase()
          }),
          null,
          () => this.setState({loadingAllSports: false}));
        }
      }
      if (value.length === 0) {
        this.props.relay.refetch(fragmentVariables => ({
          ...fragmentVariables,
          filterName: { name: '', language: localizations.getLanguage().toUpperCase() },
          queryLanguage: localizations.getLanguage().toUpperCase()
          }),
          null,
          () => this.setState({loadingAllSports: false})
        );
      }
    }, 350);
  }

  _translatedName = (name) => {
    let translatedName = name.EN
    switch (localizations.getLanguage().toLowerCase()) {
      case 'en':
        translatedName = name.EN
        break
      case 'fr':
        translatedName = name.FR || name.EN
        break
      case 'it':
        translatedName = name.IT || name.EN
        break
      case 'de':
        translatedName = name.DE || name.EN
        break
      default:
        translatedName = name.EN
        break
    }
    return translatedName
  }


  render() {
    const { open, term } = this.state;
    const { label, style, list, disabled, required, placeholder, error, value = '', errorMessage, viewer } = this.props;

    const finalContainerStyle = { ...styles.container, ...style };
    const triangleStyle = open ? styles.triangleOpen : styles.triangle ;
    const finalTriangleStyle = {
      ...triangleStyle,
      borderTopColor: disabled ?  '#D1D1D1' : colors.blue,
      borderBottomColor: open ? colors.green : colors.blue
    };

    const sportsList = viewer && viewer.selectSports 
    ? viewer.selectSports.edges.map(({ node }) => ({ ...node, name: this._translatedName(node.name), value: node.id }))
    : [];

    let errMsg;

    if (errorMessage) {
      errMsg = <div style={styles.errMsgStyle}> {errorMessage} </div>;
    } 
    else {
      errMsg = <div> </div>;
    }

    return (
      <div
        style={finalContainerStyle}
        ref={node => { this._containerNode = node; }}
      >
        {value
        ? <span onClick={this._handleRemoveSelection} style={styles.closeCross}>
            <i className="fa fa-times" style={styles.cancelIcon} aria-hidden="true"></i>
          </span> 
        : <span onClick={this._handleFocus} style={finalTriangleStyle} />
        }
        <Input
          label={label}
          disabled={disabled}
          onChange={this._handleSearchChange}
          onClick={this._handleInputClick}
          placeholder={localizations.manageVenue_facility_selectSport}
          required={required}
          value={term ? term : this.state.sportSearch}
          error={error}
          errorMessage={errorMessage}
          color="#5F9FDF"
        />
        {open && 
          <div style={styles.dropdown}>
            <ul style={styles.list}>
              {this.state.loadingAllSports 
              ? <li key={0} style={styles.listItem}><span key={1} style={styles.spinnerItem}></span>{localizations.newSportunity_sport_loading}</li>
              : ''
              }
              {!this.state.loadingAllSports && sportsList.length === 0 
              ? <li key={9} style={styles.listItem}>{localizations.newSportunity_selection_no_choice}</li>
              : sportsList.map((item) => (
                  <li
                    key={item.value}
                    style={styles.listItem}
                    onClick={(e) => this._handleChange(item, e)}
                  >
                    <div style={{ ...styles.logo, backgroundImage: `url(${item.logo})` }} />
                    {item.name}
                  </li>
                )
              )}
              {value 
              ? ''
              : this.state.loadingAllSports 
                ? <li style={styles.listItem}>
                    <span key={2} style={styles.spinnerItem}></span>
                    {localizations.newSportunity_sport_loading}
                  </li>
                : this.state.allSportLoaded 
                  ? <li></li>
                  : <li onClick={this._handleLoadAllClick} style={styles.listItem}>{localizations.newSportunity_sport_load_all}</li>
              }
            </ul>
          </div>
        }
        {errMsg}
      </div>
    );
  }
}

Sports.defaultProps = {
  list: [],
  placeholder: 'Select',
}

var spinKeyframes = Radium.keyframes({
    '0%': { transform: 'rotate(0deg)' },
    '100%' :{ transform: 'rotate(360deg)' },
}, 'spin');

styles = {
  container: {
    position: 'relative',
    width: '100%',
    marginBottom: 40
  },

  dropdown: {
    position: 'absolute',
    top: 50,
    left: 0,

    width: '100%',
    maxHeight: 300,

    backgroundColor: colors.white,

    boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
    border: '2px solid rgba(94,159,223,0.83)',
    padding: '20px 0',

    overflowY: 'scroll',
    overflowX: 'hidden',

    zIndex: 100,
  },

  triangle: {
    position: 'absolute',
    right: 0,
    top: 27,
    width: 0, 
    height: 0,

    transition: 'border 100ms',
    transitionOrigin: 'left',

    color: colors.blue,
    
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderTop: `8px solid ${colors.blue}`,

    cursor: 'pointer'
  },

  triangleOpen: {
    position: 'absolute',
    right: 0,
    top: 27,
    width: 0, 
    height: 0,

    transition: 'border 100ms',
    transitionOrigin: 'left',

    color: colors.blue,

    cursor: 'pointer',
    
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderBottom: `8px solid ${colors.blue}`,
  },

  closeCross: {
    position: 'absolute',
    right: 0,
    top: 25,
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

  list: {},

  listItem: {
    paddingTop: 10,
    paddingBottom: 10,
    color: colors.blue,
    fontSize: 20,
    fontWeight: 500,
    paddingLeft: 30,
    paddingRight: 20,
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

  logo: {
    width: 39,
    height: 39,
    marginRight: 10,
		color: colors.blue,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  errMsgStyle: {
    color: colors.red,
    fontSize: 15,
  }
};


export default createRefetchContainer(Radium(Sports), {
    viewer: graphql`
      fragment SportSelect_viewer on Viewer @argumentDefinitions (
        sportsNb: {type: "Int", defaultValue: 10},
        filterName: {type: "SportFilter", defaultValue: null},
        queryLanguage: { type: "SupportedLanguage", defaultValue: "EN" },
      ) {
        id
        selectSports: sports(first: $sportsNb, filter: $filterName, language: $queryLanguage) {
          edges {
            node {
              id,
              name {
                EN
                FR
                DE
              },
              logo,
              levels {
                id
                EN {
                  name,
                  skillLevel
                  description
                }
                FR {
                  name,
                  skillLevel
                  description
                },
                DE {
                  name,
                  skillLevel
                  description
                }
              },
              positions {
                id,
                EN,
                FR,
                DE,
              },
              certificates {
                id,
                name {
                  EN,
                  FR,
                  DE
                }
              }
              type
              sportunityTypes {
                id,
                isScoreRelevant
                name {
                  FR,
                  EN
                }
              }
            }
          }
        }
      }
    `
  },
  graphql`
    query SportSelectRefetchQuery (
      $sportsNb: Int,
      $filterName: SportFilter,
      $queryLanguage: SupportedLanguage
    ) {
      viewer {
        ...SportSelect_viewer @arguments (
          sportsNb: $sportsNb,
          filterName: $filterName,
          queryLanguage: $queryLanguage
        )
      }
    }
  `
);