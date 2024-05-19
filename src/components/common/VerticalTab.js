import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import { colors } from '../../theme';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';


let styles;

class VerticalTab extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedTab: 0
        };
    }


    componentWillReceiveProps = nextProps => {
        if (typeof nextProps.selectedTab !== 'undefined') {
            this.setState({ selectedTab: nextProps.selectedTab });
        } 
    };


    handleMenuClick = index => event => {
        console.log('index: ', index);
        if (this.props.onMenuClick) {
            this.props.onMenuClick(index);
        }

        this.setState({ selectedTab: index });
    };

    
    render() {
        return (
            <Menu style={styles.menuContainer}>
                {
                    this.props.menuList.map((menu, index) => {
                        return (
                            <MenuItem 
                                style={this.state.selectedTab === index ? styles.activeMenu : styles.inactiveMenu }
                                onClick={this.handleMenuClick(index)}
                            >
                            {menu}
                            </MenuItem>
                        )
                    })
                }
            </Menu>
        )
    }
}

styles = {
    menuContainer: {
        display: 'flex',
        flexDirection: 'column'
    },

    activeMenu: {
        fontFamily: 'Lato',
        borderLeft: "5px solid #5EA1D9",
        backgroundColor: "#FFFFFF",
        boxShadow: "box-shadow: inset -7px 0 9px -7px rgba(0,0,0,0.4)"
    },

    inactiveMenu: {
        fontFamily: 'Lato',
    }
};


VerticalTab.propTypes = {
    menuList: PropTypes.array.isRequired,
    onMenuClick: PropTypes.func.isRequired,
};


export default VerticalTab