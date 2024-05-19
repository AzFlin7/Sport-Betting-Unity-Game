import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import { Card, CardContent } from '@material-ui/core'
import { colors } from '../../theme';

let styles;

const SportunityCodeBox = (props) => {
    return (
        <Card style={styles.sportunityCode}>
            <CardContent>
                <h1 style={styles.h1}>{props.title}</h1>
                <h1 style={styles.circleCode}>{props.code}</h1>
            </CardContent>
        </Card>
    )
}

styles = {
    h1: {
        paddingTop: '5px',
        color: colors.white,
        fontFamily: 'Lato',
    },
    circleCode: {
        fontFamily: 'Lato',
        fontSize: '20px', 
        marginTop: '8px', 
        fontWeight: 'bold'
    },
    sportunityCode: {
        minWidth: '140px',
        backgroundColor: colors.blue,
        borderRadius: '5px',
        height: '100px',
        width: '140px',
        fontSize: '20px',
        textAlign: 'center',
        fontWeight: 'bold',
        boxShadow: '4px 4px 4px rgba(0,0,0,0.12)'
    },

};

SportunityCodeBox.propTypes = {
    code: PropTypes.string.isRequired
};


export default SportunityCodeBox