import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import Radium from 'radium';
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import dateFormat from 'dateformat'
import {Link} from 'found'

import localizations from '../Localizations'

let styles;

class Message extends PureComponent {

  getStyles = incoming => {
    if (!incoming) return styles;

    const _styles = { ...styles };

    Object
      .keys(styles)
      .filter(key => key.endsWith('Incoming'))
      .forEach(key => {
        const _key = key.substring(0, key.length - 8);
        _styles[_key] = { ..._styles[_key], ..._styles[key] };
      });

      return _styles;
  };

  _renderDate = craetionDate => {
    const date = new Date(craetionDate);
    const today = new Date();

    if (date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getYear() === today.getYear())
      return localizations.event_comments_today + ' - ' + dateFormat(date, 'HH:MM');
    else
      return dateFormat(date, 'd mmm') + ' - ' + dateFormat(date, 'HH:MM') ;
    ;
  }
  render() {
    const isMessageFromMe = (this.props.me && this.props.message.author.id === this.props.me.id);
    const styles = this.getStyles(isMessageFromMe);

    return (
      <article style={styles.container}>
        <Link to={'/profile-view/'+this.props.message.author.id} style={styles.circle}>
          {/*<img
              style={styles.icon}
              src={this.props.message.author.avatar || "https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png"}
              alt='avatar'
            />*/}
          <div
            style={{...styles.icon, backgroundImage: this.props.message.author.avatar ? 'url('+ this.props.message.author.avatar +')' : 'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")'}}
          />
        </Link>
        <div style={styles.content}>
          <header style={styles.header}>
            <span style={styles.username}>
              {this.props.message.author.pseudo}
            </span>
            <time style={styles.time}>
              {this._renderDate(this.props.message.created)}
            </time>
          </header>
          <p style={styles.text}>
            {
              this.props.message.text
                .replace(/(?:\r\n|\r|\n)/g, '<br />').split('<br />')
                .map((item,index) => <span key={index}>{item}<br/></span>)
            }
          </p>
        </div>
      </article>
    );
  }
};

styles = {
  container: {
    display: 'flex',
    alignItems: 'flex-start',
    fontFamily: 'Lato',
    marginBottom: 15,
  },

  containerIncoming: {
    flexDirection: 'row-reverse',
  },

  circle: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 25,
    textDecoration: 'none',
    marginRight: 15,
    marginLeft: 15
  },

  icon: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    marginBottom: 7,

    backgroundPosition: '50% 50%',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  },

  userpicIncoming: {
    marginLeft: 15,
    marginRight: 0,
  },

  content: {
    display: 'flex',
    flexDirection: 'column'
  },

  header: {
    display: 'flex',
    alignItems: 'baseline',
    marginBottom: 6,
  },

  headerIncoming: {
    flexDirection: 'row-reverse',
  },

  username: {
    fontSize: 18,
    fontWeight: 500,
    lineHeight: 1,
    color: 'rgba(0,0,0,0.65)',
    marginRight: 9,
  },

  usernameIncoming: {
    marginRight: 0,
    marginLeft: 9,
  },

  time: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.49)',
  },

  text: {
    backgroundColor: 'rgba(94,159,223,0.5)',
    padding: '12px 15px',
    borderRadius: '15px',
    fontSize: 14,
    alignSelf: 'flex-start'
  },

  textIncoming: {
    backgroundColor: '#7ee4ad',
    textAlign: 'right',
    alignSelf: 'flex-end'
  },
};



export default createFragmentContainer(Radium(Message), {
  message: graphql`
    fragment Message_message on Message {
      id
      text
      author {
        id
        pseudo
        avatar
      }
      created
    }
  `
})
