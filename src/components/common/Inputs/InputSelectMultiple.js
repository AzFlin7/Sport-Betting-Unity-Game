import React from 'react';
import { colors } from '../../../theme';
import localizations from '../../Localizations'

import Input from './InputText';

let styles;


export default class Multiselect extends React.Component {

    state = {
      open: false,
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
    if (typeof onChange === 'function') {
      onChange(item);
    }
  }
  
  _handleClickOutside = event => {
    if (!this._containerNode.contains(event.target)) {
      this.setState({ open: false });
    }
  }

  render() {
    const { open } = this.state;
    const { style, list, values, term, disabled, placeholder, label, onSelectAll, allowSelectAll, isAllSelected } = this.props;

    const finalContainerStyle = { ...styles.container, ...style };
    const triangleStyle = open ? styles.triangleOpen : styles.triangle ;
    const finalTriangleStyle = {
      ...triangleStyle,
      borderTopColor: open ? colors.green : disabled ? '#D1D1D1' : colors.blue,
      top: label ? 25 : 13
    };

    let actualterm = term

    if (!actualterm) 
      actualterm = placeholder

    if (actualterm.length > 38)
      actualterm = actualterm.slice(0,38) + '...';

    return (
      <div
        style={finalContainerStyle}
        onFocus={this._toggleDropdown}
        ref={node => { this._containerNode = node; }}
      >
        <span style={finalTriangleStyle} onClick={this._toggleDropdown} />
        <Input
          label={label}
          ref={node => { this._inputNode = node }}
          onChange={this._handleSearchChange}
          onClick={this._handleInputClick}
          placeholder={actualterm}
          disabled={disabled}
          readOnly
        />
        {
          open && 
          <div style={{...styles.dropdown, top: label ? 45 : 35}}>
            <ul style={styles.list}>
              {allowSelectAll && typeof onSelectAll !== 'undefined' && list.length > 0 && 
                <li 
                  key={"0"}
                  style={styles.listItem}
                  onClick={onSelectAll}
                >
                  {isAllSelected
                    ? localizations.unselectAll
                    : localizations.selectAll
                  }
                  <input
                    type='checkbox'
                    checked={isAllSelected}
                  />
                </li>
              }
              {
                list.length === 0
                  ? <li style={styles.listItem}>{localizations.newSportunity_selection_no_choice}</li>
                  : list.map((item, id) =>
                      <li
                        key={id}
                        style={styles.listItem}
                        onClick={this._handleChange.bind(null, item)}
                      >
                        {values.length > 0 && values.findIndex(value => value.id === item.id) >= 0
                        ?   <span style={styles.bold}>{item.name}</span>
                        :   <span>{item.name}</span>
                        }
                        <input
                          type='checkbox'
                          checked={values.length > 0 && values.findIndex(value => value.id === item.id) >= 0}
                        />
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
  //placeholder: 'Select',
}


styles = {
  container: {
    position: 'relative',
    width: '100%',
    cursor: 'pointer'
  },

  dropdown: {
    position: 'absolute',
    left: 0,

    width: '100%',
    maxHeight: 250,

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

  cancelIcon: {
    marginRight: 15,
  },

  list: {},

  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
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
    marginBottom: 5
  },

  selectedItems: {
    fontWeight: '500',
    color: colors.black,
  },
};