import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import { colors } from '../../theme';
import localizations from '../Localizations'

import Input from './Input';

let styles;


export default class Multiselect extends PureComponent {

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
    this.setState({ term: item.name });
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
    this.setState({ term: event.target.value, open: true })
};


  _handleClickOutside = event => {
    if (!this._containerNode.contains(event.target)) {
      this.setState({ open: false });
    }
  }


  _filterList(list) {
    const selectedValues = this.props.values ;
    return list
      .map(({ name, value }) => {
        let start = 0 ;
        let end = 0 ;
        if (selectedValues && selectedValues.findIndex((e) => e.value == value) >= 0) {
          start = name.toLowerCase().indexOf(name.toLowerCase());
          end = start + name.length ;
        }
        return { name, value, bold: { start, end } };
      })
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
    const { label, style, list, disabled, required, placeholder, values } = this.props;

    const finalContainerStyle = { ...styles.container, ...style };
    const triangleStyle = open ? styles.triangleOpen : styles.triangle ;
    const finalTriangleStyle = {
      ...triangleStyle,
      borderTopColor: disabled ?  '#D1D1D1' : open ? colors.green : colors.blue,
    };

    let actualTerm = term ;
    if (list.length === 0 || values.length == 0)
      actualTerm = '';
    else if (values.length > 0) {
      actualTerm = values.map((value) => {
        return ' '+value.name
      })
    }

    const filteredList = this._filterList(list, actualTerm);
    return (
      <div
        style={finalContainerStyle}
        onFocus={this._toggleDropdown}
        ref={node => { this._containerNode = node; }}
      >
        {
          actualTerm && !open
          ? <span onClick={this._handleRemoveSelection} style={styles.closeCross}>
              <i className="fa fa-times" style={styles.cancelIcon} aria-hidden="true"></i>
            </span>
          : <span style={finalTriangleStyle} onClick={this._toggleDropdown} />}
        <Input
          label={label}
          ref={node => { this._inputNode = node }}
          disabled={disabled}
          onChange={this._handleSearchChange}
          onClick={this._handleInputClick}
          placeholder={placeholder}
          required={required}
          value={actualTerm}
          readOnly
        />
        {
          open &&
          <div style={styles.dropdown}>
            <ul style={styles.list}>
              <li style={styles.listHeader}>
                <span style={styles.selectedLabel}>{localizations.newSportunity_selected} : </span>
                <span style={styles.selectedPosition}>
                    {values ? values.name : ''}
                </span>
              </li>
              {
                filteredList.length === 0
                  ? <li style={styles.listItem}>{localizations.newSportunity_selection_no_choice}</li>
                  : filteredList.map((item) =>
                      <li
                        key={item.value}
                        style={styles.listItem}
                        onClick={this._handleChange.bind(null, item)}
                      >
                        {this._renderName(item.name, item.bold)}
                      </li>
                )
              }
            </ul>
          </div>
        }
      </div>
    );
  }
}

Multiselect.defaultProps = {
  list: [],
  placeholder: 'Select',
}


styles = {
  container: {
    position: 'relative',
    width: '100%',
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
    padding: 20,

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

    cursor: 'pointer',

    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderTop: `8px solid ${colors.blue}`,
  },

  triangleOpen: {
    position: 'absolute',
    right: 0,
    top: 35,
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
    color: '#515151',
    fontSize: 20,
    fontWeight: 500,
    fontFamily: 'Lato',
		borderBottomWidth: 1,
		borderColor: colors.blue,
		borderStyle: 'solid',
		cursor: 'pointer',
  },

  bold: {
    fontWeight: 'bold',
  },

  listHeader: {
    paddingBottom: 5,
		borderBottomWidth: 2,
		borderColor: colors.blue,
		borderStyle: 'solid',
    fontSize: 20,
    fontFamily: 'Lato',
    marginBottom: 9,
  },

  selectedLabel: {
    fontWeight: 'bold',
    color: colors.blue,
  },

  selectedPosition: {
    fontWeight: '500',
    color: colors.black,
  },
};
