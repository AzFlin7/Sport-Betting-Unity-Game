import React, { Component } from 'react';
import Radium, { StyleRoot } from 'radium'
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
let styles;
class CustomTab extends Component{
    handleChangeTab = (e, value) => this.props.onChange(value)

    render() {
        const { tab1, tab2, tab3, tab4, parentTabStyle, childTabStyle, tab1Level, tab2Level, tab3Level, tab4Level, onChange, value="one"} = this.props;
        return (
            <StyleRoot>
                <Tabs value={value} onChange={this.handleChangeTab} style={{ ...styles.tabsStyle, ...parentTabStyle }} inkBarStyle={{ background: '#5EA1D9' }}>
                    {tab1 && 
                        <Tab label={tab1Level} value="one" style={{ ...styles.tabStyle, ...childTabStyle }}/>
                    } 
                    {tab2 && 
                        <Tab label={tab2Level} value="two" style={{ ...styles.tabStyle, ...childTabStyle }}/>
                    } 
                    {tab3 && 
                        <Tab label={tab3Level} value="three" style={{ ...styles.tabStyle, ...childTabStyle }}/>
                    } 
                    {tab4 && 
                        <Tab label={tab4Level} value="four" style={{ ...styles.tabStyle, ...childTabStyle }}/>
                    } 
                </Tabs>
                {value === "one" && 
                    tab1
                }
                {value === "two" && 
                    tab2
                }
                {value === "three" && 
                    tab3
                }
                {value === "four" && 
                    tab4
                }
            </StyleRoot>
            
        )
    }
    
}

styles = {
    tabsStyle: {
        width: 'calc(100% + 140px)',
        marginLeft: '-70px',
        marginRight: '-70px',

    },
    tabStyle: {
        backgroundColor: '#FFFFFF',
        color: '#000000',
        borderBottom: '1px solid  #9A9A9A',
        flex: 1,
        maxWidth: '100%'
    }
}

export default Radium(CustomTab);