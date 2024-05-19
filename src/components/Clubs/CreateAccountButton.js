import React, { Component } from 'react'
import colors from './../../theme/colors'
import Radium from 'radium'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import { Link } from 'found'
import localizations from '../Localizations'

let styles ;

class CreateAccountButton extends Component {
  componentDidMount = () => {

  }
  render() {
		return (
      <div style={styles.container}>
        <Link to='register' style={styles.searchButton}>
            <span style={styles.button}>
                {localizations.club_register_for_free}
            </span>
        </Link>
      </div>
    );
  }
}

styles = {
  container: {
    height: '55px',
    boxShadow: '0 0 6px 0 rgba(0,0,0,0.5)',
    borderRadius: '100px',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-end',
    cursor: 'pointer'
  },
  button: {
    height: '100%',
    borderRadius: '100px',
    right: '0px',
    backgroundColor: colors.blue,
    boxSizing: 'border-box',
    paddingRight: 40,
    paddingLeft: 40,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    textDecoration: 'none',
    fontSize: 25, 
    fontFamily: 'Lato',
    color: '#fff',
    '@media (max-width: 850px)': {
      borderRadius: '100px 100px 100px 100px',
    },
    '@media (max-width: 375px)': {
      fontSize: 20,
    },
  },
  searchButton: {
    textDecoration: 'none',
  },
}


export default createFragmentContainer(Radium(CreateAccountButton), {
  viewer: graphql`
    fragment CreateAccountButton_viewer on Viewer {
      me {id}
    }
  `,
});