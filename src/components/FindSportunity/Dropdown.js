import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import Radium from 'radium';
import { colors } from '../../theme';

let styles;

class Dropdown extends PureComponent {
  render() {
    const { open, children, style } = this.props;
    const finalStyle = { ...styles.container, ...style };
    return open && (
      <div
        style={finalStyle}
      >
        {children}
      </div>
    );
  }
}

styles = {
  container: {
    backgroundColor: colors.white,
    boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
    border: '2px solid rgba(94,159,223,0.83)',
    padding: 20,

    overflowY: 'scroll',
    overflowX: 'hidden',

    zIndex: '100',
  },


}


export default Radium(Dropdown);
