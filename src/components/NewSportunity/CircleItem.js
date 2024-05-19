import React, { Component } from 'react'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import {Link} from 'found'
import Radium from 'radium'
import { colors } from '../../theme'

import localizations from '../Localizations'

let styles

class CircleItem extends Component {
  componentDidMount() {
  }

  render() {
    const { circle, circleIsMine, viewer } = this.props;
    let typeList = [{key: 'ADULTS', name: localizations.circles_member_type_0},
      {key: 'CHILDREN', name: localizations.circles_member_type_1},
      {key: 'TEAMS', name: localizations.circles_member_type_2},
      {key: 'CLUBS', name: localizations.circles_member_type_3},
      {key: 'COMPANIES', name: localizations.circles_member_type_4},
    ];
    
    return(
      
        <div style={styles.button}>
          <div style={styles.buttonLink}>
            <div style={styles.buttonIcon}>
              <img src="/images/Group.svg"/>
              <div style={styles.numberContainer}>
                <span style={styles.number}>
                  {circle && circle.memberCount}
                </span>
              </div>
            </div>
            <div style={styles.circleDetails}>
              <Link to={this.props.link} target="_blank" style={styles.leftSide} onClick={() => this.props.openCircle()}>
                <div style={styles.top}>
                  <div style={styles.buttonText}>
                    {circle.name}
                  </div>
                  {circle.owner && 
                    <div style={styles.buttonPseudo}>
                     <div style={{...styles.smallAvatar, backgroundImage: circle.owner.avatar ? 'url('+ circle.owner.avatar +')' : 'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")'}} />
                      {circle.owner.pseudo}
                    </div>
                  }
    
                </div>
              </Link>
              {!circleIsMine &&
                 <div style={styles.bottom}>
                  <div style={styles.bottomBtn} onClick={() => this.props.inviteCircle()}>
                    {viewer.me && viewer.me.profileType !== 'PERSON' ?  localizations.newSportunity_invitedList_modal_addClub : localizations.newSportunity_invitedList_modal_add}
                  </div>
                  </div>
              }
            </div>
          </div>
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
    maxWidth: '100%',
    // height: 70,
    backgroundColor: colors.white,
    border: '0px solid #A6A6A6',
    borderRadius: 4,
    fontFamily: 'Lato',
    fontSize: 28,
    lineHeight: '42px',
    paddingLeft: 0,
    marginBottom: '5px',
    color: colors.black,
    position: 'relative',
    boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
  },
  leftSide: {
    display: 'flex',
	  color: colors.black,
	  textDecoration: 'none',
	  cursor: 'pointer',
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginLeft: 0
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
    fontSize: 13,
    lineHeight: '15px'
  },
  buttonPseudo: {
    textDecoration: 'none',
    color: colors.darkGray,
    fontSize: 11,
    lineHeight: '16px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    '@media (max-width: 375px)': {
      fontSize: 11,
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
        flex: 1,
        marginRight: 5,
        color: '#333',
        //backgroundColor: '#64a5d8',
        padding: '8px 5px', 
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
        top: '4px',
        left: '1px',
        width: 30,
        textAlign: 'center'
  },
  number: {
    fontSize: 10,
    fontWeight: 'bold'
  },
  bottom: {
    display: 'flex',
    flexDirection: 'column',

  },
  bottomBtn: {
    color: '#fff',
    fontSize: 10,
    marginRight: 10,
    cursor: 'pointer',
    backgroundColor: '#64A5D7',
    padding:'6px 8px',
    lineHeight:'11px',
    height:24,
  },
  circleBottomContent: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
},
ownerContainer: {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  fontSize: 11
},
smallAvatar: {
  width: 20,
  height: 20,
  marginRight: 10,
  color: colors.blue,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  borderRadius: '50%',
},

}

export default createFragmentContainer(Radium(CircleItem), {
  circle: graphql`
    fragment CircleItem_circle on Circle {
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