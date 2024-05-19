import React from 'react';
import ReactLoading from 'react-loading';
import { colors } from '../../../theme';

let styles;
const Loading = ({transparent = false}) => (
  <div style={transparent ? styles.transparentContainer : styles.container}>
    <img src="/images/logo-blue@3x.png" width="120" alt="logo-blue" />
    <ReactLoading type="cylon" color={colors.blue} />
  </div>
);

styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'fixed',
    flexDirection: 'column',
    top: -65,
    left: 0,
    bottom: 0,
    right: 0,
    overflow: 'auto',
    background: colors.white,
    zIndex: 1000,
    margin: '62px 0px 0px'
  },
  transparentContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'fixed',
    flexDirection: 'column',
    top: -65,
    left: 0,
    bottom: 0,
    right: 0,
    overflow: 'auto',
    background: 'rgba(150, 150, 150, 0.5)',
    zIndex: 1000,
    margin: '62px 0px 0px'
  },
};

export default Loading;
