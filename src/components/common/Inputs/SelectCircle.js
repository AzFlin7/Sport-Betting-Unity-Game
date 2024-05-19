import React from 'react';
import ReactLoading from 'react-loading';

import { colors } from '../../../theme';
import localizations from '../../Localizations'
import Input from './InputText';

let styles;


export default class SelectCircle extends React.Component {

    state = {
      open: false,
      inputContent: ''
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

    if (!open) {
        if (typeof this.props.onClick !== 'undefined')
            this.props.onClick()
        
        return this.setState({ open: true });
    }
  }

  _handleChange = (item) => {
    const { onChange } = this.props;
    if (typeof onChange === 'function') {
      this.setState({inputContent: ''})
      onChange(item);
      this._toggleDropdown()
      if (typeof this.props.onClose === 'function')
        this.props.onClose()
    }
  }
  
  _handleClickOutside = event => {
    if (!this._containerNode.contains(event.target)) {
      this.setState({ open: false });
      if (typeof this.props.onClose === 'function')
        this.props.onClose()
    }
  }

  _handleSearchChange = event => {
      this.setState({
          inputContent: event.target.value
      })
  }

  render() {
    const { open } = this.state;
    const { style, list, value, label, term, onClick, allowAutocompletion, placeholder, disabled, isLoading } = this.props;
    
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

    if (actualterm && actualterm.length > 25)
        actualterm = actualterm.slice(0,25) + '...';

    return (
      <div
        style={finalContainerStyle}
        ref={node => { this._containerNode = node; }}
      >
        {
          value && !open && typeof this.props.clearSelection === 'function'
          ? <span onClick={this.props.clearSelection} style={{...styles.closeCross, top: label ? 22 : 8}}>
              <i className="fa fa-times" style={styles.cancelIcon} aria-hidden="true"></i>
            </span>
          : <span style={finalTriangleStyle} onClick={this._toggleDropdown}/>
        }
        <Input
            label={label}
            ref={node => { this._inputNode = node }}
            value={this.state.inputContent !== '' ? this.state.inputContent : ''}
            onChange={this._handleSearchChange}
            onClick={this._handleInputClick}
            placeholder={actualterm}
            readOnly={!allowAutocompletion}
            disabled={disabled}
        />
        {
          open && 
          <div style={{...styles.dropdown, top: label ? 45 : 35}}>
            {isLoading 
            ? <ReactLoading type='spinningBubbles' color={colors.blue} />
            : <ul style={styles.list}>
                {
                  list.length === 0
                    ? <li style={styles.listItem}>{localizations.newSportunity_selection_no_choice}</li>
                    : list
                      .filter(item => allowAutocompletion ? this.state.inputContent === '' ? true : item.name.toLowerCase().indexOf(this.state.inputContent.toLowerCase()) >= 0 : true)
                      .map((item, id) =>
                          <li
                              key={id}
                              style={styles.listItem}
                              onClick={this._handleChange.bind(null, item)}
                          >
                              <div style={styles.buttonIcon}>
                                  <img style={styles.buttonImage} src="/images/icon_circle@3x.png"/>
                                  <div style={styles.numberContainer}>
                                      <span style={styles.number}>
                                          {item.memberCount}
                                      </span>
                                  </div>
                              </div>
                              <div style={styles.nameContainer}>
                                  <div style={value && value.id === item.id ? styles.bold : styles.name}>
                                      {item.name}
                                  </div>
                                  {item.owner && item.owner.pseudo &&
                                      <div style={styles.ownerContainer}>
                                          <div style={{...styles.icon, backgroundImage: item.owner.avatar ? 'url('+ item.owner.avatar +')' : 'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")'}} />
                                          {item.owner.pseudo}
                                      </div>
                                  }
                              </div>
                        </li>
                  )
                }
              </ul>
            }
          </div>
        }
      </div>
    );
  }
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

    closeCross: {
        position: 'absolute',
        right: 0,
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
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },

    nameContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        flex: 4,
    },
    bold: {
        fontWeight: 'bold',
        marginLeft: 5
    },
    name: {
        marginLeft: 5
    },    
    ownerContainer: {
        textDecoration: 'none',
        color: colors.darkGray,
        fontSize: 16,
        lineHeight: '30px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 3
    },
    icon: {
        width: 25,
        height: 25,
        borderRadius: '50%',
        marginRight: 7,
        backgroundPosition: '50% 50%',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
    },
    buttonIcon: {
        color: colors.blue,
        position: 'relative',
        flex: 1
    },
    buttonImage: {
        width: 40,
        height: 'auto'
    },
    numberContainer: {
        position: 'absolute',
        top: '3px',
        left: '14px',
        width: 24,
        textAlign: 'center'
    },
    number: {
        fontSize: 18,
        fontWeight: 'bold'
    },
};