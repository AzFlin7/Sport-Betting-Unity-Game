import React, {Component} from 'react';
import Radium from 'radium';
import {Link as LinkDefault} from 'found'

import { colors } from '../../theme'
// import ProfileImage from '../../img/profile.svg';
import Button from './Button';

let styles;
const Link = Radium(LinkDefault)

class Circle extends Component {
  render() {
    const {
      name,
      image,
      link,
      isAdmin,
      actionParticipant,
      secondaryOrganizerType,
      caption,
      style = {},
      iconStyle = {},
      nameStyle = {},
      captionStyle = {},
    } = this.props;

      return (
        <div style={styles.circleContainer}>
          {
            isAdmin ?
            (
              <Button
                onClick={actionParticipant}
                style={styles.close}
                text={<i style={styles.closeIcon} className="fa fa-times-circle fa-2x" />}
              />
            )
            : null
          }
	        {link ?
		        <Link to={link} style={{...styles.circle, ...style}}>
			        <div style={{
				        ...styles.icon, ...iconStyle,
				        backgroundImage: image ? 'url(' + image + ')' : 'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")'
			        }}/>
			        <div style={{...styles.name, ...nameStyle}}>{name}</div>
			        {secondaryOrganizerType &&
			        <div style={styles.organizerType}>{secondaryOrganizerType}</div>
			        }
			        {caption && <div style={{...styles.name, ...captionStyle}}>{caption}</div>}
		        </Link>
            :
		        <div style={{...styles.circle, ...style}}>
			        <div style={{
				        ...styles.icon, ...iconStyle,
				        backgroundImage: image ? 'url(' + image + ')' : 'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")'
			        }}/>
			        <div style={{...styles.name, ...nameStyle}}>{name}</div>
			        {secondaryOrganizerType &&
			        <div style={styles.organizerType}>{secondaryOrganizerType}</div>
			        }
			        {caption && <div style={{...styles.name, ...captionStyle}}>{caption}</div>}
		        </div>
	        }
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
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center'
  },
  circle: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 25,
    textDecoration: 'none',
    width: '100%'
  },

  icon: {
    width: 80,
    height: 80,
    flexShrink: 0,
    borderRadius: '50%',
    marginBottom: 7,
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
    wordWrap: 'break-word'
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
    marginTop: 2
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
    position: 'absolute',
    top: -5,
    right: 42,
  },
  closeIcon: {
    fontSize: '24px',
  }
}


export default Radium(Circle);
