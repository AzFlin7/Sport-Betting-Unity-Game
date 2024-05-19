import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import Radium from 'radium';
import { fonts, colors } from '../../theme';

let styles;


const Button = pure((props) => {
  const { style, children, ...rest } = props;
  const finalStyle = Object.assign({}, styles.button, style);
  return (
    <button style={finalStyle} {...rest}>{children}</button>
  );
})


styles = {
  button: {
    padding: '32px 38px',

    backgroundColor: '#32C760',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',

    color: colors.white,

    // fontSize: fonts.size.xl,
    fontSize: '20px',
    fontWeight: fonts.weight.medium,
    letterSpacing: 1,

    borderRadius: 69,
    borderStyle: 'none',

    textTransform: 'uppercase',

    cursor: 'pointer',

    ':disabled': {
      cursor: 'not-allowed',
      opacity: 0.7,
    },
  },
}


export default Radium(Button);
