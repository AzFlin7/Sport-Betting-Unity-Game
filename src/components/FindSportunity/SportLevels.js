import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import Radium from 'radium';
import ReactTooltip from 'react-tooltip'
import { colors } from '../../theme';
import localizations from '../Localizations'

import Input from './Input';

let styles;


class SportLevels extends PureComponent {

	state = {
		open: false,
		term: ''
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
    const { onFromChange, onToChange, from } = this.props;
    if (from) {
      let newTerm = localizations.newSportunity_from + ' : ' + from.name
          + ' - ' + localizations.newSportunity_to + ' : ' + item.name;
      this.setState({ term: newTerm, open: false });
      if (typeof onToChange === 'function') {
        onToChange(item);
      }
    }
    else {
      this.setState({ term: item.name, open: true });
      if (typeof onFromChange === 'function') {
        onFromChange(item);
      }
    }
  }

  _handleRemoveSelection = () => {
    const { onFromChange, onToChange } = this.props;
      if (typeof onToChange === 'function') {
        onToChange();
      }
      if (typeof onFromChange === 'function') {
        onFromChange();
      }
  }


  _handleSearchChange = event => {
    this.setState({ term: event.target.value, open: true });
  };


  _handleClickOutside = event => {
    if (!this._containerNode.contains(event.target)) {
      this.setState({ open: false });
    }
  }


  _filterList(list, term) {
    const { from, to } = this.props;

    let fromIndex = -1 ;
    if (from)
      fromIndex = list.findIndex((e) => e.id == from.value);

    const termLength = term.length;
    return list
      .map((level, index) => {
        if (to) return false;
        if (fromIndex >= 0 && index < fromIndex) return false;
        let start = 0 ;
        let end = 0 ;
        if (from && from.name == level[localizations.getLanguage().toUpperCase()].name) {
          start = level[localizations.getLanguage().toUpperCase()].name.toLowerCase().indexOf(term.toLowerCase());
          end = start + termLength;
        }

        return {
          name: level[localizations.getLanguage().toUpperCase()].name,
          value:level.id,
          bold: { start, end },
          skillLevel: level[localizations.getLanguage().toUpperCase()].skillLevel,
          description: level[localizations.getLanguage().toUpperCase()].description
        };
      })
      .filter(i => Boolean(i))
      .sort((a, b) => {return a.skillLevel - b.skillLevel});
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
    const { label, style, list, disabled, required, placeholder, from, to, stylesCustom } = this.props;
    let actualTerm = term ;
    if (list.length === 0 || (from == null && to == null))
      actualTerm = '';

    if (from && to)
      actualTerm = localizations.newSportunity_from + ' : ' + this.props.from.name
          + ' - ' + localizations.newSportunity_to + ' : ' + this.props.to.name;

    const finalContainerStyle = { ...styles.container, ...style };
    const triangleStyle = open ? styles.triangleOpen : styles.triangle ;
    const finalTriangleStyle = {
      ...triangleStyle,
      borderTopColor: disabled ?  '#D1D1D1' : open ? colors.green : colors.blue,
    };

    const filteredList = this._filterList(list, actualTerm);
    return (
      <div
        style={finalContainerStyle}
        onFocus={this._toggleDropdown}
        ref={node => { this._containerNode = node; }}
      >
        {
          from && to
          ? <span onClick={this._handleRemoveSelection} style={styles.closeCross}>
              <i className="fa fa-times" style={styles.cancelIcon} aria-hidden="true"></i>
            </span>
          : <span style={finalTriangleStyle} onClick={!disabled && this._toggleDropdown}/>}
        <Input
          label={label}
          ref={node => { this._inputNode = node }}
          disabled={disabled}
          onChange={this._handleSearchChange}
          onClick={this._handleInputClick}
          placeholder={placeholder}
          required={required}
          value={actualTerm}
          inputStyle={{ ...styles.input, ...stylesCustom } }
        />
        {
          open &&
          <div style={styles.dropdown}>
            <ul style={styles.list}>
              <li style={styles.listHeader}>
                <span style={styles.levelFrom}>{localizations.newSportunity_level_from} : </span>
                <span style={styles.selectedLevel}>
                  {
                    from
                    ? from.name
                    : ''
                  }
                </span>
              </li>
              {
                from ?
                <li style={styles.listHeader}>
                  {
                    from
                    ? <span style={styles.levelTo}>{localizations.newSportunity_level_to} : </span>
                    : ''
                  }
                  {
                      from && to
                      ? <span style={styles.selectedLevel}> {to.name} </span>
                      : ''
                  }
                </li>
                :''
              }
              {
                filteredList.length === 0
                  ?
                      to
                      ? ''
                      : <li style={styles.listItem}>{localizations.find_selection_no_choice}</li>

                  : filteredList.map((item) =>
                      <li
                        key={item.value}
                        style={styles.listItem}
                        onClick={this._handleChange.bind(null, item)}
                      >
                      <ReactTooltip effect="solid" multiline={true}/>
                        {this._renderName(item.name, item.bold)}
                        {
                          item.description &&
                          <span>
                            <i
                              data-tip={item.description}
                              style={styles.levelDetailsIcon}
                              className="fa fa-question-circle"
                              aria-hidden="true"
                            />
                          </span>
                        }
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

SportLevels.defaultProps = {
  list: [],
  placeholder: 'Select',
}


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
    right: -5,
    top: 10,
    width: 0,
    height: 0,

    transition: 'border 100ms',
    transitionOrigin: 'left',

    color: colors.blue,

    cursor: 'pointer',

    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderTop: `8px solid #212121`,
  },

  triangleOpen: {
    position: 'absolute',
    right: -5,
    top: 10,
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

  levelDetailsIcon: {
    float: 'right'
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

  selectedLevel: {
    fontWeight: '500',
    color: colors.black,
  },

  levelFrom: {
    fontWeight: 'bold',
    color: colors.blue,
  },

  levelTo: {
    fontWeight: 'bold',
    color: colors.blue,
    marginTop: '5px',
  },

};

export default Radium(SportLevels);
