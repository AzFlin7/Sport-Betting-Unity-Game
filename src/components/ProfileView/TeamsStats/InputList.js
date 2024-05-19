import React from 'react';
import Radium from 'radium';

import { colors } from '../../../theme';
import localizations from '../../Localizations'
let styles;

class InputList extends React.Component {
    constructor() {
        super();
        this.state = {
            isListOpen: false
        }
    }

    componentDidMount() {
        window.addEventListener('click', this._handleClickOutside);
    }
    
    componentWillUnmount() {
        window.removeEventListener('click', this._handleClickOutside);
    }

    _handleClickOutside = () => {
        if (this._containerNode && !this._containerNode.contains(event.target)) {
            this.setState({ isListOpen: false });
        }
    }

    _toggleList = () => {
        this.setState({
            isListOpen: !this.state.isListOpen
        })
    }

    _handleClickItem = (item) => {
        this.props.onClickItem(item);
        this.setState({
            isListOpen: false
        })
    }

    render() {
        const {list, value} = this.props;
        
        return (
            <div style={styles.container} ref={node => { this._containerNode = node; }}>
                <span style={styles.inputContainer}>
                    <input
                        style={styles.input}
                        ref={node => { this._inputNode = node }}
                        value={value}
                        onClick={this._toggleList}
                        placeholder={list.length > 0 ? localizations.fillStats_fill_here : '-'}
                        readOnly={true}
                        />
	                {list.length > 0 &&
		                <span style={styles.triangle}/>
	                }
                </span>
                {this.state.isListOpen && list && list.length > 0 &&
                    <ul style={styles.listContainer}>
                        {list.map((item, index) => (
                            <li style={styles.listItem} key={index} onClick={() => this._handleClickItem(item)}>
                                {item.name[localizations.getLanguage().toUpperCase()]}
                            </li>
                        ))}
                    </ul>
                }
            </div>
        )
    }

}

styles = {
    container: {
        position: 'relative',
        fontFamily: 'Lato',
        minWidth: 200,
    },
    inputContainer: {
        display: 'flex',
        alignItems: 'center'
    },
    input: {
        minWidth: 200,
        cursor: 'pointer',
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        borderBottomWidth: 2,
        borderBottomColor: colors.blue,
        backgroundColor: '#FFF0',
        fontSize: 20,
        fontFamily: 'Lato',
        lineHeight: 1,
        color: 'rgba(0, 0, 0, 0.64)',
        paddingBottom: 8,
        paddingRight: 20,
        outline: 'none',
        '@media (maxWidth: 768px)': {
          width: 180,
        },
        '@media (maxWidth: 600px)': {
          width: 240,
        },
        ':focus': {
          borderBottomColor: colors.green,
        },
    },
    triangle: {
        position: 'absolute',
        right: 10,
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
    listContainer: {
        width: '100%',
        position: 'absolute',
        backgroundColor: colors.white,
        border: '2px solid '+colors.blue,
        padding: '8px 10px',
        fontSize: 16,
        zIndex: 1,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
    },
    listItem: {
        paddingTop: 7,
        paddingBottom: 5,
        borderBottom: '1px solid '+colors.blue,
        cursor: 'pointer'
    }
}

export default Radium(InputList);