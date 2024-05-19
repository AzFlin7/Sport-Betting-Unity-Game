import React, { Component } from 'react';
import Radium from 'radium';
import { Link } from 'found'
const RLink = Radium(Link)

import colors from './../../../theme/colors'
import TagItem from './TagItem';
import localizations from '../../Localizations'

let styles 

const YouAreBloc = ({color}) => (
    <div style={{...styles.youAreContainer, backgroundColor: color}}>
        <p style={styles.youAreTitle}>
            {localizations.home_youAre}
        </p>
        <p>
            <RLink key={'1'} to='/' style={{...styles.youAreLink, borderRight: '1px solid white'}}>
                {localizations.home_particuliers}
            </RLink>
            <RLink key={'2'} to='/clubs' style={{...styles.youAreLink, borderRight: '1px solid white'}}>
                {localizations.home_club}
            </RLink>
            <RLink key={'3'} to='/companies' style={{...styles.youAreLink, borderRight: '1px solid white'}}>
                {localizations.home_enterprise}
            </RLink>
            <RLink key={'4'} to='/venues' style={{...styles.youAreLink, borderRight: '1px solid white'}}>
                {localizations.home_facility}
            </RLink>
            <RLink key={'5'} to='/universities' style={styles.youAreLink}>
                {localizations.home_university}
            </RLink>
          </p>
        </div>
    )



styles = {
    youAreContainer: {
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center',
    },
    youAreTitle: {
        color: colors.white,
        fontFamily: 'Lato',
        fontSize: '16px',
        fontWeight: 'bold',
        margin: '5px auto 15px auto',
        '@media (maxWidth: 600px)': {
            fontSize: '12px',
        },
    },
    youAreLink: {
        color: colors.white,
        textDecoration: 'none',
        fontFamily: 'Lato',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer' ,
        padding: '0px 15px',
        lineHeight: "32px",
        ':hover': {
            color: colors.lightGray
            },
        '@media (maxWidth: 600px)': {
            fontSize: '14px',
        },
    },
};


export default Radium(YouAreBloc);