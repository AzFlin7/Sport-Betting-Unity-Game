import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium';
import { withAlert } from 'react-alert'
import {Link} from 'found'

import { colors } from '../../theme';
import localizations from '../Localizations'
import {confirmModal} from '../common/ConfirmationModal'

import FollowMutation from './FollowUserMutation.js';
import UnfollowMutation from './UnfollowUserMutation.js';
import AddToCalendar from './AddToCalendar'
import InputEditMode from './InputEditMode';
import UpdateUserPseudoMutation from './UpdateUserPseudoMutation';
import UpdateUserAvatarMutation from './UpdateUserAvatarMutation';
import Avatar from './Avatar';


let styles;
class Header extends PureComponent {

  constructor () {
    super();
    this.state = {
      isFollowing: false
    }
    this.alertOptions = {
      offset: 60,
      position: 'top right',
      theme: 'light',
      transition: 'fade',
    };
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.viewer && nextProps.viewer.me && nextProps.user)
      this.checkIfUserIsFollower(nextProps.user.followers, nextProps.viewer.me.id);
  }

  checkIfUserIsFollower = (followers, meId) => {
    followers.forEach(follower => {
      if(follower.id === meId) {
         this.setState({ isFollowing: true });
         return false;
      } else {
        this.setState({ isFollowing: false });
        return false;
      }
    });
  }

  confirmFollowUser = () => {
    if (this.props.viewer && this.props.viewer.me) {
      if (this.props.viewer.me.id === this.props.user.id) {
        this.props.alert.show(localizations.profile_follow_self_user_error, {
          timeout: 3000,
          type: 'info',
        });

        return ;
      }

      if (this.state.isFollowing) {
        confirmModal({
          title: localizations.formatString(localizations.profile_unfollow_user_confirm_title, this.props.user.pseudo),
          message: localizations.formatString(localizations.profile_unfollow_user_confirm_message, this.props.user.pseudo),
          confirmLabel: localizations.profile_unfollow_user_confirm_yes,
          cancelLabel: localizations.profile_unfollow_user_confirm_no,
          onConfirm: () => {
            this.unfollowUser()
          },
          onCancel: () => {}
        })
      }
      else {
        this.followUser();
      }
    }
    else {
      this.props.alert.show(localizations.profile_follow_user_not_loggedin, {
        timeout: 3000,
        type: 'info',
      });
    }
  }

  followUser = () => {
    const {viewer} = this.props ;

    FollowMutation.commit({
        viewer,
        userId: this.props.user.id,
        meId: this.props.viewer.me.id,
      },
      {
        onFailure: error => {
          this.props.alert.show(localizations.profile_follow_user_failed, {
            timeout: 3000,
            type: 'error',
          });
          let errors = JSON.parse(error.getError().source);
          console.log(errors);
        },
        onSuccess: (response) => {
          this.setState({
            isFollowing: true
          })
          this.props.alert.show(localizations.formatString(localizations.profile_follow_user_success, this.props.user.pseudo), {
            timeout: 3000,
            type: 'success',
          });
        },
      }
    )
  }

  unfollowUser = () => {
    const {viewer} = this.props ;

    UnfollowMutation.commit({
        viewer,
        userId: this.props.user.id,
      },
      {
        onFailure: error => {
          this.props.alert.show(localizations.profile_unfollow_user_failed, {
            timeout: 3000,
            type: 'error',
          });
          let errors = JSON.parse(error.getError().source);
          console.log(errors);
        },
        onSuccess: (response) => {
          this.setState({
            isFollowing: false
          })
          this.props.alert.show(localizations.formatString(localizations.profile_unfollow_user_success, this.props.user.pseudo), {
            timeout: 3000,
            type: 'success',
          });
        },
      }
    )
  }

  _updatePseudo = () => {
    const userID = this.props.user.id;
    const { pseudo } = this.state;

    if (pseudo.length === 0) {
      this.props.alert.show(localizations.popup_profileView_cant_be_empty, {
        timeout: 2000,
        type: 'error',
      });

      return false;
    }

    this.props.relay.refetch(fragmentVariables => ({
      ...fragmentVariables,
      pseudo: pseudo,
      requestUserExists: true
    }),
    null,
    () => {
      if (this.props.viewer.userExists) {
        this.props.alert.show(localizations.registration_user_already_exists, {
          timeout: 2000,
          type: 'error',
        });
      }
      else {
        UpdateUserPseudoMutation.commit({
          userID,
          user: {
            pseudo,
          },
        },
        {
          onSuccess: () => {
            this.props.alert.show(localizations.popup_updateVenue_success, {
              timeout: 2000,
              type: 'success',
            });
            this.setState({ edit: false });
          },
          onFailure: error => {
            let errors = JSON.parse(error.getError().source);
            console.log(errors);
          },
        });
      }
    })
  }

  _updatePublicAddress = () => {
    const userID = this.props.user.id;
    const { publicAddress } = this.state;

    UpdateUserPseudoMutation.commit({
      userID,
      user: {
        publicAddress: publicAddress
        ? {
            address: '',
            city: publicAddress.city,
            country: publicAddress.country
          }
        : null
      },
    },
    {
      onSuccess: () => {
        this.props.alert.show(localizations.popup_updateVenue_success, {
          timeout: 2000,
          type: 'success',
        });
        this.setState({ edit: false });
      },
      onFailure: error => {
        let errors = JSON.parse(error.getError().source);
        console.log(errors);
      },
    });
  }

  _updateAvatar = (file) => {
    const userID = this.props.user.id;

    UpdateUserAvatarMutation.commit({
      userID,
    },
    {
      onSuccess: () => {
        this.props.alert.show(localizations.popup_updateVenue_success, {
          timeout: 2000,
          type: 'success',
        });
        this.setState({ edit: false });
      },
      onFailure: error => {
        let errors = JSON.parse(error.getError().source);
        console.log(errors);
      },
    },
    file
    );
  }

  _handleAddressChange = value => {
    if (value) {
			const {label} = value; 
			if (label) {
				const splitted = label.split(', ');

				const country = splitted[splitted.length - 1] || '';
				const city = splitted[splitted.length - 2] || '';

				this.setState({
					publicAddress: {
						country,
						city,
					},
				});
			}
			else {
				this.setState({
					publicAddress: null,
				});
			}
		}
		else {
			this.setState({
				publicAddress: null
			});
		}
  }

  render() {
    const { user, viewer, isSelfProfile } = this.props ;

    let pastEventCount = user && user.sportunitiesCount.count || 0;
    let upcomingEventCount = viewer.sportunitiesCount ? viewer.sportunitiesCount.count : 0;

    if (user)
      return(
        <header style={styles.header}>
          {/* <div style={{ ...styles.coverPhoto, backgroundImage: `url(${'https://oralcancerfoundation.org/wp-content/uploads/2016/03/people.jpg'})` }} >
            <i
              style={styles.editCover}
              className="fa fa-pencil"
              aria-hidden="true"
            />
          </div> */}
          <div style={styles.row}>

            <div style={styles.mainInfo}>
              <div style={{ marginRight: 50 }}>
                <Avatar
                  _updateAvatar={this._updateAvatar}
                  avatarUrl={user.avatar}
                  isSelfProfile={isSelfProfile}
                />
              </div>
                <div style={styles.userInfo}>
                  {this.state.edit === 'pseudo'
                  ? <InputEditMode
                      value={this.state.pseudo}
                      onChange={(e) => { this.setState({ pseudo: e.target.value }); }}
                      maxLength={200}
                      onConfirm={this._updatePseudo}
                      onCancel={() => { this.setState({ edit: false }); }}
                    />
                  : <h1 style={styles.username}>
                      {user.pseudo}
                      {isSelfProfile && 
                        <i
                          style={styles.pencil}
                          className="fa fa-pencil"
                          aria-hidden="true"
                          onClick={() => { this.setState({ edit: 'pseudo', pseudo: user.pseudo }) }}
                        />
                      }
                    </h1>
                  }
                  {(user.publicAddress || isSelfProfile) && 
                    (this.state.edit === 'address'
                    ? <InputEditMode
                        type="address"
                        value={this.state.publicAddress ? this.state.publicAddress.city + ', ' + this.state.publicAddress.country : ''}
                        onChange={this._handleAddressChange}
                        maxLength={200}
                        onConfirm={this._updatePublicAddress}
                        onCancel={() => { this.setState({ edit: false }); }}
                      />
                    : <div style={styles.location}>
                        <i
                          style={styles.marker}
                          className="fa fa-map-marker"
                          aria-hidden="true"
                        />
                        {user.publicAddress 
                        ? `${user.publicAddress.city}, ${user.publicAddress.country}`
                        : localizations.profileView_no_address
                        }

                        {isSelfProfile && 
                          <i
                            style={styles.pencil}
                            className="fa fa-pencil"
                            aria-hidden="true"
                            onClick={() => { this.setState({ edit: 'address', publicAddress: user.publicAddress }) }}
                          />
                        }
                      </div>
                    )}
                  {upcomingEventCount > 0 &&
                    <div style={styles.events}>
                      {localizations.formatString(upcomingEventCount <= 1
                      ? localizations.profileView_header_upcoming
                      : localizations.profileView_header_upcomings, upcomingEventCount)}
                    </div>
                  }
                  {pastEventCount > 0 &&
                    <div style={styles.events}>
                      {localizations.formatString(pastEventCount <= 1
                      ? localizations.profileView_header_past_event
                      : localizations.profileView_header_past_events, pastEventCount)}
                    </div>
                  }
              </div>
            </div>
          </div>
        </header>
      )
    else
      return null;
  }
}

styles = {
  header: {
    width: '100%',
    backgroundColor: colors.white,
    color: colors.white,
    display: 'flex',
    flexDirection: 'column',
    borderTopLeftRadius: '5px',
    borderTopRightRadius: '5px',
    '@media (maxWidth: 600px)': {
      display: 'block',
    },
  },

  row: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    '@media (maxWidth: 600px)': {
      flexDirection: 'column'
    },
  },

  coverPhoto: {
    height: '300px',
    color: colors.black,
    margin: '0px',
  },

  coverImage: {
    maxHeight: '300px',
    width: '100%',
    margin: '0px',
  },

  mainInfo: {
    display: 'flex',
    padding: '47px 42px 38px',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    '@media (maxWidth: 600px)': {
      flexDirection: 'column'
    },

  },

  userpic: {
    borderRadius: '50%',
    width: 120,
    height: 120,
    marginRight: 54,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    '@media (maxWidth: 450px)': {
      margin: '0 auto',
    },
  },

  userInfo: {
    color: colors.blue,
    fontFamily: 'Lato',
    fontSize: 22,
    fontWeight: 500,
  },

  username: {
    fontSize: 28,
    marginBottom: 13,
    maxWidth: 500,
    color: colors.blue,
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center'
  },
  pencil: {
    fontSize: 20,
    color: colors.black,
    marginLeft: 10,
    cursor: 'pointer'
  },

  location: {
    marginBottom: 17,
  },

  marker: {
    marginRight: 18,
  },

  rightSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: 65,
  },

  followers: {
    fontSize: 30,
    fontFamily: 'Lato',
    display: 'flex',
    '@media (maxWidth: 640px)': {
      marginRight: 10,
    },
    '@media (maxWidth: 600px)': {
      marginTop: 10,
    }
  },

  followerIcon: {
    fontSize: 30,
    marginLeft: 10,
    cursor: 'pointer'
  },
  blueButton: {
    backgroundColor: colors.blue,
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
    },
  },
  padding: {
    textAlign: 'right',
    margin: '0px 0px 0px auto',
    padding: 10,
  },
  editCover: {
    fontSize: 20,
    color: colors.black,
    marginLeft: 10,
    cursor: 'pointer',
    padding: 10,
  },

};

export default createRefetchContainer(Radium(withAlert(Header)), {
  user: graphql`
    fragment ProfileViewHeader_user on User {
      id
      pseudo
      avatar
      publicAddress {
        city
        country
      }
      sportunitiesCount: sportunities(last:2) {
        count
      }
      followers{
        id
      }
    }
  `,
  me: graphql`
    fragment ProfileViewHeader_me on User {
      id
      ...AddToCalendar_me
    }
  `,
  viewer: graphql`
    fragment ProfileViewHeader_viewer on Viewer @argumentDefinitions(
      userId: {type: "String", defaultValue: null},
      pseudo: {type: "String"},
      requestUserExists: {type: "Boolean!", defaultValue: false}
    ) {
      id
      me {
        id
      }
      sportunitiesCount: sportunities (last:2, userId: $userId, filter: {status: MySportunities}) {
        count
      }
      userExists(pseudo: $pseudo) @include(if: $requestUserExists)
    }
  `
},
graphql`
  query ProfileViewHeaderRefetchQuery(
    $userId: String,
    $pseudo: String,
    $requestUserExists: Boolean!
  ) {
    viewer {
      ...ProfileViewHeader_viewer @arguments(userId: $userId, pseudo: $pseudo, requestUserExists: $requestUserExists)
    }
  }
`,
);
