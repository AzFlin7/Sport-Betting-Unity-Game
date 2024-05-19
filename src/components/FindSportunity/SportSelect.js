import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import Radium from 'radium';
import IconTint from 'react-icons-kit'
import { colors } from '../../theme';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as types from '../../actions/actionTypes.js';
import Input from './Input';
import localizations from '../Localizations'

let styles;


class SportSelect extends PureComponent {

    state = {
      open: false,
      term: '',
    }


  componentDidMount() {
    window.addEventListener('click', this._handleClickOutside);
  }


  componentWillUnmount() {
    window.removeEventListener('click', this._handleClickOutside);
  }


  _toggleDropdown = () => {
    this.setState(prevState => ({ open: !prevState.open }));
  }

  _handleInputClick = () => {
    // const { open } = this.state;
    // if (!open) return this.setState({ open: true });
  }


  _handleFocus = () => {
    this._inputNode.focus();
    this._toggleDropdown();
  }


  _handleChange = (item) => {
    const { onChange } = this.props;
    if (item)
      this.setState({ term: item.name, open: false });
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
    if (event.target.value.length > 1)
      this.setState({open: true})
    else
      this.setState({open: false})

    if (event.target.value.length > 0) {
      this.setState({ term: event.target.value});
      this.props.onSearching(event.target.value);
      this.props._updateSportNameAction(event.target.value)
    }
    else {
      this.setState({ term: ''});
      this.props.onSearching('');
      this.props._updateSportNameAction('')
    }
  };

  _handleLoadAllClick = () => {
    const { onLoadAllClick } = this.props;
    if (typeof onLoadAllClick === 'function') {
      onLoadAllClick();
    }
  }

  _handleClickOutside = event => {
    let selected = this.props.list.filter(item => {
      return item.name === this.state.term
    });
    if (this.state.open && selected.length === 0) this._handleChange(null);
    if (!this._containerNode.contains(event.target)) {
      this.setState({ open: false });
    }
  }

  _filterList(list, term) {
    const termLength = term.length;
    return list
      .map(item => {
        const start = item && item.name && item.name.toLowerCase().indexOf(term.toLowerCase());
        if (start === -1) return false;
        return { ...item, bold: { start, end: start + termLength } };
      })
      .filter(i => Boolean(i))
      .sort((a,b) => {
        if (a.name > b.name) return 1;
        else return -1;
      });
  }

  _renderName(name, bold) {
    return (
      <span>
        {name.substring(0, bold.start)}
        <span style={styles.bold}>{name.substring(bold.start, bold.end)}</span>
        {name.substring(bold.end)}
      </span>
    );
  }

  render() {
    const { open, term } = this.state;
    const { label, style, list, disabled, required, placeholder } = this.props;

    const finalContainerStyle = { ...styles.container, ...style };
    const triangleStyle = open ? styles.triangleOpen : styles.triangle ;
    const finalTriangleStyle = {
      ...triangleStyle,
      borderTopColor: disabled ?  '#D1D1D1' : open ? colors.green : colors.blue,
    };

    const filteredList = this._filterList(list, term);

    return (
      <div
        style={finalContainerStyle}
        ref={node => { this._containerNode = node; }}
      >
        {
          term
          ? <span onClick={this._handleRemoveSelection} style={styles.closeCross}>
              <i className="fa fa-times" style={styles.cancelIcon} aria-hidden="true"></i>
            </span>
          : <div style={finalTriangleStyle} onClick={this._toggleDropdown}/>}
        <Input
          label={label}
          ref={node => { this._inputNode = node }}
          disabled={disabled}
          onChange={this._handleSearchChange}
          onClick={this._handleInputClick}
          placeholder={placeholder}
          required={required}
          value={this.props.sportName}
        />
        {
          open &&
          <div style={styles.dropdown}>
            <ul style={styles.list}>
              {
                this.props.loadingAllSports && 'filterName' in this.props.loadingAllSports
                  ? <li key={0} style={styles.listItem}><span key={1} style={styles.spinnerItem}></span>{localizations.newSportunity_sport_loading}</li>
                  : ''
              }
              {
                !this.props.loadingAllSports && filteredList.length === 0
                    ? <li style={styles.listItem}>{localizations.newSportunity_selection_no_choice}</li>
                    : filteredList.map((item) =>
                        <li
                          key={item.value}
                          style={styles.listItem}
                          onClick={this._handleChange.bind(null, item)}
                        >
                          <IconTint width='36' height='36' src={item.logo} color={colors.blue}/>
                          <span style={styles.listText}>
                          {this._renderName(item.name, item.bold)}
                          </span>
                        </li>
                  )
              }
              {
                term
                  ? ''
                  : this.props.loadingAllSports && 'sportsNb' in this.props.loadingAllSports
                    ? <li style={styles.listItem}>
                        <span key={2} style={styles.spinnerItem}></span>
                          {localizations.newSportunity_sport_loading}
                        </li>
                    : this.props.allSportLoaded
                      ? <li></li>
                      : <li onClick={this._handleLoadAllClick} style={styles.listItem}>{localizations.newSportunity_sport_load_all}</li>
              }
            </ul>
          </div>
        }
      </div>
    );
  }
}

var spinKeyframes = Radium.keyframes({
    '0%': { transform: 'rotate(0deg)' },
    '100%' :{ transform: 'rotate(360deg)' },
}, 'spin');

styles = {
  container: {
    position: 'relative',
    margin: '10px 12px'
  },

  dropdown: {
    position: 'absolute',
    top: 30,
    left: 0,

    width: '100%',
    maxHeight: 270,

    backgroundColor: colors.white,

    //boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
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

const _updateSportNameAction = (name) => {
  return {
    type: types.UPDATE_SPORTUNITY_SEARCH_SPORT_NAME,
    sportName: name,
  };
}

const dispatchToProps = (dispatch) => ({
  _updateSportNameAction: bindActionCreators(_updateSportNameAction, dispatch),
});

const stateToProps = (state) => ({
  sportName: state.sportunitySearchReducer.sportName,
});

const ReduxContainer = connect(
  stateToProps,
	dispatchToProps,
)(Radium(SportSelect));


export default Radium(ReduxContainer);
