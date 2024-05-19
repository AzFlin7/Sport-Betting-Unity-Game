import React, { Component } from 'react'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import { Link } from 'found'
import Radium from 'radium'
import { colors } from '../../theme'

import localizations from '../Localizations'

let styles

class FindCircleItem extends Component {
  componentDidMount() {
  }

  render() {
    const { circle, circleIsMine } = this.props;
    let typeList = [{key: 'ADULTS', name: localizations.circles_member_type_0},
      {key: 'CHILDREN', name: localizations.circles_member_type_1},
      {key: 'TEAMS', name: localizations.circles_member_type_2},
      {key: 'CLUBS', name: localizations.circles_member_type_3},
      {key: 'COMPANIES', name: localizations.circles_member_type_4},
    ];
    
    return(
      
        <div style={styles.button}>
          <Link to={this.props.link} style={styles.buttonLink} onClick={() => this.props.openCircle()}>
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
                  {circle.owner && 
                    <div style={styles.buttonPseudo}>
                      <div style={{...styles.icon, backgroundImage: 'url('+circle.owner.avatar || "../../img/profile.png" +')'}} />
                      {circle.owner.pseudo}
                    </div>
                  }
                  {circle.type &&
                  <div style={styles.buttonType}>
                    {localizations.circles_member_type + ' : '} 
                    <span style={{color: colors.blue, marginLeft: 5}}>{typeList.find(element => element.key === circle.type).name}</span>
                  </div>
                  }
                </div>
              </div>
              {!circleIsMine &&
                  <div style={styles.bottom}>
                    <div>
                      {circle && circle.mode === 'PRIVATE' 
                      ? localizations.circles_private
                      : localizations.circles_public}
                    </div>
                    {circle && circle.isCircleUsableByMembers && 
                      <div>{localizations.circles_shared}</div>
                    }
                  </div>
              }
            </div>
          </Link>
        </div>
      
    )
  }
}

styles =  {
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
    '@media (max-width: 1024px)': {
      width: '94%',
    },
  },
  leftSide: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginLeft: 10
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
    fontSize: 16,
    lineHeight: '30px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    '@media (max-width: 375px)': {
      fontSize: 16,
    },
  },
  buttonType: {
    textDecoration: 'none',
    color: colors.darkGray,
    fontSize: 14,
    lineHeight: '20px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    '@media (max-width: 375px)': {
      fontSize: 16,
    },
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
  bottom: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: 16,
    //color: colors.blue
  },
  icon: {
    width: 25,
    height: 25,
    borderRadius: '50%',
    marginRight: 7,
    backgroundPosition: '50% 50%',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  },
}

export default createFragmentContainer(Radium(FindCircleItem), {
  circle: graphql`
    fragment FindCircleItem_circle on Circle {
      id
      name
      mode
      isCircleUpdatableByMembers
      isCircleUsableByMembers
      memberCount
      type
      owner {
        id
        pseudo 
        avatar
      }
    }
  `,
})