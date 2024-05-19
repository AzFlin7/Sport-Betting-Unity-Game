import React from 'react'
import styles from "./Styles";
import Switch from '../common/Switch'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium'
import UpdateCircleSynchronizeSettings from "./UpdateCircleSynchronizeSettings";

class CircleSynchronizeSettings extends React.Component {

  constructor(props)
  {
    super(props);
    const { user, owner } = this.props;
    const checked = user.calendar.users.findIndex((users) => {
      return owner.id === users.id;
    }) !== -1;
    this.state = {
      isSynchronized: checked,
      owner: owner,
    }
  }

  _updateSetting = () =>
  {
    const { user } = this.props;
    let users = user.calendar.users.filter(tmpUser => tmpUser.id !== this.state.owner.id);
    if (this.state.isSynchronized) {
      users.push(this.state.owner);
    }
    users = users.map(_user => _user.id);
    UpdateCircleSynchronizeSettings.commit({
        userIDVar: user.id,
        usersVar: users,
        user: user
      }, {
        onSuccess: (msg) => {
          console.log(msg)
        },
        onError: (error) => {
          console.log(error);
        }
      }
    )
  };

  _updateState(e)
  {
    this.setState({
      isSynchronized: e
    }, this._updateSetting)
  }

  render() {
    const { owner, style } = this.props;

    return (
      <div style={{...styles.row, alignItems: 'unset'}}>
        <div
          style={{
            ...style.iconImage,
            backgroundImage: 'url(' + owner.avatar || "https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png" + ')'
          }}
        />
        <div style={{...styles.row, ...style.row}}>
          <div style={this.state.isSynchronized ? style.labelActive : style.label}>
            {owner.pseudo}
          </div>
          <Switch
            checked={this.state.isSynchronized}
            onChange={e => this._updateState(e)}
          />
        </div>
      </div>
    );
  }
}


export default createFragmentContainer(Radium(CircleSynchronizeSettings), {
  user: graphql`
    fragment CircleSynchronizeSettings_user on User {
      id
      calendar {
        users{
          id
        }
      }
      ...UpdateCircleSynchronizeSettings_user
    }
  `,
})