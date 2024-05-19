import React, { Component } from 'react';
import { metrics, colors, fonts, appStyles } from '../../theme';
import FileReaderInput from 'react-file-reader-input';
import { withAlert } from 'react-alert'
import ReactCrop, {makeAspectCrop} from 'react-image-crop';

import PureComponent, { pure } from '../common/PureComponent'
import localizations from '../Localizations'

let styles;

class Avatar extends PureComponent {
    constructor (props) {
        super(props);
        this.state = {
            avatarUrl: '',
            crop: {
                x: 0,
                y: 0,
                aspect: 10 / 4,
            },
            displayCropper: false
        }
    }

    componentDidMount () {
        this.setState({
            avatarUrl: this.props.avatarUrl
        });
    }

    _handleChange = (e, results) => {
        results.forEach(result => {
        const [e, file] = result;
        if (file.size / 1000000 > 1) {
            this.props.alert.show(localizations.popup_editProfile_avatar_too_big, {
                timeout: 4000,
                type: 'error',
            });
        }
        else {
            this.setState({avatarUrl: e.target.result, displayCropper: true})

            this.props._updateAvatar(file);
        }

        });
    }

    getCroppedImg(image, pixelCrop, blob) {

        const canvas = document.createElement('canvas');
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
        const ctx = canvas.getContext('2d');
        
        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );
        if (blob)
            return new Promise((resolve, reject) => {
                canvas.toBlob(file => {
                    file.name = 'fileName';
                    resolve(file);
                }, 'image/jpeg');
            });
        else 
            return canvas.toDataURL('image/jpeg');
    }

    onChange = (crop, pixelCrop) => {
        this.setState({ crop, pixelCrop });
    }

    onImageLoaded = (image) => {
        this.setState({
            crop: makeAspectCrop({
                x: 0,
                y: 0,
                aspect: 10 / 4,
                width: 50,
            }, image.naturalWidth / image.naturalHeight),
            image,
            pixelCrop: {
                x: 0,
                y: 0,
                width: image.naturalWidth / 2,
                height: (image.naturalWidth / 2) * 4 / 10
            }
        });
    }

    onCropComplete = async () => {
        let resultUrl = this.getCroppedImg(this.state.image, this.state.pixelCrop, false)
        this.setState({avatarUrl: resultUrl, displayCropper: false, image: null})
        let resultBlob = await this.getCroppedImg(this.state.image, this.state.pixelCrop, true)
        this.props._updateAvatar(resultBlob);
    }

    onCloseCrop = () => {
        this.setState({avatarUrl: '', displayCropper: false, image: null})
        
          this.props._updateAvatar('');
    }

  render() {
    return (
      <div style={styles.container}>
        <h2 style={styles.h2}>{localizations.profile_details}</h2>
        <div style={styles.avatarContainer}>
          <img src={this.state.avatarUrl} style={styles.avatar}/>
          <FileReaderInput as='url' id="my-file-input"
                          onChange={this._handleChange}>
            <button style={appStyles.blueButton} onClick={e => e.preventDefault()}>{localizations.profile_uploadPicture}</button>
          </FileReaderInput>
          {this.state.avatarUrl !== '' && this.state.avatarUrl && this.state.displayCropper && 
            <div style={styles.cropperOverlay}>
                <div style={styles.cropperContainer}>
                    <ReactCrop 
                        src={this.state.avatarUrl} 
                        crop={{aspect: 16/9}} 
                        onChange={this.onChange}
                        {...this.state}
                        onImageLoaded={this.onImageLoaded}
                    />
                </div>
                <div style={styles.buttonContainer}>
                    <div style={styles.closeButton} onClick={this.onCloseCrop}>
                        <i className="fa fa-times fa-2x" />
                    </div>
                    <div style={styles.validateButton} onClick={this.onCropComplete}>
                        <i className="fa fa-check fa-2x" />
                    </div>
                </div>
            </div>
          }
        </div>
      </div>
    );
  }
}

export default withAlert(Avatar);

styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  h2: {
    fontSize: fonts.size.xl,
    color: colors.blue,
    fontWeight: fonts.size.xl,
  },
  avatarContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 120,
    height: 'auto',
    marginTop: metrics.margin.medium,
    marginBottom: metrics.margin.medium,
    backgroundPosition: '50% 50%',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  },
  cropperOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      zIndex: 10
    },
    cropperContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%', 
        right: 'auto',
        bottom: 'auto',
        transform: 'translate(-50%, -50%)',
    },
    buttonContainer: {
        position: 'absolute',
        bottom: '10%',
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        display: 'flex'
    },
  closeButton: {
      color: colors.redGoogle,
      fontSize: 30,
      cursor: 'pointer'
  },
  validateButton: {
      color: colors.green,
      fontSize: 30,
      cursor: 'pointer',
      marginLeft: 200
  }
}
