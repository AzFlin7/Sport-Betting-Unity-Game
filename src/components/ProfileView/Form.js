import React from 'react';
import PureComponent, { pure } from '../common/PureComponent';
import Radium from 'radium';
import Relay from 'react-relay';
import ReactLoading from 'react-loading';

import { colors } from '../../theme';
import localizations from '../Localizations';

let styles;

class Form extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
      shiftPressed: false,
    };
  }

  _handleKeyPress = event => {
    if (
      event.key === 'Enter' &&
      !this.state.shiftPressed &&
      event.target.tagName === 'TEXTAREA'
    ) {
      event.preventDefault();
      this._handleSendMessage();
    }
  };

  onKeyDown = event => {
    if (event.key === 'Shift')
      this.setState({
        shiftPressed: true,
      });
  };

  onKeyUp = event => {
    if (event.key === 'Shift')
      this.setState({
        shiftPressed: false,
      });
  };

  _handleSendMessage = () => {
    this.props.sendMessage(this.state.message);
    this.setState({
      message: '',
    });
  };

  _handleMessageChange = event => {
    this.setState({
      message: event.target.value,
    });
  };

  render() {
    let canSendMessage = !this.props.isDisabled || (this.props.isDisabled && this.props.isCurrentUserTheOwner);
    return (
      <div style={styles.container}>
        <div style={styles.userpic}>
          {/*<img
            style={styles.icon}
            src={this.props.user.avatar || "https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png"}
            alt='avatar'
          />*/}
          <div
            style={{
              ...styles.icon,
              backgroundImage: this.props.user.avatar
                ? 'url(' + this.props.user.avatar + ')'
                : 'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")',
            }}
          />
        </div>
        <textarea
          style={styles.textarea}
          placeholder={
            this.props.isChat && this.props.isDisabled
              ? (this.props.isCurrentUserTheOwner 
                ? localizations.event_comments_chat_disabled_to_owner
                : this.props.isCurrentUserAMember
                  ? localizations.event_comments_chat_disabled
                  : localizations.event_comments_leave_a_comment)
              : localizations.event_comments_leave_a_comment
          }
          value={this.state.message}
          onChange={this._handleMessageChange}
          onKeyPress={this._handleKeyPress}
          onKeyDown={this.onKeyDown}
          onKeyUp={this.onKeyUp}
          disabled={!canSendMessage}
        />
        {this.props.sendingMessage 
        ? <span style={styles.loading}>
            <ReactLoading height="32" type="cylon" color={colors.blue} />
          </span>
        : <button 
            style={{...styles.submit, backgroundColor: !canSendMessage ? colors.gray : colors.green}} 
            onClick={() => canSendMessage && this._handleSendMessage()}
          >
            {localizations.event_comments_post}
          </button>
        }
      </div>
    );
  }
}

styles = {
  container: {
    position: 'relative',
    flexShrink: 0,
  },

  userpic: {
    position: 'absolute',
    left: '10px',
    top: '10px',
    marginRight: 15,
  },

  icon: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    backgroundPosition: '50% 50%',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  },

  textarea: {
    width: '100%',
    height: 65,
    marginBottom: 8,

    resize: 'none',

    backgroundColor: '#eee',
    borderRadius: '5px',
    borderColor: 'transparent',
    padding: '10px 10px 10px 80px',
  },

  submit: {
    color: colors.white,
    width: 120,
    height: 32,
    borderRadius: 100,
    borderStyle: 'none',
    boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
    fontSize: 16,
    cursor: 'pointer',

    position: 'relative',
    left: 'calc(100% - 120px)',
  },
  loading: {
    left: 'calc(100% - 120px)',
    position: 'relative',
  },
};

export default Radium(Form);
