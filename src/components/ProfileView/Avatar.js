import React, { Component } from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as types from '../../actions/actionTypes.js';
import { metrics, colors, fonts, appStyles } from '../../theme';
import FileReaderInput from 'react-file-reader-input';
import { withAlert } from 'react-alert'

import localizations from '../Localizations'
import ReactCrop, {makeAspectCrop} from "react-image-crop";

let styles;

class Avatar extends PureComponent {
  constructor (props) {
    super(props);
    this.state = {
      crop: {
        x: 0,
        y: 0,
      },
      displayCropper: false,
      tmpImage: '',
      avatarUrl: '',
    };
  }

  componentDidMount () {
    this.setState({
      avatarUrl: this.props.avatarUrl
    });
  }
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.avatarUrl && this.props.avatarUrl !== nextProps.avatarUrl) {
      this.setState({ avatarUrl: nextProps.avatarUrl });
    }
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
        this.setState({
          tmpImage: e.target.result,
        });
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

  onCropComplete = async () => {
    let resultBlob = await this.getCroppedImg(this.state.image, this.state.pixelCrop, true);
    let result = this.getCroppedImg(this.state.image, this.state.pixelCrop, false);
    this.setState({
      tmpImage: null,
    });
    this.props._updateAvatar(resultBlob);
    this.setState({avatarUrl: result});
  };

  onCloseCrop = () => {
    this.setState({
      tmpImage: null,
    });
  };

  onImageLoaded = (image) => {
    this.setState({
      crop: makeAspectCrop({
        x: 0,
        y: 0,
        aspect: 1,
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
  };

  onChange = (crop, pixelCrop) => {
    this.setState({ crop, pixelCrop });
  };

  render() {
    return (
      <div style={styles.container}>
        { this.state.tmpImage &&
        <div style={styles.cropperOverlay}>
          <div style={styles.cropperContainer}>
            <ReactCrop
              src={this.state.tmpImage}
              crop={{aspect: 1}}
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
        <div style={styles.avatarContainer}>
          {this.props.isSelfProfile 
          ? <FileReaderInput 
              as='url' 
              id="my-file-input"
              onChange={this._handleChange}
            >
              <div 
                style={{...styles.avatar, backgroundImage: 'url('+this.state.avatarUrl+')'}} 
              />
            </FileReaderInput>
          : <div 
              style={{...styles.avatar, backgroundImage: 'url('+this.state.avatarUrl+')'}} 
            />
          }
        </div>
      </div>
    );
  }
}

const _updateAvatarAction = (text) => ({
  type: types.UPDATE_PROFILE_AVATAR,
  text,
});

const stateToProps = (state) => ({
  avatar: state.profileReducer.avatar,
})

const dispatchToProps = (dispatch) => ({
  _updateAvatarAction: bindActionCreators(_updateAvatarAction, dispatch),
})

const Redux =  connect(
  stateToProps,
  dispatchToProps
)(Avatar);

export default withAlert(Redux);

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
    height: 120,
    borderRadius: 60,
    marginTop: metrics.margin.medium,
    marginBottom: metrics.margin.medium,
    backgroundPosition: '50% 50%',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    cursor: 'pointer',
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
    display: 'flex',
  },
  closeButton: {
    color: colors.redGoogle,
    fontSize: 30,
    cursor: 'pointer',
  },
  validateButton: {
    color: colors.green,
    fontSize: 30,
    cursor: 'pointer',
    marginLeft: 200,
  },
}
