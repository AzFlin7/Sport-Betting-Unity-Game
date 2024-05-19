import React from 'react'
import { FacebookProvider, Share } from 'react-facebook';

import {
  ShareButtons,
  generateShareIcon,
} from 'react-share';

const {
  FacebookShareButton,
  GooglePlusShareButton,
  TwitterShareButton,
} = ShareButtons;



const FacebookIcon = generateShareIcon('facebook');
const TwitterIcon = generateShareIcon('twitter');
const GooglePlusIcon = generateShareIcon('google');

let styles


class Sharing extends React.Component {
  render() {
    const { sharedUrl, title, description } = this.props
    return (
      <div >
        <div style={{display: 'flex'}}>
          <FacebookProvider appId="1759806787601548">
            <Share href={sharedUrl}>
              {({handleClick, loading}) => (
                <div style={styles.button} disabled="loading" onClick={handleClick}>
                  <FacebookIcon
                    size={32}
                    />
                </div>
              )}
            </Share>
          </FacebookProvider>

        </div>

        <div style={{display: 'flex'}}>
          <TwitterShareButton
            url={sharedUrl}
            title={title}
            via='sportunitysarl'
            hashtags={['Sportunity']}
            style={styles.button}
            >
            <TwitterIcon
              size={32}
               />
          </TwitterShareButton>

        </div>

        <div style={{display: 'flex'}}>
          <GooglePlusShareButton
            url={sharedUrl}
            title={title}
            style={styles.button}
            >
            <GooglePlusIcon
              size={32}
               />
          </GooglePlusShareButton>

        </div>

      </div>
    );
  }

}

styles = {
  button: {
    cursor: 'pointer',
  },
}

export default Sharing
