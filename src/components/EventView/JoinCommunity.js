import React from 'react'
import Radium from 'radium'

import { colors } from '../../theme'
import localizations from '../Localizations'
import Slider from "./Slider";
import ReactTooltip from 'react-tooltip'
import {withRouter} from 'found';

import CircleItem from '../../components/MyCircles/MyCirclesCircleItem';

let styles;

const TitleBorderBottom = ({ children }) => (
    <h2 style={styles.titleBorder}>{children}</h2>
);  

class JoinCommunity extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showJoinCommunity: false,
            mainCommunityCircle: null,
            notInCircle: false
        };
    }

    componentDidMount() {
        if (this.props.sportunity && this.props.sportunity.kind === 'PUBLIC' && this.props.sportunity.invited_circles && this.props.sportunity.invited_circles.edges && this.props.sportunity.invited_circles.edges.length > 0) {
            this.props.sportunity.invited_circles.edges.forEach(edge => {
                if (edge.node.mode === 'PUBLIC') {
                    if ((!this.props.user || (edge.node.owner.id !== this.props.user.id && edge.node.members.findIndex(member => member.id === this.props.user.id) < 0)))
                        this.setState({
                            notInCircle: true
                        });
                    this.setState({
                        showJoinCommunity: true,
                        mainCommunityCircle: edge.node
                    })
                }
            })
        }
    }

    joinMainCommunity = () => {
        let path = '/join-circle/' + this.state.mainCommunityCircle.id
        this.props.router.push({
          pathname: path,
        })
    }

    inviteMainCommunity = () => {
        let path = '/circle/' + this.state.mainCommunityCircle.id
        this.props.router.push({
          pathname: path,
        })
    }

    render() {
        let { notInCircle } = this.state;

        if (this.state.showJoinCommunity) 
            return(
                <div style={styles.container}>
                    <TitleBorderBottom>{localizations.event_joinCommunity}</TitleBorderBottom>
                    <div style={styles.joinCommunityContainer}>
                        <CircleItem
                            key={this.state.mainCommunityCircle.id}
                            circle={this.state.mainCommunityCircle}
                            viewer={this.props.viewer}
                            link={`/circle/${this.state.mainCommunityCircle.id}`}
                            handleRefetch={this.props.refetchAfterSubscribeOrUnsubscribe}
                            //openCircle={() => this.setState({tutorial3aIsVisible: false})}
                        >
                            {this.state.mainCommunityCircle.owner
                            ? this.state.mainCommunityCircle.name +
                                ' ' +
                                localizations.find_my_sport_clubs_of +
                                ' ' +
                                this.state.mainCommunityCircle.owner.pseudo
                            : this.state.mainCommunityCircle.name}
                        </CircleItem>
                    </div> 
                </div>
            )
        else return null;
    }
}

styles = {
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    borderBottom: `1px solid ${colors.lightGray}`,
    '@media (max-width: 900px)': {
        width: '100%',
        margin: '10px 0px'
    },
  },
  menuContainer: {
    position: 'relative',
    '@media (max-width: 900px)': {
        width: '100%',
        margin: '10px 0px'
    },
  },
  buttonsContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    '@media (max-width: 900px)': {
        width: '100%',
        position: 'relative',
        bottom: 'auto',
        top: 'auto',
        right: 'auto',
        flexDirection: 'column',
        marginTop: 5
    }
  },
  greenButton: {
    color: colors.white,
    padding: '7px',
    marginRight: 5,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    minWidth: 180,
    height: 40,
    fontFamily: 'Lato',
    cursor: 'pointer',
    border: 0,
    borderRadius: 5,
    transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
    ':hover': {
        filter: 'brightness(0.9)'
    },
    ':disabled': {
        backgroundColor: colors.lightGray,
        color: colors.darkGray
    },
    ':active': {
        outline: 'none'
    },
    '@media (max-width: 900px)': {
        width: '100%'
    }
  },
  button: {
    color: colors.white,
    padding: '7px',
    marginRight: 5,
    marginTop: 5,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    minWidth: 180,
    height: 40,
    fontFamily: 'Lato',
    cursor: 'pointer',
    border: 0,
    borderRadius: 5,
    transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
    ':hover': {
        filter: 'brightness(0.9)'
    },
    ':disabled': {
        backgroundColor: colors.lightGray,
        color: colors.darkGray
    },
    ':active': {
        outline: 'none'
    },
    '@media (max-width: 900px)': {
        width: '100%'
    }
  },
  redButton: {
    backgroundColor: colors.redGoogle,
    color: colors.white,
    padding: '7px',
    marginRight: 5,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    minWidth: 180,
    height: 40,
    fontFamily: 'Lato',
    cursor: 'pointer',
    border: 0,
    transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
    borderRadius: 5,
    ':hover': {
        filter: 'brightness(0.9)'
    },
    ':disabled': {
        backgroundColor: colors.lightGray,
        color: colors.darkGray
    },
    ':active': {
        outline: 'none'
    },
    '@media (max-width: 900px)': {
        width: '100%',
        marginTop: 10
    }
  },
  grayButton: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: colors.darkGray,
    fontSize: 20,
    padding: '7px',
    cursor: 'pointer',
    height: 40,
    width: 40,
    border: 0,
    transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
	  '@media (max-width: 900px)': {
		  width: '100%',
	  },
    ':hover': {
    },
    ':active': {
        outline: 'none'
    },
  },
  icon: {
    fontSize: 24,
    marginRight: 7
  },
  plusMenuContainer: {
    position: 'absolute',
    zIndex: 200,
    color: colors.darkGray,
    width: 180,
    left: 40,
    top: 0,
    '@media (max-width: 900px)': {
        right: 20,
        top: 30,
    },
  },
  plusMenuItem: {
    width: '100%',
    backgroundColor: colors.lightGray,
    color: colors.darkGray,
    border: 'none',
    fontSize: 16,
    fontFamily: 'Lato',
    padding: '5px 10px',
    cursor: 'pointer',
    transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
    ':hover': {
        filter: 'brightness(0.9)'
    },
    ':active': {
        outline: 'none'
    }
  },
  separator: {
    borderTop: '1px solid rgba(0,0,0,0.25)',
    borderBottom: '0px solid rgba(0,0,0,0.25)',
    borderLeft: '0px solid rgba(0,0,0,0.25)',
    borderRight: '0px solid rgba(0,0,0,0.25)',
    margin: 0
  },
  joinCommunityContainer: {
    margin: '10px 20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    '@media (max-width: 900px)': {
        width: '100%'
    },
  },
  communityDesc: {
    backgroundColor: colors.lightGray,
    padding: '7px 15px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    minWidth: 180,
    minHeight: 40,
    fontFamily: 'Lato',
    border: 0,
    '@media (max-width: 900px)': {
        width: '100%'
    }
  },
  orangeButton: {
    backgroundColor: colors.bloodOrange,
    color: colors.white,
    padding: '7px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    height: 40,
    fontFamily: 'Lato',
    cursor: 'pointer',
    border: 0,
    width: '100%',
    marginTop: 3,
    transition: 'all cubic-bezier(0.22,0.61,0.36,1) .3s',
    ':hover': {
        filter: 'brightness(0.9)'
    },
    ':active': {
        outline: 'none'
    }
  },
  buttonIcon: {
    color: colors.blue,
    position: 'relative',
    display: 'flex',
    flex: 1,
    marginRight: 5
  },
  circleIcon: {
    width: 35,
    height: 25,
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
    top: '2px',
    left: '11px',
    width: 24,
    textAlign: 'center'
  },
  number: {
    fontSize: 15,
    fontWeight: 'bold'
  },
  buttonText: {
    textDecoration: 'none',
    color: colors.blue,
    fontSize: 18,
  },
  buttonPseudo: {
    textDecoration: 'none',
    color: colors.darkGray,
    fontSize: 16,
    lineHeight: '30px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3
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
  bottom: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: 14,
    color: colors.darkGray,
    marginLeft: 10
    //color: colors.blue
  },
  avatar: {
    width: 25,
    height: 25,
    borderRadius: '50%',
    marginRight: 7,
    backgroundPosition: '50% 50%',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  },
  titleBorder: {
    display: 'flex',
    paddingLeft: '20px',
    height: '50px',
    lineHeight: '50px',
    fontSize: '25px',
    fontWeight: 'bold',
    color: 'rgba(0,0,0,0.65)',
    marginTop: 20
  },
};


export default withRouter(Radium(JoinCommunity))