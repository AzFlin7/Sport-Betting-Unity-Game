import React, { Component } from 'react';
import { appStyles, colors } from '../../theme'
import Radium from 'radium'
import VerticalTab from '../common/VerticalTab';
import Information from './GroupSubComponents/Information';
import Privacy from './GroupSubComponents/Privacy';

let styles ;

class AddGroup extends Component {


    constructor(props) {
        super(props);

        this.state = {
            selectedTab: 1
        };
    }


    onMenuClick = index => {
        this.setState({ selectedTab: index });
    };


    handleNext = (index, state) => {
        this.setState((prevState) => ({
            selectedTab: prevState.selectedTab + 1
        }));
    };


    renderActiveTab() {
        switch(this.state.selectedTab) {
            case 0:
                return (
                    <Information onNextClick={this.handleNext}>

                    </Information>
                )
            case 1:
                return (
                    <Privacy onNextClick={this.handleNext}>
                    </Privacy>
                )
            default:
                return null;
        }
    }


    render() {
        const menuList = ['Information', 'Privacy', 'Form', 'Document', 'Fee'];

        return (
            <div style={styles.container}>
                <VerticalTab
                    menuList={menuList}
                    onMenuClick={this.onMenuClick}
                />

                {this.renderActiveTab()}

            </div>
        );
    }
}


styles = {

    container: {
        display: 'flex',
        width: "100%",
        fontFamily: "Lato",
        backgroundColor: "#F3F3F3",
        flexDirection: 'row',
        width: '90%',
        marginLeft: '5%',
        marginRight: '5%',
        marginTop: '20px',
    }

};


export default AddGroup
