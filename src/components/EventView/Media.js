import React from 'react'
import localizations from "../Localizations";
import {appStyles, colors} from "../../theme";
import FileReaderInput from  'react-file-reader-input'
import { withAlert } from 'react-alert'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import Radium from "radium";
import ReactCrop, {makeAspectCrop} from 'react-image-crop'
import AddEventImageUpdateMutation from './addEventImageUpdateMutation'
import RemoveEventImageUpdateMutation from './removeEventImageUpdateMutation'

class Media extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tmpMedia: [],
      crop: {
        x: 0,
        y: 0,
      },
      displayCropper: false,
      tmpImage: null,
      maxImage: 5,
      showImage: true,
    };
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
  };
  onChange = (crop, pixelCrop) => {
    this.setState({ crop, pixelCrop });
  };

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
  };

  addImage = (blob) => {
    AddEventImageUpdateMutation.commit({
        sportunity: this.props.sportunity,
        viewer: this.props.viewer,
      },
      {
        onFailure: error => {
          this.props.alert.show(localizations.popup_addImage_failed, {
            timeout: 2000,
            type: 'error',
          });
          let errors = JSON.parse(error.getError().source);
          console.log(errors);
        },
        onSuccess: () => {
          this.props.alert.show(localizations.popup_addImage_success, {
            timeout: 3000,
            type: 'success',
          });
        },
      }, 
      blob
    );
  };

  removeImage = (url) => {
    RemoveEventImageUpdateMutation.commit({
        sportunity: this.props.sportunity,
        url: url,
        viewer: this.props.viewer,
      },
      {
        onFailure: error => {
          this.props.alert.show(localizations.popup_removeImage_failed, {
            timeout: 2000,
            type: 'error',
          });
          let errors = JSON.parse(error.getError().source);
          console.log(errors);
        },
        onSuccess: () => {

          this.props.alert.show(localizations.popup_removeImage_success, {
            timeout: 3000,
            type: 'success',
          });
          this.render();
        },
      });
  };

  onCropComplete = async () => {
    let resultBlob = await this.getCroppedImg(this.state.image, this.state.pixelCrop, true);
    this.setState({
      tmpImage: null,
    });
    let tmpImages = this.props.sportunity.images;
    while (tmpImages && tmpImages.length >= this.state.maxImage) {
      this.removeImage(tmpImages[0]);
      tmpImages.shift();
    }
    this.addImage(resultBlob);
  };

  onCloseCrop = () => {
    this.setState({
      tmpImage: null,
    });
  };

  reloadImege = () => {
    console.log('test');
    this.setState({showImage: false})
    setTimeout(() => this.setState({showImage: true}), 500)
  };

  render() {
    const {isAdmin, sportunity} = this.props;

    return(
      <div>
        <div>
          { this.state.tmpImage &&
          <div style={styles.cropperOverlay}>
            <div style={styles.cropperContainer}>
              <ReactCrop
                src={this.state.tmpImage}
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
          {this.state.showImage && sportunity.images && sportunity.images.map((image, index) =>
            <div key={index} style={{margin: '2% 0%'}}>
              <img onError={this.reloadImege} src={image} style={styles.headerImage}/>
              { isAdmin &&
                <i
                  style={{position: 'absolute', marginLeft: '-1em', color: colors.red}}
                  className='fa fa-times-circle fa-3x'
                  onClick={() => this.removeImage(image)}
                />
              }
            </div>
          )}
          {(!sportunity.images || (sportunity.images && sportunity.images.length === 0)) &&
            <div style={styles.msgContainer}>
              <i
                className='fa fa-exclamation-circle fa-5x'
              />
              <div>
                <p style={styles.text}>{localizations.event_media_empty}</p>
              </div>
            </div>
          }
        </div>
        {isAdmin &&
        <div>
          <FileReaderInput as='url' id="my-file-input"
                           onChange={this._handleChange}>
            <button style={appStyles.blueButton}>{localizations.profile_uploadPicture}</button>
          </FileReaderInput>
        </div>
        }
      </div>
    )
  }
}

let styles = {
  headerImage: {
    width: '100%'
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
    maxHeight: '75vh'
  },
  buttonContainer: {
    position: 'fixed',
    bottom: '0%',
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
  },
  msgContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  text: {
    fontSize: 15,
    fontFamily: 'lato',
  },
};

export default createFragmentContainer(withAlert(Radium(Media)), {
  sportunity: graphql`
    fragment Media_sportunity on Sportunity {
      images
      id
    }
  `,
  viewer: graphql`
    fragment Media_viewer on Viewer {
      id
    }
  `
});