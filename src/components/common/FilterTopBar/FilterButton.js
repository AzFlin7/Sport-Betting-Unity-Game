import React from 'react';
import PureComponent, { pure } from '../PureComponent'
import { colors, metrics, fonts } from '../../../theme';
import { Button } from '@material-ui/core';

let styles;

class FilterButton extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      selected: false
    }
  }


  render() {
    return (
        <div style={ styles.container }>
          <Button
            onClick={this.props.onFilterSelected}
            style={ this.props.selected ? styles.selectedButton : styles.unselectedButton }
          >
            {this.props.label}
          </Button>
          {this.props.hideCloseIcon === true 
          ? null 
          : this.props.canBeDeleted && 
              <i className="material-icons" onClick={this.props.onFilterDeleted} style={this.props.icon ? styles.iconRemoveLeft : styles.iconRemove}>{this.props.icon || 'clear'}</i>
          }
          </div>
    );
  }
}

styles = {
  container: {
    marginLeft: '10px',
    minWidth: 'min-content',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  }
  ,

  unselectedButton: {
    color: colors.white,
    fontFamily: 'inherit',
    backgroundColor: colors.blue,
    fontSize: '12px',
    textTransform: "none",
    height: '30px',
    minHeight: '20px',
    paddingTop: '0px',
    paddingBottom: '0px',
    paddingRight: '1.3rem',
    paddingLeft: '1.3rem',
    boxShadow: '1px 0 4px 0 rgba(0,0,0,0.6)',
  },

  selectedButton: {
    color: colors.white,
    backgroundColor: colors.lightGreen,
    fontSize: '12px',
    textTransform: "none",
    height: '30px',
    minHeight: '20px',
    paddingTop: '0px',
    paddingBottom: '0px',
    paddingRight: '1.3rem',
    fontFamily: 'inherit',
    paddingLeft: '1.3rem',
    boxShadow: '1px 0 4px 0 rgba(0,0,0,0.6)',
  },
  iconRemoveLeft: {
    marginLeft: '5px',
    position: 'absolute',
    cursor: 'pointer',
    fontSize: '13px',
    zIndex: '9',
    color: colors.white
  },
  iconRemove: {
    marginLeft: '-15px',
    position: 'inherit',
    cursor: 'pointer',
    fontSize: '12px',
    zIndex: '9',
    color: colors.white,
    marginTop: 2
  }
};

export default FilterButton;
