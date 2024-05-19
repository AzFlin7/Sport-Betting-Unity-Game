import React from 'react';

import { colors } from '../../theme';
import localizations from '../Localizations'

import Input from './Input';
import {pure} from "../common/PureComponent";

let styles;

const Subtitle = pure(({ children, withoutMargin }) => (
  <h2 style={withoutMargin ? styles.subtitleWithoutMargin : styles.subtitle}>{children}</h2>)
);

export default class SelectTemplate extends React.Component {

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
    if (!this.state.open)
      this._openDropdown() 
    else 
      this._closeDropdown() 
  }

  _openDropdown = () => {
    this.setState({ open: true });
  }

  _closeDropdown = () => {
    this.setState({ open: false });
  }

  _handleInputClick = () => {
    const { open } = this.state;
    if (!open) {
      this._openDropdown() ;
    }
  }


  _handleFocus = () => {
    this._toggleDropdown();
  }


  _handleChange = (item) => {
    const { onChange } = this.props;
    this.setState({ term: item.name });
    if (typeof onChange === 'function') {
      onChange(item);
    }
    if (this.props.singleChoice) {
      this.setState({open: false})
    }
  }

  _handleEdit = (item) => {
    const { onEdit } = this.props;
    this.setState({ term: item.name });
    if (typeof onChange === 'function') {
      onEdit(item);
    }
    if (this.props.singleChoice) {
      this.setState({open: false})
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
    if (this.state.open)
      this.setState({ term: event.target.value, open: true })
  };


  _handleClickOutside = event => {
    if (!this._containerNode.contains(event.target)) {
      this._closeDropdown()
    }
  }


  _filterList(list) {
    const {values, singleChoice } = this.props;

    return list
      .map(({ name, value }) => {
        let start = 0 ;
        let end = 0 ;
        if (singleChoice && values && values.value === value) {
          start = name.toLowerCase().indexOf(name.toLowerCase());
          end = start + name.length ;
        }
        else if (!singleChoice && values && values.findIndex((e) => e.value == value) >= 0) {
          start = name.toLowerCase().indexOf(name.toLowerCase());
          end = start + name.length ;
        }
        return { name, value, bold: { start, end } };
      })
  }


  _renderName(name, bold) {
    return name && (
      <span>
        {name.substring(0, bold.start)}
        <span style={styles.bold}>{name.substring(bold.start, bold.end)}</span>
        {name.substring(bold.end)}
      </span>
    );
  }

  render() {
    const { open, term } = this.state;
    const { label, style, list, disabled, required, placeholder, values, singleChoice, onRemove } = this.props;

    const finalContainerStyle = { ...styles.container, ...style };
    const triangleStyle = open ? styles.triangleOpen : styles.triangle ;
    const finalTriangleStyle = {
      ...triangleStyle,
      borderTopColor: disabled ?  '#D1D1D1' : colors.blue,
      borderBottomColor: open ? colors.green : colors.blue
    };
    let actualTerm = term ;
    if (list.length === 0 || (singleChoice && !values) || (!singleChoice && values.length === 0))
      actualTerm = '';
    else if (singleChoice && values) {
      actualTerm = values.name
    }
    else if (values.length > 0) {
      actualTerm = values.map((value) => {
        return ' '+value.name
      })
    }

    const filteredList = this._filterList(list, actualTerm);

    return (
      <div
        style={finalContainerStyle}
        ref={node => { this._containerNode = node; }}
      >
        {
          actualTerm && !open
          ? <span onClick={this._handleRemoveSelection} style={styles.closeCross}>
              <i className="fa fa-times" style={styles.cancelIcon} aria-hidden="true"></i>
            </span> 
          : <span style={finalTriangleStyle} onClick={this._toggleDropdown}/>}
        <Input
          label={label}
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
                  ? <li style={styles.listItem}>{localizations.newSportunity_selection_template_no_choice}</li>
                  : filteredList.map((item, index) => (
                      <li
                        key={index}
                        style={styles.listItem}
                      >
                        <div onClick={this._handleChange.bind(null, item)} style={styles.itemValue}>
                          {this._renderName(item.name, item.bold)}
                        </div>
                        <div onClick={() => onRemove(item.value)} style={styles.itemDelete}>
                          {localizations.newSportunity_template_delete}
                        </div>
                      </li>
                ))
              }
            </ul>
          </div>
        }
      </div>
    );
  }
}

SelectTemplate.defaultProps = {
  list: [],
  placeholder: 'Select',
  singleChoice: true,
}


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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'middle',
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
  itemDelete: {
    color: '#777777',
    fontSize: 16,
    padding: '10px 0',
    margin: '-10px 0px'
  },
  subtitle: {
    marginBottom: 30,
    color: colors.blue,
    fontSize: 28,
    lineHeight: 1,
    fontWeight: 500,
  },

  subtitleWithoutMargin: {
    color: colors.blue,
    fontSize: 28,
    lineHeight: 1,
    fontWeight: 500,
  },
  itemValue:{
    width: '100%',
    padding: '10px 0px',
    margin: '-10px 0px'
  }
};