import React, { Component } from 'react'
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium'
import { colors } from '../../theme'

import localizations from '../Localizations'
import Button from '@material-ui/core/Button';

let styles

class NewGroupCircleItem extends Component {
  componentDidMount() {
  }

  render() {
    const { circle, addCircle, removeCircle } = this.props;
    let listType = {
      adults: localizations.circles_member_type_0,
      children: localizations.circles_member_type_1,
      teams: localizations.circles_member_type_2,
      clubs: localizations.circles_member_type_3,
      companies: localizations.circles_member_type_4,
    };

    return(

      <div style={styles.button}>
          <div style={styles.buttonIcon}>
            <img src="/images/icon_circle@3x.png"/>
            <div style={styles.numberContainer}>
                <span style={styles.number}>
                  {circle && circle.memberCount}
                </span>
            </div>
          </div>
          <div style={styles.circleDetails}>
            <div style={styles.leftSide}>
              <div style={styles.top}>
                <div style={styles.buttonText}>
                  {circle.name}
                </div>
                {circle.type &&
                <div style={styles.params}>
                  {localizations.circles_member_type + ' : '}
                  <span style={{color: colors.blue}}>{listType[circle.type.toLowerCase()]}</span>
                </div>
                }
              </div>

            </div>
            {addCircle &&
              <div style={styles.rightSide}>
                <Button
                  color="primary"
                  variant="contained"
                  onClick={addCircle}
                >
                  Add
                </Button>
              </div>
            }
            {removeCircle &&
            <div style={styles.rightSide}>
              <Button
                color="primary"
                variant="contained"
                onClick={removeCircle}
              >
                Remove
              </Button>
            </div>
            }
          </div>
      </div>

    )
  }
}

styles =  {
  params: {
    fontSize: 16,
    lineHeight: '20px'
  },
  button: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 600,
    maxWidth: '100%',
    // height: 70,
    backgroundColor: colors.white,
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12)',
    border: '1px solid #E7E7E7',
    borderRadius: 4,
    fontFamily: 'Lato',
    fontSize: 28,
    lineHeight: '42px',
    paddingLeft: 20,
    paddingRight:20,
    paddingTop: 14,
    paddingBottom: 14,
    marginTop: '20px',
    color: colors.black,
    position: 'relative',
    '@media (minWidth: 1024px)': {
      minWidth: 600,
    },
    '@media (maxWidth: 1024px)': {
      width: 'auto',
    },
  },
  leftSide: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginLeft: 10,
    flex: 6
  },
  circleDetails: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 8
  },
  top: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  },

  buttonText: {
    textDecoration: 'none',
    color: colors.blue,
    fontSize: 22,
    lineHeight: '30px'
  },
  buttonPseudo: {
    textDecoration: 'none',
    color: colors.darkGray,
    fontSize: 18,
    lineHeight: '30px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5
  },
  unsubScribeIcon: {
    color: colors.redGoogle,
    cursor: 'pointer',
    position: 'absolute',
    fontSize: 12,
    top: 5,
    right: 10,
    lineHeight: '12px',
    padding: '3px'
  },
  buttonIcon: {
    color: colors.blue,
    position: 'relative',
    display: 'flex',
    flex: 1
  },
  buttonLink: {
    color: colors.black,
    textDecoration: 'none',
    cursor: 'pointer',
    flex: 7,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  numberContainer: {
    position: 'absolute',
    top: '-6px',
    left: '20px',
    width: 24,
    textAlign: 'center'
  },
  number: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  rightSide: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: 16,
    lineHeight: '20px',
    flex: 1,
    justifyContent: 'flex-start'
  },
  icon: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    marginRight: 7,
    backgroundPosition: '50% 50%',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  },
}

export default createRefetchContainer(Radium(NewGroupCircleItem), {
//OK
  circle: graphql`
    fragment NewGroupCircleItem_circle on Circle {
      id
      name
      mode
      type
      isCircleUpdatableByMembers
      isCircleUsableByMembers
      memberCount
      owner {
        id
        pseudo
        avatar
      }
    }
  `,
});
