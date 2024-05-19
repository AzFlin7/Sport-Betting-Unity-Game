import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { appStyles, colors } from '../../../theme'
import Radium from 'radium'
import { Card, CardContent, TextField, Switch, Button } from '@material-ui/core'
import InputSelect from '../../common/Inputs/InputSelect';

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
            this.onNextClick(index, {...this.state});
        }
    };

    
    render() {

        return (
            <Card style={styles.container}>
                <CardContent>
                    <div style={styles.header}>
                        <span style={{...styles.leftColumn, ...styles.title, marginLeft:'50px', fontWeight: 'bold'}}>
                            <h1>Create a group </h1>
                            <span style={{ fontSize: '13px', marginTop: '10px' }}>Step 1 of 5</span>
                        </span>
                        <span style={{...styles.rightColumn, ...styles.title}}>
                            Account Selection 
                            <br/>
                            <InputSelect style={{ marginTop: '10px'}}></InputSelect>
                        </span>
                    </div>
                    <div style={styles.row}>
                        <span style={{...styles.leftColumn, ...styles.title, marginLeft:'50px'}}>
                            <h1>Title</h1>
                            <span style={{ marginTop: '10px' }}>
                                <TextField inputProps={
                                    {
                                        style: {
                                            fontSize: '18px',
                                            fontFamily: 'Lato',
                                        }
                                    }
                                } style={{ width: '300px' }} placeholder='Group Name'></TextField>
                            </span>
                        </span>
                        <span style={{...styles.rightColumn, ...styles.title}}>
                            Sport 
                            <InputSelect style={{ marginTop: '10px', marginBottom: '0px !important'}}></InputSelect>
                        </span>
                    </div>

                    <div style={styles.row}>
                        <span style={{...styles.leftColumn, ...styles.title, marginLeft:'50px'}}>
                            <h1>Description</h1>
                            <span style={{ marginTop: '10px' }}>
                            <TextField 
                            multiline
                            rowsMax={4}
                            inputProps={
                                    {
                                        style: {
                                            fontSize: '18px',
                                            fontFamily: 'Lato',
                                            height: '80px',
                                            paddingTop: '5px'
                                        }
                                    }
                                } style={{ width: '300px' }} placeholder='Why are you creating it?'></TextField>
                            
                            
                            </span>
                        </span>
                        <span style={{...styles.rightColumn, ...styles.title, height: '50px'}}>
                            Level Range (optional) 
                            <InputSelect style={{ marginTop: '10px'}}></InputSelect>
                        </span>
                    </div>
                    <div style={styles.row}>
                        <span style={{...styles.leftColumn, ...styles.title, marginLeft:'50px'}}>
                            <h1>Group Type</h1>
                            <span style={{ marginTop: '10px', width: '300px' }}>
                                <InputSelect style={{ marginTop: '10px'}}></InputSelect>
                            </span>
                        </span>
                    </div>
                    <div style={styles.row}>
                        <span style={{...styles.title, marginLeft: '20px'}}>
                            Open Usage 
                            <Switch></Switch>
                            <span style={{ fontSize: '13px', fontFamily: 'Lato', color: colors.gray }} >Each member will be able to invite other members to external activities.</span>
                        </span>
                    </div>

                    <div style={styles.footer}>
                        <Button variant='contained' color='primary' style={{ marginTop: '20px', marginLeft: '20px', backgroundColor: colors.blue, fontSize: '15px', fontFamily: 'Lato', width: '80px' }}>
                            Next
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }
}


styles = {

    container: {
        display: 'flex',
        marginLeft:'0px',
        flexDirection: 'column',
        width: '80%',
        background: colors.white
    },

    header: {
        height: '60px',
        borderBottom: '1px solid ' + colors.black,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingBottom: '30px'
    },

    footer: {
        height: '60px',
        borderTop: '1px solid ' + colors.black,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingBottom: '30px'
    },

    button: {

    },

    row: {
        marginTop: '30px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },

    title: {
        fontFamily: 'Lato',
        fontSize: '18px',
    },

    rightColumn: {
        flex: 1,
        marginRight: '10%',
        marginLeft: '40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
    },
    leftColumn: {
        flex: 1,
        marginLeft: '10%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
    }

};


Information.propTypes = {
    onNextClick: PropTypes.func.isRequired
}


export default Information
