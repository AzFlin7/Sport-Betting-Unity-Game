import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { appStyles, colors } from '../../../theme'
import Radium from 'radium'
import { Card, CardContent, TextField, Switch, Button } from '@material-ui/core'
import InputSelect from '../../common/Inputs/InputSelect';
import localizations from '../../Localizations';
import SportunityCodeBox from '../../common/SportunityCodeBox';

let styles ;

class Privacy extends Component {


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
            <div  style={styles.container}>
            <Card style={styles.cardContainer}>
                <CardContent>
                    <div style={styles.header}>
                        <span style={{...styles.leftColumn, ...styles.title, marginLeft:'50px', fontWeight: 'bold'}}>
                            <h1>Privacy </h1>
                            <span style={{ fontSize: '13px', marginTop: '10px' }}>Step 2 of 5</span>
                        </span>
                    </div>
                    <div style={styles.row}>
                            <span style={styles.title}>Public group</span>
                            <Switch></Switch>
                            <span style={{ flex: 15, fontSize: '14px', fontFamily:'Lato' }}>{localizations.circles_visible_searchable}</span>
                            <Button variant='contained' color='primary' 
                            style={{ flex: 4, backgroundColor: colors.blue, fontSize: '15px', fontFamily: 'Lato', width: '80px' }}>
                            Share URL
                            </Button>
                            
                    </div>

                    <div style={styles.row}>
                            <span style={styles.title}>{localizations.circles_invite_link}</span>
                            <Switch></Switch>
                            <span style={{ flex: 16, fontSize: '14px', fontFamily:'Lato' }}>{localizations.circles_link_member}</span>
                            {/* <Button variant='contained' color='primary' 
                            style={{ flex: 4, backgroundColor: colors.blue, fontSize: '15px', fontFamily: 'Lato', width: '80px' }}>
                            Next
                            </Button> */}
                            <div id='blankDiv' style={{ flex: 4 }}>
                            </div>
                    </div>                    

                    <div style={styles.row}>
                            <span style={styles.title}>{localizations.circles_activate_code}</span>
                            <Switch></Switch>
                            <span style={{ flex: 16, fontSize: '14px', fontFamily:'Lato' }}>{localizations.circles_find_code}</span>
                            {/* <Button variant='contained' color='primary' 
                            style={{ flex: 4, backgroundColor: colors.blue, fontSize: '15px', fontFamily: 'Lato', width: '80px' }}>
                            Next
                            </Button> */}
                            <div id='blankDiv' style={{ flex: 4 }}>
                            </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', marginTop: '20px'}}>
                        <div style={{ display: 'flex', flexDirection:'column', alignItems: 'center'}}>
                            <SportunityCodeBox code='4 5 6 7'></SportunityCodeBox>
                            <div style={{ marginTop: '20px', ...styles.smallText }}>{localizations.circles_access_code}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>


            <Card style={{ ...styles.cardContainer, marginTop: '20px' }}>
                <CardContent>
                    <div>
                        <p style={styles.boldText}>{localizations.circles_visibility}</p>
                        <br />
                        <p style={styles.smallText}>{localizations.circles_add_other_groups}</p>
                    </div>

                </CardContent>
            </Card>
        </div>
        )
    }
}


styles = {

    container: {
        display: 'flex',
        marginLeft:'0px',
        flexDirection: 'column',
        width: '80%',
        background: colors.transparent
    },

    cardContainer: {
        background: colors.white
    },

    header: {
        height: '60px',
        borderBottom: '1px solid ' + colors.black,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingBottom: '30px',
        marginBottom: '20px'
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
        margin: '5px'
    },

    verySmallLeftGap: {
        marginLeft: '1%'
    },

    row: {
        marginTop: '5px',
        marginLeft:'50px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },

    title: {
        fontFamily: 'Lato',
        fontSize: '18px',
        flex: 8
    },

    smallText: {
        fontFamily: 'Lato',
        fontSize: '14px'
    },

    boldText: {
        fontFamily: 'Lato',
        fontSize: '18px',
        fontWeight: 'bold'
    },

    leftColumn: {
        flex: 1,
        marginLeft: '10%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
    }

};


Privacy.propTypes = {
    onNextClick: PropTypes.func.isRequired
}


export default Privacy
