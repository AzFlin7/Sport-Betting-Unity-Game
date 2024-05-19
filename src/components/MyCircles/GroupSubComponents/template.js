import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { appStyles, colors } from '../../theme'
import Radium from 'radium'

let styles ;

class Information extends Component {


    constructor(props) {
        super(props);

        this.state = {
            account: 0,
            title: '',
            sport: 0,
            description: '',
            minLevel: 0,
            maxLevel: 0,
            groupType: '',
            openUsage: 0
        };
    }


    handleNext = index => {
        if (this.onNextClick) {
            this.onNextClick({...this.state});
        }
    };
    

    renderActiveTab() {
        
    }

    
    render() {

        return (
            <div style={styles.container}>

            </div>
        );
    }
}


styles = {

    container: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
    }

};


Information.propTypes = {
    onNextClick: PropTypes.func.isRequired
}


export default Information
