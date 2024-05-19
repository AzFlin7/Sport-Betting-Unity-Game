import React, { Component } from 'react';
import Radium from 'radium';
import { Link as LinkDefault } from 'found';
import { IconButton } from '@material-ui/core';
import SettingsIcon from '@material-ui/icons/Settings';
import OrganizerRightModal from '../NewSportunity/OrganizerRightModal';

import { colors } from '../../theme';
// import ProfileImage from '../../img/profile.svg';
import Button from './Button';

let styles;
const Link = Radium(LinkDefault);

class CircleRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      organizerRightModalOpen: false,
    };
  }

  render() {
    const {
      id,
      name,
      image,
      role,
      link,
      isAdmin,
      actionParticipant,
      secondaryOrganizerType,
      caption,
      style = {},
      iconStyle = {},
      nameStyle = {},
      captionStyle = {},
      permissions,
      updatePermissions,
      showUpdatePermissions,
    } = this.props;
    const { organizerRightModalOpen } = this.state;

    return (
      <div style={styles.circleContainer}>
        {link ? (
          <div style={{ display: 'flex' }}>
            <Link to={link} style={{ ...styles.circle, ...style }}>
              <div
                style={{
                  ...styles.icon,
                  ...iconStyle,
                  backgroundImage: image
                    ? 'url(' + image + ')'
                    : 'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")',
                }}
              />
              <div style={{ ...styles.name, ...nameStyle }}>
                {name} {role && ` - ${role}`}
              </div>
              {secondaryOrganizerType && (
                <div style={styles.organizerType}>
                  {secondaryOrganizerType}
                </div>
              )}
              {caption && (
                <div style={{ ...styles.name, ...captionStyle }}>
                  {caption}
                </div>
              )}
            </Link>
            {showUpdatePermissions && updatePermissions && (
              <IconButton
                onClick={() => {
                  this.setState({ organizerRightModalOpen: true });
                }}
              >
                <SettingsIcon />
              </IconButton>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex' }}>
            <div style={{ ...styles.circle, ...style }}>
              <div
                style={{
                  ...styles.icon,
                  ...iconStyle,
                  backgroundImage: image
                    ? 'url(' + image + ')'
                    : 'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")',
                }}
              />
              <div style={{ ...styles.name, ...nameStyle }}>{name}</div>
              {secondaryOrganizerType && (
                <div style={styles.organizerType}>
                  {secondaryOrganizerType}
                </div>
              )}
              {caption && (
                <div style={{ ...styles.name, ...captionStyle }}>
                  {caption}
                </div>
              )}
            </div>
            {showUpdatePermissions && updatePermissions && (
              <IconButton
                onClick={() => {
                  this.setState({ organizerRightModalOpen: true });
                }}
              >
                <SettingsIcon />
              </IconButton>
            )}
          </div>
        )}
        {!isAdmin && actionParticipant && (
          <Button
            onClick={actionParticipant}
            style={styles.close}
            text={
              <i
                style={styles.closeIcon}
                className="fa fa-times-circle fa-2x"
              />
            }
          />
        )}
        {organizerRightModalOpen && (
          <OrganizerRightModal
            isOpen={organizerRightModalOpen}
            close={() => {
              this.setState({ organizerRightModalOpen: false });
            }}
            organizer={{
              permissions,
            }}
            updatePermissions={permissions => {
              updatePermissions(id, permissions);
            }}
          />
        )}
      </div>
    );
  }
}

// const Circle = ({ name, image, link }) => {
// 	return(
//   <Link to={link} style={styles.circle}>
//     {/*<img
//             style={styles.icon}
//             src={image || "../../img/profile.png"}
//             alt='avatar'
//           />*/}
//     <div style={{...styles.icon, backgroundImage: 'url('+image || "../../img/profile.png" +')'}} />
//     <div style={styles.name}>{name}</div>
//   </Link>
// )}

styles = {
  circleContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '10px 40px',
    borderBottom: '1px solid ' + colors.lightGray,
    borderTop: '1px solid ' + colors.lightGray,
  },
  circle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    textDecoration: 'none',
  },

  icon: {
    width: 60,
    height: 60,
    flexShrink: 0,
    borderRadius: '50%',
    marginRight: 10,
    backgroundPosition: '50% 50%',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  },

  name: {
    color: colors.black,
    fontSize: 17,
    fontWeight: 500,
    textDecoration: 'none',
    textTransition: 'none',
    width: '100%',
    textAlign: 'center',
    wordWrap: 'break-word',
  },
  organizerType: {
    color: colors.black,
    fontSize: 17,
    fontWeight: 500,
    fontStyle: 'italic',
    textDecoration: 'none',
    textTransition: 'none',
    width: '100%',
    textAlign: 'center',
    wordWrap: 'break-word',
    marginTop: 2,
  },
  close: {
    backgroundColor: colors.white,
    color: colors.red,
    width: 20,
    height: 20,
    borderStyle: 'none',
    borderRadius: '50%',
    padding: 0,
    cursor: 'pointer',
  },
  closeIcon: {
    fontSize: '24px',
  },
};

export default Radium(CircleRow);
