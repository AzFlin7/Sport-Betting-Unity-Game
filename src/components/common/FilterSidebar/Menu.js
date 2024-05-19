import React from 'react';
import PureComponent, { pure } from '../PureComponent'
import { colors, metrics, fonts } from '../../../theme';

let styles

const Title = ({ children, filterMax, selectedFilter, open, toggleOpen }) => (
  <div style={styles.titleContainer} onClick={toggleOpen}>
    <h2 style={styles.title}>{children}</h2>
    <div style={styles.rightSide}>

        {/* 
        VB: Commenting the filter count as it is not adde in the design
        {typeof selectedFilter !== 'undefined' && typeof filterMax !== 'undefined' && 
            <div style={{fontSize: 18, marginRight: 5, color: colors.darkGray}}>{selectedFilter + '/' + filterMax}</div>
        } */}
        {
            open ? 
            <i className="material-icons" style={ styles.expander }>keyboard_arrow_up</i>
            : <i className="material-icons" style={ styles.expander }>keyboard_arrow_down</i>
        }
        
        {/* 
            Commenting the following and adding the icon
        <span style={open ? styles.triangleOpen : styles.triangle} /> */}
    </div>
  </div>)

class FilterMenu extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
           listIsOpen: true,
        }
    }

    componentDidMount = () => {
        if (this.props.listIsOpen === false) {
            this.setState({listIsOpen: false})   
        }
    }

    toggleList = () => {
        this.setState({listIsOpen: !this.state.listIsOpen})
    }

    render() {
        const { title, filterMax, filterLength, scroll } = this.props

        return(
            <div style={styles.menu_container}>
                <Title 
                    filterMax={filterMax}
                    selectedFilter={filterLength}
                    open={this.state.listIsOpen}
                    toggleOpen={this.toggleList}
                >
                    {title}
                </Title>
                {this.state.listIsOpen && 
                // VB: removing the style completely for now
                    <div style={scroll ? { maxHeight: 300, overflowY: 'scroll'} : {}}>
                        {this.props.children}
                    </div>
                }
            </div>
        )
    }
}

styles = {
	localFilterContainer: {
        /*
        VB: Commenting following to mix the design with title
        borderLeft: '1px solid ' + colors.blue,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,

        borderBottom: '1px solid ' + colors.blue,
        borderRight: '1px solid ' + colors.blue,
        */
        margin: '0 5px',
        boxShadow: 'rgba(0, 0, 0, 0.12) 0px 0px 4px 0px',
    },

    expander: {
        fontSize: '16px'
    },

    triangle: {
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
    title: {
        // VB: reducing the fontsize and the weight
        fontSize: 15,
        //fontWeight: 'bold',
        color: colors.blue,
        marginRight: 5
    },
    titleContainer: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        padding: '7px 5px',
        width: '100%',
        justifyContent: 'space-between',
        height: '40px',

        //VB: We don't need the menu color anymore or border (except bottom)
        // backgroundColor: colors.blueLighter, 
        // border: '1px solid ' + colors.gray,
        // borderRadius: 3
        // boxShadow: 'rgba(0, 0, 0, 0.12) 0px 0px 4px 0px',

        borderTop: '1px solid ' + colors.gray,
        borderBottom: '1px solid ' + colors.gray,

        cursor: 'pointer',
    },
    menu_container: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        marginBottom: 5
    },
    rightSide: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    }
};

export default FilterMenu;
