import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { colors } from '../../theme';
import localizations from '../Localizations';
import Button from '@material-ui/core/Button';

let styles;

class Subscribe extends React.Component {
  render() {
    return (
      <section style={styles.container} onClick={this.props.onSubscribe}>
        <div
          style={{
            ...styles.icon,
            backgroundImage:
              this.props.viewer.me && this.props.viewer.me.avatar
                ? `url(${this.props.viewer.me.avatar})`
                : 'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")',
          }}
        />
        <Button style={styles.becomeButton}>
          {localizations.circle_subscribe}
        </Button>
      </section>
    );
  }
}

styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    cursor: 'pointer',
    marginRight: 20,
  },
  button: {
    fontFamily: 'Lato',
    fontSize: 18,
    color: colors.blue,
    cursor: 'pointer',
    textAlign: 'left',
    padding: '0 15px',
    position: 'relative',
  },
  becomeButton: {
    fontSize: '15px',
    backgroundColor: colors.blue,
    color: colors.white,
    textTransform: 'none',
  },
  icon: {
    minWidth: 30,
    minHeight: 30,
    maxWidth: 30,
    maxHeight: 30,
    borderRadius: '50%',
    marginRight: 7,
    backgroundPosition: '50% 50%',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    flex: 1,
  },
};

export default createFragmentContainer(Subscribe, {
  viewer: graphql`
    fragment Subscribe_viewer on Viewer {
      id
      me {
        id
        pseudo
        avatar
      }
    }
  `,
});
