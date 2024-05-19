import React, { Component } from 'react';
import colors from './../../theme/colors';

import Radium from 'radium';

let styles ;

class HeaderImageNavigator extends Component {
  render() {
    return (
      <div style={styles.container}>
          <span style={styles.span} >
            <i style={styles.span.icon} className="fa fa-search" aria-hidden="true"></i>
            <input style={styles.span.input} placeholder="Your Sport" onChange={this.props.onSportFilterChange}/>
          </span>

          <span style={styles.span} >
            <i style={styles.span.icon} className="fa fa-map-marker" aria-hidden="true"></i>
            <input style={styles.span.input} placeholder="Your Location" onChange={this.props.onLocationFilterChange}/>
          </span>

          <span style={styles.span1} > {/* whole of this is clickable for search */}
            <p style={styles.span.inputSearch}>Search</p>
            <i style={styles.span.iconSearch} className="fa fa-arrow-right" aria-hidden="true"></i>
          </span>
        </div>
    );
  }
}

styles = {
  container: {
    width: '63%',
    height: '67px',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 0 6px 0 rgba(0,0,0,0.5)',
    borderRadius: '100px',
    zIndex: '1',
    position: 'absolute',
    left: '19%',
    top: '250px',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-end',
    '@media (max-width: 960px)': {
      width: '94%',
      left: '3%',
    }
  },
  span: {
      height: '100%',
      width: '37%',
      boxSizing: 'border-box',
      padding: '2%',
      borderRight: '1px #ccc solid',
      display: 'inline-flex',

      icon: {
        fontSize: '30px',
        color: '#ccc',
        '@media (max-width: 480px)': {
          fontSize: '18px',
          lineHeight: '52px',
        }
      },
      iconSearch: {
        fontSize: '30px',
        color: '#fff',
        marginLeft: '15%',
        '@media (max-width: 480px)': {
          fontSize: '18px',
          display: 'none',
        }
        
      },
      input: { /* shall toggle, from <p> to <input> */ 
        marginLeft: '6%',
        width: '100%',
        border: 'none',
        fontFamily: 'Lato',
        fontSize: '24px',
        color: '#ccc',
        display: 'inline',
        '@media (max-width: 480px)': {
          fontSize: '18px',
        },
        '@media (max-width: 320px)': {
          fontSize: '14px',
        }
      },
      inputSearch: {
        marginLeft: '15%',
        fontFamily: 'Lato',
        fontSize: '24px',
        display: 'inline',
        color: colors.white,
        '@media (max-width: 1024px)': {
          marginLeft: '0',
        },
        '@media (max-width: 480px)': {
          fontSize: '18px',
          display: 'inline-block',
          marginTop: '13px',
        },
        '@media (max-width: 320px)': {
          fontSize: '14px',
          display: 'inline-block',
          marginTop: '20px',
        }
      },
  },
  span1 : {
    width: '25%',
    height: '100%',
    borderRadius: '100px',
    borderTopLeftRadius: '0px',
    borderBottomLeftRadius: '0px',
    right: '0px',
    backgroundColor: colors.blue,
    boxSizing: 'border-box',
    padding: '2%',
  },
}


export default Radium(HeaderImageNavigator);