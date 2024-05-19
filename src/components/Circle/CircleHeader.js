import React from 'react';
import Radium from 'radium';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { withAlert } from 'react-alert';

import { colors } from '../../theme';
import localizations from '../Localizations';
import Sharing from './Sharing';
import { appUrl } from '../../../constants';
import Button from '@material-ui/core/Button';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import Grid from '@material-ui/core/Grid';
let styles;

class Header extends React.Component {
  openOwnerProfile = () => {
    const to = `/profile-view/${this.props.circle.owner.id}`;
    this.props.router.push(to);
  };

  _handleCopyURL = () => {
    this.synchronizeLink.disabled = false;
    this.synchronizeLink.select();
    document.execCommand('copy');
    this.synchronizeLink.disabled = true;
    this.props.alert.show(localizations.popup_copyCircle_link, {
      timeout: 2000,
      type: 'success',
    });
  };

  render() {
    const {
      viewer,
      user,
      circle,
      isCurrentUserTheOwner,
      isCurrentUserCoOwner,
      addMemberComponent,
      joinGroupComponent,
    } = this.props;

    // let listType = {
    //   adults: localizations.circles_member_type_0,
    //   children: localizations.circles_member_type_1,
    //   teams: localizations.circles_member_type_2,
    //   clubs: localizations.circles_member_type_3,
    //   companies: localizations.circles_member_type_4,
    // };

    return (
      <div style={styles.header}>
        <Grid container spacing={16}>
          <Grid item xs>
            <img src="/images/Group.svg" style={{ width:"130px", height:"130px" }} />
          </Grid>
          <Grid item xs container direction="column" spacing={16}>
            <Grid item>
              <h1 style={styles.title}>{circle.name}</h1>
            </Grid>
            <Grid item>
              <div style={styles.memberCount}>
                {circle.memberCount} {localizations.circles_members}
              </div>
            </Grid>
            {circle.address && (
              <Grid item>
                <div style={styles.ownerPseudo}>
                  <LocationOnIcon />
                  {circle.address.city}
                </div>
              </Grid>
            )}
            <Grid item>
              <div style={styles.ownerInfoContainer}>
                <div
                  onClick={this.openOwnerProfile}
                  style={{
                    ...styles.icon,
                    backgroundImage: circle.owner.avatar
                      ? `url(${circle.owner.avatar})`
                      : 'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")',
                  }}
                />
                <div
                  style={styles.ownerPseudo}
                  onClick={this.openOwnerProfile}
                >
                  {circle.owner.pseudo}
                </div>
              </div>
            </Grid>
          </Grid>
          <Grid item xs container direction="column" justify="flex-end">
            {isCurrentUserTheOwner || isCurrentUserCoOwner
              ? addMemberComponent
              : joinGroupComponent()}
          </Grid>
          <Grid item xs container direction="column" justify="flex-end">
            {circle.isCircleAccessibleFromUrl && (
              <div>
                <input
                  ref={ref => (this.synchronizeLink = ref)}
                  style={{ opacity: 0, position: 'absolute', width: 8 }}
                  value={`${appUrl}/circle/${circle.id}`}
                />
                <Button
                  onClick={this._handleCopyURL}
                  variant="outlined"
                  color="primary"
                >
                  {localizations.circle_share_url}
                </Button>
              </div>
            )}
          </Grid>
        </Grid>
        <div style={styles.sideContainer}>
          <Sharing
            sharedUrl={appUrl + this.props.match.location.pathname}
            title={`Circle: ${circle.name}`}
          />
        </div>
      </div>
    );
  }
}

styles = {
  header: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    backgroundColor: colors.white,
    color: colors.blue,
    fontFamily: 'Lato',
    padding: '30px 42px 30px',
    position: 'relative',
    '@media (max-width: 600px)': {
      padding: '30px 30px 30px',
    },
    '@media (max-width: 750px)': {
      display: 'block',
    },
  },
  sideContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    position: 'absolute',
    right: 5,
    top: 5,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    alignItems: 'stretch',
  },
  secondRow: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginLeft: 100,
    '@media (max-width: 850px)': {
      marginLeft: 10,
    },
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flex: 9,
  },
  title: {
    fontSize: '28px',
    maxWidth: 500,
    fontWeight: 'bold',
    color: colors.blue,
    marginBottom: 20,
  },

  bottomStretchedRow: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  },

  memberCount: {
    marginTop: '5px',
    maxWidth: 500,
    fontSize: 16,
    color: colors.darkGray,
  },

  left: {
    display: 'flex',
    alignItems: 'stretch',
    flex: 1,
    '@media (max-width: 480px)': {
      display: 'block',
      textAlign: 'center',
    },
  },
  right: {
    display: 'flex',
    alignItems: 'flex-start',
    '@media (max-width: 480px)': {
      display: 'block',
      textAlign: 'center',
    },
  },

  leftCol: {
    color: colors.white,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    marginRight: 30,
    '@media (max-width: 480px)': {
      margin: '0 auto 10px auto',
    },
  },

  ownerInfoContainer: {
    display: 'flex',
    flexDirection: 'row',
  },

  circleInfoContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flex: 1,
  },

  circleInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1,
  },

  numberContainer: {
    position: 'absolute',
    top: '10px',
    left: '26px',
    width: 35,
    textAlign: 'center',
  },
  number: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Lato',
  },
  icon: {
    minWidth: 25,
    minHeight: 25,
    maxWidth: 25,
    maxHeight: 25,
    borderRadius: '50%',
    marginRight: 7,
    backgroundPosition: '50% 50%',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    flex: 1,
    cursor: 'pointer',
    alignSelf: 'center',
  },
  ownerPseudo: {
    textDecoration: 'none',
    color: colors.gray,
    fontSize: 16,
    lineHeight: '25px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: '10px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  info: {
    color: colors.blue,
    fontSize: 18,
  },
  privateOrPublic: {
    fontSize: 20,
    color: colors.black,
    fontFamily: 'Lato',
    marginLeft: 90,
    marginBottom: 10,
  },
  editButton: {
    marginLeft: 25,
    fontSize: 22,
    color: colors.darkBlue,
    cursor: 'pointer',
  },

  addButton: {
    fontSize: '15px',
    backgroundColor: colors.blue,
    color: colors.white,
    marginRight: '20px',
    textTransform: 'none',
  },
  shareButton: {
    fontSize: '15px',
    backgroundColor: colors.white,
    color: colors.blue,
    border: `1px solid ${colors.blue}`,
    marginRight: '20px',
    textTransform: 'none',
  },
};

export default createFragmentContainer(Radium(withAlert(Header)), {
  viewer: graphql`
    fragment CircleHeader_viewer on Viewer {
      id
    }
  `,
  user: graphql`
    fragment CircleHeader_user on User {
      id
    }
  `,
  circle: graphql`
    fragment CircleHeader_circle on Circle {
      id
      name
      owner {
        id
        pseudo
        avatar
      }
      memberCount
      type
      isCircleUsableByMembers
      mode
      address {
        address
        city
        country
        position {
          lat
          lng
        }
      }
      isCircleAccessibleFromUrl
    }
  `,
});
