import React, { Component } from 'react'
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium'
import { withRouter } from 'found'
import {Link} from 'found'
import { colors } from '../../../theme'

import localizations from '../../Localizations'

let styles

class CircleItem extends Component {
  componentDidMount() {
    if (this.props.circle && this.props.circle.id) {
      this.props.relay.refetch(fragmentVariables => ({
        ...fragmentVariables,
        circleId: this.props.circle.id
      }))
    }
  }

  goToCircle = () => {
    if (this.props.circle.owner.profileType === 'PERSON')
      this.props.router.push('/circle/' + this.props.circle.id + '/statistics');
    else
      this.props.router.push('/profile-view/' + this.props.circle.owner.id + '/statistics');
  };

  render() {
    const { circleIsMine, unSubscribe, onCircleClicked, viewer, circle } = this.props;

    return(

      <div style={styles.button}>
        <div style={styles.buttonLink} onClick={() => this.goToCircle()}>
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
                  {circle && circle.name}
                </div>
                {circle && circle.owner &&
                <div style={styles.buttonPseudo}>
                  <div style={{...styles.icon, backgroundImage: 'url('+circle.owner.avatar || "../../img/profile.png" +')'}} />
                  {circle.owner.pseudo}
                </div>
                }
              </div>
            </div>
            <div style={{fontSize: 16, color: colors.blue}}>{localizations.profile_statistics_showStat}</div>
            <div style={styles.bottom}>
              {!circleIsMine &&
              <div>
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
    '@media (maxWidth: 1024px)': {
      width: 'auto',
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
    fontSize: 18,
    lineHeight: '30px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3
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
    lineHeight: '20px'
    //color: colors.blue
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
};

export default createRefetchContainer(Radium(withRouter(CircleItem)), {
//OK
  viewer: graphql`
    fragment CircleItem_viewer on Viewer @argumentDefinitions(
      circleId: {type: "ID", defaultValue: null}
      ){
      circle (id: $circleId) {
        id
        name
        mode
        owner {
          id
          pseudo
          avatar
          profileType
        }
        isCircleUpdatableByMembers
        isCircleUsableByMembers
        memberCount
      }
    }
  `,
},
graphql`
query CircleItemRefetchQuery(
    $circleId: ID
) {
viewer {
    ...CircleItem_viewer
    @arguments(
        circleId: $circleId
    )
}
}
`,
)
