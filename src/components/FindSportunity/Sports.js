import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import Radium from 'radium';
import { colors } from '../../theme';

import Input from './Input';

let styles;


class Sports extends PureComponent {

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
    const { open } = this.state;
    if (!open) return this.setState({ open: true });
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

    this.setState({ term: event.target.value, open: true });
    this.props.onSearching(event.target.value);
  };

  _handleLoadAllClick = () => {
    const { onLoadAllClick } = this.props;
    if (typeof onLoadAllClick === 'function') {
      onLoadAllClick();
    }
  }


  _handleClickOutside = event => {
    let selected = this.props.list.filter(item => {
      return item.name == this.state.term
    });
    if (this.state.open && selected.length == 0) this._handleChange(null);
    if (!this._containerNode.contains(event.target)) {
      this.setState({ open: false });
    }
  }


  _filterList(list, term) {
    const termLength = term.length;
    return list
      .map(item => {
        const start = item.name.toLowerCase().indexOf(term.toLowerCase());
        if (start === -1) return false;
        return { ...item, bold: { start, end: start + termLength } };
      })
      .filter(i => Boolean(i));
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
    const finalTriangleStyle = {
      ...styles.triangle,
      borderTopColor: disabled ?  '#D1D1D1' : open ? colors.green : colors.blue,
    };

    const filteredList = this._filterList(list, term);

    return (
      <div
        style={finalContainerStyle}
        onFocus={this._toggleDropdown}
        ref={node => { this._containerNode = node; }}
      >
        {
          term
          ? <span onClick={this._handleRemoveSelection} style={styles.closeCross}>
              <i className="fa fa-times" style={styles.cancelIcon} aria-hidden="true"></i>
            </span>
          : <span style={finalTriangleStyle} />}
        <Input
          label={label}
          ref={node => { this._inputNode = node }}
          disabled={disabled}
          onChange={this._handleSearchChange}
          onClick={this._handleInputClick}
          placeholder={placeholder}
          required={required}
          value={term}
        />
        {
          open &&
          <div style={styles.dropdown}>
            <ul style={styles.list}>
              {
                this.props.loadingAllSports && 'filterName' in this.props.loadingAllSports
                  ? <li key={0} style={styles.listItem}><span key={1} style={styles.spinnerItem}></span>Loading..</li>
                  : ''
              }
              {
                filteredList.length === 0
                  ? <li style={styles.listItem}>No choices available</li>
                  : filteredList.map((item) =>
                      <li
                        key={item.value}
                        style={styles.listItem}
                        onClick={this._handleChange.bind(null, item)}
                      >
                        <div style={{ ...styles.logo, backgroundImage: `url(${item.logo})` }} />
                        {this._renderName(item.name, item.bold)}
                      </li>
                )
              }
              {
                term
                  ? ''
                  : this.props.loadingAllSports && 'sportsNb' in this.props.loadingAllSports
                    ? <li style={styles.listItem}><span key={2} style={styles.spinnerItem}></span>Loading..</li>
                    : this.props.allSportLoaded
                      ? <li></li>
                      : <li onClick={this._handleLoadAllClick} style={styles.listItem}>Load all sports..</li>
              }
            </ul>
          </div>
        }
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
  },

  dropdown: {
    position: 'absolute',
    top: 70,
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
    top: 35,
    width: 0,
    height: 0,

    transition: 'border 100ms',
    transitionOrigin: 'left',

    color: colors.blue,

    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderTop: `8px solid ${colors.blue}`,
  },

  closeCross: {
    position: 'absolute',
    right: 0,
    top: 30,
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

  bold: {
    fontWeight: 'bold',
  },
  logo: {
    width: 39,
    height: 39,
    marginRight: 10,
		color: colors.blue,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
};


export default Radium(Sports);
